# Decision engine

Each file in `rules/` is a deterministic, side-effect-free interpretation of
one Phase 4 rule. `runDecisionEngine` is the only orchestration layer: it
deduplicates open `(type, target)` tickets, selects a reviewer, and invokes the
two injectable notification effects. Production storage and delivery adapters
can therefore be replaced with fixture stores in tests.
