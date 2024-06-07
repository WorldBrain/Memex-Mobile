It always takes me a bit of time to work out all the different Storex writes and syncs which occur during the lifespan of the share modal.

So here it is for 4 main events in the modal lifespan:

## Not-yet-indexed page + user is logged in

1. on startup:
    1. schedule sync in BG _(don't wait)_
    2. schedule page title fetch _(don't wait)_
    3. store page stub + visit + Inbox+Mobile list entries
2. on share modal save _(available when any input is dirty)_
    1. store page title _(from 1.2)_
    2. store page bookmark + tags + lists
    3. run sync
3. on share modal close _(available when *no* inputs are dirty)_
    1. store page title _(from 1.2)_
4. on share modal undo
    1. delete page stub + visit + Inbox+Mobile list entries _(from 1.3)_

## Already indexed page + user is logged in

1. on startup:
    1. schedule sync in BG _(don't wait)_
    2. schedule page title fetch _(don't wait)_
    3. store visit
    4. lookup page bookmark
    5. lookup page tags
    6. lookup page lists
2. on share modal save _(available when any input is dirty)_
    1. store page title _(from 1.2)_
    2. store user set page bookmark + tags + lists
    3. run sync
3. on share modal close _(available when *no* inputs are dirty)_
    1. store page title _(from 1.2)_
4. on share modal undo
    1. delete page visit _(from 1.3)_
