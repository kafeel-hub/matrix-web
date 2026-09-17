// Mirrors Matrix.Api.Services.Validation.ValidationError (record Code, Message)
// — returned as the `errors` array on 400 responses from both
// SalesInvoiceController and the party (customer/supplier) endpoints.
export interface ValidationError {
  code: string;
  message: string;
}

/** The `{ code, message }` shape PartyService.Save throws on 409 Conflict. */
export interface ConflictError {
  code: string;
  message: string;
}
