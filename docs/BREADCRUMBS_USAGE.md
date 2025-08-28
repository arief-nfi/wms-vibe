# Enhanced Breadcrumbs Component

The enhanced Breadcrumbs component provides powerful features for managing navigation breadcrumbs with React state.

## Features

✅ **Dynamic State Management** - Update breadcrumbs using React state  
✅ **Icon Support** - Add icons to breadcrumb items  
✅ **Click Handlers** - Handle clicks with custom logic  
✅ **Loading States** - Show loading indicators  
✅ **Mobile Support** - Control visibility on mobile devices  
✅ **Max Items with Ellipsis** - Truncate long breadcrumb chains  
✅ **Custom Separators** - Use custom separators between items  
✅ **Utility Functions** - Helper functions for common patterns  
✅ **TypeScript Support** - Fully typed interfaces  

## Basic Usage

```tsx
import Breadcrumbs, { BreadcrumbItem } from '@client/components/console/Breadcrumbs';

const MyComponent = () => {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/console" },
    { label: "System", href: "/console/system" },
    { label: "Users" }
  ];

  return <Breadcrumbs items={breadcrumbs} />;
};
```

## Using React State (useBreadcrumbs Hook)

```tsx
import Breadcrumbs, { useBreadcrumbs, createBreadcrumbItems } from '@client/components/console/Breadcrumbs';

const MyComponent = () => {
  const {
    items: breadcrumbs,
    addItem,
    updateItem,
    removeItem
  } = useBreadcrumbs(
    createBreadcrumbItems([
      { label: "Home", href: "/console" },
      { label: "Current Page" }
    ])
  );

  const handleAddLevel = () => {
    addItem({ label: "New Level", href: "/new" });
  };

  const handleUpdateCurrent = () => {
    updateItem(1, { label: "Updated Page", disabled: true });
  };

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />
      <button onClick={handleAddLevel}>Add Level</button>
      <button onClick={handleUpdateCurrent}>Update Current</button>
    </div>
  );
};
```

## Advanced Features

### With Icons and Click Handlers

```tsx
const breadcrumbs: BreadcrumbItem[] = [
  { 
    label: "Home", 
    href: "/console",
    icon: <HomeIcon />,
    onClick: () => navigate("/console")
  },
  { 
    label: "Loading Page...", 
    disabled: true,
    icon: <SpinnerIcon />
  }
];

<Breadcrumbs 
  items={breadcrumbs}
  onItemClick={(item, index) => console.log('Clicked:', item)}
  showMobileItems={true}
/>
```

### With Loading State

```tsx
const [isLoading, setIsLoading] = useState(false);

<Breadcrumbs 
  items={breadcrumbs}
  loading={isLoading}
/>
```

### With Max Items (Ellipsis)

```tsx
<Breadcrumbs 
  items={longBreadcrumbsList}
  maxItems={4}  // Shows first item + "..." + last 2 items
/>
```

### With Custom Separator

```tsx
<Breadcrumbs 
  items={breadcrumbs}
  separator={<span className="mx-2">→</span>}
/>
```

## API Reference

### BreadcrumbItem Interface

```tsx
interface BreadcrumbItem {
  id?: string;              // Unique identifier
  label: string;            // Display text
  href?: string;            // Navigation URL
  icon?: ReactNode;         // Icon component
  onClick?: () => void;     // Click handler
  disabled?: boolean;       // Disable interaction
  className?: string;       // Custom CSS class
}
```

### Breadcrumbs Props

```tsx
interface BreadcrumbProps {
  items: BreadcrumbItem[];                                    // Breadcrumb items
  loading?: boolean;                                          // Show loading state
  maxItems?: number;                                          // Maximum items before ellipsis
  showMobileItems?: boolean;                                  // Show on mobile devices
  separator?: ReactNode;                                      // Custom separator
  className?: string;                                         // Custom CSS class
  onItemClick?: (item: BreadcrumbItem, index: number) => void; // Global click handler
}
```

### useBreadcrumbs Hook

```tsx
const {
  items,                    // Current breadcrumb items
  setItems,                 // Replace all items
  addItem,                  // Add new item
  removeItem,               // Remove item by index
  updateItem,               // Update item by index
  replaceItems,             // Replace all items
  clearItems                // Clear all items
} = useBreadcrumbs(initialItems);
```

### Utility Functions

```tsx
// Create a single breadcrumb item
const item = createBreadcrumbItem("Label", "/href", { icon: <Icon /> });

// Create multiple breadcrumb items
const items = createBreadcrumbItems([
  { label: "Home", href: "/" },
  { label: "Page", icon: <Icon /> }
]);
```

## Migration from Old Component

**Old way:**
```tsx
const breadcrumbs = [
  { label: "Roles", href: "/console/system/role" },
  { label: "Add Role" }
];

<Breadcrumbs items={breadcrumbs} />
```

**New way (enhanced):**
```tsx
const breadcrumbs = createBreadcrumbItems([
  { 
    label: "Roles", 
    href: "/console/system/role",
    onClick: () => navigate("/console/system/role")
  },
  { label: "Add Role" }
]);

<Breadcrumbs 
  items={breadcrumbs}
  onItemClick={(item) => item.onClick?.()}
  showMobileItems={true}
/>
```

## Example: Dynamic Form States

```tsx
const {
  items: breadcrumbs,
  updateItem
} = useBreadcrumbs([
  { label: "Forms" },
  { label: "Add Item" }
]);

const handleSubmit = async (data) => {
  // Update breadcrumb to show saving state
  updateItem(1, { label: "Saving...", disabled: true });
  
  try {
    await saveData(data);
    // Success - navigate away or update breadcrumb
    updateItem(1, { label: "Saved Successfully" });
  } catch (error) {
    // Error - reset breadcrumb
    updateItem(1, { label: "Add Item", disabled: false });
  }
};
```

This enhanced breadcrumbs component gives you full control over the navigation state and integrates seamlessly with React's state management patterns.
