import { User } from './user.model';
import { Category } from './category.model';

export class Budget {
  public id!: number;
  public limitAmount!: number;
  public month = ''; // Format "2024-05"
  public user?: User;
  public category?: Category;
}
