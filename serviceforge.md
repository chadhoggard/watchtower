# ServiceForge Deployment Integration Plan

This document describes how Watchtower will be registered, built, deployed, health checked, logged, and rolled back through ServiceForge.

---

## 1. Service Registration

Watchtower will be registered in ServiceForge as two services:

| Service | Type | Runtime | Port |
|---------|------|---------|------|
| `watchtower-api` | Backend API | Python 3.11 (FastAPI) | 8000 |
| `watchtower-frontend` | Web App | Node.js 20 (Next.js) | 3000 |

### Registration Metadata

```yaml
service: watchtower-api
team: platform
repository: github.com/org/watchtower
environment:
  - dev
  - staging
  - prod
dependencies:
  - postgresql
  - discord-webhook (optional)
```

---

## 2. Build Pipeline

### GitHub Actions CI/CD

1. On push to `main`, GitHub Actions triggers the build workflow.
2. Run tests (backend unit tests, frontend lint/typecheck).
3. Build Docker images for `watchtower-api` and `watchtower-frontend`.
4. Tag images with git SHA and `latest`.
5. Push images to AWS ECR.

### ECR Repositories

```
AWS_ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/watchtower-api
AWS_ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/watchtower-frontend
```

### ServiceForge Build Hook

ServiceForge receives a webhook from GitHub Actions on successful image push:

```json
{
  "service": "watchtower-api",
  "image": "watchtower-api:abc123",
  "environment": "staging",
  "trigger": "push_to_main"
}
```

---

## 3. Deployment

### Infrastructure (Provisioned by ServiceForge)

- **AWS ECS Cluster**: Fargate launch type
- **AWS RDS**: PostgreSQL 15 instance (db.t3.micro for dev, db.r6g.large for prod)
- **Application Load Balancer**: Routes traffic to ECS tasks
- **Security Groups**: Restrict access between services
- **VPC**: Isolated network for the service stack

### ECS Task Definition

ServiceForge generates the ECS task definition:

```json
{
  "family": "watchtower-api",
  "containerDefinitions": [
    {
      "name": "watchtower-api",
      "image": "<ecr-image-uri>",
      "portMappings": [{ "containerPort": 8000 }],
      "environment": [
        { "name": "DATABASE_URL", "value": "<rds-connection-string>" },
        { "name": "DISCORD_WEBHOOK_URL", "value": "<secret>" },
        { "name": "CORS_ORIGINS", "value": "https://status.example.com" }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8000/api/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/watchtower-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ],
  "cpu": "256",
  "memory": "512"
}
```

### Deployment Strategy

- **Rolling deployment** with minimum healthy percent of 100% and maximum percent of 200%.
- New tasks must pass health checks before old tasks are drained.
- ServiceForge monitors the deployment and triggers rollback on failure.

---

## 4. Health Checks

### Container-Level Health Check

```
GET /api/health → 200 { "status": "healthy", "service": "watchtower-api" }
```

### ALB Target Group Health Check

- Path: `/api/health`
- Interval: 30s
- Healthy threshold: 2
- Unhealthy threshold: 3

### ServiceForge Deep Health Check

ServiceForge periodically verifies:
- API responds on `/api/health`
- Database connectivity (implicit in API health)
- Scheduler is running (check for recent health check records)
- Response time < 500ms

---

## 5. Logging & Monitoring

### CloudWatch Logs

All container stdout/stderr streams to CloudWatch Log Groups:

- `/ecs/watchtower-api`
- `/ecs/watchtower-frontend`

### CloudWatch Metrics

ServiceForge configures alarms for:

| Metric | Threshold | Action |
|--------|-----------|--------|
| CPU Utilization | > 80% for 5 min | Scale out |
| Memory Utilization | > 85% for 5 min | Alert |
| 5xx Error Rate | > 5% for 2 min | Alert + potential rollback |
| Response Time (p99) | > 2000ms for 5 min | Alert |
| Task Count | < desired count | Alert |

### ServiceForge Dashboard

ServiceForge displays:
- Deployment history with timestamps and image tags
- Current running version per environment
- Health check status
- Resource utilization graphs
- Log tail with search

---

## 6. Rollback Strategy

### Automatic Rollback

ServiceForge triggers automatic rollback when:
- New tasks fail health checks within 5 minutes of deployment
- 5xx error rate exceeds 10% within 3 minutes post-deploy
- Container crashes repeatedly (exit code != 0)

### Rollback Process

1. ServiceForge detects unhealthy deployment.
2. ECS service is updated to previous task definition revision.
3. New (broken) tasks are stopped.
4. Previous image tasks are scaled back to desired count.
5. Alert sent to team (Discord, Slack, email).
6. Deployment marked as `FAILED` in ServiceForge history.

### Manual Rollback

```bash
serviceforge rollback watchtower-api --environment prod --to-version <previous-sha>
```

---

## 7. Environment Management

### Environment Variables (Managed by ServiceForge)

| Variable | Source | Environments |
|----------|--------|--------------|
| `DATABASE_URL` | AWS Secrets Manager | all |
| `DISCORD_WEBHOOK_URL` | AWS Secrets Manager | staging, prod |
| `CORS_ORIGINS` | ServiceForge config | all |
| `DEGRADED_THRESHOLD_MS` | ServiceForge config | all |

### Secrets Rotation

ServiceForge handles RDS credential rotation via AWS Secrets Manager with automatic ECS task restart on rotation.

---

## 8. Self-Monitoring

Watchtower monitors itself:

- Register `watchtower-api` health endpoint as a monitor within Watchtower.
- If Watchtower detects its own API is degraded, ServiceForge receives the alert.
- ServiceForge can trigger a restart or rollback independently.

---

## 9. Deployment Workflow Summary

```
Developer pushes to main
    ↓
GitHub Actions: test → build → push to ECR
    ↓
ServiceForge receives webhook
    ↓
ServiceForge updates ECS task definition
    ↓
ECS rolls out new tasks (rolling deployment)
    ↓
Health checks pass? 
    ├── YES → Deployment complete, old tasks drained
    └── NO  → Automatic rollback to previous version
    ↓
ServiceForge logs result, sends notification
```

---

## 10. Future Enhancements

- **Multi-region deployment** for high availability
- **Blue/green deployment** option for zero-downtime switches
- **Canary releases** routing 10% traffic to new version first
- **Auto-scaling** based on monitor count and check frequency
- **Database migrations** orchestrated through ServiceForge pre-deploy hooks
