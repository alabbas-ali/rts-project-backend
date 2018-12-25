package his.railway.rts.controllers;

import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import his.railway.rts.model.HttpResponceStatus;
import his.railway.rts.model.JsonResponseBody;
import his.railway.rts.reader.RailwayReader;

@Controller
public class IndexController {

	@RequestMapping("/")
	public String index(Map<String, Object> model) {
		return "index";
	}
	
	@ResponseBody
	@RequestMapping(value = "/get", method= RequestMethod.GET)
	public JsonResponseBody getRailway() {
		
		JsonResponseBody response = new JsonResponseBody();
		
		RailwayReader reader= new RailwayReader();
		ClassLoader classLoader = getClass().getClassLoader();
		try {
			response.setResult(reader.read(classLoader.getResource("input/railway.json")));
			response.setStatus(HttpResponceStatus.SUCCESS);
		} catch (Exception e) {
			response.setResult(e.getMessage());
			response.setStatus(HttpResponceStatus.FAIL);
			e.printStackTrace();
		}
		return response;
	}
}
