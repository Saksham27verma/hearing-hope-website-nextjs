# Generation module

`runGeneration` takes no more than five priority-ordered tickets, builds a
versioned prompt, validates each provider result against the ticket schema, and
creates only `draft` pages. A human approval remains the sole path to public
publication. The manual path stores the complete brief and accepts pasted JSON
through the same schema and draft pipeline.
