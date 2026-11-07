/** Register generated Lebanese expression atlases to the reviewed full-body sources.
 * Usage: node scripts/register-lebanese-stance.cjs <jad body> <jad atlas> <layla body> <layla atlas>
 * Raster artwork is AI-authored. This script only registers/crops/feathers it.
 */
const sharp=require('sharp'),fs=require('node:fs/promises'),crypto=require('node:crypto');
const root='public/avatars';
const configs={
 jad:{shift:20,shiftY:-3,scale:.755,offset:[396,3],eyes:[498,124,115,34],brows:[496,104,118,27],mouth:[517,185,78,59],mouthSampleDy:9},
 layla:{shift:-25,shiftY:-6,scale:.79,offset:[310,0],eyes:[418,119,120,38],brows:[416,99,124,30],mouth:[437,176,77,60],mouthSampleDy:14}
};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
async function build(actor,body,atlas){
 const cfg=configs[actor],dir=`${root}/${actor}-stance-v1`;await fs.mkdir(dir,{recursive:true});
 let image=sharp(body).ensureAlpha();
 if(cfg.shift || cfg.shiftY){ const raw=await image.toBuffer(),sx=Math.max(0,-cfg.shift),sy=Math.max(0,-cfg.shiftY); image=sharp({create:{width:1024,height:1536,channels:4,background:'#00000000'}}).composite([{input:await sharp(raw).extract({left:sx,top:sy,width:1024-Math.abs(cfg.shift),height:1536-Math.abs(cfg.shiftY)}).toBuffer(),left:Math.max(0,cfg.shift),top:Math.max(0,cfg.shiftY)}]); }
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
  const sampleY=y+(name.startsWith('Mouth_') && input!==original ? (actor==='layla' ? (name==='Mouth_Smile'?6:name==='Mouth_O'?20:14) : cfg.mouthSampleDy||0) : 0);
  const {data}=await sharp(input).extract({left:x,top:sampleY,width:w,height:h}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const base=await sharp(original).extract({left:x,top:y,width:w,height:h}).ensureAlpha().raw().toBuffer();
  // Correct low-frequency skin/lighting differences using the fixed neutral tile.
  const neutral=await sharp(cells[0]).extract({left:x,top:sampleY,width:w,height:h}).ensureAlpha().raw().toBuffer();
  for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
   const p=(yy*w+xx)*4;
   const edge=maskShape==='ellipse'?(1-Math.sqrt(((xx-w/2)/(w/2))**2+((yy-h/2)/(h/2))**2))*Math.min(w,h)/2:Math.min(xx,yy,w-1-xx,h-1-yy);
   let a=feather?clamp(edge/feather,0,1):1;
   if(actor==='layla' && name.startsWith('Brows_')) a*=clamp((Math.abs(x+xx-475)-10)/4,0,1);
   if(input!==original && !name.startsWith('Mouth_'))for(let k=0;k<3;k++)data[p+k]=clamp(data[p+k]+clamp(base[p+k]-neutral[p+k],-18,18)*.45,0,255);
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
 const manifest={version:1,status:'reviewed',characterId:actor==='jad'?'lebanon_male':'lebanon_female',width:1024,height:1536,source:`/avatars/${actor}-stance-v1.webp`,sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),pose:{bodyFacing:actor==='jad'?'left':'right',bodyTurnDegrees:18,headFacing:'student',stageSide:actor==='jad'?'right':'left'},registration:cfg,layers,coverings};
 await fs.writeFile(`${root}/${actor}-facial-v1.json`,JSON.stringify(manifest,null,2)+'\n');
 console.log(actor,source.length,Object.keys(layers).length);
}
(async()=>{const a=process.argv.slice(2);await build('jad',a[0],a[1]);if(a[2]&&a[3])await build('layla',a[2],a[3]);})().catch(e=>{console.error(e);process.exitCode=1});
