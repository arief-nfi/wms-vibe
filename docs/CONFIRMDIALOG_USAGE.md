# ConfirmDialog Component

The ConfirmDialog component is a reusable React component that provides a standardized confirmation dialog for user actions. It's built on top of the Radix UI AlertDialog primitive and provides a simple interface for showing confirmation prompts with customizable title and description.

## Features

✅ **Simple API** - Easy-to-use interface with minimal props  
✅ **Accessible** - Built on Radix UI AlertDialog primitive for full accessibility  
✅ **Customizable Content** - Support for custom title and description text  
✅ **Controlled State** - Fully controlled component with external state management  
✅ **Action Callbacks** - Separate handlers for confirm and cancel actions  
✅ **Responsive Design** - Mobile-friendly responsive layout  
✅ **Animation Support** - Smooth enter/exit animations  
✅ **TypeScript Support** - Full type safety with TypeScript interfaces  
✅ **Theme Integration** - Integrates with your design system theme  

## Basic Usage

```tsx
import { useState } from 'react';
import ConfirmDialog from '@client/components/console/ConfirmDialog';

const MyComponent = () => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    // Perform delete action
    console.log('Item deleted');
    setShowConfirm(false);
  };

  return (
    <div>
      <button onClick={() => setShowConfirm(true)}>
        Delete Item
      </button>
      
      <ConfirmDialog
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleDelete}
      />
    </div>
  );
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | `string` | Yes | The title/heading text displayed in the dialog |
| `description` | `string` | Yes | The description/body text explaining the confirmation action |
| `open` | `boolean` | Yes | Controls whether the dialog is visible or hidden |
| `onOpenChange` | `(open: boolean) => void` | Yes | Callback function called when the dialog should open/close |
| `onConfirm` | `() => void` | Yes | Callback function called when the user confirms the action |

## Component Interface

```typescript
interface ConfirmDialogProps {
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}
```

## Advanced Usage Examples

### Delete Confirmation

```tsx
import { useState } from 'react';
import ConfirmDialog from '@client/components/console/ConfirmDialog';

