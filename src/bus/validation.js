import { body } from 'express-validator';

const busValidationRules = () => {
  return [
    body('adminId')
      .isMongoId()
      .withMessage('Admin ID must be a valid MongoDB Object ID'),
    body('startLocation')
      .notEmpty()
      .withMessage('Start location is required'),
    body('endLocation')
      .notEmpty()
      .withMessage('End location is required'),
    body('departureTime')
      .notEmpty()
      .withMessage('Departure time is required'),
    body('arrivalTime')
      .notEmpty()
      .withMessage('Arrival time is required'),
    body('date')
      .isISO8601()
      .toDate()
      .withMessage('Date must be a valid date format'),
    body('busCapacity')
      .isInt({ gt: 0 })
      .withMessage('Bus capacity must be a positive number'),
    body('busDetails')
      .notEmpty()
      .withMessage('Bus details are required'),
    body('fare')
      .isFloat({ gt: 0 })
      .withMessage('Fare must be a positive number'),
  ];
};

export { busValidationRules };
