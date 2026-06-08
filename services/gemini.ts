import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Vocabulary, MasteryLevel, QuizQuestion, ChatMessage } from "../types";
import { getCachedAsset, setCachedAsset } from "./cache";

// Always use a named parameter for the API key from process.env.API_KEY.
// Exported to be used across the application for direct Gemini API access.
export const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

/**
 * Robustly parses JSON from AI responses, handling common issues like markdown backticks.
 */
export const safeJSONParse = (text: any, fallback: any = {}) => {
  try {
    if (!text || typeof text !== 'string') return fallback;
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse AI JSON:", e, "Raw text:", text);
    return fallback;
  }
};

// Global queue to ensure image requests happen one at a time
let imageRequestQueue: Promise<any> = Promise.resolve();

export async function generateContentWithRetry(params: any) {
  return withRetry(() => getAI().models.generateContent(params));
}

export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 5, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error?.message?.toLowerCase() || '';
    const isQuotaError = error?.status === 429 || 
                         error?.status === 503 ||
                         error?.status === 504 ||
                         errorMsg.includes('429') || 
                         errorMsg.includes('503') ||
                         errorMsg.includes('504') ||
                         errorMsg.includes('resource_exhausted') ||
                         errorMsg.includes('unavailable') ||
                         errorMsg.includes('quota') ||
                         errorMsg.includes('overloaded');
    
    if (maxRetries > 0 && isQuotaError) {
      // Exponential backoff
      const nextDelay = delay * 2;
      console.warn(`Gemini service issue (${errorMsg}). Retrying in ${Math.round(delay/1000)}s... (${maxRetries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, maxRetries - 1, nextDelay);
    }
    throw error;
  }
}

export const generateWordIllustration = async (word: string, customPrompt?: string): Promise<string | undefined> => {
  const cacheKey = `img_${word}_${customPrompt || 'default'}`;
  const cached = await getCachedAsset(cacheKey);
  if (cached) return cached;

  // Wrap the entire logic in the sequential queue to prevent overlapping image requests
  const result = await (imageRequestQueue = imageRequestQueue.then(async () => {
    const ai = getAI();
    const colorKeywords = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'grey', 'black', 'white', 'أحمر', 'أزرق', 'أخضر', 'أصفر', 'برتقالي', 'بنفسجي', 'وردي', 'بني', 'رمادي', 'أسود', 'أبيض'];
    const isColor = colorKeywords.some(k => word.toLowerCase().includes(k.toLowerCase()));

    // Prompt optimized for "complete and centered" object
    const promptText = customPrompt || (isColor 
      ? `A clear, centered, bold black and white line art drawing of a paint bucket. The paint liquid inside is solid ${word}. Minimalist school icon style, thick clean black outlines, pure white background. The object must be fully visible and centered, NOT touching the edges of the image. NO text.`
      : `A complete, clear, minimalist black and white line art illustration of "${word}". Professional worksheet icon style, thick black outlines, pure white background. The object must be perfectly centered and stay entirely within the frame with a clear safety margin on all sides. NO shading, NO 3D, NO text.`);

    try {
      return await withRetry(async () => {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: promptText }],
          },
          config: {
            imageConfig: {
              aspectRatio: "1:1",
            },
          } as any,
        });
        
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const result = `data:image/png;base64,${part.inlineData.data}`;
            await setCachedAsset(cacheKey, result);
            return result;
          }
        }
        return undefined;
      }, 8, 10000); 
    } catch (e) {
      console.error("Image generation failed after all retries", e);
      return undefined;
    }
  }).catch(() => undefined));

  return result;
};

export const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise as string,
      mimeType: file.type
    },
  };
};

export const verifyLetterWorksheet = async (filePart: any, char: string, charName: string): Promise<any> => {
  const ai = getAI();
  const schema = {
    type: Type.OBJECT,
    properties: {
      feedback_ar: { type: Type.STRING },
      feedback_en: { type: Type.STRING },
      score: { type: Type.NUMBER },
      passed: { type: Type.BOOLEAN },
      observations: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["feedback_ar", "feedback_en", "score", "passed"]
  };

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          filePart,
          { text: `Check the student's handwriting for the Arabic letter "${char}" (${charName}). Verify: 1. Letter shapes (isolated, initial, medial, final). 2. Diacritics (Fatha, Damma, Kasra, Sukun). 3. Long Vowels. 4. Tanween. Provide encouraging feedback in Arabic and English. If they wrote correctly, set passed to true. Return JSON.` }
        ]
      },
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return safeJSONParse(response.text, {});
  });
};

