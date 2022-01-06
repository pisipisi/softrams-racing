import { BaseModel } from "./base.model";

export class MemberModel extends BaseModel {
	id!: number;
    firstName!: string;
    lastName!: string;
    jobTitle!: string;
    team!: string;
    status!: "Active" | "Inactive";
	clear() {
		
	
	}
}
