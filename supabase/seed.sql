-- Mess Update — sample data so the app is never empty for a marker.
-- Run AFTER schema.sql, in the SQL Editor (it runs as the owner, so RLS does not block it).
-- Re-running is safe: it re-creates the next 7 days of meals and today's queue reports.
-- WARNING: re-running deletes feedback attached to the meals it replaces.

-- Dates and times follow the campus time zone, not the server's (UTC), so "today" in the
-- app matches "today" here.
create temporary table seed_clock as
select (now() at time zone 'Pacific/Port_Moresby')::date as today,
       (now() at time zone 'Pacific/Port_Moresby')::time as time_now;

-- Unitech Mess (dining hall), PNG University of Technology, Lae — from Google Maps.
insert into public.mess_locations (name, latitude, longitude)
select 'Main Mess', -6.67421, 146.99226
where not exists (select 1 from public.mess_locations where name = 'Main Mess');

-- Moves the pin if an older run saved approximate coordinates.
update public.mess_locations
set latitude = -6.67421, longitude = 146.99226
where name = 'Main Mess';

-- ---------------------------------------------------------------------------
-- Weekly meal plan (Monday = 1 … Sunday = 7), rotating the mess's real menu.
-- Milo or coffee every breakfast, cordial every lunch, tea every dinner.
-- ---------------------------------------------------------------------------
create temporary table weekly_menu (
  day_of_week int, meal_type text, main_dish text, side_dish text, drink text, description text
);

insert into weekly_menu values
  -- Breakfast
  (1, 'breakfast', 'Scrambled eggs', 'Bread with peanut butter', 'Milo or coffee', 'Scrambled eggs served with bread and peanut butter.'),
  (2, 'breakfast', 'Boiled eggs',    'Bread and butter',         'Milo or coffee', 'Boiled eggs served with buttered bread.'),
  (3, 'breakfast', 'Baked beans',    'Bread and butter',         'Milo or coffee', 'Baked beans served with buttered bread.'),
  (4, 'breakfast', 'Sausages',       'Bread and jam',            'Milo or coffee', 'Sausages served with bread and jam.'),
  (5, 'breakfast', 'Scrambled eggs', 'Bread with peanut butter', 'Milo or coffee', 'Scrambled eggs served with bread and peanut butter.'),
  (6, 'breakfast', 'Baked beans',    'Bread and butter',         'Milo or coffee', 'Baked beans served with buttered bread.'),
  (7, 'breakfast', 'Boiled eggs',    'Bread and butter',         'Milo or coffee', 'Boiled eggs served with buttered bread.'),
  -- Lunch
  (1, 'lunch', 'Mince meat',     'Rice and vegetables', 'Cordial', 'Mince meat served with rice and vegetables.'),
  (2, 'lunch', 'Sausage stew',   'Rice and vegetables', 'Cordial', 'Sausage stew served with rice and vegetables.'),
  (3, 'lunch', 'Besta tinfish',  'Rice and vegetables', 'Cordial', 'Besta tinfish served with rice and vegetables.'),
  (4, 'lunch', 'Mince meat',     'Rice and vegetables', 'Cordial', 'Mince meat served with rice and vegetables.'),
  (5, 'lunch', 'Sausage stew',   'Rice and vegetables', 'Cordial', 'Sausage stew served with rice and vegetables.'),
  (6, 'lunch', 'Besta tinfish',  'Rice and vegetables', 'Cordial', 'Besta tinfish served with rice and vegetables.'),
  (7, 'lunch', 'Mince meat',     'Rice and vegetables', 'Cordial', 'Mince meat served with rice and vegetables.'),
  -- Dinner
  (1, 'dinner', 'Boiled chicken', 'Sweet potato and vegetables',        'Tea', 'Boiled chicken served with sweet potato and vegetables.'),
  (2, 'dinner', 'Fish fillet',    'Side salad',                         'Tea', 'Fish fillet served with a side salad.'),
  (3, 'dinner', 'Beef stew',      'Rice and vegetables',                'Tea', 'Beef stew served with rice and vegetables.'),
  (4, 'dinner', 'Globe',          'Stir-fry noodles and vegetables',    'Tea', 'Globe served with stir-fry noodles and vegetables.'),
  (5, 'dinner', 'Fish fillet',    'Side salad',                         'Tea', 'Fish fillet served with a side salad.'),
  (6, 'dinner', 'Boiled chicken', 'Sweet potato and vegetables',        'Tea', 'Boiled chicken served with sweet potato and vegetables.'),
  (7, 'dinner', 'Beef stew',      'Rice and vegetables',                'Tea', 'Beef stew served with rice and vegetables.');

-- Serving times for each meal.
create temporary table serving_times (meal_type text, serving_start time, serving_end time);
insert into serving_times values
  ('breakfast', '06:30', '08:30'),
  ('lunch',     '11:30', '13:30'),
  ('dinner',    '17:30', '19:30');

-- Replace the meals for today and the next 6 days.
delete from public.meals
where meal_date between (select today from seed_clock) and (select today from seed_clock) + 6;

insert into public.meals (meal_date, meal_type, main_dish, side_dish, drink, description, status, serving_start, serving_end)
select d::date, w.meal_type, w.main_dish, w.side_dish, w.drink, w.description,
       -- Today's status follows the current campus time; later days are upcoming.
       case
         when d::date > c.today then 'upcoming'
         when c.time_now >= t.serving_end then 'finished'
         when c.time_now >= t.serving_start then 'serving'
         else 'upcoming'
       end,
       t.serving_start, t.serving_end
from seed_clock c
cross join generate_series(c.today, c.today + 6, interval '1 day') as d
join weekly_menu w on w.day_of_week = extract(isodow from d)::int
join serving_times t on t.meal_type = w.meal_type;

-- Today's queue reports at realistic times around each meal (newest is the current
-- status). Only reports whose time has already passed today are added, so running this
-- at night shows tonight's dinner reports, and running it early morning shows none yet.
delete from public.queue_status where reported_at >= now() - interval '24 hours';

insert into public.queue_status (location_id, status, wait_min, wait_max, note, reported_at, updated_by)
select l.id, q.status, q.wait_min, q.wait_max, q.note,
       (c.today + q.at_time) at time zone 'Pacific/Port_Moresby', null
from public.mess_locations l
cross join seed_clock c
cross join (values
  (time '06:40', 'quiet',     0,  5, null),
  (time '07:10', 'busy',     15, 20, 'Breakfast rush'),
  (time '08:05', 'quiet',     0,  5, null),
  (time '11:40', 'moderate', 10, 15, null),
  (time '12:10', 'busy',     20, 30, 'Lunch rush, line past the door'),
  (time '13:00', 'moderate',  5, 10, null),
  (time '13:20', 'quiet',     0,  5, null),
  (time '17:40', 'moderate', 10, 15, null),
  (time '18:15', 'busy',     20, 25, 'Dinner rush'),
  (time '19:10', 'quiet',     0,  5, null)
) as q(at_time, status, wait_min, wait_max, note)
where l.name = 'Main Mess'
  and q.at_time <= c.time_now;

drop table seed_clock, weekly_menu, serving_times;

-- Make your own account an admin (run once, with your email):
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'you@example.com');
