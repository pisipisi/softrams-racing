import { AuthModel } from './auth.model';

export class UserModel extends AuthModel {
  id!: number;
  username!: string;
  password!: string;
 
  setUser(user: any) {
    this.id = user.id;
    this.username = user.username || '';
    this.password = user.password || '';
  }
}
