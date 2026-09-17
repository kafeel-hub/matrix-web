# Matrix Web

React + TypeScript frontend for the Matrix.Api jewelry sales/purchase/inventory system.

## Setup

```bash
npm install
cp .env.example .env.local   # then edit VITE_API_PROXY_TARGET to match `dotnet run`'s port
npm run dev
```

The dev server runs at `http://localhost:5173`. API calls to `/api/*` are proxied
to your ASP.NET Core API by Vite (see `vite.config.ts`), so you don't need CORS
configured for local development — only for a production deployment where the
frontend and API are on different origins.

## What's implemented

- **Auth flow**: login → (optional) company/location selection → bootstrapped
  session, matching `AuthController`/`AuthService` exactly, including the
  single-company/location shortcut that skips context selection.
- **Token handling**: access token in memory + localStorage (via Zustand
  `persist`), silent refresh on 401 with a single-flight guard so concurrent
  requests don't race the refresh-token rotation and trigger the API's reuse
  detection.
- **Route guarding**: `/` and everything under the app shell requires
  `auth.status === "ready"`; someone mid-flow (`awaiting-context`) is sent to
  the picker instead of back to login.
- **Module-gated nav**: the top nav only shows links for modules the signed-in
  user's `bootstrap.modules` actually allows.
- **New Sale screen** (`/sales/new`, `src/modules/sales/` + `src/routes/NewSaleInvoicePage.tsx`):
  - Customer selection three ways: master search (`GET /customers`), retail
    civil-ID/mobile lookup (`GET /customers/search`), or walk-in with no
    master record.
  - Barcode/item-code entry via `GET /items/scan/{code}`, with a
    search-as-you-type fallback via `GET /items/search`.
  - Editable line-items table (qty, weight, rate, making, stone amount) with
    live running totals.
  - Multiple payment lines against `bootstrap.lookups.paymentTypes`, with
    optional reference fields (authorization code, account no., cheque no.).
  - Save → Post two-step flow matching `SalesInvoiceController` exactly
    (`POST /sales-invoices` then `POST /sales-invoices/{id}/post`), including
    a "confirm and save anyway" path for the cash-limit-exceeded warning
    (`cashLimitConfirmed`).
- **TypeScript types** for every DTO currently exposed by the API (auth, sales
  invoice, items, customers/suppliers).

### Assumptions baked into the New Sale screen — verify before going live

The API doesn't (yet) expose everything the UI needs to be fully correct, so
a few things are deliberately left as documented placeholders rather than
guessed silently:

- `transactionTypeId` and `makingTypeId` on each line default to `1` — these
  are legacy numeric codes with no code list available from the API. They're
  left as plain editable numbers in the code (not exposed as their own UI
  field yet — see `lineItemFromScan` in `invoice-form.ts`), flagged with a
  comment pointing at the assumption. Confirm the real code list before
  relying on this.
- Line amount math (`amount = quantity × rate + making − stone − waste`,
  `pureWeight ≈ netWeight × purity/999`) is a reasonable generic jewelry
  invoice formula, **not** pulled from the actual legacy stored procedures.
  Treat everything computed client-side in `calculateTotals` as a preview for
  the cashier — the saved `SalesInvoiceSaveResponse` from the server is the
  source of truth.
- The item-search fallback assumes `itemId` also works as a scan code
  (`GET /items/scan/{itemId}`) since `/items/search` doesn't return full item
  detail. Confirm with the API owner if barcodes and item IDs ever diverge.
- There's no update/amend endpoint on `SalesInvoiceController` — only create
  (`POST /sales-invoices`) and post. Once an invoice is saved, the New Sale
  form locks rather than allowing edits, since resubmitting would risk
  creating a duplicate invoice instead of amending the saved one.

## What's stubbed / not yet built

The API itself doesn't yet expose everything a full sales/purchase/inventory
app needs — this frontend only builds what the backend can currently serve:

- No sales invoice **list/retrieve** endpoint exists yet, so there's no
  invoice history screen.
- No purchase invoice endpoints exist yet (`SupplierController` only covers
  the supplier master, not purchase transactions).
- No inventory endpoints beyond item scan/search exist yet (no stock levels,
  transfers, adjustments).
- `src/routes/DashboardPage.tsx` is a placeholder showing the bootstrap
  payload (company, financial year, enabled modules) to prove the auth flow
  works end-to-end — replace it with real landing-page content.
- `src/shared/components` has `Button`, `TextField`, `NumberField`, and
  `SelectField` — build out a proper component set (data table, combobox,
  toast/notification) as more screens need them.

## Project structure

```
src/
  api/            axios client (auth + refresh interceptor), auth.ts (endpoint calls)
  auth/           Zustand auth store, useLogin/useSelectContext/useLogout hooks
  types/          TypeScript types mirroring the API's C# DTOs exactly
  routes/         pages + router config + route guard + app shell
  modules/
    sales/        New Sale screen: api.ts (items/customers lookups), invoice-api.ts
                   (save/post), invoice-form.ts (reducer + totals math),
                   CustomerPicker/ItemScanInput/LineItemsTable/PaymentsPanel/
                   InvoiceTotalsPanel components
    customers/    (empty scaffolding) — customer list/detail screens go here
    items/        (empty scaffolding) — item master screens go here
  shared/         reusable UI primitives (Button, TextField, NumberField,
                   SelectField) and hooks (useDebouncedValue)
```

## Notes on the auth store

`src/auth/auth-store.ts` models the flow as a discriminated union —
`unauthenticated | awaiting-context | ready` — rather than loose boolean
flags. `awaiting-context` is deliberately **not** persisted across a page
refresh: the pre-auth token is single-use and expires in 5 minutes
server-side, so surviving a refresh only to hit a dead token is worse UX than
just asking for credentials again.
