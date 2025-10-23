// scripts/generate-icons.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/**
 * Config
 */
const SRC = 'public/assets/logo/sciform_master_1024.png';
const OUT_ICONS = 'public/assets/icons';
const OUT_LOGO = 'public/assets/logo';

// Tamaños estándar PWA + favicons
const SIZES = [512, 192, 96, 48, 32, 16];

// Color de fondo antracita (ajústalo si tu máster es transparente)
const BG = '#1f1f1f';

// Padding para crear una versión maskable con más “aire” alrededor del símbolo.
// Con un máster 1024x1024, ~12–15% son ~128–154 px por lado. Usamos 140.
const MASKABLE_PADDING = 140;

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

async function main() {
  // Comprobaciones
  if (!fs.existsSync(SRC)) {
    console.error(`❌ No encuentro el máster: ${SRC}`);
    process.exit(1);
  }

  ensureDir(OUT_ICONS);
  ensureDir(OUT_LOGO);

  // 1) Exportar PNGs base
  for (const s of SIZES) {
    const outPath = path.join(OUT_ICONS, `icon-${s}.png`);
    await sharp(SRC)
      .resize(s, s, { fit: 'cover', withoutEnlargement: true })
      .flatten({ background: BG }) // asegura fondo sólido si hay transparencias
      .png()
      .toFile(outPath);
    console.log(`✅ ${outPath}`);
  }

  // 2) 512 con margen extra para maskable
  //    Extiende lienzo añadiendo padding y normaliza a 512 sin recortar
  const maskablePath = path.join(OUT_ICONS, 'icon-512-maskable.png');
  const pad = MASKABLE_PADDING;
  await sharp(SRC)
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: BG,
    })
    .resize(512, 512, { fit: 'contain', background: BG })
    .png()
    .toFile(maskablePath);
  console.log(`✅ ${maskablePath} (maskable)`);

  // 3) Copia del 512 “normal” como versión de logo de marketing si la necesitas
  const symbol512 = path.join(OUT_LOGO, 'sciform_symbol_512.png');
  await sharp(SRC).resize(512, 512).flatten({ background: BG }).png().toFile(symbol512);
  console.log(`✅ ${symbol512}`);

  console.log('🎉 Listo. Revisa public/assets/icons y public/assets/logo');
}

main().catch((err) => {
  console.error('❌ Error generando iconos:', err);
  process.exit(1);
});
