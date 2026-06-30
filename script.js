const STORAGE_KEYS = {
  users: "cryptocraze_users",
  session: "cryptocraze_session",
  carts: "cryptocraze_carts",
  marketCache: "cryptocraze_market_cache"
};

const TRACKED_COINS = [
  "bitcoin",
  "ethereum",
  "dogecoin",
  "solana",
  "cardano",
  "ripple"
];

const CHART_RANGES = {
  day: { days: 1, interval: "hourly", title: "Daily price chart", maxPoints: 8 },
  month: { days: 30, interval: "daily", title: "Monthly price chart", maxPoints: 10 },
  year: { days: 365, interval: "daily", title: "Yearly price chart", maxPoints: 12 }
};

const FALLBACK_MARKET_DATA = [
  { id: "bitcoin", name: "Bitcoin", symbol: "btc", current_price: 67240.18, price_change_percentage_24h: 2.48, image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
  { id: "ethereum", name: "Ethereum", symbol: "eth", current_price: 3218.74, price_change_percentage_24h: 1.36, image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
  { id: "dogecoin", name: "Dogecoin", symbol: "doge", current_price: 0.1642, price_change_percentage_24h: -0.87, image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png" },
  { id: "solana", name: "Solana", symbol: "sol", current_price: 182.35, price_change_percentage_24h: 3.11, image: "https://assets.coingecko.com/coins/images/4128/large/solana.png" },
  { id: "cardano", name: "Cardano", symbol: "ada", current_price: 0.728, price_change_percentage_24h: 0.69, image: "https://assets.coingecko.com/coins/images/975/large/cardano.png" },
  { id: "ripple", name: "XRP", symbol: "xrp", current_price: 0.6435, price_change_percentage_24h: -1.22, image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png" }
];

const state = {
  marketData: [],
  chartInstances: {},
  currentChartRange: {
    dashboard: "month",
    public: "month"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page || "home";

  ensureToastContainer();
  initNavigation();
  bindLogout();

  if (page === "login" || page === "signup") {
    redirectAuthenticatedUser();
  } else if (page === "dashboard" || page === "buy" || page === "cart") {
    requireAuth();
    updateCartBadges();
  }

  switch (page) {
    case "home":
      initHomePage();
      break;
    case "login":
      initLoginPage();
      break;
    case "signup":
      initSignupPage();
      break;
    case "dashboard":
      initDashboardPage();
      break;
    case "buy":
      initBuyPage();
      break;
    case "cart":
      initCartPage();
      break;
    default:
      break;
  }
});

async function initHomePage() {
  document.getElementById("homeRefreshButton")?.addEventListener("click", async () => {
    await loadHomeMarketData(true);
  });

  bindChartRangeButtons("public");
  updateChartRangeButtons("public");

  await loadHomeMarketData();
  await loadPriceChart(false, state.currentChartRange.public, "public");
}

function initNavigation() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-nav-menu]");

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener("click", () => {
    menu.classList.toggle("is-open");
  });
}

function initLoginPage() {
  const form = document.getElementById("loginForm");

  document.getElementById("previewRefreshButton")?.addEventListener("click", async () => {
    await loadPublicMarketPreview(true);
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors(form);

    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value.trim();
    const errors = {};

    if (!validateEmail(email)) {
      errors.email = "Enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    }

    if (Object.keys(errors).length) {
      renderErrors(form, errors);
      setFormMessage("loginMessage", "Please correct the highlighted fields.", "error");
      return;
    }

    const users = getUsers();
    const matchedUser = users.find((user) => user.email === email && user.password === password);

    if (!matchedUser) {
      setFormMessage("loginMessage", "Invalid email or password. Please try again.", "error");
      return;
    }

    saveSession({ name: matchedUser.name, email: matchedUser.email, loginAt: new Date().toISOString() });
    setFormMessage("loginMessage", "Login successful. Redirecting to your dashboard...", "success");

    window.setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 700);
  });

  loadPublicMarketPreview();
}

function initSignupPage() {
  const form = document.getElementById("signupForm");

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors(form);

    const name = form.name.value.trim();
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value.trim();
    const confirmPassword = form.confirmPassword.value.trim();
    const errors = {};

    if (name.length < 2) {
      errors.name = "Name must be at least 2 characters.";
    }

    if (!validateEmail(email)) {
      errors.email = "Enter a valid email address.";
    }

    if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (confirmPassword !== password) {
      errors.confirmPassword = "Passwords do not match.";
    }

    const users = getUsers();
    if (users.some((user) => user.email === email)) {
      errors.email = "An account with this email already exists.";
    }

    if (Object.keys(errors).length) {
      renderErrors(form, errors);
      setFormMessage("signupMessage", "Please correct the highlighted fields.", "error");
      return;
    }

    const newUser = {
      id: crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}`,
      name,
      email,
      password,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    setUsers(users);
    saveSession({ name, email, loginAt: new Date().toISOString() });
    setFormMessage("signupMessage", "Account created. Redirecting to the dashboard...", "success");

    window.setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 700);
  });
}

async function initDashboardPage() {
  const session = getSession();
  const welcomeMessage = document.getElementById("welcomeMessage");
  const sessionUserName = document.getElementById("sessionUserName");

  if (welcomeMessage) {
    welcomeMessage.textContent = `Welcome back, ${session.name}`;
  }

  if (sessionUserName) {
    sessionUserName.textContent = session.name;
  }

  updateDashboardCartValue();

  document.getElementById("refreshPricesButton")?.addEventListener("click", async () => {
    await loadDashboardData(true);
  });

  bindChartRangeButtons("dashboard");
  updateChartRangeButtons("dashboard");

  await loadDashboardData();
}

async function initBuyPage() {
  updateBuyCartSummary();

  document.getElementById("refreshBuyButton")?.addEventListener("click", async () => {
    await loadBuyCatalog(true);
  });

  await loadBuyCatalog();
}

async function initCartPage() {
  document.getElementById("checkoutButton")?.addEventListener("click", () => {
    const cart = getUserCart();

    if (!cart.length) {
      showToast("Your cart is empty. Add coins before checkout.", "error");
      return;
    }

    showToast("Checkout is a frontend demo for now. Your cart is ready.", "success");
  });

  await renderCartPage();
}

async function loadDashboardData(forceRefresh = false) {
  const loader = document.getElementById("dashboardLoader");
  const cards = document.getElementById("marketCards");
  const notice = document.getElementById("dashboardNotice");

  setLoader(loader, true);

  const { data, fallbackUsed, errorMessage } = await fetchMarketData(forceRefresh);
  state.marketData = data;
  renderDashboardCards(data.slice(0, 3), cards);
  renderTrendInsights(data.slice(0, 3));
  updateNotice(notice, fallbackUsed ? errorMessage : "", fallbackUsed ? "error" : "");
  updateDashboardCartValue();
  setLoader(loader, false);

  await loadPriceChart(forceRefresh, state.currentChartRange.dashboard, "dashboard");
}

async function loadHomeMarketData(forceRefresh = false) {
  const loader = document.getElementById("homeMarketLoader");
  const cards = document.getElementById("homeMarketCards");
  const notice = document.getElementById("homeMarketNotice");

  if (!cards) {
    return;
  }

  setLoader(loader, true);

  const { data, fallbackUsed, errorMessage } = await fetchMarketData(forceRefresh);
  renderDashboardCards(data.slice(0, 3), cards, {
    actionHref: "login.html",
    actionLabel: "Login"
  });
  updateNotice(notice, fallbackUsed ? errorMessage : "", fallbackUsed ? "error" : "");
  setLoader(loader, false);
}

async function loadPublicMarketPreview(forceRefresh = false) {
  const loader = document.getElementById("publicMarketLoader");
  const cards = document.getElementById("publicMarketCards");
  const notice = document.getElementById("publicMarketNotice");

  if (!cards) {
    return;
  }

  setLoader(loader, true);

  const { data, fallbackUsed, errorMessage } = await fetchMarketData(forceRefresh);
  renderDashboardCards(data.slice(0, 3), cards, {
    actionHref: "login.html",
    actionLabel: "Login"
  });
  updateNotice(notice, fallbackUsed ? errorMessage : "", fallbackUsed ? "error" : "");

  setLoader(loader, false);
}

async function loadBuyCatalog(forceRefresh = false) {
  const loader = document.getElementById("buyLoader");
  const catalog = document.getElementById("coinCatalog");
  const notice = document.getElementById("buyNotice");

  setLoader(loader, true);

  const { data, fallbackUsed, errorMessage } = await fetchMarketData(forceRefresh);
  state.marketData = data;
  renderBuyCards(data, catalog);
  updateBuyCartSummary();
  updateNotice(notice, fallbackUsed ? errorMessage : "", fallbackUsed ? "error" : "");
  setLoader(loader, false);
}

async function renderCartPage() {
  const loader = document.getElementById("cartLoader");
  const notice = document.getElementById("cartNotice");

  setLoader(loader, true);

  const { data, fallbackUsed, errorMessage } = await fetchMarketData();
  state.marketData = data;
  mergeCartWithMarketData(data);
  renderCartItems();
  updateCartSummary();
  updateNotice(notice, fallbackUsed ? errorMessage : "", fallbackUsed ? "error" : "");

  setLoader(loader, false);
}

async function loadPriceChart(forceRefresh = false, range = "month", scope = "dashboard") {
  const chartCanvas = document.getElementById(scope === "public" ? "publicPriceChart" : "priceChart");
  const chartTitle = document.getElementById(scope === "public" ? "publicChartTitle" : "chartTitle");
  const chartMeta = document.getElementById(scope === "public" ? "publicChartMeta" : "chartMeta");

  if (!chartCanvas || typeof Chart === "undefined") {
    return;
  }

  const chartConfig = CHART_RANGES[range] || CHART_RANGES.month;
  const { points, fallbackUsed } = await fetchBitcoinHistory(range, forceRefresh);
  const borderColor = fallbackUsed ? "#ffb84d" : "#ff7a00";

  if (chartTitle) {
    chartTitle.textContent = chartConfig.title;
  }

  if (chartMeta) {
    chartMeta.textContent = fallbackUsed
      ? `Showing cached ${range} data because the live chart feed is temporarily unavailable.`
      : `Showing Bitcoin movement for the selected ${range} range.`;
  }

  if (state.chartInstances[scope]) {
    state.chartInstances[scope].destroy();
  }

  state.chartInstances[scope] = new Chart(chartCanvas, {
    type: "line",
    data: {
      labels: points.map((point) => point.label),
      datasets: [
        {
          label: "BTC Price",
          data: points.map((point) => point.price),
          borderColor,
          backgroundColor: "rgba(255, 122, 0, 0.18)",
          borderWidth: 3,
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          ticks: { color: "#a8acb6" },
          grid: { color: "rgba(255,255,255,0.05)" }
        },
        y: {
          ticks: {
            color: "#a8acb6",
            callback: (value) => formatCurrency(value)
          },
          grid: { color: "rgba(255,255,255,0.05)" }
        }
      }
    }
  });
}

function bindChartRangeButtons(scope) {
  document.querySelectorAll(`[data-chart-scope="${scope}"]`).forEach((button) => {
    button.addEventListener("click", async () => {
      const nextRange = button.dataset.chartRange;

      if (!CHART_RANGES[nextRange] || state.currentChartRange[scope] === nextRange) {
        return;
      }

      state.currentChartRange[scope] = nextRange;
      updateChartRangeButtons(scope);
      await loadPriceChart(true, nextRange, scope);
    });
  });
}

function updateChartRangeButtons(scope) {
  document.querySelectorAll(`[data-chart-scope="${scope}"]`).forEach((button) => {
    button.classList.toggle("is-active", button.dataset.chartRange === state.currentChartRange[scope]);
  });
}

function renderDashboardCards(coins, container, options = {}) {
  if (!container) {
    return;
  }

  const actionHref = options.actionHref || "buy.html";
  const actionLabel = options.actionLabel || "Trade";

  container.innerHTML = coins.map((coin) => {
    const isUp = (coin.price_change_percentage_24h || 0) >= 0;

    return `
      <article class="market-card">
        <div class="coin-header">
          <img class="coin-icon" src="${coin.image}" alt="${coin.name}">
          <div class="coin-meta">
            <h3>${coin.name}</h3>
            <span>${coin.symbol}</span>
          </div>
        </div>
        <p class="coin-price">${formatCurrency(coin.current_price)}</p>
        <div class="coin-row">
          <span class="trend ${isUp ? "up" : "down"}">${isUp ? "&#9650;" : "&#9660;"} ${formatPercent(coin.price_change_percentage_24h)}</span>
          <a class="button button-ghost" href="${actionHref}">${actionLabel}</a>
        </div>
      </article>
    `;
  }).join("");
}

function renderTrendInsights(coins) {
  const summary = document.getElementById("trendSummary");

  if (!summary) {
    return;
  }

  summary.innerHTML = coins.map((coin) => {
    const isUp = (coin.price_change_percentage_24h || 0) >= 0;
    const tone = isUp ? "up" : "down";
    const description = isUp
      ? `${coin.name} is showing positive 24-hour momentum.`
      : `${coin.name} is cooling off over the last 24 hours.`;

    return `
      <article class="insight-item">
        <div class="cart-row">
          <h3>${coin.name}</h3>
          <span class="chip ${tone}">${formatPercent(coin.price_change_percentage_24h)}</span>
        </div>
        <p>${description}</p>
      </article>
    `;
  }).join("");
}

function renderBuyCards(coins, container) {
  if (!container) {
    return;
  }

  container.innerHTML = coins.map((coin) => {
    const isUp = (coin.price_change_percentage_24h || 0) >= 0;

    return `
      <article class="catalog-card">
        <div class="coin-header">
          <img class="coin-icon" src="${coin.image}" alt="${coin.name}">
          <div class="coin-meta">
            <h3>${coin.name}</h3>
            <span>${coin.symbol}</span>
          </div>
        </div>
        <p class="coin-price">${formatCurrency(coin.current_price)}</p>
        <div class="coin-row">
          <span class="trend ${isUp ? "up" : "down"}">${isUp ? "&#9650;" : "&#9660;"} ${formatPercent(coin.price_change_percentage_24h)}</span>
          <span class="chip ${isUp ? "up" : "down"}">${isUp ? "Bullish" : "Bearish"}</span>
        </div>
        <button class="button button-primary" type="button" data-coin-id="${coin.id}">Add to Cart</button>
      </article>
    `;
  }).join("");

  container.querySelectorAll("[data-coin-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const coin = state.marketData.find((entry) => entry.id === button.dataset.coinId);

      if (!coin) {
        return;
      }

      addToCart(coin);
      updateBuyCartSummary();
      updateCartBadges();
      showToast(`${coin.name} added to cart.`, "success");
    });
  });
}

function renderCartItems() {
  const container = document.getElementById("cartItems");
  const cart = getUserCart();

  if (!container) {
    return;
  }

  if (!cart.length) {
    container.innerHTML = `
      <div class="cart-empty">
        <h3>Your cart is empty.</h3>
        <p>Pick a few assets from the buy page and they will appear here instantly.</p>
        <a class="button button-primary" href="buy.html">Explore Coins</a>
      </div>
    `;
    return;
  }

  container.innerHTML = cart.map((item) => {
    const isUp = (item.change24h || 0) >= 0;

    return `
      <article class="cart-item">
        <div class="cart-details">
          <div class="cart-coin">
            <img class="coin-icon" src="${item.image}" alt="${item.name}">
            <div>
              <h3>${item.name}</h3>
              <span>${item.symbol}</span>
            </div>
          </div>
          <div class="cart-row">
            <span>${formatCurrency(item.price)}</span>
            <span class="trend ${isUp ? "up" : "down"}">${formatPercent(item.change24h)}</span>
          </div>
          <div class="cart-row">
            <span>Subtotal</span>
            <strong>${formatCurrency(item.price * item.quantity)}</strong>
          </div>
        </div>
        <div class="cart-actions">
          <div class="quantity-control">
            <button class="quantity-button" type="button" data-qty-action="decrease" data-id="${item.id}">-</button>
            <input class="quantity-input" type="number" min="1" value="${item.quantity}" data-qty-input="${item.id}">
            <button class="quantity-button" type="button" data-qty-action="increase" data-id="${item.id}">+</button>
          </div>
          <button class="remove-link" type="button" data-remove-id="${item.id}">Remove</button>
        </div>
      </article>
    `;
  }).join("");

  bindCartInteractions(container);
}

function bindCartInteractions(container) {
  container.querySelectorAll("[data-qty-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      const action = button.dataset.qtyAction;
      const cart = getUserCart();
      const item = cart.find((entry) => entry.id === id);

      if (!item) {
        return;
      }

      const nextQuantity = action === "increase" ? item.quantity + 1 : Math.max(1, item.quantity - 1);
      updateCartQuantity(id, nextQuantity);
      renderCartItems();
      updateCartSummary();
      updateCartBadges();
    });
  });

  container.querySelectorAll("[data-qty-input]").forEach((input) => {
    input.addEventListener("change", () => {
      const id = input.dataset.qtyInput;
      const nextQuantity = Math.max(1, Number.parseInt(input.value, 10) || 1);
      updateCartQuantity(id, nextQuantity);
      renderCartItems();
      updateCartSummary();
      updateCartBadges();
    });
  });

  container.querySelectorAll("[data-remove-id]").forEach((button) => {
    button.addEventListener("click", () => {
      removeFromCart(button.dataset.removeId);
      renderCartItems();
      updateCartSummary();
      updateCartBadges();
      showToast("Item removed from cart.", "success");
    });
  });
}

async function fetchMarketData(forceRefresh = false) {
  const cached = getMarketCache();

  if (!forceRefresh && cached?.data?.length && Date.now() - cached.timestamp < 120000) {
    return { data: cached.data, fallbackUsed: false, errorMessage: "" };
  }

  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${TRACKED_COINS.join(",")}&order=market_cap_desc&price_change_percentage=24h&sparkline=false`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Price feed request failed.");
    }

    const data = await response.json();
    const nextCache = getMarketCache() || {};
    setMarketCache({
      ...nextCache,
      data,
      timestamp: Date.now(),
      history: nextCache.history || {}
    });

    return { data, fallbackUsed: false, errorMessage: "" };
  } catch (error) {
    const fallback = cached?.data?.length ? cached.data : FALLBACK_MARKET_DATA;

    return {
      data: fallback,
      fallbackUsed: true,
      errorMessage: "Live CoinGecko data is temporarily unavailable. Showing the latest cached snapshot."
    };
  }
}

