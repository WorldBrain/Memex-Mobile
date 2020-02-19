// tslint:disable:no-console
import React from 'react'

import { NavigationScreen } from 'src/ui/types'
import Logic, { Props, State, Event } from './logic'
import MainLayout from '../../components/main-layout'
import Footer from '../../components/footer'
import NoteAdder from '../../components/note-adder'
import ExistingNotes from '../../components/existing-notes'
import MetaPicker from 'src/features/meta-picker/ui/screens/meta-picker'
import { MetaType } from 'src/features/meta-picker/types'
import { MetaTypeShape } from '@worldbrain/memex-storage/lib/mobile-app/features/meta-picker/types'

export default class PageEditorScreen extends NavigationScreen<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, { logic: new Logic(props) })
    }

    private handleNewNoteAdd = () => {
        this.processEvent('saveNote', { text: this.state.noteAdderInput })
        this.handleHideNoteAdder()
    }

    private handleHideNoteAdder = () => {
        this.processEvent('setShowNoteAdder', { show: false })
        this.processEvent('setInputText', { text: '' })
    }

    private handleEntryPress = (entry: MetaTypeShape) => {
        if (entry.isChecked) {
            return this.processEvent('removeEntry', { name: entry.name })
        } else {
            return this.processEvent('createEntry', { name: entry.name })
        }
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
                initNoteEdit={note => () =>
                    this.props.navigation.navigate('NoteEditor', {
                        highlightText: note.noteText,
                        noteText: note.commentText,
                    })}
                initNoteStar={n => () => console.log(n)}
                initNotePress={n => () =>
                    this.processEvent('toggleNotePress', { url: n.url })}
                onAddNotePress={() =>
                    this.processEvent('setShowNoteAdder', { show: true })
                }
                notes={this.state.page.notes}
            />
        )
    }

    private renderMetaPicker(type: MetaType) {
        const initEntries =
            type === 'tags' ? this.state.page.tags : this.state.page.lists

        if (this.state.loadState !== 'done') {
            return null
        }

        return (
            <>
                <MetaPicker
                    {...this.props}
                    initEntries={initEntries}
                    type={type}
                    url={this.state.page.url}
                    onEntryPress={this.handleEntryPress}
                />
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
                onBackPress={e => this.props.navigation.navigate('Overview')}
            >
                {this.renderEditor()}
            </MainLayout>
        )
    }
}
