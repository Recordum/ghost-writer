export function validatePhoneNumber(phoneNumber: string): boolean {
  const regex = /^\d+$/;
  return regex.test(phoneNumber);
}
