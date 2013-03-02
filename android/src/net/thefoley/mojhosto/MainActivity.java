package net.thefoley.mojhosto;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import android.os.Bundle;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.view.Menu;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {

  @SuppressLint("SetJavaScriptEnabled")
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);
    WebView webview = (WebView) findViewById(R.id.webView1);
    webview.setWebViewClient(new WebViewClient());
    webview.setWebChromeClient(new WebChromeClient() {
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
    WebSettings settings = webview.getSettings();
    settings.setJavaScriptEnabled(true);
    settings.setDatabaseEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setDatabasePath("/data/data/net.thefoley.mojhosto/database");
    settings.setAppCacheMaxSize(1024*1024*128); // 128mb
    String appCachePath =
        getApplicationContext().getCacheDir().getAbsolutePath();
    settings.setAppCachePath(appCachePath);
    settings.setAllowFileAccess(true);
    settings.setAppCacheEnabled(true);
    settings.setCacheMode(WebSettings.LOAD_DEFAULT);
    webview.addJavascriptInterface(new JsObject(this), "injectedObject");
    webview.loadUrl("http://thefoley.net/mojhosto/index.html");
  }

  @Override
  public boolean onCreateOptionsMenu(Menu menu) {
    // Inflate the menu; this adds items to the action bar if it is present.
    getMenuInflater().inflate(R.menu.activity_main, menu);
    return true;
  }

  public void loadFileAndPrint() {
    try {
      final InputStream is = getResources().getAssets().open("pheldy");
      byte[] byteArray = new byte[1024];
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      while (true) {
        int i = is.read(byteArray);
        if (i == -1) {
          break;
        }
        baos.write(byteArray, 0, i);
      }
      is.close();
      new PrintByteList().execute(baos.toByteArray());
      baos.close();
    } catch (IOException e) {
      System.out.println("io exception: " + e.getMessage());
    }
  }
}
