import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const taksonomiPath = path.join(rootDir, 'src', 'data', 'taksonomi.json');
const negaraPath = path.join(rootDir, 'src', 'data', 'negara.json');
const alutsistaDir = path.join(rootDir, 'src', 'content', 'alutsista');
const pabrikanDir = path.join(rootDir, 'src', 'content', 'pabrikan');
const publicDir = path.join(rootDir, 'public');

interface TaksonomiData {
  matra: Array<{ kunci: string; label: string }>;
  jenis: Array<{ matra: string; kunci: string; label: string; templatSpesifikasi: string }>;
  templatSpesifikasi: Record<string, Array<{ kunci: string; label: string; tipe: string; satuan?: string }>>;
}

interface NegaraData {
  negara: Record<string, string>;
}

let hasError = false;
function reportError(file: string, msg: string) {
  console.error(`[GALAT VALIDASI] ${file}: ${msg}`);
  hasError = true;
}

const taksonomi: TaksonomiData = JSON.parse(fs.readFileSync(taksonomiPath, 'utf-8'));
const negaraData: NegaraData = JSON.parse(fs.readFileSync(negaraPath, 'utf-8'));
const validNegara = new Set(Object.keys(negaraData.negara));
const jenisMap = new Map(taksonomi.jenis.map((j) => [j.kunci, j]));

const pabrikanFiles = fs.existsSync(pabrikanDir)
  ? fs.readdirSync(pabrikanDir).filter((f) => f.endsWith('.json'))
  : [];

const validPabrikanSlugs = new Set<string>();

for (const file of pabrikanFiles) {
  const slug = path.basename(file, '.json');
  validPabrikanSlugs.add(slug);
  const fullPath = path.join(pabrikanDir, file);
  const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));

  if (!data.nama || typeof data.nama !== 'string') {
    reportError(file, 'nama pabrikan wajib diisi');
  }
  if (!validNegara.has(data.negara)) {
    reportError(file, `kode negara "${data.negara}" tidak terdaftar di negara.json`);
  }
  if (!Array.isArray(data.sumber) || data.sumber.length < 1) {
    reportError(file, 'pabrikan wajib memiliki minimal 1 sumber');
  }
}

const alutsistaFiles = fs.existsSync(alutsistaDir)
  ? fs.readdirSync(alutsistaDir).filter((f) => f.endsWith('.json'))
  : [];

if (alutsistaFiles.length < 5) {
  reportError('src/content/alutsista', `Minimal harus ada 5 entri untuk Fase 1 (ditemukan: ${alutsistaFiles.length})`);
}

const matraCounts: Record<string, number> = { darat: 0, laut: 0, udara: 0 };

