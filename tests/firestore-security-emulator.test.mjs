import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, collection, query, where, Timestamp } from 'firebase/firestore';

const PROJECT = 'demo-qul-security-rules';
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const env = await initializeTestEnvironment({
  projectId: PROJECT,
  firestore: { rules, host: '127.0.0.1', port: 8080 }
});
const email = {
  learnerA: 'learnera@example.com',
  learnerB: 'learnerb@example.com',
  learnerC: 'learnerc@example.com',
  teacherA: 'teachera@example.com',
  teacherB: 'teacherb@example.com',
  schoolAdminA: 'adminschoola@example.com',
  pending: 'pending@example.com',
  unverified: 'unverified@example.com',
  owner: 'he4amali22@gmail.com',
};
const actors = Object.fromEntries(Object.entries(email).map(([uid, mail]) =>
  [uid, env.authenticatedContext(uid, { email: mail, email_verified: uid !== 'unverified' })]
));
const firestore = uid => actors[uid].firestore();
const ref = (uid, path) => doc(firestore(uid), path);
const board = (uid, id = 'board_public') => ref(uid, 'writing_boards/' + id);
const post = (uid, id = 'post0') => ref(uid, 'writing_boards/board_public/posts/' + id);
const session = uid => ref(uid, 'live_sessions/roomA');
const teacherBoard = {
  title: 'Public Arabic practice',
  teacherId: 'teacherA',
  isPublic: true,
  isActive: true,
  requireApproval: true,
  createdAt: Timestamp.now(),
};
const postData = {
  authorId: 'learnerA', authorName: 'Learner A', authorPhoto: '',
  content: 'هذه مشاركتي', title: 'كتابة', imageUrl: 'https://example.com/post.png',
  isApproved: false, createdAt: Timestamp.now(), reactions: {}, likedBy: [],
};
const resultData = {
  userId: 'learnerA', userEmail: email.learnerA, score: 4, totalPoints: 5,
  timeTaken: 40, completedAt: Timestamp.now()
};
const tests = [];
function test(name, run) { tests.push({ name, run }); }
try {
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    for (const [uid, mail] of Object.entries(email)) {
      await setDoc(doc(db, 'users/' + uid), {
        uid, email: mail,
        approved: uid !== 'pending',
        role: uid === 'owner' ? 'admin' :
          uid === 'schoolAdminA' ? 'schoolAdmin' :
          uid.startsWith('teacher') ? 'teacher' : 'student',
        schoolId: ['learnerA', 'learnerC', 'teacherA', 'schoolAdminA'].includes(uid) ? 'schoolA' : 'schoolB',
        classId: ['learnerA', 'teacherA'].includes(uid) ? 'grade10A' : 'grade10B',
        createdAt: Timestamp.now()
      });
    }
    await setDoc(doc(db, 'quizzes/quizActive'), { authorId: 'teacherA', title: 'Open quiz', status: 'active' });
    await setDoc(doc(db, 'quizzes/quizDraft'), { authorId: 'teacherA', title: 'Draft quiz', status: 'draft' });
    const question = { text: 'ما الإجابة؟', type: 'mcq', correctAnswer: 'صحيح', points: 1, order: 0 };
    await setDoc(doc(db, 'quizzes/quizActive/questions/q1'), question);
    await setDoc(doc(db, 'quizzes/quizDraft/questions/q1'), question);
    await setDoc(doc(db, 'writing_boards/board_public'), teacherBoard);
    await setDoc(doc(db, 'writing_boards/board_private'), {
      ...teacherBoard, title: 'Teacher private', isPublic: false
    });
    await setDoc(doc(db, 'writing_boards/board_inactive'), {
      ...teacherBoard, title: 'Closed board', isActive: false
    });
    await setDoc(doc(db, 'writing_boards/board_public/posts/post0'), postData);
    await setDoc(doc(db, 'writing_boards/board_public/posts/postApproved'), { ...postData, isApproved: true });
    await setDoc(doc(db, 'live_sessions/global'), {
      teacherId: 'teacherA',
      poll: { isActive: true, question: 'حسنًا؟', options: ['نعم', 'لا'], votes: {} },
      exercise: { isActive: true, question_ar: 'ما الكلمة؟', answers: {} }
    });
    const expiry = Timestamp.fromMillis(Date.now() + 3600000);
    await setDoc(doc(db, 'live_sessions/roomA'), {
      teacherId: 'teacherA', schoolId: 'schoolA', classId: 'grade10A',
      status: 'active', expiresAt: expiry, joinCode: 'AABBCCDD',
      participants: { learnerA: true },
      poll: { isActive: true, question: 'حسنًا؟', options: ['نعم', 'لا'], votes: {} },
      exercise: { isActive: true, question_ar: 'ما الكلمة؟', correctAnswer: 'نعم', answers: {} }
    });
    await setDoc(doc(db, 'live_sessions/roomB'), {
      teacherId: 'teacherB', schoolId: 'schoolB', classId: 'grade10B',
      status: 'active', expiresAt: expiry, joinCode: 'EEFF0000',
      participants: { learnerB: true },
      poll: { isActive: true, question: 'School B', options: ['x', 'y'], votes: {} }
    });
    await setDoc(doc(db, 'live_sessions/roomOther'), {
      teacherId: 'teacherA', schoolId: 'schoolA', classId: 'grade10A',
      status: 'active', expiresAt: expiry, participants: {}
    });
    await setDoc(doc(db, 'live_session_invites/AABBCCDD'), {
      sessionId: 'roomA', teacherId: 'teacherA', expiresAt: expiry
    });
    await setDoc(doc(db, 'placement_results/schoolA-result'), {
      userId: 'learnerA', schoolId: 'schoolA', score: 45
    });
  });

  test('pending account can only read own profile', async () => {
    await assertSucceeds(getDoc(ref('pending', 'users/pending')));
    await assertFails(getDoc(ref('pending', 'users/learnerA')));
    await assertFails(getDoc(board('pending')));
  });
  test('unverified account cannot read board', () =>
    assertFails(getDoc(board('unverified'))));
  test('student can read own profile but not another school profile', async () => {
    await assertSucceeds(getDoc(ref('learnerA', 'users/learnerA')));
    await assertFails(getDoc(ref('learnerA', 'users/learnerB')));
  });
  test('school administrator cannot read another school student', async () => {
    await assertSucceeds(getDoc(ref('schoolAdminA', 'users/learnerA')));
    await assertFails(getDoc(ref('schoolAdminA', 'users/learnerB')));
  });
  test('students cannot download either active or draft answer keys', async () => {
    await assertFails(getDoc(ref('learnerA', 'quizzes/quizActive/questions/q1')));
    await assertFails(getDoc(ref('learnerA', 'quizzes/quizDraft/questions/q1')));
    await assertSucceeds(getDoc(ref('teacherA', 'quizzes/quizActive/questions/q1')));
    await assertSucceeds(getDoc(ref('teacherA', 'quizzes/quizDraft/questions/q1')));
    await assertFails(getDoc(ref('teacherB', 'quizzes/quizActive/questions/q1')));
  });
  test('teacher cannot transfer authored quiz by editing authorId', () =>
    assertFails(updateDoc(ref('teacherA', 'quizzes/quizActive'), { authorId: 'teacherB' })));
  test('all browser writes of quiz scores are rejected', async () => {
    await assertFails(setDoc(ref('learnerA', 'quizzes/quizActive/results/forged'), {
      ...resultData, userEmail: email.learnerB
    }));
    await assertFails(setDoc(ref('learnerB', 'quizzes/quizActive/results/other'), resultData));
    await assertFails(setDoc(ref('learnerA', 'quizzes/quizActive/results/valid'), resultData));
    await assertFails(setDoc(ref('teacherA', 'quizzes/quizActive/results/teacher'), resultData));
    // The server's privileged SDK writes, then the student and author may read.
    await env.withSecurityRulesDisabled(ctx =>
      setDoc(doc(ctx.firestore(), 'quizzes/quizActive/results/trusted'), resultData));
    await assertSucceeds(getDoc(ref('learnerA', 'quizzes/quizActive/results/trusted')));
    await assertSucceeds(getDoc(ref('teacherA', 'quizzes/quizActive/results/trusted')));
    await assertFails(getDoc(ref('learnerB', 'quizzes/quizActive/results/trusted')));
    await assertFails(updateDoc(ref('learnerA', 'quizzes/quizActive/results/trusted'), { score: 999999 }));
  });
  test('student may view public active boards only', async () => {
    await assertSucceeds(getDoc(board('learnerA')));
    await assertFails(getDoc(board('learnerA', 'board_private')));
    await assertFails(getDoc(board('learnerA', 'board_inactive')));
    await assertSucceeds(getDoc(board('teacherA', 'board_private')));
    await assertFails(getDoc(board('teacherB', 'board_private')));
  });
  test('students discover public boards with matching query', async () => {
    const q = query(collection(firestore('learnerA'), 'writing_boards'),
      where('isPublic', '==', true), where('isActive', '==', true));
    const snap = await assertSucceeds(getDocs(q));
    assert.equal(snap.size, 1);
  });
  test('student cannot forge teacher ownership on a board', () =>
    assertFails(setDoc(board('learnerA', 'board_forged'), { ...teacherBoard, teacherId: 'learnerA' })));
  test('teacher cannot transfer board ownership via update', () =>
    assertFails(updateDoc(board('teacherA'), { teacherId: 'teacherB' })));
  test('student can create moderated post but cannot auto-approve', async () => {
    await assertSucceeds(setDoc(post('learnerA', 'newpending'), postData));
    await assertFails(setDoc(post('learnerA', 'newapproved'), { ...postData, isApproved: true }));
  });
  test('student can post immediately when moderation is disabled', async () => {
    await env.withSecurityRulesDisabled(ctx =>
      updateDoc(doc(ctx.firestore(), 'writing_boards/board_public'), { requireApproval: false }));
    await assertSucceeds(setDoc(post('learnerA', 'public-approved'), { ...postData, isApproved: true }));
    await env.withSecurityRulesDisabled(ctx =>
      updateDoc(doc(ctx.firestore(), 'writing_boards/board_public'), { requireApproval: true }));
  });
  test('students cannot fetch another learner pending submission', async () => {
    await assertFails(getDoc(post('learnerB', 'newpending')));
    await assertSucceeds(getDoc(post('learnerA', 'newpending')));
    await assertSucceeds(getDoc(post('teacherA', 'newpending')));
    await assertFails(getDoc(post('teacherB', 'newpending')));
  });
  test('student public feed is approved only, and own draft query works', async () => {
    const posts = collection(firestore('learnerB'), 'writing_boards/board_public/posts');
    await assertFails(getDocs(posts));
    const published = await assertSucceeds(getDocs(query(posts, where('isApproved', '==', true))));
    assert.ok(published.docs.every(item => item.data().isApproved === true));
    const own = await assertSucceeds(getDocs(query(posts, where('authorId', '==', 'learnerB'))));
    assert.equal(own.size, 0);
  });
  test('student cannot change author, createdAt or approval of a post', async () => {
    await assertFails(updateDoc(post('learnerA'), { authorId: 'teacherA' }));
    await assertFails(updateDoc(post('learnerA'), { createdAt: Timestamp.now() }));
    await assertFails(updateDoc(post('learnerA'), { isApproved: true }));
    await assertSucceeds(updateDoc(post('learnerA'), { content: 'كتابة محسنة' }));
  });
  test('unrelated teacher cannot moderate another teacher board', async () => {
    await assertFails(updateDoc(post('teacherB'), { isApproved: true }));
    await assertFails(deleteDoc(post('teacherB')));
    await assertSucceeds(updateDoc(post('teacherA'), { isApproved: true }));
  });
  test('student may like published posts but not unpublished work', async () => {
    await assertSucceeds(updateDoc(post('learnerB', 'postApproved'), { likedBy: ['learnerB'] }));
    await assertFails(updateDoc(post('learnerB', 'postApproved'), {
      likedBy: [], feedback: 'Fake teacher feedback'
    }));
    await assertFails(updateDoc(post('learnerB', 'newpending'), { likedBy: ['learnerB'] }));
  });
  test('global classroom is denied even to teachers', async () => {
    await assertFails(getDoc(ref('teacherA', 'live_sessions/global')));
    await assertFails(getDoc(ref('learnerA', 'live_sessions/global')));
    await assertFails(updateDoc(ref('teacherA', 'live_sessions/global'), { 'poll.question': 'Nope' }));
  });
  test('only enrolled learners can read their room', async () => {
    await assertSucceeds(getDoc(session('learnerA')));
    await assertFails(getDoc(session('learnerB')));
    await assertFails(getDoc(session('learnerC')));
    await assertFails(getDoc(ref('learnerA', 'live_sessions/roomB')));
    await assertFails(getDoc(ref('teacherB', 'live_sessions/roomA')));
    await assertSucceeds(getDoc(session('teacherA')));
    await assertSucceeds(getDoc(ref('teacherB', 'live_sessions/roomB')));
  });
  test('a guessed room ID never grants membership within the same class', () =>
    assertFails(getDoc(ref('learnerA', 'live_sessions/roomOther'))));
  test('teacher cannot alter members, school, class, status, or expiration directly', async () => {
    await assertFails(updateDoc(session('teacherA'), { 'participants.learnerC': true }));
    await assertFails(updateDoc(session('teacherA'), { schoolId: 'schoolB' }));
    await assertFails(updateDoc(session('teacherA'), { classId: 'grade10B' }));
    await assertFails(updateDoc(session('teacherA'), { teacherId: 'teacherB' }));
    await assertFails(updateDoc(session('teacherA'), { status: 'ended' }));
    await assertFails(updateDoc(session('teacherA'), { expiresAt: Timestamp.fromMillis(Date.now() + 9999999) }));
  });
  test('no browser can create or delete a classroom document', async () => {
    await assertFails(setDoc(ref('teacherA', 'live_sessions/forged'), {
      teacherId: 'teacherA', participants:{}, schoolId:'schoolA', status:'active'
    }));
    await assertFails(deleteDoc(session('teacherA')));
    await assertFails(getDocs(collection(firestore('teacherA'), 'live_sessions')));
  });
  test('invite records are never readable by browser users', async () => {
    await assertFails(getDoc(ref('learnerA', 'live_session_invites/AABBCCDD')));
    await assertFails(getDoc(ref('teacherA', 'live_session_invites/AABBCCDD')));
    await assertFails(setDoc(ref('teacherA', 'live_session_invites/FAKE0000'), { sessionId:'roomB' }));
  });
  test('another teacher cannot modify a private lesson', () =>
    assertFails(updateDoc(ref('teacherB', 'live_sessions/roomA'), { 'poll.question': 'Hijack' })));
  test('a learner cannot impersonate teacher or manipulate classroom membership', async () => {
    await assertFails(updateDoc(session('learnerA'), { reaction: { emoji: 'fake' } }));
    await assertFails(updateDoc(session('learnerA'), { 'participants.learnerC': true }));
  });
  test('learner cannot falsify exercise correctness flag', () =>
    assertFails(updateDoc(session('learnerA'), {
      'exercise.answers.learnerA': {answer:'خطأ',isCorrect:true,name:'A'}
    })));

  test('student can submit own poll vote', () =>
    assertSucceeds(updateDoc(session('learnerA'), {
      'poll.votes.learnerA': { option: 1, name: 'Learner A', photo: '' }
    })));
  test('student cannot change polling question', () =>
    assertFails(updateDoc(session('learnerA'), { 'poll.question': 'Forged question' })));
  test('student cannot alter another student vote', () =>
    assertFails(updateDoc(session('learnerB'), { 'poll.votes.learnerA': { option: 0, name: 'B' } })));
  test('student cannot add invalid poll option', () =>
    assertFails(updateDoc(session('learnerB'), { 'poll.votes.learnerB': { option: 99, name: 'B' } })));
  test('student can submit own exercise answer', () =>
    assertSucceeds(updateDoc(session('learnerA'), {
      'exercise.answers.learnerA': { answer: 'نعم', isCorrect: true, name: 'Learner A' }
    })));
  test('student cannot change exercise question', () =>
    assertFails(updateDoc(session('learnerA'), { 'exercise.question_ar': 'Forged content' })));
  test('student cannot forge another learner exercise answer', () =>
    assertFails(updateDoc(session('learnerB'), {
      'exercise.answers.learnerA': { answer: 'لا', isCorrect: false, name: 'B' }
    })));
  test('student cannot update arbitrary other live sessions', () =>
    assertFails(updateDoc(ref('learnerA', 'live_sessions/roomB'), {
      'poll.votes.learnerA': { option: 0, name: 'A' }
    })));
  test('teacher may update live session teaching content', () =>
    assertSucceeds(updateDoc(session('teacherA'), { 'poll.question': 'سؤال جديد' })));
  test('teacher sees own school placement record only', async () => {
    await assertSucceeds(getDoc(ref('teacherA', 'placement_results/schoolA-result')));
    await assertFails(getDoc(ref('teacherB', 'placement_results/schoolA-result')));
  });

  let passed = 0;
  for (const {name, run} of tests) {
    try {
      await run();
      passed++;
      console.log('PASS: ' + name);
    } catch (error) {
      console.error('FAIL: ' + name);
      throw error;
    }
  }
  console.log('Firestore emulator access matrix passed: ' + passed + ' cases.');
} finally {
  await env.cleanup();
}
