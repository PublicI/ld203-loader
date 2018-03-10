# LD-203 (Senate & House) importer

This script imports the LD-203 bulk downloads from the U.S. Senate [available here](https://www.senate.gov/legislative/Public_Disclosure/contributions_download.htm).

## How it works

This project contains a Node.js command line interface designed to perform several of the tasks needed to load the filings and example bash scripts that automate the process from end to end. For example, run `process_senate.sh` to generate the bulk CSVs in the `dist/` folder.

Run `run_sql.sh` to import said CSVs into the database. Update the connection string here to connect to a different database. It will prompt you for your password before finishing.
