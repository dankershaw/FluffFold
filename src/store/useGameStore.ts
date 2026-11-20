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
  DeliveryCaseBox,
  Demographic,
  FixtureTypeId,
  FloatingFeedbackBadge,
  GameMode,
  PendingAvatarAction,
  PlacedFixture,
  ProductSKU,
  RoomThemeId,
  SandboxSettings,
  TabletTabType,
  TileCoord,
  TutorialState,
  TutorialStepNumber,
} from '../types/game';
import {
  DELIVERY_DOOR_TILE,
  findAStarPath,
  getFixtureTiles,
  GRID_SIZE,
  tileToWorld,
  validateFixturePlacement,
} from '../utils/gridValidator';

export interface GameState {
  // Game Mode & Onboarding
  hasStartedGame: boolean;
  gameMode: GameMode;
  sandboxSettings: SandboxSettings;
  primaryDemographic: Demographic;
  unlockedCatalogs: Demographic[];

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

  // Milestone 2: A* Tap-and-Go Avatar, Delivery Bay & Stocking Loop
  avatarTile: TileCoord;
  avatarPath: TileCoord[];
  pendingAvatarAction: PendingAvatarAction;
  carriedBox: DeliveryCaseBox | null;
  deliveryBayBoxes: DeliveryCaseBox[];
  floatingBadges: FloatingFeedbackBadge[];
  products: ProductSKU[];

  // Milestone 2: 8-Step Guided Interactive Tutorial
  tutorial: TutorialState;

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

  // Milestone 2: A* Pathfinding, Delivery Bay & Anchor-Slot Shelf Stocking
  dispatchAvatarToTile: (target: TileCoord, action?: PendingAvatarAction) => void;
  advanceAvatarStep: () => void;
  orderWholesaleCase: (skuId: string) => boolean;
  interactWithDeliveryBox: (boxId: string) => void;
  interactWithFixture: (fixtureId: string) => void;
  dropCarriedBoxToBay: () => void;
  spawnFloatingBadge: (text: string, worldPos: [number, number, number]) => void;
  clearExpiredBadges: () => void;

  // Milestone 2: Tutorial & Specialty License Actions
  selectStarterLicense: (demographic: Demographic) => void;
  advanceTutorialStep: (toStep?: TutorialStepNumber) => void;
  skipTutorial: () => void;
  replayTutorial: () => void;

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
    stockedItemCount: 2, // Partially open slots so player can immediately stock delivery cases!
    assignedSkuId: 'med-cloud-brief-m',
  },
  {
    id: 'starter-shelf-2',
    typeId: 'StandardShelf',
    tileX: 6,
    tileZ: 2,
    rotation: 0,
    stockedItemCount: 0, // Empty shelf ready for Day 1 tutorial stocking!
    assignedSkuId: 'lit-pastel-bears-l',
  },
  {
    id: 'starter-endcap-1',
    typeId: 'EndCapDisplay',
    tileX: 9,
    tileZ: 3,
    rotation: 0,
    stockedItemCount: 2,
    assignedSkuId: 'lit-bunny-plush',
  },
];

const INITIAL_DELIVERY_BOXES: DeliveryCaseBox[] = [
  {
    id: 'starter-box-1',
    skuId: 'lit-pastel-bears-l',
    unitsRemaining: 6,
    maxUnits: 6,
    baySlotIndex: 0,
  },
];

