// Server-only authorization policy. Never trust roles or schoolIds from browser payloads.
export const OWNER_EMAIL = 'he4amali22@gmail.com';

export function validProfile(user) {
  return !!user && typeof user.uid === 'string' && /^[A-Za-z0-9_-]{6,128}$/.test(user.uid) &&
    typeof user.email === 'string' &&
    (user.approved === true || (user.role === 'admin' && user.email.toLowerCase() === OWNER_EMAIL)) &&
    ['admin', 'schoolAdmin', 'teacher', 'student'].includes(user.role);
}

export function isOwner(user) {
  return validProfile(user) && user.role === 'admin' && user.email.toLowerCase() === OWNER_EMAIL;
}

export function sameSchool(a, b) {
  return validProfile(a) && validProfile(b) && !!a.schoolId &&
    a.schoolId !== '__demo__' && a.schoolId === b.schoolId;
}

// Verified class ownership is read on the server from schools/{schoolId}/classes/{classId}.
export function canDirect(a, b, classroom) {
  if (!sameSchool(a, b) || a.uid === b.uid) return false;
  if (a.role === 'schoolAdmin' && b.role === 'teacher') return true;
  if (a.role === 'teacher' && b.role === 'schoolAdmin') return true;
  if (a.role === 'teacher' && b.role === 'student') {
    return !!b.classId && classroom?.id === b.classId && classroom.teacherId === a.uid;
  }
  if (a.role === 'student' && b.role === 'teacher') {
    return !!a.classId && classroom?.id === a.classId && classroom.teacherId === b.uid;
  }
  return false;
}

export function canSupport(a, b) {
  if (!validProfile(a) || !validProfile(b) || a.uid === b.uid) return false;
  return (a.role === 'schoolAdmin' && !!a.schoolId && a.schoolId !== '__demo__' && isOwner(b)) ||
    (isOwner(a) && b.role === 'schoolAdmin' && !!b.schoolId && b.schoolId !== '__demo__');
}

export function canViewAnnouncement(profile, ann, classroom) {
  if (!validProfile(profile) || !ann || profile.schoolId !== ann.schoolId || !profile.schoolId) return false;
  if (ann.audience === 'teachers') return profile.role === 'teacher' || profile.role === 'schoolAdmin';
  if (ann.audience === 'class') {
    if (profile.role === 'schoolAdmin') return true;
    if (profile.role === 'student') return !!profile.classId && profile.classId === ann.classId;
    return profile.role === 'teacher' && classroom?.id === ann.classId && classroom.teacherId === profile.uid;
  }
  return false;
}