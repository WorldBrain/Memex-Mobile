It always takes me a bit of time to work out all the different Storex writes and syncs which occur during the lifespan of the share modal.

So here it is for 4 main events in the modal lifespan:

## Not-yet-indexed page + user is logged in

1. on startup:
    1. schedule sync in BG _(don't wait)_
    2. store page stub + visit + Inbox+Mobile list entries
2. on share modal save _(available when any input is dirty)_
    1. store page
    2. run sync
3. on share modal close _(available when *no* inputs are dirty)_
    1. **_Nothing_**
4. on share modal undo
    1. delete page stub + visit + Inbox+Mobile list entries _(from 1.2)_

## Already indexed page + user is logged in

1. on startup:
    1. schedule sync in BG _(don't wait)_
    2. store visit
    3. lookup page bookmark
    4. lookup page tags
    5. lookup page lists
2. on share modal save _(available when any input is dirty)_
    1. store page
    2. run sync
3. on share modal close _(available when *no* inputs are dirty)_
    1. **_Nothing_**
4. on share modal undo
    1. delete page visit _(from 1.2)_
