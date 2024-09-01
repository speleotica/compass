export default function isValidStationName(name: string): boolean {
  return /^[\x21-\x7f]{1,12}$/.test(name)
}

export function assertValidStationName(name: string): void {
  if (!isValidStationName(name)) {
    throw new Error(
      `Invalid station name: ${name.replace(/./g, (s) =>
        s < '\x20' || s > '\x7f' ? `\\x${s.charCodeAt(0).toString(16)}` : s
      )}}`
    )
  }
}
