const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Data file path
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = process.env.FRONTEND_URL 
            ? process.env.FRONTEND_URL.split(',')
            : ['http://localhost:3000', 'http://localhost:5173'];
            
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Load data from JSON file
const loadData = () => {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const rawData = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(rawData);
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
    
    // Return default data if file doesn't exist or has errors
    return {
        notifications: [],
        messages: [],
        tasks: [],
        searchData: []
    };
};

// Save data to JSON file
const saveData = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        return false;
    }
};

// Initialize data
let data = loadData();
let { notifications, messages, tasks, searchData } = data;

// Helper function to calculate time ago
const getTimeAgo = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor((now - created) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`;
};

// AI Assistant for Daily Morning Reminders
const aiAssistantName = "BrainBoard AI";
const aiMotivationalMessages = [
    "Good morning! 🌅 Ready to conquer today's challenges? Your tasks are waiting for your brilliance!",
    "Rise and shine! ✨ Today is a new opportunity to make progress on your goals. Let's get started!",
    "Morning motivation coming your way! 💪 Remember, every expert was once a beginner. Keep pushing forward!",
    "Hello there! 🎯 Your future self will thank you for the work you do today. Let's make it count!",
    "Good morning, achiever! 🚀 Small consistent actions lead to big results. What will you accomplish today?",
    "Wake up and be awesome! ⭐ Your tasks are stepping stones to your dreams. Time to take the next step!",
    "Morning reminder: You've got this! 💫 Focus on progress, not perfection. Let's tackle those tasks!",
    "Sunrise, new day, new possibilities! 🌟 Your dedication yesterday sets the stage for today's success.",
    "Good morning, goal-getter! 🎪 Each completed task is a victory. Ready to collect some wins today?",
    "Hey there, champion! 🏆 Consistency is your superpower. Time to activate it with today's tasks!"
];

const aiTaskSpecificMessages = [
    "I noticed you have some important tasks lined up! 📋 Breaking them into smaller steps makes everything manageable.",
    "Your task list is looking productive! 💼 Remember to take breaks between focused work sessions.",
    "Seeing some great goals on your board! 🎯 Prioritize the high-impact tasks for maximum momentum.",
    "Those pending tasks are opportunities in disguise! ✨ Each one completed brings you closer to your vision.",
    "Your learning journey is inspiring! 📚 Consistent practice with these tasks will compound over time.",
    "I love seeing your commitment to growth! 🌱 Today's efforts are tomorrow's achievements.",
    "Ready to turn those pending tasks into completed victories? 💪 You have everything you need to succeed!",
    "Your task board shows real intention and planning! 🎨 Execution is where the magic happens.",
    "Time to transform those ideas into action! ⚡ Start with the task that excites you most.",
    "Every task completed is a skill gained! 🎓 Learning through doing is the most powerful way to grow."
];

const aiTimeBasedMessages = {
    morning: [
        "The early bird catches the worm! 🐦 Morning focus sessions are often the most productive.",
        "Fresh mind, fresh start! 🧠 Your brain is at peak performance right now - perfect for tackling complex tasks.",
        "Morning energy is pure gold! ⚡ Use this time for your most important work.",
        "The calm before the day gets busy! 🌅 This is your power hour - make it count!"
    ],
    afternoon: [
        "Afternoon check-in! 🌞 How are you progressing with today's goals?",
        "Midday momentum! 💫 Perfect time to review and adjust your task priorities.",
        "Keep the energy flowing! 🔥 You're doing great - stay focused on what matters most."
    ],
    evening: [
        "Evening reflection time! 🌙 Take a moment to celebrate today's progress.",
        "Winding down productively! ✨ Planning tomorrow today sets you up for success.",
        "Great work today! 🎉 Rest well so you can bring your best energy tomorrow."
    ]
};

// Generate AI Assistant Message
const generateAIMessage = () => {
    const now = new Date();
    const hour = now.getHours();
    const pendingTasks = tasks.filter(task => task.status === 'pending');
    const completedToday = tasks.filter(task => {
        if (task.status === 'completed' && task.updatedAt) {
            const taskDate = new Date(task.updatedAt);
            return taskDate.toDateString() === now.toDateString();
        }
        return false;
    });

    let message = "";
    let title = "";

    // Determine time of day
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    
    if (hour >= 7 && hour <= 10) { // Morning reminders (7 AM - 10 AM)
        title = "🌅 Good Morning Reminder";
        const motivationalMsg = aiMotivationalMessages[Math.floor(Math.random() * aiMotivationalMessages.length)];
        
        if (pendingTasks.length > 0) {
            const taskMsg = aiTaskSpecificMessages[Math.floor(Math.random() * aiTaskSpecificMessages.length)];
            message = `${motivationalMsg}\n\n${taskMsg}\n\nYou have ${pendingTasks.length} task${pendingTasks.length > 1 ? 's' : ''} ready for your attention. Start with small steps and build momentum! 🚀`;
        } else {
            message = `${motivationalMsg}\n\nLooks like your task board is clear! Perfect time to set new learning goals or review your progress. What would you like to accomplish today? 🎯`;
        }
    } else if (hour >= 12 && hour <= 14) { // Midday check-in
        title = "🌞 Midday Motivation";
        message = `How's your day going so far? 💫\n\n`;
        if (completedToday.length > 0) {
            message += `Amazing! You've completed ${completedToday.length} task${completedToday.length > 1 ? 's' : ''} today. `;
        }
        if (pendingTasks.length > 0) {
            message += `You still have ${pendingTasks.length} task${pendingTasks.length > 1 ? 's' : ''} to tackle. `;
        }
        message += `\n\nRemember: Progress over perfection! Keep that momentum going! 💪`;
    } else {
        return null; // Don't send messages outside morning and midday hours
    }

    return {
        id: `msg_${uuidv4()}`,
        type: 'ai_reminder',
        sender: aiAssistantName,
        title,
        message,
        time: 'Just now',
        isRead: false,
        createdAt: new Date().toISOString(),
        aiGenerated: true,
        mood: timeOfDay === 'morning' ? 'energetic' : 'supportive'
    };
};

