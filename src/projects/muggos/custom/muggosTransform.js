const colorMap = {
  '[G] #FFFF00': 'Gold',
  '[G] #E0E0E0': 'Silver',
};

const muggosTransform = (fn) => (asset) => {
  const result = fn(asset);
  result['Muggo Color'] = colorMap[result['Muggo Color']];
  return result;
}

module.exports = muggosTransform;