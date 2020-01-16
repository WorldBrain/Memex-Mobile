#!/bin/sh

PRIVATE_KEY=~/.ssh/id_rsa

echo "$IOS_REPO_PRIVATE_KEY" > $PRIVATE_KEY
sed -i '.bak' 's/\\ /\ /g' $PRIVATE_KEY
chmod 400 $PRIVATE_KEY
