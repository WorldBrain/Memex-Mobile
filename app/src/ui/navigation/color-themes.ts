import { Theme, DefaultTheme, DarkTheme } from '@react-navigation/native'

export const lightTheme: Theme = {
    dark: false,
    colors: {
        ...DefaultTheme.colors,
        background: 'white',
    },
}

export const darkTheme: Theme = {
    dark: true,
    colors: {
        ...DarkTheme.colors,
        // TODO...
    },
}
