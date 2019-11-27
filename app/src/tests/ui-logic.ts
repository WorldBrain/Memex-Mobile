import { UILogic, UIMutation } from 'ui-logic-core'

export class TestLogicContainer<State, Event> {
    state: State

    constructor(public logic: UILogic<State, Event>) {
        this.state = logic.getInitialState()
        logic.events.on('mutation', (mutation: UIMutation<State>) => {
            const newState = this.logic.withMutation(
                this.state,
                mutation as any,
            )
            this.state = newState
        })
    }

    async processEvent<EventName extends keyof Event>(
        eventName: EventName,
        event: Event[EventName],
    ) {
        await this.logic.processUIEvent(eventName, {
            previousState: this.state,
            event,
        })
    }
}
