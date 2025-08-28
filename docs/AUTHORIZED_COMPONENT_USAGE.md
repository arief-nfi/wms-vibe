# Authorized Component

The Authorized component is a React component that provides role-based and permission-based access control for rendering UI elements. It conditionally renders its children based on the authenticated user's roles and permissions.

## Features

✅ **Role-Based Access Control** - Restrict content based on user roles  
✅ **Permission-Based Access Control** - Restrict content based on user permissions  
✅ **Flexible Operators** - Use 'OR' or 'AND' logic for multiple roles/permissions  
✅ **Type Safety** - Full TypeScript support with proper type definitions  
✅ **Authentication Integration** - Seamlessly integrates with AuthProvider  
✅ **Null Safety** - Handles unauthenticated users gracefully  
✅ **Multiple Input Formats** - Accepts single string or array of strings  
✅ **Conditional Rendering** - Returns null when access is denied  

## Basic Usage

```tsx
import Authorized from '@client/components/auth/Authorized';

// Basic role-based access control
const AdminPanel = () => {
  return (
    <Authorized roles="admin">
      <div>This content is only visible to admin users</div>
    </Authorized>
  );
};

// Basic permission-based access control
const CreateUserButton = () => {
  return (
    <Authorized permissions="user.create">
      <button>Create User</button>
    </Authorized>
  );
};
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `roles` | `string \| string[] \| undefined` | No | `undefined` | Role or array of roles required to access the content |
| `permissions` | `string \| string[] \| undefined` | No | `undefined` | Permission or array of permissions required to access the content |
| `operator` | `'or' \| 'and'` | No | `'or'` | Logic operator when both roles and permissions are provided |
| `children` | `ReactNode \| ReactNode[]` | Yes | - | Content to render when access is granted |

## Advanced Usage

### Multiple Roles (OR Logic)

```tsx
// User needs to have at least ONE of these roles
<Authorized roles={['admin', 'moderator', 'editor']}>
  <div>Content for admin, moderator, or editor</div>
</Authorized>
```

### Multiple Permissions (OR Logic)

```tsx
// User needs to have at least ONE of these permissions
<Authorized permissions={['user.read', 'user.write']}>
  <div>Content for users who can read or write users</div>
</Authorized>
```

### Combined Roles and Permissions with OR Logic

```tsx
// User needs to have at least one role OR one permission
<Authorized 
  roles={['admin', 'manager']} 
  permissions={['user.manage']}
  operator="or"
>
  <div>Content for admin/manager roles OR user.manage permission</div>
</Authorized>
```

### Combined Roles and Permissions with AND Logic

```tsx
// User needs to have at least one role AND at least one permission
<Authorized 
  roles={['admin', 'manager']} 
  permissions={['user.manage', 'user.delete']}
  operator="and"
>
  <div>Content requires BOTH role AND permission</div>
</Authorized>
```

### Complex Authorization Scenarios

```tsx
// Nested authorization for granular control
<Authorized roles="admin">
  <div>
    <h2>Admin Dashboard</h2>
    
    <Authorized permissions="user.create">
      <button>Create User</button>
    </Authorized>
    
    <Authorized permissions="user.delete">
      <button>Delete User</button>
    </Authorized>
    
    <Authorized roles={['super_admin']} permissions={['system.manage']}>
      <button>System Settings</button>
    </Authorized>
  </div>
</Authorized>
```

## Integration with useAuth Hook

The component integrates seamlessly with the `useAuth` hook from the AuthProvider:

```tsx
import { useAuth } from '@client/provider/AuthProvider';
import Authorized from '@client/components/auth/Authorized';

const MyComponent = () => {
  const { user, isAuthorized } = useAuth();
  
  // You can also use the isAuthorized function directly
  const canManageUsers = isAuthorized(['admin'], ['user.manage'], 'or');
  
  return (
    <div>
      {/* Using the component */}
      <Authorized roles="admin" permissions="user.manage">
        <div>User Management Panel</div>
      </Authorized>
      
      {/* Or using the hook directly */}
      {canManageUsers && (
        <div>Alternative user management content</div>
      )}
    </div>
  );
};
```

## User Object Structure

The component expects the authenticated user to have the following structure:

```typescript
interface User {
  id: string;
  username: string;
  fullname: string;
  email: string;
  avatar: string;
  status: string;
  roles: string[];           // Array of role strings
  permissions: string[];     // Array of permission strings
  activeTenant: {
    id: string;
    code: string;
    name: string;
    description: string;
  };
}
```

## Logic Flow

1. **Authentication Check**: If no user is authenticated (`!authUser`), returns `null`
2. **No Restrictions**: If neither roles nor permissions are provided, renders children
3. **Role-Only Check**: If only roles are provided, checks if user has at least one required role
4. **Permission-Only Check**: If only permissions are provided, checks if user has at least one required permission
5. **Combined Check**: If both roles and permissions are provided:
   - **OR operator**: User needs at least one role OR at least one permission
   - **AND operator**: User needs at least one role AND at least one permission

## Best Practices

### 1. Use Specific Permissions Over Broad Roles

```tsx
// ✅ Good - Specific permission
<Authorized permissions="invoice.create">
  <CreateInvoiceButton />
</Authorized>

// ❌ Less ideal - Broad role
<Authorized roles="admin">
  <CreateInvoiceButton />
