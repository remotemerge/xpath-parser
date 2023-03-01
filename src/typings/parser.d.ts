export interface Expression {
  root: string;
  pagination?: string;
  queries: Record<string, string>;
}
