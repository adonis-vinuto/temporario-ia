export interface SeniorHCMConfig {
  idSeniorHcmConfig: string;
  username: string;
  password: string;
  wsdlUrl: string;
}

export interface SeniorHCMConfigRequest {
  username: string;
  password: string;
  "wsdl-url": string;
}