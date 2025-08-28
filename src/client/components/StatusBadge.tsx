import React from 'react'
import { Badge } from './ui/badge';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  if (status === 'inactive') {
    return <Badge variant="destructive">Inactive</Badge>;
  } else {
    return <Badge>Active</Badge>;
  }
}

export default StatusBadge;