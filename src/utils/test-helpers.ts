
export function isEquivalent(a, b) {
  // Create arrays of property names
  var aProps = Object.getOwnPropertyNames(a);
  var bProps = Object.getOwnPropertyNames(b);

  // If number of properties is different,
  // objects are not equivalent
  if (aProps.length != bProps.length) {
      return false;
  }

  for (var i = 0; i < aProps.length; i++) {
      var propName = aProps[i];

      // If values of same property are not equal,
      // objects are not equivalent
      if (a[propName] !== b[propName]) {
          return false;
      }
  }

  // If we made it this far, objects
  // are considered equivalent
  return true;
}
export function isObjArraysEquivalent(a:any[],b:any[]) {
  if(a.length != b.length) {
    return false;
  }

  for(let i = 0; i < a.length; i+= 1) {
    if(!isEquivalent(a[i],b[i])) {
      return false
    }
  }
  return true;
}