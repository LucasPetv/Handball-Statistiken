(() => {
  const storageKey = 'handball-runtime-config-v1';
  const defaults = {
    siteName: 'Handball Shot Analytics',
    supabaseUrl: 'https://nvhrrgztyzansfokhoxo.supabase.co',
    supabaseAnonKey: 'sb_publishable_KwdnLjDgczIrILrAA7FKsw_mD25zL25',
    sessionDurationMinutes: 480,
    passwordVerificationFunction: 'verify-password',
    appTitle: 'Handball Shot Analytics'
  };

  let runtimeConfig = {};
  try {
    runtimeConfig = JSON.parse(localStorage.getItem(storageKey) || '{}');
  } catch {
    runtimeConfig = {};
  }

  const merged = { ...defaults, ...runtimeConfig };
  merged.supabaseUrl = String(merged.supabaseUrl || '').replace(/\/rest\/v1\/?$/, '');

  window.HANDBALL_CONFIG = merged;
})();
