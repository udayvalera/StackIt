interface AIResponse {
  title: string;
  answer: string;
}

export class AIService {
  private static readonly API_DELAY = 2000; // Simulate API delay

  static async analyzeQuestion(title: string): Promise<AIResponse> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, this.API_DELAY));

    // Hardcoded response for now
    return {
      title: "AI Assistant Response",
      answer: `Based on your question "${title}", here are some suggestions:

• Make sure to include specific error messages if you're encountering any
• Add code examples showing what you've tried so far
• Specify your development environment (browser, Node.js version, etc.)
• Include relevant dependencies and their versions
• Describe the expected vs actual behavior

This will help the community provide you with more accurate and helpful answers. Good luck with your question!`
    };
  }
}