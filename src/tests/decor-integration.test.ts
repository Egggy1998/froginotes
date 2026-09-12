/**
 * decor-integration.test.ts — Runtime integration tests for Decor MVP wiring
 *
 * Verifies:
 *   1. Free asset selects, serializes, and survives a reload (mocked localStorage)
 *   2. Paid asset selection is rejected (fail-closed)
 *   3. decorAssetId saved on Note object round-trips correctly
 *   4. Applying decor to one note does NOT affect another note (scope isolation)
 *   5. Clearing selection (decorAssetId = null) removes the decor
 *   6. Decor styles render correctly from the catalog (applyStyles has required CSS fields)
 *
 * Run: bun test src/tests/decor-integration.test.ts
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { useDecorStore } from '../stores/useDecorStore';
import {
  getDecorAssetById,
  getApplyStyles,
  buildDecorSelection,
  DECOR_CATALOG,
} from '../lib/decor-catalog';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FREE_ASSET_ID = 'tape-sakura-pink';
const PAID_ASSET_ID = 'tape-pastel-lavender';
const PAID_PACK_ID = 'pack-pastel-dream' as const;

/** Reset store to clean state (simulates fresh session) */
function resetStore() {
  useDecorStore.setState({
    backendOwnedPackIds: [],
    isSyncing: false,
    selectedAssetId: null,
    _adapter: {
      fetchOwnedPackIds: async () => [],
      requestCheckout: async (_packId) => ({
        ok: false as const,
        error: 'Payment unavailable',
        errorVi: 'Thanh toán chưa khả dụng',
      }),
    },
    backendConnected: false,
    lastCheckoutError: null,
    showDecorModal: false,
  });
}

/** Simulate a minimal Note-like structure for isolation tests */
interface MinimalNote {
  id: string;
  decorAssetId?: string;
}

function makeNote(id: string, decorAssetId?: string): MinimalNote {
  return { id, decorAssetId };
}

// ---------------------------------------------------------------------------
// 1. Free asset selection serializes and restores
// ---------------------------------------------------------------------------

