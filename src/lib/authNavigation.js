export const resolvePostAuthPath = (response, fallbackPath = "/home") => {
  const data = response?.data || {};
  return data?.isNewUser ? "/me" : fallbackPath;
};
