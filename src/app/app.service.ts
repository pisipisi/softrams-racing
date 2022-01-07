import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { QueryResultsModel } from './core/models/query-models/query-results.model';
import { HttpUtilsService } from './core/services/http-utils.service';
import { QueryParamsModel } from './core/models/query-models/query-params.model';
import { MemberModel } from './core/models/member.model';
import { TeamModel } from './core/models/team.model';
import { find } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  api = 'http://localhost:8000/api';
  username!: string;

  constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

  // Returns all members
  getMembers(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const httpParams = this.httpUtils.getFindHTTPParams(queryParams);

    return this.http
      .get<QueryResultsModel>(`${this.api}/members`, {
        headers: httpHeaders,
        params: httpParams
      })
      .pipe(catchError(this.handleError));
  }

  setUsername(name: string): void {
    this.username = name;
  }

  addMember(member: any) { 
    return this.http.post(`${this.api}/addMember`, member);
  }

  getTeams(): Observable<TeamModel[]> { 
    return this.http.get<TeamModel[]>(`${this.api}/teams`);
  }

  // UPDATE Status
  updateStatusForMembers(members: MemberModel[], status: string): Observable<any> {
    const body = {
      membersForUpdate: members,
      newStatus: status
    };
    return this.http.put(`${this.api}/members/updateStatus`, body);
  }

  deleteMember(id: number) {
    return this.http.delete(`${this.api}/members/${id}`);
  }

  deleteMembers(ids: number[]) {
    const del: Observable<any>[] = [];
    ids.forEach(id => del.push(this.deleteMember(id)));
    return forkJoin(del);
  }

  updateMember(member: MemberModel) {
    return this.http.post(`${this.api}/addMember`, member);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    return [];
  }
}
