import * as core from '@actions/core';
import {context, GitHub} from '@actions/github';
const parser = require('./parser'); // eslint-disable-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires

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
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN was undefined');
    }
    const octokit: GitHub = new GitHub(process.env.GITHUB_TOKEN);
    if (!process.env.GITHUB_REPOSITORY) {
      throw new Error('GITHUB_REPOSITORY was undefined');
    }

    if (!process.env.GITHUB_RUN_ID) {
      throw new Error('GITHUB_RUN_ID was undefined');
    }
    const runId: number = parseInt(process.env.GITHUB_RUN_ID);
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    core.debug(JSON.stringify(context));

    const filterResults = parser.parse(filter, {context});

    core.debug(`Filter: ${filter}`);
    core.debug(`Filter parsed to: ${filterResults}`);
    if (!filterResults) {
      core.debug('Cancelling the workflow due to filter');
      await octokit.actions.cancelWorkflowRun({
        owner,
        repo,
        run_id: runId // eslint-disable-line @typescript-eslint/camelcase
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await octokit.actions.getWorkflowRun({
        owner,
        repo,
        run_id: runId // eslint-disable-line @typescript-eslint/camelcase
      });
      core.debug(JSON.stringify(result));
      core.setOutput('status', 'Filter evaluated to false');
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
