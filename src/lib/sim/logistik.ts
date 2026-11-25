export interface AirliftEstimate {
  sortiesNeeded: number;
  oneWayHours: number;
  totalFlightHours: number;
  payloadPerSortieTon: number;
  reachableSingleLeg: boolean;
}

/**
 * Estimasi matematis kebutuhan sorti angkutan logistik / bantuan bencana (HADR).
 * Tidak memperhitungkan cuaca, waktu bongkar muat di darat, atau rute udara.
 */
export function calculateAirlift(params: {
  totalCargoTon: number;
  aircraftPayloadKg: number;
  cruiseSpeedKmh: number;
  distanceKm: number;
  maxRangeKm: number | null;
}): AirliftEstimate {
  const payloadTon = Math.max(0.1, params.aircraftPayloadKg / 1000);
  const sortiesNeeded = Math.max(1, Math.ceil(params.totalCargoTon / payloadTon));
  const oneWayHours = params.distanceKm / Math.max(1, params.cruiseSpeedKmh);
  // Untuk beberapa sorti, pesawat harus kembali mengambil muatan berikutnya (2 * sorties - 1 leg)
  const totalLegs = sortiesNeeded === 1 ? 1 : sortiesNeeded * 2 - 1;
  const totalFlightHours = oneWayHours * totalLegs;
  const reachableSingleLeg = params.maxRangeKm === null ? true : params.distanceKm <= params.maxRangeKm;

  return {
    sortiesNeeded,
    oneWayHours,
    totalFlightHours,
    payloadPerSortieTon: payloadTon,
    reachableSingleLeg,
  };
}
