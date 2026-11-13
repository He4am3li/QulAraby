/** Register generated Kuwaiti expression atlases to the reviewed full-body sources.
 * Usage: node scripts/register-kuwaiti-stance.cjs <fahad body> <fahad atlas> <lulwa body> <lulwa atlas>
 * Raster artwork is AI-authored. This script only registers/crops/feathers it.
 */
const sharp=require('sharp'),fs=require('node:fs/promises'),crypto=require('node:crypto');
const root='public/avatars';
const configs={
 fahad:{shift:0,shiftY:0,scale:.78,offset:[345,14],eyes:[449,123,110,38],brows:[449,109,110,26],mouth:[464,186,78,60],mouthSampleDy:0},
 lulwa:{shift:0,shiftY:0,scale:.82,offset:[342,11],eyes:[472,131,111,40],brows:[472,116,111,27],mouth:[489,188,79,60],mouthSampleDy:0}
};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
async function build(actor,body,atlas){
 const cfg=configs[actor],dir=`${root}/${actor}-stance-v1`;await fs.mkdir(dir,{recursive:true});
 let image=sharp(body).ensureAlpha(); if(cfg.flip) image=image.flop();
 if(cfg.shift || cfg.shiftY){ const raw=await image.toBuffer(),sx=Math.max(0,-cfg.shift),sy=Math.max(0,-cfg.shiftY); image=sharp({create:{width:1024,height:1536,channels:4,background:'#00000000'}}).composite([{input:await sharp(raw).extract({left:sx,top:sy,width:1024-Math.abs(cfg.shift),height:1536-Math.abs(cfg.shiftY)}).toBuffer(),left:Math.max(0,cfg.shift),top:Math.max(0,cfg.shiftY)}]); }
 const original=await image.png().toBuffer(), source=await sharp(original).webp({quality:92,alphaQuality:100,effort:6}).toBuffer();
 await fs.writeFile(`${root}/${actor}-stance-v1.webp`,source);
 const meta=await sharp(atlas).metadata(),cell=Math.round(meta.width/3),cells=[];
 for(let i=0;i<9;i++){
  const index=cfg.flip && (i===2 || i===3) ? 5-i : i;
  let tileImage=sharp(atlas).extract({left:(index%3)*cell,top:Math.floor(index/3)*cell,width:cell,height:cell});
  if(cfg.flip) tileImage=tileImage.flop();
  const tile=await tileImage.resize(Math.round(cell*cfg.scale),Math.round(cell*cfg.scale)).png().toBuffer();
  cells.push(await sharp({create:{width:1024,height:1536,channels:4,background:'#00000000'}}).composite([{input:tile,left:cfg.offset[0],top:cfg.offset[1]}]).png().toBuffer());
 }
 const layers={};
 async function save(name,rect,input,feather=5,maskShape='ellipse'){
  const [x,y,w,h]=rect;
  const sampleY=y+(name.startsWith('Mouth_') && input!==original ? (cfg.mouthSampleDy||0) : 0);
  const {data}=await sharp(input).extract({left:x,top:sampleY,width:w,height:h}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const base=await sharp(original).extract({left:x,top:y,width:w,height:h}).ensureAlpha().raw().toBuffer();
  for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
   const p=(yy*w+xx)*4;
   const edge=maskShape==='ellipse'?(1-Math.sqrt(((xx-w/2)/(w/2))**2+((yy-h/2)/(h/2))**2))*Math.min(w,h)/2:Math.min(xx,yy,w-1-xx,h-1-yy);
   let a=feather?clamp(edge/feather,0,1):1;

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
 const manifest={version:1,status:'reviewed',characterId:actor==='fahad'?'kuwait_male':'kuwait_female',width:1024,height:1536,source:`/avatars/${actor}-stance-v1.webp`,sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),pose:{bodyFacing:actor==='fahad'?'left':'right',bodyTurnDegrees:18,headFacing:'student',stageSide:actor==='fahad'?'right':'left'},registration:cfg,layers,coverings};
 await fs.writeFile(`${root}/${actor}-facial-v1.json`,JSON.stringify(manifest,null,2)+'\n');
 console.log(actor,source.length,Object.keys(layers).length);
}
(async()=>{const a=process.argv.slice(2);await build('fahad',a[0],a[1]);if(a[2]&&a[3])await build('lulwa',a[2],a[3]);})().catch(e=>{console.error(e);process.exitCode=1});
