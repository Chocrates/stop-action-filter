import * as core from '@actions/core';
import {context} from '@actions/github';
import {WebhookPayload} from '@actions/github/lib/interfaces';
import * as pegjs from 'pegjs';
import * as fs from 'fs';
import bent = require('bent'); // eslint-disable-line @typescript-eslint/no-require-imports

function handleError(error: Error): void {
  core.debug(error.message);
  core.debug(error.stack || '');

  core.setOutput('message', error.message);
  core.setOutput('stepStatus', 'failed');

  core.setFailed(error.message);
}

async function run(): Promise<void> {
  const filter: string = core.getInput('filter');

  try {
    if (!process.env.GITHUB_REPOSITORY) {
      throw new Error('GITHUB_REPOSITORY was undefined');
    }
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    const payload: WebhookPayload = context.payload;
    core.debug(JSON.stringify(payload));
    const grammer = fs.readFileSync('src/parser.pegjs', 'utf-8');
    const finalGrammer = `{ var context = ${JSON.stringify(payload)} ${grammer}`;

    const parser = pegjs.generate(finalGrammer);
    const filterResults = parser.parse(filter);
    core.debug(filter);
    core.debug(`Filter parsed to: ${filterResults}`);
    if (!filterResults) {
      core.debug('Cancelling the workflow due to filter');
      const post = bent('https://api.github.com', 'POST', 'string', 200);
      await post(`/repos/${owner}/${repo}/actions/runs/${payload.run_id}/cancel`);
    } else {
      core.setOutput('status', 'Filter evaluated to true');
    }
  } catch (error) {
    handleError(error);
  }
}

if (!module.parent) {
  run();
}

export {handleError, run};
