/**
 * Menghitung suhu (Kelvin) dan kecepatan suara (m/s & km/jam)
 * berdasarkan International Standard Atmosphere (ISA) hingga 20.000 m.
 */
export function isaAtmosphere(altitudeM: number): {
  altitudeM: number;
  tempKelvin: number;
  tempCelsius: number;
  speedOfSoundMs: number;
  speedOfSoundKmh: number;
} {
  const h = Math.max(0, Math.min(20000, altitudeM));
  // Troposfer (0 - 11.000 m): lapse rate -0.0065 K/m dari 288.15 K
  // Stratosfer bawah (11.000 - 20.000 m): isotermal 216.65 K
  const tempKelvin = h <= 11000 ? 288.15 - 0.0065 * h : 216.65;
  const gamma = 1.4;
  const R = 287.058;
  const speedOfSoundMs = Math.sqrt(gamma * R * tempKelvin);
  return {
    altitudeM: h,
    tempKelvin,
    tempCelsius: tempKelvin - 273.15,
    speedOfSoundMs,
    speedOfSoundKmh: speedOfSoundMs * 3.6,
  };
}

export function kmhToMach(speedKmh: number, altitudeM: number): number {
  const { speedOfSoundKmh } = isaAtmosphere(altitudeM);
  return speedKmh / speedOfSoundKmh;
}

export function machToKmh(mach: number, altitudeM: number): number {
  const { speedOfSoundKmh } = isaAtmosphere(altitudeM);
  return mach * speedOfSoundKmh;
}

export function kmhToKnot(speedKmh: number): number {
  return speedKmh * 0.539957;
}

/**
 * Menghitung jarak cakrawala geometris (d ≈ 3.57 * sqrt(h)) dan
 * cakrawala refraksi optik/radio standar (4/3 Bumi, d ≈ 4.12 * sqrt(h)) dalam km.
 */
export function horizonDistanceKm(observerHeightM: number, targetHeightM = 0): {
  geometricKm: number;
  radioHorizonKm: number;
} {
  const hObs = Math.max(0, observerHeightM);
  const hTgt = Math.max(0, targetHeightM);
  const geometricKm = 3.56972 * (Math.sqrt(hObs) + Math.sqrt(hTgt));
  const radioHorizonKm = 4.124 * (Math.sqrt(hObs) + Math.sqrt(hTgt));
  return { geometricKm, radioHorizonKm };
}
