/**
 * Short, useful real-life telephone roleplays for learners of Arabic.
 * All numbers are fictional three-digit training extensions. No actual orders or appointments are made.
 */
import type { SpeakingPhoneContact } from './speakingDirectory';

type Scene = 'food' | 'pharmacy' | 'shop' | 'transport' | 'appointment' | 'service' | 'school' | 'tickets' | 'delivery';

const SCENES: Record<Scene, Omit<SpeakingPhoneContact,
  'id' | 'extension' | 'ar' | 'en' | 'aimAr' | 'aimEn'>> = {
  food: {
    voice: 'Achird', agentAr: 'موظف الطلبات', agentEn: 'Order assistant', symbol: '◉',
    objectivesAr: ['اطلب طعامًا', 'اذكر الكمية', 'اسأل عن السعر'],
    objectivesEn: ['Order food', 'Say how many', 'Ask the price'],
    complication: 'Offer a simple substitute if a requested food item is unavailable. Keep the Arabic very easy for beginners.', accent: '#a8834f',
  },
  pharmacy: {
    voice: 'Leda', agentAr: 'الصيدلي', agentEn: 'Pharmacist', symbol: '✚',
    objectivesAr: ['اطلب منتجًا', 'اسأل هل هو موجود', 'اسأل عن السعر'],
    objectivesEn: ['Ask for a product', 'Ask if it is available', 'Ask the price'],
    complication: 'This is language practice only. Do not diagnose, suggest medication, dosing, or treatment. Recommend asking a real pharmacist or doctor for health questions.', accent: '#91b8a7',
  },
  shop: {
    voice: 'Kore', agentAr: 'البائع', agentEn: 'Shop assistant', symbol: '◇',
    objectivesAr: ['اسأل عن منتج', 'اذكر العدد أو المقاس', 'اسأل عن السعر'],
    objectivesEn: ['Ask for an item', 'Give quantity or size', 'Ask the price'],
    complication: 'One size or item is unavailable; suggest a simple alternative.', accent: '#b9a08d',
  },
  transport: {
    voice: 'Orus', agentAr: 'موظف الحجز', agentEn: 'Booking assistant', symbol: '◉',
    objectivesAr: ['اطلب خدمة', 'اذكر المكان', 'اسأل عن الموعد'],
    objectivesEn: ['Request a service', 'Give a place', 'Ask about the time'],
    complication: 'Ask for a general pickup location, not a precise home address. Offer one alternative time.', accent: '#aeb9d1',
  },
  appointment: {
    voice: 'Charon', agentAr: 'موظف الاستقبال', agentEn: 'Receptionist', symbol: '○',
    objectivesAr: ['اطلب موعدًا', 'حدد اليوم', 'حدد الساعة'],
    objectivesEn: ['Request an appointment', 'Choose a day', 'Choose a time'],
    complication: 'The first time is unavailable. Offer one easy alternative. Simulate only, never make a real appointment.', accent: '#b8bbc9',
  },
  service: {
    voice: 'Fenrir', agentAr: 'موظف الخدمة', agentEn: 'Service assistant', symbol: '✧',
    objectivesAr: ['اطلب المساعدة', 'اشرح المشكلة', 'اسأل عن التكلفة'],
    objectivesEn: ['Ask for help', 'Explain the problem', 'Ask the cost'],
    complication: 'Ask one simple question to understand the problem. Do not collect sensitive personal information.', accent: '#b8a48b',
  },
  school: {
    voice: 'Aoede', agentAr: 'موظف المدرسة', agentEn: 'School staff', symbol: '▤',
    objectivesAr: ['اسأل عن شيء', 'اسأل عن الموعد', 'قل شكرًا'],
    objectivesEn: ['Ask a question', 'Ask about the time', 'Say thank you'],
    complication: 'Give one simple answer and invite the learner to repeat a short Arabic sentence.', accent: '#9badc0',
  },
  tickets: {
    voice: 'Zephyr', agentAr: 'موظف التذاكر', agentEn: 'Ticket assistant', symbol: '▣',
    objectivesAr: ['اطلب تذكرة', 'حدد العدد', 'اسأل عن الموعد'],
    objectivesEn: ['Ask for tickets', 'Give the number', 'Ask about the time'],
    complication: 'The requested time is full, so offer a second time.', accent: '#b7a8bb',
  },
  delivery: {
    voice: 'Puck', agentAr: 'موظف التوصيل', agentEn: 'Delivery assistant', symbol: '⌁',
    objectivesAr: ['اطلب التوصيل', 'اذكر ما تريد', 'اسأل متى يصل'],
    objectivesEn: ['Request delivery', 'Say what you need', 'Ask when it arrives'],
    complication: 'Ask for a general neighborhood, never a precise home address.', accent: '#a9b7a5',
  },
};

