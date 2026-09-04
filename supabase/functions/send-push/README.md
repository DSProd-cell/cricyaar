# Deploying `send-push`

Everything here is written and tested (see `send-push.test.ts` — the FCM
message-building and event-detection logic is verified without needing real
credentials). Two steps are left that only you can do, since they need your
Firebase/Supabase login:

## 1. Get a Firebase service account key

Firebase console → your project → gear icon → **Project settings** →
**Service accounts** tab → **Generate new private key**. It downloads a
`.json` file — keep it private, don't commit it (it's a real credential,
unlike `google-services.json`).

## 2. Deploy the function and set its secrets

From `cricyaar/`, with the Supabase CLI (`npx supabase ...` works fine, no
global install needed):

```bash
npx supabase login
npx supabase link --project-ref okqbagfyuizvahhpimuh
npx supabase functions deploy send-push --no-verify-jwt
npx supabase secrets set FIREBASE_SERVICE_ACCOUNT="$(cat /path/to/the-downloaded-key.json)"
npx supabase secrets set PUSH_TRIGGER_SECRET=e54d03ef8b9b361bf05271154e9fff889a833b6c4818978d
```

That last value must match the one in `schema_notify_ground_approved.sql` —
it already does, just don't change one without the other.

## 3. Run the SQL

Once the function is deployed, run `supabase/schema_notify_ground_approved.sql`
in the SQL Editor, same as every other schema file.

## Testing it for real

Approve a pending ground (Table Editor → `grounds` → set a row's `status` to
`approved`) with that ground's owner logged into the app on a device that
has a push token registered — a real Android notification should arrive.
