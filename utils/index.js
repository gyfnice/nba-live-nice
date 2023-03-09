export const Store = (namespace, data) => {
  if (typeof data !== "undefined" && data !== null) {
    return localStorage.setItem(namespace, JSON.stringify(data));
  }
  const store = localStorage.getItem(namespace);
  const result = store && JSON.parse(store);
  if (result !== "undefined" && result !== null && result !== undefined) {
    return result;
  }
  return null;
};
