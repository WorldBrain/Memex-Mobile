Setting up
==========

0. `git clone git@github.com:WorldBrain/Memex-Mobile --recursive`
1. Set up an run a device
2. Got to the `app/` directory
3. Run `yarn`
4. In one terminal, run `yarn start`
5. In another terminal, run `yarn react-native run-android`

Troubleshooting
===============

If you get an error about no online devices found, the emulator is running to slowly. (Which it was even for me running 4 fast cores and 16GB RAM and a GPU beast with 8GB of video memory.) For me, enabling GPU accelleration worked, which can only be done on images NOT including the Play Store.

If the emulator somehow doesn't receive input from your physical keyboard, you can open the React developer menu with this command:
```
adb shell input keyevent 82
```
