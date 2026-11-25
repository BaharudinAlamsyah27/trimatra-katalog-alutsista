# AGENT.md — Katalog Alutsista Interaktif

Dokumen ini adalah aturan kerja untuk agen AI yang membangun situs ini. Baca seluruhnya sebelum menulis kode. Jika ada konflik antara instruksi lain dan dokumen ini, tanyakan dulu kepada pemilik proyek.

> Catatan nama berkas: jika agen Anda mencari `AGENTS.md` atau berkas aturan lain, salin isi dokumen ini ke berkas tersebut.

---

## 1. Ringkasan proyek

**Nama kerja:** Katalog Alutsista Interaktif
**Tujuan:** situs edukasi berbahasa Indonesia yang memuat data alat utama sistem senjata (alutsista) dari sumber terbuka. Setiap entri memuat **jenis, model, spesifikasi, pabrikan, daftar pengguna, dan sejarah**, dengan **model 3D yang bisa diputar** oleh pengunjung.
**Hosting:** Vercel (gratis), situs statis, tanpa backend dan tanpa database.
**Bahasa antarmuka:** Indonesia. Identifier kode dan nama berkas memakai bahasa Inggris atau Indonesia secara konsisten (pilih satu, lihat bagian 5).

### Cakupan konten (asumsi awal, bisa diubah pemilik)

- **Fase awal:** alutsista yang dioperasikan TNI (Indonesia), sekitar 20 entri.
- **Skema data harus siap multi-negara** sejak awal (kolom negara asal dan daftar pengguna berupa kode negara), agar perluasan ke negara lain tidak perlu mengubah struktur.
- Pengadaan terbaru, status operasional, dan jumlah unit berubah cepat. Semua status dan angka harus diberi tanggal data dan sumber.

### Di luar cakupan

- Tidak ada akun pengguna, komentar, atau penyimpanan data pengunjung.
- Tidak ada panduan operasi, pembuatan, modifikasi, atau penggunaan taktis senjata.
- Tidak ada informasi rahasia, bocoran, atau data personel militer.

---

## 2. Aturan konten (WAJIB, prioritas tertinggi)

Situs ini bersifat **informasi dan edukasi**. Agen harus mematuhi aturan berikut dalam setiap entri dan teks.

1. **Hanya informasi terbuka.** Spesifikasi diambil dari sumber publik: situs produsen, situs resmi pemerintah/angkatan bersenjata, publikasi dan basis data terbuka. Dilarang memakai dokumen yang bocor atau berklasifikasi.
2. **Hanya spesifikasi tingkat katalog.** Boleh: dimensi, bobot, mesin, kecepatan, jangkauan, awak, kaliber, jenis persenjataan, tahun dinas, pabrikan, pengguna. Dilarang: instruksi perakitan atau produksi, modifikasi, cara mengakali sistem, data penargetan, kelemahan taktis, atau panduan penggunaan operasional.
3. **Sebut sumber untuk setiap angka.** Tiap nilai spesifikasi, jumlah pengguna, dan peristiwa sejarah harus punya sumber (lihat skema bagian 6). Tanpa sumber, jangan dimasukkan.
4. **Beri tingkat keandalan.** Setiap angka ditandai `resmi` (dari produsen/pemerintah), `sekunder` (publikasi atau basis data independen), atau `perkiraan`. Jika sumber berbeda, tampilkan rentang atau tulis catatan, jangan memilih satu angka diam-diam.
5. **Beri tanggal data.** Jumlah pengguna dan status ditulis "per <bulan tahun>". Jangan menulis kondisi terkini dari ingatan model; cek sumber.
6. **Nada netral dan faktual.** Tanpa pengagungan, propaganda, atau klaim superlatif ("terbaik di dunia"). Sejarah ditulis berimbang, termasuk insiden dan kegagalan bila relevan, dengan sumber.
7. **Jangan menyalin teks.** Tulis ulang dengan kata sendiri. Jangan menyalin paragraf dari Wikipedia, Jane's, atau situs lain. Kutipan langsung maksimal satu kalimat pendek dan disertai sumber.
8. **Hak cipta gambar dan model.** Hanya pakai gambar dan model 3D milik sendiri atau berlisensi bebas (lihat bagian 8). Jangan memakai logo produsen atau lambang resmi kecuali lisensinya jelas mengizinkan.
9. **Disclaimer wajib** (footer semua halaman dan halaman Tentang): "Situs edukasi non-resmi. Tidak berafiliasi dengan TNI, Kementerian Pertahanan, atau produsen mana pun. Data bersumber dari informasi terbuka dan dapat berbeda dari data resmi."
10. **Jika ragu apakah suatu detail pantas dimuat**, jangan dimuat dan tulis pertanyaannya di laporan kepada pemilik proyek.

