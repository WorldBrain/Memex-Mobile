package io.worldbrain;

 import io.worldbrain.generated.BasePackageList;

import android.app.Application;

import org.unimodules.adapters.react.ModuleRegistryAdapter;
import org.unimodules.adapters.react.ReactModuleRegistryProvider;
import org.unimodules.core.interfaces.SingletonModule;

import com.oblador.keychain.KeychainPackage;
import com.facebook.react.ReactApplication;
import com.th3rdwave.safeareacontext.SafeAreaContextPackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.igorbelyayev.rnlocalresource.RNLocalResourcePackage;
import io.sentry.RNSentryPackage;
import net.rhogan.rnsecurerandom.RNSecureRandomPackage;
import com.oney.WebRTCModule.WebRTCModulePackage;
import io.invertase.firebase.firestore.ReactNativeFirebaseFirestorePackage;
import io.invertase.firebase.database.ReactNativeFirebaseDatabasePackage;
import io.invertase.firebase.auth.ReactNativeFirebaseAuthPackage;
import io.invertase.firebase.app.ReactNativeFirebaseAppPackage;
import io.invertase.firebase.functions.ReactNativeFirebaseFunctionsPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import org.reactnative.camera.RNCameraPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.reactnativecommunity.rnpermissions.RNPermissionsPackage;
import com.transistorsoft.rnbackgroundfetch.RNBackgroundFetchPackage;

import org.pgsqlite.SQLitePluginPackage;
import com.alinz.parkerdan.shareextension.SharePackage;

import com.horcrux.svg.SvgPackage;
import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {
   private final ReactModuleRegistryProvider mModuleRegistryProvider = new ReactModuleRegistryProvider(new BasePackageList().getPackageList(), Arrays.<SingletonModule>asList());

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
            new SafeAreaContextPackage(),
            new RNCWebViewPackage(),
            new RNLocalResourcePackage(),
            new RNSentryPackage(),
        new RNSecureRandomPackage(),
        new WebRTCModulePackage(),
        new ReactNativeFirebaseAppPackage(),
        new ReactNativeFirebaseAuthPackage(),
        new ReactNativeFirebaseDatabasePackage(),
        new ReactNativeFirebaseFirestorePackage(),
        new ReactNativeFirebaseFunctionsPackage(),
        new AsyncStoragePackage(),
        new RNCameraPackage(),
        new KeychainPackage(),
        new RNPermissionsPackage(),
        new RNGestureHandlerPackage(),
        new RNBackgroundFetchPackage(),
        new SharePackage(),  // register `react-native-share-extension` plugin here
        new ModuleRegistryAdapter(mModuleRegistryProvider),
        new SvgPackage()
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
