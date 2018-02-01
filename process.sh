clear

# Scrape senate page to get latest available files.
needUpdates=$(node index.js)

mkdir -p downloads/
mkdir -p extracted/
mkdir -p parsed/

for sourceFile in $needUpdates; do
    echo "Processing: $sourceFile"

    echo "Downloading: $sourceFile"
	wget http://soprweb.senate.gov/downloads/$sourceFile -O downloads/$sourceFile

    echo "Extracting: $sourceFile"
    unzip -o downloads/$sourceFile -d extracted/${sourceFile%%.*}

    # Convert each file in extracted .zip to CSV & JSON.
    echo "Parsing: $sourceFile"
    mkdir -p parsed/${sourceFile%%.*}
    for subXMLFile in extracted/${sourceFile%%.*}/*.xml; do
        outputPrefix=extracted/${sourceFile%%.*}
        node convert.js --output=${outputPrefix/extracted/parsed} --input=$subXMLFile
    done

    echo "Finished Processing: $sourceFile"
done

echo "Generating Bulk Files - This may take a while."
mkdir -p dist/
rm dist/all_contributions.csv dist/all_meta_combined.json dist/all_meta.csv

echo "Merging $(ls ./parsed/**/*_contributions.csv | wc -l) contributions files into all_contributions.csv"
csvstack --quoting 1 --filenames ./parsed/**/*_contributions.csv > dist/all_contributions.csv

echo "Merging $(ls ./parsed/**/*_meta.csv | wc -l) metadata files into all_meta.csv"
for subXMLFile in ./parsed/**/*_meta.csv; do
    csvjson --stream $subXMLFile >> dist/all_meta_combined.json
done

in2csv --format ndjson dist/all_meta_combined.json >> dist/all_meta.csv

echo "All done, generated the following files:"
du -sh dist/*