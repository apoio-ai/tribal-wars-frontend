# 🎮 Tribal Wars - Frontend

Frontend React para o jogo Tribal Wars.

## 🚀 Deploy no Netlify (GRÁTIS)

### Passo 1: Preparar os arquivos

1. Cria um ficheiro `.env` na pasta `frontend/`:
   ```
   REACT_APP_API_URL=https://seu-backend.railway.app
   ```
   (Usa a URL do teu backend do Railway)

2. Instala as dependências (se estiveres a testar localmente):
   ```bash
   npm install
   ```

3. Faz o build para produção:
   ```bash
   npm run build
   ```
   
   Isto vai criar uma pasta `build/` com os ficheiros prontos para deploy.

### Passo 2: Deploy no Netlify

#### Opção A: Drag & Drop (Mais Fácil)

1. Vai para [Netlify Drop](https://app.netlify.com/drop)
2. Arrasta a pasta `build/` para a área indicada
3. Aguarda o upload terminar
4. Pronto! Tens o teu site online! 🎉

#### Opção B: Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=build
```

### Passo 3: Configurar variáveis de ambiente no Netlify

1. Vai para o dashboard do teu site no Netlify
2. Clica em "Site settings" → "Build & deploy" → "Environment"
3. Adiciona:
   ```
   REACT_APP_API_URL = https://seu-backend.railway.app
   ```
4. Faz "Trigger deploy" para reconstruir o site

### Passo 4: Jogar!

Abre a URL do teu site Netlify (ex: `https://seu-site.netlify.app`)

🎉 **O jogo está online e funcional!**

## 🎮 Como Jogar

1. **Cria uma conta** com username, email e password
2. **Constrói edifícios** para produzir recursos
3. **Treina tropas** no quartel
4. **Ataca aldeias** NPC ou outros jogadores
5. **Sobe no ranking** e torna-te o melhor!

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Criar .env
echo "REACT_APP_API_URL=http://localhost:3000" > .env

# Rodar em desenvolvimento
npm start
```

O site vai abrir em `http://localhost:3000`

## 📦 Estrutura

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   ├── services/
│   │   └── api.js      # Chamadas à API
│   ├── styles/
│   │   └── App.css     # Estilos
│   ├── App.js          # Componente principal
│   └── index.js        # Entry point
├── package.json
└── .env.example
```

## 🎨 Features

- ✅ Login/Register
- ✅ Construir edifícios
- ✅ Treinar tropas
- ✅ Sistema de combate
- ✅ Rankings globais
- ✅ Mapa interativo
- ✅ Bônus diário
- ✅ Sistema de níveis e EXP
- ✅ Histórico de batalhas
- ✅ Design responsivo

## 🔧 Tecnologias

- **React 18** - Framework UI
- **Axios** - HTTP client
- **CSS3** - Estilos medievais

---

**Diverte-te a conquistar o mundo! ⚔️🏰**
