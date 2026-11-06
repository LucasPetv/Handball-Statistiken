const app = (() => {
  const state = { activeView: 'dashboard', chartRefs: {} };

  const ui = {
    app: document.getElementById('app'),
    loginScreen: document.getElementById('login-screen'),
    nav: document.getElementById('main-nav'),
    topTitle: document.getElementById('view-title'),
    loginForm: document.getElementById('login-form'),
    loginError: document.getElementById('login-error'),
    logoutBtn: document.getElementById('logout-btn')
  };

  function init() {
    bindEvents();
    db.seedDefaults();
    renderLoginState();
    renderApp();
  }

  function bindEvents() {
    ui.nav.addEventListener('click', (event) => {
      const button = event.target.closest('[data-view]');
      if (!button) return;
      state.activeView = button.dataset.view;
      renderNav();
      renderView();
    });

    ui.loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const password = new FormData(ui.loginForm).get('password');
      ui.loginError.textContent = '';
      try {
        await auth.login(password);
        renderLoginState();
      } catch (error) {
        ui.loginError.textContent = error.message || 'Login fehlgeschlagen.';
      }
    });

    ui.logoutBtn.addEventListener('click', () => {
      auth.clearSession();
      renderLoginState();
    });

    document.getElementById('runtime-config-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const runtimeConfig = {
        supabaseUrl: String(form.get('supabaseUrl') || '').trim(),
        supabaseAnonKey: String(form.get('supabaseAnonKey') || '').trim(),
        sessionDurationMinutes: Number(form.get('sessionDurationMinutes') || 480),
        passwordVerificationFunction: String(form.get('passwordVerificationFunction') || 'verify-password').trim() || 'verify-password'
      };

      localStorage.setItem('handball-runtime-config-v1', JSON.stringify(runtimeConfig));
      const message = document.getElementById('runtime-config-message');
      if (message) {
        message.textContent = 'Gespeichert. Die Seite wird neu geladen …';
      }
      setTimeout(() => {
        window.location.reload();
      }, 600);
    });

    document.getElementById('team-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      db.addItem('teams', {
        id: crypto.randomUUID(),
        name: form.get('name'),
        club_name: form.get('club_name'),
        age_group: form.get('age_group'),
        league: form.get('league'),
        gender: form.get('gender'),
        home_hall_id: form.get('home_hall_id') || null,
        description: form.get('description') || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      event.currentTarget.reset();
      renderView();
    });

    document.getElementById('player-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      db.addItem('players', {
        id: crypto.randomUUID(),
        team_id: form.get('team_id'),
        first_name: form.get('first_name'),
        last_name: form.get('last_name'),
        jersey_number: Number(form.get('jersey_number') || 0),
        position: form.get('position'),
        birth_year: form.get('birth_year') ? Number(form.get('birth_year')) : null,
        notes: form.get('notes') || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      event.currentTarget.reset();
      renderView();
    });

    document.getElementById('hall-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      db.addItem('halls', {
        id: crypto.randomUUID(),
        name: form.get('name'),
        address: form.get('address'),
        city: form.get('city'),
        description: form.get('description') || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      event.currentTarget.reset();
      renderView();
    });

    document.getElementById('game-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      db.addItem('games', {
        id: crypto.randomUUID(),
        home_team_id: form.get('home_team_id'),
        away_team_id: form.get('away_team_id'),
        date: form.get('date'),
        hall_id: form.get('hall_id') || null,
        competition: form.get('competition') || '',
        home_goals: Number(form.get('home_goals') || 0),
        away_goals: Number(form.get('away_goals') || 0),
        status: form.get('status') || 'geplant',
        notes: form.get('notes') || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      event.currentTarget.reset();
      renderView();
    });

    document.getElementById('shot-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      db.addItem('shots', {
        id: crypto.randomUUID(),
        game_id: form.get('game_id') || null,
        team_id: form.get('team_id') || null,
        player_id: form.get('player_id') || null,
        position_x: Number(form.get('position_x') || 0),
        position_y: Number(form.get('position_y') || 0),
        target_area: form.get('target_area') || 'Mitte',
        result: form.get('result') || 'Sonstiger Fehlwurf',
        minute: Number(form.get('minute') || 0),
        shot_type: form.get('shot_type') || 'Schlagwurf',
        context: form.get('context') || 'Positionsangriff',
        note: form.get('note') || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      event.currentTarget.reset();
      renderView();
    });

    const field = document.getElementById('shot-field');
    if (field) {
      field.addEventListener('click', (event) => {
        const rect = field.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        const xInput = document.getElementById('position_x');
        const yInput = document.getElementById('position_y');
        if (xInput) xInput.value = x.toFixed(2);
        if (yInput) yInput.value = y.toFixed(2);
        renderFieldMarker(x, y);
      });
    }

    document.querySelectorAll('.goal-cell').forEach((cell) => {
      cell.addEventListener('click', () => {
        document.querySelectorAll('.goal-cell').forEach((item) => item.classList.remove('is-selected'));
        cell.classList.add('is-selected');
        const input = document.getElementById('target_area');
        if (input) input.value = cell.dataset.area;
      });
    });
  }

  function renderLoginState() {
    const authenticated = auth.isAuthenticated();
    ui.loginScreen.classList.toggle('hidden', authenticated);
    ui.app.classList.toggle('hidden', !authenticated);
    if (authenticated) {
      renderApp();
    }
  }

  function renderApp() {
    renderNav();
    renderView();
  }

  function renderNav() {
    ui.nav.querySelectorAll('[data-view]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.view === state.activeView);
    });
  }

  function renderView() {
    const titleMap = {
      dashboard: 'Dashboard',
      teams: 'Mannschaften',
      players: 'Spieler',
      games: 'Spiele',
      shots: 'Wurferfassung',
      analytics: 'Analysen',
      halls: 'Hallen',
      settings: 'Einstellungen'
    };

    ui.topTitle.textContent = titleMap[state.activeView] || 'Dashboard';

    document.querySelectorAll('.view').forEach((view) => {
      view.classList.toggle('is-active', view.id === `view-${state.activeView}`);
    });

    renderDashboard();
    renderTeams();
    renderPlayers();
    renderGames();
    renderHalls();
    renderAnalytics();
    renderShots();
    renderSettings();
  }

  function renderDashboard() {
    const data = db.all();
    const teams = data.teams || [];
    const players = data.players || [];
    const games = data.games || [];
    const shots = data.shots || [];
    const goals = shots.filter((shot) => shot.result === 'Tor');
    const ratio = shots.length ? ((goals.length / shots.length) * 100).toFixed(1) : '0.0';

    document.getElementById('metric-teams').textContent = teams.length;
    document.getElementById('metric-players').textContent = players.length;
    document.getElementById('metric-games').textContent = games.length;
    document.getElementById('metric-shots').textContent = shots.length;
    document.getElementById('metric-goals').textContent = goals.length;
    document.getElementById('metric-ratio').textContent = `${ratio}%`;

    const recentGames = [...games].sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at)).slice(0, 5);
    const recentList = document.getElementById('recent-games');
    recentList.innerHTML = recentGames.length
      ? recentGames.map((game) => {
          const home = teams.find((team) => team.id === game.home_team_id)?.name || 'Unbekannt';
          const away = teams.find((team) => team.id === game.away_team_id)?.name || 'Unbekannt';
          return `<tr><td>${home}</td><td>${game.home_goals ?? 0}:${game.away_goals ?? 0}</td><td>${away}</td><td>${new Date(game.date || game.created_at).toLocaleDateString('de-DE')}</td></tr>`;
        }).join('')
      : '<tr><td colspan="4"><div class="empty-state">Noch keine Spiele erfasst.</div></td></tr>';

    renderChart('shotTrendChart', {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun'],
        datasets: [{
          label: 'Wurfquote',
          data: [43, 48, 52, 49, 56, Number(ratio)],
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56,189,248,0.15)',
          tension: 0.35,
          fill: true
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    renderChart('targetChart', {
      type: 'doughnut',
      data: {
        labels: ['Oben links', 'Mitte', 'Unten rechts', 'Sonstige'],
        datasets: [{
          data: [26, 41, 22, 11],
          backgroundColor: ['#38bdf8', '#8b5cf6', '#22c55e', '#fbbf24']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  function renderTeams() {
    const data = db.all();
    const teams = data.teams || [];
    const teamList = document.getElementById('team-list');
    teamList.innerHTML = teams.length
      ? teams.map((team) => `<tr><td>${team.name}</td><td>${team.club_name || '-'}</td><td>${team.league || '-'}</td><td>${team.home_hall_id ? (data.halls.find((hall) => hall.id === team.home_hall_id)?.name || '-') : '-'}</td></tr>`).join('')
      : '<tr><td colspan="4"><div class="empty-state">Noch keine Mannschaften angelegt.</div></td></tr>';

    const teamSelect = document.getElementById('team-select');
    if (teamSelect) {
      teamSelect.innerHTML = `<option value="">Mannschaft wählen</option>${teams.map((team) => `<option value="${team.id}">${team.name}</option>`).join('')}`;
    }

    const homeTeamSelect = document.querySelector('[name="home_team_id"]');
    if (homeTeamSelect) {
      homeTeamSelect.innerHTML = `<option value="">Bitte wählen</option>${teams.map((team) => `<option value="${team.id}">${team.name}</option>`).join('')}`;
    }

    const awayTeamSelect = document.querySelector('[name="away_team_id"]');
    if (awayTeamSelect) {
      awayTeamSelect.innerHTML = `<option value="">Bitte wählen</option>${teams.map((team) => `<option value="${team.id}">${team.name}</option>`).join('')}`;
    }

    const hallSelect = document.querySelector('[name="home_hall_id"]');
    if (hallSelect) {
      hallSelect.innerHTML = `<option value="">Bitte wählen</option>${(data.halls || []).map((hall) => `<option value="${hall.id}">${hall.name}</option>`).join('')}`;
    }

    const gameHallSelect = document.querySelector('[name="hall_id"]');
    if (gameHallSelect) {
      gameHallSelect.innerHTML = `<option value="">Bitte wählen</option>${(data.halls || []).map((hall) => `<option value="${hall.id}">${hall.name}</option>`).join('')}`;
    }
  }

  function renderPlayers() {
    const data = db.all();
    const players = data.players || [];
    const playerList = document.getElementById('player-list');
    playerList.innerHTML = players.length
      ? players.map((player) => {
          const team = data.teams.find((entry) => entry.id === player.team_id);
          return `<tr><td>${player.first_name} ${player.last_name}</td><td>${player.jersey_number || '-'}</td><td>${player.position || '-'}</td><td>${team ? team.name : '-'}</td></tr>`;
        }).join('')
      : '<tr><td colspan="4"><div class="empty-state">Noch keine Spieler angelegt.</div></td></tr>';

    const playerSelect = document.getElementById('player-select');
    if (playerSelect) {
      playerSelect.innerHTML = `<option value="">Spieler wählen</option>${players.map((player) => `<option value="${player.id}">${player.first_name} ${player.last_name}</option>`).join('')}`;
    }

    const teamSelect = document.getElementById('player-team-select');
    if (teamSelect) {
      teamSelect.innerHTML = `<option value="">Mannschaft wählen</option>${(data.teams || []).map((team) => `<option value="${team.id}">${team.name}</option>`).join('')}`;
    }
  }

  function renderGames() {
    const data = db.all();
    const games = data.games || [];
    const gameList = document.getElementById('game-list');
    gameList.innerHTML = games.length
      ? games.map((game) => {
          const home = data.teams.find((team) => team.id === game.home_team_id)?.name || 'Unbekannt';
          const away = data.teams.find((team) => team.id === game.away_team_id)?.name || 'Unbekannt';
          return `<tr><td>${home}</td><td>${game.home_goals ?? 0}:${game.away_goals ?? 0}</td><td>${away}</td><td>${game.status || 'geplant'}</td></tr>`;
        }).join('')
      : '<tr><td colspan="4"><div class="empty-state">Noch keine Spiele erfasst.</div></td></tr>';

    const gameSelect = document.getElementById('game-select');
    if (gameSelect) {
      gameSelect.innerHTML = `<option value="">Spiel wählen</option>${games.map((game) => `<option value="${game.id}">${game.home_team_id} vs ${game.away_team_id}</option>`).join('')}`;
    }
  }

  function renderHalls() {
    const halls = db.all().halls || [];
    const hallList = document.getElementById('hall-list');
    hallList.innerHTML = halls.length
      ? halls.map((hall) => `<tr><td>${hall.name}</td><td>${hall.city || '-'}</td><td>${hall.address || '-'}</td></tr>`).join('')
      : '<tr><td colspan="3"><div class="empty-state">Noch keine Hallen angelegt.</div></td></tr>';
  }

  function renderAnalytics() {
    const data = db.all();
    const shots = data.shots || [];
    const total = shots.length;
    const made = shots.filter((shot) => shot.result === 'Tor').length;
    const quota = total ? ((made / total) * 100).toFixed(1) : '0.0';

    const totalEl = document.getElementById('analytics-total');
    const metricEl = document.getElementById('analytics-metric');
    const goalsEl = document.getElementById('analytics-goals');
    if (totalEl) totalEl.textContent = total;
    if (metricEl) metricEl.textContent = `${quota}%`;
    if (goalsEl) goalsEl.textContent = made;

    renderChart('analyticsChart', {
      type: 'bar',
      data: {
        labels: ['Tor', 'Gehalten', 'Vorbei', 'Pfosten', 'Block'],
        datasets: [{
          label: 'Wurfergebnisse',
          data: [
            shots.filter((shot) => shot.result === 'Tor').length,
            shots.filter((shot) => shot.result === 'Torwart gehalten').length,
            shots.filter((shot) => shot.result === 'Vorbei').length,
            shots.filter((shot) => shot.result === 'Pfosten / Latte').length,
            shots.filter((shot) => shot.result === 'Block').length
          ],
          backgroundColor: ['#22c55e', '#38bdf8', '#fbbf24', '#f87171', '#8b5cf6']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  function renderShots() {
    const data = db.all();
    const shots = data.shots || [];
    const shotList = document.getElementById('shot-list');
    shotList.innerHTML = shots.length
      ? shots.map((shot) => {
          const player = data.players.find((entry) => entry.id === shot.player_id);
          const team = data.teams.find((entry) => entry.id === shot.team_id);
          return `<tr><td>${player ? `${player.first_name} ${player.last_name}` : '-'}</td><td>${team ? team.name : '-'}</td><td>${shot.result || '-'}</td><td>${shot.target_area || '-'}</td><td>${shot.minute || '-'}</td></tr>`;
        }).join('')
      : '<tr><td colspan="5"><div class="empty-state">Noch keine Würfe erfasst.</div></td></tr>';

    const xInput = document.getElementById('position_x');
    const yInput = document.getElementById('position_y');
    if (xInput && yInput) {
      renderFieldMarker(Number(xInput.value || 50), Number(yInput.value || 50));
    }
  }

  function renderSettings() {
    const status = auth.isAuthenticated() ? 'Aktiv' : 'Abgelaufen';
    const authStatus = document.getElementById('auth-status');
    const configUrl = document.getElementById('config-url');
    const configSupabaseUrl = document.getElementById('config-supabase-url');
    const configSupabaseAnonKey = document.getElementById('config-supabase-anon-key');
    const configSessionDuration = document.getElementById('config-session-duration');
    const configPasswordFunction = document.getElementById('config-password-function');
    if (authStatus) authStatus.value = status;
    if (configUrl) configUrl.value = window.HANDBALL_CONFIG.supabaseUrl || 'Noch nicht konfiguriert';
    if (configSupabaseUrl) configSupabaseUrl.value = window.HANDBALL_CONFIG.supabaseUrl || '';
    if (configSupabaseAnonKey) configSupabaseAnonKey.value = window.HANDBALL_CONFIG.supabaseAnonKey || '';
    if (configSessionDuration) configSessionDuration.value = window.HANDBALL_CONFIG.sessionDurationMinutes || 480;
    if (configPasswordFunction) configPasswordFunction.value = window.HANDBALL_CONFIG.passwordVerificationFunction || 'verify-password';
  }

  function renderFieldMarker(x, y) {
    const fieldMarker = document.getElementById('shot-field-marker');
    if (!fieldMarker) return;
    fieldMarker.setAttribute('cx', x);
    fieldMarker.setAttribute('cy', y);
    fieldMarker.setAttribute('r', '4');
    fieldMarker.style.display = 'block';
  }

  function renderChart(canvasId, config) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (state.chartRefs[canvasId]) {
      state.chartRefs[canvasId].destroy();
    }
    state.chartRefs[canvasId] = new Chart(canvas, config);
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => app.init());
