package his.railway.rts.model;

import java.util.Iterator;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonGetter;

public class Railway {
	
	private Set<Node> nodes;
	
	private Set<Track> links;
	
	public Set<Node> getNodes() {
		return nodes;
	}
	
	public void setNodes(Set<Node> nodes) {
		this.nodes = nodes;
	}
	
	@JsonGetter(value = "links")
	public Set<Track> getLinks() {
		return links;
	}
	
	public void setLinks(Set<Track> links) {
		this.links = links;
	}
	
	@Override
	public String toString() {
		Iterator<Node> iter = nodes.iterator();
		String nodesS = ""; 
		String prefex = "";
		while (iter.hasNext()) {
			nodesS += prefex + iter.next().toString();
			prefex = ",";
		}
		
		Iterator<Track> iter1 = links.iterator();
		String tracksT = "";
		prefex = "";
		while (iter1.hasNext()) {
			tracksT += prefex + iter1.next().toString();
			prefex = ",";
		}
		
		return "{ nodes: [" + nodesS  + "]" +
				", links: [" + tracksT + "]" + 
				"}";
	}
	
}
