import { Origin } from "../enums/origin";

export interface Knowledge {
  idKnowledge: string;
  description?: string;
  name: string;
  origin: Origin;
}
