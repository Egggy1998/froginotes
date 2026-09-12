/**
 * decor-store.test.ts — Unit tests for useDecorStore
 *
 * Run: bun test src/tests/decor-store.test.ts
 * (bun has built-in test runner matching Vitest/Jest API)
 *
 * Tests cover:
 *   ✓ canUseAsset() false when not owned (paid pack, no backend)
 *   ✓ canUseAsset() true for free pack assets (always)
 *   ✓ selectAsset() rejects unowned asset, returns false
 *   ✓ selectAsset() accepts owned asset, returns true, persists
 *   ✓ requestCheckout() never succeeds — always returns ok:false
 *   ✓ populateFromBackend() fail-closed on adapter error
 *   ✓ populateFromBackend() does not grant paid packs on empty response
 *   ✓ populateFromBackend() grants paid pack when adapter returns it
 *   ✓ getActiveSelection() null when asset unowned
 *   ✓ getActiveSelection() valid DecorSelection when owned
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { useDecorStore } from '../stores/useDecorStore';
import { BackendEntitlementsAdapter } from '../stores/useDecorStore';
import { FREE_PACK_IDS, DECOR_CATALOG } from '../lib/decor-catalog';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Reset store state before each test (Zustand persists between tests in Node)
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

const FREE_ASSET_ID = 'tape-sakura-pink'; // from pack-free-sample
const PAID_ASSET_ID = 'tape-pastel-lavender'; // from pack-pastel-dream
const PAID_PACK_ID = 'pack-pastel-dream';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useDecorStore — canUseAsset', () => {
  beforeEach(resetStore);

  it('returns true for free pack asset (always owned)', () => {
    const { canUseAsset } = useDecorStore.getState();
    expect(canUseAsset(FREE_ASSET_ID)).toBe(true);
  });

  it('returns false for paid pack asset when no backend ownership', () => {
    const { canUseAsset } = useDecorStore.getState();
    expect(canUseAsset(PAID_ASSET_ID)).toBe(false);
  });

  it('returns false for unknown asset id', () => {
    const { canUseAsset } = useDecorStore.getState();
    expect(canUseAsset('nonexistent-asset')).toBe(false);
  });
});

describe('useDecorStore — selectAsset', () => {
  beforeEach(resetStore);

  it('accepts a free (owned) asset and returns true', () => {
    const { selectAsset } = useDecorStore.getState();
    const result = selectAsset(FREE_ASSET_ID);
    expect(result).toBe(true);
    expect(useDecorStore.getState().selectedAssetId).toBe(FREE_ASSET_ID);
  });

  it('rejects an unowned paid asset and returns false', () => {
    const { selectAsset } = useDecorStore.getState();
    const result = selectAsset(PAID_ASSET_ID);
    expect(result).toBe(false);
    expect(useDecorStore.getState().selectedAssetId).toBeNull();
  });

  it('does not change selected asset when rejection occurs', () => {
    // First select a valid asset
    useDecorStore.getState().selectAsset(FREE_ASSET_ID);
    expect(useDecorStore.getState().selectedAssetId).toBe(FREE_ASSET_ID);

    // Attempt to select paid asset (should fail)
    useDecorStore.getState().selectAsset(PAID_ASSET_ID);
    // Should still be the free asset
    expect(useDecorStore.getState().selectedAssetId).toBe(FREE_ASSET_ID);
  });
});

describe('useDecorStore — requestCheckout (fail-closed)', () => {
  beforeEach(resetStore);

  it('always returns ok:false — never fakes purchase success', async () => {
    const { requestCheckout } = useDecorStore.getState();
    const result = await requestCheckout(PAID_PACK_ID);
    expect(result.ok).toBe(false);
  });

  it('sets lastCheckoutError after failed checkout', async () => {
    await useDecorStore.getState().requestCheckout(PAID_PACK_ID);
    const { lastCheckoutError } = useDecorStore.getState();
    expect(lastCheckoutError).not.toBeNull();
    expect(lastCheckoutError?.error).toContain('unavailable');
  });

  it('does NOT grant ownership after checkout call', async () => {
    await useDecorStore.getState().requestCheckout(PAID_PACK_ID);
    const { isPackOwned } = useDecorStore.getState();
    expect(isPackOwned(PAID_PACK_ID)).toBe(false);
  });
});

describe('useDecorStore — populateFromBackend', () => {
  beforeEach(resetStore);

  it('fails closed on adapter exception — no entitlements granted', async () => {
    const errorAdapter: BackendEntitlementsAdapter = {
      fetchOwnedPackIds: async () => { throw new Error('Network error'); },
      requestCheckout: async (_p) => ({ ok: false as const, error: 'fail', errorVi: 'fail' }),
    };
    useDecorStore.getState().setBackendAdapter(errorAdapter);
    await useDecorStore.getState().populateFromBackend();
    expect(useDecorStore.getState().backendOwnedPackIds).toEqual([]);
  });

  it('empty response leaves backendOwnedPackIds empty', async () => {
    const emptyAdapter: BackendEntitlementsAdapter = {
      fetchOwnedPackIds: async () => [],
      requestCheckout: async (_p) => ({ ok: false as const, error: 'fail', errorVi: 'fail' }),
    };
    useDecorStore.getState().setBackendAdapter(emptyAdapter);
    await useDecorStore.getState().populateFromBackend();
    expect(useDecorStore.getState().backendOwnedPackIds).toEqual([]);
  });

  it('grants paid pack when backend adapter returns it', async () => {
    const grantAdapter: BackendEntitlementsAdapter = {
      fetchOwnedPackIds: async () => [PAID_PACK_ID],
      requestCheckout: async (_p) => ({ ok: false as const, error: 'fail', errorVi: 'fail' }),
    };
    useDecorStore.getState().setBackendAdapter(grantAdapter);
    await useDecorStore.getState().populateFromBackend();
    const { isPackOwned, canUseAsset } = useDecorStore.getState();
    expect(isPackOwned(PAID_PACK_ID)).toBe(true);
    expect(canUseAsset(PAID_ASSET_ID)).toBe(true);
  });

  it('does NOT grant free packs via backend (they are always owned)', async () => {
    // Even if backend returns free pack id, free packs must already be true
    const freePack = FREE_PACK_IDS[0];
    const adapter: BackendEntitlementsAdapter = {
      fetchOwnedPackIds: async () => [freePack],
      requestCheckout: async (_p) => ({ ok: false as const, error: 'fail', errorVi: 'fail' }),
    };
    useDecorStore.getState().setBackendAdapter(adapter);
    await useDecorStore.getState().populateFromBackend();
    // Free pack should not appear in backendOwnedPackIds (it's inherently free)
    const state = useDecorStore.getState();
    // Free packs are filtered out from backendOwnedPackIds (only paid packs tracked there)
    // but isPackOwned still returns true for them
    expect(state.isPackOwned(freePack)).toBe(true);
  });

  it('ignores unknown pack IDs returned by adapter', async () => {
    const adapter: BackendEntitlementsAdapter = {
      fetchOwnedPackIds: async () => ['pack-fake-injection' as any],
      requestCheckout: async (_p) => ({ ok: false as const, error: 'fail', errorVi: 'fail' }),
    };
    useDecorStore.getState().setBackendAdapter(adapter);
    await useDecorStore.getState().populateFromBackend();
    expect(useDecorStore.getState().backendOwnedPackIds).toEqual([]);
  });
});

describe('useDecorStore — getActiveSelection', () => {
  beforeEach(resetStore);

  it('returns null when no asset selected', () => {
    const { getActiveSelection } = useDecorStore.getState();
    expect(getActiveSelection()).toBeNull();
  });

  it('returns null when selected asset is unowned paid', () => {
    // Force selectedAssetId without going through selectAsset (bypass gate for test)
    useDecorStore.setState({ selectedAssetId: PAID_ASSET_ID });
    const { getActiveSelection } = useDecorStore.getState();
    expect(getActiveSelection()).toBeNull();
  });

  it('returns valid DecorSelection for owned free asset', () => {
    useDecorStore.getState().selectAsset(FREE_ASSET_ID);
    const selection = useDecorStore.getState().getActiveSelection();
    expect(selection).not.toBeNull();
    expect(selection?.assetId).toBe(FREE_ASSET_ID);
    expect(selection?.packId).toBe('pack-free-sample');
    expect(selection?.applyStyles).toBeDefined();
    expect(selection?.applyStyles.background).toContain('rgba');
    expect(selection?.swatchColor).toBe('#F9B8CC');
  });
});

describe('useDecorStore — getPacksWithOwnership', () => {
  beforeEach(resetStore);

  it('free packs are owned: true', () => {
    const packs = useDecorStore.getState().getPacksWithOwnership();
    const freePack = packs.find((p) => p.id === 'pack-free-sample');
    expect(freePack?.owned).toBe(true);
  });

  it('paid packs are owned: false without backend grant', () => {
    const packs = useDecorStore.getState().getPacksWithOwnership();
    const paidPack = packs.find((p) => p.id === PAID_PACK_ID);
    expect(paidPack?.owned).toBe(false);
  });
});
