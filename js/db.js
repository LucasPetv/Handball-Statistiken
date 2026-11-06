const db = (() => {
  const storageKey = 'handball-analytics-state-v1';
  const state = { teams: [], players: [], games: [], shots: [], halls: [], settings: {} };

  function readState() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
      return { ...state, ...(stored || {}) };
    } catch (error) {
      console.warn('Unable to parse local state:', error);
      return { ...state };
    }
  }

  function persistState(nextState) {
    localStorage.setItem(storageKey, JSON.stringify(nextState));
  }

  function safeDate(value) {
    return value || new Date().toISOString();
  }

  function addItem(collection, item) {
    const next = readState();
    next[collection] = Array.isArray(next[collection]) ? next[collection] : [];
    next[collection].push(item);
    persistState(next);
    return item;
  }

  function updateItem(collection, id, updates) {
    const next = readState();
    next[collection] = (next[collection] || []).map((entry) =>
      entry.id === id ? { ...entry, ...updates, updated_at: safeDate() } : entry
    );
    persistState(next);
    return next[collection].find((entry) => entry.id === id);
  }

  function deleteItem(collection, id) {
    const next = readState();
    next[collection] = (next[collection] || []).filter((entry) => entry.id !== id);
    persistState(next);
  }

  function all() {
    return readState();
  }

  function seedDefaults() {
    const current = readState();
    if (current.teams.length || current.players.length || current.games.length || current.shots.length || current.halls.length) {
      return current;
    }

    const hallId = crypto.randomUUID();
    const teamId = crypto.randomUUID();
    const playerId = crypto.randomUUID();

    current.halls = [{
      id: hallId,
      name: 'Arena Süd',
      city: 'Berlin',
      address: 'Musterstraße 24',
      description: 'Hauptspielstätte',
      created_at: safeDate(),
      updated_at: safeDate()
    }];

    current.teams = [{
      id: teamId,
      name: 'HC Berlin 1',
      club_name: 'HCB Berlin',
      age_group: 'U23',
      league: 'Bundesliga',
      gender: 'Männlich',
      home_hall_id: hallId,
      description: 'Erste Mannschaft',
      created_at: safeDate(),
      updated_at: safeDate()
    }];

    current.players = [{
      id: playerId,
      first_name: 'Max',
      last_name: 'Müller',
      jersey_number: 9,
      position: 'Rückraum Mitte',
      team_id: teamId,
      birth_year: 1998,
      notes: 'Kapitän',
      created_at: safeDate(),
      updated_at: safeDate()
    }];

    current.games = [{
      id: crypto.randomUUID(),
      home_team_id: teamId,
      away_team_id: teamId,
      date: new Date().toISOString().slice(0, 10),
      hall_id: hallId,
      competition: 'Bundesliga',
      home_goals: 28,
      away_goals: 25,
      status: 'beendet',
      notes: 'Demo-Spiel',
      created_at: safeDate(),
      updated_at: safeDate()
    }];

    persistState(current);
    return current;
  }

  return { all, addItem, updateItem, deleteItem, seedDefaults, persistState, readState };
})();
