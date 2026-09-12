# Decor Browser QA — Recovery Evidence

**Delegation:** `deleg_8e096d29`  
**Outcome:** Timed out at 600.02s · 49 API calls · no clean pass/fail result  
**Script:** `scripts/decor_qa.py`  
**Run command:** `/d/Hermes/hermes-agent/venv/Scripts/python scripts/decor_qa.py`

---

## Steps That DID Pass (confirmed in log line 82)

```
[PASS] Page loaded: FrogiNotes - Sticky notes for brighter days
[PASS] App screen confirmed — New Note button found via: button:has-text("Ghi chú mới")
[PASS] NoteModal opened (h2 heading visible)
```

Screenshots confirmed written (from earlier runs):
- `reports/decor/01_app_loaded.png`
- `reports/decor/02_app_screen_confirmed.png`
- `reports/decor/03_note_modal.png`

---

## Last Known Failure Point

After NoteModal opened, the script was trying to find the saved photo note card after
saving. The selector it was using (`[role="dialog"]` and note-card classes) had no DOM match.

The agent then — incorrectly — changed `APP_URL` from `?view=app` to `?mode=standalone`.  
The subsequent run (log line 98) showed the landing page loading instead of the app:

```
[INFO] Page body preview: Mở FrogiNotes Desktop 🍃
FrogiNotes
Tính năng ...
```

This regressed two passed steps back to zero, and the session timed out before recovery.

---

## Root Cause

Two layered bugs introduced during the session:

### Bug 1 (introduced, not original): Wrong APP_URL — **the one minimal fix needed**

`scripts/decor_qa.py` line 23 currently reads:
```python
APP_URL = "http://localhost:5173/?mode=standalone"
```
It must be:
```python
APP_URL = "http://localhost:5173/?view=app"
```

**Why:** `getInitialLandingView()` in `useNotesStore.ts` checks `params.get('view') === 'app'`
to skip the landing page. The `?mode=standalone` param is not recognized and returns
`true` (landing) by default.

### Bug 2 (pre-existing): Note card selector after save

After saving a photo note with `?view=app`, the app renders in `DesktopEnvironment`
(because `environmentMode: true` is the store default). `MainWindow` is embedded as
`<MainWindow isMockup={true} />` inside a 1050×745 container.

The photo note card renders as:
```html
<div class="h-[184px]">
  <div class="relative w-full h-full rounded-[18px] overflow-hidden bg-white p-2 ...">
    <!-- TapedPhotoCard -->
  </div>
</div>
```

No `data-testid`, no unique class. A viable selector for the saved card is:
```python
# Wait for a TapedPhotoCard (rounded-[18px] + cursor-pointer) after save
page.wait_for_selector("div.cursor-pointer.rounded-\\[18px\\]", timeout=5000)
```

Or target the note title inside the card:
```python
page.wait_for_selector(f"h3:has-text('{note_title}')", timeout=5000)
```

---

## Decor Flow Verified by Source Audit

| Step | Selector / Evidence |
|------|---------------------|
| New Note button | `button:has-text("Ghi chú mới")` (TopBar.tsx L144-148) |
| NoteModal heading | `h2:has-text("Ghi chú mới 🍃")` (i18n.ts L92) |
| Photo tab | `button:has-text("Ảnh dán 📷")` (i18n.ts L97) |
| Decor button | `button:has-text("Trang trí")` (NoteModal.tsx) |
| DecorPackModal | `role="dialog"` present on `DecorPackModal.tsx` (confirmed) |
| Sakura asset | id `tape-sakura-pink`, label `"Hồng Sakura"` (decor-catalog.ts L72) |
| Apply button | `"Áp dụng ♡"` |
| Clear decor button | `"✕ Decor"` (visible only when `decorAssetId` is set) |
| Save button | `"Tạo ghi chú"` (create) / `"Lưu thay đổi"` (edit) (i18n.ts L129-130) |

---

## Action Required

**Only one line to change before rerunning:**

```diff
- APP_URL = "http://localhost:5173/?mode=standalone"
+ APP_URL = "http://localhost:5173/?view=app"
```

Then add a robust note-card selector after save (see Bug 2 above). Everything
upstream of the save step was already working correctly.

---

## Do Not

- Do not restart the Vite dev server (it was confirmed live during the QA session)
- Do not reinstall Playwright (`/d/Hermes/hermes-agent/venv/Scripts/playwright` is valid)
- Do not touch `src/` — all Decor logic confirmed wired correctly by source audit
