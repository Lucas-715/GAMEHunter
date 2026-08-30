async function test() {
  const headers = { 'User-Agent': 'GameHunter/1.0 (agent@gamehunter.com)' };

  const stores = await fetch('https://www.cheapshark.com/api/1.0/stores', { headers }).then(r => r.json());
  console.log("Stores:", stores.slice(0, 3));
  
  const search = await fetch('https://www.cheapshark.com/api/1.0/games?title=batman&limit=2', { headers }).then(r => r.json());
  console.log("Search:", search);
  
  if (search.length > 0) {
    const game = await fetch(`https://www.cheapshark.com/api/1.0/games?id=${search[0].gameID}`, { headers }).then(r => r.json());
    console.log("Game Detail:", JSON.stringify(game, null, 2));
  }
}

test();
