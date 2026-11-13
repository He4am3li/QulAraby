export const ROOM_TTL_MS = 3 * 60 * 60 * 1000;
export const ROOM_CAP = 80;
export const ROOM_ID_RE = /^[a-f0-9]{32}$/;
export const ROOM_CODE_RE = /^[A-F0-9]{8}$/;

export function roomScope(profile = {}) {
  return {
    schoolId: typeof profile.schoolId === 'string' && profile.schoolId.length
      ? profile.schoolId : 'independent',
    classId: typeof profile.classId === 'string' ? profile.classId : ''
  };
}
export function permittedRoomScope(profile, room) {
  const scope = roomScope(profile);
  return !!room && scope.schoolId === room.schoolId &&
    (!room.classId || scope.classId === room.classId);
}
export function canResumeRoom(room, uid, profile, now = Date.now()) {
  return !!room && room.status === 'active' && room.expiresAt?.toMillis?.() > now &&
    (room.teacherId === uid ||
     (room.participants?.[uid] === true && permittedRoomScope(profile, room)));
}
export function canJoinRoom(room, uid, profile, now = Date.now()) {
  return !!room && room.status === 'active' && room.expiresAt?.toMillis?.() > now &&
    permittedRoomScope(profile, room) &&
    (room.participants?.[uid] === true ||
     Object.keys(room.participants || {}).length < ROOM_CAP);
}
