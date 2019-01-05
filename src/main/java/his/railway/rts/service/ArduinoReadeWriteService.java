package his.railway.rts.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.util.Enumeration;
import gnu.io.CommPortIdentifier;
import gnu.io.SerialPort;
import his.railway.rts.listener.ArduinoReaderListener;

public class ArduinoReadeWriteService {

	/** The port we're normally going to use. */
	private static final String PORT_NAMES[] = { //
			"/dev/tty.usbserial-A9007UX1", // Mac OS X
			"/dev/ttyACM0", // Raspberry Pi
			"/dev/ttyUSB0", // Linux
			"COM5", // Windows
	};

	/** Milliseconds to block while waiting for port open */
	private static final int TIME_OUT = 2000;
	/** Default bits per second for COM port. */
	private static final int DATA_RATE = 9600;

	/** The output stream to the port */
	private OutputStream output;

	private SerialPort serialPort;

	private ArduinoReaderListener serialPortEventListener;

	public ArduinoReadeWriteService(ArduinoReaderListener serialPortEventListener) {
		this.serialPortEventListener = serialPortEventListener;
	}

	public void initialize() {
		// the next line is for Raspberry Pi and
		// gets us into the while loop and was suggested here was suggested
		// http://www.raspberrypi.org/phpBB3/viewtopic.php?f=81&t=32186
		// System.setProperty("gnu.io.rxtx.SerialPorts", "/dev/ttyACM0");
		// String path = System.getProperty("java.library.path");
		// System.out.println(path);

		CommPortIdentifier portId = null;

		@SuppressWarnings("rawtypes")
		Enumeration portEnum = CommPortIdentifier.getPortIdentifiers();

		System.out.println(portEnum.hasMoreElements());

		// First, Find an instance of serial port as set in PORT_NAMES.
		while (portEnum.hasMoreElements()) {
			CommPortIdentifier currPortId = (CommPortIdentifier) portEnum.nextElement();
			for (String portName : PORT_NAMES) {
				if (currPortId.getPortType() == CommPortIdentifier.PORT_SERIAL
						&& currPortId.getName().equals(portName)) {
					portId = currPortId;
					break;
				}
			}
		}
		
		if (portId == null) {
			System.out.println("Could not find COM port.");
			return;
		}

		try {
			// open serial port, and use class name for the appName.
			serialPort = (SerialPort) portId.open(this.getClass().getName(), TIME_OUT);

			// set port parameters
			serialPort.setSerialPortParams(DATA_RATE, SerialPort.DATABITS_8, SerialPort.STOPBITS_1,
					SerialPort.PARITY_NONE);

			// open the streams
			output = serialPort.getOutputStream();
			BufferedReader input = new BufferedReader(new InputStreamReader(serialPort.getInputStream()));
			this.serialPortEventListener.setBufferedReader(input);

			// add event listeners
			serialPort.addEventListener(this.serialPortEventListener);
			serialPort.notifyOnDataAvailable(true);
		} catch (Exception e) {
			System.err.println(e.toString());
		}
	}

	/**
	 * This should be called when you stop using the port. This will prevent port
	 * locking on platforms like Linux.
	 */
	public synchronized void close() {
		if (serialPort != null) {
			serialPort.removeEventListener();
			serialPort.close();
		}
	}

	public synchronized void writeMessage(String message) throws IOException {
		output.write(message.getBytes());
	}

}