const UserList = () => {
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [users, setUsers] = useState([
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' }
  ]);

  const handleDeleteUser = async () => {
    if (deleteUserId) {
      try {
        // API call to delete user
        await fetch(`/api/users/${deleteUserId}`, { method: 'DELETE' });
        
        // Update local state
        setUsers(users.filter(user => user.id !== deleteUserId));
        
        // Close dialog
        setDeleteUserId(null);
        
        // Show success message
        console.log('User deleted successfully');
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  return (
    <div>
      {users.map(user => (
        <div key={user.id} className="flex justify-between items-center p-4 border-b">
          <span>{user.name}</span>
          <button 
            onClick={() => setDeleteUserId(user.id)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      ))}
      
      <ConfirmDialog
        title="Delete User"
        description={`Are you sure you want to delete this user? This action cannot be undone and will permanently remove all associated data.`}
        open={deleteUserId !== null}
        onOpenChange={(open) => !open && setDeleteUserId(null)}
        onConfirm={handleDeleteUser}
      />
    </div>
  );
};
```

### Unsaved Changes Warning

```tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ConfirmDialog from '@client/components/console/ConfirmDialog';

const FormWithUnsavedChanges = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (hasUnsavedChanges) {
        setPendingNavigation(url);
        setShowLeaveConfirm(true);
        throw 'Route change prevented'; // Prevent navigation
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [hasUnsavedChanges, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleLeaveConfirm = () => {
    if (pendingNavigation) {
      setHasUnsavedChanges(false);
      router.push(pendingNavigation);
    }
  };

  return (
    <div>
      <form>
        <input
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Name"
        />
        <input
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="Email"
        />
      </form>

      <ConfirmDialog
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to leave this page? All unsaved changes will be lost."
        open={showLeaveConfirm}
        onOpenChange={setShowLeaveConfirm}
        onConfirm={handleLeaveConfirm}
      />
    </div>
  );
};
```

### Bulk Operations

```tsx
import { useState } from 'react';
import ConfirmDialog from '@client/components/console/ConfirmDialog';

const BulkOperations = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'delete' | 'archive' | null>(null);
  
  const items = [
    { id: '1', name: 'Document 1' },
    { id: '2', name: 'Document 2' },
    { id: '3', name: 'Document 3' }
  ];

  const handleBulkDelete = () => {
    console.log('Deleting items:', selectedItems);
    setBulkAction(null);
    setSelectedItems([]);
  };

  const handleBulkArchive = () => {
    console.log('Archiving items:', selectedItems);
    setBulkAction(null);
    setSelectedItems([]);
  };

  const getBulkActionText = () => {
    switch (bulkAction) {
      case 'delete':
        return {
          title: 'Delete Items',
          description: `Are you sure you want to delete ${selectedItems.length} item(s)? This action cannot be undone.`
        };
      case 'archive':
        return {
          title: 'Archive Items',
          description: `Are you sure you want to archive ${selectedItems.length} item(s)? They will be moved to the archive folder.`
        };
      default:
        return { title: '', description: '' };
    }
  };

  return (
    <div>
      {/* Item selection */}
      {items.map(item => (
        <div key={item.id}>
          <input
            type="checkbox"
            checked={selectedItems.includes(item.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedItems([...selectedItems, item.id]);
              } else {
                setSelectedItems(selectedItems.filter(id => id !== item.id));
              }
            }}
          />
          {item.name}
        </div>
      ))}

      {/* Bulk actions */}
      {selectedItems.length > 0 && (
        <div>
          <button onClick={() => setBulkAction('delete')}>
            Delete Selected ({selectedItems.length})
          </button>
          <button onClick={() => setBulkAction('archive')}>
            Archive Selected ({selectedItems.length})
          </button>
        </div>
      )}

      <ConfirmDialog
        title={getBulkActionText().title}
        description={getBulkActionText().description}
        open={bulkAction !== null}
        onOpenChange={(open) => !open && setBulkAction(null)}
        onConfirm={bulkAction === 'delete' ? handleBulkDelete : handleBulkArchive}
      />
    </div>
  );
};
```

## Custom Hook for ConfirmDialog

Create a reusable hook to simplify usage:

```tsx
// hooks/useConfirmDialog.ts
import { useState, useCallback } from 'react';

interface ConfirmDialogState {
  title: string;
  description: string;
  onConfirm: () => void;
}

export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = useState<ConfirmDialogState | null>(null);

  const showConfirm = useCallback((config: ConfirmDialogState) => {
    setDialogState(config);
  }, []);

  const hideConfirm = useCallback(() => {
    setDialogState(null);
  }, []);

  const confirmAndClose = useCallback(() => {
    if (dialogState) {
      dialogState.onConfirm();
      setDialogState(null);
    }
  }, [dialogState]);

  return {
    dialogState,
    showConfirm,
    hideConfirm,
    confirmAndClose,
    isOpen: dialogState !== null
  };
};

// Usage with the hook
const ComponentWithHook = () => {
  const { dialogState, showConfirm, hideConfirm, confirmAndClose, isOpen } = useConfirmDialog();

  const handleDelete = () => {
    showConfirm({
      title: 'Delete Item',
      description: 'Are you sure you want to delete this item?',
      onConfirm: () => {
        console.log('Item deleted');
        // Perform delete operation
      }
    });
  };

  return (
    <div>
      <button onClick={handleDelete}>Delete</button>
      
      {dialogState && (
        <ConfirmDialog
          title={dialogState.title}
          description={dialogState.description}
          open={isOpen}
          onOpenChange={(open) => !open && hideConfirm()}
          onConfirm={confirmAndClose}
        />
      )}
    </div>
  );
};
```

## Integration Patterns

### With React Hook Form

```tsx
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import ConfirmDialog from '@client/components/console/ConfirmDialog';

const FormWithConfirmation = () => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm();

  const onSubmit = (data: any) => {
    console.log('Form submitted:', data);
  };

  const handleReset = () => {
    reset();
    setShowResetConfirm(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} placeholder="Name" />
      <input {...register('email')} placeholder="Email" />
      
      <div>
        <button type="submit">Save</button>
        {isDirty && (
          <button 
            type="button" 
            onClick={() => setShowResetConfirm(true)}
          >
            Reset Form
          </button>
        )}
      </div>

      <ConfirmDialog
        title="Reset Form"
        description="Are you sure you want to reset the form? All changes will be lost."
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        onConfirm={handleReset}
      />
    </form>
  );
};
```

### With State Management (Redux/Zustand)

```tsx
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import ConfirmDialog from '@client/components/console/ConfirmDialog';
import { deleteUser } from '@/store/userSlice';

const UserManagement = ({ userId }: { userId: string }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const dispatch = useDispatch();

  const handleDeleteUser = () => {
    dispatch(deleteUser(userId));
    setShowDeleteConfirm(false);
  };

  return (
    <div>
      <button onClick={() => setShowDeleteConfirm(true)}>
        Delete User
      </button>

      <ConfirmDialog
        title="Delete User"
        description="This will permanently delete the user and all associated data. This action cannot be undone."
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDeleteUser}
      />
    </div>
  );
};
```

## Styling and Theming

The ConfirmDialog uses the underlying AlertDialog components which support custom styling:

```tsx
// The component inherits styles from the design system
// Custom styling can be applied through CSS classes or styled-components

const StyledConfirmDialog = ({ className, ...props }: ConfirmDialogProps & { className?: string }) => {
  return (
    <div className={className}>
      <ConfirmDialog {...props} />
    </div>
  );
};

