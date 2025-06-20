export type TCalendarView = 'day' | 'week' | 'month' | 'year' | 'agenda';
export type TEventColor =
  | 'blue'
  | 'green'
  | 'red'
  | 'yellow'
  | 'purple'
  | 'orange'
  | 'gray';

export type ISODateString = string;
export interface IEvent {
  id: number;
  startDate: ISODateString;
  endDate: ISODateString;
  title: string;
  color: TEventColor;
  description: string;
  user: IUser;
}


export interface IEventInput {
  startDateTime: string; 
  endDateTime: string;
  title: string;
  description?: string;
  userId: string; 
}

export interface ICalendarCell {
  day: number;
  currentMonth: boolean;
  date: Date;
}

export interface IUser {
  id: number;
  first_name: string;
  last_name?: string;
  username: string;
  email: string;
  createdAt: Date;
  password?: string;
  businessAddress?: string;
  businessName?: string;
  phone_numbers?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'OWNER';
  clerkUserId: string;
  imageUrl?: string;
}

export interface IFittingSchedule {
  id: number;
  userId: number;
  fittingSlotId: number;
  duration: number;
  startTime: Date; 
  endTime: Date;
  title: string;
  color: TEventColor;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED' | 'CANCELED';
  user: IUser;
  fittingSlot: IFittingSlot;
  FittingProduct: IFittingProduct[];
}

export interface IFittingSlot {
  id: number;
  ownerId: number;
  dateTime: Date;
  isAutoConfirm: boolean;
  isBooked: boolean;
  owner: IUser;
  fittingSchedule?: IFittingSchedule;
}

export interface IWeeklySlot {
  id: number;
  ownerId: number;
  dayOfWeek: 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
  isEnabled: boolean;
  startTime: string; 
  endTime: string; 
  owner: IUser;
}

export interface IScheduleBlock {
  id: number;
  ownerId: number;
  startTime: Date;
  endTime: Date;
  description: string;
  owner: IUser;
}

export interface IFittingProduct {
  fittingId: number;
  variantProductId: number;
  fitting: IFittingSchedule;
  variantProduct: IVariantProduct;
}

export interface IVariantProduct {
  id: number;
  size: string;
  color: string;
  price: number;
  isAvailable: boolean;
  createdAt: Date;
  productsId: number;
  bustlength?: number;
  waistlength?: number;
  length?: number;
  isRented: boolean;
  sku: string;
}

export type TBadgeVariant = 'colored' | 'dot' | 'mixed';

export type TWorkingHours = {
  [key in 0 | 1 | 2 | 3 | 4 | 5 | 6]: {
    from: number;
    to: number;
  };
};

export type TVisibleHours = {
  from: number;
  to: number;
};

export type FittingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED' | 'CANCELED';
export type UserRole = 'CUSTOMER' | 'ADMIN' | 'OWNER';