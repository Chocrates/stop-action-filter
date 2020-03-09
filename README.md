# GitHub Action - stop-action-filter
![ci](https://github.com/Chocrates/stop-action-filter/workflows/ci/badge.svg)  

This GitHub Action is intended to replace repeated `if` statements within a workflow file, by allowing the user to cancel an action based on attributes of the GitHub context that is generated on the event.  
It utilizes PegJS to generate a simple filter language that allows you to traverse the context and validate that attributes match what you are looking for.  

## Usage

### Pre-requisites
Generate a [Personal Access Token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) and save it in your secrets for the Repo that you wish to use this action.

### Inputs
* `FILTER`: This is the filter that is used validate the GitHub context.  When it evaluates to True the action exits and your workflow continues on.  When it evaluates to False the action will utilize the Actions API to cancel the current workflow

### Environment Variables
* `GITHUB_TOKEN`: This is the `PAT` that you generated earlier.  This is used to call the [Actions API](https://octokit.github.io/rest.js/v17#actions-cancel-workflow-run) to cancel the current workflow run


## Filter Grammer
Currently the grammer is quite simple.  You can have a string, surrounded by single or double quotes, or a path to a property within the GitHub Context.  Paths and Strings can be compared with the standard boolean operators, `<`, `<=`, `>`, `>=`, `==`.  
Additionally you can validate that a property is in a list of strings using the `in` operator (examples below).
Finally there is a not operator, `!` that can be prepended to the command group to negate the result. 
Commands can be chained with `||` and `&&`.  Currently the grammer does not support operator precedence and will combine commands together in order from left to right.
Command grouping with parenthesis is not currently implemented, but it is on the wishlist (PR's welcome!)

### Paths
Paths use the standard javascript dot notation, so to get the issue number of an issue you would have a path like so: `payload.issue.number`

### Strings 
Strings are any group of text surrounded by a single or double quotes.  Anything else will be assumed to be a path

###  Example Filters
* Filter the issue `labeled` event to only `bug` or `question`  
  * `payload.label.name in [ 'bug', 'question' ]`
* Filter the comment created event to a certain user
  * `payload.comment.user.login == "Chocrates"`
  
  
## Example Workflow
* When a user opens a new `bug` leave them a comment with next steps and links to other resources to get help
```yaml
name: Test workflow to add a comment to bugs
on:
  issues:
    types: [labeled]

jobs:
  add-comment:
    runs-on: ubuntu-latest
    steps:
      - uses: chocrates/stop-action-filter@master
        with:
          filter: 'payload.label.name == "bug"'
        env:
          GITHUB_TOKEN: ${{ secrets.TOKEN }}
      - uses: ActionsDesk/add-comment-action@release/v1
        with:
          message: 'Thank you for opening an issue!  I am sorry you are having troubles.  While you wait for your issue to get Triaged, please consider glancing at the documentation in the wiki: https://github.com/Chocrates/stop-action-filter/wiki'
          stepStatus: 'success'
        env:
          GITHUB_TOKEN: ${{ secrets.TOKEN }}
```
  
