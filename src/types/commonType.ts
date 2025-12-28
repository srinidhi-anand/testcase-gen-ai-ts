// interface for primitive types to be used across the application
export type Primitive = string | boolean | number | null | undefined;

// interface for nested record types to be used across the application
export interface NestedRecord {
  [key: string]: Primitive | NestedRecord | NestedRecord[];
}

// interface for common types to be used across the application
export type commonType =
  | Primitive
  | Primitive[]
  | NestedRecord
  | NestedRecord[];