export const useGameStore = create<GameState>((set, get) => ({
  hasStartedGame: false,
  gameMode: 'Standard',
  sandboxSettings: { ...DEFAULT_SANDBOX_SETTINGS },
  primaryDemographic: 'Little',
  unlockedCatalogs: ['Little', 'Caregiver'],

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
  avatarPath: [],
  pendingAvatarAction: { type: 'none' },
  carriedBox: null,
  deliveryBayBoxes: INITIAL_DELIVERY_BOXES,
  floatingBadges: [],
  products: STARTER_PRODUCTS,

  tutorial: {
    isActive: true,
    isCompleted: false,
    currentStep: 1,
    casesOrderedInTutorial: 0,
  },

  // Start on the New Game Mode Selection modal
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

    const unlockedCatalogs: Demographic[] =
      mode === 'Sandbox' && sb.unlockAllContent
        ? ['Medical', 'Caregiver', 'Little', 'Middle']
        : [demographic, 'Caregiver'];

    // Pick default starter box matching chosen demographic
    const defaultSkuForDemo: Record<Demographic, string> = {
      Medical: 'med-cloud-brief-m',
      Caregiver: 'care-bundle-wipes',
      Little: 'lit-pastel-bears-l',
      Middle: 'mid-arcade-pullup-m',
    };

    set({
      hasStartedGame: true,
      gameMode: mode,
      primaryDemographic: demographic,
      unlockedCatalogs,
      sandboxSettings: sb,
      crinkleCoins: startingCash,
      starRating: mode === 'Sandbox' && sb.unlockAllContent ? 4.5 : 1.0,
      unlockedThemes,
      activeModal: 'none',
      isBuildMode: false,
      carriedBox: null,
      avatarTile: { x: 5, z: 9 },
      avatarPath: [],
      pendingAvatarAction: { type: 'none' },
      deliveryBayBoxes: [
        {
          id: `starter-box-${Date.now()}`,
          skuId: defaultSkuForDemo[demographic],
          unitsRemaining: 6,
          maxUnits: 6,
          baySlotIndex: 0,
        },
      ],
      tutorial: {
        isActive: true,
        isCompleted: false,
        currentStep: 2, // Step 1 (Choose Specialty) completed in setup or can be changed in Tablet; start on Step 2 (Order First Stock)
        casesOrderedInTutorial: 0,
      },
      activeTabletTab: 'wholesale',
      toastMessage: `Welcome to Fluff & Fold! Started ${mode} Mode (${demographic} Specialty).`,
    });
  },

  setActiveModal: (modal) => {
    set((state) => ({
      activeModal: state.activeModal === modal ? 'none' : modal,
      isBuildMode: modal !== 'none' ? false : state.isBuildMode,
    }));
  },

  setActiveTabletTab: (tab) => {
    const state = get();
    let nextTutorial = state.tutorial;
    if (state.tutorial.isActive && state.tutorial.currentStep === 1 && tab === 'wholesale') {
      nextTutorial = { ...state.tutorial, currentStep: 2 };
    }
    set({ activeTabletTab: tab, tutorial: nextTutorial });
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

    const newFix: PlacedFixture = {
      id: `fix-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      typeId: state.selectedBuildFixture,
      tileX,
      tileZ,
      rotation: state.buildRotation,
      stockedItemCount: 0,
      assignedSkuId: undefined,
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

  // ================= MILESTONE 2: A* TAP-AND-GO AVATAR & STOCKING LOOP =================

  dispatchAvatarToTile: (target, action = { type: 'none' }) => {
    const state = get();
    const path = findAStarPath(state.avatarTile, target, state.placedFixtures, state.gridSize);

    if (path.length === 0 && state.avatarTile.x === target.x && state.avatarTile.z === target.z) {
      // Already standing on target tile -> execute context action immediately!
      set({ avatarPath: [], pendingAvatarAction: action });
      get().advanceAvatarStep();
      return;
    }

    if (path.length === 0) {
      get().showToast('No walkable A* path to that tile!');
      return;
    }

    set({
      avatarPath: path,
      pendingAvatarAction: action,
    });
  },

  advanceAvatarStep: () => {
    const state = get();

    // If there are remaining tiles in the A* path, step to the next tile
    if (state.avatarPath.length > 0) {
      const [nextTile, ...restPath] = state.avatarPath;
      set({
        avatarTile: nextTile,
        avatarPath: restPath,
      });
      if (restPath.length > 0) return;
    }

    // Reached destination tile! Re-read fresh state and execute any pending context action
    const current = get();
    const action = current.pendingAvatarAction;
    if (action.type === 'none') return;

    set({ pendingAvatarAction: { type: 'none' } });

    if (action.type === 'pickupDeliveryBox') {
      const box = state.deliveryBayBoxes.find((b) => b.id === action.boxId);
      if (!box) return;

      const sku = state.products.find((p) => p.skuId === box.skuId);
      // If currently carrying another box, swap it back onto the pallet
      const remainingBoxes = state.deliveryBayBoxes.filter((b) => b.id !== box.id);
      if (state.carriedBox) {
        remainingBoxes.push({ ...state.carriedBox, baySlotIndex: box.baySlotIndex });
      }

      const nextTutorial =
        state.tutorial.isActive && state.tutorial.currentStep <= 3
          ? { ...state.tutorial, currentStep: 4 as TutorialStepNumber }
          : state.tutorial;

      set({
        carriedBox: box,
        deliveryBayBoxes: remainingBoxes,
        tutorial: nextTutorial,
        toastMessage: `Picked up ${sku?.displayName ?? 'Wholesale Case'} (${box.unitsRemaining} units) — Tap any highlighted green shelf to stock!`,
      });
      get().spawnFloatingBadge('Picked Up Case!', [3.1, 1.4, 1.25]);
      return;
    }

    if (action.type === 'stockFixture') {
      const fixture = state.placedFixtures.find((f) => f.id === action.fixtureId);
      const box = state.carriedBox;
      if (!fixture || !box) return;

      const def = FIXTURE_DEFINITIONS[fixture.typeId];
      if (def.slotCapacity <= 0) {
        get().showToast(`${def.name} cannot hold product packs.`);
        return;
      }

      const openSlots = def.slotCapacity - fixture.stockedItemCount;
      // Compatibility check: shelf is either empty, already holds this SKU, or we overwrite if empty
      const isCompatibleSku =
        fixture.stockedItemCount === 0 ||
        !fixture.assignedSkuId ||
        fixture.assignedSkuId === box.skuId;

      if (!isCompatibleSku) {
        const currentSku = state.products.find((p) => p.skuId === fixture.assignedSkuId);
        get().showToast(
          `This shelf is stocked with ${currentSku?.displayName ?? 'another SKU'}. Choose an empty or matching shelf!`
        );
        return;
      }

      if (openSlots <= 0) {
        get().showToast(`${def.name} is already full (${def.slotCapacity}/${def.slotCapacity} slots)!`);
        return;
      }

      const unitsToStock = Math.min(openSlots, box.unitsRemaining);
      const remainingInBox = box.unitsRemaining - unitsToStock;
      const sku = state.products.find((p) => p.skuId === box.skuId);

      const { width, depth } = getFixtureTiles(
        fixture.typeId,
        fixture.tileX,
        fixture.tileZ,
        fixture.rotation
      );
      const [wx, , wz] = tileToWorld(fixture.tileX, fixture.tileZ, width, depth);

      // Spawn floating +1 feedback badges
      for (let i = 0; i < unitsToStock; i++) {
        setTimeout(() => {
          useGameStore
            .getState()
            .spawnFloatingBadge(`+1 ${sku?.displayName.split(' ')[0] ?? 'Stock'}`, [
              wx + (i % 2 === 0 ? -0.14 : 0.14),
              1.25 + i * 0.14,
              wz,
            ]);
        }, i * 110);
      }

      const nextFixtures = state.placedFixtures.map((f) =>
        f.id === fixture.id
          ? {
              ...f,
              assignedSkuId: box.skuId,
              stockedItemCount: f.stockedItemCount + unitsToStock,
            }
          : f
      );

      const nextTutorial =
        state.tutorial.isActive && state.tutorial.currentStep === 4
          ? { ...state.tutorial, currentStep: 5 as TutorialStepNumber }
          : state.tutorial;

      set({
        placedFixtures: nextFixtures,
        carriedBox:
          remainingInBox > 0 ? { ...box, unitsRemaining: remainingInBox } : null,
        tutorial: nextTutorial,
        reputationXP: state.reputationXP + unitsToStock * 4,
        toastMessage:
          remainingInBox > 0
            ? `Stocked +${unitsToStock} ${sku?.displayName}! (${remainingInBox} left in box)`
            : `Stocked +${unitsToStock} ${sku?.displayName}! Empty carton recycled.`,
      });
      return;
    }

    if (action.type === 'openCheckout') {
      const nextTutorial =
        state.tutorial.isActive && state.tutorial.currentStep === 7
          ? { ...state.tutorial, currentStep: 8 as TutorialStepNumber }
          : state.tutorial;
      set({
        activeModal: 'checkout',
        tutorial: nextTutorial,
      });
      return;
    }

    if (action.type === 'openPacking') {
      set({ activeModal: 'packing' });
    }
  },

  orderWholesaleCase: (skuId) => {
    const state = get();
    const sku = state.products.find((p) => p.skuId === skuId);
    if (!sku) return false;

    if (state.deliveryBayBoxes.length >= 4) {
      get().showToast('Delivery Bay pallet is full (max 4 cases)! Pick up and stock a case first.');
      return false;
    }

    const caseCost = sku.wholesaleCost * 6;
    const isFree = state.gameMode === 'Sandbox' && state.sandboxSettings.infiniteCash;
    if (!isFree && state.crinkleCoins < caseCost) {
      get().showToast(`Need ${caseCost} CC to order a 6-pack case of ${sku.displayName}!`);
      return false;
    }

    // Find first open pallet slot 0..3
    const usedSlots = new Set(state.deliveryBayBoxes.map((b) => b.baySlotIndex));
    let slotIdx = 0;
    while (usedSlots.has(slotIdx) && slotIdx < 4) slotIdx++;

    const newBox: DeliveryCaseBox = {
      id: `box-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      skuId,
      unitsRemaining: 6,
      maxUnits: 6,
      baySlotIndex: slotIdx,
    };

    const nextOrderedCount = state.tutorial.casesOrderedInTutorial + 1;
    let nextStep = state.tutorial.currentStep;
    if (state.tutorial.isActive && state.tutorial.currentStep <= 2 && nextOrderedCount >= 2) {
      nextStep = 3;
    }

    set({
      crinkleCoins: isFree ? state.crinkleCoins : state.crinkleCoins - caseCost,
      deliveryBayBoxes: [...state.deliveryBayBoxes, newBox],
      tutorial: {
        ...state.tutorial,
        casesOrderedInTutorial: nextOrderedCount,
        currentStep: nextStep,
      },
      toastMessage: `Delivered 6-pack case of ${sku.displayName} to Exterior Delivery Bay!`,
    });

    get().spawnFloatingBadge(`-${caseCost} CC (Case Delivered)`, [3.78, 1.1, 1.35]);
    return true;
  },

  interactWithDeliveryBox: (boxId) => {
    const state = get();
    if (state.isBuildMode) return;
    // Dispatch shopkeeper avatar via A* to the East Delivery Doorway tile (11, 8) and chain pickupDeliveryBox
    get().dispatchAvatarToTile(DELIVERY_DOOR_TILE, {
      type: 'pickupDeliveryBox',
      boxId,
    });
  },

  interactWithFixture: (fixtureId) => {
    const state = get();
    if (state.isBuildMode) return;

    const fixture = state.placedFixtures.find((f) => f.id === fixtureId);
    if (!fixture) return;

    const { clearanceTiles } = getFixtureTiles(
      fixture.typeId,
      fixture.tileX,
      fixture.tileZ,
      fixture.rotation
    );
    const targetTile =
      clearanceTiles.length > 0
        ? { x: clearanceTiles[0].x, z: clearanceTiles[0].z }
        : { x: fixture.tileX, z: fixture.tileZ };

    // Context Action Chaining:
    // 1. If carrying a box and tapping a shelf/endcap/rack -> walk to interaction tile & stock slots!
    const def = FIXTURE_DEFINITIONS[fixture.typeId];
    if (state.carriedBox && def.slotCapacity > 0) {
      get().dispatchAvatarToTile(targetTile, {
        type: 'stockFixture',
        fixtureId: fixture.id,
      });
      return;
    }

    // 2. If tapping Checkout Counter -> walk behind till & open Checkout Register Drawer Modal
    if (fixture.typeId === 'CheckoutCounter') {
      const cashierTile =
        clearanceTiles.find((c) => c.role === 'worker') ?? targetTile;
      get().dispatchAvatarToTile(
        { x: cashierTile.x, z: cashierTile.z },
        { type: 'openCheckout' }
      );
      return;
    }

    // 3. If tapping Packing Bench -> walk to worker tile & open Mail Order Packing Modal
    if (fixture.typeId === 'PackingBench') {
      get().dispatchAvatarToTile(targetTile, { type: 'openPacking' });
      return;
    }

    // Otherwise select fixture and walk over to inspect it
    set({
      selectedFixtureId: state.selectedFixtureId === fixture.id ? null : fixture.id,
    });
    get().dispatchAvatarToTile(targetTile, { type: 'none' });
  },

  dropCarriedBoxToBay: () => {
    const state = get();
    if (!state.carriedBox) return;
    if (state.deliveryBayBoxes.length >= 4) {
      get().showToast('Delivery Bay pallet has 4 cases already!');
      return;
    }
    const usedSlots = new Set(state.deliveryBayBoxes.map((b) => b.baySlotIndex));
    let slotIdx = 0;
    while (usedSlots.has(slotIdx) && slotIdx < 4) slotIdx++;

    set({
      deliveryBayBoxes: [
        ...state.deliveryBayBoxes,
        { ...state.carriedBox, baySlotIndex: slotIdx },
      ],
      carriedBox: null,
      toastMessage: 'Returned carried box to Exterior Delivery Bay pallet.',
    });
  },

  spawnFloatingBadge: (text, worldPos) => {
    const badge: FloatingFeedbackBadge = {
      id: `badge-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text,
      worldPos,
      createdAt: Date.now(),
    };
    set((state) => ({
      floatingBadges: [...state.floatingBadges, badge],
    }));
  },

  clearExpiredBadges: () => {
    const now = Date.now();
    set((state) => {
      if (state.floatingBadges.length === 0) return state;
      const active = state.floatingBadges.filter((b) => now - b.createdAt < 1800);
      if (active.length === state.floatingBadges.length) return state;
      return { floatingBadges: active };
    });
  },

  // ================= MILESTONE 2: 8-STEP INTERACTIVE TUTORIAL =================

  selectStarterLicense: (demographic) => {
    const state = get();
    const unlocked = Array.from(new Set([...state.unlockedCatalogs, demographic]));
    const nextStep =
      state.tutorial.isActive && state.tutorial.currentStep === 1
        ? (2 as TutorialStepNumber)
        : state.tutorial.currentStep;

    set({
      primaryDemographic: demographic,
      unlockedCatalogs: unlocked,
      tutorial: {
        ...state.tutorial,
        currentStep: nextStep,
      },
      activeTabletTab: 'wholesale',
      toastMessage: `Activated ${demographic} Wholesale Specialty License!`,
    });
  },

  advanceTutorialStep: (toStep) => {
    set((state) => {
      const nextNum = toStep ?? ((state.tutorial.currentStep + 1) as TutorialStepNumber);
      if (nextNum > 8) {
        return {
          tutorial: {
            ...state.tutorial,
            isActive: false,
            isCompleted: true,
          },
          toastMessage: 'Day 1 Interactive Tutorial Complete! Enjoy running Fluff & Fold!',
        };
      }
      return {
        tutorial: {
          ...state.tutorial,
          currentStep: nextNum,
        },
      };
    });
  },

  skipTutorial: () => {
    set((state) => ({
      tutorial: {
        ...state.tutorial,
        isActive: false,
      },
      toastMessage: 'Tutorial skipped. Tap "Replay Guides" in Help/Menu anytime!',
    }));
  },

  replayTutorial: () => {
    set({
      tutorial: {
        isActive: true,
        isCompleted: false,
        currentStep: 1,
        casesOrderedInTutorial: 0,
      },
      activeTabletTab: 'dashboard',
      toastMessage: 'Restarted Day 1 Interactive Walkthrough (Step 1 of 8).',
    });
  },

  adjustProductPrice: (skuId, deltaCC) => {
    set((state) => {
      const nextTutorial =
        state.tutorial.isActive && state.tutorial.currentStep === 5
          ? { ...state.tutorial, currentStep: 6 as TutorialStepNumber }
          : state.tutorial;

      return {
        tutorial: nextTutorial,
        products: state.products.map((p) => {
          if (p.skuId !== skuId) return p;
          const nextPrice = Math.max(5, Math.min(250, p.currentRetailPrice + deltaCC));
          return {
            ...p,
            currentRetailPrice: nextPrice,
            isClearance: nextPrice <= Math.round(p.suggestedRetailPrice * 0.85),
          };
        }),
      };
    });
  },

  toggleProductClearance: (skuId) => {
    set((state) => {
      const nextTutorial =
        state.tutorial.isActive && state.tutorial.currentStep === 5
          ? { ...state.tutorial, currentStep: 6 as TutorialStepNumber }
          : state.tutorial;

      return {
        tutorial: nextTutorial,
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
      };
    });
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
    set((state) => {
      const nextOpen = !state.isStoreOpen;
      const nextTutorial =
        nextOpen && state.tutorial.isActive && state.tutorial.currentStep === 6
          ? { ...state.tutorial, currentStep: 7 as TutorialStepNumber }
          : state.tutorial;
      return {
        isStoreOpen: nextOpen,
        tutorial: nextTutorial,
        toastMessage: nextOpen
          ? 'Shop awning unfurled — Open for business! Tap the Register Counter to test Checkout.'
          : 'Shop paused at 09:30 setup mode.',
      };
    });
  },

  moveAvatarTo: (tile) => {
    get().dispatchAvatarToTile(tile, { type: 'none' });
  },

  showToast: (msg) => {
    set({ toastMessage: msg });
  },
}));
