export interface SeniorERPConfig {
  idSeniorErpConfig: string;
  username: string;
  password: string;
  wsdlUrl: string;
}

export interface SeniorERPConfigRequest {
  username: string;
  password: string;
  "wsdl-url": string;
}