export type LogEntry = [Date, string]
export type Log = Set<LogEntry>

export class DebugConsole
    implements Pick<Console, 'log' | 'warn' | 'error' | 'assert' | 'info'> {
    private outLog: Log
    private warnLog: Log
    private errorLog: Log

    constructor(private originalConsole: Console) {
        this.outLog = new Set()
        this.warnLog = new Set()
        this.errorLog = new Set()
    }

    get outLogEntries(): LogEntry[] {
        return [...this.outLog]
    }

    get warnLogEntries(): LogEntry[] {
        return [...this.warnLog]
    }

    get errorLogEntries(): LogEntry[] {
        return [...this.errorLog]
    }

    log(...message: string[]) {
        this.outLog.add([new Date(), message.join(' ')])
    }

    warn(...message: string[]) {
        this.warnLog.add([new Date(), message.join(' ')])
    }

    error(...message: string[]) {
        this.errorLog.add([new Date(), message.join(' ')])
    }

    assert = this.originalConsole.assert
    info = this.originalConsole.info

    clear() {
        this.outLog.clear()
        this.warnLog.clear()
        this.errorLog.clear()
    }
}
