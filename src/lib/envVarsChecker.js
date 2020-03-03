export default env => {
  const required = ['REGION','DYNAMODB_TABLE', 'GPLAY_ID', 'ASTORE_ID', 'HOOK_TABLE'];
  const missing = [];

  required.forEach(reqVar => {
    if (!env[reqVar]) {
      missing.push(reqVar);
    }
  });

  return missing;
};
