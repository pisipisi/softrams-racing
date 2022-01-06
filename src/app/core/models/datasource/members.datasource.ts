import { Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { QueryParamsModel } from '../query-models/query-params.model';
import { BaseDataSource } from './base.datasource';
import { QueryResultsModel } from '../query-models/query-results.model';
import { AppService } from 'src/app/app.service';

export class MembersDataSource extends BaseDataSource {
	constructor(private appService: AppService) {
		super();
	}

	loadMembers(queryParams: QueryParamsModel) {
		this.loadingSubject.next(true);
		this.appService.getMembers(queryParams).pipe(
			tap(res => {
				this.entitySubject.next(res.items);
				this.paginatorTotalSubject.next(res.totalCount);
			}),
			catchError(err => of(new QueryResultsModel([], err))),
			finalize(() => this.loadingSubject.next(false))
		).subscribe();
	}
}
