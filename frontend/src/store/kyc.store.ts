import { type StateStorage, createJSONStorage, persist } from "zustand/middleware";
import { create, type StateCreator } from "zustand";

export type KYCState = {
  firstname: string;
  lastname: string;
  dob?: Date; 
  nin: string;
  picture?: string; 
  status: 'pending' | 'verified' | 'rejected';
};

export type KYCActions = {
  setKYC: (data: Partial<KYCState>) => void;
  resetKYC: () => void;
};


const kycStorage: StateStorage = {
  getItem: (name) => {
    const value = localStorage.getItem(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: (name, value) => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  }
};

const initializer: StateCreator<KYCState & KYCActions> = (set) => ({
  firstname: "",
  lastname: "",
  dob: undefined,
  nin: "",
  picture: undefined,
  status: "pending",
  setKYC: (data) => set((state) => ({ ...state, ...data })),
  resetKYC: () => set({
    firstname: "",
    lastname: "",
    dob: undefined,
    nin: "",
    picture: undefined,
    status: "pending",
  })
});

const persistedKYCState = persist<KYCState & KYCActions>(initializer, {
  name: "app-kyc",
  storage: createJSONStorage(() => kycStorage),
});

export const useKYCState = create<
  KYCState & KYCActions,
  [["zustand/persist", KYCState & KYCActions]]
>(persistedKYCState);
