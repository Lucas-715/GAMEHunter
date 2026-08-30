# AUDIT_REPORT

## 1. Estado atual
O repositório possui uma base sólida em Next.js 16 (App Router), React 19, Tailwind CSS e Prisma ORM. O sistema já implementa interfaces essenciais (Dashboard, Página de Jogo, Wishlist, Alertas) e realiza integração assíncrona com lojas através da lib `search-engine`, que coordena os adapters (Steam, GOG, Nuuvem e Instant Gaming). A autenticação inicial está funcional via NextAuth (Credentials). No entanto, a lógica de coleta de preços atual depende fortemente de execuções síncronas ao realizar pesquisas e interações em tempo real.

## 2. Arquitetura
A arquitetura atual concentra lógica na `search-engine` de maneira síncrona. O modelo desejado (desacoplar as coletas e alertas em rotinas de background e cron) ainda não está implementado na prática. O frontend consome APIs que ainda realizam requests sob demanda aos adapters ou à RAWG API.

## 3. Banco
Utiliza SQLite (`dev.db`), o que gera limitações em deployments serverless (como o Vercel), causando erros de lock ou filesystem read-only. O esquema Prisma inclui os models: `User`, `Game`, `Store`, `PriceHistory`, `Alert`, `Wishlist`, `SearchCache`.

## 4. APIs
Rotas ativas em `/api`:
- `auth/`: Registro e NextAuth
- `games/`: Dashboard, Search e detalhes de ID específico.
- `admin/sync-catalog`: Sync manual
As APIs da dashboard e busca utilizam o `searchEngine` de forma imperativa.

## 5. Autenticação
O `CredentialsProvider` do NextAuth está configurado e conectando-se ao model `User` via Prisma. Senhas utilizam bcrypt. Fluxos via `ProfileModal` funcionam. A base para proteção de rotas com base no ID de usuário já está presente e funcional na estrutura principal.

## 6. Scrapers
Scraping via axios + cheerio (Steam, GOG, Nuuvem, Instant Gaming). O processo acontece sob demanda durante a rota de search, o que pode causar demora e instabilidade no response final. A RAWG API é usada pontualmente para enriquecimento de imagens e tags.

## 7. Frontend
Construído com Tailwind. Os estados (Loading, Error, Empty) estão parcialmente cobertos. A estrutura SPA simulada na index (com estados `currentView`) gerencia as trocas visuais perfeitamente.

## 8. Performance
- O scraping e parsing síncrono impactam fortemente a latência da busca (Requests pesam de 2 a 3 segundos ou mais dependendo da rede).
- Não há N+1 visíveis massivos, porém múltiplos acessos de API da RAWG por loop sem paralelismo otimizado.
- Build Next.js otimizada com a maioria das páginas estáticas/client-side puras.

## 9. Segurança
- Segredos (JWT, credenciais, RAWG) dependem do `.env`.
- As rotas atuais dependem pouco da checagem rigorosa de JWT (exceção para profile/wishlist).

## 10. Testes
- Inexistentes. Não há Vitest, Jest, ou Playwright configurados.

## 11. Problemas encontrados
- A rota síncrona de busca (search-engine) possui hard-coupling com requests externos.
- Falta de resiliência: se o banco falhar, algumas lógicas quebravam (foi corrigido paliativamente para o DB read-only na Vercel).
- Preços ainda não fluem periodicamente para o `PriceHistory`.
- `Math.random` causando problemas de impureza no React render. (Corrigido no lint).

## 12. Código duplicado
- Algumas redundâncias nos loops e tratamentos de requests dos adapters que podem ser extraídos para abstrações mais limpas no novo `price-aggregator`.

## 13. Código morto
- Alertas e `PriceHistory` possuem o Model Prisma mas o job e os controllers de disparo não existem/não são utilizados.

## 14. Riscos
- SQLite na Vercel impede operações persistentes de usuários (novo cadastro).
- O uso intenso de cheerio/axios em endpoints públicos pode gerar rate limits nas lojas (Nuuvem, GOG).

## 15. Sugestões
- Migrar imediatamente para Postgres (Neon ou Vercel Postgres) para liberar os cadastros na Vercel.
- Adotar Vercel Cron Jobs desacoplados e construir os novos arquivos base de acordo com a Fase 1 solicitada no PRD (lib/prices, lib/alerts, lib/games).
