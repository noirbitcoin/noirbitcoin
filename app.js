
"use strict";

const $ = (id) => document.getElementById(id);

const formatUSD = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);

async function loadMarkets() {
  const table = $("marketTable");
  const message = $("marketMessage");

  table.innerHTML = '<tr><td colspan="4">Loading market data…</td></tr>';
  message.textContent = "";

  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price" +
      "?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true"
    );

    if (!response.ok) {
      throw new Error("Market provider returned an error.");
    }

    const data = await response.json();
    const coins = [
      { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
      { id: "ethereum", name: "Ethereum", symbol: "ETH" }
    ];

    table.innerHTML = coins.map((coin) => {
      const price = data[coin.id]?.usd;
      const change = data[coin.id]?.usd_24h_change;

      if (typeof price !== "number") {
        return `<tr><td>${coin.name}</td><td>${coin.symbol}</td>
          <td>Unavailable</td><td>Unavailable</td></tr>`;
      }

      const validChange = typeof change === "number";
      const changeClass = validChange
        ? (change >= 0 ? "positive" : "negative")
        : "";

      return `
        <tr>
          <td>${coin.name}</td>
          <td>${coin.symbol}</td>
          <td>${formatUSD(price)}</td>
          <td class="${changeClass}">
            ${validChange ? change.toFixed(2) + "%" : "Unavailable"}
          </td>
        </tr>`;
    }).join("");

    $("btcPrice").textContent =
      typeof data.bitcoin?.usd === "number"
        ? formatUSD(data.bitcoin.usd)
        : "Unavailable";

    $("ethPrice").textContent =
      typeof data.ethereum?.usd === "number"
        ? formatUSD(data.ethereum.usd)
        : "Unavailable";

    const btcChange = data.bitcoin?.usd_24h_change;

    $("btcChange").textContent =
      typeof btcChange === "number"
        ? `${btcChange >= 0 ? "+" : ""}${btcChange.toFixed(2)}% in 24h`
        : "24-hour change unavailable";

    $("btcChange").className =
      typeof btcChange === "number"
        ? (btcChange >= 0 ? "positive" : "negative")
        : "muted";

    message.textContent =
      "Public market snapshot. Prices may be delayed; refresh for updates.";
  } catch (error) {
    table.innerHTML =
      '<tr><td colspan="4">Market prices are temporarily unavailable.</td></tr>';
    message.textContent =
      "Check your internet connection or try again later.";
    $("btcPrice").textContent = "Unavailable";
    $("ethPrice").textContent = "Unavailable";
    $("btcChange").textContent = "Market data unavailable";
  }
}

$("refreshMarkets").addEventListener("click", loadMarkets);

$("menuButton").addEventListener("click", () => {
  $("sidebar").classList.toggle("open");
});

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.toggle("active", item === button);
    });

    $("pageTitle").textContent = button.textContent.trim();

    if (window.innerWidth <= 650) {
      $("sidebar").classList.remove("open");
    }

    if (button.dataset.page !== "overview" &&
        button.dataset.page !== "markets") {
      $("integrationMessage").textContent =
        "This section requires secure account and backend integration before it can display real account data.";
    }
  });
});

$("connectInfo").addEventListener("click", () => {
  $("integrationMessage").textContent =
    "Public market data is connected when available. User authentication, persistent portfolio records, and real exchange trading still need backend integration.";
});

$("portfolioValue").textContent = "Not connected";

loadMarkets();
