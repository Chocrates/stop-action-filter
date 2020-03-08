/* global octomock */
import {handleError, run} from '../src/main';

describe('Main tests', () => {
  beforeEach(() => {
    process.env.GITHUB_TOKEN = 'not-a-token';
    process.env.GITHUB_REPOSITORY = 'Chocrates/stop-action-filter';
    octomock.resetMocks();
    octomock.loadIssueLabeledContext({
      issueBody: 'Test',
      issueNumber: 1,
      issueAuthorLogin: 'devops-bot'
    });

    octomock.mockFunctions.core.getInput.mockReturnValueOnce('payload.action == "labeled"');
  });

  test('handleError', () => {
    handleError(new Error('oh no!!!'));

    expect(octomock.mockFunctions.core.debug).toBeCalledTimes(2);
    expect(octomock.mockFunctions.core.setOutput).toBeCalledTimes(2);
    expect(octomock.mockFunctions.core.setFailed).toBeCalledTimes(1);
  });

  test('main parses the filter', async () => {
    run();
    expect(octomock.mockFunctions.core.setOutput).toHaveBeenCalledWith('status', 'Filter evaluated to true');
  });
});
