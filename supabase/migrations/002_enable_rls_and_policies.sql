alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.games enable row level security;
alter table public.shots enable row level security;
alter table public.halls enable row level security;

create policy "Allow authenticated read access to teams" on public.teams
for select to authenticated using (true);
create policy "Allow authenticated write access to teams" on public.teams
for all to authenticated using (true) with check (true);

create policy "Allow authenticated read access to players" on public.players
for select to authenticated using (true);
create policy "Allow authenticated write access to players" on public.players
for all to authenticated using (true) with check (true);

create policy "Allow authenticated read access to games" on public.games
for select to authenticated using (true);
create policy "Allow authenticated write access to games" on public.games
for all to authenticated using (true) with check (true);

create policy "Allow authenticated read access to shots" on public.shots
for select to authenticated using (true);
create policy "Allow authenticated write access to shots" on public.shots
for all to authenticated using (true) with check (true);

create policy "Allow authenticated read access to halls" on public.halls
for select to authenticated using (true);
create policy "Allow authenticated write access to halls" on public.halls
for all to authenticated using (true) with check (true);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_teams
before update on public.teams
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_players
before update on public.players
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_games
before update on public.games
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_shots
before update on public.shots
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_halls
before update on public.halls
for each row execute procedure public.set_updated_at();
