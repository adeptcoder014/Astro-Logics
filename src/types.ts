// ============================================
// ENUMS
// ============================================

export enum Specialization {
  MEDICAL = "MEDICAL",
  LAW = "LAW",
  GOVERNMENT = "GOVERNMENT",
  ENGINEERING = "ENGINEERING",
  COMMERCE = "COMMERCE",
  GENERAL = "GENERAL",
}

export enum CardType {
  MEDICAL = "MEDICAL",
  LAW = "LAW",
  GOVERNMENT = "GOVERNMENT",
  ENGINEERING = "ENGINEERING",
  COMMERCE = "COMMERCE",
  GENERAL = "GENERAL",
}

export enum CardFormat {
  QA = "QA",
  MEDICAL = "MEDICAL",
  LAW = "LAW",
  CIVIL = "CIVIL", // Advanced format with bullet points, images, and maps
}

export enum Tab {
  Deck = 'deck',
  Saved = 'saved',
}

// ============================================
// INTERFACES
// ============================================

export interface SrsData {
  interval: number;
  ease: number;
  due: number;
}

// Base Flashcard interface supporting all formats
export interface Flashcard {
  id: string;
  
  // Card Type & Format
  cardType?: CardType;
  format?: CardFormat;
  
  // Government/General Format (Q&A)
  question?: string;
  answer?: string;
  
  // Medical Format
  title?: string;
  bulletPoints?: string[];
  imageDescription?: string;
  
  // Law Format
  caseName?: string;
  facts?: string;
  holding?: string;
  statute?: string;
  
  // Common Fields
  topic?: string;
  subject?: string;
  sourceUrl?: string;
  
  // SRS (Spaced Repetition System)
  srs: SrsData;
  
  // Image Generation
  imageData?: string | null; // Base64 image data for AI-generated images
  
  // Metadata
  isArchived?: boolean;
  tags?: string[];
  difficulty?: number;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SavedFlashcard extends Flashcard {
  savedAt: number;
  title: string; // Required for saved cards
  url: string;
  important: boolean;
  customNote?: string;
  folder?: string;
}

// ============================================
// API TYPES
// ============================================

export interface GenerateFlashcardsParams {
  sourceText?: string;
  sourceImage?: {
    data: string; // base64 encoded string
    mimeType: string;
  };
  targetCount: number;
  role: Specialization | "medical" | "law" | "government";
}

export interface MedicalCard {
  title: string;
  bulletPoints: string[];
  imageDescription: string;
}

export interface LawCard {
  caseName: string;
  facts: string;
  holding: string;
  statute?: string;
}

export interface GovernmentCard {
  question: string;
  answer: string;
}

export interface CivilCard {
  title: string;
  bulletPoints: string[];
  imageDescription: string;
  // Backward compatibility
  question?: string;
  answer?: string;
}
