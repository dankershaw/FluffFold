import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import {
  GRID_SIZE,
  TILE_SIZE_METERS,
  validateFixturePlacement,
  worldToTile,
} from '../../utils/gridValidator';
import { CutawayShopRoom } from './CutawayShopRoom';
import { ExteriorDioramaBorder } from './ExteriorDioramaBorder';
import { ShopFixturesLayer } from './FixtureMesh';
import { ShopkeeperAvatar } from './ShopkeeperAvatar';

/**
 * Isometric Camera Rig pitched at 35.264° elevation and 45° (+ 90° steps) Y-axis rotation.
 * Supports single-finger drag to pan across the shop floor, two-finger pinch / wheel to zoom (0.6x to 2.2x),
 * and smooth 90° camera rotation interpolation.
 */
const IsometricCameraRig: React.FC<{ panOffset: React.MutableRefObject<THREE.Vector3> }> = ({
  panOffset,
}) => {
  const cameraRotationIndex = useGameStore((s) => s.cameraRotationIndex);
  const cameraZoom = useGameStore((s) => s.cameraZoom);
  const { camera, size } = useThree();

  const currentAngleRef = useRef(Math.PI / 4);

  useFrame((_, delta) => {
    const targetAzimuth = Math.PI / 4 + cameraRotationIndex * (Math.PI / 2);
    // Shortest angular interpolation
    let diff = targetAzimuth - currentAngleRef.current;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    currentAngleRef.current += diff * Math.min(1, delta * 9);

    // True isometric elevation = arctan(1 / sqrt(2)) ≈ 35.2643897° (0.6154797 rad)
    const elevation = 0.6154797;
    const distance = 18;
    const horizDist = distance * Math.cos(elevation);
    const yHeight = distance * Math.sin(elevation);

    const cx = panOffset.current.x + horizDist * Math.sin(currentAngleRef.current);
    const cz = panOffset.current.z + horizDist * Math.cos(currentAngleRef.current);

    camera.position.set(cx, yHeight + 0.5, cz);
    camera.lookAt(panOffset.current.x, 0.45, panOffset.current.z);

    // Responsive base frustum zoom so the 12x12 shop fits both <640px phones and >=640px tablets
    const baseZoom = Math.min(size.width, size.height) < 520 ? 48 : 66;
    const nextZoom = baseZoom * cameraZoom;
    if (Math.abs(camera.zoom - nextZoom) > 0.05) {
      camera.zoom = THREE.MathUtils.lerp(camera.zoom, nextZoom, Math.min(1, delta * 12));
      camera.updateProjectionMatrix();
    }
  });

  return (
    <OrthographicCamera
      makeDefault
      position={[10.4, 10.9, 10.4]}
      zoom={68}
      near={-30}
      far={80}
    />
  );
};

