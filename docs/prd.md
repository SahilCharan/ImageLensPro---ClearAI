# ClearAI Image Text Error Detection Application Requirements Document

##1. Application Overview
### 1.1 Application Name
ClearAI 'Image Text Error Detection'\n
### 1.2 Application Description
A clean, minimalist AI-powered web application for detecting and analyzing text errors in images. The platform provides streamlined image processing with tabular results display, hosted entirely on AWS infrastructure.

### 1.3 Core Functionality
- Custom user authentication system with system-generated passwords
- Administrator approval workflow for new accounts and password recovery (manual approval only)
- Forgot password functionality with admin notification system
- Image upload and processing (drag-and-drop + file button)
- AI-powered text error detection and analysis
- Clean tabular results display\n- Administrator dashboard for user management
- Batch user account creation capability

## 2. AWS Technical Architecture
### 2.1 Recommended AWS Services Architecture
**Frontend Hosting:**
- Amazon S3: Static website hosting for React.js application
- Amazon CloudFront: CDN for global content delivery and performance\n\n**Backend Services:**
- AWS API Gateway: RESTful API endpoints management
- AWS Lambda: Serverless functions for business logic
- Amazon Cognito: Custom user pool management (without third-party providers)
\n**Database & Storage:**
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
- AWS IAM: Role-based access control\n- Amazon CloudWatch: Logging and monitoring
- AWS WAF: Web application firewall protection

### 2.2 Architecture Workflow
**User Registration Flow:**
1. User submits account request via frontend form
2. API Gateway → Lambda function generates system password and stores request in DynamoDB
3. Amazon SES sends email notification to administrators: Dmanopla91@gmail.com and sahilcharandwary@gmail.com
4. Administrator reviews request in admin dashboard (manual approval only - no automatic approval)
5. Admin approves/rejects via dashboard → updates DynamoDB user status
6. Amazon SES sends confirmation email to user upon approval with system-generated password\n
**Forgot Password Flow:**\n1. User enters email address on forgot password page
2. System verifies email existence in DynamoDB user database
3. If email not found: Display message'Email not found. Please create an account to use our features.'
4. If email exists: Generate admin notification with Accept/Reject buttons
5. Administrator receives email notification for password recovery request
6. Admin clicks Accept → System sends user's existing system-generated password via email
7. Admin clicks Reject → User receives rejection notification

**Image Processing Flow:**
1. User uploads image → S3 bucket storage
2. Lambda function triggered → processes image with Textract\n3. Custom error detection algorithm analyzes extracted text
4. Results stored in DynamoDB and returned to frontend
5. Clean table display with ERROR, TYPE, DESCRIPTION, LOCATION columns

## 3. Authentication System
### 3.1 System-Generated Password Management
- JavaScript function for automatic password generation (fixed, random passwords)
- Users cannot set or modify their own passwords
- Same password used for initial login and password recovery\n- Secure password storage with encryption in DynamoDB
\n### 3.2 Forgot Password Implementation
- 'Forgot Password' link on login interface
- Email verification against user database
- Admin notification system with Accept/Reject functionality
- Automated password dispatch upon admin approval

### 3.3 Administrator Dashboard
- Secure admin login with elevated privileges
- Account request review and approval interface (manual approval required)
- Password recovery request management with Accept/Reject buttons
- Batch user account creation functionality\n- User management and monitoring tools
- Processing history and analytics\n
### 3.4 Administrator Email Configuration
**Primary Administrator Emails:**
- Dmanopla91@gmail.com\n- sahilcharandwary@gmail.com (updated for sahil login account)

**Email Notification Types:**
- New user registration requests
- Password recovery requests with Accept/Reject buttons
- Account approval confirmations
- System alerts and monitoring notifications
- Processing error notifications

## 4. User Interface Design
### 4.1 Login & Registration Pages
- Clean login form with username/password fields
- 'Forgot Password' link with email verification interface
- 'Create Account' link leading to registration form
- Registration form for credential submission
- Account pending approval status page with clear messaging about manual review process
- Email not found error message display

