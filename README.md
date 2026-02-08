# token-budget-guard

A small utility to enforce token budgets for AI API calls.

## Why
Tokens affect cost, latency, and reliability.
This utility makes token usage explicit and enforceable.

## Features
- token estimation
- budget enforcement
- fail-fast / trim / warn strategies

## Token estimation
Uses a rough heuristic (~4 chars/token). Counts may differ from model-specific tokenizers,
especially for non-English text or code/JSON.

## Install
```bash
npm install token-budget-guard
```

## Usage
```ts
import { withTokenBudget } from "token-budget-guard";

await withTokenBudget({
  model: "gpt-4",
  maxTokens: 8000,
  prompt,
  context,
  expectedOutputTokens: 500,
  strategy: "trim_context",
  call: async ({ prompt, context }) => {
    return client.responses.create({
      model: "gpt-4",
      input: [{ role: "user", content: [prompt, ...context] }],
    });
  },
});
```