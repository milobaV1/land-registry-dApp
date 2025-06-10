import { type StateStorage, createJSONStorage, persist } from "zustand/middleware";
import { create, type StateCreator } from "zustand";

export type AuthState = {
    token?: string
    address?: string
    kycstatus?: string
    isAuthenticated: boolean
}

export type AuthActions = {
    setAddress: (address: string) => void;
    setToken: (token: string) => void;
    setKycstatus: (kycstatus: string) => void;
    //setIsAuthenticated: (isAuthenticated: boolean) => void;
    logOut: () => void;
}
const authStorage: StateStorage = {
    getItem: (name) => {
        const value = localStorage.getItem(name);
        return value ? JSON.parse(value): "false";
    },
    setItem: (name, value) =>{
        localStorage.setItem(name, JSON.stringify(value))
    },
    removeItem: (name) => {
        localStorage.removeItem(name);
    }
}

const initializer: StateCreator<AuthState & AuthActions> = (set) => ({
    token: undefined,
    address: undefined,
    isAuthenticated: false,
    setAddress: (address: string) => set((state) => ({ address, isAuthenticated: !!(address && state.token) })),
    setToken: (token: string) =>
        set((state) => ({
            token,
            isAuthenticated: !!(state.address && token),
        })),
    setKycstatus: (kycstatus: string) => set({kycstatus}),
    //setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
    logOut: () => set({ token: undefined, address: undefined, isAuthenticated: false, kycstatus: undefined })
});

const persistedAuthState = persist<AuthState & AuthActions>(initializer, {
    name: "app-auth",
    storage: createJSONStorage(() => authStorage)
})

export const useAuthState = create<AuthState & AuthActions, [["zustand/persist", AuthState & AuthActions]]>(persistedAuthState);