import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Budget } from '../dataaccess/budget.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.backendBaseUrl + 'budgets';

  public getList(): Observable<Budget[]> {
    return this.http.get<Budget[]>(this.baseUrl);
  }

  public getOne(id: number): Observable<Budget> {
    return this.http.get<Budget>(`${this.baseUrl}/${id}`);
  }

  public save(budget: Budget): Observable<Budget> {
    return this.http.post<Budget>(this.baseUrl, budget);
  }

  public update(budget: Budget): Observable<Budget> {
    return this.http.put<Budget>(`${this.baseUrl}/${budget.id}`, budget);
  }

  public delete(id: number): Observable<HttpResponse<string>> {
    return this.http.delete<string>(`${this.baseUrl}/${id}`, { observe: 'response' });
  }

  public checkBudgets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/check`);
  }
}
