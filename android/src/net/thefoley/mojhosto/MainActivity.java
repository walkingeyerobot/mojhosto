package net.thefoley.mojhosto;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Set;
import java.util.UUID;

import android.os.AsyncTask;
import android.os.Bundle;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.view.Menu;
import android.view.View;

public class MainActivity extends Activity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);
  }

  @Override
  public boolean onCreateOptionsMenu(Menu menu) {
    // Inflate the menu; this adds items to the action bar if it is present.
    getMenuInflater().inflate(R.menu.activity_main, menu);
    return true;
  }

  private class Pheldy extends AsyncTask<ByteArrayOutputStream, Long, Long> {
    protected void onPostExecute(Long result) {

    }

    protected void onProgressUpdate(Long... progress) {

    }

    protected Long doInBackground(ByteArrayOutputStream... baoses) {
      try {
        ByteArrayOutputStream baos = baoses[0];
        BluetoothAdapter bluetube = BluetoothAdapter.getDefaultAdapter();
        Set<BluetoothDevice> pairedDevices = bluetube.getBondedDevices();
        for (BluetoothDevice device : pairedDevices) {
          // TODO(mitch): Make this a better comparison
          if (device.getName().equals("Star Micronics")) {
            System.out.println("found it.");
            /*
             * this code caches the UUIDs, but doesn't return them. This code
             * doesn't block.
             * if (device.fetchUuidsWithSdp()) {
             *   System.out.println("true");
             * } else {
             *   System.out.println("false");
             * }
             * 
             * this code reads the UUIDs from cache. I think the UUIDs for a
             * given device never change, so I read it once and I think we
             * can use a hardcoded string now. Which is way more stable.
             * ParcelUuid[] pu = device.getUuids();
             * UUID uuid = pu[0].getUuid();
             */
            UUID uuid =
                UUID.fromString("00001101-0000-1000-8000-00805f9b34fb");
            BluetoothSocket socket = device
                .createInsecureRfcommSocketToServiceRecord(uuid);
            socket.connect();
            if (socket.isConnected()) {
              System.out.println("connected.");
              byte[] bytes = baos.toByteArray();
              System.out.println(bytes.length);
              baos.close();
              OutputStream out = socket.getOutputStream();
              int start = 0;
              int len = 1024;
              int sleep = 0;
              if (len > bytes.length) {
                len = bytes.length;
              }
              while (true) {
                out.write(bytes, start, len);
                if (sleep > 0) {
                  System.out.println("sleeping...");
                  Thread.sleep(sleep);
                }
                start += len;
                if (start >= bytes.length) {
                  break;
                } else if (start + len > bytes.length) {
                  len = bytes.length - start;
                }
              }
              out.close();
              socket.close();
              System.out.println("closed");
            } else {
              System.out.println("can't connect.");
            }
            break;
          }
        }
      } catch (IOException e) {
        System.out.println("io exception: " + e.getMessage());
      } catch (InterruptedException e) {
        System.out.println("interrupt exception: " + e.getMessage());
      }
      return null;
    }
  }

  public void onGoFuckYourself(View v) throws IOException {
    System.out.println("button pressed");
    final InputStream is = getResources().getAssets().open("pheldy2");
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
    new Pheldy().execute(baos);
  }
}
