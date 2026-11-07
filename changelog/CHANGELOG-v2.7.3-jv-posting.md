# React V2.7.3 — Journal Voucher Posting

- Preserves the tested JV entry/save/readback UI.
- Adds an explicit **Post** action only for saved, unposted JVs.
- Post visibility follows legacy Voucher Posting screen permission `030206`; normal JV permission remains `030204`.
- Uses an application dialog for posting confirmation.
- After successful posting, reloads the JV and the existing posted lock takes effect.
