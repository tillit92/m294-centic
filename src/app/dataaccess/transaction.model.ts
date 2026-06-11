import { User } from './user.model';
import { Category } from './category.model';

export type TransactionType = 'INCOME' | 'EXPENSE';

export class Transaction {
  public id!: number;
  public amount!: number;
  public date = '';
  public description = '';
  public type: TransactionType = 'EXPENSE';
  public user?: User;
  public category?: Category;
}