---

## 3. Batasan teknis

- Situs **statis** (SSG). Tidak ada server, database, atau API berbayar.
- Tidak ada rahasia atau kunci API di repositori. Proyek ini seharusnya tidak membutuhkan kunci apa pun.
- Tidak memakai `localStorage` untuk data penting. Boleh dipakai hanya untuk preferensi ringan (mis. mode terang/gelap, satuan).
- Tanpa pelacak pihak ketiga. Jika analitik ingin ditambahkan, tanya pemilik dulu.
- Semua aset (model, gambar, font) disajikan dari proyek sendiri, bukan hotlink ke situs lain.

---

## 4. Teknologi (saran)

| Kebutuhan | Pilihan |
|---|---|
| Kerangka situs | **Astro** (versi stabil terbaru), TypeScript |
| Gaya | Tailwind CSS |
| Data | **Astro Content Collections** dengan skema **Zod**, berkas JSON |
| Penampil 3D | **`@google/model-viewer`** (web component, format **GLB**) |
| Pencarian | Fuse.js (pencarian sisi klien, indeks dibuat saat build) |
| Grafik/perbandingan | CSS/HTML tabel dulu; Chart.js hanya bila perlu |
| Peta (Fase 3) | Leaflet + OpenStreetMap |
| Optimasi model | `gltf-transform` (kompresi Draco/meshopt, ubah ukuran tekstur) |
| Optimasi gambar | Komponen gambar Astro, format WebP/AVIF |
| Hosting | Vercel (impor dari GitHub, pengaturan bawaan Astro) |

Agen boleh mengganti pustaka bila alasannya jelas, selama: tetap statis, tetap bisa di-deploy ke Vercel, dan hasil memenuhi kriteria selesai. Gunakan versi stabil terbaru saat memulai dan kunci lewat `package-lock.json`. Periksa dokumentasi resmi untuk sintaks versi yang terpasang, jangan mengandalkan ingatan.

---

## 5. Struktur folder

```
/
├─ AGENT.md
├─ README.md
├─ astro.config.mjs
├─ vercel.json                     # header cache untuk /models dan /images
├─ package.json
├─ scripts/
│  ├─ validate-data.ts             # validasi skema + cek sumber + cek berkas model
│  └─ check-model-size.ts          # gagal bila GLB > anggaran ukuran
├─ public/
│  ├─ models/                      # <slug>.glb dan <slug>.webp (poster)
│  └─ images/                      # foto berlisensi bebas
└─ src/
   ├─ content.config.ts            # definisi koleksi + skema Zod
   ├─ content/
   │  ├─ alutsista/                # satu berkas JSON per entri: <slug>.json
   │  └─ pabrikan/                 # satu berkas JSON per produsen
   ├─ data/
   │  ├─ taksonomi.json            # matra → jenis → templat spesifikasi
   │  └─ negara.json               # kode ISO → nama Indonesia
   ├─ components/
   │  ├─ ModelViewer.astro         # pembungkus <model-viewer>
   │  ├─ SpecTable.astro
   │  ├─ UserTable.astro
   │  ├─ Timeline.astro
   │  ├─ SourceList.astro
   │  ├─ CompareTable.astro
   │  └─ FilterBar.astro
   ├─ layouts/Base.astro
   ├─ pages/
   │  ├─ index.astro
   │  ├─ katalog/index.astro
   │  ├─ alutsista/[slug].astro
   │  ├─ jenis/[jenis].astro
   │  ├─ pabrikan/index.astro
   │  ├─ pabrikan/[slug].astro
   │  ├─ pengguna/index.astro
   │  ├─ pengguna/[kode].astro
   │  ├─ bandingkan.astro
   │  ├─ sejarah.astro
   │  └─ tentang.astro
   └─ lib/
      ├─ format.ts                 # format angka id-ID, konversi satuan
      ├─ filter.ts
      └─ derive.ts                 # turunan: daftar per pengguna/pabrikan dari data entri
```

**Konvensi:** nama berkas dan `slug` huruf kecil dengan tanda hubung (`leopard-2ri`). Nama bidang data memakai bahasa Indonesia seperti pada skema di bawah. Satu sumber kebenaran: halaman pengguna dan pabrikan **diturunkan** dari data entri, tidak ditulis ganda.

