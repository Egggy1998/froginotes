# Decor Packs UI — Integration Contract

**Version:** 0.1-LOCAL-MVP  
**Status:** Component boundary built; shared wiring NOT yet done  
**Owner files:** `src/components/decor/**`, `src/stores/useDecorStore.ts`, `src/lib/decor-catalog.ts`

---

## Files Delivered

| File | Description |
|---|---|
| `src/lib/decor-catalog.ts` | Pack catalog, asset definitions, CSS style helpers |
| `src/stores/useDecorStore.ts` | Zustand store with adapter boundary + entitlement logic |
| `src/components/decor/DecorPackModal.tsx` | Pack browser UI with preview + payment unavailable |
| `src/components/decor/DecorLockOverlay.tsx` | Lock shimmer overlay + `DecorTapePreview` helper |
| `src/tests/decor-store.test.ts` | Unit tests for store state/rejection/persistence |
| `src/components/decor/INTEGRATION.md` | This file |

---

## What the Next Frontend Worker Must Do

### Step 1 — Wire DecorPackModal into NoteModal or a TopBar button

```tsx
// In NoteModal.tsx or wherever the tape picker lives:
import { DecorPackModal } from '../decor/DecorPackModal';
import { useDecorStore } from '../../stores/useDecorStore';
import { DecorSelection } from '../../lib/decor-catalog';

// Inside the component:
const { showDecorModal, setShowDecorModal, getActiveSelection } = useDecorStore();

const handleDecorApply = (selection: DecorSelection) => {
  // selection.applyStyles — apply inline to tape elements
  // selection.assetId — store on Note/DiaryEntry as tapeStyle (or new field)
  setTapeStyle(selection.assetId);  // example
};

<DecorPackModal
  open={showDecorModal}
  onClose={() => setShowDecorModal(false)}
  onApply={handleDecorApply}
  currentAssetId={currentNote?.tapeStyle ?? null}
/>
```

### Step 2 — Apply DecorSelection styles to tape rendering

`DecorSelection.applyStyles` is an object you can spread as inline styles on any tape element:

```tsx
import { getDecorAssetById, getApplyStyles } from '../../lib/decor-catalog';

// In TapedPhotoCard.tsx or StickyCard.tsx tape renderer:
const decorAsset = getDecorAssetById(note.tapeStyle ?? '');
const tapeInlineStyles = decorAsset ? getApplyStyles(decorAsset) : undefined;

// Then on the tape div:
<div
  className="w-16 h-5 rounded-sm ..."
  style={tapeInlineStyles}   // overrides the static Tailwind tape classes
/>
```

Existing `TapeStyle` values (`'mint' | 'pink' | 'yellow' | 'checkered' | 'scotch'`) must still
work via the existing `getTapeClass()` switch in `TapedPhotoCard.tsx`. The decor asset IDs are
different strings (e.g. `'tape-sakura-pink'`). Detection:

```tsx
const isDecorAsset = note.tapeStyle?.startsWith('tape-');
```

**Do NOT modify `TapeStyle` union type** until Phase 3 backend sync is confirmed;
instead persist the asset ID to a new optional field `decorAssetId?: string` on Note/DiaryEntry,
leaving `tapeStyle` for existing values.

### Step 3 — Wire backend adapter when Worker is live

```ts
// In App.tsx or a cloud-sync hook, after auth resolves:
import { useDecorStore } from './stores/useDecorStore';
import { BackendEntitlementsAdapter, DecorPackId } from './stores/useDecorStore';
// (BackendEntitlementsAdapter is exported from useDecorStore)

const adapter: BackendEntitlementsAdapter = {
  fetchOwnedPackIds: async () => {
    const res = await fetch('/api/decor/packs', { credentials: 'include' });
    if (!res.ok) return []; // fail closed
    const data = await res.json();
    return data.packs
      .filter((p: any) => p.owned)
      .map((p: any) => p.id as DecorPackId);
  },
  requestCheckout: async (packId) => {
    const res = await fetch('/api/decor/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ packId }),
    });
    const data = await res.json();
    return {
      ok: false as const,
      error: data.error ?? 'Payment unavailable',
      errorVi: 'Thanh toán chưa khả dụng. Vui lòng thử lại sau.',
    };
  },
};

useDecorStore.getState().setBackendAdapter(adapter);
await useDecorStore.getState().populateFromBackend();
```

**Security rules — must not violate:**
- Do NOT set `backendOwnedPackIds` directly from any local flag
- Do NOT trust `UserProfile.plan === 'pro'` as an entitlement source
- The adapter must always fail-closed (return `[]` on error)
- `requestCheckout` always returns `ok: false` until real payment confirmed server-side

### Step 4 — Add DecorLockOverlay to tape preview picker (optional polish)

```tsx
import { DecorLockOverlay } from '../decor/DecorLockOverlay';

// Wrap any tape preview in NoteModal:
<DecorLockOverlay
  assetId={asset.id}
  onClickLocked={() => setShowDecorModal(true)}
>
  <TapePreviewThing />
</DecorLockOverlay>
```

---

## Constraints Not Yet Crossed

- `src/types/index.ts` — NOT modified. `TapeStyle` union untouched.
- `src/stores/useNotesStore.ts` — NOT modified.
- `src/components/NoteModal.tsx` — NOT modified.
- `src/components/TopBar.tsx` — NOT modified.
- No new PNG/image assets. No frogs. Existing 14 mascots remain free.
- No payments attempted. Checkout always returns unavailable.
- No backend calls yet — all offline, localStorage only for selection.

---

## localStorage Keys

| Key | Controlled by | Value |
|---|---|---|
| `froginotes_decor_selected_asset_v1` | `useDecorStore` | Asset ID string or absent |

Does NOT conflict with any existing key in `useNotesStore`.

---

## Running Tests

```bash
bun test src/tests/decor-store.test.ts
```

Expected: all 17 assertions pass.

---

## TapeStyle Extension (when ready)

When Phase 3 backend sync is confirmed, extend `src/types/index.ts`:

```ts
// Before:
export type TapeStyle = 'mint' | 'pink' | 'yellow' | 'checkered' | 'scotch';

// After (Phase 3 only — coordinate with backend subagent first):
export type TapeStyle = 'mint' | 'pink' | 'yellow' | 'checkered' | 'scotch' | 'sakura';
```

Add `'sakura'` to `getTapeClass()` in `TapedPhotoCard.tsx` pointing at the sakura asset styles.
