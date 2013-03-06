package net.thefoley.mojhosto;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteException;
import android.database.sqlite.SQLiteOpenHelper;

public class DataBaseHelper extends SQLiteOpenHelper {
  private static String DB_NAME = "mojhosto_db.sqlite";
  private final Context myContext;

  public DataBaseHelper(Context context) throws IOException {
    super(context, DB_NAME, null, 3);
    this.myContext = context;
    ensureDatabase();
  }

  private void ensureDatabase() throws IOException {
    SQLiteDatabase checkDB = null;
    try {
      String myPath = myContext.getFilesDir().getPath() + "/" + DB_NAME;
      checkDB = SQLiteDatabase.openDatabase(myPath, null,
          SQLiteDatabase.OPEN_READONLY);
    } catch (SQLiteException e) {
      // database does't exist yet.
    }

    if (checkDB != null) {
      checkDB.close();
    } else {
      copyDatabase();
    }
  }

  private void copyDatabase() throws IOException {
    InputStream myInput = myContext.getAssets().open(DB_NAME);
    String outFileName = myContext.getFilesDir().getPath() + "/" + DB_NAME;
    OutputStream myOutput = new FileOutputStream(outFileName);
    byte[] buffer = new byte[1024];
    int length;
    while ((length = myInput.read(buffer)) > 0) {
      myOutput.write(buffer, 0, length);
    }
    myOutput.flush();
    myOutput.close();
    myInput.close();
  }

  @Override
  public void onCreate(SQLiteDatabase db) {

  }

  @Override
  public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {

  }
}