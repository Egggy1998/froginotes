/**
 * useDecorStore.ts — Zustand store for decor pack entitlements + selection
 *
 * SCOPE: src/stores/useDecorStore.ts only.
 * No edits to useNotesStore or shared types.
 *
 * Adapter boundary (fail-closed):
 *  - ownedPackIds is NEVER set from a local boolean trust
 *  - populateFromBackend() is the only way to grant ownership beyond free packs
 *  - Backend entitlements adapter not yet built — store operates offline-only
 *    with free packs auto-owned; paid packs always denied until backend wires in.
 */

import { create } from 'zustand';
import {
  DecorPackId,
  DecorAsset,
  DecorSelection,
  DECOR_CATALOG,
  FREE_PACK_IDS,
  getDecorAssetById,
  getPackForAsset,
  buildDecorSelection,
  DecorPack,
} from '../lib/decor-catalog';

// ---------------------------------------------------------------------------
// Persist selected asset ID to localStorage (selection only, NOT ownership)
// ---------------------------------------------------------------------------
const SELECTED_ASSET_STORAGE_KEY = 'froginotes_decor_selected_asset_v1';

function getInitialSelectedAssetId(): string | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem(SELECTED_ASSET_STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Backend entitlements adapter interface
// ---------------------------------------------------------------------------

/**
 * BackendEntitlementsAdapter — fill this when the Worker is live.
 *
 * Integration steps for next frontend worker:
 * 1. Create src/lib/api-client.ts with typed fetch wrapper for /api/decor/packs
 * 2. Implement the adapter:
 *      const adapter: BackendEntitlementsAdapter = {
 *        fetchOwnedPackIds: async () => {
 *          const res = await apiFetch('/api/decor/packs', { credentials: 'include' });
 *          if (!res.ok) return []; // fail closed
 *          const data = await res.json();
 *          return data.packs.filter((p: any) => p.owned).map((p: any) => p.id as DecorPackId);
 *        },
 *        requestCheckout: async (_packId) => ({
 *          ok: false,
 *          errorVi: 'Thanh toán chưa khả dụng. Vui lòng thử lại sau.',
 *          error: 'Payment unavailable. Please try again later.',
 *        }),
 *      };
 * 3. Call useDecorStore.getState().setBackendAdapter(adapter)
 *    then useDecorStore.getState().populateFromBackend()
 *    — e.g. in a useEffect in App.tsx after auth resolves.
 * 4. Do NOT trust any local boolean for purchase state.
 */
export interface BackendEntitlementsAdapter {
  /**
   * Returns array of owned pack IDs from the backend.
   * Must fail closed (return [] on any error/network failure).
   */
  fetchOwnedPackIds: () => Promise<DecorPackId[]>;
  /**
   * Request purchase. Backend will return 503 until payment is configured.
   * NEVER returns ok:true until real payment is processed server-side.
   */
  requestCheckout: (packId: DecorPackId) => Promise<{
    ok: false;
    error: string;
    errorVi: string;
  }>;
}

/** Null adapter — all paid packs denied, free packs always owned */
const NULL_ADAPTER: BackendEntitlementsAdapter = {
  fetchOwnedPackIds: async () => [],
  requestCheckout: async (_packId) => ({
    ok: false as const,
    error: 'Payment unavailable. Backend not yet configured.',
    errorVi: 'Thanh toán chưa khả dụng. Vui lòng thử lại sau.',
  }),
};

// ---------------------------------------------------------------------------
// Store types
// ---------------------------------------------------------------------------

export type CheckoutResult =
  | { ok: false; error: string; errorVi: string }
  | { ok: never }; // purchase success is NOT a valid local result in MVP

interface DecorState {
  /** IDs of packs the user has been granted by the backend (excludes free which are always auto-owned) */
  backendOwnedPackIds: DecorPackId[];
  /** True while fetchOwnedPackIds is in flight */
  isSyncing: boolean;
  /** The asset ID the user has selected (persisted to localStorage) */
  selectedAssetId: string | null;
  /** The adapter wired in by the next frontend worker (null = null adapter) */
  _adapter: BackendEntitlementsAdapter;
  /** Whether backend adapter is wired */
  backendConnected: boolean;
  /** Last checkout error, cleared on next attempt */
  lastCheckoutError: { error: string; errorVi: string } | null;
  /** Controls DecorPackModal visibility */
  showDecorModal: boolean;

  // --- Derived selectors ---
  /** Returns true if the user owns this pack (free packs always true, paid packs only if backend says so) */
  isPackOwned: (packId: DecorPackId) => boolean;
  /** Returns true if a specific asset can be applied */
  canUseAsset: (assetId: string) => boolean;
  /** Get apply styles for selected asset, or null if none/unowned */
  getActiveSelection: () => DecorSelection | null;
  /** Get all packs with ownership state filled */
  getPacksWithOwnership: () => Array<DecorPack & { owned: boolean }>;

  // --- Actions ---
  /** Wire in the backend adapter — call once after auth resolves */
  setBackendAdapter: (adapter: BackendEntitlementsAdapter) => void;
  /** Fetch owned pack IDs from backend adapter, fail closed */
  populateFromBackend: () => Promise<void>;
  /** Select an asset by ID. Rejects if unowned. Returns true on success. */
  selectAsset: (assetId: string) => boolean;
  /** Clear selected asset */
  clearSelection: () => void;
  /** Attempt to purchase a pack — always fails with payment unavailable in MVP */
  requestCheckout: (packId: DecorPackId) => Promise<CheckoutResult>;
  /** Clear last checkout error */
  clearCheckoutError: () => void;
  setShowDecorModal: (show: boolean) => void;
}

// ---------------------------------------------------------------------------
// Store implementation
// ---------------------------------------------------------------------------

export const useDecorStore = create<DecorState>((set, get) => ({
  backendOwnedPackIds: [],
  isSyncing: false,
  selectedAssetId: getInitialSelectedAssetId(),
  _adapter: NULL_ADAPTER,
  backendConnected: false,
  lastCheckoutError: null,
  showDecorModal: false,

  // Derived selectors
  isPackOwned: (packId) => {
    // Free packs are always owned
    if (FREE_PACK_IDS.includes(packId)) return true;
    // Paid packs: only if backend granted
    return get().backendOwnedPackIds.includes(packId);
  },

  canUseAsset: (assetId) => {
    const pack = getPackForAsset(assetId);
    if (!pack) return false;
    return get().isPackOwned(pack.id);
  },

  getActiveSelection: () => {
    const { selectedAssetId, canUseAsset } = get();
    if (!selectedAssetId) return null;
    if (!canUseAsset(selectedAssetId)) return null;
    const asset = getDecorAssetById(selectedAssetId);
    if (!asset) return null;
    return buildDecorSelection(asset);
  },

  getPacksWithOwnership: () => {
    const { isPackOwned } = get();
    return DECOR_CATALOG.map((pack) => ({
      ...pack,
      owned: isPackOwned(pack.id),
    }));
  },

  // Actions
  setBackendAdapter: (adapter) => {
    set({ _adapter: adapter, backendConnected: true });
  },

  populateFromBackend: async () => {
    set({ isSyncing: true });
    try {
      const ids = await get()._adapter.fetchOwnedPackIds();
      // Filter to only valid pack IDs — never trust arbitrary strings
      const validIds = ids.filter((id) =>
        DECOR_CATALOG.some((p) => p.id === id && p.priceUsdCents > 0)
      );
      set({ backendOwnedPackIds: validIds, isSyncing: false });
    } catch {
      // Fail closed: no new entitlements on error
      set({ backendOwnedPackIds: [], isSyncing: false });
    }
  },

  selectAsset: (assetId: string) => {
    const { canUseAsset } = get();
    if (!canUseAsset(assetId)) {
      console.warn('[decor] selectAsset rejected: asset not owned', assetId);
      return false;
    }
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(SELECTED_ASSET_STORAGE_KEY, assetId);
      } catch {
        // ignore storage errors
      }
    }
    set({ selectedAssetId: assetId });
    return true;
  },

  clearSelection: () => {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(SELECTED_ASSET_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    set({ selectedAssetId: null });
  },

  requestCheckout: async (packId) => {
    set({ lastCheckoutError: null });
    // Fail closed: never trust local state for purchase
    const result = await get()._adapter.requestCheckout(packId);
    set({ lastCheckoutError: { error: result.error, errorVi: result.errorVi } });
    return result;
  },

  clearCheckoutError: () => set({ lastCheckoutError: null }),
  setShowDecorModal: (show) => set({ showDecorModal: show }),
}));

// ---------------------------------------------------------------------------
// Convenience selectors for components
// ---------------------------------------------------------------------------

/** Returns the asset selected, if user owns it */
export function useActiveDecorAsset(): DecorAsset | null {
  const { selectedAssetId, canUseAsset } = useDecorStore();
  if (!selectedAssetId || !canUseAsset(selectedAssetId)) return null;
  return getDecorAssetById(selectedAssetId) ?? null;
}
