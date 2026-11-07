export interface ElitePlayer { name: string; number: number; role: 'GK' | 'DF' | 'MF' | 'FW' }
export interface EliteClub {
  id: string; name: string; english: string; crest: string;
  primary: string; secondary: string; accent: string; players: ElitePlayer[];
}
const squad = (rows: [string,number,ElitePlayer['role']][]): ElitePlayer[] =>
  rows.map(([name,number,role])=>({name,number,role}));
export const ELITE_CLUBS: EliteClub[] = [
  {
    id:'madrid',name:'ريال مدريد',english:'Real Madrid',crest:'RM',
    primary:'#F5F3EC',secondary:'#182D5E',accent:'#D2B56C',
    players:squad([
      ['Courtois',1,'GK'],['Rüdiger',22,'DF'],['Huijsen',4,'DF'],['Trent',12,'DF'],
      ['Cucurella',17,'DF'],['Bellingham',5,'MF'],['Valverde',8,'MF'],
      ['Arda Güler',15,'MF'],['Vini Jr.',7,'FW'],['Mbappé',10,'FW'],['Endrick',9,'FW']
    ])
  },
  {
    id:'barcelona',name:'برشلونة',english:'FC Barcelona',crest:'FCB',
    primary:'#A91338',secondary:'#183B8C',accent:'#D5B76B',
    players:squad([
      ['Joan García',1,'GK'],['João Cancelo',2,'DF'],['Cubarsí',5,'DF'],
      ['Koundé',23,'DF'],['Balde',3,'DF'],['Gavi',6,'MF'],['Pedri',8,'MF'],
      ['Dani Olmo',20,'MF'],['Lamine Yamal',10,'FW'],['Raphinha',11,'FW'],['Gabriel Jesus',9,'FW']
    ])
  },
  {
    id:'city',name:'مانشستر سيتي',english:'Manchester City',crest:'MCI',
    primary:'#76C6EC',secondary:'#F7F7F3',accent:'#D1EBF5',
    players:squad([
      ['Donnarumma',1,'GK'],['Rúben Dias',3,'DF'],['Gvardiol',24,'DF'],
      ['Guéhi',6,'DF'],['Aït-Nouri',21,'DF'],['Phil Foden',47,'MF'],
      ['Cherki',10,'MF'],['Enzo Fernández',17,'MF'],['Haaland',9,'FW'],
      ['Doku',11,'FW'],['Semenyo',42,'FW']
    ])
  },
  {
    id:'liverpool',name:'ليفربول',english:'Liverpool FC',crest:'LFC',
    primary:'#BE1932',secondary:'#F4EEE5',accent:'#F1CC8D',
    players:squad([
      ['Alisson',1,'GK'],['Van Dijk',4,'DF'],['Kerkez',6,'DF'],['Frimpong',30,'DF'],
      ['Gravenberch',38,'MF'],['Wirtz',7,'MF'],['Szoboszlai',8,'MF'],
      ['Mac Allister',10,'MF'],['Isak',9,'FW'],['Gakpo',18,'FW'],['Ekitike',22,'FW']
    ])
  }
];
// Season 2026/27 number selections, sampled from official club pages and Premier League.
// Reference roster for the first playable prototype, not a current starting-XI claim.
// Official crests, likenesses, sponsor marks and licensed kits are intentionally absent.
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
