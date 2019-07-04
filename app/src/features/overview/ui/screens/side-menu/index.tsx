import React from 'react'
import { View } from 'react-native'

import { StatefulUIElement } from 'src/ui/types'
import Logic, { State, Event } from './logic'
import SideMenu from '../../components/side-menu'
import SideMenuItem from '../../components/side-menu-item'

interface Props {
    hideMenu: () => void
}

export default class SideMenuScreen extends StatefulUIElement<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, { logic: new Logic() })
    }

    private navTo = (screen: string) => () =>
        this.props.navigation.navigate(screen)

    render() {
        return (
            <SideMenu onBackPress={this.props.hideMenu}>
                <SideMenuItem onPress={this.navTo('Sync')}>
                    Enable Sync to Computer
                </SideMenuItem>
                <SideMenuItem onPress={this.navTo('Sync')}>
                    Features & Roadmap
                </SideMenuItem>
                <SideMenuItem onPress={this.navTo('Sync')}>
                    FAQs & Help
                </SideMenuItem>
                <SideMenuItem onPress={this.navTo('Onboarding')}>
                    Tutorial
                </SideMenuItem>
                <SideMenuItem onPress={this.navTo('Sync')}>
                    Settings
                </SideMenuItem>
                <SideMenuItem onPress={this.navTo('Sync')}>Logout</SideMenuItem>
                <SideMenuItem onPress={this.navTo('Sync')}>
                    Privacy Policy
                </SideMenuItem>
            </SideMenu>
        )
    }
}
