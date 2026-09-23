# Incident Triage Agent

Incident Triage Agent adalah aplikasi TypeScript yang menggunakan Anvia SDK untuk menerima laporan insiden backend, memilih tool investigasi yang relevan, membaca data dari mock incident service, lalu menghasilkan ringkasan insiden.

Project ini dibuat sebagai latihan fundamental AI Engineering:

```text
User input
    |
    v
Incident Triage Pipeline
    |
    v
Normalize input
    |
    v
Incident Triage Agent
    |
    +--> check_service_health
    +--> get_recent_logs
    +--> get_recent_deployment
    |
    v
Mock Incident Service
    |
    v
Agent response + persistent memory
    |
    v
PostgreSQL melalui Prisma Memory Store
```

## Status saat ini

### Sudah diimplementasikan

- Incident Triage Agent berbasis `@anvia/core`.
- Basic pipeline dengan tahap normalisasi input dan agent stage.
- Tiga tools:
  - `check_service_health`
  - `get_recent_logs`
  - `get_recent_deployment`
- `MockIncidentService` dengan scenario deterministic untuk:
  - `payment-service`
  - `auth-service`
  - `notification-service`
- Zod validation untuk input pipeline dan output tools.
- OpenAI-compatible model adapter melalui `@anvia/openai`.
- Prisma 8 contract dan `PrismaMemoryStore` untuk persistent conversation memory.
- Memory compaction menggunakan `createSummaryMemoryCompactor`.
- Logger dan Anvia observer untuk agent/tool events.
- Anvia Studio bootstrap.
- Direct runner untuk menjalankan pipeline dari terminal.
- Contoh payload input untuk setiap tool tersedia di `example/`.
- Unit test untuk konfigurasi, pipeline, tools, dan mock service.

### Bukti verifikasi yang sudah berhasil

Perintah berikut sudah dijalankan dan berhasil:

```text
pnpm install --frozen-lockfile
pnpm prisma:emit
pnpm test
pnpm typecheck
pnpm build
```

Hasil test saat ini:

```text
4 test files passed
11 tests passed
```

### Status verifikasi

Implementasi dan runtime flow utama sudah diverifikasi:

- Unit tests, typecheck, dan build berhasil.
- Live agent berhasil melakukan completion dan tool calling.
- Persistent memory, session isolation, dan compaction berhasil diuji.
- PostgreSQL dan Anvia Studio berhasil diakses.

Project siap dijalankan secara manual dengan konfigurasi provider dan database lokal yang valid.

## Tech stack

- TypeScript, ESM
- Node.js
- pnpm `11.22.0`
- Anvia Core `1.5.0`
- Anvia Logger `1.1.4`
- Anvia OpenAI `1.1.5`
- Anvia Memory Prisma `1.2.1`
- Anvia Studio `1.2.4`
- Prisma ORM PostgreSQL `8.0.0-rc.11`
- PostgreSQL 16
- Zod 4
- Vitest 5

## Prerequisites

Untuk menjalankan full application diperlukan:

- Node.js yang kompatibel dengan dependency project.
- pnpm `11.22.0` atau versi yang kompatibel.
- Docker Desktop yang sedang berjalan.
- PostgreSQL melalui Docker Compose.
- API key dan model ID dari provider OpenAI-compatible.

## Setup dengan pnpm

Dari root project:

```bash
pnpm install --frozen-lockfile
```

Buat file environment lokal:

```bash
cp .env.example .env
```

Kemudian isi `.env`:

```env
OPENAI_API_KEY=your-api-key
OPENAI_API_BASE_URL=https://api.openai.com/v1
LLM_MODEL=your-model-id

DATABASE_URL=postgresql://anvia:anvia@localhost:5544/anvia

AGENT_MODE=live
STUDIO_PORT=4021
```

`OPENAI_API_BASE_URL` dapat diarahkan ke provider OpenAI-compatible. `LLM_MODEL` harus diisi dengan model ID yang memang tersedia pada akun/provider tersebut.

Jangan commit `.env` atau menampilkan nilai `OPENAI_API_KEY` ke log.

## Menyiapkan PostgreSQL

Pastikan Docker Desktop sudah berjalan, lalu jalankan:

```bash
docker compose up -d postgres
```

Contract Prisma dapat dibuat ulang dengan:

```bash
pnpm prisma:emit
```

Setelah database aktif dan `DATABASE_URL` sudah benar, update database contract dengan:

```bash
pnpm prisma:update
```

Perintah tersebut sudah berhasil dijalankan terhadap PostgreSQL lokal dan menerapkan contract memory.

## Menjalankan Anvia Studio

Setelah environment dan PostgreSQL siap:

```bash
pnpm studio
```

atau:

```bash
pnpm dev
```

Keduanya menjalankan `src/index.ts` dan memulai Studio pada:

```text
http://localhost:4021
```

Port dapat diubah melalui `STUDIO_PORT`.

Studio mendaftarkan object agent dan pipeline yang sama sehingga agent, pipeline, tool calls, runs, dan memory dapat diinspeksi dari satu runtime.

## Menjalankan direct runner

Runner menggunakan pipeline yang sama tanpa membuka Studio:

```bash
pnpm runner -- --prompt "Payment-service lambat sejak deployment pagi tadi. Investigasi." --session-id incident-demo --user-id student
```

Output JSON:

