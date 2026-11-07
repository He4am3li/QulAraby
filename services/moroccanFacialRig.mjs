import { paintSpeechMouth } from './speechMouth.mjs';
export { resolveTutorAttention as resolveMoroccanAttention } from './tutorAttention.mjs';
export const MOROCCAN_MANIFEST_URLS = Object.freeze({ yassine: '/avatars/yassine-facial-v1.json', kenza: '/avatars/kenza-facial-v1.json' });
export const MOROCCAN_SOURCE_URLS = Object.freeze({ yassine: '/avatars/yassine-stance-v1.webp', kenza: '/avatars/kenza-stance-v1.webp' });
const REQUIRED = ['Eyes_Left','Eyes_Right','Eyes_Closed','Brows_Attentive','Brows_Thinking', ...['Closed','A','E','O','FV','Smile'].map(x=>'Mouth_'+x)];
export function validateMoroccanManifest(value, actor) {
  if (!['yassine','kenza'].includes(actor) || !value || value.version !== 1 || value.status !== 'reviewed' ||
      value.characterId !== (actor === 'yassine' ? 'morocco_male' : 'morocco_female') || value.width !== 1024 || value.height !== 1536 ||
      value.source !== MOROCCAN_SOURCE_URLS[actor] || !value.layers || REQUIRED.some(key=>!value.layers[key]) || !Array.isArray(value.coverings)) return null;
  const path = new RegExp('^/avatars/'+actor+'-stance-v1/[A-Za-z0-9_-]+\\.png$');
  for (const layer of Object.values(value.layers)) {
    if (!layer || ![layer.x,layer.y,layer.w,layer.h].every(Number.isInteger) || layer.x<0 || layer.y<0 || layer.w<=0 || layer.h<=0 ||
        layer.x+layer.w>1024 || layer.y+layer.h>1536 || typeof layer.visible!=='boolean' || !path.test(layer.url)) return null;
  }
  const mouth = value.layers.Mouth_Closed;
  if (['A','E','O','FV'].some(key=>['x','y','w','h'].some(k=>value.layers['Mouth_'+key][k]!==mouth[k]))) return null;
  if (value.coverings.length!==0) return null;
  return value;
}
export function planMoroccanFrame(manifest, {state='idle',blink=0,gazeX=0,emphasis=0}={}) {
  const commands=[];
  const add=(name,alpha=1)=>commands.push({name,alpha});
  if (state==='thinking') add('Brows_Thinking');
  else if (['listening','correct','greeting','retry'].includes(state)) add('Brows_Attentive');
  else if (state==='speaking' && emphasis>0) add('Brows_Attentive',Math.min(1,emphasis*2));
  if (gazeX) add(gazeX<0?'Eyes_Left':'Eyes_Right');
  if (blink>0) add('Eyes_Closed',Math.min(1,blink));
  for(const name of manifest.coverings) add(name);
  return commands;
}
export function paintMoroccan(context, assets, options={}) {
  context.drawImage(assets.original,0,0,1024,1536);
  const commands=planMoroccanFrame(assets.manifest,options), covers=new Set(assets.manifest.coverings);
  const draw=({name,alpha=1})=>{const layer=assets.manifest.layers[name];context.save();context.globalAlpha=alpha;context.drawImage(assets.images[name],layer.x,layer.y,layer.w,layer.h);context.restore();};
  for(const cmd of commands) if(!covers.has(cmd.name)) draw(cmd);
  if(options.state==='speaking' && options.lips?.active && assets.mouth) paintSpeechMouth(context,assets.mouth,options.lips);
  else if(['listening','correct','greeting','retry'].includes(options.state)) draw({name:'Mouth_Smile'});
  for(const cmd of commands) if(covers.has(cmd.name)) draw(cmd);
  return commands;
}
