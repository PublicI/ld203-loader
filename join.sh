for subXMLFile in ./parsed/**/*_meta.csv; do
    csvjson --stream $subXMLFile >> combined.jsonl
done
in2csv --format ndjson combined.jsonl >> combined.csv