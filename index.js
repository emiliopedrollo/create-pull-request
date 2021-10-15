const core = require("@actions/core");
const { Octokit } = require("./client");

new Promise(async(resolve) => {

    const token = core.getInput('token')
    const title = core.getInput('title')
    const body = core.getInput('body')
    const draft = core.getInput('draft')
    const head = core.getInput('head')
    const base = core.getInput('base')
    const repository = core.getInput('repository')


    const [owner, repo] = repository.split('/')


    const octokit = new Octokit({
        auth: token
    })

    core.startGroup('Create the pull request')
    const {data: pull} = await octokit.rest.pulls.create({
        owner, repo, title, body, head, base, draft
    })

    core.debug(pull)
    core.debug(JSON.stringify(pull,null,2))
    core.exportVariable('PULL_REQUEST_NUMBER', pull.number)
    core.setOutput('pull-request-number', pull.number)

    core.endGroup()

    resolve()

}).then()
