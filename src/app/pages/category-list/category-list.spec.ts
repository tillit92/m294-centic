import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { CategoryListComponent } from './category-list.component';
import { CategoryService } from '../../service/category.service';
import { HeaderService } from '../../service/header.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { Category } from '../../dataaccess/category.model';
import { expect, vi } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { Directive, Input } from '@angular/core';
import { IsInRoleDirective } from '../../dir/is.in.role.dir';

@Directive({ selector: '[appIsInRole]', standalone: true })
class IsInRoleMockDirective {
    @Input() appIsInRole = '';
}

const fakeCategories: Category[] = [
    { id: 1, name: 'Lebensmittel', colorCode: '#ff0000', globalFlag: true },
    { id: 2, name: 'Verkehr', colorCode: '#00ff00', globalFlag: false },
];

describe('CategoryListComponent', () => {
    let fixture: ComponentFixture<CategoryListComponent>;
    let component: CategoryListComponent;

    let categoryServiceMock: any;
    let routerMock: any;
    let dialogMock: any;
    let snackBarMock: any;

    beforeEach(async () => {
        categoryServiceMock = {
            getList: vi.fn().mockReturnValue(of(fakeCategories)),
            delete: vi.fn().mockReturnValue(of(new HttpResponse({ status: 200 }))),
        };

        routerMock = { navigate: vi.fn().mockResolvedValue(true) };
        snackBarMock = { open: vi.fn() };
        dialogMock = {
            open: vi.fn().mockReturnValue({ afterClosed: () => of(true) }),
        };

        await TestBed.configureTestingModule({
            imports: [
                CategoryListComponent,
                TranslateModule.forRoot(),
                NoopAnimationsModule,
                IsInRoleMockDirective,   
            ],
            providers: [
                HeaderService,
                { provide: CategoryService, useValue: categoryServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: MatDialog, useValue: dialogMock },
                { provide: MatSnackBar, useValue: snackBarMock },
            ],
            teardown: { destroyAfterEach: true },
        })
            .overrideComponent(CategoryListComponent, {
                remove: { imports: [IsInRoleDirective] },   
                add: { imports: [IsInRoleMockDirective] } 
            })
            .compileComponents();

        fixture = TestBed.createComponent(CategoryListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load categories on init', () => {
        expect(categoryServiceMock.getList).toHaveBeenCalled();
        expect(component.categoryDataSource.data).toEqual(fakeCategories);
    });

    it('should navigate to edit on edit()', async () => {
        await component.edit(fakeCategories[0]);
        expect(routerMock.navigate).toHaveBeenCalledWith(['category', fakeCategories[0].id]);
    });

    it('should navigate to new on add()', async () => {
        await component.add();
        expect(routerMock.navigate).toHaveBeenCalledWith(['category']);
    });

    it('should call delete and reload on confirm', async () => {
        component.delete(fakeCategories[0]);

        await fixture.whenStable();

        expect(dialogMock.open).toHaveBeenCalled();
        expect(categoryServiceMock.delete).toHaveBeenCalledWith(fakeCategories[0].id);
        expect(snackBarMock.open).toHaveBeenCalled();
    });

    it('should show correct columns', () => {
        expect(component.columns).toEqual(['name', 'colorCode', 'globalFlag', 'actions']);
    });
});