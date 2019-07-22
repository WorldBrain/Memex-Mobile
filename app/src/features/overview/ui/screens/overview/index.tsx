import React from 'react'

import { NavigationScreen } from 'src/ui/types'
import Logic, { State, Event } from './logic'
import Filters from 'src/features/overview/ui/components/menu'
import PagesView from '../pages-view'
import NotesView from '../notes-view'
import CollectionsView from '../collections-view'
import SideMenuScreen from '../side-menu'

interface Props {}

export default class OverviewMenu extends NavigationScreen<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, { logic: new Logic() })
    }

    private setResultType = resultType =>
        this.processEvent('setResultType', { resultType })

    private toggleCollectionsView = () =>
        this.processEvent('setShowCollectionsView', {
            show: !this.state.showCollectionsView,
        })

    private renderResults() {
        if (this.state.showCollectionsView) {
            return <CollectionsView {...this.props} />
        }

        switch (this.state.selectedResultType) {
            case 'notes':
                return <NotesView {...this.props} />
            case 'pages':
            default:
                return <PagesView {...this.props} />
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
                <Filters
                    selected={this.state.selectedResultType}
                    setResultType={this.setResultType}
                    showCollectionsView={this.state.showCollectionsView}
                    toggleCollectionsView={this.toggleCollectionsView}
                    toggleMenuView={() =>
                        this.processEvent('setShowSideMenu', { show: true })
                    }
                />
                {this.renderResults()}
                {this.renderSideMenu()}
            </>
        )
    }
}
