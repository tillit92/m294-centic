import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { HeaderService } from '../../service/header.service';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { Transaction } from '../../dataaccess/transaction.model';
import { BaseComponent } from '../../components/base/base.component';
import { TransactionService } from '../../service/transaction.service';
import { IsInRoleDirective } from '../../dir/is.in.role.dir';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { DecimalPipe, DatePipe } from '@angular/common';

@Component({
    selector: 'app-transaction-list',
    templateUrl: './transaction-list.component.html',
    styleUrls: ['./transaction-list.component.scss'],
    imports: [IsInRoleDirective, MatToolbar, MatButton, MatIcon, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatPaginator, DecimalPipe, DatePipe, TranslateModule]
})
export class TransactionListComponent extends BaseComponent implements OnInit, AfterViewInit {
  private transactionService = inject(TransactionService);
  private dialog = inject(MatDialog);
  private headerService = inject(HeaderService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  transactionDataSource = new MatTableDataSource<Transaction>();
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  columns = ['amount', 'date', 'type', 'category', 'description', 'actions'];

  public constructor() {
    super();
    this.headerService.setPage('nav.transactions');
  }

  async ngOnInit() {
    await this.reloadData();
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.transactionDataSource.paginator = this.paginator;
    }
  }

  reloadData() {
    this.transactionService.getList().subscribe(obj => {
      this.transactionDataSource.data = obj;
    });
  }

  async edit(e: Transaction) {
    await this.router.navigate(['transaction', e.id]);
  }

  async add() {
    await this.router.navigate(['transaction']);
  }

  delete(e: Transaction) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: {
        title: 'dialogs.title_delete',
        message: 'dialogs.message_delete'
      }
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult === true) {
        this.transactionService.delete(e.id).subscribe({
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
