/**
 * Basic test to verify Jest setup is working correctly
 */
describe('Jest Setup', () => {
  it('should run tests successfully', () => {
    expect(true).toBe(true);
  });

  it('should have access to fast-check', () => {
    const fc = require('fast-check');
    expect(fc).toBeDefined();
  });
});
