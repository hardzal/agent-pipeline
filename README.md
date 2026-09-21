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

### Acceptance yang masih pending

Database milestone sudah berhasil diverifikasi terhadap PostgreSQL lokal. Item yang masih pending adalah bagian yang membutuhkan provider model atau runtime Studio:

- Live model completion.
- Pipeline run dengan agent dan tool calls menggunakan model nyata.
- Session memory dan session isolation melalui agent run.
- Memory compaction yang benar-benar terpicu dan menghasilkan `compactionState`.
- Anvia Studio dapat diakses dan diinspeksi.

Dengan demikian, status project saat ini adalah:

```text
Source implementation : selesai
Unit tests             : selesai
Typecheck/build        : selesai
PostgreSQL integration : selesai
Memory validation      : selesai
Live agent smoke test  : belum diverifikasi
Studio smoke test      : belum diverifikasi
```

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
├── src/
│   ├── agents.ts                 # Factory Incident Triage Agent
│   ├── application.ts            # Composition root dan lifecycle
│   ├── config.ts                 # Validasi runtime configuration
│   ├── db.ts                     # Prisma PostgreSQL client
│   ├── index.ts                  # Bootstrap Anvia Studio
│   ├── logger.ts                 # Logger dan observability observer
│   ├── memory.ts                 # PrismaMemoryStore dan validation
│   ├── models.ts                 # OpenAI-compatible model factory
│   ├── pipeline.ts               # Typed incident pipeline
│   ├── prompts.ts                # Agent dan compaction instructions
│   ├── runner.ts                 # Direct CLI runner
│   ├── services/
│   │   └── incident-service.ts   # Domain service dan mock scenarios
│   ├── tools/
│   │   └── incident-tools.ts     # Tiga Anvia tools
│   └── prisma/
│       ├── contract.prisma       # Memory contract
│       └── generated/            # Generated contract JSON dan types
├── tests/
│   ├── config.test.ts
│   ├── pipeline.test.ts
│   ├── services/
│   │   └── incident-service.test.ts
│   └── tools/
│       └── incident-tools.test.ts
├── docs/
│   └── plans.md                  # Implementation plan project
├── docker-compose.yml            # PostgreSQL lokal
├── prisma.config.ts              # Prisma 8 configuration
├── .env.example                  # Environment template
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── tsconfig.test.json
```

## Batasan dan catatan desain

- Incident data masih berasal dari `MockIncidentService`; belum ada monitoring API nyata.
- Agent menggunakan provider model live melalui `@anvia/openai`.
- Pipeline dan service dipisahkan agar service dapat diganti melalui dependency injection.
- `AGENT_MODE=mock` saat ini baru didukung oleh validasi konfigurasi/test. Itu belum menjadi offline runtime penuh karena bootstrap aplikasi masih memerlukan database dan model yang dapat digunakan.
- Tidak ada multi-agent, RAG, vector database, worker, queue, MCP, atau human approval pada scope ini.

## Acceptance checklist

Item `[x]` di bawah menunjukkan implementasi source atau verifikasi lokal yang sudah terbukti. Item `[ ]` membutuhkan evidence runtime/integrasi yang belum tersedia.

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
- [ ] Live agent/tool-call smoke test berhasil.
- [ ] Session persistence dan isolation berhasil.
- [ ] Compaction berhasil didemonstrasikan.
- [ ] Anvia Studio berhasil diakses dan diinspeksi.

## Referensi project

Detail requirement, arsitektur, implementation order, scenario test, dan Definition of Done ada di:

```text
docs/plans.md
```


