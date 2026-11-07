export interface ElitePlayer { name: string; number: number; role: 'GK' | 'DF' | 'MF' | 'FW' }
export interface EliteClub {
  id: string; name: string; english: string; crest: string; crestUrl: string;
  primary: string; secondary: string; accent: string; players: ElitePlayer[];
}
const squad = (rows: [string,number,ElitePlayer['role']][]): ElitePlayer[] =>
  rows.map(([name,number,role])=>({name,number,role}));
export const ELITE_CLUBS: EliteClub[] = [
  {
    id:'madrid',name:'ريال مدريد',english:'Real Madrid',crest:'RM',crestUrl:'/assets/clubs/madrid.svg',
    primary:'#F5F3EC',secondary:'#182D5E',accent:'#D2B56C',
    players:squad([
      ['Courtois',1,'GK'],['Rüdiger',22,'DF'],['Huijsen',4,'DF'],['Trent',12,'DF'],
      ['Cucurella',17,'DF'],['Bellingham',5,'MF'],['Valverde',8,'MF'],
      ['Arda Güler',15,'MF'],['Vini Jr.',7,'FW'],['Mbappé',10,'FW'],['Endrick',9,'FW']
    ])
  },
  {
    id:'barcelona',name:'برشلونة',english:'FC Barcelona',crest:'FCB',crestUrl:'/assets/clubs/barcelona.svg',
    primary:'#A91338',secondary:'#183B8C',accent:'#D5B76B',
    players:squad([
      ['Joan García',1,'GK'],['João Cancelo',2,'DF'],['Cubarsí',5,'DF'],
      ['Koundé',23,'DF'],['Balde',3,'DF'],['Gavi',6,'MF'],['Pedri',8,'MF'],
      ['Dani Olmo',20,'MF'],['Lamine Yamal',10,'FW'],['Raphinha',11,'FW'],['Gabriel Jesus',9,'FW']
    ])
  },
  {
    id:'city',name:'مانشستر سيتي',english:'Manchester City',crest:'MCI',crestUrl:'/assets/clubs/city.svg',
    primary:'#76C6EC',secondary:'#F7F7F3',accent:'#D1EBF5',
    players:squad([
      ['Donnarumma',1,'GK'],['Rúben Dias',3,'DF'],['Gvardiol',24,'DF'],
      ['Guéhi',6,'DF'],['Aït-Nouri',21,'DF'],['Phil Foden',47,'MF'],
      ['Cherki',10,'MF'],['Enzo Fernández',17,'MF'],['Haaland',9,'FW'],
      ['Doku',11,'FW'],['Semenyo',42,'FW']
    ])
  },
  {
    id:'liverpool',name:'ليفربول',english:'Liverpool FC',crest:'LFC',crestUrl:'/assets/clubs/liverpool.svg',
    primary:'#BE1932',secondary:'#F4EEE5',accent:'#F1CC8D',
    players:squad([
      ['Alisson',1,'GK'],['Van Dijk',4,'DF'],['Kerkez',6,'DF'],['Frimpong',30,'DF'],
      ['Gravenberch',38,'MF'],['Wirtz',7,'MF'],['Szoboszlai',8,'MF'],
      ['Mac Allister',10,'MF'],['Isak',9,'FW'],['Gakpo',18,'FW'],['Ekitike',22,'FW']
    ])
  },
  {
    id:'psg',name:'باريس سان جيرمان',english:'Paris Saint-Germain',crest:'PSG',crestUrl:'/assets/clubs/psg.svg',
    primary:'#172E67',secondary:'#CF1737',accent:'#E8C47C',
    players:squad([
      ['Lucas Chevalier',30,'GK'],['Achraf Hakimi',2,'DF'],['Marquinhos',5,'DF'],
      ['Zabarnyi',6,'DF'],['Nuno Mendes',25,'DF'],['Vitinha',17,'MF'],
      ['João Neves',87,'MF'],['Fabián Ruiz',8,'MF'],['Dembélé',10,'FW'],
      ['Désiré Doué',14,'FW'],['Kvaratskhelia',7,'FW']
    ])
  },
  {
    id:'chelsea',name:'تشيلسي',english:'Chelsea FC',crest:'CFC',crestUrl:'/assets/clubs/chelsea.svg',
    primary:'#1851BD',secondary:'#F5F5FF',accent:'#D3AC54',
    players:squad([
      ['Robert Sánchez',1,'GK'],['Fofana',3,'DF'],['Colwill',6,'DF'],
      ['Reece James',24,'DF'],['Malo Gusto',27,'DF'],['Enzo Fernández',8,'MF'],
      ['Caicedo',25,'MF'],['Cole Palmer',10,'MF'],['Pedro Neto',7,'FW'],
      ['João Pedro',9,'FW'],['Estêvão',41,'FW']
    ])
  },
  {
    id:'arsenal',name:'أرسنال',english:'Arsenal FC',crest:'AFC',crestUrl:'/assets/clubs/arsenal.svg',
    primary:'#E62B38',secondary:'#F3EFE9',accent:'#D7B16E',
    players:squad([
      ['David Raya',1,'GK'],['William Saliba',2,'DF'],['Gabriel',6,'DF'],
      ['Timber',12,'DF'],['Ben White',4,'DF'],['Ødegaard',8,'MF'],
      ['Declan Rice',41,'MF'],['Zubimendi',36,'MF'],['Saka',7,'FW'],
      ['Gyökeres',14,'FW'],['Madueke',20,'FW']
    ])
  },
  {
    id:'juventus',name:'يوفنتوس',english:'Juventus FC',crest:'JUV',crestUrl:'/assets/clubs/juventus.svg',
    primary:'#F2F2F2',secondary:'#15171C',accent:'#C9A869',
    players:squad([
      ['Guglielmo Vicario',25,'GK'],['Bremer',3,'DF'],['Gatti',4,'DF'],
      ['Zeki Çelik',2,'DF'],['Lloyd Kelly',6,'DF'],['Khéphren Thuram',19,'MF'],
      ['McKennie',22,'MF'],['Pape Sarr',29,'MF'],['Kenan Yildiz',10,'FW'],
      ['Francisco Conceição',7,'FW'],['Kolo Muani',9,'FW']
    ])
  },
  {
    id:'bayern',name:'بايرن ميونخ',english:'FC Bayern München',crest:'FCB',crestUrl:'/assets/clubs/bayern.svg',
    primary:'#D9202E',secondary:'#F5EDEB',accent:'#D7B875',
    players:squad([
      ['Manuel Neuer',1,'GK'],['Upamecano',2,'DF'],['Kim Min-jae',3,'DF'],
      ['Jonathan Tah',4,'DF'],['Alphonso Davies',19,'DF'],['Kimmich',6,'MF'],
      ['Musiala',10,'MF'],['Pavlović',45,'MF'],['Harry Kane',9,'FW'],
      ['Luis Díaz',14,'FW'],['Michael Olise',17,'FW']
    ])
  },
  {
    id:'united',name:'مانشستر يونايتد',english:'Manchester United',crest:'MU',crestUrl:'/assets/clubs/united.svg',
    primary:'#E22B33',secondary:'#17181D',accent:'#E9BC52',
    players:squad([
      ['Senne Lammens',1,'GK'],['Diogo Dalot',2,'DF'],['De Ligt',4,'DF'],
      ['Lisandro Martínez',6,'DF'],['Leny Yoro',15,'DF'],['Bruno Fernandes',8,'MF'],
      ['Tielemans',18,'MF'],['Andrey Santos',17,'MF'],['Matheus Cunha',10,'FW'],
      ['Bryan Mbeumo',19,'FW'],['Benjamin Šeško',30,'FW']
    ])
  },
];
// Season 2026/27 number selections, sampled from official club pages and Premier League.
// Reference roster for the first playable prototype, not a current starting-XI claim.
// Authentic club crests are displayed for identification only. Their trademarks belong to the clubs.
// Character likenesses, sponsors and official kits remain outside this preview.
export function chooseOpponent(teamId:string, previousId?:string):EliteClub {
  const candidates = ELITE_CLUBS.filter(team=>team.id!==teamId && team.id!==previousId);
  const pool = candidates.length ? candidates : ELITE_CLUBS.filter(team=>team.id!==teamId);
  return pool[Math.floor(Math.random()*pool.length)];
}
export function chooseNextShooter(club:EliteClub, ordered:ElitePlayer[], index:number):ElitePlayer {
  if(index < ordered.length) return ordered[index];
  // In sudden death, nobody gets a second turn before other eligible players.
  const used = new Set(ordered.map(p=>p.number));
  const remaining = club.players.filter(p=>!used.has(p.number));
  return remaining[(index-ordered.length)%Math.max(remaining.length,1)] || ordered[index%ordered.length];
}
