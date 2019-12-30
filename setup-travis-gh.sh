#!/bin/sh

GH_PUBLIC_KEY="github.com ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAq2A7hRGmdnm9tUDbO9IDSwBK6TbQa+PXYPCPy6rbTrTtw7PHkccKrpp0yVhp5HdEIcKr6pLlVDBfOLX9QUsyCOV0wzfjIJNlGEYsdlLJizHhbn2mUjvSAHQqZETYP81eFzLQNnPHt4EVVUh7VfDESU84KezmD5QlWpXLmvU31/yMf+Se8xhHTvKSCZIFImWwoG6mbUoWf9nzpIoaSjB+weqqUUmpaaasXVal72J+UX2B+2RPW3RcT0eOzQgqlJL3RKrTJvdsjE3JEAvGq3lGHSZXy28G3skua2SmVi/w4yCE6gbODqnTWlg7+wC604ydGXA8VJiS5ap43JXiUFFAaQ=="

decrypt_deploy_key() {
  openssl aes-256-cbc -k "$travis_key_password" -d -md sha256 -a -in travis_key.enc -out travis_key
  echo "Host github.com" > ~/.ssh/config
  echo "  IdentityFile  $(pwd)/travis_key" >> ~/.ssh/config
  chmod 400 travis_key
  git remote set-url origin git@github.com:WorldBrain/Memex-Mobile.git

  echo $GH_PUBLIC_KEY > ~/.ssh/known_hosts

  if ! git push -v ; then
    _err "git push error"
  fi
}

decrypt_deploy_key
