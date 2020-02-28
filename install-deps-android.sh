#!/bin/sh

git submodule update --init --recursive
cd ./app/
yarn install --frozen-lockfile --non-interactive --cache-folder ~/.cache/yarn

bundle install
