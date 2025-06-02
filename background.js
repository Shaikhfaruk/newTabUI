// Background Service Worker for Enhanced Material You New Tab
class BackgroundService {
  constructor() {
    this.setupEventListeners();
    this.initializeExtension();
  }

  setupEventListeners() {
    // Handle extension installation
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });

    // Handle keyboard commands
    chrome.commands.onCommand.addListener((command) => {
      this.handleCommand(command);
    });

    // Handle messages from content scripts or popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Handle tab updates for productivity tracking
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdate(tabId, changeInfo, tab);
    });

    // Handle tab activation for time tracking
    chrome.tabs.onActivated.addListener((activeInfo) => {
      this.handleTabActivation(activeInfo);
    });

    // Handle browser startup
    chrome.runtime.onStartup.addListener(() => {
      this.handleStartup();
    });

    // Handle alarms for notifications
    chrome.alarms.onAlarm.addListener((alarm) => {
      this.handleAlarm(alarm);
    });
  }

  initializeExtension() {
    // Set up default settings
    this.setDefaultSettings();

    // Schedule daily reset
    this.scheduleDailyReset();

    // Initialize productivity tracking
    this.initProductivityTracking();
  }

  handleInstallation(details) {
    if (details.reason === "install") {
      // First-time installation
      this.showWelcomeNotification();
      this.setDefaultSettings();
    } else if (details.reason === "update") {
      // Extension update
      this.handleUpdate(details.previousVersion);
    }
  }

  handleCommand(command) {
    switch (command) {
      case "open-calculator":
        this.openCalculator();
        break;
      case "open-converter":
        this.openConverter();
        break;
      case "voice-search":
        this.triggerVoiceSearch();
        break;
    }
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case "getWeatherData":
          const weatherData = await this.fetchWeatherData(request.location);
          sendResponse({ success: true, data: weatherData });
          break;

        case "getCryptoData":
          const cryptoData = await this.fetchCryptoData();
          sendResponse({ success: true, data: cryptoData });
          break;

        case "getNewsData":
          const newsData = await this.fetchNewsData();
          sendResponse({ success: true, data: newsData });
          break;

        case "saveProductivityData":
          await this.saveProductivityData(request.data);
          sendResponse({ success: true });
          break;

        case "getProductivityData":
          const productivityData = await this.getProductivityData();
          sendResponse({ success: true, data: productivityData });
          break;

        case "scheduleNotification":
          this.scheduleNotification(request.notification);
          sendResponse({ success: true });
          break;

        case "updateSettings":
          await this.updateSettings(request.settings);
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ success: false, error: "Unknown action" });
      }
    } catch (error) {
      console.error("Background service error:", error);
      sendResponse({ success: false, error: error.message });
    }
  }

  handleTabUpdate(tabId, changeInfo, tab) {
    if (changeInfo.status === "complete" && tab.url) {
      this.trackSiteVisit(tab.url);
    }
  }

  handleTabActivation(activeInfo) {
    this.trackActiveTime(activeInfo.tabId);
  }

  handleStartup() {
    this.resetDailyCounters();
    this.checkStreaks();
  }

  handleAlarm(alarm) {
    switch (alarm.name) {
      case "daily-reset":
        this.performDailyReset();
        break;
      case "pomodoro-complete":
        this.showPomodoroNotification();
        break;
      case "habit-reminder":
        this.showHabitReminder(alarm);
        break;
      case "break-reminder":
        this.showBreakReminder();
        break;
    }
  }

  // Weather API
  async fetchWeatherData(location) {
    const API_KEY = "42e074096c5c7a24d95f9929fe994d3b"; // Replace with actual API key
    let url;

    if (location && location.lat && location.lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}&units=metric`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${
        location || "London"
      }&appid=${API_KEY}&units=metric`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Weather API error");

      const data = await response.json();
      return {
        temperature: Math.round(data.main.temp),
        location: data.name,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        pressure: data.main.pressure,
        visibility: data.visibility / 1000, // Convert to km
      };
    } catch (error) {
      console.error("Weather fetch error:", error);
      throw error;
    }
  }

  // Cryptocurrency API
  async fetchCryptoData() {
    try {
      // Using a free API for crypto data
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cardano,solana&vs_currencies=usd&include_24hr_change=true"
      );
      if (!response.ok) throw new Error("Crypto API error");

      const data = await response.json();

      return [
        {
          symbol: "BTC",
          name: "Bitcoin",
          price: data.bitcoin.usd,
          change: data.bitcoin.usd_24h_change,
        },
        {
          symbol: "ETH",
          name: "Ethereum",
          price: data.ethereum.usd,
          change: data.ethereum.usd_24h_change,
        },
        {
          symbol: "ADA",
          name: "Cardano",
          price: data.cardano.usd,
          change: data.cardano.usd_24h_change,
        },
        {
          symbol: "SOL",
          name: "Solana",
          price: data.solana.usd,
          change: data.solana.usd_24h_change,
        },
      ];
    } catch (error) {
      console.error("Crypto fetch error:", error);
      throw error;
    }
  }

  // News API (mock data for now)
  async fetchNewsData() {
    // In a real implementation, you'd use a news API like NewsAPI
    return [
      {
        title: "AI Breakthrough in Quantum Computing",
        excerpt:
          "Scientists achieve new milestone in quantum-AI hybrid systems...",
        url: "https://example.com/news/1",
        time: "2h ago",
        source: "Tech News",
      },
      {
        title: "Sustainable Energy Solutions",
        excerpt: "New solar panel technology increases efficiency by 40%...",
        url: "https://example.com/news/2",
        time: "4h ago",
        source: "Green Tech",
      },
      {
        title: "Space Exploration Update",
        excerpt: "Mars rover discovers potential signs of ancient life...",
        url: "https://example.com/news/3",
        time: "6h ago",
        source: "Space News",
      },
    ];
  }

  // Productivity tracking
  async saveProductivityData(data) {
    const today = new Date().toDateString();
    const stored = await chrome.storage.local.get(["productivityData"]);
    const productivityData = stored.productivityData || {};

    if (!productivityData[today]) {
      productivityData[today] = {
        tasksCompleted: 0,
        pomodoroSessions: 0,
        habitsCompleted: 0,
        focusTime: 0,
        websitesVisited: [],
        activeTime: 0,
      };
    }

    // Update with new data
    Object.assign(productivityData[today], data);

    await chrome.storage.local.set({ productivityData });
  }

  async getProductivityData() {
    const stored = await chrome.storage.local.get(["productivityData"]);
    return stored.productivityData || {};
  }

  trackSiteVisit(url) {
    try {
      const domain = new URL(url).hostname;
      this.saveProductivityData({
        websitesVisited: [domain], // This would be merged with existing data
      });
    } catch (error) {
      // Invalid URL, ignore
    }
  }

  trackActiveTime(tabId) {
    // Track time spent on different tabs for productivity insights
    const now = Date.now();
    this.lastActiveTime = now;
    this.activeTabId = tabId;
  }

  // Command handlers
  async openCalculator() {
    const tabs = await chrome.tabs.query({ url: "chrome://newtab/" });
    if (tabs.length > 0) {
      await chrome.tabs.sendMessage(tabs[0].id, { action: "openCalculator" });
      await chrome.tabs.update(tabs[0].id, { active: true });
    }
  }

  async openConverter() {
    const tabs = await chrome.tabs.query({ url: "chrome://newtab/" });
    if (tabs.length > 0) {
      await chrome.tabs.sendMessage(tabs[0].id, { action: "openConverter" });
      await chrome.tabs.update(tabs[0].id, { active: true });
    }
  }

  async triggerVoiceSearch() {
    const tabs = await chrome.tabs.query({ url: "chrome://newtab/" });
    if (tabs.length > 0) {
      await chrome.tabs.sendMessage(tabs[0].id, { action: "startVoiceSearch" });
      await chrome.tabs.update(tabs[0].id, { active: true });
    }
  }

  // Notifications and alarms
  scheduleNotification(notification) {
    chrome.alarms.create(notification.name, {
      when: notification.when || Date.now() + notification.delay,
    });
  }

  showWelcomeNotification() {
    chrome.notifications.create("welcome", {
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Enhanced Material You New Tab",
      message:
        "Welcome! Your new tab experience has been enhanced with productivity tools and beautiful animations.",
    });
  }

  showPomodoroNotification() {
    chrome.notifications.create("pomodoro-complete", {
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Focus Session Complete!",
      message: "Great work! Time for a well-deserved break.",
      buttons: [{ title: "Start Break" }, { title: "Continue Working" }],
    });
  }

  showHabitReminder(alarm) {
    chrome.notifications.create("habit-reminder", {
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Habit Reminder",
      message: `Don't forget to complete your daily habits!`,
    });
  }

  showBreakReminder() {
    chrome.notifications.create("break-reminder", {
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Take a Break",
      message:
        "You've been working for a while. Consider taking a short break!",
    });
  }

  // Settings management
  async setDefaultSettings() {
    const stored = await chrome.storage.sync.get(["settings"]);
    if (!stored.settings) {
      const defaultSettings = {
        theme: "default",
        backgroundEffect: "particles",
        showWeather: true,
        showNews: true,
        pomodoroLength: 25,
        shortBreakLength: 5,
        longBreakLength: 15,
        habitReminders: true,
        breakReminders: true,
        notifications: true,
        voiceSearch: true,
        analyticsEnabled: true,
      };

      await chrome.storage.sync.set({ settings: defaultSettings });
    }
  }

  async updateSettings(newSettings) {
    const stored = await chrome.storage.sync.get(["settings"]);
    const settings = { ...stored.settings, ...newSettings };
    await chrome.storage.sync.set({ settings });
  }

  // Daily reset functionality
  scheduleDailyReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    chrome.alarms.create("daily-reset", {
      when: tomorrow.getTime(),
      periodInMinutes: 24 * 60, // Repeat daily
    });
  }

  async performDailyReset() {
    // Reset daily counters
    const today = new Date().toDateString();
    await this.saveProductivityData({
      tasksCompleted: 0,
      pomodoroSessions: 0,
      habitsCompleted: 0,
      focusTime: 0,
      websitesVisited: [],
      activeTime: 0,
    });

    // Update streaks
    await this.updateStreaks();

    // Clean old data (keep last 30 days)
    await this.cleanOldData();
  }

  async resetDailyCounters() {
    const today = new Date().toDateString();
    const stored = await chrome.storage.local.get(["productivityData"]);
    const productivityData = stored.productivityData || {};

    if (!productivityData[today]) {
      productivityData[today] = {
        tasksCompleted: 0,
        pomodoroSessions: 0,
        habitsCompleted: 0,
        focusTime: 0,
        websitesVisited: [],
        activeTime: 0,
      };

      await chrome.storage.local.set({ productivityData });
    }
  }

  async updateStreaks() {
    const stored = await chrome.storage.sync.get(["streaks"]);
    const streaks = stored.streaks || {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
    };

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();

    const productivityData = await this.getProductivityData();
    const yesterdayData = productivityData[yesterdayString];

    if (yesterdayData && this.wasProductiveDay(yesterdayData)) {
      streaks.currentStreak += 1;
      streaks.longestStreak = Math.max(
        streaks.longestStreak,
        streaks.currentStreak
      );
    } else {
      streaks.currentStreak = 0;
    }

    streaks.lastActiveDate = yesterdayString;
    await chrome.storage.sync.set({ streaks });
  }

  wasProductiveDay(dayData) {
    // Define what constitutes a productive day
    return (
      dayData.tasksCompleted >= 3 ||
      dayData.pomodoroSessions >= 2 ||
      dayData.habitsCompleted >= 2
    );
  }

  async checkStreaks() {
    const stored = await chrome.storage.sync.get(["streaks"]);
    const streaks = stored.streaks || { currentStreak: 0 };

    if (streaks.currentStreak >= 7) {
      chrome.notifications.create("streak-achievement", {
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Streak Achievement!",
        message: `Amazing! You've maintained productivity for ${streaks.currentStreak} days!`,
      });
    }
  }

  async cleanOldData() {
    const stored = await chrome.storage.local.get(["productivityData"]);
    const productivityData = stored.productivityData || {};

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    Object.keys(productivityData).forEach((dateString) => {
      const date = new Date(dateString);
      if (date < thirtyDaysAgo) {
        delete productivityData[dateString];
      }
    });

    await chrome.storage.local.set({ productivityData });
  }

  handleUpdate(previousVersion) {
    // Handle extension updates
    console.log(
      `Updated from version ${previousVersion} to ${
        chrome.runtime.getManifest().version
      }`
    );

    // Migrate data if necessary
    this.migrateData(previousVersion);

    // Show update notification
    chrome.notifications.create("update", {
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Extension Updated!",
      message:
        "Enhanced Material You New Tab has been updated with new features!",
    });
  }

  async migrateData(previousVersion) {
    // Migrate data structure if needed for version updates
    const majorVersion = parseInt(previousVersion.split(".")[0]);
    const currentMajorVersion = parseInt(
      chrome.runtime.getManifest().version.split(".")[0]
    );

    if (majorVersion < currentMajorVersion) {
      // Perform major version migration
      console.log("Performing major version migration...");
    }
  }
}

// Initialize the background service
const backgroundService = new BackgroundService();

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener(
  (notificationId, buttonIndex) => {
    if (notificationId === "pomodoro-complete") {
      if (buttonIndex === 0) {
        // Start break
        chrome.alarms.create("break-timer", { delayInMinutes: 5 });
      } else {
        // Continue working
        chrome.alarms.create("work-reminder", { delayInMinutes: 25 });
      }
    }

    chrome.notifications.clear(notificationId);
  }
);

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  // Open new tab when notification is clicked
  chrome.tabs.create({ url: "chrome://newtab/" });
  chrome.notifications.clear(notificationId);
});