for (const file of alutsistaFiles) {
  const fullPath = path.join(alutsistaDir, file);
  const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));

  // 1. Cek jenis & matra di taksonomi
  const jenisEntry = jenisMap.get(data.jenis);
  if (!jenisEntry) {
    reportError(file, `jenis "${data.jenis}" tidak ditemukan di taksonomi.json`);
  } else if (jenisEntry.matra !== data.matra) {
    reportError(file, `matra "${data.matra}" tidak sesuai dengan jenis "${data.jenis}" (seharusnya "${jenisEntry.matra}")`);
  }
  if (data.matra in matraCounts) {
    matraCounts[data.matra]++;
  }

  // 2. Cek negaraAsal
  if (!Array.isArray(data.negaraAsal) || data.negaraAsal.length === 0) {
    reportError(file, 'negaraAsal wajib berupa array minimal 1 kode negara');
  } else {
    for (const kode of data.negaraAsal) {
      if (!validNegara.has(kode)) {
        reportError(file, `negaraAsal "${kode}" tidak terdaftar di negara.json`);
      }
    }
  }

  // 3. Cek referensi pabrikan
  if (!Array.isArray(data.pabrikan) || data.pabrikan.length === 0) {
    reportError(file, 'pabrikan wajib diisi minimal 1 referensi');
  } else {
    for (const p of data.pabrikan) {
      const pSlug = typeof p === 'string' ? p : p?.id;
      if (!validPabrikanSlugs.has(pSlug)) {
        reportError(file, `pabrikan "${pSlug}" tidak ditemukan di src/content/pabrikan/`);
      }
    }
  }

  // 4. Cek sumber (minimal 2)
  const sumberIds = new Set<string>();
  if (!Array.isArray(data.sumber) || data.sumber.length < 2) {
    reportError(file, 'wajib memiliki minimal 2 sumber berbeda');
  } else {
    for (const s of data.sumber) {
      if (!s.id || !s.judul || !s.penerbit || !s.tanggalAkses || !s.jenis) {
        reportError(file, `sumber "${s.id || '?'}" belum lengkap`);
      }
      sumberIds.add(s.id);
    }
  }

  // 5. Cek spesifikasi
  if (!Array.isArray(data.spesifikasi) || data.spesifikasi.length === 0) {
    reportError(file, 'spesifikasi tidak boleh kosong');
  } else {
    for (const sp of data.spesifikasi) {
      if (!sp.sumberId || !sumberIds.has(sp.sumberId)) {
        reportError(file, `spesifikasi "${sp.kunci}" merujuk sumberId "${sp.sumberId}" yang tidak ada di daftar sumber`);
      }
      if (!['resmi', 'sekunder', 'perkiraan'].includes(sp.keandalan)) {
        reportError(file, `spesifikasi "${sp.kunci}" memiliki nilai keandalan tidak valid`);
      }
    }
  }

  // 6. Cek pengguna
  if (!Array.isArray(data.pengguna) || data.pengguna.length === 0) {
    reportError(file, 'pengguna tidak boleh kosong');
  } else {
    for (const pg of data.pengguna) {
      if (!validNegara.has(pg.negara)) {
        reportError(file, `pengguna negara "${pg.negara}" tidak terdaftar di negara.json`);
      }
      if (!pg.perDate || typeof pg.perDate !== 'string' || pg.perDate === 'TODO') {
        reportError(file, `pengguna "${pg.negara}" wajib memiliki perDate yang valid`);
      }
      if (!pg.sumberId || !sumberIds.has(pg.sumberId)) {
        reportError(file, `pengguna "${pg.negara}" merujuk sumberId "${pg.sumberId}" yang tidak terdaftar`);
      }
    }
  }

  // 7. Cek sejarah & linimasa
  if (!data.sejarah || !data.sejarah.ringkas || data.sejarah.ringkas.includes('TODO')) {
    reportError(file, 'sejarah.ringkas wajib diisi dan tidak boleh memuat TODO');
  }
  if (!data.sejarah || !Array.isArray(data.sejarah.linimasa) || data.sejarah.linimasa.length < 3) {
    reportError(file, 'sejarah.linimasa wajib memuat minimal 3 peristiwa');
  } else {
    for (const ev of data.sejarah.linimasa) {
      if (!ev.sumberId || !sumberIds.has(ev.sumberId)) {
        reportError(file, `linimasa "${ev.judul}" merujuk sumberId "${ev.sumberId}" yang tidak terdaftar`);
      }
      if (!ev.tahun || ev.tahun <= 0) {
        reportError(file, `linimasa "${ev.judul}" memiliki tahun tidak valid`);
      }
    }
  }

  // 8. Cek model3d (jika ada)
  if (data.model3d) {
    const allowedLicenses = ['CC0', 'CC-BY-4.0', 'CC-BY-SA-4.0', 'milik-sendiri', 'izin-tertulis'];
    if (!allowedLicenses.includes(data.model3d.lisensi)) {
      reportError(file, `lisensi model3d "${data.model3d.lisensi}" tidak diizinkan`);
    }
    const glbDiskPath = path.join(publicDir, data.model3d.berkas.replace(/^\//, ''));
    const posterDiskPath = path.join(publicDir, data.model3d.poster.replace(/^\//, ''));
    if (!fs.existsSync(glbDiskPath)) {
      reportError(file, `berkas model 3D tidak ditemukan di ${glbDiskPath}`);
    }
    if (!fs.existsSync(posterDiskPath)) {
      reportError(file, `berkas poster model 3D tidak ditemukan di ${posterDiskPath}`);
    }
  }

  // 9. Cek galeri (jika ada)
  if (Array.isArray(data.galeri)) {
    for (const g of data.galeri) {
      if (!g.alt || !g.kredit || !g.lisensi) {
        reportError(file, `item galeri "${g.berkas}" wajib memiliki alt, kredit, dan lisensi`);
      }
      const imgDiskPath = path.join(publicDir, g.berkas.replace(/^\//, ''));
      if (!fs.existsSync(imgDiskPath)) {
        reportError(file, `berkas gambar galeri tidak ditemukan di ${imgDiskPath}`);
      }
    }
  }

  // 10. Cek diperbaruiPada
  if (!data.diperbaruiPada) {
    reportError(file, 'diperbaruiPada wajib diisi');
  }
}

for (const [m, count] of Object.entries(matraCounts)) {
  if (count < 1) {
    reportError('src/content/alutsista', `Matra "${m}" belum memiliki entri (wajib minimal 1 per matra)`);
  }
}

if (hasError) {
  console.error('\nValidasi data GAGAL. Perbaiki galat di atas.');
  process.exit(1);
} else {
  console.log(`Validasi data LULUS: ${alutsistaFiles.length} entri alutsista dan ${pabrikanFiles.length} profil pabrikan valid.`);
}
