// Helper function to save data after any modification
const updateAndSave = (type, operation, ...args) => {
    try {
        const result = operation(...args);
        saveData({ notifications, messages, tasks, searchData });
        return result;
    } catch (error) {
        console.error(`Error in ${type} operation:`, error);
        throw error;
    }
};

module.exports = { updateAndSave };
