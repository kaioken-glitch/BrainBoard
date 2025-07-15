import React, { useState, useEffect } from 'react'
import { FaTasks, FaCheckCircle, FaClock, FaFire, FaCalendarAlt, FaTrophy, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import { useData } from '../context/DataContext'

export default function StatsCard() {
    let contextData;
    try {
        contextData = useData();
    } catch (error) {
        console.error('StatsCard: Error accessing DataContext:', error);
        return <div>Loading...</div>;
    }
    
    const { tasks, notifications, messages, isLoading } = contextData;
    const [stats, setStats] = useState({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        todayTasks: 0,
        totalNotifications: 0,
        totalMessages: 0,
        completionRate: 0,
        streak: 0
    });

    // Calculate statistics when data changes
    useEffect(() => {
        if (tasks) {
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(task => task.status === 'completed').length;
            const pendingTasks = tasks.filter(task => task.status === 'pending').length;
            const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
            
            // Calculate today's tasks (assuming tasks have createdAt date)
            const today = new Date().toDateString();
            const todayTasks = tasks.filter(task => {
                const taskDate = new Date(task.createdAt || Date.now()).toDateString();
                return taskDate === today;
            }).length;

            const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            
            // Simple streak calculation (consecutive completed tasks)
            const streak = calculateStreak(tasks);

            setStats({
                totalTasks,
                completedTasks,
                pendingTasks: pendingTasks + inProgressTasks,
                todayTasks,
                totalNotifications: notifications.length,
                totalMessages: messages.length,
                completionRate,
                streak
            });
        }
    }, [tasks, notifications, messages]);

    const calculateStreak = (taskList) => {
        // Simple streak calculation - count consecutive completed tasks from the end
        let streak = 0;
        for (let i = taskList.length - 1; i >= 0; i--) {
            if (taskList[i].status === 'completed') {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    };

    const StatItem = ({ icon: Icon, label, value, color = 'blue', trend, trendValue }) => (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-${color}-100`}>
                    <Icon className={`w-5 h-5 text-${color}-600`} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {trend === 'up' ? <FaArrowUp /> : <FaArrowDown />}
                        <span>{trendValue}</span>
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                <p className="text-sm text-gray-600">{label}</p>
            </div>
        </div>
    );

    const ProgressBar = ({ label, value, total, color = 'blue' }) => {
        const percentage = total > 0 ? (value / total) * 100 : 0;
        return (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <span className="text-sm text-gray-500">{value}/{total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                        className={`bg-${color}-500 h-3 rounded-full transition-all duration-500 ease-out`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% complete</p>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="statsCard w-[30%] h-[100%] bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded-lg w-1/2"></div>
                    <div className="space-y-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="statsCard shrink-0 w-[30%] h-[731px] bg-gradient-to-br from-blue-50 to-indigo-50 
        p-6 rounded-2xl shadow-lg border border-blue-100 overflow-y-auto flex flex-col overflow-hidden">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <FaTrophy className="text-yellow-500" />
                    Dashboard Stats
                </h2>
                <p className="text-gray-600 text-sm">Your productivity overview</p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <StatItem 
                    icon={FaTasks} 
                    label="Total Tasks" 
                    value={stats.totalTasks}
                    color="blue"
                />
                <StatItem 
                    icon={FaCheckCircle} 
                    label="Completed" 
                    value={stats.completedTasks}
                    color="green"
                />
                <StatItem 
                    icon={FaClock} 
                    label="Pending" 
                    value={stats.pendingTasks}
                    color="orange"
                />
                <StatItem 
                    icon={FaCalendarAlt} 
                    label="Today" 
                    value={stats.todayTasks}
                    color="purple"
                />
            </div>

            {/* Progress Section */}
            <div className="space-y-4 mb-6">
                <ProgressBar 
                    label="Task Completion" 
                    value={stats.completedTasks} 
                    total={stats.totalTasks}
                    color="green"
                />
                <ProgressBar 
                    label="Daily Progress" 
                    value={stats.todayTasks} 
                    total={Math.max(stats.todayTasks, 5)}
                    color="blue"
                />
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-yellow-100">
                                <FaFire className="w-4 h-4 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-800">{stats.streak}</p>
                                <p className="text-sm text-gray-600">Day Streak</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-gray-800">{stats.completionRate}%</p>
                            <p className="text-sm text-gray-600">Success Rate</p>
                        </div>
                    </div>
                </div>

                {/* Notifications & Messages */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-800 mb-3">Activity</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Notifications</span>
                            <span className="font-medium text-gray-800">{stats.totalNotifications}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Messages</span>
                            <span className="font-medium text-gray-800">{stats.totalMessages}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3">Quick Insights</h3>
                <div className="space-y-2 text-sm">
                    {stats.completionRate >= 80 && (
                        <p className="text-green-600">🎉 Excellent completion rate!</p>
                    )}
                    {stats.todayTasks === 0 && (
                        <p className="text-orange-600">📅 No tasks for today yet</p>
                    )}
                    {stats.streak >= 3 && (
                        <p className="text-yellow-600">🔥 You're on fire! Keep it up!</p>
                    )}
                    {stats.pendingTasks > 5 && (
                        <p className="text-blue-600">📋 Consider prioritizing pending tasks</p>
                    )}
                </div>
            </div>
        </div>
    )
}
