# Prompt Awal untuk Agen

Salin blok di bawah ini ke agen pada sesi pertama. Letakkan `AGENT.md` di akar repositori, serta `taksonomi.json` dan `negara.json` di `src/data/`.

---

```
Kamu akan membangun situs "Katalog Alutsista Interaktif". Baca AGENT.md di akar repositori sampai selesai sebelum menulis kode, termasuk aturan konten (bagian 2) dan larangan (bagian 17). File src/data/taksonomi.json dan src/data/negara.json sudah disediakan; pakai apa adanya dan jangan mengubah isinya tanpa izin.

Langkah 1: sebelum memulai, ajukan empat pertanyaan pada bagian 16 AGENT.md ("Pertanyaan yang harus diajukan ke pemilik") dan tunggu jawabanku. Jika aku belum menjawab, pakai asumsi awal di AGENT.md dan tulis asumsi itu di README.

Langkah 2: kerjakan HANYA Fase 1 (bagian 12). Buat rencana singkat dulu: struktur folder, halaman, model data.

Aturan penting:
- Situs statis di Vercel, tanpa backend, tanpa kunci API.
- Semua angka spesifikasi, jumlah pengguna, dan peristiwa sejarah harus punya sumber dari informasi terbuka. Jangan mengarang; jika tidak bisa diverifikasi, kosongkan dan laporkan.
- Tulis semua teks dengan kata sendiri, jangan menyalin dari Wikipedia/Jane's/situs lain.
- Hanya pakai gambar dan model 3D berlisensi bebas (CC0, CC BY, CC BY-SA, milik sendiri, atau izin tertulis). Jika belum ada, tampilkan poster/foto dan tandai "Model 3D belum tersedia".
- Jangan menambah fitur di luar daftar.

Setelah Fase 1 selesai: jalankan npm run validate, npm run lint, npm run build, jalankan Lighthouse seluler, lalu laporkan hasilnya (yang dibuat, yang diverifikasi, yang belum, pertanyaan untukku) dan BERHENTI sampai aku menyetujui Fase 2.
```

---

## Prompt lanjutan

**Fase 2:**
```
Lanjutkan ke Fase 2 sesuai AGENT.md bagian 12. Pakai ulang komponen dan skema Fase 1, jaga struktur folder, jalankan validate/lint/build, perbarui README, lalu laporkan dan berhenti.
```

**Fase 3:**
```
Lanjutkan ke Fase 3 sesuai AGENT.md bagian 12. Kerjakan butir satu per satu, laporkan setiap selesai, dan jangan mengubah skema data tanpa menjelaskan dampaknya.
```

**Menambah satu entri:**
```
Tambahkan entri "<nama alutsista>" mengikuti alur di AGENT.md bagian 15 dan daftar periksa bagian 13. Kumpulkan sumber terbuka dan catat tanggal akses. Kosongkan yang tidak bisa diverifikasi dan laporkan.
```

**Pemeriksaan kualitas data (sebelum deploy):**
```
Periksa semua entri di src/content/alutsista terhadap daftar periksa AGENT.md bagian 13. Laporkan entri yang gagal beserta alasannya. Jangan memperbaiki dengan tebakan.
```
