const senate = require('./senate.js');
const house = require('./house.js');
const utils = require('./utils.js');
const fs = require('fs-extra');
const yargs = require('yargs');
const path = require('path');
const _ = require('highland');
const klaw = require('klaw');

function getDirectories(srcPath) {
    let allFiles = fs.readdirSync(srcPath);
    let directories = allFiles.filter(file =>
        fs.lstatSync(path.join(srcPath, file)).isDirectory()
    );
    return directories;
}

function getChamberObj(yargs) {
    return yargs.chamber == 'house'
        ? house
        : yargs.chamber == 'senate' ? senate : null;
}

async function updates(yargs) {
    let chamber = getChamberObj(yargs);

    let fetchLatest = await chamber.fetch();
    let updates = await chamber.needUpdates(fetchLatest.availableFiles);
    if (yargs._[0] == 'updates') console.log(updates);

    fetchLatest.availableFiles = updates;

    return fetchLatest;
}

async function download(yargs) {
    let chamber = getChamberObj(yargs);
    let toDownload = await updates(yargs);
    let downloadDir = yargs.downloadDir;

    _(toDownload.availableFiles)
        .map(file => _(chamber.download(file, downloadDir, toDownload)))
        .mergeWithLimit(1)
        .done(function() {
            console.log(
                `Finished downloading: ${toDownload.availableFiles
                    .length} files.`
            );
        });
}

async function convert(yargs) {
    let chamber = getChamberObj(yargs);
    let inputFile = yargs.inputXML;
    let outputDir = yargs.outputDir;

    return await utils.main(inputFile, outputDir, chamber);
}

async function extract(yargs) {
    let chamber = getChamberObj(yargs);
    let inputDir = yargs.inputDir;
    let outputDir = yargs.outputDir;

    let inputFiles = await fs.readdir(inputDir);

    _(inputFiles)
        .filter(f => path.extname(f) == '.zip')
        .map(f => path.resolve(inputDir, f))
        .map(f => _(utils.unzipFile(f, outputDir)))
        .mergeWithLimit(1)
        .done(() => {
            console.log(`Finished extracting ${inputFiles.length} files.`);
        });
}

function convertAll(yargs) {
    let chamber = getChamberObj(yargs);
    let inputDir = yargs.inputDir;
    let outputDir = path.resolve(yargs.outputDir, path.basename(inputDir));

    let inputFiles = fs.readdirSync(inputDir);
    fs.ensureDirSync(outputDir);

    return _(inputFiles)
        .filter(f => path.extname(f) != 'xml')
        .map(f => path.resolve(inputDir, f))
        .map(f =>
            _(
                convert({
                    chamber: yargs.chamber,
                    inputXML: f,
                    outputDir: outputDir
                })
            )
        )
        .mergeWithLimit(1);
}

async function batchConvert(yargs) {
    let chamber = getChamberObj(yargs);
    let inputDir = yargs.inputDir;
    let outputDir = yargs.outputDir;
    let progress;

    let directories = getDirectories(inputDir);
    _(directories)
        .doto(dirs => {
            console.log(`Converting ${dirs}`);
        })
        .map(directory =>
            convertAll({
                chamber: yargs.chamber,
                inputDir: path.resolve(inputDir, directory),
                outputDir: yargs.outputDir
            })
        )
        .mergeWithLimit(1)
        .done(() => {
            console.log(`Finished converting ${inputDir}`);
        });
}

async function mergeFiles(yargs) {
    let inputDir = yargs.inputDir;
    let chamber = yargs.chamber;
    let outputFile = yargs.outputFile;
    let fileType = yargs.type;

    _(getDirectories(inputDir))
        .doto(dirs => {
            console.log(`Processing ${dirs}`);
        })
        .map(d => path.resolve(inputDir, d))
        .map(d => {
            return _(fs.readdir(d))
                .sequence()
                .map(f => path.resolve(d, f));
        })
        .sequence()
        .filter(d => d.endsWith(`_${fileType}.json`))
        .map(_.wrapCallback(fs.readFile))
        .merge()
        .pipe(fs.createWriteStream(outputFile))
        .on('close', () => {
            console.log(`Finished writing ${outputFile}`);
        });
}

yargs
    .usage('Usage: $0 <command> <chamber> [options]')
    .command(
        'updates <chamber>',
        'fetch updates for a chamber',
        () => {},
        updates
    )
    .command(
        'download <chamber> [options]',
        'download updates from a chamber',
        yargs => {
            return yargs.demandOption(['downloadDir']);
        },
        download
    )
    .command(
        'convert <chamber> [options]',
        'convert XML from a given chamber to a csv/json',
        yargs => {
            return yargs.demandOption(['outputDir', 'inputXML']);
        },
        convert
    )
    .command(
        'extract [options]',
        'extract files from all zips in inputDir to outputDir',
        yargs => {
            return yargs.demandOption(['outputDir', 'inputDir']);
        },
        extract
    )
    .command(
        'convertAll <chamber> [options]',
        'convert all XMLs in a directory',
        yargs => {
            return yargs.demandOption(['inputDir', 'outputDir']);
        },
        yargs => {
            convertAll(yargs).done(() => {
                console.log(`Finished ${yargs.inputDir}`);
            });
        }
    )
    .command(
        'batchConvert <chamber> [options]',
        'batch convert all the downloads',
        yargs => {
            return yargs.demandOption(['inputDir', 'outputDir']);
        },
        batchConvert
    )
    .command(
        'mergeFiles <chamber> <type> [options]',
        'merge json files into single output file',
        yargs => {
            return yargs.demandOption(['inputDir', 'outputFile']);
        },
        mergeFiles
    )
    .describe('inputDir', 'directory to look for input files')
    .describe('outputDir', 'directory to output the files to')
    .describe('downloadDir', 'directory to download the files to')
    .describe('inputXML', 'XML to parse')
    .alias('h', 'help').argv;
