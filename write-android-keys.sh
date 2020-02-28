#!/bin/sh

ENV_FILE="./app/android/app/google-services.json"
SERVICE_ACC_KEY="./app/android/service-account.json"
SIGN_KEY="./app/android/app/my-upload-key.keystore"
SSH_DIR="$HOME/.ssh"
SSH_FILE="$SSH_DIR/id_rsa"

# Set up private key
mkdir $SSH_DIR
echo $IOS_REPO_PRIVATE_KEY | base64 -d > $SSH_FILE
chmod 600 $SSH_FILE

# Set up Android app signing key
echo $ANDROID_SIGN_KEY | base64 -d > $SIGN_KEY
chmod 400 $SIGN_KEY

# Set up Google Play service account config
echo $ANDROID_SERVICE_JSON | base64 -d > $SERVICE_ACC_KEY
chmod 400 $SERVICE_ACC_KEY

# Set up Firebase env file
echo $ANDROID_APP_ENV | base64 -d > $ENV_FILE

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
