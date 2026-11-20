export type Demographic = 'Medical' | 'Caregiver' | 'Little' | 'Middle';
export type GameMode = 'Cozy' | 'Standard' | 'RetailMogul' | 'Sandbox';
export type ItemSize = 'OneSize' | 'S' | 'M' | 'L';
export type PackFormat = 'VarietyPack' | 'BulkCase';
export type ChassisType = 'TabbedDiaper' | 'PullUpPant' | 'Onesie' | 'Pacifier' | 'Plushie' | 'Accessory';
export type PriceToleranceMode = 'Normal' | 'Forgiving' | 'Strict' | 'AlwaysBuy';

export interface SandboxSettings {
  startingCash: number;
  infiniteCash: boolean;
  overheadMultiplier: number;
  xpMultiplier: number;
  customerSpawnMultiplier: number;
  unlockAllContent: boolean;
  enableRandomEvents: boolean;
  priceTolerance: PriceToleranceMode;
}

export interface ProductSKU {
  skuId: string;
  displayName: string;
  catalogId: Demographic;
  chassis: ChassisType;
  size: ItemSize;
  format: PackFormat;
  wholesaleCost: number;
  suggestedRetailPrice: number;
  currentRetailPrice: number;
  isClearance: boolean;
  absorbencyLevel: number; // 1-10
  plushnessLevel: number;  // 1-10
  demographicAppeal: Record<Demographic, number>;
  isCustomBrand?: boolean;
  customSpec?: CustomDesignSpec;
}

export interface CustomDesignSpec {
  chassis: ChassisType;
  finish: 'GlossyPlastic' | 'MatteCloth';
  primaryColorHex: string;
  trimColorHex: string;
  printPattern: 'None' | 'PastelBears' | 'StarryNight' | 'RetroArcade' | 'RacingStripes' | 'ClinicalIndicator';
  packagingColorHex: string;
}

export type RoomThemeId = 'StarterCozyLinen' | 'ClinicalClean' | 'PastelNursery' | 'RetroArcadeLounge';

export interface RoomThemePack {
  id: RoomThemeId;
  name: string;
  subtitle: string;
  bonusLabel: string;
  affinityDemographic?: Demographic;
  affinityBonus: number;
  costCC: number;
  unlockStarRating: number;
  floorHex: string;
  floorAltHex: string;
  wallHex: string;
  trimHex: string;
  accentHex: string;
  rugHex: string;
}

export type FixtureTypeId =
  | 'StandardShelf'
  | 'EndCapDisplay'
  | 'CheckoutCounter'
  | 'PackingBench'
  | 'StockroomRack';

export interface TileCoord {
  x: number;
  z: number;
}

export interface FixtureDefinition {
  typeId: FixtureTypeId;
  name: string;
  description: string;
  costCC: number;
  unlockStarRating: number;
  /** Footprint width in tiles (along X when rotation = 0) */
  widthTiles: number;
  /** Footprint depth in tiles (along Z when rotation = 0) */
  depthTiles: number;
  /** Relative clearance / queue / worker tiles in local unrotated coordinates (0,0 is top-left of footprint) */
  clearanceOffsets: { dx: number; dz: number; role: 'interaction' | 'queue' | 'worker' }[];
  slotCapacity: number;
  accentColor: string;
}

export interface PlacedFixture {
  id: string;
  typeId: FixtureTypeId;
  tileX: number;
  tileZ: number;
  /** Rotation in 90-degree steps: 0, 1 (90°), 2 (180°), 3 (270°) */
  rotation: 0 | 1 | 2 | 3;
  stockedItemCount: number;
  assignedSkuId?: string;
}

export interface DeliveryCaseBox {
  id: string;
  skuId: string;
  unitsRemaining: number;
  maxUnits: number;
  /** Pallet slot index (0..3) in the exterior Delivery Bay */
  baySlotIndex: number;
}

export interface FloatingFeedbackBadge {
  id: string;
  text: string;
  worldPos: [number, number, number];
  createdAt: number;
}

export type PendingAvatarAction =
  | { type: 'none' }
  | { type: 'pickupDeliveryBox'; boxId: string }
  | { type: 'stockFixture'; fixtureId: string }
  | { type: 'openCheckout' }
  | { type: 'openPacking' };

export type TutorialStepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface TutorialState {
  isActive: boolean;
  isCompleted: boolean;
  currentStep: TutorialStepNumber;
  casesOrderedInTutorial: number;
}

export type ActiveModalType =
  | 'none'
  | 'tablet'
  | 'checkout'
  | 'packing'
  | 'eod'
  | 'sandbox'
  | 'settings'
  | 'newGame';

export type TabletTabType =
  | 'dashboard'
  | 'wholesale'
  | 'inventory'
  | 'build'
  | 'grants'
  | 'studio';

export interface PlacementValidationResult {
  valid: boolean;
  reason?: string;
  footprintTiles: TileCoord[];
  clearanceTiles: { x: number; z: number; role: 'interaction' | 'queue' | 'worker' }[];
  pathConnected: boolean;
}
