import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import Breadcrumbs, { 
  BreadcrumbItem, 
  useBreadcrumbs, 
  createBreadcrumbItems,
  createBreadcrumbItem 
} from './Breadcrumbs';

// Example icons (you can use any icon library)
const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

const FolderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
  </svg>
);

export const BreadcrumbsExample = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Example 1: Basic usage with static items
  const basicBreadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/console", icon: <HomeIcon /> },
    { label: "System", href: "/console/system", icon: <FolderIcon /> },
    { label: "Users", href: "/console/system/users", icon: <UserIcon /> },
    { label: "Add User" }
  ];

  // Example 2: Using the custom hook for dynamic breadcrumbs
  const {
    items: dynamicBreadcrumbs,
    addItem,
    removeItem,
    updateItem,
    replaceItems,
    clearItems
  } = useBreadcrumbs([
    createBreadcrumbItem("Dashboard", "/console", { icon: <HomeIcon /> })
  ]);

  // Example 3: Creating breadcrumbs with utility functions
  const utilityBreadcrumbs = createBreadcrumbItems([
    { label: "Home", href: "/console", icon: <HomeIcon /> },
    { label: "System", href: "/console/system" },
    { label: "Roles", href: "/console/system/roles" },
    { label: "Edit Role", disabled: true }
  ]);

  // Handlers for dynamic breadcrumbs
  const handleAddBreadcrumb = () => {
    const newItem = createBreadcrumbItem(
      `Item ${dynamicBreadcrumbs.length}`,
      `/path/${dynamicBreadcrumbs.length}`,
      { icon: <FolderIcon /> }
    );
    addItem(newItem);
  };

  const handleRemoveLastBreadcrumb = () => {
    if (dynamicBreadcrumbs.length > 1) {
      removeItem(dynamicBreadcrumbs.length - 1);
    }
  };

  const handleBreadcrumbClick = (item: BreadcrumbItem, index: number) => {
    console.log('Breadcrumb clicked:', item, 'at index:', index);
    if (item.href) {
      navigate(item.href);
    }
  };

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Enhanced Breadcrumbs Examples</h1>

      {/* Example 1: Basic Breadcrumbs */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">1. Basic Breadcrumbs with Icons</h2>
        <Breadcrumbs 
          items={basicBreadcrumbs}
          onItemClick={handleBreadcrumbClick}
          showMobileItems={true}
        />
      </div>

      {/* Example 2: Dynamic Breadcrumbs */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">2. Dynamic Breadcrumbs (React State)</h2>
        <Breadcrumbs 
          items={dynamicBreadcrumbs}
          onItemClick={handleBreadcrumbClick}
        />
        <div className="flex gap-2">
          <button 
            onClick={handleAddBreadcrumb}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Add Item
          </button>
          <button 
            onClick={handleRemoveLastBreadcrumb}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm"
          >
            Remove Last
          </button>
          <button 
            onClick={clearItems}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Example 3: Loading State */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">3. Loading State</h2>
        <Breadcrumbs 
          items={utilityBreadcrumbs}
          loading={loading}
        />
        <button 
          onClick={simulateLoading}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm"
        >
          Simulate Loading
        </button>
      </div>

      {/* Example 4: Max Items with Ellipsis */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">4. Max Items (with ellipsis)</h2>
        <Breadcrumbs 
          items={[
            { label: "Level 1", href: "/1" },
            { label: "Level 2", href: "/2" },
            { label: "Level 3", href: "/3" },
            { label: "Level 4", href: "/4" },
            { label: "Level 5", href: "/5" },
            { label: "Current Level" }
          ]}
          maxItems={4}
          onItemClick={handleBreadcrumbClick}
        />
      </div>

      {/* Example 5: Custom Separator */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">5. Custom Separator</h2>
        <Breadcrumbs 
          items={basicBreadcrumbs}
          separator={<span className="mx-2 text-gray-400">→</span>}
        />
      </div>

      {/* Example 6: Mobile Visible */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">6. Mobile Visible Breadcrumbs</h2>
        <Breadcrumbs 
          items={basicBreadcrumbs}
          showMobileItems={true}
          className="bg-gray-50 p-2 rounded"
        />
      </div>
    </div>
  );
};

export default BreadcrumbsExample;
