
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