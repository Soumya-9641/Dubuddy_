export interface FieldDefinition {
  name: string;
  type: string;
  required?: boolean;
  default?: any;
  unique?: boolean;
}

export interface ModelDefinition {
  name: string;
  fields: FieldDefinition[];
}
