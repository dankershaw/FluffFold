import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Outlines, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { getProductLabelTexture, getToonGradientMap } from '../../utils/toonMaterials';

const DARK_COCOA = '#3D2C2E';

// 4 Pallet slot offsets around the East Exterior Delivery Bay (x = 3.78, z = 1.35)
const PALLET_SLOT_OFFSETS: [number, number, number][] = [
  [-0.22, 0.28, -0.22],
  [0.22, 0.28, -0.22],
  [-0.22, 0.28, 0.22],
  [0.22, 0.28, 0.22],
];

/**
 * Animated 3D Pulse Ring Beacon for Tutorial Step 3 or newly delivered wholesale cases.
 */
const PulseBeaconRing: React.FC<{ color?: string }> = ({ color = '#10B981' }) => {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;
    const t = state.clock.elapsedTime * 3.5;
    const s = 1 + Math.sin(t) * 0.16;
    ringRef.current.scale.set(s, s, 1);
  });

  return (
    <mesh ref={ringRef} position={[0, -0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.26, 0.35, 24]} />
      <meshBasicMaterial color={color} transparent opacity={0.85} />
    </mesh>
  );
};

/**
 * Renders the Lush Cozy Grass (#7CB342), Cobblestone Sidewalk Border, Welcome Sign,
 * and the Interactive Exterior Delivery Bay with up to 4 clickable wholesale parcel boxes.
 */
