import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AppService } from '../app.service';
import { Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MemberModel } from '../core/models/member.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MembersDataSource } from '../core/models/datasource/members.datasource';
import { debounceTime, distinctUntilChanged, fromEvent, merge, tap } from 'rxjs';
import { QueryParamsModel } from '../core/models/query-models/query-params.model';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent implements OnInit {
  members: MemberModel[] = [];
  filterStatus: string = '';
  selection = new SelectionModel<MemberModel>(true, []);
  dataSource!: MembersDataSource;
  @ViewChild(MatPaginator, { static: true })
  paginator!: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort!: MatSort;

  // Filter fields
  @ViewChild('searchInput', { static: true }) 
  searchInput!: ElementRef;


  displayedColumns: string[] = ['select','id', 'firstName', 'lastName', 'jobTitle', 'team', 'status'];
  constructor(public appService: AppService, private router: Router) { }

  ngOnInit() {

    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadMembersList();
				})
			)
			.subscribe();

		fromEvent(this.searchInput.nativeElement, 'keyup')
			.pipe(
				// tslint:disable-next-line:max-line-length
				debounceTime(150), 
				distinctUntilChanged(),
				tap(() => {
					this.paginator.pageIndex = 0;
					this.loadMembersList();
				})
			)
			.subscribe();

		// Init DataSource
		const queryParams = new QueryParamsModel(this.filterConfiguration(false));
		this.dataSource = new MembersDataSource(this.appService);
		// First load
		this.dataSource.loadMembers(queryParams);
		this.dataSource.entitySubject.subscribe(res => {
      console.log(res);
      this.members = res});
  }

  goToAddMemberForm() {
    console.log(`Hmmm...we didn't navigate anywhere`);
  }

  loadMembersList() {
    this.selection.clear();
    const queryParams = new QueryParamsModel(
      this.filterConfiguration(true),
      this.sort?.direction,
      this.sort?.active,
      this.paginator?.pageIndex,
      this.paginator?.pageSize
    );
    this.dataSource?.loadMembers(queryParams);
    this.selection.clear();
  }


  /** FILTRATION */
  filterConfiguration(isGeneralSearch: boolean = true): any {
    const filter: any = {};
    const searchText: string = this.searchInput.nativeElement.value;

    if (this.filterStatus && this.filterStatus.length > 0) {
      filter.status = +this.filterStatus;
    }

    filter.lastName = searchText;
    if (!isGeneralSearch) {
      return filter;
    }
    filter.firstName = searchText;

    return filter;
  }
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.members.length;
		return numSelected === numRows;
	}
  masterToggle() {
		if (this.selection.selected.length === this.members.length) {
			this.selection.clear();
		} else {
			this.members.forEach(row => this.selection.select(row));
		}
	}


  editMemberByID(id: number) { }

  deleteMemberById(id: number) { }
}
