#!/bin/sh

git submodule update --init --recursive
cd ./app/
yarn install --frozen-lockfile

usage()
{
    echo "usage: install-deps.sh [pods|gems]"
    exit 1
}

if [ $# -ne 1 ]
then
    usage
fi

if [ $1 == "pods" ]
then
    cd ./ios/
    pod install
    cd ..
elif [ $1 == "gems" ]
then
    bundle install
else
    echo "Unknown args"
    usage
fi
