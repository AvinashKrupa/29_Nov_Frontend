import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      verificationEmail: null,
      setAuth: ({ user, token }) =>
        set({
          user: {
            ...user,
            accountId:
              user.accountId ||
              `SS${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            avatar:
              user.avatar ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
          },
          token,
          isAuthenticated: true,
        }),
      setVerificationEmail: (email) => set({ verificationEmail: email }),
      logout: () => {
        // Clear Zustand state
        set({ user: null, token: null, isAuthenticated: false, verificationEmail: null });

        // Clear cookies
        document.cookie.split(";").forEach((cookie) => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);


export default useAuthStore;