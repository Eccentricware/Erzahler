import { Primitive } from '../../models/objects/general-objects';

export function mergeArrays(array1: Primitive[], array2: Primitive[]): Primitive[] {
  array2.forEach((element: Primitive) => {
    if (!array1.includes(element)) {
      array1.push(element);
    }
  });

  return array1;
}

export function subtractArray(filterArray: Primitive[], removeArray: Primitive[]): Primitive[] {
  if (filterArray === undefined) {
    return [];
  }
  return filterArray.filter((element: Primitive) => !removeArray.includes(element));
}

export function copyObjectOfArrays(object: Record<string, Primitive[]>): Record<string, Primitive[]> {
  const copy: Record<string, Primitive[]> = {};

  for (const key in object) {
    copy[key] = object[key].slice();
  }

  return copy;
}
