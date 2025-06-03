class EnhancedMaterialNewTab {
  constructor() {
    this.settings = this.loadSettings();
    this.currentTab = "productivity";
    this.timerInterval = null;
    this.timeLeft = 25 * 60;
    this.isTimerRunning = false;
    this.calculator = new Calculator();
    this.converter = new UnitConverter();
    this.animationFrameId = null;
    this.particles = [];

    this.init();
  }

  init() {
    this.setupCustomAnimations();
    this.setupEventListeners();
    this.initializeWidgets();
    this.startClock();
    this.loadData();
    this.animateElements();
    this.setupTabSystem();
    this.setupSettingsPanel();
  }

  // Custom 3D Animation System (replaces Three.js)
  setupCustomAnimations() {
    this.createParticleSystem();
    this.createFloatingShapes();
    this.startAnimationLoop();

    window.addEventListener("resize", () => this.handleResize());
  }

  createParticleSystem() {
    const canvas = document.getElementById("three-canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.ctx = canvas.getContext("2d");

    // Create particles
    this.particles = [];
    const particleCount = 80;

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.8 + 0.2,
        color: this.getParticleColor(),
        life: 1,
        maxLife: Math.random() * 200 + 100,
      });
    }
  }

  getParticleColor() {
    const colors = ["#6366f1", "#ec4899", "#06b6d4", "#10b981", "#f59e0b"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  createFloatingShapes() {
    const container = document.querySelector(".bg-3d-scene");
    container.innerHTML = ""; // Clear existing shapes

    // Create CSS-based 3D shapes
    const shapes = ["cube", "sphere", "pyramid"];
    const shapeCount = 12;

    for (let i = 0; i < shapeCount; i++) {
      const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
      const shape = document.createElement("div");
      shape.className = `floating-shape floating-${shapeType}`;

      // Random positioning
      shape.style.left = Math.random() * 100 + "%";
      shape.style.top = Math.random() * 100 + "%";
      shape.style.animationDelay = Math.random() * 10 + "s";
      shape.style.animationDuration = Math.random() * 10 + 15 + "s";

      // Random size
      const size = Math.random() * 40 + 20;
      shape.style.width = size + "px";
      shape.style.height = size + "px";

      container.appendChild(shape);
    }

    // Add gradient overlay
    const gradientOverlay = document.createElement("div");
    gradientOverlay.className = "gradient-overlay";
    container.appendChild(gradientOverlay);
  }

  startAnimationLoop() {
    const animate = () => {
      this.updateParticles();
      this.renderParticles();
      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  updateParticles() {
    const canvas = document.getElementById("three-canvas");

    this.particles.forEach((particle) => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Wrap around edges
      if (particle.x < 0) particle.x = canvas.width;
      if (particle.x > canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = canvas.height;
      if (particle.y > canvas.height) particle.y = 0;

      // Update life
      particle.life--;
      if (particle.life <= 0) {
        particle.life = particle.maxLife;
        particle.x = Math.random() * canvas.width;
        particle.y = Math.random() * canvas.height;
        particle.color = this.getParticleColor();
      }

      // Pulsing effect
      particle.alpha =
        0.3 + 0.5 * Math.sin(Date.now() * 0.003 + particle.x * 0.01);
    });
  }

  renderParticles() {
    const canvas = document.getElementById("three-canvas");
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Add subtle background gradient
    const gradient = this.ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2
    );
    gradient.addColorStop(0, "rgba(99, 102, 241, 0.02)");
    gradient.addColorStop(1, "rgba(16, 33, 62, 0.05)");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw connections between nearby particles
    this.drawConnections();

    // Draw particles
    this.particles.forEach((particle) => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.alpha;
      this.ctx.fillStyle = particle.color;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = particle.color;

      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  drawConnections() {
    const maxDistance = 150;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];

        const distance = Math.sqrt(
          Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
        );

        if (distance < maxDistance) {
          const alpha = 1 - distance / maxDistance;
          this.ctx.save();
          this.ctx.globalAlpha = alpha * 0.2;
          this.ctx.strokeStyle = "#6366f1";
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
          this.ctx.restore();
        }
      }
    }
  }

  handleResize() {
    const canvas = document.getElementById("three-canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // Settings Panel
  setupSettingsPanel() {
    const fab = document.getElementById("fab");
    const settingsPanel = document.getElementById("settingsPanel");
    const closeSettings = document.getElementById("closeSettings");

    fab.addEventListener("click", () => {
      settingsPanel.classList.add("open");
    });

    closeSettings.addEventListener("click", () => {
      settingsPanel.classList.remove("open");
    });

    // Theme selector
    document.querySelectorAll(".theme-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const theme = btn.dataset.theme;
        this.applyTheme(theme);

        document
          .querySelectorAll(".theme-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    // Background effect selector
    const bgEffect = document.getElementById("bgEffect");
    bgEffect.addEventListener("change", () => {
      this.updateBackgroundEffect(bgEffect.value);
    });
  }

  applyTheme(theme) {
    document.body.setAttribute("data-theme", theme);
    this.settings.theme = theme;
    this.saveSettings();
  }

  updateBackgroundEffect(effect) {
    // Update custom animation system based on effect
    this.settings.backgroundEffect = effect;
    this.saveSettings();

    // Recreate particle system with different parameters
    this.createParticleSystem();
    this.createFloatingShapes();

    // Apply effect-specific styles
    const canvas = document.getElementById("three-canvas");
    const container = document.querySelector(".bg-3d-scene");

    switch (effect) {
      case "particles":
        canvas.style.opacity = "0.8";
        container.classList.remove("minimal-mode");
        break;
      case "waves":
        canvas.style.opacity = "0.6";
        container.classList.add("wave-effect");
        break;
      case "geometric":
        canvas.style.opacity = "0.4";
        container.classList.add("geometric-focus");
        break;
      case "minimal":
        canvas.style.opacity = "0.2";
        container.classList.add("minimal-mode");
        break;
    }
  }

  // Tab System
  setupTabSystem() {
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const tabId = btn.dataset.tab;
        this.switchTab(tabId);

        tabBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });
  }

  switchTab(tabId) {
    const tabContents = document.querySelectorAll(".tab-content");

    tabContents.forEach((content) => {
      content.classList.remove("active");
    });

    const activeTab = document.getElementById(`${tabId}-tab`);
    if (activeTab) {
      activeTab.classList.add("active");
    }

    this.currentTab = tabId;
  }

  setupEventListeners() {
    // Search functionality
    this.setupSearch();

    // Quick links
    document.querySelectorAll(".quick-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        const url = e.currentTarget.dataset.url;
        if (url) {
          window.open(url, "_blank");
        } else if (e.currentTarget.classList.contains("calculator-link")) {
          this.openCalculator();
        } else if (e.currentTarget.classList.contains("converter-link")) {
          this.openConverter();
        }
      });
    });

    // Voice search
    const voiceSearch = document.querySelector(".voice-search");
    if (voiceSearch) {
      voiceSearch.addEventListener("click", () => this.startVoiceSearch());
    }

    // AI search
    const aiSearch = document.querySelector(".ai-search");
    if (aiSearch) {
      aiSearch.addEventListener("click", () => this.startAISearch());
    }
  }

  initializeWidgets() {
    this.initTodoList();
    this.initTimer();
    this.initNotes();
    this.initHabits();
    this.initMusic();
    this.initCrypto();
    this.initGames();
    this.initCalculator();
    this.initConverter();
    this.initColorPicker();
    this.initQRGenerator();
    this.initChart();
  }

  startClock() {
    const updateClock = () => {
      const now = new Date();

      // Main time display
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");

      const hoursEl = document.querySelector(".hours");
      const minutesEl = document.querySelector(".minutes");
      const secondsEl = document.querySelector(".seconds");

      if (hoursEl && minutesEl && secondsEl) {
        hoursEl.textContent = hours;
        minutesEl.textContent = minutes;
        secondsEl.textContent = seconds;
      }

      // Date display
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const dayName = dayNames[now.getDay()];
      const month = monthNames[now.getMonth()];
      const day = now.getDate();
      const year = now.getFullYear();

      const dayNameEl = document.querySelector(".day-name");
      const dateFullEl = document.querySelector(".date-full");

      if (dayNameEl && dateFullEl) {
        dayNameEl.textContent = dayName;
        dateFullEl.textContent = `${month} ${day}, ${year}`;
      }

      // World clock
      this.updateWorldClock();
    };

    updateClock();
    setInterval(updateClock, 1000);
  }

  updateWorldClock() {
    const timezones = [
      { label: "NYC", timezone: "America/New_York" },
      { label: "LON", timezone: "Europe/London" },
      { label: "TOK", timezone: "Asia/Tokyo" },
    ];

    timezones.forEach((tz, index) => {
      const time = new Date().toLocaleTimeString("en-US", {
        timeZone: tz.timezone,
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });

      const timeEl = document.querySelectorAll(".tz-time")[index];
      if (timeEl) {
        timeEl.textContent = time;
      }
    });
  }

  // Enhanced Todo List
  initTodoList() {
    const todoInput = document.querySelector(".todo-add-input");
    const todoBtn = document.querySelector(".todo-add-btn");
    const todoList = document.querySelector(".todo-list");
    const prioritySelect = document.querySelector(".priority-select");

    if (!todoInput || !todoBtn || !todoList) return;

    const addTodo = () => {
      const text = todoInput.value.trim();
      const priority = prioritySelect.value;

      if (text) {
        const todoItem = this.createTodoItem(text, false, priority);
        todoList.appendChild(todoItem);
        todoInput.value = "";
        this.saveTodos();
        this.updateTaskCount();
        this.updateProductivityStats();
      }
    };

    todoBtn.addEventListener("click", addTodo);
    todoInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") addTodo();
    });

    // Filter buttons
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.dataset.filter;
        this.filterTodos(filter);

        document
          .querySelectorAll(".filter-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    this.loadTodos();
  }

  createTodoItem(text, completed = false, priority = "medium") {
    const div = document.createElement("div");
    div.className = `todo-item slide-in ${priority}-priority`;
    div.innerHTML = `
      <input type="checkbox" class="todo-checkbox" ${
        completed ? "checked" : ""
      }>
      <span class="todo-text ${completed ? "completed" : ""}">${text}</span>
      <button class="todo-delete">×</button>
    `;

    const checkbox = div.querySelector(".todo-checkbox");
    const todoText = div.querySelector(".todo-text");
    const deleteBtn = div.querySelector(".todo-delete");

    checkbox.addEventListener("change", () => {
      todoText.classList.toggle("completed", checkbox.checked);
      this.saveTodos();
      this.updateTaskCount();
      this.updateProductivityStats();
    });

    deleteBtn.addEventListener("click", () => {
      div.remove();
      this.saveTodos();
      this.updateTaskCount();
      this.updateProductivityStats();
    });

    return div;
  }

  filterTodos(filter) {
    const todos = document.querySelectorAll(".todo-item");

    todos.forEach((todo) => {
      const checkbox = todo.querySelector(".todo-checkbox");
      const isCompleted = checkbox.checked;

      switch (filter) {
        case "all":
          todo.style.display = "flex";
          break;
        case "pending":
          todo.style.display = isCompleted ? "none" : "flex";
          break;
        case "completed":
          todo.style.display = isCompleted ? "flex" : "none";
          break;
      }
    });
  }

  // Enhanced Timer
  initTimer() {
    const timerDisplay = document.querySelector(".timer-display");
    const startBtn = document.querySelector(".start-btn");
    const pauseBtn = document.querySelector(".pause-btn");
    const resetBtn = document.querySelector(".reset-btn");
    const timerPreset = document.querySelector(".timer-preset");
    const timerProgress = document.querySelector(".timer-progress");

    if (!timerDisplay || !startBtn || !pauseBtn || !resetBtn) return;

    const updateDisplay = () => {
      const minutes = Math.floor(this.timeLeft / 60);
      const seconds = this.timeLeft % 60;
      timerDisplay.textContent = `${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      // Update circular progress
      if (timerProgress) {
        const totalTime = parseInt(timerPreset.value) * 60;
        const progress = (totalTime - this.timeLeft) / totalTime;
        const offset = 283 - progress * 283;
        timerProgress.style.strokeDashoffset = offset;
      }
    };

    const startTimer = () => {
      if (!this.isTimerRunning) {
        this.isTimerRunning = true;
        startBtn.textContent = "Running...";
        startBtn.disabled = true;

        this.timerInterval = setInterval(() => {
          this.timeLeft--;
          updateDisplay();

          if (this.timeLeft <= 0) {
            this.completeTimer();
          }
        }, 1000);
      }
    };

    const pauseTimer = () => {
      if (this.isTimerRunning) {
        clearInterval(this.timerInterval);
        this.isTimerRunning = false;
        startBtn.textContent = "Start";
        startBtn.disabled = false;
      }
    };

    const resetTimer = () => {
      clearInterval(this.timerInterval);
      this.isTimerRunning = false;
      this.timeLeft = parseInt(timerPreset.value) * 60;
      startBtn.textContent = "Start";
      startBtn.disabled = false;
      updateDisplay();
    };

    startBtn.addEventListener("click", startTimer);
    pauseBtn.addEventListener("click", pauseTimer);
    resetBtn.addEventListener("click", resetTimer);

    timerPreset.addEventListener("change", () => {
      if (!this.isTimerRunning) {
        this.timeLeft = parseInt(timerPreset.value) * 60;
        updateDisplay();
      }
    });

    updateDisplay();
  }

  completeTimer() {
    clearInterval(this.timerInterval);
    this.isTimerRunning = false;
    this.timeLeft =
      parseInt(document.querySelector(".timer-preset").value) * 60;

    const startBtn = document.querySelector(".start-btn");
    startBtn.textContent = "Start";
    startBtn.disabled = false;

    this.showNotification("Focus Complete!", "Time for a break!");
    this.updateTimerStats();
    this.updateProductivityStats();

    const timerDisplay = document.querySelector(".timer-display");
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  // Enhanced Notes
  initNotes() {
    const notesTextarea = document.querySelector(".notes-textarea");
    const saveBtn = document.querySelector(".save-note-btn");
    const clearBtn = document.querySelector(".clear-note-btn");
    const wordCount = document.querySelector(".word-count");
    const charCount = document.querySelector(".char-count");

    if (!notesTextarea) return;

    // Load saved notes
    notesTextarea.value = this.settings.notes || "";
    this.updateNoteStats();

    // Auto-save notes
    let saveTimeout;
    notesTextarea.addEventListener("input", () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        this.settings.notes = notesTextarea.value;
        this.saveSettings();
      }, 500);

      this.updateNoteStats();
    });

    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        this.settings.notes = notesTextarea.value;
        this.saveSettings();
        this.showToast("Notes saved!", "success");
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (confirm("Clear all notes?")) {
          notesTextarea.value = "";
          this.settings.notes = "";
          this.saveSettings();
          this.updateNoteStats();
        }
      });
    }
  }

  updateNoteStats() {
    const notesTextarea = document.querySelector(".notes-textarea");
    const wordCount = document.querySelector(".word-count");
    const charCount = document.querySelector(".char-count");

    if (!notesTextarea || !wordCount || !charCount) return;

    const text = notesTextarea.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;

    wordCount.textContent = `${words} words`;
    charCount.textContent = `${chars} chars`;
  }

  // Habits
  initHabits() {
    const habitsList = document.querySelector(".habits-list");
    const addHabitBtn = document.querySelector(".add-habit-btn");

    if (!habitsList || !addHabitBtn) return;

    addHabitBtn.addEventListener("click", () => {
      const habitName = prompt("Enter habit name:");
      if (habitName) {
        this.addHabit(habitName);
      }
    });

    this.loadHabits();
  }

  addHabit(name) {
    const habitsList = document.querySelector(".habits-list");
    const div = document.createElement("div");
    div.className = "habit-item slide-in";
    div.innerHTML = `
      <div class="habit-info">
        <span class="habit-name">${name}</span>
        <span class="habit-streak">0 days</span>
      </div>
      <button class="habit-check">✓</button>
    `;

    const checkBtn = div.querySelector(".habit-check");
    checkBtn.addEventListener("click", () => {
      this.completeHabit(div);
    });

    habitsList.appendChild(div);
    this.saveHabits();
  }

  completeHabit(habitElement) {
    const checkBtn = habitElement.querySelector(".habit-check");
    const streakEl = habitElement.querySelector(".habit-streak");

    checkBtn.classList.add("completed");

    // Update streak (simplified - in real app, track dates)
    const currentStreak = parseInt(streakEl.textContent) || 0;
    streakEl.textContent = `${currentStreak + 1} days`;

    this.saveHabits();
    this.updateProductivityStats();
    this.showToast("Habit completed!", "success");
  }

  // Calculator
  initCalculator() {
    this.calculator.init();
  }

  openCalculator() {
    const modal = document.getElementById("calculatorModal");
    if (modal) {
      modal.classList.add("open");
    } else {
      // Scroll to calculator widget
      const calcWidget = document.querySelector(".calculator-widget");
      if (calcWidget) {
        this.switchTab("tools");
        calcWidget.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  // Unit Converter
  initConverter() {
    this.converter.init();
  }

  openConverter() {
    this.switchTab("tools");
    const converterWidget = document.querySelector(".converter-widget");
    if (converterWidget) {
      converterWidget.scrollIntoView({ behavior: "smooth" });
    }
  }

  // Color Picker
  initColorPicker() {
    const colorInput = document.getElementById("colorInput");
    const hexValue = document.getElementById("hexValue");
    const rgbValue = document.getElementById("rgbValue");
    const copyBtn = document.querySelector(".copy-color");

    if (!colorInput || !hexValue || !rgbValue) return;

    const updateColorValues = () => {
      const hex = colorInput.value;
      const rgb = this.hexToRgb(hex);

      hexValue.value = hex;
      rgbValue.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    };

    colorInput.addEventListener("change", updateColorValues);
    colorInput.addEventListener("input", updateColorValues);

    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(hexValue.value);
        this.showToast("Color copied!", "success");
      });
    }

    updateColorValues();
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  // QR Generator
  initQRGenerator() {
    const qrInput = document.querySelector(".qr-input");
    const qrCode = document.getElementById("qrCode");
    const downloadBtn = document.querySelector(".download-qr");

    if (!qrInput || !qrCode) return;

    let qrTimeout;
    qrInput.addEventListener("input", () => {
      clearTimeout(qrTimeout);
      qrTimeout = setTimeout(() => {
        this.generateQR(qrInput.value, qrCode);
      }, 500);
    });

    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        this.downloadQR();
      });
    }
  }

  generateQR(text, container) {
    if (!text.trim()) {
      container.innerHTML =
        '<div class="qr-placeholder">Enter text to generate QR code</div>';
      return;
    }

    // Simple QR code generation (in real app, use QR library)
    container.innerHTML = `
      <div style="width: 120px; height: 120px; background: #000; margin: 0 auto; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; text-align: center; word-break: break-all; padding: 10px;">
        QR: ${text.substring(0, 20)}...
      </div>
    `;
  }

  // Music Integration
  initMusic() {
    const playBtn = document.querySelector(".play-btn");
    const musicBtns = document.querySelectorAll(".music-btn");

    if (!playBtn) return;

    musicBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.showToast("Music controls require Spotify integration", "info");
      });
    });
  }

  // Cryptocurrency
  initCrypto() {
    const refreshBtn = document.querySelector(".refresh-crypto");

    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        this.loadCryptoData();
      });
    }

    this.loadCryptoData();
  }

  loadCryptoData() {
    // Simulate crypto data loading
    const cryptoItems = document.querySelectorAll(".crypto-item");

    cryptoItems.forEach((item) => {
      const price = item.querySelector(".price");
      const change = item.querySelector(".change");

      if (price && change) {
        // Simulate price changes
        const currentPrice = parseFloat(
          price.textContent.replace("$", "").replace(",", "")
        );
        const changePercent = (Math.random() - 0.5) * 10;
        const newPrice = currentPrice * (1 + changePercent / 100);

        price.textContent = `$${newPrice.toLocaleString()}`;
        change.textContent = `${
          changePercent > 0 ? "+" : ""
        }${changePercent.toFixed(1)}%`;
        change.className = `change ${
          changePercent > 0 ? "positive" : "negative"
        }`;
      }
    });
  }

  // Games
  initGames() {
    document.querySelectorAll(".game-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const game = btn.dataset.game;
        this.openGame(game);
      });
    });
  }

  openGame(gameType) {
    this.showToast(`Opening ${gameType} game...`, "info");
    // In real implementation, would open game modals
  }

  // Chart
  initChart() {
    const canvas = document.getElementById("productivityChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Simple chart drawing (in real app, use Chart.js)
    ctx.fillStyle = "#6366f1";
    ctx.fillRect(10, 180, 30, 40);
    ctx.fillRect(50, 160, 30, 60);
    ctx.fillRect(90, 140, 30, 80);
    ctx.fillRect(130, 120, 30, 100);
    ctx.fillRect(170, 100, 30, 120);
    ctx.fillRect(210, 80, 30, 140);
    ctx.fillRect(250, 60, 30, 160);

    ctx.fillStyle = "#ffffff";
    ctx.font = "12px Arial";
    ctx.fillText("Productivity Chart", 10, 20);
  }

  // Search
  setupSearch() {
    const searchInput = document.querySelector(".search-input");
    const suggestionsContainer = document.querySelector(".search-suggestions");

    if (!searchInput || !suggestionsContainer) return;

    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();

      if (query.length > 2) {
        searchTimeout = setTimeout(() => {
          this.showSearchSuggestions(query);
        }, 300);
      } else {
        suggestionsContainer.innerHTML = "";
        suggestionsContainer.style.display = "none";
      }
    });

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.performSearch(e.target.value);
      }
    });

    // Hide suggestions when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-container")) {
        suggestionsContainer.style.display = "none";
      }
    });
  }

  showSearchSuggestions(query) {
    const suggestions = [
      `${query} - Google Search`,
      `${query} - YouTube`,
      `${query} - Wikipedia`,
      `${query} site:github.com`,
      `${query} site:stackoverflow.com`,
      `"${query}" - Exact match`,
      `${query} news - Latest news`,
      `${query} images - Image search`,
    ];

    const suggestionsContainer = document.querySelector(".search-suggestions");
    if (!suggestionsContainer) return;

    suggestionsContainer.innerHTML = "";

    suggestions.forEach((suggestion) => {
      const div = document.createElement("div");
      div.className = "search-suggestion";
      div.textContent = suggestion;
      div.addEventListener("click", () => {
        const searchInput = document.querySelector(".search-input");
        if (searchInput) {
          searchInput.value = suggestion;
          this.performSearch(suggestion);
          suggestionsContainer.style.display = "none";
        }
      });
      suggestionsContainer.appendChild(div);
    });

    suggestionsContainer.style.display = "block";
  }

  performSearch(query) {
    if (query.trim()) {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
        query
      )}`;
      window.open(searchUrl, "_blank");
    }
  }

  startVoiceSearch() {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        this.showToast("Listening...", "info");
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.querySelector(".search-input").value = transcript;
        this.performSearch(transcript);
      };

      recognition.onerror = () => {
        this.showToast("Voice search error", "error");
      };

      recognition.start();
    } else {
      this.showToast("Voice search not supported", "error");
    }
  }

  startAISearch() {
    const query = document.querySelector(".search-input").value;
    if (query) {
      this.showToast("AI search feature coming soon!", "info");
    } else {
      this.showToast("Enter search query first", "error");
    }
  }

  // Data Loading
  loadData() {
    this.loadBookmarks();
    this.getWeatherData();
    this.loadNews();
    this.updateProductivityStats();
  }

  async loadBookmarks() {
    try {
      const bookmarks = await new Promise((resolve) => {
        chrome.bookmarks.getRecent(6, resolve);
      });

      const bookmarksGrid = document.querySelector(".bookmarks-grid");
      if (bookmarksGrid) {
        bookmarksGrid.innerHTML = "";

        bookmarks.forEach((bookmark) => {
          if (bookmark.url) {
            const bookmarkEl = this.createBookmarkElement(bookmark);
            bookmarksGrid.appendChild(bookmarkEl);
          }
        });
      }
    } catch (error) {
      console.log("Bookmarks permission not available");
    }
  }

  createBookmarkElement(bookmark) {
    const div = document.createElement("div");
    div.className = "bookmark-item scale-in";
    div.innerHTML = `
      <div class="bookmark-favicon">
        <img src="https://www.google.com/s2/favicons?domain=${
          new URL(bookmark.url).hostname
        }" 
             alt="favicon" onerror="this.style.display='none'">
      </div>
      <div class="bookmark-info">
        <div class="bookmark-title">${bookmark.title}</div>
        <div class="bookmark-url">${new URL(bookmark.url).hostname}</div>
      </div>
    `;

    div.addEventListener("click", () => {
      window.open(bookmark.url, "_blank");
    });

    return div;
  }

  async getWeatherData(defaultCity = "Pune") {
    const apiKey = "YOUR_OPENWEATHERMAP_API_KEY";
    let weatherApiUrl;

    if (!apiKey || apiKey === "YOUR_OPENWEATHERMAP_API_KEY") {
      this.updateWeatherDisplay({
        temperature: "--",
        location: "API Key Missing",
        icon: "⚠️",
        description: "Setup required in script.js",
        humidity: "--",
        wind: "--",
        uv: "--",
      });
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation not supported"));
          return;
        }

        const timeoutId = setTimeout(
          () => reject(new Error("Geolocation timeout")),
          7000
        );

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeoutId);
            resolve(pos);
          },
          (err) => {
            clearTimeout(timeoutId);
            reject(err);
          }
        );
      });

      const { latitude, longitude } = position.coords;
      weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
    } catch (geoError) {
      weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${defaultCity}&appid=${apiKey}&units=metric`;
    }

    try {
      const response = await fetch(weatherApiUrl);
      if (!response.ok) throw new Error("Weather API request failed");

      const data = await response.json();

      this.updateWeatherDisplay({
        temperature: Math.round(data.main.temp),
        location: data.name,
        icon: this.getWeatherIcon(data.weather[0].main, data.weather[0].icon),
        description: data.weather[0].description.replace(/\b\w/g, (l) =>
          l.toUpperCase()
        ),
        humidity: data.main.humidity,
        wind: Math.round(data.wind.speed * 3.6),
        uv: 3, // UV data requires separate API call
      });
    } catch (error) {
      console.error("Weather error:", error);
      this.updateWeatherDisplay({
        temperature: "--",
        location: defaultCity,
        icon: "⚠️",
        description: "Weather data unavailable",
        humidity: "--",
        wind: "--",
        uv: "--",
      });
    }
  }

  getWeatherIcon(weatherMain, iconCode) {
    const main = weatherMain.toLowerCase();

    if (main.includes("clear")) return "☀️";
    if (main.includes("clouds")) {
      if (iconCode === "02d" || iconCode === "02n") return "🌤️";
      if (iconCode === "03d" || iconCode === "03n") return "☁️";
      if (iconCode === "04d" || iconCode === "04n") return "🌥️";
      return "☁️";
    }
    if (main.includes("rain")) return "🌧️";
    if (main.includes("drizzle")) return "🌦️";
    if (main.includes("thunderstorm")) return "⛈️";
    if (main.includes("snow")) return "❄️";
    if (main.includes("mist") || main.includes("fog")) return "🌫️";

    return "🌍";
  }

  updateWeatherDisplay(data) {
    // Compact weather
    const tempEl = document.querySelector(".weather-compact .temperature");
    const locationEl = document.querySelector(".weather-compact .location");
    const iconEl = document.querySelector(".weather-compact .weather-icon");

    if (tempEl && locationEl && iconEl) {
      tempEl.textContent = `${data.temperature}°`;
      locationEl.textContent = data.location;
      iconEl.textContent = data.icon;
    }

    // Detailed weather
    const tempFullEl = document.querySelector(".weather-temp");
    const locationFullEl = document.querySelector(".weather-location");
    const iconLargeEl = document.querySelector(".weather-icon-large");
    const descriptionEl = document.querySelector(".weather-description");

    if (tempFullEl && locationFullEl && iconLargeEl && descriptionEl) {
      tempFullEl.textContent = `${data.temperature}°C`;
      locationFullEl.textContent = data.location;
      iconLargeEl.textContent = data.icon;
      descriptionEl.textContent = data.description;
    }

    // Weather details
    const details = document.querySelectorAll(".weather-detail .detail-value");
    if (details.length >= 3) {
      details[0].textContent = `${data.humidity}%`;
      details[1].textContent = `${data.wind} km/h`;
      details[2].textContent = data.uv;
    }
  }

  loadNews() {
    // Simulate news loading
    const newsGrid = document.querySelector(".news-grid");
    if (!newsGrid) return;

    const mockNews = [
      {
        title: "Technology Breakthrough",
        excerpt:
          "Latest advances in artificial intelligence and quantum computing...",
        time: "2h ago",
      },
      {
        title: "Space Exploration Update",
        excerpt: "New discoveries from the latest Mars mission reveal...",
        time: "4h ago",
      },
      {
        title: "Climate Innovation",
        excerpt: "Revolutionary clean energy solutions show promise...",
        time: "6h ago",
      },
    ];

    newsGrid.innerHTML = mockNews
      .map(
        (news) => `
      <div class="news-item">
        <div class="news-image">📰</div>
        <div class="news-content">
          <h4 class="news-title">${news.title}</h4>
          <p class="news-excerpt">${news.excerpt}</p>
          <span class="news-time">${news.time}</span>
        </div>
      </div>
    `
      )
      .join("");
  }

  // Statistics and Progress
  updateProductivityStats() {
    const productivityScore = this.calculateProductivityScore();
    const goalsCompleted = this.calculateGoalsCompleted();
    const streakDays = this.calculateStreak();

    const productivityEl = document.getElementById("productivityScore");
    const goalsEl = document.getElementById("goalsCompleted");
    const streakEl = document.getElementById("streakDays");

    if (productivityEl) productivityEl.textContent = `${productivityScore}%`;
    if (goalsEl) goalsEl.textContent = goalsCompleted;
    if (streakEl) streakEl.textContent = streakDays;
  }

  calculateProductivityScore() {
    const completedTasks = document.querySelectorAll(
      ".todo-checkbox:checked"
    ).length;
    const totalTasks = document.querySelectorAll(".todo-checkbox").length;
    const completedHabits = document.querySelectorAll(
      ".habit-check.completed"
    ).length;

    let score = 70; // Base score
    if (totalTasks > 0) {
      score += (completedTasks / totalTasks) * 20;
    }
    score += completedHabits * 5;

    return Math.min(100, Math.round(score));
  }

  calculateGoalsCompleted() {
    const completedTasks = document.querySelectorAll(
      ".todo-checkbox:checked"
    ).length;
    const totalGoals = 5; // Could be dynamic
    return `${Math.min(completedTasks, totalGoals)}/${totalGoals}`;
  }

  calculateStreak() {
    return this.settings.streak || 0;
  }

  updateTaskCount() {
    const taskCountEl = document.querySelector(".task-count");
    const incompleteTasks = document.querySelectorAll(
      ".todo-item .todo-checkbox:not(:checked)"
    ).length;

    if (taskCountEl) {
      taskCountEl.textContent = incompleteTasks.toString();
    }
  }

  updateTimerStats() {
    // Update timer statistics
    this.settings.timerSessions = (this.settings.timerSessions || 0) + 1;
    this.settings.timerSessionsToday =
      (this.settings.timerSessionsToday || 0) + 1;
    this.saveSettings();

    const todayEl = document.querySelector(".timer-stats .stat-value");
    const weekEl = document.querySelectorAll(".timer-stats .stat-value")[1];

    if (todayEl) todayEl.textContent = this.settings.timerSessionsToday;
    if (weekEl) weekEl.textContent = this.settings.timerSessions;
  }

  // Utility Functions
  animateElements() {
    const elements = document.querySelectorAll(
      ".hero-section, .search-section, .quick-access, .bookmarks-section, .sidebar"
    );

    elements.forEach((el, index) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(30px)";

      setTimeout(() => {
        el.classList.add("fade-in");
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, index * 150);
    });
  }

  showNotification(title, message) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body: message });
    } else if (
      "Notification" in window &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, { body: message });
        }
      });
    }
  }

  showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Data Persistence
  loadSettings() {
    const defaultSettings = {
      theme: "default",
      backgroundEffect: "particles",
      notes: "",
      todos: [],
      habits: [],
      timerSessions: 0,
      timerSessionsToday: 0,
      streak: 0,
    };

    try {
      const saved = JSON.parse(
        localStorage.getItem("enhanced-material-newtab-settings") || "{}"
      );
      return { ...defaultSettings, ...saved };
    } catch {
      return defaultSettings;
    }
  }

  saveSettings() {
    try {
      localStorage.setItem(
        "enhanced-material-newtab-settings",
        JSON.stringify(this.settings)
      );
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }

  saveTodos() {
    const todos = [];
    document.querySelectorAll(".todo-item").forEach((item) => {
      const text = item.querySelector(".todo-text").textContent;
      const completed = item.querySelector(".todo-checkbox").checked;
      const priority = item.classList.contains("high-priority")
        ? "high"
        : item.classList.contains("medium-priority")
        ? "medium"
        : "low";
      todos.push({ text, completed, priority });
    });

    this.settings.todos = todos;
    this.saveSettings();
  }

  loadTodos() {
    const todos = this.settings.todos || [];
    const todoList = document.querySelector(".todo-list");

    if (todoList) {
      todos.forEach((todo) => {
        const todoItem = this.createTodoItem(
          todo.text,
          todo.completed,
          todo.priority
        );
        todoList.appendChild(todoItem);
      });
      this.updateTaskCount();
    }
  }

  saveHabits() {
    const habits = [];
    document.querySelectorAll(".habit-item").forEach((item) => {
      const name = item.querySelector(".habit-name").textContent;
      const streak = item.querySelector(".habit-streak").textContent;
      const completed = item
        .querySelector(".habit-check")
        .classList.contains("completed");
      habits.push({ name, streak, completed });
    });

    this.settings.habits = habits;
    this.saveSettings();
  }

  loadHabits() {
    const habits = this.settings.habits || [
      { name: "Exercise", streak: "3 days", completed: false },
      { name: "Read", streak: "7 days", completed: false },
    ];

    const habitsList = document.querySelector(".habits-list");
    if (habitsList) {
      habitsList.innerHTML = "";
      habits.forEach((habit) => {
        this.addHabitFromData(habit);
      });
    }
  }

  addHabitFromData(habitData) {
    const habitsList = document.querySelector(".habits-list");
    const div = document.createElement("div");
    div.className = "habit-item";
    div.innerHTML = `
      <div class="habit-info">
        <span class="habit-name">${habitData.name}</span>
        <span class="habit-streak">${habitData.streak}</span>
      </div>
      <button class="habit-check ${
        habitData.completed ? "completed" : ""
      }">✓</button>
    `;

    const checkBtn = div.querySelector(".habit-check");
    checkBtn.addEventListener("click", () => {
      this.completeHabit(div);
    });

    habitsList.appendChild(div);
  }
}

// Calculator Class
class Calculator {
  constructor() {
    this.display = "";
    this.operator = "";
    this.previousValue = "";
    this.waitingForOperand = false;
  }

  init() {
    const display = document.querySelector(".calc-display");
    const buttons = document.querySelectorAll(".calc-btn");
    const clearBtn = document.querySelector(".calc-clear");

    if (!display || !buttons.length) return;

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const value = button.textContent;

        if (button.classList.contains("number")) {
          this.inputNumber(value);
        } else if (button.classList.contains("operator")) {
          this.inputOperator(value);
        } else if (button.classList.contains("equals")) {
          this.calculate();
        } else if (button.classList.contains("dot")) {
          this.inputDot();
        }

        this.updateDisplay();
      });
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        this.clear();
        this.updateDisplay();
      });
    }
  }

  inputNumber(num) {
    if (this.waitingForOperand) {
      this.display = num;
      this.waitingForOperand = false;
    } else {
      this.display = this.display === "0" ? num : this.display + num;
    }
  }

  inputOperator(nextOperator) {
    const inputValue = parseFloat(this.display);

    if (this.previousValue === "") {
      this.previousValue = inputValue;
    } else if (this.operator) {
      const currentValue = this.previousValue || 0;
      const newValue = this.performCalculation();

      this.display = String(newValue);
      this.previousValue = newValue;
    }

    this.waitingForOperand = true;
    this.operator = nextOperator;
  }

  inputDot() {
    if (this.waitingForOperand) {
      this.display = "0.";
      this.waitingForOperand = false;
    } else if (this.display.indexOf(".") === -1) {
      this.display += ".";
    }
  }

  calculate() {
    const inputValue = parseFloat(this.display);

    if (this.previousValue !== "" && this.operator) {
      const newValue = this.performCalculation();
      this.display = String(newValue);
      this.previousValue = "";
      this.operator = "";
      this.waitingForOperand = true;
    }
  }

  performCalculation() {
    const prev = parseFloat(this.previousValue);
    const current = parseFloat(this.display);

    switch (this.operator) {
      case "+":
        return prev + current;
      case "-":
        return prev - current;
      case "×":
        return prev * current;
      case "÷":
        return current !== 0 ? prev / current : 0;
      default:
        return current;
    }
  }

  clear() {
    this.display = "0";
    this.operator = "";
    this.previousValue = "";
    this.waitingForOperand = false;
  }

  updateDisplay() {
    const displayEl = document.querySelector(".calc-display");
    if (displayEl) {
      displayEl.textContent = this.display || "0";
    }
  }
}

// Unit Converter Class
class UnitConverter {
  constructor() {
    this.conversions = {
      length: {
        m: 1,
        km: 0.001,
        ft: 3.28084,
        in: 39.3701,
        cm: 100,
        mm: 1000,
      },
      weight: {
        kg: 1,
        g: 1000,
        lb: 2.20462,
        oz: 35.274,
      },
      temperature: {
        c: { c: 1, f: (c) => (c * 9) / 5 + 32, k: (c) => c + 273.15 },
        f: {
          f: 1,
          c: (f) => ((f - 32) * 5) / 9,
          k: (f) => ((f - 32) * 5) / 9 + 273.15,
        },
        k: {
          k: 1,
          c: (k) => k - 273.15,
          f: (k) => ((k - 273.15) * 9) / 5 + 32,
        },
      },
    };
  }

  init() {
    const fromValue = document.getElementById("fromValue");
    const toValue = document.getElementById("toValue");
    const fromUnit = document.getElementById("fromUnit");
    const toUnit = document.getElementById("toUnit");
    const converterType = document.querySelector(".converter-type");
    const swapBtn = document.querySelector(".swap-btn");

    if (!fromValue || !toValue || !fromUnit || !toUnit) return;

    const convert = () => {
      const value = parseFloat(fromValue.value) || 0;
      const from = fromUnit.value;
      const to = toUnit.value;
      const type = converterType.value;

      const result = this.convert(value, from, to, type);
      toValue.value = result.toFixed(4);
    };

    fromValue.addEventListener("input", convert);
    fromUnit.addEventListener("change", () => {
      this.updateUnits();
      convert();
    });
    toUnit.addEventListener("change", convert);
    converterType.addEventListener("change", () => {
      this.updateUnits();
      convert();
    });

    if (swapBtn) {
      swapBtn.addEventListener("click", () => {
        const tempValue = fromUnit.value;
        fromUnit.value = toUnit.value;
        toUnit.value = tempValue;

        const tempInputValue = fromValue.value;
        fromValue.value = toValue.value;
        toValue.value = tempInputValue;
      });
    }

    this.updateUnits();
  }

  convert(value, fromUnit, toUnit, type) {
    if (!this.conversions[type]) return 0;

    const conversion = this.conversions[type];

    if (type === "temperature") {
      const fromConv = conversion[fromUnit];
      const toConv = conversion[toUnit];

      if (fromUnit === toUnit) return value;

      // Convert to Celsius first, then to target
      let celsius = value;
      if (fromUnit === "f") celsius = fromConv.c(value);
      else if (fromUnit === "k") celsius = fromConv.c(value);

      if (toUnit === "c") return celsius;
      else if (toUnit === "f") return conversion.c.f(celsius);
      else if (toUnit === "k") return conversion.c.k(celsius);
    } else {
      const fromRate = conversion[fromUnit];
      const toRate = conversion[toUnit];

      if (!fromRate || !toRate) return 0;

      return (value / fromRate) * toRate;
    }

    return 0;
  }

  updateUnits() {
    const converterType = document.querySelector(".converter-type");
    const fromUnit = document.getElementById("fromUnit");
    const toUnit = document.getElementById("toUnit");

    if (!converterType || !fromUnit || !toUnit) return;

    const type = converterType.value;
    let units = [];

    switch (type) {
      case "length":
        units = [
          { value: "m", label: "Meters" },
          { value: "km", label: "Kilometers" },
          { value: "ft", label: "Feet" },
          { value: "in", label: "Inches" },
          { value: "cm", label: "Centimeters" },
          { value: "mm", label: "Millimeters" },
        ];
        break;
      case "weight":
        units = [
          { value: "kg", label: "Kilograms" },
          { value: "g", label: "Grams" },
          { value: "lb", label: "Pounds" },
          { value: "oz", label: "Ounces" },
        ];
        break;
      case "temperature":
        units = [
          { value: "c", label: "Celsius" },
          { value: "f", label: "Fahrenheit" },
          { value: "k", label: "Kelvin" },
        ];
        break;
      case "currency":
        units = [
          { value: "usd", label: "USD" },
          { value: "eur", label: "EUR" },
          { value: "gbp", label: "GBP" },
          { value: "jpy", label: "JPY" },
        ];
        break;
    }

    fromUnit.innerHTML = "";
    toUnit.innerHTML = "";

    units.forEach((unit) => {
      fromUnit.innerHTML += `<option value="${unit.value}">${unit.label}</option>`;
      toUnit.innerHTML += `<option value="${unit.value}">${unit.label}</option>`;
    });
  }
}

// Initialize the enhanced new tab
document.addEventListener("DOMContentLoaded", () => {
  new EnhancedMaterialNewTab();
});

// Additional utility styles injection
const additionalCSS = `
.slide-in {
  animation: slideIn 0.6s ease-out;
}

.scale-in {
  animation: scaleIn 0.3s ease-out;
}

.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid var(--glass-border);
  border-top: 2px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Inject additional CSS
const style = document.createElement("style");
style.textContent = additionalCSS;
document.head.appendChild(style);
