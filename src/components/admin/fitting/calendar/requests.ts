import { CALENDAR_ITEMS_MOCK, USERS_MOCK } from './mocks';

export const getSchedule = async () => {
  // TO DO: implement this
  // Increase the delay to better see the loading state
  // await new Promise(resolve => setTimeout(resolve, 800));
  return CALENDAR_ITEMS_MOCK;
};

export const getUsers = async () => {
  // TO DO: implement this
  // Increase the delay to better see the loading state
  // await new Promise(resolve => setTimeout(resolve, 800));
  return USERS_MOCK;
};
