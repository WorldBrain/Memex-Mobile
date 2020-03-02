#!/bin/sh

git submodule update --init --recursive
cd ./app/
yarn install --frozen-lockfile --non-interactive --cache-folder ~/Library/Caches/Yarn

cd ./ios/
pod install
cd ..
