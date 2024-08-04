import { build } from "esbuild"
import { readdir } from "fs/promises"

export const minifyUndici = async () => {
    const readdirRecursive = async (dir: string)=>{
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

    const file = 'deps/undici/undici.js'
    await build({
        entryPoints: [file],
        minify: true,
        outfile: file,
        allowOverwrite: true,
        bundle: false
    })
}