/* global octomock */
const parser = require('../src/parser'); // eslint-disable-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires

describe('Parser tests', () => {
  beforeEach(() => {
    octomock.loadIssueLabeledContext({
      issueBody: 'Test',
      issueNumber: 1,
      issueAuthorLogin: 'devops-bot'
    });
  });

  test('Property == "string" evaluates to true', () => {
    const filter = 'payload.action == "labeled"';
    expect(parser.parse(filter, {context: octomock.getContext()})).toEqual(true);
  });

  test('Property == "string" evaluates to false', () => {
    const filter = 'payload.action == "bug"';
    expect(parser.parse(filter, {context: octomock.getContext()})).toEqual(false);
  });

  test('Labels in ["label"] evaluates to true', () => {
    const filter = 'payload.issue.labels in ["bug"]';
    console.log(JSON.stringify(octomock.getContext()));
    expect(parser.parse(filter, {context: octomock.getContext()})).toEqual(true);
  });

  test('Labels in ["label"] evaluates to false', () => {
    const filter = 'payload.issue.labels in ["notbug"]';
    expect(parser.parse(filter, {context: octomock.getContext()})).toEqual(false);
  });
});
