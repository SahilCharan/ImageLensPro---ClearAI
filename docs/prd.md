# ClearAI Image Text Error Detection Application Requirements Document

## 1. Application Overview
### 1.1 Application Name\nClearAI 'Image Text Error Detection'

### 1.2 Application Description\nA clean, minimalist AI-powered web application for detecting and analyzing text errors in images. The platform provides streamlined image processing with tabular results display, hosted entirely on AWS infrastructure.

### 1.3 Core Functionality
- Custom user authentication system (no third-party logins)
- Administrator approval workflow for new accounts (manual approval only)
- Image upload and processing (drag-and-drop + file button)
- AI-powered text error detection and analysis
- Clean tabular results display
- Administrator dashboard for user management
- Batch user account creation capability

## 2. AWS Technical Architecture\n### 2.1 Recommended AWS Services Architecture
**Frontend Hosting:**
- Amazon S3: Static website hosting for React.js application
- Amazon CloudFront: CDN for global content delivery and performance

**Backend Services:**
- AWS API Gateway: RESTful API endpoints management\n- AWS Lambda: Serverless functions for business logic
- Amazon Cognito: Custom user pool management (without third-party providers)

**Database & Storage:**
- Amazon DynamoDB: User accounts, authentication data, and processing history
- Amazon S3: Image file storage with lifecycle policies

**Processing & AI:**
- Amazon Textract: Text extraction from images
- AWS Lambda: Custom error detection algorithms
- Amazon SQS: Queue management for image processing jobs

**Email Services:**
- Amazon SES: Email notification service for administrator alerts and user communications
- Amazon SNS: Simple notification service for real-time admin notifications

**Security & Monitoring:**
- AWS IAM: Role-based access control
- Amazon CloudWatch: Logging and monitoring
- AWS WAF: Web application firewall protection

### 2.2 Architecture Workflow
**User Registration Flow:**
1. User submits account request via frontend form
2. API Gateway → Lambda function stores request in DynamoDB\n3. Amazon SES sends email notification to administrators: Dmanopla91@gmail.com and sahilcharandwary@gmail.com
4. Administrator reviews request in admin dashboard (manual approval only - no automatic approval)
5. Admin approves/rejects via dashboard → updates DynamoDB user status
6. Amazon SES sends confirmation email to user upon approval/rejection

**Image Processing Flow:**
1. User uploads image → S3 bucket storage\n2. Lambda function triggered → processes image with Textract
3. Custom error detection algorithm analyzes extracted text
4. Results stored in DynamoDB and returned to frontend\n5. Clean table display with ERROR, TYPE, DESCRIPTION, LOCATION columns

## 3. Authentication System
### 3.1 Custom Authentication (No Third-Party)
- Username/email and password-based registration
- Administrator email notification system for new account requests
- Manual account approval workflow only (no automatic approval)
- Secure login with JWT token management
- Session management without external OAuth providers

### 3.2 Administrator Dashboard
- Secure admin login with elevated privileges
- Account request review and approval interface (manual approval required)
- Batch user account creation functionality
- User management and monitoring tools
- Processing history and analytics

### 3.3 Administrator Email Configuration
**Primary Administrator Emails:**
- Dmanopla91@gmail.com\n- sahilcharandwary@gmail.com

**Email Notification Types:**
- New user registration requests
- Account approval confirmations
- System alerts and monitoring notifications
- Processing error notifications

## 4. User Interface Design
### 4.1 Main Application Page\n**Image Input Section:**
- Prominent drag-and-drop area for image upload
- Traditional file upload button as alternative
- Support for common image formats (JPG, PNG, GIF)
\n**Processing Control:**
- Single, clear 'Process' button to initiate analysis
- Processing status indicators

**Results Display:**
- Clean, well-structured table with columns:
  - ERROR: Detected error text\n  - TYPE: Error category (spelling, grammar, spacing, etc.)
  - DESCRIPTION: Detailed error explanation
  - LOCATION: Position coordinates in image
- Minimal yet highly readable design\n- Export functionality for results

### 4.2 Login & Registration Pages
- Clean login form with username/password fields\n- 'Create Account' link leading to registration form
- Registration form for credential submission
- Account pending approval status page with clear messaging about manual review process

## 5. Design Style & Branding
### 5.1 Logo Integration
- Incorporate provided logo file (image.png) into application header
- Color scheme coordination based on logo theme
- Consistent branding across all pages

### 5.2 Visual Design
- Clean, minimalist aesthetic throughout
- Color scheme: Coordinated with ClearAI logo (dark gray #4a5568, mint green #81e6d9, light blue #90cdf4)
- Modern card-based layout with subtle shadows
- Rounded corners (6px radius) for contemporary feel
- Clean typography with proper hierarchy
- Minimal visual distractions to maintain focus on core functionality

### 5.3 Layout Structure
- Responsive grid system for different screen sizes
- Fixed container dimensions for consistent image display
- Streamlined navigation with essential functions only
- Table-based results layout with clear column headers

## 6. Email System Configuration
### 6.1 Amazon SES Setup
- Configure SES for sending emails from verified domain
- Set up email templates for user notifications
- Configure bounce and complaint handling
- Implement email delivery tracking

### 6.2 Administrator Notification System
- Immediate email alerts to both administrator addresses upon new user registration
- Daily digest emails with pending approval summary
- System health and error notifications
- Processing volume and usage statistics

### 6.3 User Communication\n- Welcome email upon account approval
- Account rejection notification with reason
- Password reset functionality via email
- Processing completion notifications

## 7. Security & Scalability Considerations
### 7.1 Security Measures\n- AWS WAF protection against common web attacks
- IAM roles with least privilege access
- Encrypted data storage in DynamoDB and S3
- Secure JWT token implementation
- Input validation and sanitization

### 7.2 Scalability Features
- Serverless Lambda functions for automatic scaling
- CloudFront CDN for global performance
- DynamoDB auto-scaling capabilities
- S3 lifecycle policies for cost optimization
- SQS queuing for handling processing load spikes

## 8. Administrator Access & Code Oversight\n### 8.1 Source Code Access
- Complete source code repository access for administrator
- AWS CodeCommit or GitHub integration for version control
- Documentation for customization and maintenance
- Deployment scripts and infrastructure as code (CloudFormation/CDK)

### 8.2 Monitoring & Analytics
- CloudWatch dashboards for application performance
- User activity tracking and processing statistics
- Error logging and debugging capabilities
- Cost monitoring and optimization recommendations

## Reference Files
1. Research Report: ./workspace/app-7dzvb2e20qgx/docs/report.md
2. Logo File: image.png (ClearAI branding logo for integration)