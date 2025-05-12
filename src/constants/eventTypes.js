const EventTypes = {
  // User Events
  USER_LOGIN: "UserLogin",
  USER_SIGNUP: "UserSignUp",
  USER_RESET_PASSWORD: "UserResetPassword",
  USER_BOOK_TICKET: "UserBookTicket",
  USER_ORDER_RFID: "UserOrderRFID",

  // Admin Events
  ADMIN_ADD_ROUTE: "AdminAddRoute",
  ADMIN_ADD_BUS: "AdminAddBus",
  ADMIN_UPDATE_BUS: "AdminUpdateBus",
  ADMIN_ADD_DRIVER: "AdminAddDriver",
  ADMIN_UPDATE_DRIVER: "AdminUpdateDriver",
  ADMIN_ADD_VEHICLE: "AdminAddVehicle",

  // Super Admin Events
  SUPERADMIN_ADD_ADMIN: "SuperAdminAddAdmin",
  SUPERADMIN_DELIVER_RFID: "SuperAdminDeliverRFID",
  SUPERADMIN_DELETED_RFID: "SuperAdminDeletedRFID",

  // Driver Events
  DRIVER_START_TRIP: "DriverStartTrip",
  DRIVER_END_TRIP: "DriverEndTrip",
};

export default EventTypes;
