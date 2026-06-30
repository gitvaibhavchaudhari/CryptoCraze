import { createContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { getUserState, saveUserState } from "../services/userDataService";
import { mergePortfolioItem } from "../utils/helpers";

export const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      if (!user) {
        setUserData(null);
        return;
      }

      setLoading(true);

      try {
        const storedData = await getUserState(user);
        setUserData(storedData);
      } catch (error) {
        toast.error(error.message || "Unable to load your account data.");
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [user]);

  async function persist(nextData) {
    setUserData(nextData);

    if (user) {
      await saveUserState(user, nextData);
    }
  }

  async function toggleWatchlist(coinId) {
    if (!userData) {
      toast.error("Account data is still loading. Try again in a moment.");
      return;
    }

    const watchlist = userData.watchlist || [];
    const exists = watchlist.includes(coinId);
    const nextData = {
      ...userData,
      watchlist: exists
        ? watchlist.filter((item) => item !== coinId)
        : [...watchlist, coinId]
    };

    await persist(nextData);
    toast.success(exists ? "Removed from watchlist." : "Added to watchlist.");
  }

  async function addToCart(coin, quantity = 1) {
    if (!userData) {
      toast.error("Account data is still loading. Try again in a moment.");
      return;
    }

    if (!coin?.id) {
      toast.error("Unable to add this asset to cart.");
      return;
    }

    const sanitizedQuantity = Math.max(1, Number(quantity) || 1);
    const cart = userData.cart || [];
    const existingItem = cart.find((item) => item.coinId === coin.id);
    const nextCart = existingItem
      ? cart.map((item) =>
          item.coinId === coin.id
            ? {
                ...item,
                quantity: Math.max(1, Number(item.quantity) || 1) + sanitizedQuantity,
                currentPrice: coin.current_price
              }
            : item
        )
      : [
          ...cart,
          {
            coinId: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            image: coin.image,
            quantity: sanitizedQuantity,
            currentPrice: coin.current_price
          }
        ];

    await persist({
      ...userData,
      cart: nextCart
    });

    toast.success(`${coin.name} added to cart.`);
  }

  async function updateCartQuantity(coinId, quantity) {
    if (!userData) {
      toast.error("Account data is still loading. Try again in a moment.");
      return;
    }

    const sanitizedQuantity = Math.max(1, Number(quantity) || 1);
    await persist({
      ...userData,
      cart: (userData.cart || []).map((item) =>
        item.coinId === coinId ? { ...item, quantity: sanitizedQuantity } : item
      )
    });
  }

  async function removeFromCart(coinId) {
    if (!userData) {
      toast.error("Account data is still loading. Try again in a moment.");
      return;
    }

    await persist({
      ...userData,
      cart: (userData.cart || []).filter((item) => item.coinId !== coinId)
    });

    toast.success("Removed from cart.");
  }

  async function checkout(marketMap = {}) {
    const cart = userData?.cart || [];

    if (!userData || !cart.length) {
      return;
    }

    const nextPortfolio = [...(userData.portfolio || [])];

    cart.forEach((item) => {
      const liveCoin = marketMap[item.coinId];
      const purchasePrice = liveCoin?.current_price || item.currentPrice;
      const existing = nextPortfolio.find((asset) => asset.coinId === item.coinId);
      const merged = mergePortfolioItem(existing, item.quantity, purchasePrice);

      if (existing) {
        Object.assign(existing, {
          ...existing,
          ...merged,
          currentPrice: purchasePrice,
          lastUpdated: new Date().toISOString()
        });
      } else {
        nextPortfolio.push({
          coinId: item.coinId,
          name: item.name,
          symbol: item.symbol,
          image: item.image,
          quantity: merged.quantity,
          averageBuyPrice: merged.averageBuyPrice,
          investedAmount: merged.investedAmount,
          currentPrice: purchasePrice,
          lastUpdated: new Date().toISOString()
        });
      }
    });

    await persist({
      ...userData,
      cart: [],
      portfolio: nextPortfolio
    });

    toast.success("Purchase completed successfully.");
  }

  async function recordPurchase({ coin, quantity, fiatAmount, paymentMethod, transaction }) {
    if (!userData || !coin) {
      return;
    }

    const purchasePrice = fiatAmount / quantity;
    const portfolio = userData.portfolio || [];
    const existingAsset = portfolio.find((asset) => asset.coinId === coin.id);
    const merged = mergePortfolioItem(existingAsset, quantity, purchasePrice);
    const purchasedAt = new Date().toISOString();
    const nextPortfolio = existingAsset
      ? portfolio.map((asset) =>
          asset.coinId === coin.id
            ? {
                ...asset,
                ...merged,
                currentPrice: coin.current_price || purchasePrice,
                lastUpdated: purchasedAt
              }
            : asset
        )
      : [
          ...portfolio,
          {
            coinId: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            image: coin.image,
            quantity: merged.quantity,
            averageBuyPrice: merged.averageBuyPrice,
            investedAmount: merged.investedAmount,
            currentPrice: coin.current_price || purchasePrice,
            lastUpdated: purchasedAt
          }
        ];

    await persist({
      ...userData,
      portfolio: nextPortfolio,
      transactions: [
        {
          id: transaction?._id || crypto.randomUUID(),
          coinId: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          image: coin.image,
          quantity,
          fiatAmount,
          paymentMethod,
          status: transaction?.status || "success",
          providerOrderId: transaction?.providerOrderId,
          providerPaymentId: transaction?.providerPaymentId,
          createdAt: transaction?.createdAt || purchasedAt
        },
        ...(userData.transactions || [])
      ]
    });

    toast.success(`${coin.name} purchase added to your portfolio.`);
  }

  const summary = useMemo(() => {
    if (!userData) {
      return {
        cartCount: 0,
        watchlistCount: 0,
        transactionCount: 0,
        totalInvestment: 0,
        currentValue: 0,
        profitLoss: 0
      };
    }

    const cartCount = (userData.cart || []).reduce((sum, item) => sum + item.quantity, 0);
    const totalInvestment = (userData.portfolio || []).reduce((sum, asset) => sum + asset.investedAmount, 0);
    const currentValue = (userData.portfolio || []).reduce(
      (sum, asset) => sum + ((asset.currentPrice || asset.averageBuyPrice) * asset.quantity),
      0
    );

    return {
      cartCount,
      watchlistCount: (userData.watchlist || []).length,
      transactionCount: (userData.transactions || []).length,
      totalInvestment,
      currentValue,
      profitLoss: currentValue - totalInvestment
    };
  }, [userData]);

  const value = useMemo(
    () => ({
      loading,
      userData,
      summary,
      toggleWatchlist,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      checkout,
      recordPurchase
    }),
    [loading, summary, userData]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
