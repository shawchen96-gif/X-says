/**
 * @param {string[]} keys
 * @param {{order: string[], cursor: number} | undefined} saved
 * @param {{start?: number, index: number} | null} session
 * @param {boolean} canResume
 * @param {() => number} random
 */
export function prepareStudy(keys, saved, session, canResume, random = Math.random) {
  const available = new Set(keys);
  const valid = Boolean(saved && Number.isSafeInteger(saved.cursor) && saved.cursor >= 0 && Array.isArray(saved.order) && saved.order.length === keys.length && new Set(saved.order).size === keys.length && saved.order.every(word => available.has(word)));
  const order = valid ? [...saved.order] : [...keys];
  if (!valid) for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const resume = Boolean(canResume && valid && Number.isSafeInteger(session?.start) && session.start >= 0 && Number.isSafeInteger(session.index) && session.index >= 0 && session.start + session.index === saved.cursor);
  return { progress: {order, cursor: valid ? saved.cursor : 0}, start: resume ? Number(session.start) : valid ? saved.cursor : 0, resume };
}
