const keyFor = (userId, courseId, lectureId) =>
  `elearn:notes:${userId || "guest"}:${courseId}:${lectureId}`;

export function loadLectureNote(userId, courseId, lectureId) {
  if (!courseId || !lectureId) return "";
  try {
    return localStorage.getItem(keyFor(userId, courseId, lectureId)) || "";
  } catch {
    return "";
  }
}

export function saveLectureNote(userId, courseId, lectureId, value) {
  if (!courseId || !lectureId) return;
  try {
    localStorage.setItem(keyFor(userId, courseId, lectureId), value);
  } catch {
    /* ignore quota / private mode */
  }
}
