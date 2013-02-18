package net.thefoley.mojhosto;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Base64;
import android.webkit.JavascriptInterface;

class JsObject {
  /**
   * 
   */
  private final MainActivity activity;
  /**
   * @param mainActivity
   */
  JsObject(MainActivity mainActivity) {
    activity = mainActivity;
  }
  @SuppressWarnings({ "unused", "unchecked" })
  @JavascriptInterface
  public String printCard(String cardjson) throws IOException {
    System.out.println(cardjson);
    JSONObject card;
    try {
      card = new JSONObject(cardjson);
    } catch (JSONException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
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
    List<byte[]> list = new ArrayList<byte[]>();
    for (int i = 0; i < len; i++) {
      String buf = arr.optString(i);
      byte[] bytes = Base64.decode(buf, Base64.DEFAULT);
      list.add(bytes);
    }
    new PrintByteList().execute(list);
    return "success!";
  }
  @JavascriptInterface
  public void printPheldy() throws IOException {
    System.out.println("loading file and printing...");
    activity.loadFileAndPrint();      
  }
}