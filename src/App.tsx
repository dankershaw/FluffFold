import React from 'react';
import { IsometricShopCanvas } from './components/three/IsometricShopCanvas';
import { GameModeModal } from './components/ui/GameModeModal';
import { ResponsiveHudShell } from './components/ui/ResponsiveHudShell';

export const App: React.FC = () => {
  return (
    <>
      <ResponsiveHudShell>
        <IsometricShopCanvas />
      </ResponsiveHudShell>
      <GameModeModal />
    </>
  );
};

export default App;
