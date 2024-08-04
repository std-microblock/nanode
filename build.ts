import { writeFileSync } from "fs";
import { createOrUpdateRelease } from "./github.js";
import { _main } from "./utilities.js";
import { $ } from 'execa';
import { rmdir } from "fs/promises";
import { minifyUndici } from "./minify-undici.js";


export const buildAndUploadNanodeAll = async (version = 'v18.x') => {
    await buildAndUploadNanode(version, { icu_mode: 'none' })
    await buildAndUploadNanode(version, { icu_mode: 'system' })
}
export const buildAndUploadNanode = async (version = 'v18.x', {
    icu_mode = 'full'
}: {
    icu_mode?: 'full' | 'small' | 'system' | 'none'
}) => {
    await $`git clone --depth 1 --branch ${version} https://github.com/nodejs/node`
    process.chdir('node')

    await minifyUndici().catch(e => {
        console.error('Failed to minify undici', e)
    })

    try {
        if (process.platform === 'win32') {
            await $`cmd /c vcbuild.bat none`

            await createOrUpdateRelease({
                tag: version,
                releaseName: version,
                releaseNotes: 'Upload',
                token: process.env.GITHUB_TOKEN!,
                upload_file_name: `nanode-${version}-icu_${icu_mode}.exe`,
                upload_file_path: 'out\\Release\\node.exe'
            })

        } else {
            await $`./configure --with-intl=none`
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
    } finally {
        process.chdir('..')
        await rmdir('node', { recursive: true })
    }
}