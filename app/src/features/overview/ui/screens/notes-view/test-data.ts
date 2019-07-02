import { State } from "./logic";

export default (): State => ({
  sections: [
    {
      title: "Monday, 22 April, 2019",
      data: [
        {
          url: "https://test.com",
          pageUrl: "https://test.com",
          titleText: "This is a test site",
          date: "5 mins ago",
          isOpen: true,
          notes: [
            {
                url: '',
                noteText: 'some text from the page page page page page page',
                date: '22 Apr 19:41',
            },
        ],
        },
        {
          url: "https://test.com/route1",
          pageUrl: "https://test.com/route1",
          titleText: "This is a test site - route 1",
          date: "15 mins ago",
          isOpen: true,
          notes: [
            {
                url: '',
                commentText: 'test comment',
                date: '22 Apr 19:41',
            },
            {
                url: '',
                commentText: 'another test comment',
                noteText: 'some text from the page page page page page page',
                date: '22 Apr 19:41',
            },
            {
                url: '',
                noteText: 'some text from the page page page page page page',
                date: '22 Apr 19:41',
            },
          ],
        },
      ]
    },
    {
      title: "Sunday, 21 April, 2019",
      data: [
        {
          url: "https://test.com/route3",
          pageUrl: "https://test.com/route3",
          titleText: "This is a test site - route 3",
          date: "5 mins ago",
          notes: [
            {
                url: '',
                commentText: 'test comment',
                noteText: 'some text from the page page page page page page',
                date: '22 Apr 19:41',
            },
          ],
        },
      ]
    },
    {
      title: "Friday, 19 April, 2019",
      data: [
        {
          url: "https://test.com/route5",
          pageUrl: "https://test.com/route5",
          titleText: "This is a test site - route 5",
          date: "5 mins ago",
          notes: [
            {
                url: '',
                commentText: 'test comment',
                noteText: 'some text from the page page page page page page',
                date: '22 Apr 19:41',
            },
          ],
        },
        {
          url: "https://test.com/route6",
          pageUrl: "https://test.com/route6",
          titleText: "This is a test site - route 6",
          date: "5 mins ago",
          notes: [
            {
                url: '',
                commentText: 'test comment',
                date: '22 Apr 19:41',
            },
            {
                url: '',
                noteText: 'some text from the page page page page page page',
                date: '22 Apr 19:41',
            },
          ],
        }
      ]
    }
  ]
});