// Usage with custom styling
<StyledConfirmDialog
  className="custom-dialog"
  title="Custom Styled Dialog"
  description="This dialog has custom styling applied."
  open={open}
  onOpenChange={setOpen}
  onConfirm={handleConfirm}
/>
```

## Accessibility Features

The ConfirmDialog component inherits accessibility features from Radix UI AlertDialog:

- **Keyboard Navigation**: Full keyboard support with Tab, Enter, and Escape keys
- **Focus Management**: Proper focus trapping and restoration
- **Screen Reader Support**: ARIA labels and descriptions
- **Portal Rendering**: Renders outside DOM hierarchy to avoid z-index issues
- **Role Attributes**: Proper ARIA roles for dialog semantics

## Best Practices

### 1. Clear and Descriptive Text

```tsx
// ✅ Good - Clear and specific
<ConfirmDialog
  title="Delete Customer Record"
  description="Are you sure you want to delete John Doe's customer record? This will permanently remove all order history, contact information, and account data. This action cannot be undone."
  // ...
/>

// ❌ Poor - Vague and unclear
<ConfirmDialog
  title="Confirm"
  description="Are you sure?"
  // ...
/>
```

### 2. Handle Loading States

```tsx
const [isDeleting, setIsDeleting] = useState(false);

const handleDelete = async () => {
  setIsDeleting(true);
  try {
    await deleteItem();
    setShowConfirm(false);
  } catch (error) {
    console.error('Delete failed:', error);
  } finally {
    setIsDeleting(false);
  }
};

// You could extend the component to handle loading states
// or manage them in the parent component
```

### 3. Prevent Accidental Confirmations

```tsx
const [confirmText, setConfirmText] = useState('');
const requiredText = 'DELETE';

// For critical actions, require typing confirmation text
<div>
  <input
    value={confirmText}
    onChange={(e) => setConfirmText(e.target.value)}
    placeholder={`Type "${requiredText}" to confirm`}
  />
  
  <ConfirmDialog
    title="Dangerous Action"
    description={`This is a destructive action. Type "${requiredText}" above to confirm.`}
    open={showConfirm}
    onOpenChange={setShowConfirm}
    onConfirm={confirmText === requiredText ? handleDangerousAction : undefined}
  />
</div>
```

### 4. Provide Context

```tsx
// Include relevant details in the confirmation
const userName = 'John Doe';
const userEmail = 'john@example.com';

<ConfirmDialog
  title="Delete User Account"
  description={`Are you sure you want to delete ${userName} (${userEmail})? This will permanently remove their account and all associated data.`}
  open={showConfirm}
  onOpenChange={setShowConfirm}
  onConfirm={handleDelete}
/>
```

## Common Use Cases

1. **Delete Operations** - Confirming deletion of records, files, or accounts
2. **Destructive Actions** - Any action that permanently modifies or removes data
3. **Navigation Away** - Warning about unsaved changes before leaving a page
4. **Bulk Operations** - Confirming actions on multiple selected items
5. **Status Changes** - Confirming significant status changes (activate/deactivate)
6. **Form Resets** - Confirming form resets when data would be lost
7. **Subscription Changes** - Confirming plan changes or cancellations

## Error Handling

```tsx
const [error, setError] = useState<string | null>(null);

const handleConfirm = async () => {
  try {
    setError(null);
    await performAction();
    setShowConfirm(false);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
    // Keep dialog open to show error
  }
};

return (
  <div>
    <ConfirmDialog
      title="Confirm Action"
      description={error ? error : "Are you sure you want to perform this action?"}
      open={showConfirm}
      onOpenChange={setShowConfirm}
      onConfirm={handleConfirm}
    />
  </div>
);
```

## Testing

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConfirmDialog from '@client/components/console/ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    title: 'Test Title',
    description: 'Test Description',
    open: true,
    onOpenChange: jest.fn(),
    onConfirm: jest.fn()
  };

  test('renders with correct title and description', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  test('calls onConfirm when confirm button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Confirm'));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  test('calls onOpenChange when cancel button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  test('does not render when open is false', () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);
    
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });
});
```

## Troubleshooting

### Common Issues

1. **Dialog Not Showing**
   - Check that `open` prop is `true`
   - Ensure proper z-index stacking context
   - Verify portal rendering

2. **State Not Updating**
   - Make sure `onOpenChange` properly updates state
   - Check for component re-rendering issues

3. **Accessibility Issues**
   - Ensure proper focus management
   - Test with keyboard navigation
   - Verify screen reader compatibility

4. **Styling Problems**
   - Check CSS specificity conflicts
   - Verify theme provider setup
   - Inspect generated HTML structure

## Related Components

- **AlertDialog** - The underlying Radix UI primitive
- **Modal** - For more complex dialog content
- **Toast** - For non-blocking notifications
- **Popover** - For contextual information displays
