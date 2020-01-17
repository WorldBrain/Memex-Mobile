#!/bin/sh

PRIVATE_KEY=~/.ssh/id_rsa
PUBLIC_KEY=~/.ssh/id_rsa.pub

echo $IOS_REPO_PRIVATE_KEY | base64 -D > $PRIVATE_KEY
echo $IOS_REPO_PUBLIC_KEY | base64 -D > $PUBLIC_KEY
chmod 400 $PRIVATE_KEY
