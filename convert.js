const fs = require('fs-extra');
const xml2js = require('xml2js');
const argv = require('yargs').argv
const path = require('path');
const Papa = require('papaparse');

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

async function mapFilingMeta(filing) {
    let filingMeta = {};
    Object.keys(filing).filter(d => !['Contributions','xmlns'].includes(d)).forEach(d => {
        if (typeof filing[d] != 'string') {
            Object.keys(filing[d]).forEach(key => {
                if(key != 'xmlns') filingMeta[`${d}${key.replace(d, '')}`] = filing[d][key]
            })
        }
        else {
            filingMeta[d] = filing[d]
        }
    })

    return filingMeta
}

async function mapFilingContributions(filing) {
    // Take a filing and spit out arrays for contributions and filing metadata
    let filingContributions = []

    if(filing.hasOwnProperty('Contributions')){
        let rawContributions = filing['Contributions'].Contribution;
        let contributions = Array.isArray(rawContributions) ? rawContributions : [rawContributions];
        filingContributions = filingContributions.concat(contributions);

        filingContributions.map(d => {
            d['FilingID'] = filing['ID'];
            delete d['xmlns'];
            return d
        });
    }

    return filingContributions
}

async function main(){
    let fileToParse = argv.input;
    let folderToWrite = argv.output;
    let outputPrefix = path.basename(fileToParse, '.xml');
    
    let parsedXML = await parseXML(fileToParse)
    
    let parsedFilingMeta = await Promise.all(parsedXML.Filing.map(k => mapFilingMeta(k)))
    let parsedFilingContributions = await Promise.all(parsedXML.Filing.map(k => mapFilingContributions(k)))

    let filingMetaCSV = Papa.unparse([].concat.apply([], parsedFilingMeta));
    let filingContributionsCSV = Papa.unparse([].concat.apply([], parsedFilingContributions));

    fs.writeFileSync(`${folderToWrite}/${outputPrefix}_meta.csv`, filingMetaCSV)
    fs.writeFileSync(`${folderToWrite}/${outputPrefix}_contributions.csv`, filingContributionsCSV)
    fs.writeFileSync(`${folderToWrite}/${outputPrefix}.json`, JSON.stringify(parsedFilingMeta))
}

main()