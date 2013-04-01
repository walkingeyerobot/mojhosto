package net.thefoley.mojhosto;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import android.os.Bundle;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.database.sqlite.SQLiteDatabase;
import android.view.Menu;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
  private WebView webView;
  @SuppressLint("SetJavaScriptEnabled")
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    webView = (WebView) findViewById(R.id.webView1);
    webView.setWebViewClient(new WebViewClient());
    webView.setWebChromeClient(new WebChromeClient() {
      @Override
      public void onExceededDatabaseQuota(
          String url,
          String databaseIdentifier,
          long currentQuota,
          long estimatedSize,
          long totalUsedQuota,
          android.webkit.WebStorage.QuotaUpdater quotaUpdater) {
        quotaUpdater.updateQuota(estimatedSize * 2);
      }
    });
    WebSettings settings = webView.getSettings();
    settings.setJavaScriptEnabled(true);
    settings.setDatabaseEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setDatabasePath(getFilesDir().getPath());
    settings.setAppCacheMaxSize(1024*1024*4); // 4mb
    String appCachePath =
        getApplicationContext().getCacheDir().getAbsolutePath();
    settings.setAppCachePath(appCachePath);
    settings.setAllowFileAccess(true);
    settings.setAppCacheEnabled(true);
    settings.setCacheMode(WebSettings.LOAD_DEFAULT);

    SQLiteDatabase sdb = null;
    File dbFile = getDatabasePath("mojhosto_db.sqlite");
    if (!dbFile.exists()) {
      try {
        InputStream is = getAssets().open("mojhosto_db.sqlite");
        OutputStream os = new FileOutputStream(dbFile);
        byte[] buffer = new byte[1024];
        while (is.read(buffer) > 0) {
          os.write(buffer);
        }
        os.flush();
        os.close();
        is.close();
      } catch (IOException e) {
        System.out.println("unable to copy db: " + e.getMessage());
      }
    }
    
    sdb = SQLiteDatabase.openDatabase(dbFile.getPath(), null, SQLiteDatabase.OPEN_READONLY);

    webView.addJavascriptInterface(new JsObject(sdb), "injectedObject");
    //webView.loadUrl("http://thefoley.net/mojhosto/index.html");
    webView.loadUrl("http://192.168.1.187:8080");
  }

  public WebView getWebView() {
    return webView;
  }
  
  @Override
  public boolean onCreateOptionsMenu(Menu menu) {
    // Inflate the menu; this adds items to the action bar if it is present.
    getMenuInflater().inflate(R.menu.activity_main, menu);
    return true;
  }
}
