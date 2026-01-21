export function toSlug(value: string): string {
  return value
    .toString()
    .normalize('NFD')                   // separa tildes
    .replace(/[\u0300-\u036f]/g, '')    // elimina tildes
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')       // solo letras, números, espacios
    .replace(/\s+/g, '-')               // espacios → -
    .replace(/-+/g, '-');               // evita ---
}
