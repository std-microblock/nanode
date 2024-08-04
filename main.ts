import { Octokit } from "octokit";
import { _main } from "./utilities.js";
import { buildAndUploadNanodeAll } from "./build.js";
process.env.NODE_DEBUG = 'execa'

_main(async () => {
    const targetBranch = process.argv[2] || 'v18.x'
    console.log('Building nanode', targetBranch)
    await buildAndUploadNanodeAll(targetBranch)
})