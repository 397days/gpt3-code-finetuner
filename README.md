# GPT-3 Code Fine-Tuner

This repository includes setup instructions and dependencies required to fine-tune GPT-3 for generating code from prompts.

## Dependencies:
- [GPT-3 from OpenAI](https://github.com/openai/openai-node)
- [yargs for command-line arguments](https://github.com/yargs/yargs)
- [TypeScript for Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
- [dotenv for loading environment variables](https://github.com/motdotla/dotenv)

## Install and Setup

Run the following command to install dependencies:

```shell
npm install
```

Storage of the api key should be in a `.env` file. Control debug logging with the `DEBUG` environment variable.

```
OPENAI_API_KEY="YOUR_OPENAI_API_KEY_GOES_HERE"
DEBUG="true"
```

### Dataset and TypeScript/JavaScript Code Parser
The dataset is in [`./dataset.csv`](./dataset.csv). Follow the commands below to parse TypeScript and JavaScript for additional completions on the dataset.

### Running the Code

The code can be run as detailed below. It includes uploading the dataset, creating the fine-tuned model and generating model-finetune-id prompt.

### Example Sessio