import React from 'react'
import { FlatList, ListRenderItem, View, Text, Linking } from 'react-native'

import styles from './result-page-with-notes.styles'
import ResultNote from './result-note'
import { NativeTouchEventHandler } from '../../types'
import { UINote } from 'src/features/overview/types'

export interface Props {
    notes: UINote[]
    clearBackground?: boolean
    initNoteDelete: (note: UINote) => NativeTouchEventHandler
    initNotePress: (note: UINote) => NativeTouchEventHandler
    initNoteEdit: (note: UINote) => NativeTouchEventHandler
}

class NotesList extends React.PureComponent<Props> {
    private renderNote: ListRenderItem<UINote> = ({ item, index }) => (
        <ResultNote
            key={index}
            hideFooter
            onEditPress={this.props.initNoteEdit(item)}
            onNotePress={this.props.initNotePress(item)}
            onDeletePress={this.props.initNoteDelete(item)}
            clearBackground={this.props.clearBackground}
            {...item}
            isNotePressed={!!item.isNotePressed}
        />
    )

    render() {
        return (
            <View>
                {this.props.notes.length === 0 ? (
                    <View style={styles.noResultsContainer}>
                        <Text style={styles.noResultsTitle}>
                            No Annotations Yet
                        </Text>
                        <Text style={styles.noResultsSubTitle}>
                            Add new notes by visiting the page or {'\n'}via the{' '}
                            <Text
                                style={styles.link}
                                onPress={() =>
                                    Linking.openURL(
                                        'https://worldbrain.io/roadmap',
                                    )
                                }
                            >
                                Memex Browser Extension
                            </Text>
                            .{'\n'}
                            {'\n'}
                            <Text>
                                For upcoming upgrades visit{' '}
                                <Text
                                    style={styles.link}
                                    onPress={() =>
                                        Linking.openURL(
                                            'https://worldbrain.io/roadmap',
                                        )
                                    }
                                >
                                    our Roadmap
                                </Text>
                                .
                            </Text>
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        renderItem={this.renderNote}
                        data={this.props.notes}
                        keyExtractor={(item, index) => index.toString()}
                        style={styles.list}
                    />
                )}
            </View>
        )
    }
}

export default NotesList
