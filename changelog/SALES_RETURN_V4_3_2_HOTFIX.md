# Sales Return v4.3.2 hotfix

- Removed the `originalInvoices` identifier involved in the ReturnInvoice initialization crash and replaced it with guarded `returnOriginalInvoices` state.
- Normalizes legacy `RET` navigation state to `GRET` in Invoice List.
- GRET/RET list selection now activates `GET /api/sales-returns?date=YYYY-MM-DD`.
- No backend changes; keep API v23.10.
