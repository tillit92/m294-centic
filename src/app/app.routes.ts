import {Routes} from '@angular/router';
import {appCanActivate} from './guard/app.auth.guard';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {NoAccessComponent} from './pages/no-access/no-access.component';
import {AppRoles} from '../app.roles';
import {CategoryListComponent} from './pages/category-list/category-list.component';
import {CategoryDetailComponent} from './pages/category-detail/category-detail.component';
import {TransactionListComponent} from './pages/transaction-list/transaction-list.component';
import {TransactionDetailComponent} from './pages/transaction-detail/transaction-detail.component';
import {BudgetListComponent} from './pages/budget-list/budget-list.component';
import {BudgetDetailComponent} from './pages/budget-detail/budget-detail.component';

export const routes: Routes = [
  {path: '', component: DashboardComponent},
  {path: 'dashboard', canActivate: [appCanActivate], data: {roles: [AppRoles.Read]}, component: DashboardComponent},
  {
    path: 'categories',
    component: CategoryListComponent,
    canActivate: [appCanActivate],
    data: {roles: [AppRoles.Read]}
  },
  {
    path: 'category', canActivate: [appCanActivate], component: CategoryDetailComponent, pathMatch: 'full',
    data: {roles: [AppRoles.Admin]}
  },
  {
    path: 'category/:id', canActivate: [appCanActivate], component: CategoryDetailComponent, pathMatch: 'full',
    data: {roles: [AppRoles.Admin]}
  },
  {
    path: 'transactions',
    component: TransactionListComponent,
    canActivate: [appCanActivate],
    data: {roles: [AppRoles.Read]}
  },
  {
    path: 'transaction', canActivate: [appCanActivate], component: TransactionDetailComponent, pathMatch: 'full',
    data: {roles: [AppRoles.Update]}
  },
  {
    path: 'transaction/:id', canActivate: [appCanActivate], component: TransactionDetailComponent, pathMatch: 'full',
    data: {roles: [AppRoles.Update]}
  },
  {
    path: 'budgets',
    component: BudgetListComponent,
    canActivate: [appCanActivate],
    data: {roles: [AppRoles.Read]}
  },
  {
    path: 'budget', canActivate: [appCanActivate], component: BudgetDetailComponent, pathMatch: 'full',
    data: {roles: [AppRoles.Update]}
  },
  {
    path: 'budget/:id', canActivate: [appCanActivate], component: BudgetDetailComponent, pathMatch: 'full',
    data: {roles: [AppRoles.Update]}
  },
  {path: 'noaccess', component: NoAccessComponent},
];
