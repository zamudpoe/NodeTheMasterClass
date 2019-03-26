/*
*** Helpers for the app
*/

// Container app helper
var applib     = {}

// Smaple for testing that simply returns a number
applib.getANumber =  () => {
  return 1
}

// Is a palindrome ?
applib.itIsAPalindrome = (str) => {
  // Step 1. Lowercase the string and use the RegExp to remove unwanted characters from it
    var re = /[\W_]/g // or var re = /[^A-Za-z0-9]/g;

    var lowRegStr = str.toLowerCase().replace(re, '')
    // str.toLowerCase()          = "A man, a plan, a canal. Panama".toLowerCase() = "a man, a plan, a canal. panama"
    // str.replace(/[\W_]/g, '')  = "a man, a plan, a canal. panama".replace(/[\W_]/g, '') = "amanaplanacanalpanama"
    // var lowRegStr              = "amanaplanacanalpanama";

  // Step 2. Use the same chaining methods with built-in functions from the previous article 'Three Ways to Reverse a String in JavaScript'
    var reverseStr = lowRegStr.split('').reverse().join('')
    // lowRegStr.split('') = "amanaplanacanalpanama".split('') = ["a", "m", "a", "n", "a", "p", "l", "a", "n", "a", "c", "a", "n", "a", "l", "p", "a", "n", "a", "m", "a"]
    // ["a", "m", "a", "n", "a", "p", "l", "a", "n", "a", "c", "a", "n", "a", "l", "p", "a", "n", "a", "m", "a"].reverse() = ["a", "m", "a", "n", "a", "p", "l", "a", "n", "a", "c", "a", "n", "a", "l", "p", "a", "n", "a", "m", "a"]
    // ["a", "m", "a", "n", "a", "p", "l", "a", "n", "a", "c", "a", "n", "a", "l", "p", "a", "n", "a", "m", "a"].join('') = "amanaplanacanalpanama"
    // So, "amanaplanacanalpanama".split('').reverse().join('') = "amanaplanacanalpanama";
    // And, var reverseStr = "amanaplanacanalpanama";

  // Step 3. Check if reverseStr is strictly equals to lowRegStr and return a Boolean
    return reverseStr === lowRegStr // "amanaplanacanalpanama" === "amanaplanacanalpanama"? => true
}

// Leap Year
/* son bisiestos todos los años divisibles por 4, excluyendo los que sean divisibles por 100, pero no los que sean divisibles por 400. */
applib.itIsbisiesto = ( ano ) => {
  return ((ano % 4) == 0) && ((ano % 100) != 0 || (ano % 400) == 0) ?  true :  0
}

// Obtener el signo zodiacal dado el dia y el mes
applib.getSign = (dia, mes) => {
  var signo = ""

  switch (mes) {
    case 1            :
      if (dia > 21) {
        signo     = "ACUARIO"
      } else {
        signo     = "CAPRICORNIO"
      }
      break;
    case 2            :
      if (dia > 19) {
        signo = "PISCIS"
      } else {
        signo = "ACUARIO"
      }
      break;
    case 3            :
      if (dia > 20) {
        signo = "ARIES"
      } else {
        signo = "PISCIS"
      }
      break;
    case 4            :
      if (dia > 20) {
        signo = "TAURO"
      } else {
        signo = "ARIES"
      }
      break;
    case 5            :
      if (dia > 21) {
        signo = "GEMINIS"
      } else {
        signo = "TAURO"
      }
      break;
    case 6            :
      if (dia > 20) {
        signo = "CANCER"
      } else {
        signo = "GEMINIS"
      }
      break;
    case 7            :
      if (dia > 22) {
        signo = "LEO"
      } else {
        signo = "CANCER"
      }
      break;
    case 8            :
      if (dia > 21) {
        signo = "VIRGO"
      } else {
        signo = "LEO"
      }
      break;
    case 9            :
      if (dia > 22) {
        signo = "LIBRA"
      } else {
        signo = "VIRGO"
      }
      break;
    case 10           :
      if (dia > 22) {
        signo = "ESCORPION"
      } else {
        signo = "LIBRA"
      }
      break;
    case 11           :
      if (dia > 21) {
        signo = "SAGITARIO"
      } else {
        signo = "ESCORPION"
      }
      break;
    case 12           :
      if (dia > 21) {
        signo = "CAPRICORNIO"
      } else {
        signo = "SAGITARIO"
      }
      break;
  }
  return signo
}

// Export the module applib
module.exports = applib
