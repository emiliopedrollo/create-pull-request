import core from "@actions/core";
import {Octokit} from "./client";

await new Promise(async(resolve) => {

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

    await octokit.rest.pulls.create({
        owner, repo, title, body, head, base, draft
    })

    resolve()

}).then()
