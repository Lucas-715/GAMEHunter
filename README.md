# 🦖🎮 GameHunter — Plataforma de Venda de Keys, Comparação de Preços & Alertas

Repositório Oficial: [https://github.com/Lucas-715/GAMEHunter](https://github.com/Lucas-715/GAMEHunter)

O **GameHunter** é uma plataforma completa para comercialização de chaves digitais (Keys), comparação de preços em tempo real entre lojas oficiais e monitoramento inteligente de descontos para jogos de PC.

A identidade visual do projeto traz o emblema **Brutal Rex**: um **dinossauro predador verde esmeralda em estilo e-sports** (com presas afiadas, cicatriz de batalha, olho reptiliano brilhante e marcas de garras no escudo), acompanhado de **efeitos interativos de fundo com temática do sistema** (hologramas flutuantes de descontos `-50%`/`-75%`/`-90%`, ícones de Keys digitais, controles, etiquetas de preço e paralaxe 3D que reagem suavemente ao movimento do mouse).

---

## ⚠️ Nota Técnica Importante: Funcionamento do Sistema vs. Instabilidade das APIs Externas

> **O sistema GameHunter é 100% funcional de ponta a ponta.** Todas as rotas de backend, banco de dados, autenticação, carrinho de compras, checkout, geração de chaves, filtros, wishlist e alertas estão integralmente implementados e operacionais.

### Por que algumas cotações ou links de APIs externas de jogos apresentam limitações?
O projeto implementa o consumo real de múltiplas APIs e fontes públicas do mercado de jogos (`lib/prices/adapters/` e `lib/search-engine/`). No entanto, **as APIs públicas fornecidas pelas plataformas de jogos possuem restrições e instabilidades externas que fogem ao controle da nossa aplicação**:

1. **Steam Storefront API (`store.steampowered.com/api/storesearch` e `appdetails`):**
   - Não é uma API comercial aberta para agregadores; a Valve aplica *rate-limiting* severo por IP e bloqueia frequentemente requisições vindas de servidores cloud/serverless.
2. **Nuuvem (`nuuvem.com/br-pt/catalog/search`):**
   - Não disponibiliza API pública aberta. O coletor (`lib/scrapers/nuuvem.ts`) utiliza *web scraping* com `cheerio`, porém o firewall da **Cloudflare** na Nuuvem bloqueia requisições automatizadas com erro `HTTP 403 Forbidden`.
3. **CheapShark API (`cheapshark.com/api/1.0/games`):**
   - Utilizada nos adaptadores da *Green Man Gaming* e *GamersGate*, fornece preços originalmente em **USD (Dólar)** sem suporte nativo à precificação regional brasileira (BRL), exigindo conversão cambial via `ExchangeRate-API` (`lib/currency.ts`), além de redirecionadores que por vezes expiram nas lojas de destino.
4. **GOG Catalog API (`catalog.gog.com/v1/catalog`) & RAWG API (`api.rawg.io`):**
   - Sofrem oscilações de latência e exigem chaves de API com limite restrito de requisições mensais.

### 🛡️ Como resolvemos isso para garantir 100% de funcionalidade no projeto:
Para que a experiência do usuário e a avaliação do sistema **nunca sejam prejudicadas por quedas, timeouts ou bloqueios 403 das APIs externas**, implementamos uma **Arquitetura de Contingência Multi-Camadas**:
- Todas as chamadas às APIs externas são feitas de verdade com `AbortController` (timeout máximo de `3.5s` por adaptador).
- Quando uma API externa responde normalmente, os preços e metadados ao vivo são exibidos e salvos no histórico do banco (`Prisma`).
- Caso a API externa falhe, demore ou bloqueie a conexão, o `PriceAggregator` e o `SearchEngine` acionam automaticamente o **Fallback Resiliente** (usando os dados persistidos no banco SQLite/Prisma e no catálogo local estruturado), gerando URLs diretas e funcionais para a busca oficial em cada loja (`Steam`, `Nuuvem`, `GOG`, `Green Man Gaming` e `GamersGate`).

---

## ✨ Funcionalidades Completas do Sistema

### 1. 🛒 Sistema de Venda de Jogos (Carrinho, Checkout & Entrega de Keys)
- **Carrinho de Compras Persistente:** Adicione qualquer jogo do catálogo ou da busca ao carrinho com 1 clique.
- **Cupons de Desconto Funcionais:** Aplique cupons promocionais diretamente no carrinho:
  - `HUNTER10` (10% de desconto)
  - `PRIMEIRACOMPRA` (15% de desconto)
  - `HUNTER20` (20% de desconto)
- **Checkout Transparente:**
  - **PIX Instantâneo:** Concede +5% de desconto extra, gera QR Code e código *PIX Copia e Cola*.
  - **Cartão de Crédito:** Simulação completa com validação de campos e parcelamento em até 3x sem juros.
- **Biblioteca / Minhas Keys (`Orders`):** Após confirmar a compra, o sistema gera automaticamente a **Chave de Ativação Digital (`XXXX-YYYY-ZZZZ-WWWW`)**, permitindo revelar a key, copiá-la para a área de transferência e abrir a página de ativação da Steam.

### 2. 🔐 Sistema de Login Flexível (Com ou Sem Login Obrigatório)
- **Não é necessário estar logado para usar o sistema:** Visitantes podem pesquisar jogos, comparar preços, adicionar itens ao carrinho, finalizar compras (informando apenas o e-mail de recebimento), criar alertas e favoritar jogos (persistidos via `localStorage` + API).
- **Autenticação Completa (`NextAuth` + `bcrypt` + `Prisma`):**
  - Cadastro de novos usuários (`/api/auth/register`) e login seguro (`/api/auth/[...nextauth]`).
  - **Botão "Entrar com Conta Demo (1 Clique)"** no modal de perfil (`demo@gamehunter.com` / `123456`) para testes imediatos.
  - Painel do usuário com configurações de **Região/Moeda (BRL, USD, EUR)**, **Preferências de Notificação** e **Conexão de Lojas**.

### 3. 📊 Comparador de Preços, Score Hunter & Histórico
- **Score Hunter (0 a 100):** Algoritmo que avalia o quão vantajosa é a oferta atual em relação ao menor preço histórico (*Historical Low*) e ao preço cheio de tabela.
- **Comparativo entre Lojas Oficiais:** Lista lado a lado as cotações da Steam, Nuuvem, GOG, Green Man Gaming e GamersGate, diferenciando lojas diretas e revendedores de chaves verificadas.
- **Gráfico de Evolução de Preços:** Visualização do comportamento de preço nos últimos meses.
- **Votação da Comunidade e Favoritos:** Botões funcionais de *Like*, *Dislike*, *Favoritar* e *Salvar na Wishlist*.

### 4. 🔔 Gerenciador de Alertas & Importador da Steam
- **Criação de Alertas Personalizados (`NewAlertModal`):** Defina o valor exato em R$ que deseja pagar ou use os atalhos rápidos (`-20%`, `-30%`, `-50%` ou `Menor da História`) e escolha o canal (E-mail ou Push no navegador).
- **Gestão Completa (`WishlistAlertsView`):** Filtre alertas por *Todos*, *Ativos* ou *Metas Atingidas*, pesquise por nome, edite o preço alvo inline, pause/retome o monitoramento ou exclua alertas.
- **Importador de Wishlist da Steam (`SteamImportModal`):** Insira seu SteamID64 ou link do perfil para importar jogos e aplicar regras de alerta em lote.

---

## 🛠️ Stack Tecnológica e Estrutura de APIs Internas

- **Frontend:** Next.js 16 (App Router & Turbopack), React 19, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend (Next.js Route Handlers):**
  - `GET /api/games/dashboard` — Carrega destaques, oportunidades e cache de cotações.
  - `GET /api/games/search?q=...` — Motor de busca híbrido (Banco Local + Steam API + CheapShark API).
  - `GET /api/games/[id]` — Detalhes do jogo, agregação ao vivo de lojas e enriquecimento RAWG.
  - `GET | POST | PATCH | DELETE /api/alerts` — CRUD completo de alertas de preço.
  - `GET | POST | DELETE /api/wishlist` — Gerenciamento da lista de desejos do usuário.
  - `POST /api/auth/register` & `/api/auth/[...nextauth]` — Registro e autenticação JWT.
  - `GET /api/cron/update-prices` — Rotina automatizada para atualização de histórico de preços e disparo de e-mails (`Resend`).
- **Banco de Dados:** Prisma ORM + SQLite (`prisma/dev.db` já pré-populado e pronto para uso local).

---

## 🚀 Como Executar o Projeto Localmente

### 1. Clone o repositório
```bash
git clone https://github.com/Lucas-715/GAMEHunter.git
cd GAMEHunter
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Variáveis de Ambiente (`.env`)
Certifique-se de que o arquivo `.env` na raiz do projeto contém:
```env
DATABASE_URL="file:./dev.db"
CRON_SECRET="super_secret_cron_token_123"
NEXTAUTH_SECRET="super_secret_for_development"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Gere o cliente Prisma (e popule o banco se desejar)
O banco local `prisma/dev.db` já acompanha o projeto com dezenas de jogos e históricos de preços. Para garantir que o cliente Prisma está sincronizado:
```bash
npx prisma generate
```
*(Opcional)* Caso queira recriar os dados iniciais do zero:
```bash
npx prisma db seed
```

### 5. Inicie o servidor de desenvolvimento
```bash
npm run dev
```
Acesse no navegador: **[http://localhost:3000](http://localhost:3000)**

---

## 🧪 Guia Rápido para Testar Todas as Funcionalidades

1. **Testar Compra de Jogo e Resgate de Key (Sem Login ou Logado):**
   - Na tela inicial, clique em **"Comprar Key"** no banner principal ou no ícone de carrinho na tabela de oportunidades.
   - No modal do Carrinho, teste aplicar o cupom **`HUNTER10`** ou **`PRIMEIRACOMPRA`**.
   - Clique em **"Avançar para Pagamento"**, escolha **PIX** (ou Cartão) e clique em **"Confirmar e Liberar Keys"**.
   - Na aba **"Minhas Keys"**, clique em **"Revelar Key"** e copie seu código de ativação!
2. **Testar Login / Conta Demo / Modo Visitante:**
   - Clique no botão **"Entrar"** no topo direito.
   - Clique em **"⚡ Entrar com Conta Demo (1 Clique)"** ou crie uma nova conta na aba de cadastro.
   - Clique novamente no seu perfil para configurar Moeda, Notificações e Lojas Conectadas.
3. **Testar Alertas de Preço e Wishlist:**
   - Acesse **"Alertas"** no menu superior e clique em **"Criar Novo Alerta"**.
   - Digite o nome de um jogo (ex: `Cyberpunk` ou `Witcher`), escolha um desconto rápido e salve.
   - Teste editar o valor alvo, pausar/retomar ou filtrar pelas abas *Todos*, *Ativos* e *Atingidos*.
