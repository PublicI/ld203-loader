const senate = require('./senate.js');
const house = require('./house.js');
const utils = require('./convert.js');
const fs = require('fs-extra');
const yargs = require('yargs');
const path = require('path');

function getChamberObj(yargs) {
    return yargs.chamber == 'house' ? house : yargs.chamber == 'senate' ? senate : null;
}

async function updates(yargs) {
    let chamber = getChamberObj(yargs);
    
    let fetchLatest = await chamber.fetch();
    let updates = await chamber.needUpdates(fetchLatest.availableFiles);
    if(yargs._[0] == 'updates') console.log(updates);

    fetchLatest.availableFiles = updates;

    return fetchLatest
}

async function download(yargs) {
    let chamber = getChamberObj(yargs);
    let toDownload = await updates(yargs);
    let downloadDir = yargs.downloadDir;
    
    let downloads = toDownload.availableFiles.map(file => chamber.download(file, downloadDir, toDownload))

    let finishedDownloads = await Promise.all(downloads);
    console.log(finishedDownloads);
}

async function convert(yargs) {
    let chamber = getChamberObj(yargs);
    let inputFile = yargs.inputXML;
    let outputDir = yargs.outputDir;

    await utils.main(inputFile, outputDir, chamber);
}

async function extract(yargs) {
    let chamber = getChamberObj(yargs);
    let inputDir = yargs.inputDir;
    let outputDir = yargs.outputDir;

    let inputFiles = await fs.readdirSync(inputDir);
    inputFiles = inputFiles.filter(f => path.extname(f) == '.zip');
    inputFiles = inputFiles.map(f => path.resolve(inputDir, f));

    inputFiles = await Promise.all(inputFiles.map(f => utils.unzipFile(f, outputDir)))
    
    return inputFiles
}

async function convertAll(yargs) {    
    let chamber = getChamberObj(yargs);
    let inputDir = yargs.inputDir;
    let outputDir = path.resolve(yargs.outputDir, path.basename(inputDir));
    
    fs.ensureDirSync(outputDir);

    let inputFiles = fs.readdirSync(inputDir);
    inputFiles = inputFiles.filter(f => path.extname(f) != 'xml');
    inputFiles = inputFiles.map(f => path.resolve(inputDir, f));

    let finishedProcessing = await Promise.all(inputFiles.map(f => convert({chamber: yargs.chamber, inputXML: f, outputDir: outputDir})));

    return finishedProcessing
    // Read all the files in the input directory
    // Write them out to output directory
}
//Main execution loop
async function main(){
    //Detect non fields by filtering on "year" column
    let data = await senate.fetch()
    data = data.filter(d => d.year);

    //Check which files need to be updated.
    let updates = await senate.needUpdates(data);

    //Log reqd files.
    console.log(updates.map(d => d.link.split('/').slice(-1)[0]).join(' '))
    
    await senate.saveState(updates);
    //Write current state after parsing.
}

//main()


yargs.usage('Usage: $0 <command> <chamber> [options]')
.command('updates <chamber>', 'fetch updates for a chamber', () => {}, updates)
.command('download <chamber> [options]', 'download updates from a chamber', (yargs) => {
    return yargs.demandOption(['downloadDir'])
}, download)
.command('convert <chamber> [options]', 'convert XML from a given chamber to a csv/json', (yargs) => {
    return yargs.demandOption(['outputDir', 'inputXML'])
}, convert)
.command('extract [options]', 'extract files from all zips in inputDir to outputDir', (yargs) => {
    return yargs.demandOption(['outputDir', 'inputDir'])
}, extract)
.command('convertAll <chamber> [options]', 'convert all XMLs in a directory', (yargs) => {
    return yargs.demandOption(['inputDir', 'outputDir'])
}, convertAll)
.describe('inputDir', 'directory to look for input files')
.describe('outputDir', 'directory to output the files to')
.describe('downloadDir', 'directory to download the files to')
.describe('inputXML', 'XML to parse')
.alias('h', 'help')
.argv;