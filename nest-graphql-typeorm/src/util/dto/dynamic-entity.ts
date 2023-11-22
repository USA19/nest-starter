export interface DynamicClassEntity<T> {
  new(name: string): T;
}