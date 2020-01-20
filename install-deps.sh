#!/bin/sh

git submodule update --init --recursive
cd ./app/
yarn install --frozen-lockfile
cd ./ios/

if [ $# -eq 1 ]; then
    pod install
fi
