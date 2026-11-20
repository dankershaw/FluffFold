import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { CrinkleCoinBadge } from './CrinkleCoinBadge';

/**
 * Interactive Checkout Register Drawer Modal & EOD Preview Modal
 * for Tutorial Steps 7 & 8 and tap-and-go Checkout Counter / Packing Bench interactions.
 */
export const CheckoutAndEodModals: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const products = useGameStore((s) => s.products);
  const primaryDemographic = useGameStore((s) => s.primaryDemographic);
  const tutorial = useGameStore((s) => s.tutorial);
  const advanceTutorialStep = useGameStore((s) => s.advanceTutorialStep);
  const spawnFloatingBadge = useGameStore((s) => s.spawnFloatingBadge);
  const showToast = useGameStore((s) => s.showToast);

  const [scannedCount, setScannedCount] = useState(0);
  const [useDiscreetBag, setUseDiscreetBag] = useState(true);

  if (activeModal !== 'checkout' && activeModal !== 'eod' && activeModal !== 'packing') {
    return null;
  }

  const sampleItems = products.slice(0, 2);
  const subtotal = sampleItems.reduce((acc, p) => acc + p.currentRetailPrice, 0);
  const discreetBonus = useDiscreetBag ? 6 : 0;
  const totalReceipt = subtotal + discreetBonus;

  const handleCompletePayment = () => {
    const state = useGameStore.getState();
    useGameStore.setState({
      crinkleCoins: state.crinkleCoins + totalReceipt,
      reputationXP: state.reputationXP + (useDiscreetBag ? 18 : 10),
    });
    spawnFloatingBadge(`+${totalReceipt} CC Sale!`, [-1.25, 1.35, 0.85]);
    setScannedCount(0);

    if (tutorial.isActive && tutorial.currentStep >= 7) {
      setActiveModal('eod');
      advanceTutorialStep(8);
    } else {
      setActiveModal('none');
      showToast(`Completed Checkout (+${totalReceipt} CC, Discreet Bag: ${useDiscreetBag ? 'ON' : 'OFF'})!`);
    }
  };

  if (activeModal === 'checkout') {
    return (
      <div
        id="checkout-register-modal"
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D1E1E]/65 backdrop-blur-sm p-3 sm:p-6"
      >
        <div className="w-full max-w-lg rounded-3xl border-4 border-[#3D2C2E] bg-[#FDF8F5] p-4 sm:p-6 shadow-[0_8px_0_#3D2C2E]">
          <div className="flex items-center justify-between gap-2 border-b-2 border-[#3D2C2E]/20 pb-3">
            <div>
              <h2 className="text-lg font-black text-[#3D2C2E]">
                🔔 Cozy Register Drawer ({primaryDemographic} Shopper)
              </h2>
              <p className="text-xs font-bold text-[#5C4033]">
                Scan items, toggle Discreet Plain Kraft Bag, and complete payment
              </p>
            </div>
            <button
              id="btn-close-checkout-modal"
              type="button"
              onClick={() => setActiveModal('none')}
              className="min-h-[48px] min-w-[48px] rounded-2xl border-2 border-[#3D2C2E] bg-[#FFFDF9] px-3 py-1.5 text-xs font-black text-[#3D2C2E]"
            >
              Close ✕
            </button>
          </div>

          {/* Item Conveyor Cards */}
          <div className="mt-4 space-y-2.5">
            {sampleItems.map((item, idx) => {
              const isScanned = scannedCount > idx;
              return (
                <div
                  key={item.skuId}
                  className={`flex items-center justify-between gap-2 rounded-2xl border-2 p-3 ${
                    isScanned
                      ? 'border-[#3D2C2E] bg-[#DCFCE7]'
                      : 'border-[#3D2C2E]/50 bg-[#FFFDF9]'
                  }`}
                >
                  <div>
                    <div className="text-xs sm:text-sm font-black text-[#3D2C2E]">
                      {item.displayName}
                    </div>
                    <div className="text-[11px] font-bold text-[#5C4033]">
                      {item.catalogId} • Size {item.size}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CrinkleCoinBadge amount={item.currentRetailPrice} size="sm" />
                    <button
                      id={`btn-scan-item-${idx}`}
                      type="button"
                      onClick={() => setScannedCount((c) => Math.max(c, idx + 1))}
                      className={`min-h-[48px] min-w-[48px] rounded-xl border-2 border-[#3D2C2E] px-3 py-1.5 text-xs font-black ${
                        isScanned ? 'bg-[#10B981] text-white' : 'bg-[#FBBF24] text-[#3D2C2E]'
                      }`}
                    >
                      {isScanned ? '✓ Scanned' : 'Tap to Scan'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Discreet Plain Bag Toggle */}
          <div className="mt-4 rounded-2xl border-2 border-[#3D2C2E] bg-[#FAF0E6] p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-black text-[#3D2C2E]">
                  🛍️ Discreet Plain Kraft Bag
                </div>
                <div className="text-[11px] font-bold text-[#5C4033]">
                  Adds +6 CC Discretion Tip &amp; +8 Satisfaction XP
                </div>
              </div>
              <button
                id="btn-toggle-discreet-bag"
                type="button"
                onClick={() => setUseDiscreetBag(!useDiscreetBag)}
                className={`min-h-[48px] min-w-[48px] rounded-xl border-2 border-[#3D2C2E] px-4 py-2 text-xs font-black ${
                  useDiscreetBag ? 'bg-[#A7C4B5]' : 'bg-[#FFFDF9]'
                }`}
              >
                {useDiscreetBag ? 'Discreet Bag: ON' : 'Standard Bag'}
              </button>
            </div>
          </div>

          {/* Complete Sale Button */}
          <div className="mt-4 flex items-center justify-between gap-3 border-t-2 border-[#3D2C2E]/15 pt-4">
            <div>
              <div className="text-[11px] font-bold text-[#5C4033]">Receipt Total</div>
              <CrinkleCoinBadge amount={totalReceipt} size="lg" />
            </div>
            <button
              id="btn-complete-checkout-sale"
              type="button"
              onClick={handleCompletePayment}
              className="min-h-[48px] rounded-2xl border-2 border-[#3D2C2E] bg-[#A7C4B5] px-6 py-3 text-sm font-black text-[#3D2C2E] shadow-[0_3px_0_#3D2C2E]"
            >
              Complete Payment (+{totalReceipt} CC)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeModal === 'eod') {
    return (
      <div
        id="eod-pnl-summary-modal"
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D1E1E]/65 backdrop-blur-sm p-3 sm:p-6"
      >
        <div className="w-full max-w-lg rounded-3xl border-4 border-[#3D2C2E] bg-[#FDF8F5] p-4 sm:p-6 shadow-[0_8px_0_#3D2C2E]">
          <div className="flex items-center justify-between border-b-2 border-[#3D2C2E]/20 pb-3">
            <div>
              <h2 className="text-lg font-black text-[#3D2C2E]">
                📊 End-of-Day P&amp;L Summary Card (Day 1)
              </h2>
              <p className="text-xs font-bold text-[#5C4033]">
                Daily Revenue, Wholesale COGS, Store Rent &amp; Star Rating XP
              </p>
            </div>
            <CrinkleCoinBadge amount={`+${totalReceipt}`} size="md" />
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border-2 border-[#3D2C2E] bg-[#FFFDF9] p-3">
              <div className="text-[11px] font-bold text-[#5C4033]">Gross Retail Revenue</div>
              <div className="mt-1 text-base font-black text-[#10B981]">+{totalReceipt + 180} CC</div>
            </div>
            <div className="rounded-2xl border-2 border-[#3D2C2E] bg-[#FFFDF9] p-3">
              <div className="text-[11px] font-bold text-[#5C4033]">Wholesale COGS</div>
              <div className="mt-1 text-base font-black text-[#D97706]">-108 CC</div>
            </div>
            <div className="rounded-2xl border-2 border-[#3D2C2E] bg-[#FFFDF9] p-3">
              <div className="text-[11px] font-bold text-[#5C4033]">Tier 1 Daily Rent &amp; Utilities</div>
              <div className="mt-1 text-base font-black text-[#EF4444]">-120 CC</div>
            </div>
            <div className="rounded-2xl border-2 border-[#3D2C2E] bg-[#DCFCE7] p-3">
              <div className="text-[11px] font-bold text-[#5C4033]">Star Rating XP Earned</div>
              <div className="mt-1 text-base font-black text-[#3D2C2E]">+42 XP (★ 1.1)</div>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              id="btn-finish-eod-tutorial"
              type="button"
              onClick={() => {
                if (tutorial.isActive) {
                  advanceTutorialStep(9 as never);
                }
                setActiveModal('none');
              }}
              className="min-h-[48px] w-full sm:w-auto rounded-2xl border-2 border-[#3D2C2E] bg-[#A7C4B5] px-6 py-3 text-sm font-black text-[#3D2C2E] shadow-[0_3px_0_#3D2C2E]"
            >
              Finish Day 1 Walkthrough &amp; Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Packing Bench Modal preview
  return (
    <div
      id="packing-bench-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D1E1E]/65 backdrop-blur-sm p-3 sm:p-6"
    >
      <div className="w-full max-w-md rounded-3xl border-4 border-[#3D2C2E] bg-[#FDF8F5] p-5 shadow-[0_8px_0_#3D2C2E]">
        <h2 className="text-lg font-black text-[#3D2C2E]">📦 Mail Order Packing Station</h2>
        <p className="mt-1 text-xs font-bold text-[#5C4033]">
          Shopkeeper walked to the Packing Bench! Interactive drag-and-drop parcel packing unlocks at 2.3 ★ (Milestone 5).
        </p>
        <button
          type="button"
          onClick={() => setActiveModal('none')}
          className="mt-4 min-h-[48px] w-full rounded-2xl border-2 border-[#3D2C2E] bg-[#A7C4B5] px-4 py-2 text-xs font-black text-[#3D2C2E]"
        >
          Back to Shop Floor
        </button>
      </div>
    </div>
  );
};
