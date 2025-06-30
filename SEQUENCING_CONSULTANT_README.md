# 🧬 Sequencing Facility AI Consultant

An intelligent web application that helps Principal Investigators (PIs) determine the most appropriate high-throughput sequencing services for their research projects. Features AI-powered recommendations, interactive consultation chat, and streamlined form submission.

## 🚀 Features

### AI-Powered Intelligence
- **Ollama Integration**: Local AI using Llama 3.1 for personalized consultations
- **Smart Recommendations**: Analyzes project requirements to suggest optimal sequencing services
- **Interactive Chat**: Real-time Q&A about sample prep, costs, timelines, and experimental design
- **Confidence Scoring**: Each recommendation includes confidence levels and priority rankings
- **Fallback Intelligence**: Pattern-based recommendations when AI is unavailable

### Comprehensive Consultation Flow
- **Multi-Step Wizard**: Intuitive 6-step process guides PIs through all requirements
- **Dynamic Forms**: Smart dropdowns for organisms, sample types, and common research scenarios
- **Cost Estimation**: Real-time pricing with automatic volume discounts
- **Timeline Planning**: Project scheduling based on service selection
- **Progress Tracking**: Visual indicators show consultation completion status

### Sequencing Services Catalog
- RNA Sequencing (RNA-seq)
- Whole Genome Sequencing (WGS)
- ChIP-Seq for protein-DNA interactions
- Single Cell RNA-Seq
- ATAC-Seq for chromatin accessibility
- Long-Read DNA Sequencing (PacBio/Nanopore)

### Technical Features
- **Type-Safe API**: tRPC for end-to-end type safety
- **Real-time Updates**: React Query with optimistic updates
- **PostgreSQL Database**: Robust data storage with Kysely ORM
- **Formspree Integration**: Seamless form submission handling
- **OpenShift Ready**: Docker containerization with deployment configs
- **Responsive Design**: Mobile-friendly UI with Shadcn components

## 🛠️ Tech Stack

- **Frontend**: Astro + React + TypeScript
- **Backend**: tRPC API with type-safe procedures
- **Database**: PostgreSQL with Kysely ORM
- **AI**: Ollama with Llama 3.1 model
- **Styling**: Tailwind CSS + Shadcn UI
- **Deployment**: Docker + OpenShift
- **Form Handling**: Formspree

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- PNPM package manager
- PostgreSQL database
- Docker (for containerization)
- Ollama (for AI features) - optional but recommended

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/sequencing-consultant.git
   cd sequencing-consultant
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up the database:**
   ```bash
   # Start PostgreSQL (if using Docker)
   docker-compose up -d postgres
   
   # Run migrations
   DATABASE_URL=postgres://crispr_user:crispr_password@localhost:5432/crispr_db \
   pnpm --filter @seqconsult/db db:migrate
   ```

4. **Configure environment variables:**
   
   Create `.env` file in `apps/web`:
   ```env
   # Database
   DATABASE_URL="postgres://crispr_user:crispr_password@localhost:5432/crispr_db"
   
   # Authentication
   AUTH_SECRET="your-secret-key-here"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   
   # Formspree (for form submissions)
   PUBLIC_FORMSPREE_ENDPOINT="https://formspree.io/f/YOUR_FORM_ID"
   
   # Application
   SITE_BASE_URL="http://localhost:3001"
   ```

5. **Set up AI (recommended):**
   ```bash
   # Run the automated setup script
   ./setup-ollama-consultation.sh
   
   # Or manually:
   # 1. Install Ollama from https://ollama.ai
   # 2. Start Ollama service
   # 3. Pull the model: ollama pull llama3.1:latest
   ```

6. **Start the development server:**
   ```bash
   cd apps/web && pnpm dev
   ```

   Visit http://localhost:3001 to see the application.

## 🤖 AI Consultation Features

The AI assistant can help with:

- **Service Selection**: Recommends appropriate sequencing methods based on research goals
- **Sample Preparation**: Provides specific requirements for each service type
- **Cost Optimization**: Suggests strategies to maximize budget efficiency
- **Timeline Planning**: Estimates project duration and milestone scheduling
- **Technical Guidance**: Answers questions about platforms, coverage, and data analysis
- **Experimental Design**: Offers advice on controls, replicates, and statistical power

### Example Questions

- "What are the RNA quality requirements for RNA-seq?"
- "How can I reduce costs for my 100 samples?"
- "What's the difference between short-read and long-read sequencing?"
- "Do you provide bioinformatics support?"
- "What coverage do I need for variant detection?"

## 📝 Workflow

1. **Landing Page**: PIs learn about available services
2. **Basic Information**: Contact details and institution
3. **Project Details**: Research objectives and area
4. **Sample Information**: Organism, sample type, and experimental design
5. **Budget & Timeline**: Project constraints
6. **AI Consultation**: Personalized recommendations and interactive chat
7. **Review & Submit**: Summary and form submission via Formspree

## 🚀 Deployment

### Local Development
```bash
pnpm dev
```

### Production Build
```bash
pnpm build
```

### Docker
```bash
# Build image
docker build -t sequencing-consultant apps/web

# Run container
docker run -p 3001:3001 \
  -e DATABASE_URL="your-database-url" \
  -e AUTH_SECRET="your-secret" \
  sequencing-consultant
```

### OpenShift
```bash
# Apply configurations
oc apply -f openshift/

# Start build
oc start-build sequencing-consultant-web --follow
```

## 📊 Database Schema

Key tables:
- `consultations` - PI project information
- `sequencing_services` - Available service catalog
- `service_recommendations` - AI-generated recommendations
- `sample_specifications` - Experimental design details
- `consultation_chats` - Conversation history
- `cost_estimates` - Budget calculations

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## 📚 Documentation

- [AI Consultation Setup](./AI_CONSULTATION_SETUP.md) - Detailed AI configuration guide
- [Formspree Setup](./FORMSPREE_SETUP.md) - Form submission configuration
- [OpenShift Deployment](./OPENSHIFT_DEPLOYMENT.md) - Production deployment guide
- [Database Integration](./DATABASE_INTEGRATION.md) - Database setup and migrations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on the excellent [monorepo-scaffold](https://github.com/ocavue/monorepo-scaffold) by @ocavue and @maccman
- AI powered by [Ollama](https://ollama.ai) and Llama 3.1
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Form handling by [Formspree](https://formspree.io)

---

*Need help? Contact your sequencing facility's bioinformatics team or open an issue in this repository.* 