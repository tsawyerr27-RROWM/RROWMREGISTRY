# Phase 1 validation baselines

Archive outputs for PR6 / release candidate sign-off (spec §2.5.4).

| Artifact | Filename pattern | Producer |
|----------|------------------|----------|
| System validation JSON | `validate-system-YYYYMMDD.json` | `npm run validate:system` |
| Historical replay log | `validate-replay-YYYYMMDD.txt` | `npm run validate:replay` |
| Redirect smoke log | `redirect-smoke-YYYYMMDD.txt` | `./scripts/phase-1-redirect-smoke.sh` |
| Static acceptance JSON | `static-acceptance-YYYYMMDD.json` | `npx tsx scripts/phase-1-static-acceptance.ts` |
| Staging registry IDs | `replay-registry-ids.txt` | Engineering (3–5 IDs) |

Do not commit secrets. `DATABASE_URL` stays in CI/staging env only.
