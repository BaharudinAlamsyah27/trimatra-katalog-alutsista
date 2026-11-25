# Katalog Alutsista Interaktif

Situs edukasi berbahasa Indonesia (dengan dukungan pengalih label antarmuka Indonesia/Inggris) yang mendokumentasikan alat utama sistem senjata (alutsista) dari sumber terbuka tingkat katalog, dilengkapi model 3D interaktif berlisensi bebas.

> **Penafian Wajib (Disclaimer):**
> Situs edukasi non-resmi. Tidak berafiliasi dengan TNI, Kementerian Pertahanan, atau produsen mana pun. Data bersumber dari informasi terbuka dan dapat berbeda dari data resmi.

---

## 1. Keputusan & Asumsi Awal Pemilik Proyek (Bagian 16 AGENT.md)

1. **Cakupan konten:** Fase 1–2 berfokus pada alutsista yang dioperasikan oleh TNI (Indonesia), dengan skema data yang mendukung multi-negara sejak awal (kode ISO 3166-1 alpha-2 pada `negaraAsal` dan `pengguna`, termasuk pencatatan pengguna ekspor seperti Filipina dan Korea Selatan pada produk industri pertahanan dalam negeri).
2. **Sumber model 3D:** Menggunakan model 3D berlisensi bebas (`CC0`, `CC-BY-4.0`, `CC-BY-SA-4.0`, atau milik sendiri) disertai poster pratinjau WebP dan titik bagian (*hotspot*) deskriptif. Bila suatu entri belum memiliki model 3D, halaman menampilkan poster/foto berlisensi bebas dengan penanda *"Model 3D belum tersedia"*.
3. **Identitas organisasi:** Independen, tidak memakai nama atau logo organisasi/instansi mana pun.
4. **Dukungan bahasa:** Antarmuka utama berbahasa Indonesia dengan format angka/tanggal `id-ID`, dilengkapi tombol pengalih label antarmuka dwibahasa (`ID` / `EN`) di bilah navigasi.

---

## 2. Cara Menjalankan Proyek

Pastikan Node.js (v20+) dan npm sudah terpasang.

```bash
# 1. Pasang dependensi
npm install

# 2. Jalankan server pengembangan lokal
npm run dev

# 3. Validasi skema data, referensi sumber, dan anggaran ukuran model 3D
npm run validate

# 4. Periksa tipe TypeScript dan komponen Astro
npm run lint

# 5. Bangun situs statis untuk produksi (output di folder dist/)
npm run build
```

---

## 3. Struktur Folder & Halaman (Fase 1 & Fase 2)

