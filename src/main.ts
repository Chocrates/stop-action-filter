import * as core from '@actions/core';
import {GitHub, context} from '@actions/github';
import {Issue, ActionInputs, CreateInvitationInputs} from './interfaces';
import * as Octokit from '@octokit/rest';
import * as pegjs from 'pegjs';
import * as fs from 'fs';

function handleError(error: any) {
  core.debug(error.message);
  core.debug(error.stack || '');

  core.setOutput('message', error.message);
  core.setOutput('stepStatus', 'failed');

  core.setFailed(error.message);
}

async function run(): Promise<void> {
  const filter: string = core.getInput('filter');

  try {
    const octokit: GitHub = new GitHub(process.env.GITHUB_TOKEN as string);
    const payload: any = context.payload;
    const grammer = fs.readFileSync('src/parser.pegjs', 'utf-8');
    const final_grammer = `{ var context = ` + JSON.stringify(payload) + grammer;
    core.debug(final_grammer);
    const parser = pegjs.generate(final_grammer);

    (parser as any).context = payload;
    core.debug(parser.parse(filter));
  } catch (error) {
    handleError(error);
  }
}

if (!module.parent) {
  run();
}

export {handleError, run};
