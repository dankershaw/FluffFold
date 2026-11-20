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
 */
export const ShopkeeperAvatar: React.FC = () => {
  const avatarTile = useGameStore((s) => s.avatarTile);
  const isBuildMode = useGameStore((s) => s.isBuildMode);
  const gradientMap = useMemo(() => getToonGradientMap(), []);

  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useMemo(() => {
    const [wx, , wz] = tileToWorld(avatarTile.x, avatarTile.z, 1, 1);
    return new THREE.Vector3(wx, 0, wz);
  }, [avatarTile.x, avatarTile.z]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.lerp(targetPos, Math.min(1, delta * 9));
    // Gentle cozy idle bob
    const bob = Math.sin(state.clock.elapsedTime * 3.2) * 0.018;
    groupRef.current.position.y = Math.max(0, bob);
  });

  const [initX, , initZ] = useMemo(
    () => tileToWorld(avatarTile.x, avatarTile.z, 1, 1),
    []
  );

  return (
    <group ref={groupRef} position={[initX, 0, initZ]} name="shopkeeper-avatar">
      {/* Chunky Boots */}
      <RoundedBox args={[0.13, 0.16, 0.17]} radius={0.05} position={[-0.09, 0.08, 0]} castShadow>
        <meshToonMaterial color="#5C4033" gradientMap={gradientMap} />
        <Outlines thickness={0.025} color={DARK_COCOA} />
      </RoundedBox>
      <RoundedBox args={[0.13, 0.16, 0.17]} radius={0.05} position={[0.09, 0.08, 0]} castShadow>
        <meshToonMaterial color="#5C4033" gradientMap={gradientMap} />
        <Outlines thickness={0.025} color={DARK_COCOA} />
      </RoundedBox>

      {/* Cozy Cream Sweater Torso */}
      <RoundedBox args={[0.38, 0.44, 0.28]} radius={0.11} smoothness={4} position={[0, 0.36, 0]} castShadow>
        <meshToonMaterial color="#FAF0E6" gradientMap={gradientMap} />
        <Outlines thickness={0.03} color={DARK_COCOA} />
      </RoundedBox>

      {/* Color-Coded Sage Green Shopkeeper Fabric Apron */}
      <RoundedBox args={[0.34, 0.38, 0.26]} radius={0.08} smoothness={3} position={[0, 0.33, 0.04]} castShadow>
        <meshToonMaterial color="#A7C4B5" gradientMap={gradientMap} />
        <Outlines thickness={0.025} color={DARK_COCOA} />
      </RoundedBox>

      {/* Chibi Arms */}
      <RoundedBox args={[0.12, 0.28, 0.12]} radius={0.05} position={[-0.24, 0.37, 0]} rotation={[0, 0, 0.18]} castShadow>
        <meshToonMaterial color="#FAF0E6" gradientMap={gradientMap} />
        <Outlines thickness={0.025} color={DARK_COCOA} />
      </RoundedBox>
      <RoundedBox args={[0.12, 0.28, 0.12]} radius={0.05} position={[0.24, 0.37, 0]} rotation={[0, 0, -0.18]} castShadow>
        <meshToonMaterial color="#FAF0E6" gradientMap={gradientMap} />
        <Outlines thickness={0.025} color={DARK_COCOA} />
      </RoundedBox>

      {/* Oversized Round Chibi Head (reaches ~1.25m total height with beanie) */}
      <group position={[0, 0.84, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.27, 20, 20]} />
          <meshToonMaterial color="#FDE68A" gradientMap={gradientMap} />
          <Outlines thickness={0.03} color={DARK_COCOA} />
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
          <Outlines thickness={0.03} color={DARK_COCOA} />
        </mesh>
        <mesh position={[0, 0.39, -0.02]} castShadow>
          <sphereGeometry args={[0.075, 12, 12]} />
          <meshToonMaterial color="#FFFDF9" gradientMap={gradientMap} />
          <Outlines thickness={0.022} color={DARK_COCOA} />
        </mesh>
      </group>

      {/* Diegetic Rounded Cream Speech Pill anchored 0.5m above the character's head */}
      {!isBuildMode && (
        <Html position={[0, 1.65, 0]} center distanceFactor={8} zIndexRange={[10, 0]}>
          <div className="pointer-events-none whitespace-nowrap rounded-full bg-[#FFFDF9] px-2.5 py-0.5 text-[11px] font-extrabold text-[#3D2C2E] border-2 border-[#3D2C2E] shadow-sm">
            Shopkeeper • Ready
          </div>
        </Html>
      )}
    </group>
  );
};
