mkdir -p downloads/house
node lib/index.js download house --downloadDir=./downloads/house

mkdir -p extracted/house
node lib/index.js extract --inputDir=./downloads/house/ --outputDir=./extracted/house/

find ./extracted/house -type d -mindepth 1 | while read f
do
    echo "Parsing $f"
    node lib/index.js convertAll house --inputDir="$f" --outputDir=./parsed/house/
done

rm dist/all_house_contributions_combined.json
echo "Merging $(find ./parsed/house -type f -name '*_contributions.json' | wc -l) contributions files."
find ./parsed/house -type f -name '*_contributions.json' -exec cat {} \; > dist/all_house_contributions_combined.json

rm dist/all_house_meta_combined.json
echo "Merging $(find ./parsed/house/ -type f -name '*_meta.json' | wc -l) metadata files."
find ./parsed/house -type f -name '*_meta.json' -exec cat {} \; > dist/all_house_meta_combined.json

echo "Converting all_contributions_combined.json into all_contributions.csv"
ndjson-to-csv dist/all_house_contributions_combined.json > dist/all_house_contributions.csv

echo "Converting all_meta_combined.json into all_meta.csv"
ndjson-to-csv dist/all_house_meta_combined.json > dist/all_house_meta.csv

echo "All done, generated the following files:"
du -sh dist/*