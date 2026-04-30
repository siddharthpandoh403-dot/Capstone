(function () {
  const STORAGE_KEYS = {
    profile: "studymind-profile",
    roadmap: "studymind-roadmap",
    quizHistory: "studymind-quiz-history",
    weakTopics: "studymind-weak-topics",
    timetable: "studymind-timetable",
    badges: "studymind-badges",
    theme: "studymind-theme"
  };

  function getData(key, defaultValue) {
    try {
      const rawValue = localStorage.getItem(key);
      if (rawValue === null) {
        return defaultValue;
      }
      return JSON.parse(rawValue);
    } catch (error) {
      console.error("Failed to read localStorage key:", key, error);
      return defaultValue;
    }
  }

  function setData(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Failed to write localStorage key:", key, error);
      return false;
    }
  }

  function removeData(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Failed to remove localStorage key:", key, error);
      return false;
    }
  }

  function normalizeRoadmapPhases(roadmap) {
    if (Array.isArray(roadmap)) {
      return roadmap;
    }
    if (roadmap && Array.isArray(roadmap.phases)) {
      return roadmap.phases;
    }
    return [];
  }

  function getProfile() {
    return getData(STORAGE_KEYS.profile, null);
  }

  function saveProfile(profile) {
    const current = getProfile() || {};
    const nextProfile = {
      name: profile.name || current.name || "",
      goal: profile.goal || current.goal || "",
      apiKey: typeof profile.apiKey === "string" ? profile.apiKey.trim() : current.apiKey || "",
      streak: Number.isFinite(profile.streak) ? profile.streak : current.streak || 0,
      lastActiveDate: profile.lastActiveDate || current.lastActiveDate || "",
      createdAt: current.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return setData(STORAGE_KEYS.profile, nextProfile);
  }

  function getRoadmap() {
    return getData(STORAGE_KEYS.roadmap, []);
  }

  function saveRoadmap(roadmap) {
    const normalized = Array.isArray(roadmap)
      ? roadmap
      : roadmap && Array.isArray(roadmap.phases)
        ? roadmap.phases
        : [];
    return setData(STORAGE_KEYS.roadmap, normalized);
  }

  function getQuizHistory() {
    return getData(STORAGE_KEYS.quizHistory, []);
  }

  function saveQuizResult(result) {
    const history = getQuizHistory();
    const score = Number(result.score) || 0;
    const total = Number(result.total) || 0;
    const percentage = Number.isFinite(Number(result.percentage)) && Number(result.percentage) > 0
      ? Number(result.percentage)
      : total
        ? Math.round((score / total) * 100)
        : 0;

    const nextResult = {
      date: result.date || new Date().toLocaleDateString(),
      subject: result.subject || "General",
      topic: result.topic || "General",
      difficulty: result.difficulty || "Medium",
      score: score,
      total: total,
      percentage: percentage,
      createdAt: result.createdAt || new Date().toISOString()
    };
    history.unshift(nextResult);
    return setData(STORAGE_KEYS.quizHistory, history.slice(0, 100));
  }

  function getWeakTopics() {
    return getData(STORAGE_KEYS.weakTopics, []);
  }

  function saveWeakTopics(topics) {
    const uniqueTopics = Array.from(new Set((topics || []).filter(Boolean)));
    return setData(STORAGE_KEYS.weakTopics, uniqueTopics);
  }

  function getTimetable() {
    return getData(STORAGE_KEYS.timetable, []);
  }

  function saveTimetable(timetable) {
    return setData(STORAGE_KEYS.timetable, Array.isArray(timetable) ? timetable : []);
  }

  function getBadges() {
    return getData(STORAGE_KEYS.badges, []);
  }

  function saveBadges(badges) {
    return setData(STORAGE_KEYS.badges, Array.isArray(badges) ? badges : []);
  }

  function getTheme() {
    return getData(STORAGE_KEYS.theme, "dark");
  }

  function saveTheme(theme) {
    const normalizedTheme = theme === "light" ? "light" : "dark";
    return setData(STORAGE_KEYS.theme, normalizedTheme);
  }

  function updateStudyStreak() {
    const profile = getProfile();
    if (!profile) {
      return 0;
    }

    const today = new Date();
    const todayKey = today.toISOString().split("T")[0];
    const lastActiveDate = profile.lastActiveDate || "";

    if (lastActiveDate === todayKey) {
      return profile.streak || 0;
    }

    let nextStreak = 1;
    if (lastActiveDate) {
      const previous = new Date(lastActiveDate);
      const difference = Math.floor((today - previous) / (1000 * 60 * 60 * 24));
      if (difference === 1) {
        nextStreak = (profile.streak || 0) + 1;
      }
    }

    saveProfile({
      ...profile,
      streak: nextStreak,
      lastActiveDate: todayKey
    });

    return nextStreak;
  }

  function calculateOverallProgress() {
    const roadmap = normalizeRoadmapPhases(getRoadmap());
    const quizHistory = getQuizHistory();
    const timetable = getTimetable();
    const badges = getBadges();

    const allTopics = roadmap.flatMap(function (phase) {
      return Array.isArray(phase && phase.topics) ? phase.topics : [];
    });

    const roadmapProgress = allTopics.length
      ? Math.round((allTopics.filter(function (topic) {
          return topic && (topic.status === "done" || topic.status === "completed" || topic.completed);
        }).length / allTopics.length) * 100)
      : 0;

    const quizAverage = quizHistory.length
      ? Math.round(quizHistory.reduce(function (sum, item) {
          return sum + (item.percentage || 0);
        }, 0) / quizHistory.length)
      : 0;

    const timetableProgress = timetable.length ? 100 : 0;
    const badgeProgress = Math.min(badges.length * 20, 100);

    return Math.round((roadmapProgress + quizAverage + timetableProgress + badgeProgress) / 4);
  }

  window.StudyMindStorage = {
    STORAGE_KEYS,
    getData,
    setData,
    removeData,
    getProfile,
    saveProfile,
    getRoadmap,
    saveRoadmap,
    getQuizHistory,
    saveQuizResult,
    getWeakTopics,
    saveWeakTopics,
    getTimetable,
    saveTimetable,
    getBadges,
    saveBadges,
    getTheme,
    saveTheme,
    updateStudyStreak,
    calculateOverallProgress,
    normalizeRoadmapPhases
  };
})();
