# LD-203 importer

This project imports the LD-203 bulk downloads from the U.S. Senate [available here](https://www.senate.gov/legislative/Public_Disclosure/contributions_download.htm). It contains a Node.js command line interface designed to perform several of the tasks needed to load the filings and example bash scripts that automate the process from end to end.

## How it works

To load Senate filings, run `process_senate.sh` to generate CSVs in the `dist/` folder.

Run `run_sql.sh` to import said CSVs into a Postgres database. Update the connection details to connect to a different database. It will prompt you for your password before finishing.