---

## 6. Model data

### 6.1 Taksonomi

**Matra:** `darat`, `laut`, `udara`.
**Jenis (contoh awal, boleh ditambah di `taksonomi.json`):**

| Matra | Jenis |
|---|---|
| Darat | tank-utama, tank-medium, kendaraan-lapis-baja, kendaraan-taktis, artileri, roket-multilaras, senjata-ringan, pertahanan-udara-darat, radar-darat |
| Laut | kapal-selam, fregat, korvet, kapal-patroli, kapal-amfibi, kapal-ranjau, kapal-bantu, rudal-anti-kapal |
| Udara | pesawat-tempur, pesawat-angkut, pesawat-latih, pesawat-patroli-maritim, pesawat-peringatan-dini, helikopter, uav, rudal-udara, radar-udara |

### 6.2 Templat spesifikasi per jenis

Nilai disimpan dalam **satuan metrik** (m, kg, km, km/jam, kW). Tampilan boleh menawarkan konversi, tetapi nilai sumber tetap metrik.

| Jenis | Bidang spesifikasi yang dianjurkan |
|---|---|
| Tank / lapis baja | panjang, lebar, tinggi, bobot tempur, awak, penumpang, mesin, daya, kecepatan maks, jarak jelajah, persenjataan utama (jenis/kaliber), persenjataan sekunder |
| Artileri / roket | kaliber, panjang laras, bobot, awak, jangkauan maks (per amunisi), laju tembak, penggerak |
| Senjata ringan | kaliber/amunisi, panjang, bobot kosong, panjang laras, laju tembak, kapasitas magasin, jarak efektif (menurut produsen) |
| Kapal | panjang, lebar, sarat air, displasemen, propulsi, kecepatan maks, jarak jelajah, awak, persenjataan, sensor, kemampuan hanggar/dek |
| Kapal selam | panjang, lebar, displasemen (permukaan/tenggelam), propulsi, kecepatan maks, awak, tabung torpedo (jumlah) |
| Pesawat | panjang, rentang sayap, tinggi, bobot kosong, bobot lepas landas maks, mesin, kecepatan maks, jangkauan/jarak tempuh, plafon, awak/kapasitas, persenjataan/muatan |
| Helikopter | panjang, diameter rotor, bobot kosong, bobot maks, mesin, kecepatan maks, jangkauan, awak/kapasitas, persenjataan/muatan |
| UAV | rentang sayap, panjang, bobot lepas landas maks, daya tahan terbang, ketinggian operasi, muatan |
| Rudal | panjang, diameter, bobot, jangkauan (menurut produsen), kecepatan, jenis hulu ledak (kategori saja), pemandu |

Bidang yang tidak diketahui **dikosongkan**, bukan ditebak. Tampilkan sebagai "Tidak dipublikasikan".

### 6.3 Skema koleksi `alutsista` (Zod)

Gunakan Astro Content Collections. Sesuaikan sintaks loader dengan versi Astro yang dipakai.

