import { create } from 'zustand';
import {
  DEFAULT_SANDBOX_SETTINGS,
  FIXTURE_DEFINITIONS,
  GAME_MODE_PRESETS,
  ROOM_THEMES,
  STARTER_PRODUCTS,
} from '../constants/gameData';
import {
  ActiveModalType,
  Demographic,
  FixtureTypeId,
  GameMode,
  PlacedFixture,
  ProductSKU,
  RoomThemeId,
  SandboxSettings,
  TabletTabType,
  TileCoord,
} from '../types/game';
import { GRID_SIZE, validateFixturePlacement } from '../utils/gridValidator';

export interface GameState {
  // Game Mode & Onboarding
  hasStartedGame: boolean;
  gameMode: GameMode;
  sandboxSettings: SandboxSettings;
  primaryDemographic: Demographic;

  // Economy & Store Stats
  crinkleCoins: number;
  starRating: number;
  reputationXP: number;
  dayNumber: number;
  timeString: string;
  isStoreOpen: boolean;

  // Room & Isometric Camera
  gridSize: number;
  activeThemeId: RoomThemeId;
  unlockedThemes: RoomThemeId[];
  /** Camera rotation index: 0 = 45°, 1 = 135°, 2 = 225°, 3 = 315° */
  cameraRotationIndex: 0 | 1 | 2 | 3;
  cameraZoom: number;

  // 1-Tile Grid Placement & Build Mode
  isBuildMode: boolean;
  selectedBuildFixture: FixtureTypeId;
  buildRotation: 0 | 1 | 2 | 3;
  hoveredTile: TileCoord | null;
  placedFixtures: PlacedFixture[];
  selectedFixtureId: string | null;

  // Avatar & Products
  avatarTile: TileCoord;
  products: ProductSKU[];

  // Single-Active-Modal State Machine & Responsive Tablet Drawer
  activeModal: ActiveModalType;
  activeTabletTab: TabletTabType;
  isUnfoldedTabletOpen: boolean;
  toastMessage: string | null;

  // Actions
  startNewGame: (mode: GameMode, demographic: Demographic, customSandbox?: SandboxSettings) => void;
  setActiveModal: (modal: ActiveModalType) => void;
  setActiveTabletTab: (tab: TabletTabType) => void;
  toggleUnfoldedTablet: () => void;
  rotateCamera90: () => void;
  setCameraZoom: (zoom: number) => void;

  // Build & Decor Actions
  setBuildMode: (enabled: boolean, fixtureType?: FixtureTypeId) => void;
  setSelectedBuildFixture: (fixtureType: FixtureTypeId) => void;
  rotateBuildGhost: () => void;
  setHoveredTile: (tile: TileCoord | null) => void;
  placeFixtureAt: (tileX: number, tileZ: number) => boolean;
  removeFixture: (fixtureId: string) => void;
  selectFixture: (fixtureId: string | null) => void;
  applyRoomTheme: (themeId: RoomThemeId) => void;

  // Product Pricing & Sandbox Actions
  adjustProductPrice: (skuId: string, deltaCC: number) => void;
  toggleProductClearance: (skuId: string) => void;
  updateSandboxSettings: (partial: Partial<SandboxSettings>) => void;
  toggleStoreOpen: () => void;
  moveAvatarTo: (tile: TileCoord) => void;
  showToast: (msg: string) => void;
}

const INITIAL_FIXTURES: PlacedFixture[] = [
  {
    id: 'starter-checkout-1',
    typeId: 'CheckoutCounter',
    tileX: 2,
    tileZ: 7,
    rotation: 0,
    stockedItemCount: 0,
  },
  {
    id: 'starter-shelf-1',
    typeId: 'StandardShelf',
    tileX: 2,
    tileZ: 2,
    rotation: 0,
    stockedItemCount: 6,
    assignedSkuId: 'med-cloud-brief-m',
  },
  {
    id: 'starter-shelf-2',
    typeId: 'StandardShelf',
    tileX: 6,
    tileZ: 2,
    rotation: 0,
    stockedItemCount: 6,
    assignedSkuId: 'lit-pastel-bears-l',
  },
  {
    id: 'starter-endcap-1',
    typeId: 'EndCapDisplay',
    tileX: 9,
    tileZ: 3,
    rotation: 0,
    stockedItemCount: 4,
    assignedSkuId: 'lit-bunny-plush',
  },
];

