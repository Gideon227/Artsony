export type WithdrawAttempt = { signature: string; key: string }

export function withdrawSignature(amount: number, network: string, walletAddress: string): string {
  return `${amount}|${network}|${walletAddress.trim()}`
}

// Retrying identical values reuses the key (so a request that reached the
// server but whose response was lost can never create a second withdrawal);
// any change to the values is a different withdrawal and gets a new key.
export function resolveAttempt(
  previous: WithdrawAttempt | null,
  signature: string,
  createKey: () => string,
): WithdrawAttempt {
  return previous?.signature === signature ? previous : { signature, key: createKey() }
}