export const IsometricShopCanvas: React.FC = () => {
  const isBuildMode = useGameStore((s) => s.isBuildMode);
  const selectedBuildFixture = useGameStore((s) => s.selectedBuildFixture);
  const buildRotation = useGameStore((s) => s.buildRotation);
  const hoveredTile = useGameStore((s) => s.hoveredTile);
  const placedFixtures = useGameStore((s) => s.placedFixtures);
  const setHoveredTile = useGameStore((s) => s.setHoveredTile);
  const placeFixtureAt = useGameStore((s) => s.placeFixtureAt);
  const moveAvatarTo = useGameStore((s) => s.moveAvatarTo);
  const cameraZoom = useGameStore((s) => s.cameraZoom);
  const setCameraZoom = useGameStore((s) => s.setCameraZoom);
  const cameraRotationIndex = useGameStore((s) => s.cameraRotationIndex);

  const panOffsetRef = useRef(new THREE.Vector3(0, 0, 0));
  const dragStateRef = useRef<{
    isDown: boolean;
    hasMoved: boolean;
    startX: number;
    startY: number;
    pinchStartDist: number | null;
    pinchStartZoom: number;
  }>({
    isDown: false,
    hasMoved: false,
    startX: 0,
    startY: 0,
    pinchStartDist: null,
    pinchStartZoom: 1.15,
  });

  // Live 1-Tile Placement Validation Result
  const validationResult = useMemo(() => {
    if (!isBuildMode || !hoveredTile) return null;
    return validateFixturePlacement(
      selectedBuildFixture,
      hoveredTile.x,
      hoveredTile.z,
      buildRotation,
      placedFixtures,
      GRID_SIZE
    );
  }, [isBuildMode, hoveredTile, selectedBuildFixture, buildRotation, placedFixtures]);

  // Attach touch pinch-to-zoom & single-finger pan listeners on the wrapper container
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      setCameraZoom(useGameStore.getState().cameraZoom + delta);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        dragStateRef.current.pinchStartDist = Math.hypot(dx, dy);
        dragStateRef.current.pinchStartZoom = useGameStore.getState().cameraZoom;
      } else if (e.touches.length === 1) {
        dragStateRef.current.isDown = true;
        dragStateRef.current.hasMoved = false;
        dragStateRef.current.startX = e.touches[0].clientX;
        dragStateRef.current.startY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && dragStateRef.current.pinchStartDist) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const ratio = dist / dragStateRef.current.pinchStartDist;
        setCameraZoom(dragStateRef.current.pinchStartZoom * ratio);
      } else if (e.touches.length === 1 && dragStateRef.current.isDown) {
        const dx = e.touches[0].clientX - dragStateRef.current.startX;
        const dy = e.touches[0].clientY - dragStateRef.current.startY;
        if (Math.hypot(dx, dy) > 8) {
          dragStateRef.current.hasMoved = true;
          const rotIdx = useGameStore.getState().cameraRotationIndex;
          const angle = Math.PI / 4 + rotIdx * (Math.PI / 2);
          const speed = 0.008 / useGameStore.getState().cameraZoom;
          const rightX = Math.cos(angle);
          const rightZ = -Math.sin(angle);
          const forwardX = -Math.sin(angle);
          const forwardZ = -Math.cos(angle);

          panOffsetRef.current.x = THREE.MathUtils.clamp(
            panOffsetRef.current.x - dx * speed * rightX + dy * speed * forwardX,
            -2.4,
            2.4
          );
          panOffsetRef.current.z = THREE.MathUtils.clamp(
            panOffsetRef.current.z - dx * speed * rightZ + dy * speed * forwardZ,
            -2.4,
            2.4
          );
          dragStateRef.current.startX = e.touches[0].clientX;
          dragStateRef.current.startY = e.touches[0].clientY;
        }
      }
    };

    const handleTouchEnd = () => {
      dragStateRef.current.isDown = false;
      dragStateRef.current.pinchStartDist = null;
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [setCameraZoom]);

  const handleFloorPointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const tile = worldToTile(e.point.x, e.point.z, GRID_SIZE);
    setHoveredTile(tile);
  };

  const handleFloorClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (dragStateRef.current.hasMoved) return;
    const tile = worldToTile(e.point.x, e.point.z, GRID_SIZE);
    setHoveredTile(tile);

    if (isBuildMode) {
      placeFixtureAt(tile.x, tile.z);
    } else {
      moveAvatarTo(tile);
    }
  };

  const roomSpan = GRID_SIZE * TILE_SIZE_METERS;

  return (
    <div
      ref={containerRef}
      id="isometric-shop-canvas-wrapper"
      className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#FFF5E4] via-[#FDF8F5] to-[#E6F4EA] touch-none"
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <IsometricCameraRig panOffset={panOffsetRef} />

        {/* Section 2.B: Golden-Hour Studio Lighting */}
        <hemisphereLight
          args={['#FFFBEB', '#D9A066', 0.95]}
        />
        <directionalLight
          color="#FFF3D6"
          intensity={2.0}
          position={[10, 16, 12]}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={1}
          shadow-camera-far={45}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
          shadow-bias={-0.0004}
        />

        {/* Grounding Contact Shadows under all characters, shelves & boxes */}
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.45}
          scale={20}
          blur={2.0}
          far={4}
          color="#2D1E1E"
        />

        {/* Exterior Lush Grass, Cobblestone Sidewalk, Delivery Bay & Welcome Sign */}
        <ExteriorDioramaBorder />

        {/* Dynamic Cutaway Dollhouse Room & Theme Decor */}
        <CutawayShopRoom />

        {/* Invisible Interactive 1-Tile Raycast Plane over the 12x12 Shop Floor */}
        <mesh
          position={[0, 0.015, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerMove={handleFloorPointerMove}
          onClick={handleFloorClick}
        >
          <planeGeometry args={[roomSpan, roomSpan]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Placed Retail Fixtures + Live 1-Tile Snapped Build Ghost */}
        <ShopFixturesLayer validationResult={validationResult} />

        {/* Chunky Chibi Shopkeeper Avatar */}
        <ShopkeeperAvatar />
      </Canvas>

      {/* Live Build Mode Floating Status Banner (Top-Left of Canvas) */}
      {isBuildMode && hoveredTile && validationResult && (
        <div
          id="build-validator-banner"
          className="pointer-events-none absolute left-3 top-20 sm:top-16 z-20 max-w-xs sm:max-w-sm rounded-2xl border-2 border-[#3D2C2E] bg-[#FFFDF9]/95 px-3.5 py-2.5 shadow-[0_4px_0_#3D2C2E]"
        >
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full border border-[#3D2C2E] ${
                validationResult.valid ? 'bg-[#10B981]' : 'bg-[#EF4444]'
              }`}
            />
            <span className="text-xs sm:text-sm font-black text-[#3D2C2E]">
              Tile ({hoveredTile.x}, {hoveredTile.z}) —{' '}
              {validationResult.valid ? 'Valid Placement (Path Clear)' : 'Placement Blocked'}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] font-bold text-[#5C4033]">
            {validationResult.valid
              ? 'Tap floor tile to snap fixture • Sky-blue tiles mark required customer/staff clearance.'
              : validationResult.reason}
          </p>
        </div>
      )}

      {/* Floating Camera Controls Pill (90° Rotate + Zoom Steppers, min 48x48px touch targets) */}
      <div
        id="camera-controls-cluster"
        className="absolute right-3 bottom-24 sm:bottom-6 z-20 flex flex-col gap-2"
      >
        <button
          id="btn-rotate-camera-90"
          type="button"
          onClick={() => useGameStore.getState().rotateCamera90()}
          title="Rotate Camera 90°"
          className="flex min-h-[48px] min-w-[48px] items-center justify-center gap-1.5 rounded-2xl border-2 border-[#3D2C2E] bg-[#FFFDF9] px-3 py-2 text-xs font-black text-[#3D2C2E] shadow-[0_3px_0_#3D2C2E] active:translate-y-0.5 transition"
        >
          <span>↻</span>
          <span>{45 + cameraRotationIndex * 90}°</span>
        </button>

        <div className="flex flex-col gap-2 rounded-2xl border-2 border-[#3D2C2E] bg-[#FFFDF9] p-1.5 shadow-[0_3px_0_#3D2C2E]">
          <button
            id="btn-zoom-in"
            type="button"
            onClick={() => setCameraZoom(cameraZoom + 0.2)}
            aria-label="Zoom In"
            className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl border-2 border-[#3D2C2E] bg-[#FAF0E6] text-base font-black text-[#3D2C2E] active:bg-[#A7C4B5]"
          >
            +
          </button>
          <div className="text-center text-[11px] font-black text-[#5C4033]">
            {cameraZoom.toFixed(1)}x
          </div>
          <button
            id="btn-zoom-out"
            type="button"
            onClick={() => setCameraZoom(cameraZoom - 0.2)}
            aria-label="Zoom Out"
            className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl border-2 border-[#3D2C2E] bg-[#FAF0E6] text-base font-black text-[#3D2C2E] active:bg-[#A7C4B5]"
          >
            −
          </button>
        </div>
      </div>
    </div>
  );
};