export const useGameStore = create<GameState>((set, get) => ({
  hasStartedGame: false,
  gameMode: 'Standard',
  sandboxSettings: { ...DEFAULT_SANDBOX_SETTINGS },
  primaryDemographic: 'Little',

  crinkleCoins: 3000,
  starRating: 1.0,
  reputationXP: 120,
  dayNumber: 1,
  timeString: '09:30',
  isStoreOpen: false,

  gridSize: GRID_SIZE,
  activeThemeId: 'StarterCozyLinen',
  unlockedThemes: ['StarterCozyLinen'],
  cameraRotationIndex: 0,
  cameraZoom: 1.15,

  isBuildMode: false,
  selectedBuildFixture: 'StandardShelf',
  buildRotation: 0,
  hoveredTile: { x: 6, z: 6 },
  placedFixtures: INITIAL_FIXTURES,
  selectedFixtureId: null,

  avatarTile: { x: 5, z: 9 },
  products: STARTER_PRODUCTS,

  // Start on the New Game Mode Selection modal for Milestone 1
  activeModal: 'newGame',
  activeTabletTab: 'dashboard',
  isUnfoldedTabletOpen: true,
  toastMessage: null,

  startNewGame: (mode, demographic, customSandbox) => {
    const sb = customSandbox ? { ...customSandbox } : { ...get().sandboxSettings };
    const startingCash =
      mode === 'Sandbox'
        ? sb.startingCash
        : GAME_MODE_PRESETS[mode].startingCash;

    const unlockedThemes: RoomThemeId[] =
      mode === 'Sandbox' && sb.unlockAllContent
        ? ['StarterCozyLinen', 'ClinicalClean', 'PastelNursery', 'RetroArcadeLounge']
        : ['StarterCozyLinen'];

    set({
      hasStartedGame: true,
      gameMode: mode,
      primaryDemographic: demographic,
      sandboxSettings: sb,
      crinkleCoins: startingCash,
      starRating: mode === 'Sandbox' && sb.unlockAllContent ? 4.5 : 1.0,
      unlockedThemes,
      activeModal: 'none',
      isBuildMode: false,
      toastMessage: `Welcome to Fluff & Fold! Started ${mode} Mode (${demographic} Specialty).`,
    });
  },

  setActiveModal: (modal) => {
    // Single-Active-Modal State Machine: opening any modal closes others
    set((state) => ({
      activeModal: state.activeModal === modal ? 'none' : modal,
      isBuildMode: modal !== 'none' ? false : state.isBuildMode,
    }));
  },

  setActiveTabletTab: (tab) => {
    set({ activeTabletTab: tab });
  },

  toggleUnfoldedTablet: () => {
    set((state) => ({ isUnfoldedTabletOpen: !state.isUnfoldedTabletOpen }));
  },

  rotateCamera90: () => {
    set((state) => ({
      cameraRotationIndex: ((state.cameraRotationIndex + 1) % 4) as 0 | 1 | 2 | 3,
    }));
  },

  setCameraZoom: (zoom) => {
    const clamped = Math.max(0.6, Math.min(2.2, Number(zoom.toFixed(2))));
    set({ cameraZoom: clamped });
  },

  setBuildMode: (enabled, fixtureType) => {
    set((state) => ({
      isBuildMode: enabled,
      selectedBuildFixture: fixtureType ?? state.selectedBuildFixture,
      activeModal: enabled ? 'none' : state.activeModal,
      selectedFixtureId: null,
    }));
  },

  setSelectedBuildFixture: (fixtureType) => {
    set({
      selectedBuildFixture: fixtureType,
      isBuildMode: true,
    });
  },

  rotateBuildGhost: () => {
    set((state) => ({
      buildRotation: ((state.buildRotation + 1) % 4) as 0 | 1 | 2 | 3,
    }));
  },

  setHoveredTile: (tile) => {
    const curr = get().hoveredTile;
    if (curr?.x === tile?.x && curr?.z === tile?.z) return;
    set({ hoveredTile: tile });
  },

  placeFixtureAt: (tileX, tileZ) => {
    const state = get();
    const def = FIXTURE_DEFINITIONS[state.selectedBuildFixture];
    const isFree = state.gameMode === 'Sandbox' && state.sandboxSettings.infiniteCash;

    if (!isFree && state.crinkleCoins < def.costCC) {
      get().showToast(`Need ${def.costCC} CC to place ${def.name}!`);
      return false;
    }

    const validation = validateFixturePlacement(
      state.selectedBuildFixture,
      tileX,
      tileZ,
      state.buildRotation,
      state.placedFixtures,
      state.gridSize
    );

    if (!validation.valid) {
      get().showToast(validation.reason || 'Invalid placement tile');
      return false;
    }

    const defaultSkuByType: Partial<Record<FixtureTypeId, string>> = {
      StandardShelf: 'care-bundle-wipes',
      EndCapDisplay: 'lit-bunny-plush',
      StockroomRack: 'med-cloud-brief-m',
    };

    const newFix: PlacedFixture = {
      id: `fix-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      typeId: state.selectedBuildFixture,
      tileX,
      tileZ,
      rotation: state.buildRotation,
      stockedItemCount: def.slotCapacity,
      assignedSkuId: defaultSkuByType[state.selectedBuildFixture],
    };

    set({
      placedFixtures: [...state.placedFixtures, newFix],
      crinkleCoins: isFree ? state.crinkleCoins : state.crinkleCoins - def.costCC,
      toastMessage: `Placed ${def.name} at tile (${tileX}, ${tileZ})!`,
    });
    return true;
  },

  removeFixture: (fixtureId) => {
    const state = get();
    const target = state.placedFixtures.find((f) => f.id === fixtureId);
    if (!target) return;

    if (
      target.typeId === 'CheckoutCounter' &&
      state.placedFixtures.filter((f) => f.typeId === 'CheckoutCounter').length <= 1
    ) {
      get().showToast('Shop requires at least one Cozy Register Counter!');
      return;
    }

    const def = FIXTURE_DEFINITIONS[target.typeId];
    const refund = Math.round(def.costCC * 0.75);
    const isFree = state.gameMode === 'Sandbox' && state.sandboxSettings.infiniteCash;

    set({
      placedFixtures: state.placedFixtures.filter((f) => f.id !== fixtureId),
      selectedFixtureId: state.selectedFixtureId === fixtureId ? null : state.selectedFixtureId,
      crinkleCoins: isFree ? state.crinkleCoins : state.crinkleCoins + refund,
      toastMessage: `Removed ${def.name} (+${refund} CC refund)`,
    });
  },

  selectFixture: (fixtureId) => {
    set({ selectedFixtureId: fixtureId });
  },

  applyRoomTheme: (themeId) => {
    const state = get();
    const pack = ROOM_THEMES[themeId];
    const alreadyUnlocked = state.unlockedThemes.includes(themeId);
    const isFree = state.gameMode === 'Sandbox' && state.sandboxSettings.infiniteCash;

    if (!alreadyUnlocked) {
      if (!isFree && state.crinkleCoins < pack.costCC) {
        get().showToast(`Need ${pack.costCC} CC to unlock ${pack.name}!`);
        return;
      }
      set({
        activeThemeId: themeId,
        unlockedThemes: [...state.unlockedThemes, themeId],
        crinkleCoins: isFree ? state.crinkleCoins : state.crinkleCoins - pack.costCC,
        toastMessage: `Unlocked & applied ${pack.name} Theme!`,
      });
    } else {
      set({
        activeThemeId: themeId,
        toastMessage: `Applied ${pack.name} Theme!`,
      });
    }
  },

  adjustProductPrice: (skuId, deltaCC) => {
    set((state) => ({
      products: state.products.map((p) => {
        if (p.skuId !== skuId) return p;
        const nextPrice = Math.max(5, Math.min(250, p.currentRetailPrice + deltaCC));
        return {
          ...p,
          currentRetailPrice: nextPrice,
          isClearance: nextPrice <= Math.round(p.suggestedRetailPrice * 0.85),
        };
      }),
    }));
  },

  toggleProductClearance: (skuId) => {
    set((state) => ({
      products: state.products.map((p) => {
        if (p.skuId !== skuId) return p;
        const nextClearance = !p.isClearance;
        return {
          ...p,
          isClearance: nextClearance,
          currentRetailPrice: nextClearance
            ? Math.round(p.suggestedRetailPrice * 0.8)
            : p.suggestedRetailPrice,
        };
      }),
    }));
  },

  updateSandboxSettings: (partial) => {
    set((state) => {
      const nextSb = { ...state.sandboxSettings, ...partial };
      return {
        sandboxSettings: nextSb,
        unlockedThemes: nextSb.unlockAllContent
          ? ['StarterCozyLinen', 'ClinicalClean', 'PastelNursery', 'RetroArcadeLounge']
          : state.unlockedThemes,
      };
    });
  },

  toggleStoreOpen: () => {
    set((state) => ({
      isStoreOpen: !state.isStoreOpen,
      toastMessage: !state.isStoreOpen
        ? 'Shop awning unfurled — Open for business!'
        : 'Shop paused at 09:30 setup mode.',
    }));
  },

  moveAvatarTo: (tile) => {
    set({ avatarTile: tile });
  },

  showToast: (msg) => {
    set({ toastMessage: msg });
  },
}));
