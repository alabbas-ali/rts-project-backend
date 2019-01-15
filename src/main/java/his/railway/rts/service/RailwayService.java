package his.railway.rts.service;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Random;

import his.railway.rts.model.Railway;
import his.railway.rts.model.Track;
import his.railway.rts.model.TrackStatus;
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

	public Track changeRandomLineState() {
		int size = this.railway.getLinks().size();
		int item = new Random().nextInt(size);
		int i = 0;
		for (Track track : this.railway.getLinks()) {
			if (i == item) {
				// System.out.println(" The Random chosen Track is : " + track);
				track.setStatus(TrackStatus.randomTrackStatus());
				this.saveTrack(track);
				return track;
			}
			i++;
		}
		return null;
	}

	private void saveTrack(Track track) {
		if (!this.railway.getLinks().add(track)) {
			this.railway.getLinks().remove(track);
			this.railway.getLinks().add(track);
		}
	}

}
