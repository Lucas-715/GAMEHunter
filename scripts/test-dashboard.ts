import { GET } from '../app/api/games/dashboard/route';

async function run() {
  console.log("Fetching dashboard data...");
  const res = await GET();
  const data = await res.json();
  console.log("Featured:", data.featured?.length);
  console.log("Opportunities:", data.opportunities?.length);
  if (data.featured?.length === 0) {
    console.log(data);
  }
}

run();
