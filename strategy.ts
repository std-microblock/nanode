import { NanodeBuildOptions } from "./build.js"

export const strategies: {
    [key: string]: NanodeBuildOptions
} = {
    a: { icu_mode: 'none', v8_opts: true, use_lto: true },
    b: { icu_mode: 'none', v8_opts: true, no_jit: true, use_lto: true },
    c: { icu_mode: 'none', use_lto: true },
    d: { icu_mode: 'system', use_lto: true },
}