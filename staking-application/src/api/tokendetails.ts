// src/api/coins.ts
export async function tokendetails(coinId: string) {
  try {
    const res = await fetch(`http://localhost:8000/coins/${coinId}`);
    if (!res.ok) {
      throw new Error("Coin not found");
    }

    const data = await res.json();

    return {
      id: data.id,
      symbol: data.symbol,
      name: data.name,
      image: data.image,
      current_price: data.current_price,
      market_cap: data.market_cap,
      market_cap_rank: data.market_cap_rank,
      fully_diluted_valuation: data.fully_diluted_valuation,
      total_volume: data.total_volume,
      high_24h: data.high_24h,
      low_24h: data.low_24h,
      price_change_24h: data.price_change_24h,
      price_change_percentage_24h: data.price_change_percentage_24h,
      market_cap_change_24h: data.market_cap_change_24h,
      market_cap_change_percentage_24h: data.market_cap_change_percentage_24h,
      circulating_supply: data.circulating_supply,
      total_supply: data.total_supply,
      max_supply: data.max_supply,
      ath: data.ath,
      ath_change_percentage: data.ath_change_percentage,
      ath_date: data.ath_date,
      atl: data.atl,
      atl_change_percentage: data.atl_change_percentage,
      atl_date: data.atl_date,
      roi: data.roi,
      last_updated: data.last_updated,
      price_change_percentage_1h_in_currency:
        data.price_change_percentage_1h_in_currency,
      price_change_percentage_24h_in_currency:
        data.price_change_percentage_24h_in_currency,
      price_change_percentage_7d_in_currency:
        data.price_change_percentage_7d_in_currency,
    };
  } catch (err: any) {
    console.error("Error fetching token details:", err.message || err);
    return null;
  }
}
