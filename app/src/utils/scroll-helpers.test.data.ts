export interface VerticalScrollState {
    offset: number
    contentSize: number
    layoutSize: number
}

export interface TestExpectations {
    isAtBottom: boolean
    isAtTop: boolean
}

export const VERTICAL_DATA: (VerticalScrollState & TestExpectations)[] = [
    {
        offset: 400,
        layoutSize: 300,
        contentSize: 700,
        isAtBottom: true,
        isAtTop: false,
    },
    {
        offset: -400,
        contentSize: 700,
        layoutSize: 300,
        isAtBottom: false,
        isAtTop: true,
    },
    {
        offset: 0,
        contentSize: 700,
        layoutSize: 300,
        isAtBottom: false,
        isAtTop: true,
    },
    {
        offset: 10,
        contentSize: 700,
        layoutSize: 300,
        isAtBottom: false,
        isAtTop: false,
    },
    {
        offset: 300,
        contentSize: 700,
        layoutSize: 900,
        isAtBottom: true,
        isAtTop: false,
    },
    {
        offset: 900,
        contentSize: 700,
        layoutSize: 900,
        isAtBottom: true,
        isAtTop: false,
    },
    {
        offset: 400,
        contentSize: 700,
        layoutSize: 1300,
        isAtBottom: true,
        isAtTop: false,
    },
]
