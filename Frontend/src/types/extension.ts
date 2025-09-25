export interface ProblemData {
  platform: string;
  url: string;
  title: string;
  description: string;
  difficulty?: string;
  tags?: string[];
  timeLimit?: string;
  memoryLimit?: string;
  extractedAt: string;
}

export interface HintResponse {
  success: boolean;
  hint?: string;
  error?: string;
  hintsRemaining?: number;
}

export interface PseudoCodeResponse {
  success: boolean;
  pseudoCode?: string;
  error?: string;
}

export interface BackendConfig {
  apiUrl: string;
  apiKey?: string;
}

export interface ExtensionMessage {
  type: 'PROBLEM_EXTRACTED' | 'GET_CURRENT_PROBLEM' | 'MANUAL_EXTRACT' | 'EXTRACT_PROBLEM';
  data?: any;
}