// utils/rental.ts
import { RentalUser, RentalStatus } from 'types/rental';

// Export the RentalStatus type so it can be imported elsewhere
export type { RentalStatus } from 'types/rental';

export const getStatusBadgeConfig = (status: RentalStatus) => {
  const statusConfig = {
    BELUM_LUNAS: {
      color: 'bg-yellow-100 text-yellow-800',
      text: 'Belum Lunas',
    },
    LUNAS: {
      color: 'bg-green-100 text-green-800',
      text: 'Lunas',
    },
    TERLAMBAT: {
      color: 'bg-red-100 text-red-800',
      text: 'Terlambat',
    },
    SELESAI: {
      color: 'bg-gray-100 text-gray-800',
      text: 'Selesai',
    },
  };
  return (
    statusConfig[status] || {
      color: 'bg-gray-100 text-gray-800',
      text: status,
    }
  );
};

// Rest of your existing code remains the same...
/**
 * Format date string to localized format
 */
export const formatDate = (dateString: string, locale: string = 'id-ID') => {
  return new Date(dateString).toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Format date with time
 */
export const formatDateTime = (
  dateString: string,
  locale: string = 'id-ID',
) => {
  return new Date(dateString).toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format currency amount
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'IDR',
  locale: string = 'id-ID',
) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Get customer full name from user object
 */
export const getCustomerName = (user: RentalUser) => {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user.first_name || user.username;
};

/**
 * Get customer contact information
 */
export const getCustomerContact = (user: RentalUser) => {
  return user.phone_numbers || user.email || '-';
};

/**
 * Check if rental deletion is disabled based on status
 */
export const isDeletionDisabled = (status: RentalStatus) => {
  return status === 'LUNAS' || status === 'TERLAMBAT';
};

/**
 * Validate if status is a valid RentalStatus
 */
export const isValidStatus = (status: string): status is RentalStatus => {
  const validStatuses: RentalStatus[] = [
    'BELUM_LUNAS',
    'LUNAS',
    'TERLAMBAT',
    'SELESAI',
  ];
  return validStatuses.includes(status as RentalStatus);
};

/**
 * Get display text for status
 */
export const getStatusDisplayText = (status: RentalStatus) => {
  const statusText = {
    BELUM_LUNAS: 'Belum Lunas',
    LUNAS: 'Lunas',
    TERLAMBAT: 'Terlambat',
    SELESAI: 'Selesai',
  };
  return statusText[status] || status;
};

/**
 * Calculate rental duration in days
 */
export const calculateRentalDuration = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Check if rental is overdue
 */
export const isRentalOverdue = (endDate: string) => {
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
  end.setHours(0, 0, 0, 0);
  return end < today;
};

/**
 * Get rental status priority for sorting
 */
export const getRentalStatusPriority = (status: RentalStatus) => {
  const priorities = {
    TERLAMBAT: 1,
    BELUM_LUNAS: 2,
    LUNAS: 3,
    SELESAI: 4,
  };
  return priorities[status] || 5;
};

/**
 * Get all available status options
 */
export const getStatusOptions = () => [
  { value: 'BELUM_LUNAS', label: 'Belum Lunas' },
  { value: 'LUNAS', label: 'Lunas' },
  { value: 'TERLAMBAT', label: 'Terlambat' },
  { value: 'SELESAI', label: 'Selesai' },
];

/**
 * Format rental code for display
 */
export const formatRentalCode = (code: string) => {
  return code.toUpperCase();
};

/**
 * Calculate total rental cost including any additional fees
 */
export const calculateTotalCost = (
  basePrice: number,
  duration: number,
  additionalFees: number = 0,
) => {
  return basePrice * duration + additionalFees;
};

/**
 * Get rental status color for charts/graphs
 */
export const getStatusColor = (status: RentalStatus) => {
  const colors = {
    BELUM_LUNAS: '#f59e0b', // yellow
    LUNAS: '#10b981', // green
    TERLAMBAT: '#ef4444', // red
    SELESAI: '#6b7280', // gray
  };
  return colors[status] || '#6b7280';
};

/**
 * Check if rental can be edited based on status
 */
export const canEditRental = (status: RentalStatus) => {
  return status !== 'SELESAI';
};

/**
 * Check if rental status can be changed to another status
 */
export const canChangeStatusTo = (
  currentStatus: RentalStatus,
  newStatus: RentalStatus,
) => {
  // Define valid status transitions
  const validTransitions: Record<RentalStatus, RentalStatus[]> = {
    BELUM_LUNAS: ['LUNAS', 'TERLAMBAT'],
    LUNAS: ['SELESAI', 'TERLAMBAT'],
    TERLAMBAT: ['LUNAS', 'SELESAI'],
    SELESAI: [], 
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

/**
 * Get next possible statuses for a rental
 */
export const getNextPossibleStatuses = (currentStatus: RentalStatus) => {
  const transitions: Record<RentalStatus, RentalStatus[]> = {
    BELUM_LUNAS: ['LUNAS', 'TERLAMBAT'],
    LUNAS: ['SELESAI', 'TERLAMBAT'],
    TERLAMBAT: ['LUNAS', 'SELESAI'],
    SELESAI: [],
  };

  return transitions[currentStatus] || [];
};

/**
 * Check if rental is active (not completed)
 */
export const isRentalActive = (status: RentalStatus) => {
  return status !== 'SELESAI';
};

/**
 * Get time remaining until rental end date
 */
export const getTimeRemaining = (endDate: string) => {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();

  if (diffTime <= 0) {
    return { days: 0, hours: 0, isOverdue: true };
  }

  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );

  return { days, hours, isOverdue: false };
};

/**
 * Format time remaining for display
 */
export const formatTimeRemaining = (endDate: string) => {
  const { days, hours, isOverdue } = getTimeRemaining(endDate);

  if (isOverdue) {
    return 'Terlambat';
  }

  if (days > 0) {
    return `${days} hari ${hours} jam lagi`;
  }

  if (hours > 0) {
    return `${hours} jam lagi`;
  }

  return 'Kurang dari 1 jam';
};

/**
 * Generate rental summary text
 */
export const generateRentalSummary = (
  customerName: string,
  productName: string,
  startDate: string,
  endDate: string,
  status: RentalStatus,
) => {
  const duration = calculateRentalDuration(startDate, endDate);
  const statusText = getStatusDisplayText(status);

  return `${customerName} - ${productName} (${duration} hari) - ${statusText}`;
};

/**
 * Sort rentals by priority (overdue first, then by status priority)
 */
export const sortRentalsByPriority = (rentals: any[]) => {
  return [...rentals].sort((a, b) => {
    const aOverdue = isRentalOverdue(a.endDate);
    const bOverdue = isRentalOverdue(b.endDate);

    // Overdue items first
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    // Then by status priority
    const aPriority = getRentalStatusPriority(a.status);
    const bPriority = getRentalStatusPriority(b.status);

    return aPriority - bPriority;
  });
};

/**
 * Group rentals by status
 */
export const groupRentalsByStatus = (rentals: any[]) => {
  return rentals.reduce((groups, rental) => {
    const status = rental.status;
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(rental);
    return groups;
  }, {} as Record<RentalStatus, any[]>);
};

/**
 * Get rental statistics
 */
export const getRentalStatistics = (rentals: any[]) => {
  const total = rentals.length;
  const byStatus = groupRentalsByStatus(rentals);
  const overdue = rentals.filter((r) => isRentalOverdue(r.endDate)).length;

  return {
    total,
    belumLunas: byStatus.BELUM_LUNAS?.length || 0,
    lunas: byStatus.LUNAS?.length || 0,
    terlambat: byStatus.TERLAMBAT?.length || 0,
    selesai: byStatus.SELESAI?.length || 0,
    overdue,
  };
};