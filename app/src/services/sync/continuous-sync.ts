import { EventEmitter } from 'events'

export default class ContinousSync {
    events = new EventEmitter()

    async forceSync() {}
}
