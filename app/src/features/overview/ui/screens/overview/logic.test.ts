import Logic from './logic'

describe('meta picker UI logic tests', () => {
    function setup() {
        const logic = new Logic()
        const state = logic.getInitialState()

        return { logic, state }
    }

    it('should be able to show collections view', () => {
        const { logic, state } = setup()

        const newStateA = logic.withMutation(
            state,
            logic.setShowCollectionsView({
                event: { show: true },
                previousState: state,
            }),
        )
        const newStateB = logic.withMutation(
            state,
            logic.setShowCollectionsView({
                event: { show: false },
                previousState: newStateA,
            }),
        )

        expect(newStateA.showCollectionsView).toBe(true)
        expect(newStateB.showCollectionsView).toBe(false)
    })

    it('should be able to show side menu', () => {
        const { logic, state } = setup()

        const newStateA = logic.withMutation(
            state,
            logic.setShowSideMenu({
                event: { show: true },
                previousState: state,
            }),
        )
        const newStateB = logic.withMutation(
            state,
            logic.setShowSideMenu({
                event: { show: false },
                previousState: newStateA,
            }),
        )

        expect(newStateA.showSideMenu).toBe(true)
        expect(newStateB.showSideMenu).toBe(false)
    })

    it('should be able to set shown results type', () => {
        const { logic, state } = setup()

        const newStateA = logic.withMutation(
            state,
            logic.setResultType({
                event: { resultType: 'notes' },
                previousState: state,
            }),
        )
        const newStateB = logic.withMutation(
            state,
            logic.setResultType({
                event: { resultType: 'pages' },
                previousState: newStateA,
            }),
        )

        expect(newStateA.selectedResultType).toEqual('notes')
        expect(newStateB.selectedResultType).toEqual('pages')
    })
})
