// Gemini Client Module
// Calls Google Gemini REST API via fetch() - no external SDK, CSP-compliant for Chrome extensions

// Try v1 first, fallback to v1beta if needed
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com';
const GEMINI_MODEL = 'gemini-3-flash-preview';

class GeminiClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this._initialized = !!apiKey;
    }


    async analyzeIntent(text) {
        const prompt = `Analyze the intent of this message in JSON format with fields: intent, confidence (0-100), conflictDetected (boolean), suggestion.

Message: "${text}"

Respond ONLY with JSON:`;

        try {
            const response = await this.callAPI(prompt);
            return this.parseJSON(response);
        } catch (error) {
            console.error('Intent analysis error:', error);
            return { error: 'Failed to analyze intent' };
        }
    }

    async calibrateText(text, culturalCode, hierarchy, emotional, urgency, directness) {
        const prompt = `You are a cross-cultural communication expert. Think step-by-step internally, but do NOT reveal your chain-of-thought. Use decision-first guidance: provide distinct options that help a human choose.

Few-shot examples:
Input: "Please send the report by Friday."
Output JSON:
{"versions":[{"text":"Could you send the report by Friday? I want to align on next steps.","label":"balance"},{"text":"Please provide the report by Friday. This supports our timeline.","label":"formal"},{"text":"Thanks for helping—could you send the report by Friday? It really helps.","label":"warm"}]}

Input: "We need to change the plan."
Output JSON:
{"versions":[{"text":"I recommend we adjust the plan so we can stay aligned.","label":"balance"},{"text":"We should revise the plan to maintain alignment and clarity.","label":"formal"},{"text":"Can we tweak the plan together so it feels right for everyone?","label":"warm"}]}

Rewrite this message for a ${culturalCode} audience with these parameters:
- Power Distance (Hierarchy): ${hierarchy}%
- Emotional Saturation: ${emotional}%
- Urgency Level: ${urgency}%
- Directness: ${directness}%

Generate THREE distinct versions as JSON with field "versions" containing array of 3 objects with "text" field each. Ensure the three outputs are not identical.

Original Message: "${text}"

Respond ONLY with JSON containing versions array:`;

        try {
            const response = await this.callAPI(prompt);
            return this.parseJSON(response);
        } catch (error) {
            console.error('Calibration error:', error);
            return { error: 'Failed to calibrate text' };
        }
    }

    /**
     * Slider-driven single-version calibration.
     * Returns ONE rewritten sentence that precisely reflects the four slider values.
     */
    async calibrateSingle(text, culturalCode, hierarchy, emotional, urgency, directness) {
        // Simplified prompt for faster response
        const prompt = `Rewrite this message for ${culturalCode} audience. Parameters: Hierarchy ${hierarchy}%, Emotional ${emotional}%, Urgency ${urgency}%, Directness ${directness}%.

Message: "${text}"

Respond ONLY with JSON: {"text":"rewritten message"}`;

        try {
            const response = await this.callAPI(prompt, {
                temperature: 0.7,
                maxOutputTokens: 500
            });
            return this.parseJSON(response);
        } catch (error) {
            console.error('Single calibration error:', error);
            return { error: 'Failed to calibrate text' };
        }
    }

    async generateExplanation(original, calibrated, culturalCode) {
        const prompt = `Explain why this message was modified for ${culturalCode} audience. Do NOT reveal chain-of-thought. Provide concise, actionable rationale bullets.

Original: "${original}"
Calibrated: "${calibrated}"

Provide clear, step-by-step reasoning in JSON with "reasoning" field:`;

        try {
            const response = await this.callAPI(prompt);
            return this.parseJSON(response);
        } catch (error) {
            console.error('Explanation error:', error);
            return { reasoning: 'Unable to generate explanation' };
        }
    }

    async generateIntentRationale(text, culturalCode, intentAnalysis, calibratedText, params) {
        const prompt = `You are a cross-cultural communication expert. Analyze the original message and explain the modifications made for ${culturalCode} audience.

Original Message: "${text}"
Calibrated Message: "${calibratedText || text}"
Cultural Parameters: Hierarchy ${params?.hierarchy || 50}%, Emotional ${params?.emotional || 50}%, Urgency ${params?.urgency || 50}%, Directness ${params?.directness || 50}%

Provide a detailed analysis in the following format:

**1. Original Intent:**
[Describe the primary intent and purpose of the original message]

**2. Modification Reasons:**
[List specific modifications made, each with:
- Category (e.g., Formality, Tone, Structure, Word Choice, Cultural Adaptation)
- Description (explain what changed and why)]

**3. Three-Dimensional Ratings:**
- Efficiency: [Score 1-10] - [Brief explanation]
- Politeness: [Score 1-10] - [Brief explanation]
- Clarity: [Score 1-10] - [Brief explanation]

Write in clear, professional language. Be specific about cultural considerations for ${culturalCode} audience.`;

        try {
            const response = await this.callAPI(prompt, {
                temperature: 0.7,
                maxOutputTokens: 800
            });
            return response.trim();
        } catch (error) {
            console.error('Intent rationale error:', error);
            return 'Unable to generate intent analysis.';
        }
    }

    async generateInnerMonologue(text, culturalCode, calibratedText, params) {
        const prompt = `You are a cross-cultural communication expert role-playing as a real person from ${culturalCode} culture. After reading this message, generate their authentic inner monologue reaction.

Original Message: "${text}"
Calibrated Message: "${calibratedText || text}"

Cultural Context: ${culturalCode} culture values hierarchy ${params?.hierarchy || 50}%, emotional expression ${params?.emotional || 50}%, urgency ${params?.urgency || 50}%, and directness ${params?.directness || 50}%.

Generate a vivid, authentic inner monologue (2-4 sentences) that sounds like a real human's thoughts - it can be:
- A complaint or criticism if the message is inappropriate
- Praise or appreciation if the message is well-crafted
- Confusion or misunderstanding if the message is unclear
- Any genuine emotional reaction

Make it feel like real human thoughts - use natural language, include emotions, and reflect cultural values. Write as if you're thinking to yourself, not speaking formally.

Example style: "Hmm, this person seems quite direct... I appreciate that they got straight to the point, but I wish they had acknowledged my position first. Still, the message is clear and I know what they need."

Respond with ONLY the inner monologue (no quotes, no labels, just the thoughts):`;

        try {
            const response = await this.callAPI(prompt, {
                temperature: 0.9,
                maxOutputTokens: 200
            });
            return response.trim();
        } catch (error) {
            console.error('Inner monologue error:', error);
            return 'Unable to generate inner monologue.';
        }
    }

    async callAPI(prompt, options = {}) {
        if (!this.apiKey) {
            throw new Error('❌ API Key not configured');
        }

        // Try v1 first, then fallback to v1beta
        const apiVersions = ['v1', 'v1beta'];
        let lastError = null;

        // Build request body with optional generation config for performance
        const requestBody = {
            contents: [{ parts: [{ text: prompt }] }]
        };
        
        // Add generation config if options provided (for faster responses)
        if (options.temperature !== undefined || options.maxOutputTokens !== undefined) {
            requestBody.generationConfig = {};
            if (options.temperature !== undefined) {
                requestBody.generationConfig.temperature = options.temperature;
            }
            if (options.maxOutputTokens !== undefined) {
                requestBody.generationConfig.maxOutputTokens = options.maxOutputTokens;
            }
        }

        for (const version of apiVersions) {
            try {
                const apiUrl = `${GEMINI_API_BASE}/${version}/models/${GEMINI_MODEL}:generateContent`;
                const res = await fetch(`${apiUrl}?key=${encodeURIComponent(this.apiKey)}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });

                const data = await res.json();

                if (!res.ok) {
                    const errMsg = data?.error?.message || res.statusText || 'Unknown error';
                    
                    // If 404 and we have another version to try, continue to next version
                    if (res.status === 404 && apiVersions.indexOf(version) < apiVersions.length - 1) {
                        console.log(`⚠️ API version ${version} returned 404, trying next version...`);
                        lastError = new Error(`API Error 404: Model not found in ${version}`);
                        continue;
                    }
                    
                    if (res.status === 404 || errMsg.includes('not found') || errMsg.includes('not supported')) {
                        throw new Error(`API Error 404: Model ${GEMINI_MODEL} not found in ${version}. Please check the Gemini API documentation or verify your API key has access to Gemini 3.`);
                    } else if (res.status === 401 || errMsg.includes('API_KEY_INVALID')) {
                        throw new Error('API Error 401: Invalid or expired API key. Please check your API key at https://ai.google.dev');
                    } else if (res.status === 403 || errMsg.includes('PERMISSION_DENIED')) {
                        throw new Error('API Error 403: Access forbidden. Check API permissions or enable Gemini API in Google Cloud Console.');
                    } else if (res.status === 429 || errMsg.includes('RESOURCE_EXHAUSTED')) {
                        throw new Error('API Error 429: Rate limited. Please wait a moment and try again.');
                    } else if (res.status === 400 || errMsg.includes('FAILED_PRECONDITION')) {
                        throw new Error('API Error 400: Invalid request. Check API key format or model availability.');
                    } else if (res.status >= 500) {
                        throw new Error('API Error 500: Google server error. Please try again later.');
                    } else {
                        throw new Error(`API Error: ${errMsg}`);
                    }
                }

                const candidate = data?.candidates?.[0];
                if (!candidate?.content?.parts) {
                    throw new Error('Empty response from Gemini API');
                }

                const text = candidate.content.parts.map(p => p.text || '').join('').trim();
                if (!text) {
                    throw new Error('Empty response from Gemini API');
                }

                console.log(`✅ Successfully used API version: ${version}`);
                return text;
            } catch (error) {
                // If this is the last version to try, throw the error
                if (apiVersions.indexOf(version) === apiVersions.length - 1) {
                    if (error.message.startsWith('API Error')) throw error;
                    console.error('❌ Gemini API error:', error);
                    throw new Error(`API Error: ${error.message}`);
                }
                // Otherwise, save error and try next version
                lastError = error;
            }
        }

        // If all versions failed, throw the last error
        if (lastError) {
            throw lastError;
        }
    }


    parseJSON(text) {
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return { raw: text };
        } catch (error) {
            console.error('JSON parse error:', error);
            return { raw: text };
        }
    }

    setApiKey(key) {
        this.apiKey = key;
        this._initialized = !!key;
    }

    isConfigured() {
        return !!this.apiKey && this._initialized;
    }

    /**
     * Test API connection with a simple request
     */
    async testConnection() {
        try {
            const testResponse = await this.callAPI('Respond with exactly: {"test": "ok"}');
            return { success: true, response: testResponse };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeminiClient;
}
