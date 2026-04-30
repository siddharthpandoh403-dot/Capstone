(function () {
  if (document.documentElement.dataset.page !== "quiz") {
    return;
  }

  const storage = window.StudyMindStorage;
  const ai = window.StudyMindAI;
  const data = window.StudyMindData || {};

  const state = {
    subject: "",
    topic: "",
    difficulty: "Medium",
    count: 5,
    questions: [],
    currentIndex: 0,
    selectedOptionIndex: null,
    answers: [],
    timer: null,
    timeLeft: 30,
    feedback: null
  };

  const elements = {};

  function initialize() {
    cacheElements();
    bindEvents();
    hydrateFromQueryParams();
    updateTopicSuggestions();
    renderOverview();
    renderWorkspaceIdle();
  }

  function getApp() {
    return window.StudyMindApp;
  }

  function cacheElements() {
    elements.form = document.getElementById("quizForm");
    elements.subject = document.getElementById("quizSubject");
    elements.topic = document.getElementById("quizTopic");
    elements.difficulty = document.getElementById("quizDifficulty");
    elements.count = document.getElementById("quizCount");
    elements.topicSuggestions = document.getElementById("quizTopicSuggestions");
    elements.overviewTitle = document.getElementById("quizOverviewTitle");
    elements.overviewDifficulty = document.getElementById("quizOverviewDifficulty");
    elements.overviewSummary = document.getElementById("quizOverviewSummary");
    elements.sessionProgressBar = document.getElementById("quizSessionProgressBar");
    elements.sessionProgressLabel = document.getElementById("quizSessionProgressLabel");
    elements.timerLabel = document.getElementById("quizTimerLabel");
    elements.historyCountLabel = document.getElementById("quizHistoryCountLabel");
    elements.highlights = document.getElementById("quizHighlights");
    elements.workspace = document.getElementById("quizWorkspace");
  }

  function bindEvents() {
    elements.form.addEventListener("submit", handleGenerateQuiz);
    elements.subject.addEventListener("change", function () {
      updateTopicSuggestions();
      maybeAutoFillTopic();
    });

    const useLinkedButton = document.getElementById("quizUseParamsButton");
    if (useLinkedButton) {
      useLinkedButton.addEventListener("click", hydrateFromQueryParams);
    }

    const refreshButton = document.getElementById("quizRefreshButton");
    if (refreshButton) {
      refreshButton.addEventListener("click", function () {
        renderOverview();
        if (state.questions.length) {
          renderQuestion(false);
        } else {
          renderWorkspaceIdle();
        }
        showToast("Quiz refreshed", "The quiz view has been updated.", "success");
      });
    }

    const resetButton = document.getElementById("quizResetButton");
    if (resetButton) {
      resetButton.addEventListener("click", resetQuizState);
    }

    document.addEventListener("keydown", handleKeydown);
  }

  function hydrateFromQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const subject = params.get("subject");
    const topic = params.get("topic");

    if (subject) {
      elements.subject.value = findBestSubjectMatch(subject);
    }
    updateTopicSuggestions();
    if (topic) {
      elements.topic.value = topic;
    } else {
      maybeAutoFillTopic();
    }

    if (subject || topic) {
      showToast("Linked topic loaded", "The quiz form has been pre-filled from your previous study flow.", "success");
    }
  }

  function findBestSubjectMatch(input) {
    const normalized = String(input || "").toLowerCase();
    const subjectOptions = [
      "Web Development",
      "Python",
      "Machine Learning",
      "Data Science",
      "DSA",
      "Java",
      "Cybersecurity",
      "Cloud Computing",
      "Database",
      "Git"
    ];

    const aliasMap = {
      "Web Development": ["web", "html", "css", "javascript", "frontend"],
      Python: ["python"],
      "Machine Learning": ["machine learning", "ml"],
      "Data Science": ["data science", "analytics"],
      DSA: ["dsa", "competitive coding", "algorithm"],
      Java: ["java"],
      Cybersecurity: ["cyber", "security"],
      "Cloud Computing": ["cloud", "aws", "azure", "gcp"],
      Database: ["database", "sql"],
      Git: ["git", "github"]
    };

    for (let index = 0; index < subjectOptions.length; index += 1) {
      const subject = subjectOptions[index];
      const aliases = aliasMap[subject] || [];
      if (aliases.some(function (alias) { return normalized.includes(alias); })) {
        return subject;
      }
    }

    return subjectOptions.includes(input) ? input : "";
  }

  function maybeAutoFillTopic() {
    if (elements.topic.value.trim()) {
      return;
    }
    const suggestions = getTopicSuggestions(elements.subject.value);
    if (suggestions.length) {
      elements.topic.value = suggestions[0];
    }
  }

  function updateTopicSuggestions() {
    const suggestions = getTopicSuggestions(elements.subject.value);
    elements.topicSuggestions.innerHTML = suggestions.map(function (topic) {
      return `<option value="${escapeAttribute(topic)}"></option>`;
    }).join("");
  }

  function getTopicSuggestions(subject) {
    const banks = data.quizQuestions || {};
    const questions = banks[subject] || [];
    const areas = questions.map(function (question) {
      return question.weakArea;
    }).filter(Boolean);
    return Array.from(new Set(areas)).slice(0, 8);
  }

  async function handleGenerateQuiz(event) {
    event.preventDefault();

    const subject = elements.subject.value.trim();
    const topic = elements.topic.value.trim();
    const difficulty = elements.difficulty.value;
    const count = Number(elements.count.value);

    if (!subject || !topic) {
      showToast("Quiz details missing", "Choose a subject and topic before generating your quiz.", "warning");
      return;
    }

    try {
      const questions = await ai.generateQuiz(subject, topic, difficulty, count);
      state.subject = subject;
      state.topic = topic;
      state.difficulty = difficulty;
      state.count = count;
      state.questions = normalizeQuestions(questions).slice(0, count);
      state.currentIndex = 0;
      state.selectedOptionIndex = null;
      state.answers = [];
      state.feedback = null;
      state.timeLeft = 30;

      renderOverview();
      renderQuestion(true);
      showToast("Quiz ready", "Your focused quiz session is ready to begin.", "success");
    } catch (error) {
      console.error("Quiz generation failed:", error);
      showToast("Quiz fallback used", "Something went wrong, but the built-in quiz bank can still keep you moving.", "warning");
    }
  }

  function normalizeQuestions(questions) {
    return (Array.isArray(questions) ? questions : []).map(function (question, index) {
      const options = Array.isArray(question.options) ? question.options.slice(0, 4) : [];
      while (options.length < 4) {
        options.push("Option " + (options.length + 1));
      }
      return {
        id: "question-" + index,
        question: cleanString(question.question, "Question " + (index + 1)),
        options: options,
        answerIndex: Number.isInteger(question.answerIndex) ? question.answerIndex : 0,
        explanation: cleanString(question.explanation, "Review the concept and try again."),
        weakArea: cleanString(question.weakArea, state.topic || state.subject || "Core Concept")
      };
    });
  }

  function selectOption(optionIndex) {
    state.selectedOptionIndex = optionIndex;
    updateOptionSelectionUI();
  }

  function updateOptionSelectionUI() {
    const optionButtons = elements.workspace.querySelectorAll("[data-option-index]");
    optionButtons.forEach(function (button) {
      const optionIndex = Number(button.getAttribute("data-option-index"));
      const selected = optionIndex === state.selectedOptionIndex;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  }

  function renderOverview() {
    const history = storage.getQuizHistory();
    const answeredCount = state.answers.length;
    const totalCount = state.questions.length || Number(elements.count.value) || 0;
    const progress = totalCount ? Math.round((answeredCount / totalCount) * 100) : 0;

    elements.overviewTitle.textContent = state.subject ? state.subject + " • " + state.topic : "No active quiz";
    elements.overviewDifficulty.textContent = state.subject ? state.difficulty : "Ready";
    elements.overviewSummary.textContent = state.subject
      ? "Stay calm, answer one question at a time, and use explanations to turn mistakes into stronger recall."
      : "Generate a quiz to begin timed practice with one question at a time and focused answer review.";
    elements.sessionProgressBar.style.width = Math.max(progress, state.questions.length ? 6 : 0) + "%";
    elements.sessionProgressLabel.textContent = answeredCount + " / " + totalCount + " answered";
    elements.timerLabel.textContent = state.questions.length ? state.timeLeft + "s left" : "30s per question";
    elements.historyCountLabel.textContent = history.length + " past quizzes";
    elements.highlights.innerHTML = buildHighlights(history);
  }

  function buildHighlights(history) {
    const weakTopics = storage.getWeakTopics();
    const highlights = [
      {
        icon: "⏱️",
        title: "Timed practice",
        text: "Each question gives you 30 seconds to build faster recall and decision making."
      },
      {
        icon: "📚",
        title: "Fallback ready",
        text: "Even without an API key, the built-in quiz bank still gives you a full working practice flow."
      }
    ];

    if (history.length) {
      const latest = history[0];
      highlights.push({
        icon: "📈",
        title: "Latest result",
        text: latest.subject + " • " + latest.score + "/" + latest.total + " at " + latest.difficulty + " difficulty."
      });
    }

    if (weakTopics.length) {
      highlights.push({
        icon: "🚨",
        title: "Weak areas saved",
        text: weakTopics.slice(0, 3).join(", ") + (weakTopics.length > 3 ? " and more." : ".")
      });
    }

    return highlights.slice(0, 4).map(function (item) {
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

  function renderWorkspaceIdle() {
    clearTimer();
    elements.workspace.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🧠</div>
        <h3>Your next quiz session starts here</h3>
        <p>Select a subject, choose a topic and difficulty, then generate a timed quiz. You will answer one question at a time with focused review at the end.</p>
      </div>
    `;
  }

  function renderQuestion(resetTimer) {
    const question = state.questions[state.currentIndex];
    if (!question) {
      renderResults();
      return;
    }

    if (resetTimer !== false) {
      clearTimer();
      state.timeLeft = 30;
    }

    elements.workspace.innerHTML = `
      <div class="quiz-shell">
        <div class="info-card">
          <div class="item-topline">
            <h3>Question ${state.currentIndex + 1} of ${state.questions.length}</h3>
            <span class="badge badge-warning" id="quizQuestionTimer">${state.timeLeft}s</span>
          </div>
          <p>${escapeHtml(question.question)}</p>
          <div class="progress-bar">
            <span style="width: ${Math.round(((state.currentIndex + 1) / state.questions.length) * 100)}%"></span>
          </div>
        </div>
        <div class="quiz-option-grid" role="listbox" aria-label="Answer options">
          ${question.options.map(function (option, index) {
            const labels = ["A", "B", "C", "D"];
            const selected = state.selectedOptionIndex === index;
            return `
              <button
                class="quiz-option-card ${selected ? "selected" : ""}"
                type="button"
                data-option-index="${index}"
                aria-pressed="${selected ? "true" : "false"}"
                aria-label="Option ${labels[index]}: ${escapeAttribute(option)}"
              >
                <span class="quiz-option-label">${labels[index]}</span>
                <span class="quiz-option-text">${escapeHtml(option)}</span>
              </button>
            `;
          }).join("")}
        </div>
        <div class="modal-footer quiz-footer-actions">
          <div class="info-meta">
            <span class="info-pill">Subject: ${escapeHtml(state.subject)}</span>
            <span class="info-pill">Topic: ${escapeHtml(state.topic)}</span>
            <span class="info-pill">Difficulty: ${escapeHtml(state.difficulty)}</span>
          </div>
          <button class="gradient-button" id="quizNextButton" type="button">${state.currentIndex === state.questions.length - 1 ? "Finish Quiz" : "Next Question"}</button>
        </div>
      </div>
    `;

    bindQuestionInteractions();

    if (resetTimer !== false) {
      startTimer();
    }
    renderOverview();
  }

  function bindQuestionInteractions() {
    const optionButtons = elements.workspace.querySelectorAll("[data-option-index]");
    optionButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        selectOption(Number(button.getAttribute("data-option-index")));
      });
    });

    const nextButton = document.getElementById("quizNextButton");
    if (nextButton) {
      nextButton.addEventListener("click", function () {
        goToNextQuestion(false);
      });
    }

    const retakeButton = document.getElementById("retakeQuizButton");
    if (retakeButton) {
      retakeButton.addEventListener("click", retakeQuiz);
    }

    const weakTopicsButton = document.getElementById("studyWeakTopicsButton");
    if (weakTopicsButton) {
      weakTopicsButton.addEventListener("click", function () {
        window.location.href = "./roadmap.html?goal=" + encodeURIComponent(state.subject || "");
      });
    }
  }

  function startTimer() {
    clearTimer();
    state.timer = window.setInterval(function () {
      state.timeLeft -= 1;
      const timerElement = document.getElementById("quizQuestionTimer");
      if (timerElement) {
        timerElement.textContent = state.timeLeft + "s";
      }
      elements.timerLabel.textContent = state.timeLeft + "s left";

      if (state.timeLeft <= 0) {
        goToNextQuestion(true);
      }
    }, 1000);
  }

  function clearTimer() {
    if (state.timer) {
      window.clearInterval(state.timer);
      state.timer = null;
    }
  }

  async function goToNextQuestion(timedOut) {
    const question = state.questions[state.currentIndex];
    if (!question) {
      return;
    }

    if (!timedOut && state.selectedOptionIndex === null) {
      showToast("Select an option", "Please select an option first", "warning");
      return;
    }

    const selectedOptionIndex = Number.isInteger(state.selectedOptionIndex) ? state.selectedOptionIndex : null;
    state.answers.push({
      question: question.question,
      selectedOptionIndex: selectedOptionIndex,
      selectedOption: selectedOptionIndex !== null ? question.options[selectedOptionIndex] : null,
      correctOptionIndex: question.answerIndex,
      correctOption: question.options[question.answerIndex],
      correct: selectedOptionIndex === question.answerIndex,
      explanation: question.explanation,
      weakArea: question.weakArea,
      timedOut: Boolean(timedOut)
    });

    state.selectedOptionIndex = null;
    state.currentIndex += 1;

    if (state.currentIndex >= state.questions.length) {
      clearTimer();
      await finalizeQuiz();
      return;
    }

    renderQuestion(true);
  }

  async function finalizeQuiz() {
    clearTimer();
    const total = state.questions.length;
    const score = state.answers.filter(function (answer) { return answer.correct; }).length;
    const wrongAnswers = state.answers.filter(function (answer) { return !answer.correct; });
    const weakAreas = Array.from(new Set(wrongAnswers.map(function (answer) { return answer.weakArea; }).filter(Boolean)));

    storage.saveWeakTopics(weakAreas);
    storage.saveQuizResult({
      date: new Date().toLocaleDateString(),
      subject: state.subject,
      topic: state.topic,
      difficulty: state.difficulty,
      score: score,
      total: total,
      percentage: total ? Math.round((score / total) * 100) : 0,
      createdAt: new Date().toISOString()
    });

    if (score === total && total > 0) {
      awardQuizMasterBadge();
    }

    try {
      state.feedback = await ai.generateQuizFeedback(wrongAnswers);
    } catch (error) {
      state.feedback = {
        summary: "Your results are ready. Review the missed explanations and try again with a focused mindset.",
        weakAreas: weakAreas,
        advice: "Take a short break, revisit the weaker areas, and retake a smaller quiz to improve retention."
      };
    }

    const app = getApp();
    if (app && typeof app.checkAndAwardBadges === "function") {
      app.checkAndAwardBadges(storage.updateStudyStreak());
    }

    renderOverview();
    renderResults();
    showToast("Quiz completed", "Your results, weak areas, and review notes are ready.", "success");
  }

  function renderResults() {
    const total = state.questions.length;
    const score = state.answers.filter(function (answer) { return answer.correct; }).length;
    const wrongAnswers = state.answers.filter(function (answer) { return !answer.correct; });
    const feedback = state.feedback || {
      summary: "Review the questions you missed and use the explanations below to strengthen recall.",
      weakAreas: Array.from(new Set(wrongAnswers.map(function (answer) { return answer.weakArea; }).filter(Boolean))),
      advice: "Retake the quiz after revising the highlighted concepts."
    };

    elements.workspace.innerHTML = `
      <div class="quiz-results-shell">
        <div class="info-card">
          <div class="item-topline">
            <h3>Quiz Complete</h3>
            <span class="badge badge-success">${score}/${total}</span>
          </div>
          <p>${escapeHtml(feedback.summary || "Your quiz results are ready.")}</p>
          <div class="info-meta">
            <span class="info-pill">✅ Correct: ${score}</span>
            <span class="info-pill">❌ Wrong: ${total - score}</span>
            <span class="info-pill">🎯 Weak areas: ${feedback.weakAreas && feedback.weakAreas.length ? feedback.weakAreas.length : 0}</span>
          </div>
        </div>
        <div class="responsive-grid dashboard-detail-grid">
          <div class="info-card">
            <h3>Weak areas</h3>
            ${feedback.weakAreas && feedback.weakAreas.length ? `
              <ul class="roadmap-bullet-list">
                ${feedback.weakAreas.map(function (area) { return `<li>${escapeHtml(area)}</li>`; }).join("")}
              </ul>
            ` : `<p>No weak areas were detected in this session. Strong work.</p>`}
          </div>
          <div class="info-card">
            <h3>Study advice</h3>
            <p>${escapeHtml(feedback.advice || "Keep practicing consistently and revisit concepts you missed.")}</p>
          </div>
        </div>
        <div class="quiz-review-list">
          ${state.answers.map(function (answer, index) {
            const statusClass = answer.correct ? "is-earned" : "is-locked";
            const answerLabel = answer.selectedOption === null ? "Unanswered" : answer.selectedOption;
            return `
              <div class="badge-item ${statusClass}">
                <div class="item-topline">
                  <h3>${answer.correct ? "✅" : "❌"} Question ${index + 1}</h3>
                  <span class="badge ${answer.correct ? "badge-success" : "badge-warning"}">${answer.correct ? "Correct" : "Review"}</span>
                </div>
                <p><strong>${escapeHtml(answer.question)}</strong></p>
                <p>Your answer: ${escapeHtml(answerLabel)}${answer.timedOut ? " (time ended)" : ""}</p>
                ${answer.correct ? "" : `<p>Correct answer: ${escapeHtml(answer.correctOption)}</p>`}
                ${answer.correct ? "" : `<p>Explanation: ${escapeHtml(answer.explanation)}</p>`}
              </div>
            `;
          }).join("")}
        </div>
        <div class="modal-footer quiz-footer-actions">
          <button class="secondary-button" id="retakeQuizButton" type="button">Retake Quiz</button>
          <button class="secondary-button" id="studyWeakTopicsButton" type="button">Study Weak Topics</button>
          <a class="gradient-button" href="./progress.html">Go to Progress</a>
        </div>
      </div>
    `;

    bindQuestionInteractions();
  }

  function retakeQuiz() {
    state.currentIndex = 0;
    state.selectedOptionIndex = null;
    state.answers = [];
    state.feedback = null;
    state.timeLeft = 30;
    if (!state.questions.length) {
      renderWorkspaceIdle();
      return;
    }
    renderQuestion(true);
    showToast("Quiz restarted", "Your quiz has been reset for another attempt.", "success");
  }

  function resetQuizState() {
    clearTimer();
    state.subject = "";
    state.topic = "";
    state.difficulty = "Medium";
    state.count = 5;
    state.questions = [];
    state.currentIndex = 0;
    state.selectedOptionIndex = null;
    state.answers = [];
    state.feedback = null;
    state.timeLeft = 30;

    elements.form.reset();
    elements.difficulty.value = "Medium";
    elements.count.value = "5";
    updateTopicSuggestions();
    renderOverview();
    renderWorkspaceIdle();
    showToast("Quiz reset", "The current quiz session has been cleared.", "warning");
  }

  function awardQuizMasterBadge() {
    const badges = storage.getBadges();
    const exists = badges.some(function (badge) { return badge.id === "quiz-master"; });
    if (exists) {
      return;
    }
    badges.push({
      id: "quiz-master",
      title: "Quiz Master",
      earnedAt: new Date().toISOString()
    });
    storage.saveBadges(badges);
  }

  function handleKeydown(event) {
    if (!state.questions.length || state.currentIndex >= state.questions.length) {
      return;
    }

    const activeTag = document.activeElement && document.activeElement.tagName;
    if (activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT") {
      return;
    }

    if (["1", "2", "3", "4"].includes(event.key)) {
      event.preventDefault();
      selectOption(Number(event.key) - 1);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      goToNextQuestion(false);
    }
  }

  function showToast(title, message, tone) {
    const app = getApp();
    if (app && typeof app.showToast === "function") {
      app.showToast(title, message, tone);
    }
  }

  function cleanString(value, fallback) {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
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

  document.addEventListener("DOMContentLoaded", initialize);
})();