### 4.2 Main Application Page
**Image Input Section:**
- Prominent drag-and-drop area for image upload
- Traditional file upload button as alternative
- Support for common image formats (JPG, PNG, GIF)
\n**Processing Control:**
- Single, clear'Process' button to initiate analysis
- Processing status indicators\n\n**Results Display:**
- Clean, well-structured table with columns:\n  - ERROR: Detected error text
  - TYPE: Error category (spelling, grammar, spacing, etc.)
  - DESCRIPTION: Detailed error explanation
  - LOCATION: Position coordinates in image
- Minimal yet highly readable design
- Export functionality for results

## 5. Design Style & Branding
### 5.1 Logo Integration
- Incorporate provided logo file (image.png) into application header
- Color scheme coordination based on logo theme
- Consistent branding across all pages

### 5.2 Visual Design\n- Clean, minimalist aesthetic throughout
- Color scheme: Coordinated with ClearAI logo (dark gray #4a5568, mint green #81e6d9, light blue #90cdf4)
- Modern card-based layout with subtle shadows
- Rounded corners (6px radius) for contemporary feel
- Clean typography with proper hierarchy\n- Minimal visual distractions to maintain focus on core functionality

### 5.3 Layout Structure
- Responsive grid system for different screen sizes
- Fixed container dimensions for consistent image display
- Streamlined navigation with essential functions only
- Table-based results layout with clear column headers
\n## 6. Email System Configuration
### 6.1 Amazon SES Setup
- Configure SES for sending emails from verified domain
- Set up email templates for user notifications and admin actions
- Configure bounce and complaint handling
- Implement email delivery tracking

### 6.2 Administrator Notification System
- Immediate email alerts to both administrator addresses upon new user registration
- Password recovery request emails with Accept/Reject action buttons
- Daily digest emails with pending approval summary
- System health and error notifications
- Processing volume and usage statistics

### 6.3 User Communication
- Welcome email upon account approval with system-generated password\n- Account rejection notification with reason
- Password dispatch email upon admin approval of forgot password request
- Email not found notification for invalid recovery attempts
- Processing completion notifications

### 6.4 Email Templates
**Admin Password Recovery Notification:**
- Subject: Password Recovery Request for [User Email]
- Content: User [email] has requested password recovery
- Action Buttons: 'Accept' and 'Reject' with direct links to admin dashboard
\n**User Password Dispatch Email:**
- Subject: Your ClearAI Account Password
- Content: Your system-generated password for login access
- Password: [System-Generated Password]

## 7. Security & Scalability Considerations
### 7.1 Security Measures
- AWS WAF protection against common web attacks
- IAM roles with least privilege access
- Encrypted data storage in DynamoDB and S3
- Secure JWT token implementation\n- Input validation and sanitization\n- Secure password generation and storage
\n### 7.2 Scalability Features
- Serverless Lambda functions for automatic scaling
- CloudFront CDN for global performance
- DynamoDB auto-scaling capabilities
- S3 lifecycle policies for cost optimization\n- SQS queuing for handling processing load spikes
\n## 8. Administrator Access & Code Oversight
### 8.1 Source Code Access
- Complete source code repository access for administrator
- AWS CodeCommit or GitHub integration for version control
- Documentation for customization and maintenance
- Deployment scripts and infrastructure as code (CloudFormation/CDK)

### 8.2 Monitoring & Analytics
- CloudWatch dashboards for application performance\n- User activity tracking and processing statistics
- Error logging and debugging capabilities
- Cost monitoring and optimization recommendations\n\n## 9. Technical Implementation Specifications
### 9.1 Password Generation Function
```javascript\n// System password generation function
function generateSystemPassword() {
const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
}\n```
\n### 9.2 User Account Updates
- Update sahil login account email to: sahilcharandwary@gmail.com
- Maintain existing system-generated password for continuity
- Update admin notification routing accordingly

## Reference Files
1. Research Report: ./workspace/app-7dzvb2e20qgx/docs/report.md
2. Logo File: image.png (ClearAI branding logo for integration)