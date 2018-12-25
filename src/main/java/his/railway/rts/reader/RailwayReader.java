package his.railway.rts.reader;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;

import com.fasterxml.jackson.databind.ObjectMapper;

import his.railway.rts.model.Railway;

public class RailwayReader {
	
	public Railway read(URL url) throws IOException, URISyntaxException {
		
		byte[] jsonData = Files.readAllBytes(Paths.get(url.toURI()));
		
		//create ObjectMapper instance
		ObjectMapper objectMapper = new ObjectMapper();
		
		//convert json string to object
		Railway reailway = objectMapper.readValue(jsonData, Railway.class);
		
		System.out.println("Reailway Object\n" + reailway);
		
		return reailway;
	}

}
