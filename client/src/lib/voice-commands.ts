export interface VoiceCommand {
  patterns: string[];
  action: string;
  description: string;
  category: "navigation" | "quiz" | "general" | "accessibility";
  requiresQuiz?: boolean;
}

export interface VoiceCommandResult {
  command: string;
  action: string;
  confidence: number;
  parameters?: Record<string, any>;
}

export const VOICE_COMMANDS: VoiceCommand[] = [
  // Navigation commands
  {
    patterns: ["go home", "home", "main menu", "start page"],
    action: "navigate_home",
    description: "Navigate to home page",
    category: "navigation"
  },
  {
    patterns: ["start quiz", "begin quiz", "quiz", "start test", "begin test"],
    action: "start_quiz",
    description: "Start a quiz session",
    category: "navigation"
  },
  {
    patterns: ["analytics", "stats", "statistics", "progress", "performance"],
    action: "navigate_analytics",
    description: "View performance analytics",
    category: "navigation"
  },
  {
    patterns: ["profile", "settings", "preferences"],
    action: "navigate_profile",
    description: "Open profile and settings",
    category: "navigation"
  },

  // Quiz commands
  {
    patterns: ["next", "next question", "continue", "proceed"],
    action: "next_question",
    description: "Move to next question",
    category: "quiz",
    requiresQuiz: true
  },
  {
    patterns: ["previous", "back", "previous question", "go back"],
    action: "previous_question",
    description: "Go to previous question",
    category: "quiz",
    requiresQuiz: true
  },
  {
    patterns: ["skip", "skip question", "pass"],
    action: "skip_question",
    description: "Skip current question",
    category: "quiz",
    requiresQuiz: true
  },
  {
    patterns: ["mark", "mark for review", "bookmark", "flag"],
    action: "mark_question",
    description: "Mark question for review",
    category: "quiz",
    requiresQuiz: true
  },
  {
    patterns: ["explain", "explanation", "explain answer", "show explanation"],
    action: "show_explanation",
    description: "Show answer explanation",
    category: "quiz",
    requiresQuiz: true
  },
  {
    patterns: ["submit", "submit answer", "confirm"],
    action: "submit_answer",
    description: "Submit current answer",
    category: "quiz",
    requiresQuiz: true
  },

  // Answer selection commands
  {
    patterns: ["a", "option a", "first option", "alpha"],
    action: "select_option",
    description: "Select option A",
    category: "quiz",
    requiresQuiz: true
  },
  {
    patterns: ["b", "option b", "second option", "bravo"],
    action: "select_option",
    description: "Select option B",
    category: "quiz",
    requiresQuiz: true
  },
  {
    patterns: ["c", "option c", "third option", "charlie"],
    action: "select_option",
    description: "Select option C",
    category: "quiz",
    requiresQuiz: true
  },
  {
    patterns: ["d", "option d", "fourth option", "delta"],
    action: "select_option",
    description: "Select option D",
    category: "quiz",
    requiresQuiz: true
  },

  // General commands
  {
    patterns: ["repeat", "say again", "repeat that", "again"],
    action: "repeat_last",
    description: "Repeat last announcement",
    category: "general"
  },
  {
    patterns: ["help", "commands", "what can i say", "voice help"],
    action: "show_help",
    description: "Show available voice commands",
    category: "general"
  },
  {
    patterns: ["stop", "stop listening", "quiet", "silence"],
    action: "stop_listening",
    description: "Stop voice recognition",
    category: "general"
  },
  {
    patterns: ["listen", "start listening", "voice on", "activate voice"],
    action: "start_listening",
    description: "Start voice recognition",
    category: "general"
  },

  // Language commands
  {
    patterns: ["english", "switch to english", "english language"],
    action: "set_language",
    description: "Switch to English",
    category: "accessibility"
  },
  {
    patterns: ["hindi", "हिंदी", "switch to hindi", "hindi language"],
    action: "set_language",
    description: "Switch to Hindi",
    category: "accessibility"
  },

  // AI Assistant commands
  {
    patterns: ["hey gyansarthi", "hi gyansarthi", "hello gyansarthi", "gyansarthi", "sarthi"],
    action: "activate_ai",
    description: "Activate AI Study Assistant",
    category: "general"
  },
  // Download commands
  {
    patterns: ["download", "download pack", "get pack", "install pack"],
    action: "download_pack",
    description: "Download exam pack",
    category: "general"
  }
];

export class VoiceCommandProcessor {
  private commands: VoiceCommand[];
  private lastCommand: string = "";
  
  constructor(commands: VoiceCommand[] = VOICE_COMMANDS) {
    this.commands = commands;
  }

