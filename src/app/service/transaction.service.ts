import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../dataaccess/transaction.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.backendBaseUrl + 'transactions';

  public getList(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.baseUrl);
  }

  public getOne(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.baseUrl}/${id}`);
  }

  public save(transaction: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(this.baseUrl, transaction);
  }

  public update(transaction: Transaction): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.baseUrl}/${transaction.id}`, transaction);
  }

  public delete(id: number): Observable<HttpResponse<string>> {
    return this.http.delete<string>(`${this.baseUrl}/${id}`, { observe: 'response' });
  }
}
