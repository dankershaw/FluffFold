import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Outlines, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { tileToWorld } from '../../utils/gridValidator';
import { getToonGradientMap } from '../../utils/toonMaterials';

const DARK_COCOA = '#3D2C2E';

/**
 * Chunky Shopkeeper Avatar with Animal Crossing proportions:
 * 1.25m tall, oversized round head, cute dot eyes, rosy cheek blush decals,
 * cozy beanie cap, and color-coded sage-green fabric apron (#A7C4B5).
 *
 * Milestone 2:
 * - Follows multi-tile A* paths step-by-step across the 12x12 floor
 * - Smoothly rotates towards walking direction
 * - Raises arms and carries a wholesale Delivery Case Box overhead when `carriedBox !== null`
 * - Renders A* path breadcrumb dots on the floor
 */
export const ShopkeeperAvatar: React.FC = () => {
  const avatarTile = useGameStore((s) => s.avatarTile);
  const avatarPath = useGameStore((s) => s.avatarPath);
  const carriedBox = useGameStore((s) => s.carriedBox);
  const products = useGameStore((s) => s.products);
  const isBuildMode = useGameStore((s) => s.isBuildMode);

  const gradientMap = useMemo(() => getToonGradientMap(), []);

  const groupRef = useRef<THREE.Group>(null);
  const facingAngleRef = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Read fresh path & tile state directly from store so useFrame never stales during rapid A* steps
    const storeState = useGameStore.getState();
    const nextWaypoint =
      storeState.avatarPath.length > 0
        ? storeState.avatarPath[0]
        : storeState.avatarTile;

    const [tx, , tz] = tileToWorld(nextWaypoint.x, nextWaypoint.z, 1, 1);

    const currentPos = groupRef.current.position;
    const dx = tx - currentPos.x;
    const dz = tz - currentPos.z;
    const dist = Math.hypot(dx, dz);

    // Clamp delta to max 0.1s and traverse A* tiles smoothly at 3.8m/s
    const dt = Math.min(0.1, delta);
    const walkSpeed = 3.8;

    if (dist > 0.04) {
      const stepDist = Math.min(dist, walkSpeed * dt);
      currentPos.x += (dx / dist) * stepDist;
      currentPos.z += (dz / dist) * stepDist;

      // Smoothly turn towards walking direction
      const desiredAngle = Math.atan2(dx, dz);
      let angleDiff = desiredAngle - facingAngleRef.current;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      facingAngleRef.current += angleDiff * Math.min(1, dt * 15);
      groupRef.current.rotation.y = facingAngleRef.current;

      // Energetic walking hop
      currentPos.y = Math.abs(Math.sin(state.clock.elapsedTime * 14)) * 0.055;
    } else {
      currentPos.x = tx;
      currentPos.z = tz;
      // Gentle cozy idle bob
      currentPos.y = Math.max(0, Math.sin(state.clock.elapsedTime * 3.2) * 0.016);

      if (storeState.avatarPath.length > 0) {
        storeState.advanceAvatarStep();
      }
    }
  });

  const [initX, , initZ] = useMemo(
    () => tileToWorld(avatarTile.x, avatarTile.z, 1, 1),
    []
  );

  const carriedSku = useMemo(
    () => (carriedBox ? products.find((p) => p.skuId === carriedBox.skuId) : null),
    [carriedBox, products]
  );

  const statusText = useMemo(() => {
    if (carriedBox) {
      return `📦 Carrying ${carriedSku?.displayName.split(' ')[0] ?? 'Case'} (${carriedBox.unitsRemaining} left)`;
    }
    if (avatarPath.length > 0) {
      return 'Walking...';
    }
    return 'Shopkeeper • Ready';
  }, [carriedBox, carriedSku, avatarPath.length]);

  return (
    <>
      {/* A* Path Floor Waypoint Dots */}
      {avatarPath.length > 0 && (
        <group name="astar-waypoint-trail">
          {avatarPath.map((wp, idx) => {
            const [wx, , wz] = tileToWorld(wp.x, wp.z, 1, 1);
            const isGoal = idx === avatarPath.length - 1;
            return (
              <mesh
                key={`wp-${wp.x}-${wp.z}-${idx}`}
                position={[wx, 0.025, wz]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <circleGeometry args={[isGoal ? 0.14 : 0.07, 16]} />
                <meshBasicMaterial color={isGoal ? '#10B981' : '#FBBF24'} />
              </mesh>
            );
          })}
        </group>
      )}

      <group ref={groupRef} position={[initX, 0, initZ]} name="shopkeeper-avatar">
        {/* Chunky Boots */}
        <RoundedBox args={[0.13, 0.16, 0.17]} radius={0.04} position={[-0.09, 0.08, 0]} castShadow>
          <meshToonMaterial color="#5C4033" gradientMap={gradientMap} />
          <Outlines screenspace thickness={0.022} color={DARK_COCOA} />
        </RoundedBox>
        <RoundedBox args={[0.13, 0.16, 0.17]} radius={0.04} position={[0.09, 0.08, 0]} castShadow>
          <meshToonMaterial color="#5C4033" gradientMap={gradientMap} />
          <Outlines screenspace thickness={0.022} color={DARK_COCOA} />
        </RoundedBox>

        {/* Cozy Cream Sweater Torso */}
        <RoundedBox args={[0.38, 0.44, 0.28]} radius={0.09} smoothness={4} position={[0, 0.36, 0]} castShadow>
          <meshToonMaterial color="#FAF0E6" gradientMap={gradientMap} />
          <Outlines screenspace thickness={0.028} color={DARK_COCOA} />
        </RoundedBox>

        {/* Color-Coded Sage Green Shopkeeper Fabric Apron */}
        <RoundedBox args={[0.34, 0.38, 0.26]} radius={0.07} smoothness={3} position={[0, 0.33, 0.04]} castShadow>
          <meshToonMaterial color="#A7C4B5" gradientMap={gradientMap} />
          <Outlines screenspace thickness={0.022} color={DARK_COCOA} />
        </RoundedBox>

        {/* Chibi Arms — raise overhead when carrying a Delivery Box */}
        <RoundedBox
          args={[0.12, 0.28, 0.12]}
          radius={0.04}
          position={carriedBox ? [-0.23, 0.68, 0.06] : [-0.24, 0.37, 0]}
          rotation={carriedBox ? [0, 0, -0.25] : [0, 0, 0.18]}
          castShadow
        >
          <meshToonMaterial color="#FAF0E6" gradientMap={gradientMap} />
          <Outlines screenspace thickness={0.022} color={DARK_COCOA} />
        </RoundedBox>
        <RoundedBox
          args={[0.12, 0.28, 0.12]}
          radius={0.04}
          position={carriedBox ? [0.23, 0.68, 0.06] : [0.24, 0.37, 0]}
          rotation={carriedBox ? [0, 0, 0.25] : [0, 0, -0.18]}
          castShadow
        >
          <meshToonMaterial color="#FAF0E6" gradientMap={gradientMap} />
          <Outlines screenspace thickness={0.022} color={DARK_COCOA} />
        </RoundedBox>

        {/* Oversized Round Chibi Head (reaches ~1.25m total height with beanie) */}
        <group position={[0, 0.84, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.27, 20, 20]} />
            <meshToonMaterial color="#FDE68A" gradientMap={gradientMap} />
            <Outlines screenspace thickness={0.028} color={DARK_COCOA} />
          </mesh>

          {/* Cute Dot Eyes */}
          <mesh position={[-0.09, 0.02, 0.24]}>
            <sphereGeometry args={[0.032, 10, 10]} />
            <meshBasicMaterial color={DARK_COCOA} />
          </mesh>
          <mesh position={[0.09, 0.02, 0.24]}>
            <sphereGeometry args={[0.032, 10, 10]} />
            <meshBasicMaterial color={DARK_COCOA} />
          </mesh>

          {/* Rosy Cheek Blush Decals */}
          <mesh position={[-0.15, -0.04, 0.22]}>
            <sphereGeometry args={[0.038, 10, 10]} />
            <meshBasicMaterial color="#F472B6" />
          </mesh>
          <mesh position={[0.15, -0.04, 0.22]}>
            <sphereGeometry args={[0.038, 10, 10]} />
            <meshBasicMaterial color="#F472B6" />
          </mesh>

          {/* Pastel Lavender Knit Beanie Cap & Pom-Pom */}
          <mesh position={[0, 0.12, -0.02]} castShadow>
            <sphereGeometry args={[0.26, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
            <meshToonMaterial color="#E9D8FD" gradientMap={gradientMap} />
            <Outlines screenspace thickness={0.025} color={DARK_COCOA} />
          </mesh>
          <mesh position={[0, 0.39, -0.02]} castShadow>
            <sphereGeometry args={[0.075, 12, 12]} />
            <meshToonMaterial color="#FFFDF9" gradientMap={gradientMap} />
            <Outlines screenspace thickness={0.02} color={DARK_COCOA} />
          </mesh>
        </group>

        {/* Overhead Carried Wholesale Case Box */}
        {carriedBox && (
          <group position={[0, 1.38, 0.04]}>
            <RoundedBox args={[0.38, 0.32, 0.38]} radius={0.05} smoothness={3} castShadow>
              <meshToonMaterial color="#D9A066" gradientMap={gradientMap} />
              <Outlines screenspace thickness={0.025} color={DARK_COCOA} />
            </RoundedBox>
            <RoundedBox args={[0.4, 0.04, 0.12]} radius={0.015} smoothness={2} position={[0, 0.15, 0]}>
              <meshToonMaterial color="#FAF0E6" gradientMap={gradientMap} />
            </RoundedBox>
          </group>
        )}

        {/* Diegetic Rounded Cream Speech Pill anchored above the character's head */}
        {!isBuildMode && (
          <Html
            position={[0, carriedBox ? 1.82 : 1.5, 0]}
            center
            zIndexRange={[10, 0]}
          >
            <div
              className={`pointer-events-none whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-extrabold text-[#3D2C2E] border-2 border-[#3D2C2E] shadow-sm ${
                carriedBox ? 'bg-[#FEF3C7]' : 'bg-[#FFFDF9]'
              }`}
            >
              {statusText}
            </div>
          </Html>
        )}
      </group>
    </>
  );
};
