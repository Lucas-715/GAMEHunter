import { searchEngine } from './lib/search-engine/index';

async function main() {
  try {
    const results = await searchEngine.searchGames('Dragon Ball');
    console.log("Success!", results.games.length);
  } catch (e) {
    console.error("API crashed!", e);
  }
}
main();
