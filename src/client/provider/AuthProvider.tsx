import axios from "axios";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";


interface User {
  id: string;
  username: string;
  fullname: string;
  email: string;
  avatar: string;
  status: string;
  roles: string[];
  permissions: string[];
  activeTenant: {
    id: string;
    code: string;
    name: string;
    description: string;
  };
}

// Define the shape of the authentication context
interface AuthContextType {
  token: string | null;
  setToken: (newToken: string | null) => void;
  user: User | null;
  setUser: (newUser: User | null) => void;
  isAuthorized: (roles: string | string[], permissions: string | string[], operator?: 'or' | 'and') => boolean;
}

// Create context with undefined as initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define props interface for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {

  // State to hold the authentication token
  const [token, setToken_] = useState<string | null>(localStorage.getItem("token"));
  
  // Function to set the authentication token
  const setToken = (newToken: string | null): void => {
    setToken_(newToken);
  };

  // State to hold the authenticated user
  const [user, setUser_] = useState<User | null>(JSON.parse(localStorage.getItem("user") || "null"));
  
  // Function to set the authenticated user
  const setUser = (newUser: User | null): void => {
    setUser_(newUser);
  };

  // Set axios authorization header
  if (token) {
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;
  }

  // Clear axios interceptors and set up a response interceptor
  axios.interceptors.response.clear();
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response.status === 401) {
        console.log('interceptor : 401 error');
        setToken(null);
        setUser(null);
      }
      return Promise.reject(error);
    }
  );

  const isAuthorized = (roles: string | string[], permissions: string | string[], operator?: 'or' | 'and'): boolean => {
    if (operator === undefined) {
      operator = 'or';
    }
    const authUser = user;
    // If no user is authenticated, return false
    if (!authUser) {
      return false;
    }

    const userRoles = authUser?.roles || [];
    const userPermissions = authUser?.permissions || [];

    // If neither roles nor permissions are provided, return false
    if (!roles && !permissions) {
      return false;
    }

    // If only roles are provided, check if the user has at least one of them
    if (roles && !permissions) {
      const requiredRoles = Array.isArray(roles) ? roles : [roles];
      let hasRequiredRoles = requiredRoles.some(role => userRoles.includes(role));
      if (!hasRequiredRoles) {
        return false;
      }
    }

    // If only permissions are provided, check if the user has at least one of them
    if (permissions && !roles) {
      const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
      let hasRequiredPermissions = requiredPermissions.some(permission => userPermissions.includes(permission));
      if (!hasRequiredPermissions) {
        return false;
      }
    }

    // If both roles and permissions are provided, check if the user has at least one of them
    if (roles && permissions) {
      const requiredRoles = Array.isArray(roles) ? roles : [roles];
      const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

      let hasRequiredRoles = requiredRoles.some(role => userRoles.includes(role));
      let hasRequiredPermissions = requiredPermissions.some(permission => userPermissions.includes(permission));

      if (operator === 'or') {
        if (!hasRequiredRoles && !hasRequiredPermissions) {
          return false;
        }
      } else if (operator === 'and') {
        if (!hasRequiredRoles || !hasRequiredPermissions) {
          return false;
        }
      }
    }
    return true;
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
      localStorage.setItem("token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [token, user]);

  // Memoized value of the authentication context
  const contextValue = useMemo(
    (): AuthContextType => ({
      token,
      setToken,
      user,
      setUser,
      isAuthorized
    }),
    [token, user]
  );

  // Provide the authentication context to the children components
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;