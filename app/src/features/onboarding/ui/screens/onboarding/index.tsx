import React from 'react'

import { NavigationScreen } from 'src/ui/types'
import Logic, { State, Event } from './logic'
import SavePagesStage from '../../components/save-pages-stage'

interface Props {}

export default class ShareModalScreen extends NavigationScreen<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, { logic: new Logic() })
    }

    render() {
        return (
            <SavePagesStage
                onBtnPress={e => this.props.navigation.navigate('Overview')}
                btnText="Finish"
            />
        )
    }
}