function normalizeChartPoints(priceSeries, range) {
  const chartConfig = CHART_RANGES[range] || CHART_RANGES.month;
  const sampledSeries = sampleDataPoints(priceSeries, chartConfig.maxPoints);

  return sampledSeries.map(([timestamp, price]) => ({
    label: formatChartLabel(timestamp, range),
    price: Number(price.toFixed(2))
  }));
}

function sampleDataPoints(series, maxPoints) {
  if (!Array.isArray(series) || !series.length || series.length <= maxPoints) {
    return series;
  }

  const sampled = [];
  const step = (series.length - 1) / (maxPoints - 1);

  for (let index = 0; index < maxPoints; index += 1) {
    const pointIndex = Math.round(index * step);
    sampled.push(series[pointIndex]);
  }

  return sampled;
}

function buildFallbackHistory(range) {
  const now = Date.now();
  const fallbackPrices = {
    day: [66120, 66290, 66440, 66320, 66610, 66880, 67010, 67240],
    month: [62150, 62980, 63720, 64110, 64880, 65360, 65990, 66430, 66910, 67240],
    year: [41200, 43850, 45640, 47220, 49880, 53670, 55820, 58740, 61420, 63310, 65480, 67240]
  };
  const steps = {
    day: 3 * 60 * 60 * 1000,
    month: 3 * 24 * 60 * 60 * 1000,
    year: 30 * 24 * 60 * 60 * 1000
  };

  return fallbackPrices[range].map((price, index) => {
    const timestamp = now - ((fallbackPrices[range].length - 1 - index) * steps[range]);

    return {
      label: formatChartLabel(timestamp, range),
      price
    };
  });
}

