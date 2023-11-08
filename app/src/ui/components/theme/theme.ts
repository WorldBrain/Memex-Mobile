import { MemexTheme } from '@worldbrain/memex-common/lib/common-ui/styles/types'
// import * as iconsMobile from 'src/ui/components/icons/icons-list'
import { THEME } from '@worldbrain/memex-common/lib/common-ui/styles/theme'

export const theme: MemexTheme = {
    ...THEME({
        icons: {} as any, // TODO: Figure out how these fit into the mobile build
        variant: 'dark',
    }),
}
