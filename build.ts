import { createOrUpdateRelease } from "./github";
import { _main, e } from "./utilities";

_main(async () => {
    const version = 'v22.x'
    await e`git clone --depth 1 --branch ${version} https://github.com/nodejs/node`
    await e`cd node`
    if (process.platform === 'win32') {
        await e`.\\vcbuild small-icu`

        await createOrUpdateRelease({
            tag: version,
            releaseName: version,
            releaseNotes: 'Upload',
            token: process.env.GITHUB_TOKEN!,
            upload_file_name: 'node.exe',
            upload_file_path: 'out\\Release\\node.exe'
        })

    } else {
        await e`./configure --with-intl=small-icu`
        await e`make -j4`

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