function formatChartLabel(timestamp, range) {
  const date = new Date(timestamp);

  if (range === "day") {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  if (range === "year") {
    return date.toLocaleDateString("en-US", {
      month: "short"
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

async function fetchBitcoinHistory(range = state.currentChartRange.dashboard, forceRefresh = false) {
  const cache = getMarketCache();
  const cachedHistory = cache?.history?.[range];

  if (!forceRefresh && cachedHistory?.points?.length) {
    return { points: cachedHistory.points, fallbackUsed: false };
  }

  try {
    const chartConfig = CHART_RANGES[range] || CHART_RANGES.month;
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${chartConfig.days}&interval=${chartConfig.interval}`);

    if (!response.ok) {
      throw new Error("Chart request failed.");
    }

    const result = await response.json();
    const points = normalizeChartPoints(result.prices, range);
    const nextCache = getMarketCache() || {};
    setMarketCache({
      ...nextCache,
      timestamp: nextCache.timestamp || Date.now(),
      data: nextCache.data || state.marketData,
      history: {
        ...(nextCache.history || {}),
        [range]: {
          points,
          timestamp: Date.now()
        }
      }
    });

    return { points, fallbackUsed: false };
  } catch (error) {
    return { points: buildFallbackHistory(range), fallbackUsed: true };
  }
}

function addToCart(coin) {
  const cart = getUserCart();
  const existing = cart.find((item) => item.id === coin.id);

  if (existing) {
    existing.quantity += 1;
    existing.price = coin.current_price;
    existing.change24h = coin.price_change_percentage_24h || 0;
    existing.image = coin.image;
  } else {
    cart.push({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h || 0,
      image: coin.image,
      quantity: 1
    });
  }

  saveUserCart(cart);
}

function removeFromCart(id) {
  const cart = getUserCart().filter((item) => item.id !== id);
  saveUserCart(cart);
}

function updateCartQuantity(id, quantity) {
  const cart = getUserCart();
  const item = cart.find((entry) => entry.id === id);

  if (!item) {
    return;
  }

  item.quantity = quantity;
  saveUserCart(cart);
}

function mergeCartWithMarketData(marketData) {
  const cart = getUserCart();
  const merged = cart.map((item) => {
    const liveData = marketData.find((coin) => coin.id === item.id);

    if (!liveData) {
      return item;
    }

    return {
      ...item,
      price: liveData.current_price,
      change24h: liveData.price_change_percentage_24h || 0,
      image: liveData.image,
      symbol: liveData.symbol
    };
  });

  saveUserCart(merged);
}

function updateDashboardCartValue() {
  const target = document.getElementById("dashboardCartValue");

  if (!target) {
    return;
  }

  target.textContent = formatCurrency(getCartTotal(getUserCart()));
}

function updateBuyCartSummary() {
  const cart = getUserCart();
  const itemsTarget = document.getElementById("buyCartItems");
  const valueTarget = document.getElementById("buyCartValue");

  if (itemsTarget) {
    itemsTarget.textContent = String(cart.length);
  }

  if (valueTarget) {
    valueTarget.textContent = formatCurrency(getCartTotal(cart));
  }
}

function updateCartSummary() {
  const cart = getUserCart();
  const totalAssets = cart.length;
  const totalUnits = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = getCartTotal(cart);

  setText("cartSummaryItems", totalAssets);
  setText("cartSummaryValue", formatCurrency(total));
  setText("checkoutAssets", totalAssets);
  setText("checkoutUnits", totalUnits);
  setText("checkoutTotal", formatCurrency(total));
}

function updateCartBadges() {
  const cart = getUserCart();
  const units = cart.reduce((sum, item) => sum + item.quantity, 0);

  document.querySelectorAll("#navCartCount").forEach((badge) => {
    badge.textContent = String(units);
  });
}

function bindLogout() {
  document.querySelectorAll("[data-action='logout']").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEYS.session);
      window.location.href = "home.html";
    });
  });
}

function getUsers() {
  return readJSON(STORAGE_KEYS.users, []);
}

function setUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function saveSession(session) {
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
}

function getSession() {
  return readJSON(STORAGE_KEYS.session, null);
}

function requireAuth() {
  if (!getSession()) {
    window.location.href = "login.html";
  }
}

function redirectAuthenticatedUser() {
  if (getSession()) {
    window.location.href = "dashboard.html";
  }
}

function getUserCart() {
  const session = getSession();

  if (!session?.email) {
    return [];
  }

  const carts = readJSON(STORAGE_KEYS.carts, {});
  return carts[session.email] || [];
}

function saveUserCart(cart) {
  const session = getSession();

  if (!session?.email) {
    return;
  }

  const carts = readJSON(STORAGE_KEYS.carts, {});
  carts[session.email] = cart;
  localStorage.setItem(STORAGE_KEYS.carts, JSON.stringify(carts));
}

function getCartTotal(cart) {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getMarketCache() {
  return readJSON(STORAGE_KEYS.marketCache, null);
}

function setMarketCache(payload) {
  localStorage.setItem(STORAGE_KEYS.marketCache, JSON.stringify(payload));
}

function renderErrors(form, errors) {
  Object.entries(errors).forEach(([fieldName, message]) => {
    const input = form.querySelector(`[name="${fieldName}"]`);
    const errorNode = form.querySelector(`[data-error-for="${fieldName}"]`);
    const field = input?.closest(".field");

    if (field) {
      field.classList.add("is-invalid");
    }

    if (errorNode) {
      errorNode.textContent = message;
    }
  });
}

function clearErrors(form) {
  form.querySelectorAll(".field").forEach((field) => field.classList.remove("is-invalid"));
  form.querySelectorAll(".field-error").forEach((node) => {
    node.textContent = "";
  });
}

function setFormMessage(id, text, type) {
  const message = document.getElementById(id);

  if (!message) {
    return;
  }

  message.textContent = text;
  message.className = `form-message is-visible ${type === "success" ? "is-success" : "is-error"}`;
}

function updateNotice(element, message, type) {
  if (!element) {
    return;
  }

  if (!message) {
    element.hidden = true;
    element.className = "inline-notice";
    element.textContent = "";
    return;
  }

  element.hidden = false;
  element.textContent = message;
  element.className = `inline-notice is-visible ${type === "success" ? "is-success" : "is-error"}`;
}

function setLoader(loader, visible) {
  if (!loader) {
    return;
  }

  loader.classList.toggle("is-visible", visible);
}

function ensureToastContainer() {
  if (document.querySelector(".toast-container")) {
    return;
  }

  const container = document.createElement("div");
  container.className = "toast-container";
  document.body.appendChild(container);
}

function showToast(message, type = "success") {
  const container = document.querySelector(".toast-container");

  if (!container) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <strong>${type === "success" ? "Success" : "Notice"}</strong>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 3200);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1 ? 2 : 4
  }).format(value);
}

function formatPercent(value = 0) {
  return `${value >= 0 ? "+" : ""}${Number(value).toFixed(2)}%`;
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = String(value);
  }
}

