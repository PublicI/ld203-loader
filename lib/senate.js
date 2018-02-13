const Xray = require('x-ray');
const fs = require('fs-extra');
const axios = require('axios');
const exec = require('child_process').exec;

const parseString = require('xml2js').parseString;

const senate_url = 'https://www.senate.gov/legislative/Public_Disclosure/contributions_download.htm';

const stateLocation = module.stateLocation || './state.json';
const downloadDir =  module.downloadDir || './downloads';
const extractDir = module.extractDir || './extracted';

let prevState = fs.readJsonSync(stateLocation)

const x = Xray({
    filters: {
        //Get filename from URL
        resolveFileName: (value) => value ? value.split('/').slice(-1)[0] : null,
        //Get year from filename
        resolveYear: (value) => value ? value.split('_')[0] : null,
        //Parse date string
        parseDate: Date.parse
    }
});

// Hit the page and fetch the latest state
function fetch(){
    return new Promise((resolve, reject) => {
        x(senate_url, '#secondary_col2 > table table > tr', [{
            year: 'td:nth-of-type(2) > a@href | resolveFileName | resolveYear',  
            quarter: 'td:nth-of-type(2)',
            updated: 'td:nth-of-type(3) | parseDate',
            link: 'td:nth-of-type(2) > a@href',
            fileName: 'td:nth-of-type(2) > a@href | resolveFileName'
        }]).then((data, err) => {
            if(err) reject(err)
            else resolve({availableFiles: data})
        })
    })
}

async function saveState(data){
    let state = data.reduce((all, current) => {
        all[current.fileName] = current;
        return all
    }, {})

    return fs.writeJson('./state.json', state)
}

// Check if file has been updated since last download
async function needUpdates(data){
    //Filter out those without changes using prevState stored in state.json.
    let updates = data.filter(d => prevState[d.fileName] ? prevState[d.fileName].updated < d.updated : true)
    return updates
}

function download(file, downloadDir){
    return new Promise(async (resolve, reject) => {
        let config = {}
        config.method = 'get'
        config.responseType = 'stream' //so we can pipe to a file.
        config.url = file.link;
        let response = await axios(config);
        let dlpath = `${downloadDir}/${file.fileName}`;
        let writeStream = fs.createWriteStream(dlpath);
        response.data.pipe(writeStream)
        writeStream.on('close', () => {
            console.log(`Downloaded: ${file.fileName}`)
            resolve(dlpath)
        })
    })
}



async function mapFilingMeta(filing, source_file) {
    let filingMeta = {};
    Object.keys(filing).filter(d => !['Contributions','xmlns'].includes(d)).forEach(d => {
        if (typeof filing[d] != 'string') {
            Object.keys(filing[d]).forEach(key => {
                if(key != 'xmlns') filingMeta[`${d}${key.replace(d, '')}`] = filing[d][key].replace(/(\r\n|\n|\r)/gm," ");
            })
        }
        else {
            filingMeta[d] = filing[d]
        }
    });
    
    // If source file is provided and the filing meta is not empty, add in the source file
    if(source_file && filingMeta) filingMeta['source_file'] = source_file;

    return filingMeta
}

async function mapFilingContributions(filing, source_file) {
    // Take a filing and spit out arrays for contributions and filing metadata
    let filingContributions = []

    if(filing.hasOwnProperty('Contributions')){
        let rawContributions = filing['Contributions'].Contribution;
        let contributions = Array.isArray(rawContributions) ? rawContributions : [rawContributions];
        filingContributions = filingContributions.concat(contributions);

        filingContributions.map(d => {
            d['FilingID'] = filing['ID'];
            // If source file is provided and the contributions exist, add in the source file
            if(source_file) d['source_file'] = source_file;
            d['Comments'] = d['Comments'] || '';
            delete d['xmlns'];
            return d
        });
    }

    return filingContributions
}

async function convert(file){
    return new Promise(async (resolve, reject) => {
        let xml = await fs.readFileSync(file);
        parseString(file, function (err, result) {
            if(err) reject(err)
            else resolve(result)
        });
    })
}

async function unzip(file){
    ////ARBITRARY COMMAND EXECUTION POTENTIAL - SANITIZE THIS!!!!!!
    exec(`unzip ${downloadDir}/${file.fileName} -d ${extractDir}/${file.fileName.replace('.zip', '')}`, (err, stdout, stderr) => {
        if(err) console.error(err)
        console.log(stdout);
        console.log(stderr);
        return false
    })
}

module.exports = {
        fetch: fetch,
        saveState: saveState,
        needUpdates: needUpdates,
        download: download,
        unzip: unzip,
        mapFilingMeta: mapFilingMeta,
        mapFilingContributions: mapFilingContributions
}