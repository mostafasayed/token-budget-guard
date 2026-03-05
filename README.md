# token-budget-guard

![npm](https://img.shields.io/npm/v/token-budget-guard)
![npm downloads](https://img.shields.io/npm/dm/token-budget-guard)
![license](https://img.shields.io/npm/l/token-budget-guard)

Control token usage before expensive AI API calls.

A lightweight utility to enforce token budgets for LLM requests and prevent cost spikes, latency issues, and runaway context growth.

It works with multiple AI providers and can automatically trim context, warn, or fail fast when a request exceeds a configured token limit.

## Install
```bash
npm install token-budget-guard
```

## Quick example
```ts
import { withTokenBudget } from "token-budget-guard";

await withTokenBudget({
  maxTokens: 2000,
  prompt,
  context,
  expectedOutputTokens: 200,
  strategy: "trim_context",
  call: async ({ prompt, context }) => aiClient(prompt, context),
});
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

## Features
- Token estimation with lightweight heuristic (~4 chars/token)
- Budget enforcement before expensive AI API calls
- Multiple strategies: `fail-fast`, `trim_context`, `warn_only`
- Provider adapters (OpenAI, Anthropic, Gemini, Bedrock, Azure, Cohere)
- Optional cost estimation for supported providers

## Compatible AI Providers
- OpenAI
- Anthropic
- Google Gemini
- AWS Bedrock
- Azure OpenAI
- Cohere

## Why
Tokens affect cost, latency, and reliability.
This utility makes token usage explicit and enforceable.
Monitoring per-request usage helps detect cost spikes, inefficient prompts, and unexpected growth in context size.

## Use cases
- Prevent unexpected token cost spikes
- Control prompt + context growth
- Add guardrails to production AI APIs
- Monitor token usage per request
- Enforce safe token budgets in LLM pipelines

## How it works
```
prompt + context
      ↓
token estimation
      ↓
budget check
      ↓
strategy applied
  • fail-fast
  • trim-context
  • warn-only
      ↓
safe AI API call
```

## Token estimation
Uses a rough heuristic (~4 chars/token). Counts may differ from model-specific tokenizers,
especially for non-English text or code/JSON.

## Planned improvements
- Custom tokenizer adapters
- Observability hooks
- Cost estimation
- Provider integrations

## Real examples

### Custom tokenizer adapter + hooks
```ts
import { withTokenBudget } from "token-budget-guard";

const { result, usage } = await withTokenBudget({
  model: "gpt-4",
  maxTokens: 2000,
  prompt,
  context,
  expectedOutputTokens: 300,
  tokenizer: {
    name: "tiktoken",
    estimate: (text, model) => myTokenizerEstimate(text, model),
  },
  onWarn: ({ reason, usage, maxTokens }) => {
    if (reason === "over_budget") {
      console.warn("Over budget", usage.totalTokens, maxTokens);
    }
  },
  onTrim: ({ removedCount, trimmedContext }) => {
    console.info("Trimmed", removedCount, "items", trimmedContext);
  },
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

### Warn-only behavior
```ts
await withTokenBudget({
  model: "gpt-4",
  maxTokens: 100,
  prompt,
  context,
  expectedOutputTokens: 20,
  strategy: "warn_only",
  onWarn: ({ usage, maxTokens }) => {
    console.warn("Over budget", usage.totalTokens, maxTokens);
  },
  call: async ({ prompt, context }) => {
    return client.responses.create({
      model: "gpt-4",
      input: [{ role: "user", content: [prompt, ...context] }],
    });
  },
});
```

## Cost estimation

```ts
const { usage, cost } = await withTokenBudget({
  model: "gpt-4o-mini",
  maxTokens: 2000,
  prompt,
  expectedOutputTokens: 200,
  cost: {
    provider: "openai",
    model: "gpt-4o-mini",
    pricingOverrides: {
      "gpt-4o-mini": { inputPer1M: 0.15, outputPer1M: 0.6, currency: "USD" },
    },
  },
  call: async ({ prompt }) => client.responses.create({ model: "gpt-4o-mini", input: prompt }),
});

console.log(cost);
```

## Provider adapters

Supported adapters: OpenAI, Anthropic, Gemini, AWS Bedrock, Azure OpenAI, Cohere.
Each adapter provides a default payload mapping and accepts a `toPayload` override
when you need to customize the request shape.

Default mappings (high level):
- **OpenAI**: `messages[]` (system/user/assistant), `max_output_tokens`
- **Anthropic**: `messages[]` + optional `system`, `max_tokens`
- **Gemini**: `contents[]` + `generationConfig.maxOutputTokens`
- **Bedrock**: `{ modelId, body: JSON.stringify({ prompt, context, max_output_tokens }) }`
- **Azure OpenAI**: `deployment` + `messages[]`, `max_output_tokens`
- **Cohere**: `message` + `chat_history[]`, `max_output_tokens`

```ts
import {
  withOpenAI,
  withAnthropic,
  withGemini,
  withBedrock,
  withAzureOpenAI,
  withCohere,
} from "token-budget-guard";

const budget = {
  maxTokens: 2000,
  prompt,
  context: ["Earlier assistant message", "Follow-up detail"],
  expectedOutputTokens: 200,
};
const systemPrompt = "You are a helpful assistant.";

// OpenAI (messages[] + max_output_tokens)
const openai = await withOpenAI({
  ...budget,
  model: "gpt-4o-mini",
  systemPrompt,
  call: async (payload) => openaiClient(payload),
});

// Anthropic (messages[] + system + max_tokens)
const anthropic = await withAnthropic({
  ...budget,
  model: "claude-3-5-sonnet-latest",
  systemPrompt,
  call: async (payload) => anthropicClient(payload),
});

// Gemini (contents[] + generationConfig.maxOutputTokens)
const gemini = await withGemini({
  ...budget,
  model: "gemini-1.5-flash",
  call: async (payload) => geminiClient(payload),
});

// Bedrock (modelId + JSON body)
const bedrock = await withBedrock({
  ...budget,
  model: "amazon.titan-text-lite-v1",
  call: async (payload) => bedrockClient(payload),
});

// Azure OpenAI (deployment + messages[] + max_output_tokens)
const azure = await withAzureOpenAI({
  ...budget,
  model: "gpt-4o-mini",
  deployment: "my-deployment",
  systemPrompt,
  call: async (payload) => azureClient(payload),
});

// Cohere (message + chat_history[] + max_output_tokens)
const cohere = await withCohere({
  ...budget,
  model: "command-r",
  call: async (payload) => cohereClient(payload),
});

console.log(
  openai.usage,
  anthropic.usage,
  gemini.usage,
  bedrock.usage,
  azure.usage,
  cohere.usage
);
```

## Limitations
- Heuristic estimation (~4 chars/token) can diverge from model tokenizers, especially for non-English text or code/JSON.
- Only context is trimmed; prompt and expected output tokens are never reduced automatically.
- If a custom tokenizer throws or returns an invalid value, the heuristic fallback is used.
- Cost estimates rely on defaults or overrides and may become stale; verify prices for your provider/region.
- Bedrock and Azure pricing vary by region and model; defaults may be incomplete.

## Keywords
- ai
- llm
- openai
- anthropic
- token-budget
- token-estimation
- ai-cost-control
- ai-observability
- developer-tools
- nodejs

## Support

If this library helps you:

⭐ Star the repository  
☕ Buy me a coffee: https://buymeacoffee.com/mostafahanafy

## License
MIT
