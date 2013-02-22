package net.thefoley.mojhosto;

import java.io.IOException;
import java.io.OutputStream;
import java.util.Set;
import java.util.UUID;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.os.AsyncTask;

class PrintByteList extends AsyncTask<byte[], Long, Long> {

  protected void onPostExecute(Long result) {

  }

  protected void onProgressUpdate(Long... progress) {

  }

  protected Long doInBackground(byte[]... byteses) {
    try {
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
            OutputStream out = socket.getOutputStream();
            for (byte[] bytes : byteses) {
              int i = 0;
              while (i < bytes.length){
                out.write(bytes, i, Math.min(bytes.length - i, 500));
                out.flush();
                i += 500;
                Thread.sleep(100);
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