export const diacritizeText = async (text: string): Promise<string> => {
  const ai = getAI();
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Add full Arabic diacritics (Tashkeel) to the following text. 
      CRITICAL RULES:
      1. DO NOT add any spaces between letters.
      2. DO NOT change the words.
      3. Return ONLY the diacritized text.
      
      Text: "${text}"`,
    });
    return response.text || text;
  });
};

export const getWordDeepAnalysis = async (word: string): Promise<any> => {
  const ai = getAI();
  const schema = {
    type: Type.OBJECT,
    properties: {
      root_with_vowels: { type: Type.STRING },
      root_letters: { type: Type.ARRAY, items: { type: Type.STRING } },
      weight: { type: Type.STRING },
      synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
      antonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
      word_family: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { word: { type: Type.STRING }, meaning: { type: Type.STRING }, weight: { type: Type.STRING } },
          required: ["word", "meaning", "weight"]
        }
      },
      context_examples: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { ar: { type: Type.STRING }, en: { type: Type.STRING }, type: { type: Type.STRING } },
          required: ["ar", "en", "type"]
        }
      }
    },
    required: ["root_with_vowels", "root_letters", "weight", "synonyms", "word_family", "context_examples"]
  };
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Deep analysis for: "${word}". CRITICAL: Return the root letters in "root_letters" in the correct sequential order as they appear in the word (index 0 is the first letter of the root).`,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return safeJSONParse(response.text, {});
  });
};

