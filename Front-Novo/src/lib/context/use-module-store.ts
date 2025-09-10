import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Module } from "@/types/enums/module";

interface IModuleState {
  module: Module;
  setModule: (m: Module) => void;
}

export const useModuleStore = create<IModuleState>()(
  persist(
    (set) => ({
      module: Module.People,
      setModule: (m) => set({ module: m }),
    }),
    { name: "module-storage" }
  )
);
