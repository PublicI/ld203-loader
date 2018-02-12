const downloadDir = './downloads';
const extractDir = './extracted';

const downloadFiles = true;
const unzip = true;

const senate = require('./senate.js');

//Main execution loop
async function main(){
    //Detect non fields by filtering on "year" column
    let data = await senate.fetch()
    data = data.filter(d => d.year);

    //Check which files need to be updated.
    let updates = await senate.needUpdates(data);

    //Log reqd files.
    console.log(updates.map(d => d.link.split('/').slice(-1)[0]).join(' '))

    //Write current state after parsing.
}

main()