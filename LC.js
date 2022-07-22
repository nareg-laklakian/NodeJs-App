const numbers = [1, 2, 3, 4, 3];

let containsDuplicate = function (num) {
  const set = new Set([...num]);
  console.log(set);
  return set.size != num.length;
};

// let containsDuplicate = function (nums) {
//   let i = 0;
//   console.log(i);
// };

console.log(numbers);

console.log(containsDuplicate(numbers));