```ts
// src/content.config.ts
import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const sumber = z.object({
  id: z.string(),                         // mis. "s1", dirujuk dari spesifikasi/pengguna/sejarah
  judul: z.string(),
  penerbit: z.string(),                   // produsen, kementerian, SIPRI, dsb.
  url: z.string().url().optional(),
  tanggalAkses: z.string(),               // "2026-11-24"
  jenis: z.enum(['resmi-produsen','resmi-pemerintah','database-independen','publikasi','sekunder']),
});

const keandalan = z.enum(['resmi','sekunder','perkiraan']);

const spesifikasi = z.object({
  kunci: z.string(),                      // mis. "panjang", "kecepatan-maks"
  label: z.string(),                      // "Panjang"
  nilai: z.union([z.number(), z.string()]),
  satuan: z.string().optional(),          // "m", "kg", "km/jam"
  catatan: z.string().optional(),         // mis. "tergantung varian"
  keandalan,
  sumberId: z.string(),
});

const pengguna = z.object({
  negara: z.string().length(2),           // ISO 3166-1 alpha-2
  angkatan: z.string().optional(),        // "TNI AU"
  varian: z.string().optional(),
  jumlah: z.number().nullable(),          // null jika tidak diketahui
  jenisJumlah: z.enum(['dioperasikan','dipesan','dikirim','perkiraan']),
  tahunMulai: z.number().optional(),
  tahunBerakhir: z.number().nullable().optional(),
  status: z.enum(['aktif','pensiun','dipesan','diketahui-tidak-pasti']),
  perDate: z.string(),                    // "2025-12" tanggal data
  catatan: z.string().optional(),
  sumberId: z.string(),
});

const peristiwa = z.object({
  tahun: z.number(),
  bulan: z.number().min(1).max(12).optional(),
  judul: z.string(),
  uraian: z.string(),
  sumberId: z.string(),
});

const model3d = z.object({
  berkas: z.string(),                     // "/models/leopard-2ri.glb"
  poster: z.string(),                     // "/models/leopard-2ri.webp"
  pembuat: z.string(),
  sumberUrl: z.string().url().optional(),
  lisensi: z.enum(['CC0','CC-BY-4.0','CC-BY-SA-4.0','milik-sendiri','izin-tertulis']),
  atribusi: z.string(),                   // teks kredit yang wajib tampil
  hotspot: z.array(z.object({
    id: z.string(),
    label: z.string(),
    posisi: z.string(),                   // "x y z" untuk data-position
    normal: z.string(),                   // "x y z" untuk data-normal
    deskripsi: z.string().optional(),
  })).default([]),
});

const alutsista = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/alutsista' }),
  schema: z.object({
    nama: z.string(),
    namaLain: z.array(z.string()).default([]),
    matra: z.enum(['darat','laut','udara']),
    jenis: z.string(),                    // harus ada di taksonomi.json
    peran: z.string(),                    // satu kalimat ringkas
    negaraAsal: z.array(z.string().length(2)),
    pabrikan: z.array(reference('pabrikan')),
    varian: z.array(z.object({ nama: z.string(), keterangan: z.string() })).default([]),
    tahunMulaiDinas: z.number().optional(),
    status: z.enum(['dalam-produksi','dalam-dinas','pensiun','prototipe','dibatalkan']),
    ringkasan: z.string(),                // 2–3 kalimat, kata sendiri
    spesifikasi: z.array(spesifikasi),
    pengguna: z.array(pengguna),
    sejarah: z.object({
      ringkas: z.string(),                // 2–4 paragraf, kata sendiri
      linimasa: z.array(peristiwa).min(3),
    }),
    model3d: model3d.optional(),
    galeri: z.array(z.object({ berkas: z.string(), alt: z.string(), kredit: z.string(), lisensi: z.string() })).default([]),
    sumber: z.array(sumber).min(2),
    tag: z.array(z.string()).default([]),
    diperbaruiPada: z.string(),           // "2026-11-24"
  }),
});

const pabrikan = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/pabrikan' }),
  schema: z.object({
    nama: z.string(),
    negara: z.string().length(2),
    tahunBerdiri: z.number().optional(),
    jenisUsaha: z.string(),               // "BUMN industri pertahanan", "swasta", dsb.
    deskripsi: z.string(),
    sejarahSingkat: z.string(),
    situs: z.string().url().optional(),
    sumber: z.array(sumber).min(1),
  }),
});

export const collections = { alutsista, pabrikan };
```

### 6.4 Contoh entri (FORMAT SAJA)

> **Peringatan:** contoh ini hanya memperlihatkan struktur. Nilai belum diverifikasi ke sumber dan **tidak boleh dipakai sebagai data final**. `jumlah` sengaja `null`.

```json
{
  "nama": "F-16 Fighting Falcon",
  "namaLain": ["F-16"],
  "matra": "udara",
  "jenis": "pesawat-tempur",
  "peran": "Pesawat tempur multiperan bermesin tunggal.",
  "negaraAsal": ["US"],
  "pabrikan": ["general-dynamics-lockheed-martin"],
  "tahunMulaiDinas": 1978,
  "status": "dalam-dinas",
  "ringkasan": "TODO: tulis 2–3 kalimat dengan kata sendiri.",
  "spesifikasi": [
    { "kunci": "panjang", "label": "Panjang", "nilai": 15.06, "satuan": "m", "keandalan": "sekunder", "sumberId": "s1" },
    { "kunci": "rentang-sayap", "label": "Rentang sayap", "nilai": 9.96, "satuan": "m", "keandalan": "sekunder", "sumberId": "s1" },
    { "kunci": "tinggi", "label": "Tinggi", "nilai": 4.88, "satuan": "m", "keandalan": "sekunder", "sumberId": "s1" }
  ],
  "pengguna": [
    { "negara": "ID", "angkatan": "TNI AU", "jumlah": null, "jenisJumlah": "perkiraan",
      "status": "aktif", "perDate": "TODO", "sumberId": "s2" }
  ],
  "sejarah": {
    "ringkas": "TODO",
    "linimasa": [
      { "tahun": 1974, "judul": "Penerbangan perdana prototipe", "uraian": "TODO", "sumberId": "s1" },
      { "tahun": 1978, "judul": "Mulai dinas", "uraian": "TODO", "sumberId": "s1" },
      { "tahun": 0, "judul": "TODO", "uraian": "TODO", "sumberId": "s2" }
    ]
  },
  "model3d": {
    "berkas": "/models/f-16.glb",
    "poster": "/models/f-16.webp",
    "pembuat": "TODO",
    "lisensi": "CC-BY-4.0",
    "atribusi": "TODO: teks kredit sesuai lisensi",
    "hotspot": []
  },
  "sumber": [
    { "id": "s1", "judul": "TODO", "penerbit": "TODO", "tanggalAkses": "2026-11-24", "jenis": "resmi-produsen" },
    { "id": "s2", "judul": "TODO", "penerbit": "TODO", "tanggalAkses": "2026-11-24", "jenis": "database-independen" }
  ],
  "diperbaruiPada": "2026-11-24"
}
```

