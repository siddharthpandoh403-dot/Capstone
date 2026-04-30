(function () {
  if (document.documentElement.dataset.page !== "timetable") {
    return;
  }

  const storage = window.StudyMindStorage;
  const app = window.StudyMindApp;
  const seedData = window.StudyMindData || {};
  const TIMETABLE_META_KEY = "studymind-timetable-meta";
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const DEFAULT_SUBJECTS = [
    { name: "Mathematics", weak: true },
    { name: "Programming", weak: false }
  ];

  const elements = {};
  let subjectDrafts = [];

  function initialize() {
    cacheElements();
    subjectDrafts = loadInitialSubjects();
    renderSubjectInputs();
    renderDayCheckboxes();
    bindEvents();
    hydrateSavedForm();
    renderTimetablePage();
  }

  function cacheElements() {
    elements.form = document.getElementById("timetableForm");
    elements.subjectList = document.getElementById("subjectList");
    elements.studyHours = document.getElementById("studyHoursPerDay");
    elements.preferredTime = document.getElementById("preferredStudyTime");
    elements.examDate = document.getElementById("examDate");
    elements.daysGroup = document.getElementById("availableDaysGroup");
    elements.overviewTitle = document.getElementById("timetableOverviewTitle");
    elements.overviewTime = document.getElementById("timetableOverviewTime");
    elements.overviewSummary = document.getElementById("timetableOverviewSummary");
    elements.coverageBar = document.getElementById("timetableCoverageBar");
    elements.slotsLabel = document.getElementById("timetableSlotsLabel");
    elements.daysLabel = document.getElementById("timetableDaysLabel");
    elements.weakLabel = document.getElementById("timetableWeakLabel");
    elements.highlights = document.getElementById("timetableHighlights");
    elements.calendar = document.getElementById("timetableCalendar");
  }

  function bindEvents() {
    elements.form.addEventListener("submit", handleGenerate);

    const addSubjectButton = document.getElementById("addSubjectButton");
    if (addSubjectButton) {
      addSubjectButton.addEventListener("click", addSubjectDraft);
    }

    const saveButton = document.getElementById("saveTimetableButton");
    if (saveButton) {
      saveButton.addEventListener("click", saveCurrentTimetable);
    }

    const regenerateButton = document.getElementById("regenerateTimetableButton");
    if (regenerateButton) {
      regenerateButton.addEventListener("click", regenerateTimetable);
    }

    const clearButton = document.getElementById("clearTimetableButton");
    if (clearButton) {
      clearButton.addEventListener("click", openClearConfirmation);
    }

    document.addEventListener("click", handleDocumentClick);
    elements.subjectList.addEventListener("input", syncSubjectDraftsFromDom);
    elements.subjectList.addEventListener("change", syncSubjectDraftsFromDom);
  }

  function loadInitialSubjects() {
    const meta = getTimetableMeta();
    if (meta && Array.isArray(meta.subjects) && meta.subjects.length) {
      return meta.subjects.map(function (subject) {
        return {
          name: subject.name || "",
          weak: Boolean(subject.weak)
        };
      });
    }
    return DEFAULT_SUBJECTS.slice();
  }

  function renderSubjectInputs() {
    elements.subjectList.innerHTML = subjectDrafts.map(function (subject, index) {
      return `
        <div class="subject-draft-card">
          <div class="form-row">
            <label class="form-label" for="subjectName-${index}">Subject ${index + 1}</label>
            <input class="form-control" id="subjectName-${index}" type="text" data-subject-name="${index}" placeholder="Enter subject name" value="${escapeAttribute(subject.name)}">
          </div>
          <label class="toggle-row">
            <input type="checkbox" data-subject-weak="${index}" ${subject.weak ? "checked" : ""}>
            <span>Mark as weak subject</span>
          </label>
          <button class="secondary-button" type="button" data-remove-subject="${index}">Remove</button>
        </div>
      `;
    }).join("");
  }

  function renderDayCheckboxes() {
    const meta = getTimetableMeta();
    const selectedDays = Array.isArray(meta && meta.days) && meta.days.length ? meta.days : DAYS.slice(0, 6);

    elements.daysGroup.innerHTML = DAYS.map(function (day) {
      const checked = selectedDays.includes(day) ? "checked" : "";
      return `
        <label class="checkbox-card">
          <input type="checkbox" value="${day}" ${checked}>
          <span>${day.slice(0, 3)}</span>
        </label>
      `;
    }).join("");
  }

  function hydrateSavedForm() {
    const meta = getTimetableMeta();
    if (!meta) {
      return;
    }

    if (meta.studyHoursPerDay) {
      elements.studyHours.value = meta.studyHoursPerDay;
    }
    if (meta.preferredStudyTime) {
      elements.preferredTime.value = meta.preferredStudyTime;
    }
    if (meta.examDate) {
      elements.examDate.value = meta.examDate;
    }
  }

  function syncSubjectDraftsFromDom() {
    subjectDrafts = subjectDrafts.map(function (_, index) {
      const nameInput = elements.subjectList.querySelector('[data-subject-name="' + index + '"]');
      const weakInput = elements.subjectList.querySelector('[data-subject-weak="' + index + '"]');
      return {
        name: nameInput ? nameInput.value.trim() : "",
        weak: weakInput ? weakInput.checked : false
      };
    });
  }

  function addSubjectDraft() {
    syncSubjectDraftsFromDom();
    subjectDrafts.push({ name: "", weak: false });
    renderSubjectInputs();
  }

  function handleDocumentClick(event) {
    const removeSubjectButton = event.target.closest("[data-remove-subject]");
    if (removeSubjectButton) {
      const index = Number(removeSubjectButton.getAttribute("data-remove-subject"));
      removeSubjectDraft(index);
      return;
    }

    const editSlotButton = event.target.closest("[data-edit-slot]");
    if (editSlotButton) {
      openEditSlotModal(editSlotButton.getAttribute("data-edit-slot"));
      return;
    }
  }

  function removeSubjectDraft(index) {
    syncSubjectDraftsFromDom();
    if (subjectDrafts.length <= 1) {
      showToast("Keep one subject", "At least one subject is needed to build a timetable.", "warning");
      return;
    }
    subjectDrafts.splice(index, 1);
    renderSubjectInputs();
  }

  function handleGenerate(event) {
    event.preventDefault();
    syncSubjectDraftsFromDom();

    const formData = readFormState();
    if (!formData.subjects.length) {
      showToast("Add subjects", "Please add at least one subject before generating your timetable.", "warning");
      return;
    }
    if (!formData.days.length) {
      showToast("Choose days", "Select at least one available day for your weekly timetable.", "warning");
      return;
    }

    const timetable = generateDeterministicTimetable(formData);
    storage.saveTimetable(timetable);
    saveTimetableMeta(formData);
    renderTimetablePage();
    showToast("Timetable generated", "Your weekly study timetable has been created and saved locally.", "success");
  }

  function readFormState() {
    const subjects = subjectDrafts
      .map(function (subject) {
        return {
          name: subject.name.trim(),
          weak: Boolean(subject.weak)
        };
      })
      .filter(function (subject) {
        return subject.name;
      });

    const days = Array.from(elements.daysGroup.querySelectorAll('input[type="checkbox"]:checked')).map(function (input) {
      return input.value;
    });

    return {
      subjects: subjects,
      studyHoursPerDay: Math.max(1, Number(elements.studyHours.value) || 1),
      preferredStudyTime: elements.preferredTime.value,
      examDate: elements.examDate.value || "",
      days: days
    };
  }

  function generateDeterministicTimetable(config) {
    const palette = buildSubjectPalette(config.subjects);
    const slots = [];
    const weakSubjects = config.subjects.filter(function (subject) { return subject.weak; });
    const normalSubjects = config.subjects.filter(function (subject) { return !subject.weak; });
    const orderedSubjects = weakSubjects.concat(normalSubjects);
    const isExamNear = config.examDate ? daysUntil(config.examDate) <= 21 : false;
    let cursor = 0;

    config.days.forEach(function (day) {
      const isWeekend = day === "Saturday" || day === "Sunday";
      const sessionCount = Math.max(1, Math.floor(config.studyHoursPerDay));
      const timeBlocks = getTimeBlocks(config.preferredStudyTime, sessionCount, isWeekend);

      for (let index = 0; index < timeBlocks.length; index += 1) {
        const subject = orderedSubjects[cursor % orderedSubjects.length];
        cursor += subject.weak ? 2 : 1;
        const paletteInfo = palette[subject.name];
        slots.push({
          id: slugify(day + "-" + timeBlocks[index].time + "-" + subject.name + "-" + index),
          day: day,
          title: subject.name,
          subject: subject.name,
          weak: subject.weak,
          type: timeBlocks[index].type,
          time: timeBlocks[index].time,
          duration: timeBlocks[index].duration,
          description: buildSlotDescription(subject, timeBlocks[index], isWeekend, isExamNear),
          color: paletteInfo.color,
          emoji: paletteInfo.emoji,
          preferredTime: config.preferredStudyTime
        });

        if (index < timeBlocks.length - 1) {
          slots.push({
            id: slugify(day + "-break-" + index + "-" + subject.name),
            day: day,
            title: "Short Break",
            subject: "Short Break",
            weak: false,
            type: "break",
            time: getBreakTimeLabel(timeBlocks[index].time),
            duration: "15 min",
            description: "Step away briefly, hydrate, and return with better focus.",
            color: "#94a3b8",
            emoji: "☕",
            preferredTime: config.preferredStudyTime
          });
        }
      }

      if (isWeekend) {
        slots.push({
          id: slugify(day + "-revision-slot"),
          day: day,
          title: "Weekly Revision",
          subject: "Revision",
          weak: true,
          type: "revision",
          time: getRevisionTime(config.preferredStudyTime),
          duration: "45 min",
          description: "Review the hardest concepts from the week and update notes or flashcards.",
          color: "#7c3aed",
          emoji: "🔁",
          preferredTime: config.preferredStudyTime
        });
      }
    });

    return slots.sort(function (left, right) {
      const dayDifference = DAYS.indexOf(left.day) - DAYS.indexOf(right.day);
      if (dayDifference !== 0) {
        return dayDifference;
      }
      return left.time.localeCompare(right.time);
    });
  }

  function buildSubjectPalette(subjects) {
    const paletteColors = [
      "#2563eb",
      "#7c3aed",
      "#06b6d4",
      "#22c55e",
      "#f59e0b",
      "#ef4444",
      "#14b8a6",
      "#e879f9"
    ];
    const emojiMap = seedData.subjectEmojis || {};

    return subjects.reduce(function (accumulator, subject, index) {
      accumulator[subject.name] = {
        color: paletteColors[index % paletteColors.length],
        emoji: resolveSubjectEmoji(subject.name, emojiMap)
      };
      return accumulator;
    }, {});
  }

  function resolveSubjectEmoji(name, emojiMap) {
    const direct = emojiMap[name];
    if (direct) {
      return direct;
    }

    const normalized = String(name || "").toLowerCase();
    const mapKeys = Object.keys(emojiMap);
    for (let index = 0; index < mapKeys.length; index += 1) {
      const key = mapKeys[index];
      if (normalized.includes(key.toLowerCase().split(" ")[0])) {
        return emojiMap[key];
      }
    }

    return "📘";
  }

  function getTimeBlocks(preferredTime, sessionCount, isWeekend) {
    const baseMap = {
      Morning: ["06:30", "08:00", "09:30", "11:00"],
      Afternoon: ["13:00", "14:30", "16:00", "17:30"],
      Evening: ["17:30", "19:00", "20:30", "22:00"],
      Night: ["20:00", "21:30", "23:00", "00:30"]
    };
    const durations = isWeekend ? ["75 min", "60 min", "60 min", "45 min"] : ["60 min", "60 min", "45 min", "45 min"];
    const labels = baseMap[preferredTime] || baseMap.Evening;
    const limit = Math.min(Math.max(sessionCount, 1), 4);

    return labels.slice(0, limit).map(function (time, index) {
      return {
        time: time,
        duration: durations[index],
        type: isWeekend && index === limit - 1 ? "light-review" : "study"
      };
    });
  }

  function getBreakTimeLabel(lastStartTime) {
    const parts = String(lastStartTime).split(":");
    const hours = Number(parts[0]) || 0;
    const minutes = Number(parts[1]) || 0;
    const nextMinutes = hours * 60 + minutes + 60;
    const nextHours = Math.floor((nextMinutes / 60) % 24);
    const remainingMinutes = nextMinutes % 60;
    return String(nextHours).padStart(2, "0") + ":" + String(remainingMinutes).padStart(2, "0");
  }

  function getRevisionTime(preferredTime) {
    const revisionMap = {
      Morning: "12:30",
      Afternoon: "18:00",
      Evening: "22:45",
      Night: "01:15"
    };
    return revisionMap[preferredTime] || "22:45";
  }

  function buildSlotDescription(subject, block, isWeekend, isExamNear) {
    if (block.type === "light-review") {
      return "Wrap up the day with lighter revision, recap notes, and quick recall practice.";
    }

    const intensity = subject.weak ? "extra attention" : "steady progress";
    const examNote = isExamNear ? " Exams are close, so keep this session focused and outcome-driven." : "";
    const weekendNote = isWeekend ? " Weekend slots are ideal for longer concentration and revision." : "";
    return "This block gives " + subject.name + " " + intensity + " with a " + block.duration + " session." + weekendNote + examNote;
  }

  function renderTimetablePage() {
    const timetable = storage.getTimetable();
    const meta = getTimetableMeta();
    renderOverview(meta, timetable);
    renderHighlights(meta, timetable);
    renderCalendar(timetable);
  }

  function renderOverview(meta, timetable) {
    const activeDays = Array.from(new Set(timetable.map(function (slot) { return slot.day; }))).length;
    const weakSlots = timetable.filter(function (slot) { return slot.weak; }).length;
    const title = meta && meta.subjects && meta.subjects.length
      ? "Weekly plan for " + meta.subjects.length + " subjects"
      : "No timetable generated yet";
    const timeLabel = meta && meta.preferredStudyTime ? meta.preferredStudyTime : "Ready";

    elements.overviewTitle.textContent = title;
    elements.overviewTime.textContent = timeLabel;
    elements.overviewSummary.textContent = meta
      ? "Your weekly calendar balances weak areas, short breaks, and weekend revision based on your selected study rhythm."
      : "Generate a timetable to distribute weak subjects, short breaks, and weekend revision across your available days.";
    elements.coverageBar.style.width = Math.min(100, activeDays * 14) + "%";
    elements.slotsLabel.textContent = timetable.length + " slots";
    elements.daysLabel.textContent = activeDays + " days active";
    elements.weakLabel.textContent = weakSlots + " weak-focus slots";
  }

  function renderHighlights(meta, timetable) {
    const weakSubjects = meta && meta.subjects ? meta.subjects.filter(function (subject) { return subject.weak; }) : [];
    const highlights = [
      {
        icon: "🕒",
        title: "Preferred study time",
        text: meta ? meta.preferredStudyTime + " blocks shape the current weekly schedule." : "Choose your energy window to shape the week."
      },
      {
        icon: "📌",
        title: "Weak subjects weighted",
        text: weakSubjects.length ? weakSubjects.map(function (subject) { return subject.name; }).join(", ") + " receive more study attention." : "Mark a subject as weak to give it more space in the schedule."
      },
      {
        icon: "🔁",
        title: "Weekend revision",
        text: timetable.some(function (slot) { return slot.type === "revision"; }) ? "Revision blocks are already placed on the weekend." : "Weekend revision slots will appear automatically after generation."
      }
    ];

    elements.highlights.innerHTML = highlights.map(function (item) {
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

  function renderCalendar(timetable) {
    if (!Array.isArray(timetable) || !timetable.length) {
      elements.calendar.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🗓️</div>
          <h3>Your weekly calendar is waiting</h3>
          <p>Add subjects, choose your study rhythm, and generate a schedule that feels realistic and easy to follow.</p>
        </div>
      `;
      return;
    }

    const todayName = DAYS[(new Date().getDay() + 6) % 7];
    elements.calendar.innerHTML = `
      <div class="timetable-grid">
        ${DAYS.map(function (day) {
          const daySlots = timetable.filter(function (slot) { return slot.day === day; });
          const isToday = day === todayName;
          return `
            <section class="timetable-day-card ${isToday ? "is-today" : ""}">
              <div class="item-topline">
                <h3>${escapeHtml(day)}</h3>
                <span class="badge ${isToday ? "badge-success" : "badge-secondary"}">${isToday ? "Today" : daySlots.length + " slots"}</span>
              </div>
              <div class="timetable-slot-list">
                ${daySlots.length ? daySlots.map(renderSlotCard).join("") : `
                  <div class="info-card">
                    <h3>No study planned</h3>
                    <p>This day is currently free. Use it for rest or add it to the generator if needed.</p>
                  </div>
                `}
              </div>
            </section>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderSlotCard(slot) {
    const toneClass = slot.type === "break" ? "slot-break" : slot.type === "revision" ? "slot-revision" : slot.weak ? "slot-weak" : "slot-normal";
    return `
      <article class="timetable-slot-card ${toneClass}" style="--subject-accent:${escapeAttribute(slot.color || "#2563eb")}">
        <div class="item-topline">
          <h3>${escapeHtml(slot.emoji || "📘")} ${escapeHtml(slot.title)}</h3>
          <button class="secondary-button slot-edit-button" type="button" data-edit-slot="${escapeAttribute(slot.id)}">Edit</button>
        </div>
        <div class="item-meta">
          <span class="info-pill">⏰ ${escapeHtml(slot.time)}</span>
          <span class="info-pill">⏳ ${escapeHtml(slot.duration)}</span>
          <span class="info-pill">${escapeHtml(slot.day)}</span>
        </div>
        <p>${escapeHtml(slot.description)}</p>
      </article>
    `;
  }

  function openEditSlotModal(slotId) {
    const timetable = storage.getTimetable();
    const slot = timetable.find(function (item) { return item.id === slotId; });
    if (!slot) {
      showToast("Slot not found", "The selected slot could not be loaded for editing.", "warning");
      return;
    }

    const modalRoot = document.getElementById("modalRoot");
    modalRoot.innerHTML = `
      <div class="modal open" role="dialog" aria-modal="true">
        <div class="modal-panel">
          <div class="modal-header">
            <div>
              <h2>Edit timetable slot</h2>
              <p>Fine-tune this individual session without regenerating the full weekly plan.</p>
            </div>
            <button class="icon-button" type="button" data-close-modal aria-label="Close modal">✕</button>
          </div>
          <form id="editSlotForm" class="form-grid">
            <input type="hidden" name="slotId" value="${escapeAttribute(slot.id)}">
            <div class="form-row">
              <label class="form-label" for="editSlotTitle">Title</label>
              <input class="form-control" id="editSlotTitle" name="title" type="text" value="${escapeAttribute(slot.title)}" required>
            </div>
            <div class="form-row-inline">
              <div class="form-row">
                <label class="form-label" for="editSlotDay">Day</label>
                <select class="form-control" id="editSlotDay" name="day">
                  ${DAYS.map(function (day) {
                    return `<option value="${day}" ${slot.day === day ? "selected" : ""}>${day}</option>`;
                  }).join("")}
                </select>
              </div>
              <div class="form-row">
                <label class="form-label" for="editSlotTime">Time</label>
                <input class="form-control" id="editSlotTime" name="time" type="text" value="${escapeAttribute(slot.time)}" required>
              </div>
            </div>
            <div class="form-row-inline">
              <div class="form-row">
                <label class="form-label" for="editSlotDuration">Duration</label>
                <input class="form-control" id="editSlotDuration" name="duration" type="text" value="${escapeAttribute(slot.duration)}" required>
              </div>
              <div class="form-row">
                <label class="form-label" for="editSlotEmoji">Emoji</label>
                <input class="form-control" id="editSlotEmoji" name="emoji" type="text" value="${escapeAttribute(slot.emoji)}" maxlength="4">
              </div>
            </div>
            <div class="form-row">
              <label class="form-label" for="editSlotDescription">Description</label>
              <textarea class="form-control" id="editSlotDescription" name="description">${escapeHtml(slot.description)}</textarea>
            </div>
            <div class="modal-footer">
              <button class="secondary-button" type="button" data-close-modal>Cancel</button>
              <button class="gradient-button" id="saveEditedSlotButton" type="submit">Save Slot</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const editForm = document.getElementById("editSlotForm");
    if (editForm) {
      editForm.addEventListener("submit", saveEditedSlot);
    }
  }

  function saveEditedSlot(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const slotId = String(formData.get("slotId") || "");
    const timetable = storage.getTimetable().map(function (slot) {
      if (slot.id !== slotId) {
        return slot;
      }
      return {
        ...slot,
        title: String(formData.get("title") || slot.title).trim(),
        subject: String(formData.get("title") || slot.subject).trim(),
        day: String(formData.get("day") || slot.day),
        time: String(formData.get("time") || slot.time).trim(),
        duration: String(formData.get("duration") || slot.duration).trim(),
        emoji: String(formData.get("emoji") || slot.emoji).trim() || slot.emoji,
        description: String(formData.get("description") || slot.description).trim()
      };
    });

    storage.saveTimetable(timetable);
    closeModal();
    renderTimetablePage();
    showToast("Slot updated", "Your timetable slot was edited successfully.", "success");
  }

  function saveCurrentTimetable() {
    const saved = storage.getTimetable();
    if (!saved.length) {
      showToast("No timetable yet", "Generate a timetable before saving it again.", "warning");
      return;
    }
    syncSubjectDraftsFromDom();
    saveTimetableMeta(readFormState());
    storage.saveTimetable(saved);
    showToast("Timetable saved", "Your weekly timetable is stored safely in localStorage.", "success");
  }

  function regenerateTimetable() {
    syncSubjectDraftsFromDom();
    const formData = readFormState();
    if (!formData.subjects.length || !formData.days.length) {
      showToast("Setup incomplete", "Add subjects and available days before regenerating the timetable.", "warning");
      return;
    }
    const timetable = generateDeterministicTimetable(formData);
    storage.saveTimetable(timetable);
    saveTimetableMeta(formData);
    renderTimetablePage();
    showToast("Timetable regenerated", "A fresh weekly plan has been created using your current preferences.", "success");
  }

  function openClearConfirmation() {
    const modalRoot = document.getElementById("modalRoot");
    modalRoot.innerHTML = `
      <div class="modal open" role="dialog" aria-modal="true">
        <div class="modal-panel">
          <div class="modal-header">
            <div>
              <h2>Clear timetable?</h2>
              <p>This removes your saved weekly plan and resets the planner back to a clean state.</p>
            </div>
            <button class="icon-button" type="button" data-close-modal aria-label="Close modal">✕</button>
          </div>
          <div class="empty-state">
            <div class="empty-state-icon">⚠️</div>
            <h3>Only clear it if you want a fresh plan</h3>
            <p>Your subject drafts and preferences will also be reset to the default starter setup.</p>
          </div>
          <div class="modal-footer">
            <button class="secondary-button" type="button" data-close-modal>Keep Timetable</button>
            <button class="danger-button" type="button" id="confirmClearTimetableButton">Yes, Clear Timetable</button>
          </div>
        </div>
      </div>
    `;

    const confirmButton = document.getElementById("confirmClearTimetableButton");
    if (confirmButton) {
      confirmButton.addEventListener("click", clearTimetable, { once: true });
    }
  }

  function clearTimetable() {
    storage.saveTimetable([]);
    storage.removeData(TIMETABLE_META_KEY);
    subjectDrafts = DEFAULT_SUBJECTS.slice();
    renderSubjectInputs();
    renderDayCheckboxes();
    elements.form.reset();
    elements.studyHours.value = "3";
    elements.preferredTime.value = "Evening";
    closeModal();
    renderTimetablePage();
    showToast("Timetable cleared", "Your saved weekly schedule has been removed.", "warning");
  }

  function getTimetableMeta() {
    return storage.getData(TIMETABLE_META_KEY, null);
  }

  function saveTimetableMeta(meta) {
    storage.setData(TIMETABLE_META_KEY, meta);
  }

  function closeModal() {
    const modalRoot = document.getElementById("modalRoot");
    if (modalRoot) {
      modalRoot.innerHTML = "";
    }
  }

  function daysUntil(dateString) {
    const today = new Date();
    const target = new Date(dateString);
    const difference = target.getTime() - today.getTime();
    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }

  function showToast(title, message, tone) {
    if (app && typeof app.showToast === "function") {
      app.showToast(title, message, tone);
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

  document.addEventListener("DOMContentLoaded", initialize);
})();
