#!/bin/sh

echo "$IOS_REPO_PRIVATE_KEY" > ~/.ssh/id_rsa
echo "$IOS_REPO_PUBLIC_KEY" > ~/.ssh/id_rsa.pub
