# Focinho Amigo 🐾

<p align="center">API de gerenciamento da ONG Focinho Amigo.</p>

<p align="center">
 <a href="#tecnologias">Tecnologias</a> •
 <a href="#descricao">Descrição</a> •
 <a href="#arquitetura">Arquitetura</a> •
 <a href="#diagramas">Diagramas</a> •
 <a href="#instalacao">Instalação</a> •
 <a href="#testes">Testes</a>
</p>

<a href="https://focinhoamigo.com.br" target="_blank">
  <img alt="Prévia do Focinho Amigo" src=".github/assets/project-preview.gif" width="100%" />
</a>

## Tecnologias

| Área | Tecnologias |
| --- | --- |
| API | Node.js, TypeScript, NestJS e Express |
| Dados | PostgreSQL, TypeORM e migrations |
| Segurança | JWT, Passport, Argon2 e chave de API |
| Arquivos | Multer, AWS SDK e Cloudflare R2 |
| Agenda | Google Calendar API, Expo Push Service e date-fns |
| Qualidade | Jest, Supertest, Biome, Husky e Commitlint |
| Documentação | Swagger e Scalar em `/docs` |

## Descrição

O **Focinho Amigo** é um sistema para a ONG **Focinho Amigo**, de **Indaiatuba - SP**. A API concentra os dados dos animais assistidos, seus documentos, medicamentos e agendamentos.

- Autenticação com access token e refresh token JWT.
- Gestão de animais, espécies, raças e métricas por estágio.
- Upload, listagem e remoção de anexos no Cloudflare R2.
- Gestão de marcas, estoque e status de medicamentos.
- Registro de aplicações realizadas e agendamento de próximas aplicações.
- Atualização de estoque ao criar ou cancelar aplicações.
- Integração opcional com Google Calendar.
- Lembretes push persistentes, enviados 15 minutos antes da aplicação.

## Arquitetura

```mermaid
flowchart LR
    APP[Aplicativo React Native] -->|HTTP + API Key + JWT| API[NestJS API]
    WEB[Aplicação web] -->|HTTP + API Key + JWT| API
    API --> AUTH[Auth + Bearer Guard]
    API --> DOMAIN[Módulos de domínio]
    DOMAIN --> ORM[TypeORM]
    ORM --> DB[(PostgreSQL)]
    DOMAIN --> R2[Cloudflare R2]
    DOMAIN -. opcional .-> GC[Google Calendar]
    DOMAIN --> EXPO[Expo Push Service]
    EXPO --> DEVICE[Dispositivos cadastrados]
```

A chave de API é verificada globalmente, com exceção de `GET /health`; a guarda JWT protege as rotas privadas. As entradas são validadas por pipes com `whitelist`, `transform` e rejeição de campos desconhecidos.

## Organização

```text
src/
├── config/                    # Ambiente, banco e Swagger
├── guards/                    # Guarda Bearer JWT
├── lib/                       # Clientes Google Calendar e Cloudflare R2
├── middlewares/               # Chave de API
├── migrations/                # Histórico do banco
└── modules/
    ├── auth/                  # Login e renovação de tokens
    ├── users/                 # Usuários
    ├── animals/               # Animais e métricas
    ├── species/               # Espécies e raças
    ├── attachments/           # Anexos no R2
    ├── medicine-brands/       # Marcas
    ├── medicines/             # Estoque e status
    ├── medicine-applications/ # Histórico e agenda
    ├── push-notifications/    # Dispositivos e jobs de push
    ├── google-calendar/       # Contratos da agenda
    └── health/                # Health check
```

## Diagramas

### DER — modelo relacional

O DER reúne as tabelas de domínio e o processamento persistente de notificações. Campos de auditoria foram resumidos para favorecer a leitura.

