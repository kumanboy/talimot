# Punktuatsiya test runner UX fix

The standard runner now detects contextual questions even when they do not contain `/` or `//`.

For questions such as:
- instruction: `Berilgan parchada ... aniqlang.`
- passage: the quoted/example sentence

the runner renders:
1. compact instruction;
2. separate `PARCHA` card;
3. `JAVOBNI TANLANG`;
4. A-D options.

Existing slash-based Bog'lovchilar questions keep the `GAP` label.
Existing Morfemika structured questions remain unchanged.

No SQL changes are required.
