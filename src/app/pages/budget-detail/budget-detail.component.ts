import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderService } from '../../service/header.service';
import { Budget } from '../../dataaccess/budget.model';
import { Category } from '../../dataaccess/category.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseComponent } from '../../components/base/base.component';
import { BudgetService } from '../../service/budget.service';
import { CategoryService } from '../../service/category.service';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { AutofocusDirective } from '../../dir/autofocus-dir';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';

@Component({
    selector: 'app-budget-detail',
    templateUrl: './budget-detail.component.html',
    styleUrls: ['./budget-detail.component.scss'],
    imports: [MatToolbar, MatToolbarRow, MatButton, MatIcon, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, AutofocusDirective, MatSelect, MatOption, TranslateModule]
})
export class BudgetDetailComponent extends BaseComponent implements OnInit {
  private router = inject(Router);
  private headerService = inject(HeaderService);
  private route = inject(ActivatedRoute);
  private budgetService = inject(BudgetService);
  private categoryService = inject(CategoryService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(UntypedFormBuilder);

  budget = new Budget();
  categories: Category[] = [];

  public objForm = new UntypedFormGroup({
    id: new UntypedFormControl(null),
    limitAmount: new UntypedFormControl(null),
    month: new UntypedFormControl(''),
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
      this.budgetService.getOne(id).subscribe(obj => {
        this.budget = obj;
        this.headerService.setPage('nav.budget_edit');
        this.objForm = this.fb.group({
          id: [obj.id],
          limitAmount: [obj.limitAmount],
          month: [obj.month],
          categoryId: [obj.category ? obj.category.id : '']
        });
      });
    } else {
      this.headerService.setPage('nav.budget_new');
    }
  }

  async back() {
    await this.router.navigate(['budgets']);
  }

  async save(formData: any) {
    const toSave: Budget = {
      id: formData.id,
      limitAmount: formData.limitAmount,
      month: formData.month,
      category: this.categories.find(c => c.id === formData.categoryId)
    };

    if (toSave.id) {
      this.budgetService.update(toSave).subscribe({
        next: () => {
          this.snackBar.open(this.messageSaved, this.messageClose, {duration: 5000});
          this.back();
        },
        error: () => {
          this.snackBar.open(this.messageError, this.messageClose, {duration: 5000, politeness: 'assertive'});
        }
      });
    } else {
      this.budgetService.save(toSave).subscribe({
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
