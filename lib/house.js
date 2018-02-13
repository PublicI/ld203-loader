const Xray = require('x-ray');
const fs = require('fs-extra');
const axios = require('axios');
const exec = require('child_process').exec;
var querystring = require('querystring');

const parseString = require('xml2js').parseString;

const house_url = 'http://disclosures.house.gov/lc/LCDownload.aspx?KeepThis=true&';

const stateLocation = module.stateLocation || './state.json';
const downloadDir =  module.downloadDir || './downloads';
const extractDir = module.extractDir || './extracted';

let prevState = fs.readJsonSync(stateLocation)

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

const x = Xray({
    filters: {
        //Get filename from value
        resolveFileName: (value) => value ? value.split('XML')[0] : null,
        //Get year from value
        resolveYear: (value) => value ? value.substring(0,4) : null,
        //Get updated date-time string
        resolveUpdated: (value) => value ? Date.parse(value.split(/[()]/)[1].trim()) : null,
        //Parse date string
        parseDate: Date.parse
    }
});

// Hit the page and fetch the latest state
function fetch(){
    return new Promise((resolve, reject) => {
        x(house_url, '#download_form', {
            stateParams: x('input', [{
                type: '@type',
                name: '@name',
                id: '@id',
                value: '@value'
            }]),
            availableFiles: x('#selFilesXML > option', [{
                text: '@text',
                value: '@value',
                fileName: '@value | resolveFileName',
                updated: '@value | resolveUpdated'
            }])
        }).then((data, err) => {
            if(err) reject(err)
            else resolve(data)
        })
    })
}

async function saveState(data){
    let state = data.reduce((all, current) => {
        all[current.fileName] = current;
        return all
    }, {})

    return fs.writeJson('./state.json', state);
}

// Check if file has been updated since last download
async function needUpdates(data){
    //Filter out those without changes using prevState stored in state.json.
    let updates = data.filter(d => prevState[d.fileName] ? prevState[d.fileName].updated < d.updated : true)
    return updates
}

function download(file, stateParams){
    return new Promise(async (resolve, reject) => {
        let config = {}
        config.method = 'post'
        config.responseType = 'stream' //so we can pipe to a file.
        config.url = house_url;

        config.data = stateParams.reduce((all, param) => {
            all[param.name] = param.value;
            return all
        }, {});

        config.data['selFilesXML'] = file.value;

        config.data = querystring.stringify(config.data);

        let response = await axios(config);
        let dlpath = `${downloadDir}/${file.fileName}`;
        let writeStream = fs.createWriteStream(dlpath);
        response.data.pipe(writeStream)
        writeStream.on('close', () => {
            console.log(`Downloaded: ${file.fileName}`)
            resolve(dlpath)
        });
    })
}

async function mapFilingMeta(filing) {
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

/* fetch().then(d => {
    console.log(d);
    let stateParams = d.stateParams;
    download(d.availableFiles[0], stateParams).then(d => {
        console.log(d);
    }).catch(err => {
        console.log(err);
    });

}).catch(err => {
    console.log(err);
}); */

module.exports = {
    fetch: fetch,
    saveState: saveState,
    needUpdates: needUpdates,
    download: download,
    unzip: unzip,
    mapFilingMeta: mapFilingMeta,
    mapFilingContributions: mapFilingContributions
}