Agen tidak boleh mengisi `TODO` dengan tebakan. Isi dari sumber terbuka yang dicantumkan, atau biarkan kosong dan laporkan.

---

## 7. Halaman dan fitur

| Halaman | Isi |
|---|---|
| `/` | Pengantar, pencarian, jalan pintas per matra, entri unggulan, disclaimer |
| `/katalog` | Daftar kartu (poster/foto, nama, jenis, negara asal, status). Filter: matra, jenis, pabrikan, negara asal, pengguna (negara), status, rentang tahun dinas. Pencarian teks. Urutan nama/tahun |
| `/alutsista/[slug]` | Penampil 3D, ringkasan, **tabel spesifikasi** (dengan penanda keandalan dan sumber), **pabrikan**, **tabel pengguna** (negara, angkatan, jumlah + tanggal data, status), **sejarah** (ringkas + linimasa), varian, galeri, kredit model, daftar sumber, tanggal pembaruan |
| `/jenis/[jenis]` | Daftar entri per jenis, penjelasan singkat jenis tersebut, sejarah ringkas jenis |
| `/pabrikan` & `/pabrikan/[slug]` | Profil produsen, sejarah singkat, daftar produk di katalog |
| `/pengguna` & `/pengguna/[kode]` | Daftar negara pengguna; halaman negara memuat alutsista yang dipakai dikelompokkan per angkatan (diturunkan dari data entri) |
| `/bandingkan` | Bandingkan 2–3 entri sejenis berdampingan (bidang spesifikasi yang sama saja), parameter dalam URL agar bisa dibagikan |
| `/sejarah` | Linimasa gabungan seluruh entri, bisa difilter per matra/dekade |
| `/tentang` | Tujuan, metodologi, sumber, aturan konten, disclaimer, atribusi model & gambar, kontak koreksi |

Fitur lintas halaman: navigasi jelas, breadcrumb, mode terang/gelap, pilihan satuan metrik/imperial (tampilan saja), tautan permanen per entri, tombol "Laporkan koreksi data" (tautan ke isu repositori atau email).

---

## 8. Model 3D

### 8.1 Spesifikasi teknis

- Format **GLB** (glTF binary). Satu berkas per entri: `public/models/<slug>.glb`.
- **Anggaran ukuran:** target ≤ **5 MB**, batas keras **10 MB** per model. Kompres dengan `gltf-transform` (Draco atau meshopt; ubah ukuran tekstur ke maksimal 2048 px; hapus data yang tidak terpakai). Skrip `check-model-size.ts` menggagalkan build bila melampaui batas.
- Sediakan **poster** (WebP, ≤ 150 KB) agar halaman cepat tampil sebelum model dimuat.
- Orientasi dan skala seragam: sumbu atas +Y, model berpusat di titik asal, skala dalam meter bila memungkinkan.
- Model berasal dari sumber dengan lisensi jelas (lihat 8.3).

### 8.2 Komponen penampil

