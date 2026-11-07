# Central Account Balance React Wiring v1

- Adds reusable `src/services/accountBalanceApi.js`.
- Uses verified `GET /api/accounts/{accountNo}/balance` endpoint.
- Wires the existing Account Current Balance panel in GR, GI/Gold Payment, GFS and GFP to the central endpoint.
- Party/supplier detail calls remain responsible only for descriptive master data.
- Balance endpoint is called in parallel with party detail lookup on selection.
- No save, post, list, readback, payment, item calculation or persistence logic changed.
- UGLP/USAL and other screens without this existing panel were not visually altered in this pass.
