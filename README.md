# Watchtower

API uptime monitoring platform. Register websites or API endpoints, run scheduled health checks, track uptime and response times, create incidents when services go down, and view everything on a clean dashboard and public status page.

## Tech Stack

- **Frontend:** Next.js 14 with TypeScript and Tailwind CSS
- **Backend:** FastAPI with Python 3.11
- **Database:** PostgreSQL 15
- **Background Jobs:** APScheduler
- **Containerization:** Docker and Docker Compose

## Features

- Monitor registration with name, URL, HTTP method, expected status, interval, and environment tags
- Automated scheduled health checks (every minute)
- Incident tracking with auto-creation and auto-resolution
- Dashboard with monitor cards, uptime percentage, and response times
- Monitor detail page with response time chart and incident history
- Public status page with overall system status
- Discord webhook alerts for down/recovery events
- Manual health check trigger

## Local Setup

### Prerequisites

- Docker and Docker Compose installed
- Git

### Quick Start

```bash
# Clone the repo
git clone <repo-url> watchtower
cd watchtower

# Start all services
docker compose up --build

# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Environment Variables

Create a `.env` file at the project root (optional):

```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
```

### Stopping Services

```bash
docker compose down

# To also remove the database volume:
docker compose down -v
```

## Docker Compose Commands

```bash
# Start services in background
docker compose up -d --build

# View logs
docker compose logs -f

# View backend logs only
docker compose logs -f backend

# Restart a specific service
docker compose restart backend

# Rebuild after code changes
docker compose up --build
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health check |
| POST | `/api/monitors/` | Create a monitor |
| GET | `/api/monitors/` | List all monitors |
| GET | `/api/monitors/{id}` | Get monitor details |
| PUT | `/api/monitors/{id}` | Update a monitor |
| DELETE | `/api/monitors/{id}` | Delete a monitor |
| GET | `/api/health-checks/{monitor_id}` | Get health check history |
| POST | `/api/health-checks/{monitor_id}/trigger` | Trigger manual check |
| GET | `/api/incidents/` | List all incidents |
| GET | `/api/incidents/{monitor_id}` | Get monitor incidents |
| GET | `/api/dashboard` | Get dashboard data |
| GET | `/api/status` | Get public status page |

## Example Monitors to Test

After starting the app, create these monitors through the UI or API:

### Google Homepage
```json
{
  "name": "Google",
  "url": "https://google.com",
  "http_method": "GET",
  "expected_status_code": 200,
  "check_interval_minutes": 5,
  "environment": "prod"
}
```

### GitHub
```json
{
  "name": "GitHub",
  "url": "https://github.com",
  "http_method": "GET",
  "expected_status_code": 200,
  "check_interval_minutes": 5,
  "environment": "prod"
}
```

### Watchtower API (self-monitoring)
```json
{
  "name": "Watchtower API",
  "url": "http://backend:8000/api/health",
  "http_method": "GET",
  "expected_status_code": 200,
  "check_interval_minutes": 1,
  "environment": "dev"
}
```

## Project Structure

```
watchtower/
├── docker-compose.yml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py            # FastAPI app entry point
│   ├── config.py          # Settings and env vars
│   ├── database.py        # Database connection and session
│   ├── models.py          # SQLAlchemy models
│   ├── schemas.py         # Pydantic schemas
│   ├── checker.py         # Health check logic
│   ├── alerts.py          # Discord webhook alerts
│   ├── scheduler.py       # APScheduler configuration
│   └── routers/
│       ├── monitors.py    # Monitor CRUD endpoints
│       ├── health_checks.py # Health check endpoints
│       ├── incidents.py   # Incident endpoints
│       └── dashboard.py   # Dashboard and status page
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── next.config.js
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx           # Dashboard
        │   ├── globals.css
        │   ├── monitors/
        │   │   ├── create/page.tsx
        │   │   └── [id]/page.tsx  # Monitor detail
        │   └── status/page.tsx    # Public status page
        ├── components/
        │   ├── MonitorCard.tsx
        │   ├── StatusBadge.tsx
        │   ├── HealthCheckTable.tsx
        │   ├── IncidentTable.tsx
        │   ├── ResponseTimeChart.tsx
        │   └── CreateMonitorForm.tsx
        ├── types/index.ts
        └── lib/api.ts
```

## Deployment Roadmap

This MVP is designed for local development. The planned production deployment path:

1. **Build Docker image** with GitHub Actions CI/CD pipeline
2. **Push image to AWS ECR** (Elastic Container Registry)
3. **Deploy to AWS ECS** (Elastic Container Service) with Fargate
4. **View logs** through AWS CloudWatch
5. **Deploy through ServiceForge** for managed infrastructure provisioning
6. **Monitor Watchtower itself** with Watchtower (self-monitoring)
7. **Use ServiceForge rollback workflows** for failed releases

### ServiceForge Integration Points

- Infrastructure provisioning (ECS cluster, RDS, load balancer)
- Environment variable management
- Deployment orchestration
- Rollback on health check failures
- Log aggregation and alerting
- Service dependency mapping

## License

MIT
