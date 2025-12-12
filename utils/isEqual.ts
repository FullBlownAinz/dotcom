// A simple deep equality check for objects.
// This is not exhaustive but sufficient for comparing Supabase data objects.
export const isEqual = (obj1: any, obj2: any): boolean => {
    if (obj1 === null || obj2 === null) return obj1 === obj2;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;
    if (obj1 === undefined || obj2 === undefined) return obj1 === obj2;
    
    // Quick check for performance
    if (JSON.stringify(obj1) === JSON.stringify(obj2)) return true;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
        if (!keys2.includes(key) || !isEqual(obj1[key], obj2[key])) {
            return false;
        }
    }
    return true;
};
