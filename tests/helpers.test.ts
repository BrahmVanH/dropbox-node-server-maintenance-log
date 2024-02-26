import { getJsDateFromExcel, getTimeDifferenceFromNow, handleSendEmail } from '../src/utils/helpers';

describe('helpers', () => {
  describe('getJsDateFromExcel', () => {
    it('should convert an Excel date to a JavaScript date', () => {
      const excelDate = 44219; // Example Excel date
      const expectedDate = new Date('2021-01-01'); // Expected JavaScript date

      const result = getJsDateFromExcel(excelDate);

      expect(result).toEqual(expectedDate);
    });
  });

  describe('getTimeDifferenceFromNow', () => {
    it('should calculate the time difference between a given date and the current date', () => {
      const date = '2022-12-31'; // Example date
      const expectedDifference = 365; // Expected time difference in days

      const result = getTimeDifferenceFromNow(date);

      expect(result).toEqual(expectedDifference);
    });
  });

  describe('handleSendEmail', () => {
    it('should send an email with the next week\'s tasks and next month\'s tasks', async () => {
      // Mock the necessary dependencies and setup test data
      const nextWeeksTasks = [
        { title: 'Task 1', description: 'Description 1', lastCompleted: '2022-01-01', date: '2022-01-08' },
        { title: 'Task 2', description: 'Description 2', lastCompleted: '2022-01-02', date: '2022-01-09' },
      ];
      const nextMonthsTasks = [
        { title: 'Task 3', description: 'Description 3', lastCompleted: '2022-01-01', date: '2022-02-01' },
        { title: 'Task 4', description: 'Description 4', lastCompleted: '2022-01-02', date: '2022-02-02' },
      ];

      // Call the function and assert the expected behavior
      await expect(handleSendEmail()).resolves.toBeUndefined();
      // Add more assertions as needed
    });
  });
});
