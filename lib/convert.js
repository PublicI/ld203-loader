const fs = require('fs-extra');
const xml2js = require('xml2js');
const argv = require('yargs').argv
const path = require('path');
const Papa = require('papaparse');
const senate = require('./senate');
const extract = require('extract-zip')

function stringifyCSV(rows){
    return new Promise(function(complete, error) {
        Papa.unparse(rows, {complete, error});
    });
}

function unzipFile(inputFile, outputPath){
    return new Promise((resolve, reject) => {        
        outputPath = path.resolve(outputPath, path.basename(inputFile, '.zip'));
        extract(inputFile, {dir: outputPath}, function (err) {
            if(err) reject(err)
            else {
                
                console.log(`Extracted: ${path.basename(inputFile)} to ${outputPath}`);
                resolve()
            }
        })
    })
}

function parseXML(file, encoding) {
    return new Promise((resolve, reject) => {
        encoding = encoding || 'utf8';
        fs.readFile(file, encoding, (err, data) => {
            data = data.replace(/\x00+/, '');

            let parser = new xml2js.Parser({
                explicitRoot: false,
                mergeAttrs: true,
                explicitArray: false
            });

            parser.parseString(data, (err, result) => {
                if (err) { console.log("DATA:" + escape(data)); reject(err); }
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

async function writeJSON(folderToWrite, outputPrefix, parsedFilingMeta, parsedFilingContributions) {
    fs.ensureDirSync(folderToWrite);
    if(parsedFilingMeta) fs.writeFileSync(`${folderToWrite}/${outputPrefix}_meta.json`, parsedFilingMeta.map(d => JSON.stringify(d)).join('\n') + '\n');
    if(parsedFilingContributions.length > 0) fs.writeFileSync(`${folderToWrite}/${outputPrefix}_contributions.json`, parsedFilingContributions.map(d => JSON.stringify(d)).join('\n') + '\n');
}

async function main(fileInput, outputFolder, chamber){
    let fileToParse = fileInput || argv.input;
    let folderToWrite = outputFolder || argv.output;
    let outputPrefix = path.basename(fileToParse, '.xml');
        
    if (chamber.name == 'house') {
        let parsedXML = await parseXML(fileToParse);
        if(!parsedXML) return false;

        parsedXML['ID'] = path.basename(fileToParse, '.xml');
        let parsedFilingMeta = [await chamber.mapFilingMeta(parsedXML, fileToParse)];
        let parsedFilingContributions = await chamber.mapFilingContributions(parsedXML, fileToParse);

        writeJSON(folderToWrite, outputPrefix, parsedFilingMeta, parsedFilingContributions);
        return fileInput
    }

    else if(chamber.name == 'senate') {
        let parsedXML = await parseXML(fileToParse, 'ucs2');
        if(!parsedXML) return false;

        let parsedFilingMeta = await Promise.all(parsedXML.Filing.map(k => chamber.mapFilingMeta(k, fileToParse)));
        let parsedFilingContributions = await Promise.all(parsedXML.Filing.map(k => chamber.mapFilingContributions(k, fileToParse)));
        
        parsedFilingContributions = [].concat.apply([], parsedFilingContributions);//parsedFilingContributions.filter(d => d && d.length > 0);
        writeJSON(folderToWrite, outputPrefix, parsedFilingMeta, parsedFilingContributions);
        return fileInput
    }
}

module.exports = {
    main: main,
    unzipFile: unzipFile
}