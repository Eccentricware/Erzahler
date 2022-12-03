export function mergeArrays(array1: any[], array2: any[]): any[] {
  array2.forEach((element: any) => {
    if (!array1.includes(element)) {
      array1.push(element);
    }
  });

  return array1;
};

export function subtractArray(filterArray: any[], removeArray: any[]): any[] {
  if (filterArray === undefined) {
    return [];
  }
  return filterArray.filter((element: any) => !removeArray.includes(element));
}

export function copyObjectOfArrays(object: any): Object {
  let copy: any = {};

  for (let key in object) {
    copy[key] = object[key].slice();
  }

  return copy;
}