export const ExteriorDioramaBorder: React.FC = () => {
  const gradientMap = useMemo(() => getToonGradientMap(), []);
  const deliveryBayBoxes = useGameStore((s) => s.deliveryBayBoxes);
  const products = useGameStore((s) => s.products);
  const interactWithDeliveryBox = useGameStore((s) => s.interactWithDeliveryBox);
  const tutorial = useGameStore((s) => s.tutorial);
  const isBuildMode = useGameStore((s) => s.isBuildMode);

  // Cobblestone tiles along the South (+Z) and East (+X) storefront walkway
  const cobblestones = useMemo(() => {
    const stones: { key: string; pos: [number, number, number]; size: [number, number, number]; color: string }[] = [];
    const palette = ['#CBD5E1', '#94A3B8', '#E2E8F0', '#D6D3D1'];
    let idx = 0;
    for (let x = -3.4; x <= 3.4; x += 0.65) {
      for (let z = 3.35; z <= 4.15; z += 0.55) {
        stones.push({
          key: `south-${idx}`,
          pos: [x + ((idx % 2) * 0.08), -0.02, z],
          size: [0.54, 0.08, 0.44],
          color: palette[idx % palette.length],
        });
        idx++;
      }
    }
    for (let z = -1.2; z <= 2.8; z += 0.65) {
      stones.push({
        key: `east-${idx}`,
        pos: [3.75, -0.02, z],
        size: [0.95, 0.08, 0.54],
        color: palette[idx % palette.length],
      });
      idx++;
    }
    return stones;
  }, []);

  const bushes = useMemo(
    () => [
      { pos: [-4.1, 0.28, -3.9] as [number, number, number], scale: 1.1, flower: '#F472B6' },
      { pos: [-4.2, 0.24, 0.5] as [number, number, number], scale: 0.95, flower: '#FBBF24' },
      { pos: [-3.9, 0.26, 3.8] as [number, number, number], scale: 1.05, flower: '#E9D8FD' },
      { pos: [4.1, 0.28, -3.8] as [number, number, number], scale: 1.1, flower: '#38BDF8' },
      { pos: [4.0, 0.25, 3.8] as [number, number, number], scale: 1.0, flower: '#F472B6' },
      { pos: [-1.4, 0.22, -4.1] as [number, number, number], scale: 0.9, flower: '#FBBF24' },
      { pos: [2.2, 0.24, -4.1] as [number, number, number], scale: 0.95, flower: '#FBCFE8' },
    ],
    []
  );

  const isTutorialDeliveryStep = tutorial.isActive && tutorial.currentStep === 3;

  return (
    <group name="exterior-diorama-border">
      {/* Lush Cozy Grass Island Base (#7CB342) */}
      <RoundedBox
        args={[11.2, 0.35, 11.2]}
        radius={0.14}
        smoothness={4}
        position={[0, -0.28, 0]}
        receiveShadow
      >
        <meshToonMaterial color="#7CB342" gradientMap={gradientMap} />
        <Outlines screenspace thickness={0.03} color={DARK_COCOA} />
      </RoundedBox>

      {/* Warm Earth Under-Slab Base */}
      <RoundedBox
        args={[10.8, 0.35, 10.8]}
        radius={0.12}
        smoothness={4}
        position={[0, -0.56, 0]}
      >
        <meshToonMaterial color="#8D6E63" gradientMap={gradientMap} />
        <Outlines screenspace thickness={0.03} color={DARK_COCOA} />
      </RoundedBox>

      {/* Cobblestone Sidewalk & Delivery Apron */}
      {cobblestones.map((st) => (
        <RoundedBox
          key={st.key}
          args={st.size}
          radius={0.025}
          smoothness={2}
          position={st.pos}
          receiveShadow
          castShadow
        >
          <meshToonMaterial color={st.color} gradientMap={gradientMap} />
          <Outlines screenspace thickness={0.015} color={DARK_COCOA} />
        </RoundedBox>
      ))}

      {/* Welcome Doormat at South Entrance */}
      <group position={[0, 0.03, 2.85]}>
        <RoundedBox args={[1.15, 0.05, 0.55]} radius={0.02} smoothness={2} receiveShadow>
          <meshToonMaterial color="#D97706" gradientMap={gradientMap} />
          <Outlines screenspace thickness={0.02} color={DARK_COCOA} />
        </RoundedBox>
        <RoundedBox args={[0.95, 0.06, 0.38]} radius={0.02} smoothness={2} position={[0, 0.01, 0]}>
          <meshToonMaterial color="#FEF3C7" gradientMap={gradientMap} />
        </RoundedBox>
      </group>

      {/* Exterior Wooden A-Frame Storefront Welcome Sign */}
      <group position={[-2.1, 0.02, 3.7]} rotation={[0, 0.25, 0]}>
        <RoundedBox args={[0.55, 0.68, 0.14]} radius={0.04} smoothness={3} position={[0, 0.34, 0]} castShadow>
          <meshToonMaterial color="#8D5B4C" gradientMap={gradientMap} />
          <Outlines screenspace thickness={0.03} color={DARK_COCOA} />
        </RoundedBox>
        <RoundedBox args={[0.42, 0.46, 0.16]} radius={0.03} smoothness={2} position={[0, 0.38, 0]}>
          <meshToonMaterial color="#FFFDF9" gradientMap={gradientMap} />
        </RoundedBox>
        <RoundedBox args={[0.44, 0.12, 0.18]} radius={0.03} smoothness={2} position={[0, 0.54, 0]}>
          <meshToonMaterial color="#A7C4B5" gradientMap={gradientMap} />
        </RoundedBox>
      </group>

      {/* ================= INTERACTIVE EXTERIOR DELIVERY BAY (East Side) ================= */}
      <group position={[3.78, 0.04, 1.35]} name="exterior-delivery-bay">
        {/* Expanded 4-Slot Wooden Pallet Base */}
        <RoundedBox args={[1.05, 0.08, 1.05]} radius={0.025} smoothness={2} castShadow receiveShadow>
          <meshToonMaterial color="#B47B48" gradientMap={gradientMap} />
          <Outlines screenspace thickness={0.025} color={DARK_COCOA} />
        </RoundedBox>

        {/* Interactive Wholesale Delivery Boxes */}
        {deliveryBayBoxes.map((box, idx) => {
          const offset = PALLET_SLOT_OFFSETS[box.baySlotIndex % 4] || PALLET_SLOT_OFFSETS[0];
          const sku = products.find((p) => p.skuId === box.skuId);
          const labelTex = getProductLabelTexture(sku?.catalogId ?? 'Little');

          return (
            <group
              key={box.id}
              position={offset}
              onClick={(e) => {
                if (isBuildMode) return;
                e.stopPropagation();
                interactWithDeliveryBox(box.id);
              }}
            >
              {/* Glowing 3D Pulse Ring Beacon for Tutorial Step 3 or available delivery cases */}
              <PulseBeaconRing color={isTutorialDeliveryStep ? '#FBBF24' : '#10B981'} />

              {/* Cozy Cardboard Delivery Box */}
              <RoundedBox args={[0.38, 0.36, 0.38]} radius={0.05} smoothness={3} castShadow>
                <meshToonMaterial color="#D9A066" gradientMap={gradientMap} />
                <Outlines screenspace thickness={0.028} color={DARK_COCOA} />
              </RoundedBox>

              {/* Top Pastel Shipping Tape Strip */}
              <RoundedBox args={[0.4, 0.04, 0.12]} radius={0.015} smoothness={2} position={[0, 0.17, 0]}>
                <meshToonMaterial color="#FAF0E6" gradientMap={gradientMap} />
              </RoundedBox>

              {/* Front Shipping Label Decal */}
              <mesh position={[0, 0, 0.195]}>
                <planeGeometry args={[0.22, 0.22]} />
                <meshBasicMaterial map={labelTex} />
              </mesh>

              {/* Diegetic Cream Pill above the first delivery box */}
              {idx === 0 && !isBuildMode && (
                <Html position={[0, 0.54, 0]} center zIndexRange={[10, 0]}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      interactWithDeliveryBox(box.id);
                    }}
                    className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-extrabold text-[#3D2C2E] border-2 border-[#3D2C2E] shadow-sm transition ${
                      isTutorialDeliveryStep
                        ? 'bg-[#FBBF24] animate-bounce'
                        : 'bg-[#FFFDF9] hover:bg-[#A7C4B5]'
                    }`}
                  >
                    📦 Tap to Pick Up ({deliveryBayBoxes.length} Case{deliveryBayBoxes.length > 1 ? 's' : ''})
                  </button>
                </Html>
              )}
            </group>
          );
        })}
      </group>

      {/* Chunky Low-Poly Cartoon Bushes & Flowerbeds */}
      {bushes.map((b, i) => (
        <group key={`bush-${i}`} position={b.pos} scale={b.scale}>
          <RoundedBox args={[0.72, 0.52, 0.72]} radius={0.22} smoothness={4} castShadow>
            <meshToonMaterial color="#558B2F" gradientMap={gradientMap} />
            <Outlines screenspace thickness={0.03} color={DARK_COCOA} />
          </RoundedBox>
          <RoundedBox args={[0.52, 0.44, 0.52]} radius={0.18} smoothness={4} position={[0.22, 0.08, 0.18]} castShadow>
            <meshToonMaterial color="#689F38" gradientMap={gradientMap} />
            <Outlines screenspace thickness={0.03} color={DARK_COCOA} />
          </RoundedBox>
          <mesh position={[0.05, 0.28, 0.22]} castShadow>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshToonMaterial color={b.flower} gradientMap={gradientMap} />
            <Outlines screenspace thickness={0.015} color={DARK_COCOA} />
          </mesh>
          <mesh position={[0.25, 0.24, -0.05]} castShadow>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshToonMaterial color="#FFFDF9" gradientMap={gradientMap} />
            <Outlines screenspace thickness={0.015} color={DARK_COCOA} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
