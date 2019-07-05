import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import initTestData from './test-data'
import { ResultSections } from './types'

export interface State {
    sections: ResultSections
}

export type Event = UIEvent<{
    setSections: { sections: ResultSections }
    toggleNoteStar: { section: string; pageUrl: string; noteUrl: string }
    togglePageStar: { section: string; pageUrl: string }
    deleteNote: { section: string; pageUrl: string; noteUrl: string }
    deletePage: { section: string; pageUrl: string }
    toggleShowNotes: { section: string; pageUrl: string }
}>

export default class Logic extends UILogic<State, Event> {
    getInitialState(): State {
        return initTestData()
    }

    setSections(
        incoming: IncomingUIEvent<State, Event, 'setSections'>,
    ): UIMutation<State> {
        return { sections: { $set: incoming.event.sections } }
    }

    deleteNote({
        event,
    }: IncomingUIEvent<State, Event, 'deleteNote'>): UIMutation<State> {
        return {
            sections: state => {
                state
                    .get(event.section)
                    .get(event.pageUrl)
                    .notes.delete(event.noteUrl)
                return state
            },
        }
    }

    deletePage({
        event,
    }: IncomingUIEvent<State, Event, 'deletePage'>): UIMutation<State> {
        return {
            sections: state => {
                state.get(event.section).delete(event.pageUrl)
                if (state.get(event.section).size === 0) {
                    state.delete(event.section)
                }
                return state
            },
        }
    }

    toggleNoteStar({
        event,
    }: IncomingUIEvent<State, Event, 'toggleNoteStar'>): UIMutation<State> {
        return {
            sections: state => {
                const notes = state.get(event.section).get(event.pageUrl).notes

                const note = notes.get(event.noteUrl)
                notes.set(event.noteUrl, {
                    ...note,
                    isStarred: !note.isStarred,
                })
                return state
            },
        }
    }

    togglePageStar({
        event,
    }: IncomingUIEvent<State, Event, 'togglePageStar'>): UIMutation<State> {
        return {
            sections: state => {
                const page = state.get(event.section).get(event.pageUrl)
                state
                    .get(event.section)
                    .set(event.pageUrl, { ...page, isStarred: !page.isStarred })
                return state
            },
        }
    }

    toggleShowNotes({
        event,
    }: IncomingUIEvent<State, Event, 'toggleShowNotes'>): UIMutation<State> {
        return {
            sections: state => {
                const page = state.get(event.section).get(event.pageUrl)
                state
                    .get(event.section)
                    .set(event.pageUrl, { ...page, isOpen: !page.isOpen })
                return state
            },
        }
    }
}