```astro
---
// src/components/ModelViewer.astro
const { model, nama } = Astro.props;
---
<model-viewer
  src={model.berkas}
  poster={model.poster}
  alt={`Model 3D ${nama}. Seret untuk memutar, cubit atau gulir untuk memperbesar.`}
  camera-controls
  auto-rotate
  interaction-prompt="auto"
  shadow-intensity="1"
  environment-image="neutral"
  loading="lazy"
  reveal="interaction"
  touch-action="pan-y"
  style="width:100%;height:min(70vh,520px);background:transparent"
>
  {model.hotspot.map((h) => (
    <button class="hotspot" slot={`hotspot-${h.id}`} data-position={h.posisi} data-normal={h.normal}>
      <span class="hotspot-label">{h.label}</span>
    </button>
  ))}
</model-viewer>

<script>
  import '@google/model-viewer';
</script>
```

Persyaratan perilaku:

1. Pemuatan malas: model hanya diunduh saat pengunjung berinteraksi atau saat penampil terlihat. Poster tampil lebih dulu.
2. Jika WebGL tidak tersedia atau model gagal dimuat, tampilkan **poster statis** dan pesan singkat, bukan area kosong.
3. Tombol bantu: "Putar otomatis hidup/mati" dan "Atur ulang tampilan".
4. Hotspot memunculkan penjelasan bagian (mis. "Radar", "Mesin") dari data `hotspot`. Penjelasan hanya deskriptif dan tingkat umum.
5. Opsional (Fase 3): tombol AR (`ar`, `ar-modes`) bila modelnya cocok.
6. Pastikan area penampil tidak "menjebak" scroll di ponsel (`touch-action="pan-y"`).
7. Alt text menjelaskan objek, bukan hanya nama berkas.

### 8.3 Lisensi dan atribusi model

- **Boleh:** CC0, CC BY 4.0, CC BY-SA 4.0, model buatan sendiri, atau model dengan izin tertulis pembuatnya.
- **Jangan:** lisensi NonCommercial atau NoDerivatives (kompresi dan perapian dihitung sebagai perubahan), model yang diambil dari gim atau berkas komersial, model tanpa lisensi, dan hasil "rip" dari sumber lain.
- Setiap model wajib punya panel **"Kredit model"** pada halaman entri (pembuat, sumber, lisensi, teks atribusi dari field `atribusi`) dan dicatat di `/tentang`.
- Jika belum ada model berlisensi untuk suatu entri, tampilkan **foto berlisensi bebas** atau poster, dan beri tanda "Model 3D belum tersedia". Jangan memaksa memakai model yang lisensinya tidak jelas.

---

## 9. Sejarah (konten)

Setiap entri wajib punya:

- `sejarah.ringkas`: 2–4 paragraf, kata sendiri. Isi: latar kebutuhan/pengembangan, kelahiran program, perkembangan varian, peran utama, keterkaitan dengan Indonesia (pengadaan, modernisasi, produksi lokal bila ada).
- `sejarah.linimasa`: minimal 3 peristiwa bertanggal dengan sumber (pengembangan, uji coba/penerbangan perdana/peluncuran, mulai dinas, pengadaan Indonesia, modernisasi, pensiun bila ada).

Halaman `/jenis/[jenis]` dan `/pabrikan/[slug]` juga memuat sejarah ringkas (kategori atau perusahaan) dengan sumber.

Pedoman penulisan sejarah:

- Pisahkan **fakta bersumber** dari interpretasi. Interpretasi diberi penanda.
- Tahun dan nama program diverifikasi minimal pada dua sumber untuk peristiwa penting.
- Insiden dan kecelakaan hanya dimuat bila faktual, relevan, dan bersumber; tulis dengan hormat dan tanpa sensasi.
- Gunakan istilah baku bahasa Indonesia dan sebutkan nama asli di dalam tanda kurung bila perlu.

---

## 10. Sumber data yang diprioritaskan

Urutan prioritas:

1. **Sumber primer:** situs/brosur produsen (mis. Pindad, PT PAL, PT Dirgantara Indonesia, Leonardo, KMW, Lockheed Martin, dan lainnya), situs resmi Kementerian/angkatan bersenjata, dokumen publik pengadaan.
2. **Basis data dan publikasi independen:** SIPRI Arms Transfers Database (untuk transfer senjata), laporan IISS Military Balance (berbayar: **jangan menyalin isi**, hanya rujuk), publikasi akademik dan jurnal pertahanan.
3. **Media dan referensi sekunder:** media pertahanan bereputasi. **Wikipedia** hanya boleh dipakai sebagai petunjuk untuk menemukan sumber asli, bukan sebagai sumber akhir.

Aturan penggunaan sumber:

