package his.railway.rts.model;

import java.util.Set;

public class Railway {
	
	private Set<Node> nodes;
	private Set<Track> links;
	
	public Set<Node> getNodes() {
		return nodes;
	}
	
	public void setNodes(Set<Node> nodes) {
		this.nodes = nodes;
	}
	
	public Set<Track> getLinks() {
		return links;
	}
	
	public void setLinks(Set<Track> links) {
		this.links = links;
	}
	
}
