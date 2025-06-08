/**
 * Content Generator Module - Advanced Podcast Script Generation
 * Generates high-quality podcast scripts with AI-powered analysis
 * Version: 1.0.0
 */

const OpenAI = require("openai");
const natural = require("natural");
const sentiment = require("sentiment");
const compromise = require("compromise");
const keywordExtractor = require("keyword-extractor");
const textStatistics = require("text-statistics");
const contract = require("./contract");

// Custom error class for module-specific errors
class ContentGeneratorError extends Error {
  constructor(message, code = "CONTENT_GENERATION_ERROR", details = {}) {
    super(message);
    this.name = "ContentGeneratorError";
    this.code = code;
    this.details = details;
  }
}

class ContentGenerator {
  constructor() {
    this.openai = null;
    this.sentimentAnalyzer = new sentiment();
    this.stemmer = natural.PorterStemmer;
    this.tokenizer = new natural.WordTokenizer();

    // Initialize OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    // Content templates and patterns
    this.contentTemplates = {
      hooks: {
        question: "What if I told you that {topic}?",
        statistic: "Did you know that {statistic}?",
        story: "Let me tell you about {story_intro}...",
        controversy: "Everyone thinks {common_belief}, but here's the truth...",
        problem: "There's a problem with {topic} that nobody talks about...",
      },
      structures: {
        monologue: ["hook", "introduction", "main_points", "conclusion", "cta"],
        dialogue: [
          "hook",
          "introduction",
          "discussion",
          "debate",
          "conclusion",
          "cta",
        ],
        interview: [
          "hook",
          "guest_intro",
          "questions",
          "insights",
          "conclusion",
          "cta",
        ],
        storytelling: [
          "hook",
          "setup",
          "conflict",
          "resolution",
          "lesson",
          "cta",
        ],
        educational: [
          "hook",
          "overview",
          "explanation",
          "examples",
          "summary",
          "cta",
        ],
      },
    };

    // Platform-specific optimizations
    this.platformOptimizations = {
      tiktok: {
        maxDuration: 180,
        hookDuration: 3,
        fastPaced: true,
        visualCues: true,
      },
      youtube: {
        maxDuration: 600,
        hookDuration: 15,
        retention: true,
        seoOptimized: true,
      },
      instagram: {
        maxDuration: 90,
        hookDuration: 5,
        trendy: true,
        hashtags: true,
      },
      spotify: {
        maxDuration: 1800,
        audioFocus: true,
        narrative: true,
        immersive: true,
      },
    };
  }

  /**
   * Main execution function
   */
  async execute(input) {
    const startTime = Date.now();

    try {
      // Validate input
      const validation = contract.validateInput(input);
      if (!validation.valid) {
        throw new ContentGeneratorError(
          `Invalid input: ${validation.errors.join(", ")}`,
          "INVALID_INPUT",
          { errors: validation.errors }
        );
      }

      console.log("🎬 Starting advanced content generation...");

      // Set defaults
      const config = this.setDefaults(input);

      // Generate content strategy
      const strategy = await this.generateContentStrategy(config);

      // Generate script
      const script = await this.generateScript(config, strategy);

      // Analyze content
      const analysis = await this.analyzeContent(script, config);

      // Generate variations
      const variations = await this.generateVariations(script, config);

      // Generate production notes
      const productionNotes = this.generateProductionNotes(script, config);

      // Generate predictions
      const predictions = this.generatePredictions(script, analysis, config);

      // Compile final output
      const output = {
        script,
        analysis,
        variations,
        productionNotes,
        predictions,
        metadata: {
          generatedAt: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          totalCost: this.openai ? 0.05 : 0.0, // Estimated cost for API calls
          aiModelsUsed: this.openai
            ? ["gpt-4", "text-analysis"]
            : ["text-analysis"],
          confidenceScore: this.calculateConfidenceScore(analysis),
          qualityScore: this.calculateQualityScore(analysis),
          sources: this.extractSources(config.research),
        },
      };

      // Validate output
      const outputValidation = contract.validateOutput(output);
      if (!outputValidation.valid) {
        throw new ContentGeneratorError(
          `Invalid output generated: ${outputValidation.errors.join(", ")}`,
          "INVALID_OUTPUT",
          { errors: outputValidation.errors }
        );
      }

      console.log(
        `✅ Content generation completed in ${Date.now() - startTime}ms`
      );
      return output;
    } catch (error) {
      if (error instanceof ContentGeneratorError) {
        throw error;
      }
      throw new ContentGeneratorError(
        `Content generation failed: ${error.message}`,
        "EXECUTION_ERROR",
        { originalError: error.message }
      );
    }
  }

