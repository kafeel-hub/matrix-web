# React v2.6.1 - Account Master permission identifier fix

- Restores Chart of Accounts visibility under the new security layer.
- Uses the authoritative legacy Finance Chart of Account screen number `030101` from MainForm.vb instead of relying on display-name matching.
- Permission resolution now supports both `screenNo` and `screenName`, with screen number preferred for stable mappings.
- Chart of Accounts and Account Ledger routes remain protected by the same permission.
