# DataPagination Component Usage

The `DataPagination` component provides a comprehensive pagination solution with the following features:

## Features

- Responsive design (adapts to mobile screens)
- Smart pagination with ellipsis for large page ranges
- Customizable sibling and boundary counts
- Accessible navigation with proper ARIA labels
- Page information display
- Disabled states for navigation buttons

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | `0` | Total number of records |
| `perPage` | `number` | `10` | Number of records per page |
| `page` | `number` | `1` | Current active page |
| `previousText` | `string` | `"Previous"` | Text for previous button |
| `nextText` | `string` | `"Next"` | Text for next button |
| `showPageInfo` | `boolean` | `true` | Whether to show record count info |
| `gotoPage` | `(page: number) => void` | `undefined` | Callback when page changes |
| `siblingCount` | `number` | `1` on desktop, `0` on mobile | Number of siblings around current page |
| `boundaryCount` | `number` | `1` | Number of pages at the beginning and end |

## Basic Usage

```tsx
import DataPagination from '@client/components/console/DataPagination';

const MyComponent = () => {
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState([]);
  const perPage = 10;
  const totalCount = 150; // Total records from API

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Fetch new data for the page
    fetchData(newPage);
  };

  return (
    <div>
      {/* Your data content */}
      <DataPagination
        count={totalCount}
        perPage={perPage}
        page={page}
        gotoPage={handlePageChange}
      />
    </div>
  );
};
```

## Advanced Usage with URL State

```tsx
import DataPagination from '@client/components/console/DataPagination';
import { useNavigate } from 'react-router';

const MyComponent = () => {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  
  const [page, setPage] = React.useState(Number(params.get('page')) || 1);
  const [perPage] = React.useState(10);
  const [totalCount, setTotalCount] = React.useState(0);

  const gotoPage = (newPage: number) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('page', newPage.toString());
    navigate(`${window.location.pathname}?${searchParams.toString()}`);
    setPage(newPage);
  };

  return (
    <div>
      {/* Your data content */}
      <DataPagination
        count={totalCount}
        perPage={perPage}
        page={page}
        gotoPage={gotoPage}
        showPageInfo={true}
        previousText="Prev"
        nextText="Next"
        siblingCount={2}
        boundaryCount={1}
      />
    </div>
  );
};
```

## Responsive Behavior

- On mobile devices, sibling count is automatically set to 0 to save space
- Page info text is hidden on very small screens
- Previous/Next button text is hidden on small screens, showing only icons

## Accessibility

- Proper ARIA labels for navigation
- Disabled states for unusable buttons
- Screen reader friendly ellipsis indicators
- Current page indication with `aria-current="page"`

## Styling

The component uses Tailwind CSS classes and can be customized by:
- Passing a `className` prop for the container
- Modifying the underlying UI components in `components/ui/pagination.tsx`
- Using CSS custom properties for theme customization
