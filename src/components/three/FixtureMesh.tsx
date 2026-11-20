import React, { useMemo } from 'react';
import { Html, Outlines, RoundedBox } from '@react-three/drei';
import { FIXTURE_DEFINITIONS, STARTER_PRODUCTS } from '../../constants/gameData';
import { useGameStore } from '../../store/useGameStore';
import { FixtureTypeId, PlacedFixture } from '../../types/game';
import { getFixtureTiles, tileToWorld, TILE_SIZE_METERS } from '../../utils/gridValidator';
import { getProductLabelTexture, getToonGradientMap } from '../../utils/toonMaterials';

const DARK_COCOA = '#3D2C2E';

interface FixtureMeshProps {
  fixture: PlacedFixture;
  isGhost?: boolean;
  isValidGhost?: boolean;
}

/**
 * Renders an individual cel-shaded retail fixture with <Outlines screenspace thickness={0.03} color="#3D2C2E" />
 * and exact slot-based product anchor coordinates so stocked items snap neatly inside shelf bays.
 */
export const FixtureMesh: React.FC<FixtureMeshProps> = ({
  fixture,
  isGhost = false,
  isValidGhost = true,
}) => {
  const cameraZoom = useGameStore((s) => s.cameraZoom);
  const selectedFixtureId = useGameStore((s) => s.selectedFixtureId);
  const selectFixture = useGameStore((s) => s.selectFixture);
  const isBuildMode = useGameStore((s) => s.isBuildMode);
  const products = useGameStore((s) => s.products);

  const gradientMap = useMemo(() => getToonGradientMap(), []);
  const def = FIXTURE_DEFINITIONS[fixture.typeId];
  const { width, depth } = getFixtureTiles(
    fixture.typeId,
    fixture.tileX,
    fixture.tileZ,
    fixture.rotation
  );

  const worldPos = tileToWorld(fixture.tileX, fixture.tileZ, width, depth);
  const rotY = -(fixture.rotation * Math.PI) / 2;

  const assignedSku = useMemo(
    () =>
      products.find((p) => p.skuId === fixture.assignedSkuId) ||
      STARTER_PRODUCTS[0],
    [products, fixture.assignedSkuId]
  );

  const labelTex = useMemo(
    () =>
      getProductLabelTexture(
        (assignedSku.catalogId as 'Medical' | 'Little' | 'Middle' | 'Caregiver') || 'Little'
      ),
    [assignedSku.catalogId]
  );

  const ghostColor = isValidGhost ? '#10B981' : '#EF4444';
  const isSelected = !isGhost && selectedFixtureId === fixture.id;
  const showPricePill = !isGhost && (cameraZoom > 1.2 || isSelected) && def.slotCapacity > 0;

  // Slot-based shelf anchor coordinates (Row x Column) inside a 2x1 Timber Gondola Shelf (1.0m x 0.5m)
  const standardShelfSlots: [number, number, number][] = [
    [-0.26, 0.34, 0.05],
    [0.0, 0.34, 0.05],
    [0.26, 0.34, 0.05],
    [-0.26, 0.76, 0.05],
    [0.0, 0.76, 0.05],
    [0.26, 0.76, 0.05],
  ];

  // End-cap display anchor slots (1x1 tile = 0.5m x 0.5m)
  const endCapSlots: [number, number, number][] = [
    [-0.1, 0.38, 0.05],
    [0.1, 0.38, 0.05],
    [-0.1, 0.74, 0.05],
    [0.1, 0.74, 0.05],
  ];

  const renderVisualBody = (typeId: FixtureTypeId) => {
    const matProps = isGhost
      ? { color: ghostColor, transparent: true, opacity: 0.72, gradientMap }
      : { gradientMap };

    if (typeId === 'StandardShelf') {
      return (
        <group>
          {/* Chunky Rounded Timber Base & Backboard */}
          <RoundedBox args={[0.92, 0.14, 0.44]} radius={0.04} smoothness={3} position={[0, 0.07, 0]} castShadow receiveShadow>
            <meshToonMaterial color={isGhost ? ghostColor : '#A47148'} {...matProps} />
            <Outlines screenspace thickness={0.03} color={DARK_COCOA} />
          </RoundedBox>
          <RoundedBox args={[0.92, 1.05, 0.1]} radius={0.03} smoothness={3} position={[0, 0.56, -0.16]} castShadow>
            <meshToonMaterial color={isGhost ? ghostColor : '#C88A55'} {...matProps} />
            <Outlines screenspace thickness={0.03} color={DARK_COCOA} />
          </RoundedBox>
          {/* Middle Timber Shelf Deck */}
          <RoundedBox args={[0.9, 0.07, 0.42]} radius={0.025} smoothness={2} position={[0, 0.54, 0]} castShadow>
            <meshToonMaterial color={isGhost ? ghostColor : '#B47B48'} {...matProps} />
            <Outlines screenspace thickness={0.022} color={DARK_COCOA} />
          </RoundedBox>
          {/* Pastel Top Header Trim Awning */}
          <RoundedBox args={[0.96, 0.14, 0.46]} radius={0.05} smoothness={3} position={[0, 1.08, 0]} castShadow>
            <meshToonMaterial color={isGhost ? ghostColor : '#A7C4B5'} {...matProps} />
            <Outlines screenspace thickness={0.03} color={DARK_COCOA} />
          </RoundedBox>

          {/* Slot-Based Stocked Pillow-Pack Diaper Bags (using boxGeometry so canvas label UVs map 0..1 cleanly) */}
          {!isGhost &&
            standardShelfSlots.slice(0, fixture.stockedItemCount).map((slotPos, idx) => (
              <mesh
                key={`slot-${idx}`}
                position={slotPos}
                castShadow
              >
                <boxGeometry args={[0.21, 0.25, 0.22]} />
                <meshToonMaterial map={labelTex} gradientMap={gradientMap} />
                <Outlines screenspace thickness={0.022} color={DARK_COCOA} />
              </mesh>
            ))}
        </group>
      );
    }

    if (typeId === 'EndCapDisplay') {
      return (
        <group>
          {/* Woven Wicker Base Stand */}
          <RoundedBox args={[0.45, 0.22, 0.45]} radius={0.05} smoothness={3} position={[0, 0.11, 0]} castShadow>
            <meshToonMaterial color={isGhost ? ghostColor : '#C88A55'} {...matProps} />
            <Outlines screenspace thickness={0.03} color={DARK_COCOA} />
          </RoundedBox>
          <RoundedBox args={[0.44, 0.92, 0.1]} radius={0.03} smoothness={3} position={[0, 0.54, -0.16]} castShadow>
            <meshToonMaterial color={isGhost ? ghostColor : '#FAF0E6'} {...matProps} />
            <Outlines screenspace thickness={0.03} color={DARK_COCOA} />
          </RoundedBox>
          <RoundedBox args={[0.44, 0.06, 0.42]} radius={0.02} smoothness={2} position={[0, 0.56, 0]}>
            <meshToonMaterial color={isGhost ? ghostColor : '#D9A066'} {...matProps} />
            <Outlines screenspace thickness={0.022} color={DARK_COCOA} />
          </RoundedBox>
          {/* Scalloped Pastel Fabric Awning */}
          <RoundedBox args={[0.5, 0.16, 0.5]} radius={0.06} smoothness={3} position={[0, 1.02, 0]} castShadow>
            <meshToonMaterial color={isGhost ? ghostColor : '#FBCFE8'} {...matProps} />
            <Outlines screenspace thickness={0.03} color={DARK_COCOA} />
          </RoundedBox>

          {/* Stocked Bunny Plushies in exact slot anchors */}
          {!isGhost &&
            endCapSlots.slice(0, fixture.stockedItemCount).map((slotPos, idx) => (
              <group key={`plush-${idx}`} position={slotPos}>
                <mesh castShadow>
                  <sphereGeometry args={[0.085, 14, 14]} />
                  <meshToonMaterial color={idx % 2 === 0 ? '#FBCFE8' : '#E9D8FD'} gradientMap={gradientMap} />
                  <Outlines screenspace thickness={0.02} color={DARK_COCOA} />
                </mesh>
                {/* Bunny Ears */}
                <mesh position={[-0.035, 0.09, 0]}>
                  <capsuleGeometry args={[0.018, 0.06, 6, 8]} />
                  <meshToonMaterial color={idx % 2 === 0 ? '#FBCFE8' : '#E9D8FD'} gradientMap={gradientMap} />
                  <Outlines screenspace thickness={0.015} color={DARK_COCOA} />
                </mesh>
                <mesh position={[0.035, 0.09, 0]}>
                  <capsuleGeometry args={[0.018, 0.06, 6, 8]} />
                  <meshToonMaterial color={idx % 2 === 0 ? '#FBCFE8' : '#E9D8FD'} gradientMap={gradientMap} />
                  <Outlines screenspace thickness={0.015} color={DARK_COCOA} />
                </mesh>
              </group>
            ))}
        </group>
      );
    }

    if (typeId === 'CheckoutCounter') {
      return (
        <group>
          {/* 3x2 Tiles (1.5m x 1.0m) Chunky Timber & Cream Counter Body */}
          <RoundedBox args={[1.42, 0.86, 0.88]} radius={0.08} smoothness={4} position={[0, 0.43, 0]} castShadow receiveShadow>
            <meshToonMaterial color={isGhost ? ghostColor : '#B47B48'} {...matProps} />
            <Outlines screenspace thickness={0.03} color={DARK_COCOA} />
          </RoundedBox>
          {/* Warm Butcher-Block Countertop */}
          <RoundedBox args={[1.48, 0.12, 0.94]} radius={0.04} smoothness={3} position={[0, 0.88, 0]} castShadow>
            <meshToonMaterial color={isGhost ? ghostColor : '#FAF0E6'} {...matProps} />
            <Outlines screenspace thickness={0.03} color={DARK_COCOA} />
          </RoundedBox>
          {/* Vintage Cash Register Till */}
          <RoundedBox args={[0.42, 0.34, 0.36]} radius={0.06} smoothness={3} position={[-0.36, 1.06, -0.06]} castShadow>
            <meshToonMaterial color={isGhost ? ghostColor : '#FBBF24'} {...matProps} />
            <Outlines screenspace thickness={0.03} color={DARK_COCOA} />
          </RoundedBox>
          {/* Discreet Plain Kraft Bag Dispenser Stack */}
          <RoundedBox args={[0.38, 0.18, 0.32]} radius={0.04} smoothness={2} position={[0.36, 0.98, 0.08]} castShadow>
            <meshToonMaterial color={isGhost ? ghostColor : '#D9A066'} {...matProps} />
            <Outlines screenspace thickness={0.025} color={DARK_COCOA} />
          </RoundedBox>
        </group>
      );
    }

    if (typeId === 'PackingBench') {
      return (
        <group>
          {/* 3x1 Tiles (1.5m x 0.5m) Mail Order Packing Station */}
          <RoundedBox args={[1.42, 0.82, 0.44]} radius={0.06} smoothness={3} position={[0, 0.41, 0]} castShadow>
            <meshToonMaterial color={isGhost ? ghostColor : '#8D6E63'} {...matProps} />
            <Outlines screenspace thickness={0.03} color={DARK_COCOA} />
          </RoundedBox>
          <RoundedBox args={[1.46, 0.1, 0.48]} radius={0.04} smoothness={2} position={[0, 0.84, 0]} castShadow>
            <meshToonMaterial color={isGhost ? ghostColor : '#D9A066'} {...matProps} />
            <Outlines screenspace thickness={0.03} color={DARK_COCOA} />
          </RoundedBox>
          {/* Shipping Carton & Tape Dispenser on Bench */}
          <RoundedBox args={[0.36, 0.28, 0.32]} radius={0.04} smoothness={2} position={[-0.25, 1.01, 0]} castShadow>
            <meshToonMaterial color={isGhost ? ghostColor : '#C88A55'} {...matProps} />
            <Outlines screenspace thickness={0.025} color={DARK_COCOA} />
          </RoundedBox>
        </group>
      );
    }

    // StockroomRack (2x1 tiles)
    return (
      <group>
        <RoundedBox args={[0.92, 1.18, 0.44]} radius={0.05} smoothness={3} position={[0, 0.59, 0]} castShadow>
          <meshToonMaterial color={isGhost ? ghostColor : '#64748B'} {...matProps} />
          <Outlines screenspace thickness={0.03} color={DARK_COCOA} />
        </RoundedBox>
        <RoundedBox args={[0.78, 0.34, 0.36]} radius={0.04} smoothness={2} position={[0, 0.38, 0.04]}>
          <meshToonMaterial color={isGhost ? ghostColor : '#D9A066'} {...matProps} />
          <Outlines screenspace thickness={0.025} color={DARK_COCOA} />
        </RoundedBox>
        <RoundedBox args={[0.78, 0.34, 0.36]} radius={0.04} smoothness={2} position={[0, 0.86, 0.04]}>
          <meshToonMaterial color={isGhost ? ghostColor : '#D9A066'} {...matProps} />
          <Outlines screenspace thickness={0.025} color={DARK_COCOA} />
        </RoundedBox>
      </group>
    );
  };

  return (
    <group
      position={worldPos}
      rotation={[0, rotY, 0]}
      onClick={(e) => {
        if (isGhost || isBuildMode) return;
        e.stopPropagation();
        selectFixture(isSelected ? null : fixture.id);
      }}
    >
      {renderVisualBody(fixture.typeId)}

      {/* Subtle Selection Ground Ring when tapped */}
      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.38, 0.48, 28]} />
          <meshBasicMaterial color="#FBBF24" />
        </mesh>
      )}

      {/* Diegetic Shelf Price Tag Pill — renders only when zoomed in (zoom > 1.2x) or tapped */}
      {showPricePill && (
        <Html
          position={[0, 1.38, 0]}
          center
          zIndexRange={[10, 0]}
        >
          <div className="pointer-events-none whitespace-nowrap rounded-full bg-[#FFFDF9] px-2.5 py-0.5 text-[11px] font-extrabold text-[#3D2C2E] border-2 border-[#3D2C2E] shadow-sm">
            {assignedSku.displayName.split(' ')[0]} • {assignedSku.currentRetailPrice} CC
          </div>
        </Html>
      )}
    </group>
  );
};

