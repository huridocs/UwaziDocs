export interface ResultSet<T> {
  all(): Promise<T[]>;
  page(number: number, size: number): Promise<T[]>;
  first(): Promise<T | null>;
  forEach(callback: (item: T) => Promise<void> | void): Promise<void>;
  every(predicate: (item: T) => Promise<boolean> | boolean): Promise<boolean>;
}
