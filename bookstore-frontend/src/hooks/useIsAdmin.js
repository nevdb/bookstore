import { useAuth } from "../context/AuthContext";

/**
 * useIsAdmin - Custom hook to check if the current user is an admin
 * @returns {boolean} - True if user is authenticated and has admin role
 */
export default function useIsAdmin() {
  const { user } = useAuth();
  return user?.role === "admin";
}
