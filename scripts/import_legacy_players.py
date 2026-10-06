#!/usr/bin/env python3
"""Loads the scraped player spreadsheet into Supabase `legacy_players`
and copies the player photos into the `legacy-avatars` storage bucket.

Run supabase/schema_legacy_players.sql in the SQL editor first.

  # Preview only — reads the files, prints what WOULD be uploaded, writes nothing
  python3 scripts/import_legacy_players.py ~/cricheroes_scraper

  # Real upload (needs the SERVICE ROLE key — keep it out of git and out of the app)
  export SUPABASE_URL=https://xxxx.supabase.co
  export SUPABASE_SERVICE_ROLE_KEY=...
  python3 scripts/import_legacy_players.py ~/cricheroes_scraper --commit

Re-running is safe: rows are matched on source_player_id and updated in place,
and `claimed_by` is never touched, so users who already claimed keep their link.

Deliberately NOT imported: date of birth, personal statements, follower
counts, profile URLs, umpire phone numbers/fees.
"""
import argparse, json, mimetypes, os, sys, urllib.error, urllib.request, uuid
import pandas as pd

NAMESPACE = uuid.UUID('6f1b0e0e-3c1a-4b7e-9d0a-0c1c7a7c1a11')  # fixed → stable ids across re-runs
BUCKET = 'legacy-avatars'
BATCH = 200

INT_COLS = {'matches_count': 'matches_played', 'runs': 'runs_scored', 'wickets': 'wickets_taken',
            'fifties': 'fifties', 'hundreds': 'hundreds', 'fours': 'fours', 'sixes': 'sixes', 'catches': 'catches'}
NUM_COLS = {'batting_avg': 'batting_avg', 'strike_rate': 'strike_rate', 'bowling_avg': 'bowling_avg', 'economy': 'economy'}
TEXT_COLS = {'role': 'role', 'batting_style': 'batting_style', 'bowling_style': 'bowling_style',
             'highest_runs': 'highest_runs', 'best_bowling': 'best_bowling'}


def clean(v):
    if v is None or (isinstance(v, float) and pd.isna(v)) or (not isinstance(v, (str, list)) and pd.isna(v)):
        return None
    if isinstance(v, str):
        v = v.strip()
        return v or None
    return v


def to_int(v):
    v = clean(v)
    try: return int(float(v)) if v is not None else None
    except (TypeError, ValueError): return None


def to_num(v):
    v = clean(v)
    try: return round(float(v), 2) if v is not None else None
    except (TypeError, ValueError): return None


def city_of(v):
    v = clean(v)
    if not v: return None
    return v.split('(')[0].strip() or None   # "Bengaluru (Bangalore)" -> "Bengaluru"


def build_rows(folder):
    df = pd.read_excel(os.path.join(folder, 'bangalore_players_clean.xlsx'))
    rows, skipped = [], 0
    for _, r in df.iterrows():
        name, pid = clean(r.get('name')), clean(r.get('player_id'))
        if not name or len(name) < 2 or pid is None:
            skipped += 1
            continue
        pid = str(int(pid)) if isinstance(pid, (int, float)) else str(pid)
        teams = [t.strip() for t in (clean(r.get('teams')) or '').split(',') if t.strip()]
        row = {
            'id': str(uuid.uuid5(NAMESPACE, pid)),
            'source_player_id': pid,
            'name': name,
            'city': city_of(r.get('city')),
            'teams': teams,
            'team_name': teams[0] if teams else None,
        }
        for src, dst in INT_COLS.items(): row[dst] = to_int(r.get(src))
        # The scrape wrote 0.0 for averages/strike rate/economy it couldn't read
        # (891 of 1,095 players with 100+ runs have avg 0.0), so 0 means "unknown".
        for src, dst in NUM_COLS.items(): row[dst] = to_num(r.get(src)) or None
        for src, dst in TEXT_COLS.items():
            val = clean(r.get(src))
            row[dst] = str(val) if val is not None else None
        row['_image'] = clean(r.get('local_image_path'))
        rows.append(row)
    return rows, skipped


def http(method, url, key, body=None, headers=None):
    h = {'apikey': key, 'Authorization': f'Bearer {key}'}
    h.update(headers or {})
    req = urllib.request.Request(url, data=body, method=method, headers=h)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('folder', help='scraper folder containing bangalore_players_clean.xlsx and player_images/')
    ap.add_argument('--commit', action='store_true', help='actually upload (default is a dry run)')
    a = ap.parse_args()
    folder = os.path.expanduser(a.folder)

    rows, skipped = build_rows(folder)
    with_img = [r for r in rows if r['_image'] and os.path.exists(os.path.join(folder, r['_image']))]
    print(f'players to import : {len(rows)}  (skipped {skipped} with no usable name/id)')
    print(f'photos to upload  : {len(with_img)}')
    print(f'with teams        : {sum(1 for r in rows if r["teams"])}')
    print(f'with career stats : {sum(1 for r in rows if r["matches_played"])}')
    if not a.commit:
        print('\nDRY RUN — nothing written. Re-run with --commit to upload.')
        return

    url, key = os.environ.get('SUPABASE_URL'), os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    if not url or not key:
        sys.exit('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.')
    url = url.rstrip('/')

    # 1. photos → storage (idempotent via x-upsert)
    ok = failed = 0
    for r in with_img:
        path = os.path.join(folder, r['_image'])
        ctype = mimetypes.guess_type(path)[0] or 'image/jpeg'
        name = f"{r['id']}{os.path.splitext(path)[1].lower() or '.jpg'}"
        with open(path, 'rb') as f:
            status, body = http('POST', f'{url}/storage/v1/object/{BUCKET}/{name}', key, f.read(),
                                {'Content-Type': ctype, 'x-upsert': 'true'})
        if status in (200, 201):
            r['photo_url'] = f'{url}/storage/v1/object/public/{BUCKET}/{name}'
            ok += 1
        else:
            failed += 1
            print(f'  photo failed ({status}): {name} {body[:120]!r}')
        if (ok + failed) % 100 == 0:
            print(f'  photos {ok + failed}/{len(with_img)}')
    print(f'photos uploaded: {ok}, failed: {failed}')

    # 2. rows → table. Every object must carry the same keys for PostgREST bulk upsert.
    payload = []
    for r in rows:
        d = {k: v for k, v in r.items() if k != '_image'}
        d.setdefault('photo_url', None)
        payload.append(d)
    sent = 0
    for i in range(0, len(payload), BATCH):
        chunk = payload[i:i + BATCH]
        status, body = http('POST', f'{url}/rest/v1/legacy_players?on_conflict=source_player_id', key,
                            json.dumps(chunk).encode(),
                            {'Content-Type': 'application/json',
                             'Prefer': 'resolution=merge-duplicates,return=minimal'})
        if status not in (200, 201, 204):
            sys.exit(f'Row upload failed at batch {i // BATCH} ({status}): {body[:300]!r}')
        sent += len(chunk)
        print(f'  rows {sent}/{len(payload)}')
    print('Done.')


if __name__ == '__main__':
    main()
