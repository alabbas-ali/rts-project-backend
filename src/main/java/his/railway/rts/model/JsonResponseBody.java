package his.railway.rts.model;

public class JsonResponseBody {
	
	private String status = null;
	private Object result = null;

	public Object getResult() {
		return result;
	}

	public void setResult(Object result) {
		this.result = result;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

}
