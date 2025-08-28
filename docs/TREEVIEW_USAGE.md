# TreeView Component Documentation

## Overview

The `TreeView` component is a highly advanced React component that provides a hierarchical tree structure interface with extensive interactive capabilities. It supports features like multi-selection, drag selection, checkboxes for access control, search functionality, context menus, animations, and much more.

## Features

- **Hierarchical Display**: Renders nested tree structures with collapsible folders
- **Multi-Selection**: Supports single, multi (Ctrl/Cmd), and range (Shift) selection
- **Drag Selection**: Click and drag to select multiple items
- **Search Functionality**: Real-time search with automatic expansion of matching branches
- **Checkbox Support**: Hierarchical checkboxes with indeterminate states
- **Context Menus**: Right-click context menus with custom actions
- **Animations**: Smooth expand/collapse animations using Framer Motion
- **Icons**: Customizable icons for different item types
- **Hover Information**: Detailed hover cards with item metadata
- **Keyboard Navigation**: Full keyboard accessibility
- **Customizable Styling**: Extensive theming and styling options
- **Performance Optimized**: Efficient rendering for large datasets

## Installation

This component depends on several packages:

```bash
npm install lucide-react framer-motion
```

Required peer dependencies:
- React 16.8+
- TypeScript (recommended)

## Type Definitions

```typescript
export interface TreeViewItem {
  id: string;
  name: string;
  type: string;
  children?: TreeViewItem[];
  checked?: boolean;
}

export interface TreeViewIconMap {
  [key: string]: React.ReactNode | undefined;
}

export interface TreeViewMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action: (items: TreeViewItem[]) => void;
}

export interface TreeViewRef {
  getCheckedItems: () => TreeViewItem[];
}
```

## Basic Usage

```tsx
import TreeView, { TreeViewItem } from "@/components/tree-view";
import { useState } from "react";

const data: TreeViewItem[] = [
  {
    id: "root",
    name: "Project Root",
    type: "folder",
    children: [
      {
        id: "src",
        name: "src",
        type: "folder",
        children: [
          { id: "app.tsx", name: "App.tsx", type: "file" },
          { id: "index.tsx", name: "index.tsx", type: "file" },
        ]
      },
      { id: "package.json", name: "package.json", type: "file" }
    ]
  }
];

function FileExplorer() {
  const [selectedItems, setSelectedItems] = useState<TreeViewItem[]>([]);

  return (
    <TreeView
      data={data}
      onSelectionChange={setSelectedItems}
      showIcons={true}
      showSearch={true}
      showExpandAll={true}
      disableSelection={false}
    />
  );
}
```

## Props Interface

```typescript
export interface TreeViewProps {
  className?: string;
  data: TreeViewItem[];
  title?: string;
  showExpandAll?: boolean;
  showCheckboxes?: boolean;
  showIcons?: boolean;
  showSearch?: boolean;
  showSelected?: boolean;
  showInfo?: boolean;
  disableContextMenu?: boolean;
  disableSelection?: boolean;
  readonly?: boolean;
  hideRootFolder?: boolean;
  checkboxPosition?: "left" | "right";
  searchPlaceholder?: string;
  selectionText?: string;
  checkboxLabels?: {
    check: string;
    uncheck: string;
  };
  getIcon?: (item: TreeViewItem, depth: number) => React.ReactNode;
  onSelectionChange?: (selectedItems: TreeViewItem[]) => void;
  onAction?: (action: string, items: TreeViewItem[]) => void;
  onCheckChange?: (item: TreeViewItem, checked: boolean) => void;
  iconMap?: TreeViewIconMap;
  menuItems?: TreeViewMenuItem[];
}
```

