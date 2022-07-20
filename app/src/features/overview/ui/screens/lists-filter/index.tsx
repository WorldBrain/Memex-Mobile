import React from 'react'

import { StatefulUIElement } from 'src/ui/types'
import Logic, { Props, State, Event } from './logic'
import Navigation from '../../components/navigation'
import MetaPicker from 'src/features/meta-picker/ui/screens/meta-picker'
import { SpacePickerEntry } from 'src/features/meta-picker/types'
import * as icons from 'src/ui/components/icons/icons-list'
import styled from 'styled-components/native'
import {
    ALL_SAVED_FILTER_ID,
    ALL_SAVED_FILTER_NAME,
} from '../dashboard/constants'

export default class ListsFilter extends StatefulUIElement<
    Props,
    State,
    Event
> {
    private selectedEntryId: number

    constructor(props: Props) {
        super(props, new Logic(props))

        this.selectedEntryId = this.props.route.params.selectedListId
    }

    private handleEntryPress = async (item: SpacePickerEntry) => {
        this.props.navigation.navigate('Dashboard', {
            selectedListId: item.isChecked ? ALL_SAVED_FILTER_ID : item.id,
        })
    }

    render() {
        return (
            <Container>
                <Navigation
                    titleText="Select a Space"
                    leftIcon={icons.BackArrow}
                    leftBtnPress={this.props.navigation.goBack}
                    leftIconSize={'30px'}
                    leftIconStrokeWidth={'5px'}
                />
                <MetaPickerContainer>
                    <MetaPicker
                        {...this.props}
                        filterMode
                        extraEntries={[
                            {
                                name: ALL_SAVED_FILTER_NAME,
                                id: ALL_SAVED_FILTER_ID,
                                isChecked: false,
                            },
                        ]}
                        onEntryPress={this.handleEntryPress}
                        suggestInputPlaceholder="Search Spaces"
                        initSelectedEntries={[this.selectedEntryId]}
                    />
                </MetaPickerContainer>
            </Container>
        )
    }
}

const Container = styled.SafeAreaView`
    position: absolute;
    width: 100%;
    flex: 1;
    max-height: 100%;
    height: 100%;
    display: flex;
    align-items: center;
`

const MetaPickerContainer = styled.View`
    width: 100%;
    justify-content: center;
    display: flex;
    max-width: 400px;
    height: 100%;
`
