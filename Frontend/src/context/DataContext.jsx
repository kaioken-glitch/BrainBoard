import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';

const DataContext = createContext();

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

export const DataProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [messages, setMessages] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Load all initial data
    const loadInitialData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [notificationsData, messagesData, tasksData] = await Promise.all([
                apiService.getNotifications(),
                apiService.getMessages(),
                apiService.getTasks()
            ]);
            
            setNotifications(notificationsData);
            setMessages(messagesData);
            setTasks(tasksData);
        } catch (error) {
            console.error('Failed to load initial data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Handle refresh with animation timeout
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await loadInitialData();
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            // Keep animation for 2 seconds minimum
            setTimeout(() => {
                setIsRefreshing(false);
            }, 2000);
        }
    }, [loadInitialData]);

    // Search functionality
    const search = useCallback(async (searchValue) => {
        if (!searchValue.trim()) {
            return [];
        }
        try {
            return await apiService.search(searchValue);
        } catch (error) {
            console.error('Search failed:', error);
            return [];
        }
    }, []);

    // Create task
    const createTask = useCallback(async (taskData) => {
        try {
            const newTask = await apiService.createTask(taskData);
            setTasks(prev => [newTask, ...prev]);
            return newTask;
        } catch (error) {
            console.error('Failed to create task:', error);
            throw error;
        }
    }, []);

    // Update task
    const updateTask = useCallback(async (taskId, updateData) => {
        try {
            const updatedTask = await apiService.updateTask(taskId, updateData);
            setTasks(prev => prev.map(task => 
                task.id === taskId ? updatedTask : task
            ));
            return updatedTask;
        } catch (error) {
            console.error('Failed to update task:', error);
            throw error;
        }
    }, []);

    // Delete task
    const deleteTask = useCallback(async (taskId) => {
        try {
            await apiService.deleteTask(taskId);
            setTasks(prev => prev.filter(task => task.id !== taskId));
        } catch (error) {
            console.error('Failed to delete task:', error);
            throw error;
        }
    }, []);

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        try {
            await apiService.markAllAsRead();
            setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
            setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    }, []);

    // Load data on mount
    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    // Computed values
    const bellCount = notifications.filter(n => !n.isRead).length;
    const messageCount = messages.filter(m => !m.isRead).length;
    const combinedList = [...notifications, ...messages];

    const value = {
        // Data
        notifications,
        messages,
        tasks,
        combinedList,
        bellCount,
        messageCount,
        
        // Loading states
        isLoading,
        isRefreshing,
        
        // Actions
        loadInitialData,
        handleRefresh,
        search,
        createTask,
        updateTask,
        deleteTask,
        markAllAsRead,
        
        // Setters for direct updates
        setNotifications,
        setMessages,
        setTasks
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
