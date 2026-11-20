import React, { useState } from 'react';
import { DEFAULT_SANDBOX_SETTINGS, GAME_MODE_PRESETS } from '../../constants/gameData';
import { useGameStore } from '../../store/useGameStore';
import { Demographic, GameMode, PriceToleranceMode, SandboxSettings } from '../../types/game';
import { CrinkleCoinBadge, CrinkleCoinIcon } from './CrinkleCoinBadge';

const DEMOGRAPHICS: { id: Demographic; label: string; summary: string; color: string }[] = [
  {
    id: 'Medical',
    label: 'Medical Care',
    summary: 'High steady footfall (18–22/day), low price sensitivity & discreet white packs.',
    color: '#E0F2FE',
  },
  {
    id: 'Caregiver',
    label: 'Caregiver & Family',
    summary: 'Multi-item bundle lists (3–6 items) with +25% proximity Bundle Tip & XP bonus.',
    color: '#DCFCE7',
  },
  {
    id: 'Little',
    label: 'Little Pastel Specialty',
    summary: 'High specialty margins (65%–80%), loves pastel nursery decor, plushies & prints.',
    color: '#FCE7F3',
  },
  {
    id: 'Middle',
    label: 'Middle Lifestyle & Retro',
    summary: 'High lifestyle margins (60%–75%), retro arcade decor & graphic pull-up pants.',
    color: '#E9D8FD',
  },
];