  /**
   * Set default values for configuration
   */
  setDefaults(input) {
    const config = {
      ...input,
      contentType: input.contentType || "monologue",
      tone: input.tone || "casual",
      duration: input.duration || 120,
      language: input.language || "en",
      targetPlatform: input.targetPlatform || "generic",
      includeHooks: input.includeHooks !== false,
      includeCallToAction: input.includeCallToAction !== false,
      includeStatistics: input.includeStatistics !== false,
      includePersonalStories: input.includePersonalStories !== false,
      includeControversy: input.includeControversy || false,
      creativityLevel: input.creativityLevel || 7,
      factualAccuracy: input.factualAccuracy || 8,
      engagementFocus: input.engagementFocus || 9,
    };

    // Ensure research object exists and has proper defaults
    if (!config.research) {
      config.research = {};
    }

    // Set defaults for audienceAnalysis
    if (!config.research.audienceAnalysis) {
      config.research.audienceAnalysis = {
        demographics: {
          painPoints: ["staying informed", "understanding trends"],
          motivations: ["learn", "stay ahead"],
          ageRange: ["25-34", "35-44"],
          interests: ["technology", "trends", "innovation"],
        },
        behavior: {
          contentPreferences: ["educational", "informative"],
        },
      };
    } else {
      // Ensure demographics exists
      if (!config.research.audienceAnalysis.demographics) {
        config.research.audienceAnalysis.demographics = {
          painPoints: ["staying informed", "understanding trends"],
          motivations: ["learn", "stay ahead"],
          ageRange: ["25-34", "35-44"],
          interests: ["technology", "trends", "innovation"],
        };
      } else {
        // Ensure interests exists in demographics
        if (!config.research.audienceAnalysis.demographics.interests) {
          config.research.audienceAnalysis.demographics.interests = [
            "technology",
            "trends",
            "innovation",
          ];
        }
      }

      // Ensure behavior exists
      if (!config.research.audienceAnalysis.behavior) {
        config.research.audienceAnalysis.behavior = {
          contentPreferences: ["educational", "informative"],
        };
      }
    }

    return config;
  }

  /**
   * Generate content strategy based on research
   */
  async generateContentStrategy(config) {
    console.log("📋 Generating content strategy...");

    const { research } = config;

    // Provide defaults for missing fields
    const contentAngles = research.contentAngles || [
      {
        angle: research.topic || "trending topic",
        viralPotential: 8,
        difficulty: "medium",
        targetAudience: "General audience",
      },
    ];

    const keyInsights = research.keyInsights || [
      {
        insight: research.trendContext || "Current market trends",
        impact: "high",
        confidence: 0.8,
        source: "trend-analysis",
      },
    ];

    const audienceAnalysis = research.audienceAnalysis || {
      demographics: {
        painPoints: ["staying informed", "understanding trends"],
        motivations: ["learn", "stay ahead"],
        ageRange: ["25-34", "35-44"],
        interests: ["technology", "trends", "innovation"],
      },
      behavior: {
        contentPreferences: ["educational", "informative"],
      },
    };

    const contentGaps = research.contentGaps || [
      "practical applications",
      "future implications",
    ];

    // Analyze best content angles
    const topAngles = contentAngles
      .sort((a, b) => b.viralPotential - a.viralPotential)
      .slice(0, 3);

    // Identify key insights to highlight
    const highImpactInsights = keyInsights
      .filter((insight) => insight.impact === "high")
      .sort((a, b) => b.confidence - a.confidence);

    // Analyze audience preferences
    const audiencePrefs = audienceAnalysis.behavior?.contentPreferences || [
      "educational",
      "informative",
    ];

    // Select optimal content angle
    const selectedAngle = this.selectOptimalAngle(topAngles, config);

    // Generate content outline
    const outline = this.generateContentOutline(selectedAngle, config);

    return {
      selectedAngle,
      keyInsights: highImpactInsights.slice(0, 5),
      outline,
      targetKeywords: research.targetKeywords ||
        research.keyPoints || ["trending", "popular"],
      audienceHooks: this.generateAudienceHooks(audienceAnalysis),
      contentGaps: contentGaps.slice(0, 3),
    };
  }

  /**
   * Select optimal content angle based on criteria
   */
  selectOptimalAngle(angles, config) {
    return angles.reduce((best, current) => {
      let score = current.viralPotential;

      // Adjust score based on difficulty and platform
      if (current.difficulty === "easy") score += 2;
      if (current.difficulty === "hard") score -= 1;

      // Platform-specific adjustments
      if (config.targetPlatform === "tiktok" && current.viralPotential > 8)
        score += 3;
      if (
        config.targetPlatform === "youtube" &&
        current.difficulty === "medium"
      )
        score += 2;

      return score > (best.score || 0) ? { ...current, score } : best;
    }, {});
  }

  /**
   * Generate content outline based on type and structure
   */
  generateContentOutline(angle, config) {
    const structure =
      this.contentTemplates.structures[config.contentType] ||
      this.contentTemplates.structures.monologue;

    return structure.map((section, index) => ({
      section,
      order: index + 1,
      estimatedDuration: this.calculateSectionDuration(
        section,
        config.duration,
        structure.length
      ),
      purpose: this.getSectionPurpose(section),
      keyElements: this.getSectionElements(section, angle, config),
    }));
  }

  /**
   * Generate audience-specific hooks
   */
  generateAudienceHooks(audienceAnalysis) {
    // Validate audienceAnalysis and provide defaults
    const validAudienceAnalysis = audienceAnalysis || {
      demographics: {
        painPoints: ["common challenges", "daily struggles"],
        motivations: ["improve skills", "save time", "increase efficiency"],
      },
      behavior: {
        contentPreferences: ["educational", "practical"],
      },
    };

    const { demographics, behavior } = validAudienceAnalysis;
    const hooks = [];

    // Pain point hooks - with safety check
    if (demographics && demographics.painPoints) {
      demographics.painPoints.forEach((pain) => {
        hooks.push({
          type: "pain_point",
          content: `Struggling with ${pain}? You're not alone...`,
          targetEmotion: "empathy",
        });
      });
    }

    // Motivation hooks - with safety check
    if (demographics && demographics.motivations) {
      demographics.motivations.forEach((motivation) => {
        hooks.push({
          type: "motivation",
          content: `Want to ${motivation}? Here's what nobody tells you...`,
          targetEmotion: "aspiration",
        });
      });
    }

    // Add default hooks if none were generated
    if (hooks.length === 0) {
      hooks.push({
        type: "curiosity",
        content: "What if I told you there's something everyone's missing?",
        targetEmotion: "curiosity",
      });
    }

    return hooks.slice(0, 5);
  }

