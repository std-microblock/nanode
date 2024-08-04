import { build } from "esbuild"
import { readdir } from "fs/promises"
import { join } from "path"
import { cwd } from "process"

export const minifyJS = async () => {
    const readdirRecursive = async (dir: string) => {
        let result: string[] = []
        for (const dirent of await readdir(dir, { withFileTypes: true })) {
            if (dirent.isDirectory()) {
                result = result.concat(await readdirRecursive(`${dir}/${dirent.name}`))
            } else {
                result.push(`${dir}/${dirent.name}`)
            }
        }
        return result
    }

    const files = await readdirRecursive(cwd())
    for (const file of files.filter(v => v.endsWith('.js') || v.endsWith('.mjs'))) {
        await build({
            entryPoints: [file],
            minify: true,
            outfile: file,
            allowOverwrite: true,
            bundle: false
        })
    }
}