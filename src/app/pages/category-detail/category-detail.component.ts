import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderService } from '../../service/header.service';
import { Category } from '../../dataaccess/category.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseComponent } from '../../components/base/base.component';
import { CategoryService } from '../../service/category.service';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { AutofocusDirective } from '../../dir/autofocus-dir';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
    selector: 'app-category-detail',
    templateUrl: './category-detail.component.html',
    styleUrls: ['./category-detail.component.scss'],
    imports: [MatToolbar, MatToolbarRow, MatButton, MatIcon, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, AutofocusDirective, MatHint, MatCheckbox, TranslateModule]
})
export class CategoryDetailComponent extends BaseComponent implements OnInit {
  private router = inject(Router);
  private headerService = inject(HeaderService);
  private route = inject(ActivatedRoute);
  private categoryService = inject(CategoryService);
  private snackBar = inject(MatSnackBar);
  private formBuilder = inject(UntypedFormBuilder);

  category = new Category();
  public objForm = new UntypedFormGroup({
    id: new UntypedFormControl(null),
    name: new UntypedFormControl(''),
    colorCode: new UntypedFormControl(''),
    globalFlag: new UntypedFormControl(false)
  });

  constructor() {
    super();
  }

  ngOnInit(): void {
    if (this.route.snapshot.paramMap.get('id') !== null) {
      const id = Number.parseInt(this.route.snapshot.paramMap.get('id') as string);
      this.categoryService.getOne(id).subscribe(obj => {
        this.category = obj;
        this.headerService.setPage('nav.category_edit');
        this.objForm = this.formBuilder.group(obj);
      });
    } else {
      this.headerService.setPage('nav.category_new');
      this.objForm = this.formBuilder.group(this.category);
    }
  }

  async back() {
    await this.router.navigate(['categories']);
  }

  async save(formData: any) {
    this.category = Object.assign({}, this.category, formData);

    if (this.category.id) {
      this.categoryService.update(this.category).subscribe({
        next: () => {
          this.snackBar.open(this.messageSaved, this.messageClose, {duration: 5000});
          this.back();
        },
        error: () => {
          this.snackBar.open(this.messageError, this.messageClose, {duration: 5000, politeness: 'assertive'});
        }
      });
    } else {
      this.categoryService.save(this.category).subscribe({
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