// Check and send daily AI reminders
const checkAndSendAIReminders = () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Only send in morning (7-10 AM) or midday (12-2 PM)
    if ((hour >= 7 && hour <= 10) || (hour >= 12 && hour <= 14)) {
        // Check if we already sent a message in the last 2 hours
        const recentMessages = messages.filter(msg => {
            if (msg.aiGenerated) {
                const msgTime = new Date(msg.createdAt);
                const timeDiff = (now - msgTime) / (1000 * 60 * 60); // hours
                return timeDiff < 2;
            }
            return false;
        });

        if (recentMessages.length === 0) {
            const aiMessage = generateAIMessage();
            if (aiMessage) {
                messages.unshift(aiMessage);
                data.messages = messages;
                saveData(data);
                console.log(`🤖 AI Assistant sent reminder: ${aiMessage.title}`);
            }
        }
    }
};

// Initialize AI assistant check (run every 30 minutes)
setInterval(checkAndSendAIReminders, 30 * 60 * 1000);

// Run AI check on startup
setTimeout(checkAndSendAIReminders, 5000); // 5 seconds after startup

// ============= NOTIFICATIONS CRUD =============

// GET all notifications
app.get('/api/notifications', (req, res) => {
    const notificationsWithTime = notifications.map(notif => ({
        ...notif,
        time: getTimeAgo(notif.createdAt)
    }));
    res.json(notificationsWithTime);
});

// GET notification by ID
app.get('/api/notifications/:id', (req, res) => {
    const notification = notifications.find(n => n.id === req.params.id);
    if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({
        ...notification,
        time: getTimeAgo(notification.createdAt)
    });
});

