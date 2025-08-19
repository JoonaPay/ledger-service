import { CreateAccountUseCase } from '../../usecases/create-account.use-case';
import { GetAccountUseCase } from '../../usecases/get-account.use-case';
import { ListAccountsUseCase } from '../../usecases/list-accounts.use-case';
import { UpdateAccountUseCase } from '../../usecases/update-account.use-case';
import { DeleteAccountUseCase } from '../../usecases/delete-account.use-case';

export const UseCases = [
  CreateAccountUseCase,
  GetAccountUseCase,
  ListAccountsUseCase,
  UpdateAccountUseCase,
  DeleteAccountUseCase,
];
