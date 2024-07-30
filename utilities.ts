import { spawn } from "child_process"


export const createEmulatedShell = () => {
    const shell = {
        cwd: __dirname,
    }

    return (strings: TemplateStringsArray, ...joins: string[]) => {
        const args: string[] = []
        for (let i = 0; i < strings.length; i++) {
            if (strings.length < i) args.push(...strings[i].split(' ').filter(v => v));
            if (joins.length < i) args.push(joins[i])
        }

        if (args[0] === 'cd') {
            shell.cwd = args[1]
            return
        }

        const res = spawn(args[0], args.slice(1), {
            stdio: 'pipe',
            cwd: shell.cwd
        });

        let stdout = ''
        let stderr = ''

        res.stdout.on('data', (data) => {
            stdout += data.toString()
        })

        res.stderr.on('data', (data) => {
            stderr += data.toString()
        })

        return new Promise<{ stdout: string, stderr: string, code: number }>((resolve, reject) => {
            res.on('close', (code) => {
                if (code === 0) {
                    resolve({ stdout, stderr, code })
                }
                else {
                    reject({ stdout, stderr, code })
                }
            })
        })
    }
}

export const execTag = createEmulatedShell()

export const e = execTag;

export const _main = (func) => {
    func()
}