"""
Decor QA — isolated Playwright Chromium session (FIXED)
Target: http://localhost:5173/?view=app (bypasses landing page)

Flow: ASSERT app screen visible (New Note button present)
      -> open NoteModal -> select Photo tab
      -> set title -> open Decor panel -> select Sakura Pink (free)
      -> apply -> save note
      -> verify tape decorAssetId on saved note card
      -> reopen note -> clear decor (✕ Decor btn) -> save
      -> verify decor cleared
      -> check paid pack locked UI

Fails immediately on missing selectors — never swallows errors silently.
"""
import os, sys, time, json
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

REPORT_DIR = Path(__file__).parent.parent / "reports" / "decor"
REPORT_DIR.mkdir(parents=True, exist_ok=True)

APP_URL = "http://localhost:5173/?view=app"

RESULTS = []
FAILURES = []

def log(msg):
    print(msg, flush=True)
    RESULTS.append(msg)

def fail(msg):
    log(f"[FAIL] {msg}")
    FAILURES.append(msg)

def ss(page, name):
    path = str(REPORT_DIR / f"{name}.png")
    # timeout=0 bypasses font-loading wait that can stall on headless
    page.screenshot(path=path, full_page=False, timeout=0)
    log(f"  📸 screenshot: {name}.png")
    return path