```mermaid
erDiagram
    USERS ||--o{ MEDICINE_APPLICATIONS : registra
    USERS ||--o{ PUSH_DEVICES : possui
    USERS ||--o{ PUSH_NOTIFICATION_JOBS : recebe
    SPECIES ||--o{ BREEDS : possui
    SPECIES ||--o{ ANIMALS : classifica
    BREEDS ||--o{ ANIMALS : define
    ANIMALS ||--o{ ATTACHMENTS : possui
    ANIMALS ||--o{ MEDICINE_APPLICATIONS : recebe
    MEDICINE_BRANDS ||--o{ MEDICINES : classifica
    MEDICINES ||--o{ MEDICINE_APPLICATIONS : utilizada_em
    MEDICINE_APPLICATIONS ||--o{ PUSH_NOTIFICATION_JOBS : gera

    USERS {
        uuid uuid PK
        varchar name
        varchar email
        varchar password
        varchar reset_code
        varchar reset_code_expires_at
        timestamp created_at
        timestamp updated_at
    }
    SPECIES {
        uuid uuid PK
        varchar name UK
    }
    BREEDS {
        uuid uuid PK
        varchar name
        uuid species_uuid FK
    }
    ANIMALS {
        uuid uuid PK
        varchar name
        varchar sex
        varchar size
        varchar color
        timestamp birth_date
        varchar status
        varchar photo_url
        uuid species_uuid FK
        uuid breed_uuid FK
    }
    ATTACHMENTS {
        uuid uuid PK
        varchar name
        varchar url UK
        varchar type
        uuid animal_uuid FK
    }
    MEDICINE_BRANDS {
        uuid uuid PK
        varchar name UK
    }
    MEDICINES {
        uuid uuid PK
        varchar name
        varchar description
        integer quantity
        boolean is_active
        uuid medicine_brand_uuid FK
    }
    MEDICINE_APPLICATIONS {
        uuid uuid PK
        integer quantity
        timestamptz applied_at
        timestamptz next_application_at
        varchar frequency
        varchar google_calendar_event_id
        uuid animal_uuid FK
        uuid medicine_uuid FK
        uuid user_uuid FK
    }
    PUSH_DEVICES {
        uuid uuid PK
        varchar expo_push_token UK
        varchar platform
        boolean is_active
        uuid user_uuid FK
    }
    PUSH_NOTIFICATION_JOBS {
        uuid uuid PK
        timestamptz occurrence_at
        timestamptz send_at
        varchar status
        integer attempts
        jsonb expo_tickets
        uuid medicine_application_uuid FK
        uuid user_uuid FK
    }
```

### Casos de uso principais

```mermaid
flowchart LR
    USER([Equipe da ONG]) --> AUTH{Autenticação}
    AUTH --> LOGIN[Entrar e renovar sessão]

    USER --> ANIMALS{Animais}
    ANIMALS --> CRUD_ANIMAL[Cadastrar, consultar, editar e excluir]
    ANIMALS --> STAGE[Consultar totais por estágio]
    ANIMALS --> FILES[Anexar, listar e remover documentos]

    USER --> STOCK{Medicamentos}
    STOCK --> BRANDS[Gerenciar marcas]
    STOCK --> MEDS[Gerenciar estoque e status]

    USER --> SCHEDULE{Aplicações}
    SCHEDULE --> REGISTER[Registrar aplicação realizada]
    SCHEDULE --> PLAN[Agendar aplicação futura]
    SCHEDULE --> CANCEL[Cancelar agendamento]
    PLAN --> GC[Sincronizar Google Calendar se configurado]
    PLAN --> PUSH[Agendar lembrete push]
    PUSH --> EXPO([Expo Push Service])
    EXPO --> DEVICE([Dispositivo do usuário])
```

### Sequência — agendamento de medicamento

O Google Calendar é opcional: sem suas variáveis de ambiente, a aplicação e o lembrete push continuam sendo persistidos.

```mermaid
sequenceDiagram
    actor Usuario as Usuário
    participant App as Aplicativo
    participant API as NestJS API
    participant Guard as API Key + JWT Guard
    participant Service as MedicineApplicationsService
    participant DB as PostgreSQL
    participant Calendar as Google Calendar
    participant Push as PushNotificationsService

    Usuario->>App: Informa medicamento, quantidade e data
    App->>API: POST /medicine-applications/animal/:animalUuid
    API->>Guard: Valida chave de API e token
    Guard-->>API: Usuário autenticado
    API->>Service: create(animalUuid, dto, user)
    Service->>DB: Busca animal e medicamento
    Service->>Service: Valida estoque
    Service->>DB: Salva aplicação
    Service->>DB: Marca agendamentos anteriores como aplicados
    Service->>DB: Atualiza estoque quando finito

    opt Google Calendar configurado
        Service->>Calendar: Cria evento
        Calendar-->>Service: ID do evento
        Service->>DB: Salva google_calendar_event_id
    end

    opt Próximo horário com 15 min de antecedência
        Service->>Push: Cria job persistente
        Push->>DB: Salva push_notification_job
    end

    Service-->>API: Aplicação com status
    API-->>App: 201 Created
```

