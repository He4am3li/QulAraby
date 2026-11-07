// Bilingual narrative support and a final corroborating clue for each case.
// Beginner descriptors were checked against the supplied suspect portraits.
export interface DetectiveNarrative {
  titleEn: string;
  descriptionEn: string;
  finalEvidenceAr: string;
  finalEvidenceEn: string;
  cluesEn: string[];
}
export const DETECTIVE_NARRATIVES: Record<number, DetectiveNarrative> = {
  "1": {
    "titleEn": "The Stolen Painting",
    "descriptionEn": "A rare painting disappeared after the gallery closed. Six people were seen nearby.",
    "finalEvidenceAr": "بقية المشتبه بهم لديهم دليل براءة. بقي شخص واحد يحتاج إلى التحقيق.",
    "finalEvidenceEn": "The other suspects have alibis. Only one person still needs investigation.",
    "cluesEn": [
      "The investigation cleared all women in the gallery.",
      "Kamal was in security checking recordings; he is innocent.",
      "Tamer was at the café; he is innocent."
    ]
  },
  "2": {
    "titleEn": "The Blue Diamond",
    "descriptionEn": "The blue diamond disappeared from its glass case at 10:30 p.m.",
    "finalEvidenceAr": "بقية المشتبه بهم لديهم دليل براءة. بقي شخص واحد يحتاج إلى التحقيق.",
    "finalEvidenceEn": "The other suspects have alibis. Only one person still needs investigation.",
    "cluesEn": [
      "The museum guards cleared all men in the hall.",
      "Laura was on a verified phone call at reception; she is innocent.",
      "Jana was at the gift shop; she is innocent."
    ]
  },
  "3": {
    "titleEn": "The Silent Clock",
    "descriptionEn": "The rare silent clock disappeared from the workshop at midnight.",
    "finalEvidenceAr": "بقية المشتبه بهم لديهم دليل براءة. بقي شخص واحد يحتاج إلى التحقيق.",
    "finalEvidenceEn": "The other suspects have alibis. Only one person still needs investigation.",
    "cluesEn": [
      "The entry records cleared all women.",
      "Hani was receiving a delivery in the storeroom; he is innocent.",
      "Fahd was signing in at the gate; he is innocent."
    ]
  },
  "4": {
    "titleEn": "The Lighthouse Cipher",
    "descriptionEn": "The lighthouse signal stopped for seven minutes. A secret code disappeared.",
    "finalEvidenceAr": "بقية المشتبه بهم لديهم دليل براءة. بقي شخص واحد يحتاج إلى التحقيق.",
    "finalEvidenceEn": "The other suspects have alibis. Only one person still needs investigation.",
    "cluesEn": [
      "The watchtower cleared all men on the dock.",
      "Khadija was checking the boat engine with the captain; she is innocent.",
      "Ruqayya was logging weather readings; she is innocent."
    ]
  },
  "5": {
    "titleEn": "The Station Briefcase",
    "descriptionEn": "A briefcase full of documents disappeared from platform seven.",
    "finalEvidenceAr": "بقية المشتبه بهم لديهم دليل براءة. بقي شخص واحد يحتاج إلى التحقيق.",
    "finalEvidenceEn": "The other suspects have alibis. Only one person still needs investigation.",
    "cluesEn": [
      "The station cameras cleared all women travelers.",
      "Mansour was buying a ticket; he is innocent.",
      "Mazen was in the luggage car with the workers; he is innocent."
    ]
  },
  "6": {
    "titleEn": "The Missing Manuscript",
    "descriptionEn": "A rare historical manuscript disappeared from the locked archive.",
    "finalEvidenceAr": "بقية المشتبه بهم لديهم دليل براءة. بقي شخص واحد يحتاج إلى التحقيق.",
    "finalEvidenceEn": "The other suspects have alibis. Only one person still needs investigation.",
    "cluesEn": [
      "The archive fingerprints cleared all men.",
      "Mona was giving a public presentation; she is innocent."
    ]
  },
  "101": {
    "titleEn": "The Missing Key",
    "descriptionEn": "A key disappeared from the office. A box was near the door, and six people were in the room.",
    "finalEvidenceAr": "رأى الحارس شخصًا يرتدي زيَّ الأمن الأسود قرب الصندوق.",
    "finalEvidenceEn": "The guard saw someone in a black security uniform near the box.",
    "cluesEn": [
      "A photograph shows Rami, Suad and Jana with the guard by the door. They are innocent.",
      "Huda was in another room with the manager. She is innocent.",
      "Sami was by the desk with the police officer. He is innocent."
    ]
  },
  "102": {
    "titleEn": "The Missing Hat",
    "descriptionEn": "The red hat disappeared from the hall. Six people were near the door.",
    "finalEvidenceAr": "رأت الكاميرا شخصًا يرتدي سترة رمادية قرب القبعة.",
    "finalEvidenceEn": "The camera saw someone wearing a grey hoodie near the hat.",
    "cluesEn": [
      "Rana carried a bag outside with the guard. She is innocent.",
      "Nawal, Yazan and Maryam were by the window with the teacher. They are innocent.",
      "Kamal was by the door with the police officer. He is innocent."
    ]
  },
  "103": {
    "titleEn": "The Missing Book",
    "descriptionEn": "The red book disappeared from the library. It was on the shelf by a table, with six people nearby.",
    "finalEvidenceAr": "رأت الكاميرا امرأةً بشعر فضي وقلادة حمراء قرب الرف.",
    "finalEvidenceEn": "The camera saw a woman with silver hair and a red necklace by the shelf.",
    "cluesEn": [
      "Yousef was sitting at the table with the guard. He is innocent.",
      "Lina was by the door with the teacher. She is innocent.",
      "Ibrahim, Salma and Jaber were in a reading lesson with the teacher. They are innocent."
    ]
  },
  "104": {
    "titleEn": "The Missing Glasses",
    "descriptionEn": "Golden glasses disappeared from the shop. They were on a table by a clock.",
    "finalEvidenceAr": "رأى الحارس شخصًا يرتدي نظارة وبدلة زرقاء قرب الطاولة.",
    "finalEvidenceEn": "The guard saw someone wearing glasses and a blue suit by the table.",
    "cluesEn": [
      "Layla, Abeer and Carmen left through the door before the glasses disappeared. They are innocent.",
      "Tareq was in the shop office with the employee. He is innocent.",
      "Shatha was by the clock with the manager. She is innocent."
    ]
  },
  "105": {
    "titleEn": "The Missing Ball",
    "descriptionEn": "A yellow ball disappeared from the club, near the court and a bag.",
    "finalEvidenceAr": "رأى المدرب شخصًا يرتدي قبعة صوفية حمراء قرب الحقيبة.",
    "finalEvidenceEn": "The coach saw someone wearing a red wool hat near the bag.",
    "cluesEn": [
      "Rafeef was on the court with the team. She is innocent.",
      "Mazen, Ruqayya and Khadija were by the door with the coach. They are innocent.",
      "Mansour had another bag with the guard. He is innocent."
    ]
  },
  "106": {
    "titleEn": "The Missing Pen",
    "descriptionEn": "A silver pen disappeared from the room. It was on the desk by a book.",
    "finalEvidenceAr": "رأت الكاميرا امرأةً ترتدي فستانًا أسود قرب المكتب.",
    "finalEvidenceEn": "The camera saw a woman wearing a black dress near the desk.",
    "cluesEn": [
      "Abeer was reading a book with the teacher. She is innocent.",
      "Mazen carried a bag with the teacher. He is innocent.",
      "Rami, Nawal and Fahd were in the corridor with the guard. They are innocent."
    ]
  },
  "107": {
    "titleEn": "The Golden Key",
    "descriptionEn": "A golden key disappeared from the hotel, near a room door.",
    "finalEvidenceAr": "رأى المدير امرأةً ترتدي نظارة مستديرة وملابس حمراء قرب الغرفة.",
    "finalEvidenceEn": "The manager saw a woman wearing round glasses and red clothes by the room.",
    "cluesEn": [
      "Suad, Yazan and Kamal were at reception with the manager. They are innocent.",
      "Maryam was in the room with the worker. She is innocent.",
      "Mansour was with the guard by the door. He is innocent."
    ]
  },
  "108": {
    "titleEn": "The Missing Watch",
    "descriptionEn": "A silver watch disappeared from the station. It was near a seat in front of the train.",
    "finalEvidenceAr": "رأى الشرطي رجلًا مسنًا يرتدي نظارة وبدلة بنية قرب المقعد.",
    "finalEvidenceEn": "The officer saw an older man wearing glasses and a brown suit near the seat.",
    "cluesEn": [
      "Yousef was on the train with the driver. He is innocent.",
      "Jana, Tamer and Salma were at the station door with the police officer. They are innocent.",
      "Khadija was on a seat with the teacher. She is innocent."
    ]
  },
  "109": {
    "titleEn": "The Missing Flower",
    "descriptionEn": "A red flower disappeared from the garden, near the fountain and bench.",
    "finalEvidenceAr": "رأى البستاني رجلًا بلحية سوداء ومعطف بني قرب النافورة.",
    "finalEvidenceEn": "The gardener saw a man with a black beard and a brown coat by the fountain.",
    "cluesEn": [
      "Rafeef was sitting on the bench with the gardener. She is innocent.",
      "Hani was taking pictures of the fountain with the photographer. He is innocent.",
      "Layla, Carmen and Shatha were at the garden gate with the guard. They are innocent."
    ]
  },
  "110": {
    "titleEn": "The Small Bag",
    "descriptionEn": "A blue bag disappeared from the center. It was on a chair by a table.",
    "finalEvidenceAr": "رأى الحارس امرأةً بشعر بني مربوط إلى الأعلى قرب الطاولة.",
    "finalEvidenceEn": "The guard saw a woman with brown hair tied up near the table.",
    "cluesEn": [
      "Sami, Noor and Anas were by the door with the guard. They are innocent.",
      "Khadija was sitting on a chair with the teacher. She is innocent.",
      "Mazen was by the table with the officer. He is innocent."
    ]
  },
  "201": {
    "titleEn": "Ciphered Archive",
    "descriptionEn": "At 11:47, the archive opened without force and the codebook vanished. Strange messages and traces appeared by the vault.",
    "finalEvidenceAr": "سجل بطاقة نديم، وكذلك سجل طباعة الرسائل من حسابه. هذان دليلان مستقلان على مسؤولية نديم.",
    "finalEvidenceEn": "Nadim's access-card log, together with Messages printed from his account. These are two independent pieces of evidence implicating نديم.",
    "cluesEn": [
      "The Entrance camera confirms that سعاد, جنى were in the courtyard during the incident, clearing them from this crime.",
      "The Meeting register confirms that لورا, عادل, نوال were in the lecture hall during the incident, clearing them from this crime.",
      "The Guard report confirms that يزن, مريم were in the south gate during the incident, clearing them from this crime.",
      "The Elevator log confirms that كمال, رامي were in the ground floor during the incident, clearing them from this crime."
    ],
    "accusationProofs": [
      {
        "questionAr": "ما الدليل الأول الذي يربط نديم بالجريمة؟",
        "questionEn": "What is the first piece of evidence against نديم?",
        "choicesAr": [
          "لون المصباح",
          "دفتر الضيافة",
          "سجل بطاقة نديم"
        ],
        "choicesEn": [
          "Lamp colour",
          "Guest book",
          "Nadim's access-card log"
        ],
        "correctIndex": 2
      },
      {
        "questionAr": "أي دليل مستقل يدعم هذا الاتهام؟",
        "questionEn": "Which independent evidence corroborates the accusation?",
        "choicesAr": [
          "سجل طباعة الرسائل من حسابه",
          "تقرير المطر",
          "جدول النظافة"
        ],
        "choicesEn": [
          "Messages printed from his account",
          "Rain report",
          "Cleaning schedule"
        ],
        "correctIndex": 0
      }
    ]
  },
  "202": {
    "titleEn": "The Double Alibi",
    "descriptionEn": "An original painting was swapped for a replica in eight minutes. Two statements differed because a camera clock was late.",
    "finalEvidenceAr": "فارق توقيت الكاميرتين، وكذلك سجل بطاقة راهول لفتح المخزن. هذان دليلان مستقلان على مسؤولية راهول.",
    "finalEvidenceEn": "Camera time discrepancy, together with Rahul's storage access log. These are two independent pieces of evidence implicating راهول.",
    "cluesEn": [
      "The Hall camera confirms that كمال, إبراهيم were in the east corridor during the incident, clearing them from this crime.",
      "The Lighting log confirms that سلمى, جابر, لينا were in the equipment room during the incident, clearing them from this crime.",
      "The Entry tickets confirms that منى, يوسف were in the theatre during the incident, clearing them from this crime.",
      "The Exit register confirms that تامر, رنا were in the gate during the incident, clearing them from this crime."
    ],
    "accusationProofs": [
      {
        "questionAr": "ما الدليل الأول الذي يربط راهول بالجريمة؟",
        "questionEn": "What is the first piece of evidence against راهول?",
        "choicesAr": [
          "فارق توقيت الكاميرتين",
          "لون المصباح",
          "دفتر الضيافة"
        ],
        "choicesEn": [
          "Camera time discrepancy",
          "Lamp colour",
          "Guest book"
        ],
        "correctIndex": 0
      },
      {
        "questionAr": "أي دليل مستقل يدعم هذا الاتهام؟",
        "questionEn": "Which independent evidence corroborates the accusation?",
        "choicesAr": [
          "تقرير المطر",
          "سجل بطاقة راهول لفتح المخزن",
          "جدول النظافة"
        ],
        "choicesEn": [
          "Rain report",
          "Rahul's storage access log",
          "Cleaning schedule"
        ],
        "correctIndex": 1
      }
    ]
  },
  "203": {
    "titleEn": "The Clockmaker Paradox",
    "descriptionEn": "Ten clocks stopped minutes apart in the workshop and a rare watch vanished. Their hands contradicted the maintenance records.",
    "finalEvidenceAr": "تعديل كين للساعة المرجعية، وكذلك بطاقة كين في سجل الخزانة. هذان دليلان مستقلان على مسؤولية كين.",
    "finalEvidenceEn": "Ken's reference-clock adjustment, together with Ken's card recorded at the display case. These are two independent pieces of evidence implicating كين.",
    "cluesEn": [
      "The Customer register confirms that طارق, كارمن, هاني were in the showroom during the incident, clearing them from this crime.",
      "The Workshop camera confirms that شذى, رفيف, رؤوف were in the parts store during the incident, clearing them from this crime.",
      "The Delivery log confirms that منصور, خديجة, ليلى were in the delivery entrance during the incident, clearing them from this crime.",
      "The Technician statement confirms that فهد, عبير were in the machine room during the incident, clearing them from this crime."
    ],
    "accusationProofs": [
      {
        "questionAr": "ما الدليل الأول الذي يربط كين بالجريمة؟",
        "questionEn": "What is the first piece of evidence against كين?",
        "choicesAr": [
          "لون المصباح",
          "تعديل كين للساعة المرجعية",
          "دفتر الضيافة"
        ],
        "choicesEn": [
          "Lamp colour",
          "Ken's reference-clock adjustment",
          "Guest book"
        ],
        "correctIndex": 1
      },
      {
        "questionAr": "أي دليل مستقل يدعم هذا الاتهام؟",
        "questionEn": "Which independent evidence corroborates the accusation?",
        "choicesAr": [
          "تقرير المطر",
          "جدول النظافة",
          "بطاقة كين في سجل الخزانة"
        ],
        "choicesEn": [
          "Rain report",
          "Cleaning schedule",
          "Ken's card recorded at the display case"
        ],
        "correctIndex": 2
      }
    ]
  },
  "204": {
    "titleEn": "The Vault Without a Key",
    "descriptionEn": "A vault opened with no key recorded, and a small crown disappeared. Dust traces conflicted with the entry log.",
    "finalEvidenceAr": "قارئ بصمة مريم، وكذلك سجل وجود مريم بالممر الداخلي. هذان دليلان مستقلان على مسؤولية مريم.",
    "finalEvidenceEn": "Maryam's fingerprint reader entry, together with Maryam in the inner-corridor log. These are two independent pieces of evidence implicating مريم.",
    "cluesEn": [
      "The Reception camera confirms that منى, مازن were in the lobby during the incident, clearing them from this crime.",
      "The Laboratory log confirms that رقية, أنس, خديجة were in the analysis room during the incident, clearing them from this crime.",
      "The Guard log confirms that إبراهيم, هدى were in the courtyard during the incident, clearing them from this crime.",
      "The Exhibition log confirms that جابر, راهول were in the gallery during the incident, clearing them from this crime."
    ],
    "accusationProofs": [
      {
        "questionAr": "ما الدليل الأول الذي يربط مريم بالجريمة؟",
        "questionEn": "What is the first piece of evidence against مريم?",
        "choicesAr": [
          "لون المصباح",
          "دفتر الضيافة",
          "قارئ بصمة مريم"
        ],
        "choicesEn": [
          "Lamp colour",
          "Guest book",
          "Maryam's fingerprint reader entry"
        ],
        "correctIndex": 2
      },
      {
        "questionAr": "أي دليل مستقل يدعم هذا الاتهام؟",
        "questionEn": "Which independent evidence corroborates the accusation?",
        "choicesAr": [
          "سجل وجود مريم بالممر الداخلي",
          "تقرير المطر",
          "جدول النظافة"
        ],
        "choicesEn": [
          "Maryam in the inner-corridor log",
          "Rain report",
          "Cleaning schedule"
        ],
        "correctIndex": 0
      }
    ]
  },
  "205": {
    "titleEn": "The Last Lighthouse Signal",
    "descriptionEn": "The lighthouse transmitted a code before going dark for seven minutes. The radio frequency vanished from the log.",
    "finalEvidenceAr": "حساب طارق بسجل الإرسال، وكذلك رقم التردد في دفتر طارق. هذان دليلان مستقلان على مسؤولية طارق.",
    "finalEvidenceEn": "Tareq's transmitter account, together with Matching frequency in Tareq's notebook. These are two independent pieces of evidence implicating طارق.",
    "cluesEn": [
      "The Boat manifest confirms that منصور, ليلى were in the pier during the incident, clearing them from this crime.",
      "The Harbour camera confirms that كارمن, هاني, مازن were in the harbour office during the incident, clearing them from this crime.",
      "The Weather report confirms that رقية, أنس were in the weather room during the incident, clearing them from this crime.",
      "The Guard register confirms that خديجة, رفيف were in the sea gate during the incident, clearing them from this crime."
    ],
    "accusationProofs": [
      {
        "questionAr": "ما الدليل الأول الذي يربط طارق بالجريمة؟",
        "questionEn": "What is the first piece of evidence against طارق?",
        "choicesAr": [
          "حساب طارق بسجل الإرسال",
          "لون المصباح",
          "دفتر الضيافة"
        ],
        "choicesEn": [
          "Tareq's transmitter account",
          "Lamp colour",
          "Guest book"
        ],
        "correctIndex": 0
      },
      {
        "questionAr": "أي دليل مستقل يدعم هذا الاتهام؟",
        "questionEn": "Which independent evidence corroborates the accusation?",
        "choicesAr": [
          "تقرير المطر",
          "رقم التردد في دفتر طارق",
          "جدول النظافة"
        ],
        "choicesEn": [
          "Rain report",
          "Matching frequency in Tareq's notebook",
          "Cleaning schedule"
        ],
        "correctIndex": 1
      }
    ]
  },
  "206": {
    "titleEn": "The Silent Observatory",
    "descriptionEn": "The observatory went offline for nine minutes and a star map vanished. Boot prints were found by the dome.",
    "finalEvidenceAr": "رمز هارون في جهاز الإنذار، وكذلك صورة الكاميرا الحرارية لهارون. هذان دليلان مستقلان على مسؤولية هارون.",
    "finalEvidenceEn": "Haroun's alarm-controller access code, together with Thermal-camera image of Haroun. These are two independent pieces of evidence implicating هارون.",
    "cluesEn": [
      "The Telescope log confirms that عادل, ليلى, هاني were in the observatory hall during the incident, clearing them from this crime.",
      "The Yard camera confirms that كارمن, يوسف, رامي were in the courtyard during the incident, clearing them from this crime.",
      "The Researchers' register confirms that سعاد, نديم, جنى were in the optics laboratory during the incident, clearing them from this crime.",
      "The Emergency log confirms that جنان, لورا were in the medical centre during the incident, clearing them from this crime."
    ],
    "accusationProofs": [
      {
        "questionAr": "ما الدليل الأول الذي يربط هارون بالجريمة؟",
        "questionEn": "What is the first piece of evidence against هارون?",
        "choicesAr": [
          "لون المصباح",
          "رمز هارون في جهاز الإنذار",
          "دفتر الضيافة"
        ],
        "choicesEn": [
          "Lamp colour",
          "Haroun's alarm-controller access code",
          "Guest book"
        ],
        "correctIndex": 1
      },
      {
        "questionAr": "أي دليل مستقل يدعم هذا الاتهام؟",
        "questionEn": "Which independent evidence corroborates the accusation?",
        "choicesAr": [
          "تقرير المطر",
          "جدول النظافة",
          "صورة الكاميرا الحرارية لهارون"
        ],
        "choicesEn": [
          "Rain report",
          "Cleaning schedule",
          "Thermal-camera image of Haroun"
        ],
        "correctIndex": 2
      }
    ]
  },
  "207": {
    "titleEn": "The Poisoned Feast",
    "descriptionEn": "After a banquet, a guest collapsed and the drinking cup disappeared. Powder traces were found and staff statements conflicted.",
    "finalEvidenceAr": "كاميرا المائدة تُظهر سليم ينقل الكأس، وكذلك سجل سليم لفتح خزانة التقديم. هذان دليلان مستقلان على مسؤولية سليم.",
    "finalEvidenceEn": "Dining-camera footage of Salim moving the cup, together with Salim's serving-cabinet access log. These are two independent pieces of evidence implicating سليم.",
    "cluesEn": [
      "The Hall camera confirms that رنا, طارق, منى were in the guest room during the incident, clearing them from this crime.",
      "The Guest register confirms that نوال, يزن, مريم were in the garden during the incident, clearing them from this crime.",
      "The Staff register confirms that كمال, إبراهيم were in the outer kitchen during the incident, clearing them from this crime.",
      "The Service footage confirms that سلمى, جابر were in the dish room during the incident, clearing them from this crime."
    ],
    "accusationProofs": [
      {
        "questionAr": "ما الدليل الأول الذي يربط سليم بالجريمة؟",
        "questionEn": "What is the first piece of evidence against سليم?",
        "choicesAr": [
          "لون المصباح",
          "دفتر الضيافة",
          "كاميرا المائدة تُظهر سليم ينقل الكأس"
        ],
        "choicesEn": [
          "Lamp colour",
          "Guest book",
          "Dining-camera footage of Salim moving the cup"
        ],
        "correctIndex": 2
      },
      {
        "questionAr": "أي دليل مستقل يدعم هذا الاتهام؟",
        "questionEn": "Which independent evidence corroborates the accusation?",
        "choicesAr": [
          "سجل سليم لفتح خزانة التقديم",
          "تقرير المطر",
          "جدول النظافة"
        ],
        "choicesEn": [
          "Salim's serving-cabinet access log",
          "Rain report",
          "Cleaning schedule"
        ],
        "correctIndex": 0
      }
    ]
  },
  "208": {
    "titleEn": "The Letter That Stayed Dry",
    "descriptionEn": "A secret letter was found in a flooded room, yet it remained dry. The red seal was missing and a print marked the envelope.",
    "finalEvidenceAr": "سجل استخدام ختم كارمن، وكذلك الظرف الجاف في درج كارمن. هذان دليلان مستقلان على مسؤولية كارمن.",
    "finalEvidenceEn": "Carmen's seal-use log, together with Dry envelope found in Carmen's drawer. These are two independent pieces of evidence implicating كارمن.",
    "cluesEn": [
      "The Street camera confirms that خديجة, رفيف, فهد were in the gate during the incident, clearing them from this crime.",
      "The Mail register confirms that عبير, هدى, راهول were in the mail lobby during the incident, clearing them from this crime.",
      "The Maintenance log confirms that منى, منصور were in the pump room during the incident, clearing them from this crime.",
      "The Staff statement confirms that رقية, أنس were in the upper floor during the incident, clearing them from this crime."
    ],
    "accusationProofs": [
      {
        "questionAr": "ما الدليل الأول الذي يربط كارمن بالجريمة؟",
        "questionEn": "What is the first piece of evidence against كارمن?",
        "choicesAr": [
          "سجل استخدام ختم كارمن",
          "لون المصباح",
          "دفتر الضيافة"
        ],
        "choicesEn": [
          "Carmen's seal-use log",
          "Lamp colour",
          "Guest book"
        ],
        "correctIndex": 0
      },
      {
        "questionAr": "أي دليل مستقل يدعم هذا الاتهام؟",
        "questionEn": "Which independent evidence corroborates the accusation?",
        "choicesAr": [
          "تقرير المطر",
          "الظرف الجاف في درج كارمن",
          "جدول النظافة"
        ],
        "choicesEn": [
          "Rain report",
          "Dry envelope found in Carmen's drawer",
          "Cleaning schedule"
        ],
        "correctIndex": 1
      }
    ]
  },
  "209": {
    "titleEn": "The Double-Masked Thief",
    "descriptionEn": "An antique mask vanished during a scene change without the door opening. A person appeared twice in the mirror and a black thread was found.",
    "finalEvidenceAr": "انعكاس شارة هاني في المرآة، وكذلك بطاقة هاني بسجل خزانة الأزياء. هذان دليلان مستقلان على مسؤولية هاني.",
    "finalEvidenceEn": "Hani's badge reflected in the mirror, together with Hani's costume-locker card log. These are two independent pieces of evidence implicating هاني.",
    "cluesEn": [
      "The Entrance camera confirms that كارمن, لينا were in the lobby during the incident, clearing them from this crime.",
      "The Costume register confirms that تامر, كمال, شذى were in the costume store during the incident, clearing them from this crime.",
      "The Show roster confirms that رفيف, ليلى were in the audience stage during the incident, clearing them from this crime.",
      "The Guard register confirms that طارق, نوال were in the west corridor during the incident, clearing them from this crime."
    ],
    "accusationProofs": [
      {
        "questionAr": "ما الدليل الأول الذي يربط هاني بالجريمة؟",
        "questionEn": "What is the first piece of evidence against هاني?",
        "choicesAr": [
          "لون المصباح",
          "انعكاس شارة هاني في المرآة",
          "دفتر الضيافة"
        ],
        "choicesEn": [
          "Lamp colour",
          "Hani's badge reflected in the mirror",
          "Guest book"
        ],
        "correctIndex": 1
      },
      {
        "questionAr": "أي دليل مستقل يدعم هذا الاتهام؟",
        "questionEn": "Which independent evidence corroborates the accusation?",
        "choicesAr": [
          "تقرير المطر",
          "جدول النظافة",
          "بطاقة هاني بسجل خزانة الأزياء"
        ],
        "choicesEn": [
          "Rain report",
          "Cleaning schedule",
          "Hani's costume-locker card log"
        ],
        "correctIndex": 2
      }
    ]
  },
  "210": {
    "titleEn": "The Frozen Compass",
    "descriptionEn": "An antique compass disappeared from a frozen research station. Different footprints crossed the snow and the radio fell silent.",
    "finalEvidenceAr": "آثار حذاء منصور قرب النافذة، وكذلك سجل بطاقة منصور ببوابة الجليد. هذان دليلان مستقلان على مسؤولية منصور.",
    "finalEvidenceEn": "Mansour's matching boot prints, together with Mansour's ice-gate access card log. These are two independent pieces of evidence implicating منصور.",
    "cluesEn": [
      "The Vehicle register confirms that رقية, أنس were in the vehicle bay during the incident, clearing them from this crime.",
      "The Storage camera confirms that خديجة, إبراهيم, سلمى were in the supply room during the incident, clearing them from this crime.",
      "The Weather report confirms that جابر, مريم were in the south platform during the incident, clearing them from this crime.",
      "The Researcher statement confirms that لورا, مازن were in the map room during the incident, clearing them from this crime."
    ],
    "accusationProofs": [
      {
        "questionAr": "ما الدليل الأول الذي يربط منصور بالجريمة؟",
        "questionEn": "What is the first piece of evidence against منصور?",
        "choicesAr": [
          "لون المصباح",
          "دفتر الضيافة",
          "آثار حذاء منصور قرب النافذة"
        ],
        "choicesEn": [
          "Lamp colour",
          "Guest book",
          "Mansour's matching boot prints"
        ],
        "correctIndex": 2
      },
      {
        "questionAr": "أي دليل مستقل يدعم هذا الاتهام؟",
        "questionEn": "Which independent evidence corroborates the accusation?",
        "choicesAr": [
          "سجل بطاقة منصور ببوابة الجليد",
          "تقرير المطر",
          "جدول النظافة"
        ],
        "choicesEn": [
          "Mansour's ice-gate access card log",
          "Rain report",
          "Cleaning schedule"
        ],
        "correctIndex": 0
      }
    ]
  }
};
