export class AuthModel {
    token?: string;
    expiresIn?: Date;
  
    setAuth(auth: any) {
      this.token = auth.token;
      this.expiresIn = auth.expiresIn;
    }
  }
  