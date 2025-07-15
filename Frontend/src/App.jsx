import React, { useState, useRef, useCallback } from 'react'
import './App.css'
import Header from './components/Header.jsx'
import HeaderMobile from './components/HeaderMobile.jsx'
import Dashboard from './components/Dashboard.jsx'
import useResponsiveHeader from './hooks/useResponsiveHeader.js'
import { DataProvider } from './context/DataContext.jsx'

export default function App() {
  const refreshFocusCardRef = useRef(null);
  const addTaskToFocusCardRef = useRef(null);
  
  // Use the responsive header hook to determine which header to show
  const { isMobile, windowWidth } = useResponsiveHeader(768); // 768px breakpoint

  const handleTaskCreated = useCallback((newTask) => {
    // Add task to FocusCard immediately for instant feedback
    if (addTaskToFocusCardRef.current) {
      addTaskToFocusCardRef.current(newTask);
    }
    // Also refresh data to ensure consistency
    if (refreshFocusCardRef.current) {
      refreshFocusCardRef.current();
    }
  }, []);

  const handleFocusCardReady = useCallback((refreshFunction, addTaskFunction) => {
    // Store both functions from FocusCard using refs to avoid re-renders
    refreshFocusCardRef.current = refreshFunction;
    addTaskToFocusCardRef.current = addTaskFunction;
  }, []);

  return (
    <DataProvider>
      <div className="App w-[100dvw] h-[100dvh] bg-aliceblue-50 flex flex-col items-center justify-start">
        {/* Conditionally render header based on screen size */}
        {isMobile ? (
          <HeaderMobile onTaskCreated={handleTaskCreated} />
        ) : (
          <Header onTaskCreated={handleTaskCreated} />
        )}
        
        <Dashboard onFocusCardReady={handleFocusCardReady} />
      </div>
    </DataProvider>
  )
}
