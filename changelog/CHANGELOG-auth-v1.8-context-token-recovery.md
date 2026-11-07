# Auth v1.8 - Context token recovery

- Preserves API `errorCode` for context-selection failures.
- Correctable company/location/financial-year errors remain on the selection screen so the user can choose again with the same pre-auth ticket.
- A genuinely invalid, expired, or already-consumed pre-auth ticket clears stale auth state and redirects to login.