/** Name in Arabic, short English meaning, practical request, conversation type. */
const ENTRIES: readonly [string,string,string,string,Scene][] = [
 ['مطعم','Restaurant','أريد طلب وجبة من المطعم.','I want to order a meal.','food'],
 ['صيدلية','Pharmacy','أريد شراء منتج من الصيدلية.','I want to ask for a pharmacy product.','pharmacy'],
 ['بقالة','Grocery','أريد شراء الحليب والخبز.','I want to buy milk and bread.','shop'],
 ['مخبز','Bakery','أريد طلب خبز طازج.','I want fresh bread.','food'],
 ['تاكسي','Taxi','أريد سيارة أجرة إلى المدرسة.','I need a taxi to school.','transport'],
 ['مغسلة','Laundry','أريد غسل ملابسي.','I want my clothes washed.','service'],
 ['سوبر ماركت','Supermarket','أريد شراء بعض الطعام.','I want to buy some groceries.','shop'],
 ['عيادة','Clinic','أريد حجز موعد في العيادة.','I want a clinic appointment.','appointment'],
 ['توصيل','Delivery','أريد توصيل طلب.','I want a delivery.','delivery'],
 ['مدرسة','School','أريد السؤال عن موعد في المدرسة.','I want to ask the school about a time.','school'],
 ['مكتبة','Library','أريد السؤال عن كتاب.','I want to ask for a book.','school'],
 ['مقهى','Café','أريد طلب مشروب.','I want to order a drink.','food'],
 ['حلاق','Barber','أريد حجز حلاقة.','I want to book a haircut.','appointment'],
 ['خياط','Tailor','أريد إصلاح ملابسي.','I want to get my clothes altered.','service'],
 ['كهربائي','Electrician','أريد إصلاح مصباح.','I want to fix a lamp.','service'],
 ['صالون','Salon','أريد حجز موعد في الصالون.','I want to book a salon visit.','appointment'],
 ['فندق','Hotel','أريد السؤال عن غرفة.','I want to ask about a room.','appointment'],
 ['سينما','Cinema','أريد تذكرتين للسينما.','I want two cinema tickets.','tickets'],
 ['ملابس','Clothes shop','أريد شراء قميص.','I want to buy a shirt.','shop'],
 ['أحذية','Shoe shop','أريد حذاء بمقاس معين.','I need shoes in my size.','shop'],
 ['هواتف','Phone shop','أريد إصلاح هاتفي.','I want my phone repaired.','service'],
 ['زهور','Flower shop','أريد شراء باقة زهور.','I want to buy flowers.','shop'],
 ['ألعاب','Toy shop','أريد شراء لعبة.','I want to buy a toy.','shop'],
 ['نادي رياضي','Gym','أريد السؤال عن الاشتراك.','I want to ask about a membership.','school'],
 ['ورشة','Garage','أريد إصلاح السيارة.','I want to repair a car.','service'],
 ['خضار','Greengrocer','أريد شراء خضار.','I want to buy vegetables.','shop'],
 ['بريد','Post office','أريد إرسال طرد.','I want to send a parcel.','service'],
 ['قرطاسية','Stationery','أريد دفترًا وقلمًا.','I want a notebook and a pen.','shop'],
 ['فطائر','Pastries','أريد طلب فطائر.','I want to order pastries.','food'],
 ['قهوة','Coffee shop','أريد كوب قهوة.','I want a cup of coffee.','food'],
 ['بيتزا','Pizza','أريد طلب بيتزا.','I want to order pizza.','food'],
 ['لحوم','Butcher','أريد شراء اللحم.','I want to buy meat.','shop'],
 ['نظارات','Optician','أريد شراء نظارة.','I want to buy glasses.','shop'],
 ['حلويات','Sweets','أريد شراء الحلوى.','I want to buy sweets.','food'],
 ['سباك','Plumber','أريد إصلاح الصنبور.','I want to fix a tap.','service'],
 ['سائق','Driver','أريد سيارة إلى البيت.','I want a ride home.','transport'],
 ['وجبات','Meals','أريد طلب وجبة غداء.','I want to order lunch.','food'],
 ['دواء','Medicine counter','أريد السؤال عن منتج في الصيدلية.','I want to ask about a product.','pharmacy'],
 ['شحن','Shipping','أريد إرسال صندوق.','I want to send a box.','service'],
 ['مطبعة','Print shop','أريد طباعة ورقة.','I want to print a document.','service'],
];

export const EVERYDAY_CALL_CONTACTS: SpeakingPhoneContact[] = ENTRIES.map(([ar,en,aimAr,aimEn,scene], index) => ({
  ...SCENES[scene], id: 'daily_' + String(index + 1), extension: String(101 + index),
  ar, en, aimAr, aimEn,
}));