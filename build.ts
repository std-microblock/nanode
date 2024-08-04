import { writeFileSync } from "fs";
import { createOrUpdateRelease, octokit } from "./github.js";
import { _main, patchFile } from "./utilities.js";
import { $ } from 'execa';
import { rmdir } from "fs/promises";
import { minifyUndici } from "./minify-undici.js";
import { platform } from "os";

export interface NanodeBuildOptions {
    icu_mode?: 'full' | 'small' | 'system' | 'none',
    v8_opts?: boolean,
    target_arch?: 'x64' | 'arm64' | 'x86',
    no_jit?: boolean,
    use_lto?: boolean
}

export const buildAndUploadNanode = async (version = 'v18.x', {
    icu_mode = 'full',
    v8_opts = false,
    target_arch = 'x64',
    no_jit = false,
    use_lto = false
}: NanodeBuildOptions) => {
    const buildName = `nanode-${version}-icu_${icu_mode}${v8_opts ? '-v8_opts' : ''}${no_jit ? '-nojit' : ''}${use_lto ? '-lto' : ''}-${target_arch}`;

    const { data: release } = await octokit.repos.getReleaseByTag({
        owner: 'MicroCBer',
        repo: 'nanode',
        tag: version
    }).catch(e=>({
        data: {
            assets: []
        }
    }))

    console.log('Check if release exists: ', buildName)
    if (release.assets.some(asset => {
        if (process.platform === 'win32')
            return asset.name === `${buildName}.exe`
        else
            return asset.name === buildName
    })) {
        console.log('Release already exists, skipping')
        return
    }

    await $`git clone --depth 1 --branch ${version} https://github.com/nodejs/node`
    process.chdir('node')

    await minifyUndici().catch(e => {
        console.error('Failed to minify undici', e)
    })

    try {
        if (v8_opts)
            await patchFile('configure.py', code => {
                code = code.replaceAll('options.v8_disable_object_print', 'True');
                code = code.replaceAll('options.v8_enable_object_print', 'False');
                // code = code.replaceAll('options.v8_enable_pointer_compression', 'False');
                code = code.replaceAll('options.without_inspector', 'True');
                code = code.replaceAll('options.v8_enable_i18n_support', 'False');
                return code
            })

        if (no_jit)
            await patchFile('configure.py', code => {
                code = code.replaceAll('options.v8_lite_mode', 'True');
                return code
            })

        if (use_lto)
            await patchFile('configure.py', code => {
                if (platform() === 'win32')
                    code = code.replaceAll('options.with_ltcg', 'True');
                else 
                    code = code.replaceAll('options.enable_lto', 'True');
                return code
            })

        await patchFile('configure.py', code => {
            code = code.replaceAll('options.without_npm', 'True');
            code = code.replaceAll('options.without_corepack', 'True');
            code = code.replaceAll('options.without_amaro', 'True');

            return code
        })


        if (process.platform === 'win32') {
            const winIcuArg = {
                full: 'full-icu',
                small: 'small-icu',
                none: 'intl-none'
            }
            await $`cmd /c vcbuild.bat ${target_arch} ${winIcuArg[icu_mode]}`

            await createOrUpdateRelease({
                tag: version,
                releaseName: version,
                releaseNotes: 'Upload',
                upload_file_name: `${buildName}.exe`,
                upload_file_path: 'out\\Release\\node.exe'
            })

        } else {
            await $`./configure --with-intl=${icu_mode === 'none' ? icu_mode : `${icu_mode}-icu`}`
            await $`make -j4`
            await $`strip out/Release/node`

            await createOrUpdateRelease({
                tag: version,
                releaseName: version,
                releaseNotes: 'Upload',
                upload_file_name: buildName,
                upload_file_path: 'out/Release/node'
            })
        }
    } finally {
        process.chdir('..')
        await rmdir('node', { recursive: true })
    }
}