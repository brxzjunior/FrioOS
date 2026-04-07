export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isBlockedEmail(email: string) {
  const blockedDomains = ["test.com", "fake.com", "email.com"];
  const domain = email.split("@")[1];
  return blockedDomains.includes(domain);
}
