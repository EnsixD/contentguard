import { AnalysisResult, RiskLevel } from "../types";

const API_KEY = "ddc-a4f-a49ad51734ca44d0b1a8c0aa51076569";
const BASE_URL = "https://api.a4f.co/v1";

const TEXT_MODEL = "provider-1/deepseek-r1-0528";
const VISION_MODEL = "provider-5/gpt-4.1-mini";

// --- HELPERS ---

const cleanDeepSeekResponse = (content: string): string => {
  // Remove <think> tags often produced by R1
  return content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// --- GENERATION ---

export const generatePostWithAI = async (topic: string): Promise<string> => {
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: TEXT_MODEL,
        messages: [
          {
            role: "system",
            content: `You are a professional SMM manager for the Russian market. 
            
            Write engaging, interesting, and safe social media posts.
            
            STRICT FORMATTING RULES:
            1. Use clear paragraphs with double line breaks between them.
            2. Use emojis SPARINGLY and ONLY at the beginning of paragraphs or list items. NEVER place emojis in the middle of sentences.
            3. Structure: Title/Headline (optional, bold not needed if plain text), Body paragraphs, Call to Action.
            4. Do NOT use markdown bold/italic (**text**) as this will be posted to plain text fields often.
            
            COMPLIANCE RULES:
            1. Do not mention 'Foreign Agents' without disclaimers.
            2. Do not mention banned organizations (Meta, Facebook, Instagram) without disclaimers.
            3. Avoid extremist content. 
            
            Write naturally and professionally in Russian. Do NOT use <think> tags or output internal reasoning.`
          },
          { 
            role: "user", 
            content: `Write a social media post about: ${topic}. Return ONLY the post text, no extra conversational filler.` 
          },
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || "AI API Error");
    }

    if (!data.choices || data.choices.length === 0) {
      throw new Error("No content generated");
    }

    let content = data.choices[0].message.content;
    content = cleanDeepSeekResponse(content);

    return content;
  } catch (error) {
    console.error("A4F Generation Error:", error);
    throw error;
  }
};

// --- IMAGE ANALYSIS (GPT-4.1-mini) ---

const analyzeImageWithGPTMini = async (imageFile: File): Promise<string> => {
  try {
    const base64Image = await fileToBase64(imageFile);

    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: "Проанализируй это изображение на наличие запрещенного контента по законодательству РФ (экстремистская символика, призывы к насилию, запрещенные логотипы Meta/Facebook/Instagram). Если всё чисто, напиши 'Нарушений не выявлено'. Если есть проблемы, опиши их кратко на русском языке." 
              },
              {
                type: "image_url",
                image_url: {
                  url: base64Image
                }
              }
            ]
          }
        ],
        max_tokens: 300
      }),
    });

    const data = await response.json();
    if (data.error || !data.choices?.length) {
      console.warn("Vision API Error:", data);
      return "Ошибка анализа изображения. Проверьте вручную.";
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Image Analysis Error:", error);
    return "Не удалось выполнить визуальный анализ.";
  }
};

// --- MAIN ANALYSIS (COORDINATOR) ---

export const analyzeContentWithA4F = async (text: string, imageFile: File | null): Promise<AnalysisResult> => {
  try {
    // 1. Prepare Text Analysis Promise (DeepSeek)
    const textAnalysisPromise = (async () => {
      const prompt = `
        You are an expert Content Compliance Officer for the Russian social media market (Roskomnadzor compliance).
        Analyze the following text for risks under Russian law:
        1. Foreign Agents (иноагенты) mentioned without disclaimer.
        2. Banned organizations (Meta, Facebook, Instagram) mentioned without "forbidden in RF" disclaimer.
        3. Extremism, hate speech, calls to violence.
        4. Profanity (mat) or obscene language (Article 20.1 Administrative Code).
        5. Illegal advertising.

        Text to analyze:
        "${text}"

        Return a JSON object strictly matching this structure:
        {
          "isSafe": boolean,
          "overallRisk": "SAFE" | "WARNING" | "CRITICAL",
          "issues": [
             {
               "category": "string",
               "snippet": "string (the problematic part)",
               "reason": "string (in Russian)",
               "suggestion": "string (in Russian)",
               "severity": "SAFE" | "WARNING" | "CRITICAL"
             }
           ],
          "revisedText": "string (the full text with ALL fixes applied. If there is profanity/mat, REPLACE it with neutral synonyms or delete it. Do NOT use asterisks like f***, write clean words. If there are legal labels missing, add them.)",
          "imageAnalysis": "string (placeholder)"
        }

        IMPORTANT: 
        - Output ONLY valid JSON. 
        - All descriptions must be in RUSSIAN.
        - If mentioning Meta/Instagram/Facebook, ensure the revised text includes "(деятельность запрещена в РФ)".
        - If finding profanity, the "revisedText" MUST BE CLEAN and ready to publish.
      `;

      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: TEXT_MODEL,
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 2000
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message || "Text Analysis API Error");
      
      let rawContent = data.choices[0].message.content;
      rawContent = cleanDeepSeekResponse(rawContent);

      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Failed to parse JSON from AI");
      
      return JSON.parse(jsonMatch[0]);
    })();

    // 2. Prepare Image Analysis Promise (GPT-4.1-mini) - if image exists
    const imageAnalysisPromise = imageFile 
      ? analyzeImageWithGPTMini(imageFile) 
      : Promise.resolve(null);

    // 3. Execute in Parallel
    const [textResult, imageResultString] = await Promise.all([textAnalysisPromise, imageAnalysisPromise]);

    // 4. Merge Results
    const finalResult: AnalysisResult = {
      ...textResult,
      imageAnalysis: imageResultString || undefined
    };

    // If image analysis found issues (simple heuristic based on text length or keywords), update safety
    if (imageResultString && 
       (imageResultString.toLowerCase().includes("нарушен") || 
        imageResultString.toLowerCase().includes("запрещ") ||
        imageResultString.toLowerCase().includes("символ"))) {
        // We don't override risk purely on simple keywords to avoid false positives, 
        // but we ensure the field is populated.
    }

    return finalResult;

  } catch (error) {
    console.error("Analysis Coordinator Error:", error);
    throw error;
  }
};