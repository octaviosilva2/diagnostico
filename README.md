# Diagnóstico de IA e Automação

## Deploy na Hostinger

### 1. Fazer upload dos arquivos
Enviar todos os arquivos EXCETO node_modules e .next para a Hostinger via Git ou FTP.

### 2. No servidor da Hostinger, rodar:
npm install
npm run build
node start.js

### 3. Variáveis de ambiente
Criar arquivo .env.local no servidor:
DATABASE_URL=file:diagnostico.db

### 4. Acesso
- Formulário: https://seudominio.com.br
- Admin: https://seudominio.com.br/admin
- Senha admin: admin2026

## Rodar localmente
npm install
npm run dev
Acesse: http://localhost:3000