export const generateGrammarLesson = async (topic: string, vocabWords: string[], masteredSkills: string[]): Promise<ChatMessage> => {
  const ai = getAI();
  const schema = {
    type: Type.OBJECT,
    properties: { 
      content_ar: { type: Type.STRING }, 
      content_en: { type: Type.STRING }, 
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      infographic: {
        type: Type.OBJECT,
        properties: {
          title_ar: { type: Type.STRING },
          title_en: { type: Type.STRING },
          main_concept_ar: { type: Type.STRING },
          main_concept_en: { type: Type.STRING },
          concept_items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { word_ar: { type: Type.STRING }, word_en: { type: Type.STRING }, example_ar: { type: Type.STRING }, example_en: { type: Type.STRING }, color: { type: Type.STRING }, icon: { type: Type.STRING } },
              required: ["word_ar", "word_en", "example_ar", "example_en", "color", "icon"]
            }
          },
          positional_examples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { scenario_ar: { type: Type.STRING }, scenario_en: { type: Type.STRING }, example_ar: { type: Type.STRING }, example_en: { type: Type.STRING } },
              required: ["scenario_ar", "scenario_en", "example_ar", "example_en"]
            }
          },
          notes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { ar: { type: Type.STRING }, en: { type: Type.STRING } }, required: ["ar", "en"] } },
          parsing_guide: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { role_ar: { type: Type.STRING }, role_en: { type: Type.STRING }, state_ar: { type: Type.STRING }, state_en: { type: Type.STRING }, sign_ar: { type: Type.STRING }, sign_en: { type: Type.STRING } }, required: ["role_ar", "role_en", "state_ar", "state_en", "sign_ar", "sign_en"] } }
        },
        required: ["title_ar", "title_en", "main_concept_ar", "main_concept_en", "concept_items", "positional_examples", "notes", "parsing_guide"]
      }
    },
    required: ["content_ar", "content_en", "options", "infographic"]
  };
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Teach Arabic grammar topic: "${topic}". Bilingual.`,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return safeJSONParse(response.text, {});
  });
};

export const generateAssistantQuiz = async (topic: string, vocabWords: string[]): Promise<any[]> => {
  const ai = getAI();
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: { content_ar: { type: Type.STRING }, content_en: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswer: { type: Type.STRING } },
      required: ["content_ar", "content_en", "options", "correctAnswer"]
    }
  };
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `10 MCQ for topic: "${topic}". Bilingual.`,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return safeJSONParse(response.text, []);
  });
};

export const generateSpeech = async (text: string, lang: 'ar' | 'en'): Promise<Uint8Array | undefined> => {
  if (!text || text.trim().length === 0) return undefined;
  
  const cacheKey = `tts_${lang}_${text.trim()}`;
  const cached = await getCachedAsset(cacheKey);
  if (cached) return cached;

  const ai = getAI();
  const voiceName = lang === 'ar' ? 'Kore' : 'Zephyr';
  try {
    return await withRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } }
        }
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const decoded = decodeBase64(base64Audio);
        await setCachedAsset(cacheKey, decoded);
        return decoded;
      }
      return undefined;
    }, 3, 2000);
  } catch (error: any) { return undefined; }
};

let globalAudioContext: AudioContext | null = null;

/**
 * Centrally managed speech function that handles:
 * 1. Diacritization for Arabic (improves quality significantly)
 * 2. Gemini TTS with caching
 * 3. High-quality browser fallback (Google/Natural voices)
 */
export const speak = async (text: string, lang: 'ar' | 'en' = 'ar'): Promise<void> => {
  if (!text) return;

  let textToSpeak = text;
  
  // For Arabic, diacritics are CRITICAL for natural sound in AI TTS
  if (lang === 'ar' && !/[\u064B-\u0652]/.test(text)) {
    try {
      // Small texts diacritize quickly. This adds a call but improves quality vastly.
      if (text.length < 50) {
        textToSpeak = await diacritizeText(text);
      }
    } catch (e) {
      console.warn("Diacritization failed for TTS, using raw text");
    }
  }

  // 1. Try Gemini TTS (High-quality AI voice: Kore for Arabic, Zephyr for English)
  try {
    const audioBytes = await generateSpeech(textToSpeak, lang);
    if (audioBytes) {
      if (!globalAudioContext) {
        globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = globalAudioContext;
      if (ctx.state === 'suspended') await ctx.resume();
      
      const buffer = await decodeAudioData(audioBytes, ctx);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
      return;
    }
  } catch (e) {
    console.warn("Gemini TTS failed, falling back to browser", e);
  }

  // 2. Browser Fallback with specific voice priority (Google/Natural)
  // This addresses the "robotic man" issue by picking better system voices.
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    
    // Ensure voices are loaded
    let voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      await new Promise<void>(resolve => {
        const handler = () => {
          window.speechSynthesis.removeEventListener('voiceschanged', handler);
          resolve();
        };
        window.speechSynthesis.addEventListener('voiceschanged', handler);
        // Timeout just in case
        setTimeout(resolve, 1000);
      });
      voices = window.speechSynthesis.getVoices();
    }

    const langPrefix = lang === 'ar' ? 'ar' : 'en';
    
    // Priority: Google -> Natural/Premium -> Female -> Any from the lang
    const bestVoice = voices.find(v => v.lang.startsWith(langPrefix) && v.name.includes('Google')) ||
                      voices.find(v => v.lang.startsWith(langPrefix) && (v.name.includes('Natural') || v.name.includes('Premium'))) ||
                      voices.find(v => v.lang.startsWith(langPrefix) && v.name.toLowerCase().includes('female')) ||
                      voices.find(v => v.lang.startsWith(langPrefix));
    
    if (bestVoice) {
      utterance.voice = bestVoice;
      // Many Arabic high-quality voices are female, which users prefer
    }
    
    utterance.rate = 0.9; // Slightly slower for clarity
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error("Speech fallback failed", e);
  }
};

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
  return bytes;
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const bufferArray = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  const dataInt16 = new Int16Array(bufferArray);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) { channelData[i] = dataInt16[i] / 32768.0; }
  return buffer;
}

export const translateAndExpand = async (word: string, isFromArabic: boolean, otherLang: string = "English"): Promise<Partial<Vocabulary>> => {
  const ai = getAI();
  const vocabSchema = {
    type: Type.OBJECT,
    properties: {
      original_word: { type: Type.STRING },
      translation: { type: Type.STRING },
      other_lang_definition: { type: Type.STRING },
      arabic_definition: { type: Type.STRING },
      analysis: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          details_ar: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, sub_category: { type: Type.STRING }, root: { type: Type.STRING }, weight: { type: Type.STRING }, rule: { type: Type.STRING }, example: { type: Type.STRING } }, required: ["category", "sub_category", "rule", "example"] },
          details_other: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, sub_category: { type: Type.STRING }, root: { type: Type.STRING }, weight: { type: Type.STRING }, rule: { type: Type.STRING }, example: { type: Type.STRING } }, required: ["category", "sub_category", "rule", "example"] }
        },
        required: ["type", "details_ar", "details_other"]
      }
    },
    required: ["original_word", "translation", "other_lang_definition", "arabic_definition", "analysis"]
  };
  return withRetry(async () => {
    const source = isFromArabic ? "Arabic" : otherLang;
    const target = isFromArabic ? otherLang : "Arabic";
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze and translate the word/phrase "${word}" from ${source} to ${target}. 
      Provide a deep linguistic analysis. 
      The "other_lang_definition" and "details_other" should be in ${otherLang}.
      The "arabic_definition" and "details_ar" should be in Arabic.`,
      config: { responseMimeType: "application/json", responseSchema: vocabSchema }
    });
    const data = safeJSONParse(response.text, {});
    // Map back to Vocabulary type for compatibility
    return { 
      ...data, 
      english_definition: data.other_lang_definition,
      analysis: {
        ...data.analysis,
        details_en: data.analysis.details_other
      },
      id: crypto.randomUUID(), 
      mastery_level: MasteryLevel.NEW 
    };
  });
};

