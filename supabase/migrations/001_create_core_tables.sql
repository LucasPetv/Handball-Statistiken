create extension if not exists "pgcrypto";

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  club_name text,
  age_group text,
  league text,
  gender text,
  home_hall_id uuid,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.halls (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  city text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  jersey_number integer,
  position text,
  birth_year integer,
  photo_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  home_team_id uuid references public.teams(id) on delete cascade,
  away_team_id uuid references public.teams(id) on delete cascade,
  hall_id uuid references public.halls(id),
  game_date date,
  kick_off_time time,
  competition text,
  home_goals integer default 0,
  away_goals integer default 0,
  halftime_home_goals integer,
  halftime_away_goals integer,
  status text default 'planned',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shots (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references public.games(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  player_id uuid references public.players(id) on delete cascade,
  position_x numeric(5,2) default 0,
  position_y numeric(5,2) default 0,
  target_area text,
  target_x numeric(5,2),
  target_y numeric(5,2),
  result text,
  minute integer,
  shot_type text,
  game_context text,
  assist_player_id uuid references public.players(id),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_teams_home_hall_id on public.teams(home_hall_id);
create index if not exists idx_players_team_id on public.players(team_id);
create index if not exists idx_games_home_team_id on public.games(home_team_id);
create index if not exists idx_games_away_team_id on public.games(away_team_id);
create index if not exists idx_games_date on public.games(game_date);
create index if not exists idx_shots_game_id on public.shots(game_id);
create index if not exists idx_shots_player_id on public.shots(player_id);
create index if not exists idx_shots_team_id on public.shots(team_id);
