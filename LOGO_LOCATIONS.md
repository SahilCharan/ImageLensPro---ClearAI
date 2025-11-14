# ClearAI Logo Display Locations

## Official Logo
![ClearAI - AI Business Solutions](/public/images/clearai-logo.png)

---

## 📍 Logo Appears On:

### 🔐 Authentication Pages

#### 1. Login Page (`/login`)
```
┌─────────────────────────────────┐
│                                 │
│      [ClearAI Logo - h-12]      │
│                                 │
│       Welcome Back              │
│   Sign in to access ClearAI     │
│                                 │
│   Email: [____________]         │
│   Password: [____________]      │
│                                 │
│   [Sign In Button]              │
│                                 │
│   Don't have an account?        │
│   Request Access                │
└─────────────────────────────────┘
```

#### 2. Request Account Page (`/request-account`)
```
┌─────────────────────────────────┐
│                                 │
│      [ClearAI Logo - h-12]      │
│                                 │
│    Request Account Access       │
│   Submit a request to create    │
│      your ClearAI account       │
│                                 │
│   Full Name: [____________]     │
│   Email: [____________]         │
│   Message: [____________]       │
│                                 │
│   [Submit Request]              │
│                                 │
│   Already have an account?      │
│   Sign In                       │
└─────────────────────────────────┘
```

#### 3. Forgot Password Page (`/forgot-password`)
```
┌─────────────────────────────────┐
│                                 │
│      [ClearAI Logo - h-12]      │
│                                 │
│   [← Back to Login]             │
│                                 │
│      Forgot Password            │
│   Enter your email address      │
│                                 │
│   Email: [____________]         │
│                                 │
│   [Reset Password]              │
└─────────────────────────────────┘
```

---

### 🏠 Application Pages

#### 4. Header Navigation (All Pages)
```
┌─────────────────────────────────────────────────────────┐
│ [ClearAI Logo - h-10]    Dashboard | Process Image | 👤 │
└─────────────────────────────────────────────────────────┘
```

**Header appears on:**
- ✅ Home Page (`/`)
- ✅ Dashboard (`/dashboard`)
- ✅ Upload Page (`/upload`)
- ✅ Image Analysis (`/analysis/:id`)
- ✅ Admin Panel (`/admin`) - for admin users

---

## 📐 Logo Specifications

### Size Variations
| Location | Tailwind Class | Height | Usage |
|----------|---------------|--------|-------|
| Auth Pages | `h-12` | 48px | Login, Signup, Forgot Password |
| Header | `h-10` | 40px | Navigation bar |
| Custom | `className` prop | Variable | Flexible sizing |

### Positioning
| Location | Alignment | Container |
|----------|-----------|-----------|
| Auth Pages | Center | Card Header |
| Header | Left | Navigation Container |

### Spacing
```tsx
// Auth Pages
<div className="flex justify-center">
  <Logo className="h-12" />
</div>

// Header
<Link to="/" className="flex items-center gap-3">
  <Logo className="h-10" />
</Link>
```

---

## 🎨 Visual Consistency

### Logo Characteristics
- **Format:** PNG with transparent background
- **Colors:** Dark text with mint/blue gradient
- **Text:** "clearAI" with "AI Business Solutions" tagline
- **Style:** Modern, professional, clean

### Brand Colors
- **Primary Text:** Dark gray/charcoal (#3d4451)
- **AI Gradient:** Mint (#a8f5e5) to Light Blue (#a8d5f5)
- **Tagline:** Medium gray

---

## 🔄 Fallback Display

If the logo image fails to load, a text-based fallback appears:

```
┌──────────────────┐
│ [C] ClearAI      │
└──────────────────┘
```

**Fallback Features:**
- Letter "C" in a colored box
- "ClearAI" text next to it
- Maintains brand recognition
- Same spacing and alignment

---

## 📱 Responsive Behavior

### Desktop (≥1280px)
- Full logo display
- Standard sizing (h-10 or h-12)
- Clear and prominent

### Tablet (768px - 1279px)
- Full logo display
- Slightly smaller if needed
- Maintains readability

### Mobile (<768px)
- Logo scales proportionally
- May reduce to icon + text
- Remains recognizable

---

## ♿ Accessibility

### Alt Text
```tsx
alt="ClearAI - AI Business Solutions"
```

### Loading Priority
```tsx
loading="eager"  // Logo loads immediately
```

### Keyboard Navigation
- Header logo is focusable
- Can be accessed via Tab key
- Links to home page

---

## 🧪 Testing Checklist

### Visual Tests
- [ ] Logo displays correctly on Login page
- [ ] Logo displays correctly on Request Account page
- [ ] Logo displays correctly on Forgot Password page
- [ ] Logo displays correctly in Header
- [ ] Logo maintains aspect ratio
- [ ] Logo is clear and readable
- [ ] Fallback works if image fails

### Functional Tests
- [ ] Header logo links to home page
- [ ] Logo loads without console errors
- [ ] Logo displays on all screen sizes
- [ ] Favicon appears in browser tab
- [ ] Alt text is present for screen readers

### Browser Tests
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## 📂 File Locations

```
Project Root
├── public/
│   └── images/
│       └── clearai-logo.png          ← Official logo file
│
├── src/
│   ├── components/
│   │   └── common/
│   │       ├── Logo.tsx              ← Logo component
│   │       └── Header.tsx            ← Uses Logo
│   │
│   └── pages/
│       ├── Login.tsx                 ← Uses Logo
│       ├── RequestAccount.tsx        ← Uses Logo
│       └── ForgotPassword.tsx        ← Uses Logo
│
└── index.html                        ← Favicon reference
```

---

## 🔧 Implementation Details

### Logo Component
**File:** `src/components/common/Logo.tsx`

```tsx
import { useState } from 'react';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = 'h-12' }: LogoProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    // Fallback to text logo
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
          <span className="text-2xl font-bold text-primary-foreground">C</span>
        </div>
        <span className="text-2xl font-bold text-primary">ClearAI</span>
      </div>
    );
  }

  return (
    <img
      src="/images/clearai-logo.png"
      alt="ClearAI - AI Business Solutions"
      className={className}
      onError={() => setImageError(true)}
      loading="eager"
    />
  );
}
```

### Usage Examples

#### Basic Usage
```tsx
import Logo from '@/components/common/Logo';

<Logo />  // Default h-12
```

#### Custom Size
```tsx
<Logo className="h-8" />   // Smaller
<Logo className="h-16" />  // Larger
```

#### With Link
```tsx
<Link to="/">
  <Logo className="h-10" />
</Link>
```

#### Centered
```tsx
<div className="flex justify-center">
  <Logo className="h-12" />
</div>
```

---

## 📊 Summary

### Total Logo Instances: 8

| Page/Component | Count | Size |
|----------------|-------|------|
| Login | 1 | h-12 |
| Request Account | 1 | h-12 |
| Forgot Password | 1 | h-12 |
| Header (Dashboard) | 1 | h-10 |
| Header (Upload) | 1 | h-10 |
| Header (Analysis) | 1 | h-10 |
| Header (Admin) | 1 | h-10 |
| Favicon | 1 | 16x16 |

### Coverage: 100% ✅

All authentication and application pages display the official ClearAI logo consistently.

---

**Last Updated:** 2025-11-14  
**Status:** Complete ✅