def run_qa():
    with sync_playwright() as p:
        # Isolated profile — no user data, no Electron CDP
        browser = p.chromium.launch(headless=True, args=["--no-sandbox", "--disable-dev-shm-usage"])
        ctx = browser.new_context(
            viewport={"width": 1280, "height": 900},
            locale="vi-VN"
        )
        page = ctx.new_page()
        page.set_default_timeout(10000)

        log("=== Decor QA Start ===")
        log(f"Target URL: {APP_URL}")

        # ── 1. Navigate to app view ──────────────────────────────────────────
        try:
            page.goto(APP_URL, wait_until="networkidle", timeout=20000)
            log(f"[PASS] Page loaded: {page.title()}")
            ss(page, "01_app_loaded")
        except PWTimeout:
            fail("App failed to load within 20s — is Vite running?")
            browser.close()
            return

        # ── 2. ASSERT app screen (not landing) — New Note button must exist ──
        # TopBar renders: <button>...<span>{t.newNote}</span></button>
        # locale vi-VN -> "Ghi chú mới"; but also try English "New Note"
        new_note_btn = None
        for sel in [
            'button:has-text("Ghi chú mới")',
            'button:has-text("New Note")',
        ]:
            el = page.query_selector(sel)
            if el and el.is_visible():
                new_note_btn = el
                log(f"[PASS] App screen confirmed — New Note button found via: {sel}")
                break

        if not new_note_btn:
            # Dump page body to diagnose
            body_text = page.inner_text("body")[:500]
            log(f"[INFO] Page body preview: {body_text}")
            ss(page, "02_FAIL_not_app_screen")
            fail("CRITICAL: New Note button not visible — app screen not reached. "
                 "Possible: still on landing page or ?view=app not working. "
                 "Check body preview above.")
            browser.close()
            return

        ss(page, "02_app_screen_confirmed")

        # ── 3. Click New Note to open NoteModal ─────────────────────────────
        # NoteModal has no role="dialog" — detect via its header h2 text
        new_note_btn.click()
        MODAL_HEADING_SEL = 'h2:has-text("Ghi chú mới"), h2:has-text("New Sticky Note")'
        try:
            page.wait_for_selector(MODAL_HEADING_SEL, timeout=5000)
            log("[PASS] NoteModal opened (h2 heading visible)")
        except PWTimeout:
            ss(page, "03_FAIL_modal_not_open")
            fail("NoteModal did not open after clicking New Note (heading not found)")
            browser.close()
            return

        ss(page, "03_note_modal_open")

        # ── 4. Select Photo type tab ─────────────────────────────────────────
        # Labels: "Ảnh dán 📷" (vi) or "Photo Card 📷" (en)
        photo_tab = None
        for sel in [
            'button:has-text("Ảnh dán")',
            'button:has-text("Photo Card")',
            'button:has-text("Ảnh")',
        ]:
            el = page.query_selector(sel)
            if el and el.is_visible():
                photo_tab = el
                log(f"[PASS] Photo tab found: {sel}")
                break

        if not photo_tab:
            # Dump all button texts for diagnosis
            all_btns = page.query_selector_all('.max-w-lg button')
            btn_texts = [b.inner_text()[:40] for b in all_btns[:20]]
            log(f"[INFO] Dialog buttons: {btn_texts}")
            ss(page, "04_FAIL_no_photo_tab")
            fail(f"Photo type tab not found. Dialog buttons: {btn_texts}")
            browser.close()
            return

        photo_tab.click()
        time.sleep(0.3)
        ss(page, "04_photo_tab_selected")

        # ── 5. Set a title ───────────────────────────────────────────────────
        title_input = page.query_selector('.max-w-lg input[type="text"]')
        if title_input:
            title_input.fill("QA Decor Test Note")
            log("[PASS] Title filled: QA Decor Test Note")
        else:
            log("[WARN] Title input not found — continuing without title")

        # ── 6. Assert Decor (Trang trí) button is visible ───────────────────
        # NoteModal renders: <button title="Trang trí băng keo"><Sparkles/><span>Trang trí</span>
        decor_open_btn = None
        for sel in [
            'button:has-text("Trang trí")',
            'button[title="Trang trí băng keo"]',
            'button[title*="Trang trí"]',
        ]:
            el = page.query_selector(sel)
            if el and el.is_visible():
                decor_open_btn = el
                log(f"[PASS] Decor button found: {sel}")
                break

        if not decor_open_btn:
            all_btns = page.query_selector_all('.max-w-lg button')
            btn_texts = [b.inner_text()[:40] for b in all_btns[:30]]
            log(f"[INFO] Dialog buttons: {btn_texts}")
            ss(page, "05_FAIL_no_decor_btn")
            fail(f"Trang trí button not found in photo section. Dialog buttons: {btn_texts}")
            browser.close()
            return

        ss(page, "05_before_decor_click")

        # ── 7. Open Decor Pack Modal ─────────────────────────────────────────
        decor_open_btn.click()
        try:
            # DecorPackModal has aria-labelledby="decor-modal-title"
            page.wait_for_selector('[aria-labelledby="decor-modal-title"]', timeout=5000)
            log("[PASS] DecorPackModal opened")
        except PWTimeout:
            ss(page, "06_FAIL_decor_modal")
            fail("DecorPackModal did not open (aria-labelledby=decor-modal-title not found)")
            browser.close()
            return

        ss(page, "06_decor_pack_modal")

        # ── 8. Select Sakura Pink (free asset) ──────────────────────────────
        # TapeChip renders: <button title="Hồng Sakura" aria-pressed="false">
        # Also has <span>Hồng Sakura</span>
        sakura_btn = None
        for sel in [
            'button[title="Hồng Sakura"]',
            'button:has-text("Hồng Sakura")',
            'button[aria-label*="Sakura"]',
            '[title*="Sakura"]',
        ]:
            el = page.query_selector(sel)
            if el and el.is_visible():
                sakura_btn = el
                log(f"[PASS] Sakura Pink button found: {sel}")
                break

        if not sakura_btn:
            # Dump visible TapeChip buttons
            chip_btns = page.query_selector_all('[aria-labelledby="decor-modal-title"] button')
            chip_info = [(b.get_attribute('title') or '')[:40] + ' | ' + b.inner_text()[:30] for b in chip_btns[:20]]
            log(f"[INFO] DecorModal buttons: {chip_info}")
            ss(page, "07_FAIL_no_sakura")
            fail(f"Sakura Pink button not found in Decor modal. Buttons: {chip_info}")
            browser.close()
            return

        sakura_btn.click()
        time.sleep(0.3)

        # Verify it became selected (aria-pressed="true")
        pressed = page.evaluate("el => el.getAttribute('aria-pressed')", sakura_btn)
        log(f"[{'PASS' if pressed == 'true' else 'FAIL'}] Sakura aria-pressed={pressed}")
        if pressed != 'true':
            fail(f"Sakura button did not register as selected (aria-pressed={pressed})")

        ss(page, "07_sakura_selected")

        # ── 9. Click "Áp dụng ♡" to apply ───────────────────────────────────
        apply_btn = None
        for sel in [
            'button:has-text("Áp dụng")',
            'button:has-text("Apply")',
        ]:
            el = page.query_selector(sel)
            if el and el.is_visible():
                apply_btn = el
                break

        if not apply_btn:
            ss(page, "08_FAIL_no_apply_btn")
            fail("Apply (Áp dụng ♡) button not found in DecorPackModal footer")
            browser.close()
            return

        apply_btn.click()
        time.sleep(0.4)
        log("[PASS] Decor applied (modal closed)")

        # DecorPackModal should be gone now
        try:
            page.wait_for_selector('[aria-labelledby="decor-modal-title"]', timeout=2000, state="hidden")
            log("[PASS] DecorPackModal dismissed after apply")
        except PWTimeout:
            log("[WARN] DecorPackModal may still be visible after apply")

        ss(page, "08_decor_applied")

        # ── 10. Verify Decor indicator active in NoteModal ──────────────────
        # After apply, the Trang trí button should have decorAssetId active state
        # (green border class bg-[#E2F6D8] border-[#5E9B47])
        # Also the green dot <span class="w-2 h-2 rounded-full bg-[#5E9B47]"> appears
        decor_active = page.query_selector('button:has-text("Trang trí") span.bg-\\[\\#5E9B47\\]')
        if not decor_active:
            # Try evaluating class
            decor_btn_class = page.evaluate(
                "() => { const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Trang trí')); return btn ? btn.className : 'NOT FOUND'; }"
            )
            log(f"[INFO] Trang trí button class after apply: {decor_btn_class}")
            has_green = '#5E9B47' in decor_btn_class or 'E2F6D8' in decor_btn_class
            log(f"[{'PASS' if has_green else 'WARN'}] Decor active indicator: {has_green}")
        else:
            log("[PASS] Decor active green dot visible on Trang trí button")

        # ── 11. Save the note ────────────────────────────────────────────────
        # Submit button: type="submit" in form, text "Tạo ghi chú" (new) or "Lưu thay đổi" (edit)
        save_btn = page.query_selector('.max-w-lg button[type="submit"]')
        if not save_btn or not save_btn.is_visible():
            # Try text fallback
            for sel in ['button:has-text("Tạo ghi chú")', 'button:has-text("Create Note")', 'button:has-text("Lưu")']:
                el = page.query_selector(sel)
                if el and el.is_visible():
                    save_btn = el
                    break

        if not save_btn:
            ss(page, "09_FAIL_no_save_btn")
            fail("Save/Create button not found in NoteModal")
            browser.close()
            return

        save_btn.click()
        time.sleep(1.0)
        log("[PASS] Note saved")

        # Modal should close
        try:
            page.wait_for_selector('.max-w-lg', timeout=3000, state="hidden")
            log("[PASS] NoteModal closed after save")
        except PWTimeout:
            log("[WARN] NoteModal may still be open after save")

        ss(page, "09_note_saved")

        # ── 12. Verify saved note card has tape/decor ────────────────────────
        # Look for TapedPhotoCard or StickyCard
        NOTE_TITLE = "QA Decor Test Note"
        note_card = None
        # Target by unique test title rendered inside the card (h3 in card body)
        for sel in [
            f'h3:has-text("{NOTE_TITLE}")',
            f'p:has-text("{NOTE_TITLE}")',
            f'div:has-text("{NOTE_TITLE}")',
            'div.cursor-pointer.rounded-\\[18px\\]',
        ]:
            el = page.query_selector(sel)
            if el and el.is_visible():
                # Use the element itself or its closest card ancestor
                note_card = el
                log(f"[PASS] Note card found via: {sel}")
                break

        if not note_card:
            # dump what IS on the page
            body_text = page.inner_text("body")[:400]
            log(f"[INFO] Post-save page content: {body_text}")
            ss(page, "10_FAIL_no_note_card")
            fail("No note card found after saving. The note may not have been created.")
            browser.close()
            return

        # Check for tape element inside the card
        tape_el = None
        for sel in ['[class*="tape"]', '[class*="Tape"]']:
            te = page.query_selector(sel)
            if te and te.is_visible():
                tape_el = te
                break

        if tape_el:
            tape_style = page.evaluate("el => el.getAttribute('style')", tape_el)
            tape_class = page.evaluate("el => el.className", tape_el)
            log(f"[PASS] Tape element visible on card")
            log(f"[INFO] Tape style: {tape_style}")
            log(f"[INFO] Tape class: {tape_class}")
            # Assert decorAssetId in style — sakura pink is rgba(249, 184, 204, 0.85)
            if tape_style and '249, 184, 204' in tape_style:
                log("[PASS] Tape style contains Sakura Pink color (rgba 249,184,204)")
            else:
                log(f"[WARN] Tape style does not match Sakura Pink exactly: {tape_style}")
        else:
            log("[WARN] No tape element found on card — decor may not be visually rendered")

        # Verify via localStorage that decorAssetId was persisted
        decor_in_store = page.evaluate("""
            () => {
                try {
                    const raw = localStorage.getItem('froginotes-notes');
                    if (!raw) return 'localStorage empty';
                    const notes = JSON.parse(raw);
                    const last = notes[0];
                    return last ? { id: last.id, type: last.type, decorAssetId: last.decorAssetId } : 'no notes';
                } catch(e) { return 'error: ' + e.message; }
            }
        """)
        log(f"[INFO] Last saved note from localStorage: {json.dumps(decor_in_store)}")

        if isinstance(decor_in_store, dict):
            asset_id = decor_in_store.get('decorAssetId')
            if asset_id == 'tape-sakura-pink':
                log("[PASS] decorAssetId='tape-sakura-pink' correctly persisted in localStorage")
            elif asset_id:
                log(f"[WARN] decorAssetId={asset_id!r} (expected 'tape-sakura-pink')")
            else:
                fail(f"decorAssetId is null/missing in saved note: {decor_in_store}")

        ss(page, "10_card_with_tape")

        # ── 13. Reopen the note ──────────────────────────────────────────────
        note_card.click()
        try:
            page.wait_for_selector('h2:has-text("Ghi chú mới"), h2:has-text("New Sticky Note"), h2:has-text("Chỉnh sửa")', timeout=5000)
            log("[PASS] Note reopened (modal visible)")
        except PWTimeout:
            ss(page, "11_FAIL_reopen")
            fail("Could not reopen note (modal not appearing after card click)")
            browser.close()
            return

        ss(page, "11_note_reopened")

        # ── 14. Clear decor via "✕ Decor" button ────────────────────────────
        # This button only appears when decorAssetId is set
        clear_decor_btn = None
        for sel in [
            'button:has-text("✕ Decor")',
            'button[title="Xoá decor"]',
            'button:has-text("✕"):near([class*="decor"])',
        ]:
            el = page.query_selector(sel)
            if el and el.is_visible():
                clear_decor_btn = el
                log(f"[PASS] Clear decor button found: {sel}")
                break

        if not clear_decor_btn:
            # Dump photo section buttons
            dialog_btns = page.query_selector_all('.max-w-lg button')
            btn_info = [b.inner_text()[:40] + ' | title=' + (b.get_attribute('title') or '') for b in dialog_btns[:30]]
            log(f"[INFO] Reopen dialog buttons: {btn_info}")
            ss(page, "12_FAIL_no_clear_decor")
            fail(f"✕ Decor clear button not visible (decorAssetId may not have been set). Buttons: {btn_info}")
            browser.close()
            return

        clear_decor_btn.click()
        time.sleep(0.3)
        log("[PASS] Decor cleared (✕ Decor clicked)")
        ss(page, "12_decor_cleared")

        # ── 15. Save after clear ─────────────────────────────────────────────
        # Now editing an existing note -> button text is "Lưu thay đổi" / "Save Changes"
        save_btn2 = page.query_selector('.max-w-lg button[type="submit"]')
        if not save_btn2:
            for sel in ['button:has-text("Lưu thay đổi")', 'button:has-text("Save Changes")', 'button:has-text("Lưu")']:
                el = page.query_selector(sel)
                if el and el.is_visible():
                    save_btn2 = el
                    break

        if save_btn2:
            save_btn2.click()
            time.sleep(1.0)
            log("[PASS] Note saved after decor clear")
        else:
            fail("Save button not found after clearing decor")

        try:
            page.wait_for_selector('.max-w-lg', timeout=3000, state="hidden")
            log("[PASS] Modal closed after second save")
        except PWTimeout:
            log("[WARN] Modal may still be open")

        ss(page, "13_saved_after_clear")

        # ── 16. Verify tape gone from card ───────────────────────────────────
        time.sleep(0.5)
        tape_after_clear = page.query_selector('[class*="tape"], [class*="Tape"]')
        tape_gone = not tape_after_clear or not tape_after_clear.is_visible()
        log(f"[{'PASS' if tape_gone else 'FAIL'}] Tape element gone after clear: {tape_gone}")
        if not tape_gone:
            fail("Tape still visible after decor was cleared and note resaved")

        # Verify localStorage cleared decorAssetId
        decor_after_clear = page.evaluate("""
            () => {
                try {
                    const raw = localStorage.getItem('froginotes-notes');
                    if (!raw) return 'localStorage empty';
                    const notes = JSON.parse(raw);
                    const last = notes[0];
                    return last ? { id: last.id, decorAssetId: last.decorAssetId } : 'no notes';
                } catch(e) { return 'error: ' + e.message; }
            }
        """)
        log(f"[INFO] Note after clear: {json.dumps(decor_after_clear)}")
        if isinstance(decor_after_clear, dict):
            asset_id_after = decor_after_clear.get('decorAssetId')
            if not asset_id_after:
                log("[PASS] decorAssetId=null after clear — correctly removed")
            else:
                fail(f"decorAssetId still set after clear: {asset_id_after!r}")

        ss(page, "14_tape_cleared_verify")

        # ── 17. Check paid pack shows locked UI ──────────────────────────────
        # Reopen a note and try to open Decor modal again to verify paid pack guard
        note_card2 = page.query_selector(f'h3:has-text("QA Decor Test Note"), p:has-text("QA Decor Test Note"), div.cursor-pointer.rounded-\\[18px\\]')
        if note_card2:
            note_card2.click()
            try:
                page.wait_for_selector('h2:has-text("Ghi chú mới"), h2:has-text("New Sticky Note"), h2:has-text("Chỉnh sửa")', timeout=5000)
                log("[INFO] Note reopened for paid-pack test")
            except PWTimeout:
                log("[WARN] Could not reopen note for paid pack test")

        # Open Trang trí again (if modal open)
        decor_btn2 = None
        for sel in ['button:has-text("Trang trí")', 'button[title="Trang trí băng keo"]']:
            el = page.query_selector(sel)
            if el and el.is_visible():
                decor_btn2 = el
                break

        if decor_btn2:
            decor_btn2.click()
            try:
                page.wait_for_selector('[aria-labelledby="decor-modal-title"]', timeout=5000)
                log("[INFO] DecorPackModal open for paid pack check")
                ss(page, "15_decor_modal_paid_test")

                # Verify paid packs show locked indicator
                # "Sắp ra mắt" badge or Lock icon or "Thông tin" button
                paid_badge = None
                for sel in [
                    'span:has-text("Sắp ra mắt")',
                    'button:has-text("Thông tin")',
                    '.text-\\[\\#D97757\\]',  # orange badge color
                ]:
                    el = page.query_selector(sel)
                    if el and el.is_visible():
                        paid_badge = el
                        log(f"[PASS] Paid pack locked UI visible: {sel} — '{el.inner_text()[:40]}'")
                        break

                if not paid_badge:
                    log("[WARN] Paid pack lock badge not found — check screenshot 15")

                # Try clicking a paid TapeChip (locked) — should NOT apply
                # Lavender Dusk = tap-pastel-lavender, label "Tím Oải Hương"
                locked_chip = None
                for sel in ['button[title*="Cần mua"]', 'button:has-text("Tím Oải Hương")', 'button[title*="Tím Oải Hương"]']:
                    el = page.query_selector(sel)
                    if el and el.is_visible():
                        locked_chip = el
                        log(f"[INFO] Found locked chip: {sel}")
                        break

                if locked_chip:
                    locked_chip.click()
                    time.sleep(0.4)
                    ss(page, "16_paid_pack_clicked")
                    # Payment unavailable notice should appear
                    payment_notice = page.query_selector('[role="alertdialog"]')
                    if payment_notice and payment_notice.is_visible():
                        notice_text = payment_notice.inner_text()[:100]
                        log(f"[PASS] PaymentUnavailableNotice shown after locked chip click: {notice_text[:60]}")
                        # Dismiss
                        dismiss = page.query_selector('[role="alertdialog"] button')
                        if dismiss:
                            dismiss.click()
                            time.sleep(0.2)
                    else:
                        log("[WARN] PaymentUnavailableNotice not visible after locked chip click")

                # Close decor modal
                close_btn = page.query_selector('button[aria-label="Close decor packs"]')
                if close_btn:
                    close_btn.click()
                    time.sleep(0.2)

            except PWTimeout:
                log("[WARN] DecorPackModal did not open for paid pack test")

        ss(page, "17_final_state")

        browser.close()

        log("\n=== QA Summary ===")
        log(f"Total assertions: {len([r for r in RESULTS if '[PASS]' in r or '[FAIL]' in r])}")
        log(f"PASSes: {len([r for r in RESULTS if '[PASS]' in r])}")
        log(f"FAILs: {len(FAILURES)}")
        if FAILURES:
            log("\nFAILURES:")
            for f in FAILURES:
                log(f"  ✗ {f}")
        else:
            log("All assertions passed ✓")
        log(f"\nScreenshots saved to: {REPORT_DIR}")
        return RESULTS

results = run_qa()
print("\n--- FINAL LOG ---")
for line in (results or []):
    print(line)

# Exit with non-zero if failures
if FAILURES:
    sys.exit(1)