export const generateThemedVocabulary = async (topic: string): Promise<Partial<Vocabulary>[]> => {
  const ai = getAI();
  const vocabSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        original_word: { type: Type.STRING },
        translation: { type: Type.STRING },
        english_definition: { type: Type.STRING },
        arabic_definition: { type: Type.STRING },
        analysis: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            details_ar: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, sub_category: { type: Type.STRING }, root: { type: Type.STRING }, weight: { type: Type.STRING }, rule: { type: Type.STRING }, example: { type: Type.STRING } }, required: ["category", "sub_category", "rule", "example"] },
            details_en: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, sub_category: { type: Type.STRING }, root: { type: Type.STRING }, weight: { type: Type.STRING }, rule: { type: Type.STRING }, example: { type: Type.STRING } }, required: ["category", "sub_category", "rule", "example"] }
          },
          required: ["type", "details_ar", "details_en"]
        }
      },
      required: ["original_word", "translation", "english_definition", "arabic_definition", "analysis"]
    }
  };
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 10 common Arabic words related to the topic: "${topic}". For each word provide its english translation, definitions, and linguistic analysis.`,
      config: { responseMimeType: "application/json", responseSchema: vocabSchema }
    });
    const data = safeJSONParse(response.text, []);
    return data.map((v: any) => ({ ...v, id: crypto.randomUUID(), mastery_level: MasteryLevel.NEW, last_reviewed: new Date().toISOString(), review_count: 0, next_review: new Date().toISOString() }));
  });
};

export const generatePracticeQuestions = async (vocab: Vocabulary): Promise<QuizQuestion[]> => {
  const ai = getAI();
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: { id: { type: Type.STRING }, type: { type: Type.STRING }, question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswer: { type: Type.STRING }, explanation: { type: Type.STRING }, hint: { type: Type.STRING } },
      required: ["id", "type", "question", "options", "correctAnswer", "explanation", "hint"]
    }
  };
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `3 practice questions for: "${vocab.original_word}".`,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return safeJSONParse(response.text, []);
  });
};

export const extractKeywordsFromTranscript = async (transcript: string): Promise<any[]> => {
  const ai = getAI();
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: { word: { type: Type.STRING }, translation: { type: Type.STRING }, definition: { type: Type.STRING } },
      required: ["word", "translation", "definition"]
    }
  };
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract 3 key Arabic words from: "${transcript}".`,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return safeJSONParse(response.text, []);
  });
};

