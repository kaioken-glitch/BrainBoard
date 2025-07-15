import { useState } from 'react';
import { useRef, useEffect } from 'react';
import logo from '../assets/logo.svg';
import {  FaBell, FaCheckCircle, FaEnvelope, FaMicroscope, FaPlusCircle, FaSync, FaTasks, FaComment, FaExclamationTriangle } from 'react-icons/fa'
import apiService from '../services/apiService';

{/*this is the header Component */}
export default function Header({ onTaskCreated }) {
    const [bellCount, setBellCount] = useState(0);
    const [messageCount, setMessageCount] = useState(0);
    const [searchValue, setSearchValue] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showCreateTaskForm, setShowCreateTaskForm] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskPriority, setTaskPriority] = useState('medium');
    const [taskDueDate, setTaskDueDate] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [taskCount, setTaskCount] = useState(0);
    // Load initial data from API
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setIsLoading(true);
            const [notificationsData, messagesData, tasksData] = await Promise.all([
                apiService.getNotifications(),
                apiService.getMessages(),
                apiService.getTasks()
            ]);
            
            setNotifications(notificationsData);
            setMessages(messagesData);
            setTaskCount(tasksData.length);
            
            // Update badge counts
            const unreadNotifs = notificationsData.filter(n => !n.isRead).length;
            const unreadMsgs = messagesData.filter(m => !m.isRead).length;
            setBellCount(unreadNotifs);
            setMessageCount(unreadMsgs);
        } catch (error) {
            console.error('Failed to load initial data:', error);
            // Add error notification
            setNotifications(prev => [{
                id: `error_${Date.now()}`,
                type: 'notification',
                title: 'Connection Error',
                message: 'Failed to load data from server. Please check your connection.',
                time: 'Just now',
                isRead: false
            }, ...prev]);
        } finally {
            setIsLoading(false);
        }
    };

    // Dynamic functions for managing notifications and messages via API
    const addNotification = async (title, message) => {
        try {
            const newNotification = await apiService.createNotification(title, message);
            setNotifications(prev => [newNotification, ...prev]);
            setBellCount(prev => prev + 1);
        } catch (error) {
            console.error('Failed to create notification:', error);
        }
    };

    const addMessage = async (sender, message) => {
        try {
            const newMessage = await apiService.createMessage(sender, message);
            setMessages(prev => [newMessage, ...prev]);
            setMessageCount(prev => prev + 1);
        } catch (error) {
            console.error('Failed to create message:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await apiService.markAllAsRead();
            setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
            setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
            setBellCount(0);
            setMessageCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const markItemAsRead = async (id, type) => {
        try {
            if (type === 'notification') {
                await apiService.markNotificationAsRead(id);
                setNotifications(prev => prev.map(notif => 
                    notif.id === id ? { ...notif, isRead: true } : notif
                ));
            } else {
                await apiService.markMessageAsRead(id);
                setMessages(prev => prev.map(msg => 
                    msg.id === id ? { ...msg, isRead: true } : msg
                ));
            }
            
            // Update badge counts
            const unreadNotifs = notifications.filter(n => !n.isRead && n.id !== id).length;
            const unreadMsgs = messages.filter(m => !m.isRead && m.id !== id).length;
            setBellCount(unreadNotifs);
            setMessageCount(unreadMsgs);
        } catch (error) {
            console.error('Failed to mark item as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await apiService.deleteNotification(id);
            setNotifications(prev => prev.filter(notif => notif.id !== id));
            // Recalculate badge count
            const remainingUnread = notifications.filter(n => !n.isRead && n.id !== id).length;
            setBellCount(remainingUnread);
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const deleteMessage = async (id) => {
        try {
            await apiService.deleteMessage(id);
            setMessages(prev => prev.filter(msg => msg.id !== id));
            // Recalculate badge count
            const remainingUnread = messages.filter(m => !m.isRead && m.id !== id).length;
            setMessageCount(remainingUnread);
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    };

    // Calculate dynamic counts based on unread items
    useEffect(() => {
        const unreadNotifs = notifications.filter(n => !n.isRead).length;
        const unreadMsgs = messages.filter(m => !m.isRead).length;
        setBellCount(unreadNotifs);
        setMessageCount(unreadMsgs);
    }, [notifications, messages]);

    const combinedList = [...notifications, ...messages];
    
    const handleRefreshClick = async () => {
        setIsRefreshing(true);
        
        try {
            // Clear search results
            setSearchValue('');
            setShowResults(false);
            setResults([]);
            
            // Use context refresh function instead
            await handleRefresh();
            
            // Add a new notification about refresh
            await addNotification('System Refresh', 'Dashboard data has been refreshed successfully');
            
            // Reload data again to include the new notification
            await loadInitialData();
            
        } catch (error) {
            console.error('Refresh failed:', error);
            await addNotification('Refresh Error', 'Failed to refresh dashboard data');
            await loadInitialData(); // Reload to show error notification
        } finally {
            // Keep animation for 2 seconds minimum
            setTimeout(() => {
                setIsRefreshing(false);
            }, 2000);
        }
    };

    const handleCreateTaskClick = () => {
        setShowCreateTaskForm(!showCreateTaskForm);
    };

    const handleAddTask = async () => {
        if (taskTitle.trim() && taskDescription.trim()) {
            try {
                const taskData = {
                    title: taskTitle,
                    description: taskDescription,
                    priority: taskPriority,
                    dueDate: taskDueDate || null
                };
                
                const newTask = await apiService.createTask(taskData);
                
                // Add success notification
                await addNotification('New Task Created', `Task "${taskTitle}" has been created successfully`);
                
                // Notify FocusCard about the new task
                if (onTaskCreated) {
                    onTaskCreated(newTask);
                }
                
                // Clear form
                setTaskTitle('');
                setTaskDescription('');
                setTaskPriority('medium');
                setTaskDueDate('');
                setShowCreateTaskForm(false);
                
                console.log('New Task Created:', newTask);
            } catch (error) {
                console.error('Failed to create task:', error);
                await addNotification('Task Creation Failed', 'Failed to create task. Please try again.');
            }
        } else {
            await addNotification('Task Creation Failed', 'Please fill in both title and description');
        }
    };

    const handleTaskFormKeyDown = (e) => {
        if (e.key === 'Escape') {
            setShowCreateTaskForm(false);
        }
    };

    const searchRef = useRef(null);

    useEffect(() =>{
        function handleClickoutside(e){
            if(searchRef.current && !searchRef.current.contains(e.target)){
                setShowResults(false);
            }
        }
        if(showResults){
            document.addEventListener('mousedown', handleClickoutside);
        }return () => {
            document.removeEventListener('mousedown', handleClickoutside);
        };
    }, [showResults]);

    const handleSearch = async () => {
        if (!searchValue.trim()) {
            setResults([]);
            setShowResults(false);
            return;
        }

        try {
            const searchResults = await apiService.search(searchValue);
            setResults(searchResults);
            setShowResults(true);
        } catch (error) {
            console.error('Search failed:', error);
            setResults([]);
            setShowResults(true);
        }
    };

    function handleInputKeyDown(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    }

    return (
        
        <header className="w-full h-[45px] bg-transparent mt-[10px] mb-[10px] 
        flex flex-row items-center justify-start pl-[20px]">

            {/**this is the search container */}
            <div className="searchContainer w-[400px] h-[40px] flex flex-row item-center justify-center
                rounded-[20px]  shadow-[0px_7px_29px_0px_rgba(100,100,111,0.2)] select-none
                bg-aliceblue-50 mr-[10px]" ref={searchRef}
            >

                <button className="searchButton w-[40px] h-[40px] rounded-[20px] flex
                items-center justify-center cursor-pointer" onClick={handleSearch}>
                    <FaMicroscope className='text-gray-300 w-[18px] h-[18px]' />
                </button>
                <input type="text" name="search" id="search" placeholder="Search..." 
                className='text-gray-950 w-[350px] h-[40px] bg-transparent border-none outline-none'
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
                />

                {showResults && (
                    <div className="resultsDiv pt-2 pb-2 flex flex-col absolute top-[60px] left-5 w-[400px] 
                    bg-white rounded-[12px] shadow-[0px_10px_40px_0px_rgba(100,100,111,0.3)] border border-gray-100 z-50">
                        {results.length > 0 ? (
                            <>
                                <div className="px-3 py-2 border-b border-gray-100">
                                    <p className="text-[12px] text-gray-500 font-medium">
                                        {results.length} result{results.length !== 1 ? 's' : ''} found
                                    </p>
                                </div>
                                {results.map(item => {
                                    // Determine icon and colors based on item type
                                    const getItemIcon = (type) => {
                                        switch (type) {
                                            case 'task':
                                                return <FaTasks className="text-white w-[14px] h-[14px]" />;
                                            case 'notification':
                                                return <FaBell className="text-white w-[14px] h-[14px]" />;
                                            case 'message':
                                                return <FaComment className="text-white w-[14px] h-[14px]" />;
                                            default:
                                                return <FaMicroscope className="text-white w-[14px] h-[14px]" />;
                                        }
                                    };

                                    const getItemColor = (type, status) => {
                                        switch (type) {
                                            case 'task':
                                                return status === 'completed' ? 'bg-green-500 group-hover:bg-green-600' : 
                                                       status === 'in-progress' ? 'bg-blue-500 group-hover:bg-blue-600' : 
                                                       'bg-gray-500 group-hover:bg-gray-600';
                                            case 'notification':
                                                return 'bg-orange-500 group-hover:bg-orange-600';
                                            case 'message':
                                                return 'bg-purple-500 group-hover:bg-purple-600';
                                            default:
                                                return 'bg-blue-500 group-hover:bg-blue-600';
                                        }
                                    };

                                    return (
                                        <div key={item.id} className="resultItem mx-2 my-1 p-3 rounded-[8px] 
                                        text-gray-900 cursor-pointer border border-transparent
                                        hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 ease-in-out
                                        group">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`iconContainer w-[32px] h-[32px] rounded-[6px] 
                                                    flex items-center justify-center transition-colors duration-200 ${
                                                        getItemColor(item.type, item.status)
                                                    }`}>
                                                        {getItemIcon(item.type)}
                                                    </div>
                                                    <div className="textContent flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-[14px] font-semibold text-gray-800 group-hover:text-blue-600 
                                                            transition-colors duration-200">{item.title}</h4>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                                                item.type === 'task' ? 'bg-blue-100 text-blue-600' :
                                                                item.type === 'notification' ? 'bg-orange-100 text-orange-600' :
                                                                item.type === 'message' ? 'bg-purple-100 text-purple-600' :
                                                                'bg-gray-100 text-gray-600'
                                                            }`}>
                                                                {item.type}
                                                            </span>
                                                        </div>
                                                        <p className="text-[12px] text-gray-500 mt-1 line-clamp-2">
                                                            {item.description || 'Click to view details'}
                                                        </p>
                                                        {item.status && (
                                                            <p className="text-[11px] text-gray-400 mt-1">
                                                                Status: <span className="capitalize">{item.status}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="arrowIcon opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        ) : (
                        <div className="resultItem p-4 text-center">
                            <div className="flex flex-col items-center justify-center py-4">
                                <div className="iconContainer w-[48px] h-[48px] bg-gray-100 rounded-full 
                                flex items-center justify-center mb-3">
                                    <FaMicroscope className="text-gray-400 w-[20px] h-[20px]" />
                                </div>
                                <p className="text-[14px] text-gray-600 font-medium">No results found</p>
                                <p className="text-[12px] text-gray-400 mt-1">Try searching for tasks, notifications, or messages</p>
                            </div>
                        </div>
                    )}
                    </div>
                )}
            </div>

            {/*this is the refresh Button*/}
            <div className="refreshContainer group p-2 w-[auto] h-[40px] flex  items-center justify-center
            bg-aliceblue-50 rounded-[20px] shadow-[0px_7px_29px_0px_rgba(100,100,111,0.2)] select-none">

                <button 
                    className="refreshButton gap-4 w-[150px] h-[40px] rounded-[20px] flex flex-row
                    items-center justify-around cursor-pointer disabled:cursor-not-allowed"
                    onClick={handleRefreshClick}
                    disabled={isRefreshing}
                >
                    <FaSync className={`text-gray-400 w-[12px] h-[12px] transition-all duration-1500 ease 
                    group-hover:text-gray-950 ${isRefreshing ? 'animate-spin text-blue-500' : 'group-hover:rotate-[270deg]'}`} />
                    <span className={`pr-[4px] text-[12px] transition-all duration-1500 ease
                    group-hover:text-gray-950 ${isRefreshing ? 'text-blue-500' : 'text-gray-400'}`}>
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </span>
                </button>

            </div>   

            {/*this is a notification fand message badge display div */}
            <div className="notificationContainer w-[90px] h-[40px] flex items-center justify-center
            rounded-[20px]  shadow-[0px_7px_29px_0px_rgba(100,100,111,0.2)]  select-none 
            bg-aliceblue-50 ml-[10px] group
            ">

                <button className="messageNotification  w-[40px] h-[40px] rounded-[20px] flex
                items-center justify-center cursor-pointer relative" onClick={() => setShowNotifications(!showNotifications)}>
                    <FaEnvelope className='text-blue-900 w-[12px] h-[12px] hover:text-gray-950
                    ease transition-all duration-500' />
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full 
                    w-4 h-4 flex items-center justify-center
                    ">
                        {messageCount}
                    </span>
                </button>

                <button className="notificationButton relative w-[40px] h-[40px] rounded-[20px] flex
                items-center justify-center cursor-pointer" onClick={() => setShowNotifications(!showNotifications)}>
                    <FaBell className='text-blue-900 w-[12px] h-[12px] hover:text-gray-950
                    ease transition-all duration-500' />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full 
                    w-4 h-4 flex items-center justify-center
                    ">
                        {bellCount}
                    </span>
                </button>

                {showNotifications && <div className="notificationsDisplay absolute top-[60px] left-[600px] w-[250px] max-h-[250px] bg-white
                    rounded-lg shadow-lg z-50 flex flex-col">
                    <div className="notificationHeader sticky top-0 bg-white w-full h-[40px] flex flex-row items-center justify-between mb-4 
                    p-4 border-b border-gray-100 z-10 mt-[10px]">
                        <h3 className=" text-gray-800 mb-2 text-[12px]">Notifications & Messages</h3>
                        <button className="text-[12px] text-gray-500 hover:text-green-700 flex flex-row items-center
                        justify-center gap-2 cursor-pointer select-none" onClick={markAllAsRead}>
                            <FaCheckCircle className='w-[12px] h-[12px]' />
                            Mark all as read
                        </button>
                    </div>
                    <div className="overflow-y-auto flex-1 px-4 pb-4">
                    {combinedList.length > 0 ? (
                        <div className="notificationList flex flex-col">
                            {combinedList.map((item) => (
                                <div key={item.id} className={`notificationItem p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${!item.isRead ? 'bg-blue-50' : ''} group`}>
                                    <div className="flex flex-col">
                                        {item.type === 'message' || item.type === 'ai_reminder' ? (
                                            <>
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-2">
                                                        {item.aiGenerated && (
                                                            <span className="text-xs px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold">
                                                                🤖 AI
                                                            </span>
                                                        )}
                                                        <span className={`font-semibold ${item.aiGenerated ? 'text-purple-600' : 'text-blue-600'} text-xs ${!item.isRead ? 'font-bold' : ''}`}>
                                                            {item.aiGenerated ? (item.title || 'BrainBoard AI') : item.sender}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {!item.isRead && <div className={`w-2 h-2 ${item.aiGenerated ? 'bg-purple-500' : 'bg-blue-500'} rounded-full`}></div>}
                                                        <span className="text-gray-400 text-xs">{item.time}</span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteMessage(item.id);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 
                                                            transition-all duration-200 text-xs ml-1"
                                                            title="Delete message"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                </div>
                                                {item.aiGenerated && item.mood && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <span className="text-xs text-purple-500">
                                                            {item.mood === 'energetic' ? '⚡ Energetic' : 
                                                             item.mood === 'supportive' ? '💫 Supportive' : '✨ Friendly'}
                                                        </span>
                                                    </div>
                                                )}
                                                <div 
                                                    className={`text-gray-800 text-xs mt-2 ${!item.isRead ? 'font-medium' : ''} ${item.aiGenerated ? 'bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border-l-4 border-purple-400' : ''}`}
                                                    onClick={() => markItemAsRead(item.id, item.type)}
                                                >
                                                    {item.message}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-start">
                                                    <span className={`font-semibold text-green-600 text-xs ${!item.isRead ? 'font-bold' : ''}`}>{item.title}</span>
                                                    <div className="flex items-center gap-2">
                                                        {!item.isRead && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                                                        <span className="text-gray-400 text-xs">{item.time}</span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteNotification(item.id);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 
                                                            transition-all duration-200 text-xs ml-1"
                                                            title="Delete notification"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                </div>
                                                <p 
                                                    className={`text-gray-800 text-xs mt-1 ${!item.isRead ? 'font-medium' : ''}`}
                                                    onClick={() => markItemAsRead(item.id, item.type)}
                                                >{item.message}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="notificationItem p-2 text-gray-900 text-center">
                            {isLoading ? 'Loading...' : 'No new notifications or messages'}
                        </div>
                    )}
                    </div>
                </div>}

            </div>

            {/*this is the create task button and form*/}
            <div className="createTaskDiv relative ml-[20px]">
                <button 
                    className="createTaskButton flex flex-row items-center justify-center gap-2
                    w-[150px] h-[40px] rounded-[20px] bg-blue-500 text-white hover:bg-blue-600
                    transition-all duration-300 ease-in-out cursor-pointer shadow-[0px_7px_29px_0px_rgba(100,100,111,0.2)]"
                    onClick={handleCreateTaskClick}
                >
                    <FaPlusCircle className="w-[14px] h-[14px]" />
                    <span className="text-[12px] font-medium">Create Task</span>
                </button>

                {showCreateTaskForm && (
                    <div className="createTaskForm absolute top-[50px] right-0 w-[350px] bg-white rounded-[12px] 
                    shadow-[0px_10px_40px_0px_rgba(100,100,111,0.3)] border border-gray-200 p-6 z-50"
                    onKeyDown={handleTaskFormKeyDown}>
                        <div className="formHeader mb-4">
                            <h3 className="text-[18px] font-bold text-gray-800 mb-2">Create New Task</h3>
                            <p className="text-[12px] text-gray-500">Fill in the details to create a new task</p>
                        </div>

                        <div className="formBody space-y-4">
                            <div className="inputGroup">
                                <label htmlFor="taskTitle" className="block text-[14px] font-medium text-gray-700 mb-2">
                                    Task Title
                                </label>
                                <input 
                                    type="text" 
                                    name="taskTitle" 
                                    id="taskTitle" 
                                    placeholder="Enter task title..." 
                                    value={taskTitle}
                                    onChange={(e) => setTaskTitle(e.target.value)}
                                    className="w-full h-[40px] px-3 border border-gray-300 rounded-[8px] 
                                    focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                                    text-[14px] text-gray-700"
                                />
                            </div>

                            <div className="inputGroup">
                                <label htmlFor="taskDescription" className="block text-[14px] font-medium text-gray-700 mb-2">
                                    Task Description
                                </label>
                                <textarea 
                                    name="taskDescription" 
                                    id="taskDescription" 
                                    placeholder="Enter task description..."
                                    value={taskDescription}
                                    onChange={(e) => setTaskDescription(e.target.value)}
                                    rows="3.5"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-[8px] 
                                    focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                                    text-[14px] text-gray-700 resize-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <div className="inputGroup flex-1">
                                    <label htmlFor="taskPriority" className="block text-[14px] font-medium text-gray-700 mb-2">
                                        Priority
                                    </label>
                                    <select
                                        name="taskPriority"
                                        id="taskPriority"
                                        value={taskPriority}
                                        onChange={(e) => setTaskPriority(e.target.value)}
                                        className="w-full h-[40px] px-3 border border-gray-300 rounded-[8px] 
                                        focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                                        text-[14px] text-gray-700"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                <div className="inputGroup flex-1">
                                    <label htmlFor="taskDueDate" className="block text-[14px] font-medium text-gray-700 mb-2">
                                        Due Date (Optional)
                                    </label>
                                    <input 
                                        type="date" 
                                        name="taskDueDate" 
                                        id="taskDueDate" 
                                        value={taskDueDate}
                                        onChange={(e) => setTaskDueDate(e.target.value)}
                                        className="w-full h-[40px] px-3 border border-gray-300 rounded-[8px] 
                                        focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                                        text-[14px] text-gray-700"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="formFooter flex justify-between items-center mt-6">
                            <button 
                                type="button" 
                                onClick={() => setShowCreateTaskForm(false)}
                                className="cancelBtn px-4 py-2 text-[14px] text-gray-600 hover:text-gray-800
                                transition-colors duration-200 font-medium"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                onClick={handleAddTask}
                                className="createTaskSubmitButton flex items-center gap-2 px-6 py-2 bg-blue-500 
                                text-white rounded-[8px] hover:bg-blue-600 transition-colors duration-200
                                text-[14px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!taskTitle.trim() || !taskDescription.trim()}
                            >
                                <FaPlusCircle className='w-[12px] h-[12px]' />
                                Add Task
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/*this is the logo container*/}
            <div className="logoCContainer ml-auto mr-[20px] w-[120px] h-[40px] flex items-center justify-center">
                <a href='/' className='flex items-center justify-center'>
                    <img src={logo} alt="Logo" className="w-[120px] h-[40px] rounded-full ml-[10px]" />
                </a>
            </div>

        </header>
    )
}
