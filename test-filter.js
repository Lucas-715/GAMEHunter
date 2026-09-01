const games = [
  {
    "id": "cm0h3q00f0003h125t6y2s87x",
    "steamAppId": "1090830",
    "name": "DRAGON BALL: Sparking! ZERO",
    "stores": []
  }
];
const query = "Dragon Ball";

const filteredGames = games.map(g => {
  const validStores = g.stores;
  return { ...g, stores: validStores, originalStoreCount: g.stores.length };
}).filter(g => {
  const matchesQuery = g.name.toLowerCase().includes(query.toLowerCase());
  if (!matchesQuery) return false;

  if (g.originalStoreCount === 0) return true;

  return g.stores.length > 0;
});

console.log("Filtered games:", JSON.stringify(filteredGames, null, 2));
