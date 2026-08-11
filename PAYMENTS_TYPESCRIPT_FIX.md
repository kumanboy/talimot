# Payment API TypeScript fix

Fixed `src/app/api/payments/manual/route.ts` metadata sanitization.

The previous implementation used `flatMap()` with tuples whose second item could be string, number, boolean, or null. TypeScript inferred incompatible tuple types during the Vercel build.

The new implementation builds an explicitly typed `Record<string, string | number | boolean | null>` with a normal loop, preserving the same sanitization behavior without tuple inference problems.
