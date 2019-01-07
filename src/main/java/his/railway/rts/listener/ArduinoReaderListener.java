package his.railway.rts.listener;

import org.springframework.messaging.simp.SimpMessagingTemplate;

import his.railway.rts.model.HttpResponceStatus;
import his.railway.rts.model.JsonResponseBody;
import his.railway.rts.service.RailwayService;

public class ArduinoReaderListener {

	private SimpMessagingTemplate template;
	private RailwayService railwayService;

	public ArduinoReaderListener( //
			RailwayService railwayService, //
			SimpMessagingTemplate template //
	) {
		this.railwayService = railwayService;
		this.template = template;
	}

	public void send(String message) {
		// this switch to handle the event
		switch (message) {
		case "":
			template.convertAndSend("/railway/status", railwayService.changeRandomLineState());
			break;
		default:
			JsonResponseBody response = new JsonResponseBody();
			response.setResult(message);
			response.setStatus(HttpResponceStatus.SUCCESS);
			template.convertAndSend("/railway/status", response);
			break;
		}
	}
}
