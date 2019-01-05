package his.railway.rts.listener;

import java.io.BufferedReader;

import org.springframework.messaging.simp.SimpMessagingTemplate;

import gnu.io.SerialPortEvent;
import gnu.io.SerialPortEventListener;
import his.railway.rts.model.HttpResponceStatus;
import his.railway.rts.model.JsonResponseBody;
import his.railway.rts.service.RailwayService;

public class ArduinoReaderListener implements SerialPortEventListener {

	private SimpMessagingTemplate template;
	private RailwayService railwayService;
	public String jobName;

	/**
	 * A BufferedReader which will be fed by a InputStreamReader converting the
	 * bytes into characters making the displayed results codepage independent
	 */
	private BufferedReader input;

	public ArduinoReaderListener( //
			RailwayService railwayService, //
			SimpMessagingTemplate template //
	) {
		this.railwayService = railwayService;
		this.template = template;
	}

	public void setBufferedReader(BufferedReader input) {
		this.input = input;
	}

	public void send(Object temp) {
		template.convertAndSend("/railway/status", temp);
	}

	/**
	 * Handle an event on the serial port. Read the data and print it.
	 */
	public synchronized void serialEvent(SerialPortEvent event) {

		if (event.getEventType() == SerialPortEvent.DATA_AVAILABLE) {
			try {
				String inputLine = input.readLine();
				System.out.println(inputLine);
				// this switch to handle the event
				switch (inputLine) {
				case "":

					break;
				default:
					JsonResponseBody response = new JsonResponseBody();
					response.setResult(inputLine);
					response.setStatus(HttpResponceStatus.SUCCESS);
					this.send(response);
					break;
				}
			} catch (Exception e) {
				System.err.println(e.toString());
			}
		}
		// Ignore all the other eventTypes, but you should consider the other ones.
	}

}
