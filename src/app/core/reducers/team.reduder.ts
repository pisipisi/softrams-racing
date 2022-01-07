// NGRX
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { TeamActions, TeamActionTypes } from '../actions/team.action';
import { QueryParamsModel } from '../models/query-models/query-params.model';
// Models
import { TeamModel } from '../models/team.model';

export interface TeamsState extends EntityState<TeamModel> {
    isAllTeamsLoaded: boolean;
    queryRowsCount: number;
    queryResult: TeamModel[];
    listLoading: boolean;
    actionsloading: boolean;
    lastQuery: QueryParamsModel;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<TeamModel> = createEntityAdapter<TeamModel>();

export const initialTeamsState: TeamsState = adapter.getInitialState<any>({
    isAllTeamsLoaded: false,
    queryRowsCount: 0,
    queryResult: [],
    listLoading: false,
    actionsloading: false,
    lastQuery: new QueryParamsModel({}),
    showInitWaitingMessage: true
});

export function teamsReducer(state = initialTeamsState, action: TeamActions): TeamsState {
    switch  (action.type) {
        case TeamActionTypes.TeamsActionToggleLoading: return {
            ...state, actionsloading: action.payload.isLoading
        };
        case TeamActionTypes.AllTeamsLoaded: 
            return adapter.setAll(action.payload.teams, {
                ...state, isAllTeamsLoaded: true
            });
        default: return state;
    }
}

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
