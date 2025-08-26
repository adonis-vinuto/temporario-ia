import { DollarSign, HelpCircle, Users } from "lucide-react";

export enum Module {
  People,
  Finance,
  Sales,
}

export const ModuleLabels = {
  [Module.People]: "People",
  [Module.Finance]: "Finance",
  [Module.Sales]: "Sales",
};

export const ModuleNames = {
  [Module.People]: "people",
  [Module.Finance]: "finance",
  [Module.Sales]: "sales",
};

export const ModuleIcons = {
  [Module.People]: Users,
  [Module.Finance]: HelpCircle,
  [Module.Sales]: DollarSign,
};
