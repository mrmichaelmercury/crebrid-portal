# Crebrid Broker Portal — Setup Guide

## Tech Stack
- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v5 (JWT sessions)
- **AI**: Claude Opus 4-6 (Anthropic SDK) — document processing + underwriting
- **Storage**: AWS S3 (document uploads)
- **UI**: Tailwind CSS + Radix UI

---

## Prerequisites

- Node.js 18+
- PostgreSQL database
- AWS S3 bucket (for document storage)
- Anthropic API key

---

## 1. Install Dependencies

```bash
cd broker-portal
npm install
```

---

## 2. Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

**Required:**
```
DATABASE_URL="postgresql://user:password@localhost:5432/crebrid_broker"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
ANTHROPIC_API_KEY="sk-ant-..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="crebrid-broker-documents"
```

**Optional (Baseline — see note below):**
```
BASELINE_API_URL="https://api.baselinesoftware.com"
BASELINE_API_KEY="..."
BASELINE_LENDER_ID="..."
```

### ⚠️ Baseline API Note
Baseline's public API documentation is limited. Contact Baseline directly at
**support@baselinesoftware.com** to request:
1. API documentation
2. API key / credentials
3. Your Lender ID

Until configured, the "Baseline Export" button will download a CSV file of
the loan data that can be manually imported into Baseline.

---

## 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Or run migrations (production)
npm run db:migrate

# Seed with demo users
npm run db:seed
```

**Demo accounts after seeding:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@crebrid.com | admin123! |
| Processor | processor@crebrid.com | admin123! |
| Broker | broker@demo.com | broker123! |

---

## 4. AWS S3 Setup

1. Create an S3 bucket (e.g., `crebrid-broker-documents`)
2. Enable server-side encryption (AES-256)
3. Configure CORS for your domain:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": ["https://your-domain.com"],
    "ExposeHeaders": []
  }
]
```
4. Create an IAM user with `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` permissions

---

## 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 6. Deploy to Production

### Option A: Vercel (Recommended)
```bash
npm install -g vercel
vercel
```
Set environment variables in Vercel dashboard.

### Option B: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Architecture Overview

```
broker-portal/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (dashboard)/
│   │   ├── dashboard/         # Main dashboard
│   │   ├── loans/             # Loan list + detail pages
│   │   └── settings/          # User profile settings
│   └── api/
│       ├── auth/              # NextAuth endpoints
│       ├── loans/             # Loan CRUD + sub-resources
│       │   └── [id]/
│       │       ├── documents/ # Document upload + AI processing
│       │       ├── ai-review/ # AI underwriting review
│       │       └── baseline-export/ # Baseline sync / CSV export
│       └── user/profile/      # Profile update
├── components/
│   ├── layout/                # Sidebar, mobile nav
│   ├── loans/                 # Loan forms and detail UI
│   ├── documents/             # Document upload with drag-drop
│   ├── ai/                    # AI review panel
│   └── settings/              # Settings form
├── lib/
│   ├── ai/
│   │   ├── document-processor.ts  # Claude document classification + extraction
│   │   ├── underwriting.ts        # Claude underwriting analysis
│   │   └── prompts.ts             # AI prompts with Crebrid guidelines
│   ├── baseline.ts            # Baseline integration layer
│   ├── storage.ts             # AWS S3 upload/download
│   └── types.ts               # Loan types, document types, requirements
└── prisma/
    └── schema.prisma          # Database schema
```

---

## AI Features

### Document Processing
When a document is uploaded, the AI automatically:
1. **Classifies** the document type (purchase contract, bank statement, etc.)
2. **Extracts** key financial data (purchase price, ARV, credit score, etc.)
3. **Flags** issues (expired docs, low balances, missing info)
4. **Summarizes** the document in plain English

### AI Underwriting Review
When triggered, the AI:
1. Reviews all uploaded documents together
2. Checks against Crebrid's lending guidelines (LTV, LTC, DSCR, etc.)
3. Identifies red flags and conditions
4. Generates a loan score (0-100) and status (PASS/CONDITIONAL/FAIL)
5. Provides a detailed recommendation for the processor

**Note**: AI does NOT evaluate comparable sales (comps). That requires human
judgment and local market knowledge.

---

## Kiavi Inspiration
The UI/UX is inspired by Kiavi (formerly LendingHome), a leading hard money
lender portal. Key design principles borrowed:
- Clean, card-based layout
- Status-driven workflow
- Mobile-first responsive design
- Document checklist with progress tracking
- Clear loan pipeline visibility
