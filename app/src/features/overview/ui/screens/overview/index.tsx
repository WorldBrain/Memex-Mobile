import React from 'react';
import { View } from 'react-native'

import { StatefulUIElement } from 'src/ui/types'
import Logic, { State, Event } from './logic';
import Menu from 'src/features/overview/ui/components/menu'
import PagesView from '../pages-view'
import NotesView from '../notes-view'

interface Props {

}

export default class OverviewMenu extends StatefulUIElement<Props, State, Event> {
    constructor(props : Props) {
        super(props, { logic: new Logic() })
    }

    private setResultType = resultType =>
      this.processEvent('setResultType', { resultType })

    private renderResults() {
      switch (this.state.selectedResultType) {
        case 'notes':
            return <NotesView />
          case 'pages':
            default:
            return <PagesView />
      }
    }

    render() {
        return (
          <>
            <Menu
                selected={this.state.selectedResultType}
                setResultType={this.setResultType}
            />
            {this.renderResults()}
        </>
        )
      }
}
