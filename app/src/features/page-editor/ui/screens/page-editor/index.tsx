import React from 'react'

import { StatefulUIElement } from 'src/ui/types'
import Logic, { State, Event } from './logic'
import MainLayout from '../../components/main-layout'
import Footer from '../../components/footer'
import MetaPicker from 'src/features/meta-picker/ui/screens/meta-picker'
import { MetaType } from 'src/features/meta-picker/types'

interface Props {}

export default class SideMenuScreen extends StatefulUIElement<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, { logic: new Logic() })
    }

    componentDidMount() {
        super.componentDidMount()

        const mode = this.props.navigation.getParam('mode', 'tags')
        this.processEvent('setEditorMode', { mode })

        const page = this.props.navigation.getParam('page')
        if (page != null) {
            this.processEvent('setPage', { page })
        }
    }

    renderMetaPicker(type: MetaType) {
        return (
            <>
                <MetaPicker type={type} {...this.props} />
                <Footer>Every action is auto-saved</Footer>
            </>
        )
    }

    renderEditor() {
        switch (this.state.mode) {
            case 'tags':
            case 'collections':
                return this.renderMetaPicker(this.state.mode)
            case 'notes':
            default:
        }
    }

    render() {
        return (
            <MainLayout
                {...this.state.page}
                onBackPress={e => this.props.navigation.goBack()}
            >
                {this.renderEditor()}
            </MainLayout>
        )
    }
}