### Detailed Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes for the container |
| `data` | `TreeViewItem[]` | **Required** | Array of tree items to display |
| `title` | `string` | - | Optional title for the tree view |
| `showExpandAll` | `boolean` | `false` | Show expand/collapse all buttons |
| `showCheckboxes` | `boolean` | `true` | Enable checkbox functionality |
| `showIcons` | `boolean` | `false` | Display icons for items |
| `showSearch` | `boolean` | `false` | Enable search functionality |
| `showSelected` | `boolean` | `false` | Show selection summary bar |
| `showInfo` | `boolean` | `false` | Enable hover information cards |
| `disableContextMenu` | `boolean` | `true` | Disable right-click context menus |
| `disableSelection` | `boolean` | `true` | Disable item selection |
| `readonly` | `boolean` | `false` | Make the tree read-only |
| `hideRootFolder` | `boolean` | `true` | Hide single root folder and show children directly |
| `checkboxPosition` | `"left" \| "right"` | `"left"` | Position of checkboxes |
| `searchPlaceholder` | `string` | `"Search..."` | Placeholder text for search input |
| `selectionText` | `string` | `"selected"` | Text to show in selection summary |
| `checkboxLabels` | `object` | `{check: "Check", uncheck: "Uncheck"}` | Labels for checkbox actions |
| `getIcon` | `function` | - | Custom icon renderer function |
| `onSelectionChange` | `function` | - | Callback when selection changes |
| `onAction` | `function` | - | Callback for context menu actions |
| `onCheckChange` | `function` | - | Callback when checkbox state changes |
| `iconMap` | `TreeViewIconMap` | - | Map of item types to icons |
| `menuItems` | `TreeViewMenuItem[]` | - | Custom context menu items |

## Advanced Usage Examples

### With Custom Icons

```tsx
import { File, Folder, Image, Code } from "lucide-react";

const iconMap = {
  folder: <Folder className="h-4 w-4 text-blue-600" />,
  file: <File className="h-4 w-4 text-gray-600" />,
  image: <Image className="h-4 w-4 text-green-600" />,
  code: <Code className="h-4 w-4 text-purple-600" />
};

<TreeView
  data={data}
  showIcons={true}
  iconMap={iconMap}
/>
```

### With Context Menus

```tsx
import { Copy, Delete, Edit, Download } from "lucide-react";

const menuItems = [
  {
    id: "copy",
    label: "Copy",
    icon: <Copy className="h-4 w-4" />,
    action: (items) => console.log("Copy", items)
  },
  {
    id: "delete",
    label: "Delete",
    icon: <Delete className="h-4 w-4" />,
    action: (items) => console.log("Delete", items)
  },
  {
    id: "edit",
    label: "Edit",
    icon: <Edit className="h-4 w-4" />,
    action: (items) => console.log("Edit", items)
  }
];

<TreeView
  data={data}
  disableContextMenu={false}
  menuItems={menuItems}
  onAction={(action, items) => {
    console.log(`Action: ${action}`, items);
  }}
/>
```

### With Checkboxes and Access Control

```tsx
function PermissionTree() {
  const [data, setData] = useState(treeData);

  const handleCheckChange = (item: TreeViewItem, checked: boolean) => {
    setData(prevData => updateItemCheckedState(prevData, item.id, checked));
  };

  return (
    <TreeView
      data={data}
      showCheckboxes={true}
      onCheckChange={handleCheckChange}
      checkboxLabels={{
        check: "Grant Access",
        uncheck: "Revoke Access"
      }}
    />
  );
}
```

### With Search and Filtering

```tsx
<TreeView
  data={data}
  showSearch={true}
  showExpandAll={true}
  searchPlaceholder="Search files and folders..."
  disableSelection={false}
  showSelected={true}
  selectionText="items selected"
/>
```

### Using Ref to Get Checked Items

```tsx
import { useRef } from "react";

function AccessControlPanel() {
  const treeRef = useRef<TreeViewRef>(null);

  const handleSavePermissions = () => {
    if (treeRef.current) {
      const checkedItems = treeRef.current.getCheckedItems();
      console.log("Saving permissions for:", checkedItems);
    }
  };

  return (
    <div>
      <TreeView
        ref={treeRef}
        data={data}
        showCheckboxes={true}
      />
      <button onClick={handleSavePermissions}>
        Save Permissions
      </button>
    </div>
  );
}
```

## Interactive Features

### Selection Modes

1. **Single Selection**: Click to select one item
2. **Multi-Selection**: Ctrl/Cmd + Click to select multiple items
3. **Range Selection**: Shift + Click to select a range
4. **Drag Selection**: Click and drag to select multiple items

### Keyboard Navigation

