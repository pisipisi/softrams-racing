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
import { LayoutUtilsService, MessageType } from '../core/services/layout-util.service';
import { MatDialog } from '@angular/material/dialog';
import { MemberDetailsComponent } from '../member-details/member-details.component';

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


  displayedColumns: string[] = ['select', 'id', 'firstName', 'lastName', 'jobTitle', 'team', 'status', 'actions'];
  constructor(
    public appService: AppService, 
    private router: Router, 
    public dialog: MatDialog,
    private layoutUtilsService: LayoutUtilsService,) { }

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
    this.dataSource.entitySubject.subscribe(res => this.members = res);
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
      filter.status = this.filterStatus;
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

	addMember() {
		const newMember = new MemberModel();
		newMember.clear(); // Set all defaults fields
		this.editMember(newMember);
	}

  /** Edit */
	editMember(member: MemberModel) {
		const _saveMessage = member.id > 0 ? 'Member has been updated' : 'Member has been created';
		const _messageType = member.id > 0 ? MessageType.Update : MessageType.Create;

		const dialogRef = this.dialog.open(MemberDetailsComponent, { data: { member } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.layoutUtilsService.showActionNotification(_saveMessage, _messageType, 10000, true, false);
			this.loadMembersList();
		});
	}



  editMemberByID(id: number) { }

  deleteMemberById(id: number) { }

  /** Update Status */
  updateStatusForMembers() {
    const _title = 'Update status for selected members';
    const _updateMessage = 'Selected members status have successfully been updated';
    const _statuses = [{ value: 'Active', text: 'Active' }, { value: 'Inactive', text: 'Inactive' }];
    const _messages: { text: string; id: any; status: any; statusTitle: any; statusCssClass: any; }[] = [];

    this.selection.selected.forEach(elem => {
      _messages.push({
        text: `${elem.lastName}, ${elem.firstName}`,
        id: elem.id.toString(),
        status: elem.status,
        statusTitle: elem.status,
        statusCssClass: elem.status == 'Active' ? 'primary' : 'accent'
      });
    });

    const dialogRef = this.layoutUtilsService.updateStatusForMembers(_title, _statuses, _messages);
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        this.selection.clear();
        return;
      }

      this.appService
        .updateStatusForMembers(this.selection.selected, res)
        .subscribe(() => {
          this.layoutUtilsService.showActionNotification(_updateMessage, MessageType.Update);
          this.loadMembersList();
          this.selection.clear();
        });
    });
  }

  	/** ACTIONS */
	/** Delete */
	deleteMember(_item: MemberModel) {
		const _title: string = 'Delete Member';
		const _description: string = 'Are you sure to permanently delete this member';
		const _waitDesciption: string = 'Member is deleling';
		const _deleteMessage = 'Member has been deleled';

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.appService.deleteMember(_item.id).subscribe(() => {
				this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
				this.loadMembersList();
			});
		});
	}


  deleteMembers() {
		const _title: string = 'Members Delete';
		const _description: string = 'Are you sure to permanently delete selected members?';
		const _waitDesciption: string = 'Members are deleting';
		const _deleteMessage = 'Selected members have been deleted';

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			const idsForDeletion: number[] = [];
			for (let i = 0; i < this.selection.selected.length; i++) {
				idsForDeletion.push(this.selection.selected[i].id);
			}
			this.appService
				.deleteMembers(idsForDeletion)
				.subscribe(() => {
					this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
					this.loadMembersList();
					this.selection.clear();
				});
		});
	}

}
