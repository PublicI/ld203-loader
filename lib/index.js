const senate = require('./senate.js');
const house = require('./house.js');

const yargs = require('yargs')
.usage('Usage: $0 <command> <chamber> [options]')
.command('updates <chamber>', 'fetch updates for a chamber', () => {}, updates)
.command('download <chamber> [options]', 'download updates from a chamber', (yargs) => {
    return yargs.demandOption(['downloadDir'])
}, download)
.command('convert <chamber> [options]', 'convert XML from a given chamber to a csv/json', (yargs) => {
    return yargs.demandOption(['downloadDir', 'inputXML'])
}, convert)
.describe('downloadDir', 'directory to download the files to')
.describe('inputXML', 'XML to parse')
.alias('h', 'help')
.argv;

async function updates(yargs) {
    let chamber = yargs.chamber == 'house' ? house : yargs.chamber == 'senate' ? senate : null;
    
    let availableFiles = await chamber.fetch();
    let updates = await senate.needUpdates(availableFiles.availableFiles);

    console.log(updates);
}

function download(yargs) {

}

function convert(yargs) {

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