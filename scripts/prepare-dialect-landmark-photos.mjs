/**
 * Builds local, same-origin landmark photographs for the dialect gallery.
 * Sources are intentionally declared here for audit; runtime UI does not fetch
 * photos from Wikimedia or Pexels.
 * Each URL requests a small image already resized by its original provider.
 */
import { mkdir, writeFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const SOURCES = {
  "uae": "https://commons.wikimedia.org/wiki/Special:FilePath/Burj_Khalifa_Sunset.jpg?width=640",
  "egypt": "https://images.pexels.com/photos/15127306/pexels-photo-15127306/free-photo-of-pyramids-and-sphinx-statue-in-desert.jpeg?auto=compress&cs=tinysrgb&w=640",
  "jordan": "https://commons.wikimedia.org/wiki/Special:FilePath/Petra_treasury.jpg?width=640",
  "lebanon": "https://commons.wikimedia.org/wiki/Special:FilePath/Pigeon_Rocks_of_Beirut%2C_Rock_of_Raouche%2C_Beirut%2C_Lebanon.jpg?width=640",
  "algeria": "https://commons.wikimedia.org/wiki/Special:FilePath/Makam_chahid.jpg?width=640",
  "sudan": "https://commons.wikimedia.org/wiki/Special:FilePath/Mer%C3%B6e_Pyramids_with_camels_(35119058595).jpg?width=640",
  "oman": "https://commons.wikimedia.org/wiki/Special:FilePath/Wadi_Darbat.jpg?width=640",
  "kuwait": "https://commons.wikimedia.org/wiki/Special:FilePath/Kuwait_Towers_at_night_(4283818686).jpg?width=640",
  "qatar": "https://commons.wikimedia.org/wiki/Special:FilePath/Doha_-_towards_the_islamic_art_museum.jpg?width=640",
  "bahrain": "https://commons.wikimedia.org/wiki/Special:FilePath/Manama_Bahrain_Bay_06.jpg?width=640",
  "yemen": "https://commons.wikimedia.org/wiki/Special:FilePath/Old_City_Sana%27a_skyline.jpg?width=640",
  "mauritania": "https://commons.wikimedia.org/wiki/Special:FilePath/%D9%85%D8%B3%D8%AC%D8%AF_%D8%B4%D9%86%D9%82%D9%8A%D8%B7_%D8%A7%D9%84%D8%AA%D8%A7%D8%B1%D9%8A%D8%AE%D9%8A.jpg?width=640",
  "somalia": "https://commons.wikimedia.org/wiki/Special:FilePath/Lido_beach_from_the_sea_in_Mogadishu.jpg?width=640",
  "djibouti": "https://commons.wikimedia.org/wiki/Special:FilePath/Overlook_to_Lake_Asal_Crater.JPG?width=640",
  "comoros": "https://commons.wikimedia.org/wiki/Special:FilePath/Moroni_sunset_palm_trees.jpg?width=640"
};
const DIR = new URL('../public/images/dialects/local/', import.meta.url);
const RETRIES = 3;
const MAX_BYTES = 6_000_000;

await mkdir(DIR,{ recursive:true });
const items = Object.entries(SOURCES);
let cursor = 0;
const failures = [];
const completed = [];

async function save(id, url) {
  const filename = join(DIR.pathname, id + '.jpg');
  try { if ((await stat(filename)).size > 8192) { completed.push(id + ': cached'); return; } } catch {}
  for (let attempt=1;attempt<=RETRIES;attempt++) {
    try {
      const response = await fetch(url,{
        signal:AbortSignal.timeout(25000),
        headers:{'User-Agent':'QUL-educational-gallery/1.0','Accept':'image/jpeg,image/*;q=0.8'}
      });
      if (!response.ok) throw new Error('HTTP '+response.status);
      const ct=response.headers.get('content-type')||'';
      if (!ct.includes('image/jpeg')) throw new Error('Unexpected format: '+ct);
      const bytes=Buffer.from(await response.arrayBuffer());
      if (bytes.length < 8192 || bytes.length > MAX_BYTES || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
        throw new Error('Invalid JPEG bytes: '+bytes.length);
      }
      await writeFile(filename,bytes);
      completed.push(id + ': '+bytes.length + ' B');
      return;
    } catch(error) {
      if (attempt===RETRIES) failures.push(id+': '+String(error));
      else await new Promise(resolve=>setTimeout(resolve,350*attempt));
    }
  }
}
const workers=Array.from({length:5},async()=>{
  while(cursor<items.length) {
    const [id,url]=items[cursor++];
    await save(id,url);
  }
});
await Promise.all(workers);
console.log('Dialect landmark photos:',completed.length,'of',items.length);
if(failures.length){console.error('Missing images:',failures.join(' | '));process.exitCode=1;}
