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
                const section = state.get(event.section)!
                const page = section.get(event.pageUrl)!

                page.notes.delete(event.noteUrl)

                return state
            },
        }
    }

    deletePage({
        event,
    }: IncomingUIEvent<State, Event, 'deletePage'>): UIMutation<State> {
        return {
            sections: state => {
                const section = state.get(event.section)!

                section.delete(event.pageUrl)

                if (section.size === 0) {
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
                const section = state.get(event.section)!
                const page = section.get(event.pageUrl)!
                const note = page.notes.get(event.noteUrl)!

                page.notes.set(event.noteUrl, {
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
                const section = state.get(event.section)!
                const page = section.get(event.pageUrl)!

                section.set(event.pageUrl, {
                    ...page,
                    isStarred: !page.isStarred,
                })

                return state
            },
        }
    }

    toggleShowNotes({
        event,
    }: IncomingUIEvent<State, Event, 'toggleShowNotes'>): UIMutation<State> {
        return {
            sections: state => {
                const section = state.get(event.section)!
                const page = section.get(event.pageUrl)!

                section.set(event.pageUrl, { ...page, isOpen: !page.isOpen })

                return state
            },
        }
    }
}
