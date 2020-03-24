#!/bin/sh

ENV_FILE="./app/android/app/google-services.json"
SERVICE_ACC_KEY="./app/android/service-account.json"
SIGN_KEY="./app/android/app/my-upload-key.keystore"
SENTRY_PROPS_FILE="./app/android/sentry.properties"
SSH_FILE="$HOME/.ssh/id_rsa"

# Set up private key
echo $IOS_REPO_PRIVATE_KEY | base64 -d > $SSH_FILE
chmod 600 $SSH_FILE

# Set up Android app signing key
echo $ANDROID_SIGN_KEY | base64 -d > $SIGN_KEY
chmod 400 $SIGN_KEY

# Set up Google Play service account config
echo $ANDROID_SERVICE_JSON | base64 -d > $SERVICE_ACC_KEY
chmod 400 $SERVICE_ACC_KEY

# Set up sentry properties
echo $SENTRY_PROPS | base64 -d > $SENTRY_PROPS_FILE

# Set up Firebase env file
if [ $1 = "production" ]; then
  echo $ANDROID_APP_ENV | base64 -d > $ENV_FILE
else
  echo $ANDROID_APP_DEV_ENV | base64 -d > $ENV_FILE
fi

# Enable SSH authentication
printf "%s\n" \
        "Host gitlab.com" \
        "  User git" \
        "  IdentityFile $SSH_FILE" \
        "  StrictHostKeyChecking no" \
        "  CheckHostIP no" \
        "  PasswordAuthentication no" \
        "  LogLevel ERROR" \
        "" \
        "Host github.com" \
        "  User git" \
        "  IdentityFile $SSH_FILE" \
        "  StrictHostKeyChecking no" \
        "  CheckHostIP no" \
        "  PasswordAuthentication no" \
        "  LogLevel ERROR" >> ~/.ssh/config
