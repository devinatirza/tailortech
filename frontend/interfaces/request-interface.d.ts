export interface IRequest {
  ID: number;
  Name: string;
  Desc: string;
  Price: number;
  RequestType: string;
  TailorID: number;
  Tailor: ITailor;
  UserID: number;
  User: IUser
}