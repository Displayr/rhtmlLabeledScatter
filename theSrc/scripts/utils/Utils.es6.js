const BigNumber = require('bignumber.js');

class Utils {

  static isNum(num) {
    return (num != null) && (typeof num === 'number');
  }

  static isArr(arr) {
    return (arr != null) && arr instanceof Array;
  }

  static isArrOfNums(arr) {
    return this.isArr(arr) && _.every(arr, n => _.isFinite(n));
  }

  static getSuperscript(id) {
    const superscript = [8304, 185, 178, 179, 8308, 8309, 8310, 8311, 8312, 8313]; // '⁰¹²³⁴⁵⁶⁷⁸⁹'
    let ss = '';
    while (id > 0) {
      const digit = id % 10;
      ss = String.fromCharCode(superscript[id % 10]) + ss;
      id = (id - digit) / 10;
    }
    return ss;
  }

  static getFormattedNum(num, decimals, prefix, suffix) {
    return prefix + (new BigNumber(num)).toFormat(decimals) + suffix;
  }
}

module.exports = Utils;
