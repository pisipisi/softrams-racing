// NGRX
import { Action } from '@ngrx/store';

// Models
import { TeamModel } from '../models/team.model';

export enum TeamActionTypes {
    AllTeamsRequested = '[Teams Home Page] All Teams Requested',
    AllTeamsLoaded = '[Teams API] All Teams Loaded',
    TeamsPageRequested = '[Teams List Page] Teams Page Requested',
    TeamsPageLoaded = '[Teams API] Teams Page Loaded',
    TeamsPageCancelled = '[Teams API] Teams Page Cancelled',
    TeamsPageToggleLoading = '[Teams page] Teams Page Toggle Loading',
    TeamsActionToggleLoading = '[Teams] Teams Action Toggle Loading'
}


export class AllTeamsRequested implements Action {
    readonly type = TeamActionTypes.AllTeamsRequested;
}

export class AllTeamsLoaded implements Action {
    readonly type = TeamActionTypes.AllTeamsLoaded;
    constructor(public payload: { teams: TeamModel[] }) { }
}


export class TeamsActionToggleLoading implements Action {
    readonly type = TeamActionTypes.TeamsActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export type TeamActions = AllTeamsLoaded
| AllTeamsRequested
| TeamsActionToggleLoading;
