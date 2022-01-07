// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map } from 'rxjs/operators';
// NGRX
import { Effect, Actions, ofType, createEffect } from '@ngrx/effects';

// Actions
import {
    AllTeamsLoaded,
    AllTeamsRequested,
    TeamActionTypes,
    TeamsActionToggleLoading
} from '../actions/team.action';
import { TeamModel } from '../models/team.model';
import { AppService } from 'src/app/app.service';
import { Observable } from 'rxjs/internal/Observable';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';

@Injectable()
export class TeamEffects {
    showActionLoadingDistpatcher = new TeamsActionToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new TeamsActionToggleLoading({ isLoading: false });

    @Effect()
    loadAllTeams$ = this.actions$
        .pipe(
            ofType<AllTeamsRequested>(TeamActionTypes.AllTeamsRequested),
            mergeMap(() => this.appService.getTeams()),
            map((teams: TeamModel[]) => {
                return new AllTeamsLoaded({ teams });
            })
        );


    init$: Observable<Action> = createEffect(() => {
        return of(new AllTeamsRequested());
    });
    constructor(private actions$: Actions, private appService: AppService) { }
}
