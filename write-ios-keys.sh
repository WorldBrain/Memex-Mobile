#!/bin/sh

MAIN_APP_ENV_FILE="./app/ios/app/GoogleService-Info.plist"
EXT_APP_ENV_FILE="./app/ios/MemexShare/GoogleService-Info.plist"
SENTRY_PROPS_FILE="./app/ios/sentry.properties"
declare -r SSH_FILE="$(mktemp -u $HOME/.ssh/id_rsa)"

# Set up private key
echo $IOS_REPO_PRIVATE_KEY | base64 -D > $SSH_FILE
chmod 600 $SSH_FILE

# Set up sentry properties
echo $SENTRY_PROPS | base64 -D > $SENTRY_PROPS_FILE

# Set up Firebase env files
echo $IOS_MAIN_APP_ENV | base64 -D > $MAIN_APP_ENV_FILE
echo $IOS_EXT_APP_ENV | base64 -D > $EXT_APP_ENV_FILE

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
