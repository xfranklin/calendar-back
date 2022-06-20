export type RecaptchaType = {
  success: boolean;
  challenge_ts: string;
  hostname: string;
  score: number;
  action: string;
};
