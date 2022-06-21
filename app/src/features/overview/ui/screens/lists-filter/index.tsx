import React from 'react'

import { StatefulUIElement } from 'src/ui/types'
import Logic, { Props, State, Event } from './logic'
import Navigation from '../../components/navigation'
import MetaPicker from 'src/features/meta-picker/ui/screens/meta-picker'
import { SpacePickerEntry } from 'src/features/meta-picker/types'
import { SPECIAL_LIST_NAMES } from '@worldbrain/memex-common/lib/storage/modules/lists/constants'
import * as icons from 'src/ui/components/icons/icons-list'
import styled from 'styled-components/native'

export default class ListsFilter extends StatefulUIElement<
    Props,
    State,
    Event
> {
    static MAGIC_VISITS_FILTER = 'All Saved'
    static MAGIC_BMS_FILTER = 'All Bookmarks'

    private selectedEntryName?: string

    constructor(props: Props) {
        super(props, new Logic(props))

        this.selectedEntryName = this.props.route.params.selectedList
    }

    private get magicFilters(): string[] {
        return [ListsFilter.MAGIC_VISITS_FILTER]
    }

    private handleEntryPress = async (item: SpacePickerEntry) => {
        this.props.navigation.navigate('Dashboard', {
            selectedList: item.isChecked
                ? SPECIAL_LIST_NAMES.MOBILE
                : item.name,
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
                        singleSelect
                        extraEntries={this.magicFilters}
                        onEntryPress={this.handleEntryPress}
                        suggestInputPlaceholder="Search Spaces"
                        initSelectedEntries={
                            this.selectedEntryName === SPECIAL_LIST_NAMES.MOBILE
                                ? []
                                : [this.selectedEntryName]
                        }
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
    width: 300px;
    justify-content: center;
    display: flex;
    max-width: 100%;
    height: 100%;
`
