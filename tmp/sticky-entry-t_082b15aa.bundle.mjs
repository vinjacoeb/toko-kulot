// tmp/sticky-entry-t_082b15aa.jsx
import React10 from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { writeFileSync } from "node:fs";

// resources/js/Components/DataTable.jsx
import React9 from "react";

// resources/js/lib/format.js
var cn = (...classes) => classes.flat().filter(Boolean).join(" ");

// resources/js/Components/EmptyState.jsx
import React6 from "react";

// resources/js/Components/Button.jsx
import React5 from "react";

// node_modules/es-toolkit/dist/_internal/globalThis.mjs
var globalThis_ = typeof globalThis === "object" && globalThis || typeof window === "object" && window || typeof self === "object" && self || typeof global === "object" && global || /* @__PURE__ */ (function() {
  return this;
})();

// node_modules/es-toolkit/dist/function/debounce.mjs
function debounce(func, debounceMs, { signal, edges } = {}) {
  let pendingThis = void 0;
  let pendingArgs = null;
  const leading = edges != null && edges.includes("leading");
  const trailing = edges == null || edges.includes("trailing");
  const invoke = () => {
    if (pendingArgs !== null) {
      func.apply(pendingThis, pendingArgs);
      pendingThis = void 0;
      pendingArgs = null;
    }
  };
  const onTimerEnd = () => {
    if (trailing) invoke();
    cancel();
  };
  let timeoutId = null;
  const schedule = () => {
    if (timeoutId != null) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      onTimerEnd();
    }, debounceMs);
  };
  const cancelTimer = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  const cancel = () => {
    cancelTimer();
    pendingThis = void 0;
    pendingArgs = null;
  };
  const flush = () => {
    invoke();
  };
  const debounced = function(...args) {
    if (signal?.aborted) return;
    pendingThis = this;
    pendingArgs = args;
    const isFirstCall = timeoutId == null;
    schedule();
    if (leading && isFirstCall) invoke();
  };
  debounced.schedule = schedule;
  debounced.cancel = cancel;
  debounced.flush = flush;
  signal?.addEventListener("abort", cancel, { once: true });
  return debounced;
}

// node_modules/es-toolkit/dist/function/noop.mjs
function noop() {
}

// node_modules/es-toolkit/dist/predicate/isPrimitive.mjs
function isPrimitive(value) {
  return value == null || typeof value !== "object" && typeof value !== "function";
}

// node_modules/es-toolkit/dist/predicate/isTypedArray.mjs
function isTypedArray(x) {
  return ArrayBuffer.isView(x) && !(x instanceof DataView);
}

// node_modules/es-toolkit/dist/object/clone.mjs
function clone(obj) {
  if (isPrimitive(obj)) return obj;
  if (Array.isArray(obj) || isTypedArray(obj) || obj instanceof ArrayBuffer || typeof SharedArrayBuffer !== "undefined" && obj instanceof SharedArrayBuffer) return obj.slice(0);
  const prototype = Object.getPrototypeOf(obj);
  if (prototype == null) return Object.assign(Object.create(prototype), obj);
  const Constructor = prototype.constructor;
  if (obj instanceof Date || obj instanceof Map || obj instanceof Set) return new Constructor(obj);
  if (obj instanceof RegExp) {
    const newRegExp = new Constructor(obj);
    newRegExp.lastIndex = obj.lastIndex;
    return newRegExp;
  }
  if (obj instanceof DataView) return new Constructor(obj.buffer.slice(0));
  if (obj instanceof Error) {
    let newError;
    if (obj instanceof AggregateError) newError = new Constructor(obj.errors, obj.message, { cause: obj.cause });
    else newError = new Constructor(obj.message, { cause: obj.cause });
    newError.stack = obj.stack;
    Object.assign(newError, obj);
    return newError;
  }
  if (typeof File !== "undefined" && obj instanceof File) return new Constructor([obj], obj.name, {
    type: obj.type,
    lastModified: obj.lastModified
  });
  if (typeof obj === "object") return Object.assign(Object.create(prototype), obj);
  return obj;
}

// node_modules/es-toolkit/dist/predicate/isBuffer.mjs
function isBuffer(x) {
  return typeof globalThis_.Buffer !== "undefined" && globalThis_.Buffer.isBuffer(x);
}

// node_modules/es-toolkit/dist/compat/_internal/getSymbols.mjs
function getSymbols(object) {
  return Object.getOwnPropertySymbols(object).filter((symbol) => Object.prototype.propertyIsEnumerable.call(object, symbol));
}

// node_modules/es-toolkit/dist/compat/_internal/getTag.mjs
function getTag(value) {
  if (value == null) return value === void 0 ? "[object Undefined]" : "[object Null]";
  return Object.prototype.toString.call(value);
}

// node_modules/es-toolkit/dist/compat/_internal/tags.mjs
var regexpTag = "[object RegExp]";
var stringTag = "[object String]";
var numberTag = "[object Number]";
var booleanTag = "[object Boolean]";
var argumentsTag = "[object Arguments]";
var symbolTag = "[object Symbol]";
var dateTag = "[object Date]";
var mapTag = "[object Map]";
var setTag = "[object Set]";
var arrayTag = "[object Array]";
var functionTag = "[object Function]";
var arrayBufferTag = "[object ArrayBuffer]";
var objectTag = "[object Object]";
var errorTag = "[object Error]";
var dataViewTag = "[object DataView]";
var uint8ArrayTag = "[object Uint8Array]";
var uint8ClampedArrayTag = "[object Uint8ClampedArray]";
var uint16ArrayTag = "[object Uint16Array]";
var uint32ArrayTag = "[object Uint32Array]";
var bigUint64ArrayTag = "[object BigUint64Array]";
var int8ArrayTag = "[object Int8Array]";
var int16ArrayTag = "[object Int16Array]";
var int32ArrayTag = "[object Int32Array]";
var bigInt64ArrayTag = "[object BigInt64Array]";
var float32ArrayTag = "[object Float32Array]";
var float64ArrayTag = "[object Float64Array]";

// node_modules/es-toolkit/dist/object/cloneDeepWith.mjs
function cloneDeepWith(obj, cloneValue) {
  return cloneDeepWithImpl(obj, void 0, obj, /* @__PURE__ */ new Map(), cloneValue);
}
function cloneDeepWithImpl(valueToClone, keyToClone, objectToClone, stack = /* @__PURE__ */ new Map(), cloneValue = void 0) {
  const cloned = cloneValue?.(valueToClone, keyToClone, objectToClone, stack);
  if (cloned !== void 0) return cloned;
  if (isPrimitive(valueToClone)) return valueToClone;
  if (stack.has(valueToClone)) return stack.get(valueToClone);
  if (Array.isArray(valueToClone)) {
    const result = new Array(valueToClone.length);
    stack.set(valueToClone, result);
    for (let i = 0; i < valueToClone.length; i++) result[i] = cloneDeepWithImpl(valueToClone[i], i, objectToClone, stack, cloneValue);
    if (Object.hasOwn(valueToClone, "index")) result.index = valueToClone.index;
    if (Object.hasOwn(valueToClone, "input")) result.input = valueToClone.input;
    return result;
  }
  if (valueToClone instanceof Date) return new Date(valueToClone.getTime());
  if (valueToClone instanceof RegExp) {
    const result = new RegExp(valueToClone.source, valueToClone.flags);
    result.lastIndex = valueToClone.lastIndex;
    return result;
  }
  if (valueToClone instanceof Map) {
    const result = /* @__PURE__ */ new Map();
    stack.set(valueToClone, result);
    for (const [key, value] of valueToClone) result.set(key, cloneDeepWithImpl(value, key, objectToClone, stack, cloneValue));
    return result;
  }
  if (valueToClone instanceof Set) {
    const result = /* @__PURE__ */ new Set();
    stack.set(valueToClone, result);
    for (const value of valueToClone) result.add(cloneDeepWithImpl(value, void 0, objectToClone, stack, cloneValue));
    return result;
  }
  if (isBuffer(valueToClone)) return valueToClone.subarray();
  if (isTypedArray(valueToClone)) {
    const result = new (Object.getPrototypeOf(valueToClone)).constructor(valueToClone.length);
    stack.set(valueToClone, result);
    for (let i = 0; i < valueToClone.length; i++) result[i] = cloneDeepWithImpl(valueToClone[i], i, objectToClone, stack, cloneValue);
    return result;
  }
  if (valueToClone instanceof ArrayBuffer || typeof SharedArrayBuffer !== "undefined" && valueToClone instanceof SharedArrayBuffer) return valueToClone.slice(0);
  if (valueToClone instanceof DataView) {
    const result = new DataView(valueToClone.buffer.slice(0), valueToClone.byteOffset, valueToClone.byteLength);
    stack.set(valueToClone, result);
    copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
    return result;
  }
  if (typeof File !== "undefined" && valueToClone instanceof File) {
    const result = new File([valueToClone], valueToClone.name, { type: valueToClone.type });
    stack.set(valueToClone, result);
    copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
    return result;
  }
  if (typeof Blob !== "undefined" && valueToClone instanceof Blob) {
    const result = new Blob([valueToClone], { type: valueToClone.type });
    stack.set(valueToClone, result);
    copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
    return result;
  }
  if (valueToClone instanceof Error) {
    const result = structuredClone(valueToClone);
    stack.set(valueToClone, result);
    result.message = valueToClone.message;
    result.name = valueToClone.name;
    result.stack = valueToClone.stack;
    result.cause = valueToClone.cause;
    result.constructor = valueToClone.constructor;
    copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
    return result;
  }
  if (valueToClone instanceof Boolean) {
    const result = new Boolean(valueToClone.valueOf());
    stack.set(valueToClone, result);
    copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
    return result;
  }
  if (valueToClone instanceof Number) {
    const result = new Number(valueToClone.valueOf());
    stack.set(valueToClone, result);
    copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
    return result;
  }
  if (valueToClone instanceof String) {
    const result = new String(valueToClone.valueOf());
    stack.set(valueToClone, result);
    copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
    return result;
  }
  if (typeof valueToClone === "object" && isCloneableObject(valueToClone)) {
    const result = Object.create(Object.getPrototypeOf(valueToClone));
    stack.set(valueToClone, result);
    copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
    return result;
  }
  return valueToClone;
}
function copyProperties(target, source, objectToClone = target, stack, cloneValue) {
  const keys = [...Object.keys(source), ...getSymbols(source)];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const descriptor = Object.getOwnPropertyDescriptor(target, key);
    if (descriptor == null || descriptor.writable) target[key] = cloneDeepWithImpl(source[key], key, objectToClone, stack, cloneValue);
  }
}
function isCloneableObject(object) {
  switch (getTag(object)) {
    case argumentsTag:
    case arrayTag:
    case arrayBufferTag:
    case dataViewTag:
    case booleanTag:
    case dateTag:
    case float32ArrayTag:
    case float64ArrayTag:
    case int8ArrayTag:
    case int16ArrayTag:
    case int32ArrayTag:
    case mapTag:
    case numberTag:
    case objectTag:
    case regexpTag:
    case setTag:
    case stringTag:
    case symbolTag:
    case uint8ArrayTag:
    case uint8ClampedArrayTag:
    case uint16ArrayTag:
    case uint32ArrayTag:
      return true;
    default:
      return false;
  }
}

// node_modules/es-toolkit/dist/object/cloneDeep.mjs
function cloneDeep(obj) {
  return cloneDeepWithImpl(obj, void 0, obj, /* @__PURE__ */ new Map(), void 0);
}

// node_modules/es-toolkit/dist/predicate/isPlainObject.mjs
function isPlainObject(value) {
  if (!value || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  if (!(proto === null || proto === Object.prototype || Object.getPrototypeOf(proto) === null)) return false;
  return Object.prototype.toString.call(value) === "[object Object]";
}

// node_modules/es-toolkit/dist/_internal/isUnsafeProperty.mjs
function isUnsafeProperty(key) {
  return key === "__proto__";
}

// node_modules/es-toolkit/dist/compat/predicate/isPlainObject.mjs
function isPlainObject2(object) {
  if (typeof object !== "object") return false;
  if (object == null) return false;
  if (Object.getPrototypeOf(object) === null) return true;
  if (Object.prototype.toString.call(object) !== "[object Object]") {
    const tag = object[Symbol.toStringTag];
    if (tag == null) return false;
    if (!Object.getOwnPropertyDescriptor(object, Symbol.toStringTag)?.writable) return false;
    return object.toString() === `[object ${tag}]`;
  }
  let proto = object;
  while (Object.getPrototypeOf(proto) !== null) proto = Object.getPrototypeOf(proto);
  return Object.getPrototypeOf(object) === proto;
}

// node_modules/es-toolkit/dist/compat/util/eq.mjs
function eq(value, other) {
  return value === other || Number.isNaN(value) && Number.isNaN(other);
}

// node_modules/es-toolkit/dist/predicate/isEqualWith.mjs
function isEqualWith(a, b, areValuesEqual) {
  return isEqualWithImpl(a, b, void 0, void 0, void 0, void 0, areValuesEqual);
}
function isEqualWithImpl(a, b, property, aParent, bParent, stack, areValuesEqual) {
  const result = areValuesEqual(a, b, property, aParent, bParent, stack);
  if (result !== void 0) return result;
  if (typeof a === typeof b) switch (typeof a) {
    case "bigint":
    case "string":
    case "boolean":
    case "symbol":
    case "undefined":
      return a === b;
    case "number":
      return a === b || Object.is(a, b);
    case "function":
      return a === b;
    case "object":
      return areObjectsEqual(a, b, stack, areValuesEqual);
  }
  return areObjectsEqual(a, b, stack, areValuesEqual);
}
function areObjectsEqual(a, b, stack, areValuesEqual) {
  if (Object.is(a, b)) return true;
  let aTag = getTag(a);
  let bTag = getTag(b);
  if (aTag === "[object Arguments]") aTag = objectTag;
  if (bTag === "[object Arguments]") bTag = objectTag;
  if (aTag !== bTag) return false;
  switch (aTag) {
    case stringTag:
      return a.toString() === b.toString();
    case numberTag:
      return eq(a.valueOf(), b.valueOf());
    case booleanTag:
    case dateTag:
    case symbolTag:
      return Object.is(a.valueOf(), b.valueOf());
    case regexpTag:
      return a.source === b.source && a.flags === b.flags;
    case functionTag:
      return a === b;
  }
  stack = stack ?? /* @__PURE__ */ new Map();
  const aStack = stack.get(a);
  const bStack = stack.get(b);
  if (aStack != null && bStack != null) return aStack === b;
  stack.set(a, b);
  stack.set(b, a);
  try {
    switch (aTag) {
      case mapTag:
        if (a.size !== b.size) return false;
        for (const [key, value] of a.entries()) if (!b.has(key) || !isEqualWithImpl(value, b.get(key), key, a, b, stack, areValuesEqual)) return false;
        return true;
      case setTag: {
        if (a.size !== b.size) return false;
        const aValues = Array.from(a.values());
        const bValues = Array.from(b.values());
        for (let i = 0; i < aValues.length; i++) {
          const aValue = aValues[i];
          const index = bValues.findIndex((bValue) => {
            return isEqualWithImpl(aValue, bValue, void 0, a, b, stack, areValuesEqual);
          });
          if (index === -1) return false;
          bValues.splice(index, 1);
        }
        return true;
      }
      case arrayTag:
      case uint8ArrayTag:
      case uint8ClampedArrayTag:
      case uint16ArrayTag:
      case uint32ArrayTag:
      case bigUint64ArrayTag:
      case int8ArrayTag:
      case int16ArrayTag:
      case int32ArrayTag:
      case bigInt64ArrayTag:
      case float32ArrayTag:
      case float64ArrayTag:
        if (isBuffer(a) !== isBuffer(b)) return false;
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) if (!isEqualWithImpl(a[i], b[i], i, a, b, stack, areValuesEqual)) return false;
        return true;
      case arrayBufferTag:
        if (a.byteLength !== b.byteLength) return false;
        return areObjectsEqual(new Uint8Array(a), new Uint8Array(b), stack, areValuesEqual);
      case dataViewTag:
        if (a.byteLength !== b.byteLength || a.byteOffset !== b.byteOffset) return false;
        return areObjectsEqual(new Uint8Array(a), new Uint8Array(b), stack, areValuesEqual);
      case errorTag:
        return a.name === b.name && a.message === b.message;
      case objectTag: {
        if (!(areObjectsEqual(a.constructor, b.constructor, stack, areValuesEqual) || isPlainObject(a) && isPlainObject(b))) return false;
        const aKeys = [...Object.keys(a), ...getSymbols(a)];
        const bKeys = [...Object.keys(b), ...getSymbols(b)];
        if (aKeys.length !== bKeys.length) return false;
        for (let i = 0; i < aKeys.length; i++) {
          const propKey = aKeys[i];
          const aProp = a[propKey];
          if (!Object.hasOwn(b, propKey)) return false;
          const bProp = b[propKey];
          if (!isEqualWithImpl(aProp, bProp, propKey, a, b, stack, areValuesEqual)) return false;
        }
        return true;
      }
      default:
        return false;
    }
  } finally {
    stack.delete(a);
    stack.delete(b);
  }
}

// node_modules/es-toolkit/dist/predicate/isEqual.mjs
function isEqual(a, b) {
  return isEqualWith(a, b, noop);
}

// node_modules/es-toolkit/dist/predicate/isLength.mjs
function isLength(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

// node_modules/es-toolkit/dist/compat/predicate/isArrayLike.mjs
function isArrayLike(value) {
  return value != null && typeof value !== "function" && isLength(value.length);
}

// node_modules/es-toolkit/dist/compat/predicate/isSymbol.mjs
function isSymbol(value) {
  return typeof value === "symbol" || value instanceof Symbol;
}

// node_modules/es-toolkit/dist/compat/util/toString.mjs
function toString(value) {
  if (value == null) return "";
  return baseToString(value);
}
function baseToString(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(baseToString).join(",");
  if (isSymbol(value)) return value.toString();
  const result = value + "";
  if (result === "0" && Object.is(Number(value), -0)) return "-0";
  return result;
}

// node_modules/es-toolkit/dist/compat/_internal/toKey.mjs
function toKey(value) {
  if (typeof value === "string" || typeof value === "symbol") return value;
  if (Object.is(value?.valueOf?.(), -0)) return "-0";
  return String(value);
}

// node_modules/es-toolkit/dist/compat/util/toPath.mjs
function toPath(deepKey) {
  if (Array.isArray(deepKey)) return deepKey.map(toKey);
  if (typeof deepKey === "symbol") return [deepKey];
  deepKey = toString(deepKey);
  const result = [];
  const length = deepKey.length;
  if (length === 0) return result;
  let index = 0;
  let key = "";
  let quoteChar = "";
  let bracket = false;
  let bracketHadQuote = false;
  const bracketNumberRegex = /^-?\d+(?:\.\d+)?$/;
  if (deepKey.charCodeAt(0) === 46) result.push("");
  while (index < length) {
    const char = deepKey[index];
    if (quoteChar) if (char === "\\" && index + 1 < length) {
      index++;
      key += deepKey[index];
    } else if (char === quoteChar) quoteChar = "";
    else key += char;
    else if (bracket) if (char === '"' || char === "'") {
      quoteChar = char;
      bracketHadQuote = true;
    } else if (char === "]") {
      bracket = false;
      if (!bracketHadQuote && key.includes(".") && !bracketNumberRegex.test(key)) {
        const segments = key.split(".");
        for (let i = 0; i < segments.length; i++) if (segments[i] !== "") result.push(segments[i]);
      } else result.push(key);
      key = "";
    } else key += char;
    else if (char === "[") {
      bracket = true;
      bracketHadQuote = false;
      if (key) {
        result.push(key);
        key = "";
      }
    } else if (char === ".") {
      if (key) {
        result.push(key);
        key = "";
      }
      const next = deepKey[index + 1];
      if (next === void 0 || next === ".") result.push("");
    } else key += char;
    index++;
  }
  if (key) result.push(key);
  return result;
}

// node_modules/es-toolkit/dist/compat/_internal/isDeepKey.mjs
var regexIsDeepProp = /\.|(\[(?:[^[\]]*|(["'])(?:(?!\2)[^\\]|\\.)*?\2)\])/;
function isDeepKey(key) {
  switch (typeof key) {
    case "number":
    case "symbol":
      return false;
    case "string":
      if (key === "" || key.startsWith(".") || key.endsWith(".")) return false;
      return regexIsDeepProp.test(key);
    default:
      return false;
  }
}

// node_modules/es-toolkit/dist/compat/object/get.mjs
function get(object, path, defaultValue) {
  if (object == null) return defaultValue;
  switch (typeof path) {
    case "string": {
      if (isUnsafeProperty(path)) return defaultValue;
      const result = object[path];
      if (result === void 0) if (isDeepKey(path) && !Object.hasOwn(object, path)) return get(object, toPath(path), defaultValue);
      else return defaultValue;
      return result;
    }
    case "number":
    case "symbol": {
      if (typeof path === "number") path = toKey(path);
      const result = object[path];
      if (result === void 0) return defaultValue;
      return result;
    }
    default: {
      if (Array.isArray(path)) return getWithPath(object, path, defaultValue);
      if (Object.is(path?.valueOf(), -0)) path = "-0";
      else path = String(path);
      if (isUnsafeProperty(path)) return defaultValue;
      const result = object[path];
      if (result === void 0) return defaultValue;
      return result;
    }
  }
}
function getWithPath(object, path, defaultValue) {
  if (path.length === 0) return defaultValue;
  let current = object;
  for (let index = 0; index < path.length; index++) {
    if (current == null) return defaultValue;
    if (isUnsafeProperty(path[index])) return defaultValue;
    current = current[path[index]];
  }
  if (current === void 0) return defaultValue;
  return current;
}

// node_modules/es-toolkit/dist/compat/predicate/isObject.mjs
function isObject(value) {
  return value !== null && (typeof value === "object" || typeof value === "function");
}

// node_modules/es-toolkit/dist/compat/object/cloneDeepWith.mjs
function cloneDeepWith2(obj, customizer) {
  return cloneDeepWith(obj, (value, key, object, stack) => {
    const cloned = customizer?.(value, key, object, stack);
    if (cloned !== void 0) return cloned;
    if (typeof obj !== "object") return;
    if (getTag(obj) === "[object Object]" && typeof obj.constructor !== "function") {
      const result = {};
      stack.set(obj, result);
      copyProperties(result, obj, object, stack);
      return result;
    }
    switch (Object.prototype.toString.call(obj)) {
      case numberTag:
      case stringTag:
      case booleanTag: {
        const result = new obj.constructor(obj?.valueOf());
        copyProperties(result, obj);
        return result;
      }
      case argumentsTag: {
        const result = {};
        copyProperties(result, obj);
        result.length = obj.length;
        result[Symbol.iterator] = obj[Symbol.iterator];
        return result;
      }
      default:
        return;
    }
  });
}

// node_modules/es-toolkit/dist/compat/object/cloneDeep.mjs
function cloneDeep2(obj) {
  return cloneDeepWith2(obj);
}

// node_modules/es-toolkit/dist/compat/predicate/isArguments.mjs
function isArguments(value) {
  return value !== null && typeof value === "object" && getTag(value) === "[object Arguments]";
}

// node_modules/es-toolkit/dist/compat/_internal/isIndex.mjs
var IS_UNSIGNED_INTEGER = /^(?:0|[1-9]\d*)$/;
function isIndex(value, length = Number.MAX_SAFE_INTEGER) {
  switch (typeof value) {
    case "number":
      return Number.isInteger(value) && value >= 0 && value < length;
    case "symbol":
      return false;
    case "string":
      return IS_UNSIGNED_INTEGER.test(value);
  }
}

// node_modules/es-toolkit/dist/compat/object/has.mjs
function has(object, path) {
  let resolvedPath;
  if (Array.isArray(path)) resolvedPath = path;
  else if (typeof path === "string" && isDeepKey(path) && !(path in Object(object))) resolvedPath = toPath(path);
  else resolvedPath = [path];
  if (resolvedPath.length === 0) return false;
  let current = object;
  for (let i = 0; i < resolvedPath.length; i++) {
    const key = toKey(resolvedPath[i]);
    if (current == null || !Object.hasOwn(current, key)) {
      if (!((Array.isArray(current) || isArguments(current)) && isIndex(key) && Number(key) < current.length)) return false;
    }
    current = current[key];
  }
  return true;
}

// node_modules/es-toolkit/dist/compat/predicate/isObjectLike.mjs
function isObjectLike(value) {
  return typeof value === "object" && value !== null;
}

// node_modules/es-toolkit/dist/compat/predicate/isArrayLikeObject.mjs
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

// node_modules/es-toolkit/dist/compat/_internal/isKey.mjs
var regexIsDeepProp2 = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
var regexIsPlainProp = /^\w*$/;
function isKey(value, object) {
  if (Array.isArray(value)) return false;
  if (typeof value === "number" || typeof value === "boolean" || value == null || isSymbol(value)) return true;
  return typeof value === "string" && (regexIsPlainProp.test(value) || !regexIsDeepProp2.test(value)) || object != null && Object.hasOwn(object, value);
}

// node_modules/es-toolkit/dist/compat/predicate/isTypedArray.mjs
function isTypedArray2(x) {
  return isTypedArray(x);
}

// node_modules/es-toolkit/dist/compat/_internal/assignValue.mjs
var assignValue = (object, key, value) => {
  const objValue = object[key];
  if (!(Object.hasOwn(object, key) && eq(objValue, value)) || value === void 0 && !(key in object)) object[key] = value;
};

// node_modules/es-toolkit/dist/_internal/isUnsafeToWriteProperty.mjs
function isUnsafeToWriteProperty(key) {
  return key === "__proto__" || key === "constructor" || key === "prototype";
}

// node_modules/es-toolkit/dist/compat/object/updateWith.mjs
function updateWith(obj, path, updater, customizer) {
  if (obj == null && !isObject(obj)) return obj;
  let resolvedPath;
  if (isKey(path, obj)) resolvedPath = [path];
  else if (Array.isArray(path)) resolvedPath = path;
  else resolvedPath = toPath(path);
  const updateValue = updater(get(obj, resolvedPath));
  let current = obj;
  for (let i = 0; i < resolvedPath.length && current != null; i++) {
    const key = toKey(resolvedPath[i]);
    if (isUnsafeToWriteProperty(key)) return obj;
    let newValue;
    if (i === resolvedPath.length - 1) newValue = updateValue;
    else {
      const objValue = current[key];
      const customizerResult = customizer?.(objValue, key, obj);
      newValue = customizerResult !== void 0 ? customizerResult : isObject(objValue) ? objValue : isIndex(resolvedPath[i + 1]) ? [] : {};
    }
    assignValue(current, key, newValue);
    current = current[key];
  }
  return obj;
}

// node_modules/es-toolkit/dist/compat/object/set.mjs
function set(obj, path, value) {
  return updateWith(obj, path, () => value, () => void 0);
}

// node_modules/es-toolkit/dist/compat/function/debounce.mjs
function debounce2(func, debounceMs = 0, options = {}) {
  if (typeof options !== "object") options = {};
  const { leading = false, trailing = true, maxWait } = options;
  const edges = Array(2);
  if (leading) edges[0] = "leading";
  if (trailing) edges[1] = "trailing";
  let result = void 0;
  let pendingAt = null;
  const _debounced = debounce(function(...args) {
    result = func.apply(this, args);
    pendingAt = null;
  }, debounceMs, { edges });
  const debounced = function(...args) {
    if (maxWait != null) {
      if (pendingAt === null) pendingAt = Date.now();
      if (Date.now() - pendingAt >= maxWait) {
        if (leading || trailing) result = func.apply(this, args);
        pendingAt = Date.now();
        _debounced.cancel();
        _debounced.schedule();
        return result;
      }
    }
    _debounced.apply(this, args);
    return result;
  };
  const flush = () => {
    _debounced.flush();
    return result;
  };
  debounced.cancel = _debounced.cancel;
  debounced.flush = flush;
  return debounced;
}

// node_modules/es-toolkit/dist/compat/object/mergeWith.mjs
function mergeWith(object, ...otherArgs) {
  const sources = otherArgs.slice(0, -1);
  const merge2 = otherArgs[otherArgs.length - 1];
  let result = object;
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    result = mergeWithDeep(result, source, merge2, /* @__PURE__ */ new Map());
  }
  return result;
}
function mergeWithDeep(target, source, merge2, stack) {
  if (isPrimitive(target)) target = Object(target);
  if (source == null || typeof source !== "object") return target;
  if (stack.has(source)) return clone(stack.get(source));
  stack.set(source, target);
  if (Array.isArray(source)) {
    source = source.slice();
    for (let i = 0; i < source.length; i++) if (!(i in source)) source[i] = void 0;
  }
  const sourceKeys = [...Object.keys(source), ...getSymbols(source)];
  for (let i = 0; i < sourceKeys.length; i++) {
    const key = sourceKeys[i];
    if (isUnsafeProperty(key)) continue;
    let sourceValue = source[key];
    let targetValue = target[key];
    if (isArguments(sourceValue)) sourceValue = { ...sourceValue };
    if (isArguments(targetValue)) targetValue = { ...targetValue };
    if (isBuffer(sourceValue)) sourceValue = cloneDeep2(sourceValue);
    if (Array.isArray(sourceValue)) if (Array.isArray(targetValue)) {
      const cloned = [];
      const targetKeys = Reflect.ownKeys(targetValue);
      for (let i2 = 0; i2 < targetKeys.length; i2++) {
        const targetKey = targetKeys[i2];
        cloned[targetKey] = targetValue[targetKey];
      }
      targetValue = cloned;
    } else if (isArrayLikeObject(targetValue)) {
      const cloned = [];
      for (let i2 = 0; i2 < targetValue.length; i2++) cloned[i2] = targetValue[i2];
      targetValue = cloned;
    } else targetValue = [];
    const merged = merge2(targetValue, sourceValue, key, target, source, stack);
    if (merged !== void 0) target[key] = merged;
    else if (Array.isArray(sourceValue)) target[key] = mergeWithDeep(targetValue, sourceValue, merge2, stack);
    else if (isObjectLike(targetValue) && isObjectLike(sourceValue) && (isPlainObject2(targetValue) || isPlainObject2(sourceValue) || isTypedArray2(targetValue) || isTypedArray2(sourceValue))) target[key] = mergeWithDeep(targetValue, sourceValue, merge2, stack);
    else if (targetValue == null && isPlainObject2(sourceValue)) target[key] = mergeWithDeep({}, sourceValue, merge2, stack);
    else if (targetValue == null && isTypedArray2(sourceValue)) target[key] = cloneDeep2(sourceValue);
    else if (targetValue === void 0 || sourceValue !== void 0) target[key] = sourceValue;
  }
  return target;
}

// node_modules/es-toolkit/dist/compat/object/merge.mjs
function merge(object, ...sources) {
  return mergeWith(object, ...sources, noop);
}

// node_modules/laravel-precognition/dist/form.js
var isFile = (value) => typeof File !== "undefined" && value instanceof File || value instanceof Blob || typeof FileList !== "undefined" && value instanceof FileList && value.length > 0;
var hasFiles = (data) => {
  if (data instanceof FormData) {
    return true;
  }
  return isFile(data) || typeof data === "object" && data !== null && Object.values(data).some((value) => hasFiles(value));
};

// node_modules/laravel-precognition/dist/http/errors.js
var HttpResponseError = class extends Error {
  response;
  constructor(response) {
    super(`HTTP error ${response.status}`);
    this.name = "HttpResponseError";
    this.response = response;
  }
};
var HttpCancelledError = class extends Error {
  constructor(message = "Request was cancelled") {
    super(message);
    this.name = "HttpCancelledError";
  }
};
var HttpNetworkError = class extends Error {
  constructor(message = "Network error") {
    super(message);
    this.name = "HttpNetworkError";
  }
};

// node_modules/laravel-precognition/dist/http/url.js
function buildQueryString(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === void 0 || value === null) {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(`${key}[]`, String(item)));
    } else if (typeof value === "object") {
      searchParams.append(key, JSON.stringify(value));
    } else {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}
function buildUrl(url, baseURL2, params) {
  if (baseURL2 && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = baseURL2.replace(/\/$/, "") + "/" + url.replace(/^\//, "");
  }
  if (params && Object.keys(params).length > 0) {
    const queryString = buildQueryString(params);
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }
  return url;
}

// node_modules/laravel-precognition/dist/http/fetchClient.js
function getAjaxHeader() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.axios?.defaults?.headers?.common?.["X-Requested-With"] ?? null;
}
function toFormData(data, formData = new FormData(), parentKey = null) {
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      appendToFormData(formData, parentKey ? `${parentKey}[${key}]` : key, data[key]);
    }
  }
  return formData;
}
function appendToFormData(formData, key, value) {
  if (Array.isArray(value)) {
    return value.forEach((val, index) => appendToFormData(formData, `${key}[${index}]`, val));
  } else if (value instanceof Date) {
    return formData.append(key, value.toISOString());
  } else if (typeof File !== "undefined" && value instanceof File) {
    return formData.append(key, value, value.name);
  } else if (value instanceof Blob) {
    return formData.append(key, value);
  } else if (typeof value === "boolean") {
    return formData.append(key, value ? "1" : "0");
  } else if (typeof value === "string") {
    return formData.append(key, value);
  } else if (typeof value === "number") {
    return formData.append(key, `${value}`);
  } else if (typeof value === "bigint") {
    return formData.append(key, value.toString());
  } else if (value === null || value === void 0) {
    return formData.append(key, "");
  }
  toFormData(value, formData, key);
}
function prepareBody(data, headers, serialize) {
  if (data === void 0 || data === null) {
    return void 0;
  }
  if (data instanceof FormData) {
    return data;
  }
  if (typeof data === "object" && hasFiles(data)) {
    return toFormData(data);
  }
  if (typeof data === "object" || headers["Content-Type"]?.includes("application/json")) {
    return serialize(data);
  }
  return String(data);
}
function parseHeaders(headers) {
  const result = {};
  headers.forEach((value, key) => {
    result[key.toLowerCase()] = value;
  });
  return result;
}
function createFetchClient(options = {}) {
  let xsrfCookieName = options.xsrfCookieName ?? "XSRF-TOKEN";
  let xsrfHeaderName = options.xsrfHeaderName ?? "X-XSRF-TOKEN";
  let serializer = options.serializer ?? JSON.stringify;
  function getXsrfToken() {
    if (typeof document === "undefined") {
      return null;
    }
    const match = document.cookie.match(new RegExp("(^|;\\s*)" + xsrfCookieName + "=([^;]*)"));
    return match ? decodeURIComponent(match[2]) : null;
  }
  return {
    setXsrfCookieName(name) {
      xsrfCookieName = name;
    },
    setXsrfHeaderName(name) {
      xsrfHeaderName = name;
    },
    setSerializer(callback) {
      serializer = callback;
    },
    async request(config3) {
      const url = buildUrl(config3.url, config3.baseURL, config3.params);
      const method = config3.method.toUpperCase();
      const headers = {};
      const ajaxHeader = getAjaxHeader();
      if (ajaxHeader) {
        headers["X-Requested-With"] = ajaxHeader;
      }
      if (config3.data !== void 0 && !["GET", "DELETE"].includes(method)) {
        if (!(config3.data instanceof FormData) && !hasFiles(config3.data)) {
          headers["Content-Type"] = "application/json";
        }
      }
      if (config3.headers) {
        Object.entries(config3.headers).forEach(([key, value]) => {
          if (value !== void 0) {
            headers[key] = String(value);
          }
        });
      }
      const xsrfToken = getXsrfToken();
      if (xsrfToken && !["GET", "HEAD", "OPTIONS"].includes(method)) {
        headers[xsrfHeaderName] = xsrfToken;
      }
      let signal = config3.signal;
      let timeoutId;
      const timeout2 = config3.timeout ?? 3e4;
      if (timeout2 > 0 && !signal) {
        const controller = new AbortController();
        signal = controller.signal;
        timeoutId = setTimeout(() => controller.abort(), timeout2);
      }
      const body = ["GET", "DELETE"].includes(method) ? void 0 : prepareBody(config3.data, headers, serializer);
      if (body instanceof FormData) {
        delete headers["Content-Type"];
      }
      try {
        const response = await fetch(url, {
          method,
          headers,
          body,
          signal,
          credentials: config3.credentials ?? "same-origin"
        });
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        let data;
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          data = await response.json();
        } else {
          data = await response.text();
        }
        const httpResponse = {
          status: response.status,
          data,
          headers: parseHeaders(response.headers)
        };
        if (!response.ok) {
          throw new HttpResponseError(httpResponse);
        }
        return httpResponse;
      } catch (error) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (error instanceof HttpResponseError) {
          throw error;
        }
        if (error instanceof DOMException && error.name === "AbortError") {
          throw new HttpCancelledError();
        }
        if (error instanceof TypeError) {
          throw new HttpNetworkError(error.message);
        }
        throw error;
      }
    }
  };
}
var fetchHttpClient = createFetchClient();

