# Dashboard v1.9 - tab lazy loading

- Dashboard default period changed from rolling 30 days to current day.
- Data is loaded only for the active tab.
- Overview calls only the tab-filtered analytics endpoint; other tabs call only their tab-filtered dashboard/analytics slices.
- Successfully loaded tabs are cached for the selected period.
- Switching back to a loaded tab does not call the API again.
- Period Apply invalidates the tab cache; Refresh reloads only the active tab.
- Existing four-tab UI and calculations are unchanged.
