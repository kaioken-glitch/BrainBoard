import React, { useState, useRef, useEffect } from 'react'
import logo from '../assets/logo.svg'
import { FaBell, FaEnvelope, FaSearch, FaPlus, FaBars, FaTimes, FaTasks, FaComment, FaCheckCircle, FaSync } from 'react-icons/fa'
import { useData } from '../context/DataContext'

export default function HeaderMobile({ onTaskCreated }) {
    const {
        notifications,
        messages,
        combinedList,
        bellCount,
        messageCount,
        isRefreshing,
        handleRefresh,
        search,
        createTask,
        markAllAsRead
    } = useData();

    const [searchValue, setSearchValue] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState([]);
    const [showMenu, setShowMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showCreateTaskForm, setShowCreateTaskForm] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskPriority, setTaskPriority] = useState('medium');

    const searchRef = useRef(null);
    const menuRef = useRef(null);

    // Handle search
    const handleSearch = async () => {
        if (!searchValue.trim()) {
            setResults([]);
            setShowResults(false);
            return;
        }

        try {
            const searchResults = await search(searchValue);
            setResults(searchResults);
            setShowResults(true);
        } catch (error) {
            console.error('Search failed:', error);
            setResults([]);
            setShowResults(true);
        }
    };

    // Handle task creation
    const handleAddTask = async () => {
        if (taskTitle.trim() && taskDescription.trim()) {
            try {
                const taskData = {
                    title: taskTitle,
                    description: taskDescription,
                    priority: taskPriority
                };
                
                const newTask = await createTask(taskData);
                
                // Notify parent component
                if (onTaskCreated) {
                    onTaskCreated(newTask);
                }
                
                // Clear form and close
                setTaskTitle('');
                setTaskDescription('');
                setTaskPriority('medium');
                setShowCreateTaskForm(false);
                setShowMenu(false);
                
            } catch (error) {
                console.error('Failed to create task:', error);
            }
        }
    };

    // Close menus when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowResults(false);
            }
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        }

        if (showResults || showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [showResults, showMenu]);

    // Get icon for search results
    const getItemIcon = (type) => {
        switch (type) {
            case 'task':
                return <FaTasks className="text-white w-[12px] h-[12px]" />;
            case 'notification':
                return <FaBell className="text-white w-[12px] h-[12px]" />;
            case 'message':
                return <FaComment className="text-white w-[12px] h-[12px]" />;
            default:
                return <FaSearch className="text-white w-[12px] h-[12px]" />;
        }
    };

    const getItemColor = (type, status) => {
        switch (type) {
            case 'task':
                return status === 'completed' ? 'bg-green-500' : 
                       status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-500';
            case 'notification':
                return 'bg-orange-500';
            case 'message':
                return 'bg-purple-500';
            default:
                return 'bg-blue-500';
        }
    };

    return (
        <header className="w-full h-[70px] pt-[10px] bg-white shadow-sm border-b border-gray-100 px-4 flex items-center justify-between relative z-50">
            
            {/* Logo - Left Side */}
            <div className="logo flex items-center">
                <img src={logo} alt="Logo" className="w-[80px] h-[32px]" />
            </div>

            {/* Center - Search (when expanded) or title */}
            <div className="flex-1 mx-4" ref={searchRef}>
                {showSearch && (
                    <div className="relative">
                        <div className="flex items-center bg-gray-100 rounded-full px-3 py-2">
                            <FaSearch className="text-gray-400 w-[14px] h-[14px] mr-2" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="flex-1 bg-transparent outline-none text-[14px] text-gray-700"
                                autoFocus
                            />
                            <button
                                onClick={() => {
                                    setShowSearch(false);
                                    setSearchValue('');
                                    setShowResults(false);
                                }}
                                className="ml-2 text-gray-400"
                            >
                                <FaTimes className="w-[12px] h-[12px]" />
                            </button>
                        </div>

                        {/* Search Results */}
                        {showResults && (
                            <div className="absolute top-[50px] left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[300px] overflow-y-auto z-50">
                                {results.length > 0 ? (
                                    <>
                                        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                                            <p className="text-[12px] text-gray-600 font-medium">
                                                {results.length} result{results.length !== 1 ? 's' : ''} found
                                            </p>
                                        </div>
                                        {results.map(item => (
                                            <div key={item.id} className="p-3 border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-[28px] h-[28px] rounded-md flex items-center justify-center ${getItemColor(item.type, item.status)}`}>
                                                        {getItemIcon(item.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-[13px] font-medium text-gray-800 truncate">{item.title}</h4>
                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                                                                item.type === 'task' ? 'bg-blue-100 text-blue-600' :
                                                                item.type === 'notification' ? 'bg-orange-100 text-orange-600' :
                                                                item.type === 'message' ? 'bg-purple-100 text-purple-600' :
                                                                'bg-gray-100 text-gray-600'
                                                            }`}>
                                                                {item.type}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-gray-500 mt-1 truncate">
                                                            {item.description || 'Tap to view details'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="p-4 text-center">
                                        <FaSearch className="w-[24px] h-[24px] text-gray-300 mx-auto mb-2" />
                                        <p className="text-[13px] text-gray-500">No results found</p>
                                        <p className="text-[11px] text-gray-400 mt-1">Try different keywords</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center gap-2">
                
                {/* Search Toggle */}
                {!showSearch && (
                    <button
                        onClick={() => setShowSearch(true)}
                        className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    >
                        <FaSearch className="w-[16px] h-[16px] text-gray-600" />
                    </button>
                )}

                {/* Refresh Button */}
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50"
                >
                    <FaSync className={`w-[16px] h-[16px] text-gray-600 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>

                {/* Notifications */}
                <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                    <FaBell className="w-[16px] h-[16px] text-gray-600" />
                    {(bellCount + messageCount) > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-medium">
                            {bellCount + messageCount}
                        </span>
                    )}
                </button>

                {/* Menu Toggle */}
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    ref={menuRef}
                >
                    {showMenu ? (
                        <FaTimes className="w-[16px] h-[16px] text-gray-600" />
                    ) : (
                        <FaBars className="w-[16px] h-[16px] text-gray-600" />
                    )}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {showMenu && (
                <div className="absolute top-[60px] right-4 w-[280px] bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4">
                        <button
                            onClick={() => {
                                console.log('Mobile create task button clicked');
                                setShowCreateTaskForm(true);
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 transition-colors"
                        >
                            <FaPlus className="w-[14px] h-[14px]" />
                            <span className="text-[14px] font-medium">Create Task</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Notifications Panel */}
            {showNotifications && (
                <div className="absolute top-[60px] right-4 w-[300px] max-h-[400px] bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-[14px] font-semibold text-gray-800">Notifications</h3>
                        <button
                            onClick={markAllAsRead}
                            className="text-[12px] text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Mark all read
                        </button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                        {combinedList.length > 0 ? (
                            combinedList.map((item) => (
                                <div key={item.id} className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${!item.isRead ? 'bg-blue-50' : ''} ${item.aiGenerated ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-400' : ''}`}>
                                    <div className="flex items-start gap-3">
                                        <div className={`w-[6px] h-[6px] rounded-full mt-2 ${!item.isRead ? (item.aiGenerated ? 'bg-purple-500' : 'bg-blue-500') : 'bg-transparent'}`}></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                {item.aiGenerated && (
                                                    <span className="text-[9px] px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold">
                                                        🤖
                                                    </span>
                                                )}
                                                <p className={`text-[13px] font-medium ${!item.isRead ? 'text-gray-900' : 'text-gray-600'} ${item.aiGenerated ? 'text-purple-700' : ''}`}>
                                                    {item.type === 'message' || item.type === 'ai_reminder' ? 
                                                        (item.aiGenerated ? (item.title || 'BrainBoard AI') : item.sender) : 
                                                        item.title
                                                    }
                                                </p>
                                            </div>
                                            {item.aiGenerated && item.mood && (
                                                <p className="text-[10px] text-purple-500 mt-1">
                                                    {item.mood === 'energetic' ? '⚡ Energetic Mode' : 
                                                     item.mood === 'supportive' ? '💫 Supportive Mode' : '✨ Friendly Mode'}
                                                </p>
                                            )}
                                            <p className="text-[12px] text-gray-500 mt-1 line-clamp-2">
                                                {item.message}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-1">{item.time}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center">
                                <FaBell className="w-[24px] h-[24px] text-gray-300 mx-auto mb-2" />
                                <p className="text-[13px] text-gray-500">No notifications</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create Task Form Modal */}
            {showCreateTaskForm && console.log('Rendering modal with showCreateTaskForm:', showCreateTaskForm) && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
                        onClick={() => setShowCreateTaskForm(false)}
                    ></div>
                    
                    {/* Modal */}
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <div 
                            className="bg-white rounded-lg w-full max-w-[350px] max-h-[90vh] overflow-y-auto shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-[16px] font-semibold text-gray-800">Create Task</h3>
                                <button
                                    onClick={() => setShowCreateTaskForm(false)}
                                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <FaTimes className="w-[14px] h-[14px] text-gray-600" />
                                </button>
                            </div>
                            
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-2">Task Title</label>
                                    <input
                                        type="text"
                                        placeholder="Enter task title..."
                                        value={taskTitle}
                                        onChange={(e) => setTaskTitle(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        placeholder="Enter task description..."
                                        value={taskDescription}
                                        onChange={(e) => setTaskDescription(e.target.value)}
                                        rows="3"
                                        className="w-full p-3 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-2">Priority</label>
                                    <select
                                        value={taskPriority}
                                        onChange={(e) => setTaskPriority(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="p-4 border-t border-gray-100 flex gap-3">
                                <button
                                    onClick={() => setShowCreateTaskForm(false)}
                                    className="flex-1 p-3 border border-gray-300 rounded-lg text-[14px] font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddTask}
                                    disabled={!taskTitle.trim() || !taskDescription.trim()}
                                    className="flex-1 p-3 bg-blue-500 text-white rounded-lg text-[14px] font-medium hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

        </header>
    )
}
