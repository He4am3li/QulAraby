import React from 'react';

interface Props { nameAr: string; nameEn: string; className?: string }

/**
 * Individually assigned cultural illustrations for the 22 dialect destinations.
 * These are self-contained SVGs, not system emoji or a monochrome icon font.
 * Visual grammar: warm ochre, terracotta, bottle green and creamy highlights.
 * Every entry in the dialect culture catalogue has a semantic illustration type.
 */
const subjects: Record<string, string> = {
  'القهوة العربية':'coffee','الصيد بالصقور':'falcon','اللؤلؤ':'pearl','المجلس':'majlis','التمور':'dates','العود':'incense',
  'الكشري':'koshary','الفانوس':'lantern','النيل':'river','الأهرامات':'pyramids','البردي':'manuscript','الفلوكة':'boat',
  'الكبسة':'kabsa','النخيل':'palm','البخور':'incense','الدلة':'coffee','الإبل':'camel','العلا':'rock',
  'الطاجين':'tagine','الشاي بالنعناع':'tea','الزليج':'mosaic','القفطان':'kaftan','زيت الأركان':'oil','الحمام':'bath',
  'المنسف':'mansaf','البحر الميت':'water','الشماغ':'shemagh','البتراء':'rock','المدرج الروماني':'columns','المقلوبة':'maqluba',
  'التبولة':'salad','الأرز':'cedar','الفيروزيات':'music','بعلبك':'columns','الدبكة':'dance','المناقيش':'flatbread',
  'التطريز':'weave','الزيتون':'olives','قبة الصخرة':'dome','الكوفية':'keffiyeh','الكنافة النابلسية':'dessert',
  'المسكوف':'grillfish','الشاي العراقي':'tea','بوابة عشتار':'gate','ملوية سامراء':'spiral','الكليجة':'cookies',
  'الكسكسي':'couscous','الياسمين':'flower','الشاشية':'cap','قرطاج':'columns','سيدي بوسعيد':'houses','البريك':'pastry',
  'الرندة':'randa','الصحراء الكبرى':'desert','موسيقى الراي':'record','القصبة':'houses','الكسكسي الجزائري':'couscous','طاسيلي ناجر':'rockart',
  'البازين':'bazin','الصحراء':'desert','الواحات':'oasis','لبدة الكبرى':'columns','غدامس':'houses','العصيدة':'asida',
  'الجامع الأموي':'dome','المشاوي':'grill','سوق الحميدية':'market','البروكار':'brocade','البوظة الشامية':'icecream',
  'الجبنة':'jebena','النيلين':'river','أهرامات مروي':'pyramids','الثوب السوداني':'toub','الكسرة':'flatbread',
  'الخنجر العماني':'dagger','الحلوى العمانية':'dessert','اللبان':'incense','قلعة نزوى':'fort','الجبل الأخضر':'mountain','السفن التقليدية':'boat',
  'مجبوس الدجاج':'machboos','الديوانية':'majlis','السدو':'sadu','أبراج الكويت':'towers','سوق المباركية':'market','الدروازة':'gate',
  'سوق واقف':'market','المها العربي':'oryx','متحف الفن الإسلامي':'museum','اللؤلؤة':'island','القهوة القطرية':'coffee',
  'اللؤلؤ البحريني':'pearl','حلوى الشويطر':'dessert','باب البحرين':'gate','شجرة الحياة':'tree','الفخار':'pottery','بيت القرآن':'book',
  'الجنبية':'dagger','البن اليمني':'coffeebeans','صنعاء القديمة':'houses','السلتة':'saltah','جزيرة سقطرى':'island','العمارة الطينية':'houses',
  'الشاي الموريتاني':'tea','الملحفة':'melhafa','شنقيط':'fort','الدراعة':'daraa','مارو والحوت':'fishrice',
  'السمبوسة':'pastry','منارة مقديشو':'lighthouse','المعوز':'macawiis','الشعر الصومالي':'manuscript',
  'السمك المشوي':'grillfish','الميناء':'ship','التنوع الثقافي':'people','بحيرة عسل':'water','مضيق باب المندب':'water','المعوز الجيبوتي':'macawiis',
  'الفانيليا':'vanilla','البركان':'volcano','السلاحف':'turtle','اليلانغ يلانغ':'flower','الكانزو':'kanzu','الشواطئ الرملية':'beach'
};

const palette = { ink: '#284940', dark: '#274d48', teal: '#326f66', sage: '#8cae8d', gold: '#edaf52',
  cream: '#ffedc5', clay: '#c78752', rose: '#e5a77a', sand: '#f2cd95', brown: '#81533c' };