</Authorized>
```

### 2. Combine Multiple Checks for Complex Logic

```tsx
// ✅ Good - Clear separation of concerns
<Authorized roles={['admin', 'manager']}>
  <div className="management-section">
    <Authorized permissions="user.create">
      <CreateUserButton />
    </Authorized>
    
    <Authorized permissions="user.delete">
      <DeleteUserButton />
    </Authorized>
  </div>
</Authorized>
```

### 3. Provide Fallback UI for Better UX

```tsx
// ✅ Good - Provides alternative content
const UserActions = () => {
  const { user } = useAuth();
  
  return (
    <div>
      <Authorized roles="admin">
        <AdminPanel />
      </Authorized>
      
      <Authorized roles="user">
        <UserPanel />
      </Authorized>
      
      {!user && <LoginPrompt />}
    </div>
  );
};
```

### 4. Use TypeScript for Better Type Safety

```tsx
// ✅ Good - Define your roles and permissions as types
type UserRole = 'admin' | 'manager' | 'user' | 'guest';
type UserPermission = 'user.create' | 'user.read' | 'user.update' | 'user.delete';

const AdminSection = () => {
  const roles: UserRole[] = ['admin', 'manager'];
  const permissions: UserPermission[] = ['user.create', 'user.update'];
  
  return (
    <Authorized roles={roles} permissions={permissions} operator="and">
      <div>Protected content</div>
    </Authorized>
  );
};
```

## Common Patterns

### Navigation Menu Items

```tsx
const NavigationMenu = () => {
  return (
    <nav>
      <Authorized roles={['admin', 'manager']}>
        <NavLink to="/admin">Admin Panel</NavLink>
      </Authorized>
      
      <Authorized permissions="user.read">
        <NavLink to="/users">Users</NavLink>
      </Authorized>
      
      <Authorized permissions="report.view">
        <NavLink to="/reports">Reports</NavLink>
      </Authorized>
    </nav>
  );
};
```

### Button Actions

```tsx
const UserListActions = ({ userId }: { userId: string }) => {
  return (
    <div className="actions">
      <Authorized permissions="user.read">
        <ViewButton userId={userId} />
      </Authorized>
      
      <Authorized permissions="user.update">
        <EditButton userId={userId} />
      </Authorized>
      
      <Authorized permissions="user.delete" roles="admin">
        <DeleteButton userId={userId} />
      </Authorized>
    </div>
  );
};
```

### Form Sections

```tsx
const UserForm = () => {
  return (
    <form>
      <input name="username" />
      <input name="email" />
      
      <Authorized roles={['admin', 'hr']}>
        <div className="admin-only-section">
          <select name="role">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </Authorized>
      
      <Authorized permissions="user.salary.view">
        <input name="salary" type="number" />
      </Authorized>
    </form>
  );
};
```

## Error Handling

The component handles various edge cases gracefully:

- **No authenticated user**: Returns `null`
- **Missing roles/permissions on user**: Treats as empty arrays
- **Invalid prop combinations**: Falls back to safe defaults
- **Empty arrays**: Handled as no requirements

## Performance Considerations

- The component performs minimal computation and re-renders only when user data changes
- Role and permission checks use efficient array methods (`some()`)
- No expensive operations or API calls within the component
- Leverages React's built-in optimization for conditional rendering

## Testing

```tsx
import { render, screen } from '@testing-library/react';
import Authorized from '@client/components/auth/Authorized';
import { AuthProvider } from '@client/provider/AuthProvider';

// Mock user with roles and permissions
const mockUser = {
  id: '1',
  username: 'testuser',
  roles: ['admin', 'user'],
  permissions: ['user.create', 'user.read']
};

describe('Authorized Component', () => {
  test('renders children when user has required role', () => {
    render(
      <AuthProvider value={{ user: mockUser }}>
        <Authorized roles="admin">
          <div>Protected Content</div>
        </Authorized>
      </AuthProvider>
    );
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
  
  test('does not render when user lacks required permission', () => {
    render(
      <AuthProvider value={{ user: mockUser }}>
        <Authorized permissions="user.delete">
          <div>Protected Content</div>
        </Authorized>
      </AuthProvider>
    );
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
```

## Troubleshooting

### Content Not Showing

1. **Check Authentication**: Ensure user is properly authenticated
2. **Verify Roles/Permissions**: Check if user has the required roles/permissions
3. **Check Operator Logic**: Verify if 'and'/'or' operator is correct for your use case
4. **Console Logging**: Add console.log to debug user object

### Common Issues

```tsx
// ❌ Problem: User has role but content doesn't show
<Authorized roles="Admin">  {/* Case sensitive! */}
  <div>Content</div>
</Authorized>

// ✅ Solution: Match exact role string
<Authorized roles="admin">
  <div>Content</div>
</Authorized>

// ❌ Problem: Using AND operator incorrectly
<Authorized roles="admin" permissions="user.read" operator="and">
  {/* User needs admin role AND user.read permission */}
</Authorized>

// ✅ Solution: Use OR if user needs either role OR permission
<Authorized roles="admin" permissions="user.read" operator="or">
  {/* User needs admin role OR user.read permission */}
</Authorized>
```

## Related Components

- **AuthProvider**: Provides authentication context
- **useAuth Hook**: Access authentication state and utilities
- **Route Guards**: For protecting entire routes (consider implementing)
- **Error Boundaries**: For handling authorization errors gracefully