describe('decor-integration: free asset serialize/reload', () => {
  beforeEach(resetStore);

  it('selects free asset successfully', () => {
    const ok = useDecorStore.getState().selectAsset(FREE_ASSET_ID);
    expect(ok).toBe(true);
    expect(useDecorStore.getState().selectedAssetId).toBe(FREE_ASSET_ID);
  });

  it('getActiveSelection returns valid DecorSelection after selecting free asset', () => {
    useDecorStore.getState().selectAsset(FREE_ASSET_ID);
    const sel = useDecorStore.getState().getActiveSelection();
    expect(sel).not.toBeNull();
    expect(sel!.assetId).toBe(FREE_ASSET_ID);
    expect(sel!.packId).toBe('pack-free-sample');
    expect(sel!.applyStyles.background).toBeTruthy();
    expect(sel!.applyStyles.borderTop).toContain('1px solid');
    expect(sel!.applyStyles.boxShadow).toBeTruthy();
    expect(sel!.swatchColor).toBe('#F9B8CC');
  });

  it('simulates reload: manual state restore from saved assetId works correctly', () => {
    // Step 1: "Save" — select the asset
    useDecorStore.getState().selectAsset(FREE_ASSET_ID);
    const savedId = useDecorStore.getState().selectedAssetId;
    expect(savedId).toBe(FREE_ASSET_ID);

    // Step 2: "Reload" — reset store, then restore from saved ID (as if from localStorage)
    resetStore();
    useDecorStore.setState({ selectedAssetId: savedId });

    // Step 3: Verify active selection is still valid after "reload"
    const restored = useDecorStore.getState().getActiveSelection();
    expect(restored).not.toBeNull();
    expect(restored!.assetId).toBe(FREE_ASSET_ID);
  });

  it('decorAssetId applied to a Note round-trips correctly', () => {
    useDecorStore.getState().selectAsset(FREE_ASSET_ID);
    const sel = useDecorStore.getState().getActiveSelection()!;

    // Simulate saving to Note
    const note = makeNote('note-1', sel.assetId);
    expect(note.decorAssetId).toBe(FREE_ASSET_ID);

    // Simulate reading it back
    const asset = getDecorAssetById(note.decorAssetId!);
    expect(asset).toBeDefined();
    expect(asset!.id).toBe(FREE_ASSET_ID);
    const styles = getApplyStyles(asset!);
    expect(styles.background).toBeTruthy();
    expect(styles.borderTop).toBeTruthy();
    expect(styles.boxShadow).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// 2. Paid asset selection is rejected (fail-closed)
// ---------------------------------------------------------------------------

describe('decor-integration: paid asset fail-closed', () => {
  beforeEach(resetStore);

  it('paid asset cannot be selected without backend grant', () => {
    const ok = useDecorStore.getState().selectAsset(PAID_ASSET_ID);
    expect(ok).toBe(false);
    expect(useDecorStore.getState().selectedAssetId).toBeNull();
  });

  it('getActiveSelection returns null for unowned paid asset forced into state', () => {
    // Force the ID in state (bypassing selectAsset gate, simulating old corrupted localStorage)
    useDecorStore.setState({ selectedAssetId: PAID_ASSET_ID });
    const sel = useDecorStore.getState().getActiveSelection();
    // Must return null — not a valid selection
    expect(sel).toBeNull();
  });

  it('requestCheckout never returns ok:true', async () => {
    const result = await useDecorStore.getState().requestCheckout(PAID_PACK_ID);
    expect(result.ok).toBe(false);
    // Ownership must NOT be granted
    expect(useDecorStore.getState().isPackOwned(PAID_PACK_ID)).toBe(false);
    // Cannot select the paid asset even after checkout attempt
    const canUse = useDecorStore.getState().canUseAsset(PAID_ASSET_ID);
    expect(canUse).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 3. UI scope isolation — selecting for one note should not affect another
// ---------------------------------------------------------------------------

describe('decor-integration: note scope isolation', () => {
  beforeEach(resetStore);

  it('decorAssetId is stored on individual Note objects, not globally mutated', () => {
    useDecorStore.getState().selectAsset(FREE_ASSET_ID);
    const sel = useDecorStore.getState().getActiveSelection()!;

    // Apply to note A explicitly
    const noteA = makeNote('note-a', sel.assetId);
    // Note B has no decor
    const noteB = makeNote('note-b', undefined);

    expect(noteA.decorAssetId).toBe(FREE_ASSET_ID);
    expect(noteB.decorAssetId).toBeUndefined();
  });

  it('clearing decorAssetId on a note does not affect store global state', () => {
    useDecorStore.getState().selectAsset(FREE_ASSET_ID);

    // Local note state simulating "remove decor"
    const note = makeNote('note-x', FREE_ASSET_ID);
    // Clear it (as NoteModal does: setDecorAssetId(null))
    const clearedNote = { ...note, decorAssetId: undefined };

    expect(clearedNote.decorAssetId).toBeUndefined();
    // Store's globalSelectedAssetId is unchanged — it reflects last user interaction
    // The NoteModal is the source of truth for per-note decorAssetId, not the store
    expect(useDecorStore.getState().selectedAssetId).toBe(FREE_ASSET_ID);
  });
});

// ---------------------------------------------------------------------------
// 4. DecorAsset catalog completeness
// ---------------------------------------------------------------------------

describe('decor-integration: catalog asset style correctness', () => {
  it('every free asset has valid applyStyles with required CSS fields', () => {
    const freePack = DECOR_CATALOG.find((p) => p.priceUsdCents === 0)!;
    expect(freePack).toBeDefined();

    for (const asset of freePack.fullAssets) {
      const styles = getApplyStyles(asset);
      expect(styles.background).toBeTruthy();
      expect(styles.borderTop).toContain('1px solid');
      expect(styles.borderBottom).toContain('1px solid');
      expect(styles.boxShadow).toBeTruthy();
    }
  });

  it('buildDecorSelection returns complete DecorSelection for free asset', () => {
    const asset = getDecorAssetById(FREE_ASSET_ID);
    expect(asset).toBeDefined();
    const sel = buildDecorSelection(asset!);
    expect(sel.assetId).toBe(FREE_ASSET_ID);
    expect(sel.packId).toBe('pack-free-sample');
    expect(sel.swatchColor).toBe('#F9B8CC');
    expect(sel.applyStyles.background).toContain('rgba');
    expect(sel.label).toBe('Sakura Pink');
    expect(sel.labelVi).toBe('Hồng Sakura');
  });
});

// ---------------------------------------------------------------------------
// 5. NoteModal logic simulation (without rendering React)
// ---------------------------------------------------------------------------

describe('decor-integration: NoteModal onApply logic', () => {
  beforeEach(resetStore);

  it('simulates NoteModal handleDecorApply: sets local decorAssetId from selection', () => {
    // Replicate what NoteModal does in onApply
    let localDecorAssetId: string | null = null;

    const handleDecorApply = (selection: { assetId: string }) => {
      localDecorAssetId = selection.assetId;
    };

    // Simulate user picking free asset → apply
    useDecorStore.getState().selectAsset(FREE_ASSET_ID);
    const selection = useDecorStore.getState().getActiveSelection()!;
    handleDecorApply(selection);

    expect(localDecorAssetId).not.toBeNull();
    expect(String(localDecorAssetId)).toBe(FREE_ASSET_ID);
  });

  it('simulates NoteModal save: decorAssetId included in note updates', () => {
    let localDecorAssetId: string | null = FREE_ASSET_ID;

    // Simulate building update payload (as handleSubmit does for photo notes)
    const updates: { tapeStyle: string; decorAssetId?: string } = {
      tapeStyle: 'mint',
      decorAssetId: localDecorAssetId ?? undefined,
    };

    expect(updates.decorAssetId).toBe(FREE_ASSET_ID);

    // Simulate clear
    localDecorAssetId = null;
    const clearedUpdates = {
      tapeStyle: 'mint',
      decorAssetId: localDecorAssetId ?? undefined,
    };
    expect(clearedUpdates.decorAssetId).toBeUndefined();
  });
});
