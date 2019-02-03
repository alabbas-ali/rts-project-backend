package his.railway.rts.service;

import java.io.IOException;
import java.net.URISyntaxException;

import his.railway.rts.model.Node;
import his.railway.rts.model.Railway;
import his.railway.rts.model.Track;
import his.railway.rts.reader.RailwayReader;

public class RailwayService {

	private Railway railway;
	
	RailwayReader reader;

	public void load() throws IOException, URISyntaxException {
		this.reader = new RailwayReader();
		ClassLoader classLoader = getClass().getClassLoader();
		railway = reader.read(classLoader.getResource("input/railway.json"));
	}

	public Railway getRailway() {
		return railway;
	}

	public Node interStation(int train,int station, int direction) {
		return null;
	}

	public Track interLine(int train, int from, int to, int direction) {
		// TODO Auto-generated method stub
		return null;
	}

	public Node changeSwitch(int train, int witch, int direction) {
		return null;
	}

}
