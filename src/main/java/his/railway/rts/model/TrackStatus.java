package his.railway.rts.model;

import java.util.Random;

public enum TrackStatus {
	RED,
	GREEN,
	ORANGE;
	
	private static final int SIZE = values().length;
	private static final Random RANDOM = new Random();

	public static TrackStatus randomTrackStatus()  {
	    return values()[RANDOM.nextInt(SIZE)];
	}
}
