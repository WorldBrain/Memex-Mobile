import React from 'react'
import { Text, View } from 'react-native'
import { ShareExt } from 'src/services/share-ext'

import { StatefulUIElement } from 'src/ui/types'
import Logic, { State, Event } from './logic'

interface Props {}

export default class ShareOutput extends StatefulUIElement<
    Props,
    State,
    Event
> {
    private shareMenu: ShareExt

    constructor(props: Props) {
        super(props, { logic: new Logic() })
        this.shareMenu = new ShareExt({})
    }

    async componentDidMount() {
        const text = await this.shareMenu.getShareText()
        this.processEvent('setSharedText', { text })
    }

    render() {
        if (!this.state.sharedText) {
            return (
                <View>
                    <Text>Nothing has been shared...</Text>
                </View>
            )
        }

        return (
            <View>
                <Text>Received shared text:</Text>
                <Text>{this.state.sharedText}</Text>
            </View>
        )
    }
}
