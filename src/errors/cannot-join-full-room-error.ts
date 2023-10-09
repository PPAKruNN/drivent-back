import { ApplicationError } from '@/protocols';

export function cannotJoinFullRoom(): ApplicationError {
  return {
    name: 'CannotJoinFullRoom',
    message: 'Cannot join a room that is at his full capacity!',
  };
}
