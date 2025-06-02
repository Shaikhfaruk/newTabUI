class MaterialNewTab {
  constructor() {
    this.init();
    this.setupEventListeners();
    this.startClock();
    this.loadBookmarks();
    this.initializeProductivity();
    this.setupSearch();
  }

  init() {
    this.animateElements();
    this.loadSettings();
    this.getWeatherData();
  }

  animateElements() {
    const elements = document.querySelectorAll(
      ".header, .search-section, .quick-access, .bookmarks-section, .productivity-section"
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

  setupEventListeners() {
    // Quick links
    document.querySelectorAll(".quick-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        const url = e.currentTarget.dataset.url;
        if (url) {
          window.open(url, "_blank");
        }
      });
    });

    // Settings button
    document.querySelector(".settings-btn").addEventListener("click", () => {
      this.openSettings();
    });

    // Search functionality
    const searchInput = document.querySelector(".search-input");
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.performSearch(e.target.value);
      }
    });

    searchInput.addEventListener("input", (e) => {
      this.showSearchSuggestions(e.target.value);
    });
  }

  startClock() {
    const updateClock = () => {
      const now = new Date();

      // Update time
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");

      document.querySelector(".hours").textContent = hours;
      document.querySelector(".minutes").textContent = minutes;
      document.querySelector(".seconds").textContent = seconds;

      // Update date
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

      document.querySelector(".day-name").textContent = dayName;
      document.querySelector(
        ".date-full"
      ).textContent = `${month} ${day}, ${year}`;
    };

    updateClock();
    setInterval(updateClock, 1000);
  }

  async loadBookmarks() {
    try {
      const bookmarks = await new Promise((resolve) => {
        chrome.bookmarks.getRecent(8, resolve);
      });

      const bookmarksGrid = document.querySelector(".bookmarks-grid");
      bookmarksGrid.innerHTML = "";

      bookmarks.forEach((bookmark) => {
        if (bookmark.url) {
          const bookmarkEl = this.createBookmarkElement(bookmark);
          bookmarksGrid.appendChild(bookmarkEl);
        }
      });
    } catch (error) {
      console.log("Bookmarks permission not available");
    }
  }

  createBookmarkElement(bookmark) {
    const div = document.createElement("div");
    div.className = "bookmark-item";
    div.innerHTML = `
            <div class="bookmark-favicon">
                <img src="https://www.google.com/s2/favicons?domain=${
                  new URL(bookmark.url).hostname
                }" 
                     alt="favicon" onerror="this.style.display='none'">
            </div>
            <div class="bookmark-info">
                <div class="bookmark-title">${bookmark.title}</div>
                <div class="bookmark-url">${
                  new URL(bookmark.url).hostname
                }</div>
            </div>
        `;

    div.addEventListener("click", () => {
      window.open(bookmark.url, "_blank");
    });

    return div;
  }

  initializeProductivity() {
    this.initTodoList();
    this.initNotes();
    this.initTimer();
  }

  initTodoList() {
    const todoInput = document.querySelector(".todo-add-input");
    const todoBtn = document.querySelector(".todo-add-btn");
    const todoList = document.querySelector(".todo-list");

    const addTodo = () => {
      const text = todoInput.value.trim();
      if (text) {
        const todoItem = this.createTodoItem(text);
        todoList.appendChild(todoItem);
        todoInput.value = "";
        this.saveTodos();
      }
    };

    todoBtn.addEventListener("click", addTodo);
    todoInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        addTodo();
      }
    });

    this.loadTodos();
  }

  createTodoItem(text, completed = false) {
    const div = document.createElement("div");
    div.className = "todo-item slide-in";
    div.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${
              completed ? "checked" : ""
            }>
            <span class="todo-text ${
              completed ? "completed" : ""
            }">${text}</span>
            <button class="todo-delete">×</button>
        `;

    const checkbox = div.querySelector(".todo-checkbox");
    const todoText = div.querySelector(".todo-text");
    const deleteBtn = div.querySelector(".todo-delete");

    checkbox.addEventListener("change", () => {
      todoText.classList.toggle("completed", checkbox.checked);
      this.saveTodos();
    });

    deleteBtn.addEventListener("click", () => {
      div.remove();
      this.saveTodos();
    });

    return div;
  }

  saveTodos() {
    const todos = [];
    document.querySelectorAll(".todo-item").forEach((item) => {
      const text = item.querySelector(".todo-text").textContent;
      const completed = item.querySelector(".todo-checkbox").checked;
      todos.push({ text, completed });
    });
    localStorage.setItem("material-newtab-todos", JSON.stringify(todos));
  }

  loadTodos() {
    const todos = JSON.parse(
      localStorage.getItem("material-newtab-todos") || "[]"
    );
    const todoList = document.querySelector(".todo-list");

    todos.forEach((todo) => {
      const todoItem = this.createTodoItem(todo.text, todo.completed);
      todoList.appendChild(todoItem);
    });
  }

  initNotes() {
    const notesTextarea = document.querySelector(".notes-textarea");

    // Load saved notes
    notesTextarea.value = localStorage.getItem("material-newtab-notes") || "";

    // Auto-save notes
    let saveTimeout;
    notesTextarea.addEventListener("input", () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        localStorage.setItem("material-newtab-notes", notesTextarea.value);
      }, 500);
    });
  }

  initTimer() {
    let timerInterval;
    let timeLeft = 25 * 60; // 25 minutes in seconds
    let isRunning = false;

    const timerDisplay = document.querySelector(".timer-display");
    const startBtn = document.querySelector(".start-btn");
    const pauseBtn = document.querySelector(".pause-btn");
    const resetBtn = document.querySelector(".reset-btn");

    const updateDisplay = () => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timerDisplay.textContent = `${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    const startTimer = () => {
      if (!isRunning) {
        isRunning = true;
        startBtn.textContent = "Running...";
        timerInterval = setInterval(() => {
          timeLeft--;
          updateDisplay();

          if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            startBtn.textContent = "Start";
            this.showNotification("Pomodoro Complete!", "Time for a break!");
            timeLeft = 25 * 60;
            updateDisplay();
          }
        }, 1000);
      }
    };

    const pauseTimer = () => {
      if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
        startBtn.textContent = "Start";
      }
    };

    const resetTimer = () => {
      clearInterval(timerInterval);
      isRunning = false;
      timeLeft = 25 * 60;
      startBtn.textContent = "Start";
      updateDisplay();
    };

    startBtn.addEventListener("click", startTimer);
    pauseBtn.addEventListener("click", pauseTimer);
    resetBtn.addEventListener("click", resetTimer);

    updateDisplay();
  }

  setupSearch() {
    const searchInput = document.querySelector(".search-input");
    const suggestionsContainer = document.querySelector(".search-suggestions");

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
    ];

    const suggestionsContainer = document.querySelector(".search-suggestions");
    suggestionsContainer.innerHTML = "";

    suggestions.forEach((suggestion) => {
      const div = document.createElement("div");
      div.className = "search-suggestion";
      div.textContent = suggestion;
      div.addEventListener("click", () => {
        document.querySelector(".search-input").value = suggestion;
        this.performSearch(suggestion);
        suggestionsContainer.style.display = "none";
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

  async getWeatherData() {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;

      // You would typically use a weather API here
      // For demo purposes, we'll use placeholder data
      this.updateWeatherDisplay({
        temperature: Math.round(Math.random() * 30 + 10),
        location: "Your Location",
        icon: "🌤️",
      });
    } catch (error) {
      console.log("Location access denied or unavailable");
    }
  }

  updateWeatherDisplay(data) {
    document.querySelector(
      ".temperature"
    ).textContent = `${data.temperature}°C`;
    document.querySelector(".location").textContent = data.location;
    document.querySelector(".weather-icon").textContent = data.icon;
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

  openSettings() {
    // This would open a settings modal/panel
    console.log("Settings panel would open here");

    // Create a simple settings panel
    const settingsPanel = document.createElement("div");
    settingsPanel.className = "settings-panel";
    settingsPanel.innerHTML = `
            <div class="settings-content">
                <h2>Settings</h2>
                <div class="setting-item">
                    <label>Background Effects</label>
                    <input type="checkbox" id="bg-effects" checked>
                </div>
                <div class="setting-item">
                    <label>Show Weather</label>
                    <input type="checkbox" id="show-weather" checked>
                </div>
                <div class="setting-item">
                    <label>24-Hour Clock</label>
                    <input type="checkbox" id="24h-clock">
                </div>
                <button class="close-settings">Close</button>
            </div>
        `;

    document.body.appendChild(settingsPanel);

    settingsPanel
      .querySelector(".close-settings")
      .addEventListener("click", () => {
        settingsPanel.remove();
      });
  }

  loadSettings() {
    // Load user preferences from storage
    const settings = JSON.parse(
      localStorage.getItem("material-newtab-settings") || "{}"
    );

    // Apply settings
    if (settings.backgroundEffects === false) {
      document.querySelector(".bg-particles").style.display = "none";
    }

    if (settings.showWeather === false) {
      document.querySelector(".weather-widget").style.display = "none";
    }
  }
}

// Initialize the extension when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new MaterialNewTab();
});

// Add CSS for dynamic elements
const additionalCSS = `
.bookmark-item {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 1rem;
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.bookmark-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    border-color: var(--neon-blue);
}

.bookmark-favicon img {
    width: 24px;
    height: 24px;
    border-radius: 4px;
}

.bookmark-info {
    flex: 1;
    min-width: 0;
}

.bookmark-title {
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.bookmark-url {
    font-size: 0.9rem;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.search-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--glass-bg);
    backdrop-filter: blur(15px);
    border: 1px solid var(--glass-border);
    border-radius: 15px;
    margin-top: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
    display: none;
}

.search-suggestion {
    padding: 0.8rem 1rem;
    cursor: pointer;
    transition: background 0.2s ease;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.search-suggestion:hover {
    background: rgba(255, 255, 255, 0.1);
}

.search-suggestion:last-child {
    border-bottom: none;
}

.settings-panel {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.settings-content {
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    padding: 2rem;
    min-width: 300px;
    max-width: 500px;
}

.settings-content h2 {
    margin-bottom: 1.5rem;
    color: var(--text-primary);
    text-align: center;
}

.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    color: var(--text-primary);
}

.close-settings {
    width: 100%;
    padding: 0.8rem;
    background: var(--primary-gradient);
    border: none;
    border-radius: 10px;
    color: white;
    font-weight: 500;
    cursor: pointer;
    margin-top: 1rem;
    transition: all 0.3s ease;
}

.close-settings:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}
`;

// Inject additional CSS
const style = document.createElement("style");
style.textContent = additionalCSS;
document.head.appendChild(style);
