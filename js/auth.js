const auth = (() => {
  const config = window.HANDBALL_CONFIG || {};
  const SESSION_KEY = 'handball-auth-session-v1';
  const sessionTTL = (Number(config.sessionDurationMinutes) || 480) * 60 * 1000;

  function readSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch {
      return null;
    }
  }

  function saveSession() {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      authenticated: true,
      createdAt: Date.now()
    }));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  async function login(password) {
    const trimmed = String(password || '').trim();
    if (!trimmed) throw new Error('Bitte Passwort eingeben.');

    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      throw new Error('Supabase ist noch nicht konfiguriert. Bitte URL und Anon-Key in js/config.js ergänzen.');
    }

    if (!window.supabase || !window.supabase.createClient) {
      throw new Error('Supabase Client wurde nicht geladen.');
    }

    const client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
    const { data, error } = await client.functions.invoke(config.passwordVerificationFunction || 'verify-password', {
      body: { password: trimmed }
    });

    if (error || !data || !data.ok) {
      throw new Error(data?.error || 'Passwort ungültig.');
    }

    saveSession();
    return true;
  }

  function isAuthenticated() {
    const session = readSession();
    if (!session || !session.authenticated) return false;
    const age = Date.now() - (session.createdAt || 0);
    return age < sessionTTL;
  }

  function ensureAuth() {
    return isAuthenticated();
  }

  return { login, isAuthenticated, ensureAuth, clearSession, readSession };
})();
