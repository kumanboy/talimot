# Security

## Current dependency advisories

The initial application foundation currently reports five distinct advisories:

| Advisory | Affected package | Exposure |
| --- | --- | --- |
| [GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg) | `brace-expansion` | Development-only lint tooling through ESLint and `eslint-config-next` |
| [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93) | Next.js's nested `postcss` | Production dependency metadata; used during CSS build processing |
| [GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q) | Next.js's nested `postcss` | Production dependency metadata; used during CSS and source-map build processing |
| [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849) | Next.js's nested `postcss` | Production dependency metadata; used during CSS and source-map build processing |
| [GHSA-f88m-g3jw-g9cj](https://github.com/advisories/GHSA-f88m-g3jw-g9cj) | Optional `sharp` dependency | Optional production image-processing path |

The `brace-expansion` advisory is excluded by `npm audit --omit=dev` and is not
part of the deployed application runtime. PostCSS currently processes trusted
local CSS only. The application does not currently use Next.js image
optimization, so Sharp's vulnerable path is unused.

## Remediation position

`npm audit fix` and `npm audit fix --force` were rejected because npm proposes
incompatible major-version changes and obsolete framework downgrades rather
than a supported Next.js dependency update. In particular, the forced
resolution would replace the current App Router-compatible framework or lint
configuration with versions that are not compatible with this foundation.
Dependency overrides are not applied.

The project must upgrade to the first compatible patched stable Next.js release
that resolves the affected nested PostCSS and Sharp versions. Production
deployment requires another security review, including fresh full and
production-only npm audits, before approval.
