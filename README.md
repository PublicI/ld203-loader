# LD-203 (Senate) Importer

This script imports the LD-203 bulk downloads from the U.S. Senate [available here](https://www.senate.gov/legislative/Public_Disclosure/contributions_download.htm).

## How it works

Run `process.sh` to generate the bulk CSVs in the `dist/` folder.
Run `run_sql.sh` to import said CSVs into the database. Update the connection string here to connect to a different database. It will prompt you for your password before finishing.

## Notes:

The script generates two tables: `ld203_filings` and `ld203_contributions` - both these tables shoudln't exist for the script to work seamlessly.