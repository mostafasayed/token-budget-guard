# Token Budget Guard — Roadmap

A small utility to enforce token budgets for AI API calls.
Focus: correctness, cost control, and production readiness.

---

## v0.0.x — Initial Release (DONE)

- [x] Core token budget enforcement
- [x] Fail-fast / trim-context / warn-only strategies
- [x] Heuristic token estimation
- [x] npm package published (v0.0.1)

---

## v0.1.x — Adoption & Feedback

### Goals
- Improve usability
- Validate real-world use cases
- Avoid premature complexity

### Planned
- [ ] Improve README with real usage examples
- [ ] Document limitations and design decisions
- [ ] Collect early feedback from users

---

## v0.1.1 — Accurate Token Counting

### Goals
- Improve estimation accuracy without breaking API

### Planned
- [ ] Add optional tokenizer adapters (e.g. tiktoken)
- [ ] Allow tokenizer selection via config
- [ ] Fallback to heuristic estimation if tokenizer unavailable

---

## v0.1.2 — Observability Hooks

### Goals
- Make token usage visible and measurable

### Planned
- [ ] Expose token usage metrics
- [ ] Add optional hooks for logging / monitoring
- [ ] Include estimated cost calculation

---

## v0.2.0 — API & DX Improvements

### Goals
- Better ergonomics
- Clearer configuration
- Fewer footguns

### Planned
- [ ] Refine public API (builder-style or helpers)
- [ ] Improve error messages
- [ ] Add sensible defaults

---

## v0.2.1 — Testing & Reliability

### Goals
- Increase trust
- Prevent regressions

### Planned
- [ ] Add unit tests for budget logic
- [ ] Cover edge cases (zero budget, large context)
- [ ] Add CI workflow

---

## v0.3.x — Provider & Ecosystem (Optional)

### Goals
- Broader adoption
- Optional integrations

### Planned
- [ ] Provider adapters (OpenAI, Anthropic, generic LLM)
- [ ] MCP tool integration (optional)
- [ ] Example integrations

---

## Principles

- Ship small and often
- Optimize for correctness before performance
- Avoid feature creep
- Add complexity only when justified by real usage
