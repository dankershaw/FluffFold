import React, { useEffect, useState } from 'react';
import { FIXTURE_DEFINITIONS } from '../../constants/gameData';
import { useGameStore } from '../../store/useGameStore';
import { FixtureTypeId } from '../../types/game';
import { CheckoutAndEodModals } from './CheckoutAndEodModals';
import { CrinkleCoinBadge } from './CrinkleCoinBadge';
import { StoreTabletPanel } from './StoreTabletPanel';
import { TutorialBanner } from './TutorialBanner';

export const ResponsiveHudShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dayNumber = useGameStore((s) => s.dayNumber);
  const timeString = useGameStore((s) => s.timeString);
  const crinkleCoins = useGameStore((s) => s.crinkleCoins);
  const starRating = useGameStore((s) => s.starRating);
  const gameMode = useGameStore((s) => s.gameMode);
  const sandboxSettings = useGameStore((s) => s.sandboxSettings);
  const primaryDemographic = useGameStore((s) => s.primaryDemographic);
  const isStoreOpen = useGameStore((s) => s.isStoreOpen);

  const isBuildMode = useGameStore((s) => s.isBuildMode);
  const selectedBuildFixture = useGameStore((s) => s.selectedBuildFixture);
  const setBuildMode = useGameStore((s) => s.setBuildMode);
  const setSelectedBuildFixture = useGameStore((s) => s.setSelectedBuildFixture);
  const rotateBuildGhost = useGameStore((s) => s.rotateBuildGhost);

  const carriedBox = useGameStore((s) => s.carriedBox);
  const products = useGameStore((s) => s.products);
  const dropCarriedBoxToBay = useGameStore((s) => s.dropCarriedBoxToBay);

  const activeModal = useGameStore((s) => s.activeModal);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const setActiveTabletTab = useGameStore((s) => s.setActiveTabletTab);
  const isUnfoldedTabletOpen = useGameStore((s) => s.isUnfoldedTabletOpen);
  const toggleUnfoldedTablet = useGameStore((s) => s.toggleUnfoldedTablet);
  const toggleStoreOpen = useGameStore((s) => s.toggleStoreOpen);
  const tutorial = useGameStore((s) => s.tutorial);
  const toastMessage = useGameStore((s) => s.toastMessage);
  const showToast = useGameStore((s) => s.showToast);

  // ResizeObserver tracking foldable cover (<640px) vs unfolded tablet (>=640px)
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setViewportWidth(Math.round(entry.contentRect.width));
      }
    });
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, []);

  // Auto-clear toast after 4.5s
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => showToast(''), 4500);
    return () => clearTimeout(t);
  }, [toastMessage, showToast]);

  const isUnfolded = viewportWidth >= 640;
  const displayCash =
    gameMode === 'Sandbox' && sandboxSettings.infiniteCash ? '∞' : crinkleCoins;

  const carriedSku = carriedBox
    ? products.find((p) => p.skuId === carriedBox.skuId)
    : null;

  return (
    <div
      id="foldable-responsive-hud-root"
      className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#FDF8F5] select-none"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* ================= UNFOLDED / TABLET (>= 640px) PERSISTENT LIVE STORE PULSE BAR ================= */}
      {isUnfolded ? (
        <header
          id="unfolded-live-store-pulse-bar"
          className="z-30 flex items-center justify-between gap-3 border-b-2 border-[#3D2C2E] bg-[#FAF0E6] px-4 py-2 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border-2 border-[#3D2C2E] bg-[#A7C4B5] px-3 py-1.5 shadow-[0_2px_0_#3D2C2E]">
              <span className="text-sm font-black tracking-tight text-[#3D2C2E]">
                Fluff &amp; Fold
              </span>
              <span className="rounded-full border border-[#3D2C2E] bg-[#FFFDF9] px-2 py-0.5 text-[10px] font-black">
                {gameMode}
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border-2 border-[#3D2C2E] bg-[#FFFDF9] px-3.5 py-1.5 text-xs font-black text-[#3D2C2E] shadow-[0_2px_0_#3D2C2E]">
              <span>Day {dayNumber}</span>
              <span className="text-[#5C4033]">|</span>
              <span>{timeString}</span>
              <span className="text-[#5C4033]">|</span>
              <span className="text-[#D97706]">★ {starRating.toFixed(1)}</span>
              <span className="text-[#5C4033]">|</span>
              <span className="rounded-full bg-[#E9D8FD] px-2 py-0.5 text-[11px]">
                {primaryDemographic}
              </span>
            </div>

            <CrinkleCoinBadge amount={displayCash} size="md" />
          </div>

          {/* Right Action Buttons on Unfolded Pulse Bar (all >= 48x48px) */}
          <div className="flex items-center gap-2">
            <button
              id="btn-pulse-build-toggle"
              type="button"
              onClick={() => setBuildMode(!isBuildMode)}
              className={`min-h-[48px] min-w-[48px] rounded-2xl border-2 border-[#3D2C2E] px-3.5 py-2 text-xs font-black shadow-[0_3px_0_#3D2C2E] transition ${
                isBuildMode ? 'bg-[#FBBF24]' : 'bg-[#FFFDF9] hover:bg-[#FAF0E6]'
              }`}
            >
              {isBuildMode ? '✓ Build Active' : 'Build / Grid'}
            </button>

            <button
              id="btn-pulse-open-close"
              type="button"
              onClick={toggleStoreOpen}
              className={`min-h-[48px] min-w-[48px] rounded-2xl border-2 border-[#3D2C2E] px-3.5 py-2 text-xs font-black shadow-[0_3px_0_#3D2C2E] transition ${
                isStoreOpen
                  ? 'bg-[#10B981] text-white'
                  : tutorial.isActive && tutorial.currentStep === 6
                  ? 'bg-[#FBBF24] text-[#3D2C2E] animate-bounce'
                  : 'bg-[#A7C4B5] text-[#3D2C2E]'
              }`}
            >
              {isStoreOpen ? 'Shop OPEN' : 'Open Shop'}
            </button>

            <button
              id="btn-pulse-mode-menu"
              type="button"
              onClick={() => setActiveModal('newGame')}
              className="min-h-[48px] min-w-[48px] rounded-2xl border-2 border-[#3D2C2E] bg-[#FFFDF9] px-3.5 py-2 text-xs font-black text-[#3D2C2E] shadow-[0_3px_0_#3D2C2E]"
            >
              Mode / Setup
            </button>

            <button
              id="btn-pulse-toggle-drawer"
              type="button"
              onClick={toggleUnfoldedTablet}
              className="min-h-[48px] min-w-[48px] rounded-2xl border-2 border-[#3D2C2E] bg-[#E9D8FD] px-3.5 py-2 text-xs font-black text-[#3D2C2E] shadow-[0_3px_0_#3D2C2E]"
            >
              {isUnfoldedTabletOpen ? 'Hide Tablet ▸' : '◂ Store Tablet'}
            </button>
          </div>
        </header>
      ) : (
        /* ================= NARROW PHONE / COVER SCREEN (< 640px) COMPACT TOP PILL ================= */
        <div
          id="cover-screen-top-pill"
          className="pointer-events-none absolute inset-x-2 top-2.5 z-30 flex items-center justify-center"
        >
          <div className="pointer-events-auto flex w-full max-w-md items-center justify-between gap-1.5 rounded-full border-2 border-[#3D2C2E] bg-[#FFFDF9]/95 px-3 py-1.5 text-xs font-black text-[#3D2C2E] shadow-[0_3px_0_#3D2C2E] backdrop-blur-md">
            <span className="truncate">
              Day {dayNumber} | {timeString}
            </span>
            <CrinkleCoinBadge amount={displayCash} size="sm" />
            <span className="rounded-full border border-[#3D2C2E] bg-[#FBBF24] px-2 py-0.5 text-[11px] font-black">
              ★ {starRating.toFixed(1)}
            </span>
          </div>
        </div>
      )}

      {/* ================= MAIN WORKSPACE: 3D SHOP FLOOR + DOCKED 380PX SIDE DRAWER ON >= 640PX ================= */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Live 3D Isometric Shop Floor */}
        <main className="relative flex-1 h-full overflow-hidden">
          {children}

          {/* Top-Left Non-Blocking 8-Step Interactive Tutorial Banner */}
          <div className="pointer-events-none absolute left-0 top-0 z-20 w-full">
            <TutorialBanner isUnfolded={isUnfolded} />
          </div>

          {/* Floating Carried Wholesale Case Action Pill (when Shopkeeper is holding a box overhead) */}
          {carriedBox && !isBuildMode && (
            <div
              id="carried-box-action-bar"
              className="absolute left-3 bottom-24 sm:bottom-6 z-20 flex flex-wrap items-center gap-2.5 rounded-2xl border-2 border-[#3D2C2E] bg-[#FEF3C7]/95 px-3.5 py-2 shadow-[0_4px_0_#3D2C2E]"
            >
              <div>
                <div className="text-xs font-black text-[#3D2C2E]">
                  📦 Carrying {carriedSku?.displayName ?? 'Case'} ({carriedBox.unitsRemaining} units)
                </div>
                <div className="text-[11px] font-bold text-[#5C4033]">
                  Tap any emerald-highlighted shelf in 3D to stock open slots!
                </div>
              </div>
              <button
                id="btn-hud-drop-box"
                type="button"
                onClick={dropCarriedBoxToBay}
                className="min-h-[48px] min-w-[48px] rounded-xl border-2 border-[#3D2C2E] bg-[#FFFDF9] px-3 py-1.5 text-xs font-black text-[#3D2C2E]"
              >
                Return to Bay
              </button>
            </div>
          )}

          {/* Floating Build Mode Quick Fixture Selector Bar (Bottom-Left over 3D Canvas) */}
          {isBuildMode && (
            <div
              id="floating-build-fixture-toolbar"
              className="absolute left-3 bottom-24 sm:bottom-6 z-20 flex flex-wrap items-center gap-2 rounded-2xl border-2 border-[#3D2C2E] bg-[#FFFDF9]/95 p-2 shadow-[0_4px_0_#3D2C2E] max-w-[calc(100vw-88px)]"
            >
              {(Object.keys(FIXTURE_DEFINITIONS) as FixtureTypeId[]).map((fKey) => {
                const def = FIXTURE_DEFINITIONS[fKey];
                const selected = selectedBuildFixture === fKey;
                return (
                  <button
                    key={fKey}
                    id={`btn-quick-fixture-${fKey}`}
                    type="button"
                    onClick={() => setSelectedBuildFixture(fKey)}
                    className={`min-h-[48px] min-w-[48px] rounded-xl border-2 px-2.5 py-1.5 text-left text-[11px] font-black transition ${
                      selected
                        ? 'border-[#3D2C2E] bg-[#A7C4B5] text-[#3D2C2E] shadow-[0_2px_0_#3D2C2E]'
                        : 'border-[#3D2C2E]/35 bg-[#FAF0E6] text-[#5C4033]'
                    }`}
                  >
                    <div>{def.name.split(' ')[0]}</div>
                    <div className="text-[10px]">
                      {def.widthTiles}x{def.depthTiles} • {def.costCC} CC
                    </div>
                  </button>
                );
              })}

              <button
                id="btn-quick-rotate-ghost"
                type="button"
                onClick={rotateBuildGhost}
                className="min-h-[48px] min-w-[48px] rounded-xl border-2 border-[#3D2C2E] bg-[#FBBF24] px-3 py-1.5 text-xs font-black text-[#3D2C2E]"
              >
                Rotate 90°
              </button>

              <button
                id="btn-quick-close-build"
                type="button"
                onClick={() => setBuildMode(false)}
                className="min-h-[48px] min-w-[48px] rounded-xl border-2 border-[#3D2C2E] bg-[#FBCFE8] px-3 py-1.5 text-xs font-black text-[#3D2C2E]"
              >
                Done ✕
              </button>
            </div>
          )}

          {/* Toast Feedback Pill — shifts higher when Carried Box bar or Build toolbar is active so zero UI overlaps occur */}
          {toastMessage && (
            <div
              id="hud-toast-banner"
              className={`pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 max-w-md rounded-2xl border-2 border-[#3D2C2E] bg-[#FFFDF9]/95 px-4 py-2 text-center text-xs font-black text-[#3D2C2E] shadow-[0_3px_0_#3D2C2E] ${
                carriedBox || isBuildMode ? 'bottom-40 sm:bottom-24' : 'bottom-20 sm:bottom-5'
              }`}
            >
              {toastMessage}
            </div>
          )}
        </main>

        {/* Unfolded Foldable / Tablet (>= 640px): 380px Glassmorphic Side Drawer */}
        {isUnfolded && isUnfoldedTabletOpen && (
          <aside
            id="unfolded-380px-tablet-drawer"
            className="z-20 h-full w-[380px] shrink-0 border-l-2 border-[#3D2C2E] bg-[#FDF8F5]/95 shadow-xl"
          >
            <StoreTabletPanel isDockedSide />
          </aside>
        )}
      </div>

      {/* ================= NARROW PHONE / COVER SCREEN (< 640px) BOTTOM THUMB DOCK ================= */}
      {!isUnfolded && (
        <nav
          id="cover-screen-bottom-thumb-dock"
          aria-label="Mobile Thumb Controls"
          className="z-30 grid grid-cols-4 gap-2 border-t-2 border-[#3D2C2E] bg-[#FAF0E6] px-2.5 py-2"
        >
          <button
            id="btn-dock-build-decor"
            type="button"
            onClick={() => setBuildMode(!isBuildMode)}
            className={`flex min-h-[48px] min-w-[48px] flex-col items-center justify-center rounded-2xl border-2 border-[#3D2C2E] px-2 py-1 text-xs font-black shadow-[0_2px_0_#3D2C2E] ${
              isBuildMode ? 'bg-[#FBBF24]' : 'bg-[#FFFDF9]'
            }`}
          >
            <span>Build/Decor</span>
          </button>

          <button
            id="btn-dock-store-tablet"
            type="button"
            onClick={() => {
              setActiveTabletTab('dashboard');
              setActiveModal('tablet');
            }}
            className={`flex min-h-[48px] min-w-[48px] flex-col items-center justify-center rounded-2xl border-2 border-[#3D2C2E] px-2 py-1 text-xs font-black shadow-[0_2px_0_#3D2C2E] ${
              activeModal === 'tablet' ? 'bg-[#A7C4B5]' : 'bg-[#FFFDF9]'
            }`}
          >
            <span>Store Tablet</span>
          </button>

          <button
            id="btn-dock-open-close"
            type="button"
            onClick={toggleStoreOpen}
            className={`flex min-h-[48px] min-w-[48px] flex-col items-center justify-center rounded-2xl border-2 border-[#3D2C2E] px-2 py-1 text-xs font-black shadow-[0_2px_0_#3D2C2E] ${
              isStoreOpen ? 'bg-[#10B981] text-white' : 'bg-[#A7C4B5] text-[#3D2C2E]'
            }`}
          >
            <span>{isStoreOpen ? 'Shop Open' : 'Open/Close'}</span>
          </button>

          <button
            id="btn-dock-help-menu"
            type="button"
            onClick={() => setActiveModal('newGame')}
            className={`flex min-h-[48px] min-w-[48px] flex-col items-center justify-center rounded-2xl border-2 border-[#3D2C2E] px-2 py-1 text-xs font-black shadow-[0_2px_0_#3D2C2E] ${
              activeModal === 'newGame' ? 'bg-[#E9D8FD]' : 'bg-[#FFFDF9]'
            }`}
          >
            <span>Help/Menu</span>
          </button>
        </nav>
      )}

      {/* Narrow Screen (< 640px) Full-Screen Store Tablet Modal when activeModal === 'tablet' */}
      {!isUnfolded && activeModal === 'tablet' && (
        <div
          id="mobile-tablet-modal-overlay"
          className="fixed inset-0 z-40 flex flex-col bg-[#FDF8F5]"
          style={{
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <StoreTabletPanel isDockedSide={false} />
        </div>
      )}

      {/* Interactive Checkout Register Drawer, EOD P&L Summary & Packing Bench Modals */}
      <CheckoutAndEodModals />
    </div>
  );
};
