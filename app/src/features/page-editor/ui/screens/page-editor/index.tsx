import React from 'react'
import { View } from 'react-native'

import { StatefulUIElement } from 'src/ui/types'
import Logic, { Props, State, Event } from './logic'
import MainLayout from '../../components/main-layout'
import Footer from '../../components/footer'
import NotesList from 'src/features/overview/ui/components/notes-list'
import MetaPicker from 'src/features/meta-picker/ui/screens/meta-picker'
import { MetaType } from 'src/features/meta-picker/types'
import { MetaTypeShape } from '@worldbrain/memex-storage/lib/mobile-app/features/meta-picker/types'
import LoadingBalls from 'src/ui/components/loading-balls'
import styles from './styles'

export default class PageEditorScreen extends StatefulUIElement<
    Props,
    State,
    Event
> {
    private unsubNavFocus!: () => void

    constructor(props: Props) {
        super(props, new Logic(props))
    }

    componentDidMount() {
        super.componentDidMount()
        this.unsubNavFocus = this.props.navigation.addListener('focus', () =>
            this.processEvent('focusFromNavigation', this.props.route.params),
        )
    }

    componentWillUnmount() {
        super.componentWillUnmount()
        this.unsubNavFocus()
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
                pageUrl: this.state.page.fullUrl,
                mode: 'create',
            })
    }

    private renderNotes() {
        return (
            <NotesList
                initNoteDelete={n => () =>
                    this.processEvent('confirmNoteDelete', { url: n.url })}
                initNoteEdit={note => () =>
                    this.props.navigation.navigate('NoteEditor', {
                        pageUrl: this.state.page.fullUrl,
                        highlightText: note.noteText,
                        noteText: note.commentText,
                        noteUrl: note.url,
                        mode: 'update',
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
            return (
                <View style={styles.loadingContainer}>
                    <LoadingBalls />
                </View>
            )
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
                onBackPress={() => this.processEvent('goBack', null)}
                onAddPress={this.initHandleAddNotePress()}
                titleText={this.state.page.pageUrl}
            >
                {this.renderEditor()}
            </MainLayout>
        )
    }
}
