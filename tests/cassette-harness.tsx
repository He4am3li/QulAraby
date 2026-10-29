import React from 'react';
import { createRoot } from 'react-dom/client';
import { CassettePlayer } from '../components/CassettePlayer';
createRoot(document.getElementById('root')!).render(<CassettePlayer selectedLevel={new URLSearchParams(location.search).get('level') || 'beginner'}/>);
