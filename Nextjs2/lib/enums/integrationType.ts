export enum IntegrationType {
  ERP,
  HCM,
  Twilio,
}

export const IntegrationTypeLabel = {
  [IntegrationType.ERP]: "Senior ERP",
  [IntegrationType.HCM]: "Senior HCM",
  [IntegrationType.Twilio]: "Twilio",
};
