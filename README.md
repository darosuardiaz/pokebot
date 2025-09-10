I think that as a general the challenging thing was the correct stream handling so it would be fed correctly into the chat component. So I decided to wrap the stream response from the API service on a hook to have a reasonable way to pass the stream in any part of the application. Apart from that I think the architecture is pretty straightforward, having a minimal service layer for the poke and Anthropic APIs.

TODO
* Add Auth and persist data like Pokemon Teams to a database (provably supabase)
* Support Multiplayer Battles
* Refine the prompt, not completely happy on the generated output besides tool calling
* Implement Evolution Chain Tool
* Technical Debt (documented in `TECH_DEBT.md`)