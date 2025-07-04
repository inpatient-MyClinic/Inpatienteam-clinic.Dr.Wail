
// Function to save payment updates to global system (localStorage for demo)
export const savePaymentUpdateToSystem = (transactionId: string, newStatus: string) => {
  try {
    const existingUpdates = JSON.parse(localStorage.getItem('systemPaymentUpdates') || '{}');
    existingUpdates[transactionId] = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: 'finance'
    };
    localStorage.setItem('systemPaymentUpdates', JSON.stringify(existingUpdates));
    console.log(`Payment status for ${transactionId} saved to system:`, newStatus);
  } catch (error) {
    console.error('Failed to save payment update to system:', error);
  }
};

export const loadSystemPaymentUpdates = () => {
  try {
    return JSON.parse(localStorage.getItem('systemPaymentUpdates') || '{}');
  } catch (error) {
    console.error('Failed to load system payment updates:', error);
    return {};
  }
};
