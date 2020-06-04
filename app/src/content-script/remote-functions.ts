import { EventEmitter } from 'events'

import { RemoteFnName } from 'src/features/reader/utils/remote-functions'

export type RemoteFn = (arg?: any) => Promise<void>

export type RemoteFnMap = {
    [fnName in RemoteFnName]: RemoteFn
}

export function setupRemoteFunctions(remoteFns: RemoteFnMap): EventEmitter {
    const remoteFnEvents = new EventEmitter()

    for (const [fnName, fn] of Object.entries(remoteFns)) {
        remoteFnEvents.on(fnName, fn)
    }

    return remoteFnEvents
}
