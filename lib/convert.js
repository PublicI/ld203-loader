const fs = require('fs-extra');
const xml2js = require('xml2js');
const argv = require('yargs').argv
const path = require('path');
const Papa = require('papaparse');
const senate = require('./senate');

function stringifyCSV(rows){
    return new Promise(function(complete, error) {
        Papa.unparse(rows, {complete, error});
    });
}

function parseXML(file) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, 'ucs2', (err, data) => {
            let parser = new xml2js.Parser({
                explicitRoot: false,
                mergeAttrs: true,
                explicitArray: false
            });
            parser.parseString(data, (err, result) => {
                if (err) reject(err)
                else resolve(result)
            });
        });
    });
}

async function writeCSVs(parsedFilingMeta, parsedFilingContributions, folderToWrite, outputPrefix){
    let filingMetaCSV = Papa.unparse([].concat.apply([], parsedFilingMeta), {
        newline: '\n',
        quotes: true
    });
    
    let filingContributionsCSV = Papa.unparse([].concat.apply([], parsedFilingContributions));

    fs.writeFileSync(`${folderToWrite}/${outputPrefix}_meta.csv`, filingMetaCSV)
    fs.writeFileSync(`${folderToWrite}/${outputPrefix}_contributions.csv`, filingContributionsCSV)
}

async function main(){
    let fileToParse = argv.input;
    let folderToWrite = argv.output;
    let outputPrefix = path.basename(fileToParse, '.xml');
    
    let parsedXML = await parseXML(fileToParse)
    
    let parsedFilingMeta = await Promise.all(parsedXML.Filing.map(k => senate.mapFilingMeta(k, fileToParse)));
    let parsedFilingContributions = await Promise.all(parsedXML.Filing.map(k => senate.mapFilingContributions(k, fileToParse)));
    
    parsedFilingContributions = [].concat.apply([], parsedFilingContributions);//parsedFilingContributions.filter(d => d && d.length > 0);
    
    fs.writeFileSync(`${folderToWrite}/${outputPrefix}_contributions.json`, parsedFilingContributions.map(d => JSON.stringify(d)).join('\n') + '\n')
    fs.writeFileSync(`${folderToWrite}/${outputPrefix}_meta.json`, parsedFilingMeta.map(d => JSON.stringify(d)).join('\n') + '\n')
}

main()