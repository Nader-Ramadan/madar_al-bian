export const MIN_ABSTRACT_WORDS = 200;

export function countAbstractWords(text: string): number {
  return text.trim().split(/\s+/).filter((part) => part.length > 0).length;
}

export function meetsMinAbstractWords(text: string): boolean {
  return countAbstractWords(text) >= MIN_ABSTRACT_WORDS;
}

export const ABSTRACT_MIN_WORDS_MESSAGE = `يجب أن يكون الملخص ${MIN_ABSTRACT_WORDS} كلمة على الأقل.`;