### Sequência — entrega de notificação push

```mermaid
sequenceDiagram
    participant Worker as PushNotificationsService
    participant DB as PostgreSQL
    participant Expo as Expo Push Service
    participant Device as Dispositivo

    loop A cada 60 segundos
        Worker->>DB: Busca jobs pendentes com send_at vencido
        DB-->>Worker: Jobs elegíveis
        Worker->>DB: Marca job como processing e incrementa attempts
        Worker->>DB: Busca dispositivos ativos do usuário
        Worker->>Expo: Envia lembrete para os Expo Push Tokens
        Expo-->>Device: Entrega notificação
        Expo-->>Worker: Tickets de envio
        Worker->>DB: Salva tickets e marca job como sent
        Worker->>DB: Agenda a próxima ocorrência recorrente
    end

    Note over Worker,DB: Jobs travados são liberados após timeout.<br/>Tokens DeviceNotRegistered são desativados.
```

### Fluxo de anexos

```mermaid
flowchart TD
    A[Aplicativo envia arquivo] --> B[POST /attachments/animal/:animalUuid]
    B --> C{Animal existe e nome está disponível?}
    C -->|Não| D[Retorna erro de validação ou conflito]
    C -->|Sim| E[Envia arquivo ao Cloudflare R2]
    E --> F[Salva metadados no PostgreSQL]
    F --> G[Retorna o anexo]
    H[Exclusão] --> I[Remove arquivo no R2]
    I --> J[Remove metadados no PostgreSQL]
```

## Endpoints principais

A documentação interativa está disponível em `http://localhost:3000/docs`.

| Área | Rotas |
| --- | --- |
| Autenticação | `POST /auth/sign-in`, `POST /auth/refresh-token` |
| Animais | CRUD em `/animals` e `GET /animals/total-per-stage` |
| Espécies e raças | CRUD em `/species` e rotas de `/species/:speciesUuid/breeds` |
| Anexos | `POST /attachments/animal/:animalUuid`, `GET /attachments/by-animal/:animalUuid`, `DELETE /attachments/:uuid` |
| Medicamentos | CRUD em `/medicine-brands` e `/medicines`; ativação/desativação em `/medicines/:uuid/activate` e `/deactivate` |
| Aplicações | `POST /medicine-applications/animal/:animalUuid`, `GET /medicine-applications/by-animal/:animalUuid`, `DELETE /medicine-applications/:uuid` |
| Push | `POST /push-notifications/devices`, `DELETE /push-notifications/devices` |

## Pré-requisitos

- Node.js 20 ou superior
- pnpm 11
- Docker e Docker Compose
- Credenciais opcionais do Google Calendar e Cloudflare R2 para usar essas integrações

O projeto declara `pnpm@11.7.0`. Caso necessário:

```bash
npm install -g pnpm
```

## Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/victorozoterio/friendly-snout-back.git
   cd friendly-snout-back
   ```

2. Crie e preencha o ambiente:

   ```bash
   cp .env.example .env
   ```

   ```env
   NODE_ENV=development
   PORT=3000
   DB_NAME=friendly_snout
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   X_API_KEY=sua-chave-de-api
   JWT_SECRET_KEY=seu-segredo-jwt
   ```

3. Instale as dependências e inicie o banco:

   ```bash
   pnpm install
   docker compose up -d
   ```

4. Execute as migrations e inicie a API:

   ```bash
   pnpm typeorm migration:run
   pnpm start:dev
   ```

## Testes

| Comando | Descrição |
| --- | --- |
| `pnpm test` | Executa testes unitários. |
| `pnpm test:watch` | Executa testes unitários em observação. |
| `pnpm test:coverage` | Gera a cobertura de testes unitários. |
| `pnpm test:e2e` | Executa testes E2E. |
| `pnpm build` | Compila a aplicação NestJS. |
| `pnpm format` | Executa o Biome com correções seguras. |

## Melhorias futuras

- [ ] Adicionar logs estruturados com Pino.
- [ ] Adicionar observabilidade com OpenTelemetry e Jaeger.
- [ ] Automatizar métricas e alertas do processador de notificações push.
