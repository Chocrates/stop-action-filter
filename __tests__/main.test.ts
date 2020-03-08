/* global octomock */
import {handleError, run} from '../src/main';

describe('Main tests', () => {
  beforeEach(() => {
    process.env.ADMIN_TOKEN = 'not-a-token';
    process.env.GITHUB_REPOSITORY = 'ActionsDesk/invite-user';
    octomock.resetMocks();
    octomock.loadIssueLabeledContext({
      issueBody: 'Test',
      issueNumber: 1,
      issueAuthorLogin: 'devops-bot'
    });

    octomock.mockFunctions.core.getInput.mockReturnValueOnce('action == "bug"');
  });

  test('handleError', () => {
    handleError(new Error('oh no!!!'));

    expect(octomock.mockFunctions.core.debug).toBeCalledTimes(2);
    expect(octomock.mockFunctions.core.setOutput).toBeCalledTimes(2);
    expect(octomock.mockFunctions.core.setFailed).toBeCalledTimes(1);
  });

  test('main parses the filter', async () => {
    run();
  });
});
