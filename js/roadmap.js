(function () {
  const page = document.documentElement.dataset.page;
  if (page !== "roadmap") {
    return;
  }

  const storage = window.StudyMindStorage;
  const app = window.StudyMindApp;
  const ai = window.StudyMindAI;
  const seedData = window.StudyMindData || {};
  const ROADMAP_META_KEY = "studymind-roadmap-meta";

  const elements = {
    form: null,
    goal: null,
    customGoalWrap: null,
    customGoalInput: null,
    level: null,
    months: null,
    metaTitle: null,
    metaLevel: null,
    metaSummary: null,
    progressBar: null,
    progressLabel: null,
    monthsLabel: null,
    topicCountLabel: null,
    timeline: null,
    highlights: null
  };

  function initialize() {
    cacheElements();
    if (!elements.form) {
      return;
    }
    bindEvents();
    hydrateFormFromSavedData();
    renderRoadmapPage();
  }

  function cacheElements() {
    elements.form = document.getElementById("roadmapForm");
    elements.goal = document.getElementById("roadmapGoal");
    elements.customGoalWrap = document.getElementById("customGoalWrap");
    elements.customGoalInput = document.getElementById("customGoalInput");
    elements.level = document.getElementById("roadmapLevel");
    elements.months = document.getElementById("roadmapMonths");
    elements.metaTitle = document.getElementById("roadmapMetaTitle");
    elements.metaLevel = document.getElementById("roadmapMetaLevel");
    elements.metaSummary = document.getElementById("roadmapMetaSummary");
    elements.progressBar = document.getElementById("roadmapProgressBar");
    elements.progressLabel = document.getElementById("roadmapProgressLabel");
    elements.monthsLabel = document.getElementById("roadmapMonthsLabel");
    elements.topicCountLabel = document.getElementById("roadmapTopicCountLabel");
    elements.timeline = document.getElementById("roadmapTimeline");
    elements.highlights = document.getElementById("roadmapHighlights");
  }

  function bindEvents() {
    elements.goal.addEventListener("change", handleGoalChange);
    elements.form.addEventListener("submit", handleGenerateRoadmap);

    const useProfileButton = document.getElementById("useProfileGoalButton");
    if (useProfileButton) {
      useProfileButton.addEventListener("click", useProfileGoal);
    }

    const refreshButton = document.getElementById("roadmapRefreshButton");
    if (refreshButton) {
      refreshButton.addEventListener("click", function () {
        renderRoadmapPage();
        showToast("Roadmap refreshed", "Your saved roadmap view has been updated.", "success");
      });
    }

    const resetButton = document.getElementById("roadmapResetButton");
    if (resetButton) {
      resetButton.addEventListener("click", resetRoadmap);
    }

    document.addEventListener("click", handleDocumentClick);
  }

  function handleGoalChange() {
    const isCustomGoal = elements.goal.value === "Custom goal";
    elements.customGoalWrap.classList.toggle("hidden", !isCustomGoal);
    if (!isCustomGoal) {
      elements.customGoalInput.value = "";
    }
  }

  function hydrateFormFromSavedData() {
    elements.goal.value = "";
    elements.level.value = "Complete Beginner";
    elements.months.value = "3";
    elements.customGoalInput.value = "";
    elements.customGoalWrap.classList.add("hidden");

    const meta = getRoadmapMeta();
    if (!meta) {
      return;
    }

    const knownGoals = [
      "Web Development",
      "Machine Learning",
      "Android Development",
      "Data Science",
      "DSA & Competitive Coding",
      "Cybersecurity",
      "Cloud Computing",
      "UI/UX Design",
      "Python Programming",
      "Java Programming"
    ];

    if (meta.goal && knownGoals.includes(meta.goal)) {
      elements.goal.value = meta.goal;
    } else if (meta.goal) {
      elements.goal.value = "Custom goal";
      elements.customGoalInput.value = meta.goal;
      elements.customGoalWrap.classList.remove("hidden");
    }

    if (meta.level) {
      elements.level.value = meta.level;
    }

    if (meta.months) {
      elements.months.value = meta.months;
    }
  }

  async function handleGenerateRoadmap(event) {
    event.preventDefault();

    const goal = getSelectedGoal();
    const level = elements.level.value;
    const months = Number(elements.months.value);

    if (!goal) {
      showToast("Goal required", "Choose a roadmap goal before generating your learning path.", "warning");
      return;
    }

    if (!months || months < 1) {
      showToast("Months required", "Enter a realistic number of months for your roadmap.", "warning");
      return;
    }

    try {
      const result = await ai.generateRoadmap(goal, level, months);
      const normalized = normalizeRoadmap(result, goal, level, months);
      storage.saveRoadmap(normalized.phases);
      saveRoadmapMeta({
        goal: normalized.goal,
        level: normalized.level,
        months: normalized.months,
        createdAt: new Date().toISOString()
      });
      awardBadge("roadmap-starter", "Roadmap Starter");
      renderRoadmapPage();
      showToast("Roadmap ready", "Your learning roadmap has been generated and saved locally.", "success");
    } catch (error) {
      console.error("Roadmap generation failed:", error);
      showToast("Roadmap fallback used", "Something went wrong, but your saved or fallback roadmap can still be used.", "warning");
      renderRoadmapPage();
    }
  }

  function getSelectedGoal() {
    if (elements.goal.value === "Custom goal") {
      return elements.customGoalInput.value.trim();
    }
    return elements.goal.value.trim();
  }

  function useProfileGoal() {
    const profile = storage.getProfile();
    if (!profile || !profile.goal) {
      showToast("No profile goal", "Set your main learning goal on the dashboard first, or enter a custom goal here.", "warning");
      return;
    }

    const matchedGoal = matchGoalToPreset(profile.goal);
    if (matchedGoal) {
      elements.goal.value = matchedGoal;
      elements.customGoalWrap.classList.add("hidden");
      elements.customGoalInput.value = "";
    } else {
      elements.goal.value = "Custom goal";
      elements.customGoalWrap.classList.remove("hidden");
      elements.customGoalInput.value = profile.goal;
    }

    showToast("Profile goal applied", "Your saved learning goal has been inserted into the roadmap form.", "success");
  }

  function matchGoalToPreset(goal) {
    const presets = [
      "Web Development",
      "Machine Learning",
      "Android Development",
      "Data Science",
      "DSA & Competitive Coding",
      "Cybersecurity",
      "Cloud Computing",
      "UI/UX Design",
      "Python Programming",
      "Java Programming"
    ];

    const normalizedGoal = String(goal || "").toLowerCase();
    return presets.find(function (preset) {
      const normalizedPreset = preset.toLowerCase();
      return normalizedGoal.includes(normalizedPreset.split(" ")[0]) || normalizedPreset.includes(normalizedGoal);
    }) || "";
  }

  function normalizeRoadmap(result, goal, level, months) {
    const phases = Array.isArray(result && result.phases) ? result.phases : [];
    return {
      goal: typeof result?.goal === "string" && result.goal.trim() ? result.goal.trim() : goal,
      level: typeof result?.level === "string" && result.level.trim() ? result.level.trim() : level,
      months: Number(result?.months) || months,
      phases: phases.map(function (phase, phaseIndex) {
        const phaseTitle = cleanString(phase && (phase.title || phase.phase), "Phase " + (phaseIndex + 1));
        return {
          title: phaseTitle,
          description: cleanString(
            phase && phase.description,
            "A focused learning stage that moves you closer to your goal through structured topics."
          ),
          topics: (Array.isArray(phase && phase.topics) ? phase.topics : []).map(function (topic, topicIndex) {
            return {
              id: cleanString(topic && topic.id, slugify(phaseTitle) + "-" + (topicIndex + 1)),
              title: cleanString(topic && topic.title, "Topic " + (topicIndex + 1)),
              description: cleanString(topic && topic.description, "Study this topic to strengthen your roadmap progression."),
              estimate: cleanString(topic && topic.estimate, "1 week"),
              status: normalizeStatus(topic && topic.status)
            };
          })
        };
      })
    };
  }

  function renderRoadmapPage() {
    const phases = storage.getRoadmap();
    const meta = getRoadmapMeta();
    const topicStats = getTopicStats(phases);
    const currentMilestone = getCurrentMilestone(phases);

    renderSummary(meta, topicStats, currentMilestone);
    renderHighlights(meta, topicStats, currentMilestone);
    renderTimeline(phases, meta);
  }

  function renderSummary(meta, topicStats, currentMilestone) {
    const title = meta && meta.goal ? meta.goal : "No roadmap generated yet";
    const level = meta && meta.level ? meta.level : "Ready";
    const months = meta && meta.months ? meta.months : 0;
    const progress = topicStats.total ? Math.round((topicStats.completed / topicStats.total) * 100) : 0;

    elements.metaTitle.textContent = title;
    elements.metaLevel.textContent = level;
    elements.metaSummary.textContent = currentMilestone
      ? currentMilestone.description
      : "Generate a roadmap to unlock phase-by-phase planning, topic study cards, and completion tracking.";
    elements.progressBar.style.width = Math.max(progress, topicStats.total ? 8 : 0) + "%";
    elements.progressLabel.textContent = progress + "% complete";
    elements.monthsLabel.textContent = months + " months";
    elements.topicCountLabel.textContent = topicStats.total + " topics";
  }

  function renderHighlights(meta, topicStats, currentMilestone) {
    const highlightItems = [];

    if (!meta || !meta.goal) {
      highlightItems.push({
        icon: "🧭",
        title: "Generate your roadmap",
        text: "Choose a goal, skill level, and timeline to build a structured learning path."
      });
    } else {
      highlightItems.push({
        icon: "🎯",
        title: "Current focus",
        text: currentMilestone ? currentMilestone.title : "Start your first topic to create momentum."
      });
    }

    highlightItems.push({
      icon: "✅",
      title: "Completed topics",
      text: topicStats.completed + " of " + topicStats.total + " topics marked done."
    });

    highlightItems.push({
      icon: "⏳",
      title: "In progress",
      text: topicStats.inProgress + " topics are actively moving forward."
    });

    elements.highlights.innerHTML = highlightItems.map(function (item) {
      return `
        <div class="stack-item">
          <span>${escapeHtml(item.icon)}</span>
          <div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.text)}</p>
          </div>
        </div>
      `;
    }).join("");
  }

  function renderTimeline(phases, meta) {
    if (!Array.isArray(phases) || !phases.length) {
      elements.timeline.innerHTML = renderEmptyTimeline();
      return;
    }

    elements.timeline.innerHTML = `
      <div class="roadmap-timeline">
        ${phases.map(function (phase, phaseIndex) {
          const phaseTopics = Array.isArray(phase.topics) ? phase.topics : [];
          const completedTopics = phaseTopics.filter(function (topic) { return topic.status === "done"; }).length;
          const phaseProgress = phaseTopics.length ? Math.round((completedTopics / phaseTopics.length) * 100) : 0;

          return `
            <section class="info-card roadmap-phase-card">
              <div class="item-topline">
                <h3>${escapeHtml(phase.title || "Phase " + (phaseIndex + 1))}</h3>
                <span class="badge badge-primary">${phaseProgress}% complete</span>
              </div>
              <p>${escapeHtml(phase.description || "A structured phase in your roadmap.")}</p>
              <div class="progress-bar">
                <span style="width: ${Math.max(phaseProgress, phaseTopics.length ? 6 : 0)}%"></span>
              </div>
              <div class="roadmap-topic-grid">
                ${phaseTopics.map(function (topic, topicIndex) {
                  const statusLabel = getStatusLabel(topic.status);
                  const statusClass = topic.status === "done" ? "is-done" : topic.status === "in-progress" ? "is-progress" : "is-pending";
                  return `
                    <article class="roadmap-topic-card ${statusClass}">
                      <div class="item-topline">
                        <h3>${topic.status === "done" ? "✅ " : ""}${escapeHtml(topic.title)}</h3>
                        <span class="badge ${getStatusBadgeClass(topic.status)}">${escapeHtml(statusLabel)}</span>
                      </div>
                      <p>${escapeHtml(topic.description)}</p>
                      <div class="item-meta">
                        <span class="info-pill">⏳ ${escapeHtml(topic.estimate)}</span>
                      </div>
                      <div class="roadmap-topic-actions">
                        <button class="secondary-button" type="button" data-study-topic="${escapeHtml(topic.id)}">📖 Study This Topic</button>
                        <button class="gradient-button" type="button" data-toggle-done="${escapeHtml(topic.id)}">
                          ${topic.status === "done" ? "Mark Not Done" : "Mark Done"}
                        </button>
                      </div>
                      <div class="roadmap-status-switches">
                        <button class="status-chip ${topic.status === "not-started" ? "active" : ""}" type="button" data-status-update="${escapeHtml(topic.id)}" data-status-value="not-started">Not Started</button>
                        <button class="status-chip ${topic.status === "in-progress" ? "active" : ""}" type="button" data-status-update="${escapeHtml(topic.id)}" data-status-value="in-progress">In Progress</button>
                        <button class="status-chip ${topic.status === "done" ? "active" : ""}" type="button" data-status-update="${escapeHtml(topic.id)}" data-status-value="done">Done</button>
                      </div>
                    </article>
                  `;
                }).join("")}
              </div>
            </section>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderEmptyTimeline() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">🧭</div>
        <h3>Your roadmap timeline is waiting</h3>
        <p>Generate a roadmap to unlock phase cards, topic study modals, completion tracking, and quiz shortcuts from each topic.</p>
      </div>
    `;
  }

  function handleDocumentClick(event) {
    const studyButton = event.target.closest("[data-study-topic]");
    if (studyButton) {
      openStudyTopicModal(studyButton.getAttribute("data-study-topic"));
      return;
    }

    const toggleDoneButton = event.target.closest("[data-toggle-done]");
    if (toggleDoneButton) {
      toggleTopicDone(toggleDoneButton.getAttribute("data-toggle-done"));
      return;
    }

    const statusButton = event.target.closest("[data-status-update]");
    if (statusButton) {
      updateTopicStatus(
        statusButton.getAttribute("data-status-update"),
        statusButton.getAttribute("data-status-value")
      );
      return;
    }
  }

  async function openStudyTopicModal(topicId) {
    const topicInfo = findTopicById(topicId);
    if (!topicInfo) {
      showToast("Topic not found", "The selected topic could not be loaded from your saved roadmap.", "warning");
      return;
    }

    const meta = getRoadmapMeta();
    const goal = meta && meta.goal ? meta.goal : "General Learning";
    const material = await ai.generateStudyMaterial(topicInfo.topic.title, goal);
    renderStudyModal(topicInfo, material, goal);
  }

  function renderStudyModal(topicInfo, material, goal) {
    const modalRoot = document.getElementById("modalRoot");
    if (!modalRoot) {
      return;
    }

    modalRoot.innerHTML = `
      <div class="modal open" role="dialog" aria-modal="true">
        <div class="modal-panel">
          <div class="modal-header">
            <div>
              <h2>${escapeHtml(topicInfo.topic.title)}</h2>
              <p>${escapeHtml(topicInfo.phase.title || "Roadmap Topic")} • ${escapeHtml(goal)}</p>
            </div>
            <button class="icon-button" type="button" data-close-modal aria-label="Close modal">✕</button>
          </div>
          <div class="dashboard-section-body">
            <div class="info-card">
              <h3>Explanation</h3>
              <p>${escapeHtml(material.explanation || "No explanation available yet.")}</p>
            </div>
            <div class="responsive-grid dashboard-detail-grid">
              <div class="info-card">
                <h3>Key concepts</h3>
                <ul class="roadmap-bullet-list">
                  ${ensureArray(material.keyConcepts).map(function (item) {
                    return `<li>${escapeHtml(item)}</li>`;
                  }).join("")}
                </ul>
              </div>
              <div class="info-card">
                <h3>Common mistakes</h3>
                <ul class="roadmap-bullet-list">
                  ${ensureArray(material.mistakes).map(function (item) {
                    return `<li>${escapeHtml(item)}</li>`;
                  }).join("")}
                </ul>
              </div>
            </div>
            <div class="info-card">
              <h3>Real-life analogy</h3>
              <p>${escapeHtml(material.analogy || "No analogy available yet.")}</p>
            </div>
            ${material.codeExample ? `
              <div class="info-card">
                <h3>Code example</h3>
                <pre class="code-preview"><code>${escapeHtml(material.codeExample)}</code></pre>
              </div>
            ` : ""}
          </div>
          <div class="modal-footer">
            <button class="secondary-button" type="button" data-close-modal>Close</button>
            <a class="gradient-button" href="./quiz.html?subject=${encodeURIComponent(goal)}&topic=${encodeURIComponent(topicInfo.topic.title)}">Take Quiz on This Topic</a>
          </div>
        </div>
      </div>
    `;
  }

  function toggleTopicDone(topicId) {
    const topicInfo = findTopicById(topicId);
    if (!topicInfo) {
      return;
    }
    const nextStatus = topicInfo.topic.status === "done" ? "not-started" : "done";
    updateTopicStatus(topicId, nextStatus);
  }

  function updateTopicStatus(topicId, status) {
    const phases = storage.getRoadmap();
    let updatedTopicTitle = "";
    let changed = false;

    const nextRoadmap = phases.map(function (phase) {
      return {
        title: phase.title,
        description: phase.description,
        topics: ensureArray(phase.topics).map(function (topic) {
          if (topic.id !== topicId) {
            return topic;
          }
          changed = true;
          updatedTopicTitle = topic.title;
          return {
            id: topic.id,
            title: topic.title,
            description: topic.description,
            estimate: topic.estimate,
            status: normalizeStatus(status)
          };
        })
      };
    });

    if (!changed) {
      return;
    }

    storage.saveRoadmap(nextRoadmap);

    if (status === "done") {
      awardBadge("topic-conquered", "Topic Conquered");
      showToast("Topic completed", updatedTopicTitle + " has been marked done.", "success");
    } else if (status === "in-progress") {
      showToast("Topic updated", updatedTopicTitle + " is now in progress.", "success");
    } else {
      showToast("Topic updated", updatedTopicTitle + " has been reset to not started.", "warning");
    }

    renderRoadmapPage();
  }

  function findTopicById(topicId) {
    const phases = storage.getRoadmap();
    for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex += 1) {
      const phase = phases[phaseIndex];
      const topics = ensureArray(phase.topics);
      for (let topicIndex = 0; topicIndex < topics.length; topicIndex += 1) {
        const topic = topics[topicIndex];
        if (topic.id === topicId) {
          return {
            phaseIndex: phaseIndex,
            topicIndex: topicIndex,
            phase: phase,
            topic: topic
          };
        }
      }
    }
    return null;
  }

  function getTopicStats(phases) {
    const stats = {
      total: 0,
      completed: 0,
      inProgress: 0
    };

    ensureArray(phases).forEach(function (phase) {
      ensureArray(phase.topics).forEach(function (topic) {
        stats.total += 1;
        if (topic.status === "done") {
          stats.completed += 1;
        }
        if (topic.status === "in-progress") {
          stats.inProgress += 1;
        }
      });
    });

    return stats;
  }

  function getCurrentMilestone(phases) {
    for (let phaseIndex = 0; phaseIndex < ensureArray(phases).length; phaseIndex += 1) {
      const phase = phases[phaseIndex];
      for (let topicIndex = 0; topicIndex < ensureArray(phase.topics).length; topicIndex += 1) {
        const topic = phase.topics[topicIndex];
        if (topic.status !== "done") {
          return {
            title: topic.title,
            description: topic.description,
            phaseTitle: phase.title
          };
        }
      }
    }
    return null;
  }

  function getRoadmapMeta() {
    return storage.getData(ROADMAP_META_KEY, null);
  }

  function saveRoadmapMeta(meta) {
    storage.setData(ROADMAP_META_KEY, meta);
  }

  function resetRoadmap() {
    const modalRoot = document.getElementById("modalRoot");
    if (!modalRoot) {
      return;
    }

    modalRoot.innerHTML = `
      <div class="modal open" role="dialog" aria-modal="true">
        <div class="modal-panel">
          <div class="modal-header">
            <div>
              <h2>Reset roadmap?</h2>
              <p>This clears your saved roadmap phases, statuses, and roadmap metadata from localStorage.</p>
            </div>
            <button class="icon-button" type="button" data-close-modal aria-label="Close modal">✕</button>
          </div>
          <div class="empty-state">
            <div class="empty-state-icon">⚠️</div>
            <h3>Start fresh only if you need to</h3>
            <p>You can always generate a brand-new roadmap after clearing the current one.</p>
          </div>
          <div class="modal-footer">
            <button class="secondary-button" type="button" data-close-modal>Keep Roadmap</button>
            <button class="danger-button" type="button" id="confirmRoadmapResetButton">Yes, Reset Roadmap</button>
          </div>
        </div>
      </div>
    `;

    const confirmButton = document.getElementById("confirmRoadmapResetButton");
    if (confirmButton) {
      confirmButton.addEventListener("click", function () {
        storage.saveRoadmap([]);
        storage.removeData(ROADMAP_META_KEY);
        modalRoot.innerHTML = "";
        hydrateFormFromSavedData();
        renderRoadmapPage();
        showToast("Roadmap cleared", "Your saved roadmap has been reset.", "warning");
      }, { once: true });
    }
  }

  function awardBadge(id, title) {
    const savedBadges = storage.getBadges();
    const exists = savedBadges.some(function (badge) {
      return badge.id === id;
    });

    if (exists) {
      return;
    }

    savedBadges.push({
      id: id,
      title: title,
      earnedAt: new Date().toISOString()
    });
    storage.saveBadges(savedBadges);
  }

  function normalizeStatus(status) {
    if (status === "done" || status === "completed") {
      return "done";
    }
    if (status === "in-progress") {
      return "in-progress";
    }
    return "not-started";
  }

  function getStatusLabel(status) {
    if (status === "done") {
      return "Done";
    }
    if (status === "in-progress") {
      return "In Progress";
    }
    return "Not Started";
  }

  function getStatusBadgeClass(status) {
    if (status === "done") {
      return "badge-success";
    }
    if (status === "in-progress") {
      return "badge-accent";
    }
    return "badge-warning";
  }

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function showToast(title, message, tone) {
    if (app && typeof app.showToast === "function") {
      app.showToast(title, message, tone);
    }
  }

  function cleanString(value, fallback) {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  document.addEventListener("DOMContentLoaded", initialize);
})();
