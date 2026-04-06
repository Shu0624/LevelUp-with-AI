import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const ActivityContext = createContext(null);

// Centralized category map to make it accessible everywhere
export const ACTIVITY_CATEGORIES = [
  { value: 'java', label: 'Java', color: '#f59e0b' },
  { value: 'python', label: 'Python', color: '#3b82f6' },
  { value: 'dsa', label: 'DSA Solving', color: '#10b981' },
  { value: 'ai', label: 'AI / GenAI', color: '#8b5cf6' },
  { value: 'aptitude', label: 'Aptitude', color: '#ec4899' },
  { value: 'interview', label: 'Interview Prep', color: '#06b6d4' },
  { value: 'resume', label: 'Resume Work', color: '#f97316' },
  { value: 'other', label: 'Other', color: '#6b7280' },
];

export const ActivityProvider = ({ children }) => {
  const { api, user } = useAuth();
  
  // Timer State
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerCategory, setTimerCategory] = useState('java');
  const [timerLabel, setTimerLabel] = useState('');
  
  // Advanced Timer State
  const [timerMode, setTimerMode] = useState('stopwatch'); // 'stopwatch' or 'countdown'
  const [countdownMinutes, setCountdownMinutes] = useState(25);
  
  // Need a ref for the interval to clear it
  const timerRef = useRef(null);

  // Restore persistence across hard reloads via sessionStorage if needed (optional)
  useEffect(() => {
    const savedSession = sessionStorage.getItem('levelup_active_session');
    if (savedSession) {
      const parsed = JSON.parse(savedSession);
      if (parsed.timerRunning) {
        setTimerCategory(parsed.timerCategory);
        setTimerLabel(parsed.timerLabel);
        if (parsed.timerMode) setTimerMode(parsed.timerMode);
        if (parsed.countdownMinutes) setCountdownMinutes(parsed.countdownMinutes);
        
        // Calculate seconds elapsed while away if it was running
        const now = Date.now();
        const diffSecs = Math.floor((now - parsed.lastUpdated) / 1000);
        setTimerSeconds(parsed.timerSeconds + diffSecs);
        
        // Re-initiate the interval
        startInternalTimer(parsed.timerSeconds + diffSecs);
      }
    }
    
    return () => clearInterval(timerRef.current);
  }, []);

  // Handle countdown hitting zero globally
  useEffect(() => {
    if (timerRunning && timerMode === 'countdown') {
      const remaining = (countdownMinutes * 60) - timerSeconds;
      if (remaining <= 0) {
        stopAndSaveTimer();
        import('canvas-confetti').then(confetti => confetti.default({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        }));
      }
    }
  }, [timerSeconds, timerRunning, timerMode, countdownMinutes]);

  // Save to session storage periodically if running (so it survives F5)
  useEffect(() => {
    if (timerRunning) {
      sessionStorage.setItem('levelup_active_session', JSON.stringify({
        timerRunning,
        timerSeconds,
        timerCategory,
        timerLabel,
        timerMode,
        countdownMinutes,
        lastUpdated: Date.now()
      }));
    } else {
      sessionStorage.removeItem('levelup_active_session');
    }
  }, [timerRunning, timerSeconds, timerCategory, timerLabel]);

  const startInternalTimer = (startSecs = 0) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerRunning(true);
    setTimerSeconds(startSecs);
    
    timerRef.current = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);
  };

  const startTimer = () => {
    if (timerRunning) return;
    startInternalTimer(timerSeconds);
  };

  const pauseTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerRunning(false);
  };

  const stopAndSaveTimer = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerRunning(false);
    
    // Save to backend if duration > 10s
    if (timerSeconds >= 10 && user) {
      try {
        await api.post('/activity', {
          category: timerCategory,
          label: timerLabel || ACTIVITY_CATEGORIES.find(c => c.value === timerCategory)?.label,
          duration: timerSeconds,
          type: 'study'
        });
        
        // Dispatch an event so dashboard can refresh history
        window.dispatchEvent(new Event('activity-logged'));
        
      } catch (err) {
        console.error('Failed to log activity', err);
      }
    }
    setTimerSeconds(0);
    setTimerLabel('');
    sessionStorage.removeItem('levelup_active_session');
  };

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
      : `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <ActivityContext.Provider value={{
      timerRunning,
      timerSeconds,
      timerCategory,
      timerLabel,
      timerMode,
      countdownMinutes,
      setTimerCategory,
      setTimerLabel,
      setTimerMode,
      setCountdownMinutes,
      startTimer,
      pauseTimer,
      stopAndSaveTimer,
      formatTime
    }}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) throw new Error("useActivity must be used within ActivityProvider");
  return context;
};