// node_modules/laravel-precognition/dist/client.js
var httpClient = fetchHttpClient;
var baseURL = void 0;
var timeout = void 0;
var credentials = "same-origin";
var requestFingerprintResolver = (config3) => `${config3.method}:${config3.baseURL ?? baseURL ?? ""}${config3.url}`;
var successResolver = (response) => response.status === 204 && response.headers["precognition-success"] === "true";
var abortControllers = {};
var client = {
  get: (url, data = {}, config3 = {}) => request(mergeConfig("get", url, data, config3)),
  post: (url, data = {}, config3 = {}) => request(mergeConfig("post", url, data, config3)),
  patch: (url, data = {}, config3 = {}) => request(mergeConfig("patch", url, data, config3)),
  put: (url, data = {}, config3 = {}) => request(mergeConfig("put", url, data, config3)),
  delete: (url, data = {}, config3 = {}) => request(mergeConfig("delete", url, data, config3)),
  query: (url, data = {}, config3 = {}) => request(mergeConfig("query", url, data, config3)),
  useHttpClient(newHttpClient) {
    httpClient = newHttpClient;
    return client;
  },
  withBaseURL(url) {
    baseURL = url;
    return client;
  },
  withTimeout(duration) {
    timeout = duration;
    return client;
  },
  withCredentials(value) {
    credentials = typeof value === "string" ? value : value ? "include" : "omit";
    return client;
  },
  fingerprintRequestsUsing(callback) {
    requestFingerprintResolver = callback === null ? () => null : callback;
    return client;
  },
  determineSuccessUsing(callback) {
    successResolver = callback;
    return client;
  },
  withXsrfCookieName(name) {
    fetchHttpClient.setXsrfCookieName(name);
    return client;
  },
  withXsrfHeaderName(name) {
    fetchHttpClient.setXsrfHeaderName(name);
    return client;
  },
  withSerializer(callback) {
    fetchHttpClient.setSerializer(callback);
    return client;
  }
};
var mergeConfig = (method, url, data, config3) => ({
  url,
  method,
  ...config3,
  ...["get", "delete"].includes(method) ? {
    params: merge({}, data, config3?.params)
  } : {
    data: merge({}, data, config3?.data)
  }
});
var request = (userConfig = {}) => {
  const config3 = [
    resolveConfig,
    abortMatchingRequests,
    refreshAbortController
  ].reduce((config4, callback) => callback(config4), userConfig);
  if ((config3.onBefore ?? (() => true))() === false) {
    return Promise.resolve(null);
  }
  (config3.onStart ?? (() => null))();
  return httpClient.request({
    method: config3.method,
    url: config3.url,
    baseURL: config3.baseURL ?? baseURL,
    data: config3.data,
    params: config3.params,
    headers: config3.headers,
    signal: config3.signal,
    timeout: config3.timeout,
    credentials
  }).then(async (response) => {
    if (config3.precognitive) {
      validatePrecognitionResponse(response);
    }
    const status2 = response.status;
    let payload = response;
    if (config3.precognitive && config3.onPrecognitionSuccess && successResolver(response)) {
      payload = await Promise.resolve(config3.onPrecognitionSuccess(response) ?? payload);
    }
    if (config3.onSuccess && isSuccess(status2)) {
      payload = await Promise.resolve(config3.onSuccess(payload) ?? payload);
    }
    const statusHandler = resolveStatusHandler(config3, status2) ?? ((response2) => response2);
    return statusHandler(payload) ?? payload;
  }, (error) => {
    if (isNotServerGeneratedError(error)) {
      return Promise.reject(error);
    }
    const httpError = error;
    if (config3.precognitive) {
      validatePrecognitionResponse(httpError.response);
    }
    const statusHandler = resolveStatusHandler(config3, httpError.response.status) ?? ((_, error2) => Promise.reject(error2));
    return statusHandler(httpError.response, httpError);
  }).finally(config3.onFinish ?? (() => null));
};
var resolveConfig = (config3) => {
  const only = config3.only ?? config3.validate;
  return {
    ...config3,
    timeout: config3.timeout ?? timeout,
    precognitive: config3.precognitive !== false,
    fingerprint: typeof config3.fingerprint === "undefined" ? requestFingerprintResolver(config3, httpClient) : config3.fingerprint,
    headers: {
      ...config3.headers,
      "Accept": "application/json",
      "Content-Type": resolveContentType(config3),
      ...config3.precognitive !== false ? {
        Precognition: true
      } : {},
      ...only ? {
        "Precognition-Validate-Only": Array.from(only).join()
      } : {}
    }
  };
};
var isSuccess = (status2) => status2 >= 200 && status2 < 300;
var abortMatchingRequests = (config3) => {
  if (typeof config3.fingerprint !== "string") {
    return config3;
  }
  abortControllers[config3.fingerprint]?.abort();
  delete abortControllers[config3.fingerprint];
  return config3;
};
var refreshAbortController = (config3) => {
  if (typeof config3.fingerprint !== "string" || config3.signal || !config3.precognitive) {
    return config3;
  }
  abortControllers[config3.fingerprint] = new AbortController();
  return {
    ...config3,
    signal: abortControllers[config3.fingerprint].signal
  };
};
var validatePrecognitionResponse = (response) => {
  if (response.headers?.precognition !== "true") {
    throw Error("Did not receive a Precognition response. Ensure you have the Precognition middleware in place for the route.");
  }
};
var isNotServerGeneratedError = (error) => {
  return !(error instanceof HttpResponseError) || typeof error.response?.status !== "number";
};
var resolveStatusHandler = (config3, code) => ({
  401: config3.onUnauthorized,
  403: config3.onForbidden,
  404: config3.onNotFound,
  409: config3.onConflict,
  422: config3.onValidationError,
  423: config3.onLocked
})[code];
var resolveContentType = (config3) => config3.headers?.["Content-Type"] ?? config3.headers?.["Content-type"] ?? config3.headers?.["content-type"] ?? (hasFiles(config3.data) ? "multipart/form-data" : "application/json");

// node_modules/laravel-precognition/dist/validator.js
var expandWildcardPaths = (pattern, data) => {
  if (!pattern.includes("*")) {
    return [pattern];
  }
  const parts = pattern.split(".");
  let paths = [""];
  for (const part of parts) {
    if (part === "*") {
      const expanded = [];
      for (const path of paths) {
        const value = path ? get(data, path) : data;
        if (Array.isArray(value)) {
          for (let index = 0; index < value.length; index++) {
            expanded.push(path ? `${path}.${index}` : String(index));
          }
        } else if (value !== null && typeof value === "object") {
          for (const key of Object.keys(value)) {
            expanded.push(path ? `${path}.${key}` : key);
          }
        }
      }
      paths = expanded;
    } else {
      paths = paths.map((path) => path ? `${path}.${part}` : part);
    }
  }
  return paths;
};
var keyMatchesPattern = (key, pattern) => {
  if (!pattern.includes("*")) {
    return key === pattern;
  }
  const regex = new RegExp("^" + pattern.replace(/\./g, "\\.").replace(/\*/g, "[^.]+") + "$");
  return regex.test(key);
};
var omitByPattern = (obj, patterns) => {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => {
    return !patterns.some((pattern) => keyMatchesPattern(key, pattern));
  }));
};
var createValidator = (callback, initialData = {}) => {
  const listeners = {
    errorsChanged: [],
    touchedChanged: [],
    validatingChanged: [],
    validatedChanged: []
  };
  let validateFiles = false;
  let validating = false;
  const setValidating = (value) => {
    if (value !== validating) {
      validating = value;
      return listeners.validatingChanged;
    }
    return [];
  };
  let validated = [];
  const setValidated = (value) => {
    const uniqueNames = [...new Set(value)];
    if (validated.length !== uniqueNames.length || !uniqueNames.every((name) => validated.includes(name))) {
      validated = uniqueNames;
      return listeners.validatedChanged;
    }
    return [];
  };
  const valid = () => validated.filter((name) => typeof errors[name] === "undefined");
  let touched = [];
  const setTouched = (value) => {
    const uniqueNames = [...new Set(value)];
    if (touched.length !== uniqueNames.length || !uniqueNames.every((name) => touched.includes(name))) {
      touched = uniqueNames;
      return listeners.touchedChanged;
    }
    return [];
  };
  let errors = {};
  const setErrors = (value) => {
    const prepared = toValidationErrors(value);
    if (!isEqual(errors, prepared)) {
      errors = prepared;
      return listeners.errorsChanged;
    }
    return [];
  };
  const forgetError = (name) => {
    const newErrors = { ...errors };
    delete newErrors[resolveName(name)];
    return setErrors(newErrors);
  };
  const hasErrors = () => Object.keys(errors).length > 0;
  let debounceTimeoutDuration = 1500;
  const setDebounceTimeout = (value) => {
    debounceTimeoutDuration = value;
    validator.cancel();
    validator = createValidator2();
  };
  let oldData = initialData;
  let validatingData = null;
  let oldTouched = [];
  let validatingTouched = null;
  const createValidator2 = () => debounce2((instanceConfig) => {
    callback({
      get: (url, data = {}, globalConfig = {}) => client.get(url, parseData(data), resolveConfig2(globalConfig, instanceConfig, data)),
      post: (url, data = {}, globalConfig = {}) => client.post(url, parseData(data), resolveConfig2(globalConfig, instanceConfig, data)),
      patch: (url, data = {}, globalConfig = {}) => client.patch(url, parseData(data), resolveConfig2(globalConfig, instanceConfig, data)),
      put: (url, data = {}, globalConfig = {}) => client.put(url, parseData(data), resolveConfig2(globalConfig, instanceConfig, data)),
      delete: (url, data = {}, globalConfig = {}) => client.delete(url, parseData(data), resolveConfig2(globalConfig, instanceConfig, data)),
      query: (url, data = {}, globalConfig = {}) => client.query(url, parseData(data), resolveConfig2(globalConfig, instanceConfig, data))
    }).catch((error) => {
      if (error instanceof HttpCancelledError) {
        return null;
      }
      if (error instanceof HttpResponseError && error.response?.status === 422) {
        return null;
      }
      return Promise.reject(error);
    });
  }, debounceTimeoutDuration, { leading: true, trailing: true });
  let validator = createValidator2();
  const resolveConfig2 = (globalConfig, instanceConfig, data = {}) => {
    const config3 = {
      ...globalConfig,
      ...instanceConfig
    };
    const only = Array.from(config3.only ?? config3.validate ?? touched);
    return {
      ...instanceConfig,
      ...merge({}, globalConfig, instanceConfig),
      only,
      timeout: config3.timeout ?? 5e3,
      onValidationError: (response, error) => {
        [
          ...setValidated([...validated, ...only]),
          ...setErrors(merge(omitByPattern({ ...errors }, only), response.data.errors))
        ].forEach((listener) => listener());
        return config3.onValidationError ? config3.onValidationError(response, error) : Promise.reject(error);
      },
      onSuccess: (response) => {
        setValidated([...validated, ...only]).forEach((listener) => listener());
        return config3.onSuccess ? config3.onSuccess(response) : response;
      },
      onPrecognitionSuccess: (response) => {
        [
          ...setValidated([...validated, ...only]),
          ...setErrors(omitByPattern({ ...errors }, only))
        ].forEach((listener) => listener());
        return config3.onPrecognitionSuccess ? config3.onPrecognitionSuccess(response) : response;
      },
      onBefore: () => {
        const hasWildcards = touched.some((name) => name.includes("*"));
        const expandedTouched = hasWildcards ? [...new Set(touched.flatMap((name) => expandWildcardPaths(name, data)))] : touched;
        if (config3.onBeforeValidation && config3.onBeforeValidation({ data, touched: expandedTouched }, { data: oldData, touched: oldTouched }) === false) {
          return false;
        }
        const beforeResult = (config3.onBefore || (() => true))();
        if (beforeResult === false) {
          return false;
        }
        if (hasWildcards) {
          setTouched(expandedTouched).forEach((listener) => listener());
        }
        validatingTouched = touched;
        validatingData = data;
        return true;
      },
      onStart: () => {
        setValidating(true).forEach((listener) => listener());
        (config3.onStart ?? (() => null))();
      },
      onFinish: () => {
        setValidating(false).forEach((listener) => listener());
        oldTouched = validatingTouched;
        oldData = validatingData;
        validatingTouched = validatingData = null;
        (config3.onFinish ?? (() => null))();
      }
    };
  };
  const validate = (name, value, config3) => {
    if (typeof name === "undefined") {
      const only = Array.from(config3?.only ?? config3?.validate ?? []);
      setTouched([...touched, ...only]).forEach((listener) => listener());
      validator(config3 ?? {});
      return;
    }
    if (isFile(value) && !validateFiles) {
      console.warn('Precognition file validation is not active. Call the "validateFiles" function on your form to enable it.');
      return;
    }
    name = resolveName(name);
    if (name.includes("*") || get(oldData, name) !== value) {
      setTouched([name, ...touched]).forEach((listener) => listener());
      validator(config3 ?? {});
    }
  };
  const parseData = (data) => validateFiles === false ? forgetFiles(data) : data;
  const form = {
    touched: () => touched,
    validate(name, value, config3) {
      if (typeof name === "object" && !("target" in name)) {
        config3 = name;
        name = value = void 0;
      }
      validate(name, value, config3);
      return form;
    },
    touch(input) {
      const inputs = Array.isArray(input) ? input : [resolveName(input)];
      setTouched([...touched, ...inputs]).forEach((listener) => listener());
      return form;
    },
    validating: () => validating,
    valid,
    errors: () => errors,
    hasErrors,
    setErrors(value) {
      setErrors(value).forEach((listener) => listener());
      return form;
    },
    forgetError(name) {
      forgetError(name).forEach((listener) => listener());
      return form;
    },
    defaults(data) {
      initialData = data;
      oldData = data;
      return form;
    },
    reset(...names) {
      if (names.length === 0) {
        setTouched([]).forEach((listener) => listener());
      } else {
        const newTouched = [...touched];
        names.forEach((name) => {
          if (newTouched.includes(name)) {
            newTouched.splice(newTouched.indexOf(name), 1);
          }
          set(oldData, name, get(initialData, name));
        });
        setTouched(newTouched).forEach((listener) => listener());
      }
      return form;
    },
    setTimeout(value) {
      setDebounceTimeout(value);
      return form;
    },
    on(event, callback2) {
      listeners[event].push(callback2);
      return form;
    },
    validateFiles() {
      validateFiles = true;
      return form;
    },
    withoutFileValidation() {
      validateFiles = false;
      return form;
    }
  };
  return form;
};
var toSimpleValidationErrors = (errors) => {
  return Object.keys(errors).reduce((carry, key) => ({
    ...carry,
    [key]: Array.isArray(errors[key]) ? errors[key][0] : errors[key]
  }), {});
};
var toValidationErrors = (errors) => {
  return Object.keys(errors).reduce((carry, key) => ({
    ...carry,
    [key]: typeof errors[key] === "string" ? [errors[key]] : errors[key]
  }), {});
};
var resolveName = (name) => {
  return typeof name !== "string" ? name.target.name : name;
};
var forgetFiles = (data) => {
  const newData = { ...data };
  Object.keys(newData).forEach((name) => {
    const value = newData[name];
    if (value === null) {
      return;
    }
    if (isFile(value)) {
      delete newData[name];
      return;
    }
    if (Array.isArray(value)) {
      newData[name] = Object.values(forgetFiles({ ...value }));
      return;
    }
    if (typeof value === "object") {
      newData[name] = forgetFiles(newData[name]);
      return;
    }
  });
  return newData;
};

