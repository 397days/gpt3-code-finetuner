
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { parse: csvParseSync} = require("csv-parse/sync");
const { Configuration, OpenAIApi } = require("openai");
const typescript = require("typescript");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const CSV_DATASET_PATH = process.env.DOCKER_RUNNING ? "/data/dataset.csv" : "data/dataset.csv";
const JSONL_DATASET_PATH = process.env.DOCKER_RUNNING ? "/data/dataset.jsonl" : "data/dataset.jsonl";

const debug = process.env.DEBUG.includes("true") ? (message) => console.log(message) : () => {};

function convertCsvToJsonl(csvFilePath, jsonlFilePath) {
  const csvData = fs.readFileSync(csvFilePath, "utf8");
  const records = csvParseSync(csvData, {
    columns: true,
    skip_empty_lines: true,
    quote: '"',
    relax_column_count: true,
    onRecord: (record) => {
      const prompt = record[Object.keys(record)[0]];
      return { prompt, completion: record.completion };
    }
  });
  fs.writeFileSync(jsonlFilePath, records.map(JSON.stringify).join("\n"));
}

async function uploadDatasetAndFineTuneModel() {
  const uploadResponse = await openai.createFile(
    fs.createReadStream(JSONL_DATASET_PATH),
    "fine-tune"
  );
  const trainingFileId = uploadResponse.data.id;
  const createFineTuneResponse = await openai.createFineTune({
    model: "davinci",
    training_file: trainingFileId,
  });
  const fineTuneId = createFineTuneResponse.data.id;
  const retrieveFineTuneResponse = await openai.retrieveFineTune(fineTuneId);
  console.log(retrieveFineTuneResponse.data);
  return fineTuneId;
}

async function listFineTunes() {
  const listFineTunesResponse = await openai.listFineTunes();
  const fineTunes = listFineTunesResponse.data.data;
  for (const fineTune of fineTunes) {
    console.log(fineTune.id, fineTune.status, fineTune.fine_tuned_model);
  }
}

/**
 * Stores a CSV file of the parsed source code in the `output/` directory.
 * @param {*} sourceCodeFilePath 
 */
function parseSourcecode(sourceCodeFilePath) {
  const program = typescript.createProgram([sourceCodeFilePath], { allowJs: true});
  const printer = typescript.createPrinter({ newLine: typescript.NewLineKind.LineFeed });
  const sourceFile = program.getSourceFile(sourceCodeFilePath);
  debug(`Parsing ${sourceCodeFilePath}...`);
  parseNode(sourceFile);
  function parseNode(node) {
    const completion = printer.printNode(typescript.EmitHint.Unspecified, node, sourceFile);
    const prompts = [];

    // console.log(node);
    if (typescript.isArrowFunction(node)) {

      // console.log(Object.keys(node));