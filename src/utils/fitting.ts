// utils/fitting.ts

// Define fitting status type
export type FittingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED' | 'CANCELED';

// Fitting status configuration
export const getFittingStatusConfig = (status: FittingStatus) => {
  const statusConfig = {
    PENDING: {
      color: 'bg-yellow-100 text-yellow-800',
      text: 'Pending',
    },
    CONFIRMED: {
      color: 'bg-green-100 text-green-800',
      text: 'Dikonfirmasi',
    },
    REJECTED: {
      color: 'bg-red-100 text-red-800',
      text: 'Ditolak',
    },
    COMPLETED: {
      color: 'bg-blue-100 text-blue-800',
      text: 'Selesai',
    },
    CANCELED: {
      color: 'bg-gray-100 text-gray-800',
      text: 'Dibatalkan',
    },
  };
  
  return (
    statusConfig[status] || {
      color: 'bg-gray-100 text-gray-800',
      text: status,
    }
  );
};

/**
 * Validate if status is a valid FittingStatus
 */
export const isValidFittingStatus = (status: string): status is FittingStatus => {
  const validStatuses: FittingStatus[] = [
    'PENDING',
    'CONFIRMED',
    'REJECTED',
    'COMPLETED',
    'CANCELED',
  ];
  return validStatuses.includes(status as FittingStatus);
};

/**
 * Get display text for fitting status
 */
export const getFittingStatusDisplayText = (status: FittingStatus) => {
  const statusText = {
    PENDING: 'Pending',
    CONFIRMED: 'Dikonfirmasi',
    REJECTED: 'Ditolak',
    COMPLETED: 'Selesai',
    CANCELED: 'Dibatalkan',
  };
  return statusText[status] || status;
};

/**
 * Get fitting status priority for sorting
 */
export const getFittingStatusPriority = (status: FittingStatus) => {
  const priorities = {
    PENDING: 1,
    CONFIRMED: 2,
    COMPLETED: 3,
    REJECTED: 4,
    CANCELED: 5,
  };
  return priorities[status] || 6;
};

/**
 * Get all available fitting status options
 */
export const getFittingStatusOptions = () => [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Dikonfirmasi' },
  { value: 'REJECTED', label: 'Ditolak' },
  { value: 'COMPLETED', label: 'Selesai' },
  { value: 'CANCELED', label: 'Dibatalkan' },
];

/**
 * Check if fitting can be edited based on status
 */
export const canEditFitting = (status: FittingStatus) => {
  return status !== 'COMPLETED' && status !== 'REJECTED' && status !== 'CANCELED';
};

/**
 * Check if fitting status can be changed to another status
 */
export const canChangeFittingStatusTo = (
  currentStatus: FittingStatus,
  newStatus: FittingStatus,
) => {
  // Define valid status transitions
  const validTransitions: Record<FittingStatus, FittingStatus[]> = {
    PENDING: ['CONFIRMED', 'REJECTED', 'CANCELED'],
    CONFIRMED: ['COMPLETED', 'CANCELED'],
    REJECTED: [],
    COMPLETED: [],
    CANCELED: [],
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

/**
 * Get next possible statuses for a fitting
 */
export const getNextPossibleFittingStatuses = (currentStatus: FittingStatus) => {
  const transitions: Record<FittingStatus, FittingStatus[]> = {
    PENDING: ['CONFIRMED', 'REJECTED', 'CANCELED'],
    CONFIRMED: ['COMPLETED', 'CANCELED'],
    REJECTED: [],
    COMPLETED: [],
    CANCELED: [],
  };

  return transitions[currentStatus] || [];
};

/**
 * Check if fitting is active (not completed, rejected, or canceled)
 */
export const isFittingActive = (status: FittingStatus) => {
  return status !== 'COMPLETED' && status !== 'REJECTED' && status !== 'CANCELED';
};

/**
 * Get fitting status color for charts/graphs
 */
export const getFittingStatusColor = (status: FittingStatus) => {
  const colors = {
    PENDING: '#f59e0b', // yellow
    CONFIRMED: '#10b981', // green
    REJECTED: '#ef4444', // red
    COMPLETED: '#3b82f6', // blue
    CANCELED: '#6b7280', // gray
  };
  return colors[status] || '#6b7280';
};

/**
 * Group fittings by status
 */
export const groupFittingsByStatus = (fittings: any[]) => {
  return fittings.reduce((groups, fitting) => {
    const status = fitting.status;
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(fitting);
    return groups;
  }, {} as Record<FittingStatus, any[]>);
};

/**
 * Sort fittings by priority
 */
export const sortFittingsByPriority = (fittings: any[]) => {
  return [...fittings].sort((a, b) => {
    const aPriority = getFittingStatusPriority(a.status);
    const bPriority = getFittingStatusPriority(b.status);
    return aPriority - bPriority;
  });
};

/**
 * Get fitting statistics
 */
export const getFittingStatistics = (fittings: any[]) => {
  const total = fittings.length;
  const byStatus = groupFittingsByStatus(fittings);

  return {
    total,
    pending: byStatus.PENDING?.length || 0,
    confirmed: byStatus.CONFIRMED?.length || 0,
    rejected: byStatus.REJECTED?.length || 0,
    completed: byStatus.COMPLETED?.length || 0,
    canceled: byStatus.CANCELED?.length || 0,
  };
};

/**
 * Format fitting appointment time
 */
export const formatFittingTime = (dateString: string, locale: string = 'id-ID') => {
  return new Date(dateString).toLocaleDateString(locale, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Check if fitting appointment is upcoming (within next 24 hours)
 */
export const isFittingUpcoming = (appointmentDate: string) => {
  const appointment = new Date(appointmentDate);
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  return appointment >= now && appointment <= tomorrow;
};

/**
 * Generate fitting summary text
 */
export const generateFittingSummary = (
  customerName: string,
  appointmentDate: string,
  status: FittingStatus,
) => {
  const statusText = getFittingStatusDisplayText(status);
  const dateText = formatFittingTime(appointmentDate);

  return `${customerName} - ${dateText} - ${statusText}`;
};