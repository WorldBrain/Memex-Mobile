import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'

import Navigation from '../../components/navigation'
import Logic, { State, Props, Event } from './logic'
import { NavigationScreen } from 'src/ui/types'
import NoteInput from 'src/features/page-share/ui/components/note-input-segment'
import styles from './styles'

export default class NoteEditorScreen extends NavigationScreen<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, { logic: new Logic(props) })
    }

    private handleBackBtnPress = () =>
        this.props.navigation.navigate('Overview')

    private renderHighlightText() {
        if (this.state.highlightText === null) {
            return
        }

        return (
            <View style={styles.highlightTextContainer}>
                <Text style={styles.highlightText}>
                    {this.state.highlightText}
                </Text>
            </View>
        )
    }

    private handleInputChange = (value: string) =>
        this.processEvent('changeNoteText', { value })

    render() {
        return (
            <>
                <Navigation
                    renderLeftIcon={() => (
                        <TouchableOpacity onPress={this.handleBackBtnPress}>
                            <Image
                                style={styles.backIcon}
                                source={require('src/ui/img/arrow-back.png')}
                            />
                        </TouchableOpacity>
                    )}
                    renderRightIcon={() => (
                        <TouchableOpacity onPress={this.handleBackBtnPress}>
                            <Image
                                style={styles.backIcon}
                                source={require('src/ui/img/tick.png')}
                            />
                        </TouchableOpacity>
                    )}
                >
                    Edit Note
                </Navigation>
                <View style={styles.container}>
                    {this.renderHighlightText()}
                    <NoteInput
                        onChange={this.handleInputChange}
                        value={this.state.noteText}
                        className={styles.noteInput}
                        containerClassName={styles.noteInputContainer}
                    />
                </View>
            </>
        )
    }
}
