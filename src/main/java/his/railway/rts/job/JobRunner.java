package his.railway.rts.job;

import org.springframework.messaging.simp.SimpMessagingTemplate;

import his.railway.rts.service.RailwayService;

public class JobRunner implements Runnable {

	private SimpMessagingTemplate template;
	private RailwayService railwayService;
	public String jobName;

	public JobRunner(
		RailwayService railwayService, 
		SimpMessagingTemplate template
	) {
		this.railwayService = railwayService;
		this.template = template;
	}

	public void send(Object temp) {
		template.convertAndSend("/railway/status", temp);
	}

	@Override
	public void run() {
		while (true) {
			this.send(railwayService.changeRandomLineState());
			try {
				Thread.sleep(7000);
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

		}
	}

}
