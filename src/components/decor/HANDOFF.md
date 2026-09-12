# Decor Packs UI — HANDOFF

**Status:** ✅ MVP complete. All 19 store tests pass. TSC clean (`bun tsc --noEmit` = 0 errors).  
**Verified:** `bun test src/tests/decor-store.test.ts` → 19 pass, 0 fail  
**Scope:** `src/components/decor/**`, `src/stores/useDecorStore.ts`, `src/lib/decor-catalog.ts`

---

## What was built

| File | Status | Purpose |
|---|---|---|
| `src/lib/decor-catalog.ts` | ✅ | Pack catalog, asset definitions, CSS style helpers |
| `src/stores/useDecorStore.ts` | ✅ | Zustand store with adapter boundary + entitlement logic |
| `src/components/decor/DecorPackModal.tsx` | ✅ | Pack browser UI (free selectable, paid locked + "Coming Soon") |
| `src/components/decor/DecorLockOverlay.tsx` | ✅ | Lock shimmer overlay component |
| `src/tests/decor-store.test.ts` | ✅ | 19 unit tests covering all entitlement paths |

---

## How to mount `DecorPackModal`

**In `NoteModal.tsx` or `TopBar.tsx` — add one button + mount the modal:**

```tsx
import { DecorPackModal } from '../decor/DecorPackModal';
import { useDecorStore } from '../../stores/useDecorStore';
import type { DecorSelection } from '../../lib/decor-catalog';

// Inside your component:
const { showDecorModal, setShowDecorModal } = useDecorStore();

const handleDecorApply = (selection: DecorSelection) => {
  // selection.applyStyles — spread as inline styles on the tape element
  // selection.assetId     — store on the note record (new field or tapeStyle)
  // selection.swatchColor — swatch for compact preview
  setTapeDecorAssetId(selection.assetId); // your note field update
};

// Trigger button (put in TopBar or note editor):
<button onClick={() => setShowDecorModal(true)}>🎀 Trang trí</button>

// Modal mount (put at root of NoteModal or App):
<DecorPackModal
  open={showDecorModal}
  onClose={() => setShowDecorModal(false)}
  onApply={handleDecorApply}
  currentAssetId={currentNote?.decorAssetId ?? null}
/>
```

---

## How to apply `DecorSelection` to a tape element

`selection.applyStyles` is a `DecorApplyStyles` object — spread it as inline styles:

```tsx
import { getApplyStyles, getDecorAssetById } from '../../lib/decor-catalog';

// Given decorAssetId stored on the note:
const asset = getDecorAssetById(note.decorAssetId ?? '');
const tapeStyle = asset ? getApplyStyles(asset) : defaultTapeStyle;

// On the tape element:
<div style={{
  background: tapeStyle.background,
  borderTop: tapeStyle.borderTop,
  borderBottom: tapeStyle.borderBottom,
  boxShadow: tapeStyle.boxShadow,
  backgroundImage: tapeStyle.backgroundImage,  // optional, for patterns
  backgroundSize: tapeStyle.backgroundSize,    // optional
}} />
```

Or use the `useDecorStore` selector for the currently selected asset:

```tsx
const { getActiveSelection } = useDecorStore();
const active = getActiveSelection(); // returns DecorSelection | null
if (active) {
  // active.applyStyles, active.swatchColor, etc.
}
```

---

## Entitlement rules (HARD — do not bypass)

- **Free packs** (`priceUsdCents === 0`): always owned, no server call required.
- **Paid packs**: denied unless `populateFromBackend()` has been called and the backend returned that pack ID. `backendOwnedPackIds` is the only source of truth for paid packs.
- **`selectAsset(id)`** returns `false` and does not persist if the asset is unowned. Never call `setState({ selectedAssetId })` directly.
- **`requestCheckout()`** always returns `{ ok: false, ... }` in MVP. It never returns `ok: true`. Don't add a success path locally.
- **`canUseAsset(id)`** is the canonical gate for rendering/applying.

---

## Wiring the backend adapter (after Worker is live)

Call once after auth resolves (e.g. in `App.tsx` `useEffect`):

```ts
import { useDecorStore } from './stores/useDecorStore';
import type { BackendEntitlementsAdapter } from './stores/useDecorStore';
import type { DecorPackId } from './lib/decor-catalog';

const adapter: BackendEntitlementsAdapter = {
  fetchOwnedPackIds: async () => {
    const res = await fetch('/api/decor/packs', { credentials: 'include' });
    if (!res.ok) return []; // fail closed
    const data = await res.json();
    return data.packs
      .filter((p: { owned: boolean }) => p.owned)
      .map((p: { id: string }) => p.id as DecorPackId);
  },
  requestCheckout: async (_packId) => ({
    ok: false,
    error: 'Payment unavailable. Please try again later.',
    errorVi: 'Thanh toán chưa khả dụng. Vui lòng thử lại sau.',
  }),
};

useDecorStore.getState().setBackendAdapter(adapter);
await useDecorStore.getState().populateFromBackend();
```

---

## Test verification (real output)

```
bun test src/tests/decor-store.test.ts
 19 pass
  0 fail
 29 expect() calls
```

Tests covered:
- `canUseAsset()` true for free, false for paid, false for unknown
- `selectAsset()` accepts owned, rejects unowned, preserves prior selection on rejection
- `requestCheckout()` always `ok: false`, sets `lastCheckoutError`, does NOT grant ownership
- `populateFromBackend()` fail-closed on exception, empty = no grants, valid ID = granted, unknown IDs ignored
- `getActiveSelection()` null when unowned, valid `DecorSelection` when owned

---

## Shared files NOT yet wired (next worker's job)

1. **`Note` type** — add `decorAssetId?: string` field in `src/types/` or wherever `Note` is defined
2. **`NoteModal.tsx` or `TopBar.tsx`** — mount `<DecorPackModal>` (see snippet above)
3. **Tape render in `NoteCard.tsx`** — apply `getApplyStyles(asset)` from the stored `decorAssetId`
4. **`App.tsx`** — call `setBackendAdapter` + `populateFromBackend()` after auth when Worker is ready
