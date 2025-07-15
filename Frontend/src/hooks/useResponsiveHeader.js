import { useState, useEffect } from 'react';

/**
 * Custom hook to determine which header component to use based on window width
 * @param {number} breakpoint - The width breakpoint in pixels (default: 768px)
 * @returns {object} - Object containing isMobile boolean and windowWidth
 */
export const useResponsiveHeader = (breakpoint = 768) => {
    const [windowWidth, setWindowWidth] = useState(() => {
        // Check if we're in the browser environment
        if (typeof window !== 'undefined') {
            return window.innerWidth;
        }
        // Default to desktop width for SSR
        return 1024;
    });

    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth < breakpoint;
        }
        return false;
    });

    useEffect(() => {
        // Function to handle window resize
        const handleResize = () => {
            const newWidth = window.innerWidth;
            setWindowWidth(newWidth);
            setIsMobile(newWidth < breakpoint);
        };

        // Add event listener for window resize
        window.addEventListener('resize', handleResize);

        // Call handler right away so state gets updated with initial window size
        handleResize();

        // Cleanup function to remove event listener
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [breakpoint]);

    return {
        isMobile,
        windowWidth,
        isTablet: windowWidth >= breakpoint && windowWidth < 1024,
        isDesktop: windowWidth >= 1024
    };
};

export default useResponsiveHeader;
