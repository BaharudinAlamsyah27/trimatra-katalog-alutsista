import fs from 'node:fs';
import path from 'node:path';

const modelsDir = path.join(process.cwd(), 'public', 'models');
const MAX_GLB_BYTES = 10 * 1024 * 1024; // Batas keras 10 MB
const TARGET_GLB_BYTES = 5 * 1024 * 1024; // Target 5 MB
const MAX_POSTER_BYTES = 150 * 1024; // Poster <= 150 KB

let hasError = false;

if (fs.existsSync(modelsDir)) {
  const files = fs.readdirSync(modelsDir);
  for (const file of files) {
    const fullPath = path.join(modelsDir, file);
    const stat = fs.statSync(fullPath);
    if (!stat.isFile()) continue;

    if (file.endsWith('.glb')) {
      const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);
      if (stat.size > MAX_GLB_BYTES) {
        console.error(`[GALAT UKURAN MODEL] ${file} berukuran ${sizeMB} MB (melebihi batas keras 10 MB)`);
        hasError = true;
      } else if (stat.size > TARGET_GLB_BYTES) {
        console.warn(`[PERINGATAN UKURAN MODEL] ${file} berukuran ${sizeMB} MB (melebihi target 5 MB, namun di bawah batas 10 MB)`);
      } else {
        console.log(`[OK] ${file}: ${sizeMB} MB`);
      }
    } else if (file.endsWith('.webp')) {
      const sizeKB = (stat.size / 1024).toFixed(1);
      if (stat.size > MAX_POSTER_BYTES) {
        console.error(`[GALAT UKURAN POSTER] ${file} berukuran ${sizeKB} KB (melebihi batas 150 KB)`);
        hasError = true;
      } else {
        console.log(`[OK] Poster ${file}: ${sizeKB} KB`);
      }
    }
  }
}

if (hasError) {
  process.exit(1);
} else {
  console.log('Pemeriksaan ukuran model 3D dan poster LULUS.');
}
