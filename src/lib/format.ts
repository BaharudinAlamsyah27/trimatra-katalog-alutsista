import negaraJson from '../data/negara.json';
import taksonomiJson from '../data/taksonomi.json';

export function formatAngka(nilai: number | string, locale: 'id-ID' | 'en-US' = 'id-ID'): string {
  if (typeof nilai === 'string') return nilai;
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(nilai);
}

export function formatTanggalBulan(isoYearMonth: string, locale: 'id-ID' | 'en-US' = 'id-ID'): string {
  const parts = isoYearMonth.split('-');
  if (parts.length === 1) return parts[0];
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const date = new Date(Date.UTC(year, month, 1));
  if (isNaN(date.getTime())) return isoYearMonth;
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatTanggalLengkap(isoDate: string, locale: 'id-ID' | 'en-US' = 'id-ID'): string {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function namaNegara(kode: string): string {
  const map = negaraJson.negara as Record<string, string>;
  return map[kode] || kode;
}

export function labelMatra(kunci: string): string {
  const found = taksonomiJson.matra.find((m) => m.kunci === kunci);
  return found ? found.label : kunci;
}

export function infoJenis(kunci: string) {
  return taksonomiJson.jenis.find((j) => j.kunci === kunci);
}

export function labelJenis(kunci: string): string {
  return infoJenis(kunci)?.label || kunci;
}

export function labelStatus(status: string): string {
  const map: Record<string, string> = {
    'dalam-produksi': 'Dalam Produksi',
    'dalam-dinas': 'Dalam Dinas',
    'pensiun': 'Pensiun',
    'prototipe': 'Prototipe',
    'dibatalkan': 'Dibatalkan',
    'aktif': 'Aktif',
    'dipesan': 'Dipesan',
    'diketahui-tidak-pasti': 'Status Tidak Pasti',
  };
  return map[status] || status;
}

export function labelKeandalan(keandalan: string): string {
  const map: Record<string, string> = {
    resmi: 'Resmi (Produsen/Pemerintah)',
    sekunder: 'Sekunder (Basis Data/Publikasi)',
    perkiraan: 'Perkiraan',
  };
  return map[keandalan] || keandalan;
}

export function labelJenisJumlah(jenis: string): string {
  const map: Record<string, string> = {
    dioperasikan: 'Dioperasikan',
    dipesan: 'Dipesan',
    dikirim: 'Dikirim',
    perkiraan: 'Perkiraan',
  };
  return map[jenis] || jenis;
}
