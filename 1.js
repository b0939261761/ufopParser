const options = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric'
};

console.log(new Intl.DateTimeFormat('ru', options).format(new Date()), 'START');
