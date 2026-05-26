export const MAX_ABSTRACT_WORDS = 200;

export function countAbstractWords(text: string): number {
  return text.trim().split(/\s+/).filter((part) => part.length > 0).length;
}

export function withinAbstractWordLimit(text: string): boolean {
  return countAbstractWords(text) <= MAX_ABSTRACT_WORDS;
}

export const ABSTRACT_MAX_WORDS_MESSAGE = `يجب ألا يتجاوز الملخص ${MAX_ABSTRACT_WORDS} كلمة.`;
