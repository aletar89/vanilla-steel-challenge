export function sharedTypes(): string {
  return 'shared-types';
}
export interface DataItem {
  id: number;
  name: string;
}

export interface PreferenceFormData {
  name: string;
}

export interface PreferenceResponse {
  success: boolean;
  message: string;
} 