// POST create new notification
app.post('/api/notifications', (req, res) => {
    const { title, message } = req.body;
    
    if (!title || !message) {
        return res.status(400).json({ error: 'Title and message are required' });
    }
    
    const newNotification = {
        id: `notif_${uuidv4()}`,
        type: 'notification',
        title,
        message,
        time: 'Just now',
        isRead: false,
        createdAt: new Date().toISOString()
    };
    
    notifications.unshift(newNotification);
    
    // Save to file
    saveData({ notifications, messages, tasks, searchData });
    
    res.status(201).json(newNotification);
});

// PUT update notification
app.put('/api/notifications/:id', (req, res) => {
    const index = notifications.findIndex(n => n.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Notification not found' });
    }
    
    const { title, message, isRead } = req.body;
    notifications[index] = {
        ...notifications[index],
        ...(title && { title }),
        ...(message && { message }),
        ...(typeof isRead === 'boolean' && { isRead }),
        updatedAt: new Date().toISOString()
    };
    
    // Save to file
    saveData({ notifications, messages, tasks, searchData });
    
    res.json({
        ...notifications[index],
        time: getTimeAgo(notifications[index].createdAt)
    });
});

// DELETE notification
app.delete('/api/notifications/:id', (req, res) => {
    const index = notifications.findIndex(n => n.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Notification not found' });
    }
    
    notifications.splice(index, 1);
    
    // Save to file
    saveData({ notifications, messages, tasks, searchData });
    
    res.status(204).send();
});

// PATCH mark notification as read
app.patch('/api/notifications/:id/read', (req, res) => {
    const index = notifications.findIndex(n => n.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Notification not found' });
    }
    
    notifications[index].isRead = true;
    notifications[index].updatedAt = new Date().toISOString();
    
    // Save to file
    saveData({ notifications, messages, tasks, searchData });
    
    res.json({
        ...notifications[index],
        time: getTimeAgo(notifications[index].createdAt)
    });
});

// ============= MESSAGES CRUD =============

// GET all messages
app.get('/api/messages', (req, res) => {
    const messagesWithTime = messages.map(msg => ({
        ...msg,
        time: getTimeAgo(msg.createdAt)
    }));
    res.json(messagesWithTime);
});

// GET message by ID
app.get('/api/messages/:id', (req, res) => {
    const message = messages.find(m => m.id === req.params.id);
    if (!message) {
        return res.status(404).json({ error: 'Message not found' });
    }
    res.json({
        ...message,
        time: getTimeAgo(message.createdAt)
    });
});

// POST create new message
app.post('/api/messages', (req, res) => {
    const { sender, message } = req.body;
    
    if (!sender || !message) {
        return res.status(400).json({ error: 'Sender and message are required' });
    }
    
    const newMessage = {
        id: `msg_${uuidv4()}`,
        type: 'message',
        sender,
        message,
        time: 'Just now',
        isRead: false,
        createdAt: new Date().toISOString()
    };
    
    messages.unshift(newMessage);
    
    // Save to file
    saveData({ notifications, messages, tasks, searchData });
    
    res.status(201).json(newMessage);
});

// PUT update message
app.put('/api/messages/:id', (req, res) => {
    const index = messages.findIndex(m => m.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Message not found' });
    }
    
    const { sender, message, isRead } = req.body;
    messages[index] = {
        ...messages[index],
        ...(sender && { sender }),
        ...(message && { message }),
        ...(typeof isRead === 'boolean' && { isRead }),
        updatedAt: new Date().toISOString()
    };
    
    // Save to file
    saveData({ notifications, messages, tasks, searchData });
    
    res.json({
        ...messages[index],
        time: getTimeAgo(messages[index].createdAt)
    });
});

// DELETE message
app.delete('/api/messages/:id', (req, res) => {
    const index = messages.findIndex(m => m.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Message not found' });
    }
    
    messages.splice(index, 1);
    
    // Save to file
    saveData({ notifications, messages, tasks, searchData });
    
    res.status(204).send();
});

