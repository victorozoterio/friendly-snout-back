<h1 align="center" style="font-weight: bold;">Focinho Amigo 🐾</h1>

<p align="center">
 <a href="#technologies">Tecnologias</a> • 
 <a href="#description">Descrição</a> • 
 <a href="#prerequisites">Pré-requisitos</a> • 
 <a href="#installation">Instalação</a>
</p>

<a  href="https://focinhoamigo.com.br" target="_blank">
    <img alt="Friendly Snout GIF" title="Friendly Snout GIF" src=".github/assets/project-preview.gif" width="100%" />    
</a>

<h2 id="technologies">💻 Tecnologias</h2>

![Static Badge](https://img.shields.io/badge/typescript%20-%203178C6?style=for-the-badge&logo=typescript&logoColor=3178C6&color=000000) ![Static Badge](https://img.shields.io/badge/node.js%20-%20339933?style=for-the-badge&logo=node.js&logoColor=339933&color=000000) ![Static Badge](https://img.shields.io/badge/nestjs%20-%20E0234E?style=for-the-badge&logo=nestjs&logoColor=E0234E&color=000000) ![Static Badge](https://img.shields.io/badge/typeorm%20-%20FE0803?style=for-the-badge&logo=typeorm&logoColor=FE0803&color=000000) ![Static Badge](https://img.shields.io/badge/postgresql%20-%204169E1?style=for-the-badge&logo=postgresql&logoColor=4169E1&color=000000) ![Static Badge](https://img.shields.io/badge/docker%20-%202496ED?style=for-the-badge&logo=docker&logoColor=2496ED&color=000000) ![Static Badge](https://img.shields.io/badge/jest%20-%20C21325?style=for-the-badge&logo=jest&logoColor=C21325&color=000000) ![Static Badge](https://img.shields.io/badge/zod%20-%203E67B1?style=for-the-badge&logo=zod&logoColor=3E67B1&color=000000) ![Static Badge](https://img.shields.io/badge/biome%20-%2060A5FA?style=for-the-badge&logo=biome&logoColor=60A5FA&color=000000) ![Static Badge](https://img.shields.io/badge/google%20calendar%20-%204285F4?style=for-the-badge&logo=googlecalendar&logoColor=4285F4&color=000000) ![Static Badge](https://img.shields.io/badge/cloudflare%20-%20F38020?style=for-the-badge&logo=cloudflare&logoColor=F38020&color=000000) ![Static Badge](https://img.shields.io/badge/hetzner%20-%20D50C2D?style=for-the-badge&logo=hetzner&logoColor=D50C2D&color=000000)

<h2 id="description">📚 Descrição</h2>

O **Focinho Amigo** é um sistema de gerenciamento para a ONG **Focinho Amigo**, que atua na cidade de **Indaiatuba - SP**.

O objetivo é auxiliar no controle das informações relacionadas aos animais sob cuidados da ONG, oferecendo funcionalidades como:

- **Controle de anexos**
  - Associação de documentos/arquivos a cada animal
  - Armazenamento via **Cloudflare R2**

- **Gerenciamento de medicamentos**
  - Registro de medicamentos e aplicações realizadas
  - Agendamento de futuras aplicações
  - Integração com **Google Calendar** para criar/remover eventos
  - O próprio Google Calendar pode notificar o responsável quando estiver próximo do horário de aplicação

- **Métricas de animais por estágio**
  - Total de animais em **quarentena** (em tratamento)
  - Total de animais **acolhidos** (prontos para adoção)
  - Total de animais **adotados**

<h2>✅ Testes</h2>

A aplicação possui testes **unitários** e **E2E** para garantir que os fluxos principais estão funcionando corretamente.

<img alt="Cobertura de testes" src="./.github/assets/test-coverage.png" width="100%" />

Para rodar os testes unitários: `pnpm test`
Para rodar os testes E2E: `pnpm run test:e2e`
Para ver a cobertura de testes: `pnpm run test:coverage`

<h2 id="prerequisites">🧩 Pré-requisitos</h2>

- Node
- Npm
- Pnpm
- Docker

Se você ainda não tiver o pnpm instalado, rode: `npm install -g pnpm`

<h2 id="installation">⚙️ Instalação</h2>

1. Clone esse repositório: `git clone https://github.com/victorozoterio/friendly-snout-back.git`
2. Crie um arquivo `.env` a partir do arquivo `.env.example`
3. Preencha todas as variáveis necessárias no arquivo `.env`
4. Instale as dependências: `pnpm install`
5. Suba o contêiner Docker: `docker compose up -d`
6. Rode a aplicação: `pnpm run start:dev`

<h2>🔮 Melhorias futuras</h2>

- [ ] Adicionar logs estruturados utilizando Pino
- [ ] Observabilidade utilizando OpenTelemetry + Jaeger
