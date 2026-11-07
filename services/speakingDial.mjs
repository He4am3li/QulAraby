/**
 * Validate educational extension dialling against an explicitly chosen book entry.
 * Never make a real telephone call or infer the intended contact from typed digits.
 */
export const validateSimulatedDial = ({ selectedId, dialed, contacts } = {}) => {
  if (!selectedId) return 'select_contact';
  if (!/^[0-9]{3}$/.test(String(dialed || ''))) return 'incomplete';
  const match = (Array.isArray(contacts) ? contacts : []).find(contact => contact.id === selectedId);
  if (!match || match.extension !== dialed) return 'wrong_number';
  return 'ready';
};
