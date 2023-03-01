export interface Expression {
  root: string;
  pagination?: string;
  queries: {
    [key: string]: string;
  };
}
