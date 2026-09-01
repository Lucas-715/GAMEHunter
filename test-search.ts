import { searchEngine } from './lib/search-engine/index';

async function test() {
  const result = await searchEngine.searchGames('Dragon Ball');
  console.log("Returned games:", result.games.length);
  if (result.games.length > 0) {
    console.log(result.games.map(g => g.name));
  }
}
test();
