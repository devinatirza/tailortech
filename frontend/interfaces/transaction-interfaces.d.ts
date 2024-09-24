export interface ITransaction {
    ID: number;
    TransactionDate: string;
    UserID: number;
    TailorID: number;
    Products: IProduct[];
    Requests: IRequest[];
    Status: string;
    TotalPrice: number;
  }