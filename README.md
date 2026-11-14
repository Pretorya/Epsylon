# Epsylon

Migrate a Vercel-hosted Next.js app to sovereign European infrastructure with
[Coolify](https://coolify.io), compliant by default.

> **Status: early development.** The commands below exist but are not implemented yet.

## What it will do

| Command          | What it does                                                              |
| ---------------- | ------------------------------------------------------------------------- |
| `epsylon init`   | Analyses your repository and writes `epsylon.yaml`                        |
| `epsylon plan`   | Generates a `Dockerfile`, a `docker-compose.yml` and a migration runbook  |
| `epsylon check`  | Runs technical compliance checks (hosting region, secrets, TLS, backups…) |
| `epsylon deploy` | Deploys the generated configuration to your Coolify instance              |

Every command accepts `--json` for use in CI or by other tools.

`epsylon check` helps you spot technical gaps. It does not certify GDPR compliance.

## Development

Requires Node.js 24 or later and pnpm.

```bash
pnpm install
pnpm dev --help   # run the CLI from source
pnpm test
pnpm lint
pnpm build
```

Design documents (in French) live in [`docs/`](docs).

## License

[Apache 2.0](LICENSE)
