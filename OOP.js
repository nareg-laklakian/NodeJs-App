let employee = {
  baseSalary: 30000,
  overtime: 564,
  rate: 20,
  getWage: function () {
    return this.baseSalary + this.overtime * this.rate;
  },
};

// console.log(employee.getWage());

const F = function () {
  this.a = 1;
  this.b = 2;
  this.add = function () {
    a + this.b;
  };
};
