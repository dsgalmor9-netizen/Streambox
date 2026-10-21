export type OtpVerificationState =
  | 'idle'
  | 'incomplete'
  | 'verifying'
  | 'success'
  | 'error'
  | 'expired'
  | 'resending';

export interface OtpVerificationProps {
  email: string;
  onVerified: () => void;
  onCancel?: () => void;
  targetCode?: string; // Configurable verification code (default: '8045')
  theme?: 'lavender' | 'streambox';
}
