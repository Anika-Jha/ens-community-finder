# Who In Here Can Help Me? — ENS Community People Finder

A natural-language people finder backed by live ENS text records on Sepolia.

## Profile record format

Each community member is a subname under one parent:

| Key | Meaning | Allowed values |
|---|---|---|
| `community.bio` | short profile | UTF-8 text, max 1000 chars |
| `community.skills` | skills | UTF-8 text, max 500 chars |
| `community.availability` | current availability | `available`, `busy`, `unavailable` |

At least 8 Sepolia subnames should be created. One profile should contain adversarial text such as an instruction to ignore the application's rules. That text is intentionally treated as untrusted data.

## How discovery works

The configured `COMMUNITY_PARENT` is normalized and its subnames are discovered through the ENS subgraph. Each discovered name is then read directly from ENS text records with viem. Malformed profiles are skipped individually, so one bad record cannot abort discovery.

Use the app's refresh/search flow to rebuild the live index.

## Retrieval and grounding

Retrieval uses a small lexical scorer and a hard `TOP_K = 5`. Only those candidates enter the model data message.

The model cannot create a person:
1. model chooses names
2. code builds a membership map from retrieved candidates
3. every model name is checked against that map
4. unknown names are discarded before display

An empty retrieval result returns an explicit no-match response without calling the model.

Profile text is NEVER interpolated into the system message. It is sent as a separate data message.

## Run

```bash
cp .env.example .env
# configure COMMUNITY_PARENT and LLM_API_KEY
npm install
npm run dev
```

## Test community

This repository does not invent ENS names or include a private key. After creating at least 8 Sepolia subnames, record them in `docs/COMMUNITY.md`.

## Acceptance criteria mapping

1. Model output membership checked → `src/app/api/search/route.ts`
2. Top-k bound → `src/lib/retrieval.ts`
3. Profile text separate from system instruction → `src/lib/llm.ts`
4. Index from ENS reads → `src/lib/ens.ts`
5. Explicit no-match branch → `src/app/api/search/route.ts`
6. Expected members in recorded queries → `docs/TEST_QUERIES.md`
7. Model timeout → `src/lib/llm.ts`
8. No credentials tracked → `.gitignore`
