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
    octomock.mockFunctions.repos.getContents.mockReturnValue({
      data: {
        content: Buffer.from(
          `{
                        "emailDomainRule": {
                            "regex": ".*@email.com$"
                        },
                        "trustedUserRule": {
                            "regex": "^devops-bot$"
                        }
                }`
        ).toString('base64')
      }
    });

    octomock.mockFunctions.orgs.createInvitation.mockReturnValue({
      data: {
        id: 1,
        created_on: 'Now'
      }
    });
    octomock.mockFunctions.core.getInput
      .mockReturnValueOnce('user@email.com')
      .mockReturnValueOnce('user_role')
      .mockReturnValueOnce('./notUsed')
      .mockReturnValueOnce('user');
  });

  test('handleError', () => {
    handleError(new Error('oh no!!!'));

    expect(octomock.mockFunctions.core.debug).toBeCalledTimes(2);
    expect(octomock.mockFunctions.core.setOutput).toBeCalledTimes(2);
    expect(octomock.mockFunctions.core.setFailed).toBeCalledTimes(1);
  });
});
