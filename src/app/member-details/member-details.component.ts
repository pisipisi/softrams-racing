import { Component, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppService } from '../app.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../core/reducers';
import { selectAllTeams } from '../core/selectors/team.selector';

// This interface may be useful in the times ahead...
interface Member {
  firstName: string;
  lastName: string;
  jobTitle: string;
  team: string;
  status: string;
}

@Component({
  selector: 'app-member-details',
  templateUrl: './member-details.component.html',
  styleUrls: ['./member-details.component.css']
})
export class MemberDetailsComponent implements OnInit, OnChanges {
  memberModel!: Member;
  memberForm!: FormGroup;
  submitted = false;
  alertType!: String;
  alertMessage!: String;
  teams: any[] = [];

  constructor(
    private fb: FormBuilder, 
    private appService: AppService, 
    private store: Store<AppState>,
    private router: Router) {}

  ngOnInit() {
    this.store.select(selectAllTeams).subscribe(data => console.log(data));
  }

  ngOnChanges() {}

  // TODO: Add member to members
  onSubmit(form: FormGroup) {
    this.memberModel = form.value;
  }
}
