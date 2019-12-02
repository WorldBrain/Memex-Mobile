package io.worldbrain;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.oney.WebRTCModule.WebRTCModulePackage;
import io.invertase.firebase.firestore.ReactNativeFirebaseFirestorePackage;
import io.invertase.firebase.database.ReactNativeFirebaseDatabasePackage;
import io.invertase.firebase.auth.ReactNativeFirebaseAuthPackage;
import io.invertase.firebase.app.ReactNativeFirebaseAppPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import org.reactnative.camera.RNCameraPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.reactnativecommunity.rnpermissions.RNPermissionsPackage;

import org.pgsqlite.SQLitePluginPackage;
import com.alinz.parkerdan.shareextension.SharePackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
        new SQLitePluginPackage(),   // register SQLite Plugin here
        new MainReactPackage(),
        new WebRTCModulePackage(),
        new ReactNativeFirebaseAppPackage(),
        new ReactNativeFirebaseAuthPackage(),
        new ReactNativeFirebaseDatabasePackage(),
        new ReactNativeFirebaseFirestorePackage(),
        new AsyncStoragePackage(),
        new RNCameraPackage(),
        new RNPermissionsPackage(),
        new RNGestureHandlerPackage(),
        new SharePackage()  // register `react-native-share-extension` plugin here
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
