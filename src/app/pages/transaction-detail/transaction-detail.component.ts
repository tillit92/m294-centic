import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderService } from '../../service/header.service';
import { Transaction } from '../../dataaccess/transaction.model';
import { Category } from '../../dataaccess/category.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseComponent } from '../../components/base/base.component';
import { TransactionService } from '../../service/transaction.service';
import { CategoryService } from '../../service/category.service';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatSuffix, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { AutofocusDirective } from '../../dir/autofocus-dir';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import moment from 'moment';

@Component({
    selector: 'app-transaction-detail',
    templateUrl: './transaction-detail.component.html',
    styleUrls: ['./transaction-detail.component.scss'],
    imports: [MatToolbar, MatToolbarRow, MatButton, MatIcon, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatDatepickerInput, AutofocusDirective, MatDatepickerToggle, MatSuffix, MatDatepicker, MatHint, MatSelect, MatOption, CdkTextareaAutosize, TranslateModule]
})
export class TransactionDetailComponent extends BaseComponent implements OnInit {
  private router = inject(Router);
  private headerService = inject(HeaderService);
  private route = inject(ActivatedRoute);
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(UntypedFormBuilder);

  transaction = new Transaction();
  categories: Category[] = [];

  public objForm = new UntypedFormGroup({
    id: new UntypedFormControl(null),
    amount: new UntypedFormControl(null),
    date: new UntypedFormControl(moment()),
    description: new UntypedFormControl(''),
    type: new UntypedFormControl('EXPENSE'),
    categoryId: new UntypedFormControl('')
  });

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.categoryService.getList().subscribe(cats => {
      this.categories = cats;
    });

    if (this.route.snapshot.paramMap.get('id') !== null) {
      const id = Number.parseInt(this.route.snapshot.paramMap.get('id') as string);
      this.transactionService.getOne(id).subscribe(obj => {
        this.transaction = obj;
        this.headerService.setPage('nav.transaction_edit');
        this.objForm = this.fb.group({
          id: [obj.id],
          amount: [obj.amount],
          date: [obj.date ? moment(obj.date) : moment()],
          description: [obj.description],
          type: [obj.type],
          categoryId: [obj.category ? obj.category.id : '']
        });
      });
    } else {
      this.headerService.setPage('nav.transaction_new');
    }
  }

  async back() {
    await this.router.navigate(['transactions']);
  }

  async save(formData: any) {
    const toSave: Transaction = {
      id: formData.id,
      amount: formData.amount,
      date: formData.date ? moment(formData.date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      description: formData.description,
      type: formData.type,
      category: this.categories.find(c => c.id === formData.categoryId)
    };

    if (toSave.id) {
      this.transactionService.update(toSave).subscribe({
        next: () => {
          this.snackBar.open(this.messageSaved, this.messageClose, {duration: 5000});
          this.back();
        },
        error: () => {
          this.snackBar.open(this.messageError, this.messageClose, {duration: 5000, politeness: 'assertive'});
        }
      });
    } else {
      this.transactionService.save(toSave).subscribe({
        next: () => {
          this.snackBar.open(this.messageNewSaved, this.messageClose, {duration: 5000});
          this.back();
        },
        error: () => {
          this.snackBar.open(this.messageNewError, this.messageClose, {duration: 5000, politeness: 'assertive'});
        }
      });
    }
  }
}
