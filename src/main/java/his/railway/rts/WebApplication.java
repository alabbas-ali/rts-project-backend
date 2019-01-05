package his.railway.rts;

import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.EnableAsync;

import his.railway.rts.listener.ArduinoReaderListener;
import his.railway.rts.service.ArduinoReadeWriteService;
import his.railway.rts.service.RailwayService;

@SpringBootApplication
@Configuration
@EnableAutoConfiguration
@ComponentScan
@EnableAsync
public class WebApplication extends SpringBootServletInitializer {

	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
		return application.sources(WebApplication.class);
	}

	public static void main(String[] args) throws Exception {
		SpringApplication.run(WebApplication.class, args);
	}

	@Bean
	@Scope(value = ConfigurableBeanFactory.SCOPE_SINGLETON)
	public RailwayService getAccountService() {
		RailwayService railwayService = new RailwayService();
		try {
			railwayService.load();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} 
		return railwayService;
	}
	
	@Bean
	@Scope(value = ConfigurableBeanFactory.SCOPE_SINGLETON)
	public ArduinoReadeWriteService getArduinoReadeWriteService(
		RailwayService railwayService,
		SimpMessagingTemplate template	
	) {
		ArduinoReaderListener listener = new ArduinoReaderListener(railwayService, template);
		ArduinoReadeWriteService arduino = new ArduinoReadeWriteService(listener);
		arduino.initialize();
		return arduino;
	}

}
