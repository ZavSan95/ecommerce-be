export interface DomainError {
  code: string;
  message: string;
  status: number;
  meta?: Record<string, any>;
}
