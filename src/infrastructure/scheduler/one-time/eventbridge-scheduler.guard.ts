export function isValidName(value: string): value is string {
  return /^[0-9a-zA-Z-_.]+$/.test(value);
}
