import { State } from './logic'

export default (): State => ({
    sections: new Map([
        [
            'Monday, 22 April, 2019',
            new Map([
                [
                    'https://test.com',
                    {
                        url: 'https://test.com',
                        pageUrl: 'https://test.com',
                        titleText: 'This is a test site',
                        date: '5 mins ago',
                        notes: new Map([
                            [
                                'https://test.com/#234234',
                                {
                                    url: 'https://test.com/#234234',
                                    noteText:
                                        'some text from the page page page page page page',
                                    date: '22 Apr 19:41',
                                },
                            ],
                        ]),
                    },
                ],
                [
                    'https://test.com/route1',
                    {
                        url: 'https://test.com/route1',
                        pageUrl: 'https://test.com/route1',
                        titleText: 'This is a test site - route 1',
                        date: '15 mins ago',
                        isOpen: true,
                        notes: new Map([
                            [
                                'https://test.com/route1/#2342',
                                {
                                    url: 'https://test.com/route1/#2342',
                                    commentText: 'test comment',
                                    date: '22 Apr 19:41',
                                },
                            ],
                            [
                                'https://test.com/route1/#234',
                                {
                                    url: 'https://test.com/route1/#234',
                                    commentText: 'another test comment',
                                    noteText:
                                        'some text from the page page page page page page',
                                    date: '22 Apr 19:41',
                                },
                            ],
                            [
                                'https://test.com/route1/#231',
                                {
                                    url: 'https://test.com/route1/#231',
                                    noteText:
                                        'some text from the page page page page page page',
                                    date: '22 Apr 19:41',
                                },
                            ],
                        ]),
                    },
                ],
            ]),
        ],
        [
            'Sunday, 21 April, 2019',
            new Map([
                [
                    'https://test.com/route3',
                    {
                        url: 'https://test.com/route3',
                        pageUrl: 'https://test.com/route3',
                        titleText: 'This is a test site - route 3',
                        date: '5 mins ago',
                        notes: new Map([
                            [
                                'https://test.com/route3/#2342',
                                {
                                    url: 'https://test.com/route3/#2342',
                                    commentText: 'test comment',
                                    noteText:
                                        'some text from the page page page page page page',
                                    date: '22 Apr 19:41',
                                },
                            ],
                        ]),
                    },
                ],
            ]),
        ],
        [
            'Friday, 19 April, 2019',
            new Map([
                [
                    'https://test.com/route5',
                    {
                        url: 'https://test.com/route5',
                        pageUrl: 'https://test.com/route5',
                        titleText: 'This is a test site - route 5',
                        date: '5 mins ago',
                        isOpen: true,
                        notes: new Map([
                            [
                                'https://test.com/route5/#2221',
                                {
                                    url: 'https://test.com/route5/#2221',
                                    commentText: 'test comment',
                                    noteText:
                                        'some text from the page page page page page page',
                                    date: '22 Apr 19:41',
                                },
                            ],
                        ]),
                    },
                ],
                [
                    'https://test.com/route6',
                    {
                        url: 'https://test.com/route6',
                        pageUrl: 'https://test.com/route6',
                        titleText: 'This is a test site - route 6',
                        date: '5 mins ago',
                        isOpen: true,
                        notes: new Map([
                            [
                                'https://test.com/route6/#094',
                                {
                                    url: 'https://test.com/route6/#094',
                                    commentText: 'test comment',
                                    date: '22 Apr 19:41',
                                },
                            ],
                            [
                                'https://test.com/route6/#09',
                                {
                                    url: 'https://test.com/route6/#09',
                                    noteText:
                                        'some text from the page page page page page page',
                                    date: '22 Apr 19:41',
                                },
                            ],
                        ]),
                    },
                ],
            ]),
        ],
    ]),
})
