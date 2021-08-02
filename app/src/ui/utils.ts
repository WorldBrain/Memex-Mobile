import { UILogic } from 'ui-logic-core'
import { UITaskState } from './types'

export async function loadInitial<State extends { loadState: UITaskState }>(
    logic: UILogic<State, any>,
    loader: () => Promise<any>,
): Promise<boolean> {
    return (await executeUITask(logic, 'loadState', loader))[0]
}

export async function executeUITask<
    State,
    Key extends keyof State,
    ReturnValue = void
>(
    logic: UILogic<State, any>,
    key: Key,
    loader: () => Promise<ReturnValue>,
): Promise<[false] | [true, ReturnValue]> {
    logic.emitMutation({ [key]: { $set: 'running' } } as any)

    try {
        const returned = await loader()
        logic.emitMutation({ [key]: { $set: 'done' } } as any)
        return [true, returned]
    } catch (e) {
        logic.emitMutation({ [key]: { $set: 'error' } } as any)
        console.error(e)
        return [false]
    }
}
