import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { RadioVolumeDial } from '../components/RadioVolumeDial';
import '../components/ListeningRadioRetouch.css';
function Harness(){const [volume,setVolume]=useState(.5);return <main style={{padding:50,background:'#533d2e'}}><RadioVolumeDial value={volume} onChange={setVolume} lang="ar"/></main>}
createRoot(document.getElementById('root')!).render(<Harness/>);
