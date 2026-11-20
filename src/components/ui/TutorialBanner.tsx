import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { TutorialStepNumber } from '../../types/game';

interface StepGuide {
  step: TutorialStepNumber;
  title: string;
  instruction: string;
  ctaLabel?: string;
}

const TUTORIAL_STEPS: Record<TutorialStepNumber, StepGuide> = {
  1: {
    step: 1,
    title: 'Step 1 of 8 • Choose Specialty License',
    instruction:
      'Open your Store Tablet Dashboard to confirm or switch your Day 1 Starter Wholesale License (Medical, Caregiver, Little, or Middle).',
    ctaLabel: 'Open Dashboard',
  },
  2: {
    step: 2,
    title: 'Step 2 of 8 • Order First Stock',
    instruction:
      'In the Wholesale Market tab, order 2 starter cases so they arrive at the exterior Delivery Bay pallet.',
    ctaLabel: 'Go to Wholesale',
  },
  3: {
    step: 3,
    title: 'Step 3 of 8 • Pick Up Delivery Box',
    instruction:
      'Tap the glowing wholesale parcel box on the East Exterior Delivery Bay pallet so your Shopkeeper walks over and picks it up overhead!',
    ctaLabel: 'Pick Up Box',
  },
  4: {
    step: 4,
    title: 'Step 4 of 8 • Stock Compatible Shelf',
    instruction:
      'While carrying the box overhead, tap any emerald-highlighted shelf on the shop floor to walk over and stock items into open slots!',
    ctaLabel: 'Auto-Stock Shelf',
  },
  5: {
    step: 5,
    title: 'Step 5 of 8 • Set Prices & Check Appeal',
    instruction:
      'Open the Pricing tab in Store Tablet and tap a -1 CC / +1 CC / +5 CC stepper button, then inspect the Live 4-Demographic Appeal Radar.',
    ctaLabel: 'Open Pricing Tab',
  },
  6: {
    step: 6,
    title: 'Step 6 of 8 • Open the Store',
    instruction:
      'Tap the "Open Shop" button in the HUD bar to unfurl your awning and start the 09:30 store clock!',
    ctaLabel: 'Open Shop Now',
  },
  7: {
    step: 7,
    title: 'Step 7 of 8 • Checkout Mini-Game',
    instruction:
      'Tap the Cozy Register Counter in the 3D shop (or click below) to walk behind the till, scan items, toggle Discreet Plain Bag, and complete payment.',
    ctaLabel: 'Go to Register',
  },
  8: {
    step: 8,
    title: 'Step 8 of 8 • Daily P&L Summary',
    instruction:
      'Review your End-of-Day P&L Card (Gross Revenue, Wholesale COGS, Rent, Net Profit & Star Rating XP) to complete Day 1 training!',
    ctaLabel: 'View EOD P&L Card',
  },
};