// POST trigger AI assistant message manually
app.post('/api/messages/ai-reminder', (req, res) => {
    const aiMessage = generateAIMessage();
    if (aiMessage) {
        messages.unshift(aiMessage);
        data.messages = messages;
        saveData(data);
        
        res.json({
            success: true,
            message: 'AI reminder generated successfully',
            aiMessage: {
                ...aiMessage,
                time: getTimeAgo(aiMessage.createdAt)
            }
        });
        console.log(`🤖 Manual AI Assistant reminder: ${aiMessage.title}`);
    } else {
        res.status(400).json({
            success: false,
            message: 'AI reminder not available at this time. Try again during morning (7-10 AM) or midday (12-2 PM) hours.'
        });
    }
});

// GET AI assistant status
app.get('/api/messages/ai-status', (req, res) => {
    const now = new Date();
    const hour = now.getHours();
    const recentAIMessages = messages.filter(msg => {
        if (msg.aiGenerated) {
            const msgTime = new Date(msg.createdAt);
            const timeDiff = (now - msgTime) / (1000 * 60 * 60);
            return timeDiff < 24; // Last 24 hours
        }
        return false;
    });

    res.json({
        aiAssistantName,
        currentHour: hour,
        isActiveHour: (hour >= 7 && hour <= 10) || (hour >= 12 && hour <= 14),
        recentMessages: recentAIMessages.length,
        lastMessageTime: recentAIMessages.length > 0 ? recentAIMessages[0].createdAt : null,
        totalAIMessages: messages.filter(msg => msg.aiGenerated).length
    });
});

// PATCH mark message as read
app.patch('/api/messages/:id/read', (req, res) => {
    const index = messages.findIndex(m => m.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Message not found' });
    }
    
    messages[index].isRead = true;
    messages[index].updatedAt = new Date().toISOString();
    
    // Save to file
    saveData({ notifications, messages, tasks, searchData });
    
    res.json({
        ...messages[index],
        time: getTimeAgo(messages[index].createdAt)
    });
});

// ============= TASKS CRUD =============

// GET all tasks
app.get('/api/tasks', (req, res) => {
    const { status, priority } = req.query;
    let filteredTasks = tasks;
    
    if (status) {
        filteredTasks = filteredTasks.filter(task => task.status === status);
    }
    
    if (priority) {
        filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }
    
    res.json(filteredTasks);
});

// GET today's focus task
app.get('/api/tasks/today', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const todayTask = tasks.find(task => 
        task.dueDate === today || 
        task.status === 'in-progress' ||
        task.title.toLowerCase().includes(new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase())
    );
    
    if (todayTask) {
        res.json(todayTask);
    } else {
        res.status(404).json({ error: 'No focus task found for today' });
    }
});

// GET task by ID
app.get('/api/tasks/:id', (req, res) => {
    const task = tasks.find(t => t.id === req.params.id);
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
});

// POST create new task
app.post('/api/tasks', (req, res) => {
    const { title, description, priority = 'medium', dueDate, status = 'pending' } = req.body;
    
    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }
    
    const newTask = {
        id: `task_${uuidv4()}`,
        title,
        description,
        status,
        priority,
        dueDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    tasks.unshift(newTask);
    
    // Save to file
    saveData({ notifications, messages, tasks, searchData });
    
    res.status(201).json(newTask);
});

// PUT update task
app.put('/api/tasks/:id', (req, res) => {
    const index = tasks.findIndex(t => t.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }
    
    const { title, description, status, priority, dueDate } = req.body;
    tasks[index] = {
        ...tasks[index],
        ...(title && { title }),
        ...(description && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate && { dueDate }),
        updatedAt: new Date().toISOString()
    };
    
    // Save to file
    saveData({ notifications, messages, tasks, searchData });
    
    res.json(tasks[index]);
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
    const index = tasks.findIndex(t => t.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }
    
    tasks.splice(index, 1);
    
    // Save to file
    saveData({ notifications, messages, tasks, searchData });
    
    res.status(204).send();
});

// ============= SEARCH CRUD =============

