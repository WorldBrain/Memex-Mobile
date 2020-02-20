import Logic, { State } from './logic'

export const showMoreButton = (state: State): boolean =>
    state.highlightTextLines
        ? state.highlightTextLines > Logic.HIGHLIGHT_MAX_LINES
        : false
