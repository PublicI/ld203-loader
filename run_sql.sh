psql -U postgres politics -f ./sql_scripts/create_tables.sql
psql -U postgres politics -f ./sql_scripts/import_data.sql
psql -U postgres politics -f ./sql_scripts/make_amended_view.sql
