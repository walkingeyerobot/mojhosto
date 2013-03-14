package net.thefoley.mojhosto;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Base64;
import android.webkit.JavascriptInterface;

class JsObject {
  private final MainActivity activity;
  private final SQLiteDatabase database;

  /**
   * @param mainActivity
   * @param sdb
   */
  JsObject(MainActivity mainActivity, SQLiteDatabase sdb) {
    activity = mainActivity;
    database = sdb;
  }
  
  @SuppressWarnings({ "unused" })
  @JavascriptInterface
  public String printBase64String(String cardjson) {
    print(cardjson);
    JSONObject card;
    try {
      card = new JSONObject(cardjson);
    } catch (JSONException e) {
      print("JSON exception: " + e.getMessage());
      return null;
    }
    if (card == null) {
      print("card is null");
      return null;
    }
    JSONArray arr = card.optJSONArray("arr");
    if (arr == null) {
      print("No data for card. Check database.");
      return null;
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
    activity.getWebView().loadUrl(
        "javascript:logFromJava('" + msg.replaceAll("'", "") + "')");
  }

  @JavascriptInterface
  public String printCard(String query, String padding) {
    print("exec sql: " + query);
    if (database == null) {
      return "database unavailable.";
    }
    Cursor cur = database.rawQuery(query, null);
    if (cur.getCount() != 1) {
      return "incorrect number of rows returned.";
    }
    if (!cur.moveToFirst()) {
      return "unable to move cursor to first.";
    }
    byte[] blob = cur.getBlob(0);
    byte[][] byteses = new byte[2][];
    byteses[0] = blob;
    byte[] bytes = Base64.decode(padding, Base64.DEFAULT);
    byteses[1] = bytes;
    new PrintByteList(this).execute(byteses);
    String s = cur.getString(1);
    return s;
  }

}
