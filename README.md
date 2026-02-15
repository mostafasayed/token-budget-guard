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

## Plans

### Lite (current)
- Heuristic token estimation (~4 chars/token)
- Budget enforcement with fail-fast / trim / warn strategies
- Token usage returned from `withTokenBudget`

Suitable for small-to-mid AI applications where approximate token control is sufficient.


### Pro (planned)
For production AI systems requiring higher accuracy and observability.

- Custom tokenizer support (adapters + heuristic fallback)
- Observability hooks (`onWarn`, `onTrim`)
- Cost estimation based on model pricing
- Optional provider adapters / integrations

👉 Pro version: coming soon.

## Install
```bash
npm install token-budget-guard
```

## Usage
```ts
import { withTokenBudget } from "token-budget-guard";

const { result, usage } = await withTokenBudget({
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

console.log(usage);
```

## Support

If this utility helps you control AI costs or improve reliability:

⭐ Star the repository  
☕ Support the project: https://buymeacoffee.com/mostafahanafy
