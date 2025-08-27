export interface SeniorHcmIntegration {
  idSeniorHcmConfig: string;
  username: string;
  wsdlUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SeniorHcmIntegrationRequest {
  username: string;
  password: string;
  wsdlUrl: string;
}