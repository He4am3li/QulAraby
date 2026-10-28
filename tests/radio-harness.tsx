import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { Listening } from '../pages/Listening';
createRoot(document.getElementById('root')!).render(<MemoryRouter><Listening /></MemoryRouter>);
