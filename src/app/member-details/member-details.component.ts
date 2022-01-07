import { Component, OnInit, OnChanges, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppService } from '../app.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../core/reducers';
import { selectAllTeams } from '../core/selectors/team.selector';
import { TeamModel } from '../core/models/team.model';
import { MemberModel } from '../core/models/member.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { catchError, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';



@Component({
  selector: 'app-member-details',
  templateUrl: './member-details.component.html',
  styleUrls: ['./member-details.component.css']
})
export class MemberDetailsComponent implements OnInit, OnChanges {
  member!: MemberModel;
  memberForm!: FormGroup;
  submitted = false;
  alertType!: String;
  alertMessage!: String;
  teams: TeamModel[] = [];

  hasFormErrors: boolean = false;
  errorMessage: string = 'Oh snap! Change a few things up and try submitting again';
  viewLoading: boolean = false;
  loadingAfterSubmit: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<MemberDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { member: MemberModel },
    private fb: FormBuilder,
    private appService: AppService,
    private store: Store<AppState>,
    private router: Router) { }

  ngOnInit() {
    this.member = this.data.member;
    this.store.select(selectAllTeams).subscribe(data => {
      this.teams = data;
      this.createForm();
    });
    
  }

  createForm() {
    this.memberForm = this.fb.group({
      firstName: [this.member.firstName, Validators.required],
      lastName: [this.member.lastName, Validators.required],
      jobTitle: [this.member.jobTitle, Validators.required],
      team: [ this.member.team, Validators.required],
      status: [this.member.status ?? 'Active']
    });
  }

  ngOnChanges() { }

  /** UI */
  getTitle(): string {
    if (this.member.id > 0) {
      return `Edit member '${this.member.firstName} ${this.member.lastName}'`;
    }

    return 'New member';
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.memberForm.controls[controlName];
    const result = control.invalid && control.touched;
    return result;
  }
  /** ACTIONS */
  prepareMember(): any {
    const controls = this.memberForm.controls;
    const _member: any = {
      id: this.member.id,
      firstName: controls['firstName'].value,
      lastName: controls['lastName'].value,
      jobTitle: controls['jobTitle'].value,
      team: controls['team'].value,
      status: controls['status'].value,
    };
   
    return _member;
  }

  onSubmit() {
		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;
		const controls = this.memberForm.controls;
		/** check form */
		if (this.memberForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.errorMessage = 'Oh snap! Change a few things up and try submitting again';
			return;
		}

		const editedMember = this.prepareMember();
		if (editedMember.id > 0) {
			this.updateMember(editedMember);
		} else {
			this.createMember(editedMember);
		}
	}

	updateMember(_member: MemberModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.appService.updateMember(_member).pipe(catchError( (err: HttpErrorResponse)  => {
			this.viewLoading = false;
			if(err.error) {
				this.hasFormErrors = true;
				this.errorMessage = err.message;
			}
			return throwError(() => err);
		})).subscribe(res => {
			/* Server loading imitation. Remove this on real code */
			this.viewLoading = false;

			this.dialogRef.close({
				_member,
				isEdit: true
			});
		});
	}

	createMember(_member: MemberModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.appService.addMember(_member).pipe(catchError( (err: HttpErrorResponse) => {
			this.viewLoading = false;

			if(err.error) {
				this.hasFormErrors = true;
				this.errorMessage = err.message;
			}
			return throwError(() => err);
		})).subscribe(res => {
			this.viewLoading = false;
			this.dialogRef.close({
				_member,
				isEdit: false
			});
		});
	}

	onAlertClose($event:any) {
		this.hasFormErrors = false;
	}
}
