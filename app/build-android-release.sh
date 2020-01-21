#!/bin/sh

# TODO: Handle setting of upload signing key password

cd ./android
./gradlew bundleRelease
cd ..

