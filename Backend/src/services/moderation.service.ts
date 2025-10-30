// src/services/moderation.service.ts
import Sentiment from 'sentiment';

export interface ModerationResult {
  isApproved: boolean;
  score: number;
  reasons: string[];
  sentimentScore: number;
  hasProfanity: boolean;
  shouldAutoReject: boolean; // Nueva propiedad para rechazo automático
  flags: {
    toxicity: boolean;
    spam: boolean;
    negativeSentiment: boolean;
    profanity: boolean;
  };
}

export class ModerationService {
  private sentiment: Sentiment;
  private profanityWords: Set<string>;

  constructor() {
    this.sentiment = new Sentiment();
    
    // Lista simple de palabras ofensivas en español e inglés
    this.profanityWords = new Set([
      'idiota', 'estúpido', 'tonto', 'basura', 'horrible', 'pésimo', 'asqueroso',
      'mierda', 'pendejo', 'cabron', 'carajo', 'puta', 'puto',
      'shit', 'fuck', 'damn', 'ass', 'bitch', 'stupid', 'idiot', 'dumb'
    ]);
  }

  /**
   * Verifica si el texto contiene palabras ofensivas
   */
  private containsProfanity(text: string): boolean {
    const lowerText = text.toLowerCase();
    for (const word of this.profanityWords) {
      if (lowerText.includes(word)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Analiza una reseña y determina si debe ser aprobada automáticamente
   * @param text Texto de la reseña
   * @param stars Calificación en estrellas (1-5)
   * @returns Resultado del análisis de moderación
   */
  analyzeReview(text: string, stars: number): ModerationResult {
    const reasons: string[] = [];
    const flags = {
      toxicity: false,
      spam: false,
      negativeSentiment: false,
      profanity: false
    };

    // 1. Análisis de sentimiento
    const sentimentResult = this.sentiment.analyze(text);
    const sentimentScore = sentimentResult.score;

    // 2. Detección de lenguaje ofensivo/profanidad
    const hasProfanity = this.containsProfanity(text);
    if (hasProfanity) {
      reasons.push('Contiene lenguaje ofensivo o inapropiado');
      flags.profanity = true;
    }

    // 3. Verificar longitud mínima (evitar spam)
    if (text.length < 10) {
      reasons.push('Comentario demasiado corto (posible spam)');
      flags.spam = true;
    }

    // 4. Detectar spam por repetición excesiva
    if (this.hasExcessiveRepetition(text)) {
      reasons.push('Contiene repetición excesiva de caracteres o palabras');
      flags.spam = true;
    }

    // 5. Detectar URLs sospechosas (spam)
    if (this.hasSuspiciousLinks(text)) {
      reasons.push('Contiene enlaces sospechosos');
      flags.spam = true;
    }

    // 6. Inconsistencia entre calificación y sentimiento
    if (this.hasInconsistentRating(stars, sentimentScore)) {
      reasons.push('Calificación inconsistente con el texto');
      flags.negativeSentiment = true;
    }

    // 7. Sentimiento extremadamente negativo
    if (sentimentScore < -5) {
      reasons.push('Sentimiento extremadamente negativo');
      flags.negativeSentiment = true;
      flags.toxicity = true;
    }

    // 8. Detectar toxicidad por palabras clave
    if (this.hasToxicKeywords(text)) {
      reasons.push('Contiene lenguaje tóxico o agresivo');
      flags.toxicity = true;
    }

    // Calcular score final (0-100)
    let score = 100;
    
    if (flags.profanity) score -= 40;
    if (flags.spam) score -= 30;
    if (flags.negativeSentiment) score -= 15;
    if (flags.toxicity) score -= 35;
    
    // Bonus por texto constructivo
    if (text.length > 50 && text.length < 1000) score += 10;
    if (sentimentScore > 0) score += 5;

    score = Math.max(0, Math.min(100, score));

    // Decisión de auto-rechazo: contenido extremadamente problemático
    // Score muy bajo (<20) O múltiples flags críticos simultáneos
    const shouldAutoReject = 
      score < 20 || 
      (flags.profanity && flags.toxicity) || 
      (flags.spam && flags.profanity) ||
      (flags.toxicity && sentimentScore < -8);

    // Decisión final: aprobar si score >= 60 y no hay flags críticos
    const isApproved = score >= 60 && !flags.profanity && !flags.toxicity;

    return {
      isApproved,
      score,
      reasons,
      sentimentScore,
      hasProfanity,
      shouldAutoReject,
      flags
    };
  }

  /**
   * Detecta repetición excesiva de caracteres o palabras
   */
  private hasExcessiveRepetition(text: string): boolean {
    // Detectar caracteres repetidos (ej: "aaaaaaa", "!!!!!!!!!")
    const charRepetition = /(.)\1{5,}/g;
    if (charRepetition.test(text)) return true;

    // Detectar palabras repetidas
    const words = text.toLowerCase().split(/\s+/);
    const wordCounts = new Map<string, number>();
    
    for (const word of words) {
      if (word.length > 3) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    }

    // Si alguna palabra se repite más de 5 veces
    for (const count of wordCounts.values()) {
      if (count > 5) return true;
    }

    return false;
  }

  /**
   * Detecta enlaces sospechosos
   */
  private hasSuspiciousLinks(text: string): boolean {
    // Detectar URLs
    const urlPattern = /(https?:\/\/|www\.)[^\s]+/gi;
    const matches = text.match(urlPattern);
    
    // Si tiene más de 2 URLs, probablemente es spam
    return matches ? matches.length > 2 : false;
  }

  /**
   * Verifica inconsistencia entre calificación y sentimiento del texto
   */
  private hasInconsistentRating(stars: number, sentimentScore: number): boolean {
    // 5 estrellas con sentimiento muy negativo
    if (stars >= 4 && sentimentScore < -3) return true;
    
    // 1-2 estrellas con sentimiento muy positivo
    if (stars <= 2 && sentimentScore > 3) return true;

    return false;
  }

  /**
   * Detecta palabras clave tóxicas
   */
  private hasToxicKeywords(text: string): boolean {
    const toxicPatterns = [
      /\b(odio|odiar)\b/gi,
      /\b(asco|asqueroso)\b/gi,
      /\b(horrible|horroroso)\b/gi,
      /\b(porquería|basura)\b/gi,
      /\b(pésimo|terrible)\b/gi,
      /\bmier[dz]a\b/gi,
    ];

    let toxicCount = 0;
    for (const pattern of toxicPatterns) {
      if (pattern.test(text)) toxicCount++;
    }

    // Si tiene 3 o más palabras tóxicas, flag
    return toxicCount >= 3;
  }

  /**
   * Obtiene texto limpio sin profanidades
   */
  cleanText(text: string): string {
    let cleanedText = text;
    for (const word of this.profanityWords) {
      const regex = new RegExp(word, 'gi');
      cleanedText = cleanedText.replace(regex, '***');
    }
    return cleanedText;
  }
}

// Singleton instance
export const moderationService = new ModerationService();
