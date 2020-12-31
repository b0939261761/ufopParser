const decodeMap = {};
const win1251 = new TextDecoder('windows-1251');
for (let i = 0; i < 255; i++) {
  decodeMap[i] = win1251.decode(Uint8Array.from([i]));
}

export default value => {
  const str = value.toString();
  let result = '';

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    result += decodeMap[code] || str[i];
  }
  return result;
};
