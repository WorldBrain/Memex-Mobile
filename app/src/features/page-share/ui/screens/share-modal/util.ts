import type { State } from './types'
import { areArrayContentsEqual } from 'src/utils/are-arrays-the-same'

export const initValues: Pick<State, 'isStarred' | 'spacesToAdd'> = {
    isStarred: false,
    spacesToAdd: [],
}

export function isInputDirty({
    noteText,
    isStarred,
    spacesToAdd,
}: State): boolean {
    return (
        noteText.trim().length > 0 ||
        isStarred !== initValues.isStarred ||
        !areArrayContentsEqual(spacesToAdd, initValues.spacesToAdd)
    )
}
