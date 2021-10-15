const { Octokit: Core } = require('@octokit/core')
const { paginateRest } = require("@octokit/plugin-paginate-rest")
const { restEndpointMethods } = require("@octokit/plugin-rest-endpoint-methods")
const { HttpsProxyAgent } = require('https-proxy-agent')


export const Octokit = Core.plugin(
    paginateRest, restEndpointMethods, autoProxyAgent
)

// Octokit plugin to support the https_proxy environment variable
function autoProxyAgent(octokit) {
    const proxy = process.env.https_proxy || process.env.HTTPS_PROXY
    if (!proxy) return

    const agent = new HttpsProxyAgent(proxy)
    octokit.hook.before('request', options => {
        // noinspection JSUnresolvedVariable
        options.request.agent = agent
    })
}
