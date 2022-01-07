import { Injectable } from '@angular/core';
import { ActionNotificationComponent } from '../shared/action-notification/action-notification.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { DeleteEntityDialogComponent } from '../shared/delete-entity-dialog/delete-entity-dialog.component';
import { FetchEntityDialogComponent } from '../shared/fetch-entity-dialog/fetch-entity-dialog.component';
import { UpdateStatusDialogComponent } from '../shared/update-status-dialog/update-status-dialog.component';


export enum MessageType {
	Create,
	Read,
	Update,
	Delete
}

@Injectable()
export class LayoutUtilsService {
	constructor(private snackBar: MatSnackBar,
		private dialog: MatDialog) { }

	// SnackBar for notifications
	showActionNotification(
		message: string,
		type: MessageType = MessageType.Create,
		duration: number = 10000,
		showCloseButton: boolean = true,
		showUndoButton: boolean = false,
		undoButtonDuration: number = 3000,
		verticalPosition: 'top' | 'bottom' = 'top'
	) {
		return this.snackBar.openFromComponent(ActionNotificationComponent, {
			duration: duration,
			data: {
				message,
				snackBar: this.snackBar,
				showCloseButton: showCloseButton,
				showUndoButton: showUndoButton,
				undoButtonDuration,
				verticalPosition,
				type,
				action: 'Undo'
			},
			verticalPosition: verticalPosition
		});
	}

	// Method returns instance of MatDialog
	deleteElement(title: string = '', description: string = '', waitDesciption: string = '') {
		return this.dialog.open(DeleteEntityDialogComponent, {
			data: { title, description, waitDesciption },
			width: '440px'
		});
	}

	// Method returns instance of MatDialog
	fetchElements(_data: any) {
		return this.dialog.open(FetchEntityDialogComponent, {
			data: _data,
			width: '400px'
		});
	}

	// Method returns instance of MatDialog
	updateStatusForMembers(title: string, statuses: any, messages: any) {
		return this.dialog.open(UpdateStatusDialogComponent, {
			data: { title, statuses, messages },
			width: '480px'
		});
	}
}
