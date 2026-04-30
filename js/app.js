(function () {
  const storage = window.StudyMindStorage;
  const seedData = window.StudyMindData || {};

  const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: "🏠", href: "./index.html" },
    { id: "roadmap", label: "Roadmap", icon: "🧭", href: "./roadmap.html" },
    { id: "quiz", label: "Quiz", icon: "🧠", href: "./quiz.html" },
    { id: "timetable", label: "Timetable", icon: "🗓️", href: "./timetable.html" },
    { id: "resources", label: "Resources", icon: "📚", href: "./resources.html" },
    { id: "competitions", label: "Competitions", icon: "🏆", href: "./competitions.html" },
    { id: "progress", label: "Progress", icon: "📈", href: "./progress.html" }
  ];

  const BADGE_LIBRARY = [
    {
      id: "quiz-master",
      title: "Quiz Master",
      condition: function (context) {
        return context.quizHistory.some(function (entry) {
          const percent = entry.percentage || (entry.total ? Math.round((entry.score / entry.total) * 100) : 0);
          return percent === 100;
        });
      }
    },
    {
      id: "seven-day-streak",
      title: "7-Day Streak",
      condition: function (context) {
        return context.streak >= 7;
      }
    },
    {
      id: "topic-conquered",
      title: "Topic Conquered",
      condition: function (context) {
        return context.roadmapTopics.some(function (topic) {
          return topic && (topic.status === "done" || topic.status === "completed");
        });
      }
    },
    {
      id: "roadmap-starter",
      title: "Roadmap Starter",
      condition: function (context) {
        return context.roadmapPhases.length > 0;
      }
    },
    {
      id: "resource-explorer",
      title: "Resource Explorer",
      condition: function (context) {
        return context.resourceVisits >= 5;
      }
    }
  ];

  const page = document.documentElement.dataset.page || "dashboard";
  const sidebar = document.getElementById("sidebar");
  const topbar = document.getElementById("topbar");
  const bottomNav = document.getElementById("bottomNav");
  const modalRoot = document.getElementById("modalRoot");
  const toastRoot = document.getElementById("toastRoot");
  const loadingOverlay = document.getElementById("loadingOverlay");

  function initializeApp() {
    applyTheme(storage.getTheme());
    renderNavigation();
    renderTopbar();
    registerGlobalEvents();
    const streak = storage.updateStudyStreak();
    checkAndAwardBadges(streak);
    if (page === "dashboard") {
      renderDashboard();
    }
    openSetupOnFirstLaunch();
  }

  function getRoadmapPhases(roadmap) {
    if (typeof storage.normalizeRoadmapPhases === "function") {
      return storage.normalizeRoadmapPhases(roadmap);
    }
    if (Array.isArray(roadmap)) {
      return roadmap;
    }
    if (roadmap && Array.isArray(roadmap.phases)) {
      return roadmap.phases;
    }
    return [];
  }

  function getAllRoadmapTopics(roadmap) {
    return getRoadmapPhases(roadmap).flatMap(function (phase) {
      return Array.isArray(phase && phase.topics) ? phase.topics : [];
    });
  }

  function getBadgeMeta(badgeId) {
    const definitions = Array.isArray(seedData.badgeDefinitions) ? seedData.badgeDefinitions : [];
    return definitions.find(function (badge) { return badge.id === badgeId; }) || {};
  }

  function getResourceVisitCount() {
    return storage.getData("studymind-resource-visits", []).length;
  }

  function renderNavigation() {
    const navMarkup = NAV_ITEMS.map(createNavLink).join("");
    if (sidebar) {
      sidebar.innerHTML = `
        <div class="sidebar-panel">
          <div class="brand">
            <div class="brand-mark">✨</div>
            <div class="brand-text">
              <strong>StudyMind AI</strong>
              <span>Personalized learning OS</span>
            </div>
          </div>
          <nav class="sidebar-nav" aria-label="Sidebar Navigation">
            ${navMarkup}
          </nav>
          <div class="sidebar-footer">
            <div class="sidebar-tip">
              <strong>Smart routine</strong>
              <p>Plan, practice, and measure your growth from one calm workspace.</p>
            </div>
          </div>
        </div>
      `;
    }
    if (bottomNav) {
      bottomNav.innerHTML = NAV_ITEMS.map(createNavLink).join("");
    }
  }

  function createNavLink(item) {
    const activeClass = item.id === page ? "active" : "";
    return `
      <a class="nav-link ${activeClass}" href="${item.href}" data-nav-id="${item.id}">
        <span>${item.icon}</span>
        <span>${item.label}</span>
      </a>
    `;
  }

  function renderTopbar() {
    if (!topbar) {
      return;
    }
    const profile = storage.getProfile();
    const name = profile && profile.name ? profile.name : "Guest Student";
    const goal = profile && profile.goal ? profile.goal : "Set your main goal";
    const initials = name.split(" ").map(function (part) { return part[0]; }).join("").slice(0, 2).toUpperCase();

    topbar.innerHTML = `
      <div class="topbar-title">
        <h2>${getPageTitle()}</h2>
        <p>${escapeHtml(goal)}</p>
      </div>
      <div class="topbar-actions">
        <button class="theme-toggle" id="themeToggleButton" type="button" aria-label="Toggle theme">🌗</button>
        <button class="icon-button" id="topbarSettingsButton" type="button" aria-label="Open settings">⚙️</button>
        <div class="profile-pill">
          <div class="profile-avatar">${escapeHtml(initials || "SM")}</div>
          <div class="profile-meta">
            <span>Active learner</span>
            <strong>${escapeHtml(name)}</strong>
          </div>
        </div>
      </div>
    `;
  }

  function getPageTitle() {
    const currentPage = NAV_ITEMS.find(function (item) { return item.id === page; });
    return currentPage ? currentPage.label : "StudyMind AI";
  }

  function registerGlobalEvents() {
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("submit", handleDocumentSubmit);
  }

  function handleDocumentClick(event) {
    const backButton = event.target.closest("[data-back-button]");
    if (backButton) {
      if (window.history.length > 1) {
        history.back();
      } else {
        window.location.href = "./index.html";
      }
      return;
    }

    if (event.target.closest("#themeToggleButton")) {
      toggleTheme();
      return;
    }

    if (
      event.target.closest("#topbarSettingsButton") ||
      event.target.closest("#openApiSettingsButton") ||
      event.target.closest("#openApiSettingsButtonSecondary")
    ) {
      openApiSettingsModal();
      return;
    }

    if (event.target.closest("#openSetupButton")) {
      openSetupModal();
      return;
    }

    if (event.target.closest("#refreshDashboardButton")) {
      renderDashboard();
      showToast("Dashboard refreshed", "Your latest local progress has been recalculated.", "success");
      return;
    }

    if (event.target.closest("#dashboardResetButton") || event.target.closest("#resetAllDataButton")) {
      openResetConfirmationModal();
      return;
    }

    if (event.target.matches("[data-close-modal]") || event.target.classList.contains("modal")) {
      closeModal();
    }
  }

  function handleDocumentSubmit(event) {
    if (event.target.matches("#setupForm")) {
      event.preventDefault();
      handleSetupSubmit(event.target);
      return;
    }

    if (event.target.matches("#apiSettingsForm")) {
      event.preventDefault();
      handleApiSettingsSubmit(event.target);
    }
  }

  function applyTheme(theme) {
    const nextTheme = theme === "light" ? "light" : "dark";
    document.body.classList.toggle("theme-dark", nextTheme === "dark");
    document.body.classList.toggle("theme-light", nextTheme === "light");
    storage.saveTheme(nextTheme);
  }

  function toggleTheme() {
    const isDark = document.body.classList.contains("theme-dark");
    const nextTheme = isDark ? "light" : "dark";
    applyTheme(nextTheme);
    showToast("Theme updated", `Switched to ${nextTheme} mode.`, "success");
  }

  function showToast(title, message, tone) {
    if (!toastRoot) {
      return;
    }

    const toast = document.createElement("div");
    toast.className = `toast ${tone || "success"}`;
    toast.innerHTML = `
      <span class="toast-title">${escapeHtml(title)}</span>
      <span class="toast-message">${escapeHtml(message)}</span>
    `;
    toastRoot.appendChild(toast);

    window.setTimeout(function () {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-6px)";
      window.setTimeout(function () { toast.remove(); }, 200);
    }, 3000);
  }

  function showLoading(message) {
    if (!loadingOverlay) {
      return;
    }
    const text = loadingOverlay.querySelector("p");
    if (text && message) {
      text.textContent = message;
    }
    loadingOverlay.classList.remove("hidden");
  }

  function hideLoading() {
    if (loadingOverlay) {
      loadingOverlay.classList.add("hidden");
    }
  }

  function openSetupOnFirstLaunch() {
    if (page !== "dashboard") {
      return;
    }
    const profile = storage.getProfile();
    if (!profile || !profile.name || !profile.goal) {
      window.setTimeout(function () {
        openSetupModal(true);
      }, 250);
    }
  }

  function openModal(content) {
    if (!modalRoot) {
      return;
    }

    modalRoot.innerHTML = `
      <div class="modal open" role="dialog" aria-modal="true">
        <div class="modal-panel">
          ${content}
        </div>
      </div>
    `;
  }

  function closeModal() {
    if (modalRoot) {
      modalRoot.innerHTML = "";
    }
  }

  function openSetupModal(isFirstLaunch) {
    const profile = storage.getProfile() || {};
    openModal(`
      <div class="modal-header">
        <div>
          <h2>${isFirstLaunch ? "Welcome to StudyMind AI" : "Update your study profile"}</h2>
          <p>Create your learning identity once, and the app can personalize future roadmap, quiz, and planning features around it.</p>
        </div>
        ${isFirstLaunch ? "" : '<button class="icon-button" type="button" data-close-modal aria-label="Close modal">✕</button>'}
      </div>
      <form id="setupForm" class="form-grid">
        <div class="form-row">
          <label class="form-label" for="studentName">Student name</label>
          <input class="form-control" id="studentName" name="studentName" type="text" placeholder="Enter your full name" value="${escapeAttribute(profile.name || "")}" required>
        </div>
        <div class="form-row">
          <label class="form-label" for="learningGoal">Main learning goal</label>
          <textarea class="form-control" id="learningGoal" name="learningGoal" placeholder="Example: Crack final year placement prep, improve DSA, and stay consistent with semester revision." required>${escapeHtml(profile.goal || "")}</textarea>
        </div>
        <div class="form-row">
          <label class="form-label" for="openAiKey">OpenAI API key <span class="form-help">(optional)</span></label>
          <input class="form-control" id="openAiKey" name="openAiKey" type="password" placeholder="Paste your API key if you want to save it locally" value="${escapeAttribute(profile.apiKey || "")}">
          <p class="form-help">Security note: API key is stored locally in browser localStorage for demo purposes.</p>
        </div>
        <div class="modal-footer">
          ${isFirstLaunch ? "" : '<button class="secondary-button" type="button" data-close-modal>Cancel</button>'}
          <button class="gradient-button" type="submit">Save Profile</button>
        </div>
      </form>
    `);
  }

  function handleSetupSubmit(form) {
    const formData = new FormData(form);
    const currentProfile = storage.getProfile() || {};
    const profile = {
      name: String(formData.get("studentName") || "").trim(),
      goal: String(formData.get("learningGoal") || "").trim(),
      apiKey: String(formData.get("openAiKey") || "").trim(),
      streak: currentProfile.streak || 0,
      lastActiveDate: currentProfile.lastActiveDate || ""
    };

    if (!profile.name || !profile.goal) {
      showToast("Profile incomplete", "Please add your name and main learning goal.", "warning");
      return;
    }

    storage.saveProfile(profile);
    renderTopbar();
    if (page === "dashboard") {
      renderDashboard();
    }
    closeModal();
    showToast("Profile saved", "StudyMind AI is now personalized for you.", "success");
  }

  function openApiSettingsModal() {
    const profile = storage.getProfile() || {};
    openModal(`
      <div class="modal-header">
        <div>
          <h2>API key and settings</h2>
          <p>Save your optional OpenAI API key locally on this browser, or reset the app data if you want a clean start.</p>
        </div>
        <button class="icon-button" type="button" data-close-modal aria-label="Close modal">✕</button>
      </div>
      <form id="apiSettingsForm" class="form-grid">
        <div class="form-row">
          <label class="form-label" for="apiKeyField">OpenAI API key</label>
          <input class="form-control" id="apiKeyField" name="apiKeyField" type="password" placeholder="Stored only in localStorage on this device" value="${escapeAttribute(profile.apiKey || "")}">
          <p class="form-help">Security note: API key is stored locally in browser localStorage for demo purposes.</p>
        </div>
        <div class="form-row">
          <button class="danger-button" id="resetAllDataButton" type="button">Reset All Data</button>
          <p class="form-help">This clears profile, roadmap, quiz history, timetable, badges, weak topics, and theme preferences.</p>
        </div>
        <div class="modal-footer">
          <button class="secondary-button" type="button" data-close-modal>Cancel</button>
          <button class="gradient-button" type="submit">Save Settings</button>
        </div>
      </form>
    `);
  }

  function handleApiSettingsSubmit(form) {
    const formData = new FormData(form);
    const currentProfile = storage.getProfile() || {};
    storage.saveProfile({
      ...currentProfile,
      apiKey: String(formData.get("apiKeyField") || "").trim()
    });
    renderTopbar();
    closeModal();
    showToast("Settings updated", "Your local API preference has been saved.", "success");
  }

  function openResetConfirmationModal() {
    openModal(`
      <div class="modal-header">
        <div>
          <h2>Reset StudyMind AI?</h2>
          <p>This will permanently remove your local profile, streak, quiz history, roadmap, timetable, badges, weak topics, and theme settings from this browser.</p>
        </div>
        <button class="icon-button" type="button" data-close-modal aria-label="Close modal">✕</button>
      </div>
      <div class="form-grid">
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <h3>Make sure you want a fresh start</h3>
          <p>Reset is useful during development, demos, or when you want to re-run the onboarding flow from scratch.</p>
        </div>
        <div class="modal-footer">
          <button class="secondary-button" type="button" data-close-modal>Keep My Data</button>
          <button class="danger-button" type="button" id="confirmResetDataButton">Yes, Reset Everything</button>
        </div>
      </div>
    `);

    const confirmButton = document.getElementById("confirmResetDataButton");
    if (confirmButton) {
      confirmButton.addEventListener("click", resetAllData, { once: true });
    }
  }

  function resetAllData() {
    showLoading("Resetting your workspace...");
    Object.values(storage.STORAGE_KEYS).forEach(function (key) {
      storage.removeData(key);
    });
    storage.removeData("studymind-resource-visits");
    window.setTimeout(function () {
      hideLoading();
      closeModal();
      applyTheme("dark");
      renderTopbar();
      if (page === "dashboard") {
        renderDashboard();
      }
      showToast("Workspace reset", "All local StudyMind AI data has been cleared.", "warning");
      openSetupOnFirstLaunch();
    }, 500);
  }

  function renderDashboard() {
    const profile = storage.getProfile();
    const streak = storage.updateStudyStreak();
    const progress = storage.calculateOverallProgress();
    const badges = storage.getBadges();
    const roadmap = getRoadmapPhases(storage.getRoadmap());
    const quizHistory = storage.getQuizHistory();
    const weakTopics = storage.getWeakTopics();
    const timetable = storage.getTimetable();
    const todaySlots = getTodayTimetableSlots(timetable);
    const currentMilestone = getCurrentRoadmapMilestone(roadmap);
    const upcomingCompetitions = getUpcomingCompetitions();
    const badgePreview = getBadgePreview(badges);

    renderDashboardStats({
      streak: streak,
      progress: progress,
      badges: badges.length,
      weakTopics: weakTopics.length,
      quizzesTaken: quizHistory.length,
      todaySlots: todaySlots.length
    });

    const greeting = document.getElementById("dashboardGreeting");
    const summary = document.getElementById("dashboardSummary");
    const progressBar = document.getElementById("dashboardProgressBar");
    const progressLabel = document.getElementById("dashboardProgressLabel");
    const streakNode = document.getElementById("dashboardStreak");
    const badgeNode = document.getElementById("dashboardBadges");
    const goalNode = document.getElementById("dashboardGoal");
    const heroMilestone = document.getElementById("dashboardHeroMilestone");
    const snapshot = document.getElementById("profileSnapshot");
    const suggestions = document.getElementById("dashboardSuggestions");
    const roadmapMilestone = document.getElementById("roadmapMilestone");
    const todaysTimetable = document.getElementById("todaysTimetable");
    const weakTopicsPanel = document.getElementById("weakTopicsPanel");
    const competitionsPreview = document.getElementById("competitionsPreview");
    const badgesPreview = document.getElementById("badgesPreview");

    if (greeting) {
      greeting.textContent = profile && profile.name ? `Welcome back, ${profile.name}` : "Welcome to StudyMind AI";
    }
    if (summary) {
      summary.textContent = profile && profile.goal
        ? `Your main goal is "${profile.goal}". This dashboard keeps your learning plan, practice, and consistency aligned around it.`
        : "Set up your profile to personalize roadmap suggestions, quizzes, study plans, and competition tracking.";
    }
    if (progressBar) {
      progressBar.style.width = `${Math.max(progress, 6)}%`;
    }
    if (progressLabel) {
      progressLabel.textContent = `${progress}%`;
    }
    if (streakNode) {
      streakNode.textContent = `${streak} ${streak === 1 ? "day" : "days"}`;
    }
    if (badgeNode) {
      badgeNode.textContent = `${badges.length} earned`;
    }
    if (goalNode) {
      goalNode.textContent = profile && profile.goal ? profile.goal : "Not set";
    }
    if (heroMilestone) {
      heroMilestone.textContent = currentMilestone.title;
    }
    if (snapshot) {
      snapshot.innerHTML = `
        ${renderSnapshotRow("Student", profile && profile.name ? profile.name : "Not added")}
        ${renderSnapshotRow("Main goal", profile && profile.goal ? profile.goal : "Not added")}
        ${renderSnapshotRow("Saved API key", profile && profile.apiKey ? "Configured" : "Not added")}
        ${renderSnapshotRow("Overall progress", `${progress}%`)}
        ${renderSnapshotRow("Quiz sessions", String(quizHistory.length))}
        ${renderSnapshotRow("Today's slots", String(todaySlots.length))}
      `;
    }
    if (suggestions) {
      suggestions.innerHTML = buildDashboardSuggestions({ profile: profile, roadmap: roadmap, quizHistory: quizHistory, weakTopics: weakTopics, timetable: timetable, progress: progress });
    }
    if (roadmapMilestone) {
      roadmapMilestone.innerHTML = renderRoadmapMilestone(currentMilestone);
    }
    if (todaysTimetable) {
      todaysTimetable.innerHTML = renderTodaysTimetable(todaySlots);
    }
    if (weakTopicsPanel) {
      weakTopicsPanel.innerHTML = renderWeakTopicsPanel(weakTopics);
    }
    if (competitionsPreview) {
      competitionsPreview.innerHTML = renderCompetitionsPreview(upcomingCompetitions);
    }
    if (badgesPreview) {
      badgesPreview.innerHTML = renderBadgesPreview(badgePreview);
    }
  }

  function renderDashboardStats(values) {
    const container = document.getElementById("dashboardStats");
    if (!container) {
      return;
    }

    container.innerHTML = `
      ${renderStatCard("🔥", "Study streak", `${values.streak} days`, "Consistency compounds over time.")}
      ${renderStatCard("📈", "Overall progress", `${values.progress}%`, "Blended from roadmap, quizzes, timetable, and badges.")}
      ${renderStatCard("🧠", "Quizzes taken", `${values.quizzesTaken}`, values.quizzesTaken ? "Your practice history is building." : "No quiz sessions yet.")}
      ${renderStatCard("🏅", "Badges earned", `${values.badges}`, values.badges ? "Milestones awarded for activity and progress." : "Your first badge is close.")}
      ${renderStatCard("🗓️", "Today's slots", `${values.todaySlots}`, values.todaySlots ? "Your study day already has structure." : "No timetable slots planned today.")}
      ${renderStatCard("🎯", "Weak topics", `${values.weakTopics}`, values.weakTopics ? "Review these areas with extra care." : "No weak topics highlighted yet.")}
    `;
  }

  function renderStatCard(icon, title, value, description) {
    return `
      <article class="stat-card">
        <div class="stat-icon">${icon}</div>
        <h3>${escapeHtml(title)}</h3>
        <strong>${escapeHtml(value)}</strong>
        <p>${escapeHtml(description)}</p>
      </article>
    `;
  }

  function renderSnapshotRow(label, value) {
    return `
      <div class="snapshot-row">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    `;
  }

  function buildDashboardSuggestions(context) {
    const suggestions = [];

    if (!context.profile || !context.profile.name) {
      suggestions.push({ icon: "👤", title: "Finish onboarding", text: "Add your student name and main learning goal so StudyMind AI can personalize upcoming features." });
    }
    if (!context.roadmap.length) {
      suggestions.push({ icon: "🧭", title: "Create your first roadmap", text: "Roadmap planning will help break your big goal into visible milestones and study phases." });
    }
    if (!context.timetable.length) {
      suggestions.push({ icon: "🗓️", title: "Design a weekly timetable", text: "A realistic study schedule will make your dashboard feel actionable, not just informative." });
    }
    if (!context.quizHistory.length) {
      suggestions.push({ icon: "🧠", title: "Start quiz practice", text: "Use quizzes regularly to identify weak topics and reinforce recall." });
    }
    if (context.weakTopics.length) {
      suggestions.push({ icon: "🚨", title: "Revisit weak topics", text: "Spend your next focused session reviewing the concepts that caused recent mistakes." });
    }
    if (context.progress >= 50) {
      suggestions.push({ icon: "🚀", title: "You have momentum", text: "Your foundation is getting stronger. Keep the system steady and the results will compound." });
    }

    return suggestions.slice(0, 4).map(function (item) {
      return `
        <div class="stack-item">
          <span>${item.icon}</span>
          <div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.text)}</p>
          </div>
        </div>
      `;
    }).join("");
  }

  function getTodayTimetableSlots(timetable) {
    const list = Array.isArray(timetable) ? timetable : [];
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const today = days[new Date().getDay()];

    return list.filter(function (slot) {
      const dayValue = String(slot && (slot.day || slot.date || slot.label || "")).toLowerCase();
      return dayValue.includes(today) || dayValue === "daily" || dayValue === "everyday";
    }).slice(0, 4);
  }

  function getCurrentRoadmapMilestone(roadmap) {
    const roadmapList = getRoadmapPhases(roadmap);
    for (let phaseIndex = 0; phaseIndex < roadmapList.length; phaseIndex += 1) {
      const phase = roadmapList[phaseIndex];
      const topics = Array.isArray(phase && phase.topics) ? phase.topics : [];
      for (let topicIndex = 0; topicIndex < topics.length; topicIndex += 1) {
        const topic = topics[topicIndex];
        const isComplete = topic && (topic.status === "done" || topic.status === "completed");
        if (!isComplete) {
          return {
            title: topic && topic.title ? topic.title : (phase && (phase.title || phase.phase)) || "Start your first milestone",
            description: topic && topic.description ? topic.description : "Move one step at a time and mark progress as you go.",
            estimate: topic && topic.estimate ? topic.estimate : "1 week",
            phaseTitle: (phase && (phase.title || phase.phase)) || "Roadmap setup"
          };
        }
      }
    }

    if (roadmapList.length) {
      return {
        title: "Roadmap completed",
        description: "You have completed the saved roadmap structure. Time to level up your next learning goal.",
        estimate: "Completed",
        phaseTitle: "Milestone achieved"
      };
    }

    return {
      title: "Set up your roadmap",
      description: "Create or generate a roadmap to break your learning goal into practical milestones.",
      estimate: "Ready when you are",
      phaseTitle: "No roadmap yet"
    };
  }

  function getUpcomingCompetitions() {
    const competitions = seedData && seedData.competitions ? seedData.competitions : {};
    const coding = Array.isArray(competitions.codingCompetitions) ? competitions.codingCompetitions.slice(0, 2) : [];
    const hackathons = Array.isArray(competitions.hackathons) ? competitions.hackathons.slice(0, 1) : [];
    const certifications = Array.isArray(competitions.certificationExams) ? competitions.certificationExams.slice(0, 1) : [];
    return coding.concat(hackathons, certifications).slice(0, 4);
  }

  function getBadgePreview(badges) {
    const earnedBadgeIds = new Set((Array.isArray(badges) ? badges : []).map(function (badge) { return badge.id; }));
    const definitions = Array.isArray(seedData.badgeDefinitions) ? seedData.badgeDefinitions : [];
    return definitions.slice(0, 5).map(function (badge) {
      return {
        id: badge.id,
        title: badge.title,
        description: badge.description,
        icon: badge.icon || "🏅",
        earned: earnedBadgeIds.has(badge.id)
      };
    });
  }

  function renderRoadmapMilestone(milestone) {
    if (!milestone) {
      return renderInlineEmptyState("🧭", "No roadmap yet", "Create your roadmap to see your active milestone here.");
    }

    return `
      <div class="info-card">
        <div class="item-topline">
          <h3>${escapeHtml(milestone.title)}</h3>
          <span class="badge badge-primary">${escapeHtml(milestone.phaseTitle)}</span>
        </div>
        <p>${escapeHtml(milestone.description)}</p>
        <div class="info-meta">
          <span class="info-pill">⏳ ${escapeHtml(milestone.estimate)}</span>
        </div>
      </div>
    `;
  }

  function renderTodaysTimetable(slots) {
    if (!slots.length) {
      return renderInlineEmptyState("🗓️", "No study slots today", "Plan today's focus in the timetable page so your dashboard becomes action-oriented.");
    }

    return `
      <div class="schedule-list">
        ${slots.map(function (slot) {
          return `
            <div class="schedule-item">
              <div class="item-topline">
                <h3>${escapeHtml(slot.title || slot.subject || "Study Block")}</h3>
                <span class="badge badge-accent">${escapeHtml(slot.time || slot.duration || "Planned")}</span>
              </div>
              <p>${escapeHtml(slot.description || slot.note || slot.day || "A focused study session scheduled for today.")}</p>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderWeakTopicsPanel(weakTopics) {
    const topics = Array.isArray(weakTopics) ? weakTopics : [];
    if (!topics.length) {
      return renderInlineEmptyState("🎯", "No weak topics flagged", "After quiz practice, the most difficult topics will appear here for faster revision.");
    }

    return `
      <div class="weak-topics-list">
        ${topics.slice(0, 5).map(function (item) {
          return `
            <div class="weak-topic-item">
              <div class="item-topline">
                <h3>${escapeHtml(typeof item === "string" ? item : item.topic || item.title || "Weak Topic")}</h3>
                <span class="badge badge-warning">Needs review</span>
              </div>
              <p>${escapeHtml(typeof item === "string" ? "Prioritize this concept in your next revision session." : item.description || "This concept needs one more focused revision cycle.")}</p>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderCompetitionsPreview(items) {
    if (!items.length) {
      return renderInlineEmptyState("🏆", "No competition data", "Curated competitions will appear here so you can discover strong opportunities faster.");
    }

    return `
      <div class="competition-list">
        ${items.map(function (item) {
          return `
            <a class="competition-item" href="${escapeAttribute(item.link || "#")}" target="_blank" rel="noopener noreferrer">
              <div class="item-topline">
                <h3>${escapeHtml(item.name || "Competition")}</h3>
                <span class="badge badge-secondary">${escapeHtml(item.level || item.format || item.provider || "Opportunity")}</span>
              </div>
              <p>${escapeHtml(item.bestFor || item.category || item.domain || "A useful opportunity to sharpen your profile.")}</p>
            </a>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderBadgesPreview(items) {
    if (!items.length) {
      return renderInlineEmptyState("🏅", "No badges defined", "Badge milestones will appear here as soon as the app has more activity data.");
    }

    return `
      <div class="badge-list">
        ${items.map(function (badge) {
          return `
            <div class="badge-item ${badge.earned ? "is-earned" : "is-locked"}">
              <div class="item-topline">
                <h3>${escapeHtml(badge.icon)} ${escapeHtml(badge.title)}</h3>
                <span class="badge ${badge.earned ? "badge-success" : "badge-warning"}">${badge.earned ? "Earned" : "Locked"}</span>
              </div>
              <p>${escapeHtml(badge.description || "Milestone badge")}</p>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderInlineEmptyState(icon, title, description) {
    return `
      <div class="info-card">
        <div class="item-topline">
          <h3>${escapeHtml(icon)} ${escapeHtml(title)}</h3>
        </div>
        <p>${escapeHtml(description)}</p>
      </div>
    `;
  }

  function checkAndAwardBadges(streakValue) {
    const roadmap = storage.getRoadmap();
    const roadmapPhases = getRoadmapPhases(roadmap);
    const roadmapTopics = getAllRoadmapTopics(roadmap);
    const quizHistory = storage.getQuizHistory();
    const existingBadges = storage.getBadges();
    const badgeIds = new Set(existingBadges.map(function (badge) { return badge.id; }));
    const resourceVisits = getResourceVisitCount();
    const context = {
      profile: storage.getProfile(),
      streak: streakValue,
      roadmapPhases: roadmapPhases,
      roadmapTopics: roadmapTopics,
      quizHistory: quizHistory,
      timetable: storage.getTimetable(),
      progress: storage.calculateOverallProgress(),
      resourceVisits: resourceVisits
    };

    let hasNewBadge = false;

    BADGE_LIBRARY.forEach(function (badge) {
      if (!badgeIds.has(badge.id) && badge.condition(context)) {
        const meta = getBadgeMeta(badge.id);
        existingBadges.push({
          id: badge.id,
          title: meta.title || badge.title,
          icon: meta.icon || "🏅",
          earnedAt: new Date().toISOString()
        });
        hasNewBadge = true;
      }
    });

    if (hasNewBadge) {
      storage.saveBadges(existingBadges);
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }

  window.StudyMindApp = {
    initializeApp: initializeApp,
    renderNavigation: renderNavigation,
    toggleTheme: toggleTheme,
    showToast: showToast,
    showLoading: showLoading,
    hideLoading: hideLoading,
    openSetupModal: openSetupModal,
    openApiSettingsModal: openApiSettingsModal,
    resetAllData: resetAllData,
    renderDashboard: renderDashboard,
    checkAndAwardBadges: checkAndAwardBadges,
    getRoadmapPhases: getRoadmapPhases
  };

  document.addEventListener("DOMContentLoaded", initializeApp);
})();
