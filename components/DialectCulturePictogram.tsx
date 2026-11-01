import React from 'react';
import {
  Bird, Gem, Sofa, Trees, Soup, Waves, ScrollText, Sailboat, Landmark, Coffee,
  Mountain, Castle, Utensils, Fish, Music2, House, Flower2, Shirt,
  ShoppingBag, Leaf, Droplets, IceCreamCone, Ship, DoorOpen, Paintbrush,
  Tent, BookOpen, Turtle, Flame, CookingPot, Cookie, TreePine,
  Building2, Earth, CakeSlice, Shell, Guitar, Map, Sprout, Sun,
  type LucideIcon
} from 'lucide-react';

interface Props { nameAr: string; nameEn: string; className?: string }

/** Clear, scalable cultural pictograms, never generic system emoji glyphs. */
export const DialectCulturePictogram: React.FC<Props> = ({ nameAr, nameEn, className = '' }) => {
  const label = nameAr + ' ' + nameEn;
  const isPyramid = /أهرام|Pyramid/i.test(label);
  const isIncense = /بخور|اللبان|Bakhoor|Frankincense/i.test(label);
  const isDallah = /دلة|الدلة|Arabic Coffee|Qatari Coffee/i.test(label);
  const isDhow = /الفلوكة|السفن التقليدية|Felucca|Dhows/i.test(label);
  const isKhanjar = /الخنجر|الجنبية|Khanjar|Janbiya/i.test(label);
  const isCamel = /الإبل|Camels/i.test(label);
  const isOryx = /المها العربي|Arabian Oryx/i.test(label);

  // A simplified authentic incense burner, not a smoke/wind emoji.
  const custom = isIncense ? (
    <svg viewBox="0 0 48 48" fill="none" className="h-[27px] w-[27px]" aria-hidden="true">
      <path d="M16 12c-4-4 3-5 0-10M25 14c-5-4 4-7 1-12M32 12c-3-3 3-5 1-8"
        stroke="#7d9f98" strokeWidth="1.9" strokeLinecap="round"/>
      <path d="M13 20h22l-3 13H16L13 20Z" fill="#a66f42" stroke="#75482b" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M12 20q12-8 24 0M17 25h14M20 31h8" stroke="#f6d99b" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M18 33v5h12v-5M13 40h22" stroke="#77553a" strokeWidth="2.4" strokeLinecap="round"/>
      <path d="M16 18h16" stroke="#5a3e31" strokeWidth="3.4" strokeLinecap="round"/>
      <path d="M23 15l-2 3h6l-2-3" fill="#de9b47"/>
    </svg>
  ) : isPyramid ? (
    <svg viewBox="0 0 48 48" fill="none" className="h-[29px] w-[29px]" aria-hidden="true">
      <path d="M4 38 20 11l13 27H4Z" fill="#dfb679" stroke="#987245" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M20 11 33 38H20V11Z" fill="#b8925d"/>
      <path d="M23 38 33 20l11 18H23Z" fill="#e8c892" stroke="#9d764b" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M33 20 44 38H33V20Z" fill="#cba16b"/>
      <path d="M11 27h12M8 32h20M16 21h8M31 28h7M28 34h12" stroke="#9b754c" strokeWidth="1.2" opacity=".68"/>
      <path d="M3 40h43" stroke="#977b56" strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  ) : isDallah ? (
    <svg viewBox="0 0 48 48" fill="none" className="h-[29px] w-[29px]" aria-hidden="true">
      <path d="M18 17h18v14c0 6-4 8-9 8s-9-2-9-8V17Z" fill="#d4a34c" stroke="#93702f" strokeWidth="1.8"/>
      <path d="M18 20h18M21 30h12M18 35h18" stroke="#fff0c5" strokeWidth="1.4" opacity=".8"/>
      <path d="M18 21C9 20 13 12 8 12M8 12c1 5-4 5-5 3" stroke="#a27536" strokeWidth="3" strokeLinecap="round"/>
      <path d="M36 21c10-5 11 3 7 8-2 2-4 3-7 3" stroke="#b28744" strokeWidth="3" strokeLinecap="round"/>
      <path d="M22 17v-5h10v5M27 6v6M23 6h8" stroke="#9b793c" strokeWidth="2" strokeLinecap="round"/>
      <path d="M22 40h11" stroke="#795c33" strokeWidth="2.6" strokeLinecap="round"/>
    </svg>
  ) : isDhow ? (
    <svg viewBox="0 0 48 48" fill="none" className="h-[29px] w-[29px]" aria-hidden="true">
      <path d="M25 7v27M22 10l-14 22h14V10ZM28 14l12 17H28V14Z" fill="#e6d9bf" stroke="#a18d69" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M7 34h36l-7 8H16L7 34Z" fill="#a87047" stroke="#805237" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M3 44q4-3 8 0t8 0t8 0t8 0t8 0" stroke="#77a4af" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ) : isKhanjar ? (
    <svg viewBox="0 0 48 48" fill="none" className="h-[28px] w-[28px]" aria-hidden="true">
      <path d="M28 9c4 3 3 10-1 13l-5 6c-3 4-3 8-1 11 5-2 13-6 14-15" stroke="#b28b57" strokeWidth="5" strokeLinecap="round"/>
      <path d="M28 9c4 3 3 10-1 13l-5 6c-3 4-3 8-1 11 5-2 13-6 14-15" stroke="#f0d9a9" strokeWidth="1" strokeLinecap="round"/>
      <path d="M25 8h8M23 5h11" stroke="#786146" strokeWidth="3" strokeLinecap="round"/>
      <path d="M15 22c5 1 15 0 22-3" stroke="#816e4c" strokeWidth="3.4" strokeLinecap="round"/>
    </svg>
  ) : isCamel ? (
    <svg viewBox="0 0 48 48" fill="none" className="h-[29px] w-[29px]" aria-hidden="true">
      <path d="M8 20c3 0 5 2 6 5 3-1 4-8 7-9 4 0 4 9 8 9 3-1 4-6 7-6l5 5v7H9L8 20Z"
        fill="#b8915b" stroke="#84633e" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M7 21C6 16 3 17 3 14l4 1 3 4 1 10M11 31v12M21 31v12M33 31v12M41 30v13" stroke="#84633e" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M7 23l-4 2" stroke="#84633e" strokeWidth="1.5"/>
    </svg>
  ) : isOryx ? (
    <svg viewBox="0 0 48 48" fill="none" className="h-[29px] w-[29px]" aria-hidden="true">
      <path d="M22 17 18 2M28 17l4-15" stroke="#554837" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M19 18c-6 0-9 4-8 10 1 7 8 13 13 15 6-3 13-10 13-17 0-5-3-8-8-8l-5 4-5-4Z"
        fill="#f2e7d3" stroke="#8c7b63" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M17 19 7 13l4 14M31 19l10-6-4 14" fill="#e8d6b4" stroke="#8c7b63" strokeWidth="1.5"/>
      <path d="M18 29h2M29 29h2" stroke="#544f48" strokeWidth="3" strokeLinecap="round"/>
      <path d="M22 35l2 2 2-2" stroke="#786d5c" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ) : null;

  const iconMap: Array<[RegExp, LucideIcon]> = [
    [/الصيد بالصقور|Falconry/i, Bird],
    [/اللؤلؤ|Pearls|Pearl/i, Shell],
    [/المجلس|الديوانية|Majlis|Diwaniya/i, Sofa],
    [/التمور|النخيل|الواحات|Palm|Dates|Oasis/i, Trees],
    [/الكشري|كسكسي|الكسرة|الجبنة|الكسكس|الكبسة|مجبوس|الطاجين|المنسف|المقلوبة|البازين|العصيدة|السلتة|Maru|Koshary|Kabsa|Mansaf|Maqluba|Tagine|Bazin|Couscous|Machboos|Asida|Saltah/i, CookingPot],
    [/الفانوس|Fanous/i, Flame],
    [/النيل|البحر|بحيرة|Dead Sea|Nile|Lake|Waves/i, Waves],
    [/البردي|الشعر|Papyrus|Poetry/i, ScrollText],
    [/النخيل|الأرز|شجرة الحياة|Tree of Life|Cedars/i, Trees],
    [/الصحراء|العلا|الجبل|سقطرى|Sahara|Desert|AlUla|Jebel|Socotra/i, Mountain],
    [/الزليج|الفخار|Zellige|Pottery/i, Paintbrush],
    [/القفطان|الثوب|الشماغ|الملحفة|الدراعة|المعوز|الكانزو|الكوفية|الشاشية|Kaftan|Toub|Shemagh|Melhafa|Daraa|Macawiis|Kanzu|Keffiyeh|Chechia/i, Shirt],
    [/زيت الأركان|Argan/i, Droplets],
    [/الحمام|Hammam/i, Waves],
    [/البتراء|بعلبك|قرطاج|لبدة|Petra|Baalbek|Carthage|Leptis/i, Landmark],
    [/المدرج الروماني|Roman Theater/i, Landmark],
    [/التبولة|المناقيش|البريك|السمبوسة|Mixed Grill|Tabbouleh|Manakish|Brik|Sambusa/i, Utensils],
    [/الفيروزيات|الدبكة|موسيقى|Fairuz|Dabke|Rai Music/i, Music2],
    [/الزيتون|Olive/i, Leaf],
    [/قبة الصخرة|الجامع|مسجد|Mosque|Dome of the Rock/i, Landmark],
    [/الكنافة|الحلوى|حلوى|كليجة|Knafeh|Halwa|Kleicha/i, CakeSlice],
    [/بوابة عشتار|قلعة|نـزوى|Castle|Ishtar|Nizwa Fort/i, Castle],
    [/ملوية|أبراج|منارة|Minaret|Towers|Lighthouse/i, Building2],
    [/الياسمين|اليلانغ|Jasmine|Ylang/i, Flower2],
    [/الرندة|البروكار|السدو|التطريز|Randa|Brocade|Sadu|Embroidery/i, Paintbrush],
    [/الشاي|Tea/i, Coffee],
    [/السوق|Souq|Market/i, ShoppingBag],
    [/متحف|Museum|بيت القرآن|Beit Al Quran/i, BookOpen],
    [/سيدي|القصبة|غدامس|شنقيط|Sidi|Casbah|Ghadames|Chinguetti/i, House],
    [/بوابة|باب البحرين|Darwaza|Gate|Bab Al Bahrain/i, DoorOpen],
    [/المسكوف|السمك|الحوت|Fish/i, Fish],
    [/السفن|الميناء|Ship|Port/i, Ship],
    [/البن|القهوة|Coffee/i, Coffee],
    [/البركان|Volcano/i, Flame],
    [/السلاحف|Turtles/i, Turtle],
    [/الشواطئ|Beaches/i, Sun],
    [/العمارة|Architecture/i, Building2],
    [/التنوع|Diversity/i, Earth],
    [/مضيق|Strait|Bab-el/i, Map],
    [/العود|Oud/i, Trees],
    [/البوظة|الفانيليا|Ice Cream|Vanilla/i, IceCreamCone],
    [/الفخار|Pottery/i, Landmark],
    [/اللبن|البن|coffee/i, Soup],
    [/الكنافة|الحلويات|Sweet/i, CakeSlice],
    [/سمك|Fish/i, Fish],
    [/الرحلة|Trip/i, Sailboat],
  ];
  const found = iconMap.find(([matcher]) => matcher.test(label));
  const Icon = found ? found[1] : Landmark;
  const tint = isIncense ? 'from-[#fff3e4] to-[#f7e5d8]'
    : isPyramid ? 'from-[#f8f0df] to-[#f4e4c8]'
      : isDallah ? 'from-[#fcf2d9] to-[#f3e7d5]'
        : 'from-[#e7f3ef] to-[#f5f9f7]';
  return (
    <span aria-hidden="true" className={'inline-flex h-[clamp(22px,3.3vh,34px)] w-[clamp(25px,3.6vh,37px)] shrink-0 items-center justify-center rounded-[9px] [&>svg]:max-h-full [&>svg]:max-w-full border border-white/80 bg-gradient-to-br ' + tint + ' text-[#18725f] shadow-[inset_0_1px_2px_rgba(255,255,255,.75)] ' + className}>
      {custom || <Icon size={23} strokeWidth={1.75} className="drop-shadow-[0_1px_1px_rgba(0,0,0,.06)]"/>}
    </span>
  );
};