export const GameModeModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const currentMode = useGameStore((s) => s.gameMode);
  const currentDemo = useGameStore((s) => s.primaryDemographic);
  const storedSandbox = useGameStore((s) => s.sandboxSettings);
  const hasStartedGame = useGameStore((s) => s.hasStartedGame);
  const startNewGame = useGameStore((s) => s.startNewGame);
  const setActiveModal = useGameStore((s) => s.setActiveModal);

  const [selectedMode, setSelectedMode] = useState<GameMode>(currentMode);
  const [selectedDemo, setSelectedDemo] = useState<Demographic>(currentDemo);
  const [sandbox, setSandbox] = useState<SandboxSettings>({ ...storedSandbox });

  if (activeModal !== 'newGame') return null;

  const updateSb = (patch: Partial<SandboxSettings>) =>
    setSandbox((prev) => ({ ...prev, ...patch }));

  return (
    <div
      id="game-mode-selection-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D1E1E]/65 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto"
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border-4 border-[#3D2C2E] bg-[#FDF8F5] p-4 sm:p-6 shadow-[0_8px_0_#3D2C2E]">
        {/* Header with Storefront Awning Flair */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#3D2C2E]/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-[#3D2C2E] bg-[#A7C4B5] shadow-[0_3px_0_#3D2C2E]">
              <CrinkleCoinIcon sizePx={28} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#3D2C2E]">
                Fluff &amp; Fold — Store Setup &amp; Game Mode
              </h1>
              <p className="text-xs sm:text-sm font-bold text-[#5C4033]">
                Choose your retail challenge preset &amp; Day 1 Wholesale Specialty License
              </p>
            </div>
          </div>

          {hasStartedGame && (
            <button
              id="btn-close-mode-modal"
              type="button"
              onClick={() => setActiveModal('none')}
              className="min-h-[48px] min-w-[48px] rounded-2xl border-2 border-[#3D2C2E] bg-[#FFFDF9] px-4 py-2 text-sm font-black text-[#3D2C2E] shadow-[0_3px_0_#3D2C2E] active:translate-y-0.5"
            >
              Resume Shop
            </button>
          )}
        </div>

        {/* Section 1: 4 Selectable Game Modes (Responsive Card Grid: grid-cols-1 <640px, grid-cols-2 >=640px) */}
        <div className="mt-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#5C4033]">
            1. Select Game Mode
          </h2>

          <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(['Cozy', 'Standard', 'RetailMogul'] as const).map((mKey) => {
              const preset = GAME_MODE_PRESETS[mKey];
              const isSelected = selectedMode === mKey;
              return (
                <button
                  key={mKey}
                  id={`mode-card-${mKey}`}
                  type="button"
                  onClick={() => setSelectedMode(mKey)}
                  className={`flex flex-col justify-between rounded-2xl border-2 p-4 text-left transition min-h-[48px] ${
                    isSelected
                      ? 'border-[#3D2C2E] bg-[#FFFDF9] ring-4 ring-[#A7C4B5] shadow-[0_4px_0_#3D2C2E]'
                      : 'border-[#3D2C2E]/40 bg-[#FAF0E6]/70 hover:bg-[#FFFDF9]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="inline-block rounded-full border-2 border-[#3D2C2E] px-3 py-0.5 text-xs font-black text-[#3D2C2E]"
                        style={{ backgroundColor: preset.badgeColor }}
                      >
                        {preset.title}
                      </span>
                      <CrinkleCoinBadge amount={preset.startingCash} size="sm" />
                    </div>
                    <p className="mt-2 text-xs font-bold text-[#5C4033]">{preset.tagline}</p>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-1.5 border-t border-[#3D2C2E]/15 pt-2.5 text-[11px] font-bold text-[#3D2C2E]">
                    <div>Rent &amp; Wage: {preset.overheadMultiplier.toFixed(2)}x</div>
                    <div>XP Gain: {preset.xpMultiplier.toFixed(2)}x</div>
                    <div>Elasticity: {preset.priceTolerance}</div>
                    <div>Overdraft: {preset.overdraftCapLabel.split(' ')[0]} CC</div>
                  </div>
                </button>
              );
            })}

            {/* Sandbox Mode Card */}
            <button
              id="mode-card-Sandbox"
              type="button"
              onClick={() => setSelectedMode('Sandbox')}
              className={`flex flex-col justify-between rounded-2xl border-2 p-4 text-left transition min-h-[48px] ${
                selectedMode === 'Sandbox'
                  ? 'border-[#3D2C2E] bg-[#FFFDF9] ring-4 ring-[#A7C4B5] shadow-[0_4px_0_#3D2C2E]'
                  : 'border-[#3D2C2E]/40 bg-[#FAF0E6]/70 hover:bg-[#FFFDF9]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-block rounded-full border-2 border-[#3D2C2E] bg-[#E9D8FD] px-3 py-0.5 text-xs font-black text-[#3D2C2E]">
                    Sandbox (Custom)
                  </span>
                  <CrinkleCoinBadge
                    amount={sandbox.infiniteCash ? '∞' : sandbox.startingCash}
                    size="sm"
                  />
                </div>
                <p className="mt-2 text-xs font-bold text-[#5C4033]">
                  Customize capital, rent sliders, traffic multipliers, or unlock all decor &amp; studio content.
                </p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-1.5 border-t border-[#3D2C2E]/15 pt-2.5 text-[11px] font-bold text-[#3D2C2E]">
                <div>Rent: {sandbox.overheadMultiplier.toFixed(2)}x</div>
                <div>XP: {sandbox.xpMultiplier.toFixed(2)}x</div>
                <div>Traffic: {sandbox.customerSpawnMultiplier.toFixed(2)}x</div>
                <div>Unlock All: {sandbox.unlockAllContent ? 'ON' : 'OFF'}</div>
              </div>
            </button>
          </div>
        </div>

        {/* Sandbox Customizer Panel (Visible when Sandbox Mode is chosen) */}
        {selectedMode === 'Sandbox' && (
          <div
            id="sandbox-customizer-panel"
            className="mt-4 rounded-2xl border-2 border-[#3D2C2E] bg-[#FFFDF9] p-4 shadow-[0_3px_0_#3D2C2E]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-black text-[#3D2C2E]">
                Sandbox Custom Rules &amp; Sliders
              </h3>
              <button
                id="btn-reset-sandbox-defaults"
                type="button"
                onClick={() => setSandbox({ ...DEFAULT_SANDBOX_SETTINGS })}
                className="min-h-[48px] min-w-[48px] rounded-xl border-2 border-[#3D2C2E] bg-[#FAF0E6] px-3 py-1.5 text-xs font-black text-[#3D2C2E]"
              >
                Reset Defaults
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Starting Capital Stepper + Slider */}
              <div className="rounded-xl border border-[#3D2C2E]/25 bg-[#FAF0E6] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#3D2C2E]">Starting Capital</span>
                  <CrinkleCoinBadge
                    amount={sandbox.infiniteCash ? 'Infinite' : sandbox.startingCash}
                    size="sm"
                  />
                </div>
                <input
                  id="slider-sandbox-cash"
                  type="range"
                  min={500}
                  max={100000}
                  step={500}
                  disabled={sandbox.infiniteCash}
                  value={sandbox.startingCash}
                  onChange={(e) => updateSb({ startingCash: Number(e.target.value) })}
                  className="mt-2 w-full accent-[#3D2C2E] h-8 cursor-pointer"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    id="btn-sandbox-infinite-cash"
                    type="button"
                    onClick={() => updateSb({ infiniteCash: !sandbox.infiniteCash })}
                    className={`min-h-[48px] flex-1 rounded-xl border-2 border-[#3D2C2E] px-3 py-2 text-xs font-black ${
                      sandbox.infiniteCash ? 'bg-[#A7C4B5]' : 'bg-[#FFFDF9]'
                    }`}
                  >
                    Infinite Cash: {sandbox.infiniteCash ? 'ON' : 'OFF'}
                  </button>
                  <button
                    id="btn-sandbox-add-5k"
                    type="button"
                    disabled={sandbox.infiniteCash}
                    onClick={() =>
                      updateSb({
                        startingCash: Math.min(999999, sandbox.startingCash + 5000),
                      })
                    }
                    className="min-h-[48px] min-w-[48px] rounded-xl border-2 border-[#3D2C2E] bg-[#FFFDF9] px-3 py-2 text-xs font-black"
                  >
                    +5,000 CC
                  </button>
                </div>
              </div>

              {/* Rent & Wage Overhead Multiplier */}
              <div className="rounded-xl border border-[#3D2C2E]/25 bg-[#FAF0E6] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#3D2C2E]">
                    Daily Rent &amp; Wage Multiplier
                  </span>
                  <span className="rounded-full border border-[#3D2C2E] bg-[#FFFDF9] px-2.5 py-0.5 text-xs font-black">
                    {sandbox.overheadMultiplier === 0
                      ? '0.00x (Free)'
                      : `${sandbox.overheadMultiplier.toFixed(2)}x`}
                  </span>
                </div>
                <input
                  id="slider-sandbox-overhead"
                  type="range"
                  min={0}
                  max={2}
                  step={0.05}
                  value={sandbox.overheadMultiplier}
                  onChange={(e) => updateSb({ overheadMultiplier: Number(e.target.value) })}
                  className="mt-2 w-full accent-[#3D2C2E] h-8 cursor-pointer"
                />
                <div className="mt-2 flex gap-2">
                  {(['Forgiving', 'Normal', 'AlwaysBuy'] as PriceToleranceMode[]).map((tol) => (
                    <button
                      key={tol}
                      id={`btn-sandbox-tol-${tol}`}
                      type="button"
                      onClick={() => updateSb({ priceTolerance: tol })}
                      className={`min-h-[48px] flex-1 rounded-xl border-2 border-[#3D2C2E] px-2 py-1.5 text-[11px] font-black ${
                        sandbox.priceTolerance === tol ? 'bg-[#FBBF24]' : 'bg-[#FFFDF9]'
                      }`}
                    >
                      {tol}
                    </button>
                  ))}
                </div>
              </div>

              {/* XP & Customer Traffic Multipliers */}
              <div className="rounded-xl border border-[#3D2C2E]/25 bg-[#FAF0E6] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#3D2C2E]">
                    Reputation XP &amp; Traffic
                  </span>
                  <span className="text-xs font-black">
                    XP {sandbox.xpMultiplier.toFixed(1)}x • Traffic{' '}
                    {sandbox.customerSpawnMultiplier.toFixed(1)}x
                  </span>
                </div>
                <input
                  id="slider-sandbox-xp"
                  type="range"
                  min={0.5}
                  max={5.0}
                  step={0.25}
                  value={sandbox.xpMultiplier}
                  onChange={(e) => updateSb({ xpMultiplier: Number(e.target.value) })}
                  className="mt-2 w-full accent-[#3D2C2E] h-8 cursor-pointer"
                />
              </div>

              {/* Content Unlock & Random World Events Toggles */}
              <div className="flex gap-2 rounded-xl border border-[#3D2C2E]/25 bg-[#FAF0E6] p-3">
                <button
                  id="btn-sandbox-unlock-all"
                  type="button"
                  onClick={() => updateSb({ unlockAllContent: !sandbox.unlockAllContent })}
                  className={`min-h-[48px] flex-1 rounded-xl border-2 border-[#3D2C2E] px-3 py-2 text-xs font-black ${
                    sandbox.unlockAllContent ? 'bg-[#A7C4B5]' : 'bg-[#FFFDF9]'
                  }`}
                >
                  Unlock All Themes &amp; Catalogs: {sandbox.unlockAllContent ? 'ON' : 'OFF'}
                </button>
                <button
                  id="btn-sandbox-events"
                  type="button"
                  onClick={() => updateSb({ enableRandomEvents: !sandbox.enableRandomEvents })}
                  className={`min-h-[48px] flex-1 rounded-xl border-2 border-[#3D2C2E] px-3 py-2 text-xs font-black ${
                    sandbox.enableRandomEvents ? 'bg-[#FBBF24]' : 'bg-[#FFFDF9]'
                  }`}
                >
                  World Events: {sandbox.enableRandomEvents ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Day 1 Starter Wholesale Specialty License */}
        <div className="mt-5">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#5C4033]">
            2. Choose Day 1 Wholesale Specialty License
          </h2>
          <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEMOGRAPHICS.map((demo) => {
              const active = selectedDemo === demo.id;
              return (
                <button
                  key={demo.id}
                  id={`demo-card-${demo.id}`}
                  type="button"
                  onClick={() => setSelectedDemo(demo.id)}
                  className={`flex flex-col justify-between rounded-2xl border-2 p-3.5 text-left transition min-h-[48px] ${
                    active
                      ? 'border-[#3D2C2E] bg-[#FFFDF9] ring-4 ring-[#FBBF24] shadow-[0_3px_0_#3D2C2E]'
                      : 'border-[#3D2C2E]/35 bg-[#FAF0E6]/60 hover:bg-[#FFFDF9]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="rounded-full border-2 border-[#3D2C2E] px-3 py-0.5 text-xs font-black text-[#3D2C2E]"
                      style={{ backgroundColor: demo.color }}
                    >
                      {demo.label}
                    </span>
                    <span className="text-xs font-black text-[#5C4033]">
                      {active ? '✓ Selected' : 'Tap to Choose'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-bold text-[#5C4033]">{demo.summary}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Launch Shop CTA */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t-2 border-[#3D2C2E]/15 pt-4">
          <button
            id="btn-start-shop-session"
            type="button"
            onClick={() => startNewGame(selectedMode, selectedDemo, sandbox)}
            className="min-h-[52px] w-full sm:w-auto rounded-2xl border-2 border-[#3D2C2E] bg-[#A7C4B5] px-8 py-3 text-base font-black text-[#3D2C2E] shadow-[0_4px_0_#3D2C2E] hover:bg-[#93B8A5] active:translate-y-0.5 transition"
          >
            Open Fluff &amp; Fold ({selectedMode} • {selectedDemo})
          </button>
        </div>
      </div>
    </div>
  );
};
