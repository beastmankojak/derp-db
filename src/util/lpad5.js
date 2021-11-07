const lpad5 = (num) => '00000'.slice((num || '').toString().length) + (num || '');

module.exports = lpad5;