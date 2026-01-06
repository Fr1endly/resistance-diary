# Toast Notification System

A custom toast notification system integrated with Zustand store, featuring glass-morphism design and smooth animations.

## Features

- **4 Variants**: success, error, warning, info
- **Auto-dismiss**: Configurable duration (default 4s)
- **Animations**: Smooth slide-in/fade-out with Framer Motion
- **Accessibility**: Proper ARIA roles and live regions
- **Limit**: Max 3 visible toasts (newest shown)
- **Dismissible**: Manual close button on each toast

## Usage

### Basic Usage

```typescript
import { useToast } from '@/hooks/useToast'

function MyComponent() {
  const toast = useToast()

  return (
    <button onClick={() => toast.success('Operation completed!')}>
      Save
    </button>
  )
}
```

### All Variants

```typescript
const toast = useToast()

// Success (green)
toast.success('Data saved successfully!')

// Error (red)
toast.error('Failed to save data')

// Warning (yellow)
toast.warning('Please verify your input')

// Info (blue)
toast.info('New update available')
```

### Custom Duration

```typescript
// 8 seconds instead of default 4
toast.success('This will stay longer', 8000)

// 2 seconds for quick messages
toast.info('Quick tip', 2000)
```

### Generic Toast Method

```typescript
// If you need dynamic variant
const variant = userAction === 'delete' ? 'error' : 'success'
toast.toast('Action completed', variant, 5000)
```

## Architecture

### Store Slice
- **Location**: `src/store/slices/toastSlice.ts`
- **State**: Array of toast objects
- **Actions**: `addToast`, `removeToast`, `clearToasts`

### Components
- **Toast**: Individual toast component with icon and dismiss button
- **ToastContainer**: Manages toast stack and animations
- **useToast**: Convenience hook for easy access

### Styling
- Uses CVA (Class Variance Authority) for variants
- Glass-morphism design matching app theme
- Responsive positioning (top-right on desktop)

## Migration from alert()

### Before
```typescript
if (value <= 0) {
  alert("Please enter a valid number")
  return
}
```

### After
```typescript
const toast = useToast()

if (value <= 0) {
  toast.error("Please enter a valid number")
  return
}
```

## Testing

Tests located at: `src/store/slices/toastSlice.test.ts`

```bash
npm test -- toastSlice.test.ts
```

## Implementation Details

- **No persistence**: Toasts don't persist to localStorage (intentional)
- **Auto-dismiss**: Uses `setTimeout` with cleanup
- **Unique IDs**: Generated with `nanoid`
- **ARIA**: Uses `role="alert"` for errors, `role="status"` for others
- **z-index**: z-50 to appear above all content
