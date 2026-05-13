import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    const refreshSession = useCallback(async () => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            setUser(null);
            setToken(null);
            setLoading(false);
            return;
        }

        try {
            const { data } = await api.get("/auth/session");
            if (data.success) {
                setUser(data.user);
            } else {
                throw new Error("Session invalid");
            }
        } catch (error) {
            console.error("Session refresh failed:", error.message);
            localStorage.removeItem("token");
            setUser(null);
            setToken(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshSession();
    }, [refreshSession]);

    const login = async (email, password, role_type) => {
        try {
            const { data } = await api.post("/auth/login", { email, password, role_type });
            localStorage.setItem("token", data.token);
            setToken(data.token);
            setUser(data.user);
            return data.user;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };
    const value = useMemo(() => ({ 
        user, 
        token, 
        loading, 
        login, 
        logout, 
        refreshSession 
    }), [user, token, loading, refreshSession]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};