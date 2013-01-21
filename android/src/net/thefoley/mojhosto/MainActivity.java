package net.thefoley.mojhosto;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Set;
import java.util.UUID;

import android.os.Bundle;
import android.os.ParcelUuid;
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
    
    public void onGoFuckYourself(View v) throws IOException {
    	System.out.println("double quotes");
    	BluetoothAdapter bluetube = BluetoothAdapter.getDefaultAdapter();
    	Set<BluetoothDevice> pairedDevices = bluetube.getBondedDevices();
    	System.out.println("wat");
    	for (BluetoothDevice foo:pairedDevices) {
    		if (foo.getName().equals("Star Micronics")) {
    			System.out.println("found it.");
    			ParcelUuid[] pu = foo.getUuids();
    			UUID uuid = pu[0].getUuid();
    			BluetoothSocket socket = foo.createInsecureRfcommSocketToServiceRecord(uuid);
    			socket.connect();
    			if (socket.isConnected()) {
    				System.out.println("true!");
    				final InputStream is = getResources().getAssets().open("forestbear");
    				byte[] byteArray = new byte[4000];
    				ByteArrayOutputStream baos = new ByteArrayOutputStream();
    				while(true) {
    					int i = is.read(byteArray);
    					if (i == -1) {
    						break;
    					}
    					baos.write(byteArray, 0, i);
    				}
    				is.close();
    				baos.write('\n');
    				byte[] bytes = baos.toByteArray();
    				System.out.println(bytes.length - 1);
    				baos.close();
    				
    				OutputStream out = socket.getOutputStream();
    				//String str = "hello world\n\n\n\n\n";
    				//out.write(str.getBytes(Charset.forName("LATIN-1")));
    				out.write(bytes);
    				out.close();
    				socket.close();
    			} else {
    				System.out.println("false!");
    			}
    			break;
    		}
    	}
    }
}
