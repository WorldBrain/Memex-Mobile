import React from 'react'

import { NavigationScreen, NavigationProps } from 'src/ui/types'
import Logic, { State, Event } from './logic'
import Filters from 'src/features/overview/ui/components/menu'
import PagesView from '../pages-view'
import NotesView from '../notes-view'
import SpecialView from '../special-view'
import CollectionsView from '../collections-view'
import SideMenuScreen from '../side-menu'
import { ResultType } from 'src/features/overview/types'
import { View, Text } from 'react-native'
import includes from 'lodash/includes'

interface Props extends NavigationProps {}

export default class OverviewMenu extends NavigationScreen<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, { logic: new Logic() })
    }

    private setResultType = (resultType: ResultType) =>
        this.processEvent('setResultType', { resultType })

    private toggleCollectionsView = () =>
        this.processEvent('setShowCollectionsView', {
            show: !this.state.showCollectionsView,
        })

    private renderNavigation() {
        const filterAcceptedTypes = ['pages', 'notes']
        const { selectedResultType } = this.state
        if (
            this.state.selectedResultType &&
            includes(filterAcceptedTypes, selectedResultType)
        ) {
            return (
                <Filters
                    selected={this.state.selectedResultType}
                    setResultType={this.setResultType}
                    showCollectionsView={this.state.showCollectionsView}
                    toggleCollectionsView={this.toggleCollectionsView}
                    toggleMenuView={() =>
                        this.processEvent('setShowSideMenu', { show: true })
                    }
                />
            )
        }
        // TODO: Move to a separate component
        return (
            <View
                style={{
                    flex: 1,
                    maxHeight: 150,
                    backgroundColor: '#fff',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    margin: 0,
                }}
            >
                <Text>Recently Saved</Text>
            </View>
        )
    }

    private renderResults() {
        console.log(this.state)
        if (this.state.showCollectionsView) {
            return (
                <CollectionsView
                    {...this.props}
                    hideCollectionsView={() =>
                        this.processEvent('setShowCollectionsView', {
                            show: false,
                        })
                    }
                />
            )
        }
        switch (this.state.selectedResultType) {
            case 'notes':
                return <NotesView {...this.props} />
            case 'pages':
                return <PagesView {...this.props} />
            default:
                return <SpecialView {...this.props} />
        }
    }

    private renderSideMenu() {
        if (!this.state.showSideMenu) {
            return null
        }

        return (
            <SideMenuScreen
                {...this.props}
                hideMenu={() =>
                    this.processEvent('setShowSideMenu', {
                        show: false,
                    })
                }
            />
        )
    }

    render() {
        return (
            <>
                {this.renderNavigation()}
                {this.renderResults()}
                {this.renderSideMenu()}
            </>
        )
    }
}
