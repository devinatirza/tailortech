interface Speciality {
  Category: string;
  Price: number;
}

export interface ITailor {
  ID: number;
  Name: string;
  Email: string;
  Address: string;
  ImgUrl: string;
  Rating: number;
  Money: number;
  Speciality: Speciality[];
}
