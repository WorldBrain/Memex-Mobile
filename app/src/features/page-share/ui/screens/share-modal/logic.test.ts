import Logic from './logic'
import { MetaType } from 'src/features/meta-picker/types'

describe('share modal UI logic tests', () => {
    function setup() {
        const logic = new Logic()
        const state = logic.getInitialState()

        return { logic, state }
    }

    it('should be able to set page url', () => {
        const { logic, state } = setup()
        const testUrl = 'http://www.google.com'

        expect(state.pageUrl).not.toEqual(testUrl)
        const newState = logic.withMutation(
            state,
            logic.setPageUrl({
                event: { url: testUrl },
                previousState: state,
            }),
        )

        expect(newState.pageUrl).toEqual(testUrl)
    })

    it('should be able to set note text', () => {
        const { logic, state } = setup()
        const testText = 'test'

        expect(state.noteText).not.toEqual(testText)
        const newState = logic.withMutation(
            state,
            logic.setNoteText({
                event: { value: testText },
                previousState: state,
            }),
        )

        expect(newState.noteText).toEqual(testText)
    })

    it('should be able to show modal', () => {
        const { logic, state } = setup()

        const newStateA = logic.withMutation(
            state,
            logic.setModalVisible({
                event: { shown: true },
                previousState: state,
            }),
        )
        expect(newStateA.isModalShown).toBe(true)

        const newStateB = logic.withMutation(
            state,
            logic.setModalVisible({
                event: { shown: false },
                previousState: newStateA,
            }),
        )
        expect(newStateB.isModalShown).toBe(false)
    })

    it('should be able to set meta view type', () => {
        const { logic, state } = setup()
        const types: MetaType[] = ['tags', 'collections']
        let previousState = state

        for (const t of types) {
            const newState = logic.withMutation(
                state,
                logic.setMetaViewType({
                    event: { type: t },
                    previousState,
                }),
            )

            expect(previousState.metaViewShown).not.toBe(t)
            expect(newState.metaViewShown).toBe(t)
            previousState = newState
        }
    })

    it('should be able to star pages', () => {
        const { logic, state } = setup()

        expect(state.isStarred).toBe(false)
        const newState = logic.withMutation(
            state,
            logic.setPageStar({
                event: { value: true },
                previousState: state,
            }),
        )

        expect(newState.isStarred).toBe(true)
    })

    it('should be able to toggle tags to add/remove', () => {
        const { logic, state } = setup()
        const testTag = 'test tag'

        expect(state.tagsToAdd.length).toBe(0)
        const nextStateA = logic.withMutation(
            state,
            logic.toggleTag({ event: { name: testTag }, previousState: state }),
        )

        expect(nextStateA.tagsToAdd.length).toBe(1)
        expect(nextStateA.tagsToAdd[0]).toEqual(testTag)

        const nextStateB = logic.withMutation(
            nextStateA,
            logic.toggleTag({
                event: { name: testTag },
                previousState: nextStateA,
            }),
        )
        expect(nextStateB.tagsToAdd.length).toBe(0)
    })

    it('should be able to toggle collections to add/remove', () => {
        const { logic, state } = setup()
        const testCollection = 'test coll'

        expect(state.collectionsToAdd.length).toBe(0)
        const nextStateA = logic.withMutation(
            state,
            logic.toggleCollection({
                event: { name: testCollection },
                previousState: state,
            }),
        )

        expect(nextStateA.collectionsToAdd.length).toBe(1)
        expect(nextStateA.collectionsToAdd[0]).toEqual(testCollection)

        const nextStateB = logic.withMutation(
            nextStateA,
            logic.toggleCollection({
                event: { name: testCollection },
                previousState: nextStateA,
            }),
        )
        expect(nextStateB.collectionsToAdd.length).toBe(0)
    })
})