// node_modules/@inertiajs/core/dist/index.js
var Config = class {
  config = {};
  defaults;
  constructor(defaults) {
    this.defaults = defaults;
  }
  extend(defaults) {
    if (defaults) {
      this.defaults = { ...this.defaults, ...defaults };
    }
    return this;
  }
  replace(newConfig) {
    this.config = newConfig;
  }
  get(key) {
    return has(this.config, key) ? get(this.config, key) : get(this.defaults, key);
  }
  set(keyOrValues, value) {
    if (typeof keyOrValues === "string") {
      set(this.config, keyOrValues, value);
    } else {
      Object.entries(keyOrValues).forEach(([key, val]) => {
        set(this.config, key, val);
      });
    }
  }
};
var config = new Config({
  form: {
    recentlySuccessfulDuration: 2e3,
    forceIndicesArrayFormatInFormData: true,
    withAllErrors: false
  },
  prefetch: {
    cacheFor: 3e4,
    hoverDelay: 75
  }
});
function debounce3(fn, delay) {
  let timeoutID;
  const debounced = function(...args) {
    clearTimeout(timeoutID);
    timeoutID = setTimeout(() => fn.apply(this, args), delay);
  };
  debounced.cancel = () => clearTimeout(timeoutID);
  return debounced;
}
function fireEvent(name, options) {
  return document.dispatchEvent(new CustomEvent(`inertia:${name}`, options));
}
var fireBeforeEvent = (visit) => {
  return fireEvent("before", { cancelable: true, detail: { visit } });
};
var fireErrorEvent = (errors, { page: page2, visitId } = {}) => {
  return fireEvent("error", { detail: { errors, page: page2, visitId } });
};
var fireNetworkErrorEvent = (error) => {
  return fireEvent("networkError", { cancelable: true, detail: { error } });
};
var fireFinishEvent = (visit) => {
  return fireEvent("finish", { detail: { visit } });
};
var fireHttpExceptionEvent = (response) => {
  return fireEvent("httpException", { cancelable: true, detail: { response } });
};
var fireBeforeUpdateEvent = (page2) => {
  return fireEvent("beforeUpdate", { detail: { page: page2 } });
};
var fireNavigateEvent = (page2, { type, cached = false, visitId }) => {
  return fireEvent("navigate", { detail: { page: page2, type, cached, visitId } });
};
var fireClientVisitEvent = (page2, { replace, visitId }) => {
  return fireEvent("clientVisit", { detail: { page: page2, replace, visitId } });
};
var fireProgressEvent = (progress3) => {
  return fireEvent("progress", { detail: { progress: progress3 } });
};
var fireStartEvent = (visit) => {
  return fireEvent("start", { detail: { visit } });
};
var fireSuccessEvent = (page2, { visitId } = {}) => {
  return fireEvent("success", { detail: { page: page2, visitId } });
};
var firePrefetchedEvent = (response, visit) => {
  return fireEvent("prefetched", { detail: { fetchedAt: Date.now(), response, visit } });
};
var firePrefetchingEvent = (visit) => {
  return fireEvent("prefetching", { detail: { visit } });
};
var fireFlashEvent = (flash) => {
  return fireEvent("flash", { detail: { flash } });
};
var fireLocationEvent = (url, versionChange) => {
  return fireEvent("location", { cancelable: true, detail: { url, versionChange } });
};
var bigIntMarker = "$bigint";
var replaceBigInt = (_key, value) => {
  if (typeof value === "bigint") {
    return { [bigIntMarker]: value.toString() };
  }
  return value;
};
var replaceBigIntWithDigits = (_key, value) => {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
};
function parsePage(text) {
  const page2 = JSON.parse(text);
  if (page2?.preserveBigIntegers === true && text.includes(`"${bigIntMarker}"`)) {
    reviveBigIntegers(page2);
  }
  return page2;
}
function reviveBigIntegers(value) {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index++) {
      value[index] = reviveBigInteger(value[index]);
    }
    return;
  }
  for (const key of Object.keys(value)) {
    value[key] = reviveBigInteger(value[key]);
  }
}
function reviveBigInteger(value) {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (typeof value[bigIntMarker] === "string") {
    return BigInt(value[bigIntMarker]);
  }
  reviveBigIntegers(value);
  return value;
}
function stringifyPage(page2) {
  return stringify(page2, () => ({ ...page2, preserveBigIntegers: true }), replaceBigInt);
}
function stringifyJson(value) {
  return stringify(value, () => value, replaceBigIntWithDigits);
}
function stringify(value, retryValue, replacer) {
  try {
    return JSON.stringify(value);
  } catch (error) {
    try {
      return JSON.stringify(retryValue(), replacer);
    } catch {
      throw error;
    }
  }
}
function containsBigInt(value, seen = /* @__PURE__ */ new WeakSet()) {
  if (typeof value === "bigint") {
    return true;
  }
  if (value === null || typeof value !== "object") {
    return false;
  }
  if (seen.has(value)) {
    return false;
  }
  seen.add(value);
  const values = Array.isArray(value) ? value : Object.values(value);
  return values.some((nested) => containsBigInt(nested, seen));
}
var SessionStorage = class {
  static locationVisitKey = "inertiaLocationVisit";
  static set(key, value) {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    }
  }
  static get(key) {
    if (typeof window !== "undefined") {
      return JSON.parse(window.sessionStorage.getItem(key) || "null");
    }
  }
  static merge(key, value) {
    const existing = this.get(key);
    if (existing === null) {
      this.set(key, value);
    } else {
      this.set(key, { ...existing, ...value });
    }
  }
  static remove(key) {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(key);
    }
  }
  static removeNested(key, nestedKey) {
    const existing = this.get(key);
    if (existing !== null) {
      delete existing[nestedKey];
      this.set(key, existing);
    }
  }
  static exists(key) {
    try {
      return this.get(key) !== null;
    } catch (error) {
      return false;
    }
  }
  static clear() {
    if (typeof window !== "undefined") {
      window.sessionStorage.clear();
    }
  }
};
var ivLength = 12;
var encryptHistory = async (data) => {
  if (typeof window === "undefined") {
    throw new Error("Unable to encrypt history");
  }
  if (SessionStorage.exists(historySessionStorageKeys.iv)) {
    SessionStorage.remove(historySessionStorageKeys.key);
    SessionStorage.remove(historySessionStorageKeys.iv);
  }
  const storedKey = await getKeyFromSessionStorage();
  const key = await getOrCreateKey(storedKey);
  if (!key) {
    throw new Error("Unable to encrypt history");
  }
  const iv = window.crypto.getRandomValues(new Uint8Array(ivLength));
  const encrypted = new Uint8Array(await encryptData(iv, key, data));
  const entry = new Uint8Array(iv.length + encrypted.length);
  entry.set(iv);
  entry.set(encrypted, iv.length);
  return entry.buffer;
};
var historySessionStorageKeys = {
  key: "historyKey",
  iv: "historyIv"
};
var decryptHistory = async (data) => {
  const storedKey = await getKeyFromSessionStorage();
  if (!storedKey) {
    throw new Error("Unable to decrypt history");
  }
  const entry = new Uint8Array(data);
  return await decryptData(entry.subarray(0, ivLength), storedKey, entry.subarray(ivLength));
};
var encryptData = async (iv, key, data) => {
  if (typeof window === "undefined") {
    throw new Error("Unable to encrypt history");
  }
  if (typeof window.crypto.subtle === "undefined") {
    console.warn("Encryption is not supported in this environment. SSL is required.");
    return Promise.resolve(data);
  }
  const textEncoder = new TextEncoder();
  const str = stringifyPage(data);
  const encoded = new Uint8Array(str.length * 3);
  const result = textEncoder.encodeInto(str, encoded);
  return window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv
    },
    key,
    encoded.subarray(0, result.written)
  );
};
var decryptData = async (iv, key, data) => {
  if (typeof window.crypto.subtle === "undefined") {
    console.warn("Decryption is not supported in this environment. SSL is required.");
    return Promise.resolve(data);
  }
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv
    },
    key,
    data
  );
  return parsePage(new TextDecoder().decode(decrypted));
};
var createKey = async () => {
  if (typeof window.crypto.subtle === "undefined") {
    console.warn("Encryption is not supported in this environment. SSL is required.");
    return Promise.resolve(null);
  }
  return window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );
};
var saveKey = async (key) => {
  if (typeof window.crypto.subtle === "undefined") {
    console.warn("Encryption is not supported in this environment. SSL is required.");
    return Promise.resolve();
  }
  const keyData = await window.crypto.subtle.exportKey("raw", key);
  SessionStorage.set(historySessionStorageKeys.key, Array.from(new Uint8Array(keyData)));
};
var getOrCreateKey = async (key) => {
  if (key) {
    return key;
  }
  const newKey = await createKey();
  if (!newKey) {
    return null;
  }
  await saveKey(newKey);
  return newKey;
};
var getKeyFromSessionStorage = async () => {
  const stringKey = SessionStorage.get(historySessionStorageKeys.key);
  if (!stringKey) {
    return null;
  }
  const key = await window.crypto.subtle.importKey(
    "raw",
    new Uint8Array(stringKey),
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );
  return key;
};
var HttpError = class extends Error {
  code;
  url;
  constructor(message, code, url) {
    super(url ? `${message} (${url})` : message);
    this.name = "HttpError";
    this.code = code;
    this.url = url;
  }
};
var HttpResponseError2 = class extends HttpError {
  response;
  constructor(message, response, url) {
    super(message, "ERR_HTTP_RESPONSE", url);
    this.name = "HttpResponseError";
    this.response = response;
  }
};
var HttpCancelledError2 = class extends HttpError {
  constructor(message = "Request was cancelled", url) {
    super(message, "ERR_CANCELLED", url);
    this.name = "HttpCancelledError";
  }
};
var HttpNetworkError2 = class extends HttpError {
  cause;
  constructor(message, url, cause) {
    super(message, "ERR_NETWORK", url);
    this.name = "HttpNetworkError";
    this.cause = cause;
  }
};
var stripTopLevelUndefined = (obj) => {
  const result = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== void 0) {
      result[key] = obj[key];
    }
  }
  return result;
};
var objectsAreEqual = (obj1, obj2, excludeKeys) => {
  if (obj1 === obj2) {
    return true;
  }
  for (const key in obj1) {
    if (excludeKeys.includes(key)) {
      continue;
    }
    if (obj1[key] === obj2[key]) {
      continue;
    }
    if (!compareValues(obj1[key], obj2[key])) {
      return false;
    }
  }
  for (const key in obj2) {
    if (excludeKeys.includes(key)) {
      continue;
    }
    if (!(key in obj1)) {
      return false;
    }
  }
  return true;
};
var compareValues = (value1, value2) => {
  switch (typeof value1) {
    case "object":
      return objectsAreEqual(value1, value2, []);
    case "function":
      return value1.toString() === value2.toString();
    default:
      return value1 === value2;
  }
};
var setPathPreservingIdentity = (target, path, value) => {
  const keys = toPath(path);
  if (keys.length === 0) {
    return target;
  }
  const copyAlongPath = (node, depth) => {
    if (depth === keys.length) {
      return value;
    }
    const key = keys[depth];
    const copy = Array.isArray(node) ? [...node] : node && typeof node === "object" ? { ...node } : /^(?:0|[1-9]\d*)$/.test(key) ? [] : {};
    copy[key] = copyAlongPath(node?.[key], depth + 1);
    return copy;
  };
  return copyAlongPath(target, 0);
};
var conversionMap = {
  ms: 1,
  s: 1e3,
  m: 1e3 * 60,
  h: 1e3 * 60 * 60,
  d: 1e3 * 60 * 60 * 24
};
var timeToMs = (time) => {
  if (typeof time === "number") {
    return time;
  }
  for (const [unit, conversion] of Object.entries(conversionMap)) {
    if (time.endsWith(unit)) {
      return parseFloat(time) * conversion;
    }
  }
  return parseInt(time);
};
var PrefetchedRequests = class {
  cached = [];
  inFlightRequests = [];
  removalTimers = [];
  currentUseId = null;
  add(params, sendFunc, { cacheFor, cacheTags }) {
    const inFlight = this.findInFlight(params);
    if (inFlight) {
      return Promise.resolve();
    }
    const existing = this.findCached(params);
    if (!params.fresh && existing && existing.staleTimestamp > Date.now()) {
      return Promise.resolve();
    }
    const [stale, prefetchExpiresIn] = this.extractStaleValues(cacheFor);
    let cancelled = false;
    const promise = new Promise((resolve, reject) => {
      sendFunc({
        ...params,
        onCancel: () => {
          cancelled = true;
          this.remove(params);
          this.removeFromInFlight(params.id);
          params.onCancel();
          reject(new HttpCancelledError2());
        },
        onError: (error) => {
          this.remove(params);
          params.onError(error);
          reject(error);
        },
        onPrefetching(visitParams) {
          params.onPrefetching(visitParams);
        },
        onPrefetched(response, visit) {
          params.onPrefetched(response, visit);
        },
        onPrefetchResponse(response) {
          resolve(response);
        },
        onPrefetchError: (error) => {
          this.removeFromInFlight(params.id);
          reject(error);
        }
      });
    }).then((response) => {
      if (!this.isInFlight(params.id)) {
        return response;
      }
      this.remove(params);
      const pageResponse = response.getPageResponse();
      page.mergeOncePropsIntoResponse(pageResponse);
      this.cached.push({
        params: { ...params },
        staleTimestamp: Date.now() + stale,
        expiresAt: Date.now() + prefetchExpiresIn,
        response: promise,
        singleUse: prefetchExpiresIn === 0,
        timestamp: Date.now(),
        inFlight: false,
        tags: Array.isArray(cacheTags) ? cacheTags : [cacheTags]
      });
      const oncePropExpiresIn = this.getShortestOncePropTtl(pageResponse);
      this.scheduleForRemoval(
        params,
        oncePropExpiresIn ? Math.min(prefetchExpiresIn, oncePropExpiresIn) : prefetchExpiresIn
      );
      this.removeFromInFlight(params.id);
      response.handlePrefetch();
      return response;
    });
    if (!cancelled) {
      this.inFlightRequests.push({
        params: { ...params },
        response: promise,
        staleTimestamp: null,
        inFlight: true
      });
    }
    return promise.catch((error) => {
      this.removeFromInFlight(params.id);
      if (!(error instanceof HttpCancelledError2)) {
        throw error;
      }
    });
  }
  removeAll() {
    this.cached = [];
    this.inFlightRequests = [];
    this.removalTimers.forEach((removalTimer) => {
      clearTimeout(removalTimer.timer);
    });
    this.removalTimers = [];
  }
  removeByTags(tags) {
    this.cached = this.cached.filter((prefetched) => {
      return !prefetched.tags.some((tag) => tags.includes(tag));
    });
  }
  remove(params) {
    this.cached = this.cached.filter((prefetched) => {
      return !this.paramsAreEqual(prefetched.params, params);
    });
    this.clearTimer(params);
  }
  isInFlight(visitId) {
    return this.inFlightRequests.some((prefetching) => prefetching.params.id === visitId);
  }
  removeFromInFlight(visitId) {
    this.inFlightRequests = this.inFlightRequests.filter((prefetching) => {
      return prefetching.params.id !== visitId;
    });
  }
  extractStaleValues(cacheFor) {
    const [stale, expires] = this.cacheForToStaleAndExpires(cacheFor);
    return [timeToMs(stale), timeToMs(expires)];
  }
  cacheForToStaleAndExpires(cacheFor) {
    if (!Array.isArray(cacheFor)) {
      return [cacheFor, cacheFor];
    }
    switch (cacheFor.length) {
      case 0:
        return [0, 0];
      case 1:
        return [cacheFor[0], cacheFor[0]];
      default:
        return [cacheFor[0], cacheFor[1]];
    }
  }
  clearTimer(params) {
    const timer = this.removalTimers.find((removalTimer) => {
      return this.paramsAreEqual(removalTimer.params, params);
    });
    if (timer) {
      clearTimeout(timer.timer);
      this.removalTimers = this.removalTimers.filter((removalTimer) => removalTimer !== timer);
    }
  }
  scheduleForRemoval(params, expiresIn) {
    if (typeof window === "undefined") {
      return;
    }
    this.clearTimer(params);
    if (expiresIn > 0) {
      const timer = window.setTimeout(() => this.remove(params), expiresIn);
      this.removalTimers.push({
        params,
        timer
      });
    }
  }
  get(params) {
    return this.findCached(params) || this.findInFlight(params);
  }
  use(prefetched, params) {
    const id = `${params.url.pathname}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    this.currentUseId = id;
    const consumedParams = {
      ...params,
      cached: true
    };
    return prefetched.response.then(
      (response) => {
        if (this.currentUseId !== id) {
          return;
        }
        response.mergeParams({ ...consumedParams, onPrefetched: () => {
        } });
        this.removeSingleUseItems(params);
        return response.handle();
      },
      (error) => {
        if (!(error instanceof HttpCancelledError2)) {
          throw error;
        }
        consumedParams.onCancel();
        consumedParams.cancelled = true;
        consumedParams.onFinish(consumedParams);
      }
    );
  }
  removeSingleUseItems(params) {
    this.cached = this.cached.filter((prefetched) => {
      if (!this.paramsAreEqual(prefetched.params, params)) {
        return true;
      }
      return !prefetched.singleUse;
    });
  }
  findCached(params) {
    return this.cached.find((prefetched) => {
      return this.paramsAreEqual(prefetched.params, params);
    }) || null;
  }
  findInFlight(params) {
    return this.inFlightRequests.find((prefetched) => {
      return this.paramsAreEqual(prefetched.params, params);
    }) || null;
  }
  withoutPurposePrefetchHeader(params) {
    const newParams = cloneDeep(params);
    if (newParams.headers["Purpose"] === "prefetch") {
      delete newParams.headers["Purpose"];
    }
    return newParams;
  }
  paramsAreEqual(params1, params2) {
    return objectsAreEqual(
      this.withoutPurposePrefetchHeader(params1),
      this.withoutPurposePrefetchHeader(params2),
      [
        "id",
        "showProgress",
        "replace",
        "prefetch",
        "preserveScroll",
        "preserveState",
        "onBefore",
        "onBeforeUpdate",
        "onStart",
        "onProgress",
        "onFinish",
        "onCancel",
        "onSuccess",
        "onError",
        "onHttpException",
        "onNetworkError",
        "onFlash",
        "onPrefetched",
        "onCancelToken",
        "onPrefetching",
        "async",
        "viewTransition",
        "optimistic",
        "component",
        "pageProps",
        "cached"
      ]
    );
  }
  updateCachedOncePropsFromCurrentPage() {
    this.cached.forEach((prefetched) => {
      prefetched.response.then((response) => {
        const pageResponse = response.getPageResponse();
        page.mergeOncePropsIntoResponse(pageResponse, { force: true });
        for (const [group, deferredProps] of Object.entries(pageResponse.deferredProps ?? {})) {
          const remaining = deferredProps.filter((prop) => get(pageResponse.props, prop) === void 0);
          if (remaining.length > 0) {
            pageResponse.deferredProps[group] = remaining;
          } else {
            delete pageResponse.deferredProps[group];
          }
        }
        const oncePropExpiresIn = this.getShortestOncePropTtl(pageResponse);
        if (oncePropExpiresIn === null) {
          return;
        }
        const prefetchExpiresIn = prefetched.expiresAt - Date.now();
        const expiresIn = Math.min(prefetchExpiresIn, oncePropExpiresIn);
        if (expiresIn > 0) {
          this.scheduleForRemoval(prefetched.params, expiresIn);
        } else {
          this.remove(prefetched.params);
        }
      });
    });
  }
  getShortestOncePropTtl(page2) {
    const expiryTimestamps = Object.values(page2.onceProps ?? {}).map((onceProp) => onceProp.expiresAt).filter((expiresAt) => !!expiresAt);
    if (expiryTimestamps.length === 0) {
      return null;
    }
    return Math.min(...expiryTimestamps) - Date.now();
  }
};
var prefetchedRequests = new PrefetchedRequests();
var elementInViewport = (el) => {
  if (el.offsetParent === null) {
    return false;
  }
  const rect = el.getBoundingClientRect();
  const verticallyVisible = rect.top < window.innerHeight && rect.bottom >= 0;
  const horizontallyVisible = rect.left < window.innerWidth && rect.right >= 0;
  return verticallyVisible && horizontallyVisible;
};
var getScrollableParent = (element) => {
  const allowsVerticalScroll = (el) => {
    const computedStyle = window.getComputedStyle(el);
    if (computedStyle.overflowY === "scroll") {
      return true;
    }
    if (computedStyle.overflowY !== "auto") {
      return false;
    }
    if (["visible", "clip"].includes(computedStyle.overflowX)) {
      return true;
    }
    return hasDimensionConstraint(computedStyle.maxHeight, el.style.height) || isConstrainedByLayout(el, "height");
  };
  const allowsHorizontalScroll = (el) => {
    const computedStyle = window.getComputedStyle(el);
    if (computedStyle.overflowX === "scroll") {
      return true;
    }
    if (computedStyle.overflowX !== "auto") {
      return false;
    }
    if (["visible", "clip"].includes(computedStyle.overflowY)) {
      return true;
    }
    return hasDimensionConstraint(computedStyle.maxWidth, el.style.width) || isConstrainedByLayout(el, "width");
  };
  const hasDimensionConstraint = (computedMaxDimension, inlineStyleDimension) => {
    if (computedMaxDimension && computedMaxDimension !== "none" && computedMaxDimension !== "0px") {
      return true;
    }
    if (inlineStyleDimension && inlineStyleDimension !== "auto" && inlineStyleDimension !== "0") {
      return true;
    }
    return false;
  };
  const isConstrainedByLayout = (el, dimension) => {
    const parent2 = el.parentElement;
    if (!parent2) {
      return false;
    }
    const parentStyle = window.getComputedStyle(parent2);
    if (["flex", "inline-flex"].includes(parentStyle.display)) {
      const isColumnLayout = ["column", "column-reverse"].includes(parentStyle.flexDirection);
      return dimension === "height" ? isColumnLayout : !isColumnLayout;
    }
    return ["grid", "inline-grid"].includes(parentStyle.display);
  };
  let parent = element?.parentElement;
  while (parent) {
    const allowsScroll = allowsVerticalScroll(parent) || allowsHorizontalScroll(parent);
    if (window.getComputedStyle(parent).display !== "contents" && allowsScroll) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
};
var getElementsInViewportFromCollection = (elements, referenceElement) => {
  if (!referenceElement) {
    return elements.filter((element) => elementInViewport(element));
  }
  const referenceIndex = elements.indexOf(referenceElement);
  const upwardElements = [];
  const downwardElements = [];
  for (let i = referenceIndex; i >= 0; i--) {
    const element = elements[i];
    if (elementInViewport(element)) {
      upwardElements.push(element);
    } else {
      break;
    }
  }
  for (let i = referenceIndex + 1; i < elements.length; i++) {
    const element = elements[i];
    if (elementInViewport(element)) {
      downwardElements.push(element);
    } else {
      break;
    }
  }
  return [...upwardElements.reverse(), ...downwardElements];
};
var requestAnimationFrame = (cb, times = 1) => {
  window.requestAnimationFrame(() => {
    if (times > 1) {
      requestAnimationFrame(cb, times - 1);
    } else {
      cb();
    }
  });
};
var isServer = typeof window === "undefined";
var isFirefox = !isServer && /Firefox/i.test(window.navigator.userAgent);
var Scroll = class {
  static save() {
    history.saveScrollPositions(this.getScrollRegions());
  }
  static getScrollRegions() {
    return Array.from(this.regions()).map((region) => ({
      top: region.scrollTop,
      left: region.scrollLeft
    }));
  }
  static regions() {
    return document.querySelectorAll("[scroll-region]");
  }
  static scrollToTop() {
    if (isFirefox && getComputedStyle(document.documentElement).scrollBehavior === "smooth") {
      return requestAnimationFrame(() => window.scrollTo(0, 0), 2);
    }
    window.scrollTo(0, 0);
  }
  static reset() {
    const anchorHash = isServer ? null : window.location.hash;
    if (!anchorHash) {
      this.scrollToTop();
    }
    this.regions().forEach((region) => {
      if (typeof region.scrollTo === "function") {
        region.scrollTo(0, 0);
      } else {
        region.scrollTop = 0;
        region.scrollLeft = 0;
      }
    });
    this.save();
    this.scrollToAnchor();
  }
  static scrollToAnchor() {
    const anchorHash = isServer ? null : window.location.hash;
    if (anchorHash) {
      setTimeout(() => {
        const anchorElement = document.getElementById(anchorHash.slice(1));
        anchorElement ? anchorElement.scrollIntoView() : this.scrollToTop();
      });
    }
  }
  static restore(scrollRegions) {
    if (isServer) {
      return;
    }
    window.requestAnimationFrame(() => {
      this.restoreDocument();
      this.restoreScrollRegions(scrollRegions);
    });
  }
  static restoreScrollRegions(scrollRegions) {
    if (isServer) {
      return;
    }
    this.regions().forEach((region, index) => {
      const scrollPosition = scrollRegions[index];
      if (!scrollPosition) {
        return;
      }
      if (typeof region.scrollTo === "function") {
        region.scrollTo(scrollPosition.left, scrollPosition.top);
      } else {
        region.scrollTop = scrollPosition.top;
        region.scrollLeft = scrollPosition.left;
      }
    });
  }
  static restoreDocument() {
    const scrollPosition = history.getDocumentScrollPosition();
    window.scrollTo(scrollPosition.left, scrollPosition.top);
  }
  static onScroll(event) {
    const target = event.target;
    if (typeof target.hasAttribute === "function" && target.hasAttribute("scroll-region")) {
      this.save();
    }
  }
  static onWindowScroll() {
    history.saveDocumentScrollPosition({
      top: window.scrollY,
      left: window.scrollX
    });
  }
};
var isFile2 = (value) => typeof File !== "undefined" && value instanceof File || value instanceof Blob || typeof FileList !== "undefined" && value instanceof FileList && value.length > 0;
function hasFiles2(data) {
  return isFile2(data) || data instanceof FormData && Array.from(data.values()).some((value) => hasFiles2(value)) || typeof data === "object" && data !== null && Object.values(data).some((value) => hasFiles2(value));
}
var isFormData = (value) => value instanceof FormData;
function objectToFormData(source, form = new FormData(), parentKey = null, queryStringArrayFormat = "brackets") {
  source = source || {};
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      append(form, composeKey(parentKey, key, "indices"), source[key], queryStringArrayFormat);
    }
  }
  return form;
}
function composeKey(parent, key, format) {
  if (!parent) {
    return key;
  }
  return format === "brackets" ? `${parent}[]` : `${parent}[${key}]`;
}
function append(form, key, value, format) {
  if (Array.isArray(value)) {
    return Array.from(value.keys()).forEach(
      (index) => append(form, composeKey(key, index.toString(), format), value[index], format)
    );
  } else if (value instanceof Date) {
    return form.append(key, value.toISOString());
  } else if (value instanceof File) {
    return form.append(key, value, value.name);
  } else if (value instanceof Blob) {
    return form.append(key, value);
  } else if (typeof value === "boolean") {
    return form.append(key, value ? "1" : "0");
  } else if (typeof value === "string") {
    return form.append(key, value);
  } else if (typeof value === "number") {
    return form.append(key, `${value}`);
  } else if (typeof value === "bigint") {
    return form.append(key, value.toString());
  } else if (value === null || value === void 0) {
    return form.append(key, "");
  }
  objectToFormData(value, form, key, format);
}
function hasIndices(url) {
  return /\[\d+\]/.test(decodeURIComponent(url.search));
}
function parse(query) {
  if (!query || query === "?") {
    return {};
  }
  const result = {};
  query.replace(/^\?/, "").split("&").filter(Boolean).forEach((segment) => {
    const [rawKey, rawValue] = splitPair(segment);
    set2(result, decode(rawKey), decode(rawValue));
  });
  return result;
}
function stringify2(data, arrayFormat) {
  const pairs = [];
  build(data, "", pairs, arrayFormat);
  return pairs.length ? "?" + pairs.join("&") : "";
}
function splitPair(pair) {
  const index = pair.indexOf("=");
  return index === -1 ? [pair, ""] : [pair.substring(0, index), pair.substring(index + 1)];
}
function decode(value) {
  return decodeURIComponent(value.replace(/\+/g, " "));
}
function set2(target, key, value) {
  const keys = parseKey(key);
  if (keys.some((k) => k === "__proto__")) {
    return;
  }
  let current = target;
  while (keys.length > 1) {
    const segment = keys.shift();
    const nextIsArrayPush = keys[0] === "";
    if (typeof current[segment] !== "object" || current[segment] === null) {
      current[segment] = nextIsArrayPush ? [] : {};
    }
    current = current[segment];
  }
  const final = keys.shift();
  if (final === "" && Array.isArray(current)) {
    current.push(value);
  } else {
    current[final] = value;
  }
}
function parseKey(key) {
  const segments = [];
  const base = key.split("[")[0];
  if (base) {
    segments.push(base);
  }
  let match;
  const pattern = /\[([^\]]*)\]/g;
  while ((match = pattern.exec(key)) !== null) {
    segments.push(match[1]);
  }
  return segments;
}
function build(value, prefix, pairs, arrayFormat) {
  if (value === void 0) {
    return;
  }
  if (value === null) {
    pairs.push(`${prefix}=`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const key = arrayFormat === "indices" ? `${prefix}[${index}]` : `${prefix}[]`;
      build(item, key, pairs, arrayFormat);
    });
    return;
  }
  if (typeof value === "object") {
    Object.keys(value).forEach((key) => {
      build(value[key], prefix ? `${prefix}[${key}]` : key, pairs, arrayFormat);
    });
    return;
  }
  pairs.push(`${prefix}=${encodeURIComponent(String(value))}`);
}
function hrefToUrl(href) {
  return new URL(href.toString(), typeof window === "undefined" ? void 0 : window.location.toString());
}
var transformUrlAndData = (href, data, method, forceFormData, queryStringArrayFormat) => {
  let url = typeof href === "string" ? hrefToUrl(href) : href;
  if ((hasFiles2(data) || forceFormData) && !isFormData(data)) {
    if (config.get("form.forceIndicesArrayFormatInFormData")) {
      queryStringArrayFormat = "indices";
    }
    data = objectToFormData(data, new FormData(), null, queryStringArrayFormat);
  }
  if (isFormData(data)) {
    return [url, data];
  }
  const [_href, _data] = mergeDataIntoQueryString(method, url, data, queryStringArrayFormat);
  return [hrefToUrl(_href), _data];
};
function mergeDataIntoQueryString(method, href, data, qsArrayFormat = "brackets") {
  const hasDataForQueryString = method === "get" && !isFormData(data) && Object.keys(data).length > 0;
  const hasHost = urlHasProtocol(href.toString());
  const hasAbsolutePath = hasHost || href.toString().startsWith("/") || href.toString() === "";
  const hasRelativePath = !hasAbsolutePath && !href.toString().startsWith("#") && !href.toString().startsWith("?");
  const hasRelativePathWithDotPrefix = /^[.]{1,2}([/]|$)/.test(href.toString());
  const hasSearch = href.toString().includes("?") || hasDataForQueryString;
  const hasHash = href.toString().includes("#");
  const url = new URL(href.toString(), typeof window === "undefined" ? "http://localhost" : window.location.toString());
  if (hasDataForQueryString) {
    const arrayFormat = hasIndices(url) ? "indices" : qsArrayFormat;
    url.search = stringify2({ ...parse(url.search), ...data }, arrayFormat);
  }
  return [
    [
      hasHost ? `${url.protocol}//${url.host}` : "",
      hasAbsolutePath ? url.pathname : "",
      hasRelativePath ? url.pathname.substring(hasRelativePathWithDotPrefix ? 0 : 1) : "",
      hasSearch ? url.search : "",
      hasHash ? url.hash : ""
    ].join(""),
    hasDataForQueryString ? {} : data
  ];
}
function urlWithoutHash(url) {
  url = new URL(url.href);
  url.hash = "";
  return url;
}
var setHashIfSameUrl = (originUrl, destinationUrl) => {
  if (originUrl.hash && !destinationUrl.hash && urlWithoutHash(originUrl).href === destinationUrl.href) {
    destinationUrl.hash = originUrl.hash;
  }
};
var isSameUrlWithoutHash = (url1, url2) => {
  return urlWithoutHash(url1).href === urlWithoutHash(url2).href;
};
var isSameUrlWithoutQueryOrHash = (url1, url2) => {
  return url1.origin === url2.origin && url1.pathname === url2.pathname;
};
function isUrlMethodPair(href) {
  return href !== null && typeof href === "object" && href !== void 0 && "url" in href && "method" in href;
}
function resolveUrlMethodPairComponent(pair) {
  if (!pair.component) {
    return null;
  }
  if (typeof pair.component !== "string") {
    console.error(
      `The "component" property on the URL method pair received multiple components (${Object.keys(pair.component).join(", ")}), but only a single component string is supported for instant visits. Use the withComponent() method to specify which component to use.`
    );
    return null;
  }
  return pair.component;
}
function urlHasProtocol(url) {
  return /^([a-z][a-z0-9+.-]*:)?\/\/[^/]/i.test(url);
}
function urlToString(url, absolute) {
  const urlObj = typeof url === "string" ? hrefToUrl(url) : url;
  return absolute ? `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}${urlObj.search}${urlObj.hash}` : `${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
}
var CurrentPage = class {
  page;
  swapComponent;
  resolveComponent;
  onFlashCallback;
  componentId = {};
  listeners = [];
  isFirstPageLoad = true;
  cleared = false;
  pendingDeferredProps = null;
  historyQuotaExceeded = false;
  optimisticBaseline = {};
  pendingOptimistics = [];
  optimisticCounter = 0;
  confirmedOptimisticId = 0;
  init({
    initialPage,
    swapComponent: swapComponent2,
    resolveComponent,
    onFlash
  }) {
    this.page = { ...initialPage, flash: initialPage.flash ?? {}, rescuedProps: initialPage.rescuedProps ?? [] };
    this.swapComponent = swapComponent2;
    this.resolveComponent = resolveComponent;
    this.onFlashCallback = onFlash;
    eventHandler.on("historyQuotaExceeded", () => {
      this.historyQuotaExceeded = true;
    });
    return this;
  }
  set(page2, {
    replace = false,
    preserveScroll = false,
    preserveState = false,
    viewTransition = false,
    cached = false,
    initialRender = false,
    visitId
  } = {}) {
    if (Object.keys(page2.deferredProps || {}).length) {
      this.pendingDeferredProps = {
        deferredProps: page2.deferredProps,
        component: page2.component,
        url: page2.url
      };
      if (page2.initialDeferredProps === void 0) {
        page2.initialDeferredProps = page2.deferredProps;
      }
    }
    this.componentId = {};
    const componentId = this.componentId;
    if (page2.clearHistory) {
      history.clear();
      prefetchedRequests.removeAll();
    }
    return this.resolve(page2.component, page2).then((component) => {
      if (componentId !== this.componentId) {
        return;
      }
      page2.rememberedState ??= {};
      const isServer3 = typeof window === "undefined";
      const location = !isServer3 ? window.location : new URL(page2.url);
      const scrollRegions = !isServer3 && preserveScroll ? Scroll.getScrollRegions() : [];
      replace = replace || isSameUrlWithoutHash(hrefToUrl(page2.url), location);
      const pageForHistory = { ...page2, flash: {} };
      history.clearInitialState(history.rememberedState);
      return new Promise(
        (resolve) => replace ? history.replaceState(pageForHistory, resolve) : history.pushState(pageForHistory, resolve)
      ).then(() => {
        const isNewComponent = !this.isTheSame(page2);
        if (!isNewComponent && Object.keys(page2.props.errors || {}).length > 0) {
          viewTransition = false;
        }
        this.page = page2;
        this.cleared = false;
        if (this.hasOnceProps()) {
          prefetchedRequests.updateCachedOncePropsFromCurrentPage();
        }
        if (isNewComponent) {
          this.fireEventsFor("newComponent");
        }
        if (this.isFirstPageLoad) {
          this.fireEventsFor("firstLoad");
        }
        this.isFirstPageLoad = false;
        if (this.historyQuotaExceeded) {
          this.historyQuotaExceeded = false;
          return;
        }
        return this.swap({
          component,
          page: page2,
          preserveState,
          viewTransition,
          initialRender
        }).then(() => {
          if (preserveScroll) {
            window.requestAnimationFrame(() => Scroll.restoreScrollRegions(scrollRegions));
          } else {
            Scroll.reset();
          }
          if (this.pendingDeferredProps && this.pendingDeferredProps.component === page2.component && this.pendingDeferredProps.url === page2.url) {
            eventHandler.fireInternalEvent("loadDeferredProps", this.pendingDeferredProps.deferredProps);
          }
          this.pendingDeferredProps = null;
          if (!replace) {
            fireNavigateEvent(page2, { type: "visit", cached, visitId });
          }
        });
      });
    });
  }
  setQuietly(page2, {
    preserveState = false
  } = {}) {
    this.componentId = {};
    return this.resolve(page2.component, page2).then((component) => {
      this.page = page2;
      this.cleared = false;
      history.setCurrent(page2);
      return this.swap({ component, page: page2, preserveState, viewTransition: false });
    });
  }
  clear() {
    this.cleared = true;
  }
  isCleared() {
    return this.cleared;
  }
  get() {
    return this.page;
  }
  getWithoutFlashData() {
    return { ...this.page, flash: {} };
  }
  hasOnceProps() {
    return Object.keys(this.page.onceProps ?? {}).length > 0;
  }
  merge(data) {
    this.page = { ...this.page, ...data };
  }
  setPropsQuietly(props) {
    this.page = { ...this.page, props };
    return this.resolve(this.page.component, this.page).then((component) => {
      return this.swap({ component, page: this.page, preserveState: true, viewTransition: false });
    });
  }
  setFlash(flash) {
    this.page = { ...this.page, flash };
    this.onFlashCallback?.(flash);
  }
  setUrlHash(hash) {
    if (!this.page.url.includes(hash)) {
      this.page.url += hash;
    }
  }
  remember(data) {
    this.page.rememberedState = data;
  }
  swap({
    component,
    page: page2,
    preserveState,
    viewTransition,
    initialRender = false
  }) {
    const doSwap = () => this.swapComponent({ component, page: page2, preserveState, initialRender });
    if (!viewTransition || !document?.startViewTransition || document.visibilityState === "hidden") {
      return doSwap();
    }
    const viewTransitionCallback = typeof viewTransition === "boolean" ? () => null : viewTransition;
    const ignoreSkippedTransition = (promise) => {
      promise.catch((error) => {
        if (!(error instanceof DOMException)) {
          throw error;
        }
      });
    };
    return new Promise((resolve) => {
      const transitionResult = document.startViewTransition(() => doSwap().then(resolve));
      ignoreSkippedTransition(transitionResult.ready);
      ignoreSkippedTransition(transitionResult.finished);
      ignoreSkippedTransition(transitionResult.updateCallbackDone);
      viewTransitionCallback(transitionResult);
    });
  }
  resolve(component, page2) {
    return Promise.resolve(this.resolveComponent(component, page2));
  }
  nextOptimisticId() {
    return ++this.optimisticCounter;
  }
  markOptimisticConfirmed(id) {
    this.confirmedOptimisticId = Math.max(this.confirmedOptimisticId, id);
  }
  hasConfirmedOptimisticAfter(id) {
    return this.confirmedOptimisticId > id;
  }
  setBaseline(key, value) {
    if (!(key in this.optimisticBaseline)) {
      this.optimisticBaseline[key] = value;
    }
  }
  updateBaseline(key, value) {
    if (key in this.optimisticBaseline) {
      this.optimisticBaseline[key] = value;
    }
  }
  hasBaseline(key) {
    return key in this.optimisticBaseline;
  }
  registerOptimistic(id, callback) {
    this.pendingOptimistics.push({ id, callback });
  }
  unregisterOptimistic(id) {
    this.pendingOptimistics = this.pendingOptimistics.filter((entry) => entry.id !== id);
  }
  replayOptimistics() {
    const baselineKeys = Object.keys(this.optimisticBaseline);
    if (baselineKeys.length === 0) {
      return {};
    }
    const props = cloneDeep(this.page.props);
    for (const key of baselineKeys) {
      props[key] = cloneDeep(this.optimisticBaseline[key]);
    }
    for (const { callback } of this.pendingOptimistics) {
      const result = callback(cloneDeep(props));
      if (result) {
        Object.assign(props, result);
      }
    }
    const replayedProps = {};
    for (const key of baselineKeys) {
      replayedProps[key] = props[key];
    }
    return replayedProps;
  }
  pendingOptimisticCount() {
    return this.pendingOptimistics.length;
  }
  clearOptimisticState() {
    this.optimisticBaseline = {};
    this.pendingOptimistics = [];
    this.confirmedOptimisticId = 0;
  }
  isTheSame(page2) {
    return this.page.component === page2.component;
  }
  on(event, callback) {
    this.listeners.push({ event, callback });
    return () => {
      this.listeners = this.listeners.filter((listener) => listener.event !== event && listener.callback !== callback);
    };
  }
  fireEventsFor(event) {
    this.listeners.filter((listener) => listener.event === event).forEach((listener) => listener.callback());
  }
  mergeOncePropsIntoResponse(response, { force = false } = {}) {
    Object.entries(response.onceProps ?? {}).forEach(([key, onceProp]) => {
      const existingOnceProp = this.page.onceProps?.[key];
      if (existingOnceProp === void 0) {
        return;
      }
      if (force || get(response.props, onceProp.prop) === void 0) {
        set(response.props, onceProp.prop, get(this.page.props, existingOnceProp.prop));
        response.onceProps[key].expiresAt = existingOnceProp.expiresAt;
      }
    });
  }
};
var page = new CurrentPage();
var Queue = class {
  items = [];
  processingPromise = null;
  add(item) {
    this.items.push(item);
    return this.process();
  }
  process() {
    this.processingPromise ??= this.processNext().then(
      () => {
        this.processingPromise = null;
        if (this.items.length > 0) {
          return this.process();
        }
      },
      (error) => {
        this.processingPromise = null;
        throw error;
      }
    );
    return this.processingPromise;
  }
  processNext() {
    const next = this.items.shift();
    if (next) {
      return Promise.resolve(next()).then(() => this.processNext());
    }
    return Promise.resolve();
  }
};
var isServer2 = typeof window === "undefined";
var queue = new Queue();
var isChromeIOS = !isServer2 && /CriOS/.test(window.navigator.userAgent);
var History = class {
  rememberedState = "rememberedState";
  scrollRegions = "scrollRegions";
  preserveUrl = false;
  current = {};
  // We need initialState for `restore`
  initialState = null;
  remember(data, key) {
    this.replaceState({
      ...page.getWithoutFlashData(),
      rememberedState: {
        ...page.get()?.rememberedState ?? {},
        [key]: data
      }
    });
  }
  restore(key) {
    if (!isServer2) {
      return this.current[this.rememberedState]?.[key] !== void 0 ? this.current[this.rememberedState]?.[key] : this.initialState?.[this.rememberedState]?.[key];
    }
  }
  pushState(page2, cb = null) {
    if (isServer2) {
      return;
    }
    if (this.preserveUrl) {
      cb && cb();
      return;
    }
    this.current = page2;
    queue.add(() => {
      return this.getPageData(page2).then((data) => {
        const doPush = () => this.doPushState({ page: data }, page2.url).then(() => cb?.());
        if (isChromeIOS) {
          return new Promise((resolve) => {
            setTimeout(() => doPush().then(resolve));
          });
        }
        return doPush();
      });
    });
  }
  clonePageProps(page2) {
    try {
      structuredClone(page2.props);
      return page2;
    } catch {
      return {
        ...page2,
        props: cloneDeep(page2.props)
      };
    }
  }
  getPageData(page2) {
    const pageWithClonedProps = this.clonePageProps(page2);
    return new Promise((resolve) => {
      return page2.encryptHistory ? encryptHistory(pageWithClonedProps).then(resolve) : resolve(pageWithClonedProps);
    });
  }
  processQueue() {
    return queue.process();
  }
  decrypt(page2 = null) {
    if (isServer2) {
      return Promise.resolve(page2 ?? page.get());
    }
    const pageData = page2 ?? window.history.state?.page;
    return this.decryptPageData(pageData).then((data) => {
      if (!data) {
        throw new Error("Unable to decrypt history");
      }
      if (this.initialState === null) {
        this.initialState = data ?? void 0;
      } else {
        this.current = data ?? {};
      }
      return data;
    });
  }
  decryptPageData(pageData) {
    return pageData instanceof ArrayBuffer ? decryptHistory(pageData) : Promise.resolve(pageData);
  }
  saveScrollPositions(scrollRegions) {
    queue.add(() => {
      return Promise.resolve().then(() => {
        if (!window.history.state?.page) {
          return;
        }
        if (isEqual(this.getScrollRegions(), scrollRegions)) {
          return;
        }
        return this.doReplaceState({
          page: window.history.state.page,
          scrollRegions
        });
      });
    });
  }
  saveDocumentScrollPosition(scrollRegion) {
    queue.add(() => {
      return Promise.resolve().then(() => {
        if (!window.history.state?.page) {
          return;
        }
        if (isEqual(this.getDocumentScrollPosition(), scrollRegion)) {
          return;
        }
        return this.doReplaceState({
          page: window.history.state.page,
          documentScrollPosition: scrollRegion
        });
      });
    });
  }
  getScrollRegions() {
    return window.history.state?.scrollRegions || [];
  }
  getDocumentScrollPosition() {
    return window.history.state?.documentScrollPosition || { top: 0, left: 0 };
  }
  replaceState(page2, cb = null) {
    if (isEqual(this.current, page2)) {
      cb && cb();
      return;
    }
    const { flash, ...pageWithoutFlash } = page2;
    page.merge(pageWithoutFlash);
    if (isServer2) {
      return;
    }
    if (this.preserveUrl) {
      cb && cb();
      return;
    }
    this.current = page2;
    queue.add(() => {
      return this.getPageData(page2).then((data) => {
        const doReplace = () => this.doReplaceState({ page: data }, page2.url).then(() => cb?.());
        if (isChromeIOS) {
          return new Promise((resolve) => {
            setTimeout(() => doReplace().then(resolve));
          });
        }
        return doReplace();
      });
    });
  }
  isHistoryThrottleError(error) {
    return error instanceof Error && error.name === "SecurityError" && (error.message.includes("history.pushState") || error.message.includes("history.replaceState"));
  }
  isQuotaExceededError(error) {
    return error instanceof Error && error.name === "QuotaExceededError";
  }
  withThrottleProtection(cb) {
    return Promise.resolve().then(() => {
      try {
        return cb();
      } catch (error) {
        if (!this.isHistoryThrottleError(error)) {
          throw error;
        }
        console.error(error.message);
      }
    });
  }
  doReplaceState(data, url) {
    return this.withThrottleProtection(() => {
      try {
        window.history.replaceState(
          {
            ...data,
            scrollRegions: data.scrollRegions ?? window.history.state?.scrollRegions,
            documentScrollPosition: data.documentScrollPosition ?? window.history.state?.documentScrollPosition
          },
          "",
          url
        );
      } catch (error) {
        if (!this.isQuotaExceededError(error)) {
          throw error;
        }
        console.error(error.message);
      }
    });
  }
  doPushState(data, url) {
    return this.withThrottleProtection(() => {
      try {
        window.history.pushState(data, "", url);
      } catch (error) {
        if (!this.isQuotaExceededError(error)) {
          throw error;
        }
        eventHandler.fireInternalEvent("historyQuotaExceeded", url);
      }
    });
  }
  getState(key, defaultValue) {
    return this.current?.[key] ?? defaultValue;
  }
  deleteState(key) {
    if (this.current[key] !== void 0) {
      delete this.current[key];
      this.replaceState(this.current);
    }
  }
  clearInitialState(key) {
    if (this.initialState && this.initialState[key] !== void 0) {
      this.initialState = { ...this.initialState, [key]: void 0 };
    }
  }
  browserHasHistoryEntry() {
    return !isServer2 && !!window.history.state?.page;
  }
  clear() {
    SessionStorage.remove(historySessionStorageKeys.key);
    SessionStorage.remove(historySessionStorageKeys.iv);
  }
  setCurrent(page2) {
    this.current = page2;
  }
  isValidState(state) {
    return !!state.page;
  }
  getAllState() {
    return this.current;
  }
};
if (typeof window !== "undefined" && window.history.scrollRestoration) {
  window.history.scrollRestoration = "manual";
}
var history = new History();
var EventHandler = class {
  internalListeners = [];
  init() {
    if (typeof window !== "undefined") {
      window.addEventListener("popstate", this.handlePopstateEvent.bind(this));
      window.addEventListener("pageshow", this.handlePageshowEvent.bind(this));
      window.addEventListener("scroll", debounce3(Scroll.onWindowScroll.bind(Scroll), 100), true);
    }
    if (typeof document !== "undefined") {
      document.addEventListener("scroll", debounce3(Scroll.onScroll.bind(Scroll), 100), true);
    }
  }
  onGlobalEvent(type, callback) {
    const listener = ((event) => {
      const response = callback(event);
      if (event.cancelable && !event.defaultPrevented && response === false) {
        event.preventDefault();
      }
    });
    return this.registerListener(`inertia:${type}`, listener);
  }
  on(event, callback) {
    this.internalListeners.push({ event, listener: callback });
    return () => {
      this.internalListeners = this.internalListeners.filter((listener) => listener.listener !== callback);
    };
  }
  onMissingHistoryItem() {
    page.clear();
    this.fireInternalEvent("missingHistoryItem");
  }
  fireInternalEvent(event, ...args) {
    this.internalListeners.filter((listener) => listener.event === event).forEach((listener) => listener.listener(...args));
  }
  registerListener(type, listener) {
    document.addEventListener(type, listener);
    return () => document.removeEventListener(type, listener);
  }
  // bfcache restores pages without firing `popstate`, so we use `pageshow` to
  // re-validate encrypted history entries after `clearHistory` removed the keys.
  // https://web.dev/articles/bfcache
  handlePageshowEvent(event) {
    if (event.persisted) {
      history.decrypt().catch(() => this.onMissingHistoryItem());
    }
  }
  handlePopstateEvent(event) {
    const state = event.state || null;
    if (state === null) {
      const url = hrefToUrl(page.get().url);
      url.hash = window.location.hash;
      history.replaceState({ ...page.getWithoutFlashData(), url: url.href });
      Scroll.reset();
      return;
    }
    if (!history.isValidState(state)) {
      return this.onMissingHistoryItem();
    }
    history.decrypt(state.page).then((data) => {
      if (page.get().version !== data.version) {
        this.onMissingHistoryItem();
        return;
      }
      router.cancelAll({ prefetch: false });
      page.setQuietly(data, { preserveState: false }).then(() => {
        Scroll.restore(history.getScrollRegions());
        fireNavigateEvent(page.get(), { type: "history" });
        const pendingDeferred = {};
        const pageProps = page.get().props;
        for (const [group, props] of Object.entries(data.initialDeferredProps ?? data.deferredProps ?? {})) {
          const missing = props.filter((prop) => get(pageProps, prop) === void 0);
          if (missing.length > 0) {
            pendingDeferred[group] = missing;
          }
        }
        if (Object.keys(pendingDeferred).length > 0) {
          this.fireInternalEvent("loadDeferredProps", pendingDeferred);
        }
      });
    }).catch(() => {
      this.onMissingHistoryItem();
    });
  }
};
var eventHandler = new EventHandler();
var NavigationType = class {
  type;
  constructor() {
    this.type = this.resolveType();
  }
  resolveType() {
    if (typeof window === "undefined") {
      return "navigate";
    }
    const entry = window.performance?.getEntriesByType("navigation")[0];
    return entry?.type ?? "navigate";
  }
  get() {
    return this.type;
  }
  isBackForward() {
    return this.type === "back_forward";
  }
  isReload() {
    return this.type === "reload";
  }
};
var navigationType = new NavigationType();
function uid() {
  const cryptoObj = typeof window !== "undefined" ? window.crypto : void 0;
  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID();
  }
  const randomByte = () => cryptoObj?.getRandomValues ? cryptoObj.getRandomValues(new Uint8Array(1))[0] : Math.floor(Math.random() * 256);
  return "10000000-1000-4000-8000-100000000000".replace(
    /[018]/g,
    (c) => (+c ^ randomByte() & 15 >> +c / 4).toString(16)
  );
}
var InitialVisit = class {
  static handle() {
    this.clearRememberedStateOnReload();
    const scenarios = [this.handleBackForward, this.handleLocation, this.handleDefault];
    scenarios.find((handler) => handler.bind(this)());
  }
  static clearRememberedStateOnReload() {
    if (navigationType.isReload()) {
      history.deleteState(history.rememberedState);
      history.clearInitialState(history.rememberedState);
    }
  }
  static handleBackForward() {
    if (!navigationType.isBackForward() || !history.browserHasHistoryEntry()) {
      return false;
    }
    const scrollRegions = history.getScrollRegions();
    history.decrypt().then((data) => {
      if (page.get().version !== data.version) {
        this.handleDefault();
        return;
      }
      const visitId = uid();
      page.set(data, { preserveScroll: true, preserveState: true, visitId }).then(() => {
        Scroll.restore(scrollRegions);
        fireNavigateEvent(page.get(), { type: "history", visitId });
      });
    }).catch(() => {
      eventHandler.onMissingHistoryItem();
    });
    return true;
  }
  /**
   * @link https://inertiajs.com/redirects#external-redirects
   */
  static handleLocation() {
    if (!SessionStorage.exists(SessionStorage.locationVisitKey)) {
      return false;
    }
    const locationVisit = SessionStorage.get(SessionStorage.locationVisitKey) || {};
    SessionStorage.remove(SessionStorage.locationVisitKey);
    if (typeof window !== "undefined") {
      page.setUrlHash(window.location.hash);
    }
    history.decrypt(page.get()).then(() => {
      const visitId = uid();
      const rememberedState = history.getState(history.rememberedState, {});
      const scrollRegions = history.getScrollRegions();
      page.remember(rememberedState);
      page.set(page.get(), {
        preserveScroll: locationVisit.preserveScroll,
        preserveState: true,
        initialRender: true,
        visitId
      }).then(() => {
        if (locationVisit.preserveScroll) {
          Scroll.restore(scrollRegions);
        }
        this.fireInitialEvents(visitId);
      });
    }).catch(() => {
      eventHandler.onMissingHistoryItem();
    });
    return true;
  }
  static handleDefault() {
    if (typeof window !== "undefined") {
      page.setUrlHash(window.location.hash);
    }
    const visitId = uid();
    page.set(page.get(), { preserveScroll: true, preserveState: true, initialRender: true, visitId }).then(() => {
      if (navigationType.isReload()) {
        Scroll.restore(history.getScrollRegions());
      } else {
        Scroll.scrollToAnchor();
      }
      this.fireInitialEvents(visitId);
    });
  }
  static fireInitialEvents(visitId) {
    const page2 = page.get();
    fireNavigateEvent(page2, { type: "initial", visitId });
    if (Object.keys(page2.flash).length > 0) {
      queueMicrotask(() => fireFlashEvent(page2.flash));
    }
  }
};
var Poll = class {
  intervalId = null;
  timeoutId = null;
  hidden = false;
  background;
  cb;
  interval;
  cbCount = 0;
  mode;
  inFlight = false;
  currentCancel = null;
  stopped = true;
  instanceId = 0;
  lastPolledAt = 0;
  constructor(interval, cb, options) {
    this.background = options.background ?? (options.keepAlive ? "continue" : "throttle");
    this.hidden = typeof document !== "undefined" && document.hidden;
    this.mode = options.mode ?? "overlap";
    this.cb = cb;
    this.interval = interval;
    if (options.autoStart ?? true) {
      this.start();
    }
  }
  stop() {
    this.stopped = true;
    this.instanceId++;
    this.inFlight = false;
    this.currentCancel = null;
    this.clearTimers();
  }
  start() {
    if (typeof window === "undefined") {
      return;
    }
    this.stop();
    this.stopped = false;
    this.lastPolledAt = Date.now();
    if (this.isPaused()) {
      return;
    }
    if (this.mode === "rest") {
      this.scheduleNext();
      return;
    }
    this.startInterval();
  }
  isInBackground(hidden2) {
    if (hidden2 === this.hidden) {
      return;
    }
    this.hidden = hidden2;
    if (this.isThrottled()) {
      this.cbCount = 0;
    }
    if (this.background !== "pause") {
      return;
    }
    if (hidden2) {
      this.clearTimers();
    } else {
      this.resume();
    }
  }
  isThrottled() {
    return this.hidden && this.background === "throttle";
  }
  isPaused() {
    return this.hidden && this.background === "pause";
  }
  resume() {
    if (this.stopped || this.mode === "rest" && this.inFlight) {
      return;
    }
    const remaining = this.interval - (Date.now() - this.lastPolledAt);
    if (remaining > 0) {
      this.timeoutId = window.setTimeout(() => {
        this.timeoutId = null;
        this.resume();
      }, remaining);
      return;
    }
    this.fire();
    if (this.mode !== "rest") {
      this.startInterval();
    }
  }
  startInterval() {
    this.intervalId = window.setInterval(() => this.tick(), this.interval);
  }
  clearTimers() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
  scheduleNext() {
    if (this.stopped || this.isPaused()) {
      return;
    }
    this.timeoutId = window.setTimeout(() => {
      this.timeoutId = null;
      this.tick();
    }, this.interval);
  }
  tick() {
    const throttled = this.isThrottled();
    if (!throttled || this.cbCount % 10 === 0) {
      this.fire();
    } else if (this.mode === "rest") {
      this.scheduleNext();
    }
    if (throttled) {
      this.cbCount++;
    }
  }
  fire() {
    if (this.inFlight && this.mode === "cancel") {
      this.currentCancel?.();
    }
    this.lastPolledAt = Date.now();
    const instance = this.instanceId;
    this.cb({
      onStart: (cancel) => {
        if (instance !== this.instanceId) {
          return;
        }
        this.inFlight = true;
        this.currentCancel = cancel;
      },
      onFinish: () => {
        if (instance !== this.instanceId) {
          return;
        }
        this.inFlight = false;
        this.currentCancel = null;
        if (this.mode === "rest") {
          this.lastPolledAt = Date.now();
          this.scheduleNext();
        }
      }
    });
  }
};
var Polls = class {
  polls = [];
  constructor() {
    this.setupVisibilityListener();
  }
  get count() {
    return this.polls.length;
  }
  add(interval, cb, options) {
    const poll = new Poll(interval, cb, options);
    this.polls.push(poll);
    return {
      stop: () => poll.stop(),
      start: () => poll.start(),
      destroy: () => {
        poll.stop();
        this.polls = this.polls.filter((p) => p !== poll);
      }
    };
  }
  clear() {
    this.polls.forEach((poll) => poll.stop());
    this.polls = [];
  }
  setupVisibilityListener() {
    if (typeof document === "undefined") {
      return;
    }
    document.addEventListener(
      "visibilitychange",
      () => {
        this.polls.forEach((poll) => poll.isInBackground(document.hidden));
      },
      false
    );
  }
};
var polls = new Polls();
var HttpHandlers = class {
  requestHandlers = [];
  responseHandlers = [];
  errorHandlers = [];
  onRequest(handler) {
    this.requestHandlers.push(handler);
    return () => {
      this.requestHandlers = this.requestHandlers.filter((h) => h !== handler);
    };
  }
  onResponse(handler) {
    this.responseHandlers.push(handler);
    return () => {
      this.responseHandlers = this.responseHandlers.filter((h) => h !== handler);
    };
  }
  onError(handler) {
    this.errorHandlers.push(handler);
    return () => {
      this.errorHandlers = this.errorHandlers.filter((h) => h !== handler);
    };
  }
  async processRequest(config22) {
    let result = config22;
    for (const handler of this.requestHandlers) {
      result = await handler(result);
    }
    return result;
  }
  async processResponse(response) {
    let result = response;
    for (const handler of this.responseHandlers) {
      result = await handler(result);
    }
    return result;
  }
  async processError(error) {
    for (const handler of this.errorHandlers) {
      await handler(error);
    }
  }
};
var httpHandlers = new HttpHandlers();
function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
  return match ? decodeURIComponent(match[3]) : null;
}
function isSameOrigin(url) {
  return new URL(url, window.location.href).origin === window.location.origin;
}
function parseHeaders2(xhr) {
  const headers = {};
  xhr.getAllResponseHeaders().split("\r\n").forEach((line) => {
    const index = line.indexOf(":");
    if (index > 0) {
      headers[line.slice(0, index).toLowerCase().trim()] = line.slice(index + 1).trim();
    }
  });
  return headers;
}
function isFormDataRequestBody(value) {
  return typeof FormData !== "undefined" && value instanceof FormData;
}
function isRawRequestBody(value) {
  return typeof value === "string" || isFormDataRequestBody(value) || typeof Blob !== "undefined" && value instanceof Blob || typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer || typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView(value) || typeof URLSearchParams !== "undefined" && value instanceof URLSearchParams;
}
function setHeaders(xhr, config22) {
  if (!config22.headers) {
    return;
  }
  const isFormData2 = isFormDataRequestBody(config22.data);
  Object.entries(config22.headers).forEach(([key, value]) => {
    if (key.toLowerCase() !== "content-type" || !isFormData2) {
      xhr.setRequestHeader(key, String(value));
    }
  });
}
function buildUrlWithParams(url, params) {
  if (!params || Object.keys(params).length === 0) {
    return url;
  }
  const [urlWithParams] = mergeDataIntoQueryString("get", url, params);
  return urlWithParams;
}
var XhrHttpClient = class {
  xsrfCookieName;
  xsrfHeaderName;
  constructor(options = {}) {
    this.xsrfCookieName = options.xsrfCookieName ?? "XSRF-TOKEN";
    this.xsrfHeaderName = options.xsrfHeaderName ?? "X-XSRF-TOKEN";
  }
  async request(config22) {
    const processedConfig = await httpHandlers.processRequest(config22);
    try {
      const response = await this.doRequest(processedConfig);
      return await httpHandlers.processResponse(response);
    } catch (error) {
      if (error instanceof HttpResponseError2 || error instanceof HttpNetworkError2 || error instanceof HttpCancelledError2) {
        await httpHandlers.processError(error);
      }
      throw error;
    }
  }
  doRequest(config22) {
    return new Promise((resolve, reject) => {
      if (config22.signal?.aborted) {
        reject(new HttpCancelledError2("Request was cancelled", config22.url));
        return;
      }
      const xhr = new XMLHttpRequest();
      const url = buildUrlWithParams(config22.url, config22.params);
      xhr.open(config22.method.toUpperCase(), url, true);
      const xsrfToken = isSameOrigin(url) ? getCookie(this.xsrfCookieName) : null;
      if (xsrfToken) {
        xhr.setRequestHeader(this.xsrfHeaderName, xsrfToken);
      }
      const hasRequestedWithHeader = Object.keys(config22.headers ?? {}).some(
        (key) => key.toLowerCase() === "x-requested-with"
      );
      if (!hasRequestedWithHeader) {
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      }
      let body = null;
      if (config22.data !== null && config22.data !== void 0) {
        if (isRawRequestBody(config22.data)) {
          body = config22.data;
        } else if (typeof config22.data === "object") {
          body = JSON.stringify(config22.data);
          if (!config22.headers?.["Content-Type"] && !config22.headers?.["content-type"]) {
            xhr.setRequestHeader("Content-Type", "application/json");
          }
        } else {
          body = String(config22.data);
        }
      }
      setHeaders(xhr, config22);
      if (config22.onUploadProgress) {
        xhr.upload.onprogress = (event) => {
          const progress3 = event.lengthComputable ? event.loaded / event.total : void 0;
          config22.onUploadProgress({
            progress: progress3,
            percentage: progress3 ? Math.round(progress3 * 100) : 0,
            loaded: event.loaded,
            total: event.lengthComputable ? event.total : void 0
          });
        };
      }
      if (config22.signal) {
        config22.signal.addEventListener("abort", () => xhr.abort());
      }
      xhr.onabort = () => reject(new HttpCancelledError2("Request was cancelled", config22.url));
      xhr.onerror = () => reject(new HttpNetworkError2("Network error", config22.url));
      xhr.onload = () => {
        const response = {
          status: xhr.status,
          data: xhr.responseText,
          headers: parseHeaders2(xhr)
        };
        if (xhr.status >= 400) {
          reject(new HttpResponseError2(`Request failed with status ${xhr.status}`, response, config22.url));
        } else {
          resolve(response);
        }
      };
      xhr.send(body);
    });
  }
};
var xhrHttpClient = new XhrHttpClient();
client.withSerializer(stringifyJson);
var httpClient2 = xhrHttpClient;
function isHttpClientOptions(client2) {
  return !("request" in client2);
}
var http = {
  /**
   * Get the current HTTP client
   */
  getClient() {
    return httpClient2;
  },
  /**
   * Set the HTTP client to use for all Inertia requests
   */
  setClient(clientOrOptions) {
    if (!isHttpClientOptions(clientOrOptions)) {
      httpClient2 = clientOrOptions;
      return;
    }
    httpClient2 = new XhrHttpClient(clientOrOptions);
    if (clientOrOptions.xsrfCookieName) {
      client.withXsrfCookieName(clientOrOptions.xsrfCookieName);
    }
    if (clientOrOptions.xsrfHeaderName) {
      client.withXsrfHeaderName(clientOrOptions.xsrfHeaderName);
    }
  },
  /**
   * Register a request handler that runs before each request
   */
  onRequest: httpHandlers.onRequest.bind(httpHandlers),
  /**
   * Register a response handler that runs after each successful response
   */
  onResponse: httpHandlers.onResponse.bind(httpHandlers),
  /**
   * Register an error handler that runs when a request fails
   */
  onError: httpHandlers.onError.bind(httpHandlers),
  /**
   * Process a request config through all registered request handlers.
   * For use by custom HttpClient implementations.
   */
  processRequest: httpHandlers.processRequest.bind(httpHandlers),
  /**
   * Process a response through all registered response handlers.
   * For use by custom HttpClient implementations.
   */
  processResponse: httpHandlers.processResponse.bind(httpHandlers),
  /**
   * Process an error through all registered error handlers.
   * For use by custom HttpClient implementations.
   */
  processError: httpHandlers.processError.bind(httpHandlers)
};
var VisitInterceptors = class {
  requestHandlers = [];
  responseHandlers = [];
  onVisitRequest(handler) {
    this.requestHandlers.push(handler);
    return () => {
      this.requestHandlers = this.requestHandlers.filter((h) => h !== handler);
    };
  }
  onVisitResponse(handler) {
    this.responseHandlers.push(handler);
    return () => {
      this.responseHandlers = this.responseHandlers.filter((h) => h !== handler);
    };
  }
  async processRequest(visit, config22) {
    let result = config22;
    for (const handler of this.requestHandlers) {
      result = await handler(visit, result);
    }
    return result;
  }
  async processResponse(visit, response) {
    let result = response;
    for (const handler of this.responseHandlers) {
      result = await handler(visit, result);
    }
    return result;
  }
};
var interceptors = new VisitInterceptors();
var RequestParams = class _RequestParams {
  callbacks = [];
  params;
  constructor(params) {
    if (!params.prefetch) {
      this.params = params;
    } else {
      const wrappedCallbacks = {
        onBefore: this.wrapCallback(params, "onBefore"),
        onBeforeUpdate: this.wrapCallback(params, "onBeforeUpdate"),
        onStart: this.wrapCallback(params, "onStart"),
        onProgress: this.wrapCallback(params, "onProgress"),
        onFinish: this.wrapCallback(params, "onFinish"),
        onCancel: this.wrapCallback(params, "onCancel"),
        onSuccess: this.wrapCallback(params, "onSuccess"),
        onError: this.wrapCallback(params, "onError"),
        onHttpException: this.wrapCallback(params, "onHttpException"),
        onNetworkError: this.wrapCallback(params, "onNetworkError"),
        onFlash: this.wrapCallback(params, "onFlash"),
        onCancelToken: this.wrapCallback(params, "onCancelToken"),
        onPrefetched: this.wrapCallback(params, "onPrefetched"),
        onPrefetching: this.wrapCallback(params, "onPrefetching")
      };
      this.params = {
        ...params,
        ...wrappedCallbacks,
        onPrefetchResponse: params.onPrefetchResponse || (() => {
        }),
        onPrefetchError: params.onPrefetchError || (() => {
        })
      };
    }
  }
  static create(params) {
    return new _RequestParams(params);
  }
  data() {
    return this.params.method === "get" ? null : this.params.data;
  }
  queryParams() {
    return this.params.method === "get" ? this.params.data : {};
  }
  isPartial() {
    return this.params.only.length > 0 || this.params.except.length > 0 || this.params.reset.length > 0;
  }
  isPrefetch() {
    return this.params.prefetch === true;
  }
  isDeferredPropsRequest() {
    return this.params.deferredProps === true;
  }
  isPollRequest() {
    return this.params.poll === true;
  }
  onCancelToken(cb) {
    this.params.onCancelToken({
      cancel: cb
    });
  }
  markAsFinished() {
    this.params.completed = true;
    this.params.cancelled = false;
    this.params.interrupted = false;
  }
  markAsCancelled({ cancelled = true, interrupted = false }) {
    this.params.onCancel();
    this.params.completed = false;
    this.params.cancelled = cancelled;
    this.params.interrupted = interrupted;
  }
  wasCancelledAtAll() {
    return this.params.cancelled || this.params.interrupted;
  }
  onFinish() {
    this.params.onFinish(this.params);
  }
  onStart() {
    this.params.onStart(this.params);
  }
  onPrefetching() {
    this.params.onPrefetching(this.params);
  }
  onPrefetchResponse(response) {
    if (this.params.onPrefetchResponse) {
      this.params.onPrefetchResponse(response);
    }
  }
  onPrefetchError(error) {
    if (this.params.onPrefetchError) {
      this.params.onPrefetchError(error);
    }
  }
  all() {
    return this.params;
  }
  headers() {
    const headers = {
      ...this.params.headers
    };
    if (this.isPartial()) {
      headers["X-Inertia-Partial-Component"] = page.get().component;
    }
    const only = this.params.only.concat(this.params.reset);
    if (only.length > 0) {
      headers["X-Inertia-Partial-Data"] = only.join(",");
    }
    if (this.params.except.length > 0) {
      headers["X-Inertia-Partial-Except"] = this.params.except.join(",");
    }
    if (this.params.reset.length > 0) {
      headers["X-Inertia-Reset"] = this.params.reset.join(",");
    }
    if (this.params.errorBag && this.params.errorBag.length > 0) {
      headers["X-Inertia-Error-Bag"] = this.params.errorBag;
    }
    return headers;
  }
  setPreserveOptions(page2) {
    this.params.preserveScroll = _RequestParams.resolvePreserveOption(this.params.preserveScroll, page2);
    this.params.preserveState = _RequestParams.resolvePreserveOption(this.params.preserveState, page2);
  }
  runCallbacks() {
    this.callbacks.forEach(({ name, args }) => {
      this.params[name](...args);
    });
  }
  merge(toMerge) {
    this.params = {
      ...this.params,
      ...toMerge
    };
  }
  wrapCallback(params, name) {
    return (...args) => {
      this.recordCallback(name, args);
      params[name](...args);
    };
  }
  recordCallback(name, args) {
    this.callbacks.push({ name, args });
  }
  static resolvePreserveOption(value, page2) {
    if (typeof value === "function") {
      return value(page2);
    }
    if (value === "errors") {
      return Object.keys(page2.props.errors || {}).length > 0;
    }
    return value;
  }
};
var dialog_default = {
  createIframeAndPage(html2) {
    if (typeof html2 === "object") {
      html2 = `All Inertia requests must receive a valid Inertia response, however a plain JSON response was received.<hr>${JSON.stringify(
        html2
      )}`;
    }
    const page2 = document.createElement("html");
    page2.innerHTML = html2;
    page2.querySelectorAll("a").forEach((a) => a.setAttribute("target", "_top"));
    const iframe = document.createElement("iframe");
    iframe.style.backgroundColor = "white";
    iframe.style.borderRadius = "5px";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.setAttribute("sandbox", "allow-scripts");
    return { iframe, page: page2 };
  },
  show(html2) {
    const { iframe, page: page2 } = this.createIframeAndPage(html2);
    iframe.style.boxSizing = "border-box";
    iframe.style.display = "block";
    const dialog = document.createElement("dialog");
    dialog.id = "inertia-error-dialog";
    Object.assign(dialog.style, {
      width: "calc(100vw - 100px)",
      height: "calc(100vh - 100px)",
      padding: "0",
      margin: "auto",
      border: "none",
      backgroundColor: "transparent"
    });
    const dialogStyleElement = document.createElement("style");
    dialogStyleElement.textContent = `
      dialog#inertia-error-dialog::backdrop {
        background-color: rgba(0, 0, 0, 0.6);
      }

      dialog#inertia-error-dialog:focus {
        outline: none;
      }
    `;
    const nonce = config.get("nonce");
    if (nonce) {
      dialogStyleElement.nonce = nonce;
    }
    document.head.appendChild(dialogStyleElement);
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        dialog.close();
      }
    });
    dialog.addEventListener("close", () => {
      dialogStyleElement.remove();
      dialog.remove();
    });
    dialog.appendChild(iframe);
    document.body.prepend(dialog);
    dialog.showModal();
    dialog.focus();
    iframe.srcdoc = page2.outerHTML;
  }
};
var isPathOrSubPath = (path, candidate) => {
  return path === candidate || path.startsWith(`${candidate}.`);
};
var partialReloadRequestsProp = (visit, prop) => {
  const { only, except } = visit;
  if (only.length === 0 && except.length === 0) {
    return false;
  }
  if (only.length > 0 && !only.some((candidate) => isPathOrSubPath(prop, candidate))) {
    return false;
  }
  if (except.length > 0 && except.some((candidate) => isPathOrSubPath(prop, candidate))) {
    return false;
  }
  return true;
};
var partialReloadRequestsSomeProps = (visit, props) => {
  return props.some((prop) => partialReloadRequestsProp(visit, prop));
};
var queue2 = new Queue();
var Response = class _Response {
  constructor(requestParams, response, originatingPage, optimisticId = null) {
    this.requestParams = requestParams;
    this.response = response;
    this.originatingPage = originatingPage;
    this.optimisticId = optimisticId;
  }
  requestParams;
  response;
  originatingPage;
  optimisticId;
  wasPrefetched = false;
  processed = false;
  static create(params, response, originatingPage, optimisticId = null) {
    return new _Response(params, response, originatingPage, optimisticId);
  }
  isProcessed() {
    return this.processed;
  }
  async handlePrefetch() {
    if (isSameUrlWithoutHash(this.requestParams.all().url, window.location)) {
      this.handle();
    }
  }
  async handle() {
    return queue2.add(() => this.process());
  }
  async process() {
    if (this.requestParams.all().prefetch) {
      this.wasPrefetched = true;
      this.requestParams.all().prefetch = false;
      this.requestParams.all().onPrefetched(this.response, this.requestParams.all());
      firePrefetchedEvent(this.response, this.requestParams.all());
      return Promise.resolve();
    }
    this.requestParams.runCallbacks();
    this.processed = true;
    if (!this.isInertiaResponse()) {
      return this.handleNonInertiaResponse();
    }
    if (this.isHttpException()) {
      const response = {
        ...this.response,
        data: this.getDataFromResponse(this.response.data)
      };
      if (this.requestParams.all().onHttpException(response) === false) {
        return;
      }
      if (!fireHttpExceptionEvent(response)) {
        return;
      }
    }
    await history.processQueue();
    history.preserveUrl = this.requestParams.all().preserveUrl;
    await this.setPage();
    const { flash } = page.get();
    if (Object.keys(flash).length > 0 && !this.requestParams.isDeferredPropsRequest()) {
      fireFlashEvent(flash);
      this.requestParams.all().onFlash(flash);
    }
    const errors = page.get().props.errors || {};
    if (Object.keys(errors).length > 0) {
      const scopedErrors = this.getScopedErrors(errors);
      fireErrorEvent(scopedErrors, { page: page.get(), visitId: this.requestParams.all().id });
      return this.requestParams.all().onError(scopedErrors);
    }
    router.flushByCacheTags(this.requestParams.all().invalidateCacheTags || []);
    if (!this.wasPrefetched) {
      router.flush(page.get().url);
    }
    fireSuccessEvent(page.get(), { visitId: this.requestParams.all().id });
    await this.requestParams.all().onSuccess(page.get());
    history.preserveUrl = false;
  }
  mergeParams(params) {
    this.requestParams.merge(params);
  }
  getPageResponse() {
    const data = this.getDataFromResponse(this.response.data);
    if (typeof data === "object") {
      return this.response.data = { ...data, flash: data.flash ?? {}, rescuedProps: data.rescuedProps ?? [] };
    }
    return this.response.data = data;
  }
  async handleNonInertiaResponse() {
    if (this.isInertiaRedirect()) {
      router.visit(this.getHeader("x-inertia-redirect"), {
        ...this.requestParams.all(),
        method: "get",
        data: {}
      });
      return;
    }
    if (this.isLocationVisit()) {
      const locationUrl = hrefToUrl(this.getHeader("x-inertia-location"));
      setHashIfSameUrl(this.requestParams.all().url, locationUrl);
      return this.locationVisit(locationUrl);
    }
    const response = {
      ...this.response,
      data: this.getDataFromResponse(this.response.data)
    };
    if (this.requestParams.all().onHttpException(response) === false) {
      return;
    }
    if (fireHttpExceptionEvent(response)) {
      return dialog_default.show(response.data);
    }
  }
  isInertiaResponse() {
    return this.hasHeader("x-inertia");
  }
  isHttpException() {
    return this.response.status >= 400;
  }
  hasStatus(status2) {
    return this.response.status === status2;
  }
  getHeader(header) {
    return this.response.headers[header];
  }
  hasHeader(header) {
    return this.getHeader(header) !== void 0;
  }
  isInertiaRedirect() {
    return this.hasStatus(409) && this.hasHeader("x-inertia-redirect");
  }
  isLocationVisit() {
    return this.hasStatus(409) && this.hasHeader("x-inertia-location");
  }
  /**
   * @link https://inertiajs.com/redirects#external-redirects
   */
  locationVisit(url) {
    try {
      if (typeof window === "undefined") {
        return;
      }
      const responseVersion = this.getHeader("x-inertia-version");
      const versionChange = !!responseVersion && responseVersion !== page.get().version;
      if (!fireLocationEvent(url, versionChange)) {
        return;
      }
      if (versionChange && this.requestParams.all().async) {
        return;
      }
      SessionStorage.set(SessionStorage.locationVisitKey, {
        preserveScroll: this.requestParams.all().preserveScroll === true
      });
      if (isSameUrlWithoutHash(window.location, url)) {
        window.location.reload();
      } else {
        window.location.href = url.href;
      }
    } catch (error) {
      return false;
    }
  }
  async setPage() {
    const pageResponse = this.getPageResponse();
    if (!this.shouldSetPage(pageResponse)) {
      return Promise.resolve();
    }
    this.response = await interceptors.processResponse(this.requestParams.all(), this.response);
    this.mergeProps(pageResponse);
    page.mergeOncePropsIntoResponse(pageResponse);
    this.preserveOptimisticProps(pageResponse);
    this.preserveEqualProps(pageResponse);
    await this.setRememberedState(pageResponse);
    this.requestParams.setPreserveOptions(pageResponse);
    pageResponse.url = history.preserveUrl ? page.get().url : this.pageUrl(pageResponse);
    this.requestParams.all().onBeforeUpdate(pageResponse);
    fireBeforeUpdateEvent(pageResponse);
    return page.set(pageResponse, {
      replace: this.requestParams.all().replace,
      preserveScroll: this.requestParams.all().preserveScroll,
      preserveState: this.requestParams.all().preserveState,
      viewTransition: this.requestParams.all().viewTransition,
      cached: this.requestParams.all().cached,
      visitId: this.requestParams.all().id
    });
  }
  getDataFromResponse(response) {
    if (typeof response !== "string") {
      return response;
    }
    try {
      return parsePage(response);
    } catch (error) {
      return response;
    }
  }
  shouldSetPage(pageResponse) {
    if (!this.requestParams.all().async) {
      return true;
    }
    if (this.originatingPage.component !== pageResponse.component) {
      return true;
    }
    if (this.originatingPage.component !== page.get().component) {
      return false;
    }
    const originatingUrl = hrefToUrl(this.originatingPage.url);
    const currentPageUrl = hrefToUrl(page.get().url);
    return originatingUrl.origin === currentPageUrl.origin && originatingUrl.pathname === currentPageUrl.pathname;
  }
  pageUrl(pageResponse) {
    const responseUrl = hrefToUrl(pageResponse.url);
    if (pageResponse.preserveFragment) {
      responseUrl.hash = this.requestParams.all().url.hash;
    } else {
      setHashIfSameUrl(this.requestParams.all().url, responseUrl);
    }
    return responseUrl.pathname + responseUrl.search + responseUrl.hash;
  }
  preserveOptimisticProps(pageResponse) {
    if (!router.hasPendingOptimistic() && !this.isStaleOptimisticResponse()) {
      return;
    }
    for (const key of Object.keys(pageResponse.props)) {
      if (page.hasBaseline(key)) {
        page.updateBaseline(key, pageResponse.props[key]);
        pageResponse.props[key] = page.get().props[key];
      }
    }
  }
  isStaleOptimisticResponse() {
    return this.optimisticId !== null && page.hasConfirmedOptimisticAfter(this.optimisticId);
  }
  preserveEqualProps(pageResponse) {
    if (pageResponse.component !== page.get().component) {
      return;
    }
    const currentPageProps = page.get().props;
    Object.entries(pageResponse.props).forEach(([key, value]) => {
      if (isEqual(value, currentPageProps[key])) {
        pageResponse.props[key] = currentPageProps[key];
      }
    });
  }
  mergeProps(pageResponse) {
    if (!this.requestParams.isPartial() || pageResponse.component !== page.get().component) {
      return;
    }
    const propsToAppend = pageResponse.mergeProps || [];
    const propsToPrepend = pageResponse.prependProps || [];
    const propsToDeepMerge = pageResponse.deepMergeProps || [];
    const matchPropsOn = pageResponse.matchPropsOn || [];
    const mergeProp = (prop, shouldAppend) => {
      const currentProp = get(page.get().props, prop);
      const incomingProp = get(pageResponse.props, prop);
      if (Array.isArray(incomingProp)) {
        const newArray = this.mergeOrMatchItems(
          currentProp || [],
          incomingProp,
          prop,
          matchPropsOn,
          shouldAppend
        );
        set(pageResponse.props, prop, newArray);
      } else if (typeof incomingProp === "object" && incomingProp !== null) {
        const newObject = {
          ...currentProp || {},
          ...incomingProp
        };
        set(pageResponse.props, prop, newObject);
      }
    };
    propsToAppend.forEach((prop) => mergeProp(prop, true));
    propsToPrepend.forEach((prop) => mergeProp(prop, false));
    propsToDeepMerge.forEach((prop) => {
      const currentProp = get(page.get().props, prop);
      const incomingProp = get(pageResponse.props, prop);
      const deepMerge = (target, source, matchProp) => {
        if (Array.isArray(source)) {
          return this.mergeOrMatchItems(target, source, matchProp, matchPropsOn);
        }
        if (typeof source === "object" && source !== null) {
          return Object.keys(source).reduce(
            (acc, key) => {
              acc[key] = deepMerge(target ? target[key] : void 0, source[key], `${matchProp}.${key}`);
              return acc;
            },
            { ...target }
          );
        }
        return source;
      };
      set(pageResponse.props, prop, deepMerge(currentProp, incomingProp, prop));
    });
    const nestedTopKeys = new Set(
      [...this.requestParams.all().only, ...this.requestParams.all().except].filter((prop) => prop.includes(".")).map((prop) => prop.split(".")[0])
    );
    for (const key of nestedTopKeys) {
      const currentValue = page.get().props[key];
      if (this.isObject(currentValue) && this.isObject(pageResponse.props[key])) {
        pageResponse.props[key] = this.deepMergeObjects(currentValue, pageResponse.props[key]);
      }
    }
    pageResponse.props = { ...page.get().props, ...pageResponse.props };
    if (this.shouldPreserveErrors(pageResponse)) {
      pageResponse.props.errors = page.get().props.errors;
    }
    if (page.get().scrollProps) {
      pageResponse.scrollProps = {
        ...page.get().scrollProps || {},
        ...pageResponse.scrollProps || {}
      };
    }
    if (page.hasOnceProps()) {
      pageResponse.onceProps = {
        ...page.get().onceProps || {},
        ...pageResponse.onceProps || {}
      };
    }
    if (this.requestParams.isDeferredPropsRequest()) {
      pageResponse.flash = { ...page.get().flash };
    }
    const currentOriginalDeferred = page.get().initialDeferredProps;
    if (currentOriginalDeferred && Object.keys(currentOriginalDeferred).length > 0) {
      pageResponse.initialDeferredProps = currentOriginalDeferred;
    }
    pageResponse.rescuedProps = this.mergeRescuedProps(pageResponse);
  }
  mergeRescuedProps(pageResponse) {
    const currentRescued = page.get().rescuedProps ?? [];
    const incomingRescued = pageResponse.rescuedProps ?? [];
    const newRescued = new Set(
      currentRescued.filter((prop) => !partialReloadRequestsProp(this.requestParams.all(), prop))
    );
    incomingRescued.forEach((prop) => newRescued.add(prop));
    return Array.from(newRescued);
  }
  /**
   * By default, the Laravel adapter shares validation errors via Inertia::always(),
   * so responses always include errors, even when empty. Components like
   * InfiniteScroll and WhenVisible, as well as loading deferred props,
   * perform async requests that should practically never reset errors.
   */
  shouldPreserveErrors(pageResponse) {
    if (!this.requestParams.all().preserveErrors) {
      return false;
    }
    const currentErrors = page.get().props.errors;
    if (!currentErrors || Object.keys(currentErrors).length === 0) {
      return false;
    }
    const responseErrors = pageResponse.props.errors;
    if (responseErrors && Object.keys(responseErrors).length > 0) {
      return false;
    }
    return true;
  }
  isObject(item) {
    return item && typeof item === "object" && !Array.isArray(item);
  }
  deepMergeObjects(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      const targetValue = target[key];
      const sourceValue = source[key];
      if (this.isObject(targetValue) && this.isObject(sourceValue)) {
        result[key] = this.deepMergeObjects(targetValue, sourceValue);
      } else {
        result[key] = sourceValue;
      }
    }
    return result;
  }
  mergeOrMatchItems(existingItems, newItems, matchProp, matchPropsOn, shouldAppend = true) {
    const items = Array.isArray(existingItems) ? existingItems : [];
    const matchingKey = matchPropsOn.find((key) => {
      const keyPath = key.split(".").slice(0, -1).join(".");
      return keyPath === matchProp;
    });
    if (!matchingKey) {
      return shouldAppend ? [...items, ...newItems] : [...newItems, ...items];
    }
    const uniqueProperty = matchingKey.split(".").pop() || "";
    const newItemsMap = /* @__PURE__ */ new Map();
    newItems.forEach((item) => {
      if (this.hasUniqueProperty(item, uniqueProperty)) {
        newItemsMap.set(item[uniqueProperty], item);
      }
    });
    return shouldAppend ? this.appendWithMatching(items, newItems, newItemsMap, uniqueProperty) : this.prependWithMatching(items, newItems, newItemsMap, uniqueProperty);
  }
  appendWithMatching(existingItems, newItems, newItemsMap, uniqueProperty) {
    const updatedExisting = existingItems.map((item) => {
      if (this.hasUniqueProperty(item, uniqueProperty) && newItemsMap.has(item[uniqueProperty])) {
        return newItemsMap.get(item[uniqueProperty]);
      }
      return item;
    });
    const newItemsToAdd = newItems.filter((item) => {
      if (!this.hasUniqueProperty(item, uniqueProperty)) {
        return true;
      }
      return !existingItems.some(
        (existing) => this.hasUniqueProperty(existing, uniqueProperty) && existing[uniqueProperty] === item[uniqueProperty]
      );
    });
    return [...updatedExisting, ...newItemsToAdd];
  }
  prependWithMatching(existingItems, newItems, newItemsMap, uniqueProperty) {
    const untouchedExisting = existingItems.filter((item) => {
      if (this.hasUniqueProperty(item, uniqueProperty)) {
        return !newItemsMap.has(item[uniqueProperty]);
      }
      return true;
    });
    return [...newItems, ...untouchedExisting];
  }
  hasUniqueProperty(item, property) {
    return item && typeof item === "object" && property in item;
  }
  async setRememberedState(pageResponse) {
    const rememberedState = await history.getState(history.rememberedState, {});
    if (this.requestParams.all().preserveState && rememberedState && pageResponse.component === page.get().component) {
      pageResponse.rememberedState = rememberedState;
    }
  }
  getScopedErrors(errors) {
    if (!this.requestParams.all().errorBag) {
      return errors;
    }
    return errors[this.requestParams.all().errorBag || ""] || {};
  }
};
var Request = class _Request {
  constructor(params, page2, { optimisticId = null } = {}) {
    this.page = page2;
    this.requestParams = RequestParams.create(params);
    this.cancelToken = new AbortController();
    this.optimisticId = optimisticId;
  }
  page;
  response;
  cancelToken;
  requestParams;
  requestHasFinished = false;
  optimisticId;
  static create(params, page2, options) {
    return new _Request(params, page2, options);
  }
  isPrefetch() {
    return this.requestParams.isPrefetch();
  }
  getUrl() {
    return this.requestParams.all().url;
  }
  isOptimistic() {
    return this.optimisticId !== null;
  }
  isPendingOptimistic() {
    return this.isOptimistic() && (!this.response || !this.response.isProcessed());
  }
  async send() {
    this.requestParams.onCancelToken(() => {
      if (this.response) {
        return;
      }
      this.cancel({ cancelled: true });
    });
    fireStartEvent(this.requestParams.all());
    this.requestParams.onStart();
    if (this.requestParams.all().prefetch) {
      this.requestParams.onPrefetching();
      firePrefetchingEvent(this.requestParams.all());
    }
    const originallyPrefetch = this.requestParams.all().prefetch;
    const config22 = {
      method: this.requestParams.all().method,
      url: urlWithoutHash(this.requestParams.all().url).href,
      data: this.requestParams.data(),
      signal: this.cancelToken.signal,
      headers: this.getHeaders(),
      onUploadProgress: this.onProgress.bind(this)
    };
    if (containsBigInt(config22.data)) {
      config22.data = stringifyJson(config22.data);
      config22.headers = { "Content-Type": "application/json", ...config22.headers };
    }
    const processedConfig = await interceptors.processRequest(this.requestParams.all(), config22);
    return http.getClient().request(processedConfig).then((response) => {
      this.response = Response.create(this.requestParams, response, this.page, this.optimisticId);
      return this.response.handle();
    }).catch((error) => {
      if (error instanceof HttpResponseError2) {
        this.response = Response.create(this.requestParams, error.response, this.page, this.optimisticId);
        return this.response.handle();
      }
      return Promise.reject(error);
    }).catch((error) => {
      if (error instanceof HttpCancelledError2) {
        return;
      }
      if (this.requestParams.all().onNetworkError(error) === false) {
        return;
      }
      if (fireNetworkErrorEvent(error)) {
        if (originallyPrefetch) {
          this.requestParams.onPrefetchError(error);
        }
        return Promise.reject(error);
      }
    }).finally(() => {
      this.finish();
      if (originallyPrefetch && this.response) {
        this.requestParams.onPrefetchResponse(this.response);
      }
    });
  }
  finish() {
    if (this.requestParams.wasCancelledAtAll()) {
      return;
    }
    this.requestParams.markAsFinished();
    this.fireFinishEvents();
  }
  fireFinishEvents() {
    if (this.requestHasFinished) {
      return;
    }
    this.requestHasFinished = true;
    fireFinishEvent(this.requestParams.all());
    this.requestParams.onFinish();
  }
  cancel({ cancelled = false, interrupted = false }) {
    if (this.requestHasFinished) {
      return;
    }
    this.cancelToken.abort();
    this.requestParams.markAsCancelled({ cancelled, interrupted });
    this.fireFinishEvents();
  }
  onProgress(progress3) {
    if (this.requestParams.data() instanceof FormData) {
      fireProgressEvent(progress3);
      this.requestParams.all().onProgress(progress3);
    }
  }
  getHeaders() {
    const headers = {
      ...this.requestParams.headers(),
      Accept: "text/html, application/xhtml+xml",
      "X-Requested-With": "XMLHttpRequest",
      "X-Inertia": true
    };
    const page2 = page.get();
    if (page2.version) {
      headers["X-Inertia-Version"] = page2.version;
    }
    const onceProps = Object.entries(page2.onceProps || {}).filter(([, onceProp]) => {
      if (get(page2.props, onceProp.prop) === void 0) {
        return false;
      }
      return !onceProp.expiresAt || onceProp.expiresAt > Date.now();
    }).map(([key]) => key);
    if (onceProps.length > 0) {
      headers["X-Inertia-Except-Once-Props"] = onceProps.join(",");
    }
    return headers;
  }
};
var RequestStream = class {
  requests = [];
  maxConcurrent;
  interruptible;
  constructor({ maxConcurrent, interruptible }) {
    this.maxConcurrent = maxConcurrent;
    this.interruptible = interruptible;
  }
  send(request2) {
    this.requests.push(request2);
    request2.send().finally(() => {
      this.requests = this.requests.filter((r) => r !== request2);
    });
  }
  interruptInFlight() {
    this.cancel({ interrupted: true }, false);
  }
  cancelInFlight(options = {}) {
    const shouldCancel = typeof options === "function" ? options : (request2) => {
      const { prefetch = true, optimistic = true } = options;
      return (prefetch || !request2.isPrefetch()) && (optimistic || !request2.isOptimistic());
    };
    this.requests.filter(shouldCancel).forEach((request2) => request2.cancel({ cancelled: true }));
  }
  cancel({ cancelled = false, interrupted = false } = {}, force = false) {
    if (!force && !this.shouldCancel()) {
      return;
    }
    const request2 = this.requests.shift();
    request2?.cancel({ cancelled, interrupted });
  }
  shouldCancel() {
    return this.interruptible && this.requests.length >= this.maxConcurrent;
  }
  hasPendingOptimistic() {
    return this.requests.some((request2) => request2.isPendingOptimistic());
  }
};
var noop2 = () => {
};
var Router = class {
  syncRequestStream = new RequestStream({
    maxConcurrent: 1,
    interruptible: true
  });
  asyncRequestStream = new RequestStream({
    maxConcurrent: Infinity,
    interruptible: false
  });
  clientVisitQueue = new Queue();
  pendingOptimisticCallback = void 0;
  init({
    initialPage,
    resolveComponent,
    swapComponent: swapComponent2,
    onFlash
  }) {
    page.init({
      initialPage,
      resolveComponent,
      swapComponent: swapComponent2,
      onFlash
    });
    InitialVisit.handle();
    eventHandler.init();
    eventHandler.on("missingHistoryItem", () => {
      if (typeof window !== "undefined") {
        this.visit(window.location.href, { preserveState: true, preserveScroll: true, replace: true });
      }
    });
    eventHandler.on("loadDeferredProps", (deferredProps) => {
      this.loadDeferredProps(deferredProps);
    });
    eventHandler.on("historyQuotaExceeded", (url) => {
      window.location.href = url;
    });
  }
  optimistic(callback) {
    this.pendingOptimisticCallback = callback;
    return this;
  }
  get(url, data = {}, options = {}) {
    return this.visit(url, { ...options, method: "get", data });
  }
  post(url, data = {}, options = {}) {
    return this.visit(url, { preserveState: true, ...options, method: "post", data });
  }
  put(url, data = {}, options = {}) {
    return this.visit(url, { preserveState: true, ...options, method: "put", data });
  }
  patch(url, data = {}, options = {}) {
    return this.visit(url, { preserveState: true, ...options, method: "patch", data });
  }
  delete(url, options = {}) {
    return this.visit(url, { preserveState: true, ...options, method: "delete" });
  }
  reload(options = {}) {
    return this.doReload(options);
  }
  doReload(options = {}) {
    if (typeof window === "undefined") {
      return;
    }
    return this.visit(window.location.href, {
      ...options,
      preserveScroll: true,
      preserveState: true,
      async: true,
      headers: {
        ...options.headers || {},
        "Cache-Control": "no-cache"
      }
    });
  }
  remember(data, key = "default") {
    history.remember(data, key);
  }
  restore(key = "default") {
    return history.restore(key);
  }
  on(type, callback) {
    if (typeof window === "undefined") {
      return () => {
      };
    }
    return eventHandler.onGlobalEvent(type, callback);
  }
  once(type, callback) {
    if (typeof window === "undefined") {
      return () => {
      };
    }
    const remove2 = this.on(type, (event) => {
      remove2();
      return callback(event);
    });
    return remove2;
  }
  hasPendingOptimistic() {
    return this.asyncRequestStream.hasPendingOptimistic();
  }
  get activePolls() {
    return polls.count;
  }
  cancelAll({ async = true, prefetch = true, sync = true } = {}) {
    if (async) {
      this.asyncRequestStream.cancelInFlight({ prefetch });
    }
    if (sync) {
      this.syncRequestStream.cancelInFlight();
    }
  }
  poll(interval, requestOptions = {}, options = {}) {
    return polls.add(
      interval,
      ({ onStart, onFinish }) => {
        const resolved = typeof requestOptions === "function" ? requestOptions() : requestOptions;
        this.doReload({
          poll: true,
          preserveErrors: true,
          ...resolved,
          onCancelToken: (token) => {
            onStart(token.cancel);
            resolved.onCancelToken?.(token);
          },
          onFinish: (visit) => {
            onFinish();
            resolved.onFinish?.(visit);
          }
        });
      },
      {
        autoStart: options.autoStart ?? true,
        background: options.background,
        keepAlive: options.keepAlive ?? false,
        mode: options.mode
      }
    );
  }
  visit(href, options = {}) {
    options.optimistic = options.optimistic ?? this.pendingOptimisticCallback;
    this.pendingOptimisticCallback = void 0;
    if (options.optimistic) {
      options.async = options.async ?? true;
    }
    const visit = this.getPendingVisit(href, {
      ...options,
      showProgress: options.showProgress ?? (!options.async || !!options.optimistic)
    });
    const events = this.getVisitEvents(options);
    if (events.onBefore(visit) === false || !fireBeforeEvent(visit)) {
      return;
    }
    const currentPageUrl = hrefToUrl(page.get().url);
    const isPartialReload = visit.only.length > 0 || visit.except.length > 0 || visit.reset.length > 0;
    const isSamePage = isPartialReload ? isSameUrlWithoutQueryOrHash(visit.url, currentPageUrl) : isSameUrlWithoutHash(visit.url, currentPageUrl);
    if (!isSamePage) {
      this.asyncRequestStream.cancelInFlight(
        (request2) => !request2.isPrefetch() && !request2.isOptimistic() && isSameUrlWithoutQueryOrHash(request2.getUrl(), currentPageUrl)
      );
    }
    if (!visit.async) {
      this.syncRequestStream.interruptInFlight();
    }
    let optimisticId = null;
    if (options.optimistic) {
      optimisticId = page.nextOptimisticId();
      this.applyOptimisticUpdate(options.optimistic, events, optimisticId);
    }
    if (!page.isCleared() && !visit.preserveUrl) {
      Scroll.save();
    }
    const requestParams = {
      ...visit,
      ...events
    };
    const sendRequest = () => {
      const prefetched = prefetchedRequests.get(requestParams);
      if (prefetched) {
        progress.reveal(prefetched.inFlight);
        prefetchedRequests.use(prefetched, requestParams);
      } else {
        progress.reveal(true);
        const requestStream = visit.async ? this.asyncRequestStream : this.syncRequestStream;
        requestStream.send(Request.create(requestParams, page.get(), { optimisticId }));
      }
    };
    if (Array.isArray(visit.component)) {
      console.error(
        `The "component" prop received an array of components (${visit.component.join(", ")}), but only a single component string is supported for instant visits. Pass an explicit component name instead.`
      );
      visit.component = null;
    }
    if (visit.component) {
      history.processQueue().then(() => {
        this.performInstantSwap(visit).then(() => {
          requestParams.preserveScroll = true;
          requestParams.preserveState = true;
          requestParams.replace = true;
          requestParams.viewTransition = false;
          sendRequest();
        });
      });
    } else {
      sendRequest();
    }
  }
  getCached(href, options = {}) {
    return prefetchedRequests.findCached(this.getPrefetchParams(href, options));
  }
  flush(href, options = {}) {
    prefetchedRequests.remove(this.getPrefetchParams(href, options));
  }
  flushAll() {
    prefetchedRequests.removeAll();
  }
  flushByCacheTags(tags) {
    prefetchedRequests.removeByTags(Array.isArray(tags) ? tags : [tags]);
  }
  getPrefetching(href, options = {}) {
    return prefetchedRequests.findInFlight(this.getPrefetchParams(href, options));
  }
  prefetch(href, options = {}, prefetchOptions = {}) {
    const method = options.method ?? (isUrlMethodPair(href) ? href.method : "get");
    if (method !== "get") {
      throw new Error("Prefetch requests must use the GET method");
    }
    const visit = this.getPendingVisit(href, {
      ...options,
      async: true,
      showProgress: false,
      prefetch: true,
      viewTransition: false
    });
    const visitUrl = visit.url.origin + visit.url.pathname + visit.url.search;
    const currentUrl = window.location.origin + window.location.pathname + window.location.search;
    if (visitUrl === currentUrl) {
      return;
    }
    const events = this.getVisitEvents(options);
    if (events.onBefore(visit) === false || !fireBeforeEvent(visit)) {
      return;
    }
    progress.hide();
    this.asyncRequestStream.interruptInFlight();
    const requestParams = {
      ...visit,
      ...events
    };
    const ensureCurrentPageIsSet = () => {
      return new Promise((resolve) => {
        const checkIfPageIsDefined = () => {
          if (page.get()) {
            resolve();
          } else {
            setTimeout(checkIfPageIsDefined, 50);
          }
        };
        checkIfPageIsDefined();
      });
    };
    ensureCurrentPageIsSet().then(() => {
      prefetchedRequests.add(
        requestParams,
        (params) => {
          this.asyncRequestStream.send(Request.create(params, page.get()));
        },
        {
          cacheFor: config.get("prefetch.cacheFor"),
          cacheTags: [],
          ...prefetchOptions
        }
      );
    });
  }
  clearHistory() {
    history.clear();
    prefetchedRequests.removeAll();
  }
  decryptHistory() {
    return history.decrypt();
  }
  resolveComponent(component, page2) {
    return page.resolve(component, page2);
  }
  replace(params) {
    this.clientVisit(params, { replace: true });
  }
  replaceProp(name, value, options) {
    this.replace({
      preserveScroll: true,
      preserveState: true,
      props(currentProps) {
        const newValue = typeof value === "function" ? value(get(currentProps, name), currentProps) : value;
        return setPathPreservingIdentity(currentProps, name, newValue);
      },
      ...options || {}
    });
  }
  appendToProp(name, value, options) {
    this.replaceProp(
      name,
      (currentValue, currentProps) => {
        const newValue = typeof value === "function" ? value(currentValue, currentProps) : value;
        if (!Array.isArray(currentValue)) {
          currentValue = currentValue !== void 0 ? [currentValue] : [];
        }
        return [...currentValue, newValue];
      },
      options
    );
  }
  prependToProp(name, value, options) {
    this.replaceProp(
      name,
      (currentValue, currentProps) => {
        const newValue = typeof value === "function" ? value(currentValue, currentProps) : value;
        if (!Array.isArray(currentValue)) {
          currentValue = currentValue !== void 0 ? [currentValue] : [];
        }
        return [newValue, ...currentValue];
      },
      options
    );
  }
  push(params) {
    this.clientVisit(params);
  }
  flash(keyOrData, value) {
    const current = page.get().flash;
    let flash;
    if (typeof keyOrData === "function") {
      flash = keyOrData(current);
    } else if (typeof keyOrData === "string") {
      flash = { ...current, [keyOrData]: value };
    } else if (keyOrData && Object.keys(keyOrData).length) {
      flash = { ...current, ...keyOrData };
    } else {
      return;
    }
    page.setFlash(flash);
    if (Object.keys(flash).length) {
      fireFlashEvent(flash);
    }
  }
  clientVisit(params, { replace = false } = {}) {
    this.clientVisitQueue.add(() => this.performClientVisit(params, { replace }));
  }
  performClientVisit(params, { replace = false } = {}) {
    const current = page.get();
    const onceProps = typeof params.props === "function" ? Object.fromEntries(
      Object.values(current.onceProps ?? {}).map((onceProp) => [
        onceProp.prop,
        get(current.props, onceProp.prop)
      ])
    ) : {};
    const props = typeof params.props === "function" ? params.props(current.props, onceProps) : params.props ?? current.props;
    const flash = typeof params.flash === "function" ? params.flash(current.flash) : params.flash;
    const { viewTransition, onError, onFinish, onFlash, onSuccess, ...pageParams } = params;
    const page2 = {
      ...current,
      ...pageParams,
      flash: flash ?? {},
      props
    };
    const preserveScroll = RequestParams.resolvePreserveOption(params.preserveScroll ?? false, page2);
    const preserveState = RequestParams.resolvePreserveOption(params.preserveState ?? false, page2);
    const visitId = this.createVisitId();
    return page.set(page2, {
      replace,
      preserveScroll,
      preserveState,
      viewTransition,
      visitId
    }).then(() => {
      fireClientVisitEvent(page.get(), { replace, visitId });
      const currentFlash = page.get().flash;
      if (Object.keys(currentFlash).length > 0) {
        fireFlashEvent(currentFlash);
        onFlash?.(currentFlash);
      }
      const errors = page.get().props.errors || {};
      if (Object.keys(errors).length === 0) {
        onSuccess?.(page.get());
        return;
      }
      const scopedErrors = params.errorBag ? errors[params.errorBag || ""] || {} : errors;
      onError?.(scopedErrors);
    }).finally(() => onFinish?.(params));
  }
  performInstantSwap(visit) {
    const current = page.get();
    const sharedProps = Object.fromEntries(
      (current.sharedProps ?? []).filter((key) => key in current.props).map((key) => [key, current.props[key]])
    );
    const resolvedPageProps = typeof visit.pageProps === "function" ? visit.pageProps(cloneDeep(current.props), cloneDeep(sharedProps)) : visit.pageProps;
    const intermediateProps = resolvedPageProps !== null ? { ...resolvedPageProps } : { ...sharedProps };
    const onceProps = this.preserveOncePropsOnInstantVisit(current, intermediateProps);
    const intermediatePage = {
      component: visit.component,
      url: visit.url.pathname + visit.url.search + visit.url.hash,
      version: current.version,
      props: {
        ...intermediateProps,
        errors: {}
      },
      flash: {},
      rescuedProps: [],
      clearHistory: false,
      encryptHistory: current.encryptHistory,
      sharedProps: current.sharedProps,
      onceProps,
      rememberedState: {}
    };
    return page.set(intermediatePage, {
      replace: visit.replace,
      preserveScroll: RequestParams.resolvePreserveOption(visit.preserveScroll, intermediatePage),
      preserveState: false,
      viewTransition: visit.viewTransition,
      visitId: visit.id
    });
  }
  /**
   * Once props are remembered client-side, so the placeholder page must preserve their values
   * and registry. Otherwise the swap discards the value, and an in-flight prefetch that already
   * claimed the prop resolves with nothing to restore it from.
   */
  preserveOncePropsOnInstantVisit(current, props) {
    const onceProps = {};
    Object.entries(current.onceProps ?? {}).forEach(([key, onceProp]) => {
      if (get(props, onceProp.prop) !== void 0) {
        return;
      }
      const currentValue = get(current.props, onceProp.prop);
      if (currentValue === void 0) {
        return;
      }
      set(props, onceProp.prop, currentValue);
      onceProps[key] = onceProp;
    });
    return onceProps;
  }
  getPrefetchParams(href, options) {
    return {
      ...this.getPendingVisit(href, {
        ...options,
        async: true,
        showProgress: false,
        prefetch: true,
        viewTransition: false
      }),
      ...this.getVisitEvents(options)
    };
  }
  createVisitId() {
    return uid();
  }
  getPendingVisit(href, options) {
    if (isUrlMethodPair(href)) {
      const urlMethodPair = href;
      href = urlMethodPair.url;
      options.method = options.method ?? urlMethodPair.method;
    }
    const defaultVisitOptionsCallback = config.get("visitOptions");
    const configuredOptions = defaultVisitOptionsCallback ? defaultVisitOptionsCallback(href.toString(), cloneDeep(options)) || {} : {};
    const mergedOptions = {
      method: "get",
      data: {},
      replace: false,
      preserveScroll: false,
      preserveState: false,
      only: [],
      except: [],
      headers: {},
      errorBag: "",
      forceFormData: false,
      queryStringArrayFormat: "brackets",
      async: false,
      showProgress: true,
      fresh: false,
      reset: [],
      preserveUrl: false,
      preserveErrors: false,
      prefetch: false,
      invalidateCacheTags: [],
      viewTransition: false,
      component: null,
      pageProps: null,
      cached: false,
      ...stripTopLevelUndefined(options),
      ...stripTopLevelUndefined(configuredOptions)
    };
    const [url, _data] = transformUrlAndData(
      href,
      mergedOptions.data,
      mergedOptions.method,
      mergedOptions.forceFormData,
      mergedOptions.queryStringArrayFormat
    );
    const visit = {
      id: this.createVisitId(),
      cancelled: false,
      completed: false,
      interrupted: false,
      ...mergedOptions,
      url,
      data: _data
    };
    if (visit.prefetch) {
      visit.headers["Purpose"] = "prefetch";
    }
    return visit;
  }
  getVisitEvents(options) {
    return {
      onCancelToken: options.onCancelToken || noop2,
      onBefore: options.onBefore || noop2,
      onBeforeUpdate: options.onBeforeUpdate || noop2,
      onStart: options.onStart || noop2,
      onProgress: options.onProgress || noop2,
      onFinish: options.onFinish || noop2,
      onCancel: options.onCancel || noop2,
      onSuccess: options.onSuccess || noop2,
      onError: options.onError || noop2,
      onHttpException: options.onHttpException || noop2,
      onNetworkError: options.onNetworkError || noop2,
      onFlash: options.onFlash || noop2,
      onPrefetched: options.onPrefetched || noop2,
      onPrefetching: options.onPrefetching || noop2
    };
  }
  applyOptimisticUpdate(optimistic, events, id) {
    const currentProps = page.get().props;
    const optimisticProps = optimistic(cloneDeep(currentProps));
    if (!optimisticProps) {
      return;
    }
    const changedKeys = [];
    for (const key of Object.keys(optimisticProps)) {
      if (!isEqual(currentProps[key], optimisticProps[key])) {
        changedKeys.push(key);
      }
    }
    if (changedKeys.length === 0) {
      return;
    }
    const component = page.get().component;
    for (const key of changedKeys) {
      page.setBaseline(key, cloneDeep(currentProps[key]));
    }
    page.registerOptimistic(id, optimistic);
    page.setPropsQuietly({ ...currentProps, ...optimisticProps });
    let shouldRestore = true;
    const originalOnSuccess = events.onSuccess;
    events.onSuccess = (page2) => {
      shouldRestore = false;
      page.markOptimisticConfirmed(id);
      return originalOnSuccess(page2);
    };
    const originalOnFinish = events.onFinish;
    events.onFinish = (visit) => {
      page.unregisterOptimistic(id);
      if (shouldRestore && page.get().component === component) {
        const replayedProps = page.replayOptimistics();
        if (Object.keys(replayedProps).length > 0) {
          page.setPropsQuietly({ ...page.get().props, ...replayedProps });
        }
      }
      if (page.pendingOptimisticCount() === 0) {
        page.clearOptimisticState();
      }
      return originalOnFinish(visit);
    };
  }
  loadDeferredProps(deferred) {
    if (deferred) {
      Object.values(deferred).forEach((props) => {
        this.doReload({ only: props, deferredProps: true, preserveErrors: true });
      });
    }
  }
};
var UseFormUtils = class {
  /**
   * Creates a callback that returns a UrlMethodPair.
   *
   * createWayfinderCallback(urlMethodPair)
   * createWayfinderCallback(method, url)
   * createWayfinderCallback(() => urlMethodPair)
   * createWayfinderCallback(() => method, () => url)
   */
  static createWayfinderCallback(...args) {
    return () => {
      if (args.length === 1) {
        return isUrlMethodPair(args[0]) ? args[0] : args[0]();
      }
      return {
        method: typeof args[0] === "function" ? args[0]() : args[0],
        url: typeof args[1] === "function" ? args[1]() : args[1]
      };
    };
  }
  /**
   * Parses all useForm() arguments into { rememberKey, data, precognitionEndpoint }.
   *
   * useForm()
   * useForm(data)
   * useForm(rememberKey, data)
   * useForm(method, url, data)
   * useForm(urlMethodPair, data)
   *
   */
  static parseUseFormArguments(...args) {
    if (args.length === 0) {
      return {
        rememberKey: null,
        data: {},
        precognitionEndpoint: null
      };
    }
    if (args.length === 1) {
      return {
        rememberKey: null,
        data: args[0],
        precognitionEndpoint: null
      };
    }
    if (args.length === 2) {
      if (typeof args[0] === "string") {
        return {
          rememberKey: args[0],
          data: args[1],
          precognitionEndpoint: null
        };
      }
      return {
        rememberKey: null,
        data: args[1],
        precognitionEndpoint: this.createWayfinderCallback(args[0])
      };
    }
    return {
      rememberKey: null,
      data: args[2],
      precognitionEndpoint: this.createWayfinderCallback(args[0], args[1])
    };
  }
  /**
   * Parses all submission arguments into { method, url, options }.
   * It uses the Precognition endpoint if no explicit method/url are provided.
   *
   * form.submit(method, url)
   * form.submit(method, url, options)
   * form.submit(urlMethodPair)
   * form.submit(urlMethodPair, options)
   * form.submit()
   * form.submit(options)
   */
  static parseSubmitArguments(args, precognitionEndpoint) {
    if (args.length === 3 || args.length === 2 && typeof args[0] === "string") {
      return { method: args[0], url: args[1], options: args[2] ?? {} };
    }
    if (isUrlMethodPair(args[0])) {
      return { ...args[0], options: args[1] ?? {} };
    }
    return { ...precognitionEndpoint(), options: args[0] ?? {} };
  }
  /**
   * Merges headers into the Precognition validate() arguments.
   */
  static mergeHeadersForValidation(field, config22, headers) {
    const merge2 = (config3) => {
      config3.headers = {
        ...headers ?? {},
        ...config3.headers ?? {}
      };
      return config3;
    };
    if (field && typeof field === "object" && !("target" in field)) {
      field = merge2(field);
    } else if (config22 && typeof config22 === "object") {
      config22 = merge2(config22);
    } else if (typeof field === "string") {
      config22 = merge2(config22 ?? {});
    } else {
      field = merge2(field ?? {});
    }
    return [field, config22];
  }
};
function undotKey(key) {
  if (!key.includes(".")) {
    return key;
  }
  const transformSegment = (segment) => {
    if (segment.startsWith("[") && segment.endsWith("]")) {
      return segment;
    }
    return segment.split(".").reduce((result, part, index) => index === 0 ? part : `${result}[${part}]`);
  };
  return key.replace(/\\\./g, "__ESCAPED_DOT__").split(/(\[[^\]]*\])/).filter(Boolean).map(transformSegment).join("").replace(/__ESCAPED_DOT__/g, ".");
}
function parseKey2(key) {
  const path = [];
  const pattern = /([^\[\]]+)|\[(\d*)\]/g;
  let match;
  while ((match = pattern.exec(key)) !== null) {
    if (match[1] !== void 0) {
      path.push(match[1]);
    } else if (match[2] !== void 0) {
      path.push(match[2] === "" ? "" : Number(match[2]));
    }
  }
  return path;
}
function setNestedObject(obj, path, value) {
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    if (!(path[i] in current)) {
      current[path[i]] = {};
    }
    current = current[path[i]];
  }
  current[path[path.length - 1]] = value;
}
function objectHasSequentialNumericKeys(value) {
  const keys = Object.keys(value);
  const numericKeys = keys.filter((k) => /^\d+$/.test(k)).map(Number).sort((a, b) => a - b);
  return keys.length === numericKeys.length && numericKeys.length > 0 && numericKeys[0] === 0 && numericKeys.every((n, i) => n === i);
}
function convertSequentialObjectsToArrays(value) {
  if (Array.isArray(value)) {
    return value.map(convertSequentialObjectsToArrays);
  }
  if (typeof value !== "object" || value === null || isFile2(value)) {
    return value;
  }
  if (objectHasSequentialNumericKeys(value)) {
    const result2 = [];
    for (let i = 0; i < Object.keys(value).length; i++) {
      result2[i] = convertSequentialObjectsToArrays(value[i]);
    }
    return result2;
  }
  const result = {};
  for (const key in value) {
    result[key] = convertSequentialObjectsToArrays(value[key]);
  }
  return result;
}
function formDataToObject(source) {
  const form = {};
  for (const [key, value] of source.entries()) {
    if (value instanceof File && value.size === 0 && value.name === "") {
      continue;
    }
    const path = parseKey2(undotKey(key));
    if (path[path.length - 1] === "") {
      const arrayPath = path.slice(0, -1);
      const existing = get(form, arrayPath);
      if (Array.isArray(existing)) {
        existing.push(value);
      } else if (existing && typeof existing === "object" && !isFile2(existing)) {
        const numericKeys = Object.keys(existing).filter((k) => /^\d+$/.test(k)).map(Number).sort((a, b) => a - b);
        set(form, arrayPath, numericKeys.length > 0 ? [...numericKeys.map((k) => existing[k]), value] : [value]);
      } else {
        set(form, arrayPath, [value]);
      }
      continue;
    }
    setNestedObject(form, path.map(String), value);
  }
  return convertSequentialObjectsToArrays(form);
}
var serverHeadProviderId = "server";
function ensureElementHasInertiaAttribute(element, index) {
  if (element.match(/\sdata-inertia(=|\s|>)/)) {
    return element;
  }
  return element.replace(/^<([a-zA-Z][^\s/>]*)/, `<$1 data-inertia="server-head-${index}"`);
}
function resolveServerHead(page2, serverHead) {
  if (!serverHead) {
    return [];
  }
  const elements = typeof serverHead === "function" ? serverHead(page2) : page2.props[serverHead === true ? "head" : serverHead];
  if (!Array.isArray(elements)) {
    return [];
  }
  return elements.map((element) => typeof element === "string" ? element.trim() : element).filter((element) => typeof element === "string" && element.length > 0).map(ensureElementHasInertiaAttribute);
}
var Renderer = {
  buildDOMElement(tag) {
    const template = document.createElement("template");
    template.innerHTML = tag;
    const node = template.content.firstChild;
    if (!tag.startsWith("<script ")) {
      return node;
    }
    const script = document.createElement("script");
    script.innerHTML = node.innerHTML;
    node.getAttributeNames().forEach((name) => {
      script.setAttribute(name, node.getAttribute(name) || "");
    });
    return script;
  },
  isInertiaManagedElement(element) {
    return element.nodeType === Node.ELEMENT_NODE && element.getAttribute("data-inertia") !== null;
  },
  findMatchingElementIndex(element, elements) {
    const key = element.getAttribute("data-inertia");
    if (key !== null) {
      return elements.findIndex((element2) => element2.getAttribute("data-inertia") === key);
    }
    return -1;
  },
  update: debounce3(function(elements) {
    const sourceElements = elements.map((element) => this.buildDOMElement(element));
    const targetElements = Array.from(document.head.childNodes).filter(
      (element) => this.isInertiaManagedElement(element)
    );
    if (sourceElements.some((element) => element instanceof HTMLTitleElement)) {
      document.head.querySelectorAll("title:not([data-inertia])").forEach((title) => title.remove());
    }
    targetElements.forEach((targetElement) => {
      const index = this.findMatchingElementIndex(targetElement, sourceElements);
      if (index === -1) {
        targetElement.remove();
        return;
      }
      const sourceElement = sourceElements.splice(index, 1)[0];
      if (sourceElement && !targetElement.isEqualNode(sourceElement)) {
        targetElement.replaceWith(sourceElement);
      }
    });
    sourceElements.forEach((element) => {
      document.head.appendChild(element);
    });
  }, 1)
};
function createHeadManager(isServer3, titleCallback, onUpdate, initialServerHead = []) {
  const states = initialServerHead.length ? { [serverHeadProviderId]: initialServerHead } : {};
  let lastProviderId = 0;
  function connect() {
    const id = lastProviderId += 1;
    states[id] = [];
    return id.toString();
  }
  function disconnect(id) {
    if (id === null || Object.keys(states).indexOf(id) === -1) {
      return;
    }
    delete states[id];
    commit();
  }
  function reconnect(id) {
    if (Object.keys(states).indexOf(id) === -1) {
      states[id] = [];
    }
  }
  function update(id, elements = []) {
    if (id !== null && Object.keys(states).indexOf(id) > -1) {
      states[id] = elements;
    }
    commit();
  }
  function updateServerHead(elements = []) {
    if (elements.length) {
      states[serverHeadProviderId] = elements;
    } else {
      delete states[serverHeadProviderId];
    }
    commit();
  }
  function collect() {
    const title = titleCallback("");
    const serverHead = states[serverHeadProviderId] || [];
    const providerHead = Object.keys(states).filter((id) => id !== serverHeadProviderId).flatMap((id) => states[id]);
    const defaults = {
      ...title ? { title: `<title data-inertia="">${title}</title>` } : {}
    };
    const elements = serverHead.concat(providerHead).reduce((carry, element) => {
      if (element.indexOf("<") === -1) {
        return carry;
      }
      if (element.indexOf("<title ") === 0) {
        const title2 = element.match(/(<title [^>]+>)(.*?)(<\/title>)/s);
        carry.title = title2 ? `${title2[1]}${titleCallback(title2[2])}${title2[3]}` : element;
        return carry;
      }
      const match = element.match(/ data-inertia=(["'])[^"']+\1/);
      if (match) {
        carry[match[0]] = element;
      } else {
        carry[Object.keys(carry).length] = element;
      }
      return carry;
    }, defaults);
    return Object.values(elements);
  }
  function commit() {
    isServer3 ? onUpdate(collect()) : Renderer.update(collect());
  }
  commit();
  return {
    forceUpdate: commit,
    updateServerHead,
    createProvider: function() {
      const id = connect();
      return {
        reconnect: () => reconnect(id),
        update: (elements) => update(id, elements),
        disconnect: () => disconnect(id)
      };
    }
  };
}
var MERGE_INTENT_HEADER = "X-Inertia-Infinite-Scroll-Merge-Intent";
var useInfiniteScrollData = (options) => {
  const getScrollPropFromCurrentPage = () => {
    const scrollProp = page.get().scrollProps?.[options.getPropName()];
    if (scrollProp) {
      return scrollProp;
    }
    throw new Error(`The page object does not contain a scroll prop named "${options.getPropName()}".`);
  };
  const state = {
    component: null,
    loading: false,
    previousPage: null,
    nextPage: null,
    lastLoadedPage: null,
    requestCount: 0
  };
  const resetState = () => {
    const scrollProp = getScrollPropFromCurrentPage();
    state.component = page.get().component;
    state.loading = false;
    state.previousPage = scrollProp.previousPage;
    state.nextPage = scrollProp.nextPage;
    state.lastLoadedPage = scrollProp.currentPage;
    state.requestCount = 0;
  };
  let cancelInFlightRequest = null;
  let flushed = false;
  const getRememberKey = () => `inertia:infinite-scroll-data:${options.getPropName()}`;
  if (typeof window !== "undefined") {
    resetState();
    const rememberedState = router.restore(getRememberKey());
    if (rememberedState && typeof rememberedState === "object" && rememberedState.lastLoadedPage === getScrollPropFromCurrentPage().currentPage) {
      state.previousPage = rememberedState.previousPage;
      state.nextPage = rememberedState.nextPage;
      state.lastLoadedPage = rememberedState.lastLoadedPage;
      state.requestCount = rememberedState.requestCount || 0;
    }
  }
  const removeEventListener = router.on("success", (event) => {
    if (state.component === event.detail.page.component && getScrollPropFromCurrentPage().reset) {
      resetState();
      options.onReset?.();
    }
  });
  const getScrollPropKeyForSide = (side) => {
    return side === "next" ? "nextPage" : "previousPage";
  };
  const findPageToLoad = (side) => {
    const pagePropName = getScrollPropKeyForSide(side);
    return state[pagePropName];
  };
  const syncStateOnSuccess = (side) => {
    const scrollProp = getScrollPropFromCurrentPage();
    const paginationProp = getScrollPropKeyForSide(side);
    state.lastLoadedPage = scrollProp.currentPage;
    state[paginationProp] = scrollProp[paginationProp];
    state.requestCount += 1;
    router.remember(
      {
        previousPage: state.previousPage,
        nextPage: state.nextPage,
        lastLoadedPage: state.lastLoadedPage,
        requestCount: state.requestCount
      },
      getRememberKey()
    );
  };
  const getPageName = () => getScrollPropFromCurrentPage().pageName;
  const getRequestCount = () => state.requestCount;
  const fetchPage = (side, reloadOptions = {}) => {
    const page2 = findPageToLoad(side);
    if (state.loading || page2 === null) {
      return;
    }
    state.loading = true;
    router.reload({
      preserveErrors: true,
      ...reloadOptions,
      data: { ...reloadOptions.data || {}, [getPageName()]: page2 },
      only: [...reloadOptions.only || [], options.getPropName()],
      preserveUrl: true,
      // we handle URL updates manually via useInfiniteScrollQueryString()
      headers: {
        [MERGE_INTENT_HEADER]: side === "previous" ? "prepend" : "append",
        ...reloadOptions.headers
      },
      onCancelToken: (cancelToken) => {
        cancelInFlightRequest = cancelToken.cancel;
        reloadOptions.onCancelToken?.(cancelToken);
      },
      onBefore: (visit) => {
        side === "next" ? options.onBeforeNextRequest() : options.onBeforePreviousRequest();
        reloadOptions.onBefore?.(visit);
      },
      onBeforeUpdate: (page3) => {
        options.onBeforeUpdate();
        reloadOptions.onBeforeUpdate?.(page3);
      },
      onSuccess: (page3) => {
        if (flushed) {
          return;
        }
        syncStateOnSuccess(side);
        reloadOptions.onSuccess?.(page3);
      },
      onFinish: (visit) => {
        state.loading = false;
        cancelInFlightRequest = null;
        if (!flushed) {
          const completed = visit.completed;
          const page3 = completed ? state.lastLoadedPage : null;
          side === "next" ? options.onCompleteNextRequest(page3, { page: page3, completed }) : options.onCompletePreviousRequest(page3, { page: page3, completed });
        }
        reloadOptions.onFinish?.(visit);
      }
    });
  };
  const getLastLoadedPage = () => state.lastLoadedPage;
  const hasPrevious = () => !!state.previousPage;
  const hasNext = () => !!state.nextPage;
  const fetchPrevious = (reloadOptions) => fetchPage("previous", reloadOptions);
  const fetchNext = (reloadOptions) => fetchPage("next", reloadOptions);
  const flush = () => {
    flushed = true;
    removeEventListener();
    cancelInFlightRequest?.();
  };
  return {
    getLastLoadedPage,
    getPageName,
    getRequestCount,
    hasPrevious,
    hasNext,
    fetchNext,
    fetchPrevious,
    removeEventListener,
    flush
  };
};
var useIntersectionObservers = () => {
  const intersectionObservers = [];
  const newIntersectionObserver = (callback, options = {}) => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          callback(entry);
        }
      }
    }, options);
    intersectionObservers.push(observer);
    return observer;
  };
  const flushAll = () => {
    intersectionObservers.forEach((observer) => observer.disconnect());
    intersectionObservers.length = 0;
  };
  return {
    new: newIntersectionObserver,
    flushAll
  };
};
var INFINITE_SCROLL_PAGE_KEY = "infiniteScrollPage";
var INFINITE_SCROLL_IGNORE_KEY = "infiniteScrollIgnore";
var getPageFromElement = (element) => element.dataset[INFINITE_SCROLL_PAGE_KEY];
var useInfiniteScrollElementManager = (options) => {
  const intersectionObservers = useIntersectionObservers();
  let itemsObserver;
  let startElementObserver;
  let endElementObserver;
  let itemsMutationObserver;
  let triggersEnabled = false;
  const setupObservers = () => {
    itemsMutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) {
            return;
          }
          addedElements.add(node);
        });
      });
      rememberElementsDebounced();
    });
    itemsMutationObserver.observe(options.getItemsElement(), { childList: true });
    itemsObserver = intersectionObservers.new(
      (entry) => options.onItemIntersected(entry.target)
    );
    const observerOptions = {
      root: options.getScrollableParent(),
      rootMargin: `${Math.max(1, options.getTriggerMargin())}px`
    };
    startElementObserver = intersectionObservers.new(options.onPreviousTriggered, observerOptions);
    endElementObserver = intersectionObservers.new(options.onNextTriggered, observerOptions);
  };
  const enableTriggers = () => {
    if (triggersEnabled) {
      disableTriggers();
    }
    const startElement = options.getStartElement();
    const endElement = options.getEndElement();
    if (startElement && options.shouldFetchPrevious()) {
      startElementObserver.observe(startElement);
    }
    if (endElement && options.shouldFetchNext()) {
      endElementObserver.observe(endElement);
    }
    triggersEnabled = true;
  };
  const disableTriggers = () => {
    if (!triggersEnabled) {
      return;
    }
    startElementObserver.disconnect();
    endElementObserver.disconnect();
    triggersEnabled = false;
  };
  const refreshTriggers = () => {
    if (triggersEnabled) {
      enableTriggers();
    }
  };
  const flushAll = () => {
    disableTriggers();
    intersectionObservers.flushAll();
    itemsMutationObserver?.disconnect();
    rememberElementsDebounced.cancel();
  };
  const addedElements = /* @__PURE__ */ new Set();
  const elementIsUntagged = (element) => !(INFINITE_SCROLL_PAGE_KEY in element.dataset) && !(INFINITE_SCROLL_IGNORE_KEY in element.dataset);
  const processManuallyAddedElements = () => {
    Array.from(addedElements).forEach((element) => {
      if (elementIsUntagged(element)) {
        element.dataset[INFINITE_SCROLL_IGNORE_KEY] = "true";
      }
      itemsObserver.observe(element);
    });
    addedElements.clear();
  };
  const findUntaggedElements = (containerElement) => {
    return Array.from(
      containerElement.querySelectorAll(
        `:scope > *:not([data-infinite-scroll-page]):not([data-infinite-scroll-ignore])`
      )
    );
  };
  let hasRestoredElements = false;
  const processServerLoadedElements = (loadedPage) => {
    if (!hasRestoredElements) {
      hasRestoredElements = true;
      if (restoreElements()) {
        return;
      }
    }
    findUntaggedElements(options.getItemsElement()).forEach((element) => {
      if (elementIsUntagged(element)) {
        element.dataset[INFINITE_SCROLL_PAGE_KEY] = loadedPage?.toString() || "1";
      }
      itemsObserver.observe(element);
    });
    rememberElements();
  };
  const getElementsRememberKey = () => `inertia:infinite-scroll-elements:${options.getPropName()}`;
  const rememberElements = () => {
    const pageElementRange = {};
    const childNodes = options.getItemsElement().childNodes;
    for (let index = 0; index < childNodes.length; index++) {
      const node = childNodes[index];
      if (node.nodeType !== Node.ELEMENT_NODE) {
        continue;
      }
      const page2 = getPageFromElement(node);
      if (typeof page2 === "undefined") {
        continue;
      }
      if (!(page2 in pageElementRange)) {
        pageElementRange[page2] = { from: index, to: index };
      } else {
        pageElementRange[page2].to = index;
      }
    }
    router.remember(pageElementRange, getElementsRememberKey());
  };
  const rememberElementsDebounced = debounce3(rememberElements, 250);
  const restoreElements = () => {
    const pageElementRange = router.restore(getElementsRememberKey());
    if (!pageElementRange || typeof pageElementRange !== "object") {
      return false;
    }
    const childNodes = options.getItemsElement().childNodes;
    for (let index = 0; index < childNodes.length; index++) {
      const node = childNodes[index];
      if (node.nodeType !== Node.ELEMENT_NODE) {
        continue;
      }
      const element = node;
      let elementPage;
      for (const [page2, range] of Object.entries(pageElementRange)) {
        if (index >= range.from && index <= range.to) {
          elementPage = page2;
          break;
        }
      }
      if (elementPage) {
        element.dataset[INFINITE_SCROLL_PAGE_KEY] = elementPage;
      } else if (!elementIsUntagged(element)) {
        continue;
      } else {
        element.dataset[INFINITE_SCROLL_IGNORE_KEY] = "true";
      }
      itemsObserver.observe(element);
    }
    return true;
  };
  return {
    setupObservers,
    enableTriggers,
    disableTriggers,
    refreshTriggers,
    flushAll,
    processManuallyAddedElements,
    processServerLoadedElements
  };
};
var queue3 = new Queue();
var initialUrl;
var payloadUrl;
var initialUrlWasAbsolute = null;
var useInfiniteScrollQueryString = (options) => {
  let enabled = true;
  const queuePageUpdate = (page2) => {
    queue3.add(() => {
      return new Promise((resolve) => {
        if (!enabled) {
          initialUrl = payloadUrl = null;
          return resolve();
        }
        if (!initialUrl || !payloadUrl) {
          const currentPageUrl = page.get().url;
          initialUrl = hrefToUrl(currentPageUrl);
          payloadUrl = hrefToUrl(currentPageUrl);
          initialUrlWasAbsolute = urlHasProtocol(currentPageUrl);
        }
        const pageName = options.getPageName();
        const searchParams = payloadUrl.searchParams;
        if (page2 === "1") {
          searchParams.delete(pageName);
        } else {
          searchParams.set(pageName, page2);
        }
        setTimeout(() => resolve());
      });
    }).finally(() => {
      if (enabled && initialUrl && payloadUrl && initialUrl.href !== payloadUrl.href && initialUrlWasAbsolute !== null) {
        router.replace({
          url: urlToString(payloadUrl, initialUrlWasAbsolute),
          preserveScroll: true,
          preserveState: true
        });
      }
      initialUrl = payloadUrl = initialUrlWasAbsolute = null;
    });
  };
  const onItemIntersected = debounce3((itemElement) => {
    const itemsElement = options.getItemsElement();
    if (!enabled || options.shouldPreserveUrl() || !itemElement || !itemsElement) {
      return;
    }
    const pageMap = /* @__PURE__ */ new Map();
    const elements = [...itemsElement.children];
    getElementsInViewportFromCollection(elements, itemElement).forEach((element) => {
      const page2 = getPageFromElement(element) ?? "1";
      if (pageMap.has(page2)) {
        pageMap.set(page2, pageMap.get(page2) + 1);
      } else {
        pageMap.set(page2, 1);
      }
    });
    const sortedPages = Array.from(pageMap.entries()).sort((a, b) => b[1] - a[1]);
    const mostVisiblePage = sortedPages[0]?.[0];
    if (mostVisiblePage !== void 0) {
      queuePageUpdate(mostVisiblePage);
    }
  }, 250);
  return {
    onItemIntersected,
    cancel: () => enabled = false
  };
};
var useInfiniteScrollPreservation = (options) => {
  const createCallbacks = () => {
    let currentScrollTop;
    let referenceElement = null;
    let referenceElementTop = 0;
    const captureScrollPosition = () => {
      const scrollableContainer = options.getScrollableParent();
      const itemsElement = options.getItemsElement();
      currentScrollTop = scrollableContainer?.scrollTop || window.scrollY;
      const visibleElements = getElementsInViewportFromCollection([...itemsElement.children]);
      if (visibleElements.length > 0) {
        referenceElement = visibleElements[0];
        const containerRect = scrollableContainer?.getBoundingClientRect() || { top: 0 };
        const containerTop = scrollableContainer ? containerRect.top : 0;
        const rect = referenceElement.getBoundingClientRect();
        referenceElementTop = rect.top - containerTop;
      }
    };
    const restoreScrollPosition = () => {
      if (!referenceElement) {
        return;
      }
      let attempts = 0;
      let restored = false;
      const restore = () => {
        attempts++;
        if (restored || attempts > 10) {
          return false;
        }
        const scrollableContainer = options.getScrollableParent();
        const containerRect = scrollableContainer?.getBoundingClientRect() || { top: 0 };
        const containerTop = scrollableContainer ? containerRect.top : 0;
        const newRect = referenceElement.getBoundingClientRect();
        const newElementTop = newRect.top - containerTop;
        const adjustment = newElementTop - referenceElementTop;
        if (adjustment === 0) {
          window.requestAnimationFrame(restore);
          return;
        }
        if (scrollableContainer) {
          scrollableContainer.scrollTo({ top: currentScrollTop + adjustment });
        } else {
          window.scrollTo(0, window.scrollY + adjustment);
        }
        restored = true;
      };
      window.requestAnimationFrame(restore);
    };
    return {
      captureScrollPosition,
      restoreScrollPosition
    };
  };
  return {
    createCallbacks
  };
};
function useInfiniteScroll(options) {
  const queryStringManager = useInfiniteScrollQueryString({ ...options, getPageName: () => dataManager.getPageName() });
  const scrollPreservation = useInfiniteScrollPreservation(options);
  const elementManager = useInfiniteScrollElementManager({
    ...options,
    // As items enter viewport, update URL to reflect the most visible page
    onItemIntersected: queryStringManager.onItemIntersected,
    onPreviousTriggered: () => dataManager.fetchPrevious(),
    onNextTriggered: () => dataManager.fetchNext()
  });
  const dataManager = useInfiniteScrollData({
    ...options,
    // Before updating page data, tag any manually added DOM elements
    // so they don't get confused with server-loaded content
    onBeforeUpdate: elementManager.processManuallyAddedElements,
    // After successful request, tag new server content
    onCompletePreviousRequest: (_, details) => {
      options.onCompletePreviousRequest(details);
      if (details.completed) {
        requestAnimationFrame(() => elementManager.processServerLoadedElements(details.page), 2);
      }
    },
    onCompleteNextRequest: (_, details) => {
      options.onCompleteNextRequest(details);
      if (details.completed) {
        requestAnimationFrame(() => elementManager.processServerLoadedElements(details.page), 2);
      }
    },
    onReset: options.onDataReset
  });
  const addScrollPreservationCallbacks = (reloadOptions) => {
    const { captureScrollPosition, restoreScrollPosition } = scrollPreservation.createCallbacks();
    const originalOnBeforeUpdate = reloadOptions.onBeforeUpdate || (() => {
    });
    const originalOnSuccess = reloadOptions.onSuccess || (() => {
    });
    reloadOptions.onBeforeUpdate = (page2) => {
      originalOnBeforeUpdate(page2);
      captureScrollPosition();
    };
    reloadOptions.onSuccess = (page2) => {
      originalOnSuccess(page2);
      restoreScrollPosition();
    };
    return reloadOptions;
  };
  const originalFetchNext = dataManager.fetchNext;
  dataManager.fetchNext = (reloadOptions = {}) => {
    reloadOptions = { ...options.getReloadOptions?.(), ...reloadOptions };
    if (options.inReverseMode()) {
      reloadOptions = addScrollPreservationCallbacks(reloadOptions);
    }
    originalFetchNext(reloadOptions);
  };
  const originalFetchPrevious = dataManager.fetchPrevious;
  dataManager.fetchPrevious = (reloadOptions = {}) => {
    reloadOptions = { ...options.getReloadOptions?.(), ...reloadOptions };
    if (!options.inReverseMode()) {
      reloadOptions = addScrollPreservationCallbacks(reloadOptions);
    }
    originalFetchPrevious(reloadOptions);
  };
  const removeEventListener = router.on("success", () => requestAnimationFrame(elementManager.refreshTriggers, 2));
  return {
    dataManager,
    elementManager,
    flush: () => {
      removeEventListener();
      dataManager.flush();
      elementManager.flushAll();
      queryStringManager.cancel();
    }
  };
}
function createLayoutPropsStore() {
  let shared = {};
  let named = {};
  let snapshot = { shared, named };
  const listeners = /* @__PURE__ */ new Set();
  let pendingNotify = false;
  const updateSnapshot = () => {
    snapshot = { shared, named };
  };
  const notify = () => {
    if (pendingNotify) {
      return;
    }
    pendingNotify = true;
    queueMicrotask(() => {
      pendingNotify = false;
      listeners.forEach((fn) => fn());
    });
  };
  return {
    set(props) {
      const merged = { ...shared, ...props };
      if (isEqual(shared, merged)) {
        return;
      }
      shared = merged;
      updateSnapshot();
      notify();
    },
    setFor(name, props) {
      const current = named[name] || {};
      const merged = { ...current, ...props };
      if (isEqual(current, merged)) {
        return;
      }
      named = { ...named, [name]: merged };
      updateSnapshot();
      notify();
    },
    reset() {
      shared = {};
      named = {};
      updateSnapshot();
      notify();
    },
    subscribe(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    get: () => snapshot
  };
}
function isPlainObject3(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function hasComponentKey(value) {
  return isPlainObject3(value) && "component" in value;
}
function hasComponentEntry(value, isComponent2) {
  return "component" in value && isComponent2(value.component);
}
function isNamedLayouts(value, isComponent2) {
  if (!isPlainObject3(value) || isComponent2(value) || hasComponentEntry(value, isComponent2)) {
    return false;
  }
  return Object.values(value).every(
    (v) => isComponent2(v) || Array.isArray(v) && isComponent2(v[0]) || hasComponentKey(v) && isComponent2(v.component)
  );
}
function isPropsObject(value, isComponent2) {
  return isPlainObject3(value) && !isComponent2(value) && !hasComponentEntry(value, isComponent2) && !isNamedLayouts(value, isComponent2);
}
function isPropsObjectOrCallback(value, isComponent2) {
  if (isPropsObject(value, isComponent2)) {
    return true;
  }
  if (!isPlainObject3(value) || isComponent2(value) || hasComponentEntry(value, isComponent2)) {
    return false;
  }
  const values = Object.values(value);
  return values.length > 0 && values.every((v) => typeof v === "function");
}
function isTuple(value, isComponent2) {
  return Array.isArray(value) && value.length === 2 && isComponent2(value[0]) && isPlainObject3(value[1]) && !isComponent2(value[1]);
}
function extract(item, isComponent2) {
  if (Array.isArray(item) && isComponent2(item[0])) {
    return { component: item[0], props: item[1] ?? {} };
  }
  if (hasComponentKey(item) && isComponent2(item.component)) {
    return { component: item.component, props: item.props ?? {} };
  }
  if (isComponent2(item)) {
    return { component: item, props: {} };
  }
  throw new Error(`Invalid layout definition: received ${typeof item}`);
}
function normalizeLayouts(layout, isComponent2, isRenderFunction2) {
  if (!layout || isRenderFunction2 && isRenderFunction2(layout)) {
    return [];
  }
  if (isNamedLayouts(layout, isComponent2)) {
    return Object.entries(layout).map(([name, value]) => ({ ...extract(value, isComponent2), name }));
  }
  if (isTuple(layout, isComponent2)) {
    return [{ component: layout[0], props: layout[1] ?? {} }];
  }
  if (Array.isArray(layout)) {
    return layout.map((item) => extract(item, isComponent2));
  }
  if (hasComponentKey(layout) && isComponent2(layout.component)) {
    return [{ component: layout.component, props: layout.props ?? {} }];
  }
  if (isComponent2(layout)) {
    return [{ component: layout, props: {} }];
  }
  return [];
}
function isContentEditableOrPrevented(event) {
  return event.target instanceof HTMLElement && event.target.isContentEditable || event.defaultPrevented;
}
function shouldIntercept(event) {
  const isLink = event.currentTarget.tagName.toLowerCase() === "a";
  const target = isLink ? event.currentTarget.target : "";
  return !(isContentEditableOrPrevented(event) || isLink && event.altKey || isLink && event.ctrlKey || isLink && event.metaKey || isLink && event.shiftKey || isLink && target !== "" && target !== "_self" || isLink && "button" in event && event.button !== 0);
}
function shouldNavigate(event) {
  const isButton = event.currentTarget.tagName.toLowerCase() === "button";
  return !isContentEditableOrPrevented(event) && (event.key === "Enter" || isButton && event.key === " ");
}
var baseComponentSelector = "nprogress";
var usePopover;
var progress2;
var settings = {
  minimum: 0.08,
  easing: "linear",
  speed: 200,
  trickle: true,
  trickleSpeed: 200,
  showSpinner: true,
  barSelector: '.bar, [role="bar"]',
  spinnerSelector: '.spinner, [role="spinner"]',
  parent: "body",
  color: "#29d",
  includeCSS: true,
  popover: null,
  template: [
    '<div class="bar">',
    '<div class="peg"></div>',
    "</div>",
    '<div class="spinner">',
    '<div class="spinner-icon"></div>',
    "</div>"
  ].join("")
};
var status = null;
var hidden = false;
var configure = (options) => {
  Object.assign(settings, options);
  usePopover = settings.popover ?? "popover" in HTMLElement.prototype;
  if (settings.includeCSS) {
    injectCSS(settings.color);
  }
  progress2 = document.createElement("div");
  progress2.id = baseComponentSelector;
  progress2.setAttribute("aria-hidden", "true");
  progress2.innerHTML = settings.template;
  if (usePopover) {
    progress2.popover = "manual";
  }
};
var set7 = (n) => {
  const started = isStarted();
  n = clamp(n, settings.minimum, 1);
  status = n === 1 ? null : n;
  const progress3 = render(!started);
  const bar = progress3.querySelector(settings.barSelector);
  const speed = settings.speed;
  const ease = settings.easing;
  progress3.offsetWidth;
  queue4((next) => {
    const barStyles = {
      transition: `all ${speed}ms ${ease}`,
      transform: `translate3d(${toBarPercentage(n)}%,0,0)`
    };
    for (const key in barStyles) {
      bar.style[key] = barStyles[key];
    }
    if (n !== 1) {
      return setTimeout(next, speed);
    }
    progress3.style.transition = "none";
    progress3.style.opacity = "1";
    progress3.offsetWidth;
    setTimeout(() => {
      progress3.style.transition = `all ${speed}ms linear`;
      progress3.style.opacity = "0";
      setTimeout(() => {
        remove();
        progress3.style.transition = "";
        progress3.style.opacity = "";
        next();
      }, speed);
    }, speed);
  });
};
var isStarted = () => typeof status === "number";
var start = () => {
  if (!status) {
    set7(0);
  }
  const work = function() {
    setTimeout(function() {
      if (!status) {
        return;
      }
      increaseByRandom();
      work();
    }, settings.trickleSpeed);
  };
  if (settings.trickle) {
    work();
  }
};
var done = (force) => {
  if (!force && !status) {
    return;
  }
  increaseByRandom(0.3 + 0.5 * Math.random());
  set7(1);
};
var increaseByRandom = (amount) => {
  const n = status;
  if (n === null) {
    return start();
  }
  if (n > 1) {
    return;
  }
  amount = typeof amount === "number" ? amount : (() => {
    const ranges = {
      0.1: [0, 0.2],
      0.04: [0.2, 0.5],
      0.02: [0.5, 0.8],
      5e-3: [0.8, 0.99]
    };
    for (const r in ranges) {
      if (n >= ranges[r][0] && n < ranges[r][1]) {
        return parseFloat(r);
      }
    }
    return 0;
  })();
  return set7(clamp(n + amount, 0, 0.994));
};
var render = (fromStart) => {
  if (isRendered()) {
    return document.getElementById(baseComponentSelector);
  }
  document.documentElement.classList.add(`${baseComponentSelector}-busy`);
  const bar = progress2.querySelector(settings.barSelector);
  const perc = fromStart ? "-100" : toBarPercentage(status || 0);
  bar.style.transition = "all 0 linear";
  bar.style.transform = `translate3d(${perc}%,0,0)`;
  if (!settings.showSpinner) {
    progress2.querySelector(settings.spinnerSelector)?.remove();
  }
  if (usePopover) {
    document.body.appendChild(progress2);
    if (!hidden) {
      progress2.showPopover();
    }
  } else {
    const parent = getParent();
    if (parent !== document.body) {
      parent.classList.add(`${baseComponentSelector}-custom-parent`);
    }
    parent.appendChild(progress2);
    if (hidden) {
      progress2.style.display = "none";
    }
  }
  return progress2;
};
var getParent = () => {
  return document.querySelector(settings.parent);
};
var remove = () => {
  document.documentElement.classList.remove(`${baseComponentSelector}-busy`);
  if (usePopover && progress2?.isConnected) {
    try {
      progress2.hidePopover();
    } catch {
    }
  }
  if (!usePopover) {
    getParent().classList.remove(`${baseComponentSelector}-custom-parent`);
  }
  progress2?.remove();
};
var isRendered = () => {
  return document.getElementById(baseComponentSelector) !== null;
};
function clamp(n, min, max) {
  if (n < min) {
    return min;
  }
  if (n > max) {
    return max;
  }
  return n;
}
var toBarPercentage = (n) => (-1 + n) * 100;
var queue4 = /* @__PURE__ */ (() => {
  const pending = [];
  const next = () => {
    const fn = pending.shift();
    if (fn) {
      fn(next);
    }
  };
  return (fn) => {
    pending.push(fn);
    if (pending.length === 1) {
      next();
    }
  };
})();
var injectCSS = (color) => {
  const element = document.createElement("style");
  const nonce = config.get("nonce");
  if (nonce) {
    element.nonce = nonce;
  }
  element.textContent = `
    #${baseComponentSelector} {
      pointer-events: none;
      background: none;
      border: none;
      margin: 0;
      padding: 0;
      overflow: visible;
      inset: unset;
      width: 100%;
      height: 0;
      position: fixed;
      top: 0;
      left: 0;
    }

    #${baseComponentSelector}::backdrop {
      display: none;
    }

    #${baseComponentSelector} .bar {
      background: ${color};

      position: fixed;
      z-index: 1031;
      top: 0;
      left: 0;

      width: 100%;
      height: 2px;
    }

    #${baseComponentSelector} .peg {
      display: block;
      position: absolute;
      right: 0px;
      width: 100px;
      height: 100%;
      box-shadow: 0 0 10px ${color}, 0 0 5px ${color};
      opacity: 1.0;

      transform: rotate(3deg) translate(0px, -4px);
    }

    #${baseComponentSelector} .spinner {
      display: block;
      position: fixed;
      z-index: 1031;
      top: 15px;
      right: 15px;
    }

    #${baseComponentSelector} .spinner-icon {
      width: 18px;
      height: 18px;
      box-sizing: border-box;

      border: solid 2px transparent;
      border-top-color: ${color};
      border-left-color: ${color};
      border-radius: 50%;

      animation: ${baseComponentSelector}-spinner 400ms linear infinite;
    }

    .${baseComponentSelector}-custom-parent {
      overflow: hidden;
      position: relative;
    }

    .${baseComponentSelector}-custom-parent #${baseComponentSelector} .spinner,
    .${baseComponentSelector}-custom-parent #${baseComponentSelector} .bar {
      position: absolute;
    }

    @keyframes ${baseComponentSelector}-spinner {
      0%   { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(element);
};
var show = () => {
  hidden = false;
  if (!progress2?.isConnected) {
    return;
  }
  if (usePopover) {
    try {
      progress2.showPopover();
    } catch {
    }
  } else {
    progress2.style.display = "";
  }
};
var hide = () => {
  hidden = true;
  if (!progress2?.isConnected) {
    return;
  }
  if (usePopover) {
    try {
      progress2.hidePopover();
    } catch {
    }
  } else {
    progress2.style.display = "none";
  }
};
var progress_component_default = {
  configure,
  isStarted,
  done,
  set: set7,
  remove,
  start,
  status,
  show,
  hide
};
var Progress = class {
  hideCount = 0;
  start() {
    progress_component_default.start();
  }
  reveal(force = false) {
    this.hideCount = Math.max(0, this.hideCount - 1);
    if (force || this.hideCount === 0) {
      progress_component_default.show();
    }
  }
  hide() {
    this.hideCount++;
    progress_component_default.hide();
  }
  set(status2) {
    progress_component_default.set(Math.max(0, Math.min(1, status2)));
  }
  finish() {
    progress_component_default.done();
  }
  reset() {
    progress_component_default.set(0);
  }
  remove() {
    progress_component_default.done();
    progress_component_default.remove();
  }
  isStarted() {
    return progress_component_default.isStarted();
  }
  getStatus() {
    return progress_component_default.status;
  }
};
var progress = new Progress();
var FormComponentResetSymbol = /* @__PURE__ */ Symbol("FormComponentReset");
function isFormElement(element) {
  return element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement;
}
function resetInputElement(input, defaultValues) {
  const oldValue = input.value;
  const oldChecked = input.checked;
  switch (input.type.toLowerCase()) {
    case "checkbox":
      input.checked = defaultValues.includes(input.value);
      break;
    case "radio":
      input.checked = defaultValues[0] === input.value;
      break;
    case "file":
      input.value = "";
      break;
    case "button":
    case "submit":
    case "reset":
    case "image":
      break;
    default:
      input.value = defaultValues[0] !== null && defaultValues[0] !== void 0 ? String(defaultValues[0]) : "";
  }
  return input.value !== oldValue || input.checked !== oldChecked;
}
function resetSelectElement(select, defaultValues) {
  const oldValue = select.value;
  const oldSelectedOptions = Array.from(select.selectedOptions).map((opt) => opt.value);
  if (select.multiple) {
    const defaultStrings = defaultValues.map((value) => String(value));
    Array.from(select.options).forEach((option) => {
      option.selected = defaultStrings.includes(option.value);
    });
  } else {
    select.value = defaultValues[0] !== void 0 ? String(defaultValues[0]) : "";
  }
  const newSelectedOptions = Array.from(select.selectedOptions).map((opt) => opt.value);
  const hasChanged = select.multiple ? JSON.stringify(oldSelectedOptions.sort()) !== JSON.stringify(newSelectedOptions.sort()) : select.value !== oldValue;
  return hasChanged;
}
function resetFormElement(element, defaultValues) {
  if (element.disabled) {
    if (element instanceof HTMLInputElement) {
      const oldValue = element.value;
      const oldChecked = element.checked;
      switch (element.type.toLowerCase()) {
        case "checkbox":
        case "radio":
          element.checked = element.defaultChecked;
          return element.checked !== oldChecked;
        case "file":
          element.value = "";
          return oldValue !== "";
        case "button":
        case "submit":
        case "reset":
        case "image":
          return false;
        default:
          element.value = element.defaultValue;
          return element.value !== oldValue;
      }
    } else if (element instanceof HTMLSelectElement) {
      const oldSelectedOptions = Array.from(element.selectedOptions).map((opt) => opt.value);
      Array.from(element.options).forEach((option) => {
        option.selected = option.defaultSelected;
      });
      const newSelectedOptions = Array.from(element.selectedOptions).map((opt) => opt.value);
      return JSON.stringify(oldSelectedOptions.sort()) !== JSON.stringify(newSelectedOptions.sort());
    } else if (element instanceof HTMLTextAreaElement) {
      const oldValue = element.value;
      element.value = element.defaultValue;
      return element.value !== oldValue;
    }
    return false;
  }
  if (element instanceof HTMLInputElement) {
    return resetInputElement(element, defaultValues);
  } else if (element instanceof HTMLSelectElement) {
    return resetSelectElement(element, defaultValues);
  } else if (element instanceof HTMLTextAreaElement) {
    const oldValue = element.value;
    element.value = defaultValues[0] !== void 0 ? String(defaultValues[0]) : "";
    return element.value !== oldValue;
  }
  return false;
}
function resetFieldElements(elements, defaultValues) {
  let hasChanged = false;
  if (elements instanceof RadioNodeList || elements instanceof HTMLCollection) {
    Array.from(elements).forEach((node, index) => {
      if (node instanceof Element && isFormElement(node)) {
        if (node instanceof HTMLInputElement && ["checkbox", "radio"].includes(node.type.toLowerCase())) {
          if (resetFormElement(node, defaultValues)) {
            hasChanged = true;
          }
        } else {
          const indexedDefaultValues = defaultValues[index] !== void 0 ? [defaultValues[index]] : [defaultValues[0] ?? null].filter(Boolean);
          if (resetFormElement(node, indexedDefaultValues)) {
            hasChanged = true;
          }
        }
      }
    });
  } else if (isFormElement(elements)) {
    hasChanged = resetFormElement(elements, defaultValues);
  }
  return hasChanged;
}
function resetFormFields(formElement, defaults, fieldNames) {
  if (!formElement) {
    return;
  }
  const resetEntireForm = !fieldNames || fieldNames.length === 0;
  if (resetEntireForm) {
    const formData = new FormData(formElement);
    const formElementNames = Array.from(formElement.elements).map((el) => isFormElement(el) ? el.name : "").filter(Boolean);
    fieldNames = [.../* @__PURE__ */ new Set([...defaults.keys(), ...formData.keys(), ...formElementNames])];
  }
  let hasChanged = false;
  fieldNames.forEach((fieldName) => {
    const elements = formElement.elements.namedItem(fieldName);
    if (elements) {
      if (resetFieldElements(elements, defaults.getAll(fieldName))) {
        hasChanged = true;
      }
    }
  });
  if (hasChanged && resetEntireForm) {
    formElement.dispatchEvent(
      new CustomEvent("reset", { bubbles: true, cancelable: true, detail: { [FormComponentResetSymbol]: true } })
    );
  }
}
var router = new Router();

// node_modules/@inertiajs/react/dist/index.js
import {
  createElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore
} from "react";
import { flushSync } from "react-dom";
import { createContext } from "react";
import { createContext as createContext2 } from "react";
import { createElement as createElement2, StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { useEffect as useEffect2, useMemo as useMemo2, useRef as useRef2, useState as useState2 } from "react";
import { use } from "react";
import React, {
  createContext as createContext3,
  createElement as createElement3,
  forwardRef,
  use as use2,
  useEffect as useEffect5,
  useImperativeHandle,
  useMemo as useMemo4,
  useRef as useRef5,
  useState as useState5
} from "react";
import { useCallback as useCallback2, useMemo as useMemo3, useRef as useRef4 } from "react";
import { useCallback, useEffect as useEffect3, useRef as useRef3, useState as useState3 } from "react";
import { useEffect as useEffect4, useState as useState4 } from "react";
import React2, { use as use3, useEffect as useEffect6, useMemo as useMemo5 } from "react";
import React3, {
  createElement as createElement4,
  forwardRef as forwardRef2,
  useCallback as useCallback3,
  useEffect as useEffect7,
  useImperativeHandle as useImperativeHandle2,
  useMemo as useMemo6,
  useRef as useRef6,
  useState as useState6
} from "react";
import { flushSync as flushSync2 } from "react-dom";
import { createElement as createElement5, forwardRef as forwardRef3, useEffect as useEffect8, useMemo as useMemo7, useRef as useRef7, useState as useState7 } from "react";
import { useCallback as useCallback4, useMemo as useMemo8, useRef as useRef8, useState as useState8 } from "react";
import { useCallback as useCallback5, useEffect as useEffect9, useRef as useRef9, useState as useState9 } from "react";
import { useEffect as useEffect10, useState as useState10 } from "react";
import { useSyncExternalStore as useSyncExternalStore2 } from "react";
import { createElement as createElement6, useCallback as useCallback6, useEffect as useEffect11, useMemo as useMemo9, useRef as useRef10, useState as useState11 } from "react";
var headContext = createContext(null);
headContext.displayName = "InertiaHeadContext";
var HeadContext_default = headContext;
var store = createLayoutPropsStore();
function resetLayoutProps() {
  store.reset();
}
var pageContext = createContext2(null);
pageContext.displayName = "InertiaPageContext";
var PageContext_default = pageContext;
function isComponent(value) {
  return typeof value === "function" || typeof value === "object" && value !== null && "$$typeof" in value;
}
function isRenderFunction(value) {
  if (typeof value !== "function") {
    return false;
  }
  const fn = value;
  return fn.length === 1 && typeof fn.prototype === "undefined";
}
function isLayoutResolver(value) {
  return typeof value === "function" && value.length <= 1 && typeof value.prototype === "undefined";
}
var pendingInitialSwap = null;
var routerIsInitialized = false;
var swapComponent = async (args) => {
  pendingInitialSwap = args;
};
var emptySnapshot = {
  shared: {},
  named: {}
};
function App({
  children,
  initialPage,
  initialComponent,
  resolveComponent,
  titleCallback,
  onHeadUpdate,
  defaultLayout,
  serverHead
}) {
  const [current, setCurrent] = useState({
    component: initialComponent || null,
    page: { ...initialPage, flash: initialPage.flash ?? {} },
    key: null
  });
  const pageRef = useRef(current.page);
  pageRef.current = current.page;
  const headManager = useMemo(() => {
    return createHeadManager(
      typeof window === "undefined",
      (title) => titleCallback ? titleCallback(title, pageRef.current) : title,
      onHeadUpdate || (() => {
      }),
      resolveServerHead(initialPage, serverHead)
    );
  }, []);
  const dynamicLayoutProps = useSyncExternalStore(store.subscribe, store.get, () => emptySnapshot);
  if (!routerIsInitialized) {
    router.init({
      initialPage,
      resolveComponent,
      swapComponent: async (args) => swapComponent(args),
      onFlash: (flash) => {
        setCurrent((current2) => ({
          ...current2,
          page: { ...current2.page, flash }
        }));
      }
    });
    routerIsInitialized = true;
  }
  useEffect(() => {
    swapComponent = async ({ component, page: page2, preserveState, initialRender }) => {
      if (initialRender) {
        return;
      }
      if (!preserveState) {
        resetLayoutProps();
      }
      flushSync(
        () => setCurrent((current2) => ({
          component,
          page: page2,
          key: preserveState ? current2.key : Date.now()
        }))
      );
    };
    if (pendingInitialSwap) {
      const pending = pendingInitialSwap;
      pendingInitialSwap = null;
      swapComponent(pending);
    }
    const syncServerHead = (event) => {
      headManager.updateServerHead(resolveServerHead(event.detail.page, serverHead));
    };
    const removeNavigateListener = router.on("navigate", syncServerHead);
    const removeClientVisitListener = router.on("clientVisit", syncServerHead);
    return () => {
      removeNavigateListener();
      removeClientVisitListener();
    };
  }, []);
  if (!current.component) {
    return createElement(
      HeadContext_default.Provider,
      { value: headManager },
      createElement(PageContext_default.Provider, { value: current.page }, null)
    );
  }
  const renderChildren = children || (({ Component, props, key }) => {
    const child = createElement(Component, { key, ...props });
    let effectiveLayout;
    let callbackProps = null;
    const layoutValue = Component.layout;
    if (isLayoutResolver(layoutValue)) {
      const result = layoutValue(props);
      if (isValidElement(result)) {
        return layoutValue(child);
      }
      if (isPropsObjectOrCallback(result, isComponent)) {
        effectiveLayout = defaultLayout?.(current.page.component, current.page);
        callbackProps = result;
      } else {
        effectiveLayout = result;
      }
    } else if (isPropsObject(layoutValue, isComponent)) {
      effectiveLayout = defaultLayout?.(current.page.component, current.page);
      callbackProps = layoutValue;
    } else {
      effectiveLayout = layoutValue ?? defaultLayout?.(current.page.component, current.page);
    }
    let layouts = normalizeLayouts(
      effectiveLayout,
      isComponent,
      layoutValue && !callbackProps ? isRenderFunction : void 0
    );
    if (callbackProps) {
      layouts = layouts.map((l) => ({ ...l, props: { ...l.props, ...callbackProps } }));
    }
    if (layouts.length > 0) {
      return layouts.reduceRight((childNode, layout) => {
        return createElement(
          layout.component,
          {
            ...props,
            ...layout.props,
            ...dynamicLayoutProps.shared,
            ...layout.name ? dynamicLayoutProps.named[layout.name] || {} : {}
          },
          childNode
        );
      }, child);
    }
    return child;
  });
  return createElement(
    HeadContext_default.Provider,
    { value: headManager },
    createElement(
      PageContext_default.Provider,
      { value: current.page },
      renderChildren({
        Component: current.component,
        key: current.key,
        props: current.page.props
      })
    )
  );
}
App.displayName = "Inertia";
function usePage() {
  const page2 = use(PageContext_default);
  if (!page2) {
    throw new Error("usePage must be used within the Inertia component");
  }
  return page2;
}
var Deferred = ({ children, data, rescue, fallback }) => {
  if (!data) {
    throw new Error("`<Deferred>` requires a `data` prop to be a string or array of strings");
  }
  if (!fallback) {
    throw new Error("`<Deferred>` requires a `fallback` prop");
  }
  const [reloading, setReloading] = useState2(false);
  const activeReloads = useRef2(/* @__PURE__ */ new Set());
  const page2 = usePage();
  const pageProps = page2.props;
  const keys = useMemo2(() => Array.isArray(data) ? data : [data], [data]);
  const rescuedKeys = useMemo2(() => new Set(page2.rescuedProps), [page2.rescuedProps]);
  useEffect2(() => {
    const removeStartListener = router.on("start", (e) => {
      const visit = e.detail.visit;
      if (visit.preserveState === true && isSameUrlWithoutQueryOrHash(visit.url, window.location) && partialReloadRequestsSomeProps(visit, keys)) {
        activeReloads.current.add(visit);
        setReloading(true);
      }
    });
    const removeFinishListener = router.on("finish", (e) => {
      const visit = e.detail.visit;
      if (activeReloads.current.has(visit)) {
        activeReloads.current.delete(visit);
        setReloading(activeReloads.current.size > 0);
      }
    });
    return () => {
      removeStartListener();
      removeFinishListener();
      activeReloads.current.clear();
    };
  }, [keys]);
  const propsAreDefined = useMemo2(() => keys.every((key) => get(pageProps, key) !== void 0), [keys, pageProps]);
  const hasRescuedProps = useMemo2(() => keys.some((key) => rescuedKeys.has(key)), [keys, rescuedKeys]);
  if (propsAreDefined && !hasRescuedProps) {
    if (typeof children === "function") {
      return children({ reloading });
    }
    return children;
  }
  if (hasRescuedProps && rescue) {
    return typeof rescue === "function" ? rescue({ reloading }) : rescue;
  }
  return typeof fallback === "function" ? fallback() : fallback;
};
Deferred.displayName = "InertiaDeferred";
function useFormState(options) {
  const { data: dataOption, useDataState, useErrorsState } = options;
  const isDataFunction = typeof dataOption === "function";
  const resolveData = () => isDataFunction ? dataOption() : dataOption;
  const initialData = cloneDeep(resolveData());
  const isMounted = useRef3(false);
  const precognitionEndpointRef = useRef3(options.precognitionEndpoint ?? null);
  const [defaults, setDefaultsState] = useState3(cloneDeep(initialData));
  const [data, setData] = useDataState ? useDataState() : useState3(cloneDeep(initialData));
  const [errors, setErrors] = useErrorsState ? useErrorsState() : useState3({});
  const [processing, setProcessing] = useState3(false);
  const [progress22, setProgress] = useState3(null);
  const [wasSuccessful, setWasSuccessful] = useState3(false);
  const [recentlySuccessful, setRecentlySuccessful] = useState3(false);
  const recentlySuccessfulTimeoutId = useRef3(void 0);
  const transformRef = useRef3((data2) => data2);
  const defaultsCalledInOnSuccessRef = useRef3(false);
  const validatorRef = useRef3(null);
  const [validating, setValidating] = useState3(false);
  const [touchedFields, setTouchedFields] = useState3([]);
  const [validFields, setValidFields] = useState3([]);
  const withAllErrorsRef = useRef3(null);
  const withAllErrorsEnabled = () => withAllErrorsRef.current ?? config2.get("form.withAllErrors");
  const dataRef = useRef3(data);
  useEffect3(() => {
    dataRef.current = data;
  });
  useEffect3(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  const commitData = useCallback(
    (next) => {
      dataRef.current = next;
      setData(next);
    },
    [setData]
  );
  const setDataFunction = useCallback(
    (keyOrData, maybeValue) => {
      if (typeof keyOrData === "string") {
        commitData(set(cloneDeep(dataRef.current), keyOrData, maybeValue));
      } else if (typeof keyOrData === "function") {
        commitData(keyOrData(dataRef.current));
      } else {
        commitData(keyOrData);
      }
    },
    [commitData]
  );
  const setDefaultsFunction = useCallback(
    (fieldOrFields, maybeValue) => {
      if (isDataFunction) {
        throw new Error("You cannot call `defaults()` when using a function to define your form data.");
      }
      defaultsCalledInOnSuccessRef.current = true;
      let newDefaults = {};
      if (typeof fieldOrFields === "undefined") {
        newDefaults = { ...dataRef.current };
        setDefaultsState(dataRef.current);
      } else {
        setDefaultsState((defaults2) => {
          newDefaults = typeof fieldOrFields === "string" ? set(cloneDeep(defaults2), fieldOrFields, maybeValue) : Object.assign(cloneDeep(defaults2), fieldOrFields);
          return newDefaults;
        });
      }
      validatorRef.current?.defaults(newDefaults);
    },
    [setDefaultsState]
  );
  const reset = useCallback(
    (...fields) => {
      const resolvedData = isDataFunction ? cloneDeep(resolveData()) : defaults;
      const clonedData = cloneDeep(resolvedData);
      if (fields.length === 0) {
        if (isDataFunction) {
          setDefaultsState(clonedData);
        }
        commitData(clonedData);
      } else {
        if (isDataFunction) {
          setDefaultsState((currentDefaults) => {
            const newDefaults = cloneDeep(currentDefaults);
            fields.filter((key) => has(clonedData, key)).forEach((key) => {
              set(newDefaults, key, get(clonedData, key));
            });
            return newDefaults;
          });
        }
        const next = fields.filter((key) => has(clonedData, key)).reduce(
          (carry, key) => {
            return set(carry, key, get(clonedData, key));
          },
          { ...dataRef.current }
        );
        commitData(next);
      }
      validatorRef.current?.reset(...fields);
    },
    [commitData, defaults]
  );
  const setError = useCallback(
    (fieldOrFields, maybeValue) => {
      setErrors((errors2) => {
        const newErrors = {
          ...errors2,
          ...typeof fieldOrFields === "string" ? { [fieldOrFields]: maybeValue } : fieldOrFields
        };
        validatorRef.current?.setErrors(newErrors);
        return newErrors;
      });
    },
    [setErrors]
  );
  const clearErrors = useCallback(
    (...fields) => {
      setErrors((errors2) => {
        const newErrors = Object.keys(errors2).reduce(
          (carry, field) => ({
            ...carry,
            ...fields.length > 0 && !fields.includes(field) ? { [field]: errors2[field] } : {}
          }),
          {}
        );
        if (validatorRef.current) {
          if (fields.length === 0) {
            validatorRef.current.setErrors({});
          } else {
            fields.forEach(validatorRef.current.forgetError);
          }
        }
        return newErrors;
      });
    },
    [setErrors]
  );
  const resetAndClearErrors = useCallback(
    (...fields) => {
      reset(...fields);
      clearErrors(...fields);
    },
    [reset, clearErrors]
  );
  const markAsSuccessful = useCallback(() => {
    clearErrors();
    setWasSuccessful(true);
    setRecentlySuccessful(true);
    recentlySuccessfulTimeoutId.current = window.setTimeout(() => {
      if (isMounted.current) {
        setRecentlySuccessful(false);
      }
    }, config2.get("form.recentlySuccessfulDuration"));
  }, [clearErrors, setWasSuccessful, setRecentlySuccessful]);
  const resetBeforeSubmit = useCallback(() => {
    setWasSuccessful(false);
    setRecentlySuccessful(false);
    clearTimeout(recentlySuccessfulTimeoutId.current);
  }, [setWasSuccessful, setRecentlySuccessful]);
  const finishProcessing = useCallback(() => {
    setProcessing(false);
    setProgress(null);
  }, [setProcessing, setProgress]);
  const transformFunction = useCallback((callback) => {
    transformRef.current = callback;
  }, []);
  const tap = (value, callback) => {
    callback(value);
    return value;
  };
  const valid = useCallback(
    (field) => validFields.includes(field),
    [validFields]
  );
  const invalid = useCallback((field) => field in errors, [errors]);
  const touched = useCallback(
    (field) => typeof field === "string" ? touchedFields.includes(field) : touchedFields.length > 0,
    [touchedFields]
  );
  const form = {
    data,
    isDirty: !isEqual(data, defaults),
    errors,
    hasErrors: Object.keys(errors).length > 0,
    processing,
    progress: progress22,
    wasSuccessful,
    recentlySuccessful,
    setData: setDataFunction,
    transform: transformFunction,
    setDefaults: setDefaultsFunction,
    reset,
    setError,
    clearErrors,
    resetAndClearErrors
  };
  const validate = (field, config3) => {
    if (typeof field === "object" && !("target" in field)) {
      config3 = field;
      field = void 0;
    }
    if (field === void 0) {
      validatorRef.current.validate(config3);
    } else {
      const fieldName = resolveName(field);
      const transformedData = transformRef.current(dataRef.current);
      validatorRef.current.validate(fieldName, get(transformedData, fieldName), config3);
    }
    return form;
  };
  const withPrecognition = (...args) => {
    precognitionEndpointRef.current = UseFormUtils.createWayfinderCallback(...args);
    if (!validatorRef.current) {
      const validator = createValidator(
        (client2) => {
          const { method, url } = precognitionEndpointRef.current();
          const currentData = dataRef.current;
          const transformedData = transformRef.current(currentData);
          return client2[method](url, transformedData);
        },
        cloneDeep(defaults)
      );
      validatorRef.current = validator;
      validator.on("validatingChanged", () => {
        setValidating(validator.validating());
      }).on("validatedChanged", () => {
        setValidFields(validator.valid());
      }).on("touchedChanged", () => {
        setTouchedFields(validator.touched());
      }).on("errorsChanged", () => {
        const validationErrors = withAllErrorsEnabled() ? validator.errors() : toSimpleValidationErrors(validator.errors());
        setErrors(validationErrors);
        setValidFields(validator.valid());
      });
    }
    const precognitiveForm = Object.assign(form, {
      validating,
      validator: () => validatorRef.current,
      valid,
      invalid,
      touched,
      withoutFileValidation: () => tap(precognitiveForm, () => validatorRef.current?.withoutFileValidation()),
      touch: (field, ...fields) => {
        if (Array.isArray(field)) {
          validatorRef.current?.touch(field);
        } else if (typeof field === "string") {
          validatorRef.current?.touch([field, ...fields]);
        } else {
          validatorRef.current?.touch(field);
        }
        return precognitiveForm;
      },
      withAllErrors: () => tap(precognitiveForm, () => withAllErrorsRef.current = true),
      setValidationTimeout: (duration) => tap(precognitiveForm, () => validatorRef.current?.setTimeout(duration)),
      validateFiles: () => tap(precognitiveForm, () => validatorRef.current?.validateFiles()),
      validate,
      setErrors: (errors2) => tap(precognitiveForm, () => form.setError(errors2)),
      forgetError: (field) => tap(
        precognitiveForm,
        () => form.clearErrors(resolveName(field))
      )
    });
    return precognitiveForm;
  };
  form.withPrecognition = withPrecognition;
  if (precognitionEndpointRef.current) {
    form.withPrecognition(precognitionEndpointRef.current);
  }
  return {
    form,
    setDefaultsState,
    transformRef,
    precognitionEndpointRef,
    dataRef,
    isMounted,
    setProcessing,
    setProgress,
    markAsSuccessful,
    clearErrors,
    setError,
    defaultsCalledInOnSuccessRef,
    resetBeforeSubmit,
    finishProcessing,
    withAllErrors: {
      enabled: withAllErrorsEnabled,
      enable: () => {
        withAllErrorsRef.current = true;
      }
    }
  };
}
function useRemember(initialState, key, excludeKeysRef) {
  const [state, setState] = useState4(() => {
    const restored = router.restore(key);
    return restored !== void 0 ? restored : initialState;
  });
  useEffect4(() => {
    const keys = excludeKeysRef?.current;
    if (keys && keys.length > 0 && typeof state === "object" && state !== null) {
      const filtered = { ...state };
      keys.forEach((k) => delete filtered[k]);
      router.remember(filtered, key);
    } else {
      router.remember(state, key);
    }
  }, [state, key]);
  return [state, setState];
}
function useForm(...args) {
  const { rememberKey, data, precognitionEndpoint } = UseFormUtils.parseUseFormArguments(...args);
  const initialDefaults = typeof data === "function" ? cloneDeep(data()) : cloneDeep(data);
  const cancelToken = useRef4(null);
  const excludeKeysRef = useRef4([]);
  const pendingOptimisticRef = useRef4(null);
  const useDataState = rememberKey ? () => useRemember(initialDefaults, `${rememberKey}:data`, excludeKeysRef) : void 0;
  const useErrorsState = rememberKey ? () => useRemember({}, `${rememberKey}:errors`) : void 0;
  const {
    form: baseForm,
    setDefaultsState,
    transformRef,
    precognitionEndpointRef,
    dataRef,
    isMounted,
    setProcessing,
    setProgress,
    markAsSuccessful,
    clearErrors,
    setError,
    defaultsCalledInOnSuccessRef,
    resetBeforeSubmit,
    finishProcessing
  } = useFormState({
    data,
    precognitionEndpoint,
    useDataState,
    useErrorsState
  });
  const submit = useCallback2(
    (...args2) => {
      const { method, url, options } = UseFormUtils.parseSubmitArguments(args2, precognitionEndpointRef.current);
      defaultsCalledInOnSuccessRef.current = false;
      const _options = {
        ...options,
        onCancelToken: (token) => {
          cancelToken.current = token;
          return options.onCancelToken?.(token);
        },
        onBefore: (visit) => {
          resetBeforeSubmit();
          return options.onBefore?.(visit);
        },
        onStart: (visit) => {
          setProcessing(true);
          return options.onStart?.(visit);
        },
        onProgress: (event) => {
          setProgress(event || null);
          return options.onProgress?.(event);
        },
        onSuccess: async (page2) => {
          if (isMounted.current) {
            markAsSuccessful();
          }
          const onSuccess = options.onSuccess ? await options.onSuccess(page2) : null;
          if (isMounted.current && !defaultsCalledInOnSuccessRef.current) {
            baseForm.setData((data2) => {
              setDefaultsState(cloneDeep(data2));
              return data2;
            });
          }
          return onSuccess;
        },
        onError: (errors) => {
          if (isMounted.current) {
            clearErrors();
            setError(errors);
          }
          return options.onError?.(errors);
        },
        onCancel: () => {
          return options.onCancel?.();
        },
        onFinish: (visit) => {
          if (isMounted.current) {
            finishProcessing();
          }
          cancelToken.current = null;
          return options.onFinish?.(visit);
        }
      };
      _options.optimistic = _options.optimistic ?? pendingOptimisticRef.current ?? void 0;
      pendingOptimisticRef.current = null;
      const transformedData = transformRef.current(dataRef.current);
      if (method === "delete") {
        router.delete(url, { ..._options, data: transformedData });
      } else {
        router[method](url, transformedData, _options);
      }
    },
    [clearErrors, setError, transformRef]
  );
  const cancel = useCallback2(() => {
    if (cancelToken.current) {
      cancelToken.current.cancel();
    }
  }, []);
  const submitMethods = useMemo3(
    () => ({
      get: (url, options = {}) => submit("get", url, options),
      post: (url, options = {}) => submit("post", url, options),
      put: (url, options = {}) => submit("put", url, options),
      patch: (url, options = {}) => submit("patch", url, options),
      delete: (url, options = {}) => submit("delete", url, options)
    }),
    [submit]
  );
  Object.assign(baseForm, {
    submit,
    ...submitMethods,
    cancel,
    dontRemember: (...keys) => {
      excludeKeysRef.current = keys;
      return form;
    },
    optimistic: (callback) => {
      pendingOptimisticRef.current = callback;
      return form;
    }
  });
  const form = baseForm;
  const originalWithPrecognition = baseForm.withPrecognition;
  form.withPrecognition = (...args2) => {
    originalWithPrecognition(...args2);
    return form;
  };
  return precognitionEndpointRef.current ? form : form;
}
var deferStateUpdate = (callback) => {
  typeof React.startTransition === "function" ? React.startTransition(callback) : setTimeout(callback, 0);
};
var noop3 = () => void 0;
var FormContext = createContext3(void 0);
var Form = forwardRef(
  ({
    action = "",
    method = "get",
    headers = {},
    queryStringArrayFormat = "brackets",
    errorBag = null,
    showProgress = true,
    transform = (data) => data,
    optimistic,
    options = {},
    onStart = noop3,
    onProgress = noop3,
    onFinish = noop3,
    onBefore = noop3,
    onCancel = noop3,
    onSuccess = noop3,
    onError = noop3,
    onHttpException = noop3,
    onNetworkError = noop3,
    onFlash = noop3,
    onCancelToken = noop3,
    onSubmitComplete = noop3,
    disableWhileProcessing = false,
    cancelOnUnmount = false,
    resetOnError = false,
    resetOnSuccess = false,
    setDefaultsOnSuccess = false,
    invalidateCacheTags = [],
    validateFiles = false,
    validationTimeout = 1500,
    withAllErrors = null,
    component = null,
    instant = false,
    children,
    ...props
  }, ref) => {
    const getTransformedData = () => {
      const [_url, data] = getUrlAndData();
      return transform(data);
    };
    const form = useForm({}).withPrecognition(
      () => resolvedMethod,
      () => getUrlAndData()[0]
    ).setValidationTimeout(validationTimeout);
    if (validateFiles) {
      form.validateFiles();
    }
    if (withAllErrors ?? config.get("form.withAllErrors")) {
      form.withAllErrors();
    }
    form.transform(getTransformedData);
    const formElement = useRef5(void 0);
    const resolvedMethod = useMemo4(() => {
      return isUrlMethodPair(action) ? action.method : method.toLowerCase();
    }, [action, method]);
    const resolvedComponent = useMemo4(() => {
      if (component) {
        return component;
      }
      if (instant && isUrlMethodPair(action)) {
        return resolveUrlMethodPairComponent(action);
      }
      return null;
    }, [component, instant, action]);
    const [isDirty, setIsDirty] = useState5(false);
    const defaultData = useRef5(new FormData());
    const cancelOnUnmountRef = useRef5(cancelOnUnmount);
    cancelOnUnmountRef.current = cancelOnUnmount;
    const getFormData = (submitter) => formElement.current ? new FormData(formElement.current, submitter) : new FormData();
    const getData = (submitter) => formDataToObject(getFormData(submitter));
    const getUrlAndData = (submitter) => {
      return mergeDataIntoQueryString(
        resolvedMethod,
        isUrlMethodPair(action) ? action.url : action,
        getData(submitter),
        queryStringArrayFormat
      );
    };
    const updateDirtyState = (event) => {
      if (event.type === "reset" && event.detail?.[FormComponentResetSymbol]) {
        event.preventDefault();
      }
      deferStateUpdate(
        () => setIsDirty(event.type === "reset" ? false : !isEqual(getData(), formDataToObject(defaultData.current)))
      );
    };
    const clearErrors = (...names) => {
      form.clearErrors(...names);
      return form;
    };
    useEffect5(() => {
      defaultData.current = getFormData();
      form.setDefaults(getData());
      const formEvents = ["input", "change", "reset"];
      formEvents.forEach((e) => formElement.current.addEventListener(e, updateDirtyState));
      return () => {
        formEvents.forEach((e) => formElement.current?.removeEventListener(e, updateDirtyState));
        if (cancelOnUnmountRef.current) {
          form.cancel();
        }
      };
    }, []);
    useEffect5(() => {
      form.setValidationTimeout(validationTimeout);
    }, [validationTimeout]);
    useEffect5(() => {
      if (validateFiles) {
        form.validateFiles();
      } else {
        form.withoutFileValidation();
      }
    }, [validateFiles]);
    const reset = (...fields) => {
      if (formElement.current) {
        resetFormFields(formElement.current, defaultData.current, fields);
      }
      form.reset(...fields);
    };
    const resetAndClearErrors = (...fields) => {
      clearErrors(...fields);
      reset(...fields);
    };
    const maybeReset = (resetOption) => {
      if (!resetOption) {
        return;
      }
      if (resetOption === true) {
        reset();
      } else if (resetOption.length > 0) {
        reset(...resetOption);
      }
    };
    const submit = (submitter) => {
      const [url, data] = getUrlAndData(submitter);
      const formTarget = submitter?.getAttribute("formtarget");
      if (formTarget === "_blank" && resolvedMethod === "get") {
        window.open(url, "_blank");
        return;
      }
      const submitOptions = {
        headers,
        queryStringArrayFormat,
        errorBag,
        showProgress,
        invalidateCacheTags,
        component: resolvedComponent,
        optimistic: optimistic ? (pageProps) => optimistic(pageProps, data) : void 0,
        onCancelToken,
        onBefore,
        onStart,
        onProgress,
        onFinish,
        onCancel,
        onHttpException,
        onNetworkError,
        onFlash,
        onSuccess: async (...args) => {
          const result = await onSuccess(...args);
          onSubmitComplete({
            reset,
            defaults
          });
          maybeReset(resetOnSuccess);
          if (setDefaultsOnSuccess === true) {
            defaults();
          }
          return result;
        },
        onError(...args) {
          onError(...args);
          maybeReset(resetOnError);
        },
        ...options
      };
      form.transform(() => transform(data));
      form.submit(resolvedMethod, url, submitOptions);
      form.transform(getTransformedData);
    };
    const defaults = () => {
      defaultData.current = getFormData();
      setIsDirty(false);
    };
    const exposed = {
      errors: form.errors,
      hasErrors: form.hasErrors,
      processing: form.processing,
      progress: form.progress,
      wasSuccessful: form.wasSuccessful,
      recentlySuccessful: form.recentlySuccessful,
      isDirty,
      clearErrors,
      resetAndClearErrors,
      setError: form.setError,
      reset,
      submit,
      cancel: form.cancel,
      defaults,
      getData,
      getFormData,
      // Precognition
      validator: () => form.validator(),
      validating: form.validating,
      valid: form.valid,
      invalid: form.invalid,
      validate: (field, config3) => form.validate(...UseFormUtils.mergeHeadersForValidation(field, config3, headers)),
      touch: form.touch,
      touched: form.touched
    };
    useImperativeHandle(ref, () => exposed, [form, isDirty, submit]);
    const formNode = createElement3(
      "form",
      {
        ...props,
        ref: formElement,
        action: isUrlMethodPair(action) ? action.url : action,
        method: resolvedMethod,
        onSubmit: (event) => {
          event.preventDefault();
          submit(event.nativeEvent.submitter);
        },
        inert: disableWhileProcessing && form.processing
      },
      typeof children === "function" ? children(exposed) : children
    );
    return createElement3(FormContext.Provider, { value: exposed }, formNode);
  }
);
Form.displayName = "InertiaForm";
var resolveHTMLElement = (value, fallback) => {
  if (!value) {
    return fallback;
  }
  if (value && typeof value === "object" && "current" in value) {
    return value.current;
  }
  if (typeof value === "string") {
    return document.querySelector(value);
  }
  return fallback;
};
var renderSlot = (slotContent, slotProps, fallback = null) => {
  if (!slotContent) {
    return fallback;
  }
  return typeof slotContent === "function" ? slotContent(slotProps) : slotContent;
};
var InfiniteScroll = forwardRef2(
  ({
    data,
    buffer = 0,
    as = "div",
    manual = false,
    manualAfter = 0,
    preserveUrl = false,
    reverse = false,
    autoScroll,
    children,
    startElement,
    endElement,
    itemsElement,
    previous,
    next,
    loading,
    params = {},
    onlyNext = false,
    onlyPrevious = false,
    ...props
  }, ref) => {
    const [startElementFromRef, setStartElementFromRef] = useState6(null);
    const startElementRef = useCallback3((node) => setStartElementFromRef(node), []);
    const [endElementFromRef, setEndElementFromRef] = useState6(null);
    const endElementRef = useCallback3((node) => setEndElementFromRef(node), []);
    const [itemsElementFromRef, setItemsElementFromRef] = useState6(null);
    const itemsElementRef = useCallback3((node) => setItemsElementFromRef(node), []);
    const scrollProp = usePage().scrollProps?.[data];
    const [loadingPrevious, setLoadingPrevious] = useState6(false);
    const [loadingNext, setLoadingNext] = useState6(false);
    const [requestCount, setRequestCount] = useState6(0);
    const [hasPreviousPage, setHasPreviousPage] = useState6(!!scrollProp?.previousPage);
    const [hasNextPage, setHasNextPage] = useState6(!!scrollProp?.nextPage);
    const [resolvedStartElement, setResolvedStartElement] = useState6(null);
    const [resolvedEndElement, setResolvedEndElement] = useState6(null);
    const [resolvedItemsElement, setResolvedItemsElement] = useState6(null);
    useEffect7(() => {
      const element = startElement ? resolveHTMLElement(startElement, startElementFromRef) : startElementFromRef;
      setResolvedStartElement(element);
    }, [startElement, startElementFromRef]);
    useEffect7(() => {
      const element = endElement ? resolveHTMLElement(endElement, endElementFromRef) : endElementFromRef;
      setResolvedEndElement(element);
    }, [endElement, endElementFromRef]);
    useEffect7(() => {
      const element = itemsElement ? resolveHTMLElement(itemsElement, itemsElementFromRef) : itemsElementFromRef;
      setResolvedItemsElement(element);
    }, [itemsElement, itemsElementFromRef]);
    const scrollableParent = useMemo6(() => getScrollableParent(resolvedItemsElement), [resolvedItemsElement]);
    const callbackPropsRef = useRef6({
      buffer,
      onlyNext,
      onlyPrevious,
      reverse,
      preserveUrl,
      params
    });
    callbackPropsRef.current = {
      buffer,
      onlyNext,
      onlyPrevious,
      reverse,
      preserveUrl,
      params
    };
    const [infiniteScroll, setInfiniteScroll] = useState6(null);
    const dataManager = useMemo6(() => infiniteScroll?.dataManager, [infiniteScroll]);
    const elementManager = useMemo6(() => infiniteScroll?.elementManager, [infiniteScroll]);
    const scrollToBottom = useCallback3(() => {
      if (scrollableParent) {
        scrollableParent.scrollTo({
          top: scrollableParent.scrollHeight,
          behavior: "instant"
        });
      } else {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "instant"
        });
      }
    }, [scrollableParent]);
    useEffect7(() => {
      if (!resolvedItemsElement) {
        return;
      }
      function syncStateFromDataManager() {
        setRequestCount(infiniteScrollInstance.dataManager.getRequestCount());
        setHasPreviousPage(infiniteScrollInstance.dataManager.hasPrevious());
        setHasNextPage(infiniteScrollInstance.dataManager.hasNext());
      }
      const infiniteScrollInstance = useInfiniteScroll({
        // Data
        getPropName: () => data,
        inReverseMode: () => callbackPropsRef.current.reverse,
        shouldFetchNext: () => !callbackPropsRef.current.onlyPrevious,
        shouldFetchPrevious: () => !callbackPropsRef.current.onlyNext,
        shouldPreserveUrl: () => callbackPropsRef.current.preserveUrl,
        getReloadOptions: () => callbackPropsRef.current.params,
        // Elements
        getTriggerMargin: () => callbackPropsRef.current.buffer,
        getStartElement: () => resolvedStartElement,
        getEndElement: () => resolvedEndElement,
        getItemsElement: () => resolvedItemsElement,
        getScrollableParent: () => scrollableParent,
        // Callbacks
        onBeforePreviousRequest: () => setLoadingPrevious(true),
        onBeforeNextRequest: () => setLoadingNext(true),
        // Commit synchronously so the loading indicator is gone before the core restores
        // the scroll position, the page itself is also swapped with flushSync()
        onCompletePreviousRequest: ({ completed }) => {
          flushSync2(() => {
            setLoadingPrevious(false);
            if (completed) {
              syncStateFromDataManager();
            }
          });
        },
        onCompleteNextRequest: ({ completed }) => {
          flushSync2(() => {
            setLoadingNext(false);
            if (completed) {
              syncStateFromDataManager();
            }
          });
        },
        onDataReset: syncStateFromDataManager
      });
      setInfiniteScroll(infiniteScrollInstance);
      const { dataManager: dataManager2, elementManager: elementManager2 } = infiniteScrollInstance;
      syncStateFromDataManager();
      elementManager2.setupObservers();
      elementManager2.processServerLoadedElements(dataManager2.getLastLoadedPage());
      if (autoLoad) {
        elementManager2.enableTriggers();
      }
      return () => {
        infiniteScrollInstance.flush();
        setInfiniteScroll(null);
      };
    }, [data, resolvedItemsElement, resolvedStartElement, resolvedEndElement, scrollableParent]);
    const manualMode = useMemo6(
      () => manual || manualAfter > 0 && requestCount >= manualAfter,
      [manual, manualAfter, requestCount]
    );
    const autoLoad = useMemo6(() => !manualMode, [manualMode]);
    useEffect7(() => {
      autoLoad ? elementManager?.enableTriggers() : elementManager?.disableTriggers();
    }, [autoLoad, onlyNext, onlyPrevious, resolvedStartElement, resolvedEndElement]);
    useEffect7(() => {
      const shouldAutoScroll = autoScroll !== void 0 ? autoScroll : reverse;
      if (shouldAutoScroll) {
        scrollToBottom();
      }
    }, [scrollableParent]);
    useImperativeHandle2(
      ref,
      () => ({
        fetchNext: dataManager?.fetchNext || (() => {
        }),
        fetchPrevious: dataManager?.fetchPrevious || (() => {
        }),
        hasPrevious: dataManager?.hasPrevious || (() => false),
        hasNext: dataManager?.hasNext || (() => false)
      }),
      [dataManager]
    );
    const headerAutoMode = autoLoad && !onlyNext;
    const footerAutoMode = autoLoad && !onlyPrevious;
    const sharedExposed = {
      loadingPrevious,
      loadingNext,
      hasPrevious: hasPreviousPage,
      hasNext: hasNextPage
    };
    const exposedPrevious = {
      loading: loadingPrevious,
      fetch: dataManager?.fetchPrevious ?? (() => {
      }),
      autoMode: headerAutoMode,
      manualMode: !headerAutoMode,
      hasMore: hasPreviousPage,
      ...sharedExposed
    };
    const exposedNext = {
      loading: loadingNext,
      fetch: dataManager?.fetchNext ?? (() => {
      }),
      autoMode: footerAutoMode,
      manualMode: !footerAutoMode,
      hasMore: hasNextPage,
      ...sharedExposed
    };
    const exposedSlot = {
      loading: loadingPrevious || loadingNext,
      loadingPrevious,
      loadingNext
    };
    const renderElements = [];
    if (!startElement) {
      renderElements.push(
        createElement4(
          "div",
          { ref: startElementRef },
          // Render previous slot or fallback to loading indicator
          renderSlot(previous, exposedPrevious, loadingPrevious ? renderSlot(loading, exposedPrevious) : null)
        )
      );
    }
    renderElements.push(
      createElement4(
        as,
        { ...props, ref: itemsElementRef },
        typeof children === "function" ? children(exposedSlot) : children
      )
    );
    if (!endElement) {
      renderElements.push(
        createElement4(
          "div",
          { ref: endElementRef },
          // Render next slot or fallback to loading indicator
          renderSlot(next, exposedNext, loadingNext ? renderSlot(loading, exposedNext) : null)
        )
      );
    }
    return createElement4(React3.Fragment, {}, ...reverse ? [...renderElements].reverse() : renderElements);
  }
);
InfiniteScroll.displayName = "InertiaInfiniteScroll";
var noop22 = () => void 0;
var Link = forwardRef3(
  ({
    children,
    as = "a",
    data = {},
    href = "",
    method = "get",
    preserveScroll = false,
    preserveState = null,
    preserveUrl = false,
    replace = false,
    only = [],
    except = [],
    headers = {},
    queryStringArrayFormat = "brackets",
    async = false,
    onClick = noop22,
    onCancelToken = noop22,
    onBefore = noop22,
    onStart = noop22,
    onProgress = noop22,
    onFinish = noop22,
    onCancel = noop22,
    onSuccess = noop22,
    onError = noop22,
    onHttpException = noop22,
    onNetworkError = noop22,
    onFlash = noop22,
    onPrefetching = noop22,
    onPrefetched = noop22,
    prefetch = false,
    cacheFor = 0,
    cacheTags = [],
    viewTransition = false,
    component = null,
    instant = false,
    pageProps = null,
    ...props
  }, ref) => {
    const [inFlightCount, setInFlightCount] = useState7(0);
    const hoverTimeout = useRef7(void 0);
    const _method = useMemo7(() => {
      return isUrlMethodPair(href) ? href.method : method.toLowerCase();
    }, [href, method]);
    const resolvedComponent = useMemo7(() => {
      if (component) {
        return component;
      }
      if (instant && isUrlMethodPair(href)) {
        return resolveUrlMethodPairComponent(href);
      }
      return null;
    }, [component, instant, href]);
    const _as = useMemo7(() => {
      if (typeof as !== "string" || as.toLowerCase() !== "a") {
        return as;
      }
      return _method !== "get" ? "button" : as.toLowerCase();
    }, [as, _method]);
    const mergeDataArray = useMemo7(
      () => mergeDataIntoQueryString(_method, isUrlMethodPair(href) ? href.url : href, data, queryStringArrayFormat),
      [href, _method, data, queryStringArrayFormat]
    );
    const url = useMemo7(() => mergeDataArray[0], [mergeDataArray]);
    const _data = useMemo7(() => mergeDataArray[1], [mergeDataArray]);
    const baseParams = useMemo7(
      () => ({
        data: _data,
        method: _method,
        preserveScroll,
        preserveState: preserveState ?? _method !== "get",
        preserveUrl,
        replace,
        only,
        except,
        headers,
        async,
        component: resolvedComponent,
        pageProps
      }),
      [
        _data,
        _method,
        preserveScroll,
        preserveState,
        preserveUrl,
        replace,
        only,
        except,
        headers,
        async,
        resolvedComponent,
        pageProps
      ]
    );
    const visitParams = useMemo7(
      () => ({
        ...baseParams,
        viewTransition,
        onCancelToken,
        onBefore,
        onStart(visit) {
          setInFlightCount((count) => count + 1);
          onStart(visit);
        },
        onProgress,
        onFinish(visit) {
          setInFlightCount((count) => count - 1);
          onFinish(visit);
        },
        onCancel,
        onSuccess,
        onError,
        onHttpException,
        onNetworkError,
        onFlash
      }),
      [
        baseParams,
        viewTransition,
        onCancelToken,
        onBefore,
        onStart,
        onProgress,
        onFinish,
        onCancel,
        onSuccess,
        onError,
        onHttpException,
        onNetworkError,
        onFlash
      ]
    );
    const prefetchModes = useMemo7(
      () => {
        if (prefetch === true) {
          return ["hover"];
        }
        if (prefetch === false) {
          return [];
        }
        if (Array.isArray(prefetch)) {
          return prefetch;
        }
        return [prefetch];
      },
      Array.isArray(prefetch) ? prefetch : [prefetch]
    );
    const cacheForValue = useMemo7(() => {
      if (cacheFor !== 0) {
        return cacheFor;
      }
      if (prefetchModes.length === 1 && prefetchModes[0] === "click") {
        return 0;
      }
      return config2.get("prefetch.cacheFor");
    }, [cacheFor, prefetchModes]);
    const doPrefetch = useMemo7(() => {
      return () => {
        router.prefetch(
          url,
          {
            ...baseParams,
            onPrefetching,
            onPrefetched
          },
          { cacheFor: cacheForValue, cacheTags }
        );
      };
    }, [url, baseParams, onPrefetching, onPrefetched, cacheForValue, cacheTags]);
    useEffect8(() => {
      return () => {
        clearTimeout(hoverTimeout.current);
      };
    }, []);
    useEffect8(() => {
      if (prefetchModes.includes("mount")) {
        setTimeout(() => doPrefetch());
      }
    }, prefetchModes);
    const regularEvents = {
      onClick: (event) => {
        onClick(event);
        if (shouldIntercept(event)) {
          event.preventDefault();
          router.visit(url, visitParams);
        }
      }
    };
    const prefetchHoverEvents = {
      onMouseEnter: () => {
        hoverTimeout.current = window.setTimeout(() => {
          doPrefetch();
        }, config2.get("prefetch.hoverDelay"));
      },
      onMouseLeave: () => {
        clearTimeout(hoverTimeout.current);
      },
      onClick: (event) => {
        clearTimeout(hoverTimeout.current);
        regularEvents.onClick(event);
      }
    };
    const prefetchClickEvents = {
      onMouseDown: (event) => {
        if (shouldIntercept(event)) {
          event.preventDefault();
          doPrefetch();
        }
      },
      onKeyDown: (event) => {
        if (shouldNavigate(event)) {
          event.preventDefault();
          doPrefetch();
        }
      },
      onMouseUp: (event) => {
        if (shouldIntercept(event)) {
          event.preventDefault();
          router.visit(url, visitParams);
        }
      },
      onKeyUp: (event) => {
        if (shouldNavigate(event)) {
          event.preventDefault();
          router.visit(url, visitParams);
        }
      },
      onClick: (event) => {
        onClick(event);
        if (shouldIntercept(event)) {
          event.preventDefault();
        }
      }
    };
    const elProps = useMemo7(() => {
      if (_as === "button") {
        return { type: "button" };
      }
      if (_as === "a" || typeof _as !== "string") {
        return { href: url };
      }
      return {};
    }, [_as, url]);
    return createElement5(
      _as,
      {
        ...props,
        ...elProps,
        ref,
        ...(() => {
          if (prefetchModes.includes("hover")) {
            return prefetchHoverEvents;
          }
          if (prefetchModes.includes("click")) {
            return prefetchClickEvents;
          }
          return regularEvents;
        })(),
        "data-loading": inFlightCount > 0 ? "" : void 0
      },
      children
    );
  }
);
Link.displayName = "InertiaLink";
var Link_default = Link;
var subscribe = () => () => {
};
var getClientSnapshot = () => true;
var getServerSnapshot = () => false;
var WhenMounted = ({ children, fallback }) => {
  const mounted = useSyncExternalStore2(subscribe, getClientSnapshot, getServerSnapshot);
  if (!mounted) {
    return typeof fallback === "function" ? fallback() : fallback ?? null;
  }
  return typeof children === "function" ? children() : children;
};
WhenMounted.displayName = "InertiaWhenMounted";
var WhenVisible = ({ children, data, params, buffer, as, always, fallback }) => {
  always = always ?? false;
  as = as ?? "div";
  fallback = fallback ?? null;
  const pageProps = usePage().props;
  const keys = useMemo9(() => data ? Array.isArray(data) ? data : [data] : [], [data]);
  const [loaded, setLoaded] = useState11(() => keys.length > 0 && keys.every((key) => get(pageProps, key) !== void 0));
  const [isFetching, setIsFetching] = useState11(false);
  const fetching = useRef10(false);
  const ref = useRef10(null);
  const observer = useRef10(null);
  const getReloadParamsRef = useRef10(() => ({}));
  useEffect11(() => {
    if (keys.length > 0) {
      setLoaded(keys.every((key) => get(pageProps, key) !== void 0));
    }
  }, [pageProps, keys]);
  const getReloadParams = useCallback6(() => {
    const reloadParams = { preserveErrors: true, ...params };
    if (data) {
      reloadParams.only = Array.isArray(data) ? data : [data];
    }
    return reloadParams;
  }, [params, data]);
  getReloadParamsRef.current = getReloadParams;
  const registerObserver = () => {
    observer.current?.disconnect();
    observer.current = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) {
          return;
        }
        if (fetching.current) {
          return;
        }
        if (!always && loaded) {
          return;
        }
        fetching.current = true;
        setIsFetching(true);
        const reloadParams = getReloadParamsRef.current();
        router.reload({
          ...reloadParams,
          onStart: (e) => {
            fetching.current = true;
            setIsFetching(true);
            reloadParams.onStart?.(e);
          },
          onFinish: (e) => {
            setLoaded(true);
            fetching.current = false;
            setIsFetching(false);
            reloadParams.onFinish?.(e);
            if (!always) {
              observer.current?.disconnect();
            }
          }
        });
      },
      {
        rootMargin: `${buffer || 0}px`
      }
    );
    observer.current.observe(ref.current);
  };
  useEffect11(() => {
    if (!ref.current) {
      return;
    }
    if (loaded && !always) {
      return;
    }
    registerObserver();
    return () => {
      observer.current?.disconnect();
    };
  }, [always, loaded, buffer]);
  const resolveChildren = () => typeof children === "function" ? children({ fetching: isFetching }) : children;
  const resolveFallback = () => typeof fallback === "function" ? fallback() : fallback;
  if (always || !loaded) {
    return createElement6(
      as,
      {
        props: null,
        ref
      },
      loaded ? resolveChildren() : resolveFallback()
    );
  }
  return loaded ? resolveChildren() : null;
};
WhenVisible.displayName = "InertiaWhenVisible";
var config2 = config.extend();

