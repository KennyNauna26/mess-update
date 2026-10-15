-- Mess Update — sample data so the app is never empty for a marker.
-- Run AFTER schema.sql, in the SQL Editor (it runs as the owner, so RLS does not block it).
-- Re-running is safe: it clears and re-creates today's sample meals and queue reports.

-- TODO before submission: replace with the real mess coordinates (long-press the spot
-- in Google Maps to copy them). These are approximate PNG Unitech, Lae campus values.
insert into public.mess_locations (name, latitude, longitude)
select 'Main Mess', -6.6703, 146.9917
where not exists (select 1 from public.mess_locations where name = 'Main Mess');

-- Meals for today and the next 6 days.
delete from public.meals where meal_date between current_date and current_date + 6;

insert into public.meals (meal_date, meal_type, main_dish, side_dish, drink, description, status, serving_start, serving_end)
select d::date, m.meal_type, m.main_dish, m.side_dish, m.drink, m.description,
       case when d::date = current_date then m.today_status else 'upcoming' end,
       m.serving_start, m.serving_end
from generate_series(current_date, current_date + 6, interval '1 day') as d
cross join (values
  ('breakfast', 'Scrambled eggs',  'Bread and banana', 'Tea or coffee',
   'Eggs with toasted bread and fresh banana.', 'finished', time '06:30', time '08:30'),
  ('lunch',     'Chicken curry',   'Rice and mixed vegetables', 'Orange juice',
   'Mild chicken curry with steamed rice.', 'serving', time '11:30', time '13:30'),
  ('dinner',    'Fried rice',      'Kaukau and greens', 'Water',
   'Vegetable fried rice with kaukau and greens.', 'upcoming', time '17:30', time '19:30')
) as m(meal_type, main_dish, side_dish, drink, description, today_status, serving_start, serving_end);

-- Today's queue reports (newest is the current status).
delete from public.queue_status where reported_at >= current_date;

insert into public.queue_status (location_id, status, wait_min, wait_max, note, reported_at, updated_by)
select l.id, q.status, q.wait_min, q.wait_max, q.note, now() - q.ago, null
from public.mess_locations l
cross join (values
  ('busy',     20, 30, 'Lunch rush, line past the door', interval '5 minutes'),
  ('moderate', 10, 15, null,                             interval '35 minutes'),
  ('quiet',     0,  5, null,                             interval '75 minutes'),
  ('moderate', 10, 15, null,                             interval '4 hours'),
  ('busy',     25, 35, 'Breakfast rush',                 interval '5 hours')
) as q(status, wait_min, wait_max, note, ago)
where l.name = 'Main Mess';

-- Make your own account an admin (run once, with your email):
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'you@example.com');
