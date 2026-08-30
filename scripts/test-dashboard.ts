import { GET } from '../app/api/games/dashboard/route';

async function run() {
  console.log("Fetching dashboard data...");
  const res = await GET();
  const data = await res.json();
  console.log("Featured length:", data.featured?.length);
  
  if (data.featured && data.featured.length > 0) {
    console.log("First Featured Game:");
    const g = data.featured[0];
    console.log({
      name: g.name,
      bannerImage: g.bannerImage,
      coverImageUrl: g.coverImageUrl,
      storesCount: g.stores?.length
    });
  }
}

run();
