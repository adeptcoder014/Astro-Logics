import SwissEph from "swisseph-wasm";
import path from "path";

let sweInstance: SwissEph | null = null;

export async function getSwissEph() {
  if (sweInstance) return sweInstance;

  const swe = new SwissEph();

  await swe.initSwissEph();

  // Lahiri ayanamsa (Vedic)
  swe.set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0);

  sweInstance = swe;
  return swe;
}
