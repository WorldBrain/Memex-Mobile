#!/bin/sh

SIGN_KEY="./app/android/app/my-upload-key.keystore"

echo $ANDROID_SIGN_KEY | base64 -d > $SIGN_KEY
chmod 400 $SIGN_KEY
