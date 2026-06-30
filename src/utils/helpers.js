export function cn(...values) {
  return values.filter(Boolean).join(" ");
}

export function createInitialUserState(user) {
  return {
    profile: {
      uid: user.uid,
      name: user.displayName || user.name || "CryptoCraze User",
      email: user.email
    },
    watchlist: [],
    cart: [],
    portfolio: [],
    transactions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function normalizeUserState(user, state = {}) {
  const initialState = createInitialUserState(user);

  return {
    ...initialState,
    ...state,
    profile: {
      ...initialState.profile,
      ...(state.profile || {})
    },
    watchlist: Array.isArray(state.watchlist) ? state.watchlist : [],
    cart: Array.isArray(state.cart) ? state.cart : [],
    portfolio: Array.isArray(state.portfolio) ? state.portfolio : [],
    transactions: Array.isArray(state.transactions) ? state.transactions : []
  };
}

export function mergePortfolioItem(existingItem, quantity, purchasePrice) {
  if (!existingItem) {
    return {
      quantity,
      averageBuyPrice: purchasePrice,
      investedAmount: quantity * purchasePrice
    };
  }

  const nextQuantity = existingItem.quantity + quantity;
  const nextInvestedAmount = existingItem.investedAmount + (quantity * purchasePrice);

  return {
    quantity: nextQuantity,
    averageBuyPrice: nextInvestedAmount / nextQuantity,
    investedAmount: nextInvestedAmount
  };
}

export function safeParseJSON(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}
