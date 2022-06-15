package io.worldbrain;

import io.worldbrain.generated.BasePackageList;

import android.app.Application;
import android.content.Context;

import org.unimodules.adapters.react.ModuleRegistryAdapter;
import org.unimodules.adapters.react.ReactModuleRegistryProvider;
import org.unimodules.core.interfaces.SingletonModule;

import com.oblador.keychain.KeychainPackage;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.th3rdwave.safeareacontext.SafeAreaContextPackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.igorbelyayev.rnlocalresource.RNLocalResourcePackage;
import io.sentry.RNSentryPackage;
import io.invertase.firebase.firestore.ReactNativeFirebaseFirestorePackage;
import io.invertase.firebase.database.ReactNativeFirebaseDatabasePackage;
import io.invertase.firebase.auth.ReactNativeFirebaseAuthPackage;
import io.invertase.firebase.app.ReactNativeFirebaseAppPackage;
import io.invertase.firebase.functions.ReactNativeFirebaseFunctionsPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.transistorsoft.rnbackgroundfetch.RNBackgroundFetchPackage;

import org.pgsqlite.SQLitePluginPackage;
import com.alinz.parkerdan.shareextension.SharePackage;

import com.horcrux.svg.SvgPackage;
import java.lang.reflect.InvocationTargetException;
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
        new ReactNativeFirebaseAppPackage(),
        new ReactNativeFirebaseAuthPackage(),
        new ReactNativeFirebaseDatabasePackage(),
        new ReactNativeFirebaseFirestorePackage(),
        new ReactNativeFirebaseFunctionsPackage(),
        new KeychainPackage(),
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
    initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
  }

  /**
   * Loads Flipper in React Native templates. Call this in the onCreate method with something like
   * initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
   *
   * @param context
   * @param reactInstanceManager
   */
  private static void initializeFlipper(
      Context context, ReactInstanceManager reactInstanceManager) {
    if (BuildConfig.DEBUG) {
      try {
        /*
         We use reflection here to pick up the class that initializes Flipper,
        since Flipper library is not available in release mode
        */
        Class<?> aClass = Class.forName("com.rndiffapp.ReactNativeFlipper");
        aClass
            .getMethod("initializeFlipper", Context.class, ReactInstanceManager.class)
            .invoke(null, context, reactInstanceManager);
      } catch (ClassNotFoundException e) {
        e.printStackTrace();
      } catch (NoSuchMethodException e) {
        e.printStackTrace();
      } catch (IllegalAccessException e) {
        e.printStackTrace();
      } catch (InvocationTargetException e) {
        e.printStackTrace();
      }
    }
  }
}
