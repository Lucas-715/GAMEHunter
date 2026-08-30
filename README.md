# GameHunter 🎮

O **GameHunter** é a plataforma definitiva para monitoramento de preços, comparação de lojas e alertas de promoções para jogos digitais. Construído com tecnologias modernas, o projeto oferece aos usuários uma visão consolidada de ofertas (Steam, GOG, Nuuvem, Instant Gaming) garantindo que você nunca pague o preço cheio se não precisar.

## ✨ Funcionalidades

- **Dashboard Integrada:** Exibição dinâmica de jogos populares, separados por ofertas "Hero" e oportunidades.
- **Mecanismo de Busca Robusto:** Múltiplas integrações com lojas oficiais e marketplaces para enriquecer o catálogo em tempo real.
- **Histórico de Preços:** Gráfico visual detalhado mapeando os preços mais baixos (all-time low) e o histórico dos últimos 6 meses.
- **Autenticação (NextAuth + Prisma):** Sistema de login e cadastro totalmente funcional, permitindo gerenciamento de conta, acesso a recursos premium (Gamification Widget) e salvamento de configurações.
- **Jogos Grátis:** Listagem e links diretos para resgatar títulos disponibilizados gratuitamente nas plataformas.
- **Design Moderno:** Interface estética focada em tipografias sólidas (Geist/Sora), temas dinâmicos com Glassmorphism, microinterações e paleta premium voltada ao público gamer.

## 🛠 Tecnologias

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Estilização:** Tailwind CSS + UI Customizada
- **Banco de Dados:** SQLite (Desenvolvimento) + [Prisma ORM](https://www.prisma.io/)
- **Autenticação:** NextAuth.js com JWT e Credentials Provider (Bcrypt)
- **Integrações/APIs:** RAWG API (Metadados e Capas), Adaptadores Customizados (Steam, GOG, Nuuvem, IG)

## 🚀 Como Executar

### Pré-requisitos
- Node.js (v18+)
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/gamehunter.git
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente `.env`:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="sua-chave-secreta"
NEXTAUTH_URL="http://localhost:3000"
RAWG_API_KEY="sua-api-key-aqui"
```

4. Prepare o banco de dados:
```bash
npx prisma generate
npx prisma db push
```

5. Inicie o servidor:
```bash
npm run dev
```

6. Acesse no navegador: [http://localhost:3000](http://localhost:3000)

## 🎨 Identidade Visual
A interface utiliza tipografia `Sora` para títulos de impacto e `Geist` para parágrafos legíveis. O design foi cuidadosamente arquitetado para impressionar no primeiro olhar, usando tons vibrantes e painéis translúcidos, honrando o mascote "GameHunter" de cabelos espetados.

---
Feito com ♥ para a comunidade gamer!