  /**
   * Generate the main script content
   */
  async generateScript(config, strategy) {
    console.log("✍️ Generating script content...");

    const script = {
      title: await this.generateTitle(strategy, config),
      subtitle: await this.generateSubtitle(strategy, config),
      hook: await this.generateHook(strategy, config),
      introduction: await this.generateIntroduction(strategy, config),
      mainContent: await this.generateMainContent(strategy, config),
      conclusion: await this.generateConclusion(strategy, config),
      callToAction: config.includeCallToAction
        ? await this.generateCallToAction(strategy, config)
        : null,
    };

    // Calculate script metadata
    const fullText = this.combineScriptText(script);
    const wordCount = this.tokenizer.tokenize(fullText).length;
    const estimatedDuration = this.calculateSpeechDuration(wordCount);

    script.estimatedDuration = estimatedDuration;
    script.wordCount = wordCount;
    script.readingLevel = this.calculateReadingLevel(fullText);
    script.tone = config.tone;
    script.contentType = config.contentType;
    script.voiceAssignments = this.generateVoiceAssignments(script, config);

    return script;
  }

  /**
   * Generate compelling title
   */
  async generateTitle(strategy, config) {
    const angle = strategy.selectedAngle;
    const niche = config.research.niche || {
      category: config.research.topic || "trending topic",
      name: config.research.topic || "trending topic",
    };

    if (this.openai) {
      try {
        const response = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are an expert content creator specializing in viral ${config.targetPlatform} content. Generate compelling titles that drive clicks and engagement.`,
            },
            {
              role: "user",
              content: `Create a compelling title for a ${config.duration}-second ${config.contentType} about "${angle.angle}" in the ${niche.category} niche. Target audience: ${angle.targetAudience}. Tone: ${config.tone}. Make it attention-grabbing and platform-optimized for ${config.targetPlatform}.`,
            },
          ],
          max_tokens: 100,
          temperature: 0.8,
        });

        return response.choices[0].message.content.trim().replace(/"/g, "");
      } catch (error) {
        console.warn("OpenAI title generation failed, using fallback");
      }
    }

    // Fallback title generation
    const templates = [
      `The ${niche.category} Secret Nobody Talks About`,
      `Why ${angle.angle} Changes Everything`,
      `The Truth About ${niche.name} That Will Shock You`,
      `${angle.angle}: What Experts Don't Want You to Know`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Generate subtitle
   */
  async generateSubtitle(strategy, config) {
    const angle = strategy.selectedAngle;
    const niche = config.research.niche || {
      category: config.research.topic || "trending topic",
      name: config.research.topic || "trending topic",
    };

    if (this.openai) {
      try {
        const response = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are creating subtitles that complement titles and provide additional context.`,
            },
            {
              role: "user",
              content: `Create a subtitle for content about "${angle.angle}" in ${niche.category}. Make it descriptive and supportive of the main title. Tone: ${config.tone}. Keep it under 30 words.`,
            },
          ],
          max_tokens: 80,
          temperature: 0.7,
        });

        return response.choices[0].message.content.trim();
      } catch (error) {
        console.warn("OpenAI subtitle generation failed, using fallback");
      }
    }

    // Fallback subtitle generation
    return `A deep dive into ${angle.angle} and what it means for ${angle.targetAudience}`;
  }

  /**
   * Generate attention-grabbing hook
   */
  async generateHook(strategy, config) {
    const hooks = strategy.audienceHooks;
    const insights = strategy.keyInsights;

    if (this.openai && hooks.length > 0) {
      try {
        // Validate audienceAnalysis and demographics
        const audienceAnalysis = config.research.audienceAnalysis || {
          demographics: {
            painPoints: ["common challenges", "daily struggles"],
          },
        };

        const painPoints = audienceAnalysis.demographics?.painPoints || [
          "common challenges",
          "daily struggles",
        ];

        const response = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are a master storyteller who creates irresistible opening hooks for ${config.targetPlatform} content. Your hooks must grab attention in the first 3-5 seconds.`,
            },
            {
              role: "user",
              content: `Create a powerful opening hook for content about "${
                strategy.selectedAngle.angle
              }". Use one of these audience pain points: ${painPoints.join(
                ", "
              )}. Make it ${
                config.tone
              } and under 20 words. Start with action or intrigue.`,
            },
          ],
          max_tokens: 80,
          temperature: 0.9,
        });

        return response.choices[0].message.content.trim();
      } catch (error) {
        console.warn("OpenAI hook generation failed, using fallback");
      }
    }

    // Fallback hook generation with niche validation
    const niche = config.research.niche || {
      category: config.research.topic || "trending topic",
      name: config.research.topic || "trending topic",
    };

