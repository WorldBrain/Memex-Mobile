It always takes me a bit of time to work out what the timeline of Storex writes and syncs is which occur during the lifespan of the share modal.
So here it is:

## Not-yet-indexed page + user is logged in

-   on startup:
    1. schedule sync in BG _(don't wait)_
    2. store page stub + visit + Inbox+Mobile list entries
-   on share modal save _(available when any input is dirty)_
    1. store page
    2. run sync
-   on share modal close _(available when *no* inputs are dirty)_
    1. **_Nothing_**
-   on share modal cancel
    1. delete page stub + visit + Inbox+Mobile list entries
