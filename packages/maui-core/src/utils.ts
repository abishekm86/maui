// type Path<T> = T extends object
//   ? {
//       [K in keyof T]: K extends string
//         ? T[K] extends Array<infer U> // Check if the property is an array
//           ? `${K}` | `${K}.${number}` | `${K}.${number}.${Path<U>}`
//           : T[K] extends object
//             ? `${K}` | `${K}.${Path<T[K]>}`
//             : `${K}`
//         : never
//     }[keyof T]
//   : never

// /**
//  * Updates a nested value in an object based on a dot-separated path,
//  * returning a shallow copy with the updated value.
//  *
//  * @param obj - The original object to update.
//  * @param path - Dot-separated string path (e.g., "foo.bar.1.value") indicating the nested property to update.
//  * @param newValue - The new value to set at the specified path.
//  * @returns A new object with the specified nested value updated.
//  */
// export function updateNestedValue<T>(obj: T, path: Path<T>, newValue: any): T {
//   const copy = { ...obj }
//   let current: any = copy

//   // Split the path by "." and convert numeric segments to numbers (for arrays)
//   const keys = path.split('.').map(key => (!isNaN(Number(key)) ? Number(key) : key))

//   for (let i = 0; i < keys.length - 1; i++) {
//     const key = keys[i]

//     // Copy each level as needed (array or object)
//     current[key] = Array.isArray(current[key]) ? [...current[key]] : { ...current[key] }
//     current = current[key]
//   }

//   // Set the new value at the specified path
//   current[keys[keys.length - 1]] = newValue

//   return copy as T
// }