    if (insights.length > 0) {
      const insight = insights[0];
      return `What if everything you knew about ${niche.name} was wrong?`;
    }

    return `Here's what nobody tells you about ${niche.category}...`;
  }

  /**
   * Generate introduction section
   */
  async generateIntroduction(strategy, config) {
    const niche = config.research.niche || {
      category: config.research.topic || "trending topic",
      name: config.research.topic || "trending topic",
    };
    const angle = strategy.selectedAngle;

    if (this.openai) {
      try {
        const response = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are creating podcast introductions that establish credibility and set expectations. Keep it concise and engaging.`,
            },
            {
              role: "user",
              content: `Write a brief introduction for a ${config.contentType} about "${angle.angle}" in ${niche.category}. Establish why this matters to the audience and what they'll learn. Tone: ${config.tone}. Keep it under 50 words.`,
            },
          ],
          max_tokens: 150,
          temperature: 0.7,
        });

        return response.choices[0].message.content.trim();
      } catch (error) {
        console.warn("OpenAI introduction generation failed, using fallback");
      }
    }

    // Fallback introduction
    return `Today we're diving deep into ${angle.angle}. This is something that affects everyone in ${niche.category}, but most people get it completely wrong. By the end of this, you'll understand exactly what you need to know.`;
  }

  /**
   * Generate main content sections
   */
  async generateMainContent(strategy, config) {
    console.log("📝 Generating main content sections...");

    const sections = [];
    const insights = strategy.keyInsights;
    const contentGaps = strategy.contentGaps;

    // Generate content based on outline
    for (let i = 0; i < strategy.outline.length; i++) {
      const outlineSection = strategy.outline[i];

      if (
        outlineSection.section === "main_points" ||
        outlineSection.section === "discussion" ||
        outlineSection.section === "explanation"
      ) {
        // Generate multiple main points
        const numPoints = Math.min(3, insights.length);

        for (let j = 0; j < numPoints; j++) {
          const insight = insights[j];
          const content = await this.generateSectionContent(
            insight,
            config,
            j + 1
          );

          sections.push({
            section: `Point ${j + 1}: ${insight.insight.substring(0, 50)}...`,
            content,
            speaker: "primary",
            timestamp: this.calculateTimestamp(sections, config),
            notes: `Emphasis on ${insight.impact} impact insight`,
          });
        }
      } else {
        const content = await this.generateGenericSectionContent(
          outlineSection,
          strategy,
          config
        );

        sections.push({
          section: outlineSection.section,
          content,
          speaker: "primary",
          timestamp: this.calculateTimestamp(sections, config),
          notes: outlineSection.purpose,
        });
      }
    }

    return sections;
  }

  /**
   * Generate content for a specific insight
   */
  async generateSectionContent(insight, config, pointNumber) {
    if (this.openai) {
      try {
        const response = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are creating engaging podcast content that explains complex topics simply. Use storytelling, examples, and analogies. Make content longer and more detailed for 2+ minute videos.`,
            },
            {
              role: "user",
              content: `Explain this insight in an engaging, detailed way: "${insight.insight}". 

              Requirements:
              - Make it ${config.tone} and conversational
              - Use concrete examples or analogies 
              - Include practical applications
              - Add storytelling elements
              - This is point ${pointNumber} of ${config.duration} seconds total content
              - Target length: 80-120 words for longer, more engaging content
              - Include emotional hooks and "wow" moments
              - Make viewers want to share this insight
              
              Structure: Hook -> Explanation -> Example/Analogy -> Why it matters`,
            },
          ],
          max_tokens: 400, // Increased from 200 to allow longer content
          temperature: 0.8,
        });

        return response.choices[0].message.content.trim();
      } catch (error) {
        console.warn(
          "OpenAI section content generation failed, using fallback"
        );
      }
    }

    // Enhanced fallback content generation with more detail
    const examples = [
      "Imagine you're a chef, creating the perfect recipe. You want it to be delicious, so you balance your ingredients: 54% sugar for sweetness (engagement), 61% flour for structure (saturation), and 92% yeast for growth (growth rate). That's how we select for optimal balance.",

      "Think of it like a GPS for your business. Most people are driving blind, but this insight gives you the exact coordinates to your destination. It's the difference between wandering around lost and taking the direct route to success.",

      "Here's the crazy part that no one talks about: while everyone is fighting over the obvious opportunities, there's this hidden goldmine right under our noses. It's like everyone's looking for diamonds in the mountains while ignoring the gold in their backyard.",
    ];

    const randomExample = examples[Math.floor(Math.random() * examples.length)];

    return `Here's something that will change how you think... ${insight.insight.replace(/['"]/g, "")}. ${randomExample} So what does this all mean? It means we've been approaching this completely wrong, and there's a much better way forward.`;
  }

  /**
   * Generate generic section content
   */
  async generateGenericSectionContent(outlineSection, strategy, config) {
    // Fallback templates for different sections
    const templates = {
      hook: `Here's something that will change how you think...`,
      introduction: `Let me tell you why this matters...`,
      main_content: `The key thing to understand is...`,
      conclusion: `So what does this all mean?`,
      resolution: `And that's when everything clicked...`,
      lesson: `The key takeaway here is...`,
      summary: `So to wrap this up...`,
    };

    // Safe access to selectedAngle with fallback
    const angle =
      strategy.selectedAngle?.angle || config.research?.topic || "this topic";

    return (
      templates[outlineSection.section] || `Now, let's talk about ${angle}...`
    );
  }

  /**
   * Generate conclusion
   */
  async generateConclusion(strategy, config) {
    if (this.openai) {
      try {
        const response = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are creating powerful conclusions that summarize key points and leave a lasting impact.`,
            },
            {
              role: "user",
              content: `Write a conclusion for content about "${strategy.selectedAngle.angle}". Summarize the main value and create a memorable ending. Tone: ${config.tone}. Keep it under 40 words.`,
            },
          ],
          max_tokens: 120,
          temperature: 0.7,
        });

        return response.choices[0].message.content.trim();
      } catch (error) {
        console.warn("OpenAI conclusion generation failed, using fallback");
      }
    }

    // Fallback conclusion
    return `So there you have it - the real truth about ${strategy.selectedAngle.angle}. This changes everything, and now you know exactly what to do next.`;
  }

  /**
   * Generate call to action
   */
  async generateCallToAction(strategy, config) {
    const ctas = {
      youtube:
        "If this helped you, smash that like button and subscribe for more insights like this!",
      tiktok:
        "Follow for more content like this! What do you think about this?",
      instagram:
        "Save this post and share it with someone who needs to see this!",
      spotify: "If you enjoyed this episode, please rate and review us!",
      generic: "What are your thoughts on this? Let me know in the comments!",
    };

    return ctas[config.targetPlatform] || ctas.generic;
  }

  /**
   * Analyze content quality and metrics
   */
  async analyzeContent(script, config) {
    console.log("📊 Analyzing content quality...");

    const fullText = this.combineScriptText(script);
    const tokens = this.tokenizer.tokenize(fullText);

    // Basic text analysis
    const sentimentResult = this.sentimentAnalyzer.analyze(fullText);

    // Validate niche and provide defaults
    const niche = config.research.niche || {
      category: config.research.topic || "trending topic",
      name: config.research.topic || "trending topic",
      keywords: config.research.targetKeywords ||
        config.research.keyPoints || ["trending", "popular"],
      metrics: { trend: 5 },
    };

    const keywordDensity = this.calculateKeywordDensity(
      fullText,
      niche.keywords
    );

    // Advanced analysis
    const analysis = {
      // Engagement metrics
      hookStrength: this.analyzeHookStrength(script.hook),
      retentionPotential: this.analyzeRetentionPotential(script, config),
      viralPotential: this.analyzeViralPotential(script, config),
      emotionalImpact: Math.min(10, Math.max(1, 5 + sentimentResult.score / 2)),

      // Content quality
      factualAccuracy: config.factualAccuracy,
      originalityScore: this.analyzeOriginality(fullText),
      relevanceScore: this.analyzeRelevance(script, config),
      clarityScore: this.analyzeClarity(fullText),

      // SEO and discoverability
      keywordDensity,
      seoScore: this.calculateSEOScore(script, config),
      trendAlignment: this.analyzeTrendAlignment(script, config),

      // Audience fit
      audienceAlignment: this.analyzeAudienceAlignment(script, config),
      demographicFit: this.analyzeDemographicFit(script, config),
      platformOptimization: this.analyzePlatformOptimization(script, config),
    };

    return analysis;
  }

  /**
   * Analyze hook strength
   */
  analyzeHookStrength(hook) {
    let score = 5; // Base score

    // Check for question marks (curiosity)
    if (hook.includes("?")) score += 2;

    // Check for power words
    const powerWords = [
      "secret",
      "truth",
      "shocking",
      "amazing",
      "incredible",
      "never",
      "always",
    ];
    powerWords.forEach((word) => {
      if (hook.toLowerCase().includes(word)) score += 1;
    });

    // Check length (optimal 10-20 words)
    const wordCount = hook.split(" ").length;
    if (wordCount >= 10 && wordCount <= 20) score += 1;

    return Math.min(10, score);
  }

  /**
   * Analyze retention potential
   */
  analyzeRetentionPotential(script, config) {
    let score = 5;

    // Check for story elements
    if (
      script.mainContent.some(
        (section) =>
          section.content.includes("story") ||
          section.content.includes("example")
      )
    ) {
      score += 2;
    }

    // Check for engagement elements
    if (script.hook.includes("?") || script.conclusion.includes("?"))
      score += 1;

    // Platform-specific adjustments
    if (config.targetPlatform === "tiktok" && script.estimatedDuration <= 60)
      score += 2;
    if (config.targetPlatform === "youtube" && script.estimatedDuration >= 120)
      score += 1;

    return Math.min(10, score);
  }

  /**
   * Analyze viral potential
   */
  analyzeViralPotential(script, config) {
    // Validate niche and provide defaults
    const niche = config.research.niche || {
      metrics: { trend: 5 },
    };

    let score = niche.metrics.trend || 5;

    // Check for controversial elements
    if (config.includeControversy) score += 2;

    // Check for emotional triggers
    const emotionalWords = [
      "shocking",
      "amazing",
      "unbelievable",
      "secret",
      "truth",
    ];
    const fullText = this.combineScriptText(script);
    emotionalWords.forEach((word) => {
      if (fullText.toLowerCase().includes(word)) score += 0.5;
    });

    // Platform viral factors
    if (config.targetPlatform === "tiktok") score += 1;
    if (config.creativityLevel >= 8) score += 1;

    return Math.min(10, score);
  }

  /**
   * Calculate keyword density
   */
  calculateKeywordDensity(text, keywords) {
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    const density = {};

    keywords.forEach((keyword) => {
      const keywordTokens = keyword.toLowerCase().split(" ");
      let count = 0;

      if (keywordTokens.length === 1) {
        count = tokens.filter((token) => token === keywordTokens[0]).length;
      } else {
        // Multi-word keyword matching
        for (let i = 0; i <= tokens.length - keywordTokens.length; i++) {
          const slice = tokens.slice(i, i + keywordTokens.length);
          if (slice.join(" ") === keyword.toLowerCase()) count++;
        }
      }

      density[keyword] = (count / tokens.length) * 100;
    });

    return density;
  }

  /**
   * Generate content variations
   */
  async generateVariations(script, config) {
    console.log("🔄 Generating content variations...");

    const variations = [];

    // Shorter version
    if (script.estimatedDuration > 60) {
      variations.push({
        type: "shorter",
        title: script.title + " (Quick Version)",
        hook: script.hook,
        keyChanges: [
          "Condensed main points",
          "Removed examples",
          "Faster pacing",
        ],
        estimatedDuration: Math.max(30, script.estimatedDuration * 0.6),
      });
    }

    // Longer version
    if (script.estimatedDuration < 300) {
      variations.push({
        type: "longer",
        title: script.title + " (Deep Dive)",
        hook: script.hook,
        keyChanges: [
          "Added detailed examples",
          "Expanded explanations",
          "More insights",
        ],
        estimatedDuration: script.estimatedDuration * 1.5,
      });
    }

    // Different tone
    const alternateTones = ["professional", "humorous", "inspirational"].filter(
      (t) => t !== config.tone
    );
    if (alternateTones.length > 0) {
      variations.push({
        type: "different_tone",
        title: script.title,
        hook: this.adaptHookToTone(script.hook, alternateTones[0]),
        keyChanges: [
          `Changed tone to ${alternateTones[0]}`,
          "Adjusted language style",
        ],
        estimatedDuration: script.estimatedDuration,
      });
    }

    return variations;
  }

  /**
   * Generate production notes
   */
  generateProductionNotes(script, config) {
    return {
      musicSuggestions: [
        {
          type: "intro",
          mood: "energetic",
          timing: "0-5 seconds",
        },
        {
          type: "background",
          mood: config.tone === "professional" ? "subtle" : "upbeat",
          timing: "throughout main content",
        },
        {
          type: "outro",
          mood: "memorable",
          timing: "final 10 seconds",
        },
      ],
      soundEffects: [
        {
          effect: "transition swoosh",
          timing: "between main points",
          purpose: "smooth transitions",
        },
      ],
      pacingNotes: script.mainContent.map((section, index) => ({
        section: index + 1,
        note: index === 0 ? "Start strong and clear" : "Maintain energy",
        emphasis: index === 0 ? "fast" : "normal",
      })),
      visualSuggestions: [
        {
          timing: "0-5s",
          visual: "Title card with hook text",
          type: "text",
        },
        {
          timing: "main content",
          visual: "Key points as text overlays",
          type: "text",
        },
      ],
    };
  }

  /**
   * Generate performance predictions
   */
  generatePredictions(script, analysis, config) {
    // Validate niche and provide defaults
    const niche = config.research.niche || {
      category: config.research.topic || "trending topic",
      metrics: { trend: 5 },
    };

    const baseViews = this.calculateBaseViews(
      config.targetPlatform,
      niche.metrics
    );
    const multiplier =
      (analysis.viralPotential +
        analysis.hookStrength +
        analysis.retentionPotential) /
      30;

    return {
      expectedViews: [
        {
          platform: config.targetPlatform,
          range: {
            min: Math.floor(baseViews * multiplier * 0.5),
            max: Math.floor(baseViews * multiplier * 2),
          },
          confidence: Math.min(95, 60 + analysis.audienceAlignment * 3),
        },
      ],
      expectedEngagement: {
        likes: Math.floor(baseViews * multiplier * 0.05),
        comments: Math.floor(baseViews * multiplier * 0.02),
        shares: Math.floor(baseViews * multiplier * 0.01),
        confidence: Math.min(90, 50 + analysis.emotionalImpact * 4),
      },
      monetizationPotential: {
        cpm: this.calculateCPM(niche.category),
        sponsorshipValue: this.calculateSponsorshipValue(
          baseViews * multiplier
        ),
        affiliateOpportunities: this.identifyAffiliateOpportunities(niche),
      },
    };
  }

  // Helper methods
  combineScriptText(script) {
    const parts = [
      script.title,
      script.hook,
      script.introduction,
      ...script.mainContent.map((section) => section.content),
      script.conclusion,
    ];

    if (script.callToAction) parts.push(script.callToAction);

    return parts.join(" ");
  }

  calculateSpeechDuration(wordCount) {
    // Average speaking rate: 150-160 words per minute
    return Math.ceil((wordCount / 155) * 60);
  }

  calculateReadingLevel(text) {
    try {
      // Simple Flesch reading ease calculation
      const sentences = text
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 0).length;
      const words = text.split(/\s+/).filter((w) => w.trim().length > 0).length;

      // Simple syllable count (approximation)
      const syllables = this.countSyllables(text);

      if (sentences === 0 || words === 0) {
        return "High School"; // Default fallback
      }

      // Flesch Reading Ease formula: 206.835 - (1.015 × ASL) - (84.6 × ASW)
      // ASL = Average Sentence Length (words per sentence)
      // ASW = Average Syllables per Word
      const asl = words / sentences;
      const asw = syllables / words;
      const fleschScore = 206.835 - 1.015 * asl - 84.6 * asw;

      if (fleschScore >= 90) return "Elementary";
      if (fleschScore >= 80) return "Middle School";
      if (fleschScore >= 70) return "High School";
      if (fleschScore >= 60) return "College";
      return "Graduate";
    } catch (error) {
      return "High School"; // Default fallback
    }
  }

  // Simple syllable counting function
  countSyllables(text) {
    const words = text
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.trim().length > 0);
    let totalSyllables = 0;

    for (const word of words) {
      // Remove punctuation
      const cleanWord = word.replace(/[^a-z]/g, "");
      if (cleanWord.length === 0) continue;

      // Count vowel groups
      let syllables = 0;
      let previousWasVowel = false;

      for (let i = 0; i < cleanWord.length; i++) {
        const char = cleanWord[i];
        const isVowel = "aeiouy".includes(char);

        if (isVowel && !previousWasVowel) {
          syllables++;
        }
        previousWasVowel = isVowel;
      }

      // Handle silent e
      if (cleanWord.endsWith("e") && syllables > 1) {
        syllables--;
      }

      // Every word has at least one syllable
      if (syllables === 0) {
        syllables = 1;
      }

      totalSyllables += syllables;
    }

    return totalSyllables;
  }

  generateVoiceAssignments(script, config) {
    const totalWords = script.wordCount;

    if (config.contentType === "dialogue" && config.voices?.secondary) {
      return {
        primary: {
          sections: [0, 2, 4], // Hook, main points, conclusion
          totalWords: Math.ceil(totalWords * 0.7),
          estimatedDuration: Math.ceil(script.estimatedDuration * 0.7),
        },
        secondary: {
          sections: [1, 3], // Introduction, some main content
          totalWords: Math.floor(totalWords * 0.3),
          estimatedDuration: Math.floor(script.estimatedDuration * 0.3),
        },
      };
    }

    return {
      primary: {
        sections: Array.from(
          { length: script.mainContent.length },
          (_, i) => i
        ),
        totalWords,
        estimatedDuration: script.estimatedDuration,
      },
    };
  }

  calculateTimestamp(existingSections, config) {
    if (existingSections.length === 0) return 0;

    const avgWordsPerSection = 50; // Estimated
    const wordsPerSecond = 155 / 60; // 155 WPM

    return Math.floor(
      (existingSections.length * avgWordsPerSection) / wordsPerSecond
    );
  }

  calculateSectionDuration(section, totalDuration, totalSections) {
    const weights = {
      hook: 0.1,
      introduction: 0.15,
      main_points: 0.5,
      conclusion: 0.15,
      cta: 0.1,
    };

    return Math.floor(totalDuration * (weights[section] || 1 / totalSections));
  }

  getSectionPurpose(section) {
    const purposes = {
      hook: "Grab attention immediately",
      introduction: "Set context and expectations",
      main_points: "Deliver core value",
      conclusion: "Summarize and reinforce",
      cta: "Drive desired action",
    };

    return purposes[section] || "Support main narrative";
  }

  getSectionElements(section, angle, config) {
    return [
      `Focus on ${angle.angle}`,
      `Maintain ${config.tone} tone`,
      "Keep audience engaged",
    ];
  }

  // Analysis helper methods
  analyzeOriginality(text) {
    // Simple originality check based on unique word combinations
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    const uniqueBigrams = new Set();

    for (let i = 0; i < tokens.length - 1; i++) {
      uniqueBigrams.add(`${tokens[i]} ${tokens[i + 1]}`);
    }

    const originalityRatio =
      uniqueBigrams.size / Math.max(1, tokens.length - 1);
    return Math.min(10, Math.max(1, originalityRatio * 15));
  }

  analyzeRelevance(script, config) {
    const fullText = this.combineScriptText(script);

    // Validate niche and provide defaults
    const niche = config.research.niche || {
      keywords: config.research.targetKeywords ||
        config.research.keyPoints || ["trending", "popular"],
    };

    const keywords = niche.keywords;
    let relevanceScore = 5;

    keywords.forEach((keyword) => {
      if (fullText.toLowerCase().includes(keyword.toLowerCase())) {
        relevanceScore += 0.5;
      }
    });

    return Math.min(10, relevanceScore);
  }

  analyzeClarity(text) {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgSentenceLength = text.split(" ").length / sentences.length;

    // Optimal sentence length: 15-20 words
    let clarityScore = 8;
    if (avgSentenceLength > 25) clarityScore -= 2;
    if (avgSentenceLength < 10) clarityScore -= 1;

    return Math.max(1, clarityScore);
  }

  calculateSEOScore(script, config) {
    let score = 5;

    // Title optimization
    if (script.title.length >= 30 && script.title.length <= 60) score += 1;

    // Keyword presence - validate niche and provide defaults
    const niche = config.research.niche || {
      keywords: config.research.targetKeywords ||
        config.research.keyPoints || ["trending", "popular"],
    };

    const keywords = niche.keywords;
    const fullText = this.combineScriptText(script);

    keywords.forEach((keyword) => {
      if (fullText.toLowerCase().includes(keyword.toLowerCase())) score += 0.3;
    });

    return Math.min(10, score);
  }

  analyzeTrendAlignment(script, config) {
    // Validate niche and provide defaults
    const niche = config.research.niche || {
      metrics: { trend: 5 },
    };

    return Math.min(10, niche.metrics.trend + 2);
  }

  analyzeAudienceAlignment(script, config) {
    // Validate audienceAnalysis and provide defaults
    const audienceAnalysis = config.research.audienceAnalysis || {
      demographics: {
        interests: ["technology", "trends", "innovation"],
      },
    };

    const audienceInterests = audienceAnalysis.demographics.interests || [
      "technology",
      "trends",
      "innovation",
    ];
    const fullText = this.combineScriptText(script);
    let alignmentScore = 5;

    audienceInterests.forEach((interest) => {
      if (fullText.toLowerCase().includes(interest.toLowerCase())) {
        alignmentScore += 0.5;
      }
    });

    return Math.min(10, alignmentScore);
  }

  analyzeDemographicFit(script, config) {
    const tone = config.tone;

    // Validate audienceAnalysis and provide defaults
    const audienceAnalysis = config.research.audienceAnalysis || {
      demographics: {
        ageRange: ["25-34", "35-44"],
      },
    };

    const ageRange = audienceAnalysis.demographics.ageRange || [
      "25-34",
      "35-44",
    ];

    let fitScore = 7; // Base score

    // Age-appropriate tone matching
    if (ageRange.includes("18-24") && ["casual", "humorous"].includes(tone))
      fitScore += 1;
    if (
      ageRange.includes("25-34") &&
      ["professional", "educational"].includes(tone)
    )
      fitScore += 1;
    if (
      ageRange.includes("35+") &&
      ["professional", "inspirational"].includes(tone)
    )
      fitScore += 1;

    return Math.min(10, fitScore);
  }

  analyzePlatformOptimization(script, config) {
    const platform = config.targetPlatform;
    const duration = script.estimatedDuration;
    let optimizationScore = 5;

    // Platform-specific duration optimization
    if (platform === "tiktok" && duration <= 180) optimizationScore += 2;
    if (platform === "youtube" && duration >= 120 && duration <= 600)
      optimizationScore += 2;
    if (platform === "instagram" && duration <= 90) optimizationScore += 2;

    // Hook optimization for platform
    if (platform === "tiktok" && script.hook.split(" ").length <= 15)
      optimizationScore += 1;

    return Math.min(10, optimizationScore);
  }

  calculateConfidenceScore(analysis) {
    const scores = [
      analysis.factualAccuracy,
      analysis.relevanceScore,
      analysis.clarityScore,
      analysis.audienceAlignment,
    ];

    return Math.floor(
      (scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10
    );
  }

  calculateQualityScore(analysis) {
    const scores = [
      analysis.hookStrength,
      analysis.originalityScore,
      analysis.clarityScore,
      analysis.platformOptimization,
    ];

    return Math.floor(
      (scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10
    );
  }

  extractSources(research) {
    const sources = [];

    // Validate keyInsights and provide defaults
    const keyInsights = research.keyInsights || [
      {
        insight: research.trendContext || "Current market trends",
        source: "trend-analysis",
        confidence: 0.8,
      },
    ];

    keyInsights.forEach((insight) => {
      sources.push({
        type: "insight",
        reference: insight.source,
        reliability: insight.confidence,
      });
    });

    return sources.slice(0, 5);
  }

  adaptHookToTone(hook, newTone) {
    const toneAdaptations = {
      professional: hook.replace(
        /amazing|incredible|shocking/gi,
        "significant"
      ),
      humorous: hook + " (And trust me, it's funnier than it sounds!)",
      inspirational: hook.replace(/problem|issue/gi, "opportunity"),
    };

    return toneAdaptations[newTone] || hook;
  }

  calculateBaseViews(platform, metrics) {
    const baselines = {
      tiktok: 1000,
      youtube: 500,
      instagram: 800,
      spotify: 200,
      generic: 600,
    };

    return (baselines[platform] || 600) * (1 + metrics.trend / 10);
  }

  calculateCPM(category) {
    const cpms = {
      technology: 3.5,
      business: 4.0,
      lifestyle: 2.5,
      entertainment: 2.0,
      education: 3.0,
    };

    return cpms[category.toLowerCase()] || 2.75;
  }

  calculateSponsorshipValue(expectedViews) {
    return Math.floor(expectedViews * 0.01); // $0.01 per view baseline
  }

  identifyAffiliateOpportunities(niche) {
    const opportunities = {
      technology: ["Software tools", "Hardware products", "Online courses"],
      business: ["Business books", "Productivity tools", "Consulting services"],
      lifestyle: ["Health products", "Fashion items", "Home goods"],
      entertainment: ["Streaming services", "Gaming products", "Media content"],
    };

    return (
      opportunities[niche.category.toLowerCase()] || [
        "General products",
        "Digital services",
      ]
    );
  }
}

// Export the module
module.exports = {
  execute: async (input) => {
    const generator = new ContentGenerator();
    return await generator.execute(input);
  },
  ContentGeneratorError,
  contract,
};
