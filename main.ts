import { Octokit } from "octokit";
import { _main } from "./utilities.js";
import { buildAndUploadNanodeAll } from "./build.js";
process.env.NODE_DEBUG = 'execa'

_main(async () => {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN }).rest
    const targetBranchesList = ['v22.x', 'v21.x', 'v20.x', 'v19.x', 'v18.x', 'v17.x', 'v16.x']

    for (const targetBranch of targetBranchesList) {
        console.log('Building nanode', targetBranch)
        await buildAndUploadNanodeAll(targetBranch).catch(e => {
            console.error('Failed to build nanode', targetBranch, e)
            octokit.repos.createRelease({
                owner: 'MicroCBer',
                repo: 'nanode',
                tag_name: targetBranch,
                name: targetBranch,
                body: `BUILD FAILED at ${new Date().toISOString()}`
            }).catch(e => { })
        })
    }
})