import { ApplicationError } from '@/protocols';

export function ForbiddenActionError(resource: string, detail: string): ApplicationError {
  return {
    name: 'ForbiddenAction',
    message: `${resource} does not allow you action: ${detail}!`,
  };
}
