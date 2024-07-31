import { writeFileSync } from "fs";
import { createOrUpdateRelease } from "./github.js";
import { _main} from "./utilities.js";
import {$} from 'execa';

_main(async () => {
    const version = 'v22.x'
    await $`git clone --depth 1 --branch ${version} https://github.com/nodejs/node`
    process.chdir('node')

    writeFileSync('out.test', 'test')
    console.log(process.env.GITHUB_TOKEN)
    await createOrUpdateRelease({
        tag: version,
        releaseName: version,
        releaseNotes: 'Upload',
        token: process.env.GITHUB_TOKEN!,
        upload_file_name: 'node.exe',
        upload_file_path: 'out.test'
    })

    if (process.platform === 'win32') {
        await $`.\\vcbuild small-icu`

        await createOrUpdateRelease({
            tag: version,
            releaseName: version,
            releaseNotes: 'Upload',
            token: process.env.GITHUB_TOKEN!,
            upload_file_name: 'node.exe',
            upload_file_path: 'out\\Release\\node.exe'
        })

    } else {
        await $`./configure --with-intl=small-icu`
        await $`make -j4`

        await createOrUpdateRelease({
            tag: version,
            releaseName: version,
            releaseNotes: 'Upload',
            token: process.env.GITHUB_TOKEN!,
            upload_file_name: 'node',
            upload_file_path: 'out/Release/node'
        })
    }
})