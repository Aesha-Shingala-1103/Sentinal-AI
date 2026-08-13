export function detectType(value: string): string {
  const text = value.trim();

  // Email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
    return "email";
  }

  // Wallet - Ethereum
  if (/^0x[a-fA-F0-9]{40}$/.test(text)) {
    return "wallet";
  }

  // Wallet - Bitcoin (legacy P2PKH/P2SH or bech32)
  if (
    /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(text) ||
    /^bc1[a-z0-9]{25,90}$/i.test(text)
  ) {
    return "wallet";
  }

  // Phone
  if (/^\+?[0-9]{8,15}$/.test(text)) {
    return "phone";
  }

  // Domain
  if (/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(text)) {
    return "domain";
  }

  // Default
  return "username";
}
