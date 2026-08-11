/**
 * Single source of truth for TA’LIMOT essay word counting.
 *
 * A word must contain at least one Latin/Cyrillic letter. Internal apostrophes,
 * curly apostrophes and hyphens are allowed. Standalone numbers and emoji are
 * not counted as words.
 */
export function countEssayWords(text: string): number {
    const normalized = text.normalize("NFC");
    const matches = normalized.match(/[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳʼʻ‘’`'’-]+/g);
    return matches?.filter((token) => /[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ]/.test(token)).length ?? 0;
}
