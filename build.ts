import { writeFileSync } from "fs";
import { createOrUpdateRelease } from "./github.js";
import { _main, patchFile } from "./utilities.js";
import { $ } from 'execa';
import { rmdir } from "fs/promises";
import { minifyUndici } from "./minify-undici.js";


export const buildAndUploadNanodeAll = async (version = 'v18.x') => {
    for (const target_arch of ['x64', 'arm64', 'x86'] as const) {
        // Skip x86 on Windows, as it's not supported anymore
        if (target_arch === 'x86' && process.platform === 'win32') continue;

        let err_str = ''
        await buildAndUploadNanode(version, { icu_mode: 'none', v8_opts: true, target_arch }).catch(() => { })
        await buildAndUploadNanode(version, { icu_mode: 'none', v8_opts: true, target_arch, no_jit: true }).catch(() => { })
        await buildAndUploadNanode(version, { icu_mode: 'none', target_arch }).catch(() => { })
        if (process.platform !== 'win32') {
            await buildAndUploadNanode(version, { icu_mode: 'system', target_arch }).catch(() => { })
        }
    }
}
export const buildAndUploadNanode = async (version = 'v18.x', {
    icu_mode = 'full',
    v8_opts = false,
    target_arch = 'x64',
    no_jit = false
}: {
    icu_mode?: 'full' | 'small' | 'system' | 'none',
    v8_opts?: boolean,
    target_arch?: 'x64' | 'arm64' | 'x86',
    no_jit?: boolean
}) => {
    await $`git clone --depth 1 --branch ${version} https://github.com/nodejs/node`
    process.chdir('node')

    await minifyUndici().catch(e => {
        console.error('Failed to minify undici', e)
    })

    const buildName = `nanode-${version}-icu_${icu_mode}${v8_opts ? '-v8_opts' : ''}${no_jit ? '-nojit' : ''}`;
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
                token: process.env.GITHUB_TOKEN!,
                upload_file_name: `${buildName}.exe`,
                upload_file_path: 'out\\Release\\node.exe'
            })

        } else {
            await $`./configure --with-intl=${icu_mode === 'none' ? icu_mode : `${icu_mode}-icu`}`
            await $`make -j4`

            await createOrUpdateRelease({
                tag: version,
                releaseName: version,
                releaseNotes: 'Upload',
                token: process.env.GITHUB_TOKEN!,
                upload_file_name: buildName,
                upload_file_path: 'out/Release/node'
            })
        }
    } finally {
        process.chdir('..')
        await rmdir('node', { recursive: true })
    }
}