// resources/js/Components/icons.jsx
import React4 from "react";
var Svg = ({ size = 20, className = "", children, filled = false, ...rest }) => /* @__PURE__ */ React4.createElement(
  "svg",
  {
    className,
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: filled ? "currentColor" : "none",
    stroke: filled ? "none" : "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    focusable: "false",
    ...rest
  },
  children
);
var AlertIcon = (props) => /* @__PURE__ */ React4.createElement(Svg, { ...props }, /* @__PURE__ */ React4.createElement("path", { d: "M12 4.5 21 20H3L12 4.5z" }), /* @__PURE__ */ React4.createElement("path", { d: "M12 10v4" }), /* @__PURE__ */ React4.createElement("path", { d: "M12 17h.01" }));
var ImageOffIcon = (props) => /* @__PURE__ */ React4.createElement(Svg, { ...props }, /* @__PURE__ */ React4.createElement("path", { d: "M4 5.5h16v13H4z" }), /* @__PURE__ */ React4.createElement("path", { d: "m4 15 4.5-4.5 4 4 3-3 4.5 4.5" }), /* @__PURE__ */ React4.createElement("path", { d: "M3 3l18 18" }));
var SpinnerIcon = ({ size = 16, className = "" }) => /* @__PURE__ */ React4.createElement(
  "svg",
  {
    className: `animate-spin ${className}`,
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": "true",
    focusable: "false"
  },
  /* @__PURE__ */ React4.createElement("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "1.5", opacity: "0.25" }),
  /* @__PURE__ */ React4.createElement("path", { d: "M21 12a9 9 0 0 0-9-9", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
);

// resources/js/Components/Button.jsx
var VARIANTS = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "inline-flex items-center justify-center gap-2 h-10 px-5 rounded-sm text-label font-semibold leading-none bg-danger text-white transition-colors duration-hover hover:opacity-90 disabled:opacity-45 disabled:cursor-not-allowed",
  link: "inline-flex items-center gap-2 text-label text-brand underline underline-offset-4 rounded-sm"
};
var SIZES = {
  md: "",
  sm: "h-10 px-4"
};
function Button({
  children,
  variant = "primary",
  size = "md",
  as = "button",
  href = null,
  type = "button",
  loading = false,
  disabled = false,
  fullWidth = false,
  icon = null,
  className = "",
  ...rest
}) {
  const classes = cn(
    VARIANTS[variant] ?? VARIANTS.primary,
    size === "sm" && variant !== "link" ? SIZES.sm : null,
    variant === "link" && size === "sm" ? "text-meta" : null,
    fullWidth ? "w-full" : null,
    "whitespace-nowrap",
    className
  );
  const content = loading ? /* @__PURE__ */ React5.createElement(React5.Fragment, null, /* @__PURE__ */ React5.createElement(SpinnerIcon, { size: 16 }), /* @__PURE__ */ React5.createElement("span", null, "Memproses\u2026")) : /* @__PURE__ */ React5.createElement(React5.Fragment, null, icon, /* @__PURE__ */ React5.createElement("span", null, children));
  if (as === "a") {
    return /* @__PURE__ */ React5.createElement("a", { href, className: classes, ...rest }, content);
  }
  if (as === Link_default || as === "Link" || href) {
    return /* @__PURE__ */ React5.createElement(Link_default, { href, className: classes, "aria-busy": loading || void 0, ...rest }, content);
  }
  return /* @__PURE__ */ React5.createElement(
    "button",
    {
      type,
      className: classes,
      disabled: disabled || loading,
      "aria-busy": loading || void 0,
      ...rest
    },
    content
  );
}

// resources/js/Components/EmptyState.jsx
function EmptyState({
  title = "Belum ada data",
  description = null,
  actionLabel = null,
  actionHref = null,
  onAction = null,
  icon = null,
  className = ""
}) {
  return /* @__PURE__ */ React6.createElement("div", { className: cn("flex flex-col items-center gap-3 py-12 text-center", className) }, /* @__PURE__ */ React6.createElement("span", { className: "text-slate-300", "aria-hidden": "true" }, icon ?? /* @__PURE__ */ React6.createElement(ImageOffIcon, { size: 96 })), /* @__PURE__ */ React6.createElement("p", { className: "text-h3 text-ink" }, title), description && /* @__PURE__ */ React6.createElement("p", { className: "max-w-sm text-meta text-slate-600" }, description), actionLabel && onAction && /* @__PURE__ */ React6.createElement(Button, { variant: "secondary", onClick: onAction, className: "mt-2" }, actionLabel), actionLabel && !onAction && actionHref && /* @__PURE__ */ React6.createElement(Button, { variant: "secondary", href: actionHref, className: "mt-2" }, actionLabel));
}

// resources/js/Components/ErrorState.jsx
import React7 from "react";
function ErrorState({
  title = "Gagal memuat data",
  description = "Periksa koneksi Anda lalu coba lagi.",
  onRetry = null,
  supportHref = "/kontak-kami",
  retryLabel = "Coba lagi",
  supportLabel = "Hubungi kami",
  className = ""
}) {
  return /* @__PURE__ */ React7.createElement(
    "div",
    {
      role: "alert",
      className: cn("flex flex-col items-center gap-3 py-12 text-center", className)
    },
    /* @__PURE__ */ React7.createElement("span", { className: "text-danger", "aria-hidden": "true" }, /* @__PURE__ */ React7.createElement(AlertIcon, { size: 48 })),
    /* @__PURE__ */ React7.createElement("p", { className: "text-h3 text-ink" }, title),
    description && /* @__PURE__ */ React7.createElement("p", { className: "max-w-sm text-meta text-slate-600" }, description),
    /* @__PURE__ */ React7.createElement("div", { className: "mt-2 flex flex-wrap items-center justify-center gap-3" }, onRetry && /* @__PURE__ */ React7.createElement(Button, { variant: "primary", onClick: onRetry }, retryLabel), supportHref && /* @__PURE__ */ React7.createElement(Button, { variant: "secondary", href: supportHref }, supportLabel))
  );
}

// resources/js/Components/Skeleton.jsx
import React8 from "react";
var SHAPES = {
  text: "h-3 w-full",
  title: "h-6 w-2/3",
  card: "aspect-square w-full",
  row: "h-tableRow w-full",
  circle: "h-10 w-10 rounded-full"
};
function Skeleton({ variant = "text", count = 1, className = "" }) {
  return Array.from({ length: count }).map((_, index) => /* @__PURE__ */ React8.createElement(
    "div",
    {
      key: index,
      "aria-hidden": "true",
      className: cn("skeleton", SHAPES[variant] ?? SHAPES.text, className)
    }
  ));
}

// resources/js/Components/DataTable.jsx
function DataTable({
  columns: columns2 = [],
  rows: rows2 = [],
  rowKey = (row, index) => row?.id ?? index,
  loading = false,
  error = null,
  emptyTitle = "Belum ada data",
  emptyDescription = null,
  emptyActionLabel = null,
  emptyActionHref = null,
  onRetry = null,
  onRowClick = null,
  sort = null,
  onSort = null,
  caption = null,
  className = ""
}) {
  const list = Array.isArray(rows2) ? rows2 : [];
  const hasRows = list.length > 0;
  const cellAlign = (column) => column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left";
  const punyaLebar = columns2.some(
    (column) => column.width !== null && column.width !== void 0 && column.width !== ""
  );
  const lebarMinimal = punyaLebar ? columns2.reduce((total, column) => total + (typeof column.width === "number" ? column.width : 0), 0) : 0;
  const lebarKolom = (column) => {
    if (column.width === null || column.width === void 0 || column.width === "") return void 0;
    return typeof column.width === "number" ? `${column.width}px` : column.width;
  };
  const sortState = (column) => {
    if (!sort || sort.key !== column.key) return "none";
    return sort.dir === "desc" ? "descending" : "ascending";
  };
  return /* @__PURE__ */ React9.createElement("div", { className: cn("overflow-hidden rounded-lg border border-line bg-white", className) }, error ? /* @__PURE__ */ React9.createElement(
    ErrorState,
    {
      title: "Gagal memuat data",
      description: typeof error === "string" ? error : "Periksa koneksi Anda lalu coba lagi.",
      onRetry,
      supportHref: null
    }
  ) : loading ? /* @__PURE__ */ React9.createElement("div", { className: "flex flex-col", "aria-busy": "true" }, /* @__PURE__ */ React9.createElement("div", { className: "h-tableHead w-full border-b border-line bg-surface", "aria-hidden": "true" }), Array.from({ length: 8 }).map((_, index) => /* @__PURE__ */ React9.createElement("div", { key: index, className: "flex items-center gap-4 border-b border-line px-4 last:border-b-0" }, /* @__PURE__ */ React9.createElement(Skeleton, { variant: "row" })))) : !hasRows ? /* @__PURE__ */ React9.createElement(
    EmptyState,
    {
      title: emptyTitle,
      description: emptyDescription,
      actionLabel: emptyActionLabel,
      actionHref: emptyActionHref
    }
  ) : /* @__PURE__ */ React9.createElement("div", { className: "max-h-[70vh] overflow-auto" }, /* @__PURE__ */ React9.createElement(
    "table",
    {
      className: cn("w-full border-collapse text-meta", punyaLebar && "table-fixed"),
      style: lebarMinimal > 0 ? { minWidth: `${lebarMinimal}px` } : void 0
    },
    caption && /* @__PURE__ */ React9.createElement("caption", { className: "sr-only" }, caption),
    /* @__PURE__ */ React9.createElement("thead", null, /* @__PURE__ */ React9.createElement("tr", { className: "bg-surface" }, columns2.map((column) => {
      const isSorted = sort && sort.key === column.key;
      const sortable = Boolean(onSort && column.sortable !== false);
      return /* @__PURE__ */ React9.createElement(
        "th",
        {
          key: column.key,
          scope: "col",
          "aria-sort": isSorted ? sortState(column) : void 0,
          style: { width: lebarKolom(column) },
          className: cn(
            "sticky top-0 z-10 h-tableHead whitespace-nowrap border-b border-line bg-surface px-4 text-label uppercase text-slate-600",
            cellAlign(column)
          )
        },
        sortable ? /* @__PURE__ */ React9.createElement(
          "button",
          {
            type: "button",
            onClick: () => onSort(column.key),
            className: cn(
              "inline-flex items-center gap-1 rounded-sm transition-colors duration-hover hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              isSorted && "text-ink"
            )
          },
          column.header,
          /* @__PURE__ */ React9.createElement("span", { "aria-hidden": "true" }, isSorted ? sort.dir === "desc" ? "\u2193" : "\u2191" : "\u2195")
        ) : column.header
      );
    }))),
    /* @__PURE__ */ React9.createElement("tbody", null, list.map((row, index) => {
      const clickable = typeof onRowClick === "function";
      return /* @__PURE__ */ React9.createElement(
        "tr",
        {
          key: rowKey(row, index),
          className: cn(
            "h-tableRow border-b border-line last:border-b-0",
            clickable && "cursor-pointer transition-colors duration-hover hover:bg-surface focus-within:bg-surface"
          ),
          onClick: clickable ? () => onRowClick(row, index) : void 0
        },
        columns2.map((column) => /* @__PURE__ */ React9.createElement(
          "td",
          {
            key: column.key,
            className: cn("px-4 align-middle text-ink", cellAlign(column))
          },
          column.render ? column.render(row, index) : row?.[column.key] ?? "-"
        ))
      );
    }))
  )));
}

// tmp/sticky-entry-t_082b15aa.jsx
var rows = Array.from({ length: 20 }, (_, index) => ({
  kode: `INV-2026-${String(index + 1).padStart(4, "0")}`,
  pelanggan: `Pelanggan Uji ${index + 1}`,
  status: index % 3 === 0 ? "Baru" : "Diproses",
  total: 125e3 + index * 1e3
}));
var columns = [
  { key: "kode", header: "Kode pesanan", sortable: true, width: 160 },
  { key: "pelanggan", header: "Pelanggan", sortable: true },
  { key: "status", header: "Status", align: "center", width: 120 },
  {
    key: "total",
    header: "Total",
    align: "right",
    render: (row) => `Rp${row.total.toLocaleString("id-ID")}`
  }
];
var barisLama = rows.map(
  (row) => `<tr class="h-tableRow border-b border-line"><td class="px-4">${row.kode}</td><td class="px-4">${row.pelanggan}</td><td class="px-4 text-center">${row.status}</td><td class="px-4 text-right">Rp${row.total}</td></tr>`
).join("");
var kontrolLama = `
<div class="mt-8 overflow-hidden rounded-lg border border-line bg-white">
  <div id="wrapper-lama" class="overflow-x-auto">
    <table class="w-full border-collapse text-meta">
      <thead><tr class="bg-surface">
        <th class="h-tableHead whitespace-nowrap border-b border-line bg-surface px-4 text-label uppercase text-slate-600">Kode lama</th>
        <th class="h-tableHead whitespace-nowrap border-b border-line bg-surface px-4 text-label uppercase text-slate-600">Pelanggan lama</th>
        <th class="h-tableHead whitespace-nowrap border-b border-line bg-surface px-4 text-label uppercase text-slate-600">Status lama</th>
        <th class="h-tableHead whitespace-nowrap border-b border-line bg-surface px-4 text-label uppercase text-slate-600">Total lama</th>
      </tr></thead>
      <tbody>${barisLama}</tbody>
    </table>
  </div>
</div>`;
var cssHref = "file:///C:/Users/LENOVO/Downloads/toko-kulot/public/build/assets/app-CCUgQ5mf.css";
var html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>Harness sticky DataTable t_082b15aa</title>
<link rel="stylesheet" href="${cssHref}">
</head>
<body class="bg-canvas text-ink">
<header id="topbar" class="sticky top-0 z-20 flex h-topbar items-center justify-between gap-3 border-b border-line bg-white px-4">
  <span class="text-h3">Toko Kulot \u2014 topbar admin (tiruan AdminLayout.jsx:172)</span>
</header>
<main class="p-6">
  <h1 class="text-h2">DataTable nyata (SSR komponen) \u2014 20 baris</h1>
  ${renderToStaticMarkup(
  /* @__PURE__ */ React10.createElement(
    DataTable,
    {
      columns,
      rows,
      caption: "Daftar pesanan uji",
      sort: { key: "kode", dir: "asc" },
      onSort: () => {
      }
    }
  )
)}
  <h2 class="text-h3 mt-8">Kontrol negatif: markup lama (overflow-x-auto, th tanpa sticky)</h2>
  ${kontrolLama}
  <div style="height: 1600px" aria-hidden="true"></div>
</main>
</body>
</html>`;
function writeHarness(path) {
  writeFileSync(path, html, "utf8");
  return path;
}
export {
  writeHarness
};
/*! Bundled license information:

@inertiajs/core/dist/index.js:
  (* NProgress, (c) 2013, 2014 Rico Sta. Cruz - http://ricostacruz.com/nprogress
   * @license MIT *)
*/
