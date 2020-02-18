# Setting up

0. `git clone git@github.com:WorldBrain/Memex-Mobile --recursive`
1. Set up and connect a device via XCode or adb
1. Go to the `app/` directory
1. Run `yarn`

_additional required steps if intending to run on iOS:_

1. Go to the `app/ios` directory
1. Install Cocoapods if not already installed: https://cocoapods.org/
1. Run `pod install`

## Running on Android

0. Add Firebase credentials in `app/android/app/google-services.json`
1. In one terminal, run `yarn start`
1. In another terminal, run `yarn react-native run-android`

**Note:**
_If your Android SDK or AVDs are not configured properly, you may have to manually start an emulator instance for the above commands to work._

## Running on iOS (requires macOS)

0. Add Firebase credentials:

   0.1. for main app: `app/ios/app/GoogleService-Info.plist`

   0.2. for share extension: `app/ios/MemexShare/GoogleService-Info.plist`

1. In one terminal, run `yarn start`
1. In another terminal, run `open app/ios/app.xcworkspace` to open the XCode workspace **(important that you don't open `app/ios/app.xcodeproj`)**
1. In the menu bar, go to `Product > Destination`

   3.1. Choose a connected iPhone or one of the simulators

1. Press the "Play" button in the top left

## Set up app reload on source code change

_Assumes the above steps have been followed and app is currently running in iOS simulator while `yarn start` is running in a terminal._

1. In the iOS simulator, press `cmd + D`, or `cmd/ctrl + M` on Android emulator, to open the developer menu
2. Press "Enable Live Reload"
3. Change anything in the source code and save and the app should quickly reload with those new changes.

# Troubleshooting

## Build issues citing missing deps or libraries

Often I've encountered issues where things either crash on build or at runtime citing missing dependencies, mainly on iOS. If this happens, I would advise trying to re-install all the needed deps and trying again. You can copy and paste the following snippets, running them from the repo root:

**_Clean and reset your git repo + submodules_**

```
git clean -xfd
git submodule foreach --recursive git clean -xfd
git reset --hard
git submodule foreach --recursive git reset --hard
git submodule update --init --recursive
```

**Note:**
_Running the above should automatically remove your NPM deps and CocoaPods._

**_Clean and re-install your NPM deps_**

```
rm -rf node_modules/
yarn
```

**_Re-install all CocoaPods_**

```
cd ios/
pod install
cd ..
```

**_Clean XCode build caches_**

Choose `Product > Clean` in the XCode menu bar.

## `Haste module naming collision` error throwing from `yarn start`

Sometimes you may see an error output from `yarn start` similar to the following, possibly with different submodules:

```
Loading dependency graph...jest-haste-map: Haste module naming collision: @worldbrain/storex-pattern-modules
  The following files share their name; please adjust your hasteImpl:
    * <rootDir>/external/@worldbrain/storex-pattern-modules/package.json
    * <rootDir>/external/@worldbrain/memex-storage/external/@worldbrain/storex-pattern-modules/package.json
```

If this happens, run the following to rmeove the duplicated submodules:

```
rm -rf app/external/@worldbrain/memex-storage/external
```

This indicates an issue with how that repo is currently set up with its own submodules, which needs to be fixed.

**NOTE:**
_If you run `git submodule update` again at any time, you may need to re-run the above command to re-remove the duplicated submodules_

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

**Note:**
This should now automatically be run on `postinstall` when running `yarn` while setting up the repo.

The reason this happens (from my limited understanding) is because certain deps will be using native Java code that isn't updated
to AndroidX yet while the main app assumes AndroidX. Running `jetify` updates those deps. **This may need to be run each time you refresh your deps by running `yarn`.** More info in the `jetifier` NPM package:
https://www.npmjs.com/package/jetifier

## No online devices found

If you get an error about no online devices found, the emulator is running too slowly. (Which it was even for me running 4 fast cores and 16GB RAM and a GPU beast with 8GB of video memory.) For me, enabling GPU accelleration worked, which can only be done on images NOT including the Play Store.

If the emulator somehow doesn't receive input from your physical keyboard, you can open the React developer menu with this command:

```
adb shell input keyevent 82
```
