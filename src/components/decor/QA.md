# Decor Integration QA — Acceptance Evidence

**Ngày QA:** 11/09/2026  
**Agent:** Independent Decor QA (subagent)  
**Phạm vi:** NoteModal, StickyCard, TapedPhotoCard, decor store, catalog, types, tests

---

## 1. Kết quả test chạy thực tế

### `bun test src/tests/decor-integration.test.ts`
```
 13 pass / 0 fail — 44 expect() calls [408ms]
```
Các test đã pass:
- `selects free asset successfully`
- `getActiveSelection returns valid DecorSelection after selecting free asset`
- `simulates reload: manual state restore from saved assetId works correctly`
- `decorAssetId applied to a Note round-trips correctly`
- `paid asset cannot be selected without backend grant` ← fail-closed ✅
- `getActiveSelection returns null for unowned paid asset forced into state` ← fail-closed ✅
- `requestCheckout never returns ok:true` ← fail-closed ✅
- `decorAssetId is stored on individual Note objects, not globally mutated`
- `clearing decorAssetId on a note does not affect store global state`
- `every free asset has valid applyStyles with required CSS fields`
- `buildDecorSelection returns complete DecorSelection for free asset`
- `simulates NoteModal handleDecorApply: sets local decorAssetId from selection`
- `simulates NoteModal save: decorAssetId included in note updates`

### `bun test src/tests/decor-store.test.ts`
```
 19 pass / 0 fail — 29 expect() calls [93ms]
```
Các test đã pass:
- `canUseAsset` đúng với free/paid/unknown
- `selectAsset` chấp nhận free, từ chối paid, không thay đổi state khi bị reject
- `requestCheckout` luôn `ok:false`, không grant ownership
- `populateFromBackend` fail-closed khi adapter throw, bỏ qua pack-id giả, grant đúng khi backend trả về
- `getActiveSelection` null khi unowned, valid khi owned
- `getPacksWithOwnership` đúng free=true, paid=false

### `tsc --noEmit` (TypeScript check)
```
Không có lỗi nào (exit 0, output trống)
```

---

## 2. Trace tích hợp: decorAssetId → TapedPhotoCard

**Luồng hiển thị decor trên card:**
```
Note.decorAssetId (string | undefined)
  └→ StickyCard.tsx (line ~70): if note.type === 'photo' | note.color === 'photo' | note.photoUrl
       └→ <TapedPhotoCard decorAssetId={note.decorAssetId} ... />
            └→ TapedPhotoCard.tsx renderTape():
                 const decorAsset = decorAssetId ? getDecorAssetById(decorAssetId) : undefined;
                 const decorStyles = decorAsset ? getApplyStyles(decorAsset) : undefined;
                 // tapeClass = '' khi có decorStyles (override CSS class bằng inline style)
                 tapeInlineStyle = { background, borderTop, borderBottom, boxShadow, ... }
                 // Tape element nhận style={tapeInlineStyle}
```

**Luồng lưu từ NoteModal:**
```
NoteModal.tsx:
  - state: [decorAssetId, setDecorAssetId] = useState<string|null>(null)
  - khi mở để chỉnh sửa: setDecorAssetId(editingNote.decorAssetId ?? null)  [line 120]
  - nút Decor → mở DecorPackModal → onApply(selection) → setDecorAssetId(selection.assetId)
  - nút xóa (✕ Decor) → setDecorAssetId(null)
  - khi save (photo note): updates.decorAssetId = decorAssetId ?? undefined  [line 265]
  - khi create (photo note): decorAssetId: decorAssetId ?? undefined  [line 298]
  - TapedPhotoCard trong preview modal: decorAssetId={decorAssetId ?? undefined}  [line 588]
```

**Isolation giữa các note:**
- `decorAssetId` được lưu trên từng `Note` object riêng biệt
- Store (`useDecorStore.selectedAssetId`) chỉ là selection global khi mở modal, không bị đưa vào note tự động
- Mỗi lần mở NoteModal khác nhau → local state `decorAssetId` được reset hoặc load từ note đó

---

## 3. Kiểm tra paid pack bị deny

**`useDecorStore.selectAsset('tape-pastel-lavender')` → trả về `false`**  
Log: `[decor] selectAsset rejected: asset not owned tape-pastel-lavender`  
`selectedAssetId` vẫn là `null` sau lần reject.

**`getActiveSelection()` với paid asset bị ép vào state → `null`**  
Đảm bảo dù localStorage bị corrupt cũng không leak entitlement.

**`requestCheckout('pack-pastel-dream')` → `{ ok: false, error: 'Payment unavailable' }`**  
`isPackOwned('pack-pastel-dream')` → `false` sau checkout attempt.

---

## 4. Catalog check

**Free pack (`pack-free-sample`):**
- Asset: `tape-sakura-pink` (Hồng Sakura)
- `getApplyStyles` → `background: 'rgba(249, 184, 204, 0.85)'`, `borderTop: '1px solid ...'`, `boxShadow: '0 2px 6px ...'`
- `swatchColor: '#F9B8CC'`
- `comingSoon: false`

**Paid packs (`pack-pastel-dream`, `pack-forest-cozy`):**
- `priceUsdCents: 299`, `comingSoon: true`
- Preview assets có sẵn để hiển thị (nhưng bị lock overlay)
- Checkout unavailable — chỉ hiện nút "Thông tin"

---

## 5. Giới hạn / Chưa kiểm tra

- **Không có render test** thực sự mount React component (không có @testing-library/react setup)
- **Không kiểm tra localStorage** thực trên browser (test dùng Bun không có browser API)
- **TapedPhotoCard chỉ áp dụng decor cho `photo` note** — regular sticky card không dùng decor
- **Backend chưa có** — `useDecorStore._adapter` là NULL_ADAPTER; paid packs luôn denied
- **DecorPackModal** không có render test riêng — chỉ được kiểm tra qua type check và integration
- Worker 8787 không được touch (theo yêu cầu)

---

## 6. Kết luận

✅ **Decor integration WIRED và CORRECT:**
- `decorAssetId` có trong `Note` type  
- `StickyCard → TapedPhotoCard` forward đúng prop  
- `TapedPhotoCard.renderTape()` render inline styles từ catalog khi có decor  
- `NoteModal` load/save/clear `decorAssetId` đúng vòng tròn  
- `useDecorStore` fail-closed cho paid packs  
- 32 test tổng cộng: **32 pass / 0 fail**  
- TypeScript: **0 lỗi**

❌ **Chưa verify:** UI acceptance trong browser thực (render component test chưa setup)  
⚠️ **Tình trạng MVP:** Checkout unavailable (honest) — free frogs+tapes có sẵn, paid packs hiện lock overlay