```text
/
├─ AGENT.md                        # Aturan kerja dan pedoman konten
├─ README.md                       # Dokumentasi proyek
├─ astro.config.mjs                # Konfigurasi Astro (SSG) + Tailwind CSS
├─ vercel.json                     # Header cache untuk /models dan /images
├─ package.json
├─ scripts/
│  ├─ validate-data.ts             # Validasi skema, kecocokan taksonomi/negara, sumber, & berkas
│  └─ check-model-size.ts          # Pemeriksa ukuran GLB (<= 5 MB target, <= 10 MB batas) & WebP (<= 150 KB)
├─ public/
│  ├─ models/                      # Model 3D (<slug>.glb) dan poster pratinjau (<slug>.webp)
│  └─ images/                      # Foto pendukung berlisensi bebas
└─ src/
   ├─ content.config.ts            # Skema Zod Astro Content Collections (alutsista & pabrikan)
   ├─ content/
   │  ├─ alutsista/                # 25 berkas JSON entri alutsista
   │  └─ pabrikan/                 # 17 berkas JSON profil produsen
   ├─ data/
   │  ├─ taksonomi.json            # Definisi matra, jenis, dan templat spesifikasi (jangan diubah tanpa izin)
   │  └─ negara.json               # Peta kode ISO 3166-1 alpha-2 ke nama negara bahasa Indonesia
   ├─ components/
   │  ├─ ModelViewer.astro         # Pembungkus <model-viewer> (pemuatan malas, kontrol putar/reset/hotspot, panel kredit model)
   │  ├─ SpecTable.astro           # Tabel spesifikasi metrik dengan lencana keandalan & tautan sumber
   │  ├─ UserTable.astro           # Tabel negara pengguna, jumlah, tanggal data, dan sumber
   │  ├─ Timeline.astro            # Ringkasan sejarah & linimasa peristiwa bersumber
   │  └─ SourceList.astro          # Daftar referensi sumber terbuka beserta tanggal akses
   ├─ layouts/Base.astro           # Layout utama, navigasi, mode terang/gelap, toggle ID/EN, footer disclaimer
   ├─ pages/
   │  ├─ index.astro               # Beranda, pencarian cepat, jalan pintas matra, entri unggulan
   │  ├─ katalog/index.astro       # Katalog dengan filter matra, jenis, negara asal, urutan, & pencarian
   │  ├─ alutsista/[slug].astro    # Halaman detail alutsista lengkap
   │  ├─ jenis/[jenis].astro       # Daftar entri per jenis, penjelasan & sejarah ringkas jenis
   │  ├─ pabrikan/index.astro      # Daftar produsen pertahanan (diturunkan dari data entri)
   │  ├─ pabrikan/[slug].astro     # Profil produsen, sejarah singkat, dan daftar produk di katalog
   │  ├─ pengguna/index.astro      # Daftar negara pengguna (diturunkan dari data entri)
   │  ├─ pengguna/[kode].astro     # Alutsista yang dioperasikan negara terkait dikelompokkan per angkatan
   │  ├─ bandingkan.astro          # Perbandingan 2–3 entri sejenis berdampingan dengan parameter URL (?jenis=&items=)
   │  ├─ sejarah.astro             # Linimasa sejarah gabungan seluruh entri (filter matra & dekade)
   │  └─ tentang.astro             # Metodologi, aturan konten, daftar atribusi model 3D, kontak koreksi
   └─ lib/
      ├─ format.ts                 # Pemformatan angka/tanggal id-ID dan label taksonomi
      └─ derive.ts                 # Fungsi turunan data pengguna, pabrikan, linimasa gabungan, & sejarah jenis
```

---

## 4. Cara Menambah Entri Baru

