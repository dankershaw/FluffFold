import React from 'react';
import { FIXTURE_DEFINITIONS, ROOM_THEMES } from '../../constants/gameData';
import { useGameStore } from '../../store/useGameStore';
import { Demographic, FixtureTypeId, RoomThemeId, TabletTabType } from '../../types/game';
import { CrinkleCoinBadge } from './CrinkleCoinBadge';

const TABS: { id: TabletTabType; label: string; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'wholesale', label: 'Wholesale' },
  { id: 'inventory', label: 'Pricing' },
  { id: 'build', label: 'Build & Decor' },
  { id: 'grants', label: 'Grants & Staff' },
  { id: 'studio', label: '3D Studio', badge: '3.2★' },
];

export const StoreTabletPanel: React.FC<{ isDockedSide?: boolean }> = ({
  isDockedSide = false,
}) => {
  const activeTab = useGameStore((s) => s.activeTabletTab);
  const setActiveTab = useGameStore((s) => s.setActiveTabletTab);
  const setActiveModal = useGameStore((s) => s.setActiveModal);

  const gameMode = useGameStore((s) => s.gameMode);
  const sandboxSettings = useGameStore((s) => s.sandboxSettings);
  const primaryDemographic = useGameStore((s) => s.primaryDemographic);
  const starRating = useGameStore((s) => s.starRating);
  const reputationXP = useGameStore((s) => s.reputationXP);

  const activeThemeId = useGameStore((s) => s.activeThemeId);
  const unlockedThemes = useGameStore((s) => s.unlockedThemes);
  const applyRoomTheme = useGameStore((s) => s.applyRoomTheme);

  const isBuildMode = useGameStore((s) => s.isBuildMode);
  const selectedBuildFixture = useGameStore((s) => s.selectedBuildFixture);
  const setBuildMode = useGameStore((s) => s.setBuildMode);
  const rotateBuildGhost = useGameStore((s) => s.rotateBuildGhost);
  const placedFixtures = useGameStore((s) => s.placedFixtures);
  const removeFixture = useGameStore((s) => s.removeFixture);

  const products = useGameStore((s) => s.products);
  const adjustProductPrice = useGameStore((s) => s.adjustProductPrice);
  const toggleProductClearance = useGameStore((s) => s.toggleProductClearance);
  const showToast = useGameStore((s) => s.showToast);

  // Live 4-Demographic Appeal Radar Calculation
  const demographicAppealScores: Record<Demographic, number> = React.useMemo(() => {
    const base: Record<Demographic, number> = {
      Medical: 62,
      Caregiver: 68,
      Little: 72,
      Middle: 64,
    };
    base[primaryDemographic] = Math.min(98, base[primaryDemographic] + 18);
    const theme = ROOM_THEMES[activeThemeId];
    if (theme.affinityDemographic) {
      base[theme.affinityDemographic] = Math.min(99, base[theme.affinityDemographic] + 20);
    }
    return base;
  }, [primaryDemographic, activeThemeId]);

  // Single-column card layout inside 380px side drawer, or responsive 1-to-2 column grid in full modal
  const cardGridClass = isDockedSide
    ? 'grid grid-cols-1 gap-3'
    : 'grid grid-cols-1 sm:grid-cols-2 gap-3';

  return (
    <div
      id={isDockedSide ? 'store-tablet-docked-drawer' : 'store-tablet-modal-card'}
      className="flex h-full w-full flex-col bg-[#FDF8F5]/95 text-[#3D2C2E] backdrop-blur-md"
    >
      {/* Tablet Top Header */}
      <div className="flex items-center justify-between gap-2 border-b-2 border-[#3D2C2E] bg-[#FAF0E6] px-3.5 py-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#10B981] border border-[#3D2C2E]" />
            <h2 className="text-sm sm:text-base font-black tracking-tight text-[#3D2C2E]">
              Store Tablet OS • {gameMode}
            </h2>
          </div>
          <p className="text-[11px] font-bold text-[#5C4033]">
            Specialty: {primaryDemographic} • Theme: {ROOM_THEMES[activeThemeId].name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {gameMode === 'Sandbox' && (
            <button
              id="btn-open-sandbox-rules"
              type="button"
              onClick={() => setActiveModal('newGame')}
              className="min-h-[48px] min-w-[48px] rounded-xl border-2 border-[#3D2C2E] bg-[#E9D8FD] px-2.5 py-1.5 text-xs font-black text-[#3D2C2E] shadow-[0_2px_0_#3D2C2E]"
            >
              Sandbox
            </button>
          )}
          {!isDockedSide && (
            <button
              id="btn-close-tablet-modal"
              type="button"
              onClick={() => setActiveModal('none')}
              className="min-h-[48px] min-w-[48px] rounded-xl border-2 border-[#3D2C2E] bg-[#FFFDF9] px-3 py-1.5 text-xs font-black text-[#3D2C2E] shadow-[0_2px_0_#3D2C2E]"
            >
              Close ✕
            </button>
          )}
        </div>
      </div>

      {/* 6 Store Tablet Navigation Tabs (min-h-[48px] touch targets, gap-2) */}
      <div className="grid grid-cols-3 gap-2 border-b-2 border-[#3D2C2E]/20 bg-[#FFFDF9] p-2.5">
        {TABS.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              id={`tablet-tab-${t.id}`}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex min-h-[48px] min-w-[48px] flex-col items-center justify-center rounded-xl border-2 px-2 py-1.5 text-xs font-black transition ${
                active
                  ? 'border-[#3D2C2E] bg-[#A7C4B5] text-[#3D2C2E] shadow-[0_2px_0_#3D2C2E]'
                  : 'border-[#3D2C2E]/30 bg-[#FAF0E6] text-[#5C4033] hover:bg-[#FFFDF9]'
              }`}
            >
              <span className="truncate">{t.label}</span>
              {t.badge && (
                <span className="mt-0.5 rounded-full bg-[#FBBF24] px-1.5 text-[9px] font-black text-[#3D2C2E]">
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Scrollable Tab Body (Zero horizontal-overflow tables — strictly vertical card grids) */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {/* ================= 1. DASHBOARD TAB ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-3">
            {/* Star XP Progression Card */}
            <div className="rounded-2xl border-2 border-[#3D2C2E] bg-[#FFFDF9] p-3.5 shadow-[0_3px_0_#3D2C2E]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-[#5C4033]">
                  Stage 1: Corner Shop
                </span>
                <span className="rounded-full border-2 border-[#3D2C2E] bg-[#FBBF24] px-2.5 py-0.5 text-xs font-black">
                  ★ {starRating.toFixed(1)} / 5.0
                </span>
              </div>
              <div className="mt-2 h-3.5 w-full overflow-hidden rounded-full border-2 border-[#3D2C2E] bg-[#FAF0E6]">
                <div
                  className="h-full bg-[#A7C4B5] transition-all"
                  style={{ width: `${Math.min(100, (starRating / 5) * 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] font-bold text-[#5C4033]">
                {reputationXP} / 1,500 XP to Stage 2 Neighborhood Hub (1.5 ★ Back Stockroom &amp; Cashier)
              </p>
            </div>

            {/* Live 4-Demographic Appeal Radar Card */}
            <div className="rounded-2xl border-2 border-[#3D2C2E] bg-[#FFFDF9] p-3.5 shadow-[0_3px_0_#3D2C2E]">
              <h3 className="text-xs font-black uppercase tracking-wide text-[#3D2C2E]">
                Live 4-Demographic Appeal Radar
              </h3>
              <div className="mt-2.5 space-y-2">
                {(Object.keys(demographicAppealScores) as Demographic[]).map((demo) => {
                  const score = demographicAppealScores[demo];
                  return (
                    <div key={demo} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-black">
                        <span>
                          {demo} {demo === primaryDemographic ? '★ (License)' : ''}
                        </span>
                        <span>{score}% Appeal</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full border border-[#3D2C2E] bg-[#FAF0E6]">
                        <div
                          className="h-full bg-[#FBBF24]"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Store Layout & Daily Rent Summary Card */}
            <div className="rounded-2xl border-2 border-[#3D2C2E] bg-[#FAF0E6] p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#3D2C2E]">
                  Tier 1 Storefront (12x12 Tiles / 6x6m)
                </span>
                <CrinkleCoinBadge amount={120} size="sm" />
              </div>
              <p className="mt-1 text-xs font-bold text-[#5C4033]">
                Active Fixtures: {placedFixtures.length} • All A* aisles verified clear between Entrance, Shelves &amp; Checkout.
              </p>
            </div>
          </div>
        )}

        {/* ================= 2. BUILD & DECOR TAB ================= */}
        {activeTab === 'build' && (
          <div className="space-y-4">
            {/* Active Build Controls Banner */}
            <div className="rounded-2xl border-2 border-[#3D2C2E] bg-[#FFFDF9] p-3.5 shadow-[0_3px_0_#3D2C2E]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-black uppercase text-[#3D2C2E]">
                    1-Tile Deterministic Grid Placement
                  </h3>
                  <p className="text-[11px] font-bold text-[#5C4033]">
                    Select a fixture below, then tap any emerald floor tile in the 3D shop.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    id="btn-tablet-rotate-fixture"
                    type="button"
                    onClick={rotateBuildGhost}
                    className="min-h-[48px] min-w-[48px] rounded-xl border-2 border-[#3D2C2E] bg-[#FAF0E6] px-3 py-1.5 text-xs font-black text-[#3D2C2E]"
                  >
                    Rotate 90°
                  </button>
                  {isBuildMode && (
                    <button
                      id="btn-tablet-exit-build"
                      type="button"
                      onClick={() => setBuildMode(false)}
                      className="min-h-[48px] min-w-[48px] rounded-xl border-2 border-[#3D2C2E] bg-[#FBCFE8] px-3 py-1.5 text-xs font-black text-[#3D2C2E]"
                    >
                      Done
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Fixture Catalog Cards */}
            <div>
              <h4 className="mb-2 text-xs font-black uppercase text-[#5C4033]">
                Retail Fixtures &amp; Footprint Rules
              </h4>
              <div className={cardGridClass}>
                {(Object.keys(FIXTURE_DEFINITIONS) as FixtureTypeId[]).map((fKey) => {
                  const def = FIXTURE_DEFINITIONS[fKey];
                  const active = isBuildMode && selectedBuildFixture === fKey;
                  return (
                    <div
                      key={fKey}
                      className={`flex flex-col justify-between rounded-2xl border-2 p-3.5 transition ${
                        active
                          ? 'border-[#3D2C2E] bg-[#FFFDF9] ring-4 ring-[#A7C4B5] shadow-[0_3px_0_#3D2C2E]'
                          : 'border-[#3D2C2E]/40 bg-[#FAF0E6]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-[#3D2C2E]">{def.name}</span>
                          <CrinkleCoinBadge amount={def.costCC} size="sm" />
                        </div>
                        <p className="mt-1.5 text-[11px] font-bold text-[#5C4033]">
                          {def.description}
                        </p>
                      </div>
                      <button
                        id={`btn-select-fixture-${fKey}`}
                        type="button"
                        onClick={() => {
                          setBuildMode(true, fKey);
                          if (!isDockedSide) setActiveModal('none');
                        }}
                        className={`mt-3 min-h-[48px] w-full rounded-xl border-2 border-[#3D2C2E] px-3 py-2 text-xs font-black shadow-[0_2px_0_#3D2C2E] ${
                          active ? 'bg-[#A7C4B5]' : 'bg-[#FFFDF9] hover:bg-[#A7C4B5]/50'
                        }`}
                      >
                        {active ? 'Placing on 3D Floor...' : `Place (${def.widthTiles}x${def.depthTiles} Tiles)`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4 Unlockable Room Theme Packs */}
            <div>
              <h4 className="mb-2 text-xs font-black uppercase text-[#5C4033]">
                4 Room Theme Packs (High-Contrast Anti-CAD Palettes)
              </h4>
              <div className={cardGridClass}>
                {(Object.keys(ROOM_THEMES) as RoomThemeId[]).map((tId) => {
                  const pack = ROOM_THEMES[tId];
                  const isCurrent = activeThemeId === tId;
                  const isUnlocked = unlockedThemes.includes(tId);
                  return (
                    <div
                      key={tId}
                      className={`flex flex-col justify-between rounded-2xl border-2 p-3.5 ${
                        isCurrent
                          ? 'border-[#3D2C2E] bg-[#FFFDF9] ring-4 ring-[#FBBF24]'
                          : 'border-[#3D2C2E]/40 bg-[#FAF0E6]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-[#3D2C2E]">{pack.name}</span>
                          {isUnlocked ? (
                            <span className="rounded-full border border-[#3D2C2E] bg-[#A7C4B5] px-2 py-0.5 text-[10px] font-black">
                              Unlocked
                            </span>
                          ) : (
                            <CrinkleCoinBadge amount={pack.costCC} size="sm" />
                          )}
                        </div>
                        <p className="mt-1 text-[11px] font-bold text-[#5C4033]">{pack.subtitle}</p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span
                            className="h-4 w-4 rounded-full border border-[#3D2C2E]"
                            style={{ backgroundColor: pack.floorHex }}
                            title="Floor Tone"
                          />
                          <span
                            className="h-4 w-4 rounded-full border border-[#3D2C2E]"
                            style={{ backgroundColor: pack.wallHex }}
                            title="Wall Tone"
                          />
                          <span
                            className="h-4 w-4 rounded-full border border-[#3D2C2E]"
                            style={{ backgroundColor: pack.trimHex }}
                            title="Baseboard Trim"
                          />
                          <span className="ml-1 text-[11px] font-black text-[#3D2C2E]">
                            {pack.bonusLabel}
                          </span>
                        </div>
                      </div>

                      <button
                        id={`btn-apply-theme-${tId}`}
                        type="button"
                        onClick={() => applyRoomTheme(tId)}
                        className={`mt-3 min-h-[48px] w-full rounded-xl border-2 border-[#3D2C2E] px-3 py-2 text-xs font-black shadow-[0_2px_0_#3D2C2E] ${
                          isCurrent ? 'bg-[#FBBF24]' : 'bg-[#FFFDF9]'
                        }`}
                      >
                        {isCurrent
                          ? '✓ Active Room Theme'
                          : isUnlocked
                          ? 'Apply Theme'
                          : `Unlock & Apply (${pack.costCC} CC)`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Placed Fixtures Manager List */}
            <div>
              <h4 className="mb-2 text-xs font-black uppercase text-[#5C4033]">
                Placed Floor Fixtures ({placedFixtures.length})
              </h4>
              <div className="space-y-2">
                {placedFixtures.map((fix) => {
                  const def = FIXTURE_DEFINITIONS[fix.typeId];
                  return (
                    <div
                      key={fix.id}
                      className="flex items-center justify-between gap-2 rounded-2xl border-2 border-[#3D2C2E]/40 bg-[#FFFDF9] p-2.5"
                    >
                      <div>
                        <div className="text-xs font-black text-[#3D2C2E]">{def.name}</div>
                        <div className="text-[11px] font-bold text-[#5C4033]">
                          Tile ({fix.tileX}, {fix.tileZ}) • Rot {fix.rotation * 90}°
                        </div>
                      </div>
                      <button
                        id={`btn-remove-fix-${fix.id}`}
                        type="button"
                        onClick={() => removeFixture(fix.id)}
                        className="min-h-[48px] min-w-[48px] rounded-xl border-2 border-[#3D2C2E] bg-[#FEE2E2] px-3 py-1.5 text-xs font-black text-[#3D2C2E]"
                      >
                        Sell
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. INVENTORY & PRICING TAB (Chunky -/+ Steppers) ================= */}
        {activeTab === 'inventory' && (
          <div className={cardGridClass}>
            {products.map((sku) => {
              const ratio = sku.currentRetailPrice / sku.suggestedRetailPrice;
              return (
                <div
                  key={sku.skuId}
                  className="flex flex-col justify-between rounded-2xl border-2 border-[#3D2C2E] bg-[#FFFDF9] p-3.5 shadow-[0_3px_0_#3D2C2E]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full border border-[#3D2C2E] bg-[#FAF0E6] px-2.5 py-0.5 text-[10px] font-black">
                        {sku.catalogId} • Size {sku.size}
                      </span>
                      <CrinkleCoinBadge amount={sku.currentRetailPrice} size="sm" />
                    </div>
                    <h4 className="mt-1.5 text-xs sm:text-sm font-black text-[#3D2C2E]">
                      {sku.displayName}
                    </h4>
                    <p className="mt-0.5 text-[11px] font-bold text-[#5C4033]">
                      Wholesale: {sku.wholesaleCost} CC • RRP: {sku.suggestedRetailPrice} CC (
                      {(ratio * 100).toFixed(0)}%)
                    </p>
                  </div>

                  {/* Chunky 48x48px Price Stepper Buttons (-1 CC, +1 CC, +5 CC) */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      id={`btn-price-minus-1-${sku.skuId}`}
                      type="button"
                      onClick={() => adjustProductPrice(sku.skuId, -1)}
                      className="min-h-[48px] min-w-[48px] flex-1 rounded-xl border-2 border-[#3D2C2E] bg-[#FAF0E6] text-xs font-black text-[#3D2C2E] active:bg-[#A7C4B5]"
                    >
                      -1 CC
                    </button>
                    <button
                      id={`btn-price-plus-1-${sku.skuId}`}
                      type="button"
                      onClick={() => adjustProductPrice(sku.skuId, 1)}
                      className="min-h-[48px] min-w-[48px] flex-1 rounded-xl border-2 border-[#3D2C2E] bg-[#FAF0E6] text-xs font-black text-[#3D2C2E] active:bg-[#A7C4B5]"
                    >
                      +1 CC
                    </button>
                    <button
                      id={`btn-price-plus-5-${sku.skuId}`}
                      type="button"
                      onClick={() => adjustProductPrice(sku.skuId, 5)}
                      className="min-h-[48px] min-w-[48px] flex-1 rounded-xl border-2 border-[#3D2C2E] bg-[#FAF0E6] text-xs font-black text-[#3D2C2E] active:bg-[#A7C4B5]"
                    >
                      +5 CC
                    </button>
                  </div>

                  <button
                    id={`btn-clearance-toggle-${sku.skuId}`}
                    type="button"
                    onClick={() => toggleProductClearance(sku.skuId)}
                    className={`mt-2 min-h-[48px] w-full rounded-xl border-2 border-[#3D2C2E] px-3 py-1.5 text-xs font-black ${
                      sku.isClearance ? 'bg-[#FBBF24]' : 'bg-[#FFFDF9]'
                    }`}
                  >
                    {sku.isClearance
                      ? '★ Clearance Active (0.80x RRP)'
                      : 'Toggle Clearance (0.80x RRP)'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= 4. WHOLESALE MARKET TAB ================= */}
        {activeTab === 'wholesale' && (
          <div className={cardGridClass}>
            {products.map((sku) => (
              <div
                key={`ws-${sku.skuId}`}
                className="flex flex-col justify-between rounded-2xl border-2 border-[#3D2C2E] bg-[#FFFDF9] p-3.5 shadow-[0_3px_0_#3D2C2E]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full border border-[#3D2C2E] bg-[#E0F2FE] px-2.5 py-0.5 text-[10px] font-black">
                      {sku.catalogId} License
                    </span>
                    <CrinkleCoinBadge amount={sku.wholesaleCost * 6} size="sm" />
                  </div>
                  <h4 className="mt-1.5 text-xs sm:text-sm font-black text-[#3D2C2E]">
                    {sku.displayName} (6-Pack Case)
                  </h4>
                  <p className="mt-1 text-[11px] font-bold text-[#5C4033]">
                    Absorbency {sku.absorbencyLevel}/10 • Plushness {sku.plushnessLevel}/10
                  </p>
                </div>
                <button
                  id={`btn-order-case-${sku.skuId}`}
                  type="button"
                  onClick={() =>
                    showToast(
                      `Ordered 1 case of ${sku.displayName} to Exterior Delivery Bay (Milestone 2 stocking loop ready!)`
                    )
                  }
                  className="mt-3 min-h-[48px] w-full rounded-xl border-2 border-[#3D2C2E] bg-[#A7C4B5] px-3 py-2 text-xs font-black text-[#3D2C2E] shadow-[0_2px_0_#3D2C2E]"
                >
                  Order Case ({sku.wholesaleCost * 6} CC)
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ================= 5. GRANTS & STAFF TAB ================= */}
        {activeTab === 'grants' && (
          <div className="space-y-3">
            <div className="rounded-2xl border-2 border-[#3D2C2E] bg-[#FFFDF9] p-3.5 shadow-[0_3px_0_#3D2C2E]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#3D2C2E]">
                  Corner Shop Community Grant I
                </span>
                <CrinkleCoinBadge amount={500} size="sm" />
              </div>
              <p className="mt-1 text-xs font-bold text-[#5C4033]">
                Stock 2 display shelves and serve your first 10 neighborhood shoppers. (Unlocks in Milestone 3–4)
              </p>
            </div>
            <div className="rounded-2xl border-2 border-[#3D2C2E] bg-[#FAF0E6] p-3.5">
              <h4 className="text-xs font-black text-[#3D2C2E]">
                Cozy Staff Roster (Cashier • Stocker • Packer)
              </h4>
              <p className="mt-1 text-xs font-bold text-[#5C4033]">
                Cashier unlocks at 1.8 ★ (140 CC/day) • Stocker &amp; Packer unlock at 2.3 ★ &amp; 3.2 ★.
              </p>
            </div>
          </div>
        )}

        {/* ================= 6. 3D CUSTOM PRODUCT STUDIO TAB ================= */}
        {activeTab === 'studio' && (
          <div className="rounded-2xl border-2 border-[#3D2C2E] bg-[#FFFDF9] p-4 shadow-[0_3px_0_#3D2C2E]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#3D2C2E]">
                3D Custom Product Designer Studio
              </h3>
              <span className="rounded-full border border-[#3D2C2E] bg-[#E9D8FD] px-2.5 py-0.5 text-xs font-black">
                {starRating >= 3.2 || sandboxSettings.unlockAllContent
                  ? 'Sandbox Unlocked'
                  : 'Unlocks at 3.2 ★'}
              </span>
            </div>
            <p className="mt-2 text-xs font-bold text-[#5C4033]">
              Interactive 3D turntable for custom house-brand Tabbed Diapers, Pull-Ups, Onesies, Pacifiers &amp; Plushies with Glossy Plastic / Matte Cloth shaders and procedural decals arrives in Milestone 5.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
