package net.thefoley.mojhosto;

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
    System.out.println(cardjson);
    JSONObject card;
    try {
      card = new JSONObject(cardjson);
    } catch (JSONException e) {
      System.out.println("JSON exception: " + e.getMessage());
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
    new PrintByteList().execute(byteses);
    return "success!";
  }
  @JavascriptInterface
  public String printPheldy() {
    System.out.println("loading file and printing...");
    activity.loadFileAndPrint();
    return "that probably worked.";
  }
}
