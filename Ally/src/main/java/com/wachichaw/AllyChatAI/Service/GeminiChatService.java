package com.wachichaw.AllyChatAI.Service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import com.google.auth.oauth2.GoogleCredentials;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.*;

import java.io.IOException;
import java.util.*;

import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

@Service
public class GeminiChatService {

    @Value("${google.project-id}")
    private String projectId;

    @Value("${google.model-id}")
    private String modelId;

    // Hardcoded System Prompt for consistency
    private static final String SYSTEM_PROMPT = 
        "You are Ally, a helpful legal AI assistant for the Philippines. " +
        "Answer strictly based on Philippine Law. " +
        "If the user asks about non-legal topics, politely steer them back to legal matters. " +
        "Keep your answers professional, concise, and helpful.";

    private final GoogleCredentials googleCredentials;
    private final List<ObjectNode> conversationHistory = new ArrayList<>();

    private final ObjectMapper mapper = new ObjectMapper();

    public GeminiChatService(GoogleCredentials googleCredentials) throws IOException {
        this.googleCredentials = googleCredentials
                .createScoped(List.of("https://www.googleapis.com/auth/cloud-platform"));
        this.googleCredentials.refreshIfExpired();
    }

    public String sendMessage(String prompt) {
        try {
            // 1. Add user message to history
            ObjectNode userNode = mapper.createObjectNode();
            userNode.put("role", "user");
            ArrayNode userParts = mapper.createArrayNode();
            userParts.addObject().put("text", prompt);
            userNode.set("parts", userParts);
            conversationHistory.add(userNode);

            // 2. Build request body
            ObjectNode requestBody = mapper.createObjectNode();

            // --- SYSTEM INSTRUCTION (Crucial for Persona Consistency) ---
            // This tells Vertex AI who the model is "supposed to be"
            ObjectNode systemInstruction = mapper.createObjectNode();
            ArrayNode systemParts = mapper.createArrayNode();
            systemParts.addObject().put("text", SYSTEM_PROMPT);
            systemInstruction.set("parts", systemParts);
            requestBody.set("systemInstruction", systemInstruction);
            // -----------------------------------------------------------

            // Add Conversation History
            ArrayNode contentsNode = mapper.createArrayNode();
            for (ObjectNode msg : conversationHistory) {
                contentsNode.add(msg);
            }
            requestBody.set("contents", contentsNode);

            // Generation Config
            ObjectNode genConfig = mapper.createObjectNode();
            genConfig.put("temperature", 0.3); // Low temp = more factual/conservative
            genConfig.put("maxOutputTokens", 1024);
            genConfig.put("topP", 0.8);
            genConfig.put("topK", 40);
            requestBody.set("generationConfig", genConfig);

            this.googleCredentials.refreshIfExpired();

            // 3. Prepare Auth Headers
            String token = googleCredentials.getAccessToken().getTokenValue();
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), headers);

            // 4. DYNAMIC URL GENERATION
            // Logic: Numeric ID = Fine-Tuned Endpoint. String ID = Base Model.
            String endpointUrl;
            
            if (modelId.matches("\\d+")) {
                // Numeric ID -> Vertex AI Endpoint (Fine-Tuned)
                System.out.println("🤖 Connecting to Vertex AI Endpoint: " + modelId);
                endpointUrl = String.format(
                    "https://us-central1-aiplatform.googleapis.com/v1/projects/%s/locations/us-central1/endpoints/%s:generateContent",
                    projectId, modelId
                );
            } else {
                // String ID -> Google Publisher Model (Base Model like gemini-1.5-flash)
                System.out.println("🤖 Connecting to Google Publisher Model: " + modelId);
                endpointUrl = String.format(
                    "https://us-central1-aiplatform.googleapis.com/v1/projects/%s/locations/us-central1/publishers/google/models/%s:generateContent",
                    projectId, modelId
                );
            }

            // 5. Send Request
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.postForEntity(endpointUrl, entity, String.class);

            // 6. Extract Response
            String modelResponseText = extractTextFromResponse(response.getBody());

            // 7. Add model response to history (so it remembers the context)
            ObjectNode modelNode = mapper.createObjectNode();
            modelNode.put("role", "model");
            ArrayNode modelParts = mapper.createArrayNode();
            modelParts.addObject().put("text", modelResponseText);
            modelNode.set("parts", modelParts);
            conversationHistory.add(modelNode);

            return modelResponseText;

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("❌ API Error: " + e.getMessage());
            return "Error connecting to Ally AI: " + e.getMessage();
        }
    }

    private String extractTextFromResponse(String json) {
        try {
            JsonNode root = mapper.readTree(json);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                // Vertex AI response structure
                return candidates.get(0).path("content").path("parts").get(0).path("text").asText();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return "No response text found.";
    }

    // Reset conversation history
    public void resetHistory() {
        conversationHistory.clear();
        System.out.println("🧹 Chat history cleared.");
    }
}