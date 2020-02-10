import React from 'react'

import { NavigationScreen } from 'src/ui/types'
import Logic, { Props, State, Event } from './logic'
import Filters from '../../components/menu'
import Navigation from '../../components/navigation'
import PagesView from '../pages-view'
import NotesView from '../notes-view'
import SpecialView from '../special-view'
import CollectionsView from '../collections-view'
import { ResultType } from 'src/features/overview/types'

export default class OverviewMenu extends NavigationScreen<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, { logic: new Logic(props) })
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
            filterAcceptedTypes.includes(selectedResultType)
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
        return (
            <Navigation
                onSettingsPress={() =>
                    this.props.navigation.navigate('SettingsMenu')
                }
                icon="settings"
            >
                Recently Saved
            </Navigation>
        )
    }

    private renderResults() {
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

    render() {
        return (
            <>
                {this.renderNavigation()}
                {this.renderResults()}
            </>
        )
    }
}
