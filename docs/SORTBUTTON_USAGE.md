# SortButton Component Documentation

## Overview

The `SortButton` component is a reusable React component that provides sorting functionality for table columns or data lists. It displays a button with a label and visual indicators showing the current sort state (ascending/descending) with intuitive arrow icons.

## Features

- **Visual Sort Indicators**: Shows arrow icons (ArrowDownAZ/ArrowDownZA) to indicate sort direction
- **Flexible Styling**: Uses Tailwind CSS classes and can be customized via props
- **Accessible**: Built on top of a Button component with proper semantic structure
- **Responsive Design**: Adapts to different screen sizes with appropriate sizing
- **Type Safe**: Written in TypeScript with comprehensive prop types

## Installation

This component depends on the following packages:
- React
- Lucide React (for icons)
- A Button component from your UI library

```bash
npm install lucide-react
```

## Basic Usage

```tsx
import SortButton from "@/components/sort-button";

function DataTable() {
  const [sort, setSort] = useState("name");
  const [order, setOrder] = useState("asc");

  const handleSort = (column: string) => {
    if (sort === column) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSort(column);
      setOrder("asc");
    }
  };

  return (
    <div className="table-header">
      <SortButton
        column="name"
        label="Name"
        sort={sort}
        order={order}
        sortBy={handleSort}
      />
      <SortButton
        column="email"
        label="Email"
        sort={sort}
        order={order}
        sortBy={handleSort}
      />
    </div>
  );
}
```

## Props Interface

```typescript
interface SortButtonProps {
  column: string;          // The column identifier for sorting
  label: string;           // Display text for the button
  sort: string;            // Currently active sort column
  order: string;           // Sort order: "asc" or "desc"
  sortBy: (column: string) => void; // Callback function when button is clicked
  [key: string]: any;      // Additional props passed to Button component
}
```

### Prop Details

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `column` | `string` | `""` | Yes | Unique identifier for the column being sorted |
| `label` | `string` | `""` | Yes | Text displayed on the button |
| `sort` | `string` | `""` | Yes | Currently active sort column identifier |
| `order` | `string` | `"asc"` | Yes | Current sort order ("asc" or "desc") |
| `sortBy` | `function` | `() => {}` | Yes | Callback function triggered on button click |
| `...rest` | `any` | - | No | Additional props forwarded to the Button component |

## Visual States

### Inactive State
When the button's column is not the currently sorted column:
- Shows only the label text
- No arrow icons displayed
- Standard ghost button styling

### Active Ascending State
When `sort === column` and `order === "asc"`:
- Shows label text with ArrowDownAZ icon
- Icon positioned on the right side
- Indicates A-Z or 1-9 sorting

### Active Descending State  
When `sort === column` and `order === "desc"`:
- Shows label text with ArrowDownZA icon
- Icon positioned on the right side
- Indicates Z-A or 9-1 sorting

## Styling

The component uses the following CSS classes:
- `flex items-center gap-1 w-full` - Main button layout
- `grow text-left` - Label text alignment
- `text-foreground/70` - Icon opacity

### Customization

You can customize the button appearance by passing additional props:

```tsx
<SortButton
  column="name"
  label="Name"
  sort={sort}
  order={order}
  sortBy={handleSort}
  className="custom-styles"
  variant="outline"
  size="lg"
/>
```

## Advanced Usage

### With Custom Styling

```tsx
<SortButton
  column="createdDate"
  label="Created Date"
  sort={currentSort}
  order={sortOrder}
  sortBy={handleColumnSort}
  className="bg-blue-50 hover:bg-blue-100"
  variant="outline"
/>
```

### In Table Headers

```tsx
function UserTable() {
  const [sortConfig, setSortConfig] = useState({
    column: 'name',
    order: 'asc'
  });

  const handleSort = (column: string) => {
    setSortConfig(prev => ({
      column,
      order: prev.column === column && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <table>
      <thead>
        <tr>
          <th>
            <SortButton
              column="name"
              label="Full Name"
              sort={sortConfig.column}
              order={sortConfig.order}
              sortBy={handleSort}
            />
          </th>
          <th>
            <SortButton
              column="email"
              label="Email Address"
              sort={sortConfig.column}
              order={sortConfig.order}
              sortBy={handleSort}
            />
          </th>
          <th>
            <SortButton
              column="role"
              label="User Role"
              sort={sortConfig.column}
              order={sortConfig.order}
              sortBy={handleSort}
            />
          </th>
        </tr>
      </thead>
    </table>
  );
}
```

## Integration Patterns

### With Data Fetching

```tsx
function UserList() {
  const [users, setUsers] = useState([]);
  const [sort, setSort] = useState('name');
  const [order, setOrder] = useState('asc');

  useEffect(() => {
    fetchUsers({ sortBy: sort, sortOrder: order })
      .then(setUsers);
  }, [sort, order]);

  const handleSort = (column: string) => {
    if (sort === column) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(column);
      setOrder('asc');
    }
  };

  return (
    <div>
      <div className="filters">
        <SortButton
          column="name"
          label="Name"
          sort={sort}
          order={order}
          sortBy={handleSort}
        />
      </div>
      <div className="data">
        {users.map(user => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}
```

### With URL State Management

```tsx
import { useSearchParams } from 'react-router-dom';

function DataList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sort = searchParams.get('sort') || 'name';
  const order = searchParams.get('order') || 'asc';

  const handleSort = (column: string) => {
    const newOrder = sort === column && order === 'asc' ? 'desc' : 'asc';
    setSearchParams({ sort: column, order: newOrder });
  };

  return (
    <SortButton
      column="name"
      label="Name"
      sort={sort}
      order={order}
      sortBy={handleSort}
    />
  );
}
```

## Accessibility

The component maintains good accessibility practices:
- Uses semantic button element
- Proper focus management through Button component
- Visual indicators for sort state
- Keyboard navigation support

## Dependencies

- **React**: Core framework
- **Lucide React**: Icon library for ArrowDownAZ and ArrowDownZA icons
- **Button Component**: Base button component from your UI library
- **TypeScript**: For type safety (optional but recommended)

## Browser Support

The component works in all modern browsers that support:
- ES6+ JavaScript features
- CSS Flexbox
- React 16.8+ (for hooks)

## Performance Considerations

- Component is lightweight with minimal re-renders
- Icons are imported statically, no dynamic loading
- Uses React.memo() optimization if needed for large lists

## Troubleshooting

### Common Issues

1. **Icons not displaying**: Ensure `lucide-react` is properly installed
2. **Styling issues**: Check that Button component is properly imported and styled
3. **Click not working**: Verify `sortBy` function is passed and properly implemented
4. **Type errors**: Ensure all required props are provided with correct types

### Debug Tips

```tsx
// Add console logging to debug sort state
const handleSort = (column: string) => {
  console.log('Sorting by:', column, 'Current:', sort, order);
  sortBy(column);
};
```

## Related Components

- `DataPagination` - For paginating sorted data
- `Button` - Base button component
- `InputGroup` - For search/filter inputs

## Version History

- **v1.0.0** - Initial implementation with basic sort functionality
- Current implementation includes TypeScript support and Lucide React icons

---

For more information about other components, see the [component documentation index](README.md).
