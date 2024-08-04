import { Octokit } from "octokit";
import { _main, parseVersion } from "./utilities.js";
import { buildAndUploadNanode } from "./build.js";
import { strategies } from "./strategy.js";
process.env.NODE_DEBUG = 'execa'

_main(async () => {
    const targetBranch = process.argv[2] || 'v18.x'
    const strategy = strategies[process.argv[3]]
    const arch = process.argv[4] || 'x64'
    console.log('Building nanode', targetBranch, strategy, arch)
    await buildAndUploadNanode(targetBranch, {
        ...strategy, target_arch: arch as any,
        win_use_clang_cl: process.platform === 'win32' && parseVersion(targetBranch) >= 22
    })
})