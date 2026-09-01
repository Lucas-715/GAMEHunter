let cachedRate: number | null = null;
let lastFetched: number = 0;
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours

export async function getUSDtoBRL(): Promise<number> {
  const now = Date.now();
  if (cachedRate !== null && (now - lastFetched) < CACHE_DURATION_MS) {
    return cachedRate;
  }

  try {
    const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL', { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const rate = parseFloat(data.USDBRL.ask);
      if (!isNaN(rate)) {
        cachedRate = rate;
        lastFetched = now;
        return rate;
      }
    }
  } catch (err) {
    console.error("Failed to fetch USD-BRL rate:", err);
  }

  // Fallback to a static approximate rate if API fails
  return 5.50;
}

/**
 * Converts USD to BRL and returns the value fixed to 2 decimal places.
 */
export async function convertUSDToBRL(usdPrice: number): Promise<number> {
  const rate = await getUSDtoBRL();
  const converted = usdPrice * rate;
  return parseFloat(converted.toFixed(2));
}
