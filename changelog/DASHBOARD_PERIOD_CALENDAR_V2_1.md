# Dashboard Period Calendar v2.1

- Replaced native HTML date inputs in Period Report with the existing MUI X DatePicker + Day.js stack already used by the application.
- Preserved the approved dashboard dialog/layout and dark navy/gold visual language.
- Calendar popovers are styled to match the dashboard.
- Display format remains DD/MM/YYYY while API values remain YYYY-MM-DD.
- From date cannot be after To; To cannot be before From; future To dates are disabled.
- Existing 5-year analytics range validation is unchanged.
- No authentication, API, dashboard calculation, or backend behavior changed.
