const cheerio = require('cheerio');

async function testNuuvem(slug) {
  const url = `https://www.nuuvem.com/br-pt/item/${slug}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  });
  const html = await res.text();
  console.log("Nuuvem Length:", html.length);
  if (html.includes('cloudflare')) {
     console.log("CLOUDFLARE BLOCKED NUUVEM");
  }
}

async function testIG(query) {
  const url = `https://www.instant-gaming.com/en/search/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  });
  const html = await res.text();
  console.log("IG Length:", html.length);
  if (html.includes('cloudflare') || html.includes('captcha')) {
     console.log("CLOUDFLARE BLOCKED IG");
  }
}

testNuuvem('naruto-to-boruto-shinobi-striker');
testIG('naruto to boruto shinobi striker');
