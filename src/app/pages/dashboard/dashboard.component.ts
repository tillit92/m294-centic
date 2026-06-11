import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

import { AppAuthService } from '../../service/app.auth.service';
import { HeaderService } from '../../service/header.service';

import { forkJoin } from 'rxjs';
import { BudgetService } from '../../service/budget.service';
import { TransactionService } from '../../service/transaction.service';

export interface DashboardTransaction {
  id: number;
  date: string;          // ISO-8601: '2026-06-10'
  categoryName: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  globalFlag: boolean;   // true = globally approved
}

export interface DashboardBudget {
  id: number;
  categoryName: string;
  limitAmount: number;
  spentAmount: number;   // sum of EXPENSE transactions for this category/month
  month: string;         // 'YYYY-MM'
}


// ─── CHF formatter helper (e.g.  «CHF 1'234.50»)  ────────────────────────────
// Uses Intl.NumberFormat so it respects the de-CH grouping separator (apostrophe).
function formatChf(value: number): string {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2,
  }).format(value);
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [DecimalPipe, DatePipe, RouterLink, TranslateModule],
})
export class DashboardComponent implements OnInit, OnDestroy {
  // ─── Services ──────────────────────────────────────────────────────────────
  private authService   = inject(AppAuthService);
  private headerService = inject(HeaderService);
  readonly translate    = inject(TranslateService);
  private budgetService      = inject(BudgetService);
  private transactionService = inject(TransactionService);

  private destroy$ = new Subject<void>();

  // ─── Auth ───────────────────────────────────────────────────────────────────
  useralias = signal('');
  username  = signal('');

  // ─── Data ───────────────────────────────────────────────────────────────────
  transactions = signal<DashboardTransaction[]>([]);
  budgets      = signal<DashboardBudget[]>([]);
  isLoading    = signal(true);

  readonly today = new Date();

  // ─── Computed metrics ───────────────────────────────────────────────────────

  /** Net balance = Σ income − Σ expense, formatted as CHF */
  totalBalance = computed(() =>
    this.transactions().reduce(
      (acc, t) => (t.type === 'INCOME' ? acc + t.amount : acc - t.amount),
      0
    )
  );

  totalBalanceFormatted = computed(() => formatChf(this.totalBalance()));

  /** Sum of EXPENSE transactions in the current month */
  monthlySpending = computed(() => {
    const currentMonth = this.currentMonthPrefix();
    return this.transactions()
      .filter(t => t.type === 'EXPENSE' && t.date.startsWith(currentMonth))
      .reduce((acc, t) => acc + t.amount, 0);
  });

  monthlySpendingFormatted = computed(() => formatChf(this.monthlySpending()));

  /** Total budget limit across all active budgets */
  monthlyBudgetLimit = computed(() =>
    this.budgets().reduce((acc, b) => acc + b.limitAmount, 0)
  );

  monthlyBudgetLimitFormatted = computed(() => formatChf(this.monthlyBudgetLimit()));

  /** Number of active budgets */
  activeBudgetCount = computed(() => this.budgets().length);

  /** Spending as a fraction of total limit (0–1, capped at 1) */
  spendingRatio = computed(() => {
    const limit = this.monthlyBudgetLimit();
    return limit > 0 ? Math.min(this.monthlySpending() / limit, 1) : 0;
  });

  /** YYYY-MM string for the current month */
  private currentMonthPrefix = computed(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // ─── Lifecycle ──────────────────────────────────────────────────────────────
  constructor() {
    this.headerService.setPage('nav.dashboard');
  }

  ngOnInit(): void {
    this.authService.usernameObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe(name => this.username.set(name));

    this.authService.useraliasObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe(alias => this.useralias.set(alias));

    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


private loadData(): void {
  forkJoin({
    transactions: this.transactionService.getList(),
    budgets:      this.budgetService.getList(),
  })
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: ({ transactions, budgets }) => {
      const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

      this.transactions.set(transactions.map(t => ({
        id:           t.id,
        date:         t.date,
        amount:       t.amount,
        categoryName: t.category?.name ?? '—',
        type:         t.type,
        globalFlag:   t.category?.globalFlag ?? false,
      })));

      this.budgets.set(budgets.map(b => {
        // Alle EXPENSE-Transaktionen dieser Kategorie im aktuellen Monat summieren
        const spent = transactions
          .filter(t =>
            t.type === 'EXPENSE' &&
            t.category?.id === b.category?.id &&
            t.date?.startsWith(b.month ?? currentMonth)
          )
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          id:           b.id,
          categoryName: b.category?.name ?? '—',
          limitAmount:  b.limitAmount,
          spentAmount:  spent,
          month:        b.month,
        };
      }));

      this.isLoading.set(false);
    },
    error: () => this.isLoading.set(false),
  });
}

  // ─── Budget helpers ─────────────────────────────────────────────────────────

  /** Percentage of budget consumed, clamped 0–100 */
  budgetProgress(b: DashboardBudget): number {
    return Math.min((b.spentAmount / b.limitAmount) * 100, 100);
  }

  /** ≥ 80 % consumed */
  isBudgetWarning(b: DashboardBudget): boolean {
    return this.budgetProgress(b) >= 80;
  }

  /** 100 % consumed */
  isBudgetDanger(b: DashboardBudget): boolean {
    return this.budgetProgress(b) >= 100;
  }

  /** Remaining percentage, floored, e.g. 25 */
  budgetRemainingPct(b: DashboardBudget): number {
    return Math.floor(100 - this.budgetProgress(b));
  }

  /** CHF-formatted spent amount */
  budgetSpentFormatted(b: DashboardBudget): string {
    return formatChf(b.spentAmount);
  }

  /** CHF-formatted limit amount */
  budgetLimitFormatted(b: DashboardBudget): string {
    return formatChf(b.limitAmount);
  }

  /** Locale-aware date: de_CH → 'd. MMM yyyy', en → 'MMM d, yyyy' */
  get dateFormat(): string {
    return this.translate.currentLang === 'de_CH' ? 'd. MMM yyyy' : 'MMM d, yyyy';
  }

  /** Locale tag for Angular DatePipe */
  get dateLocale(): string {
    return this.translate.currentLang === 'de_CH' ? 'de-CH' : 'en-US';
  }

  /** Current month name, locale-aware (used in subtitle when not logged in) */
  get currentMonthLabel(): string {
    return new Intl.DateTimeFormat(
      this.translate.currentLang === 'de_CH' ? 'de-CH' : 'en-US',
      { month: 'long', year: 'numeric' }
    ).format(this.today);
  }
}
