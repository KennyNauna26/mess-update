# Mess Update

**Check the food. Check the queue. Then go.**

Mess Update is an Android app for university students. It shows the campus mess's daily menu, the current queue status with an estimated wait, and where the mess is on a map, so students can decide when to go before they walk there. Students can rate meals and manage their own feedback, and they can turn on daily meal-time reminders. Menus and the queue stay readable offline from the last successful load.

- **Student:** Kenny Nauna — student number 24202171
- **Test account:** the login for marking is given in the technical report.
- **Unit:** IS325 Mobile App Development, PNG University of Technology

## Tech stack

React Native + Expo (managed workflow, Expo Router, TypeScript) · Supabase (Auth, Postgres, Row Level Security) · TanStack Query · React Hook Form + Zod · AsyncStorage · expo-location + react-native-maps · expo-notifications.

## Setup from a clean clone

You need Node.js LTS, Git, VS Code, and **Expo Go** on an Android phone (at the class SDK version).

### 1. Install packages

```bash
npm install
npx expo install --fix   # aligns every Expo package with the installed SDK
```

> The project uses **Expo SDK 57**. Expo Go on the phone must support SDK 57; otherwise
> install the APK from the EAS build instead.

### 2. Create the Supabase project

1. Create a free project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query:** paste `supabase/schema.sql` and run it. Then do the same with `supabase/seed.sql`.
3. **Authentication → Email Templates → Reset Password:** add the code line to the template so the reset can finish inside the app:
   ```html
   <p>Your Mess Update reset code is: <strong>{{ .Token }}</strong></p>
   ```
4. **Project Settings → API:** copy the Project URL and the **anon public** key. Never use the `service_role` key in the app.

### 3. Environment variables

```bash
cp .env.example .env     # Windows PowerShell: copy .env.example .env
```

Then fill in `.env`:

| Variable | Used for |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `GOOGLE_MAPS_ANDROID_API_KEY` | Google Maps in the compiled APK only (Expo Go ignores it) |

### 4. Run in Expo Go

```bash
npx expo start           # if the QR code will not connect: npx expo start --tunnel
```

Scan the QR code with Expo Go. Register an account, confirm the email, and log in.

### 5. Make yourself the mess admin (optional)

Run this in the SQL Editor with your email. Admins update menus and the queue in **Table Editor → meals / queue_status**:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

## External APIs and services

| Service | Purpose |
| --- | --- |
| Supabase Auth + Postgres | Accounts, password reset, meals, queue reports, feedback (RLS on every table) |
| expo-location (Group A) | Device position for distance to the mess |
| react-native-maps / Google Maps (Group A) | Map with mess markers from the `mess_locations` table |
| expo-notifications (Group B) | Daily local reminders 15 minutes before each meal (Profile → Meal reminders) |

## Building the APK and AAB

```bash
npm install -g eas-cli
eas login
eas init
# Store the env vars for cloud builds (they are not read from .env):
eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value <url> --visibility plaintext
eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <key> --visibility plaintext
eas env:create --environment preview --name GOOGLE_MAPS_ANDROID_API_KEY --value <key> --visibility sensitive
# Repeat for --environment production, then:
eas build --platform android --profile preview      # installable APK
eas build --platform android --profile production   # Play Store AAB
```

## Project structure

```
app/                 routes only (Expo Router)
  (auth)/            login, register, forgot-password — signed-out only
  (app)/             auth boundary: redirects to /login without a session
    (tabs)/          Home, Menu, Queue, Map, Profile
    meal/[id].tsx    meal details
    feedback/        list, detail, create/edit form
src/
  components/        reusable UI (buttons, fields, cards, state views)
  context/           AuthProvider (session available app-wide)
  hooks/             TanStack Query hooks used by screens
  services/          every Supabase and device-API call — no UI here
  lib/               Supabase client, QueryClient
  theme/             colours, type scale, spacing
  types/ utils/      models, formatters, Zod schemas, error messages
supabase/            schema.sql (tables + RLS), seed.sql (sample data)
```

## Screenshots

_Screenshots from a real device are added in `docs/screenshots/`._

## Known limitations

- Queue status is reported by the mess admin; the app does not count people. Every report shows when it was made, and reports older than an hour are flagged.
- Admins use the Supabase dashboard; there are no in-app admin screens in v1.
- The Supabase free plan pauses a project after 7 days without activity. If the app shows a connection error, resume the project in the Supabase dashboard.
- The Google Maps key is supplied only through EAS environment variables. Without it, the map can render blank, but the distance and the mess details still show.
- Offline mode is read-only. Menus, the queue and the mess location come from the last successful load, and creating or editing feedback needs a connection.
- Reminders use the default serving times (06:30, 11:30, 17:30) until today's meals have loaded.

## Open-source libraries

Built with Expo and React Native, Expo Router, Supabase JS, TanStack Query, React Hook Form, Zod, AsyncStorage, NetInfo, expo-location, react-native-maps, expo-notifications and Ionicons (@expo/vector-icons). Thanks to their maintainers.

## AI assistance

Claude (Anthropic) was used to review the M1 plan against the project brief and to scaffold the initial project: folder structure, Supabase schema and RLS policies, auth flow and first screens. I have reviewed every file and can explain how each part works. Claude was also used to help with the Expo SDK 57 upgrade, EAS build fixes, the offline cache, meal reminders, error messages, the seed data and the technical report draft. I reviewed, tested and can explain every change.
