import { describe, it, expect } from 'vitest';
import { haversineKm, computeBearing, compassDir, routeDistanceKm, interpolateRoute } from '../../src/lib/sim/geo';
import { isaAtmosphere, kmhToMach, machToKmh, kmhToKnot, horizonDistanceKm } from '../../src/lib/sim/fisika';
import { calculateAirlift } from '../../src/lib/sim/logistik';

describe('geo.ts', () => {
  it('menghitung jarak Jakarta ke Surabaya sekitar 660-675 km', () => {
    const d = haversineKm(-6.2088, 106.8456, -7.2575, 112.7521);
    expect(d).toBeGreaterThan(650);
    expect(d).toBeLessThan(680);
  });

  it('menghitung bearing ke timur mendekati 90 derajat', () => {
    const b = computeBearing(0, 100, 0, 110);
    expect(Math.round(b)).toBe(90);
    expect(compassDir(b)).toBe('T');
  });

  it('menghitung total rute multi-titik dan interpolasi titik tengah', () => {
    const pts = [
      { lat: 0, lng: 100 },
      { lat: 0, lng: 105 },
      { lat: 0, lng: 110 },
    ];
    const total = routeDistanceKm(pts);
    expect(total).toBeGreaterThan(1100);
    const mid = interpolateRoute(pts, 0.5);
    expect(mid.lng).toBeCloseTo(105, 1);
  });
});

describe('fisika.ts', () => {
  it('kecepatan suara ISA di permukaan laut sekitar 1225 km/jam (340.3 m/s)', () => {
    const sea = isaAtmosphere(0);
    expect(sea.speedOfSoundMs).toBeCloseTo(340.3, 0);
    expect(sea.speedOfSoundKmh).toBeCloseTo(1225, 0);
  });

  it('kecepatan suara ISA di stratosfer (11.000 m) sekitar 1062 km/jam (295.1 m/s)', () => {
    const strat = isaAtmosphere(11000);
    expect(strat.speedOfSoundMs).toBeCloseTo(295.1, 0);
    expect(strat.tempCelsius).toBeCloseTo(-56.5, 1);
  });

  it('konversi bolak-balik km/jam <-> Mach konsisten', () => {
    const mach = kmhToMach(2120, 11000);
    expect(mach).toBeCloseTo(2.0, 1);
    expect(machToKmh(mach, 11000)).toBeCloseTo(2120, 1);
  });

  it('konversi km/jam ke knot sesuai standar maritim', () => {
    expect(kmhToKnot(100)).toBeCloseTo(54.0, 1);
  });

  it('jarak cakrawala geometris untuk pengamat setinggi 100 m sekitar 35.7 km', () => {
    const h = horizonDistanceKm(100, 0);
    expect(h.geometricKm).toBeCloseTo(35.7, 1);
    expect(h.radioHorizonKm).toBeCloseTo(41.24, 1);
  });
});

describe('logistik.ts', () => {
  it('menghitung jumlah sorti angkutan logistik dengan benar', () => {
    const res = calculateAirlift({
      totalCargoTon: 50,
      aircraftPayloadKg: 20000,
      cruiseSpeedKmh: 550,
      distanceKm: 1100,
      maxRangeKm: 3800,
    });
    expect(res.sortiesNeeded).toBe(3); // 50 ton / 20 ton = 2.5 -> 3 sorti
    expect(res.oneWayHours).toBeCloseTo(2, 2);
    expect(res.totalFlightHours).toBeCloseTo(10, 2); // 5 leg (3 berangkat + 2 kembali)
    expect(res.reachableSingleLeg).toBe(true);
  });
});
