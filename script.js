class MaterialNewTab {
  constructor() {
    this.init();
    this.setupEventListeners();
    this.startClock();
    this.loadBookmarks();
    this.initializeProductivity();
    this.setupSearch();
    this.animate3DElements();
  }

  init() {
    this.animateElements();
    this.loadSettings();
    this.getWeatherData();
  }

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

  animate3DElements() {
    // Add random animation delays to 3D elements for more dynamic feel
    const cubes = document.querySelectorAll(".floating-cube");
    const spheres = document.querySelectorAll(".floating-sphere");
    const pyramids = document.querySelectorAll(".floating-pyramid");

    cubes.forEach((cube, index) => {
      cube.style.animationDelay = `${-index * 3}s`;
    });

    spheres.forEach((sphere, index) => {
      sphere.style.animationDelay = `${-index * 5}s`;
    });

    pyramids.forEach((pyramid, index) => {
      pyramid.style.animationDelay = `${-index * 7}s`;
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

    // Search functionality
    const searchInput = document.querySelector(".search-input");
    if (searchInput) {
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.performSearch(e.target.value);
        }
      });

      searchInput.addEventListener("input", (e) => {
        this.showSearchSuggestions(e.target.value);
      });
    }
  }

  startClock() {
    const updateClock = () => {
      const now = new Date();

      // Update time (without seconds)
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");

      const hoursEl = document.querySelector(".hours");
      const minutesEl = document.querySelector(".minutes");

      if (hoursEl && minutesEl) {
        hoursEl.textContent = hours;
        minutesEl.textContent = minutes;
      }

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

      const dayNameEl = document.querySelector(".day-name");
      const dateFullEl = document.querySelector(".date-full");

      if (dayNameEl && dateFullEl) {
        dayNameEl.textContent = dayName;
        dateFullEl.textContent = `${month} ${day}, ${year}`;
      }
    };

    updateClock();
    setInterval(updateClock, 1000);
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
        <div class="bookmark-url">${new URL(bookmark.url).hostname}</div>
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

    if (!todoInput || !todoBtn || !todoList) return;

    const addTodo = () => {
      const text = todoInput.value.trim();
      if (text) {
        const todoItem = this.createTodoItem(text);
        todoList.appendChild(todoItem);
        todoInput.value = "";
        this.saveTodos();
        this.updateTaskCount();
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
    });

    deleteBtn.addEventListener("click", () => {
      div.remove();
      this.saveTodos();
      this.updateTaskCount();
    });

    return div;
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

    if (todoList) {
      todos.forEach((todo) => {
        const todoItem = this.createTodoItem(todo.text, todo.completed);
        todoList.appendChild(todoItem);
      });
      this.updateTaskCount();
    }
  }

  initNotes() {
    const notesTextarea = document.querySelector(".notes-textarea");

    if (notesTextarea) {
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
  }

  initTimer() {
    let timerInterval;
    let timeLeft = 25 * 60; // 25 minutes in seconds
    let isRunning = false;

    const timerDisplay = document.querySelector(".timer-display");
    const startBtn = document.querySelector(".start-btn");
    const pauseBtn = document.querySelector(".pause-btn");
    const resetBtn = document.querySelector(".reset-btn");

    if (!timerDisplay || !startBtn || !pauseBtn || !resetBtn) return;

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
        startBtn.disabled = true;
        timerInterval = setInterval(() => {
          timeLeft--;
          updateDisplay();

          if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            startBtn.textContent = "Start";
            startBtn.disabled = false;
            this.showNotification("Focus Complete!", "Time for a break!");
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
        startBtn.disabled = false;
      }
    };

    const resetTimer = () => {
      clearInterval(timerInterval);
      isRunning = false;
      timeLeft = 25 * 60;
      startBtn.textContent = "Start";
      startBtn.disabled = false;
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

  async getWeatherData(defaultCity = "Pune") {
    const apiKey = "42e074096c5c7a24d95f9929fe994d3b"; // <-- REPLACE WITH YOUR ACTUAL API KEY
    let weatherApiUrl;

    if (!apiKey || apiKey === "YOUR_OPENWEATHERMAP_API_KEY") {
      console.error(
        "OpenWeatherMap API key is missing or is the placeholder. Please add your API key to script.js."
      );
      this.updateWeatherDisplay({
        temperature: "--",
        location: "API Key Missing",
        icon: "⚠️",
        description: "Setup required in script.js",
      });
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by your browser."));
          return;
        }
        // Timeout for geolocation to prevent indefinite waiting
        const timeoutId = setTimeout(
          () => reject(new Error("Geolocation timed out")),
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
      console.log("Fetching weather by coordinates...");
    } catch (geoError) {
      console.warn(
        `Geolocation failed: ${geoError.message}. Falling back to city: ${defaultCity}`
      );
      weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${defaultCity}&appid=${apiKey}&units=metric`;
    }

    try {
      const response = await fetch(weatherApiUrl);
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        throw new Error(
          `Weather API request failed: ${response.status} - ${
            errorData.message || "Unknown error"
          }`
        );
      }
      const data = await response.json();

      if (!data.main || !data.weather || !data.weather.length) {
        throw new Error("Incomplete weather data received from API.");
      }

      this.updateWeatherDisplay({
        temperature: Math.round(data.main.temp),
        location: data.name,
        icon: this.getWeatherIcon(data.weather[0].main, data.weather[0].icon),
        description: data.weather[0].description.replace(/\b\w/g, (l) =>
          l.toUpperCase()
        ), // Capitalize first letter of each word
      });
    } catch (error) {
      console.error("Error fetching or processing weather data:", error);
      this.updateWeatherDisplay({
        temperature: "--",
        location: defaultCity, // Show the city we attempted to fetch for
        icon: "⚠️",
        description: "Weather data unavailable",
      });
    }
  }

  getWeatherIcon(weatherMain, iconCode) {
    const main = weatherMain.toLowerCase();
    // You can expand this mapping or use OpenWeatherMap's icon URLs if preferred
    // e.g., `http://openweathermap.org/img/wn/${iconCode}@2x.png`
    // For simplicity, using emojis based on main condition:
    if (main.includes("clear")) return "☀️";
    if (main.includes("clouds")) {
      if (iconCode === "02d" || iconCode === "02n") return "🌤️"; // Few clouds
      if (iconCode === "03d" || iconCode === "03n") return "☁️"; // Scattered clouds
      if (iconCode === "04d" || iconCode === "04n") return "🌥️"; // Broken clouds / Overcast
      return "☁️"; // Default for clouds
    }
    if (main.includes("rain")) return "🌧️";
    if (main.includes("drizzle")) return "🌦️";
    if (main.includes("thunderstorm")) return "⛈️";
    if (main.includes("snow")) return "❄️";
    if (
      main.includes("mist") ||
      main.includes("fog") ||
      main.includes("haze") ||
      main.includes("smoke") ||
      main.includes("dust") ||
      main.includes("sand") ||
      main.includes("ash") ||
      main.includes("squall") ||
      main.includes("tornado")
    )
      return "🌫️";

    // Fallback based on OpenWeatherMap icon codes if main condition didn't match well
    if (iconCode.startsWith("01")) return "☀️"; // clear
    if (iconCode.startsWith("02")) return "🌤️"; // few clouds
    if (iconCode.startsWith("03")) return "☁️"; // scattered clouds
    if (iconCode.startsWith("04")) return "🌥️"; // broken clouds
    if (iconCode.startsWith("09")) return "🌧️"; // shower rain
    if (iconCode.startsWith("10")) return "🌦️"; // rain
    if (iconCode.startsWith("11")) return "⛈️"; // thunderstorm
    if (iconCode.startsWith("13")) return "❄️"; // snow
    if (iconCode.startsWith("50")) return "🌫️"; // mist

    return "🌍"; // Generic fallback icon
  }

  updateWeatherDisplay(data) {
    // Update compact weather in hero section
    const temperatureEl = document.querySelector(
      ".weather-compact .temperature"
    );
    const locationEl = document.querySelector(".weather-compact .location");
    const iconEl = document.querySelector(".weather-compact .weather-icon");

    if (temperatureEl && locationEl && iconEl) {
      temperatureEl.textContent = `${data.temperature}°`;
      locationEl.textContent = data.location;
      iconEl.textContent = data.icon;
    }

    // Update detailed weather in sidebar
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

  loadSettings() {
    // Load user preferences from storage
    const settings = JSON.parse(
      localStorage.getItem("material-newtab-settings") || "{}"
    );

    // Apply settings
    if (settings.backgroundEffects === false) {
      const bgScene = document.querySelector(".bg-3d-scene");
      if (bgScene) {
        bgScene.style.display = "none";
      }
    }

    if (settings.showWeather === false) {
      const weatherWidgets = document.querySelectorAll(
        ".weather-compact, .weather-widget"
      );
      weatherWidgets.forEach((widget) => {
        widget.style.display = "none";
      });
    }
  }
}

// Initialize the extension when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new MaterialNewTab();
});

// Additional CSS for dynamic elements that wasn't in the main CSS
const additionalCSS = `
.bookmark-item {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 1rem;
    background: var(--glass-bg);
    backdrop-filter: blur(15px);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.bookmark-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    border-color: var(--primary);
}

.bookmark-favicon img {
    width: 24px;
    height: 24px;
    border-radius: 6px;
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
    font-size: 0.9rem;
}

.bookmark-url {
    font-size: 0.8rem;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.timer-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.timer-btn:disabled:hover {
    transform: none;
    box-shadow: none;
    border-color: var(--glass-border);
}
`;

// Inject additional CSS
const style = document.createElement("style");
style.textContent = additionalCSS;
document.head.appendChild(style);