- Jangan menyalin tabel atau teks. Ambil fakta, tulis ulang, cantumkan sumber.
- Catat `tanggalAkses` pada setiap sumber.
- Jika sumber saling bertentangan, tulis rentang atau catatan di field `catatan`.
- Jangan membuat tautan sumber dari ingatan. Hanya pakai URL yang benar-benar sudah dibuka dan diperiksa.

---

## 11. Kandidat entri awal (Fase 1–2)

Daftar ini hanya **kandidat** untuk memulai. Agen harus memverifikasi keberadaan, varian, jumlah, dan status terkini dari sumber sebelum membuat entri. Pengadaan baru dan status operasional berubah cepat, jadi jangan menganggap daftar ini sudah mutakhir.

| Matra | Jenis | Kandidat |
|---|---|---|
| Darat | tank-utama | Leopard 2 (varian yang dioperasikan TNI AD) |
| Darat | kendaraan-lapis-baja | Pindad Anoa; Harimau (tank medium Pindad–FNSS) |
| Darat | senjata-ringan | Pindad SS2 |
| Darat | roket-multilaras | ASTROS II |
| Laut | kapal-selam | Kelas Nagapasa |
| Laut | fregat | Kelas Martadinata (SIGMA) |
| Laut | korvet | Kelas Bung Tomo |
| Laut | kapal-amfibi | Kelas Makassar (LPD) |
| Udara | pesawat-tempur | F-16; Su-27/Su-30; (cek status pengadaan terbaru) |
| Udara | pesawat-latih | KAI T-50i Golden Eagle |
| Udara | pesawat-angkut | C-130 Hercules; CN-235 |
| Udara | helikopter | Panther (AS565); Apache (AH-64E) |

Pabrikan yang kemungkinan perlu profil: Pindad, PT PAL Indonesia, PT Dirgantara Indonesia, Krauss-Maffei Wegmann, Lockheed Martin, Sukhoi/UAC, Korea Aerospace Industries, Damen, Daesun/DSME, Avibras, Airbus.

---

## 12. Fase pengerjaan

Kerjakan **satu fase per langkah**. Setelah setiap fase: jalankan semua pemeriksaan di bagian 14, laporkan hasilnya, lalu **berhenti dan tunggu persetujuan** sebelum lanjut.

### Fase 1 — MVP
1. Inisialisasi proyek Astro + TypeScript + Tailwind, konfigurasi Vercel.
2. `content.config.ts`, `taksonomi.json`, `negara.json`, skrip `validate-data.ts`.
3. Layout dasar, navigasi, footer dengan disclaimer, halaman `/tentang`.
4. Komponen `ModelViewer`, `SpecTable`, `UserTable`, `Timeline`, `SourceList`.
5. Halaman `/katalog` (filter matra, jenis, negara asal, pencarian) dan `/alutsista/[slug]`.
6. **5 entri lengkap** (minimal 1 per matra), data bersumber nyata, model 3D berlisensi jelas (atau poster bila model belum ada).
7. Deploy ke Vercel dan uji di ponsel.

### Fase 2 — Kedalaman konten
1. Halaman pabrikan dan pengguna (diturunkan dari data).
2. Halaman `/jenis/[jenis]` dan `/sejarah` (linimasa gabungan).
3. `/bandingkan` dengan parameter URL.
4. Hotspot pada model, panel kredit model, kontrol bantu penampil.
5. Perluas hingga ±20 entri, tiap entri lulus daftar periksa data (bagian 13).

### Fase 3 — Poles dan perluasan
1. Peta sebaran/pangkalan (Leaflet), hanya dari data publik tingkat umum.
2. Mode AR untuk model yang cocok.
3. Mode gelap penuh, pilihan satuan, optimasi SEO (meta, OpenGraph memakai poster).
4. Perluasan multi-negara dan terjemahan Inggris (bila diminta pemilik).
5. CI: validasi data, anggaran ukuran model, pemeriksa tautan sumber.

---

## 13. Daftar periksa kualitas data per entri

Sebuah entri **belum selesai** bila ada satu pun yang gagal:

- [ ] `jenis` ada di taksonomi dan `matra` sesuai.
- [ ] Setiap nilai spesifikasi punya `sumberId`, `keandalan`, dan satuan metrik.
- [ ] Bidang kunci untuk jenisnya (bagian 6.2) terisi atau sengaja dikosongkan.
- [ ] Setiap baris pengguna punya `perDate`, `jenisJumlah`, status, dan sumber. Jumlah tidak diketahui ditulis `null`, bukan angka tebakan.
- [ ] Sejarah ringkas ditulis dengan kata sendiri; linimasa ≥ 3 peristiwa bersumber.
- [ ] Minimal 2 sumber berbeda; tiap tautan sudah dibuka dan valid.
- [ ] Pabrikan terhubung ke koleksi `pabrikan`.
- [ ] Model 3D: ukuran dalam anggaran, poster ada, lisensi sesuai bagian 8.3, atribusi tampil.
- [ ] Gambar punya `alt`, kredit, dan lisensi.
- [ ] Tidak ada detail operasional/taktis (bagian 2).
- [ ] `diperbaruiPada` terisi.

