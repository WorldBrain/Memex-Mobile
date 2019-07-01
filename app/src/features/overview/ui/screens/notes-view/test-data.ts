import { State } from "./logic";

const log = console.log;
const logHof = props => () => console.log(props);
const rest = {
  initNoteDelete: logHof,
  initNoteEdit: logHof,
  initNoteStar: logHof,
  onDeletePress: log,
  onTagPress: log,
  onCommentPress: log,
  onStarPress: log
};

export default (): State => ({
  sections: [
    {
      title: "Monday, 22 April, 2019",
      data: [
        {
          pageUrl: "https://test.com",
          titleText: "This is a test site",
          date: "5 mins ago",
          notes: [
            {
                noteText: 'some text from the page page page page page page',
                date: '22 Apr 19:41',
            },
        ],
          ...rest
        },
        {
          pageUrl: "https://test.com/route1",
          titleText: "This is a test site - route 1",
          date: "15 mins ago",
          notes: [
            {
                commentText: 'test comment',
                date: '22 Apr 19:41',
            },
            {
                commentText: 'another test comment',
                noteText: 'some text from the page page page page page page',
                date: '22 Apr 19:41',
            },
            {
                noteText: 'some text from the page page page page page page',
                date: '22 Apr 19:41',
            },
          ],
          ...rest
        },
      ]
    },
    {
      title: "Sunday, 21 April, 2019",
      data: [
        {
          pageUrl: "https://test.com/route3",
          titleText: "This is a test site - route 3",
          date: "5 mins ago",
          notes: [
            {
                commentText: 'test comment',
                noteText: 'some text from the page page page page page page',
                date: '22 Apr 19:41',
            },
          ],
          ...rest
        },
      ]
    },
    {
      title: "Friday, 19 April, 2019",
      data: [
        {
          pageUrl: "https://test.com/route5",
          titleText: "This is a test site - route 5",
          date: "5 mins ago",
          notes: [
            {
                commentText: 'test comment',
                noteText: 'some text from the page page page page page page',
                date: '22 Apr 19:41',
            },
          ],
          ...rest
        },
        {
          pageUrl: "https://test.com/route6",
          titleText: "This is a test site - route 6",
          date: "5 mins ago",
          notes: [
            {
                commentText: 'test comment',
                date: '22 Apr 19:41',
            },
            {
                noteText: 'some text from the page page page page page page',
                date: '22 Apr 19:41',
            },
          ],
          ...rest
        }
      ]
    }
  ]
});
