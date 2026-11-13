// Shared, side-effect-free question projection and authoritative grading.
// Keep this module server-side only. The client must never see correctAnswer.
export const TEXT_TYPES = new Set(['mcq', 'true_false', 'short_answer', 'fill_blank']);
export const ORDER_TYPES = new Set(['ordering', 'drag_drop', 'matching']);
const norm = value => String(value ?? '').normalize('NFKC').trim().toLocaleLowerCase('und');
function shuffle(source) {
  const array = [...source];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
export function publicQuestion(id, data) {
  const options = Array.isArray(data.options)
    ? data.options.filter(option => typeof option === 'string').slice(0, 30)
    : [];
  const result = {
    id, text: typeof data.text === 'string' ? data.text : '',
    type: typeof data.type === 'string' ? data.type : 'mcq',
    options: shuffle(options),
    points: Number.isFinite(data.points) ? Math.max(0, data.points) : 0
  };
  if (result.type === 'chess_puzzle' && data.chessConfig && typeof data.chessConfig === 'object') {
    // Expose only puzzle geometry, never keys/feedback/solution metadata.
    const c = data.chessConfig;
    result.chessConfig = {
      boardSize: c.boardSize, initialPos: c.initialPos,
      targetPos: c.targetPos, pieceType: c.pieceType, gridData: c.gridData
    };
  }
  return result;
}
export function gradeQuestions(questionDocs, answers) {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) throw Error('INVALID_ANSWERS');
  if (!Array.isArray(questionDocs) || questionDocs.length === 0 || questionDocs.length > 100) {
    throw Error('INVALID_QUESTIONS');
  }
  const allowed = new Set(questionDocs.map(x => x.id));
  if (Object.keys(answers).length > 100 || Object.keys(answers).some(id => !allowed.has(id))) {
    throw Error('INVALID_ANSWERS');
  }
  let score = 0;
  let totalPoints = 0;
  let correctCount = 0;
  for (const { id, data } of questionDocs) {
    const points = Number.isFinite(data.points) && data.points > 0 && data.points <= 100
      ? data.points : 0;
    totalPoints += points;
    const answer = answers[id];
    let correct = false;
    if (TEXT_TYPES.has(data.type)) {
      correct = typeof answer === 'string' &&
        answer.length <= 5000 && norm(answer) === norm(data.correctAnswer);
    } else if (ORDER_TYPES.has(data.type)) {
      const expected = typeof data.correctAnswer === 'string' && data.correctAnswer.includes('|')
        ? data.correctAnswer.split('|')
        : data.options;
      correct = Array.isArray(answer) && answer.length <= 30 && Array.isArray(expected) &&
        answer.length === expected.length &&
        answer.every((s, index) => typeof s === 'string' && norm(s) === norm(expected[index]));
    }
    // A browser can forge CHESS_MASTERED. Chess puzzles are not graded until
    // their move history can be validated by a dedicated server-side engine.
    if (correct) {
      score += points;
      correctCount++;
    }
  }
  return { score, totalPoints, correctCount, questionCount: questionDocs.length };
}
