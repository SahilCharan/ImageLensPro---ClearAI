# ClearAI - AWS Architecture Proposal
## Image Text Error Detection Platform

**Document Version:** 1.0  
**Date:** November 7, 2025  
**Prepared For:** ClearAI Platform Deployment

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [AWS Services Breakdown](#aws-services-breakdown)
4. [Authentication Workflow](#authentication-workflow)
5. [Image Processing Workflow](#image-processing-workflow)
6. [Security Considerations](#security-considerations)
7. [Scalability & Performance](#scalability--performance)
8. [Cost Estimation](#cost-estimation)
9. [Deployment Strategy](#deployment-strategy)
10. [Monitoring & Maintenance](#monitoring--maintenance)

---

## 1. Executive Summary

This document outlines a comprehensive AWS architecture for the ClearAI Image Text Error Detection platform. The proposed solution leverages serverless and managed services to provide a scalable, secure, and cost-effective infrastructure.

### Key Requirements Met:
- ✅ Admin-approved user authentication (no third-party OAuth)
- ✅ Secure image upload and processing
- ✅ AI-powered error detection via webhook integration
- ✅ Clean, minimalist user interface
- ✅ Full source code access for administrators
- ✅ Scalable and cost-effective architecture

---

## 2. Architecture Overview

### 2.1 High-Level Architecture Diagram (Text Description)

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USERS (Web Browsers)                        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CloudFront (CDN + HTTPS)                          │
│                  - Global content delivery                           │
│                  - SSL/TLS termination                               │
│                  - DDoS protection                                   │
└────────────┬────────────────────────────────────┬────────────────────┘
             │                                    │
             ▼                                    ▼
┌────────────────────────┐          ┌────────────────────────────────┐
│   S3 Bucket (Static)   │          │   API Gateway (REST API)       │
│   - React Frontend     │          │   - /api/* endpoints           │
│   - HTML/CSS/JS        │          │   - Request validation         │
│   - Images/Assets      │          │   - Rate limiting              │
└────────────────────────┘          └────────────┬───────────────────┘
                                                  │
                                                  ▼
                                    ┌─────────────────────────────────┐
                                    │   Lambda Functions (Node.js)    │
                                    │   - Authentication logic        │
                                    │   - Account request handling    │
                                    │   - Image processing triggers   │
                                    │   - Database operations         │
                                    └────────────┬────────────────────┘
                                                 │
                    ┌────────────────────────────┼────────────────────────┐
                    │                            │                        │
                    ▼                            ▼                        ▼
         ┌──────────────────┐       ┌──────────────────┐    ┌──────────────────┐
         │   RDS PostgreSQL │       │   S3 Bucket      │    │   SES (Email)    │
         │   - User accounts│       │   (Images)       │    │   - Admin notify │
         │   - Profiles     │       │   - Uploads      │    │   - User notify  │
         │   - Requests     │       │   - Processed    │    └──────────────────┘
         │   - Image data   │       └──────────────────┘
         │   - Error records│
         └──────────────────┘
                    │
                    ▼
         ┌──────────────────┐
         │   Secrets Manager│
         │   - DB credentials│
         │   - API keys     │
         │   - Webhook URLs │
         └──────────────────┘
```

### 2.2 Component Layers

**Layer 1: Presentation (Frontend)**
- CloudFront CDN
- S3 Static Website Hosting
- React Application

**Layer 2: API & Business Logic**
- API Gateway
- Lambda Functions
- Step Functions (for complex workflows)

**Layer 3: Data & Storage**
- RDS PostgreSQL (structured data)
- S3 (image storage)
- ElastiCache Redis (session caching - optional)

**Layer 4: External Integration**
- N8N Webhook (AI processing)
- SES (email notifications)

**Layer 5: Security & Monitoring**
- Cognito (custom authentication)
- Secrets Manager
- CloudWatch (logging & monitoring)
- WAF (Web Application Firewall)

---

## 3. AWS Services Breakdown

### 3.1 Frontend Hosting

#### **Amazon S3 + CloudFront**

**S3 Configuration:**
```
Bucket Name: clearai-frontend-prod
Purpose: Static website hosting
Contents:
  - index.html
  - /assets/* (JS, CSS, images)
  - /clearai-logo.png
  
Settings:
  - Static website hosting: Enabled
  - Public access: Blocked (access via CloudFront only)
  - Versioning: Enabled
  - Encryption: AES-256
```

**CloudFront Configuration:**
```
Distribution:
  - Origin: S3 bucket
  - SSL Certificate: ACM (AWS Certificate Manager)
  - Custom Domain: app.clearai.com
  - Cache Behavior:
    * HTML: No cache (always fresh)
    * JS/CSS: Cache for 1 year (with versioning)
    * Images: Cache for 1 month
  - Security:
    * HTTPS only
    * Origin Access Identity (OAI)
    * WAF integration
```

**Benefits:**
- Global CDN for fast loading
- Automatic HTTPS
- DDoS protection
- Cost-effective ($0.085/GB for first 10TB)

---

### 3.2 API Layer

#### **Amazon API Gateway**

**Configuration:**
```
API Type: REST API
Endpoints:
  POST   /api/auth/login
  POST   /api/auth/request-account
  GET    /api/auth/profile
  POST   /api/auth/logout
  
  GET    /api/admin/requests
  POST   /api/admin/approve/{requestId}
  POST   /api/admin/reject/{requestId}
  
  POST   /api/images/upload
  GET    /api/images/{imageId}
  GET    /api/images/user/{userId}
  
  POST   /api/webhook/process-image
  GET    /api/errors/{imageId}

Features:
  - Request validation
  - Rate limiting: 1000 requests/minute per IP
  - API keys for webhook endpoints
  - CORS configuration
  - Request/response transformation
```

**Benefits:**
- Managed service (no servers)
- Built-in throttling
- Request validation
- Cost: $3.50 per million requests

---

### 3.3 Business Logic

#### **AWS Lambda Functions**

**Function 1: Authentication Handler**
```javascript
Name: clearai-auth-handler
Runtime: Node.js 20.x
Memory: 512 MB
Timeout: 10 seconds

Responsibilities:
  - User login validation
  - Account request creation
  - Profile management
  - Session management

Environment Variables:
  - DB_HOST (from Secrets Manager)
  - DB_NAME
  - JWT_SECRET
```

**Function 2: Account Request Manager**
```javascript
Name: clearai-account-manager
Runtime: Node.js 20.x
Memory: 512 MB
Timeout: 15 seconds

Responsibilities:
  - Approve/reject account requests
  - Create user accounts
  - Send email notifications
  - Update database records

Triggers:
  - API Gateway (admin actions)
  - EventBridge (scheduled cleanup)
```

**Function 3: Image Upload Handler**
```javascript
Name: clearai-image-upload
Runtime: Node.js 20.x
Memory: 1024 MB
Timeout: 30 seconds

Responsibilities:
  - Validate image format/size
  - Generate presigned S3 URLs
  - Create database records
  - Trigger webhook processing

S3 Permissions:
  - PutObject on images bucket
  - GetObject for validation
```

**Function 4: Webhook Processor**
```javascript
Name: clearai-webhook-processor
Runtime: Node.js 20.x
Memory: 512 MB
Timeout: 60 seconds

Responsibilities:
  - Receive N8N webhook responses
  - Parse error detection results
  - Store errors in database
  - Update image status

Triggers:
  - API Gateway (webhook endpoint)
```

**Function 5: Error Query Handler**
```javascript
Name: clearai-error-query
Runtime: Node.js 20.x
Memory: 256 MB
Timeout: 10 seconds

Responsibilities:
  - Fetch image analysis results
  - Format error data
  - Return to frontend
```

**Lambda Layer (Shared Dependencies):**
```
Name: clearai-common-layer
Contents:
  - node_modules/pg (PostgreSQL client)
  - node_modules/aws-sdk
  - node_modules/jsonwebtoken
  - Shared utility functions
```

**Benefits:**
- Pay only for execution time
- Auto-scaling
- No server management
- Cost: $0.20 per 1M requests + compute time

---

### 3.4 Database

#### **Amazon RDS PostgreSQL**

**Configuration:**
```
Instance Class: db.t4g.micro (for development)
              db.t4g.small (for production)
Engine: PostgreSQL 15.x
Storage: 20 GB SSD (auto-scaling enabled)
Multi-AZ: Yes (for production)
Backup: Automated daily backups (7-day retention)

Database Name: clearai_db

Tables:
  - profiles (user accounts)
  - account_requests (pending approvals)
  - images (uploaded images metadata)
  - errors (detected errors)
  - user_sessions (active sessions)

Security:
  - VPC isolation
  - Security group (Lambda access only)
  - Encrypted at rest (KMS)
  - Encrypted in transit (SSL)
  - No public access
```

**Connection Pooling:**
```
Use RDS Proxy for Lambda connections:
  - Reduces connection overhead
  - Manages connection pooling
  - Improves performance
  - Cost: $0.015/hour per vCPU
```

**Benefits:**
- Managed service
- Automatic backups
- High availability (Multi-AZ)
- Cost: ~$15-30/month (t4g.micro)

---

### 3.5 Image Storage

#### **Amazon S3 (Images Bucket)**

**Configuration:**
```
Bucket Name: clearai-images-prod
Purpose: User-uploaded images

Folder Structure:
  /uploads/{userId}/{timestamp}.{ext}
  /processed/{imageId}/{timestamp}.{ext}

Settings:
  - Versioning: Disabled
  - Lifecycle Rules:
    * Move to S3 Intelligent-Tiering after 30 days
    * Delete after 1 year (configurable)
  - Encryption: AES-256
  - Public Access: Blocked
  - CORS: Enabled for frontend domain

Access Control:
  - Lambda functions: PutObject, GetObject
  - CloudFront: GetObject (via OAI)
  - Users: Presigned URLs only
```

**Benefits:**
- Unlimited storage
- 99.999999999% durability
- Automatic tiering for cost optimization
- Cost: $0.023/GB/month

---

### 3.6 Authentication

#### **Amazon Cognito (Custom Authentication)**

**Configuration:**
```
User Pool: clearai-users
Purpose: Custom authentication (no social providers)

Settings:
  - Sign-in: Email only
  - Password Policy:
    * Minimum 8 characters
    * Require uppercase, lowercase, numbers
  - MFA: Optional (SMS or TOTP)
  - Email Verification: Required
  
Custom Attributes:
  - approval_status (pending/approved/rejected)
  - approved_by (admin user ID)
  - approved_at (timestamp)

Lambda Triggers:
  - Pre-signup: Block direct signup
  - Post-authentication: Check approval status
  - Pre-token-generation: Add custom claims
```

**Alternative: Custom JWT Authentication**
```
If Cognito is too complex, implement custom JWT:
  - Lambda generates JWT tokens
  - Store refresh tokens in database
  - Validate tokens in API Gateway authorizer
  - More control, but more code to maintain
```

**Benefits:**
- Managed authentication service
- Built-in security features
- Token management
- Cost: Free for first 50,000 MAUs

---

### 3.7 Email Notifications

#### **Amazon SES (Simple Email Service)**

**Configuration:**
```
Verified Domains: clearai.com
Verified Emails:
  - noreply@clearai.com (sender)
  - Dmanopla91@gmail.com (admin)
  - sahilcharandwary@gmail.com (admin)

Email Templates:
  1. Account Request Notification (to admins)
  2. Account Approved (to user)
  3. Account Rejected (to user)

Settings:
  - Production access (out of sandbox)
  - DKIM authentication
  - SPF records
  - Bounce/complaint handling
```

**Email Template Example:**
```html
Subject: New Account Request - ClearAI

Dear Administrator,

A new account request has been submitted:

Name: {{full_name}}
Email: {{email}}
Reason: {{message}}
Requested: {{created_at}}

Please review and approve/reject:
{{admin_dashboard_url}}

Best regards,
ClearAI System
```

**Benefits:**
- Reliable email delivery
- High deliverability rates
- Cost: $0.10 per 1,000 emails

---

### 3.8 Secrets Management

#### **AWS Secrets Manager**

**Stored Secrets:**
```
1. clearai/db/credentials
   {
     "username": "clearai_admin",
     "password": "***",
     "host": "clearai-db.xxx.rds.amazonaws.com",
     "port": 5432,
     "database": "clearai_db"
   }

2. clearai/jwt/secret
   {
     "secret": "***",
     "algorithm": "HS256"
   }

3. clearai/webhook/config
   {
     "n8n_url": "https://n8n.example.com/webhook/***",
     "api_key": "***"
   }

4. clearai/admin/emails
   {
     "emails": [
       "Dmanopla91@gmail.com",
       "sahilcharandwary@gmail.com"
     ]
   }
```

**Rotation:**
- Database credentials: Auto-rotate every 90 days
- JWT secret: Manual rotation
- Webhook keys: Manual rotation

**Benefits:**
- Encrypted storage
- Automatic rotation
- Audit logging
- Cost: $0.40/secret/month

---

### 3.9 Monitoring & Logging

#### **Amazon CloudWatch**

**Log Groups:**
```
/aws/lambda/clearai-auth-handler
/aws/lambda/clearai-account-manager
/aws/lambda/clearai-image-upload
/aws/lambda/clearai-webhook-processor
/aws/lambda/clearai-error-query
/aws/apigateway/clearai-api
/aws/rds/clearai-db
```

**Metrics & Alarms:**
```
1. API Gateway:
   - 4xx/5xx error rates
   - Latency (p50, p95, p99)
   - Request count

2. Lambda:
   - Invocation count
   - Error count
   - Duration
   - Concurrent executions

3. RDS:
   - CPU utilization
   - Database connections
   - Storage space
   - Read/write latency

4. S3:
   - Request count
   - 4xx/5xx errors
   - Bytes downloaded/uploaded

Alarms:
  - Error rate > 5%: Email to admins
  - API latency > 2s: Email to admins
  - RDS CPU > 80%: Email to admins
  - Lambda errors: Email to admins
```

**CloudWatch Dashboards:**
```
Dashboard: ClearAI-Production
Widgets:
  - API request count (last 24h)
  - Error rates by endpoint
  - Lambda execution times
  - Database connections
  - S3 storage usage
  - Active user sessions
```

**Benefits:**
- Centralized logging
- Real-time monitoring
- Custom dashboards
- Cost: $0.50/GB ingested + $0.03/GB stored

---

### 3.10 Security

#### **AWS WAF (Web Application Firewall)**

**Configuration:**
```
Web ACL: clearai-waf
Associated with: CloudFront distribution

Rules:
  1. Rate Limiting:
     - 2000 requests per 5 minutes per IP
     
  2. Geo Blocking (optional):
     - Allow specific countries only
     
  3. SQL Injection Protection:
     - Block common SQL injection patterns
     
  4. XSS Protection:
     - Block cross-site scripting attempts
     
  5. Known Bad IPs:
     - Block IPs from threat intelligence feeds
     
  6. Custom Rules:
     - Block requests without proper headers
     - Validate request sizes
```

**Benefits:**
- DDoS protection
- Bot mitigation
- Custom security rules
- Cost: $5/month + $1 per million requests

---

## 4. Authentication Workflow

### 4.1 Account Request Flow

```
┌─────────────┐
│   User      │
│ (Browser)   │
└──────┬──────┘
       │
       │ 1. Fill request form
       │    (name, email, password, reason)
       ▼
┌──────────────────┐
│  CloudFront/S3   │
│  (React App)     │
└──────┬───────────┘
       │
       │ 2. POST /api/auth/request-account
       ▼
┌──────────────────┐
│  API Gateway     │
│  (Validation)    │
└──────┬───────────┘
       │
       │ 3. Invoke Lambda
       ▼
┌──────────────────────────┐
│  Lambda: Auth Handler    │
│  - Validate email format │
│  - Hash password         │
│  - Check duplicates      │
└──────┬───────────────────┘
       │
       │ 4. Insert request
       ▼
┌──────────────────┐
│  RDS PostgreSQL  │
│  account_requests│
│  status='pending'│
└──────┬───────────┘
       │
       │ 5. Trigger notification
       ▼
┌──────────────────────────┐
│  Lambda: Email Sender    │
│  - Get admin emails      │
│  - Format email          │
└──────┬───────────────────┘
       │
       │ 6. Send email
       ▼
┌──────────────────┐
│  Amazon SES      │
│  To: Admins      │
│  Subject: New    │
│  Account Request │
└──────────────────┘
```

### 4.2 Admin Approval Flow

```
┌─────────────┐
│   Admin     │
│ (Browser)   │
└──────┬──────┘
       │
       │ 1. Login to admin dashboard
       ▼
┌──────────────────┐
│  Admin Dashboard │
│  - View requests │
│  - Click Approve │
└──────┬───────────┘
       │
       │ 2. POST /api/admin/approve/{requestId}
       ▼
┌──────────────────┐
│  API Gateway     │
│  (Auth check)    │
└──────┬───────────┘
       │
       │ 3. Invoke Lambda
       ▼
┌────────────────────────────┐
│  Lambda: Account Manager   │
│  - Verify admin role       │
│  - Get request details     │
│  - Create Cognito user     │
│  - Create profile record   │
└──────┬─────────────────────┘
       │
       │ 4. Create user
       ▼
┌──────────────────┐
│  Cognito         │
│  User Pool       │
└──────┬───────────┘
       │
       │ 5. Create profile
       ▼
┌──────────────────┐
│  RDS PostgreSQL  │
│  profiles        │
│  status=approved │
└──────┬───────────┘
       │
       │ 6. Update request
       ▼
┌──────────────────┐
│  RDS PostgreSQL  │
│  account_requests│
│  status=approved │
└──────┬───────────┘
       │
       │ 7. Send notification
       ▼
┌──────────────────┐
│  Amazon SES      │
│  To: User        │
│  Subject: Account│
│  Approved        │
└──────────────────┘
```

### 4.3 User Login Flow

```
┌─────────────┐
│   User      │
│ (Browser)   │
└──────┬──────┘
       │
       │ 1. Enter email/password
       ▼
┌──────────────────┐
│  CloudFront/S3   │
│  (React App)     │
└──────┬───────────┘
       │
       │ 2. POST /api/auth/login
       ▼
┌──────────────────┐
│  API Gateway     │
└──────┬───────────┘
       │
       │ 3. Invoke Lambda
       ▼
┌────────────────────────────┐
│  Lambda: Auth Handler      │
│  - Validate credentials    │
│  - Check approval status   │
│  - Generate JWT token      │
└──────┬─────────────────────┘
       │
       │ 4. Verify user
       ▼
┌──────────────────┐
│  Cognito         │
│  (or custom JWT) │
└──────┬───────────┘
       │
       │ 5. Check approval
       ▼
┌──────────────────┐
│  RDS PostgreSQL  │
│  profiles        │
│  approval_status │
└──────┬───────────┘
       │
       │ 6. Return token
       │    (if approved)
       ▼
┌──────────────────┐
│  User (Browser)  │
│  Store token     │
│  Redirect to     │
│  Dashboard       │
└──────────────────┘
```

---

## 5. Image Processing Workflow

### 5.1 Image Upload & Analysis

```
┌─────────────┐
│   User      │
│ (Browser)   │
└──────┬──────┘
       │
       │ 1. Select image file
       │    (drag & drop or button)
       ▼
┌──────────────────┐
│  React App       │
│  - Validate size │
│  - Validate type │
└──────┬───────────┘
       │
       │ 2. POST /api/images/upload
       │    (with file metadata)
       ▼
┌──────────────────┐
│  API Gateway     │
└──────┬───────────┘
       │
       │ 3. Invoke Lambda
       ▼
┌────────────────────────────┐
│  Lambda: Image Upload      │
│  - Validate file           │
│  - Generate S3 presigned   │
│  - Create DB record        │
└──────┬─────────────────────┘
       │
       │ 4. Upload to S3
       ▼
┌──────────────────┐
│  S3 Images       │
│  /uploads/...    │
└──────┬───────────┘
       │
       │ 5. S3 Event Trigger
       ▼
┌────────────────────────────┐
│  Lambda: Webhook Trigger   │
│  - Get image URL           │
│  - Call N8N webhook        │
└──────┬─────────────────────┘
       │
       │ 6. POST to N8N
       │    {imageUrl, imageId}
       ▼
┌──────────────────┐
│  N8N Workflow    │
│  - Download image│
│  - AI analysis   │
│  - Detect errors │
└──────┬───────────┘
       │
       │ 7. Webhook callback
       │    POST /api/webhook/process-image
       │    {imageId, errors[]}
       ▼
┌────────────────────────────┐
│  Lambda: Webhook Processor │
│  - Parse results           │
│  - Store errors            │
│  - Update status           │
└──────┬─────────────────────┘
       │
       │ 8. Store results
       ▼
┌──────────────────┐
│  RDS PostgreSQL  │
│  images (status) │
│  errors (list)   │
└──────────────────┘
```

### 5.2 Results Display

```
┌─────────────┐
│   User      │
│ (Browser)   │
└──────┬──────┘
       │
       │ 1. Navigate to /analyze/{imageId}
       ▼
┌──────────────────┐
│  React App       │
│  Analysis Page   │
└──────┬───────────┘
       │
       │ 2. GET /api/images/{imageId}
       │    GET /api/errors/{imageId}
       ▼
┌──────────────────┐
│  API Gateway     │
└──────┬───────────┘
       │
       │ 3. Invoke Lambda
       ▼
┌────────────────────────────┐
│  Lambda: Error Query       │
│  - Fetch image data        │
│  - Fetch errors            │
│  - Format response         │
└──────┬─────────────────────┘
       │
       │ 4. Query database
       ▼
┌──────────────────┐
│  RDS PostgreSQL  │
│  images + errors │
└──────┬───────────┘
       │
       │ 5. Return data
       │    {
       │      image: {...},
       │      errors: [
       │        {type, description, location}
       │      ]
       │    }
       ▼
┌──────────────────┐
│  React App       │
│  Display Table:  │
│  ERROR | TYPE |  │
│  DESC  | LOC   │
└──────────────────┘
```

---

## 6. Security Considerations

### 6.1 Data Protection

**Encryption at Rest:**
- RDS: AWS KMS encryption
- S3: AES-256 encryption
- Secrets Manager: KMS encryption
- EBS volumes: Encrypted

**Encryption in Transit:**
- HTTPS only (TLS 1.2+)
- RDS connections: SSL/TLS
- API Gateway: HTTPS enforced
- CloudFront: HTTPS redirect

### 6.2 Access Control

**IAM Roles & Policies:**
```
1. Lambda Execution Role:
   - RDS: Connect, query
   - S3: PutObject, GetObject
   - Secrets Manager: GetSecretValue
   - SES: SendEmail
   - CloudWatch: PutLogEvents

2. API Gateway Role:
   - Lambda: InvokeFunction

3. CloudFront Role:
   - S3: GetObject (via OAI)

4. Admin Users (IAM):
   - Full access to all resources
   - MFA required
   - Source code access via CodeCommit
```

**Network Security:**
```
VPC Configuration:
  - Private subnets for RDS
  - NAT Gateway for Lambda internet access
  - Security groups:
    * Lambda → RDS: Port 5432
    * Lambda → Internet: Port 443
    * RDS: No public access
```

### 6.3 Authentication Security

**Password Policy:**
- Minimum 8 characters
- Uppercase + lowercase + numbers
- No common passwords
- Hashed with bcrypt (cost factor 12)

**JWT Tokens:**
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days)
- Stored securely (httpOnly cookies)
- Signed with HS256 algorithm

**Session Management:**
- Track active sessions in database
- Automatic cleanup of expired sessions
- Force logout on password change
- Admin can revoke user sessions

### 6.4 API Security

**Rate Limiting:**
- API Gateway: 1000 requests/minute per IP
- WAF: 2000 requests per 5 minutes per IP
- Lambda concurrency limits

**Input Validation:**
- API Gateway request validation
- Lambda input sanitization
- SQL injection prevention (parameterized queries)
- XSS prevention (output encoding)

**CORS Configuration:**
```javascript
{
  "AllowOrigins": ["https://app.clearai.com"],
  "AllowMethods": ["GET", "POST", "PUT", "DELETE"],
  "AllowHeaders": ["Content-Type", "Authorization"],
  "MaxAge": 3600
}
```

### 6.5 Compliance & Auditing

**CloudTrail:**
- Log all API calls
- Track user actions
- Monitor admin activities
- Retain logs for 90 days

**CloudWatch Logs:**
- Application logs
- Error tracking
- Performance metrics
- Security events

**Compliance:**
- GDPR: Data deletion on request
- CCPA: Data export capability
- SOC 2: Audit logging
- HIPAA: Not required (no health data)

---

## 7. Scalability & Performance

### 7.1 Auto-Scaling Configuration

**Lambda:**
- Concurrent executions: 1000 (default)
- Reserved concurrency: 100 (for critical functions)
- Provisioned concurrency: 10 (for low latency)

**RDS:**
- Read replicas: 1-2 (for read-heavy workloads)
- Auto-scaling storage: 20 GB → 100 GB
- Connection pooling via RDS Proxy

**S3:**
- Unlimited storage
- Automatic scaling
- Transfer acceleration (optional)

**CloudFront:**
- Global edge locations
- Automatic scaling
- Origin shield (optional)

### 7.2 Performance Optimization

**Caching Strategy:**
```
1. CloudFront:
   - Static assets: 1 year
   - HTML: No cache
   - API responses: No cache

2. API Gateway:
   - Cache GET requests: 5 minutes
   - Cache key: User ID + request path

3. Lambda:
   - Connection pooling
   - Warm-up functions
   - Optimize cold starts

4. Database:
   - Query optimization
   - Indexes on frequently queried columns
   - Connection pooling
```

**Database Indexes:**
```sql
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_approval ON profiles(approval_status);
CREATE INDEX idx_account_requests_status ON account_requests(status);
CREATE INDEX idx_images_user_id ON images(user_id);
CREATE INDEX idx_images_status ON images(status);
CREATE INDEX idx_errors_image_id ON errors(image_id);
```

### 7.3 Load Testing

**Expected Load:**
- Concurrent users: 100-500
- Requests per second: 50-200
- Image uploads per day: 1,000-5,000
- Database queries per second: 100-500

**Load Testing Tools:**
- Apache JMeter
- AWS Load Testing Solution
- Artillery.io

**Performance Targets:**
- API response time: < 500ms (p95)
- Image upload: < 2s
- Page load time: < 2s
- Database query: < 100ms

---

## 8. Cost Estimation

### 8.1 Monthly Cost Breakdown (Production)

**Compute:**
```
Lambda:
  - 10M requests/month
  - 512 MB memory, 1s avg duration
  - Cost: $20/month

API Gateway:
  - 10M requests/month
  - Cost: $35/month
```

**Storage:**
```
S3 (Frontend):
  - 1 GB storage
  - 100 GB transfer
  - Cost: $10/month

S3 (Images):
  - 50 GB storage
  - 500 GB transfer
  - Cost: $50/month

RDS PostgreSQL:
  - db.t4g.small (2 vCPU, 2 GB RAM)
  - 20 GB storage
  - Multi-AZ
  - Cost: $60/month
```

**Networking:**
```
CloudFront:
  - 500 GB data transfer
  - 10M requests
  - Cost: $50/month

Data Transfer:
  - Inter-region: $10/month
```

**Security & Monitoring:**
```
WAF:
  - Web ACL + rules
  - Cost: $10/month

Secrets Manager:
  - 5 secrets
  - Cost: $2/month

CloudWatch:
  - Logs + metrics
  - Cost: $15/month
```

**Email:**
```
SES:
  - 10,000 emails/month
  - Cost: $1/month
```

**Authentication:**
```
Cognito:
  - 1,000 MAUs
  - Cost: Free (under 50,000)
```

**Total Monthly Cost: ~$263/month**

### 8.2 Cost Optimization Strategies

1. **Use Reserved Instances:**
   - RDS Reserved: Save 40-60%
   - Cost: $35/month (instead of $60)

2. **S3 Intelligent-Tiering:**
   - Automatic cost optimization
   - Save 30-50% on storage

3. **Lambda Optimization:**
   - Reduce memory allocation
   - Optimize code for faster execution
   - Use Lambda layers for shared code

4. **CloudFront Optimization:**
   - Increase cache hit ratio
   - Use origin shield
   - Compress responses

5. **Database Optimization:**
   - Use read replicas for read-heavy workloads
   - Optimize queries
   - Use connection pooling

**Optimized Monthly Cost: ~$180/month**

### 8.3 Cost Scaling

**Low Traffic (< 1,000 users):**
- Monthly cost: $100-150

**Medium Traffic (1,000-10,000 users):**
- Monthly cost: $200-400

**High Traffic (10,000-100,000 users):**
- Monthly cost: $500-1,500

---

## 9. Deployment Strategy

### 9.1 Infrastructure as Code (IaC)

**AWS CloudFormation / Terraform:**
```
Repository Structure:
  /infrastructure
    /cloudformation
      - frontend.yaml (S3 + CloudFront)
      - api.yaml (API Gateway + Lambda)
      - database.yaml (RDS)
      - security.yaml (WAF + Secrets)
    /terraform
      - main.tf
      - variables.tf
      - outputs.tf
```

**Benefits:**
- Version-controlled infrastructure
- Repeatable deployments
- Easy rollback
- Multi-environment support

### 9.2 CI/CD Pipeline

**AWS CodePipeline:**
```
Pipeline Stages:

1. Source:
   - CodeCommit repository
   - Trigger on commit to main branch

2. Build:
   - CodeBuild
   - Install dependencies
   - Run tests
   - Build React app
   - Package Lambda functions

3. Test:
   - Run unit tests
   - Run integration tests
   - Security scanning

4. Deploy:
   - Deploy to staging environment
   - Run smoke tests
   - Manual approval
   - Deploy to production

5. Post-Deploy:
   - Run health checks
   - Monitor metrics
   - Send notifications
```

**Alternative: GitHub Actions:**
```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
      - name: Build frontend
        run: npm run build
      - name: Deploy to S3
        run: aws s3 sync build/ s3://clearai-frontend-prod
      - name: Invalidate CloudFront
        run: aws cloudfront create-invalidation
      - name: Deploy Lambda functions
        run: ./deploy-lambda.sh
```

### 9.3 Environment Strategy

**Environments:**
```
1. Development:
   - Local development
   - Docker containers
   - LocalStack for AWS services

2. Staging:
   - AWS account (separate)
   - Smaller instance sizes
   - Test data

3. Production:
   - AWS account (separate)
   - Full-size instances
   - Real data
   - Multi-AZ
```

### 9.4 Rollback Strategy

**Automated Rollback:**
- CloudWatch alarms trigger rollback
- Error rate > 5%
- Latency > 2s

**Manual Rollback:**
- Admin dashboard
- One-click rollback
- Restore previous version

**Database Rollback:**
- Automated backups
- Point-in-time recovery
- Manual restore if needed

---

## 10. Monitoring & Maintenance

### 10.1 Monitoring Dashboard

**CloudWatch Dashboard:**
```
Widgets:
  1. API Health:
     - Request count
     - Error rate
     - Latency (p50, p95, p99)

  2. Lambda Performance:
     - Invocation count
     - Error count
     - Duration
     - Throttles

  3. Database Metrics:
     - CPU utilization
     - Connections
     - Read/write IOPS
     - Storage space

  4. User Activity:
     - Active users
     - New registrations
     - Account requests
     - Images processed

  5. Cost Tracking:
     - Daily spend
     - Service breakdown
     - Budget alerts
```

### 10.2 Alerting

**Critical Alerts (PagerDuty/Email):**
- API error rate > 5%
- Database CPU > 90%
- Lambda errors > 10/minute
- RDS storage < 10%

**Warning Alerts (Email):**
- API latency > 1s
- Database connections > 80%
- Lambda duration > 5s
- Cost > budget

**Info Alerts (Slack):**
- New account requests
- Deployments
- Scheduled maintenance

### 10.3 Maintenance Tasks

**Daily:**
- Check CloudWatch dashboards
- Review error logs
- Monitor costs

**Weekly:**
- Review security logs
- Check backup status
- Analyze performance trends
- Review account requests

**Monthly:**
- Update dependencies
- Security patches
- Cost optimization review
- Capacity planning

**Quarterly:**
- Disaster recovery drill
- Security audit
- Performance testing
- Architecture review

### 10.4 Backup & Disaster Recovery

**Backup Strategy:**
```
RDS:
  - Automated daily backups
  - 7-day retention
  - Manual snapshots before major changes

S3:
  - Versioning enabled
  - Cross-region replication (optional)
  - Lifecycle policies

Code:
  - Git repository
  - CodeCommit backup
  - GitHub mirror
```

**Disaster Recovery:**
```
RTO (Recovery Time Objective): 4 hours
RPO (Recovery Point Objective): 1 hour

Procedures:
  1. Database failure:
     - Restore from latest snapshot
     - Point-in-time recovery
     - Failover to read replica

  2. Region failure:
     - Failover to secondary region
     - Update DNS records
     - Restore from backups

  3. Data corruption:
     - Restore from backup
     - Replay transactions
     - Validate data integrity
```

---

## 11. Source Code Access

### 11.1 Repository Structure

**AWS CodeCommit:**
```
Repository: clearai-platform

Structure:
  /frontend
    /src
    /public
    package.json
    
  /backend
    /lambda
      /auth-handler
      /account-manager
      /image-upload
      /webhook-processor
      /error-query
    /layers
      /common
    
  /infrastructure
    /cloudformation
    /terraform
    
  /docs
    README.md
    DEPLOYMENT.md
    API.md
    
  .gitignore
  .env.example
```

### 11.2 Admin Access

**IAM User for Administrators:**
```
Username: admin@clearai.com
Permissions:
  - Full access to CodeCommit
  - Read access to all AWS resources
  - Write access to Lambda functions
  - CloudWatch Logs access
  
MFA: Required
Access Keys: Provided securely
```

**Local Development:**
```bash
# Clone repository
git clone https://git-codecommit.us-east-1.amazonaws.com/v1/repos/clearai-platform

# Install dependencies
cd frontend && npm install
cd backend && npm install

# Run locally
npm run dev

# Deploy
npm run deploy
```

### 11.3 Documentation

**Provided Documentation:**
- Architecture overview
- API documentation
- Deployment guide
- Troubleshooting guide
- Security best practices
- Cost optimization guide

---

## 12. Migration from Current Setup

### 12.1 Current State (Supabase)

**Current Stack:**
- Frontend: React + Vite
- Backend: Supabase (PostgreSQL + Auth + Storage)
- Hosting: Supabase hosting

### 12.2 Migration Steps

**Phase 1: Preparation (Week 1)**
1. Set up AWS account
2. Create IAM users and roles
3. Set up VPC and networking
4. Create RDS instance
5. Set up S3 buckets

**Phase 2: Database Migration (Week 2)**
1. Export Supabase database
2. Import to RDS PostgreSQL
3. Verify data integrity
4. Set up replication (optional)

**Phase 3: Backend Migration (Week 3)**
1. Convert Supabase functions to Lambda
2. Set up API Gateway
3. Migrate authentication to Cognito
4. Test all endpoints

**Phase 4: Frontend Migration (Week 4)**
1. Update API endpoints
2. Update authentication flow
3. Deploy to S3 + CloudFront
4. Test all features

**Phase 5: Cutover (Week 5)**
1. Final data sync
2. Update DNS records
3. Monitor closely
4. Decommission Supabase

---

## 13. Conclusion

This AWS architecture provides a robust, scalable, and cost-effective solution for the ClearAI Image Text Error Detection platform. Key benefits include:

✅ **Scalability:** Auto-scaling at every layer  
✅ **Security:** Multiple layers of protection  
✅ **Cost-Effective:** Pay only for what you use  
✅ **Reliability:** 99.99% uptime SLA  
✅ **Performance:** Global CDN, low latency  
✅ **Maintainability:** Managed services, minimal ops  
✅ **Source Code Access:** Full control for admins  

**Next Steps:**
1. Review and approve architecture
2. Set up AWS account
3. Begin infrastructure deployment
4. Migrate application
5. Go live!

---

**Document Prepared By:** ClearAI Development Team  
**Contact:** admin@clearai.com  
**Date:** November 7, 2025  
**Version:** 1.0
