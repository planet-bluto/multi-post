declare global {
    // type print = (...args: any[]) => void
    function print(...args: any[]): void
}

global.print = (...args) => { if (process.env?.NODE_ENV == "dev") { console.log(...args) } }

export {}