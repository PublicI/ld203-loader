mkdir -p downloads/senate
node lib/index.js download senate --downloadDir=./downloads/senate

mkdir -p extracted/senate
node lib/index.js extract --inputDir=./downloads/senate/ --outputDir=./extracted/senate/

find ./extracted/senate -type d -mindepth 1 | while read f
do
    echo "Parsing $f"
    node lib/index.js convertAll senate --inputDir="$f" --outputDir=./parsed/senate/
done

rm dist/all_senate_contributions_combined.json
echo "Merging $(find ./parsed/senate -type f -name '*_contributions.json' | wc -l) contributions files."
find ./parsed/senate -type f -name '*_contributions.json' -exec cat {} \; > dist/all_senate_contributions_combined.json

rm dist/all_senate_meta_combined.json
echo "Merging $(find ./parsed/senate/ -type f -name '*_meta.json' | wc -l) metadata files."
find ./parsed/senate -type f -name '*_meta.json' -exec cat {} \; > dist/all_senate_meta_combined.json

echo "Converting all_contributions_combined.json into all_contributions.csv"
ndjson-to-csv dist/all_senate_contributions_combined.json > dist/all_senate_contributions.csv

echo "Converting all_meta_combined.json into all_meta.csv"
ndjson-to-csv dist/all_senate_meta_combined.json > dist/all_senate_meta.csv

echo "All done, generated the following files:"
du -sh dist/*