(function () {
  const storage = window.StudyMindStorage;
  const data = window.StudyMindData || {};

  const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
  const OPENAI_MODEL = "gpt-3.5-turbo";

  function getApiKey() {
    if (storage && typeof storage.getProfile === "function") {
      const profile = storage.getProfile();
      if (profile && typeof profile.apiKey === "string" && profile.apiKey.trim()) {
        return profile.apiKey.trim();
      }
    }

    try {
      const rawProfile = localStorage.getItem("studymind-profile");
      if (!rawProfile) {
        return "";
      }
      const parsed = JSON.parse(rawProfile);
      return parsed && typeof parsed.apiKey === "string" ? parsed.apiKey.trim() : "";
    } catch (error) {
      return "";
    }
  }

  function getApp() {
    return window.StudyMindApp;
  }

  function showToast(title, message, tone) {
    const app = getApp();
    if (app && typeof app.showToast === "function") {
      app.showToast(title, message, tone);
    }
  }

  function showLoading(message) {
    const app = getApp();
    if (app && typeof app.showLoading === "function") {
      app.showLoading(message);
    }
  }

  function hideLoading() {
    const app = getApp();
    if (app && typeof app.hideLoading === "function") {
      app.hideLoading();
    }
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }

  function cleanString(value, fallback) {
    const normalized = typeof value === "string" ? value.trim() : "";
    return normalized || fallback;
  }

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function extractJsonString(content) {
    const text = String(content || "").trim();
    if (!text) {
      return "";
    }

    const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fencedMatch && fencedMatch[1]) {
      return fencedMatch[1].trim();
    }

    const objectStart = text.indexOf("{");
    const objectEnd = text.lastIndexOf("}");
    if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
      return text.slice(objectStart, objectEnd + 1);
    }

    const arrayStart = text.indexOf("[");
    const arrayEnd = text.lastIndexOf("]");
    if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
      return text.slice(arrayStart, arrayEnd + 1);
    }

    return text;
  }

  function safeJsonParse(content) {
    try {
      return JSON.parse(extractJsonString(content));
    } catch (error) {
      return null;
    }
  }

  async function requestOpenAI(messages, expectedType) {
    const apiKey = getApiKey();
    if (!apiKey) {
      return { ok: false, reason: "missing-api-key", data: null };
    }

    try {
      const response = await fetch(OPENAI_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + apiKey
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          temperature: 0.7,
          messages: messages
        })
      });

      if (!response.ok) {
        return { ok: false, reason: "api-error", data: null };
      }

      const payload = await response.json();
      const messageContent = payload &&
        payload.choices &&
        payload.choices[0] &&
        payload.choices[0].message &&
        payload.choices[0].message.content;

      const parsed = safeJsonParse(messageContent);
      if (!parsed) {
        return { ok: false, reason: "invalid-json", data: null };
      }

      if (expectedType === "array" && !Array.isArray(parsed)) {
        return { ok: false, reason: "invalid-shape", data: null };
      }

      if (expectedType === "object" && (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))) {
        return { ok: false, reason: "invalid-shape", data: null };
      }

      return { ok: true, reason: null, data: parsed };
    } catch (error) {
      return { ok: false, reason: "network-error", data: null };
    }
  }

  function findBestRoadmapKey(goal) {
    const roadmapMap = data.roadmaps || {};
    const keys = Object.keys(roadmapMap);
    const normalizedGoal = String(goal || "").toLowerCase();

    const aliasMap = [
      { key: "Web Development", aliases: ["web", "frontend", "full stack", "fullstack", "website", "html", "css", "javascript"] },
      { key: "Machine Learning", aliases: ["machine learning", "ml", "ai", "model"] },
      { key: "Android Development", aliases: ["android", "mobile app", "kotlin", "app dev"] },
      { key: "Data Science", aliases: ["data science", "analytics", "analysis", "visualization"] },
      { key: "DSA & Competitive Coding", aliases: ["dsa", "algorithms", "competitive coding", "competitive programming", "leetcode"] },
      { key: "Cybersecurity", aliases: ["cyber", "security", "ethical hacking", "pentest"] },
      { key: "Cloud Computing", aliases: ["cloud", "aws", "azure", "gcp", "devops"] },
      { key: "UI/UX Design", aliases: ["ui", "ux", "design", "figma", "product design"] },
      { key: "Python Programming", aliases: ["python"] },
      { key: "Java Programming", aliases: ["java"] }
    ];

    for (let index = 0; index < aliasMap.length; index += 1) {
      const entry = aliasMap[index];
      if (entry.aliases.some((alias) => normalizedGoal.includes(alias))) {
        return entry.key;
      }
    }

    return keys[0] || "Web Development";
  }

  function normalizeTopic(topicItem, fallbackPrefix, index) {
    return {
      id: cleanString(topicItem && topicItem.id, fallbackPrefix + "-" + (index + 1)),
      title: cleanString(topicItem && topicItem.title, "Topic " + (index + 1)),
      description: cleanString(topicItem && topicItem.description, "Build understanding through focused study and practice."),
      estimate: cleanString(topicItem && topicItem.estimate, "1 week"),
      status: cleanString(topicItem && topicItem.status, "not-started")
    };
  }

  function normalizeRoadmapResult(result, goal, level, months) {
    const phases = ensureArray(result && result.phases).map(function (phase, phaseIndex) {
      const title = cleanString(phase && (phase.title || phase.phase), "Phase " + (phaseIndex + 1));
      const topics = ensureArray(phase && phase.topics).map(function (topicItem, topicIndex) {
        return normalizeTopic(topicItem, slugify(title) || "phase-" + (phaseIndex + 1), topicIndex);
      });
      return {
        title: title,
        description: cleanString(
          phase && phase.description,
          "A structured stage for building " + cleanString(goal, "your learning goal") + " with clear topic progression."
        ),
        topics: topics
      };
    }).filter(function (phase) {
      return phase.topics.length > 0;
    });

    return {
      goal: cleanString(result && result.goal, cleanString(goal, "Learning Goal")),
      level: cleanString(result && result.level, cleanString(level, "Beginner")),
      months: Number(result && result.months) || Number(months) || 3,
      phases: phases
    };
  }

  function buildFallbackRoadmap(goal, level, months) {
    const roadmapKey = findBestRoadmapKey(goal);
    const roadmapPhases = ensureArray((data.roadmaps || {})[roadmapKey]).map(function (phase, phaseIndex) {
      const title = cleanString(phase && (phase.title || phase.phase), "Phase " + (phaseIndex + 1));
      return {
        title: title,
        description: cleanString(
          phase && phase.description,
          "Follow this phase to make steady progress toward " + cleanString(goal || roadmapKey, roadmapKey) + "."
        ),
        topics: ensureArray(phase && phase.topics).map(function (topicItem, topicIndex) {
          return normalizeTopic(topicItem, slugify(roadmapKey) + "-phase-" + (phaseIndex + 1), topicIndex);
        })
      };
    });

    return {
      goal: cleanString(goal, roadmapKey),
      level: cleanString(level, "Beginner"),
      months: Number(months) || 3,
      phases: roadmapPhases
    };
  }

  function findStudyMaterial(topic) {
    const materials = data.studyMaterials || {};
    const normalizedTopic = String(topic || "").toLowerCase();
    const keys = Object.keys(materials);

    const aliases = {
      html: ["html", "semantic"],
      css: ["css", "flexbox", "grid", "responsive"],
      javascript: ["javascript", "js", "dom", "async"],
      python: ["python"],
      machineLearning: ["machine learning", "ml", "model", "regression", "classification"],
      dataScience: ["data science", "analytics", "pandas", "eda"],
      dsa: ["dsa", "algorithm", "array", "tree", "graph", "dynamic programming"],
      java: ["java", "oop", "collections"],
      cybersecurity: ["cyber", "security", "xss", "encryption"],
      cloudComputing: ["cloud", "aws", "azure", "gcp", "iam"],
      database: ["database", "sql", "join", "index"],
      git: ["git", "github", "commit", "branch"]
    };

    const aliasKeys = Object.keys(aliases);
    for (let index = 0; index < aliasKeys.length; index += 1) {
      const key = aliasKeys[index];
      if (aliases[key].some(function (alias) { return normalizedTopic.includes(alias); }) && materials[key]) {
        return materials[key];
      }
    }

    return materials[keys[0]] || {
      explanation: "Study material is not available for this topic yet, so use the roadmap and resources sections as a starting point.",
      keyConcepts: ["Basics", "Practice", "Revision"],
      mistakes: ["Skipping fundamentals", "Not practicing enough"],
      analogy: "Learning grows faster when you return to core ideas often.",
      codeExample: ""
    };
  }

  function normalizeStudyMaterial(result, topic) {
    return {
      explanation: cleanString(result && result.explanation, "Build a strong conceptual understanding of " + cleanString(topic, "this topic") + "."),
      keyConcepts: ensureArray(result && result.keyConcepts).filter(Boolean).slice(0, 8),
      mistakes: ensureArray(result && result.mistakes).filter(Boolean).slice(0, 8),
      analogy: cleanString(result && result.analogy, "Think of this topic as a system of connected building blocks."),
      codeExample: typeof (result && result.codeExample) === "string" ? result.codeExample.trim() : ""
    };
  }

  function buildFallbackStudyMaterial(topic, goal) {
    const base = findStudyMaterial(topic || goal);
    return normalizeStudyMaterial(base, topic || goal);
  }

  function findQuizBank(subject, topic) {
    const banks = data.quizQuestions || {};
    const requested = (String(subject || "") + " " + String(topic || "")).toLowerCase();
    const keys = Object.keys(banks);
    const aliasMap = [
      { key: "Web Development", aliases: ["web", "html", "css", "javascript", "frontend"] },
      { key: "Python", aliases: ["python"] },
      { key: "Machine Learning", aliases: ["machine learning", "ml"] },
      { key: "Data Science", aliases: ["data science", "analytics"] },
      { key: "DSA", aliases: ["dsa", "algorithm", "data structure", "competitive"] },
      { key: "Java", aliases: ["java"] },
      { key: "Cybersecurity", aliases: ["cyber", "security"] },
      { key: "Cloud Computing", aliases: ["cloud", "aws", "azure", "gcp"] },
      { key: "Database", aliases: ["database", "sql"] },
      { key: "Git", aliases: ["git", "github"] }
    ];

    for (let index = 0; index < aliasMap.length; index += 1) {
      const entry = aliasMap[index];
      if (entry.aliases.some(function (alias) { return requested.includes(alias); }) && banks[entry.key]) {
        return banks[entry.key];
      }
    }

    return banks[keys[0]] || [];
  }

  function normalizeQuizQuestion(item, index) {
    let options = ensureArray(item && item.options).filter(function (option) {
      return typeof option === "string" && option.trim();
    }).slice(0, 4);

    while (options.length < 4) {
      options.push("Option " + (options.length + 1));
    }

    let answerIndex = Number(item && item.answerIndex);
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) {
      answerIndex = 0;
    }

    return {
      question: cleanString(item && item.question, "Question " + (index + 1)),
      options: options,
      answerIndex: answerIndex,
      explanation: cleanString(item && item.explanation, "Review the related concept and try again."),
      weakArea: cleanString(item && item.weakArea, "Core Concept")
    };
  }

  function buildFallbackQuiz(subject, topic, count) {
    const bank = findQuizBank(subject, topic);
    const normalizedCount = Math.max(1, Math.min(Number(count) || 5, 10));
    const quiz = [];

    for (let index = 0; index < normalizedCount; index += 1) {
      const bankItem = bank[index % bank.length];
      if (bankItem) {
        quiz.push(normalizeQuizQuestion(bankItem, index));
      }
    }

    return quiz;
  }

  function normalizeFeedback(result, wrongAnswers) {
    const weakAreas = ensureArray(result && result.weakAreas).filter(Boolean).slice(0, 6);
    return {
      summary: cleanString(result && result.summary, "You are making progress. Review the weaker areas, then attempt another focused quiz."),
      weakAreas: weakAreas.length ? weakAreas : buildFallbackWeakAreas(wrongAnswers),
      advice: cleanString(result && result.advice, "Revise one weak area at a time, practice 5 to 10 questions, then re-test yourself.")
    };
  }

  function buildFallbackWeakAreas(wrongAnswers) {
    const areas = ensureArray(wrongAnswers).map(function (item) {
      if (typeof item === "string") {
        return item;
      }
      if (item && typeof item.weakArea === "string") {
        return item.weakArea;
      }
      if (item && typeof item.topic === "string") {
        return item.topic;
      }
      return "";
    }).filter(Boolean);

    return Array.from(new Set(areas)).slice(0, 6);
  }

  function buildFallbackFeedback(wrongAnswers) {
    const weakAreas = buildFallbackWeakAreas(wrongAnswers);
    return {
      summary: weakAreas.length
        ? "Your mistakes point to a few repeat topics. That is useful because it gives you a clear revision target."
        : "Your quiz review is ready. Use the explanations to reinforce the concepts you missed.",
      weakAreas: weakAreas,
      advice: weakAreas.length
        ? "Focus on " + weakAreas.join(", ") + ". Revisit the concept summary, solve a few targeted questions, and try another short quiz."
        : "Review the explanation for each missed answer, then practice a smaller focused set before retesting."
    };
  }

  async function generateRoadmap(goal, level, months) {
    const fallback = buildFallbackRoadmap(goal, level, months);
    const apiKey = getApiKey();
    if (!apiKey) {
      return fallback;
    }

    showLoading("Generating your personalized roadmap...");
    const result = await requestOpenAI([
      {
        role: "system",
        content: "You are StudyMind AI. Return only valid JSON. Create practical student learning roadmaps."
      },
      {
        role: "user",
        content:
          "Create a roadmap as JSON with this exact shape: " +
          "{\"goal\":\"string\",\"level\":\"string\",\"months\":number,\"phases\":[{\"title\":\"string\",\"description\":\"string\",\"topics\":[{\"id\":\"string\",\"title\":\"string\",\"description\":\"string\",\"estimate\":\"string\",\"status\":\"not-started\"}]}]} " +
          "Goal: " + cleanString(goal, "General Learning") + ". " +
          "Level: " + cleanString(level, "Beginner") + ". " +
          "Months: " + (Number(months) || 3) + ". " +
          "Keep it realistic for students."
      }
    ], "object");
    hideLoading();

    if (!result.ok) {
      showToast("AI roadmap unavailable", "Using a built-in roadmap for now. You can still continue smoothly.", "warning");
      return fallback;
    }

    const normalized = normalizeRoadmapResult(result.data, goal, level, months);
    if (!normalized.phases.length) {
      showToast("AI roadmap fallback", "The AI response was incomplete, so a local roadmap has been loaded instead.", "warning");
      return fallback;
    }

    return normalized;
  }

  async function generateStudyMaterial(topic, goal) {
    const fallback = buildFallbackStudyMaterial(topic, goal);
    const apiKey = getApiKey();
    if (!apiKey) {
      return fallback;
    }

    showLoading("Preparing study material...");
    const result = await requestOpenAI([
      {
        role: "system",
        content: "You are StudyMind AI. Return only valid JSON. Explain topics simply for students."
      },
      {
        role: "user",
        content:
          "Return JSON with this exact shape: " +
          "{\"explanation\":\"string\",\"keyConcepts\":[\"string\"],\"mistakes\":[\"string\"],\"analogy\":\"string\",\"codeExample\":\"string\"}. " +
          "Topic: " + cleanString(topic, "General Topic") + ". " +
          "Student goal: " + cleanString(goal, "Learn effectively") + ". " +
          "Keep it clear, practical, and concise."
      }
    ], "object");
    hideLoading();

    if (!result.ok) {
      showToast("AI study material unavailable", "Using built-in study notes for this topic.", "warning");
      return fallback;
    }

    return normalizeStudyMaterial(result.data, topic);
  }

  async function generateQuiz(subject, topic, difficulty, count) {
    const fallback = buildFallbackQuiz(subject, topic, count);
    const apiKey = getApiKey();
    if (!apiKey) {
      return fallback;
    }

    showLoading("Generating quiz questions...");
    const normalizedCount = Math.max(1, Math.min(Number(count) || 5, 10));
    const result = await requestOpenAI([
      {
        role: "system",
        content: "You are StudyMind AI. Return only valid JSON. Create accurate multiple-choice quiz questions for students."
      },
      {
        role: "user",
        content:
          "Return a JSON array. Each item must have this exact shape: " +
          "{\"question\":\"string\",\"options\":[\"string\",\"string\",\"string\",\"string\"],\"answerIndex\":number,\"explanation\":\"string\",\"weakArea\":\"string\"}. " +
          "Subject: " + cleanString(subject, "General Subject") + ". " +
          "Topic: " + cleanString(topic, "General Topic") + ". " +
          "Difficulty: " + cleanString(difficulty, "medium") + ". " +
          "Question count: " + normalizedCount + "."
      }
    ], "array");
    hideLoading();

    if (!result.ok) {
      showToast("AI quiz unavailable", "Using the built-in quiz bank so you can keep practicing.", "warning");
      return fallback;
    }

    const normalized = ensureArray(result.data).map(normalizeQuizQuestion).slice(0, normalizedCount);
    if (!normalized.length) {
      showToast("AI quiz fallback", "The AI response could not be used, so built-in questions were loaded instead.", "warning");
      return fallback;
    }

    while (normalized.length < normalizedCount && fallback[normalized.length]) {
      normalized.push(fallback[normalized.length]);
    }

    return normalized;
  }

  async function generateQuizFeedback(wrongAnswers) {
    const fallback = buildFallbackFeedback(wrongAnswers);
    const apiKey = getApiKey();
    if (!apiKey) {
      return fallback;
    }

    showLoading("Analyzing your quiz results...");
    const result = await requestOpenAI([
      {
        role: "system",
        content: "You are StudyMind AI. Return only valid JSON. Give supportive quiz feedback for students."
      },
      {
        role: "user",
        content:
          "Return JSON with this exact shape: " +
          "{\"summary\":\"string\",\"weakAreas\":[\"string\"],\"advice\":\"string\"}. " +
          "Wrong answers data: " + JSON.stringify(ensureArray(wrongAnswers).slice(0, 10)) + ". " +
          "Summarize patterns and give concise revision advice."
      }
    ], "object");
    hideLoading();

    if (!result.ok) {
      showToast("AI feedback unavailable", "Showing built-in performance guidance for now.", "warning");
      return fallback;
    }

    return normalizeFeedback(result.data, wrongAnswers);
  }

  window.StudyMindAI = {
    generateRoadmap: generateRoadmap,
    generateStudyMaterial: generateStudyMaterial,
    generateQuiz: generateQuiz,
    generateQuizFeedback: generateQuizFeedback
  };
})();