/**
 * Renders all placed fixtures plus the live 1-tile snapped emerald/crimson Ghost Preview
 * with clearance tile indicators when Build Mode is active.
 */
export const ShopFixturesLayer: React.FC<{
  validationResult: {
    valid: boolean;
    footprintTiles: { x: number; z: number }[];
    clearanceTiles: { x: number; z: number; role: 'interaction' | 'queue' | 'worker' }[];
  } | null;
}> = ({ validationResult }) => {
  const placedFixtures = useGameStore((s) => s.placedFixtures);
  const isBuildMode = useGameStore((s) => s.isBuildMode);
  const selectedBuildFixture = useGameStore((s) => s.selectedBuildFixture);
  const buildRotation = useGameStore((s) => s.buildRotation);
  const hoveredTile = useGameStore((s) => s.hoveredTile);

  return (
    <group name="shop-fixtures-layer">
      {placedFixtures.map((fix) => (
        <FixtureMesh key={fix.id} fixture={fix} />
      ))}

      {/* Live 1-Tile Placement Ghost Preview + Footprint & Clearance Tile Markers */}
      {isBuildMode && hoveredTile && validationResult && (
        <group>
          <FixtureMesh
            fixture={{
              id: 'build-ghost',
              typeId: selectedBuildFixture,
              tileX: hoveredTile.x,
              tileZ: hoveredTile.z,
              rotation: buildRotation,
              stockedItemCount: 0,
            }}
            isGhost
            isValidGhost={validationResult.valid}
          />

          {/* Footprint Tile Highlight Pads (Emerald #10B981 when valid, Crimson #EF4444 when invalid) */}
          {validationResult.footprintTiles.map((t, i) => {
            const [wx, , wz] = tileToWorld(t.x, t.z, 1, 1);
            return (
              <mesh
                key={`fp-${i}`}
                position={[wx, 0.025, wz]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[TILE_SIZE_METERS * 0.9, TILE_SIZE_METERS * 0.9]} />
                <meshBasicMaterial
                  color={validationResult.valid ? '#10B981' : '#EF4444'}
                  transparent
                  opacity={0.75}
                />
              </mesh>
            );
          })}

          {/* Required Interaction / Queue / Worker Clearance Tile Pads */}
          {validationResult.clearanceTiles.map((c, i) => {
            const [wx, , wz] = tileToWorld(c.x, c.z, 1, 1);
            return (
              <mesh
                key={`cl-${i}`}
                position={[wx, 0.022, wz]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[TILE_SIZE_METERS * 0.82, TILE_SIZE_METERS * 0.82]} />
                <meshBasicMaterial
                  color={validationResult.valid ? '#38BDF8' : '#FCA5A5'}
                  transparent
                  opacity={0.6}
                />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
};
