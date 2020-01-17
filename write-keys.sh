#!/bin/sh

PRIVATE_KEY=~/.ssh/id_rsa
PUBLIC_KEY=~/.ssh/id_rsa.pub
SSH_CONF=~/.ssh/config

echo $IOS_REPO_PRIVATE_KEY | base64 -D > $PRIVATE_KEY
echo $IOS_REPO_PUBLIC_KEY | base64 -D > $PUBLIC_KEY

echo "Host *" >> $SSH_CONF
echo "    UseKeychain yes" >> $SSH_CONF
echo "    AddKeysToAgent yes"  >> $SSH_CONF

chmod 400 $PRIVATE_KEY
ssh-add $PRIVATE_KEY
