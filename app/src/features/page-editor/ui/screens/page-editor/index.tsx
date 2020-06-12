import React from 'react'

import { NavigationScreen } from 'src/ui/types'
import Logic, { Props, State, Event } from './logic'
import MainLayout from '../../components/main-layout'
import Footer from '../../components/footer'
import NotesList from 'src/features/overview/ui/components/notes-list'
import MetaPicker from 'src/features/meta-picker/ui/screens/meta-picker'
import { MetaType } from 'src/features/meta-picker/types'
import { MetaTypeShape } from '@worldbrain/memex-storage/lib/mobile-app/features/meta-picker/types'
import { NAV_PARAMS } from 'src/ui/navigation/constants'
import { NoteEditorNavigationParams } from 'src/features/overview/ui/screens/note-editor/types'
import { ReaderNavigationParams } from 'src/features/reader/ui/screens/reader/types'
import { DashboardNavigationParams } from 'src/features/overview/ui/screens/dashboard/types'

export default class PageEditorScreen extends NavigationScreen<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, { logic: new Logic(props) })
    }

    private handleEntryPress = (entry: MetaTypeShape) => {
        if (entry.isChecked) {
            return this.processEvent('removeEntry', { name: entry.name })
        } else {
            return this.processEvent('createEntry', { name: entry.name })
        }
    }

    private initHandleAddNotePress = () => {
        if (this.state.mode !== 'notes') {
            return undefined
        }

        return () =>
            this.props.navigation.navigate('NoteEditor', {
                [NAV_PARAMS.NOTE_EDITOR]: {
                    selectedList: (this.logic as Logic).selectedList,
                    pageUrl: this.state.page.fullUrl,
                    previousRoute: 'PageEditor',
                    __prevPreviousRoute: 'Reader',
                    mode: 'create',
                } as NoteEditorNavigationParams,
            })
    }

    private navBackToDashboard = () => {
        const { navigate } = this.props.navigation
        const logic = this.logic as Logic

        switch (logic.previousRoute) {
            case 'Reader':
                return navigate('Reader', {
                    [NAV_PARAMS.READER]: {
                        url: this.state.page.url,
                        title: this.state.page.titleText,
                    } as ReaderNavigationParams,
                })
            case 'Dashboard':
            default:
                return navigate('Overview', {
                    [NAV_PARAMS.DASHBOARD]: {
                        selectedList: (this.logic as Logic).selectedList,
                    } as DashboardNavigationParams,
                })
        }
    }

    private renderNotes() {
        return (
            <NotesList
                initNoteDelete={n => () =>
                    this.processEvent('confirmNoteDelete', { url: n.url })}
                initNoteEdit={note => () =>
                    this.props.navigation.navigate('NoteEditor', {
                        [NAV_PARAMS.NOTE_EDITOR]: {
                            selectedList: (this.logic as Logic).selectedList,
                            pageUrl: this.state.page.fullUrl,
                            highlightText: note.noteText,
                            noteText: note.commentText,
                            previousRoute: 'PageEditor',
                            __prevPreviousRoute: 'Reader',
                            noteUrl: note.url,
                            mode: 'update',
                        } as NoteEditorNavigationParams,
                    })}
                initNotePress={n => () =>
                    this.processEvent('toggleNotePress', { url: n.url })}
                notes={this.state.page.notes}
                clearBackground
            />
        )
    }

    private renderMetaPicker(type: MetaType) {
        const initEntries =
            type === 'tags' ? this.state.page.tags : this.state.page.lists

        return (
            <>
                <MetaPicker
                    {...this.props}
                    initSelectedEntries={initEntries}
                    type={type}
                    url={this.state.page.url}
                    onEntryPress={this.handleEntryPress}
                />
                <Footer>Every action is auto-saved</Footer>
            </>
        )
    }

    private renderEditor() {
        if (this.state.loadState !== 'done') {
            return null
        }

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
                onBackPress={this.navBackToDashboard}
                onAddPress={this.initHandleAddNotePress()}
                titleText={this.state.page.pageUrl}
            >
                {this.renderEditor()}
            </MainLayout>
        )
    }
}
