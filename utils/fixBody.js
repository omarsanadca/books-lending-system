export const fixBody = (body, entityKeys) => {
  for (const key in body) {
    if (!entityKeys.includes(key)) {
      delete body[key];
    }
  }

  return body;
};
