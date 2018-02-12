psql -h db.fivetwentyseven.com -U postgres politics -f ./sql_scripts/create_tables.sql
psql -h db.fivetwentyseven.com -U postgres politics -f ./sql_scripts/import_data.sql
psql -h db.fivetwentyseven.com -U postgres politics -f ./sql_scripts/make_ammend_view.sql