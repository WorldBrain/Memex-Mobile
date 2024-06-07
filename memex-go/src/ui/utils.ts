import { UILogic } from 'ui-logic-core'
import { UITaskState } from './types'
import {
    Lock as LockIcon,
    Globe as GlobeIcon,
    Person as PersonIcon,
    People as PeopleIcon,
    SharedProtected as SharedProtectedIcon,
} from 'src/ui/components/icons/icons-list'
import { AnnotationPrivacyLevels } from '@worldbrain/memex-common/lib/annotations/types'

export const privacyLevelToIcon = (
    lvl: AnnotationPrivacyLevels,
    hasSharedLists: boolean,
) =>
    lvl === AnnotationPrivacyLevels.SHARED
        ? GlobeIcon
        : lvl === AnnotationPrivacyLevels.PRIVATE
        ? PersonIcon
        : lvl === AnnotationPrivacyLevels.PROTECTED && hasSharedLists
        ? PeopleIcon
        : lvl === AnnotationPrivacyLevels.PROTECTED && !hasSharedLists
        ? LockIcon
        : LockIcon

export const privacyLevelToText = (
    lvl: AnnotationPrivacyLevels,
    hasSharedLists: boolean,
) =>
    lvl === AnnotationPrivacyLevels.SHARED
        ? 'Public'
        : lvl === AnnotationPrivacyLevels.PRIVATE
        ? 'Private'
        : lvl === AnnotationPrivacyLevels.PROTECTED && hasSharedLists
        ? 'Shared'
        : lvl === AnnotationPrivacyLevels.PROTECTED && !hasSharedLists
        ? 'Locked'
        : 'Private'

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
