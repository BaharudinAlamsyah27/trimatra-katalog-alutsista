export interface GeoPoint {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;

/**
 * Menghitung jarak garis lurus (great-circle) antar dua koordinat dalam kilometer.
 */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Menghitung sudut arah kompas (initial bearing) dari titik 1 ke titik 2 dalam derajat (0-360).
 */
export function computeBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dL = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dL) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dL);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/**
 * Mengonversi sudut derajat menjadi singkatan arah mata angin Indonesia.
 */
export function compassDir(deg: number): string {
  const dirs = ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL'];
  return dirs[Math.round(deg / 45) % 8];
}

/**
 * Menghitung total jarak rute multi-titik dalam kilometer.
 */
export function routeDistanceKm(pts: GeoPoint[]): number {
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    total += haversineKm(pts[i].lat, pts[i].lng, pts[i + 1].lat, pts[i + 1].lng);
  }
  return total;
}

/**
 * Interpolasi posisi pada fraksi jarak [0, 1] di sepanjang rute multi-titik.
 */
export function interpolateRoute(pts: GeoPoint[], fraction: number): GeoPoint {
  if (pts.length === 0) return { lat: 0, lng: 0 };
  if (pts.length < 2) return pts[0];
  const total = routeDistanceKm(pts);
  const target = Math.max(0, Math.min(1, fraction)) * total;
  let acc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const seg = haversineKm(pts[i].lat, pts[i].lng, pts[i + 1].lat, pts[i + 1].lng);
    if (acc + seg >= target || i === pts.length - 2) {
      const localT = seg > 0 ? (target - acc) / seg : 0;
      return {
        lat: pts[i].lat + (pts[i + 1].lat - pts[i].lat) * localT,
        lng: pts[i].lng + (pts[i + 1].lng - pts[i].lng) * localT,
      };
    }
    acc += seg;
  }
  return pts[pts.length - 1];
}

/**
 * Mengonversi durasi jam menjadi string yang mudah dibaca (jam & menit).
 */
export function formatDuration(hours: number): string {
  const totalMin = Math.round(hours * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} menit`;
  if (m === 0) return `${h} jam`;
  return `${h} jam ${m} menit`;
}
