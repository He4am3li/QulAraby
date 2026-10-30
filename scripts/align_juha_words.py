#!/usr/bin/env python3
"""Generate measured word timings for Juha audio using forced alignment.
Never substitute estimated timings; report any failed or mismatched recording.
"""
import json, re, sys, unicodedata
from pathlib import Path
import soundfile as sf
import whisperx

ROOT=Path(__file__).resolve().parents[1]
PATH=ROOT/'src/data/storyCassettes.ts'
text=PATH.read_text(encoding='utf-8')
entries=list(re.finditer(r"\{\s*id:\s*'(juha-[^']+)'",text))
report=[]
changes=[]
device='cpu'
model,metadata=whisperx.load_align_model(language_code='ar',device=device)

def normalize(s):
    s=re.sub(r'[\u064b-\u065f\u0670\u0640]', '',s)
    return re.sub(r'[^\u0621-\u064a]', '',s.replace('أ','ا').replace('إ','ا').replace('آ','ا').replace('ى','ي').replace('ة','ه'))

for index,match in enumerate(entries):
    start=match.start()
    end=entries[index+1].start() if index+1<len(entries) else text.rfind('\n];')
    chunk=text[start:end]
    sid=match.group(1)
    audio_match=re.search(r"audioSrc:\s*'([^']+)'",chunk)
    paragraph_match=re.search(r'paragraphs:\s*\[([\s\S]*?)\]\s*(?:,?\s*wordTimings:|,?\s*\})',chunk)
    if not audio_match or not paragraph_match:
        report.append({'story':sid,'status':'missing source fields'});continue
    audio=ROOT/'public'/audio_match.group(1).lstrip('/')
    try:
        # The TS stories use JSON-style double-quoted paragraphs.
        paragraphs=re.findall(r'"((?:[^"\\]|\\.)*)"',paragraph_match.group(1))
        paragraphs=[json.loads('"'+p+'"') for p in paragraphs]
        words=[w for p in paragraphs for w in p.strip().split() if w]
        if not words or not audio.is_file():raise ValueError('audio or transcript missing')
        duration=sf.info(str(audio)).duration
        # Align exact supplied text, not a generated transcript.
        # The recording may have silence/music at either end.
        segments=[{'start':0.0,'end':duration,'text':' '.join(words)}]
        aligned=whisperx.align(segments,model,metadata,str(audio),device,return_char_alignments=False)
        measured=aligned.get('word_segments',[])
        # Check one-to-one correspondence; never map by ordinal when text differs.
        pairs=[(w,m) for w,m in zip(words,measured)]
        if len(measured)!=len(words) or any(normalize(w)!=normalize(m.get('word','')) for w,m in pairs):
            raise ValueError(f'word mismatch: text={len(words)} aligned={len(measured)}')
        times=[]
        for word,m in pairs:
            st=m.get('start');en=m.get('end')
            if st is None or en is None or en<=st:raise ValueError('word without measured boundaries')
            times.append({'startTime':round(float(st),3),'endTime':round(float(en),3)})
        if any(times[i]['startTime']<times[i-1]['startTime'] for i in range(1,len(times))):
            raise ValueError('nonmonotonic boundaries')
        # Insert immediately after the paragraphs field, without touching text or audio paths.
        offset=paragraph_match.end(1)+1
        changes.append((start+offset,',\n    wordTimings: '+json.dumps(times,ensure_ascii=False)))
        report.append({'story':sid,'status':'aligned','words':len(times),'duration':round(duration,2)})
    except Exception as exc:
        report.append({'story':sid,'status':'needs review','reason':str(exc)[:300]})
for offset,addition in reversed(changes):
    text=text[:offset]+addition+text[offset:]
PATH.write_text(text,encoding='utf-8')
(ROOT/'alignment-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
if any(r['status']!='aligned' for r in report):sys.exit(2)
