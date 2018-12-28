package his.railway.rts.controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import his.railway.rts.job.JobRunner;
import his.railway.rts.model.HttpResponceStatus;
import his.railway.rts.model.JsonResponseBody;
import his.railway.rts.service.RailwayService;

@Controller
public class IndexController {

	@Autowired
	private RailwayService railwayService;

	@Autowired
	private SimpMessagingTemplate template;

	@RequestMapping("/")
	public String index(Map<String, Object> model) {
		return "index";
	}

	@RequestMapping(value = "/railway/status", method = RequestMethod.GET)
	@ResponseBody
	@SendTo("/railway/status")
	public JsonResponseBody fetchStatus() {
		JobRunner job = new JobRunner(railwayService, template);
		Thread thread = new Thread(job);
		thread.start();
		JsonResponseBody response = new JsonResponseBody();
		response.setResult(railwayService.getRailway());
		response.setStatus(HttpResponceStatus.SUCCESS);
		return response;
	}

}
