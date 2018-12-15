package his.railway.rts.controllers;

import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class AboutController {

	@RequestMapping("/about")
	public String index(Map<String, Object> model) {
		return "about";
	}

}
