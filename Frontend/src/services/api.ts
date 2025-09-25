import { ProblemData, HintResponse, PseudoCodeResponse } from '@/types/extension';

class ApiService {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    // Use environment variable for API URL with fallback to localStorage
    this.baseUrl = localStorage.getItem('apiUrl') || import.meta.env.VITE_API_URL || 'http://localhost:3000';
    this.apiKey = localStorage.getItem('apiKey') || '';
  }

  updateConfig(apiUrl: string, apiKey?: string) {
    this.baseUrl = apiUrl;
    this.apiKey = apiKey;
    localStorage.setItem('apiUrl', apiUrl);
    if (apiKey) {
      localStorage.setItem('apiKey', apiKey);
    }
  }

  private async makeRequest(endpoint: string, data: any): Promise<any> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const url = endpoint.startsWith('/') ? `${this.baseUrl}${endpoint}` : `${this.baseUrl}/${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getHint(problemData: ProblemData, hintIndex: number): Promise<HintResponse> {
    try {
      // Backend expects POST /api/v1/analyze-question with questionText, difficulty, platform
      const payload = {
        questionText: `${problemData.title}\n\n${problemData.description}`,
        difficulty: problemData.difficulty,
        platform: problemData.platform,
        hintIndex
      };

      const response = await this.makeRequest('/api/v1/analyze-question', payload);

      // If backend returns data.hints (array) and data.pseudoCode
      const hint = Array.isArray(response.data?.hints) ? response.data.hints[hintIndex] : response.hint || null;
      const hintsRemaining = Array.isArray(response.data?.hints) ? Math.max(0, response.data.hints.length - (hintIndex + 1)) : response.hintsRemaining ?? null;

      return {
        success: true,
        hint,
        hintsRemaining
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get hint'
      };
    }
  }

  async getPseudoCode(problemData: ProblemData): Promise<PseudoCodeResponse> {
    try {
      const payload = {
        questionText: `${problemData.title}\n\n${problemData.description}`,
        difficulty: problemData.difficulty,
        platform: problemData.platform
      };

      const response = await this.makeRequest('/api/v1/analyze-question', payload);

      const pseudoCode = response.data?.pseudoCode || response.pseudoCode || null;

      return {
        success: true,
        pseudoCode
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get pseudo code'
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
  // backend health is exposed at /health
  const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();