import { FormArray, FormControl, FormGroup } from '@angular/forms';

// Valid primitives for FormControl
type Primitive = string | number | boolean; // | null | undefined; 

// Detect if type is object (not primitive, not function, not array)
type IsObject<T> =
  T extends Primitive ? false :
  T extends (...args: any[]) => any ? false :
  T extends Array<any> ? false :
  T extends object ? true : false;

// Convert recursively any struture to its eqivalent FormControl/FormGroup/FormArray
export type ConvertToForm<T> =
  // Array
  T extends (infer U)[] ? FormArray<ConvertToForm<U>> :
  // Objet
  IsObject<T> extends true ? FormGroup<{ [K in keyof T]: ConvertToForm<T[K]> }> :
  // Primitive
  FormControl<T>;
