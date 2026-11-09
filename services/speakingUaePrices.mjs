/**
 * UAE-grounded, illustrative prices for Arabic language practice, NOT live business quotes.
 * Source: Dubai RTA taxi fare page, and 2026 UAE casual dining price guides.
 * Numbers vary by emirate, provider, date, quantity and delivery.
 */
export const UAE_PRACTICE_PRICES = Object.freeze({
  casualMeal: { min: 15, max: 35, ar: 'وجبة بسيطة', en: 'simple meal' },
  shawarma: { min: 8, max: 20, ar: 'شطيرة شاورما', en: 'shawarma sandwich' },
  karak: { min: 2, max: 5, ar: 'شاي كرك', en: 'karak tea' },
  coffee: { min: 12, max: 28, ar: 'قهوة من مقهى', en: 'café coffee' },
  bread: { min: 3, max: 12, ar: 'خبز طازج', en: 'fresh bread' },
  groceries: { min: 5, max: 35, ar: 'منتجات بقالة بسيطة', en: 'basic groceries' },
  cinema: { min: 35, max: 75, ar: 'تذكرة سينما', en: 'cinema ticket' },
  shortTaxi: { min: 12, max: 40, ar: 'رحلة قصيرة بسيارة أجرة', en: 'short taxi ride' },
  laundry: { min: 8, max: 25, ar: 'غسل قطعة ملابس', en: 'laundering a garment' },
  delivery: { min: 5, max: 20, ar: 'رسوم توصيل قريبة', en: 'local delivery fee' },
});
export const getUaePriceGuidance = (contact = {}) => {
  const words = String(contact.ar || '') + ' ' + String(contact.en || '');
  const text = words.toLocaleLowerCase();
  let examples = [];
  if (/مطعم|وجبات|بيتزا|restaurant|pizza|meal/.test(text)) examples = [UAE_PRACTICE_PRICES.casualMeal,UAE_PRACTICE_PRICES.shawarma];
  else if (/مقهى|قهوة|café|cafe|coffee/.test(text)) examples = [UAE_PRACTICE_PRICES.karak,UAE_PRACTICE_PRICES.coffee];
  else if (/مخبز|فطائر|مخبوز|bakery|pastr|bread/.test(text)) examples = [UAE_PRACTICE_PRICES.bread];
  else if (/سائق|تاكسي|أجرة|taxi|driver/.test(text)) examples = [UAE_PRACTICE_PRICES.shortTaxi];
  else if (/سينما|cinema/.test(text)) examples = [UAE_PRACTICE_PRICES.cinema];
  else if (/مغسلة|laundry/.test(text)) examples = [UAE_PRACTICE_PRICES.laundry];
  else if (/توصيل|delivery/.test(text)) examples = [UAE_PRACTICE_PRICES.delivery];
  else if (/بقالة|سوبر ماركت|خضار|grocery|supermarket|greengrocer/.test(text)) examples = [UAE_PRACTICE_PRICES.groceries];
  const reference = examples.map(p=>p.ar+' ('+p.en+'): AED '+p.min+' to '+p.max).join('; ');
  return [
    'UAE REALISM IN SIMULATED CALLS:',
    'Use UAE dirhams (درهم, AED) exclusively. Never substitute dollars, Saudi riyals or euros.',
    reference ? 'Indicative educational price EXAMPLES, not real-time quotes: '+reference+'.' :
      'No reliable example for this particular service: do not invent an exact price. Explain the price depends on the provider and details.',
    'State prices as approximate, for example حوالي or تقريبًا. Adjust for the item, quantity and emirate.',
    'Dubai metered taxis have a minimum fare near AED 12, but fares vary by destination and emirate. Never apply Dubai rates universally.',
    'Do not recommend, prescribe, quote a price for a named medicine, or suggest doses. Refer medical decisions to a real pharmacist or physician.',
    'These are fictional practice scenarios: never claim to make real orders, appointments, deliveries or payments.'
  ].join('\n');
};
