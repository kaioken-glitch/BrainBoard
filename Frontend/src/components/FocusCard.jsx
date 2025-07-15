import React, { useState, useRef, useEffect, useCallback } from 'react'
import studyImage from '../assets/StudyFocus.png'
import { FaCheckCircle, FaClock, FaEdit, FaStar, FaChevronLeft, FaChevronRight, FaPlus, FaTrash, FaFire, FaBullseye } from 'react-icons/fa'
import { useData } from '../context/DataContext'

export default function FocusCard({ onNewTask }) {
    const { tasks, isLoading, updateTask, deleteTask, createTask } = useData();
    
    const [isCompleted, setIsCompleted] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [focusText, setFocusText] = useState("Loading today's focus...");
    const [todayTask, setTodayTask] = useState(null);
    const [weeklyTasks, setWeeklyTasks] = useState([]);

    const scrollContainerRef = useRef(null);
    
    // Update tasks when context data changes
    useEffect(() => {
        if (tasks && tasks.length > 0) {
            const todayTaskData = tasks[0]; // First task as today's focus
            setTodayTask(todayTaskData);
            setFocusText(todayTaskData.title);
            setIsCompleted(todayTaskData.status === 'completed');
            setWeeklyTasks(tasks.slice(0, 10)); // Show first 10 tasks
        } else {
            setFocusText("No focus set for today");
            setTodayTask(null);
            setWeeklyTasks([]);
        }
    }, [tasks]);

    const refreshTaskData = useCallback(async () => {
        // Data will be automatically updated via context
    }, []);

    const addNewTaskToList = useCallback((newTask) => {
        // Data will be automatically updated via context
    }, []);

    // Expose refresh function to parent component
    useEffect(() => {
        if (onNewTask && typeof onNewTask === 'function') {
            // Only call once when the component mounts
            onNewTask(refreshTaskData, addNewTaskToList);
        }
    }, [onNewTask, refreshTaskData, addNewTaskToList]);

    const loadTaskData = async () => {
        try {
            setIsLoading(true);
            
            // Load all tasks from context
            const allTasks = tasks;
            
            // Use the first task as today's focus (index 0)
            const todayTaskData = allTasks.length > 0 ? allTasks[0] : null;
            
            if (todayTaskData) {
                setTodayTask(todayTaskData);
                setFocusText(todayTaskData.title);
                setIsCompleted(todayTaskData.status === 'completed');
            } else {
                setTodayTask(null);
                setFocusText("Click to set today's focus");
                setIsCompleted(false);
            }
            
            // Set weekly tasks
            setWeeklyTasks(allTasks);
            
        } catch (error) {
            console.error('Failed to load task data:', error);
            setFocusText("Failed to load tasks. Click to set manually.");
        } finally {
            setIsLoading(false);
        }
    };

    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            const updatedTask = await updateTask(taskId, { status: newStatus });
            
            // Update local state
            if (todayTask && todayTask.id === taskId) {
                setTodayTask(updatedTask);
                setIsCompleted(newStatus === 'completed');
            }
            
            setWeeklyTasks(prev => prev.map(task => 
                task.id === taskId ? updatedTask : task
            ));
            
        } catch (error) {
            console.error('Failed to update task status:', error);
        }
    };

    const updateTaskTitle = async (taskId, newTitle) => {
        try {
            const updatedTask = await updateTask(taskId, { title: newTitle });
            
            if (todayTask && todayTask.id === taskId) {
                setTodayTask(updatedTask);
            }
            
            setWeeklyTasks(prev => prev.map(task => 
                task.id === taskId ? updatedTask : task
            ));
            
        } catch (error) {
            console.error('Failed to update task title:', error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await deleteTask(taskId);
            
            if (todayTask && todayTask.id === taskId) {
                setTodayTask(null);
                setFocusText("Click to set today's focus");
                setIsCompleted(false);
            }
            
            setWeeklyTasks(prev => prev.filter(task => task.id !== taskId));
            
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };



    const weekTopics = weeklyTasks.map((task, index) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        progress: task.status === 'completed' ? 100 : 
                 task.status === 'in-progress' ? 75 : 0,
        priority: task.priority,
        dueDate: task.dueDate
    }));
    
    const getCurrentDate = () => {
        const today = new Date();
        return today.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const handleComplete = async () => {
        if (todayTask) {
            const newStatus = isCompleted ? 'pending' : 'completed';
            await updateTaskStatus(todayTask.id, newStatus);
        } else {
            // If no task exists, create one
            if (focusText && focusText !== "Click to set today's focus") {
                try {
                    const newTask = await createTask({
                        title: focusText,
                        description: "Today's focus task",
                        status: 'completed',
                        priority: 'high'
                    });
                    setTodayTask(newTask);
                    setIsCompleted(true);
                } catch (error) {
                    console.error('Failed to create today\'s task:', error);
                }
            }
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        setIsEditing(false);
        
        if (todayTask && focusText !== todayTask.title) {
            await updateTaskTitle(todayTask.id, focusText);
        } else if (!todayTask && focusText.trim() && focusText !== "Click to set today's focus") {
            // Create new task if none exists
            try {
                const newTask = await createTask({
                    title: focusText,
                    description: "Today's focus task",
                    status: 'pending',
                    priority: 'high'
                });
                setTodayTask(newTask);
            } catch (error) {
                console.error('Failed to create today\'s task:', error);
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        }
    };

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -320, // Card width + gap
                behavior: 'smooth'
            });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 320, // Card width + gap
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="focusCard w-[70%] h-[100%] bg-transparent p-2  overflow-y-auto shrink-0">
            
            {/*this div will display the days plan for the current date*/}
            <div className={`dayTopic w-[100%] h-[350px] bg-white p-4 shadow-[0px_7px_29px_0px_rgba(100,100,111,0.2)]
            flex flex-col items-start justify-between rounded-[12px]  
            select-none bg-gradient-to-br from-blue-50 to-indigo-100
            transition-all duration-300 hover:shadow-[0px_10px_40px_0px_rgba(100,100,111,0.3)] border border-blue-100
            ${isCompleted ? 'opacity-75 bg-gradient-to-br from-green-50 to-emerald-100' : ''}`}>
                
                {/* Header Section */}
                <div className="headerSection w-full flex flex-col">
                    <div className="titleRow flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-2">
                            <FaStar className="text-yellow-500 w-[20px] h-[20px]" />
                            <h2 className='text-[28px] font-bold text-blue-700'>Today's Focus</h2>
                        </div>
                        <div className="actionButtons flex items-center gap-2">
                            <button 
                                onClick={handleEdit}
                                className="editBtn p-2 rounded-full hover:bg-blue-200 transition-colors duration-200"
                            >
                                <FaEdit className="text-blue-600 w-[14px] h-[14px]" />
                            </button>
                            <button 
                                onClick={handleComplete}
                                className={`completeBtn p-2 rounded-full transition-colors duration-200 ${
                                    isCompleted ? 'bg-green-200 hover:bg-green-300' : 'hover:bg-gray-200'
                                }`}
                            >
                                <FaCheckCircle className={`w-[16px] h-[16px] ${isCompleted ? 'text-green-600' : 'text-gray-400'}`} />
                            </button>
                        </div>
                    </div>
                    <div className="dateRow flex items-center gap-2 mb-4">
                        <FaClock className="text-gray-500 w-[14px] h-[14px]" />
                        <span className="text-[14px] text-gray-600 font-medium">{getCurrentDate()}</span>
                    </div>
                </div>

                {/* Image Section */}
                <div className="imageSection w-full flex justify-center mb-4 ">
                    <img 
                        className='w-[380px] h-[160px] object-cover' 
                        src={studyImage} 
                        alt="Study Focus" 
                    />
                </div>

                {/* Focus Text Section */}
                <div className="focusTextSection w-full h-[56.6px]">
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <p className="text-[16px] text-gray-500">Loading today's focus...</p>
                        </div>
                    ) : isEditing ? (
                        <input
                            type="text"
                            value={focusText}
                            onChange={(e) => setFocusText(e.target.value)}
                            onBlur={handleSave}
                            onKeyPress={handleKeyPress}
                            className="w-full text-[18px] font-medium text-gray-700 bg-white border-2 border-blue-300 
                            rounded-[6px] p-2 focus:outline-none focus:border-blue-500"
                            autoFocus
                        />
                    ) : (
                        <p className={`text-[18px] font-medium text-gray-700 cursor-pointer hover:text-blue-600 
                        transition-colors duration-200 ${isCompleted ? 'line-through text-green-600' : ''}`}
                        onClick={handleEdit}>
                            {focusText}
                        </p>
                    )}
                    {isCompleted && (
                        <span className="text-[14px] text-green-600 font-medium mt-2 inline-block">
                            ✨ Completed! Great job!
                        </span>
                    )}
                </div>
            </div>

            {/*this is a grid of topics planned for the week in a grid */}
            <div className="weekTopicsSection mt-6 relative h-[280px] overflow-hidden">
                <div className="sectionHeader flex flex-col items-start justify-start mb-4">
                    <div className="flex w-full h-[40px] mr-auto flex-row items-center justify-start gap-2">
                        <h3 className="text-[22px] font-bold text-gray-800">This Week's Learning Path</h3>
                        <span className="text-[14px] text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-auto">
                            {weekTopics.filter(topic => topic.status === 'completed').length} of {weekTopics.length} completed
                        </span>
                    </div>
                </div>

                {/* Scroll Buttons */}
                <button 
                    onClick={scrollLeft}
                    className="scrollLeftBtn absolute left-0 top-1/2 transform -translate-y-1/2 z-10 
                    w-[40px] h-[40px] bg-white shadow-lg rounded-full flex items-center justify-center
                    hover:bg-gray-50 transition-all duration-200 border border-gray-200
                    active:scale-95 touch-manipulation md:hover:scale-105"
                >
                    <FaChevronLeft className="text-gray-600 w-[14px] h-[14px]" />
                </button>

                <button 
                    onClick={scrollRight}
                    className="scrollRightBtn absolute right-0 top-1/2 transform -translate-y-1/2 z-10 
                    w-[40px] h-[40px] bg-white shadow-lg rounded-full flex items-center justify-center
                    hover:bg-gray-50 transition-all duration-200 border border-gray-200
                    active:scale-95 touch-manipulation md:hover:scale-105"
                >
                    <FaChevronRight className="text-gray-600 w-[14px] h-[14px]" />
                </button>
                
                <div className="weekTopicsGrid flex gap-4 overflow-x-auto pt-4 pb-4 scroll-smooth" ref={scrollContainerRef}>
                    
                    {weekTopics.length > 0 ? weekTopics.map((topic) => (
                        <div key={topic.id} className={`topicCard min-w-[300px] w-[300px] h-[180px] p-4 pb-0 mb-0 rounded-[10px] 
                            transition-all duration-300 hover:shadow-lg cursor-pointer border-l-4 flex-shrink-0 
                            shadow-[0px_7px_29px_0px_rgba(100,100,111,0.2)] group ${
                            topic.status === 'completed' ? 'bg-green-50 border-green-500 hover:bg-green-100' :
                            topic.status === 'in-progress' ? 'bg-blue-50 border-blue-500 hover:bg-blue-100' :
                            'bg-gray-50 border-gray-300 hover:bg-gray-100'
                        }`}>
                            <div className="flex flex-col h-[140px] justify-start gap-2">
                                <div>
                                    <div className="flex items-center justify-evenly ">
                                        <h4 className="text-[16px] font-semibold text-gray-800 truncate pr-2">{topic.title}</h4>
                                        <div className="flex items-center gap-2">
                                            <div className={`statusIcon w-[20px] h-[20px] rounded-full flex items-center justify-center mt-[20px] ${
                                                topic.status === 'completed' ? 'bg-green-500' :
                                                topic.status === 'in-progress' ? 'bg-blue-500' :
                                                'bg-gray-300'
                                            }`}>
                                                {topic.status === 'completed' && <FaCheckCircle className="text-white w-[12px] h-[12px]" />}
                                                {topic.status === 'in-progress' && <FaClock className="text-white w-[12px] h-[12px]" />}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteTask(topic.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 
                                                transition-all duration-200 w-[16px] h-[16px] flex items-center justify-center"
                                                title="Delete task"
                                            >
                                                <FaTrash className="w-[12px] h-[12px]" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[14px] text-gray-600 mb-3 line-clamp-2">{topic.description}</p>
                                </div>
                                
                                <div className="actionSection">
                                    <div className="flex justify-between items-center mb-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newStatus = topic.status === 'completed' ? 'pending' : 
                                                                topic.status === 'pending' ? 'in-progress' : 'completed';
                                                updateTaskStatus(topic.id, newStatus);
                                            }}
                                            className="text-[12px] px-2 py-1 rounded-full transition-colors duration-200 
                                            hover:bg-opacity-80 font-medium"
                                            style={{
                                                backgroundColor: topic.status === 'completed' ? '#10b981' :
                                                            topic.status === 'in-progress' ? '#3b82f6' : '#6b7280',
                                                color: 'white'
                                            }}
                                        >
                                            {topic.status === 'completed' ? 'Completed' :
                                             topic.status === 'in-progress' ? 'In Progress' : 'Start'}
                                        </button>
                                        <span className="text-[12px] text-gray-500">{topic.progress}%</span>
                                    </div>
                                    <div className="progressBar w-full bg-gray-200 rounded-full h-[4px]">
                                        <div 
                                            className={`h-[4px] rounded-full transition-all duration-500 ${
                                                topic.status === 'completed' ? 'bg-green-500' :
                                                topic.status === 'in-progress' ? 'bg-blue-500' :
                                                'bg-gray-300'
                                            }`}
                                            style={{ width: `${topic.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="emptyState min-w-[300px] w-[300px] h-[140px] p-4 rounded-[10px] 
                        border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
                            <FaPlus className="text-gray-400 w-[24px] h-[24px] mb-2" />
                            <p className="text-[14px] text-gray-500 mb-2">No tasks yet</p>
                            <p className="text-[12px] text-blue-500 font-medium">
                                Use the "Add Task" button in the header to create your first task
                            </p>
                        </div>
                    )}

                </div>
            </div>

        </div>
    )
}
