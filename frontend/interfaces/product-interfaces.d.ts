export interface IProduct {
  ID: number;
  Product: string;
  Tailor: string;
  Desc: string;
  Price: number;
  ImgUrl: string;
  Size: string;
}

export interface ICart {
  TotalPrice: number;
  Products: IProduct[]
}