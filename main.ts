import { Octokit } from "octokit";
import { _main } from "./utilities.js";
import { buildAndUploadNanode } from "./build.js";

_main(async () => {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN }).rest
    const targetBranchesList = ['v22.x', 'v21.x', 'v20.x', 'v19.x', 'v18.x', 'v17.x', 'v16.x', 'v15.x', 'v14.x', 'v13.x', 'v12.x', 'v11.x', 'v10.x', 'v9.x', 'v8.x']

    for (const targetBranch of targetBranchesList) {
        const { data: releaseList } = await octokit.repos.listReleases({
            owner: 'MicroCBer',
            repo: 'nanode'
        })

        const release = releaseList.find(release => release.tag_name === targetBranch)
        if (!release) {
            console.log('Building nanode', targetBranch)
            await buildAndUploadNanode(targetBranch).catch(e => {
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
    }
})