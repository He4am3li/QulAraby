#!/usr/bin/env node
/**
 * Extract optimized WEBP frames from ONE original continuous character video.
 * Usage:
 *   node scripts/extract-sri-hero-frames.mjs ./assets/guide.mp4 ./scripts/sri-hero-timing.json
 * Output:
 *   public/sri-hero/frame_00001.webp ... manifest.json
 *
 * Requirements: ffmpeg and ffprobe installed locally.
 * This script deliberately does not synthesize missing footage or fake poses.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const videoPath = process.argv[2] ? resolve(process.argv[2]) : null;
const timingPath = process.argv[3] ? resolve(process.argv[3]) : null;
const fps = 12, width = 900;
const folder = resolve('public/sri-hero');
if (!videoPath || !timingPath || !existsSync(videoPath) || !existsSync(timingPath)) {
  console.error('Usage: node scripts/extract-sri-hero-frames.mjs PATH_TO_ONE_SOURCE_VIDEO PATH_TO_TIMING_JSON');
  process.exit(1);
}
const meta = JSON.parse(readFileSync(timingPath, 'utf8'));
const ranges = ['working','left','right','greeting'];
if (ranges.some(key => !Array.isArray(meta[key]) || meta[key].length !== 2 || meta[key].some(x => typeof x !== 'number'))) {
  throw new Error('Timing JSON must include working, left, right and greeting as [startSeconds,endSeconds].');
}
const duration = Number(execFileSync('ffprobe', [
  '-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',videoPath
], {encoding:'utf8'}).trim());
if (!Number.isFinite(duration) || duration < 4) throw new Error('The source video is invalid or too short.');
for (const [key, [from,to]] of Object.entries(meta)) {
  if (!(from >= 0 && to > from && to <= duration + 0.05)) throw new Error('Invalid '+key+' range for '+duration+'s video');
}
mkdirSync(folder, {recursive:true});
for (const file of readdirSync(folder)) if (/^frame_\d{5}\.webp$/.test(file)) rmSync(join(folder,file));
execFileSync('ffmpeg',[
  '-hide_banner','-loglevel','error','-y','-i',videoPath,
  '-vf',`fps=${fps},scale=${width}:-2:flags=lanczos`,
  '-an','-c:v','libwebp','-quality','72','-compression_level','5','-start_number','1',
  join(folder,'frame_%05d.webp')
], {stdio:'inherit'});
const frameCount = readdirSync(folder).filter(x => /^frame_\d{5}\.webp$/.test(x)).length;
if (frameCount < 40) throw new Error('Insufficient frames extracted, check the input video.');
const converted = Object.fromEntries(Object.entries(meta).map(([key,[from,to]]) => {
  const first=Math.max(0,Math.floor(from*fps));
  const last=Math.min(frameCount-1, Math.ceil(to*fps)-1);
  if (last <= first) throw new Error('Segment '+key+' contains too few frames.');
  return [key,[first,last]];
}));
const manifest = {fps,frameCount,basePath:'/sri-hero',ranges:converted};
writeFileSync(join(folder,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('Extracted',frameCount,'frames from one',duration.toFixed(2),'second video.');
console.log('Manifest:',join(folder,'manifest.json'));
