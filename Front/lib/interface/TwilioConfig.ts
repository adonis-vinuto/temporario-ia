export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  webhookUrl: string;
}

export interface TwilioConfigRequest {
  "account-sid": string;
  "auth-token": string;
  "webhook-url": string;
}