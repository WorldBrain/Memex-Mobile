# Setting up

0. `git clone git@github.com:WorldBrain/Memex-Mobile --recursive`
1. Set up an run a device
1. Got to the `app/` directory
1. Run `yarn`

## Running on Android

1. In one terminal, run `yarn start`
2. In another terminal, run `yarn react-native run-android`

**Note:**
_If your Android SDK or AVDs are not configured properly, you may have to manually start an emulator instance for the above commands to work._

## Running on iOS (requires macOS)

1. In one terminal, run `yarn start`
2. In another terminal, run `open ios/app.xcodeproj` to open Xcode
3. In the menu bar, go to `Product > Destination`

   3.1. Choose a connected iPhone or one of the simulators

4. Press the "Play" button in the top left

**Note:**
_Running via `yarn react-native run-ios` successfully starts up an iPhone X simulator running the app, however the share extensions do not work. They only seem to work if you do the more long-winded Xcode way outlined above._

### Set up app reload on source code change

_Assumes the above steps have been followed and app is currently running in iOS simulator while `yarn start` is running in a terminal._

1. In the iOS simulator, press `cmd + D` to open the developer menu
2. Press "Enable Live Reload"
3. Change anything in the source code and save and the app should quickly reload with those new changes.

# Troubleshooting

## Share extension stops working on iOS after new package added

Sometimes, after adding and setting up a new package, the share extension will no longer work on iOS.
Often this is because the `yarn react-native link $PACKAGE_NAME` command to auto-link needed libs
does not perform the needed steps for the share ext's project. The linked libs are treated separately
on both the main app and the share extension.

To fix this, after running the relevant `react-native link` command:

1. open `ios/app.xcodeproj` in Xcode
2. go to the `MemexShare` target
3. go to `Build Phases`
4. go to `Link Binary With Libraries`
5. press the add button and find the relevant `lib$PACKAGE_NAME.a` library

For example, the `@react-native-community/async-storage` package did not get its needed libs automatically
linked with the share extension. Read through [their docs](https://github.com/react-native-community/async-storage/blob/LEGACY/docs/Linking.md#ios) on how to manually link (most RN packages with
such a requirement seem to contain these instructions) to get the relevant lib and follow the above steps.

## Android build errors complaining about missing `android.support.v4.util` packages

Running `yarn react-native run-android` will sometimes result in errors during compilation, such as `error: package android.support.v4.util does not exist`. If this occurs, run `node_modules/.bin/jetify` to migrate all node_modules to AndroidX
then try to run again.

The reason this happens (from my limited understanding) is because certain deps will be using native Java code that isn't updated
to AndroidX yet while the main app assumes AndroidX. Running `jetify` updates those deps. **This may need to be run each time you refresh your deps by running `yarn`.** More info in the `jetifier` NPM package:
https://www.npmjs.com/package/jetifier

## No online devices found

If you get an error about no online devices found, the emulator is running too slowly. (Which it was even for me running 4 fast cores and 16GB RAM and a GPU beast with 8GB of video memory.) For me, enabling GPU accelleration worked, which can only be done on images NOT including the Play Store.

If the emulator somehow doesn't receive input from your physical keyboard, you can open the React developer menu with this command:

```
adb shell input keyevent 82
```
