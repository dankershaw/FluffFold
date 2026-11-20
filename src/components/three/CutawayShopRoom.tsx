import React, { useMemo } from 'react';
import { Outlines, RoundedBox } from '@react-three/drei';
import { ROOM_THEMES } from '../../constants/gameData';
import { useGameStore } from '../../store/useGameStore';
import { GRID_SIZE, TILE_SIZE_METERS } from '../../utils/gridValidator';
import { getThemeFloorTexture, getToonGradientMap } from '../../utils/toonMaterials';

const DARK_COCOA = '#3D2C2E';
const FULL_WALL_HEIGHT = 2.6;
const CUTAWAY_CURB_HEIGHT = 0.25;
const WALL_THICKNESS = 0.22;

/**
 * Dynamic Cutaway Dollhouse Walls & Theme-Aware Shop Floor.
 * Back-left and back-right walls render at full height (2.6m) with framed storefront windows,
 * wainscoting/baseboard trim (#5C4033), and hanging pendant lamps; front-facing walls stay cut away (0.25m low curb)
 * and automatically swap when the player rotates the camera 90°.
 */
export const CutawayShopRoom: React.FC = () => {
  const activeThemeId = useGameStore((s) => s.activeThemeId);
  const cameraRotationIndex = useGameStore((s) => s.cameraRotationIndex);

  const theme = ROOM_THEMES[activeThemeId];
  const gradientMap = useMemo(() => getToonGradientMap(), []);
  const floorTexture = useMemo(() => getThemeFloorTexture(activeThemeId), [activeThemeId]);

  const roomSpan = GRID_SIZE * TILE_SIZE_METERS; // 12 * 0.5m = 6.0m
  const halfSpan = roomSpan / 2; // 3.0m

  /**
   * Camera azimuth angles by cameraRotationIndex:
   * 0: 45°  (Camera in +X, +Z quadrant -> North (-Z) and West (-X) are BACK walls; South (+Z) and East (+X) are FRONT cutaway)
   * 1: 135° (Camera in -X, +Z quadrant -> North (-Z) and East (+X) are BACK walls; South (+Z) and West (-X) are FRONT cutaway)
   * 2: 225° (Camera in -X, -Z quadrant -> South (+Z) and East (+X) are BACK walls; North (-Z) and West (-X) are FRONT cutaway)
   * 3: 315° (Camera in +X, -Z quadrant -> South (+Z) and West (-X) are BACK walls; North (-Z) and East (+X) are FRONT cutaway)
   */
  const isNorthFull = cameraRotationIndex === 0 || cameraRotationIndex === 1;
  const isWestFull = cameraRotationIndex === 0 || cameraRotationIndex === 3;
  const isSouthFull = cameraRotationIndex === 2 || cameraRotationIndex === 3;
  const isEastFull = cameraRotationIndex === 1 || cameraRotationIndex === 2;

  const northH = isNorthFull ? FULL_WALL_HEIGHT : CUTAWAY_CURB_HEIGHT;
  const southH = isSouthFull ? FULL_WALL_HEIGHT : CUTAWAY_CURB_HEIGHT;
  const westH = isWestFull ? FULL_WALL_HEIGHT : CUTAWAY_CURB_HEIGHT;
  const eastH = isEastFull ? FULL_WALL_HEIGHT : CUTAWAY_CURB_HEIGHT;

  return (
    <group name="cutaway-shop-room">
      {/* High-Contrast Shop Floor Slab */}
      <RoundedBox
        args={[roomSpan, 0.14, roomSpan]}
        radius={0.04}
        smoothness={2}
        position={[0, -0.07, 0]}
        receiveShadow
      >
        <meshToonMaterial map={floorTexture} gradientMap={gradientMap} />
        <Outlines thickness={0.025} color={DARK_COCOA} />
      </RoundedBox>

      {/* Theme-Specific Center Circular Woven Pastel Rug */}
      <group position={[0, 0.008, 0.25]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[1.35, 32]} />
          <meshToonMaterial color={theme.rugHex} gradientMap={gradientMap} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} receiveShadow>
          <ringGeometry args={[1.15, 1.35, 32]} />
          <meshToonMaterial color={theme.accentHex} gradientMap={gradientMap} />
        </mesh>
      </group>

      {/* ================= NORTH WALL (-Z = -3.11m) ================= */}
      <group position={[0, 0, -halfSpan - WALL_THICKNESS / 2]}>
        <RoundedBox
          args={[roomSpan + WALL_THICKNESS * 2, northH, WALL_THICKNESS]}
          radius={0.05}
          smoothness={3}
          position={[0, northH / 2, 0]}
          castShadow
          receiveShadow
        >
          <meshToonMaterial color={theme.wallHex} gradientMap={gradientMap} />
          <Outlines thickness={0.03} color={DARK_COCOA} />
        </RoundedBox>

        {/* Wainscoting / Baseboard Trim (#5C4033 or theme trim) */}
        <RoundedBox
          args={[roomSpan + 0.04, 0.28, WALL_THICKNESS + 0.04]}
          radius={0.03}
          smoothness={2}
          position={[0, 0.14, 0.02]}
        >
          <meshToonMaterial color={theme.trimHex} gradientMap={gradientMap} />
          <Outlines thickness={0.02} color={DARK_COCOA} />
        </RoundedBox>

        {/* Full-Height Storefront Framed Window & Scalloped Pastel Awning Details */}
        {isNorthFull && (
          <group>
            {/* Left Framed Window */}
            <group position={[-1.45, 1.45, 0.12]}>
              <RoundedBox args={[1.55, 1.15, 0.08]} radius={0.04} smoothness={2}>
                <meshToonMaterial color={theme.trimHex} gradientMap={gradientMap} />
                <Outlines thickness={0.025} color={DARK_COCOA} />
              </RoundedBox>
              <RoundedBox args={[1.35, 0.95, 0.1]} radius={0.03} smoothness={2}>
                <meshToonMaterial color="#E0F2FE" gradientMap={gradientMap} />
              </RoundedBox>
              {/* Scalloped Interior Valance Awning */}
              <RoundedBox args={[1.62, 0.22, 0.18]} radius={0.06} smoothness={3} position={[0, 0.56, 0.06]}>
                <meshToonMaterial color={theme.accentHex} gradientMap={gradientMap} />
                <Outlines thickness={0.025} color={DARK_COCOA} />
              </RoundedBox>
            </group>

            {/* Right Framed Feature Poster / Window */}
            <group position={[1.45, 1.45, 0.12]}>
              <RoundedBox args={[1.55, 1.15, 0.08]} radius={0.04} smoothness={2}>
                <meshToonMaterial color={theme.trimHex} gradientMap={gradientMap} />
                <Outlines thickness={0.025} color={DARK_COCOA} />
              </RoundedBox>
              <RoundedBox args={[1.35, 0.95, 0.1]} radius={0.03} smoothness={2}>
                <meshToonMaterial color={theme.rugHex} gradientMap={gradientMap} />
              </RoundedBox>
              <RoundedBox args={[1.62, 0.22, 0.18]} radius={0.06} smoothness={3} position={[0, 0.56, 0.06]}>
                <meshToonMaterial color={theme.accentHex} gradientMap={gradientMap} />
                <Outlines thickness={0.025} color={DARK_COCOA} />
              </RoundedBox>
            </group>
          </group>
        )}
      </group>

      {/* ================= WEST WALL (-X = -3.11m) ================= */}
      <group position={[-halfSpan - WALL_THICKNESS / 2, 0, 0]}>
        <RoundedBox
          args={[WALL_THICKNESS, westH, roomSpan]}
          radius={0.05}
          smoothness={3}
          position={[0, westH / 2, 0]}
          castShadow
          receiveShadow
        >
          <meshToonMaterial color={theme.wallHex} gradientMap={gradientMap} />
          <Outlines thickness={0.03} color={DARK_COCOA} />
        </RoundedBox>

        {/* Baseboard Wainscoting */}
        <RoundedBox
          args={[WALL_THICKNESS + 0.04, 0.28, roomSpan - 0.04]}
          radius={0.03}
          smoothness={2}
          position={[0.02, 0.14, 0]}
        >
          <meshToonMaterial color={theme.trimHex} gradientMap={gradientMap} />
          <Outlines thickness={0.02} color={DARK_COCOA} />
        </RoundedBox>

        {isWestFull && (
          <group position={[0.12, 1.45, 0]}>
            <RoundedBox args={[0.08, 1.15, 2.2]} radius={0.04} smoothness={2}>
              <meshToonMaterial color={theme.trimHex} gradientMap={gradientMap} />
              <Outlines thickness={0.025} color={DARK_COCOA} />
            </RoundedBox>
            <RoundedBox args={[0.1, 0.95, 1.98]} radius={0.03} smoothness={2}>
              <meshToonMaterial color="#E0F2FE" gradientMap={gradientMap} />
            </RoundedBox>
            <RoundedBox args={[0.18, 0.22, 2.28]} radius={0.06} smoothness={3} position={[0.06, 0.56, 0]}>
              <meshToonMaterial color={theme.accentHex} gradientMap={gradientMap} />
              <Outlines thickness={0.025} color={DARK_COCOA} />
            </RoundedBox>
          </group>
        )}
      </group>

      {/* ================= SOUTH WALL (+Z = +3.11m, split for Entrance Doorway) ================= */}
      <group position={[0, 0, halfSpan + WALL_THICKNESS / 2]}>
        {/* Left segment of South Wall */}
        <RoundedBox
          args={[2.35, southH, WALL_THICKNESS]}
          radius={0.05}
          smoothness={3}
          position={[-1.92, southH / 2, 0]}
          castShadow
          receiveShadow
        >
          <meshToonMaterial color={theme.wallHex} gradientMap={gradientMap} />
          <Outlines thickness={0.03} color={DARK_COCOA} />
        </RoundedBox>
        {/* Right segment of South Wall */}
        <RoundedBox
          args={[2.35, southH, WALL_THICKNESS]}
          radius={0.05}
          smoothness={3}
          position={[1.92, southH / 2, 0]}
          castShadow
          receiveShadow
        >
          <meshToonMaterial color={theme.wallHex} gradientMap={gradientMap} />
          <Outlines thickness={0.03} color={DARK_COCOA} />
        </RoundedBox>
      </group>

      {/* ================= EAST WALL (+X = +3.11m) ================= */}
      <group position={[halfSpan + WALL_THICKNESS / 2, 0, 0]}>
        <RoundedBox
          args={[WALL_THICKNESS, eastH, roomSpan]}
          radius={0.05}
          smoothness={3}
          position={[0, eastH / 2, 0]}
          castShadow
          receiveShadow
        >
          <meshToonMaterial color={theme.wallHex} gradientMap={gradientMap} />
          <Outlines thickness={0.03} color={DARK_COCOA} />
        </RoundedBox>
      </group>

      {/* Warm Hanging Pendant Lamps (anchored to back walls) */}
      <group position={[-1.2, 2.38, -1.2]}>
        <RoundedBox args={[0.42, 0.22, 0.42]} radius={0.1} smoothness={3}>
          <meshToonMaterial color="#FBBF24" gradientMap={gradientMap} />
          <Outlines thickness={0.025} color={DARK_COCOA} />
        </RoundedBox>
      </group>
      <group position={[1.2, 2.38, -1.2]}>
        <RoundedBox args={[0.42, 0.22, 0.42]} radius={0.1} smoothness={3}>
          <meshToonMaterial color="#FBBF24" gradientMap={gradientMap} />
          <Outlines thickness={0.025} color={DARK_COCOA} />
        </RoundedBox>
      </group>
    </group>
  );
};
