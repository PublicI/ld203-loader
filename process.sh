clear

# Scrape senate page to get latest available files.
needUpdates=$(node ./lib/index.js)

mkdir -p downloads/
mkdir -p extracted/
mkdir -p parsed/
mkdir -p dist/
rm -rf parsed/*

process_quarter() {
    sourceFile=$1

    echo "Processing: $sourceFile"

    echo "Downloading: $sourceFile"
    #wget -q http://soprweb.senate.gov/downloads/$sourceFile -O downloads/$sourceFile

    echo "Extracting: $sourceFile"
    #unzip -o downloads/$sourceFile -d extracted/${sourceFile%%.*}

    # Convert each file in extracted .zip to CSV & JSON.
    echo "Parsing: $sourceFile"
    mkdir -p parsed/${sourceFile%%.*}
    for subXMLFile in extracted/${sourceFile%%.*}/*.xml; do
        outputPrefix=extracted/${sourceFile%%.*}
        node ./lib/convert.js --output=${outputPrefix/extracted/parsed} --input=$subXMLFile
    done

    echo "Finished Processing: $sourceFile"
}

export -f process_quarter

# Download, Extract and Process files in parallel.
parallel -j 6 process_quarter ::: $needUpdates

echo "Generating Bulk Files - This may take a while."
rm -rf dist/all_*

echo "Merging $(ls ./parsed/**/*_contributions.json | wc -l) contributions files."
for subXMLFile in ./parsed/**/*_contributions.json; do
    cat $subXMLFile >> dist/all_contributions_combined.json
done

echo "Merging $(ls ./parsed/**/*_meta.json | wc -l) metadata files."
for subXMLFile in ./parsed/**/*_meta.json; do
    cat $subXMLFile >> dist/all_meta_combined.json
done

echo "Converting all_contributions_combined.json into all_contributions.csv"
ndjson-to-csv dist/all_contributions_combined.json > dist/all_contributions.csv

echo "Converting all_meta_combined.json into all_meta.csv"
ndjson-to-csv dist/all_meta_combined.json > dist/all_meta.csv

echo "All done, generated the following files:"
du -sh dist/*