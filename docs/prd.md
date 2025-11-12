# ClearAI Image Text Error Detection Application Requirements Document

## 1. Application Overview
### 1.1 Application Name
ClearAI 'Image Text Error Detection'\n
### 1.2 Application Description
A clean, minimalist AI-powered web application for detecting and analyzing text errors in images. The platform provides streamlined image processing with tabular results display, using n8n webhook automation and Supabase database for user management.\n
### 1.3 Core Functionality
- Custom user authentication system with system-generated passwords
- Administrator approval workflow via n8n webhook automation
- Forgot password functionality with webhook-based email system
- Image upload and processing (drag-and-drop + file button)
- AI-powered text error detection and analysis
- Clean tabular results display\n- Administrator dashboard for user management
- Batch user account creation capability

## 2. Technical Architecture
### 2.1 Backend Services Architecture
**Database:**
- Supabase: Primary database for user accounts, authentication data, and processing history
- User table structure: email, system_generated_password, approval_status, created_at\n\n**Webhook Automation:**
- n8n: Webhook automation platform for email workflows
- Webhook endpoints for user registration and password recovery
- Email sending automation with admin approval workflows

**Frontend Hosting:**
- Static website hosting for the web application
- Image file storage and processing
\n### 2.2 Supabase Database Configuration
**Users Table Schema:**
```sql
CREATE TABLE users (\n  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,\n  system_generated_password VARCHAR(255) NOT NULL,
  approval_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Supabase Connection Details:**
- Database URL: [To be provided by development team]
- API Key: [To be configured during setup]
- Service Role Key: [For backend operations]

### 2.3 n8n Webhook Workflows
**User Registration Workflow:**
1. Frontend sends POST request to n8n webhook with user email
2. n8n receives email data and sends notification to administrators
3. Admin receives email with approval/rejection options
4. If approved: n8n generates password using JavaScript code and saves to Supabase
5. n8n sends welcome email to user with system-generated password

**Password Recovery Workflow:**
1. User requests password recovery via frontend
2. Frontend sends POST request to n8n webhook with user email
3. n8n verifies email exists in Supabase database
4. If exists: n8n sends admin notification for password recovery approval
5. If approved: n8n fetches existing password from Supabase and emails to user
6. If rejected: n8n sends rejection notification to user

## 3. Authentication System
### 3.1 System-Generated Password Management
- JavaScript function integrated in n8n workflow for password generation
- Users cannot set or modify their own passwords
- Passwords stored securely in Supabase database
- Same password used for initial login and password recovery\n
### 3.2 n8n Webhook Integration
**Registration Webhook:**
- Endpoint: [To be provided in next phase]
- Method: POST
- Payload: {'email': 'user@example.com' }

**Password Recovery Webhook:**
- Endpoint: [To be provided in next phase]\n- Method: POST
- Payload: { 'email': 'user@example.com', 'action': 'forgot_password' }\n
### 3.3 Administrator Email Configuration
**Primary Administrator Emails:**
- Dmanopla91@gmail.com\n- sahilcharandwary@gmail.com

**Email Workflow via n8n:**\n- New user registration notifications
- Password recovery approval requests
- Account approval confirmations
- System alerts and notifications
\n## 4. User Interface Design
### 4.1 Login & Registration Pages
- Clean login form with username/password fields
- 'Forgot Password' link with email verification interface
- 'Create Account' link leading to registration form
- Registration form for credential submission
- Account pending approval status page
- Email verification and status messages

### 4.2 Main Application Page
**Image Input Section:**
- Prominent drag-and-drop area for image upload
- Traditional file upload button as alternative
- Support for common image formats (JPG, PNG, GIF)
\n**Processing Control:**
- Single, clear'Process' button to initiate analysis
- Processing status indicators
\n**Results Display:**
- Clean, well-structured table with columns:\n  - ERROR: Detected error text
  - TYPE: Error category (spelling, grammar, spacing, etc.)
  - DESCRIPTION: Detailed error explanation
  - LOCATION: Position coordinates in image
- Minimal yet highly readable design
- Export functionality for results

## 5. Design Style & Branding
### 5.1 Logo Integration
- Incorporate provided ClearAI logo (image.png) into application header
- Color scheme coordination based on logo theme
- Consistent branding across all pages

### 5.2 Visual Design
- Clean, minimalist aesthetic throughout
- Color scheme: Dark gray (#4a5568), mint green (#81e6d9), light blue (#90cdf4)
- Modern card-based layout with subtle shadows
- Rounded corners (6px radius) for contemporary feel
- Clean typography with proper hierarchy\n
## 6. Workflow Implementation
### 6.1 User Registration Flow
1. User submits registration form with email
2. Frontend sends POST request to n8n webhook
3. n8n sends email notification to administrators
4. Administrator reviews and approves/rejects via email
5. If approved: n8n generates password and saves to Supabase
6. n8n sends welcome email to user with login credentials

### 6.2 Password Recovery Flow\n1. User enters email on forgot password page
2. Frontend sends POST request to n8n webhook
3. n8n checks if email exists in Supabase
4. If exists: n8n sends admin approval request
5. If approved: n8n fetches password from Supabase and emails to user
6. If rejected: n8n sends rejection notification\n
### 6.3 Password Generation Function
```javascript\n// System password generation function for n8n
function generateSystemPassword() {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }\n  return password;\n}
```\n
## 7. Database Operations
### 7.1 Supabase Integration
- User account creation and management
- Password storage and retrieval
- Approval status tracking
- Processing history storage

### 7.2 Data Security
- Encrypted password storage in Supabase
- Secure API connections
- Input validation and sanitization\n- Access control and authentication

## 8. Administrator Dashboard
### 8.1 User Management
- View pending registration requests
- Approve/reject user accounts
- Manage password recovery requests
- Monitor user activity and processing statistics

### 8.2 System Monitoring
- Processing volume tracking
- Error logging and debugging
- Performance monitoring
- Usage analytics

## 9. Next Phase Requirements
### 9.1 Webhook Configuration
- n8n webhook URLs to be provided\n- Webhook authentication setup
- Testing and validation procedures
\n### 9.2 Supabase Setup
- Database credentials configuration
- API key management
- Connection string setup
- Security policies implementation

## Reference Files
1. Logo File: image.png (ClearAI branding logo for integration)