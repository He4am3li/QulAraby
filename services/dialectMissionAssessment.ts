import { getAI } from './gemini';

export interface MissionTurn { role: string; text: string; authored?: boolean }
export interface MissionAssessment {
  completed: boolean;
  score: number;
  evidence: string;
  feedback: string;
}

/** Never award passport stamps based only on a number of messages. */
export async function assessDialectMission({
  country, dialect, mission, stage, turns
}: {
  country: string; dialect: string; mission: string; stage: 1 | 2 | 3;
  turns: MissionTurn[]
}): Promise<MissionAssessment> {
  const userTurns = turns
    .filter(t => t.role === 'user' && t.authored === true)
    .map(t => t.text.trim())
    .filter(t => t.length >= 3);
  const distinct = new Set(userTurns.map(t => t.toLocaleLowerCase()));
  const failure: MissionAssessment = { completed: false, score: 0, evidence: '', feedback: '' };
  if (distinct.size < 2) return failure;

  const dialogue = turns.slice(-16).map(t => ({
    speaker: t.role === 'user' ? 'student' : 'tutor',
    message: t.text.slice(0, 900)
  }));
  const ai = getAI();
  const prompt = [
    'You are a strict educational mastery assessor for a spoken dialect learning activity.',
    'Assess whether the learner actually accomplished the mission, not whether they sent enough messages.',
    'Country: ' + country,
    'Target dialect: ' + dialect,
    'Mission level: ' + stage,
    'Mission goal: ' + mission,
    'A learner may use natural variations in the dialect. Judge meaning fairly, do not require exact wording.',
    'The student must meaningfully demonstrate the central goal and appropriate conversational language in at least two distinct authentic contributions.',
    'For stage 1: demonstrate a relevant greeting and engagement with the mission setting or landmark.',
    'For stage 2: demonstrate completing a practical scenario using relevant dialect vocabulary.',
    'For stage 3: demonstrate independent, coherent discussion or planning involving the country context.',
    'Do NOT mark completion for acknowledgements, copying tutor words, suggested questions, or unrelated responses.',
    'Do NOT treat tutor/model words as learner achievements.',
    'Student-authored messages, the ONLY eligible evidence: ' + JSON.stringify(userTurns.slice(-10)),
    'Dialogue context: ' + JSON.stringify(dialogue),
    'Return ONLY JSON with fields: completed (boolean), score (0-100), evidence (a short EXACT verbatim substring found in student-authored messages), feedback (a short Arabic phrase).',
    'If the learner has not clearly completed the goal, set completed=false and evidence="". Never invent evidence.'
  ].join('\n');
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json', temperature: 0.1 }
    });
    const raw = (response.text || '').trim()
      .replace(/^\x60{3}(?:json)?\s*/i, '')
      .replace(/\s*\x60{3}$/, '');
    const obj = JSON.parse(raw) as Partial<MissionAssessment>;
    const score = Number(obj.score);
    const evidence = typeof obj.evidence === 'string' ? obj.evidence.trim() : '';
    const normalize = (s: string) => s.normalize('NFKC')
      .replace(/[\u064b-\u065f\u0670]/g, '').replace(/\s+/g, ' ').toLocaleLowerCase();
    const exactEvidence = evidence.length >= 3 && userTurns.some(t => normalize(t).includes(normalize(evidence)));
    const passed = obj.completed === true && score >= 80 && exactEvidence;
    return {
      completed: passed,
      score: Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0,
      evidence: passed ? evidence : '',
      feedback: typeof obj.feedback === 'string' ? obj.feedback.slice(0, 180) : ''
    };
  } catch (error) {
    console.warn('Mission assessment unavailable; no unearned passport stamp issued.', error);
    return failure;
  }
}
