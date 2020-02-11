import { UILogic, UIMutation, UIEvent } from 'ui-logic-core'

export class FakeStatefulUIElement<
    State = {},
    Event extends UIEvent<{}> = UIEvent<{}>
> {
    public state: State

    constructor(public logic: UILogic<State, Event>) {
        this.state = logic.getInitialState()
        this.logic.events.addListener('mutation', mutation =>
            this.processMutation(mutation),
        )
    }

    async init() {
        await this.processEvent('init', undefined, { optional: true })
    }

    async cleanup() {
        this.processEvent('cleanup', undefined, { optional: true })
        this.logic.events.removeAllListeners()
    }

    async processEvent<EventName extends keyof Event>(
        eventName: EventName,
        event: Event[EventName],
        options?: { optional: boolean },
    ) {
        const mutation = await this.logic.processUIEvent(eventName, {
            previousState: this.state,
            event,
            direct: true,
            optional: options && options.optional,
        })
        if (mutation) {
            this.processMutation(mutation)
        }
    }

    processMutation(mutation: UIMutation<State>) {
        if (this.logic) {
            const newState = this.logic.withMutation(
                this.state,
                mutation as any,
            )
            this.state = newState
        }
    }
}