- **Arrow Keys**: Navigate through items
- **Space**: Toggle selection
- **Enter**: Expand/collapse folders
- **Ctrl/Cmd + A**: Select all visible items

### Search Behavior

- Real-time filtering as you type
- Automatically expands parent folders of matching items
- Highlights matching text in results
- Preserves tree structure while filtering

### Checkbox States

- **Unchecked**: Item has no access
- **Checked**: Item has full access
- **Indeterminate**: Some children have access, others don't

## Styling and Theming

### CSS Classes Used

```css
/* Main container */
.tree-view-container { /* Custom class */ }

/* Tree items */
.tree-item-selected { background: theme(colors.secondary); }
.tree-item-hover { background: theme(colors.muted); }

/* Selection styles */
.rounded-t-md { /* Top rounded for first selected */ }
.rounded-b-md { /* Bottom rounded for last selected */ }

/* Animation classes */
.expand-animation { /* Framer Motion handles this */ }
```

### Custom Styling

```tsx
<TreeView
  className="border rounded-lg p-4 bg-white dark:bg-gray-900"
  data={data}
  // ... other props
/>
```

## Performance Considerations

### Large Datasets

For trees with thousands of items:

1. **Virtualization**: Consider implementing virtual scrolling for very large trees
2. **Lazy Loading**: Load children on demand for deep hierarchies
3. **Search Optimization**: Implement debounced search for better performance
4. **Memoization**: Use React.memo for tree items if needed

```tsx
// Example with lazy loading
const LazyTreeView = () => {
  const [data, setData] = useState(initialData);

  const loadChildren = async (parentId: string) => {
    const children = await fetchChildren(parentId);
    setData(prevData => updateItemChildren(prevData, parentId, children));
  };

  return (
    <TreeView
      data={data}
      onAction={(action, items) => {
        if (action === 'expand') {
          loadChildren(items[0].id);
        }
      }}
    />
  );
};
```

## Utility Functions

The component exports several utility functions:

```typescript
// Update checked state with proper parent/child propagation
export const updateItemCheckedState = (
  items: TreeViewItem[], 
  targetId: string, 
  checked: boolean
) => TreeViewItem[];

// Update parent states based on children
export const updateParentStates = (items: TreeViewItem[]) => TreeViewItem[];
```

## Event Handling

### Selection Events

```tsx
const handleSelectionChange = (selectedItems: TreeViewItem[]) => {
  console.log("Selection changed:", selectedItems);
  
  // Do something with selected items
  setSelectedCount(selectedItems.length);
};
```

### Checkbox Events

```tsx
const handleCheckChange = (item: TreeViewItem, checked: boolean) => {
  console.log(`${item.name} is now ${checked ? 'checked' : 'unchecked'}`);
  
  // Update your data state
  setData(prevData => updateItemCheckedState(prevData, item.id, checked));
};
```

### Action Events

```tsx
const handleAction = (action: string, items: TreeViewItem[]) => {
  switch (action) {
    case 'copy':
      copyItems(items);
      break;
    case 'delete':
      deleteItems(items);
      break;
    case 'share':
      shareItems(items);
      break;
    default:
      console.log('Unknown action:', action);
  }
};
```

## Accessibility Features

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Proper focus handling
- **Color Contrast**: High contrast selection indicators
- **Screen Reader Support**: Announces selection changes and tree structure

```tsx
<TreeView
  data={data}
  // Accessibility is built-in, but you can enhance it
  className="focus-visible:ring-2 focus-visible:ring-blue-500"
/>
```

## Integration Patterns

### With State Management (Redux/Zustand)

```tsx
// With Redux
const TreeViewContainer = () => {
  const treeData = useSelector(state => state.tree.data);
  const dispatch = useDispatch();

  return (
    <TreeView
      data={treeData}
      onCheckChange={(item, checked) => 
        dispatch(updateItemPermission({ id: item.id, checked }))
      }
    />
  );
};

// With Zustand
const useTreeStore = create((set) => ({
  data: [],
  updateItemCheck: (id, checked) => set((state) => ({
    data: updateItemCheckedState(state.data, id, checked)
  }))
}));
```

### With React Query/SWR

