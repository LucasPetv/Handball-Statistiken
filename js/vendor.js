window.Chart = function Chart() {
  return {
    destroy() {}
  };
};

window.supabase = {
  createClient() {
    return {
      functions: {
        invoke: async () => ({ data: { ok: true }, error: null })
      }
    };
  }
};
