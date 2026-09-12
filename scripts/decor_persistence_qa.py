"""
decor_persistence_qa.py — Minimal isolated Playwright test.
Closes two REAL evidence gaps from prior QA run:
  GAP 1: localStorage key was wrong ('froginotes-notes' guessed vs
          actual 'froginotes_data_v7_empty') → storage reads returned empty.
  GAP 2: Tape element searched via [class*="tape"] which never matches —
          TapedPhotoCard tape divs have NO "tape" in class; when decorAssetId
          is set they get inline style background: rgba(249, 184, 204, 0.85).

This script ONLY verifies:
  A. decorAssetId='tape-sakura-pink' written to CORRECT localStorage key after save
  B. Tape div on card has real computed inline-style background (Sakura color)
  C. Page reload → same decorAssetId in store, same tape inline style visible
  D. Clear decor + save + reload → decorAssetId null in store, tape background gone

Fails hard on any unexpected result. Never treats a missing element as a pass.
"""
import os, sys, time, json
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

REPORT_DIR = Path(__file__).parent.parent / "reports" / "decor"
REPORT_DIR.mkdir(parents=True, exist_ok=True)

APP_URL = "http://localhost:5173/?view=app"

# ── ACTUAL localStorage key discovered from useNotesStore.ts line 268 ──────
STORAGE_KEY = "froginotes_data_v7_empty"
EXPECTED_DECOR_ID = "tape-sakura-pink"
# Sakura Pink inline style background (from decor-catalog.ts line 79)
SAKURA_BG_RGBA = "rgba(249, 184, 204, 0.85)"

RESULTS = []
FAILURES = []

def log(msg):
    print(msg, flush=True)
    RESULTS.append(msg)

def fail(msg, page=None, ss_name=None):
    log(f"[FAIL] {msg}")
    FAILURES.append(msg)
    if page and ss_name:
        take_ss(page, ss_name)

def take_ss(page, name):
    path = str(REPORT_DIR / f"{name}.png")
    page.screenshot(path=path, full_page=False, timeout=0)
    log(f"  📸 {name}.png")
    return path

# ── Helper: read decorAssetId from correct localStorage key ──────────────────
READ_STORE_JS = f"""
() => {{
    try {{
        const raw = localStorage.getItem('{STORAGE_KEY}');
        if (!raw) return {{ error: 'key_missing', key: '{STORAGE_KEY}' }};
        const notes = JSON.parse(raw);
        if (!Array.isArray(notes) || notes.length === 0)
            return {{ error: 'empty_array', raw_length: raw.length }};
        // Notes sorted newest-first by addNote; find our test note
        const testNote = notes.find(n => n.title && n.title.includes('QA Persist Test'));
        if (!testNote) return {{ error: 'test_note_not_found', count: notes.length,
            titles: notes.slice(0,5).map(n => n.title) }};
        return {{ id: testNote.id, type: testNote.type,
                  decorAssetId: testNote.decorAssetId ?? null }};
    }} catch(e) {{ return {{ error: 'parse_error', msg: e.message }}; }}
}}
"""

