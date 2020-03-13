#!/bin/sh

git submodule update --init --recursive
cd ./app/
yarn install --frozen-lockfile --non-interactive --cache-folder ~/.cache/yarn

# Increase number of OS inotify watches (Android build exceeds default)
sudo sysctl fs.inotify.max_user_watches=524288
sudo sysctl -p

bundle install
