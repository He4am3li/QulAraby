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
    "titleEn": "The Secret Archive Letter",
    "descriptionEn": "A secret letter disappeared from the archive during a power outage. Investigators checked the corridor camera and reception log.",
    "finalEvidenceAr": "أثبتت الأدلة براءة خمسة أشخاص، وبقي فريد محل التحقيق. يجب تبرير الاتهام بالأدلة.",
    "finalEvidenceEn": "The evidence cleared five people. Farid remains under investigation. An accusation requires evidence.",
    "cluesEn": [
      "The corridor camera recorded Nada and Salma in the waiting hall. They are innocent.",
      "Official stamps proved that Captain Rayan and Saber did not enter the archive. They are innocent.",
      "The reception log confirms that Grandma Maryam remained at the information desk. She is innocent."
    ]
  },
  "202": {
    "titleEn": "The Golden Badge Mystery",
    "descriptionEn": "A golden badge disappeared from the registration room during a school trip. Investigators reviewed a gate photograph and the ticket log.",
    "finalEvidenceAr": "أكدت الصورة والسجلات براءة خمسة أشخاص. بقيت نور وحدها محل التحقيق.",
    "finalEvidenceEn": "The photograph and records clear five suspects. Noor remains under investigation.",
    "cluesEn": [
      "The gate photo shows Sami and Omar outside the building when the badge disappeared. They are innocent.",
      "The ticket log puts Henry and Fares on the bus. They are innocent.",
      "Miho was in the registration room with a staff member throughout the event. She is innocent."
    ]
  }
};
