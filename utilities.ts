import { readFile, writeFile } from "fs/promises"

export const _main = (func) => {
    func()
}

export const patchFile = async (file: string, patch: ((orig: string)=>string)) => {
    const original = await readFile(file, 'utf-8')
    await writeFile(file, patch(original))
}

export const parseVersion = (version: string) => {
    // v12.x -> 12
    return parseInt(version.replace('v', ''))
}