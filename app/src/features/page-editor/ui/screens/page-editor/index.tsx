import React from 'react'

import { StatefulUIElement } from 'src/ui/types'
import Logic, { State, Event } from './logic'
import MainLayout from '../../components/main-layout'
import Footer from '../../components/footer'
import NoteAdder from '../../components/note-adder'
import ExistingNotes from '../../components/existing-notes'
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

    private handleNewNoteAdd = () => {
        this.processEvent('saveNote', { text: this.state.noteAdderInput })
        this.handleHideNoteAdder()
    }

    private handleHideNoteAdder = () => {
        this.processEvent('setShowNoteAdder', { show: false })
        this.processEvent('setInputText', { text: '' })
    }

    private renderNoteAdder() {
        if (!this.state.showNoteAdder) {
            return null
        }

        return (
            <NoteAdder
                onChange={text => this.processEvent('setInputText', { text })}
                value={this.state.noteAdderInput}
                onCancelPress={this.handleHideNoteAdder}
                onSavePress={this.handleNewNoteAdd}
            />
        )
    }

    private renderNotes() {
        return (
            <ExistingNotes
                noteAdder={this.renderNoteAdder()}
                initNoteDelete={n => () => console.log(n)}
                initNoteEdit={n => () => console.log(n)}
                initNoteStar={n => () => console.log(n)}
                onAddNotePress={() =>
                    this.processEvent('setShowNoteAdder', { show: true })
                }
                notes={this.state.page.notes}
            />
        )
    }

    private renderMetaPicker(type: MetaType) {
        return (
            <>
                <MetaPicker type={type} {...this.props} />
                <Footer>Every action is auto-saved</Footer>
            </>
        )
    }

    renderEditor() {
        switch (this.state.mode) {
            case 'notes':
                return this.renderNotes()
            case 'tags':
            case 'collections':
            default:
                return this.renderMetaPicker(this.state.mode)
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
