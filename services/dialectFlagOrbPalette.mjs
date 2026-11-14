/**
 * Restrained flag palettes for the 22 Arab-country dialect stages.
 * Flag colours drive the external glow. Actual national flag shapes are
 * refracted through the same sphere by DialectFlagGlassArt.tsx.
 * Every country has an explicit identity; a neutral fallback guards future
 * new countries without introducing arbitrary Siri pink/blue accents.
 *
 * Keys match COUNTRY_DATA in pages/Dialects.tsx.
 */
export const DIALECT_FLAG_ORB_PALETTES = Object.freeze({
  uae:        { primary: '#087E55', secondary: '#C83E43', accent: '#F3FFF8', core: '#0C1920', glow: '#248B65' },
  egypt:      { primary: '#C83B41', secondary: '#F6F4EE', accent: '#D4B269', core: '#111720', glow: '#C15C56' },
  saudi:      { primary: '#05744B', secondary: '#E9FFF2', accent: '#8ED6AC', core: '#092E21', glow: '#168B60' },
  palestine:  { primary: '#0F7F52', secondary: '#C93C45', accent: '#F5F5F0', core: '#111A20', glow: '#237C62' },
  syria:      { primary: '#16855A', secondary: '#D34449', accent: '#F7F7F0', core: '#121A20', glow: '#379D72' },
  jordan:     { primary: '#0B754C', secondary: '#C93C45', accent: '#F6F7F1', core: '#111720', glow: '#257959' },
  lebanon:    { primary: '#C94045', secondary: '#157A56', accent: '#F7F7EE', core: '#22212A', glow: '#BB4E56' },
  iraq:       { primary: '#C94349', secondary: '#168454', accent: '#F6F5ED', core: '#17191D', glow: '#AB554E' },
  libya:      { primary: '#147A52', secondary: '#C64249', accent: '#F7F7F2', core: '#141920', glow: '#21885E' },
  tunisia:    { primary: '#CD343F', secondary: '#F7F5F1', accent: '#F4CED0', core: '#3B151B', glow: '#BC444B' },
  morocco:    { primary: '#B93440', secondary: '#14794F', accent: '#F1D6CC', core: '#361821', glow: '#AE4A52' },
  algeria:    { primary: '#0F8756', secondary: '#F5F6EF', accent: '#C73743', core: '#102B25', glow: '#24976A' },
  oman:       { primary: '#C63E43', secondary: '#127C55', accent: '#F8F7F2', core: '#1B2524', glow: '#B94E4C' },
  bahrain:    { primary: '#C83A42', secondary: '#FBF7F1', accent: '#F5C8C9', core: '#38171E', glow: '#BD5159' },
  qatar:      { primary: '#852C50', secondary: '#F9F7F1', accent: '#D7A5B7', core: '#2A1424', glow: '#8A4668' },
  kuwait:     { primary: '#0C7C52', secondary: '#C34247', accent: '#F7F7EF', core: '#151B21', glow: '#218C64' },
  yemen:      { primary: '#C83D44', secondary: '#F7F7F0', accent: '#B3B6B4', core: '#17191D', glow: '#B5504F' },
  sudan:      { primary: '#0C7C50', secondary: '#C9424A', accent: '#F4F4EF', core: '#17191F', glow: '#24865D' },
  mauritania: { primary: '#0D8251', secondary: '#D8B14E', accent: '#BB3D45', core: '#123022', glow: '#7E9851' },
  somalia:    { primary: '#358ED1', secondary: '#F7FBFF', accent: '#B8E2F7', core: '#122A51', glow: '#4C9BD2' },
  comoros:    { primary: '#168653', secondary: '#327AB5', accent: '#E3C457', core: '#183F43', glow: '#458B89' },
  djibouti:   { primary: '#2799C1', secondary: '#179266', accent: '#F6FBFC', core: '#16324C', glow: '#3E9CB2' },
});

const NEUTRAL_GLASS_PALETTE = Object.freeze({
  primary: '#71869D', secondary: '#C8D7DF', accent: '#F5FAFC',
  core: '#1C2A3C', glow: '#728EA1',
});

/** Unknown stage IDs remain neutral rather than adopting another flag. */
export function getDialectFlagOrbPalette(countryId) {
  return Object.hasOwn(DIALECT_FLAG_ORB_PALETTES, countryId)
    ? DIALECT_FLAG_ORB_PALETTES[countryId]
    : NEUTRAL_GLASS_PALETTE;
}
