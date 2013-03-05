package net.thefoley.mojhosto;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Base64;
import android.webkit.JavascriptInterface;

class JsObject {
  private final MainActivity activity;
  /**
   * @param mainActivity
   */
  JsObject(MainActivity mainActivity) {
    activity = mainActivity;
  }
  @SuppressWarnings({ "unused" })
  @JavascriptInterface
  public String printCard(String cardjson) {
    print(cardjson);
    JSONObject card;
    try {
      card = new JSONObject(cardjson);
    } catch (JSONException e) {
      print("JSON exception: " + e.getMessage());
      return "json exception";
    }
    if (card == null) {
      return "card is null";
    }
    JSONArray arr = card.optJSONArray("arr");
    if (arr == null) {
      return "arr is null";
    }
    int len = arr.length();
    byte[][] byteses = new byte[len][];
    for (int i = 0; i < len; i++) {
      String buf = arr.optString(i);
      byte[] bytes = Base64.decode(buf, Base64.DEFAULT);
      byteses[i] = bytes;
    }
    new PrintByteList(this).execute(byteses);
    return "success!";
  }
  
  public void print(String msg) {
    System.out.println(msg);
    //TODO: Cram message into some html thing.
  }
  
  @JavascriptInterface
  public String printPheldy() {
    print("loading file and printing...");
    loadFileAndPrint();
    return "that probably worked.";
  }
  
  public void loadFileAndPrint() {
    try {
      final InputStream is = activity.getResources().getAssets().open("pheldy");
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
      new PrintByteList(this).execute(baos.toByteArray());
      baos.close();
    } catch (IOException e) {
      print("io exception: " + e.getMessage());
    }
  }
}