1. Pastikan `matra` dan `jenis` terdaftar di `src/data/taksonomi.json`, serta kode negara ada di `src/data/negara.json`.
2. Kumpulkan minimal **2 sumber terbuka** yang kredibel (situs produsen, instansi resmi, SIPRI, atau publikasi pertahanan). Catat URL dan `tanggalAkses`.
3. Buat atau pastikan profil produsen sudah ada di `src/content/pabrikan/<slug-pabrikan>.json`.
4. Buat berkas `src/content/alutsista/<slug>.json` mengikuti skema di `src/content.config.ts`:
   - Semua angka spesifikasi disimpan dalam satuan **metrik** dan wajib memiliki `keandalan` (`resmi` | `sekunder` | `perkiraan`) serta `sumberId`.
   - Bidang yang tidak dipublikasikan jangan ditebak; cukup dikosongkan dari larik `spesifikasi` (komponen `SpecTable` otomatis menampilkannya sebagai *"Tidak dipublikasikan"*).
   - Tulis `ringkasan` dan `sejarah.ringkas` dengan kalimat sendiri (dilarang menyalin teks dari Wikipedia/Jane's/situs lain).
5. Simpan model 3D (`public/models/<slug>.glb`, target ≤ 5 MB) dan poster (`public/models/<slug>.webp`, ≤ 150 KB).
6. Jalankan `npm run validate`, `npm run lint`, dan `npm run build` untuk memastikan tidak ada galat.

---

## 5. Daftar Entri & Lisensi Aset (Fase 2 — 25 Entri)

Seluruh model 3D skematik (`.glb`) dan poster pratinjau (`.webp`) di `public/models/` dirilis di bawah lisensi domain publik **`CC0`**.

### Matra Darat (8 Entri)
| Entri | Slug | Jenis | Pabrikan |
|---|---|---|---|
| **Leopard 2RI** | `leopard-2ri` | `tank-utama` | KMW & Rheinmetall |
| **Tank Medium Harimau (Kaplan MT)** | `harimau-medium-tank` | `tank-medium` | PT Pindad, FNSS |
| **Pindad Anoa 6x6** | `pindad-anoa-6x6` | `kendaraan-lapis-baja` | PT Pindad |
| **Pindad Badak 6x6** | `pindad-badak-6x6` | `kendaraan-lapis-baja` | PT Pindad |
| **Pindad Komodo 4x4** | `pindad-komodo-4x4` | `kendaraan-taktis` | PT Pindad |
| **Pindad Maung 4x4** | `pindad-maung-4x4` | `kendaraan-taktis` | PT Pindad |
| **CAESAR 155 mm 6x6** | `caesar-155mm` | `artileri` | KNDS France (Nexter) |
| **ASTROS II Mk 6** | `astros-ii-mk6` | `roket-multilaras` | Avibras |
| **Pindad SS2-V1** | `pindad-ss2` | `senjata-ringan` | PT Pindad |

### Matra Laut (6 Entri)
| Entri | Slug | Jenis | Pabrikan |
|---|---|---|---|
| **Kapal Selam Kelas Nagapasa (Type 209/1400)** | `kapal-selam-kelas-nagapasa` | `kapal-selam` | DSME (Hanwha Ocean), PT PAL Indonesia |
| **Kapal Selam Kelas Cakra (Type 209/1300)** | `kapal-selam-kelas-cakra` | `kapal-selam` | HDW (tkMS) |
| **Fregat Kelas Martadinata (SIGMA 10514)** | `fregat-kelas-martadinata` | `fregat` | Damen Naval, PT PAL Indonesia |
| **Korvet Kelas Bung Tomo** | `korvet-kelas-bung-tomo` | `korvet` | BAE Systems Maritime |
| **Korvet Kelas Diponegoro (SIGMA 9113)** | `korvet-kelas-diponegoro` | `korvet` | Damen Naval |
| **Kapal Amfibi Kelas Makassar (LPD)** | `kapal-amfibi-kelas-makassar` | `kapal-amfibi` | Daesun Shipbuilding, PT PAL Indonesia |
| **KCR-60M Kelas Sampari** | `kcr-60m-sampari` | `kapal-patroli` | PT PAL Indonesia |

### Matra Udara (9 Entri)
| Entri | Slug | Jenis | Pabrikan |
|---|---|---|---|
| **F-16 Fighting Falcon** | `f-16-fighting-falcon` | `pesawat-tempur` | General Dynamics / Lockheed Martin |
| **Sukhoi Su-27 / Su-30** | `sukhoi-su-27-su-30` | `pesawat-tempur` | Sukhoi / UAC |
| **KAI T-50i Golden Eagle** | `kai-t-50i-golden-eagle` | `pesawat-latih` | Korea Aerospace Industries (KAI) |
| **C-130 Hercules** | `c-130-hercules` | `pesawat-angkut` | Lockheed Martin |
| **CN235-220** | `cn-235-220` | `pesawat-angkut` | PT Dirgantara Indonesia |
| **NC212i** | `nc212i` | `pesawat-angkut` | PT Dirgantara Indonesia |
| **Boeing AH-64E Apache Guardian** | `ah-64e-apache` | `helikopter` | Boeing |
| **AS565 MBe Panther** | `as565-mbe-panther` | `helikopter` | Airbus Helicopters, PT Dirgantara Indonesia |
| **H225M Caracal** | `h225m-caracal` | `helikopter` | Airbus Helicopters, PT Dirgantara Indonesia |
