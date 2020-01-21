#!/bin/sh

git submodule update --init --recursive
cd ./app/
yarn install --frozen-lockfile

bundle install
