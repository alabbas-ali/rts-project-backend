package his.railway.rts.model;

import javax.validation.constraints.NotNull;
import org.springframework.data.annotation.Id;

public class Node {
	
	@Id
	protected String id;
	
	@NotNull(message = "Node Type can't empty!")
	private NodeType type;
	
	private String name;
	
	public Node() { }
	
	public Node(String id, NodeType type, String name) {
		super();
		this.id = id;
		this.type = type;
		this.name = name;
	}
	
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public NodeType getType() {
		return type;
	}
	public void setType(NodeType type) {
		this.type = type;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
}