```tsx
function AsyncTreeView() {
  const { data, isLoading, error } = useQuery('tree-data', fetchTreeData);

  if (isLoading) return <div>Loading tree...</div>;
  if (error) return <div>Error loading tree</div>;

  return (
    <TreeView
      data={data || []}
      onAction={(action, items) => {
        if (action === 'refresh') {
          queryClient.invalidateQueries('tree-data');
        }
      }}
    />
  );
}
```

## Common Use Cases

### File Explorer

```tsx
const FileExplorer = () => (
  <TreeView
    data={fileSystemData}
    showIcons={true}
    showSearch={true}
    disableSelection={false}
    showSelected={true}
    iconMap={{
      folder: <Folder className="h-4 w-4 text-blue-600" />,
      file: <File className="h-4 w-4 text-gray-600" />,
      image: <Image className="h-4 w-4 text-green-600" />
    }}
    menuItems={[
      {
        id: 'open',
        label: 'Open',
        action: (items) => openFiles(items)
      },
      {
        id: 'delete',
        label: 'Delete',
        action: (items) => deleteFiles(items)
      }
    ]}
  />
);
```

### Permission Management

```tsx
const PermissionManager = () => (
  <TreeView
    data={permissionData}
    showCheckboxes={true}
    readonly={!canEditPermissions}
    checkboxLabels={{
      check: "Grant Access",
      uncheck: "Revoke Access"
    }}
    onCheckChange={(item, checked) => {
      updatePermissions(item.id, checked);
    }}
  />
);
```

### Organization Hierarchy

```tsx
const OrganizationChart = () => (
  <TreeView
    data={orgData}
    showInfo={true}
    disableSelection={false}
    showSelected={true}
    getIcon={(item) => (
      <Avatar className="h-6 w-6">
        <AvatarImage src={item.avatar} />
        <AvatarFallback>{item.name[0]}</AvatarFallback>
      </Avatar>
    )}
  />
);
```

## Troubleshooting

### Common Issues

1. **Performance with Large Trees**
   ```tsx
   // Solution: Implement pagination or virtualization
   const [visibleDepth, setVisibleDepth] = useState(3);
   ```

2. **Checkbox State Not Updating**
   ```tsx
   // Ensure you're updating the data prop correctly
   setData(prevData => updateItemCheckedState(prevData, itemId, checked));
   ```

3. **Selection Not Working**
   ```tsx
   // Make sure disableSelection is false
   <TreeView disableSelection={false} />
   ```

4. **Context Menu Not Appearing**
   ```tsx
   // Ensure disableContextMenu is false and menuItems are provided
   <TreeView 
     disableContextMenu={false}
     menuItems={menuItems}
   />
   ```

### Debug Tips

```tsx
// Add logging to track state changes
const TreeViewDebug = () => {
  const [data, setData] = useState(treeData);

  useEffect(() => {
    console.log('Tree data updated:', data);
  }, [data]);

  return (
    <TreeView
      data={data}
      onSelectionChange={(items) => {
        console.log('Selection changed:', items);
      }}
      onCheckChange={(item, checked) => {
        console.log(`Checkbox changed: ${item.name} = ${checked}`);
        setData(prev => updateItemCheckedState(prev, item.id, checked));
      }}
    />
  );
};
```

## Browser Support

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile**: Responsive design works on mobile devices

## Dependencies

### Required Dependencies
- `react` (^16.8.0)
- `lucide-react` - Icons
- `framer-motion` - Animations
- `@radix-ui/react-collapsible` - Collapsible behavior
- `@radix-ui/react-context-menu` - Context menus
- `@radix-ui/react-hover-card` - Hover cards

### Development Dependencies
- `typescript` (recommended)
- `tailwindcss` (for styling)

## Version History

- **v1.0.0** - Initial release with basic tree functionality
- **v2.0.0** - Added drag selection, animations, and context menus
- **v3.0.0** - Added search, checkboxes, and accessibility improvements
- Current version includes all advanced features documented above

## Related Components

- [`SortButton`](SORTBUTTON_USAGE.md) - For sortable table headers
- [`DataPagination`](DATAPAGINATION_USAGE.md) - For paginating tree data
- [`Breadcrumbs`](BREADCRUMBS_USAGE.md) - For navigation context

---

For more information about other components, see the [component documentation index](README.md).
