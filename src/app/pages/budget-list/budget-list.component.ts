import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { HeaderService } from '../../service/header.service';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { Budget } from '../../dataaccess/budget.model';
import { BaseComponent } from '../../components/base/base.component';
import { BudgetService } from '../../service/budget.service';
import { IsInRoleDirective } from '../../dir/is.in.role.dir';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-budget-list',
    templateUrl: './budget-list.component.html',
    styleUrls: ['./budget-list.component.scss'],
    imports: [IsInRoleDirective, MatToolbar, MatButton, MatIcon, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatPaginator, DecimalPipe, TranslateModule]
})
export class BudgetListComponent extends BaseComponent implements OnInit, AfterViewInit {
  private budgetService = inject(BudgetService);
  private dialog = inject(MatDialog);
  private headerService = inject(HeaderService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  budgetDataSource = new MatTableDataSource<Budget>();
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  columns = ['limitAmount', 'month', 'category', 'actions'];

  public constructor() {
    super();
    this.headerService.setPage('nav.budgets');
  }

  async ngOnInit() {
    await this.reloadData();
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.budgetDataSource.paginator = this.paginator;
    }
  }

  reloadData() {
    this.budgetService.getList().subscribe(obj => {
      this.budgetDataSource.data = obj;
    });
  }

  async edit(e: Budget) {
    await this.router.navigate(['budget', e.id]);
  }

  async add() {
    await this.router.navigate(['budget']);
  }

  delete(e: Budget) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: {
        title: 'dialogs.title_delete',
        message: 'dialogs.message_delete'
      }
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult === true) {
        this.budgetService.delete(e.id).subscribe({
          next: response => {
            if (response.status === 200 || response.status === 204) {
              this.snackBar.open(this.deletedMessage, this.closeMessage, {duration: 5000});
              this.reloadData();
            } else {
              this.snackBar.open(this.deleteErrorMessage, this.closeMessage, {duration: 5000});
            }
          },
          error: () => this.snackBar.open(this.deleteErrorMessage, this.closeMessage, {duration: 5000})
        });
      }
    });
  }
}
