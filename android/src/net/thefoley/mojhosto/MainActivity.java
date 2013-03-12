package net.thefoley.mojhosto;

import android.os.Bundle;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.database.sqlite.SQLiteDatabase;
import android.view.Menu;
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
    settings.setAppCacheMaxSize(1024*1024*128); // 128mb
    String appCachePath =
        getApplicationContext().getCacheDir().getAbsolutePath();
    settings.setAppCachePath(appCachePath);
    settings.setAllowFileAccess(true);
    settings.setAppCacheEnabled(true);
    settings.setCacheMode(WebSettings.LOAD_DEFAULT);

    SQLiteDatabase sdb = null;
    try {
      sdb = SQLiteDatabase.openDatabase(
          getFilesDir().getPath() + "/mojhosto_db.sqlite",
          null,
          SQLiteDatabase.OPEN_READONLY);
    } catch (Exception e) {
      System.out.println("Couldn't init database");
    }
    
    webView.addJavascriptInterface(new JsObject(this, sdb), "injectedObject");
    webView.loadUrl("http://thefoley.net/mojhosto/index.html");
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
