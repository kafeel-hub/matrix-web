# Daily Reports v1.3
- Adds Daily Sales Report without adding a new API endpoint.
- Reuses the proven Daily Activity endpoint and grouped renderer.
- Daily Sales transaction scope is restricted to GSAL, GRET, USAL and UGLP.
- Selecting All composes the four scoped endpoint calls client-side, so unrelated Daily Activity transaction types cannot leak into Daily Sales.
- Daily Activity and Daily Report behavior remain unchanged.
