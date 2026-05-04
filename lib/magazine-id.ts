/** Parse positive integer magazine id from a dynamic route segment. */
export function parseMagazineId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}
