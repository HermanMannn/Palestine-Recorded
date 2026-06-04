# Translation System Documentation

## Overview
This project uses a JSON-based internationalization (i18n) system to support multiple languages with easy translation switching.

## File Structure
```
src/
├── locales/
│   ├── en.json          # English translations
│   └── ar.json          # Arabic translations
├── hooks/
│   └── useTranslation.ts # React hook for using translations
├── lib/
│   └── translations.ts   # Translation utilities
└── components/
    └── LanguageSwitcher.tsx # Language selector component
```

## Usage

### Basic Usage in Components

#### Using the `useTranslation` Hook

```jsx
import { useTranslation } from '@/hooks/useTranslation';

export default function MyComponent() {
  const { t, language, switchLanguage } = useTranslation();

  return (
    <div>
      <h1>{t('navbar.title')}</h1>
      <p>{t('auth.loginFailed')}</p>
      <button onClick={() => switchLanguage('ar')}>Arabic</button>
      <button onClick={() => switchLanguage('en')}>English</button>
      <p>Current language: {language}</p>
    </div>
  );
}
```

### Translation Utility Functions

```typescript
import { getTranslation, getAvailableLanguages } from '@/lib/translations';

// Get a single translation
const loginText = getTranslation('auth.login', 'en'); // "Login"
const loginAr = getTranslation('auth.login', 'ar');   // "تسجيل الدخول"

// Get all available languages
const languages = getAvailableLanguages();
// [{ code: 'en', label: 'English' }, { code: 'ar', label: 'العربية' }]
```

### Language Switcher Component

```jsx
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function Navbar() {
  return (
    <nav>
      <h1>My App</h1>
      <LanguageSwitcher />
    </nav>
  );
}
```

## Adding/Updating Translations

1. **English translations**: Edit `src/locales/en.json`
2. **Arabic translations**: Edit `src/locales/ar.json`

### Translation Key Structure
Keys are organized hierarchically with dot notation:
```json
{
  "section": {
    "subsection": {
      "key": "value"
    }
  }
}
```

Access with: `t('section.subsection.key')`

## Features

✅ **Persistent Language Selection**: User's language choice is saved to localStorage
✅ **Browser Language Detection**: Defaults to browser language if available
✅ **Automatic RTL Support**: Sets document direction to RTL for Arabic
✅ **Fallback to English**: If translation key not found in target language, falls back to English
✅ **Type-safe**: Fully typed with TypeScript

## Converting Components to Use Translations

### Before:
```jsx
export default function Login() {
  return (
    <div>
      <h1>Palestine Recorded</h1>
      <label>Email</label>
      <input placeholder="Enter email" />
      <button>Login</button>
    </div>
  );
}
```

### After:
```jsx
import { useTranslation } from '@/hooks/useTranslation';

export default function Login() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('navbar.title')}</h1>
      <label>{t('auth.email')}</label>
      <input placeholder={t('auth.email')} />
      <button>{t('auth.login')}</button>
    </div>
  );
}
```

## RTL Support

The system automatically handles RTL (Right-to-Left) languages:
- Document direction is set to RTL for Arabic
- Document language attribute is updated
- Use CSS or Tailwind classes for RTL-aware styling:

```jsx
<div className={`ml-4 ${isRTL ? 'mr-4 ml-0' : 'ml-4 mr-0'}`}>
  Content
</div>
```

Or with Tailwind RTL modifiers (if configured):
```jsx
<div className="ml-4 rtl:ml-0 rtl:mr-4">
  Content
</div>
```

## Next Steps

1. **Update Navbar.jsx** - Replace hardcoded text with translations
2. **Update Login.jsx** - Use auth translations
3. **Update Signup.jsx** - Use auth translations
4. **Update About.jsx** - Use about section translations
5. **Update Contact.jsx** - Use contact section translations
6. **Add Language Switcher** to navbar for easy switching

## Example Component Update

Here's a complete example of updating the Navbar component:

```jsx
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
// ... other imports

export default function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // ... rest of component logic

  const tools = [
    { icon: Home, label: t('navbar.homeTitle'), to: "/timeline" },
    { icon: Calendar, label: t('navbar.communityTitle'), to: "/social" },
    { icon: Grid3X3, label: t('navbar.gridTitle'), to: "/palgrid" },
    { icon: MessageSquare, label: t('navbar.messagesTitle'), to: "/messages" },
    { icon: Settings, label: t('navbar.settingsTitle'), to: "/settings" },
  ];

  return (
    <header>
      <Link to="/timeline">
        <img src={isDarkMode ? logoDark : logoLight} alt="Logo" />
        <span>{t('navbar.title')}</span>
      </Link>
      
      <div>
        {/* Navigation tools */}
      </div>

      <nav>
        <Link to="/about">{t('navbar.aboutTitle')}</Link>
        <Link to="/donate">{t('navbar.donateTitle')}</Link>
        <Link to="/contact">{t('navbar.contactUsTitle')}</Link>
        <LanguageSwitcher />
      </nav>
    </header>
  );
}
```
