import * as THREE from 'three';
import { RoomThemeId } from '../types/game';

let cachedToonGradient: THREE.DataTexture | null = null;

/**
 * Generates a custom 3-step cartoon cel-shading gradient map (soft shadow, warm mid-tone, crisp highlight)
 * for Three.js MeshToonMaterial so every object has rich, painterly cartoon shading.
 * NOTE: Three.js MeshToonMaterial samples the `.r` channel of `gradientMap`, so we use RedFormat (or RGBA luminance)
 * with NearestFilter and linear color space.
 */
export function getToonGradientMap(): THREE.DataTexture {
  if (cachedToonGradient) return cachedToonGradient;

  // 3 distinct cel-shading luminance steps: shadow (155), mid-tone (215), bright highlight (255)
  const colors = new Uint8Array([
    155, 155, 155, 255,
    215, 215, 215, 255,
    255, 255, 255, 255,
  ]);

  const texture = new THREE.DataTexture(colors, 3, 1, THREE.RGBAFormat);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  cachedToonGradient = texture;
  return texture;
}

const floorTextureCache: Partial<Record<RoomThemeId, THREE.CanvasTexture>> = {};

/**
 * Generates a high-contrast procedural plank or tile floor texture with subtle 1-tile (0.5m) grid lines
 * so the player can clearly read tiles without ugly wireframe CAD lines.
 */
export function getThemeFloorTexture(themeId: RoomThemeId): THREE.CanvasTexture {
  if (floorTextureCache[themeId]) return floorTextureCache[themeId]!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  if (themeId === 'StarterCozyLinen') {
    // Warm honey-oak planks (#C88A55)
    ctx.fillStyle = '#C88A55';
    ctx.fillRect(0, 0, 512, 512);
    const plankColors = ['#C88A55', '#C1824D', '#CF925D', '#B87945'];
    const numPlanks = 8;
    const plankH = 512 / numPlanks;
    for (let i = 0; i < numPlanks; i++) {
      ctx.fillStyle = plankColors[i % plankColors.length];
      ctx.fillRect(0, i * plankH, 512, plankH - 3);
      // Warm wood seam
      ctx.fillStyle = '#8F5B30';
      ctx.fillRect(0, (i + 1) * plankH - 3, 512, 3);
      // Staggered vertical plank joint
      const jointX = ((i * 173) % 400) + 50;
      ctx.fillRect(jointX, i * plankH, 3, plankH);
    }
  } else if (themeId === 'ClinicalClean') {
    // Cool mint-slate tiled floor (#CBD5E1 / #94A3B8) so white medical packs pop cleanly
    ctx.fillStyle = '#B8C7D9';
    ctx.fillRect(0, 0, 512, 512);
    const tileS = 128;
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#C5D3E3' : '#B0C0D4';
        ctx.fillRect(x * tileS + 4, y * tileS + 4, tileS - 8, tileS - 8);
      }
    }
  } else if (themeId === 'PastelNursery') {
    // Warm birch flooring (#D9B38C)
    ctx.fillStyle = '#D9B38C';
    ctx.fillRect(0, 0, 512, 512);
    const plankColors = ['#D9B38C', '#D2AA82', '#E0BA95', '#C9A077'];
    const plankH = 64;
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = plankColors[i % plankColors.length];
      ctx.fillRect(0, i * plankH, 512, plankH - 3);
      ctx.fillStyle = '#A88058';
      ctx.fillRect(0, (i + 1) * plankH - 3, 512, 3);
    }
  } else {
    // Retro Arcade & Lounge: Deep slate carpet tiles (#334155) with subtle neon dot motif
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 512, 512);
    const tileS = 128;
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#3B4A61' : '#313F54';
        ctx.fillRect(x * tileS + 3, y * tileS + 3, tileS - 6, tileS - 6);
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.arc(x * tileS + 64, y * tileS + 64, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Subtle tile border frame so 1-tile grid alignment is intuitive
  ctx.strokeStyle = 'rgba(61, 44, 46, 0.22)';
  ctx.lineWidth = 5;
  ctx.strokeRect(0, 0, 512, 512);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  tex.needsUpdate = true;

  floorTextureCache[themeId] = tex;
  return tex;
}

const packageLabelCache: Record<string, THREE.CanvasTexture> = {};

/**
 * Generates cute procedural cartoon label art for pillow-pack diaper bags
 * (stars, pastel bears, medical cross, or retro arcade stripes).
 */
export function getProductLabelTexture(style: 'Medical' | 'Little' | 'Middle' | 'Caregiver'): THREE.CanvasTexture {
  if (packageLabelCache[style]) return packageLabelCache[style];

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  if (style === 'Medical') {
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, 256, 256);
    // Crisp sky-blue medical stripe & droplet badge
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(0, 48, 256, 52);
    ctx.fillStyle = '#0284C7';
    ctx.fillRect(98, 128, 60, 20);
    ctx.fillRect(118, 108, 20, 60);
  } else if (style === 'Little') {
    ctx.fillStyle = '#FCE7F3';
    ctx.fillRect(0, 0, 256, 256);
    // Pastel lavender band
    ctx.fillStyle = '#E9D8FD';
    ctx.fillRect(0, 44, 256, 64);
    // Cute golden star & bear ears emblem
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.arc(128, 148, 34, 0, Math.PI * 2);
    ctx.arc(100, 120, 14, 0, Math.PI * 2);
    ctx.arc(156, 120, 14, 0, Math.PI * 2);
    ctx.fill();
  } else if (style === 'Middle') {
    ctx.fillStyle = '#312E81';
    ctx.fillRect(0, 0, 256, 256);
    // Retro arcade racing stripes
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(0, 64, 256, 28);
    ctx.fillStyle = '#F472B6';
    ctx.fillRect(0, 104, 256, 28);
    ctx.fillStyle = '#FBBF24';
    ctx.fillRect(96, 150, 64, 44);
  } else {
    // Caregiver mint & warm honey bundle pack
    ctx.fillStyle = '#ECFDF5';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#A7C4B5';
    ctx.fillRect(0, 52, 256, 56);
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(128, 152, 32, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = '#3D2C2E';
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, 240, 240);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  packageLabelCache[style] = tex;
  return tex;
}
