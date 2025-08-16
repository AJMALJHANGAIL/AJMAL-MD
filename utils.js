
const delay = (ms)=> new Promise(r=>setTimeout(r, ms));
const chunk = (arr, size)=> arr.reduce((acc,_,i)=> (i % size ? acc : [...acc, arr.slice(i, i+size)]), []);
module.exports = { delay, chunk };
