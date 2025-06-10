let baseServerTime: Date
let localStartTime: number

export function setServerTime(serverTimeISOString: string) {
  baseServerTime = new Date(serverTimeISOString)
  localStartTime = Date.now()
}

export function getNowByServer(): string {
  if (!baseServerTime || !localStartTime) {
    throw new Error('Server time not initialized. Call setServerTime() first.')
  }

  const elapsed = Date.now() - localStartTime
  const now = new Date(baseServerTime.getTime() + elapsed)
  return now.toISOString()
}
