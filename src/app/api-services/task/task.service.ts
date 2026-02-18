import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'https://task-management-backend-lwdq.onrender.com/api/tasks';
const lifricaApiGatewayUrl = 'http://localhost:8000';
const lifricaApiGatewayUrlProd = 'https://lifrica.com/api-gateway';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(private http: HttpClient) {}

  getTasks(): Observable<any> {
    return this.http.get(API_URL);
  }

  addTask(task: any): Observable<any> {
    return this.http.post(API_URL, task);
  }

  addAudit(task: any): Observable<any> {
    return this.http.post(`${lifricaApiGatewayUrl}/api/v1/audits`, task);
  }

  updateTask(id: string, task: any): Observable<any> {
    return this.http.patch(`${API_URL}/${id}`, task);
  }

  deleteTask(id: string): Observable<any> {
    return this.http.delete(`${API_URL}/${id}`);
  }

  getTaskById(id: string) {
    return this.http.get(`${API_URL}/${id}`);
  }

  getCountryList(): Observable<any> {
    return this.http.get(`${lifricaApiGatewayUrl}/api/v1/countries/list`);
  }
}
