# Gold Receipt v6.3
- Removed GR screen dependency on old Redux/Saga party/item/payment lookup data.
- Loads GR parties and party details from the new Matrix API.
- Loads GR item options/details from the new Matrix API.
- Uses RV/PV payment lookup contract: payment type -> mapped payment account, currencies, base currency and restrictAccountToPaymentType.
- Keeps the approved legacy GR layout and Add Item calculation behavior.
- Keeps GR transaction identity and v6.2 save payload.
