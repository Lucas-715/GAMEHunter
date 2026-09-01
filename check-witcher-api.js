async function checkWitcherApi() {
  const res = await fetch("https://game-hunter-gpcb3wri7-lucas-715s-projects.vercel.app/api/games/search?q=witcher");
  const data = await res.json();
  const witcher = data.games.find(g => g.name.toLowerCase().includes("witcher 3"));
  if (witcher) {
    const res2 = await fetch(`https://game-hunter-gpcb3wri7-lucas-715s-projects.vercel.app/api/games/${witcher.id}`);
    const data2 = await res2.json();
    console.log(JSON.stringify(data2.currentPrices, null, 2));
  }
}
checkWitcherApi();
