export * from './create-account.command';
export * from './update-account.command';
export * from './delete-account.command';

import { CreateAccountHandler } from './create-account.command';
import { UpdateAccountHandler } from './update-account.command';
import { DeleteAccountHandler } from './delete-account.command';

export const CommandHandlers = [
  CreateAccountHandler,
  UpdateAccountHandler,
  DeleteAccountHandler,
];
