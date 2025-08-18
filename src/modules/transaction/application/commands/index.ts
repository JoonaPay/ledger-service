export * from './create-transaction.command';
export * from './update-transaction.command';
export * from './delete-transaction.command';

import { CreateTransactionHandler } from './create-transaction.command';
import { UpdateTransactionHandler } from './update-transaction.command';
import { DeleteTransactionHandler } from './delete-transaction.command';

export const CommandHandlers = [
  CreateTransactionHandler,
  UpdateTransactionHandler,
  DeleteTransactionHandler,
];
