import React, { useMemo } from 'react';
import { Outlines, RoundedBox } from '@react-three/drei';
import { getToonGradientMap } from '../../utils/toonMaterials';

const DARK_COCOA = '#3D2C2E';

/**
 * Renders the lush cozy grass (#7CB342) & cobblestone sidewalk border outside the cutaway dollhouse walls,
 * complete with low-poly bushes, pastel flowerbeds, exterior Delivery Bay pallet zone, and wooden welcome sign.
 */
export const ExteriorDioramaBorder: React.FC = () => {
  const gradientMap = useMemo(() => getToonGradientMap(), []);

  // Cobblestone tiles along the South (+Z) and East (+X) storefront walkway
  const cobblestones = useMemo(() => {
    const stones: { key: string; pos: [number, number, number]; size: [number, number, number]; color: string }[] = [];
    const palette = ['#CBD5E1', '#94A3B8', '#E2E8F0', '#D6D3D1'];
    let idx = 0;
    // South sidewalk in front of entrance (+Z = 3.25m to 4.35m)
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
    // East delivery bay apron (+X = 3.35m to 4.35m)
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

  return (
    <group name="exterior-diorama-border">
      {/* Lush Cozy Grass Island Base (#7CB342) */}
      <RoundedBox
        args={[11.2, 0.35, 11.2]}
        radius={0.14}
        smoothness={4}
        position={[0, -0.22, 0]}
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
        position={[0, -0.5, 0]}
      >
        <meshToonMaterial color="#8D6E63" gradientMap={gradientMap} />
        <Outlines screenspace thickness={0.03} color={DARK_COCOA} />
      </RoundedBox>

      {/* Lighter Grass Inner Trim Cushion */}
      <RoundedBox
        args={[9.8, 0.06, 9.8]}
        radius={0.08}
        smoothness={3}
        position={[0, -0.05, 0]}
        receiveShadow
      >
        <meshToonMaterial color="#8BC34A" gradientMap={gradientMap} />
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

      {/* Welcome Doormat at South Entrance (Tile 5,11 & 6,11 -> world X=0, Z=3.1m) */}
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
        {/* Sign Post / Frame */}
        <RoundedBox args={[0.55, 0.68, 0.14]} radius={0.04} smoothness={3} position={[0, 0.34, 0]} castShadow>
          <meshToonMaterial color="#8D5B4C" gradientMap={gradientMap} />
          <Outlines screenspace thickness={0.03} color={DARK_COCOA} />
        </RoundedBox>
        {/* Cream Painted Sign Face */}
        <RoundedBox args={[0.42, 0.46, 0.16]} radius={0.03} smoothness={2} position={[0, 0.38, 0]}>
          <meshToonMaterial color="#FFFDF9" gradientMap={gradientMap} />
        </RoundedBox>
        {/* Pastel Awning Stripe on Sign */}
        <RoundedBox args={[0.44, 0.12, 0.18]} radius={0.03} smoothness={2} position={[0, 0.54, 0]}>
          <meshToonMaterial color="#A7C4B5" gradientMap={gradientMap} />
        </RoundedBox>
      </group>

      {/* Exterior Delivery Bay Wooden Pallet & Starter Parcel Box (East Side) */}
      <group position={[3.78, 0.04, 1.35]}>
        {/* Wooden Pallet Base */}
        <RoundedBox args={[0.85, 0.08, 0.85]} radius={0.02} smoothness={2} castShadow receiveShadow>
          <meshToonMaterial color="#B47B48" gradientMap={gradientMap} />
          <Outlines screenspace thickness={0.02} color={DARK_COCOA} />
        </RoundedBox>
        {/* Cozy Cardboard Delivery Box with Pastel Shipping Tape */}
        <RoundedBox args={[0.52, 0.44, 0.52]} radius={0.06} smoothness={3} position={[0, 0.26, 0]} castShadow>
          <meshToonMaterial color="#D9A066" gradientMap={gradientMap} />
          <Outlines screenspace thickness={0.03} color={DARK_COCOA} />
        </RoundedBox>
        <RoundedBox args={[0.54, 0.08, 0.16]} radius={0.02} smoothness={2} position={[0, 0.45, 0]}>
          <meshToonMaterial color="#FAF0E6" gradientMap={gradientMap} />
        </RoundedBox>
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
          {/* Cute Flower Blossoms */}
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
