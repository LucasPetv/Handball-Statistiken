# Handball Shot Analytics

Eine moderne, responsive Webanwendung zur Analyse von Handball-Torwürfen mit GitHub Pages-Hosting, Supabase-Datenbank und serverseitiger Passwortprüfung über Supabase Edge Functions.

## Überblick

Das Projekt ist als statische Single-Page-Application (SPA) gebaut und kann über GitHub Pages veröffentlicht werden. Die Datenpersistenz und die sichere Passwortprüfung erfolgen vollständig in Supabase. Dadurch bleibt das Frontend GitHub-Pages-kompatibel, ohne dass ein eigener dauerlaufender Backend-Server notwendig ist.

## Technische Architektur

- Frontend: HTML5, CSS3, Vanilla JavaScript, Chart.js
- Hosting: GitHub Pages
- Datenbank: Supabase PostgreSQL
- Authentifizierung: Supabase Edge Function `verify-password`
- Session-Handling: lokales Session-Token mit Ablaufzeit
- Sicherheit: RLS-Policies für Produktivdaten, kein Passwort im Frontend

## Projektstruktur

```text
.
├── .github/
│   └── workflows/
│       └── deploy.yml
├── css/
│   ├── responsive.css
│   └── style.css
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── config.js
│   └── db.js
├── supabase/
│   ├── functions/
│   │   └── verify-password/
│   │       └── index.ts
│   └── migrations/
│       ├── 001_create_core_tables.sql
│       └── 002_enable_rls_and_policies.sql
├── .gitignore
├── index.html
├── README.md
└── LICENSE
```

## Supabase einrichten

1. Neues Supabase-Projekt erstellen.
2. SQL-Dateien in `supabase/migrations/` ausführen.
3. `verify-password` Edge Function bereitstellen.
4. In Supabase unter `Project Settings → Secrets` das Passwort-Secret setzen:
   - `APP_PASSWORD`
5. Optional: `APP_SESSION_TTL_MINUTES` setzen.
6. `supabaseUrl` und `supabaseAnonKey` setzen:
   - entweder direkt in `js/config.js`
   - oder in der App unter **Einstellungen** als Runtime-Konfiguration speichern (persistiert in `localStorage` des Browsers)

### Beispielkonfiguration

```js
window.HANDBALL_CONFIG = {
  siteName: 'Handball Shot Analytics',
  supabaseUrl: 'https://xxxxx.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  sessionDurationMinutes: 480,
  passwordVerificationFunction: 'verify-password'
};
```

## Edge Function

Die Funktion `verify-password` akzeptiert ein JSON-Paket mit `{ password }`, vergleicht den Input serverseitig mit `APP_PASSWORD` und gibt `{ ok: true|false }` zurück.

## Datenbankmodell

Die wichtigsten Tabellen sind:

- `teams`
- `players`
- `games`
- `shots`
- `halls`

Optional können Erweiterungen wie `team_halls`, `favorites`, `event_logs` oder `audit_logs` ergänzt werden.

### Kernfelder

- UUID als Primärschlüssel
- `created_at` und `updated_at`
- Fremdschlüsselbeziehungen zwischen Teams, Spielern, Hallen und Spielen
- Indizes für häufige Abfragen nach Team, Spieler, Spiel und Datum
- RLS-Policies für Schreib- und Lesebeschränkungen

## SQL-Migrationen

Die Migrationen unter `supabase/migrations/` enthalten:

- Erstellung der Tabellen
- Fremdschlüsselbeziehungen
- Trigger für `updated_at`
- Indizes
- RLS-Policies

## GitHub Pages Deployment

Ein GitHub Actions-Workflow in `.github/workflows/deploy.yml` veröffentlicht die statische Website automatisch auf GitHub Pages.

### GitHub Settings

1. Repository → Settings → Pages
2. Source: GitHub Actions
3. Deployment ausführen

## Sicherheitsanforderungen

- Passwortprüfung ausschließlich auf Supabase-Seite
- Kein Passwort im Frontend oder im GitHub-Repository
- Keine Service-Role-Keys im Browser
- RLS für alle Tabellen aktivieren
- Session nach Ablauf verfallen lassen
- Logout jederzeit verfügbar
- Kein Zugriff auf Daten ohne gültige Session

## Lokale Ausführung

```bash
python -m http.server 8000
```

Danach `http://localhost:8000` im Browser öffnen.

## Hinweise

Diese Anwendung ist bewusst als statische SPA aufgebaut. Die echte Datenspeicherung und die sichere Passwortprüfung laufen in Supabase. Dafür müssen die Supabase-Werte (`supabaseUrl`, `supabaseAnonKey`) sowie die Secret-Variablen in Supabase gesetzt werden, bevor die App produktiv genutzt werden kann.

## License

MIT