---

## 14. Kriteria selesai (teknis) dan perintah

Perintah yang harus tersedia di `package.json`:

```
npm run dev        # server pengembangan
npm run build      # build produksi
npm run validate   # validasi skema, sumber, berkas model
npm run lint       # lint + cek tipe (astro check)
```

Sebuah fase dianggap selesai bila:

- `npm run validate`, `npm run lint`, dan `npm run build` lulus tanpa galat.
- Tidak ada galat di konsol browser pada halaman utama, katalog, dan detail.
- **Lighthouse** (mode seluler, target saran): Performa ≥ 90, Aksesibilitas ≥ 95, SEO ≥ 90. Penampil 3D dimuat malas sehingga tidak merusak skor.
- Halaman detail memuat penampil, spesifikasi, pabrikan, pengguna, dan sejarah.
- Responsif dan nyaman dipakai di layar ponsel 360 px.
- Semua teks antarmuka berbahasa Indonesia dengan format angka dan tanggal `id-ID`.
- Navigasi keyboard berfungsi; kontras warna memadai; setiap gambar punya `alt`.
- Disclaimer tampil di footer dan `/tentang`.
- README diperbarui: cara menjalankan, struktur data, cara menambah entri, sumber, lisensi aset.

---

## 15. Cara menambah entri baru (alur kerja agen)

1. Tentukan jenis dan matra di `taksonomi.json`.
2. Kumpulkan sumber terbuka (bagian 10). Catat URL dan tanggal akses.
3. Tulis `src/content/alutsista/<slug>.json` sesuai skema. Tambahkan profil produsen bila belum ada.
4. Siapkan model 3D berlisensi jelas atau foto/poster berlisensi bebas. Kompres dan taruh di `public/models`.
5. Jalankan `npm run validate`, perbaiki semua galat.
6. Periksa halaman di `npm run dev`, termasuk di ponsel.
7. Komit dengan pesan: `feat(data): tambah <nama alutsista>`.

---

## 16. Alur kerja agen dan konvensi

- Baca dokumen ini dan `README.md`, lalu **buat rencana singkat** (struktur folder, halaman, model data) sebelum menulis kode.
- Kerjakan hanya fase yang diminta. **Jangan menambah fitur di luar daftar** tanpa izin.
- Komit kecil dan rapi dengan format konvensional: `feat:`, `fix:`, `docs:`, `chore:`, `feat(data):`.
- Jangan mengubah skema data tanpa menjelaskan dampaknya pada entri yang sudah ada dan menjalankan ulang validasi.
- Jangan menghapus atau menimpa konten yang sudah diverifikasi tanpa alasan tertulis.
- Bila data tidak bisa diverifikasi dari sumber terbuka, **tinggalkan kosong dan laporkan**, jangan mengarang.
- Setiap akhir fase, tulis laporan singkat: apa yang dibuat, apa yang diverifikasi, apa yang belum, dan pertanyaan untuk pemilik.

### Pertanyaan yang harus diajukan ke pemilik (jangan diasumsikan)

1. Apakah cakupan tetap Indonesia dulu, atau langsung multi-negara?
2. Dari mana model 3D akan diperoleh (cari di sumber berlisensi, buat sendiri, atau lainnya)?
3. Apakah situs ini akan memakai nama/logo organisasi tertentu? (Default: tidak.)
4. Apakah perlu versi bahasa Inggris?

---

## 17. Larangan ringkas

- Jangan memuat informasi rahasia, bocoran, atau data personel.
- Jangan menulis panduan operasi, pembuatan, modifikasi, atau penargetan.
- Jangan menaruh kunci, kata sandi, atau rahasia di repositori.
- Jangan memakai gambar, model, atau logo tanpa lisensi jelas.
- Jangan menyalin teks dari sumber lain.
- Jangan mengisi data dengan tebakan; kosongkan dan laporkan.
- Jangan mengklaim situs ini resmi atau berafiliasi dengan institusi mana pun.
