const core = require("@actions/core");
const { Octokit } = require("./client");

const splitInput = (input) => {
    return input.split(/[\n,]+/).map(s => s.trim()).filter(s => s !== '');
}

new Promise(async(resolve) => {

    core.startGroup('Parsing input')

    const token = core.getInput('token')
    const title = core.getInput('title')
    const body = core.getInput('body')
    const draft = core.getBooleanInput('draft')
    const head = core.getInput('head')
    const base = core.getInput('base')
    const repository = core.getInput('repository')
    const labels = splitInput(core.getInput('labels'))
    const assignees = splitInput(core.getInput('assignees'))
    const reviewers = splitInput(core.getInput('reviewers'))
    const team_reviewers = splitInput(core.getInput('team-reviewers'))
    const milestone = Number(core.getInput('milestone'))
    const [owner, repo] = repository.split('/')

    core.info(JSON.stringify({
        title, body, draft, head, base, repository, labels,
        assignees, reviewers, team_reviewers, milestone, owner, repo
    },null,2))

    core.endGroup()


    core.startGroup('Create the pull request')

    const octokit = new Octokit({
        auth: token
    })

    const params = {
        owner, repo, title, body, head, base, draft
    }

    const {data: pull} = await octokit.rest.pulls.create(params)
    core.info(JSON.stringify(pull,null,2))
    core.exportVariable('PULL_REQUEST_NUMBER', pull.number)
    core.setOutput('pull-request-number', pull.number)

    core.endGroup()
    core.startGroup('Updating the pull request with milestone, labels, assignees and reviewers')
    const issue_number = pull.number
    const pull_number = pull.number

    const updates = []

    if (milestone) {
        core.info(`Queuing milestone update`)
        updates.push(octokit.rest.issues.update({ owner, repo, issue_number, milestone }).then(() => {
            core.info(`Set milestone ${milestone} successfully`)
        }, (err) => {
            core.error(`Some error occurred while trying to set milestone: ${err.message}`)
        }))
    }

    if (labels.length > 0) {
        updates.push(octokit.rest.issues.addLabels({ owner, repo, issue_number, labels }).then(() => {
            core.info(`Set labels ${labels} successfully`)
        }, (err) => {
            core.error(`Some error occurred while trying to set labels: ${err.message}`)
        }))
    }

    if (assignees.length > 0) {
        updates.push(octokit.rest.issues.addAssignees({ owner, repo, issue_number, assignees }).then(() => {
            core.info(`Set assignees ${assignees} successfully`)
        }, (err) => {
            core.error(`Some error occurred while trying to set assignees: ${err.message}`)
        }))
    }

    if ((reviewers.length > 0) || (team_reviewers.length > 0)) {
        updates.push(octokit.rest.pulls.requestReviewers({ owner, repo, pull_number, reviewers, team_reviewers }).then(() => {
            const set = [ ...team_reviewers, ...reviewers ]
            core.info(`Set reviewers ${set} successfully`)
        }, (err) => {
            core.error(`Some error occurred while trying to set reviewers: ${err.message}`)
        }))
    }

    await Promise.all(updates)
    core.info(`Executed ${updates.length} updates`)
    core.endGroup()

    resolve()

}).then(() => {
    core.info('Finished')
})
