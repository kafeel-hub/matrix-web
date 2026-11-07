# React v2.13 - Sales/Return Cash vs Credit Customer Flow

## Sales Invoice
- Added CASH/CREDIT invoice type radio selection; CASH is the default.
- CASH keeps the existing rfCustomerInfo Civil ID/mobile lookup and free-entry customer flow.
- CREDIT searches existing Customer Master customers (rfParty, Prt_Type=1) by ID/name/Civil ID/phone.
- CREDIT customer details are populated from Customer Master and protected from ad-hoc editing.
- Switching invoice type clears incompatible customer state.
- CREDIT invoices send InvoiceType=1, PartyType=1 and the selected rfParty CustomerId.
- CREDIT invoices do not require or send cash payment rows.
- New Credit customer creation remains exclusively in Customer Master.

## Sales Return
- Added the same CASH/CREDIT selector and Credit Customer lookup.
- Loading the original invoice restores its InvoiceType and Credit Customer identity.
- CREDIT returns do not require/send cash payment rows.
- The API remains responsible for enforcing original-invoice type/customer consistency.