/* Composed detail is intentionally kept inside the illustration rather than behind it. */
const CulturalArt: React.FC<{ kind: string; name: string }> = ({ kind, name }) => {
  const p = palette;
  const is = (fragment: string) => name.includes(fragment);
  const bowl = (
    <>
      <ellipse cx="48" cy="55" rx="35" ry="11" fill={p.cream} stroke={p.brown} strokeWidth="2"/>
      <path d="M12 55 Q16 85 48 84 Q80 85 84 55Z" fill="url(#green)" stroke={p.dark} strokeWidth="2"/>
      <path d="M19 68Q48 76 77 68" fill="none" stroke="#b3cfac" strokeWidth="3"/>
      <ellipse cx="48" cy="54" rx="29" ry="7" fill="#f3ba60"/>
    </>
  );
  const windows = <>{[26,43,60].map(x => <g key={x}><rect x={x} y="47" width="10" height="26" rx="4" fill={p.teal}/><path d={'M'+(x+2)+' 51v20'} stroke="#cce2d0" strokeWidth="2"/></g>)}</>;
  const leaf = (x: number, y: number, rotation = 0) => <path transform={'translate('+x+' '+y+') rotate('+rotation+')'} d="M0 0Q-13 -16 2 -27Q14 -17 0 0Z" fill="#4c9474" stroke="#347159" strokeWidth="1.3"/>;
  let art: React.ReactNode;
  switch (kind) {


    case 'randa':
    case 'sadu':
    case 'brocade':
      art = kind==='sadu'?<>
        {/* Bedouin Sadu weaving: broad woven horizontal stripes with stepped diamonds. */}
        <path d="M12 16h72v63H12Z" fill="#b64c42" stroke="#926744" strokeWidth="3"/>
        <path d="M12 28h72M12 66h72" stroke="#252f31" strokeWidth="10"/>
        <path d="M12 38h72M12 56h72" stroke="#f0d6ab" strokeWidth="6"/>
        {[23,48,73].map(x=><path key={x} d={'M'+x+' 38l9 9-9 9-9-9Z'} fill="#d59d66" stroke="#493832" strokeWidth="2"/>)}
        {[16,26,36,46,56,66,76].map(x=><path key={x} d={'M'+x+' 79v8'} stroke="#d7b183" strokeWidth="2.6"/>)} 
      </>:kind==='randa'?<>
        {/* Algerian randa: delicate needle-made lace and fine eyelets, not a generic chequered rug. */}
        <path d="M12 21h72v57H12Z" fill="#edcfb1" stroke="#a57c5a" strokeWidth="2"/>
        <path d="M19 24V75M77 24V75" stroke="#9e6e53" strokeWidth="2"/>
        {[30,48,66].map(x=><g key={x}>
          <path d={'M'+x+' 29l11 16-11 16-11-16Z'} fill="#fff8e9" stroke="#bd8e66" strokeWidth="2"/>
          <circle cx={x} cy="45" r="4" fill="#d3a778"/><circle cx={x} cy="45" r="1.7" fill="white"/>
          <path d={'M'+x+' 61v12'} stroke="#c58c66" strokeWidth="2"/>
        </g>)}
        <path d="M18 19h60M18 78h60" stroke="#e2b889" strokeWidth="3"/>
        <path d="M75 12l13 11" stroke="#6d746c" strokeWidth="2.6"/><circle cx="74" cy="11" r="3" fill="#c38a59"/>
      </>:<>
        {/* Damascene brocade: rich woven floral silk and gold threads. */}
        <path d="M17 16Q44 9 78 19l-5 64q-28-9-57 0Z" fill="#784e65" stroke="#8d7359" strokeWidth="3"/>
        <path d="M21 21Q47 18 73 23M19 76q29-6 53 0" stroke="#e1b978" strokeWidth="2"/>
        {[35,57].map(x=><g key={x}>
          <path d={'M'+x+' 29q15 15 0 29-15-14 0-29Z'} fill="#d7aa65" stroke="#f8dca1" strokeWidth="1.6"/>
          <circle cx={x} cy="43" r="4" fill="#8ea485"/>
          <path d={'M'+x+' 55l-8 9M'+x+' 55l8 9'} stroke="#afbc8d" strokeWidth="2"/>
        </g>)}
        <path d="M26 25v49M47 23v49M68 27v43" stroke="#f2d497" strokeWidth="1" strokeDasharray="2 4"/>
      </>;
      break;
    case 'kaftan':
    case 'toub':
    case 'melhafa':
    case 'daraa':
    case 'macawiis':
    case 'kanzu':
      art = kind==='kaftan'?<>
        {/* Moroccan kaftan: full-length open-front robe with ornate golden sfifa braid. */}
        <path d="M30 18h36l9 13 12 14-14 12-8-10 4 35H27l4-35-8 10L9 45l13-15Z"
          fill="url(#clay)" stroke="#956442" strokeWidth="2.3"/>
        <path d="M39 17q9 11 18 0M48 21v60" stroke="#f9dc9b" strokeWidth="5" fill="none"/>
        <path d="M32 58h34M33 65h33M36 74h28" stroke="#e7bb78" strokeWidth="2"/>
        <path d="M42 34l6-6 6 6-6 6Z" fill="#347e6b"/><circle cx="48" cy="46" r="3.5" fill="#f6dda2"/>
        <path d="M25 32 15 46l12 10M70 31l12 15-10 9" stroke="#f8d59a" strokeWidth="2.3" fill="none"/>
      </>:kind==='toub'?<>
        {/* Sudanese toub: long, colorful wrapped fabric draped over the head and shoulder. */}
        <path d="M44 15q21-3 28 24l11 43Q48 90 14 81l17-46q-1-17 13-20Z"
          fill="#7d9c8e" stroke="#537767" strokeWidth="2.3"/>
        <path d="M43 15q13-4 21 14L53 47l-8-7-9 13Q29 39 33 28q2-10 10-13Z" fill="#e0a979"/>
        <ellipse cx="48" cy="33" rx="9" ry="12" fill="#c5906f"/>
        <path d="M28 52q19 14 44 5M23 66q20 16 56 5M31 38q14 16 40 4" stroke="#f2d6b1" strokeWidth="3" fill="none"/>
        <path d="M16 79q32-7 65 2" stroke="#e5ba7c" strokeWidth="4" fill="none"/>
      </>:kind==='melhafa'?<>
        {/* Mauritanian melhafa: an ample voile wrapped around head, chest and shoulders. */}
        <path d="M42 13q22-4 31 21l12 45Q50 90 12 79L25 34q4-17 17-21Z"
          fill="#8f80aa" stroke="#73678e" strokeWidth="2.4"/>
        <path d="M39 17q14-8 24 13L52 49l-10-8-8 9-4-23Z" fill="#bea9d1"/>
        <ellipse cx="48" cy="30" rx="9" ry="12" fill="#c89870"/>
        <path d="M17 68q34-15 64 2M25 46q30 12 51-1M33 60q25 12 44 0" stroke="#ded1e7" strokeWidth="3" fill="none"/>
        {[[28,70],[63,60],[71,76]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="3" fill="#dfc893"/>)}
      </>:kind==='daraa'?<>
        {/* Mauritanian male daraa: exceptionally wide blue boubou with a decorated chest opening. */}
        <path d="M29 17h38l19 20 6 20-21 8-7-14v31H31V51L18 66 3 56l8-22Z"
          fill="#77a8c1" stroke="#4a789a" strokeWidth="2.4"/>
        <path d="M38 18q10 9 20 0M48 22v37" stroke="#f9e9be" strokeWidth="3.5" fill="none"/>
        <path d="M41 33h14l5 21H36Z" stroke="#d3edf2" strokeWidth="2" fill="none"/>
        <path d="M14 47l17 10M65 55l19-10M35 72h26" stroke="#a8d5e0" strokeWidth="2.5"/>
        <path d="M32 83h33" stroke="#dfeadd" strokeWidth="2.5"/>
      </>:kind==='macawiis'?<>
        {/* Somali/Djiboutian macawiis: checked wrap skirt folded at the waist, not a dress. */}
        <path d="M24 17h48v24H24Z" fill="#fff0db" stroke="#bda281" strokeWidth="2"/>
        <path d="M27 40h42l10 39Q50 87 17 79Z" fill="#5b8e83" stroke="#3d7369" strokeWidth="2.5"/>
        <path d="M24 42h48" stroke="#ead6a9" strokeWidth="7"/>
        {[32,43,54,65].map(x=><path key={x} d={'M'+x+' 46l3 32'} stroke="#f2d5ae" strokeWidth="2.6"/>)}
        {[53,64,73].map(y=><path key={y} d={'M'+(24-(y-53)*.2)+' '+y+'h'+(48+(y-53)*.4)} stroke="#e5ab7b" strokeWidth="2.4"/>)}
        <path d="M43 40l10 10-6 8" stroke="#336b62" strokeWidth="3" fill="none"/>
      </>:<>
        {/* Comorian kanzu: long white straight tunic with an embroidered neckline. */}
        <path d="M32 15h32l12 19 8 16-13 8-9-15 4 39H29l5-39-9 15-13-8 9-16Z"
          fill="#faf4df" stroke="#aaa38f" strokeWidth="2.4"/>
        <path d="M39 17q9 12 18 0M48 25v26" stroke="#bd9c65" strokeWidth="3.5" fill="none"/>
        <path d="M41 33h14M42 40h12M45 46h6" stroke="#cbb58c" strokeWidth="2"/>
        <path d="M29 76h37M26 43l8 8M69 51l7-8" stroke="#dbcbae" strokeWidth="2.2"/>
      </>;
      break;
    case 'jebena':
    case 'coffeebeans':
      art = kind==='jebena'?<>
        {/* Sudanese clay jebena, round base and narrow neck, unlike the Arabian metal dallah. */}
        <ellipse cx="47" cy="76" rx="29" ry="7" fill="#c9a67b"/>
        <path d="M37 27h21l-3 15q25 13 17 30-11 17-43 6Q18 67 27 52q6-7 10-10Z"
          fill="url(#clay)" stroke="#8b5e44" strokeWidth="2.4"/>
        <path d="M58 39q19-8 26 2l-5 6-20 1" fill="#b77a53" stroke="#8b5e44" strokeWidth="2"/>
        <path d="M26 53q-14 3-10 15 4 10 16 5" stroke="#995f42" strokeWidth="5" fill="none"/>
        <path d="M32 60q14-4 34 0M35 67q15-4 30 0" stroke="#f1ce9b" strokeWidth="2.6" fill="none"/>
        <path d="M36 27v-8h22v8M46 19v-7" stroke="#9a704e" strokeWidth="3"/>
      </>:<>
        {/* Yemeni coffee: roasted beans and coffee leaves rather than a hospitality pot. */}
        <path d="M31 78Q44 49 61 23" stroke="#8a6a47" strokeWidth="4.5" strokeLinecap="round"/>
        {leaf(47,43,-34)}{leaf(64,35,70)}{leaf(77,23,30)}
        {[[28,65],[45,68],[60,61],[72,77]].map(([x,y],i)=><g key={i}>
          <ellipse cx={x} cy={y} rx="10" ry="15" fill={i%2?'#9b6946':'#b78353'} stroke="#774b34" strokeWidth="1.8" transform={'rotate('+(-20+i*12)+' '+x+' '+y+')'}/>
          <path d={'M'+(x-3)+' '+(y-10)+'q7 9 0 20'} stroke="#d7ad75" strokeWidth="2.1" fill="none" transform={'rotate('+(-20+i*12)+' '+x+' '+y+')'}/>
        </g>)}
      </>;
      break;
    case 'saltah':
      art = <>
        {/* Yemeni saltah is served in a deep black stone pot, with green hilbeh froth. */}
        <ellipse cx="48" cy="80" rx="40" ry="9" fill="#a58b73"/>
        <path d="M11 44h74q-2 33-37 36Q14 78 11 44Z" fill="#574b46" stroke="#302e2b" strokeWidth="3.2"/>
        <ellipse cx="48" cy="44" rx="37" ry="11" fill="#704f3e" stroke="#3d3d37" strokeWidth="2"/>
        <path d="M19 44q23-16 58 0-24 16-58 0Z" fill="#b66c46"/>
        <path d="M23 41q14-17 26-6 18-10 27 8-26 15-53-2Z" fill="#85a775"/>
        <path d="M30 42q17 7 35 0M28 48q17 7 37 0" stroke="#c5d5a0" strokeWidth="3" fill="none"/>
        <circle cx="44" cy="36" r="3" fill="#e6a15d"/><circle cx="57" cy="44" r="3.5" fill="#d18148"/>
        <path d="M24 64q23 12 50 0" stroke="#76706a" strokeWidth="2"/>
      </>;
      break;
    case 'mansaf':
      art = <>
        {/* Jordan: rice, roasted lamb and a clearly visible white jameed sauce on a large platter. */}
        <ellipse cx="48" cy="77" rx="43" ry="12" fill="#bd956e" stroke="#876144" strokeWidth="2"/>
        <ellipse cx="48" cy="73" rx="38" ry="10" fill="#fff2d8"/>
        <path d="M16 70q10-26 34-24 22-1 32 24-25 17-66 0Z" fill="#f5dfab"/>
        {Array.from({length:24},(_,i)=><path key={i} d={'M'+(22+i%8*7)+' '+(58+Math.floor(i/8)*5)+'l4-2'} stroke={i%4===0?'#c99a53':'#fef6db'} strokeWidth="2.1" strokeLinecap="round"/>)}
        <path d="M30 51q0-16 19-20 19 1 22 17l-8 12q-19 8-31-1Z" fill="#9a6242" stroke="#7b4934" strokeWidth="2"/>
        <path d="M34 44q15-13 31 0M36 53q17 6 29-4" fill="none" stroke="#cb9060" strokeWidth="4.7" strokeLinecap="round"/>
        <path d="M18 69q21 10 61 0M26 62q7-5 13-2M61 61q7 2 11 0" fill="none" stroke="#fffdfa" strokeWidth="5.3" strokeLinecap="round"/>
        {[27,41,57,71].map(x=><ellipse key={x} cx={x} cy={69+x%4} rx="4" ry="1.9" fill="#b78952" transform={'rotate(-27 '+x+' 69)'}/>)}
        <circle cx="22" cy="72" r="2.5" fill="#64936a"/><circle cx="74" cy="74" r="2.5" fill="#64936a"/>
      </>;
      break;
    case 'maqluba':
      art = <>
        {/* The inverted mould of maqluba has tall, visible rice/eggplant/vegetable layers, unlike mansaf. */}
        <ellipse cx="48" cy="78" rx="40" ry="10" fill="#b58a62" stroke="#8f6a4e" strokeWidth="2"/>
        <ellipse cx="48" cy="76" rx="35" ry="7" fill="#fff0d1"/>
        <path d="M26 35Q48 22 70 35l6 36q-29 13-56 0Z" fill="#eac77e" stroke="#a5794c" strokeWidth="2.1"/>
        <path d="M23 60q25 10 50 0l3 11q-30 10-56 0Z" fill="#65483e"/>
        <path d="M25 53q23 8 47 0l1 9q-23 9-50 0Z" fill="#8fa067"/>
        <path d="M26 45q22 8 43 0l3 9q-23 9-47 0Z" fill="#e9ce8f"/>
        <path d="M27 37q20 10 43 0l1 9q-23 10-45 0Z" fill="#67443a"/>
        <ellipse cx="48" cy="34" rx="22" ry="8" fill="#e9cf8d" stroke="#ad8a56" strokeWidth="1.6"/>
        <ellipse cx="48" cy="32" rx="12" ry="4" fill="#c77e56"/>
        {[30,46,63].map(x=><circle key={x} cx={x} cy={67+x%3} r="2.5" fill="#d9a15e"/>)}
      </>;
      break;
    case 'shemagh':
    case 'keffiyeh':
      art = <>
        {/* Jordanian red-and-white shemagh and Palestinian black-and-white keffiyeh have distinct woven checks. */}
        <path d="M23 18q25-10 49 0l12 59q-13 11-32 0l-5-9q-20 19-34 8Z"
          fill="#fffbef" stroke="#b4a18b" strokeWidth="2.1" strokeLinejoin="round"/>
        <path d="M23 18q25-10 49 0l4 18q-28 10-56 0Z" fill="#fff9eb"/>
        {Array.from({length:8},(_,i)=><g key={i}>
          <path d={'M'+(18+i*8)+' 29l20 44'} stroke={kind==='shemagh'?'#b84e47':'#3e4545'} strokeWidth="2.1" opacity=".9"/>
          <path d={'M'+(17+i*8)+' 74l21-43'} stroke={kind==='shemagh'?'#c26459':'#4a4e4d'} strokeWidth="1.8" opacity=".83"/>
        </g>)}
        <path d="M26 18q22-9 43 1" stroke={kind==='shemagh'?'#ad4540':'#343b3c'} strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M19 58q26 7 59-1" stroke={kind==='shemagh'?'#b94d47':'#414a48'} strokeWidth="2.6" fill="none"/>
        <path d="M18 75l-4 7m12-6-2 9m9-10-1 9m41-9 4 9m-12-8 3 8" stroke="#c4b396" strokeWidth="1.7" strokeLinecap="round"/>
      </>;
      break;
    case 'kabsa':
    case 'machboos':
      art = <>
        {/* Saffron spiced rice with chicken, and dried limes on Kuwaiti machboos. */}
        <ellipse cx="48" cy="78" rx="43" ry="11" fill="#b99567" stroke="#865f42" strokeWidth="2"/>
        <ellipse cx="48" cy="72" rx="38" ry="10" fill="#fff3d8"/>
        <path d="M13 68q16-29 37-24 19-3 34 23-23 17-71 1Z" fill={kind==='kabsa'?'#d89c4b':'#e3b15b'}/>
        {Array.from({length:21},(_,i)=><path key={i} d={'M'+(18+i%7*9)+' '+(56+Math.floor(i/7)*5)+'l4 -2'} stroke={i%3===0?'#b36d36':'#fff0bc'} strokeWidth="2.3" strokeLinecap="round"/>)}
        <path d="M32 49q-9-16 8-22 16-4 26 9 11 16-5 24-17 3-29-11Z" fill="#b77549" stroke="#88543c" strokeWidth="2.3"/>
        <path d="M33 45q10-13 25-4M39 53q15 5 22-5" stroke="#edbd7f" strokeWidth="3.2" fill="none"/>
        <path d="M30 48l-9-10m11 13-10-6" stroke="#fff4dc" strokeWidth="3" strokeLinecap="round"/>
        {kind==='machboos'?<><circle cx="19" cy="69" r="5" fill="#4c4433" stroke="#cfbb7d" strokeWidth="1.5"/><circle cx="78" cy="69" r="5" fill="#514436" stroke="#cfbb7d" strokeWidth="1.5"/></>:<><circle cx="22" cy="68" r="3.5" fill="#a64f38"/><path d="M74 66l5 5" stroke="#608e51" strokeWidth="3"/></>}
      </>;
      break;
    case 'koshary':
      art = <>
        <path d="M11 53h74q-3 29-36 31Q17 82 11 53Z" fill="url(#clay)" stroke="#96684a" strokeWidth="2.2"/>
        <ellipse cx="48" cy="53" rx="37" ry="11" fill="#f4d59c"/>
        {Array.from({length:14},(_,i)=><circle key={i} cx={21+i%7*9} cy={47+Math.floor(i/7)*7} r="3" fill={i%3===0?'#754b37':'#c19a62'}/>)}
        <path d="M14 50q12 8 23 0t21 1q14 8 26 0" stroke="#bd4e38" strokeWidth="5.7" fill="none"/>
        <path d="M29 39q-6-9 3-11 8-1 9 8m13 0q-3-9 7-11 8-1 10 6" stroke="#c49659" strokeWidth="4.2" fill="none" strokeLinecap="round"/>
        <path d="M20 67q29 9 56 0" stroke="#f1d6a6" strokeWidth="3" fill="none"/>
      </>;
      break;
    case 'asida':
      art = <>
        <ellipse cx="48" cy="78" rx="42" ry="11" fill="#c0996a" stroke="#946f4c" strokeWidth="2"/>
        <path d="M17 70q1-26 31-34 29 7 31 34-30 18-62 0Z" fill="#ecd4a5" stroke="#b78e5e" strokeWidth="2"/>
        <path d="M48 41Q29 59 41 68q9 8 16-2 3-8-9-25Z" fill="#aa6b46" stroke="#87583b" strokeWidth="2"/>
        <path d="M22 71q26 10 53 0" stroke="#ab7547" strokeWidth="3" fill="none"/>
      </>;
      break;
    case 'coffee':
      art = <><ellipse cx="44" cy="79" rx="27" ry="5" fill="#c9b18e" opacity=".6"/>
        <path d="M36 31Q37 23 49 23Q61 23 62 31L63 64Q60 76 49 76Q36 76 34 64Z" fill="url(#gold)" stroke="#9a6a36" strokeWidth="2"/>
        <path d="M62 41Q86 31 83 50Q80 61 65 60" stroke="#b67e3b" strokeWidth="7" fill="none" strokeLinecap="round"/>
        <path d="M36 41Q19 47 22 57L36 60M49 11v11M41 19h16M42 14h14" stroke={p.brown} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <path d="M42 38v27M51 38v27" stroke="#fff2ca" strokeWidth="2" opacity=".7"/>
        <ellipse cx="15" cy="75" rx="12" ry="5" fill="#a66f45"/><path d="M5 68h20l-3 8H8Z" fill={p.cream} stroke="#aa724b" strokeWidth="2"/>
        <circle cx="65" cy="76" r="4" fill="#95613f"/><circle cx="74" cy="78" r="4" fill="#b37b4b"/></>;
      break;
    case 'falcon':
      art = <><path d="M21 80H76" stroke={p.brown} strokeWidth="7" strokeLinecap="round"/>
        <path d="M42 70Q22 48 35 30Q46 9 65 20Q82 32 65 49L62 71Q55 78 42 70Z" fill="url(#sand)" stroke="#805d45" strokeWidth="2.4"/>
        <path d="M43 36Q33 60 49 67Q62 55 61 35Z" fill="#9a7858"/>
        <path d="M63 26L82 34 65 39Z" fill="#dfac63" stroke="#835940" strokeWidth="2"/>
        <circle cx="60" cy="27" r="3.5" fill="#252e2b"/><circle cx="61" cy="26" r="1" fill="white"/>
        <path d="M39 51l15 9-5 11M43 72l-3 8M56 72l4 8" stroke="#865b3c" strokeWidth="3" fill="none"/>
        <path d="M38 29Q23 35 24 57M48 27Q38 35 36 44" stroke="#fff4d7" strokeWidth="2" fill="none"/></>;
      break;
    case 'pearl':
      art = <><path d="M9 54Q23 15 48 31Q73 15 87 54Q64 90 48 86Q29 91 9 54Z" fill="url(#sand)" stroke="#aa885e" strokeWidth="2.5"/>
        {[23,35,48,61,74].map(x=><path key={x} d={'M48 78Q'+x+' 52 '+x+' 36'} fill="none" stroke="#bb996b" strokeWidth="1.9"/>)}
        <circle cx="49" cy="58" r="17" fill="url(#pearl)" stroke="#b8bcac" strokeWidth="2"/>
        <ellipse cx="41" cy="49" rx="6" ry="4" fill="white" opacity=".9"/></>;
      break;
    case 'majlis':
      art = <><rect x="13" y="42" width="70" height="30" rx="9" fill="url(#clay)"/><rect x="18" y="30" width="60" height="29" rx="9" fill="#c79771" stroke="#8c604d" strokeWidth="2"/>
        <rect x="21" y="41" width="24" height="21" rx="5" fill={p.cream}/><rect x="50" y="41" width="24" height="21" rx="5" fill={p.sage}/>
        <rect x="9" y="45" width="14" height="29" rx="5" fill="#a67452"/><rect x="73" y="45" width="14" height="29" rx="5" fill="#a67452"/>
        <path d="M21 78h54" stroke="#7d5540" strokeWidth="4"/><rect x="39" y="66" width="20" height="11" rx="5" fill="#c39a62"/><path d="M47 68h5" stroke="white" strokeWidth="2"/></>;
      break;
    case 'dates':
      art = <>{[20,31,44,57,70].map((x,i)=><g key={i} transform={'rotate('+(i*11-20)+' '+x+' 57)'}><ellipse cx={x} cy={i%2?58:55} rx="9" ry="17" fill={i%2?'#a3663f':'#bf8246'} stroke="#824e35" strokeWidth="1.5"/><path d={'M'+(x-3)+' 49q6 10 0 18'} stroke="#dfaf73" strokeWidth="1.4"/></g>)}
        <path d="M15 78q33 16 65 0" stroke={p.teal} strokeWidth="5" fill="none" strokeLinecap="round"/><path d="M39 25Q52 12 64 24M50 27V14" stroke="#598e5f" strokeWidth="3" fill="none"/></>;
      break;
    case 'incense':
      art = <><path d="M35 32Q22 19 36 8M51 31Q39 15 51 4M64 33Q76 18 64 9" stroke="#9abbb1" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M21 43H75L68 71H29Z" fill="url(#clay)" stroke="#87583f" strokeWidth="2.5"/>
        <path d="M24 47H72M30 60H65" stroke="#f8d6a4" strokeWidth="4"/>
        <path d="M39 72v8h20v-8" fill="none" stroke="#976742" strokeWidth="5"/>
        <path d="M42 39l6-12 7 12" fill="#e8b35e"/><circle cx="49" cy="33" r="5" fill="#e7a24b"/></>;
      break;
    case 'lantern':
      art = <><path d="M39 17h18M48 6v10" stroke="#7d5b38" strokeWidth="4" strokeLinecap="round"/><path d="M33 29l15-12 15 12-4 43H37Z" fill="url(#gold)" stroke="#a56b34" strokeWidth="3"/><path d="M41 38q7-8 14 0v25H41Z" fill="#ffefae"/><path d="M38 30h20M40 70h17M32 76h32" stroke="#876338" strokeWidth="4" strokeLinecap="round"/><circle cx="48" cy="51" r="6" fill="#f7b54e"/></>;
      break;
    case 'pyramids':
      art = <><path d="M8 76 37 25 65 76Z" fill="url(#sand)" stroke="#b78a58" strokeWidth="2"/><path d="M37 25 65 76H37Z" fill="#c89a60"/><path d="M43 77 66 42 89 77Z" fill="#e8c08a" stroke="#ae8056" strokeWidth="2"/><path d="M66 42 89 77H66Z" fill="#bd8a55"/><path d="M15 68h41M20 59h31M26 49h21M49 70h34M55 61h22" stroke="#b98e62" strokeWidth="1.5"/><circle cx="80" cy="22" r="8" fill="#eaa642"/></>;
      break;
    case 'boat':
    case 'ship':
      art = <><path d="M48 13v58" stroke="#846341" strokeWidth="3.5"/><path d="M44 20 17 60h27ZM52 26 79 59H52Z" fill={kind==='ship'?'#f1d39b':'#ffebc5'} stroke="#b68f67" strokeWidth="2"/><path d="M12 63h73L74 79H23Z" fill="url(#clay)" stroke="#88583f" strokeWidth="2.5"/><path d="M5 85q8-6 16 0t16 0t16 0t16 0t16 0" stroke="#39929f" strokeWidth="4" fill="none" strokeLinecap="round"/></>;
      break;
    case 'river':
    case 'water':
    case 'beach':
      art = <><circle cx="71" cy="24" r="12" fill="#eab35b"/><path d="M8 57Q26 48 46 58T88 56L89 79Q65 88 45 78T8 83Z" fill="url(#sea)"/><path d="M8 64q12-7 24 0t24 0t32 0M8 75q15-8 30 0t30 0t22 0" fill="none" stroke="#b5e3d5" strokeWidth="3"/><path d="M8 54Q26 27 41 55Z" fill="#e7c58b"/>{kind==='beach'?<path d="M16 49 43 23l26 24Z" fill="#e8a168" stroke="#b8774d" strokeWidth="2"/>:null}</>;
      break;
    case 'manuscript':
    case 'book':
      art = <><rect x="22" y="15" width="53" height="65" rx="5" fill="#ba804f" stroke="#895f3e" strokeWidth="2.5"/><path d="M18 20Q45 10 69 20v56Q45 67 18 78Z" fill="url(#sand)" stroke="#b68753" strokeWidth="2"/><path d="M28 35q18-9 33 0M28 46q16-7 33 0M29 57q16-7 31 0" stroke="#a67947" strokeWidth="2" fill="none"/><path d="M43 20v11" stroke="#d19c65" strokeWidth="3"/><path d="M58 15v18" stroke={p.teal} strokeWidth="3"/></>;
      break;
    case 'rice':
    case 'couscous':
    case 'bazin':
    case 'salad':
    case 'fishrice':
      art = <>{bowl}{kind==='bazin'?<path d="M29 53Q34 28 50 26Q66 28 70 54Z" fill="#dfb46d" stroke="#ba8753" strokeWidth="2"/>:<ellipse cx="48" cy="49" rx="28" ry="14" fill={kind==='salad'?'#70a16e':'#eac483'}/>}
        {kind==='salad'?Array.from({length:12},(_,i)=> <ellipse key={i} cx={25+(i%5)*12} cy={43+Math.floor(i/5)*6} rx="5" ry="3" fill={i%3===0?'#e77e5c':'#408a61'} transform={'rotate('+(i*30)+' 48 49)'}/>):Array.from({length:12},(_,i)=><circle key={i} cx={26+(i%5)*11} cy={42+Math.floor(i/5)*6} r={i%3===0?4:2.4} fill={kind==='couscous'?'#e9a64f':i%4===0?'#ba7047':'#f8d99e'}/>)}
        {(kind==='rice'||kind==='fishrice')&&<><path d="M40 39q18-18 28 3l-13 12Z" fill="#ae6544"/><circle cx="35" cy="44" r="5" fill="#5b945b"/></>}</>;
      break;
    case 'tagine':
      art = <><ellipse cx="48" cy="74" rx="34" ry="8" fill="#c28f5d"/><path d="M16 69h64q-4 16-32 16T16 69Z" fill="#a97449" stroke="#824f36" strokeWidth="2"/><path d="M17 69 47 20 78 69Z" fill="url(#clay)" stroke="#a56f4c" strokeWidth="2.5"/><ellipse cx="47" cy="20" rx="6" ry="5" fill="#c38b53"/><path d="M28 65h40M35 54h27M41 43h14" stroke="#f4ca9b" strokeWidth="3"/><circle cx="48" cy="58" r="4" fill="#f7d78e"/></>;
      break;
    case 'tea':
      art = <><path d="M18 44h56l-7 29H27Z" fill="url(#green)" stroke="#315d57" strokeWidth="2"/><path d="M74 48q19-3 13 13-3 8-17 6" stroke="#6c9182" strokeWidth="5" fill="none"/><ellipse cx="46" cy="44" rx="28" ry="7" fill="#c38a48"/><ellipse cx="47" cy="44" rx="21" ry="4" fill="#664b31"/><path d="M31 31q-8-10 0-17M48 31q-8-10 0-17M64 31q-8-10 0-17" stroke="#a9b6a8" strokeWidth="3" fill="none" strokeLinecap="round"/>{is('نعناع')&&leaf(65,36,45)}</>;
      break;
    case 'palm':
    case 'oasis':
    case 'tree':
    case 'cedar':
      art = <><path d="M43 75q8-24 7-46" stroke="#986944" strokeWidth="10" fill="none" strokeLinecap="round"/><path d="M12 80q36-15 73 0" stroke="#81a66f" strokeWidth="7" fill="none"/>{kind==='cedar'?<><path d="M48 14 20 39h56ZM48 23 14 54h68ZM48 34 9 65h78Z" fill="url(#green)" stroke="#376b5a" strokeWidth="2"/></>:<>{[-75,-45,-15,15,45,75].map((r,i)=><path key={i} d="M48 29q-29-31-39 0 17-6 39 0Z" transform={'rotate('+r+' 48 29)'} fill={i%2?'#4b8a60':'#6eaa71'} stroke="#376b55" strokeWidth="1.5"/>)}</>}{kind==='oasis'&&<ellipse cx="37" cy="79" rx="26" ry="4" fill="#69beb9"/>}</>;
      break;
    case 'camel':
      art = <>
        {/* Arabian dromedary: one hump, naturally small eye, four anatomical legs. */}
        <path d="M24 53Q28 46 34 44Q40 27 47 27Q55 27 59 43Q70 43 76 52L76 62Q70 67 60 65H29Q20 62 24 53Z"
          fill="url(#clay)" stroke="#936744" strokeWidth="2.3" strokeLinejoin="round"/>
        <path d="M28 51Q17 49 18 36L18 31Q11 29 12 24Q12 20 17 19l11 1q7 2 5 8l-7 7 1 12Z"
          fill="#daa66f" stroke="#936744" strokeWidth="2.1"/>
        <path d="M22 20l3-6q6 2 4 8" fill="#bc8053" stroke="#936744" strokeWidth="1.5"/>
        <path d="M13 27L6 29q-1 4 7 5l12-2" fill="#c99466" stroke="#946647" strokeWidth="1.8"/>
        <circle cx="24.5" cy="26.7" r="1.7" fill="#352b26"/><circle cx="24.8" cy="26.2" r=".5" fill="#fff9e6"/>
        <path d="M11 31q4 2 7 0" stroke="#805742" strokeWidth="1.2" fill="none"/>
        <path d="M27 63l-1 19h-7l-2-19M38 64l1 19h7l1-18M63 63v19h7l3-21" fill="#ca9365" stroke="#8f6345" strokeWidth="2"/>
        <path d="M18 82h13M39 83h13M62 82h15" stroke="#765640" strokeWidth="3" strokeLinecap="round"/>
        <path d="M38 44q6-10 10-12M60 48q10-2 13 6" stroke="#efc48d" strokeWidth="2" fill="none"/>
      </>;
      break;
    case 'desert':
    case 'mountain':
    case 'rock':
      art = <><circle cx="70" cy="19" r="10" fill="#eca744"/><path d={kind==='mountain'?'M4 77 28 29l17 28 18-39 29 59Z':'M5 77Q19 33 44 45 62 7 91 70v12H5Z'} fill="url(#sand)"/><path d="M43 77Q66 27 91 70v12H43Z" fill="#c28c5a"/><path d="M21 76q11-21 25-17M57 76q10-22 22-17" fill="none" stroke="#e8b479" strokeWidth="4"/>{kind==='rock'&&<path d="M41 52h16v20H41ZM36 52l13-9 13 9" fill="#a46e4d" stroke="#82583e" strokeWidth="2"/>}</>;
      break;
    case 'mosaic':
    case 'weave':
      art = <><rect x="13" y="13" width="70" height="70" rx="5" fill={kind==='weave'?'#d4a46a':'#5c8f86'} stroke="#936f48" strokeWidth="5"/>{Array.from({length:4},(_,i)=>Array.from({length:4},(_,j)=><path key={i+'-'+j} d={'M'+(22+j*15)+' '+(22+i*15)+'l8 -7 8 7 -8 7Z'} fill={(i+j)%2?'#ffde9b':'#2b7169'} stroke="#f6d6a2" strokeWidth=".8"/>))}{kind==='weave'&&<><path d="M21 15v66M74 15v66" stroke="#eac78d" strokeWidth="3"/><path d="M8 9l80 80" stroke="#b87b54" strokeWidth="2"/></>}</>;
      break;
    case 'dress':
    case 'headscarf':
    case 'cap':
      art = kind==='cap'?<><path d="M20 55q-3-28 28-32 30 1 28 32Z" fill="#b75b53" stroke="#843f3c" strokeWidth="2"/><path d="M13 57q35-9 70 0v9q-35-5-70 0Z" fill="#d58d6c"/><path d="M24 51h48" stroke="#f0b58e" strokeWidth="3"/></>:kind==='headscarf'?<><path d="M20 24q29-25 56 0l-4 57H25Z" fill="#f7e7c9" stroke="#a37d5d" strokeWidth="2"/>{[25,37,49,61].map(x=><path key={x} d={'M'+x+' 29l3 48'} stroke="#b96354" strokeWidth="3"/>)}
        <path d="M21 42l55 0M23 57l50 0" stroke="#b96354" strokeWidth="3"/></>:<><path d="M31 17h34l8 13 12 13-17 12-5-11v36H33V44l-7 11-15-12 12-14Z" fill="url(#clay)" stroke="#a4714d" strokeWidth="2.5"/><path d="M45 18v62M53 18v62M34 67h28M23 39l12 9M72 39l-12 9" stroke="#f9d794" strokeWidth="3"/><path d="M32 30h32" stroke="#5b9b7b" strokeWidth="5"/></>;
      break;
    case 'oil':
    case 'pottery':
      art = <><path d="M31 31h34l-3 18Q75 72 63 82H33Q22 72 34 49Z" fill="url(#clay)" stroke="#8e6246" strokeWidth="2.5"/><path d="M38 31v-9h20v9M36 59h26M39 69h20" stroke="#f8d49b" strokeWidth="4"/><path d="M43 22v-7h10v7" stroke="#94613f" strokeWidth="3"/>{kind==='oil'&&<><ellipse cx="73" cy="68" rx="8" ry="10" fill="#a7a656"/><circle cx="72" cy="66" r="3" fill="#f2d687"/>{leaf(76,51,24)}</>}</>;
      break;
    case 'bath':
      art = <><path d="M19 47Q17 78 48 81 80 78 77 47Z" fill="#c5e7dc" stroke="#70a79d" strokeWidth="3"/><path d="M17 48h62" stroke="#558e80" strokeWidth="4"/><path d="M29 39q-8-9 0-17M48 39q-8-9 0-17M64 39q-8-9 0-17" stroke="#a2b9af" strokeWidth="3" fill="none"/><ellipse cx="49" cy="45" rx="33" ry="6" fill="#d7f3e9"/></>;
      break;
    case 'columns':
    case 'fort':
    case 'gate':
    case 'houses':
    case 'museum':
    case 'market':
    case 'dome':
      art = <><path d="M12 74h72v8H12Z" fill="#aa815a"/><path d="M17 34h62v40H17Z" fill="url(#sand)" stroke="#b88b5c" strokeWidth="2"/>{kind==='columns'?<><path d="M10 32 48 15 87 32Z" fill="#cb9967"/>{[22,40,58,76].map(x=><g key={x}><rect x={x} y="34" width="7" height="40" fill="#fff0d3"/><path d={'M'+x+' 34v40'} stroke="#a57f5d" strokeWidth="1.5"/></g>)}</>:kind==='dome'?<><path d="M23 34q1-27 25-27t25 27Z" fill="url(#gold)" stroke="#b68346" strokeWidth="2"/><path d="M48 7V1M42 15h12" stroke="#ba9253" strokeWidth="2"/>{windows}</>:kind==='gate'?<><path d="M16 30h65v44H16ZM10 25h76" fill="#c99e6c" stroke="#976c49" strokeWidth="3"/><path d="M36 74V54q12-19 24 0v20Z" fill={p.teal}/><path d="M22 37h9M68 37h9M22 47h9M68 47h9" stroke="#f8e4c2" strokeWidth="2"/><path d="M9 22h8v-7h9v7h9v-7h9v7h9v-7h9v7h9v-7h9v7h8v8H9Z" fill="#b78353"/></>:kind==='market'?<><path d="M14 33h68l-8 16H22Z" fill="#b77852"/><path d="M14 33h15l-4 16H9ZM43 33h14v16H39ZM70 33h12l7 16H75Z" fill="#f0d5a2"/><path d="M29 51v23h37V51" fill="#dfc29a"/><rect x="43" y="55" width="13" height="19" rx="6" fill={p.teal}/></>:kind==='houses'?<><rect x="4" y="35" width="35" height="39" rx="3" fill="#e9bd81"/><rect x="39" y="22" width="36" height="52" rx="3" fill="#d69b64"/><rect x="67" y="40" width="24" height="34" rx="3" fill="#efc996"/><path d="M10 34v-7h9v7h10v-7h9v7M45 22v-9h9v9h9v-9h9v9" stroke="#b57c52" strokeWidth="3"/>{windows}</>:kind==='fort'?<><rect x="12" y="35" width="73" height="39" fill="#c49463"/><rect x="19" y="20" width="17" height="54" fill="#b98a60"/><rect x="58" y="20" width="18" height="54" fill="#b98a60"/><path d="M44 74V57q6-12 13 0v17Z" fill={p.dark}/><path d="M17 19v-7h8v7h9v-7h7M56 19v-7h8v7h9v-7h8" stroke="#b98a60" strokeWidth="5"/></>:<>{windows}<path d="M11 33 48 12 85 33Z" fill="#cf955d"/></>}</>;
      break;
    case 'music':
    case 'record':
      art = kind==='record'?<><circle cx="44" cy="50" r="35" fill="#2b504c" stroke="#1c3936" strokeWidth="3"/>{[28,22,14].map(r=><circle key={r} cx="44" cy="50" r={r} fill="none" stroke="#65867c" strokeWidth="2"/>)}
        <circle cx="44" cy="50" r="9" fill="#e4a86e"/><circle cx="44" cy="50" r="3.5" fill="#4b5a4f"/>
        <path d="M73 14v28q-8-8-12 1 4 8 12 0" stroke="#b47552" strokeWidth="3" fill="none"/></>:<><path d="M21 73Q13 46 36 36L64 20 80 37Q86 55 64 73Q40 91 21 73Z" fill="url(#clay)" stroke="#865e44" strokeWidth="2"/><circle cx="51" cy="58" r="14" fill="#6e4936" stroke="#e9c18a" strokeWidth="4"/><path d="M48 42 72 7" stroke="#866647" strokeWidth="9" strokeLinecap="round"/><path d="M67 14l16 11M62 20l16 11M57 27l16 11" stroke="#f5cc91" strokeWidth="2"/>{[-4,1,6].map(y=><path key={y} d={'M28 '+(63+y)+'L72 '+(12+y)} stroke="#efddb6" strokeWidth="1.5"/>)}</>;
      break;
    case 'dance':
      art = <><circle cx="40" cy="20" r="11" fill="#dcb48b"/><path d="M28 35Q38 29 50 36l8 20-7 28H20l10-28Z" fill="url(#clay)"/><path d="M30 39 11 49M51 41 83 30M24 80l-8 9M50 81l14 9" stroke="#b07855" strokeWidth="7" strokeLinecap="round"/><path d="M30 54h25M29 65h24" stroke="#f3d397" strokeWidth="3"/></>;
      break;
    case 'flatbread':
    case 'pastry':
    case 'dessert':
    case 'cookies':
    case 'icecream':
      art = kind==='icecream'?<><path d="M32 47h33L49 87Z" fill="#d29a62" stroke="#986745" strokeWidth="2.5"/>{[57,46,35].map((y,i)=><circle key={i} cx={49} cy={y} r={17-i*2} fill={i%2?'#f1d08b':'#fff1c8'}/>)}
        <path d="M35 33q12-11 25 0" stroke="#7b985b" strokeWidth="4" fill="none"/></>:<><ellipse cx="49" cy="74" rx="36" ry="10" fill="#daa66c" stroke="#9b704b" strokeWidth="2"/>{[0,1,2].map((i)=><g key={i} transform={'translate('+(25+i*24)+' '+(i%2?51:55)+')'}><ellipse cx="0" cy="0" rx={kind==='dessert'?15:14} ry={kind==='flatbread'?7:12} fill={kind==='dessert'?'#e4a45c':'#ebc48b'} stroke="#b68551" strokeWidth="1.5"/><path d="M-7 -1q8-10 14 0M-9 4q12 3 18 0" stroke={kind==='dessert'?'#e8d787':'#a77b4e'} strokeWidth="2" fill="none"/>{kind==='flatbread'&&<circle cx="0" cy="-2" r="4" fill="#6c925b"/>}</g>)}</>;
      break;
    case 'grill':
    case 'grillfish':
    case 'fish':
      art = <><path d="M14 76h69" stroke="#8c6347" strokeWidth="5" strokeLinecap="round"/>{kind==='grillfish'||kind==='fish'?<><path d="M17 51Q45 19 73 52L85 39v27L73 54Q45 85 17 51Z" fill="url(#gold)" stroke="#855d42" strokeWidth="2"/><circle cx="29" cy="48" r="3" fill="#3f4840"/><path d="M43 40q5 15 0 25M55 39q5 15 0 25M65 43q5 11 0 19" stroke="#bc8050" strokeWidth="2.5"/></>:<>{[21,40,60].map((x,i)=><g key={x} transform={'rotate('+(i%2?12:-12)+' '+x+' 48)'}><path d={'M'+x+' 20v58'} stroke="#946b43" strokeWidth="3"/><rect x={x-10} y="33" width="20" height="28" rx="8" fill={i%2?'#c57547':'#e3ad5d'}/><path d={'M'+(x-7)+' 43h14M'+(x-7)+' 53h14'} stroke="#f5d39f" strokeWidth="2"/></g>)}</>}</>;
      break;
    case 'flower':
      art = <><path d="M48 52v32" stroke="#547c54" strokeWidth="5"/>{[0,45,90,135,180,225,270,315].map((r,i)=><ellipse key={i} cx="48" cy="29" rx="11" ry="20" fill={i%2?'#fff0cf':'#f1da9a'} stroke="#d4b477" strokeWidth="1" transform={'rotate('+r+' 48 46)'}/>)}
        <circle cx="48" cy="45" r="11" fill="#e3a54f"/>{leaf(43,75,-35)}{leaf(58,68,48)}</>;
      break;
    case 'rockart':
      art = <><path d="M11 81Q8 42 30 17L68 14Q89 35 87 81Z" fill="url(#sand)" stroke="#ad835b" strokeWidth="3"/>
        <path d="M23 75q14-9 23-5t27 4" stroke="#cc9765" strokeWidth="5" fill="none"/>
        <circle cx="45" cy="32" r="5" fill="#a36d4b"/><path d="M45 40l-3 21M43 47 30 55M43 47l14 6M42 61l-12 11M42 61l11 12" stroke="#a36d4b" strokeWidth="4" strokeLinecap="round"/>
        <path d="M63 43q12-10 17 3M61 59q15-8 20 3" stroke="#9c724f" strokeWidth="3" fill="none"/>
        <path d="M26 28l8-9M69 25l10 11" stroke="#f7d3a3" strokeWidth="3"/></>;
      break;
    case 'olives':
      art = <><path d="M27 79Q39 40 75 17" stroke="#94704d" strokeWidth="5" fill="none" strokeLinecap="round"/>
        {leaf(54,32,-25)}{leaf(70,49,75)}{leaf(35,52,-44)}{leaf(80,27,50)}
        <ellipse cx="47" cy="58" rx="10" ry="14" fill="#799554" stroke="#4b7049" strokeWidth="2" transform="rotate(28 47 58)"/>
        <ellipse cx="66" cy="63" rx="11" ry="15" fill="#4d7461" stroke="#385b4a" strokeWidth="2" transform="rotate(-23 66 63)"/>
        <ellipse cx="32" cy="71" rx="9" ry="13" fill="#8ca568" stroke="#55774e" strokeWidth="2"/>
        <ellipse cx="42" cy="51" rx="4" ry="2" fill="white" opacity=".45"/><ellipse cx="62" cy="55" rx="4" ry="2" fill="white" opacity=".36"/></>;
      break;
    case 'dagger':
      art = <><path d="M57 17Q81 40 56 67Q47 78 31 84Q34 62 47 53Q61 43 51 28Z" fill="url(#pearl)" stroke="#a48964" strokeWidth="2.5"/><path d="M51 23 42 12M43 24 36 14M40 10l18 8M31 31l27-5" stroke="#b38752" strokeWidth="7" strokeLinecap="round"/><path d="M41 35 60 56" stroke="#bb935b" strokeWidth="3"/></>;
      break;
    case 'towers':
    case 'spiral':
    case 'lighthouse':
      art = kind==='spiral'?<><path d="M26 79 43 14h13l17 65Z" fill="url(#sand)" stroke="#9e7951" strokeWidth="2"/>{[38,48,58,68].map((y,i)=><path key={y} d={'M'+(33-i*2)+' '+y+'Q48 '+(y+15)+' '+(63+i*2)+' '+(y-4)} fill="none" stroke="#a97c52" strokeWidth="5"/>)}</>:<>{[24,52].map((x,i)=><g key={x}><path d={'M'+x+' 76v-48q10-12 20 0v48Z'} fill="url(#sand)" stroke="#a47a56" strokeWidth="2.5"/><path d={'M'+(x-6)+' 31h32M'+(x-5)+' 45h30'} stroke="#66a19b" strokeWidth="6"/><ellipse cx={x+10} cy="24" rx="13" ry="7" fill="#76c5b5"/><path d={'M'+(x+10)+' 15v-8'} stroke="#b28a58" strokeWidth="3"/></g>)}</>;
      break;
    case 'oryx':
      art = <><path d="M42 35 30 5M55 35 65 5" stroke="#545248" strokeWidth="3" strokeLinecap="round"/><path d="M29 31Q18 40 31 53Q29 74 48 83Q67 74 65 53Q76 40 65 31L53 38l-6-6-6 6Z" fill="#f1e6d3" stroke="#a18d72" strokeWidth="2.3"/><path d="M29 48 12 35l6 22M65 48l18-13-6 22" fill="#e1cfb0" stroke="#9f896b" strokeWidth="2"/><circle cx="38" cy="54" r="3" fill="#293c36"/><circle cx="57" cy="54" r="3" fill="#293c36"/><path d="M43 66l5 3 5-3" stroke="#8b765d" strokeWidth="2" fill="none"/></>;
      break;
    case 'island':
      art = <><path d="M4 78q20-8 40 0t48 0" stroke="#46a0ad" strokeWidth="5" fill="none"/><path d="M14 65q37-35 71 0Z" fill="#efcf97"/><path d="M51 66Q65 43 62 26" stroke="#8a6945" strokeWidth="6" fill="none"/>{[-50,-15,18,51].map(i=><path key={i} d="M61 26q-24-22-37 2 18-7 37-2Z" transform={'rotate('+i+' 61 26)'} fill="#4f9c76"/>)}<circle cx="23" cy="26" r="9" fill="#e9ab53"/></>;
      break;
    case 'people':
      art = <>{[21,48,75].map((x,i)=><g key={x}><circle cx={x} cy={30+i%2*3} r="10" fill={['#d6ae87','#9e724c','#e7bf9e'][i]}/><path d={'M'+(x-16)+' 80V55q16-16 32 0v25Z'} fill={['#4b9a83','#d6a365','#7bafaa'][i]}/><path d={'M'+(x-10)+' 63h20'} stroke="#e7d7ae" strokeWidth="2"/></g>)}</>;
      break;
    case 'volcano':
      art = <><path d="M7 79 36 31h24l29 48Z" fill="url(#clay)" stroke="#956044" strokeWidth="2"/><path d="M36 31q12 8 24 0L51 50l-10-2Z" fill="#cb664e"/><path d="M42 33q-5-13 1-22M53 29q11-11 5-22" stroke="#dda18a" strokeWidth="5" fill="none" strokeLinecap="round"/><path d="M26 78 43 52 48 65 56 51 74 79Z" fill="#a86e53"/><circle cx="28" cy="29" r="4" fill="#eaa357"/></>;
      break;
    case 'turtle':
      art = <><ellipse cx="49" cy="52" rx="31" ry="23" fill="url(#green)" stroke="#38675a" strokeWidth="2"/><path d="M35 34 48 28l15 6 4 15-18 13-18-13Z" fill="#9dbc7e" stroke="#4d815f" strokeWidth="2"/><path d="M33 49l16 13 17-13" stroke="#456f59" strokeWidth="2" fill="none"/><circle cx="84" cy="47" r="12" fill="#9fc8a0"/><circle cx="89" cy="44" r="2.2" fill="#354b3b"/>{[[15,34],[17,72],[72,76]].map(([x,y],i)=><ellipse key={i} cx={x} cy={y} rx="12" ry="8" fill="#97b998" transform={'rotate('+(i*40-25)+' '+x+' '+y+')'}/>)}</>;
      break;
    case 'vanilla':
      art = <><path d="M19 77Q51 20 76 13M34 79Q55 25 70 15" stroke="#855e3f" strokeWidth="6" fill="none" strokeLinecap="round"/><path d="M51 38q-20-26-25-9Q31 52 51 38Z" fill="#68a66c"/><path d="M60 50q24-25 27-8-7 22-27 8Z" fill="#72a874"/>{[0,72,144,216,288].map(r=><ellipse key={r} cx="50" cy="19" rx="9" ry="18" fill="#f2d37f" transform={'rotate('+r+' 50 35)'}/>) }<circle cx="50" cy="35" r="9" fill="#d9aa4a"/></>;
      break;
    default:
      art = <><circle cx="48" cy="45" r="29" fill="url(#sand)"/><path d="M22 60 47 25l27 35Z" fill="#c89965" stroke="#906d4e" strokeWidth="2"/><path d="M25 76h49" stroke={p.teal} strokeWidth="6" strokeLinecap="round"/></>;
  }
  return <svg viewBox="0 0 96 96" fill="none" focusable="false" aria-hidden="true" className="h-full w-full overflow-visible">
    <defs>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffe4a3"/><stop offset=".52" stopColor="#e7ad56"/><stop offset="1" stopColor="#b87940"/></linearGradient>
      <linearGradient id="sand" x1="0" y1="0" x2=".9" y2="1"><stop stopColor="#f9e5b8"/><stop offset=".55" stopColor="#eec38b"/><stop offset="1" stopColor="#c08d5d"/></linearGradient>
      <linearGradient id="clay" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f1be87"/><stop offset=".55" stopColor="#cc8d5a"/><stop offset="1" stopColor="#a86d46"/></linearGradient>
      <linearGradient id="green" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#9ec3a5"/><stop offset=".45" stopColor="#5d9885"/><stop offset="1" stopColor="#2e675f"/></linearGradient>
      <linearGradient id="pearl" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffffff"/><stop offset=".48" stopColor="#fbf5e5"/><stop offset="1" stopColor="#c9d5ca"/></linearGradient>
      <linearGradient id="sea" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#91d8d4"/><stop offset="1" stopColor="#348d9a"/></linearGradient>
    </defs>
    <ellipse cx="48" cy="88" rx="29" ry="3.5" fill="#3e6352" opacity=".10"/>
    {art}
  </svg>;
};

export const DialectCulturePictogram: React.FC<Props> = ({ nameAr, nameEn, className = '' }) => {
  const kind = subjects[nameAr] || 'manuscript';
  return <span role="img" aria-label={nameAr || nameEn}
    className={'inline-flex h-[clamp(34px,5.6vh,63px)] w-[clamp(39px,6.2vh,69px)] shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-[1.06] ' + className}>
    <CulturalArt kind={kind} name={nameAr}/>
  </span>;
};
