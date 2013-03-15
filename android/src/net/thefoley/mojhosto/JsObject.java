package net.thefoley.mojhosto;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Base64;
import android.webkit.JavascriptInterface;

class JsObject {
  private final SQLiteDatabase database;

  /**
   * @param mainActivity
   * @param sdb
   */
  JsObject(SQLiteDatabase sdb) {
    database = sdb;
  }
  
  @SuppressWarnings({ "unused" })
  @JavascriptInterface
  public String printBase64String(String cardjson) {
    JSONObject card;
    try {
      card = new JSONObject(cardjson);
    } catch (JSONException e) {
      return "JSON exception: " + e.getMessage();
    }
    if (card == null) {
      return "card is null";
    }
    JSONArray arr = card.optJSONArray("arr");
    if (arr == null) {
      return "No data for card. Check database.";
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
  public String printCard(String query, String padding) {
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
    new PrintByteList().execute(byteses);
    if (cur.getColumnCount() == 2) {
      String s = cur.getString(1);
      return s;
    }
    return "";
  }
  
  @JavascriptInterface
  public String getJhos(String query, String print, String padding) {
    if (database == null) {
      return "database unavailable.";
    }
    
    if (print.equalsIgnoreCase("instants") || print.equalsIgnoreCase("sorceries")) {
      Cursor cur = database.rawQuery("SELECT data, id FROM " + print + " ORDER BY RANDOM() LIMIT 3", null);
      byte[][] byteses = new byte[4][];
      int i = 0;
      JSONArray arr = new JSONArray();
      while (cur.moveToNext()) {
        byte[] blob = cur.getBlob(0);
        byteses[i] = blob;
        arr.put(cur.getInt(1));
        i++;
      }
      byteses[3] = Base64.decode(padding, Base64.DEFAULT);
      new PrintByteList().execute(byteses);
      return arr.toString();
    }
    
    Cursor cur = database.rawQuery(query, null);
    if (cur.getCount() != 3) {
      return "incorrect number of rows returned.";
    }
    
    JSONArray ret = new JSONArray();
    while (cur.moveToNext()) {
      try {
        JSONObject obj = new JSONObject();
        for (int i = 0; i < cur.getColumnCount(); i++) {
          String name = cur.getColumnName(i);
          switch(cur.getType(i)) {
          case Cursor.FIELD_TYPE_BLOB:
            byte[] blob = cur.getBlob(i);
            byte[] bytes = Base64.encode(blob, Base64.DEFAULT);
            String blobVal = new String(bytes);
            obj.put(name, blobVal);
            break;
          case Cursor.FIELD_TYPE_FLOAT:
            float floatVal = cur.getFloat(i);
            obj.put(name, floatVal);
            break;
          case Cursor.FIELD_TYPE_INTEGER:
            int intVal = cur.getInt(i);
            obj.put(name, intVal);
            break;
          case Cursor.FIELD_TYPE_STRING:
            String strVal = cur.getString(i);
            obj.put(name, strVal);
            break;
          case Cursor.FIELD_TYPE_NULL:
            obj.put(name, "");
            break;
          default:
            return "unknown field type.";
          }
        }
        ret.put(obj);
      } catch (JSONException e) {
        return "JSONException: " + e.getMessage();
      }
    }
    return ret.toString();
  }

}