```bash
pnpm runner -- --prompt "Cek payment-service" --session-id incident-demo --json
```

Tampilkan bantuan:

```bash
pnpm runner -- --help
```

Argument `--` setelah nama script didukung karena dapat diteruskan oleh pnpm sebagai sentinel argument.

Runner live tetap membutuhkan konfigurasi provider dan PostgreSQL yang valid.

## Contoh input tool

Folder `example/` berisi payload JSON dalam format `.txt` yang dapat digunakan untuk setiap tool agent:

```text
example/check_service_health.txt
example/get_recent_logs.txt
example/get_recent_deployment.txt
```

Ketiga contoh menggunakan `payment-service`, salah satu scenario yang tersedia di `MockIncidentService`. Payload setiap tool memiliki bentuk yang sama:

```json
{
  "serviceName": "payment-service"
}
```

Untuk mencoba scenario lain, ganti `serviceName` dengan `auth-service` atau `notification-service`.

## Perintah development

```bash
# Install dependency
pnpm install --frozen-lockfile

# Generate Prisma contract
pnpm prisma:emit

# Update PostgreSQL schema/contract
pnpm prisma:update

# Jalankan unit tests
pnpm test

# Jalankan test dalam watch mode
pnpm test:watch

# Typecheck tanpa output
pnpm typecheck

# Build ke dist/
pnpm build

# Jalankan Studio
pnpm studio

# Jalankan direct runner
pnpm runner -- --help
```

## Struktur source

```text
.
├── example/
│   ├── check_service_health.txt
│   ├── get_recent_logs.txt
│   └── get_recent_deployment.txt
├── src/
│   ├── app/
│   │   ├── application.ts            # Composition root dan lifecycle
│   │   ├── runner.ts                 # Direct CLI runner
│   │   └── studio.ts                 # Anvia Studio bootstrap
│   ├── agents/
│   │   ├── incident-agent.ts         # Factory Incident Triage Agent
│   │   └── prompts.ts                # Agent dan compaction instructions
│   ├── config/
│   │   └── runtime-config.ts         # Validasi runtime configuration
│   ├── domain/
│   │   └── incident.ts               # Incident types dan service contract
│   ├── infrastructure/
│   │   ├── model/
│   │   │   └── openai-completion-model.ts # Model adapter
│   │   ├── observability/
│   │   │   └── logger.ts              # Logger dan observer
│   │   └── persistence/
│   │       ├── database.ts            # Prisma PostgreSQL client
│   │       ├── memory-store.ts        # PrismaMemoryStore dan validation
│   │       └── prisma/                # Contract dan generated artifacts
│   ├── pipeline/
│   │   └── incident-pipeline.ts       # Typed incident pipeline
│   ├── services/
│   │   ├── mock-incident-service.ts   # Mock service implementation
│   │   └── mock-incident-scenarios.ts # Deterministic mock data
│   ├── tools/
│   │   └── incident-tools.ts          # Tiga Anvia tools
│   └── index.ts                        # Thin Studio entry point
├── tests/
│   ├── config.test.ts
│   ├── pipeline.test.ts
│   ├── services/
│   │   └── mock-incident-service.test.ts
│   └── tools/
│       └── incident-tools.test.ts
├── docs/
│   └── plans.md                        # Implementation plan project
├── docker-compose.yml                   # PostgreSQL lokal
├── prisma.config.ts                    # Prisma 8 configuration
├── .env.example                        # Environment template
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── tsconfig.test.json
```

Struktur ini memisahkan domain contract, application wiring, adapter/infrastructure, dan feature orchestration tanpa menambahkan framework atau layer yang belum diperlukan.
## Batasan dan catatan desain

- Incident data masih berasal dari `MockIncidentService`; belum ada monitoring API nyata.
- Agent menggunakan provider model live melalui `@anvia/openai`.
- Pipeline dan service dipisahkan agar service dapat diganti melalui dependency injection.
- `AGENT_MODE=mock` saat ini baru didukung oleh validasi konfigurasi/test. Itu belum menjadi offline runtime penuh karena bootstrap aplikasi masih memerlukan database dan model yang dapat digunakan.
- Tidak ada multi-agent, RAG, vector database, worker, queue, MCP, atau human approval pada scope ini.

## Acceptance checklist

Item `[x]` di bawah menunjukkan implementasi source dan verifikasi yang sudah berhasil.

- [x] Dependency terpasang dengan pnpm.
- [x] Prisma contract dapat di-emit.
- [x] Tiga tools tersedia dan memiliki schema.
- [x] Mock incident service deterministic.
- [x] Pipeline memiliki typed input dan agent stage.
- [x] Memory dan compaction terhubung dalam konfigurasi agent.
- [x] Unit tests lulus: 11 tests.
- [x] Typecheck lulus.
- [x] Build lulus.
- [x] PostgreSQL berjalan.
- [x] Prisma memory tables terbentuk.
- [x] `memoryStore.validate()` berhasil terhadap PostgreSQL nyata.
- [x] Live agent/tool-call smoke test berhasil.
- [x] Session persistence dan isolation berhasil.
- [x] Compaction berhasil didemonstrasikan.
- [x] Anvia Studio berhasil diakses dan diinspeksi.

## Referensi project

Detail requirement, arsitektur, implementation order, scenario test, dan Definition of Done ada di:

```text
docs/plans.md
```


