import React from 'react'
import { View } from 'react-native'

import { StatefulUIElement } from 'src/ui/types'
import Logic, { Props, State, Event } from './logic'
import MainLayout from '../../components/main-layout'
import NotesList from 'src/features/overview/ui/components/notes-list'
import MetaPicker from 'src/features/meta-picker/ui/screens/meta-picker'
import LoadingBalls from 'src/ui/components/loading-balls'
import styles from './styles'
import * as icons from 'src/ui/components/icons/icons-list'
import type { SpacePickerEntry } from 'src/features/meta-picker/types'

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

    private get spacePickerSelectedIds(): number[] {
        if (
            this.state.mode === 'annotation-spaces' &&
            this.state.annotationUrlToEdit != null
        ) {
            return (
                this.state.noteData[this.state.annotationUrlToEdit!]?.listIds ??
                []
            )
        }

        return this.state.page.listIds
    }

    private handleEntryPress = (entry: SpacePickerEntry) =>
        this.processEvent(entry.isChecked ? 'unselectEntry' : 'selectEntry', {
            entry,
        })

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
                initNoteAddSpaces={(note) => () =>
                    this.processEvent('setAnnotationToEdit', {
                        annotationUrl: note.url,
                    })}
                initNoteDelete={(n) => () =>
                    this.processEvent('confirmNoteDelete', { url: n.url })}
                initNoteEdit={(note) => () =>
                    this.props.navigation.navigate('NoteEditor', {
                        spaces: note.listIds.map((id) => ({
                            id,
                            name:
                                this.state.listData[id]?.name ??
                                'Missing Space',
                            remoteId: this.state.listData[id]?.remoteId,
                        })),
                        privacyLevel: note.privacyLevel,
                        highlightText: note.noteText,
                        noteText: note.commentText,
                        noteUrl: note.url,
                        mode: 'update',
                    })}
                initNotePress={(n) => () =>
                    this.processEvent('toggleNotePress', { url: n.url })}
                initNotePrivacyLevelSet={(n) => (level) =>
                    this.processEvent('setAnnotationPrivacyLevel', {
                        annotationUrl: n.url,
                        level,
                    })}
                notes={this.state.page.noteIds.map(
                    (noteId) => this.state.noteData[noteId],
                )}
                listData={this.state.listData}
                pageData={this.state.page}
                clearBackground
            />
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

        if (this.state.mode === 'notes') {
            return this.renderNotes()
        }

        return (
            <MetaPicker
                {...this.props}
                onEntryPress={this.handleEntryPress}
                initSelectedEntries={this.spacePickerSelectedIds}
            />
        )
    }

    private titleText() {
        if (this.state.loadState !== 'done') {
            return ' '
        }

        switch (this.state.mode) {
            case 'notes':
                return 'Annotations'
            case 'collections':
            default:
                return 'Add to Spaces'
        }
    }

    render() {
        return (
            <MainLayout
                {...this.state.page}
                onLeftPress={() => this.processEvent('goBack', null)}
                onRightPress={this.initHandleAddNotePress()}
                titleText={this.titleText().toString()}
                rightIcon={this.state.mode === 'notes' && icons.Plus}
                onBackPress={() => this.props.navigation.goBack()}
            >
                {this.renderEditor()}
            </MainLayout>
        )
    }
}
