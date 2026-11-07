/** Register generated Moroccan expression atlases to the reviewed full-body sources.
 * Usage: node scripts/register-moroccan-stance.cjs <yassine body> <yassine atlas> <kenza body> <kenza atlas>
 * Raster artwork is AI-authored. This script only registers/crops/feathers it.
 */
const sharp=require('sharp'),fs=require('node:fs/promises'),crypto=require('node:crypto');
const root='public/avatars';
const configs={
 yassine:{shift:0,scale:.635,offset:[378,61],eyes:[458,143,117,32],brows:[452,126,126,25],mouth:[476,204,81,54]},
 kenza:{shift:180,shiftY:24,scale:.69,offset:[330,34],eyes:[417,147,126,36],brows:[415,122,132,36],mouth:[447,207,70,49]}
};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
async function build(actor,body,atlas){
 const cfg=configs[actor],dir=`${root}/${actor}-stance-v1`;await fs.mkdir(dir,{recursive:true});
 let image=sharp(body).ensureAlpha();
 if(cfg.shift){ const raw=await image.toBuffer(); image=sharp({create:{width:1024,height:1536,channels:4,background:'#00000000'}}).composite([{input:await sharp(raw).extract({left:0,top:0,width:1024-cfg.shift,height:1536-(cfg.shiftY||0)}).toBuffer(),left:cfg.shift,top:cfg.shiftY||0}]); }
 const original=await image.png().toBuffer(), source=await sharp(original).webp({lossless:true}).toBuffer();
 await fs.writeFile(`${root}/${actor}-stance-v1.webp`,source);
 const meta=await sharp(atlas).metadata(),cell=Math.round(meta.width/3),cells=[];
 for(let i=0;i<9;i++){
  const tile=await sharp(atlas).extract({left:(i%3)*cell,top:Math.floor(i/3)*cell,width:cell,height:cell}).resize(Math.round(cell*cfg.scale),Math.round(cell*cfg.scale)).png().toBuffer();
  cells.push(await sharp({create:{width:1024,height:1536,channels:4,background:'#00000000'}}).composite([{input:tile,left:cfg.offset[0],top:cfg.offset[1]}]).png().toBuffer());
 }
 const layers={};
 async function save(name,rect,input,feather=5,maskShape='ellipse'){
  const [x,y,w,h]=rect;
  const {data}=await sharp(input).extract({left:x,top:y,width:w,height:h}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const base=await sharp(original).extract({left:x,top:y,width:w,height:h}).ensureAlpha().raw().toBuffer();
  // Correct low-frequency skin/lighting differences using the fixed neutral tile.
  const neutral=await sharp(cells[0]).extract({left:x,top:y,width:w,height:h}).ensureAlpha().raw().toBuffer();
  for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
   const p=(yy*w+xx)*4;
   const edge=maskShape==='ellipse'?(1-Math.sqrt(((xx-w/2)/(w/2))**2+((yy-h/2)/(h/2))**2))*Math.min(w,h)/2:Math.min(xx,yy,w-1-xx,h-1-yy);
   let a=feather?clamp(edge/feather,0,1):1;
   if(actor==='kenza' && name.startsWith('Brows_')) a*=clamp((Math.abs(x+xx-480)-9)/4,0,1);
   if(input!==original)for(let k=0;k<3;k++)data[p+k]=clamp(data[p+k]+clamp(base[p+k]-neutral[p+k],-18,18)*.45,0,255);
   data[p+3]=Math.round(Math.min(data[p+3],base[p+3])*a);
  }
  await sharp(data,{raw:{width:w,height:h,channels:4}}).png().toFile(`${dir}/${name}.png`);
  layers[name]={x,y,w,h,visible:true,url:`/avatars/${actor}-stance-v1/${name}.png`};
 }
 // Separate the two eye apertures so the nose/metal bridge never moves.
 for(const [name,index] of [['Eyes_Closed',1],['Eyes_Left',2],['Eyes_Right',3]]){
  await save(name,cfg.eyes,cells[index],5,'rect');
 }
 await save('Brows_Attentive',cfg.brows,cells[4],5,'rect');
 await save('Brows_Thinking',cfg.brows,cells[5],5,'rect');
 for(const [name,index] of [['Closed',-1],['A',6],['E',7],['O',8],['FV',7],['Smile',4]])await save('Mouth_'+name,cfg.mouth,index<0?original:cells[index],6);
 const coverings=[];
 const manifest={version:1,status:'reviewed',characterId:actor==='yassine'?'morocco_male':'morocco_female',width:1024,height:1536,source:`/avatars/${actor}-stance-v1.webp`,sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),pose:{bodyFacing:actor==='yassine'?'left':'right',bodyTurnDegrees:18,headFacing:'student',stageSide:actor==='yassine'?'right':'left'},registration:cfg,layers,coverings};
 await fs.writeFile(`${root}/${actor}-facial-v1.json`,JSON.stringify(manifest,null,2)+'\n');
 console.log(actor,source.length,Object.keys(layers).length);
}
(async()=>{const a=process.argv.slice(2);await build('yassine',a[0],a[1]);if(a[2]&&a[3])await build('kenza',a[2],a[3]);})().catch(e=>{console.error(e);process.exitCode=1});
