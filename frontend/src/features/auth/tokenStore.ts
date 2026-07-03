// Access token em memória (nunca localStorage — ADR-0004). O interceptor e o AuthProvider leem daqui.
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}
