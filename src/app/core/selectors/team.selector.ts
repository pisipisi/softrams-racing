import { TeamModel } from './../models/team.model';

// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';

// State
import * as fromTeam from '../reducers/team.reduder';
import { each } from 'lodash';
import { QueryResultsModel } from '../models/query-models/query-results.model';

export const selectTeamsState = createFeatureSelector<fromTeam.TeamsState>('teams');

export const selectTeamById = (teamId: number) => createSelector(
    selectTeamsState,
    teamsState => teamsState.entities[teamId]
);

export const selectAllTeams = createSelector(
    selectTeamsState,
    fromTeam.selectAll
);

export const selectAllTeamsIds = createSelector(
    selectTeamsState,
    fromTeam.selectIds
);

export const allTeamsLoaded = createSelector(
    selectTeamsState,
    teamsState => teamsState.isAllTeamsLoaded
);

export const selectTeamsPageLoading = createSelector(
    selectTeamsState,
    teamsState => teamsState.listLoading
);

export const selectTeamsActionLoading = createSelector(
    selectTeamsState,
    teamsState => teamsState.actionsloading
);

export const selectTeamsShowInitWaitingMessage = createSelector(
    selectTeamsState,
    teamsState => teamsState.showInitWaitingMessage
);

export const selectQueryResult = createSelector(
    selectTeamsState,
    teamsState => {
        const items: TeamModel[] = [];
        each(teamsState.entities, (element:any) => {
            items.push(element);
        });
        return new QueryResultsModel(teamsState.queryResult);
    }
);
