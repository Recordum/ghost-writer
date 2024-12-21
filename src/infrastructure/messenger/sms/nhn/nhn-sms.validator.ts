export function validatePhoneNumber(phoneNumber: string): boolean {
  const regex = /^\d+$/;
  return regex.test(phoneNumber);
}

export function validateReserveDate(date: string): boolean {
  const regex =
    /^(?:20\d{2})-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2][0-9]|3[0-1]) (?:[01][0-9]|2[0-3]):(?:[0-5][0-9])$/;
  return regex.test(date);
}
