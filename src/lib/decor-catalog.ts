/**
 * decor-catalog.ts — Decor Packs local catalog for FrogiNotes
 *
 * SCOPE: src/lib/decor-catalog.ts only.
 * No backend, no network. All assets are CSS/SVG variations.
 * Existing TapeStyle type is NOT extended here — see integration steps.
 */

export type DecorPackId = 'pack-free-sample' | 'pack-pastel-dream' | 'pack-forest-cozy';

export type DecorAssetType = 'tape-color' | 'tape-pattern';

/** CSS-ready styles for applying a decor asset to a tape element */
export interface DecorApplyStyles {
  background: string;
  borderTop: string;
  borderBottom: string;
  boxShadow: string;
  /** Optional repeating pattern (CSS background-image) */
  backgroundImage?: string;
  backgroundSize?: string;
}

export interface DecorAsset {
  id: string;
  packId: DecorPackId;
  type: DecorAssetType;
  label: string;
  labelVi: string;
  /** Hex swatch for color preview */
  swatchColor: string;
  /** CSS rgba for tape body */
  tapeColor: string;
  /** CSS rgba for tape border */
  tapeBorder: string;
  /** CSS box-shadow string */
  tapeShadow: string;
  /** Optional CSS background-image for pattern tapes */
  patternImage?: string;
  patternSize?: string;
}

export interface DecorPack {
  id: DecorPackId;
  name: string;
  nameVi: string;
  description: string;
  descriptionVi: string;
  priceUsdCents: number; // 0 = free
  /** Assets visible to ALL users (preview mode) */
  previewAssets: DecorAsset[];
  /** Assets only available when owned (same as previewAssets for free packs) */
  fullAssets: DecorAsset[];
  /** True for paid packs during MVP — checkout always unavailable */
  comingSoon: boolean;
}

/** What gets passed to onApply callback */
export interface DecorSelection {
  assetId: string;
  packId: DecorPackId;
  applyStyles: DecorApplyStyles;
  label: string;
  labelVi: string;
  swatchColor: string;
}

// ---------------------------------------------------------------------------
// Asset definitions
// ---------------------------------------------------------------------------

const sakuraTape: DecorAsset = {
  id: 'tape-sakura-pink',
  packId: 'pack-free-sample',
  type: 'tape-color',
  label: 'Sakura Pink',
  labelVi: 'Hồng Sakura',
  swatchColor: '#F9B8CC',
  tapeColor: 'rgba(249, 184, 204, 0.85)',
  tapeBorder: 'rgba(236, 112, 143, 0.40)',
  tapeShadow: '0 2px 6px rgba(236, 112, 143, 0.30)',
};

// Pastel Dream — preview only (paid)
const pastelLavenderPreview: DecorAsset = {
  id: 'tape-pastel-lavender',
  packId: 'pack-pastel-dream',
  type: 'tape-color',
  label: 'Lavender Dusk',
  labelVi: 'Tím Oải Hương',
  swatchColor: '#C4B5FD',
  tapeColor: 'rgba(196, 181, 253, 0.85)',
  tapeBorder: 'rgba(139, 92, 246, 0.40)',
  tapeShadow: '0 2px 6px rgba(139, 92, 246, 0.25)',
};

const pastelPeachPreview: DecorAsset = {
  id: 'tape-pastel-peach',
  packId: 'pack-pastel-dream',
  type: 'tape-color',
  label: 'Peach Blossom',
  labelVi: 'Đào Hồng',
  swatchColor: '#FDBA95',
  tapeColor: 'rgba(253, 186, 149, 0.85)',
  tapeBorder: 'rgba(249, 115, 22, 0.35)',
  tapeShadow: '0 2px 6px rgba(249, 115, 22, 0.20)',
};

const pastelSkyPreview: DecorAsset = {
  id: 'tape-pastel-sky',
  packId: 'pack-pastel-dream',
  type: 'tape-color',
  label: 'Sky Dream',
  labelVi: 'Xanh Bầu Trời',
  swatchColor: '#BAE6FD',
  tapeColor: 'rgba(186, 230, 253, 0.85)',
  tapeBorder: 'rgba(56, 189, 248, 0.40)',
  tapeShadow: '0 2px 6px rgba(56, 189, 248, 0.25)',
};

// Forest Cozy — preview only (paid)
const forestMossPreview: DecorAsset = {
  id: 'tape-forest-moss',
  packId: 'pack-forest-cozy',
  type: 'tape-color',
  label: 'Moss Velvet',
  labelVi: 'Rêu Xanh',
  swatchColor: '#86EFAC',
  tapeColor: 'rgba(134, 239, 172, 0.85)',
  tapeBorder: 'rgba(34, 197, 94, 0.40)',
  tapeShadow: '0 2px 6px rgba(34, 197, 94, 0.25)',
};

