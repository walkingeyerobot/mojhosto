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
    //print("exec sql: " + query);
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
  
  @JavascriptInterface
  public String getJhos(String query, String print, String padding) {
    if (database == null) {
      return "database unavailable.";
    }
    if (print.equalsIgnoreCase("instants") || print.equalsIgnoreCase("sorceries")) {
      Cursor cur = database.rawQuery("SELECT data FROM " + print + " ORDER BY RANDOM() LIMIT 3", null);
      byte[][] byteses = new byte[4][];
      int i = 0;
      while (cur.moveToNext()) {
        byte[] blob = cur.getBlob(0);
        byteses[i] = blob;
        i++;
      }
      byteses[3] = Base64.decode(padding, Base64.DEFAULT);
      new PrintByteList(this).execute(byteses);
      return "done.";
    }
    Cursor cur = database.rawQuery(query, null);
    if (cur.getCount() != 3) {
      return "incorrect number of rows returned.";
    }
    
    JSONArray ret = new JSONArray();
    while (cur.moveToNext()) {
      JSONObject obj = new JSONObject();
      int id = cur.getInt(0);
      String name = cur.getString(1);
      int face = cur.getInt(2);
      String cost = cur.getString(3);
      String color_ind = cur.getString(4);
      String typeline = cur.getString(5);
      String rules = cur.getString(6);
      String color = cur.getString(7);
      try {
        obj.put("id", id);
        obj.put("name", name);
        obj.put("face", face);
        obj.put("cost", cost);
        obj.put("color_ind", color_ind);
        obj.put("typeline", typeline);
        obj.put("rules", rules);
        obj.put("color", color);
        ret.put(obj);
      } catch (JSONException e) {
        String err = "JSONException: " + e.getMessage();
        System.out.println(err);
        return err;
      }
    }
    return ret.toString();
  }

}