export const askAIAboutText = async (text: string, question: string): Promise<string> => {
  const ai = getAI();
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on this text: "${text}", answer this: "${question}". Be extremely direct, concise, and answer in the same language as the question. No introductory phrases.`,
    });
    return response.text || "";
  });
};

export const generateListeningExercise = async (level: string, topic: string, lang: string): Promise<any> => {
  const ai = getAI();
  const schema = {
    type: Type.OBJECT,
    properties: {
      transcript: { type: Type.STRING },
      translation: { type: Type.STRING },
      wordMap: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            meaningEn: { type: Type.STRING },
            meaningAr: { type: Type.STRING }
          },
          required: ["word", "meaningEn", "meaningAr"]
        }
      },
      quiz: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswer: { type: Type.STRING }, explanation: { type: Type.STRING } },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    },
    required: ["transcript", "translation", "quiz", "wordMap"]
  };
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create a listening exercise. Level: ${level}, Topic: ${topic}. 
      Include a "wordMap" which is an array of objects mapping EVERY unique Arabic word in the transcript to its English meaning (meaningEn) and a simple Arabic explanation/synonym (meaningAr).`,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return safeJSONParse(response.text, {});
  });
};

export const evaluateCallIn = async (audioBase64: string, transcript: string): Promise<any> => {
  const ai = getAI();
  const schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.NUMBER, description: "Pronunciation accuracy score from 0 to 100" },
      feedbackAr: { type: Type.STRING, description: "Feedback in Arabic from the radio host" },
      feedbackEn: { type: Type.STRING, description: "Feedback in English from the radio host" },
      corrections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            tipAr: { type: Type.STRING },
            tipEn: { type: Type.STRING }
          },
          required: ["word", "tipAr", "tipEn"]
        }
      }
    },
    required: ["score", "feedbackAr", "feedbackEn", "corrections"]
  };

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            mimeType: "audio/webm",
            data: audioBase64
          }
        },
        {
          text: `Evaluate the pronunciation of this Arabic audio recording. The user was trying to repeat or comment on this transcript: "${transcript}". 
          Provide a score, feedback from a friendly radio host perspective, and specific word corrections.`
        }
      ],
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return safeJSONParse(response.text, {});
  });
};

export const generateSessionInsights = async (history: any[], topic: string): Promise<any> => {
  const ai = getAI();
  const schema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING },
      key_vocabulary: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { word: { type: Type.STRING }, translation: { type: Type.STRING } }, required: ["word", "translation"] } },
      corrections: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { original: { type: Type.STRING }, correction: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ["original", "correction", "explanation"] } },
      tutor_tip_ar: { type: Type.STRING },
      tutor_tip_en: { type: Type.STRING }
    },
    required: ["summary", "key_vocabulary", "tutor_tip_ar", "tutor_tip_en"]
  };
  return withRetry(async () => {
    const historyText = history.map(h => `${h.role === 'user' ? 'Learner' : 'Tutor'}: ${h.text}`).join('\n');
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this conversation session about ${topic}.
      
      Conversation History:
      ${historyText}
      
      Provide a summary, extract key vocabulary (with translations), and identify any corrections needed for the learner's Arabic.`,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return safeJSONParse(response.text, {});
  });
};

export const checkWriting = async (text: string, level: string, filePart?: any): Promise<any> => {
  const ai = getAI();
  const schema = {
    type: Type.OBJECT,
    properties: {
      extracted_text: { type: Type.STRING },
      overall_feedback_ar: { type: Type.STRING },
      overall_feedback_en: { type: Type.STRING },
      score: { type: Type.NUMBER },
      corrections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { original: { type: Type.STRING }, correction: { type: Type.STRING }, explanation_ar: { type: Type.STRING }, explanation_en: { type: Type.STRING } },
          required: ["original", "correction", "explanation_ar"]
        }
      }
    },
    required: ["overall_feedback_ar", "overall_feedback_en", "score", "corrections"]
  };
  return withRetry(async () => {
    const parts: any[] = [{ text: `Check this Arabic text (Level: ${level}).` }];
    if (filePart) parts.unshift(filePart);
    if (text) parts.push({ text: `Text provided: "${text}"` });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return safeJSONParse(response.text, {});
  });
};

