import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  lang: localStorage.getItem('tl_lang') || 'en',
  theme: localStorage.getItem('tl_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  role: null,
  user: JSON.parse(localStorage.getItem('tl_user') || 'null')
};

// Action types
const ACTIONS = {
  SET_THEME: 'SET_THEME',
  SET_LANG: 'SET_LANG',
  SET_ROLE: 'SET_ROLE',
  SET_USER: 'SET_USER',
  CLEAR_USER: 'CLEAR_USER'
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_THEME:
      return { ...state, theme: action.payload };
    case ACTIONS.SET_LANG:
      return { ...state, lang: action.payload };
    case ACTIONS.SET_ROLE:
      return { ...state, role: action.payload };
    case ACTIONS.SET_USER:
      return { ...state, user: action.payload };
    case ACTIONS.CLEAR_USER:
      return { ...state, user: null, role: null };
    default:
      return state;
  }
}

// Context
const AppContext = createContext();

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Apply theme to document
  useEffect(() => {
    const html = document.documentElement;
    if (state.theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem('tl_theme', state.theme);
  }, [state.theme]);

  // Save language to localStorage
  useEffect(() => {
    localStorage.setItem('tl_lang', state.lang);
  }, [state.lang]);

  // Save user to localStorage
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('tl_user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('tl_user');
    }
  }, [state.user]);

  const actions = {
    setTheme: (theme) => dispatch({ type: ACTIONS.SET_THEME, payload: theme }),
    setLang: (lang) => dispatch({ type: ACTIONS.SET_LANG, payload: lang }),
    setRole: (role) => dispatch({ type: ACTIONS.SET_ROLE, payload: role }),
    setUser: (user) => dispatch({ type: ACTIONS.SET_USER, payload: user }),
    clearUser: () => dispatch({ type: ACTIONS.CLEAR_USER })
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
