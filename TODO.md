# ClearAI Refinement Implementation Plan

## Overview
Transform ImageLens Pro into ClearAI - Image Text Error Detection with admin-approved authentication and AWS architecture.

## Phase 1: Branding & Design System ✓
- [ ] Download and integrate ClearAI logo
- [ ] Update color scheme (dark blue #3d4152 + cyan #7dd3c0)
- [ ] Update application name throughout
- [ ] Update favicon and meta tags
- [ ] Create minimalist design tokens

## Phase 2: Authentication System Overhaul
- [ ] Remove Google OAuth completely
- [ ] Create account request system:
  - [ ] Account request form (name, email, password, message)
  - [ ] Store requests in database (pending status)
  - [ ] Email notification to admin
- [ ] Update database schema:
  - [ ] Add account_requests table
  - [ ] Add approval_status to profiles
  - [ ] Add approved_by and approved_at fields
- [ ] Modify login to check approval status
- [ ] Remove signup page, replace with request page

## Phase 3: Admin Dashboard
- [ ] Create admin dashboard page
- [ ] Account request management:
  - [ ] View pending requests
  - [ ] Approve/reject requests
  - [ ] View approved/rejected history
- [ ] Batch account creation:
  - [ ] CSV upload for multiple accounts
  - [ ] Manual form for single account creation
- [ ] User management:
  - [ ] View all users
  - [ ] Deactivate/activate accounts
  - [ ] Reset passwords

## Phase 4: Main Application Page Simplification
- [ ] Simplify upload page:
  - [ ] Clean, focused design
  - [ ] Prominent drag-and-drop area
  - [ ] Single "Process" button
  - [ ] Remove unnecessary elements
- [ ] Update results table:
  - [ ] Columns: ERROR, TYPE, DESCRIPTION, LOCATION
  - [ ] Clean, minimal design
  - [ ] High readability

## Phase 5: AWS Architecture Documentation
- [ ] Create AWS architecture proposal document
- [ ] Include:
  - [ ] Architecture diagram (text description)
  - [ ] Service breakdown
  - [ ] Authentication workflow
  - [ ] Image processing workflow
  - [ ] Security considerations
  - [ ] Scalability recommendations
  - [ ] Cost estimates

## Phase 6: Testing & Validation
- [ ] Test account request flow
- [ ] Test admin approval process
- [ ] Test login with approved accounts
- [ ] Test image processing
- [ ] Test results display
- [ ] Validate all branding changes

## Notes
- Current: Supabase (PostgreSQL, Auth, Storage)
- Target: AWS-ready architecture
- Admin email: Will be configured in environment variables
- Logo colors: Dark blue (#3d4152) + Cyan (#7dd3c0)
