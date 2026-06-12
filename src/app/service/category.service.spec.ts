import { TestBed } from '@angular/core/testing';
import { CategoryService } from './category.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Category } from '../dataaccess/category.model';
import { environment } from '../../environments/environment';
import { expect } from 'vitest';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;

  const baseUrl = environment.backendBaseUrl + 'categories';

  const fakeCategories: Category[] = [
  { id: 1, name: 'Lebensmittel', colorCode: '#ff0000', globalFlag: true },
  { id: 2, name: 'Verkehr',      colorCode: '#00ff00', globalFlag: false },
];
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
      teardown: { destroyAfterEach: true },
    });
    service  = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a list of categories', () => {
    service.getList().subscribe(data => {
      expect(data).toHaveLength(fakeCategories.length);
      expect(data).toEqual(fakeCategories);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(fakeCategories);
  });

  it('should return a single category by id', () => {
    const category = fakeCategories[0];

    service.getOne(category.id).subscribe(data => {
      expect(data).toEqual(category);
    });

    const req = httpMock.expectOne(`${baseUrl}/${category.id}`);
    expect(req.request.method).toBe('GET');
    req.flush(category);
  });

  it('should create a new category', () => {
    const newCategory: Category = { id: 3, name: 'Freizeit', colorCode: '#0000ff', globalFlag: false };

    service.save(newCategory).subscribe(data => {
      expect(data).toEqual(newCategory);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newCategory);
    req.flush(newCategory);
  });

  it('should update an existing category', () => {
    const updated: Category = { ...fakeCategories[0], name: 'Updated' };

    service.update(updated).subscribe(data => {
      expect(data.name).toBe('Updated');
    });

    const req = httpMock.expectOne(`${baseUrl}/${updated.id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updated);
    req.flush(updated);
  });

  it('should delete a category', () => {
    const category = fakeCategories[0];

    service.delete(category.id).subscribe(response => {
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne(`${baseUrl}/${category.id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 200, statusText: 'OK' });
  });
});