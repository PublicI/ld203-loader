echo "Downloading house disclosure files."
#mkdir -p downloads/house
#node lib/index.js download house --downloadDir=./downloads/house

echo "Extracting downloaded disclosures."
mkdir -p extracted/house
node lib/index.js extract --inputDir=./downloads/house/ --outputDir=./extracted/house/

echo "Converting XML to JSON"
mkdir -p parsed/house
node lib/index.js batchConvert house --inputDir=./extracted/house --outputDir=./parsed/house/

echo "Merging contributions into single NDJSON"
rm dist/all_house_contributions_combined.json
node lib/index.js mergeFiles house contributions --inputDir=./parsed/house --outputFile=./dist/all_house_contributions_combined.json

echo "Merging metadata into single NDJSON"
rm dist/all_house_meta_combined.json
node lib/index.js mergeFiles house meta --inputDir=./parsed/house --outputFile=./dist/all_house_meta_combined.json

echo "Converting all_contributions_combined.json into all_contributions.csv"
./node_modules/.bin/ndjson-to-csv dist/all_house_contributions_combined.json > dist/all_house_contributions.csv

echo "Converting all_meta_combined.json into all_meta.csv"
./node_modules/.bin/ndjson-to-csv dist/all_house_meta_combined.json > dist/all_house_meta.csv

echo "All done, generated the following files:"
du -sh dist/*