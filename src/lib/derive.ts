import { getCollection, type CollectionEntry } from 'astro:content';
import taksonomiJson from '../data/taksonomi.json';
import { namaNegara } from './format';

export type AlutsistaEntry = CollectionEntry<'alutsista'>;
export type PabrikanEntry = CollectionEntry<'pabrikan'>;

export async function getAllAlutsista(): Promise<AlutsistaEntry[]> {
  const list = await getCollection('alutsista');
  return list.sort((a, b) => a.data.nama.localeCompare(b.data.nama, 'id'));
}

export async function getAllPabrikan(): Promise<PabrikanEntry[]> {
  const list = await getCollection('pabrikan');
  return list.sort((a, b) => a.data.nama.localeCompare(b.data.nama, 'id'));
}

export interface PenggunaSummary {
  kode: string;
  nama: string;
  entriList: Array<{
    entri: AlutsistaEntry;
    barisPengguna: AlutsistaEntry['data']['pengguna'][number];
  }>;
  angkatanMap: Map<
    string,
    Array<{
      entri: AlutsistaEntry;
      barisPengguna: AlutsistaEntry['data']['pengguna'][number];
    }>
  >;
}

export async function derivePenggunaMap(): Promise<Map<string, PenggunaSummary>> {
  const semuaAlutsista = await getAllAlutsista();
  const map = new Map<string, PenggunaSummary>();

  for (const entri of semuaAlutsista) {
    for (const pg of entri.data.pengguna) {
      const kode = pg.negara;
      let summary = map.get(kode);
      if (!summary) {
        summary = {
          kode,
          nama: namaNegara(kode),
          entriList: [],
          angkatanMap: new Map(),
        };
        map.set(kode, summary);
      }
      summary.entriList.push({ entri, barisPengguna: pg });
      const angkatanKey = pg.angkatan || 'Angkatan Bersenjata / Umum';
      const group = summary.angkatanMap.get(angkatanKey) || [];
      group.push({ entri, barisPengguna: pg });
      summary.angkatanMap.set(angkatanKey, group);
    }
  }

  return map;
}

export interface PeristiwaGabungan {
  tahun: number;
  bulan?: number;
  dekade: number;
  judul: string;
  uraian: string;
  sumberId: string;
  alutsistaSlug: string;
  alutsistaNama: string;
  matra: 'darat' | 'laut' | 'udara';
  jenis: string;
}

export async function deriveLinimasaGabungan(): Promise<PeristiwaGabungan[]> {
  const semuaAlutsista = await getAllAlutsista();
  const hasil: PeristiwaGabungan[] = [];

  for (const entri of semuaAlutsista) {
    for (const ev of entri.data.sejarah.linimasa) {
      hasil.push({
        tahun: ev.tahun,
        bulan: ev.bulan,
        dekade: Math.floor(ev.tahun / 10) * 10,
        judul: ev.judul,
        uraian: ev.uraian,
        sumberId: ev.sumberId,
        alutsistaSlug: entri.id,
        alutsistaNama: entri.data.nama,
        matra: entri.data.matra,
        jenis: entri.data.jenis,
      });
    }
  }

  hasil.sort((a, b) => {
    if (a.tahun !== b.tahun) return a.tahun - b.tahun;
    return (a.bulan || 0) - (b.bulan || 0);
  });

  return hasil;
}

export const SEJARAH_JENIS: Record<
  string,
  {
    sejarahRingkas: string;
    sumberRingkas: string;
  }
