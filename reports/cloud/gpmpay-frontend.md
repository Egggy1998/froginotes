# GPM Pay Frontend — Cloud Pro 50k/tháng

**Date:** 2026-09-11  
**Status:** ✅ Complete — all checks pass

---

## Summary

Updated the FrogiNotes frontend to reflect the new GPM Pay Cloud Pro package at **50.000đ / tháng** (or 500.000đ / năm, saving 2 months). All three owned files were modified, a new test file was added, and all CI gates pass.

---

## Files Changed

| File | Change |
|------|--------|
| `src/lib/api-payment.ts` | Added `'monthly'` to `PeriodType`; exported `DEFAULT_PERIOD = 'monthly'` and `DEFAULT_MONTHLY_AMOUNT = 50_000`; updated `createPaymentOrder` signature defaults to `'monthly'`. |
| `src/components/CloudSyncModal.tsx` | Updated price display to **50.000đ / tháng** (+ 500.000đ / năm tiết kiệm 2 tháng); updated perks to highlight Cloud Sync thời gian thực, Sao lưu nhật ký & ảnh trên Cloud, Khôi phục mọi lúc; changed CTA button to "Nâng cấp Pro — 50k/tháng 👑"; passes `period="monthly"` to PaymentModal. |
| `src/components/payment/PaymentModal.tsx` | Header now shows "Gói Pro Cloud 👑" with `getPriceLabel()` helper (50.000đ/tháng, 500.000đ/năm, trial); added "Gói Pro Cloud — 50.000đ / tháng" package badge above QR; added yellow instruction box: "Mở app ngân hàng quét mã QR hoặc chuyển đúng số tiền & nội dung để hệ thống tự động kích hoạt gói Pro trong 30 giây."; poll interval changed from 3000ms → **2000ms** (every 2 seconds); default `period` prop set to `'monthly'`; on webhook success: confetti + `plan='pro'` + auto-close → unlocks Cloud Sync. |
| `src/tests/gpmpay-ui.test.ts` | **New file.** 12 tests covering: DEFAULT_PERIOD/amount constants, price label formatting, vi-VN locale format (50.000đ), yearly savings math (2 months), payment success upgrades plan to pro, local notes untouched, poll interval = 2000ms. |

---

## Test Results

```
bun test src/tests/ — 86 pass, 0 fail (5 files, 175 expect() calls)
```

### New gpmpay-ui.test.ts (12/12 pass):
- ✅ DEFAULT_PERIOD is 'monthly'
- ✅ DEFAULT_MONTHLY_AMOUNT is 50000 VND
- ✅ monthly label → "50.000đ / tháng"
- ✅ yearly label → "500.000đ / năm"
- ✅ trial label → "Dùng thử miễn phí"
- ✅ DEFAULT_PERIOD resolves for PaymentModal default
- ✅ 50000 VND formats correctly in vi-VN locale
- ✅ Yearly savings = 2 months (600k - 500k = 100k = 2×50k)
- ✅ Payment success upgrades plan to 'pro'
- ✅ Upgrade does NOT touch local notes
- ✅ Auth store contains no note fields
- ✅ Poll interval = 2000ms (≤30s activation window = 15 polls)

---

## Type & Build Checks

| Check | Result |
|-------|--------|
| `bunx --no-install tsc --noEmit` | ✅ 0 errors |
| `bun run build` | ✅ Built in 4.27s (1905 modules, 494 kB JS, 109 kB CSS) |

---

## UI Behaviour Summary

### CloudSyncModal (plan=free)
- **Price:** 50.000đ / tháng  
- **Savings line:** hoặc 500.000đ / năm — tiết kiệm 2 tháng 🎉  
- **Perks:** ⚡ Mở khóa Cloud Sync thời gian thực · 📔 Sao lưu nhật ký & ảnh an toàn trên Cloud · 🔄 Khôi phục mọi lúc · 💬 Hỗ trợ ưu tiên  
- **CTA:** `Nâng cấp Pro — 50k/tháng 👑` → opens PaymentModal with `period="monthly"`

### PaymentModal (period=monthly)
- **Header:** Gói Pro Cloud 👑 / 50.000đ / tháng  
- **Package badge:** "Gói Pro Cloud — 50.000đ / tháng"  
- **VietQR:** from GPM Pay backend, renders as image or placeholder  
- **Bank details:** Ngân hàng, Số tài khoản (copy), Chủ tài khoản, Số tiền (copy), Nội dung CK (copy)  
- **Instructions:** "Mở app ngân hàng quét mã QR hoặc chuyển đúng số tiền & nội dung để hệ thống tự động kích hoạt gói Pro trong 30 giây."  
- **Polling:** every 2 seconds; on `completed` → confetti × 3 bursts, `plan='pro'` in store, auto-close after 3.5s  

### Local / Offline Notes
Remain **100% free and offline** — untouched by any payment or auth state change.
