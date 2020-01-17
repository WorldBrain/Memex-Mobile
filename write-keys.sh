#!/bin/sh


declare -r SSH_FILE="$(mktemp -u $HOME/.ssh/id_rsa)"

echo $IOS_REPO_PRIVATE_KEY | base64 -D > $SSH_FILE
chmod 600 $SSH_FILE


# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

# Enable SSH authentication

printf "%s\n" \
        "Host gitlab.com" \
        "  User git" \
        "  IdentityFile $SSH_FILE" \
        "  StrictHostKeyChecking no" \
        "  CheckHostIP no" \
        "  PasswordAuthentication no" \
        "  LogLevel ERROR" >> ~/.ssh/config
