export type Role = "admin" | "user";

export interface Credential {
  username: string;
  password: string;
  role: Role;
}

export interface Session {
  username: string;
  role: Role;
}

const CREDS_KEY = "erp_credentials";
const SESSION_KEY = "erp_session";

const DEFAULT_CREDENTIALS: Credential[] = [
  { username: "TSD", password: "TSD123", role: "admin" },
  { username: "TSDS", password: "TSDS123", role: "user" },
];

export function getCredentials(): Credential[] {
  const stored = localStorage.getItem(CREDS_KEY);
  if (!stored) {
    saveCredentials(DEFAULT_CREDENTIALS);
    return DEFAULT_CREDENTIALS;
  }
  return JSON.parse(stored) as Credential[];
}

export function saveCredentials(creds: Credential[]): void {
  localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
}

export function login(username: string, password: string): Session | null {
  const creds = getCredentials();
  const match = creds.find(
    (c) => c.username === username && c.password === password,
  );
  if (!match) return null;
  const session: Session = { username: match.username, role: match.role };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSession(): Session | null {
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  return JSON.parse(stored) as Session;
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
