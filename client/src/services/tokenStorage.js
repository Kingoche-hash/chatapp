const KEY = 'chatapp_token';

export const getToken = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    localStorage.setItem(KEY, token);
  } catch {
    // storage unavailable: user stays logged in only until refresh
  }
};

export const clearToken = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
};