import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../dataaccess/category.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.backendBaseUrl + 'categories';

  public getList(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl);
  }

  public getOne(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${id}`);
  }

  public save(category: Category): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, category);
  }

  public update(category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${category.id}`, category);
  }

  public delete(id: number): Observable<HttpResponse<string>> {
    return this.http.delete<string>(`${this.baseUrl}/${id}`, { observe: 'response' });
  }
}
