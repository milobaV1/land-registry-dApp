import { useSyncExternalStore } from "react"
import { store } from "@/store/account.store"

export const useSyncProviders = () =>
  useSyncExternalStore(store.subscribe, store.value, store.value)