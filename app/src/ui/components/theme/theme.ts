import {
    MemexTheme,
    IconKeysMobile,
    CoreMemexTheme,
} from '@worldbrain/memex-common/lib/common-ui/styles/types'
import * as iconsMobile from 'src/ui/components/icons/icons-list'
import {
    CORE_THEME,
    THEME,
} from '@worldbrain/memex-common/lib/common-ui/styles/theme'

export const theme: CoreMemexTheme & {
    iconsMobile: { [Key in IconKeysMobile]: React.FC }
} = {
    ...CORE_THEME(),
    iconsMobile: {
        Mail: iconsMobile.Mail,
        Login: iconsMobile.Login,
        LogOut: iconsMobile.LogOut,
        Lock: iconsMobile.Lock,
        CheckMark: iconsMobile.CheckMark,
        Alert: iconsMobile.Alert,
        Burger: iconsMobile.Burger,
        BackArrow: iconsMobile.BackArrow,
        ForwardArrow: iconsMobile.ForwardArrow,
        Settings: iconsMobile.Settings,
        TagEmpty: iconsMobile.TagEmpty,
        TagFull: iconsMobile.TagFull,
        Plus: iconsMobile.Plus,
        Comment: iconsMobile.Comment,
        Dots: iconsMobile.Dots,
        Trash: iconsMobile.Trash,
        Globe: iconsMobile.Globe,
        Edit: iconsMobile.Edit,
        Search: iconsMobile.Search,
        CheckedRound: iconsMobile.CheckedRound,
        Clock: iconsMobile.Clock,
        SadFace: iconsMobile.SadFace,
        HelpIcon: iconsMobile.HelpIcon,
        HeartIcon: iconsMobile.HeartIcon,
        Reload: iconsMobile.Reload,
        Highlighter: iconsMobile.Highlighter,
        AddNote: iconsMobile.AddNote,
    },
}