# ── Helper: find the tape inline-style div near the note card ────────────────
# TapedPhotoCard DOM structure:
#   <div class="relative w-full h-full rounded-[18px] ...">   ← card root
#     <div style="background: rgba(249,184,204,0.85)...">      ← TAPE (direct child, sibling of photo frame)
#     <div class="relative flex-1 ...">                        ← photo frame
#       <p>QA Persist Test</p>                                 ← title
#     </div>
#   </div>
# The tape is a SIBLING of the photo frame — so we must walk up to the
# rounded card root (not stop at the photo frame), then scan all descendants.
FIND_TAPE_JS = """
(titleText) => {
    // Find the note title element anywhere on page
    const allEls = Array.from(document.querySelectorAll('p, h3, span, div'));
    const titleEl = allEls.find(el =>
        el.children.length === 0 && el.textContent && el.textContent.trim().includes(titleText)
    );
    if (!titleEl) {
        // fallback: wider search
        const wider = Array.from(document.querySelectorAll('*')).find(el =>
            el.textContent && el.textContent.trim() === titleText
        );
        if (!wider) return { found: false, reason: 'title_element_not_found' };
    }
    const startEl = titleEl || allEls.find(el =>
        el.textContent && el.textContent.trim() === titleText
    );

    // Walk up until we find the TapedPhotoCard root:
    // it has class containing 'rounded-[18px]' or 'overflow-hidden'
    // and is a 'relative' element that contains inline-styled children
    let card = startEl;
    for (let i = 0; i < 15; i++) {
        if (!card.parentElement) break;
        card = card.parentElement;
        const cls = card.className || '';
        // TapedPhotoCard root: rounded-[18px] overflow-hidden
        if (cls.includes('rounded-') && cls.includes('overflow-hidden') && cls.includes('relative')) {
            break;
        }
    }

    // Search entire card subtree for div with Sakura rgba inline style
    const allDivs = Array.from(card.querySelectorAll('div'));
    // Also check card itself
    const toCheck = [card, ...allDivs];
    const tapeDivs = toCheck.filter(d => {
        const s = d.getAttribute('style') || '';
        return s.includes('rgba(249') || s.includes('249, 184, 204') || s.includes('249,184,204');
    });

    if (tapeDivs.length === 0) {
        // Also try global search (decor applied at page level, not just in card)
        const globalDivs = Array.from(document.querySelectorAll('div[style]'));
        const globalTape = globalDivs.filter(d => {
            const s = d.getAttribute('style') || '';
            return s.includes('249, 184, 204') || s.includes('249,184,204') || s.includes('rgba(249');
        });
        if (globalTape.length > 0) {
            const td = globalTape[0];
            return {
                found: true,
                source: 'global_search',
                inline_style: td.getAttribute('style'),
                class: td.className
            };
        }
        // Diagnosis: show all inline-styled divs in card
        const cardStyled = toCheck.filter(d => d.getAttribute('style')).map(d => ({
            cls: (d.className || '').slice(0, 60),
            style: (d.getAttribute('style') || '').slice(0, 120)
        })).slice(0, 8);
        return {
            found: false,
            reason: 'no_rgba_background_div',
            card_class: (card.className || '').slice(0, 100),
            card_styled_divs: cardStyled
        };
    }

    const tapeDiv = tapeDivs[0];
    return {
        found: true,
        source: 'card_search',
        inline_style: tapeDiv.getAttribute('style'),
        class: (tapeDiv.className || '').slice(0, 120)
    };
}
"""

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage"]
        )
        ctx = browser.new_context(
            viewport={"width": 1280, "height": 900},
            locale="vi-VN"
        )
        page = ctx.new_page()
        page.set_default_timeout(12000)

        log("=== decor_persistence_qa.py START ===")
        log(f"Target URL : {APP_URL}")
        log(f"Storage key: {STORAGE_KEY}")
        log(f"Expected ID: {EXPECTED_DECOR_ID}")
        log(f"Tape RGBA  : {SAKURA_BG_RGBA}")
        log("")

        # ── 1. Load app ────────────────────────────────────────────────────────
        try:
            page.goto(APP_URL, wait_until="networkidle", timeout=20000)
            log(f"[PASS] Page loaded: {page.title()}")
            take_ss(page, "p01_app_loaded")
        except PWTimeout:
            fail("App failed to load within 20s", page, "p01_FAIL_load")
            browser.close()
            sys.exit(1)

        # ── 2. New note button ─────────────────────────────────────────────────
        new_note_btn = None
        for sel in ['button:has-text("Ghi chú mới")', 'button:has-text("New Note")']:
            el = page.query_selector(sel)
            if el and el.is_visible():
                new_note_btn = el
                log(f"[PASS] App screen confirmed: {sel}")
                break
        if not new_note_btn:
            fail("New Note button not visible — app screen not reached", page, "p02_FAIL_app")
            browser.close()
            sys.exit(1)

        # ── 3. Open NoteModal ──────────────────────────────────────────────────
        new_note_btn.click()
        MODAL_H2 = 'h2:has-text("Ghi chú mới"), h2:has-text("New Sticky Note")'
        try:
            page.wait_for_selector(MODAL_H2, timeout=6000)
            log("[PASS] NoteModal opened")
        except PWTimeout:
            fail("NoteModal did not open", page, "p03_FAIL_modal")
            browser.close()
            sys.exit(1)

        # ── 4. Photo tab ───────────────────────────────────────────────────────
        photo_tab = None
        for sel in ['button:has-text("Ảnh dán")', 'button:has-text("Photo Card")', 'button:has-text("Ảnh")']:
            el = page.query_selector(sel)
            if el and el.is_visible():
                photo_tab = el
                log(f"[PASS] Photo tab: {sel}")
                break
        if not photo_tab:
            fail("Photo tab not found", page, "p04_FAIL_photo")
            browser.close()
            sys.exit(1)
        photo_tab.click()
        time.sleep(0.3)

        # ── 5. Set unique title ────────────────────────────────────────────────
        NOTE_TITLE = "QA Persist Test"
        title_input = page.query_selector('.max-w-lg input[type="text"]')
        if title_input:
            title_input.fill(NOTE_TITLE)
            log(f"[PASS] Title: {NOTE_TITLE}")
        else:
            log("[WARN] Title input not found; continuing without title")

        # ── 6. Open Decor modal ────────────────────────────────────────────────
        decor_btn = None
        for sel in ['button:has-text("Trang trí")', 'button[title="Trang trí băng keo"]', 'button[title*="Trang trí"]']:
            el = page.query_selector(sel)
            if el and el.is_visible():
                decor_btn = el
                log(f"[PASS] Decor button: {sel}")
                break
        if not decor_btn:
            fail("Trang trí button not found", page, "p06_FAIL_decor")
            browser.close()
            sys.exit(1)
        decor_btn.click()

        try:
            page.wait_for_selector('[aria-labelledby="decor-modal-title"]', timeout=6000)
            log("[PASS] DecorPackModal opened")
        except PWTimeout:
            fail("DecorPackModal did not open", page, "p07_FAIL_decormodal")
            browser.close()
            sys.exit(1)

        # ── 7. Select Sakura Pink ──────────────────────────────────────────────
        sakura = None
        for sel in ['button[title="Hồng Sakura"]', 'button:has-text("Hồng Sakura")']:
            el = page.query_selector(sel)
            if el and el.is_visible():
                sakura = el
                log(f"[PASS] Sakura button: {sel}")
                break
        if not sakura:
            chips = page.query_selector_all('[aria-labelledby="decor-modal-title"] button')
            info = [(b.get_attribute('title') or '') + ' | ' + b.inner_text()[:30] for b in chips[:15]]
            fail(f"Sakura button not found. Buttons: {info}", page, "p07_FAIL_sakura")
            browser.close()
            sys.exit(1)
        sakura.click()
        time.sleep(0.3)

        pressed = page.evaluate("el => el.getAttribute('aria-pressed')", sakura)
        if pressed != 'true':
            fail(f"Sakura not selected: aria-pressed={pressed}", page, "p07_FAIL_press")
            browser.close()
            sys.exit(1)
        log(f"[PASS] Sakura selected (aria-pressed={pressed})")

        # ── 8. Apply ───────────────────────────────────────────────────────────
        apply_btn = None
        for sel in ['button:has-text("Áp dụng")', 'button:has-text("Apply")']:
            el = page.query_selector(sel)
            if el and el.is_visible():
                apply_btn = el
                break
        if not apply_btn:
            fail("Apply button not found", page, "p08_FAIL_apply")
            browser.close()
            sys.exit(1)
        apply_btn.click()
        time.sleep(0.5)
        log("[PASS] Decor applied")
        take_ss(page, "p08_decor_applied")

        # ── 9. Save note ───────────────────────────────────────────────────────
        save_btn = page.query_selector('.max-w-lg button[type="submit"]')
        if not save_btn:
            for sel in ['button:has-text("Tạo ghi chú")', 'button:has-text("Create Note")', 'button:has-text("Lưu")']:
                el = page.query_selector(sel)
                if el and el.is_visible():
                    save_btn = el
                    break
        if not save_btn:
            fail("Save button not found", page, "p09_FAIL_save")
            browser.close()
            sys.exit(1)
        save_btn.click()
        time.sleep(1.2)
        log("[PASS] Note saved")

        try:
            page.wait_for_selector('.max-w-lg', timeout=4000, state="hidden")
            log("[PASS] NoteModal closed")
        except PWTimeout:
            log("[WARN] NoteModal may still be visible")

        take_ss(page, "p09_note_saved")

        # ══════════════════════════════════════════════════════════════════════
        # GAP 1: localStorage persistence — use ACTUAL key
        # ══════════════════════════════════════════════════════════════════════
        store_result = page.evaluate(READ_STORE_JS)
        log(f"\n--- GAP 1: localStorage [{STORAGE_KEY}] ---")
        log(f"  Store read: {json.dumps(store_result)}")

        if "error" in store_result:
            err = store_result["error"]
            fail(f"GAP 1 FAIL: localStorage read error '{err}': {json.dumps(store_result)}",
                 page, "p10_FAIL_storage")
            browser.close()
            sys.exit(1)

        saved_id = store_result.get("decorAssetId")
        if saved_id == EXPECTED_DECOR_ID:
            log(f"[PASS] GAP 1: decorAssetId='{saved_id}' persisted in localStorage")
        elif saved_id:
            fail(f"GAP 1 FAIL: decorAssetId='{saved_id}' (expected '{EXPECTED_DECOR_ID}')",
                 page, "p10_FAIL_wrong_id")
            browser.close()
            sys.exit(1)
        else:
            fail(f"GAP 1 FAIL: decorAssetId is null/missing. Full record: {json.dumps(store_result)}",
                 page, "p10_FAIL_no_id")
            browser.close()
            sys.exit(1)

        note_id = store_result.get("id")

        # ══════════════════════════════════════════════════════════════════════
        # GAP 2: Tape DOM inline style — use actual style attribute, not class
        # ══════════════════════════════════════════════════════════════════════
        log(f"\n--- GAP 2: Tape DOM inline style ---")
        tape_result = page.evaluate(FIND_TAPE_JS, NOTE_TITLE)
        log(f"  Tape search: {json.dumps(tape_result)}")

        if not tape_result.get("found"):
            reason = tape_result.get("reason", "unknown")
            styled = tape_result.get("all_styled", [])
            fail(f"GAP 2 FAIL: Tape div not found — reason='{reason}'. "
                 f"Styled divs in card: {json.dumps(styled[:5])}",
                 page, "p11_FAIL_no_tape")
            browser.close()
            sys.exit(1)

        inline_style = tape_result.get("inline_style", "")
        if SAKURA_BG_RGBA.replace(" ", "") in inline_style.replace(" ", "") or \
           "249, 184, 204" in inline_style or "249,184,204" in inline_style:
            log(f"[PASS] GAP 2: Tape inline style has Sakura rgba")
            log(f"  inline_style: {inline_style}")
        else:
            fail(f"GAP 2 FAIL: Tape found but Sakura color absent. inline_style='{inline_style}'",
                 page, "p11_FAIL_wrong_tape_style")
            browser.close()
            sys.exit(1)

        take_ss(page, "p11_tape_verified")

        # ══════════════════════════════════════════════════════════════════════
        # GAP 1C: Reload → confirm persistence survives page load
        # ══════════════════════════════════════════════════════════════════════
        log(f"\n--- Reload persistence check ---")
        page.reload(wait_until="networkidle", timeout=20000)
        time.sleep(0.8)
        take_ss(page, "p12_after_reload")

        store_after_reload = page.evaluate(READ_STORE_JS)
        log(f"  After reload: {json.dumps(store_after_reload)}")
        if "error" in store_after_reload:
            fail(f"Reload GAP 1 FAIL: storage error '{store_after_reload['error']}'",
                 page, "p12_FAIL_reload_storage")
            browser.close()
            sys.exit(1)

        reloaded_id = store_after_reload.get("decorAssetId")
        if reloaded_id == EXPECTED_DECOR_ID:
            log(f"[PASS] decorAssetId='{reloaded_id}' survives page reload")
        else:
            fail(f"Reload FAIL: decorAssetId='{reloaded_id}' after reload (expected '{EXPECTED_DECOR_ID}')",
                 page, "p12_FAIL_reload_id")
            browser.close()
            sys.exit(1)

        # GAP 2 after reload: tape still has Sakura style
        tape_after_reload = page.evaluate(FIND_TAPE_JS, NOTE_TITLE)
        log(f"  Tape after reload: {json.dumps(tape_after_reload)}")
        if not tape_after_reload.get("found"):
            fail(f"Reload GAP 2 FAIL: tape not found after reload — {tape_after_reload.get('reason')}",
                 page, "p12_FAIL_reload_tape")
            browser.close()
            sys.exit(1)
        reload_style = tape_after_reload.get("inline_style", "")
        if "249, 184, 204" in reload_style or "249,184,204" in reload_style:
            log(f"[PASS] Tape Sakura style persists after reload")
        else:
            fail(f"Reload GAP 2 FAIL: tape style wrong after reload: '{reload_style}'",
                 page, "p12_FAIL_reload_style")
            browser.close()
            sys.exit(1)

        take_ss(page, "p13_reload_verified")

        # ══════════════════════════════════════════════════════════════════════
        # Clear decor → save → reload → confirm removal
        # ══════════════════════════════════════════════════════════════════════
        log(f"\n--- Clear decor + save + reload ---")

        # Find and click the note card
        note_card = None
        for sel in [
            f'p:has-text("{NOTE_TITLE}")',
            f'h3:has-text("{NOTE_TITLE}")',
            f'span:has-text("{NOTE_TITLE}")',
        ]:
            el = page.query_selector(sel)
            if el and el.is_visible():
                note_card = el
                log(f"  Card found via: {sel}")
                break
        if not note_card:
            fail("Card not found for reopening (clear decor step)", page, "p14_FAIL_no_card")
            browser.close()
            sys.exit(1)
        note_card.click()

        try:
            page.wait_for_selector(
                'h2:has-text("Ghi chú mới"), h2:has-text("New Sticky Note"), h2:has-text("Chỉnh sửa")',
                timeout=6000
            )
            log("[PASS] Note reopened for clear")
        except PWTimeout:
            fail("Note did not reopen for clear decor", page, "p14_FAIL_reopen")
            browser.close()
            sys.exit(1)

        # Click clear decor (✕ Decor)
        clear_btn = None
        for sel in ['button:has-text("✕ Decor")', 'button[title="Xoá decor"]']:
            el = page.query_selector(sel)
            if el and el.is_visible():
                clear_btn = el
                log(f"  Clear button: {sel}")
                break
        if not clear_btn:
            btns = page.query_selector_all('.max-w-lg button')
            btn_info = [b.inner_text()[:40] for b in btns[:20]]
            fail(f"Clear decor button not found. Visible buttons: {btn_info}", page, "p14_FAIL_no_clear")
            browser.close()
            sys.exit(1)
        clear_btn.click()
        time.sleep(0.3)
        log("[PASS] Clear decor clicked")
        take_ss(page, "p14_cleared")

        # Save after clear
        save_btn2 = page.query_selector('.max-w-lg button[type="submit"]')
        if not save_btn2:
            for sel in ['button:has-text("Lưu thay đổi")', 'button:has-text("Save Changes")', 'button:has-text("Lưu")']:
                el = page.query_selector(sel)
                if el and el.is_visible():
                    save_btn2 = el
                    break
        if not save_btn2:
            fail("Save button not found after clear decor", page, "p14_FAIL_save2")
            browser.close()
            sys.exit(1)
        save_btn2.click()
        time.sleep(1.2)
        log("[PASS] Saved after clear")

        try:
            page.wait_for_selector('.max-w-lg', timeout=4000, state="hidden")
        except PWTimeout:
            pass

        # Reload again
        page.reload(wait_until="networkidle", timeout=20000)
        time.sleep(0.8)
        take_ss(page, "p15_after_clear_reload")

        store_after_clear = page.evaluate(READ_STORE_JS)
        log(f"  After clear+reload: {json.dumps(store_after_clear)}")

        if "error" in store_after_clear:
            fail(f"Clear+reload storage error: {store_after_clear['error']}", page, "p15_FAIL_clear_store")
            browser.close()
            sys.exit(1)

        cleared_id = store_after_clear.get("decorAssetId")
        if not cleared_id:
            log(f"[PASS] decorAssetId=null after clear+reload (correctly removed)")
        else:
            fail(f"Clear FAIL: decorAssetId='{cleared_id}' still set after clear+save+reload",
                 page, "p15_FAIL_still_set")
            browser.close()
            sys.exit(1)

        # Confirm tape Sakura style is gone from card
        tape_after_clear = page.evaluate(FIND_TAPE_JS, NOTE_TITLE)
        log(f"  Tape after clear: {json.dumps(tape_after_clear)}")
        if tape_after_clear.get("found"):
            clear_style = tape_after_clear.get("inline_style", "")
            if "249, 184, 204" in clear_style or "249,184,204" in clear_style:
                fail(f"Clear FAIL: Sakura tape style still present after clear: '{clear_style}'",
                     page, "p15_FAIL_tape_not_gone")
                browser.close()
                sys.exit(1)
            else:
                log(f"[PASS] Tape div exists but no Sakura color (style='{clear_style}') — decor cleared")
        else:
            log("[PASS] Tape div with Sakura style gone after clear+reload (decor removed)")

        take_ss(page, "p16_all_clear_verified")

        browser.close()

        # ══ Summary ═══════════════════════════════════════════════════════════
        log("\n=== FINAL SUMMARY ===")
        n_pass = len([r for r in RESULTS if '[PASS]' in r])
        n_fail = len(FAILURES)
        log(f"PASSes: {n_pass}  FAILs: {n_fail}")
        if FAILURES:
            log("\nFAILURES:")
            for f in FAILURES:
                log(f"  ✗ {f}")
        else:
            log("All gap-closure assertions passed ✓")
        log(f"\nScreenshots: {REPORT_DIR}")

    return FAILURES

failures = run()
sys.exit(1 if failures else 0)
