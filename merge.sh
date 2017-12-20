echo "Generating Bulk Files - This may take a while."
echo "Merging $(ls ./parsed/**/*_contributions.csv | wc -l) contributions files into all_contributions.csv"
csvstack --filenames ./parsed/**/*_contributions.csv > all_contributions.csv
echo "Merging $(ls ./parsed/**/*_meta.csv | wc -l) metadata files into all_meta.csv"
csvstack --filenames ./parsed/**/*_meta.csv > all_meta.csv
echo "All done, generated the following files:
$(du -sh all_*.csv)
"