> = {
  'tank-utama': {
    sejarahRingkas:
      'Konsep Tank Tempur Utama (Main Battle Tank / MBT) berkembang setelah Perang Dunia II ketika kemajuan mesin diesel berdaya tinggi dan pelindung komposit memungkinkan penggabungan daya tembak tank berat dengan mobilitas tank menengah. Di Indonesia, TNI Angkatan Darat mengoperasikan tank ringan selama beberapa dekade sebelum akhirnya mengakuisisi MBT Leopard 2A4 dan Leopard 2RI pada dekade 2010-an.',
    sumberRingkas: 'Rheinmetall Defence & Publikasi Sejarah Kavaleri TNI AD',
  },
  'tank-medium': {
    sejarahRingkas:
      'Tank medium modern dirancang untuk memenuhi kebutuhan daya tembak kaliber besar (105 mm) pada bobot sekitar 30 ton agar mudah melintasi jembatan, medan lunak, dan diangkut pesawat maupun kapal pendarat di wilayah kepulauan. Indonesia bersama Turki mengembangkan tank medium Harimau (Kaplan MT) melalui kerja sama PT Pindad dan FNSS.',
    sumberRingkas: 'PT Pindad & FNSS Savunma Sistemleri',
  },
  'kendaraan-lapis-baja': {
    sejarahRingkas:
      'Kendaraan pengangkut personel lapis baja (APC) dan kendaraan tempur infanteri (IFV) berfungsi membawa pasukan infanteri ke garis depan dengan perlindungan dari tembakan senjata ringan dan serpihan artileri. Industri pertahanan Indonesia melalui PT Pindad telah memproduksi ratusan unit keluarga Anoa 6x6 untuk satuan mekanis TNI AD dan misi penjaga perdamaian PBB.',
    sumberRingkas: 'PT Pindad & SIPRI Arms Transfers Database',
  },
  'kendaraan-taktis': {
    sejarahRingkas:
      'Kendaraan taktis ringan berpenggerak empat roda (4x4) dirancang untuk mobilitas tinggi, patroli pengintaian, komando, dan penarik senjata ringan di berbagai medan. PT Pindad mengembangkan keluarga Komodo 4x4 dan Maung 4x4 guna mendukung kemandirian sarana mobilitas satuan TNI dan Polri.',
    sumberRingkas: 'Katalog Kendaraan Khusus PT Pindad',
  },
  artileri: {
    sejarahRingkas:
      'Artileri medan modern berkembang dari meriam tarik menjadi howitzer swagerak (self-propelled) beroda rantai maupun beroda ban yang mampu menembak dan segera berpindah posisi (shoot-and-scoot). TNI Angkatan Darat memodernisasi satuan Armed dengan howitzer swagerak CAESAR 155 mm asal Prancis dan M109A4 BE.',
    sumberRingkas: 'KNDS France (Nexter) & SIPRI Arms Transfers Database',
  },
  'roket-multilaras': {
    sejarahRingkas:
      'Sistem peluncur roket multilaras (MLRS) memberikan daya tembak saturasi area secara cepat pada jarak puluhan hingga ratusan kilometer menggunakan tabung roket modular yang dapat diganti kalibernya. Batalion Armed TNI AD mengoperasikan sistem ASTROS II Mk 6 buatan Avibras Brasil.',
    sumberRingkas: 'Avibras Indústria Aeroespacial & SIPRI',
  },
  'senjata-ringan': {
    sejarahRingkas:
      'Senapan serbu kaliber 5,56x45 mm NATO menjadi standar infanteri modern karena bobot amunisi yang ringan dan kendali tembakan yang stabil. PT Pindad memproduksi keluarga senapan serbu SS1 dan kemudian merancang secara mandiri keluarga SS2 yang digunakan luas oleh TNI serta meraih berbagai kejuaraan menembak militer internasional.',
    sumberRingkas: 'Katalog Senjata PT Pindad',
  },
  'pertahanan-udara-darat': {
    sejarahRingkas:
      'Pertahanan udara berbasis darat jarak pendek dan menengah melindungi objek vital serta satuan darat dari ancaman pesawat terbang rendah, helikopter, dan pesawat nirawak. TNI mengoperasikan sistem rudal pertahanan udara bergerak seperti Starstreak dan NASAMS serta meriam penangkis serangan udara.',
    sumberRingkas: 'Thales UK & SIPRI Arms Transfers Database',
  },
  'radar-darat': {
    sejarahRingkas:
      'Radar pengawasan darat mendeteksi pergerakan sasaran udara maupun artileri untuk memberikan peringatan dini kepada pusat komando pertahanan.',
    sumberRingkas: 'Referensi Terbuka Sistem Sensor Pertahanan',
  },
  'kapal-selam': {
    sejarahRingkas:
      'Kapal selam serang konvensional bertenaga diesel-listrik mengandalkan kesenyapan akustik di bawah permukaan laut untuk misi pengintaian, pengamanan alur laut kepulauan, serta penangkalan permukaan. TNI Angkatan Laut mengoperasikan kapal selam sejak era KRI Cakra (Type 209/1300) hingga Kelas Nagapasa (Type 209/1400).',
    sumberRingkas: 'PT PAL Indonesia & Hanwha Ocean (DSME)',
  },
  fregat: {
    sejarahRingkas:
      'Fregat modern merupakan kapal kombatan permukaan utama yang memiliki kemampuan peperangan tiga dimensi: anti-permukaan, anti-udara, dan anti-kapal selam, dilengkapi fasilitas hanggar helikopter. Kelas Martadinata (SIGMA 10514) dibangun melalui kolaborasi Damen Naval Belanda dan PT PAL Indonesia.',
    sumberRingkas: 'Damen Naval & PT PAL Indonesia',
  },
  korvet: {
    sejarahRingkas:
      'Korvet memiliki ukuran lebih ringkas dibandingkan fregat namun dilengkapi persenjataan rudal anti-kapal, meriam reaksi cepat, dan sonar untuk menjaga perairan teritorial dan zona ekonomi eksklusif. TNI AL mengoperasikan korvet Kelas Diponegoro (SIGMA 9113) dan Kelas Bung Tomo.',
    sumberRingkas: 'Damen Naval, BAE Systems & SIPRI',
  },
  'kapal-patroli': {
    sejarahRingkas:
      'Kapal Cepat Rudal (KCR) dan kapal patroli lepas pantai dirancang dengan lambung ringan berkecepatan tinggi untuk taktik pukul-lari di perairan kepulauan serta penegakan hukum di laut. PT PAL Indonesia memproduksi seri KCR-60M Kelas Sampari untuk TNI Angkatan Laut.',
    sumberRingkas: 'Katalog Produk Kapal Perang PT PAL Indonesia',
  },
  'kapal-amfibi': {
    sejarahRingkas:
      'Kapal angkut amfibi jenis Landing Platform Dock (LPD) mampu membawa batalion pendarat beserta kendaraan lapis baja, kapal pendarat (LCU), dan helikopter di deknya. Selain operasi amfibi, LPD Kelas Makassar milik TNI AL sangat sering dikerahkan dalam misi bantuan kemanusiaan dan penanggulangan bencana alam.',
    sumberRingkas: 'PT PAL Indonesia & Daesun Shipbuilding',
  },
  'kapal-ranjau': {
    sejarahRingkas:
      'Kapal buru ranjau dirancang dengan lambung non-magnetik atau komposit serta kendaraan bawah air kendali jarak jauh untuk mendeteksi dan menetralisir ranjau laut di alur pelayaran strategis.',
    sumberRingkas: 'Referensi Terbuka Peperangan Ranjau',
  },
  'kapal-bantu': {
    sejarahRingkas:
      'Kapal bantu mencakup kapal rumah sakit, kapal tanker dukungan logistik di laut, serta kapal survei hidrografi-oseanografi yang menopang keberlanjutan operasi armada.',
    sumberRingkas: 'PT PAL Indonesia',
  },
  'rudal-anti-kapal': {
    sejarahRingkas:
      'Rudal anti-kapal modern terbang menyusur permukaan laut (sea-skimming) menggunakan pemandu inersia dan radar aktif untuk menghantam sasaran permukaan dari jarak di luar jangkauan visual.',
    sumberRingkas: 'Referensi Terbuka Persenjataan Maritim',
  },
  'pesawat-tempur': {
    sejarahRingkas:
      'Pesawat tempur multiperan modern menggabungkan kemampuan superioritas udara dan serangan permukaan presisi dalam satu rangka pesawat bersayap tetap. TNI Angkatan Udara mengoperasikan kombinasi pesawat tempur F-16 Fighting Falcon serta keluarga Su-27/Su-30 Flanker.',
    sumberRingkas: 'Lockheed Martin, UAC & SIPRI Arms Transfers Database',
  },
  'pesawat-angkut': {
    sejarahRingkas:
      'Pesawat angkut militer taktis dan strategis menjadi tulang punggung mobilitas udara di negara kepulauan untuk penerjunan pasukan, angkutan logistik, hingga misi kemanusiaan di landasan pendek. TNI AU mengoperasikan keluarga C-130 Hercules serta pesawat angkut medium CN-235 hasil rancang bangun bersama CASA dan PT Dirgantara Indonesia.',
    sumberRingkas: 'Lockheed Martin & PT Dirgantara Indonesia',
  },
  'pesawat-latih': {
    sejarahRingkas:
      'Pesawat latih lanjut (lead-in fighter trainer) dan pesawat serang ringan mempersiapkan penerbang tempur sebelum beralih ke pesawat tempur garis depan sekaligus mengemban misi dukungan udara dekat. TNI AU mengoperasikan jet supersonik KAI T-50i Golden Eagle dan turboprop EMB-314 Super Tucano.',
    sumberRingkas: 'Korea Aerospace Industries (KAI), Embraer & SIPRI',
  },
  'pesawat-patroli-maritim': {
    sejarahRingkas:
      'Pesawat patroli maritim dilengkapi radar pencari permukaan dan sensor elektro-optik untuk mengawasi perairan luas, mendeteksi kapal permukaan/bawah permukaan, serta mendukung operasi SAR laut.',
    sumberRingkas: 'PT Dirgantara Indonesia',
  },
  'pesawat-peringatan-dini': {
    sejarahRingkas:
      'Pesawat peringatan dini dan kendali udara (AEW&C) membawa radar pengawasan udara di atas badan pesawat untuk memperluas cakrawala deteksi di luar jangkauan radar darat.',
    sumberRingkas: 'Referensi Terbuka Pengawasan Udara',
  },
  helikopter: {
    sejarahRingkas:
      'Helikopter militer berperan penting dalam operasi serang, anti-kapal selam, pencarian dan penyelamatan (SAR) tempur, serta angkutan vertikal di medan tanpa landasan pacu. Ketiga matra TNI mengoperasikan berbagai helikopter seperti AH-64E Apache (TNI AD), AS565 MBe Panther (TNI AL), dan H225M Caracal (TNI AU).',
    sumberRingkas: 'Boeing, Airbus Helicopters, PT Dirgantara Indonesia & SIPRI',
  },
  uav: {
    sejarahRingkas:
      'Pesawat nirawak (UAV) kelas Medium Altitude Long Endurance (MALE) mampu terbang belasan hingga puluhan jam untuk misi pengintaian, pengawasan maritim, dan pemetaan.',
    sumberRingkas: 'Referensi Terbuka Sistem Nirawak',
  },
  'rudal-udara': {
    sejarahRingkas:
      'Rudal udara mencakup rudal udara-ke-udara berpengendali inframerah atau radar aktif serta amunisi berpemandu udara-ke-permukaan.',
    sumberRingkas: 'Referensi Terbuka Persenjataan Udara',
  },
  'radar-udara': {
    sejarahRingkas:
      'Radar pengawasan ruang udara jarak jauh memantau lalu lintas dan mendeteksi pelanggaran wilayah udara nasional.',
    sumberRingkas: 'Referensi Terbuka Pengawasan Ruang Udara',
  },
};

export function getTemplatJenis(jenisKunci: string) {
  const j = taksonomiJson.jenis.find((item) => item.kunci === jenisKunci);
  if (!j) return [];
  const key = j.templatSpesifikasi as keyof typeof taksonomiJson.templatSpesifikasi;
  return taksonomiJson.templatSpesifikasi[key] || [];
}
