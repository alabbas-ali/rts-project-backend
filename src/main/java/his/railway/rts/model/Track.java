package his.railway.rts.model;

import javax.validation.constraints.NotNull;

public class Track {
	
	@NotNull(message = "Track source can't empty!")
	private String source;
	
	@NotNull(message = "Track target can't empty!")
	private String target;
	
	@NotNull(message = "Track status can't empty!")
	private TrackStatus status;
	
	public Track() {
		
	}
	
	public Track(String source, String target, TrackStatus status) {
		super();
		this.source = source;
		this.target = target;
		this.status = status;
	}

	public String getSource() {
		return source;
	}

	public void setSource(String source) {
		this.source = source;
	}

	public String getTarget() {
		return target;
	}

	public void setTarget(String target) {
		this.target = target;
	}

	public TrackStatus getStatus() {
		return status;
	}

	public void setStatus(TrackStatus status) {
		this.status = status;
	}
	
	@Override
	public int hashCode() {
		int result = 17;
		result = 31 * result + this.source.hashCode();
		result = 31 * result + this.target.hashCode();
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (obj == this) return true;
		if (!(obj instanceof Track)) {
            return false;
        }
		Track n = (Track) obj;
		return n.getSource().equals(this.source) &&
				n.getTarget().equals(this.target);
	}

	@Override
	public String toString() {
		return "{ source: " + this.source  + 
				", target: " + this.target + 
				", status: " + this.status + 
				"}";
	}
}