export const TutorialBanner: React.FC<{ isUnfolded: boolean }> = ({ isUnfolded }) => {
  const tutorial = useGameStore((s) => s.tutorial);
  const skipTutorial = useGameStore((s) => s.skipTutorial);
  const setActiveTabletTab = useGameStore((s) => s.setActiveTabletTab);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const deliveryBayBoxes = useGameStore((s) => s.deliveryBayBoxes);
  const interactWithDeliveryBox = useGameStore((s) => s.interactWithDeliveryBox);
  const placedFixtures = useGameStore((s) => s.placedFixtures);
  const interactWithFixture = useGameStore((s) => s.interactWithFixture);
  const toggleStoreOpen = useGameStore((s) => s.toggleStoreOpen);
  const isStoreOpen = useGameStore((s) => s.isStoreOpen);

  if (!tutorial.isActive) return null;

  const info = TUTORIAL_STEPS[tutorial.currentStep];

  const handleQuickAction = () => {
    const step = tutorial.currentStep;
    if (step === 1) {
      setActiveTabletTab('dashboard');
      if (!isUnfolded) setActiveModal('tablet');
    } else if (step === 2) {
      setActiveTabletTab('wholesale');
      if (!isUnfolded) setActiveModal('tablet');
    } else if (step === 3) {
      setActiveModal('none');
      if (deliveryBayBoxes.length > 0) {
        interactWithDeliveryBox(deliveryBayBoxes[0].id);
      }
    } else if (step === 4) {
      setActiveModal('none');
      const state = useGameStore.getState();
      const box = state.carriedBox;
      const compatibleShelf = placedFixtures.find((f) => {
        if (f.typeId !== 'StandardShelf' && f.typeId !== 'EndCapDisplay') return false;
        const maxSlots = f.typeId === 'StandardShelf' ? 6 : 4;
        if (f.stockedItemCount >= maxSlots) return false;
        if (!box) return true;
        return (
          f.stockedItemCount === 0 ||
          !f.assignedSkuId ||
          f.assignedSkuId === box.skuId
        );
      });
      if (compatibleShelf) interactWithFixture(compatibleShelf.id);
    } else if (step === 5) {
      setActiveTabletTab('inventory');
      if (!isUnfolded) setActiveModal('tablet');
    } else if (step === 6) {
      setActiveModal('none');
      if (!isStoreOpen) toggleStoreOpen();
    } else if (step === 7) {
      setActiveModal('none');
      const checkout = placedFixtures.find((f) => f.typeId === 'CheckoutCounter');
      if (checkout) {
        interactWithFixture(checkout.id);
      } else {
        setActiveModal('checkout');
      }
    } else if (step === 8) {
      setActiveModal('eod');
    }
  };

  return (
    <div
      id="guided-tutorial-banner"
      className="pointer-events-auto mx-2.5 mt-14 sm:mt-2.5 z-20 max-w-xl rounded-2xl border-2 border-[#3D2C2E] bg-[#FFFDF9]/95 p-3 shadow-[0_4px_0_#3D2C2E] backdrop-blur-md"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 items-center rounded-full border border-[#3D2C2E] bg-[#FBBF24] px-2.5 text-[11px] font-black text-[#3D2C2E]">
            Guide {info.step}/8
          </span>
          <h3 className="text-xs sm:text-sm font-black text-[#3D2C2E]">{info.title}</h3>
        </div>

        {/* 8-Step Progress Dots */}
        <div className="flex items-center gap-1">
          {([1, 2, 3, 4, 5, 6, 7, 8] as TutorialStepNumber[]).map((n) => (
            <span
              key={n}
              className={`h-2 w-2 rounded-full border border-[#3D2C2E] ${
                n < info.step
                  ? 'bg-[#10B981]'
                  : n === info.step
                  ? 'bg-[#FBBF24] scale-125'
                  : 'bg-[#FAF0E6]'
              }`}
            />
          ))}
        </div>
      </div>

      <p className="mt-1.5 text-xs font-bold text-[#5C4033]">{info.instruction}</p>

      {info.step === 2 && (
        <p className="mt-1 text-[11px] font-black text-[#10B981]">
          Starter Cases Ordered: {tutorial.casesOrderedInTutorial} / 2
        </p>
      )}

      <div className="mt-2.5 flex flex-wrap items-center justify-end gap-2">
        <button
          id="btn-tutorial-quick-action"
          type="button"
          onClick={handleQuickAction}
          className="min-h-[48px] min-w-[48px] rounded-xl border-2 border-[#3D2C2E] bg-[#A7C4B5] px-3.5 py-1.5 text-xs font-black text-[#3D2C2E] shadow-[0_2px_0_#3D2C2E] active:translate-y-0.5"
        >
          {info.ctaLabel} ▸
        </button>

        <button
          id="btn-skip-tutorial"
          type="button"
          onClick={skipTutorial}
          className="min-h-[48px] min-w-[48px] rounded-xl border-2 border-[#3D2C2E]/40 bg-[#FAF0E6] px-3 py-1.5 text-xs font-black text-[#5C4033]"
        >
          Skip Tutorial
        </button>
      </div>
    </div>
  );
};
