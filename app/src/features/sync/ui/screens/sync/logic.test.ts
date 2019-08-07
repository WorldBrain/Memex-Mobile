import Logic from './logic'
import { SyncStatus } from 'src/features/sync/types'

describe('sync UI logic tests', () => {
    function setup() {
        const logic = new Logic()
        const state = logic.getInitialState()

        return { logic, state }
    }

    it('should be able to switch sync status', () => {
        const { logic, state } = setup()
        const statuses: SyncStatus[] = [
            'failure',
            'setup',
            'success',
            'syncing',
        ]

        for (const status of statuses) {
            const newState = logic.withMutation(
                state,
                logic.setSyncStatus({
                    event: { value: status },
                    previousState: state,
                }),
            )
            expect(newState.status).toEqual(status)
        }
    })
})
