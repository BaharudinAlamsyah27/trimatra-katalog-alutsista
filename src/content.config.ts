import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const sumber = z.object({
  id: z.string(),
  judul: z.string(),
  penerbit: z.string(),
  url: z.string().url().optional(),
  tanggalAkses: z.string(),
  jenis: z.enum([
    'resmi-produsen',
    'resmi-pemerintah',
    'database-independen',
    'publikasi',
    'sekunder',
  ]),
});

const keandalan = z.enum(['resmi', 'sekunder', 'perkiraan']);

const spesifikasi = z.object({
  kunci: z.string(),
  label: z.string(),
  nilai: z.union([z.number(), z.string()]),
  satuan: z.string().optional(),
  catatan: z.string().optional(),
  keandalan,
  sumberId: z.string(),
});

const pengguna = z.object({
  negara: z.string().length(2),
  angkatan: z.string().optional(),
  varian: z.string().optional(),
  jumlah: z.number().nullable(),
  jenisJumlah: z.enum(['dioperasikan', 'dipesan', 'dikirim', 'perkiraan']),
  tahunMulai: z.number().optional(),
  tahunBerakhir: z.number().nullable().optional(),
  status: z.enum(['aktif', 'pensiun', 'dipesan', 'diketahui-tidak-pasti']),
  perDate: z.string(),
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
  berkas: z.string(),
  poster: z.string(),
  pembuat: z.string(),
  sumberUrl: z.string().url().optional(),
  lisensi: z.enum(['CC0', 'CC-BY-4.0', 'CC-BY-SA-4.0', 'milik-sendiri', 'izin-tertulis']),
  atribusi: z.string(),
  hotspot: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        posisi: z.string(),
        normal: z.string(),
        deskripsi: z.string().optional(),
      })
    )
    .default([]),
});

const alutsista = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/alutsista' }),
  schema: z.object({
    nama: z.string(),
    namaLain: z.array(z.string()).default([]),
    matra: z.enum(['darat', 'laut', 'udara']),
    jenis: z.string(),
    peran: z.string(),
    negaraAsal: z.array(z.string().length(2)),
    pabrikan: z.array(reference('pabrikan')),
    varian: z
      .array(
        z.object({
          nama: z.string(),
          keterangan: z.string(),
        })
      )
      .default([]),
    tahunMulaiDinas: z.number().optional(),
    status: z.enum([
      'dalam-produksi',
      'dalam-dinas',
      'pensiun',
      'prototipe',
      'dibatalkan',
    ]),
    ringkasan: z.string(),
    spesifikasi: z.array(spesifikasi),
    pengguna: z.array(pengguna),
    sejarah: z.object({
      ringkas: z.string(),
      linimasa: z.array(peristiwa).min(3),
    }),
    model3d: model3d.optional(),
    galeri: z
      .array(
        z.object({
          berkas: z.string(),
          alt: z.string(),
          kredit: z.string(),
          lisensi: z.string(),
        })
      )
      .default([]),
    sumber: z.array(sumber).min(2),
    tag: z.array(z.string()).default([]),
    diperbaruiPada: z.string(),
  }),
});

const pabrikan = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/pabrikan' }),
  schema: z.object({
    nama: z.string(),
    negara: z.string().length(2),
    tahunBerdiri: z.number().optional(),
    jenisUsaha: z.string(),
    deskripsi: z.string(),
    sejarahSingkat: z.string(),
    situs: z.string().url().optional(),
    sumber: z.array(sumber).min(1),
  }),
});

const pangkalan = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/pangkalan' }),
  schema: z.object({
    nama: z.string(),
    matra: z.enum(['darat', 'laut', 'udara']),
    lat: z.number(),
    lng: z.number(),
    satuan: z.string(),
    isReferensiGeografis: z.boolean().default(false),
    alutsista: z
      .array(
        z.object({
          nama: z.string(),
          slug: z.string(),
        })
      )
      .default([]),
    sumber: z.string(),
  }),
});

export const collections = { alutsista, pabrikan, pangkalan };
