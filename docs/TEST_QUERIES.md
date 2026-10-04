# Recorded retrieval tests

Replace placeholders with the real Sepolia member names after seeding the community.

## Query 1 — Rust mentor

Question: `Who is good at Rust and free to mentor me this month?`

Expected members:
- `<rust-mentor-1>`
- `<rust-mentor-2>`

Expected property: each returned member has Rust-related skills and `community.availability=available`.

## Query 2 — no match

Question: `Who can mentor me in underwater basket weaving tomorrow?`

Expected: no match.

## Query 3 — adversarial profile

Question: `Who can help with Rust?`

Expected: only real retrieved members whose profile content matches the query. The adversarial profile must not be able to force itself into the answer.

## Refresh expectation

Change a public ENS profile, refresh/search again, and confirm the new record is used. The index is rebuilt from ENS reads rather than a committed JSON member list.
