// src\types\enums\module.ts
export enum Module {
  People = "people",
  Sales = "sales",
  Finance = "finance",
}

export const ModuleLabels: Record<Module, string> = {
  [Module.People]: "People",
  [Module.Sales]: "Sales",
  [Module.Finance]: "Finance",
};