export const parseArabicSentence = async (sentence: string): Promise<string> => {
  const ai = getAI();
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `بصفتك خبيراً في علوم اللغة العربية والنحو والصرف، قم بإعراب الجملة التالية إعراباً تفصيلياً دقيقاً ومنظماً: "${sentence}".
      
      المطلوب:
      1. ذكر نوع الجملة (اسمية أم فعلية).
      2. إعراب كل كلمة بالتفصيل (الموقع الإعرابي، الحالة، العلامة).
      3. توضيح أي قواعد نحوية هامة متعلقة بالجملة.
      4. في النهاية، أضف قسماً بعنوان "English Explanation" يحتوي على ترجمة الجملة وشرح مبسط للإعراب باللغة الإنجليزية للمتعلمين غير الناطقين بالعربية.
      
      استخدم لغة أكاديمية رصينة وواضحة في نفس الوقت، ونظم الإجابة باستخدام نقاط واضحة.`,
    });
    return response.text || "عذراً، لم أتمكن من إعراب هذه الجملة.";
  });
};

export const generateWritingPrompt = async (level: string, topic: string): Promise<any> => {
  const ai = getAI();
  const schema = {
    type: Type.OBJECT,
    properties: {
      promptAr: { type: Type.STRING },
      promptEn: { type: Type.STRING },
      keywords: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { ar: { type: Type.STRING }, en: { type: Type.STRING } }, required: ["ar", "en"] } }
    },
    required: ["promptAr", "promptEn", "keywords"]
  };
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create writing task for Level: ${level}, Topic: ${topic}.`,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return safeJSONParse(response.text, {});
  });
};

export const evaluatePronunciation = async (audioBase64: string, targetText: string, dialect: string): Promise<any> => {
  const ai = getAI();
  const schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.NUMBER },
      feedback_ar: { type: Type.STRING },
      feedback_en: { type: Type.STRING },
      accuracy_details: { type: Type.STRING },
      word_accuracy: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            accuracy: { type: Type.NUMBER }
          },
          required: ["word", "accuracy"]
        }
      }
    },
    required: ["score", "feedback_ar", "feedback_en", "word_accuracy"]
  };

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: audioBase64,
              mimeType: "audio/webm" 
            }
          },
          { text: `Compare this audio recording of a student saying "${targetText}" in the ${dialect} dialect. Evaluate the pronunciation accuracy, intonation, and clarity. Provide a score from 0 to 100 and encouraging feedback in both Arabic and English. Be specific about any mispronounced letters. Also, provide a list of words from the target text with their accuracy percentage (0-100).` }
        ]
      },
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return safeJSONParse(response.text, {});
  });
};

export const generateReadingText = async (type: string, level: string = "intermediate"): Promise<string> => {
  const ai = getAI();
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a high-quality ${type} in Arabic suitable for a ${level} level student. 
      The content should be engaging, educational, and use natural language. 
      Return ONLY the text of the ${type}.`,
    });
    return response.text || "";
  });
};

export const generateStory = async (topic: string = "general"): Promise<string> => {
  const ai = getAI();
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a short, engaging story in Arabic about "${topic}". The story should be suitable for language learners, with clear vocabulary and a meaningful message. Return ONLY the story text.`,
    });
    return response.text || "";
  });
};

export const fetchDailyNews = async (): Promise<string> => {
  const ai = getAI();
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a summary of today's top news in Arabic. Focus on positive or educational topics. The summary should be written in a way that is easy for Arabic learners to read. Return ONLY the news summary.`,
    });
    return response.text || "";
  });
};

