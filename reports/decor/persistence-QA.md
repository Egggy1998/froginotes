# Decor Persistence QA — Gap-Closure Report

**Date:** 2026-09-11  
**Script:** `scripts/decor_persistence_qa.py`  
**Run command:** `D:/Hermes/hermes-agent/venv/Scripts/python.exe scripts/decor_persistence_qa.py`  
**Outcome:** ✅ ALL PASS — exit 0  
**PASSes:** 21 · **FAILs:** 0

---

## Why This Test Exists

Prior `scripts/decor_qa.py` ran 23 assertions and reported ALL PASS, but two warnings
indicated the actual evidence had not been collected:

- `[WARN] No tape element found on card` — selector `[class*="tape"]` never matches because
  `TapedPhotoCard` tape divs have **no "tape" string in their class**; decor is applied via
  **inline `style` attribute**.
- `[INFO] Last saved note from localStorage: "localStorage empty"` — script used key
  `froginotes-notes`; actual key in `useNotesStore.ts` line 268 is
  `froginotes_data_v7_empty`.

These warnings were incorrectly downgraded to non-fatal. Neither gap was closed. This test
closes them with hard assertions.

---

## Root-Cause Findings (from source inspection)

| Item | Actual value | What prior script used |
|------|-------------|------------------------|
| localStorage key | `froginotes_data_v7_empty` (`useNotesStore.ts:268`) | `froginotes-notes` → always empty |
| Tape DOM selector | `div` with inline `style="background-color: rgba(249,184,204,0.85)…"` | `[class*="tape"]` → never matches |
| Sakura asset ID | `tape-sakura-pink` (`decor-catalog.ts:73`) | N/A (not verified) |
| Tape class name | `absolute -top-1.5 left-1/2 … z-20 pointer-events-none …` | no "tape" substring present |

---

## Assertion Results

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | Page loads | ✅ PASS | `FrogiNotes - Sticky notes for brighter days` |
| 2 | App screen (New Note button) | ✅ PASS | `button:has-text("Ghi chú mới")` |
| 3 | NoteModal opens | ✅ PASS | h2 heading visible |
| 4 | Photo tab | ✅ PASS | `button:has-text("Ảnh dán")` |
| 5 | Title set | ✅ PASS | `QA Persist Test` |
| 6 | Decor button | ✅ PASS | `button:has-text("Trang trí")` |
| 7 | DecorPackModal opens | ✅ PASS | `[aria-labelledby="decor-modal-title"]` |
| 8 | Sakura button found | ✅ PASS | `button[title="Hồng Sakura"]` |
| 9 | Sakura selected | ✅ PASS | `aria-pressed=true` |
| 10 | Decor applied | ✅ PASS | modal dismissed |
| 11 | Note saved + modal closed | ✅ PASS | |
| **GAP 1** | **`froginotes_data_v7_empty` has `decorAssetId='tape-sakura-pink'`** | ✅ **PASS** | `{"id":"5a12deab…","type":"photo","decorAssetId":"tape-sakura-pink"}` |
| **GAP 2** | **Tape div has Sakura inline style** | ✅ **PASS** | `background-color: rgba(249, 184, 204, 0.85); border-top: 1px solid rgba(236,112,143,0.4); box-shadow: rgba(236,112,143,0.3) 0px 2px 6px` |
| 14 | Reload → same `decorAssetId` in store | ✅ PASS | Same UUID, same `tape-sakura-pink` |
| 15 | Reload → tape inline style still present | ✅ PASS | Sakura rgba confirmed post-reload |
| 16 | Note reopened for clear | ✅ PASS | |
| 17 | Clear decor (`✕ Decor`) clicked | ✅ PASS | |
| 18 | Save after clear | ✅ PASS | |
| 19 | Reload after clear → `decorAssetId=null` | ✅ PASS | `{"id":"5a12deab…","decorAssetId":null}` |
| 20 | Tape Sakura inline style absent after clear | ✅ PASS | No rgba(249,184,204) div found |
| 21 | Screenshots written | ✅ PASS | 9 screenshots in `reports/decor/` |

---

## Gap Evidence

### GAP 1 — Actual localStorage value

```json
{
  "id": "5a12deab-6a1e-4ffe-941e-48c702e7fd1c",
  "type": "photo",
  "decorAssetId": "tape-sakura-pink"
}
```

Key used: `froginotes_data_v7_empty`  
After clear+reload: `"decorAssetId": null` ✓

### GAP 2 — Actual tape inline style (from DOM)

```
background-position: initial; background-repeat: initial; background-attachment: initial;
background-origin: initial; background-clip: initial;
background-color: rgba(249, 184, 204, 0.85);
border-top: 1px solid rgba(236, 112, 143, 0.4);
border-bottom: 1px solid rgba(236, 112, 143, 0.4);
box-shadow: rgba(236, 112, 143, 0.3) 0px 2px 6px;
```

Class (no "tape" substring, confirming prior selector failure):
```
absolute -top-1.5 left-1/2 -translate-x-1/2 w-16 h-5  rotate-[-1.5deg] z-20 pointer-events-none transition-transform duration-300
```

After clear+reload: no div with `rgba(249,184,204)` inline style ✓

---

## Screenshots

All in `reports/decor/`:

```
p01_app_loaded.png
p08_decor_applied.png
p09_note_saved.png
p11_tape_verified.png
p12_after_reload.png
p13_reload_verified.png
p14_cleared.png
p15_after_clear_reload.png
p16_all_clear_verified.png
```

---

## Conclusion

Both evidence gaps are now closed with hard assertions and real values:

- **Persistence (GAP 1):** `decorAssetId='tape-sakura-pink'` is correctly written to
  `froginotes_data_v7_empty` on save and cleared to `null` after clear+save, surviving page
  reload in both states.
- **Tape DOM style (GAP 2):** The tape element exists as a `<div>` with Sakura pink inline
  CSS (not a class-based selector); it renders on save and disappears after clear+reload.

No source files were modified.
