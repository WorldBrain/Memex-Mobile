# Setting up


0. `git clone git@github.com:WorldBrain/Memex-Mobile --recursive`
1. Set up an run a device
2. Got to the `app/` directory
3. Run `yarn`

## Running on Android

1. In one terminal, run `yarn start`
2. In another terminal, run `yarn react-native run-android`

### Note:

If your Android SDK or AVDs are not configured properly, you may have to manually start an emulator instance for the above commands to work.

## Running on iOS (requires macOS)

1. In one terminal, run `yarn start`
2. In another terminal, run `open ios/app.xcodeproj` to open Xcode
3. In the menu bar, go to `Product > Destination`

    3.1. Choose a connected iPhone or one of the simulators
    
4. Press the "Play" button in the top left

### Note:

Running via `yarn react-native run-ios` successfully starts up an iPhone X simulator running the app, however the share extensions do not work. They only seem to work if you do the more long-winded Xcode way outlined above.

Troubleshooting
===============

If you get an error about no online devices found, the emulator is running to slowly. (Which it was even for me running 4 fast cores and 16GB RAM and a GPU beast with 8GB of video memory.) For me, enabling GPU accelleration worked, which can only be done on images NOT including the Play Store.

If the emulator somehow doesn't receive input from your physical keyboard, you can open the React developer menu with this command:
```
adb shell input keyevent 82
```
