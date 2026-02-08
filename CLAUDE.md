# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Build: `npm run build` (tsc)
- Dev (watch): `npm run dev` (tsx watch src/index.ts)
- Test: `npm test` (currently a placeholder that exits with error)

## Architecture Overview
- **Public entrypoint:** `src/index.ts` exports `withTokenBudget`, which orchestrates token usage calculation and applies the chosen strategy before calling the provided `call()`.
- **Token usage accounting:** `src/budget.ts` computes prompt/context/expected output token totals using the tokenizer.
- **Token estimation:** `src/tokenizer.ts` implements a simple heuristic (~4 chars per token).
- **Strategies:** `src/strategies.ts` provides `trimContext`, keeping the most recent context items within budget.
- **Types:** `src/types.ts` defines `TokenBudgetOptions` and the strategy union (`fail_fast`, `trim_context`, `warn_only`).
