/**
 * Country-accurate optical pigments for the glass voice orb, ordered as
 * upper, middle, lower and hoist/emblem-inspired light, not flat flag artwork.
 */
export const DIALECT_GLASS_FLAG_LIGHTS = Object.freeze({
  uae:         { top: '#00843D', middle: '#F5FFF9', bottom: '#101820', edge: '#CE1126' },
  egypt:       { top: '#CE1126', middle: '#FFFFFF', bottom: '#121820', edge: '#C6A44B' },
  saudi:       { top: '#006C35', middle: '#B5F6CA', bottom: '#034B32', edge: '#FFFFFF' },
  palestine:   { top: '#111111', middle: '#FFFFFF', bottom: '#007A3D', edge: '#CE1126' },
  syria:       { top: '#007A3D', middle: '#FFFFFF', bottom: '#111111', edge: '#CE1126' },
  jordan:      { top: '#141719', middle: '#FFFFFF', bottom: '#007A3D', edge: '#CE1126' },
  lebanon:     { top: '#ED1C24', middle: '#FFFFFF', bottom: '#D51C2B', edge: '#117A46' },
  iraq:        { top: '#CE1126', middle: '#FFFFFF', bottom: '#111111', edge: '#007A3D' },
  libya:       { top: '#E70013', middle: '#151515', bottom: '#239E46', edge: '#FFFFFF' },
  tunisia:     { top: '#CE1126', middle: '#FFF8F7', bottom: '#CA1832', edge: '#FFFFFF' },
  morocco:     { top: '#C1272D', middle: '#C83B45', bottom: '#8D1D33', edge: '#006233' },
  algeria:     { top: '#006233', middle: '#FFFFFF', bottom: '#077346', edge: '#D21034' },
  oman:        { top: '#FFFFFF', middle: '#ED1C24', bottom: '#00843D', edge: '#CE1126' },
  bahrain:     { top: '#FFFFFF', middle: '#CE1126', bottom: '#A00B2B', edge: '#FFFFFF' },
  qatar:       { top: '#FFFFFF', middle: '#8A1538', bottom: '#5E0D32', edge: '#FFEEF3' },
  kuwait:      { top: '#007A3D', middle: '#FFFFFF', bottom: '#CE1126', edge: '#141414' },
  yemen:       { top: '#CE1126', middle: '#FFFFFF', bottom: '#151515', edge: '#F5F5EF' },
  sudan:       { top: '#D21034', middle: '#FFFFFF', bottom: '#101010', edge: '#007229' },
  mauritania:  { top: '#D5A921', middle: '#006233', bottom: '#086C44', edge: '#FFD700' },
  somalia:     { top: '#4189DD', middle: '#DFF5FF', bottom: '#2375C4', edge: '#FFFFFF' },
  comoros:     { top: '#FCD116', middle: '#FFFFFF', bottom: '#3A75C4', edge: '#3A963B' },
  djibouti:    { top: '#6AB2E7', middle: '#FCFFFF', bottom: '#12AD2B', edge: '#D7141A' },
});

const NEUTRAL = Object.freeze({
  top: '#5B8FA8', middle: '#E6F7FF', bottom: '#20364C', edge: '#A9E9F3',
});
export function getDialectGlassFlagLights(countryId) {
  return Object.hasOwn(DIALECT_GLASS_FLAG_LIGHTS, countryId)
    ? DIALECT_GLASS_FLAG_LIGHTS[countryId] : NEUTRAL;
}