const forestBrownPreview: DecorAsset = {
  id: 'tape-forest-bark',
  packId: 'pack-forest-cozy',
  type: 'tape-color',
  label: 'Bark Amber',
  labelVi: 'Nâu Vỏ Cây',
  swatchColor: '#D4A574',
  tapeColor: 'rgba(212, 165, 116, 0.85)',
  tapeBorder: 'rgba(180, 120, 60, 0.40)',
  tapeShadow: '0 2px 6px rgba(180, 120, 60, 0.25)',
};

const forestPinePreview: DecorAsset = {
  id: 'tape-forest-pine',
  packId: 'pack-forest-cozy',
  type: 'tape-color',
  label: 'Pine Shadow',
  labelVi: 'Xanh Thông',
  swatchColor: '#6EE7B7',
  tapeColor: 'rgba(110, 231, 183, 0.85)',
  tapeBorder: 'rgba(16, 185, 129, 0.40)',
  tapeShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
};

// ---------------------------------------------------------------------------
// Full catalog
// ---------------------------------------------------------------------------

export const DECOR_CATALOG: DecorPack[] = [
  {
    id: 'pack-free-sample',
    name: 'Washi Sakura Sample',
    nameVi: 'Mẫu Washi Sakura',
    description: 'A free sakura pink washi tape — always included.',
    descriptionVi: 'Băng keo washi hồng sakura miễn phí — luôn có sẵn.',
    priceUsdCents: 0,
    previewAssets: [sakuraTape],
    fullAssets: [sakuraTape],
    comingSoon: false,
  },
  {
    id: 'pack-pastel-dream',
    name: 'Pastel Dream',
    nameVi: 'Giấc Mơ Pastel',
    description: 'Soft pastel tapes for a dreamy notebook feel.',
    descriptionVi: 'Băng keo pastel nhẹ nhàng, mang cảm giác cuốn sổ mộng mơ.',
    priceUsdCents: 299,
    previewAssets: [pastelLavenderPreview, pastelPeachPreview, pastelSkyPreview],
    fullAssets: [pastelLavenderPreview, pastelPeachPreview, pastelSkyPreview],
    comingSoon: true,
  },
  {
    id: 'pack-forest-cozy',
    name: 'Forest Cozy',
    nameVi: 'Rừng Ấm Áp',
    description: 'Earthy tones inspired by a cozy forest cabin.',
    descriptionVi: 'Gam màu đất gợi cảm giác căn cabin ấm cúng giữa rừng.',
    priceUsdCents: 299,
    previewAssets: [forestMossPreview, forestBrownPreview, forestPinePreview],
    fullAssets: [forestMossPreview, forestBrownPreview, forestPinePreview],
    comingSoon: true,
  },
];

/** IDs of all packs that are free (price = 0) */
export const FREE_PACK_IDS: DecorPackId[] = DECOR_CATALOG
  .filter((p) => p.priceUsdCents === 0)
  .map((p) => p.id);

/** Look up a DecorAsset by its id across all packs */
export function getDecorAssetById(id: string): DecorAsset | undefined {
  for (const pack of DECOR_CATALOG) {
    const found = pack.fullAssets.find((a) => a.id === id);
    if (found) return found;
  }
  return undefined;
}

/** Get the pack that owns a given asset id */
export function getPackForAsset(assetId: string): DecorPack | undefined {
  return DECOR_CATALOG.find((p) => p.fullAssets.some((a) => a.id === assetId));
}

/** Convert a DecorAsset into CSS-ready inline styles for a tape element */
export function getApplyStyles(asset: DecorAsset): DecorApplyStyles {
  const styles: DecorApplyStyles = {
    background: asset.tapeColor,
    borderTop: `1px solid ${asset.tapeBorder}`,
    borderBottom: `1px solid ${asset.tapeBorder}`,
    boxShadow: asset.tapeShadow,
  };
  if (asset.patternImage) {
    styles.backgroundImage = asset.patternImage;
    styles.backgroundSize = asset.patternSize ?? '8px 8px';
  }
  return styles;
}

/** Build a DecorSelection from an asset (requires ownership check before calling) */
export function buildDecorSelection(asset: DecorAsset): DecorSelection {
  return {
    assetId: asset.id,
    packId: asset.packId,
    applyStyles: getApplyStyles(asset),
    label: asset.label,
    labelVi: asset.labelVi,
    swatchColor: asset.swatchColor,
  };
}
