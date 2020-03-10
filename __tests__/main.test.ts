/* global octomock */
import {handleError, run} from '../src/main';

describe('Main tests', () => {
  const owner = 'Chocrates';
  const repo = 'stop-action-filter';
  const runId = 1;

  beforeEach(() => {
    octomock.resetMocks();
    process.env.GITHUB_TOKEN = 'not-a-token';
    process.env.GITHUB_REPOSITORY = `${owner}/${repo}`;
    process.env.GITHUB_RUN_ID = `${runId}`;
    octomock.resetMocks();
    octomock.loadIssueLabeledContext({
      issueBody: 'Test',
      issueNumber: 1,
      issueAuthorLogin: 'devops-bot'
    });
  });

  test('handleError', () => {
    handleError(new Error('oh no!!!'));

    expect(octomock.mockFunctions.core.debug).toBeCalledTimes(2);
    expect(octomock.mockFunctions.core.setOutput).toBeCalledTimes(2);
    expect(octomock.mockFunctions.core.setFailed).toBeCalledTimes(1);
  });

  test('main parses the filter to true and exits', async () => {
    octomock.mockFunctions.core.getInput.mockReturnValueOnce('payload.action == "labeled"');
    await run();
    expect(octomock.mockFunctions.core.setOutput).toHaveBeenCalledWith('status', 'Filter evaluated to true');
  });

  test('main parses the filter to false and cancels the workflow', async () => {
    octomock.mockFunctions.core.getInput.mockReturnValueOnce('payload.action == "bug"');
    await run();
    expect(octomock.mockFunctions.actions.cancelWorkflowRun).toHaveBeenCalledWith({
      owner,
      repo,
      run_id: runId
    });
    expect(octomock.mockFunctions.core.setFailed).toHaveBeenCalledTimes(0);
    expect(octomock.mockFunctions.core.setOutput).toHaveBeenCalledWith('status', 'Filter evaluated to false');
  });

  test('main parses the filter to true for the label object and exits', async () => {
    octomock.mockFunctions.core.getInput.mockReturnValueOnce('payload.issue.labels in ["bug"]');
    await run();
    expect(octomock.mockFunctions.core.setOutput).toHaveBeenCalledWith('status', 'Filter evaluated to true');
  });
});