  processCommand(transcript: string, context?: { inQuiz?: boolean; currentLanguage?: string }): VoiceCommandResult | null {
    const normalizedTranscript = this.normalizeText(transcript);
    
    if (!normalizedTranscript) {
      return null;
    }

    // Find best matching command
    let bestMatch: { command: VoiceCommand; confidence: number; parameters?: Record<string, any> } | null = null;

    for (const command of this.commands) {
      // Skip quiz commands if not in quiz context
      if (command.requiresQuiz && !context?.inQuiz) {
        continue;
      }

      for (const pattern of command.patterns) {
        const confidence = this.calculateConfidence(normalizedTranscript, pattern);
        
        if (confidence > 0.7 && (!bestMatch || confidence > bestMatch.confidence)) {
          bestMatch = {
            command,
            confidence,
            parameters: this.extractParameters(normalizedTranscript, command.action)
          };
        }
      }
    }

    if (bestMatch) {
      this.lastCommand = transcript;
      return {
        command: bestMatch.command.action,
        action: bestMatch.command.action,
        confidence: bestMatch.confidence,
        parameters: bestMatch.parameters
      };
    }

    return null;
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  private calculateConfidence(transcript: string, pattern: string): number {
    const normalizedPattern = this.normalizeText(pattern);
    
    // Exact match
    if (transcript === normalizedPattern) {
      return 1.0;
    }

    // Contains pattern
    if (transcript.includes(normalizedPattern)) {
      return 0.9;
    }

    // Word-by-word matching
    const transcriptWords = transcript.split(' ');
    const patternWords = normalizedPattern.split(' ');
    
    const matchingWords = patternWords.filter(word => 
      transcriptWords.some(tWord => this.wordsMatch(tWord, word))
    );
    
    const wordMatchRatio = matchingWords.length / patternWords.length;
    
    if (wordMatchRatio >= 0.8) {
      return 0.85;
    } else if (wordMatchRatio >= 0.6) {
      return 0.75;
    } else if (wordMatchRatio >= 0.4) {
      return 0.6;
    }

    // Fuzzy matching for single words
    if (patternWords.length === 1 && transcriptWords.length === 1) {
      const similarity = this.stringSimilarity(transcriptWords[0], patternWords[0]);
      return similarity > 0.8 ? similarity : 0;
    }

    return 0;
  }

  private wordsMatch(word1: string, word2: string): boolean {
    if (word1 === word2) return true;
    
    // Handle common variations
    const variations: Record<string, string[]> = {
      'a': ['alpha', 'first'],
      'b': ['bravo', 'second'],
      'c': ['charlie', 'third'],
      'd': ['delta', 'fourth'],
      'help': ['health'],
      'next': ['necks'],
      'quiz': ['quis'],
      'repeat': ['repeats']
    };

    for (const [canonical, variants] of Object.entries(variations)) {
      if ((this.normalizeText(word1) === canonical && variants.includes(this.normalizeText(word2))) ||
          (this.normalizeText(word2) === canonical && variants.includes(this.normalizeText(word1)))) {
        return true;
      }
    }

    return this.stringSimilarity(word1, word2) > 0.8;
  }

  private stringSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private extractParameters(transcript: string, action: string): Record<string, any> | undefined {
    const parameters: Record<string, any> = {};

    // Extract option for select_option command
    if (action === "select_option") {
      // Improved matching for standalone letters and common variations
      const optionMatch = transcript.match(/\b([abcd]|option [abcd]|first|second|third|fourth|one|two|three|four)\b/i);
      if (optionMatch) {
        const option = optionMatch[1].toLowerCase();
        if (option.includes('a') || option.includes('first') || option === 'one') parameters.option = 'a';
        else if (option.includes('b') || option.includes('second') || option === 'two') parameters.option = 'b';
        else if (option.includes('c') || option.includes('third') || option === 'three') parameters.option = 'c';
        else if (option.includes('d') || option.includes('fourth') || option === 'four') parameters.option = 'd';
      }
    }

    // Extract language for set_language command
    if (action === "set_language") {
      if (transcript.includes('english')) parameters.language = 'english';
      else if (transcript.includes('hindi') || transcript.includes('हिंदी')) parameters.language = 'hindi';
    }

    return Object.keys(parameters).length > 0 ? parameters : undefined;
  }

  getCommandsByCategory(category: string): VoiceCommand[] {
    return this.commands.filter(cmd => cmd.category === category);
  }

  getAvailableCommands(context?: { inQuiz?: boolean }): VoiceCommand[] {
    return this.commands.filter(cmd => !cmd.requiresQuiz || context?.inQuiz);
  }

  getLastCommand(): string {
    return this.lastCommand;
  }

  getHelpText(language: "english" | "hindi" = "english"): string {
    const categories = ["navigation", "quiz", "general", "accessibility"];
    const helpSections: string[] = [];

    if (language === "english") {
      helpSections.push("Available voice commands:");
      
      categories.forEach(category => {
        const commands = this.getCommandsByCategory(category);
        if (commands.length > 0) {
          helpSections.push(`\n${category.charAt(0).toUpperCase() + category.slice(1)} commands:`);
          commands.forEach(cmd => {
            helpSections.push(`- Say "${cmd.patterns[0]}" to ${cmd.description.toLowerCase()}`);
          });
        }
      });
    } else {
      helpSections.push("उपलब्ध वॉयस कमांड:");
      helpSections.push("अंग्रेजी में कमांड बोलें जैसे: हेल्प, नेक्स्ट, रिपीट, स्टार्ट क्विज");
    }

    return helpSections.join('\n');
  }
}

// Create default instance
export const voiceCommandProcessor = new VoiceCommandProcessor();

// Helper function to generate speech text for commands
export function generateCommandSpeech(commands: VoiceCommand[], language: "english" | "hindi" = "english"): string {
  if (language === "hindi") {
    return "वॉयस कमांड के लिए अंग्रेजी शब्दों का उपयोग करें। कहें: स्टार्ट क्विज, नेक्स्ट, रिपीट, हेल्प।";
  }

  const basicCommands = commands.slice(0, 6).map(cmd => cmd.patterns[0]).join(", ");
  return `Basic voice commands include: ${basicCommands}. Say "help" for a complete list.`;
}