export const extractTextFromImage = async (file: File): Promise<string> => {
  const ai = getAI();
  const filePart = await fileToGenerativePart(file);
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          filePart,
          { text: "Extract all the Arabic text from this image. Return ONLY the extracted text, maintaining the original structure as much as possible." }
        ]
      }
    });
    return response.text || "";
  });
};

export const generateWorksheet = async (topic: string, level: string, type: 'grammar' | 'reading' | 'vocabulary' | 'writing'): Promise<any> => {
  const ai = getAI();
  const schema = {
    type: Type.OBJECT,
    properties: {
      title_ar: { type: Type.STRING },
      content_ar: { type: Type.STRING },
      content_en: { type: Type.STRING },
      vocabulary: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            meaning_ar: { type: Type.STRING, description: "A single Arabic word representing the meaning" },
            meaning_en: { type: Type.STRING, description: "The English translation of the word" }
          },
          required: ["word", "meaning_ar", "meaning_en"]
        }
      },
      sections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            skill_ar: { type: Type.STRING },
            skill_en: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["mcq", "fill_blank", "true_false", "open"] },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answer: { type: Type.STRING }
                },
                required: ["text", "type"]
              }
            }
          },
          required: ["skill_ar", "skill_en", "questions"]
        }
      }
    },
    required: ["title_ar", "content_ar", "content_en", "vocabulary", "sections"]
  };

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create a professional Arabic worksheet for the topic: "${topic}". 
      Level: ${level}. 
      
      1. Provide a title (title_ar) that is ONLY the topic name. Do NOT include the word "ورقة عمل" or "Worksheet" in the title.
      2. Provide an educational text (content_ar) related to the topic with its English translation (content_en). The text should be engaging and suitable for the level.
      3. Provide a list of 4-6 key vocabulary words (word). For each word, provide:
         - meaning_ar: A single Arabic word that explains it.
         - meaning_en: The English translation of the word.
      4. The worksheet exercises MUST be divided into exactly 5 sections based on these skills:
         - أولاً: المفردات والدلالة (Vocabulary)
         - ثانياً: التراكيب والقواعد (Grammar)
         - ثالثاً: الفهم والتحليل (Comprehension)
         - رابعاً: التعبير والكتابة (Writing)
         - خامساً: مهارات التفكير (Critical Thinking)
      
      For each section, provide 1-2 high-quality exercises in Arabic.
      Do not include English translations for the questions.
      Return JSON following the schema.`,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const analyzeWorksheetImage = async (file: File): Promise<any> => {
  const ai = getAI();
  const filePart = await fileToGenerativePart(file);
  
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      sections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            section_title: { type: Type.STRING },
            instructions: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["mcq", "true_false", "fill_blank", "matching"] },
                  question_text: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correct_answer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "type", "question_text", "correct_answer"]
              }
            }
          },
          required: ["section_title", "questions"]
        }
      }
    },
    required: ["title", "sections"]
  };

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          filePart,
          { text: "Analyze this worksheet image and convert it into a structured interactive format. Group questions into logical sections (e.g., Vocabulary, Grammar, Comprehension). For each question, determine its type (MCQ, True/False, Fill in the blank, or Matching), identify the correct answers, and provide a brief explanation. Return JSON." }
        ]
      },
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return safeJSONParse(response.text, {});
  });
};

export const generateQuickExercise = async (context: string): Promise<any> => {
  const ai = getAI();
  const schema = {
    type: Type.OBJECT,
    properties: {
      question_ar: { type: Type.STRING },
      question_en: { type: Type.STRING },
      type: { type: Type.STRING, enum: ["fill_blank", "mcq", "true_false"] },
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      correctAnswer: { type: Type.STRING },
      explanation_ar: { type: Type.STRING },
      explanation_en: { type: Type.STRING }
    },
    required: ["question_ar", "question_en", "type", "correctAnswer"]
  };

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on this context: "${context}", generate a quick interactive exercise for a student. 
      The exercise should be a single question (MCQ, Fill in the blank, or True/False).
      Provide the question and explanation in both Arabic and English.
      Return JSON.`,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return safeJSONParse(response.text, {});
  });
};