// GET search results - Search through tasks, notifications, and messages
app.get('/api/search', (req, res) => {
    const { q, category, type } = req.query;
    let results = [];
    
    if (q) {
        const query = q.toLowerCase();
        
        // Search through tasks
        const taskResults = tasks
            .filter(task => 
                task.title.toLowerCase().includes(query) ||
                task.description.toLowerCase().includes(query)
            )
            .map(task => ({
                id: task.id, // Use the original task ID without additional prefix
                title: task.title,
                description: task.description,
                category: 'task',
                type: 'task',
                status: task.status,
                priority: task.priority,
                originalData: task
            }));
        
        // Search through notifications
        const notificationResults = notifications
            .filter(notif => 
                notif.title.toLowerCase().includes(query) ||
                notif.message.toLowerCase().includes(query)
            )
            .map(notif => ({
                id: notif.id, // Use the original notification ID without additional prefix
                title: notif.title,
                description: notif.message,
                category: 'notification',
                type: 'notification',
                isRead: notif.isRead,
                originalData: notif
            }));
        
        // Search through messages
        const messageResults = messages
            .filter(msg => 
                msg.sender.toLowerCase().includes(query) ||
                msg.message.toLowerCase().includes(query)
            )
            .map(msg => ({
                id: msg.id, // Use the original message ID without additional prefix
                title: `Message from ${msg.sender}`,
                description: msg.message,
                category: 'message',
                type: 'message',
                isRead: msg.isRead,
                originalData: msg
            }));
        
        results = [...taskResults, ...notificationResults, ...messageResults];
        
        // Filter by category if specified
        if (category) {
            results = results.filter(item => item.category === category);
        }
        
        // Filter by type if specified  
        if (type) {
            results = results.filter(item => item.type === type);
        }
    }
    
    res.json(results);
});

// POST add search item
app.post('/api/search', (req, res) => {
    const { title, category = 'general', type = 'item' } = req.body;
    
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }
    
    const newItem = {
        id: Math.max(...searchData.map(s => s.id)) + 1,
        title,
        category,
        type
    };
    
    searchData.push(newItem);
    
    // Save to file
    saveData({ notifications, messages, tasks, searchData });
    
    res.status(201).json(newItem);
});

// DELETE search item
app.delete('/api/search/:id', (req, res) => {
    const index = searchData.findIndex(s => s.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ error: 'Search item not found' });
    }
    
    searchData.splice(index, 1);
    
    // Save to file
    saveData({ notifications, messages, tasks, searchData });
    
    res.status(204).send();
});

// ============= UTILITY ENDPOINTS =============

// GET dashboard stats
app.get('/api/stats', (req, res) => {
    const unreadNotifications = notifications.filter(n => !n.isRead).length;
    const unreadMessages = messages.filter(m => !m.isRead).length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    
    res.json({
        notifications: {
            total: notifications.length,
            unread: unreadNotifications
        },
        messages: {
            total: messages.length,
            unread: unreadMessages
        },
        tasks: {
            total: totalTasks,
            completed: completedTasks,
            pending: pendingTasks,
            inProgress: inProgressTasks
        }
    });
});

// PATCH mark all as read
app.patch('/api/mark-all-read', (req, res) => {
    notifications = notifications.map(n => ({ ...n, isRead: true, updatedAt: new Date().toISOString() }));
    messages = messages.map(m => ({ ...m, isRead: true, updatedAt: new Date().toISOString() }));
    
    // Save to file
    saveData({ notifications, messages, tasks, searchData });
    
    res.json({ message: 'All notifications and messages marked as read' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 BrainBoard API Server running on port ${PORT}`);
    console.log(`� Using JSON file storage: ${DATA_FILE}`);
    console.log(`�📊 API Health: http://localhost:${PORT}/api/health`);
    console.log(`📝 API Documentation: http://localhost:${PORT}/api/stats`);
    console.log(`📋 Loaded ${tasks.length} tasks, ${notifications.length} notifications, ${messages.length} messages`);
});

module.exports = app;
