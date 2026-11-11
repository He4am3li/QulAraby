import type { WhiteboardSessionState, WhiteboardActivity } from '../types/whiteboard';

/** Each class has an unpredictable document ID. Students must know the code to join. */
export const createWhiteboardCode = (): string => {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return 'QUL-' + Array.from(bytes, b => (b % 36).toString(36).toUpperCase()).join('');
};

export const isWhiteboardCode = (value: string) => /^QUL-[0-9A-Z]{8}$/.test(value.trim().toUpperCase());
export const normalizeWhiteboardCode = (value: string) => value.trim().toUpperCase();

/**
 * Only publish teacher-owned instructional state. Student names, answers and presence
 * are stored in per-student subdocuments to prevent concurrent full-document writes.
 */
export const whiteboardCloudPayload = (session: WhiteboardSessionState, schoolId: string) => {
  const activity = session.activeActivity;
  const safeActivity = activity
    ? { ...activity, submissions: {} }
    : null;
  const data = {
    id: session.code,
    code: session.code,
    teacherId: session.teacherId,
    teacherName: session.teacherName,
    schoolId,
    title: session.title,
    createdAt: session.createdAt,
    currentPageIndex: session.currentPageIndex,
    isLocked: session.isLocked,
    collaborationMode: session.collaborationMode,
    pages: session.pages,
    timer: session.timer,
    wordBox: session.wordBox,
    activeActivity: safeActivity,
  };
  // Firestore refuses undefined properties inside nested drawing cards.
  // JSON normalization also avoids persisting live React-only objects.
  return JSON.parse(JSON.stringify(data)) as typeof data;
};

/** Never overwrite the locally tracked participants or their returned answers. */
export const mergeWhiteboardCloud = (
  current: WhiteboardSessionState,
  remote: ReturnType<typeof whiteboardCloudPayload>
): WhiteboardSessionState => {
  const activity = remote.activeActivity as WhiteboardActivity | null;
  const previous = current.activeActivity;
  return {
    ...current,
    ...remote,
    students: current.students,
    activeActivity: activity ? {
      ...activity,
      submissions: previous?.id === activity.id ? previous.submissions : {},
    } : null,
  };
};

/** Firestore limits documents to 1 MiB, leave headroom for metadata and encoding. */
export const MAX_WHITEBOARD_DOCUMENT_BYTES = 800_000;
export const isWhiteboardPayloadSizeSafe = (payload: ReturnType<typeof whiteboardCloudPayload>) =>
  new TextEncoder().encode(JSON.stringify(payload)).length < MAX_WHITEBOARD_DOCUMENT_BYTES;
