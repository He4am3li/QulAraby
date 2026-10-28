import React from 'react';
export const useAuth = () => ({ user: { uid: 'radio-test' } });
export const db = {};
export const CassettePlayer = () => null;
export const PageHeader = ({ onToggle }: { onToggle: () => void }) => <button onClick={onToggle}>Toggle language</button>;
const forbidden = () => { throw new Error('Radio must not invoke AI services'); };
export const generateSpeech = forbidden;
export const decodeAudioData = forbidden;
export const generateWordIllustration = forbidden;
