(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Utils = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*! bignumber.js v2.4.0 https://github.com/MikeMcl/bignumber.js/LICENCE */

;(function (globalObj) {
    'use strict';

    /*
      bignumber.js v2.4.0
      A JavaScript library for arbitrary-precision arithmetic.
      https://github.com/MikeMcl/bignumber.js
      Copyright (c) 2016 Michael Mclaughlin <M8ch88l@gmail.com>
      MIT Expat Licence
    */


    var BigNumber, cryptoObj, parseNumeric,
        isNumeric = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
        mathceil = Math.ceil,
        mathfloor = Math.floor,
        notBool = ' not a boolean or binary digit',
        roundingMode = 'rounding mode',
        tooManyDigits = 'number type has more than 15 significant digits',
        ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_',
        BASE = 1e14,
        LOG_BASE = 14,
        MAX_SAFE_INTEGER = 0x1fffffffffffff,         // 2^53 - 1
        // MAX_INT32 = 0x7fffffff,                   // 2^31 - 1
        POWS_TEN = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13],
        SQRT_BASE = 1e7,

        /*
         * The limit on the value of DECIMAL_PLACES, TO_EXP_NEG, TO_EXP_POS, MIN_EXP, MAX_EXP, and
         * the arguments to toExponential, toFixed, toFormat, and toPrecision, beyond which an
         * exception is thrown (if ERRORS is true).
         */
        MAX = 1E9;                                   // 0 to MAX_INT32

    if ( typeof crypto != 'undefined' ) cryptoObj = crypto;


    /*
     * Create and return a BigNumber constructor.
     */
    function constructorFactory(configObj) {
        var div,

            // id tracks the caller function, so its name can be included in error messages.
            id = 0,
            P = BigNumber.prototype,
            ONE = new BigNumber(1),


            /********************************* EDITABLE DEFAULTS **********************************/


            /*
             * The default values below must be integers within the inclusive ranges stated.
             * The values can also be changed at run-time using BigNumber.config.
             */

            // The maximum number of decimal places for operations involving division.
            DECIMAL_PLACES = 20,                     // 0 to MAX

            /*
             * The rounding mode used when rounding to the above decimal places, and when using
             * toExponential, toFixed, toFormat and toPrecision, and round (default value).
             * UP         0 Away from zero.
             * DOWN       1 Towards zero.
             * CEIL       2 Towards +Infinity.
             * FLOOR      3 Towards -Infinity.
             * HALF_UP    4 Towards nearest neighbour. If equidistant, up.
             * HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
             * HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
             * HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
             * HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
             */
            ROUNDING_MODE = 4,                       // 0 to 8

            // EXPONENTIAL_AT : [TO_EXP_NEG , TO_EXP_POS]

            // The exponent value at and beneath which toString returns exponential notation.
            // Number type: -7
            TO_EXP_NEG = -7,                         // 0 to -MAX

            // The exponent value at and above which toString returns exponential notation.
            // Number type: 21
            TO_EXP_POS = 21,                         // 0 to MAX

            // RANGE : [MIN_EXP, MAX_EXP]

            // The minimum exponent value, beneath which underflow to zero occurs.
            // Number type: -324  (5e-324)
            MIN_EXP = -1e7,                          // -1 to -MAX

            // The maximum exponent value, above which overflow to Infinity occurs.
            // Number type:  308  (1.7976931348623157e+308)
            // For MAX_EXP > 1e7, e.g. new BigNumber('1e100000000').plus(1) may be slow.
            MAX_EXP = 1e7,                           // 1 to MAX

            // Whether BigNumber Errors are ever thrown.
            ERRORS = true,                           // true or false

            // Change to intValidatorNoErrors if ERRORS is false.
            isValidInt = intValidatorWithErrors,     // intValidatorWithErrors/intValidatorNoErrors

            // Whether to use cryptographically-secure random number generation, if available.
            CRYPTO = false,                          // true or false

            /*
             * The modulo mode used when calculating the modulus: a mod n.
             * The quotient (q = a / n) is calculated according to the corresponding rounding mode.
             * The remainder (r) is calculated as: r = a - n * q.
             *
             * UP        0 The remainder is positive if the dividend is negative, else is negative.
             * DOWN      1 The remainder has the same sign as the dividend.
             *             This modulo mode is commonly known as 'truncated division' and is
             *             equivalent to (a % n) in JavaScript.
             * FLOOR     3 The remainder has the same sign as the divisor (Python %).
             * HALF_EVEN 6 This modulo mode implements the IEEE 754 remainder function.
             * EUCLID    9 Euclidian division. q = sign(n) * floor(a / abs(n)).
             *             The remainder is always positive.
             *
             * The truncated division, floored division, Euclidian division and IEEE 754 remainder
             * modes are commonly used for the modulus operation.
             * Although the other rounding modes can also be used, they may not give useful results.
             */
            MODULO_MODE = 1,                         // 0 to 9

            // The maximum number of significant digits of the result of the toPower operation.
            // If POW_PRECISION is 0, there will be unlimited significant digits.
            POW_PRECISION = 100,                     // 0 to MAX

            // The format specification used by the BigNumber.prototype.toFormat method.
            FORMAT = {
                decimalSeparator: '.',
                groupSeparator: ',',
                groupSize: 3,
                secondaryGroupSize: 0,
                fractionGroupSeparator: '\xA0',      // non-breaking space
                fractionGroupSize: 0
            };


        /******************************************************************************************/


        // CONSTRUCTOR


        /*
         * The BigNumber constructor and exported function.
         * Create and return a new instance of a BigNumber object.
         *
         * n {number|string|BigNumber} A numeric value.
         * [b] {number} The base of n. Integer, 2 to 64 inclusive.
         */
        function BigNumber( n, b ) {
            var c, e, i, num, len, str,
                x = this;

            // Enable constructor usage without new.
            if ( !( x instanceof BigNumber ) ) {

                // 'BigNumber() constructor call without new: {n}'
                if (ERRORS) raise( 26, 'constructor call without new', n );
                return new BigNumber( n, b );
            }

            // 'new BigNumber() base not an integer: {b}'
            // 'new BigNumber() base out of range: {b}'
            if ( b == null || !isValidInt( b, 2, 64, id, 'base' ) ) {

                // Duplicate.
                if ( n instanceof BigNumber ) {
                    x.s = n.s;
                    x.e = n.e;
                    x.c = ( n = n.c ) ? n.slice() : n;
                    id = 0;
                    return;
                }

                if ( ( num = typeof n == 'number' ) && n * 0 == 0 ) {
                    x.s = 1 / n < 0 ? ( n = -n, -1 ) : 1;

                    // Fast path for integers.
                    if ( n === ~~n ) {
                        for ( e = 0, i = n; i >= 10; i /= 10, e++ );
                        x.e = e;
                        x.c = [n];
                        id = 0;
                        return;
                    }

                    str = n + '';
                } else {
                    if ( !isNumeric.test( str = n + '' ) ) return parseNumeric( x, str, num );
                    x.s = str.charCodeAt(0) === 45 ? ( str = str.slice(1), -1 ) : 1;
                }
            } else {
                b = b | 0;
                str = n + '';

                // Ensure return value is rounded to DECIMAL_PLACES as with other bases.
                // Allow exponential notation to be used with base 10 argument.
                if ( b == 10 ) {
                    x = new BigNumber( n instanceof BigNumber ? n : str );
                    return round( x, DECIMAL_PLACES + x.e + 1, ROUNDING_MODE );
                }

                // Avoid potential interpretation of Infinity and NaN as base 44+ values.
                // Any number in exponential form will fail due to the [Ee][+-].
                if ( ( num = typeof n == 'number' ) && n * 0 != 0 ||
                  !( new RegExp( '^-?' + ( c = '[' + ALPHABET.slice( 0, b ) + ']+' ) +
                    '(?:\\.' + c + ')?$',b < 37 ? 'i' : '' ) ).test(str) ) {
                    return parseNumeric( x, str, num, b );
                }

                if (num) {
                    x.s = 1 / n < 0 ? ( str = str.slice(1), -1 ) : 1;

                    if ( ERRORS && str.replace( /^0\.0*|\./, '' ).length > 15 ) {

                        // 'new BigNumber() number type has more than 15 significant digits: {n}'
                        raise( id, tooManyDigits, n );
                    }

                    // Prevent later check for length on converted number.
                    num = false;
                } else {
                    x.s = str.charCodeAt(0) === 45 ? ( str = str.slice(1), -1 ) : 1;
                }

                str = convertBase( str, 10, b, x.s );
            }

            // Decimal point?
            if ( ( e = str.indexOf('.') ) > -1 ) str = str.replace( '.', '' );

            // Exponential form?
            if ( ( i = str.search( /e/i ) ) > 0 ) {

                // Determine exponent.
                if ( e < 0 ) e = i;
                e += +str.slice( i + 1 );
                str = str.substring( 0, i );
            } else if ( e < 0 ) {

                // Integer.
                e = str.length;
            }

            // Determine leading zeros.
            for ( i = 0; str.charCodeAt(i) === 48; i++ );

            // Determine trailing zeros.
            for ( len = str.length; str.charCodeAt(--len) === 48; );
            str = str.slice( i, len + 1 );

            if (str) {
                len = str.length;

                // Disallow numbers with over 15 significant digits if number type.
                // 'new BigNumber() number type has more than 15 significant digits: {n}'
                if ( num && ERRORS && len > 15 && ( n > MAX_SAFE_INTEGER || n !== mathfloor(n) ) ) {
                    raise( id, tooManyDigits, x.s * n );
                }

                e = e - i - 1;

                 // Overflow?
                if ( e > MAX_EXP ) {

                    // Infinity.
                    x.c = x.e = null;

                // Underflow?
                } else if ( e < MIN_EXP ) {

                    // Zero.
                    x.c = [ x.e = 0 ];
                } else {
                    x.e = e;
                    x.c = [];

                    // Transform base

                    // e is the base 10 exponent.
                    // i is where to slice str to get the first element of the coefficient array.
                    i = ( e + 1 ) % LOG_BASE;
                    if ( e < 0 ) i += LOG_BASE;

                    if ( i < len ) {
                        if (i) x.c.push( +str.slice( 0, i ) );

                        for ( len -= LOG_BASE; i < len; ) {
                            x.c.push( +str.slice( i, i += LOG_BASE ) );
                        }

                        str = str.slice(i);
                        i = LOG_BASE - str.length;
                    } else {
                        i -= len;
                    }

                    for ( ; i--; str += '0' );
                    x.c.push( +str );
                }
            } else {

                // Zero.
                x.c = [ x.e = 0 ];
            }

            id = 0;
        }


        // CONSTRUCTOR PROPERTIES


        BigNumber.another = constructorFactory;

        BigNumber.ROUND_UP = 0;
        BigNumber.ROUND_DOWN = 1;
        BigNumber.ROUND_CEIL = 2;
        BigNumber.ROUND_FLOOR = 3;
        BigNumber.ROUND_HALF_UP = 4;
        BigNumber.ROUND_HALF_DOWN = 5;
        BigNumber.ROUND_HALF_EVEN = 6;
        BigNumber.ROUND_HALF_CEIL = 7;
        BigNumber.ROUND_HALF_FLOOR = 8;
        BigNumber.EUCLID = 9;


        /*
         * Configure infrequently-changing library-wide settings.
         *
         * Accept an object or an argument list, with one or many of the following properties or
         * parameters respectively:
         *
         *   DECIMAL_PLACES  {number}  Integer, 0 to MAX inclusive
         *   ROUNDING_MODE   {number}  Integer, 0 to 8 inclusive
         *   EXPONENTIAL_AT  {number|number[]}  Integer, -MAX to MAX inclusive or
         *                                      [integer -MAX to 0 incl., 0 to MAX incl.]
         *   RANGE           {number|number[]}  Non-zero integer, -MAX to MAX inclusive or
         *                                      [integer -MAX to -1 incl., integer 1 to MAX incl.]
         *   ERRORS          {boolean|number}   true, false, 1 or 0
         *   CRYPTO          {boolean|number}   true, false, 1 or 0
         *   MODULO_MODE     {number}           0 to 9 inclusive
         *   POW_PRECISION   {number}           0 to MAX inclusive
         *   FORMAT          {object}           See BigNumber.prototype.toFormat
         *      decimalSeparator       {string}
         *      groupSeparator         {string}
         *      groupSize              {number}
         *      secondaryGroupSize     {number}
         *      fractionGroupSeparator {string}
         *      fractionGroupSize      {number}
         *
         * (The values assigned to the above FORMAT object properties are not checked for validity.)
         *
         * E.g.
         * BigNumber.config(20, 4) is equivalent to
         * BigNumber.config({ DECIMAL_PLACES : 20, ROUNDING_MODE : 4 })
         *
         * Ignore properties/parameters set to null or undefined.
         * Return an object with the properties current values.
         */
        BigNumber.config = function () {
            var v, p,
                i = 0,
                r = {},
                a = arguments,
                o = a[0],
                has = o && typeof o == 'object'
                  ? function () { if ( o.hasOwnProperty(p) ) return ( v = o[p] ) != null; }
                  : function () { if ( a.length > i ) return ( v = a[i++] ) != null; };

            // DECIMAL_PLACES {number} Integer, 0 to MAX inclusive.
            // 'config() DECIMAL_PLACES not an integer: {v}'
            // 'config() DECIMAL_PLACES out of range: {v}'
            if ( has( p = 'DECIMAL_PLACES' ) && isValidInt( v, 0, MAX, 2, p ) ) {
                DECIMAL_PLACES = v | 0;
            }
            r[p] = DECIMAL_PLACES;

            // ROUNDING_MODE {number} Integer, 0 to 8 inclusive.
            // 'config() ROUNDING_MODE not an integer: {v}'
            // 'config() ROUNDING_MODE out of range: {v}'
            if ( has( p = 'ROUNDING_MODE' ) && isValidInt( v, 0, 8, 2, p ) ) {
                ROUNDING_MODE = v | 0;
            }
            r[p] = ROUNDING_MODE;

            // EXPONENTIAL_AT {number|number[]}
            // Integer, -MAX to MAX inclusive or [integer -MAX to 0 inclusive, 0 to MAX inclusive].
            // 'config() EXPONENTIAL_AT not an integer: {v}'
            // 'config() EXPONENTIAL_AT out of range: {v}'
            if ( has( p = 'EXPONENTIAL_AT' ) ) {

                if ( isArray(v) ) {
                    if ( isValidInt( v[0], -MAX, 0, 2, p ) && isValidInt( v[1], 0, MAX, 2, p ) ) {
                        TO_EXP_NEG = v[0] | 0;
                        TO_EXP_POS = v[1] | 0;
                    }
                } else if ( isValidInt( v, -MAX, MAX, 2, p ) ) {
                    TO_EXP_NEG = -( TO_EXP_POS = ( v < 0 ? -v : v ) | 0 );
                }
            }
            r[p] = [ TO_EXP_NEG, TO_EXP_POS ];

            // RANGE {number|number[]} Non-zero integer, -MAX to MAX inclusive or
            // [integer -MAX to -1 inclusive, integer 1 to MAX inclusive].
            // 'config() RANGE not an integer: {v}'
            // 'config() RANGE cannot be zero: {v}'
            // 'config() RANGE out of range: {v}'
            if ( has( p = 'RANGE' ) ) {

                if ( isArray(v) ) {
                    if ( isValidInt( v[0], -MAX, -1, 2, p ) && isValidInt( v[1], 1, MAX, 2, p ) ) {
                        MIN_EXP = v[0] | 0;
                        MAX_EXP = v[1] | 0;
                    }
                } else if ( isValidInt( v, -MAX, MAX, 2, p ) ) {
                    if ( v | 0 ) MIN_EXP = -( MAX_EXP = ( v < 0 ? -v : v ) | 0 );
                    else if (ERRORS) raise( 2, p + ' cannot be zero', v );
                }
            }
            r[p] = [ MIN_EXP, MAX_EXP ];

            // ERRORS {boolean|number} true, false, 1 or 0.
            // 'config() ERRORS not a boolean or binary digit: {v}'
            if ( has( p = 'ERRORS' ) ) {

                if ( v === !!v || v === 1 || v === 0 ) {
                    id = 0;
                    isValidInt = ( ERRORS = !!v ) ? intValidatorWithErrors : intValidatorNoErrors;
                } else if (ERRORS) {
                    raise( 2, p + notBool, v );
                }
            }
            r[p] = ERRORS;

            // CRYPTO {boolean|number} true, false, 1 or 0.
            // 'config() CRYPTO not a boolean or binary digit: {v}'
            // 'config() crypto unavailable: {crypto}'
            if ( has( p = 'CRYPTO' ) ) {

                if ( v === !!v || v === 1 || v === 0 ) {
                    CRYPTO = !!( v && cryptoObj );
                    if ( v && !CRYPTO && ERRORS ) raise( 2, 'crypto unavailable', cryptoObj );
                } else if (ERRORS) {
                    raise( 2, p + notBool, v );
                }
            }
            r[p] = CRYPTO;

            // MODULO_MODE {number} Integer, 0 to 9 inclusive.
            // 'config() MODULO_MODE not an integer: {v}'
            // 'config() MODULO_MODE out of range: {v}'
            if ( has( p = 'MODULO_MODE' ) && isValidInt( v, 0, 9, 2, p ) ) {
                MODULO_MODE = v | 0;
            }
            r[p] = MODULO_MODE;

            // POW_PRECISION {number} Integer, 0 to MAX inclusive.
            // 'config() POW_PRECISION not an integer: {v}'
            // 'config() POW_PRECISION out of range: {v}'
            if ( has( p = 'POW_PRECISION' ) && isValidInt( v, 0, MAX, 2, p ) ) {
                POW_PRECISION = v | 0;
            }
            r[p] = POW_PRECISION;

            // FORMAT {object}
            // 'config() FORMAT not an object: {v}'
            if ( has( p = 'FORMAT' ) ) {

                if ( typeof v == 'object' ) {
                    FORMAT = v;
                } else if (ERRORS) {
                    raise( 2, p + ' not an object', v );
                }
            }
            r[p] = FORMAT;

            return r;
        };


        /*
         * Return a new BigNumber whose value is the maximum of the arguments.
         *
         * arguments {number|string|BigNumber}
         */
        BigNumber.max = function () { return maxOrMin( arguments, P.lt ); };


        /*
         * Return a new BigNumber whose value is the minimum of the arguments.
         *
         * arguments {number|string|BigNumber}
         */
        BigNumber.min = function () { return maxOrMin( arguments, P.gt ); };


        /*
         * Return a new BigNumber with a random value equal to or greater than 0 and less than 1,
         * and with dp, or DECIMAL_PLACES if dp is omitted, decimal places (or less if trailing
         * zeros are produced).
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         *
         * 'random() decimal places not an integer: {dp}'
         * 'random() decimal places out of range: {dp}'
         * 'random() crypto unavailable: {crypto}'
         */
        BigNumber.random = (function () {
            var pow2_53 = 0x20000000000000;

            // Return a 53 bit integer n, where 0 <= n < 9007199254740992.
            // Check if Math.random() produces more than 32 bits of randomness.
            // If it does, assume at least 53 bits are produced, otherwise assume at least 30 bits.
            // 0x40000000 is 2^30, 0x800000 is 2^23, 0x1fffff is 2^21 - 1.
            var random53bitInt = (Math.random() * pow2_53) & 0x1fffff
              ? function () { return mathfloor( Math.random() * pow2_53 ); }
              : function () { return ((Math.random() * 0x40000000 | 0) * 0x800000) +
                  (Math.random() * 0x800000 | 0); };

            return function (dp) {
                var a, b, e, k, v,
                    i = 0,
                    c = [],
                    rand = new BigNumber(ONE);

                dp = dp == null || !isValidInt( dp, 0, MAX, 14 ) ? DECIMAL_PLACES : dp | 0;
                k = mathceil( dp / LOG_BASE );

                if (CRYPTO) {

                    // Browsers supporting crypto.getRandomValues.
                    if ( cryptoObj && cryptoObj.getRandomValues ) {

                        a = cryptoObj.getRandomValues( new Uint32Array( k *= 2 ) );

                        for ( ; i < k; ) {

                            // 53 bits:
                            // ((Math.pow(2, 32) - 1) * Math.pow(2, 21)).toString(2)
                            // 11111 11111111 11111111 11111111 11100000 00000000 00000000
                            // ((Math.pow(2, 32) - 1) >>> 11).toString(2)
                            //                                     11111 11111111 11111111
                            // 0x20000 is 2^21.
                            v = a[i] * 0x20000 + (a[i + 1] >>> 11);

                            // Rejection sampling:
                            // 0 <= v < 9007199254740992
                            // Probability that v >= 9e15, is
                            // 7199254740992 / 9007199254740992 ~= 0.0008, i.e. 1 in 1251
                            if ( v >= 9e15 ) {
                                b = cryptoObj.getRandomValues( new Uint32Array(2) );
                                a[i] = b[0];
                                a[i + 1] = b[1];
                            } else {

                                // 0 <= v <= 8999999999999999
                                // 0 <= (v % 1e14) <= 99999999999999
                                c.push( v % 1e14 );
                                i += 2;
                            }
                        }
                        i = k / 2;

                    // Node.js supporting crypto.randomBytes.
                    } else if ( cryptoObj && cryptoObj.randomBytes ) {

                        // buffer
                        a = cryptoObj.randomBytes( k *= 7 );

                        for ( ; i < k; ) {

                            // 0x1000000000000 is 2^48, 0x10000000000 is 2^40
                            // 0x100000000 is 2^32, 0x1000000 is 2^24
                            // 11111 11111111 11111111 11111111 11111111 11111111 11111111
                            // 0 <= v < 9007199254740992
                            v = ( ( a[i] & 31 ) * 0x1000000000000 ) + ( a[i + 1] * 0x10000000000 ) +
                                  ( a[i + 2] * 0x100000000 ) + ( a[i + 3] * 0x1000000 ) +
                                  ( a[i + 4] << 16 ) + ( a[i + 5] << 8 ) + a[i + 6];

                            if ( v >= 9e15 ) {
                                cryptoObj.randomBytes(7).copy( a, i );
                            } else {

                                // 0 <= (v % 1e14) <= 99999999999999
                                c.push( v % 1e14 );
                                i += 7;
                            }
                        }
                        i = k / 7;
                    } else if (ERRORS) {
                        raise( 14, 'crypto unavailable', cryptoObj );
                    }
                }

                // Use Math.random: CRYPTO is false or crypto is unavailable and ERRORS is false.
                if (!i) {

                    for ( ; i < k; ) {
                        v = random53bitInt();
                        if ( v < 9e15 ) c[i++] = v % 1e14;
                    }
                }

                k = c[--i];
                dp %= LOG_BASE;

                // Convert trailing digits to zeros according to dp.
                if ( k && dp ) {
                    v = POWS_TEN[LOG_BASE - dp];
                    c[i] = mathfloor( k / v ) * v;
                }

                // Remove trailing elements which are zero.
                for ( ; c[i] === 0; c.pop(), i-- );

                // Zero?
                if ( i < 0 ) {
                    c = [ e = 0 ];
                } else {

                    // Remove leading elements which are zero and adjust exponent accordingly.
                    for ( e = -1 ; c[0] === 0; c.shift(), e -= LOG_BASE);

                    // Count the digits of the first element of c to determine leading zeros, and...
                    for ( i = 1, v = c[0]; v >= 10; v /= 10, i++);

                    // adjust the exponent accordingly.
                    if ( i < LOG_BASE ) e -= LOG_BASE - i;
                }

                rand.e = e;
                rand.c = c;
                return rand;
            };
        })();


        // PRIVATE FUNCTIONS


        // Convert a numeric string of baseIn to a numeric string of baseOut.
        function convertBase( str, baseOut, baseIn, sign ) {
            var d, e, k, r, x, xc, y,
                i = str.indexOf( '.' ),
                dp = DECIMAL_PLACES,
                rm = ROUNDING_MODE;

            if ( baseIn < 37 ) str = str.toLowerCase();

            // Non-integer.
            if ( i >= 0 ) {
                k = POW_PRECISION;

                // Unlimited precision.
                POW_PRECISION = 0;
                str = str.replace( '.', '' );
                y = new BigNumber(baseIn);
                x = y.pow( str.length - i );
                POW_PRECISION = k;

                // Convert str as if an integer, then restore the fraction part by dividing the
                // result by its base raised to a power.
                y.c = toBaseOut( toFixedPoint( coeffToString( x.c ), x.e ), 10, baseOut );
                y.e = y.c.length;
            }

            // Convert the number as integer.
            xc = toBaseOut( str, baseIn, baseOut );
            e = k = xc.length;

            // Remove trailing zeros.
            for ( ; xc[--k] == 0; xc.pop() );
            if ( !xc[0] ) return '0';

            if ( i < 0 ) {
                --e;
            } else {
                x.c = xc;
                x.e = e;

                // sign is needed for correct rounding.
                x.s = sign;
                x = div( x, y, dp, rm, baseOut );
                xc = x.c;
                r = x.r;
                e = x.e;
            }

            d = e + dp + 1;

            // The rounding digit, i.e. the digit to the right of the digit that may be rounded up.
            i = xc[d];
            k = baseOut / 2;
            r = r || d < 0 || xc[d + 1] != null;

            r = rm < 4 ? ( i != null || r ) && ( rm == 0 || rm == ( x.s < 0 ? 3 : 2 ) )
                       : i > k || i == k &&( rm == 4 || r || rm == 6 && xc[d - 1] & 1 ||
                         rm == ( x.s < 0 ? 8 : 7 ) );

            if ( d < 1 || !xc[0] ) {

                // 1^-dp or 0.
                str = r ? toFixedPoint( '1', -dp ) : '0';
            } else {
                xc.length = d;

                if (r) {

                    // Rounding up may mean the previous digit has to be rounded up and so on.
                    for ( --baseOut; ++xc[--d] > baseOut; ) {
                        xc[d] = 0;

                        if ( !d ) {
                            ++e;
                            xc.unshift(1);
                        }
                    }
                }

                // Determine trailing zeros.
                for ( k = xc.length; !xc[--k]; );

                // E.g. [4, 11, 15] becomes 4bf.
                for ( i = 0, str = ''; i <= k; str += ALPHABET.charAt( xc[i++] ) );
                str = toFixedPoint( str, e );
            }

            // The caller will add the sign.
            return str;
        }


        // Perform division in the specified base. Called by div and convertBase.
        div = (function () {

            // Assume non-zero x and k.
            function multiply( x, k, base ) {
                var m, temp, xlo, xhi,
                    carry = 0,
                    i = x.length,
                    klo = k % SQRT_BASE,
                    khi = k / SQRT_BASE | 0;

                for ( x = x.slice(); i--; ) {
                    xlo = x[i] % SQRT_BASE;
                    xhi = x[i] / SQRT_BASE | 0;
                    m = khi * xlo + xhi * klo;
                    temp = klo * xlo + ( ( m % SQRT_BASE ) * SQRT_BASE ) + carry;
                    carry = ( temp / base | 0 ) + ( m / SQRT_BASE | 0 ) + khi * xhi;
                    x[i] = temp % base;
                }

                if (carry) x.unshift(carry);

                return x;
            }

            function compare( a, b, aL, bL ) {
                var i, cmp;

                if ( aL != bL ) {
                    cmp = aL > bL ? 1 : -1;
                } else {

                    for ( i = cmp = 0; i < aL; i++ ) {

                        if ( a[i] != b[i] ) {
                            cmp = a[i] > b[i] ? 1 : -1;
                            break;
                        }
                    }
                }
                return cmp;
            }

            function subtract( a, b, aL, base ) {
                var i = 0;

                // Subtract b from a.
                for ( ; aL--; ) {
                    a[aL] -= i;
                    i = a[aL] < b[aL] ? 1 : 0;
                    a[aL] = i * base + a[aL] - b[aL];
                }

                // Remove leading zeros.
                for ( ; !a[0] && a.length > 1; a.shift() );
            }

            // x: dividend, y: divisor.
            return function ( x, y, dp, rm, base ) {
                var cmp, e, i, more, n, prod, prodL, q, qc, rem, remL, rem0, xi, xL, yc0,
                    yL, yz,
                    s = x.s == y.s ? 1 : -1,
                    xc = x.c,
                    yc = y.c;

                // Either NaN, Infinity or 0?
                if ( !xc || !xc[0] || !yc || !yc[0] ) {

                    return new BigNumber(

                      // Return NaN if either NaN, or both Infinity or 0.
                      !x.s || !y.s || ( xc ? yc && xc[0] == yc[0] : !yc ) ? NaN :

                        // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
                        xc && xc[0] == 0 || !yc ? s * 0 : s / 0
                    );
                }

                q = new BigNumber(s);
                qc = q.c = [];
                e = x.e - y.e;
                s = dp + e + 1;

                if ( !base ) {
                    base = BASE;
                    e = bitFloor( x.e / LOG_BASE ) - bitFloor( y.e / LOG_BASE );
                    s = s / LOG_BASE | 0;
                }

                // Result exponent may be one less then the current value of e.
                // The coefficients of the BigNumbers from convertBase may have trailing zeros.
                for ( i = 0; yc[i] == ( xc[i] || 0 ); i++ );
                if ( yc[i] > ( xc[i] || 0 ) ) e--;

                if ( s < 0 ) {
                    qc.push(1);
                    more = true;
                } else {
                    xL = xc.length;
                    yL = yc.length;
                    i = 0;
                    s += 2;

                    // Normalise xc and yc so highest order digit of yc is >= base / 2.

                    n = mathfloor( base / ( yc[0] + 1 ) );

                    // Not necessary, but to handle odd bases where yc[0] == ( base / 2 ) - 1.
                    // if ( n > 1 || n++ == 1 && yc[0] < base / 2 ) {
                    if ( n > 1 ) {
                        yc = multiply( yc, n, base );
                        xc = multiply( xc, n, base );
                        yL = yc.length;
                        xL = xc.length;
                    }

                    xi = yL;
                    rem = xc.slice( 0, yL );
                    remL = rem.length;

                    // Add zeros to make remainder as long as divisor.
                    for ( ; remL < yL; rem[remL++] = 0 );
                    yz = yc.slice();
                    yz.unshift(0);
                    yc0 = yc[0];
                    if ( yc[1] >= base / 2 ) yc0++;
                    // Not necessary, but to prevent trial digit n > base, when using base 3.
                    // else if ( base == 3 && yc0 == 1 ) yc0 = 1 + 1e-15;

                    do {
                        n = 0;

                        // Compare divisor and remainder.
                        cmp = compare( yc, rem, yL, remL );

                        // If divisor < remainder.
                        if ( cmp < 0 ) {

                            // Calculate trial digit, n.

                            rem0 = rem[0];
                            if ( yL != remL ) rem0 = rem0 * base + ( rem[1] || 0 );

                            // n is how many times the divisor goes into the current remainder.
                            n = mathfloor( rem0 / yc0 );

                            //  Algorithm:
                            //  1. product = divisor * trial digit (n)
                            //  2. if product > remainder: product -= divisor, n--
                            //  3. remainder -= product
                            //  4. if product was < remainder at 2:
                            //    5. compare new remainder and divisor
                            //    6. If remainder > divisor: remainder -= divisor, n++

                            if ( n > 1 ) {

                                // n may be > base only when base is 3.
                                if (n >= base) n = base - 1;

                                // product = divisor * trial digit.
                                prod = multiply( yc, n, base );
                                prodL = prod.length;
                                remL = rem.length;

                                // Compare product and remainder.
                                // If product > remainder.
                                // Trial digit n too high.
                                // n is 1 too high about 5% of the time, and is not known to have
                                // ever been more than 1 too high.
                                while ( compare( prod, rem, prodL, remL ) == 1 ) {
                                    n--;

                                    // Subtract divisor from product.
                                    subtract( prod, yL < prodL ? yz : yc, prodL, base );
                                    prodL = prod.length;
                                    cmp = 1;
                                }
                            } else {

                                // n is 0 or 1, cmp is -1.
                                // If n is 0, there is no need to compare yc and rem again below,
                                // so change cmp to 1 to avoid it.
                                // If n is 1, leave cmp as -1, so yc and rem are compared again.
                                if ( n == 0 ) {

                                    // divisor < remainder, so n must be at least 1.
                                    cmp = n = 1;
                                }

                                // product = divisor
                                prod = yc.slice();
                                prodL = prod.length;
                            }

                            if ( prodL < remL ) prod.unshift(0);

                            // Subtract product from remainder.
                            subtract( rem, prod, remL, base );
                            remL = rem.length;

                             // If product was < remainder.
                            if ( cmp == -1 ) {

                                // Compare divisor and new remainder.
                                // If divisor < new remainder, subtract divisor from remainder.
                                // Trial digit n too low.
                                // n is 1 too low about 5% of the time, and very rarely 2 too low.
                                while ( compare( yc, rem, yL, remL ) < 1 ) {
                                    n++;

                                    // Subtract divisor from remainder.
                                    subtract( rem, yL < remL ? yz : yc, remL, base );
                                    remL = rem.length;
                                }
                            }
                        } else if ( cmp === 0 ) {
                            n++;
                            rem = [0];
                        } // else cmp === 1 and n will be 0

                        // Add the next digit, n, to the result array.
                        qc[i++] = n;

                        // Update the remainder.
                        if ( rem[0] ) {
                            rem[remL++] = xc[xi] || 0;
                        } else {
                            rem = [ xc[xi] ];
                            remL = 1;
                        }
                    } while ( ( xi++ < xL || rem[0] != null ) && s-- );

                    more = rem[0] != null;

                    // Leading zero?
                    if ( !qc[0] ) qc.shift();
                }

                if ( base == BASE ) {

                    // To calculate q.e, first get the number of digits of qc[0].
                    for ( i = 1, s = qc[0]; s >= 10; s /= 10, i++ );
                    round( q, dp + ( q.e = i + e * LOG_BASE - 1 ) + 1, rm, more );

                // Caller is convertBase.
                } else {
                    q.e = e;
                    q.r = +more;
                }

                return q;
            };
        })();


        /*
         * Return a string representing the value of BigNumber n in fixed-point or exponential
         * notation rounded to the specified decimal places or significant digits.
         *
         * n is a BigNumber.
         * i is the index of the last digit required (i.e. the digit that may be rounded up).
         * rm is the rounding mode.
         * caller is caller id: toExponential 19, toFixed 20, toFormat 21, toPrecision 24.
         */
        function format( n, i, rm, caller ) {
            var c0, e, ne, len, str;

            rm = rm != null && isValidInt( rm, 0, 8, caller, roundingMode )
              ? rm | 0 : ROUNDING_MODE;

            if ( !n.c ) return n.toString();
            c0 = n.c[0];
            ne = n.e;

            if ( i == null ) {
                str = coeffToString( n.c );
                str = caller == 19 || caller == 24 && ne <= TO_EXP_NEG
                  ? toExponential( str, ne )
                  : toFixedPoint( str, ne );
            } else {
                n = round( new BigNumber(n), i, rm );

                // n.e may have changed if the value was rounded up.
                e = n.e;

                str = coeffToString( n.c );
                len = str.length;

                // toPrecision returns exponential notation if the number of significant digits
                // specified is less than the number of digits necessary to represent the integer
                // part of the value in fixed-point notation.

                // Exponential notation.
                if ( caller == 19 || caller == 24 && ( i <= e || e <= TO_EXP_NEG ) ) {

                    // Append zeros?
                    for ( ; len < i; str += '0', len++ );
                    str = toExponential( str, e );

                // Fixed-point notation.
                } else {
                    i -= ne;
                    str = toFixedPoint( str, e );

                    // Append zeros?
                    if ( e + 1 > len ) {
                        if ( --i > 0 ) for ( str += '.'; i--; str += '0' );
                    } else {
                        i += e - len;
                        if ( i > 0 ) {
                            if ( e + 1 == len ) str += '.';
                            for ( ; i--; str += '0' );
                        }
                    }
                }
            }

            return n.s < 0 && c0 ? '-' + str : str;
        }


        // Handle BigNumber.max and BigNumber.min.
        function maxOrMin( args, method ) {
            var m, n,
                i = 0;

            if ( isArray( args[0] ) ) args = args[0];
            m = new BigNumber( args[0] );

            for ( ; ++i < args.length; ) {
                n = new BigNumber( args[i] );

                // If any number is NaN, return NaN.
                if ( !n.s ) {
                    m = n;
                    break;
                } else if ( method.call( m, n ) ) {
                    m = n;
                }
            }

            return m;
        }


        /*
         * Return true if n is an integer in range, otherwise throw.
         * Use for argument validation when ERRORS is true.
         */
        function intValidatorWithErrors( n, min, max, caller, name ) {
            if ( n < min || n > max || n != truncate(n) ) {
                raise( caller, ( name || 'decimal places' ) +
                  ( n < min || n > max ? ' out of range' : ' not an integer' ), n );
            }

            return true;
        }


        /*
         * Strip trailing zeros, calculate base 10 exponent and check against MIN_EXP and MAX_EXP.
         * Called by minus, plus and times.
         */
        function normalise( n, c, e ) {
            var i = 1,
                j = c.length;

             // Remove trailing zeros.
            for ( ; !c[--j]; c.pop() );

            // Calculate the base 10 exponent. First get the number of digits of c[0].
            for ( j = c[0]; j >= 10; j /= 10, i++ );

            // Overflow?
            if ( ( e = i + e * LOG_BASE - 1 ) > MAX_EXP ) {

                // Infinity.
                n.c = n.e = null;

            // Underflow?
            } else if ( e < MIN_EXP ) {

                // Zero.
                n.c = [ n.e = 0 ];
            } else {
                n.e = e;
                n.c = c;
            }

            return n;
        }


        // Handle values that fail the validity test in BigNumber.
        parseNumeric = (function () {
            var basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i,
                dotAfter = /^([^.]+)\.$/,
                dotBefore = /^\.([^.]+)$/,
                isInfinityOrNaN = /^-?(Infinity|NaN)$/,
                whitespaceOrPlus = /^\s*\+(?=[\w.])|^\s+|\s+$/g;

            return function ( x, str, num, b ) {
                var base,
                    s = num ? str : str.replace( whitespaceOrPlus, '' );

                // No exception on ±Infinity or NaN.
                if ( isInfinityOrNaN.test(s) ) {
                    x.s = isNaN(s) ? null : s < 0 ? -1 : 1;
                } else {
                    if ( !num ) {

                        // basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i
                        s = s.replace( basePrefix, function ( m, p1, p2 ) {
                            base = ( p2 = p2.toLowerCase() ) == 'x' ? 16 : p2 == 'b' ? 2 : 8;
                            return !b || b == base ? p1 : m;
                        });

                        if (b) {
                            base = b;

                            // E.g. '1.' to '1', '.1' to '0.1'
                            s = s.replace( dotAfter, '$1' ).replace( dotBefore, '0.$1' );
                        }

                        if ( str != s ) return new BigNumber( s, base );
                    }

                    // 'new BigNumber() not a number: {n}'
                    // 'new BigNumber() not a base {b} number: {n}'
                    if (ERRORS) raise( id, 'not a' + ( b ? ' base ' + b : '' ) + ' number', str );
                    x.s = null;
                }

                x.c = x.e = null;
                id = 0;
            }
        })();


        // Throw a BigNumber Error.
        function raise( caller, msg, val ) {
            var error = new Error( [
                'new BigNumber',     // 0
                'cmp',               // 1
                'config',            // 2
                'div',               // 3
                'divToInt',          // 4
                'eq',                // 5
                'gt',                // 6
                'gte',               // 7
                'lt',                // 8
                'lte',               // 9
                'minus',             // 10
                'mod',               // 11
                'plus',              // 12
                'precision',         // 13
                'random',            // 14
                'round',             // 15
                'shift',             // 16
                'times',             // 17
                'toDigits',          // 18
                'toExponential',     // 19
                'toFixed',           // 20
                'toFormat',          // 21
                'toFraction',        // 22
                'pow',               // 23
                'toPrecision',       // 24
                'toString',          // 25
                'BigNumber'          // 26
            ][caller] + '() ' + msg + ': ' + val );

            error.name = 'BigNumber Error';
            id = 0;
            throw error;
        }


        /*
         * Round x to sd significant digits using rounding mode rm. Check for over/under-flow.
         * If r is truthy, it is known that there are more digits after the rounding digit.
         */
        function round( x, sd, rm, r ) {
            var d, i, j, k, n, ni, rd,
                xc = x.c,
                pows10 = POWS_TEN;

            // if x is not Infinity or NaN...
            if (xc) {

                // rd is the rounding digit, i.e. the digit after the digit that may be rounded up.
                // n is a base 1e14 number, the value of the element of array x.c containing rd.
                // ni is the index of n within x.c.
                // d is the number of digits of n.
                // i is the index of rd within n including leading zeros.
                // j is the actual index of rd within n (if < 0, rd is a leading zero).
                out: {

                    // Get the number of digits of the first element of xc.
                    for ( d = 1, k = xc[0]; k >= 10; k /= 10, d++ );
                    i = sd - d;

                    // If the rounding digit is in the first element of xc...
                    if ( i < 0 ) {
                        i += LOG_BASE;
                        j = sd;
                        n = xc[ ni = 0 ];

                        // Get the rounding digit at index j of n.
                        rd = n / pows10[ d - j - 1 ] % 10 | 0;
                    } else {
                        ni = mathceil( ( i + 1 ) / LOG_BASE );

                        if ( ni >= xc.length ) {

                            if (r) {

                                // Needed by sqrt.
                                for ( ; xc.length <= ni; xc.push(0) );
                                n = rd = 0;
                                d = 1;
                                i %= LOG_BASE;
                                j = i - LOG_BASE + 1;
                            } else {
                                break out;
                            }
                        } else {
                            n = k = xc[ni];

                            // Get the number of digits of n.
                            for ( d = 1; k >= 10; k /= 10, d++ );

                            // Get the index of rd within n.
                            i %= LOG_BASE;

                            // Get the index of rd within n, adjusted for leading zeros.
                            // The number of leading zeros of n is given by LOG_BASE - d.
                            j = i - LOG_BASE + d;

                            // Get the rounding digit at index j of n.
                            rd = j < 0 ? 0 : n / pows10[ d - j - 1 ] % 10 | 0;
                        }
                    }

                    r = r || sd < 0 ||

                    // Are there any non-zero digits after the rounding digit?
                    // The expression  n % pows10[ d - j - 1 ]  returns all digits of n to the right
                    // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
                      xc[ni + 1] != null || ( j < 0 ? n : n % pows10[ d - j - 1 ] );

                    r = rm < 4
                      ? ( rd || r ) && ( rm == 0 || rm == ( x.s < 0 ? 3 : 2 ) )
                      : rd > 5 || rd == 5 && ( rm == 4 || r || rm == 6 &&

                        // Check whether the digit to the left of the rounding digit is odd.
                        ( ( i > 0 ? j > 0 ? n / pows10[ d - j ] : 0 : xc[ni - 1] ) % 10 ) & 1 ||
                          rm == ( x.s < 0 ? 8 : 7 ) );

                    if ( sd < 1 || !xc[0] ) {
                        xc.length = 0;

                        if (r) {

                            // Convert sd to decimal places.
                            sd -= x.e + 1;

                            // 1, 0.1, 0.01, 0.001, 0.0001 etc.
                            xc[0] = pows10[ ( LOG_BASE - sd % LOG_BASE ) % LOG_BASE ];
                            x.e = -sd || 0;
                        } else {

                            // Zero.
                            xc[0] = x.e = 0;
                        }

                        return x;
                    }

                    // Remove excess digits.
                    if ( i == 0 ) {
                        xc.length = ni;
                        k = 1;
                        ni--;
                    } else {
                        xc.length = ni + 1;
                        k = pows10[ LOG_BASE - i ];

                        // E.g. 56700 becomes 56000 if 7 is the rounding digit.
                        // j > 0 means i > number of leading zeros of n.
                        xc[ni] = j > 0 ? mathfloor( n / pows10[ d - j ] % pows10[j] ) * k : 0;
                    }

                    // Round up?
                    if (r) {

                        for ( ; ; ) {

                            // If the digit to be rounded up is in the first element of xc...
                            if ( ni == 0 ) {

                                // i will be the length of xc[0] before k is added.
                                for ( i = 1, j = xc[0]; j >= 10; j /= 10, i++ );
                                j = xc[0] += k;
                                for ( k = 1; j >= 10; j /= 10, k++ );

                                // if i != k the length has increased.
                                if ( i != k ) {
                                    x.e++;
                                    if ( xc[0] == BASE ) xc[0] = 1;
                                }

                                break;
                            } else {
                                xc[ni] += k;
                                if ( xc[ni] != BASE ) break;
                                xc[ni--] = 0;
                                k = 1;
                            }
                        }
                    }

                    // Remove trailing zeros.
                    for ( i = xc.length; xc[--i] === 0; xc.pop() );
                }

                // Overflow? Infinity.
                if ( x.e > MAX_EXP ) {
                    x.c = x.e = null;

                // Underflow? Zero.
                } else if ( x.e < MIN_EXP ) {
                    x.c = [ x.e = 0 ];
                }
            }

            return x;
        }


        // PROTOTYPE/INSTANCE METHODS


        /*
         * Return a new BigNumber whose value is the absolute value of this BigNumber.
         */
        P.absoluteValue = P.abs = function () {
            var x = new BigNumber(this);
            if ( x.s < 0 ) x.s = 1;
            return x;
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber rounded to a whole
         * number in the direction of Infinity.
         */
        P.ceil = function () {
            return round( new BigNumber(this), this.e + 1, 2 );
        };


        /*
         * Return
         * 1 if the value of this BigNumber is greater than the value of BigNumber(y, b),
         * -1 if the value of this BigNumber is less than the value of BigNumber(y, b),
         * 0 if they have the same value,
         * or null if the value of either is NaN.
         */
        P.comparedTo = P.cmp = function ( y, b ) {
            id = 1;
            return compare( this, new BigNumber( y, b ) );
        };


        /*
         * Return the number of decimal places of the value of this BigNumber, or null if the value
         * of this BigNumber is ±Infinity or NaN.
         */
        P.decimalPlaces = P.dp = function () {
            var n, v,
                c = this.c;

            if ( !c ) return null;
            n = ( ( v = c.length - 1 ) - bitFloor( this.e / LOG_BASE ) ) * LOG_BASE;

            // Subtract the number of trailing zeros of the last number.
            if ( v = c[v] ) for ( ; v % 10 == 0; v /= 10, n-- );
            if ( n < 0 ) n = 0;

            return n;
        };


        /*
         *  n / 0 = I
         *  n / N = N
         *  n / I = 0
         *  0 / n = 0
         *  0 / 0 = N
         *  0 / N = N
         *  0 / I = 0
         *  N / n = N
         *  N / 0 = N
         *  N / N = N
         *  N / I = N
         *  I / n = I
         *  I / 0 = I
         *  I / N = N
         *  I / I = N
         *
         * Return a new BigNumber whose value is the value of this BigNumber divided by the value of
         * BigNumber(y, b), rounded according to DECIMAL_PLACES and ROUNDING_MODE.
         */
        P.dividedBy = P.div = function ( y, b ) {
            id = 3;
            return div( this, new BigNumber( y, b ), DECIMAL_PLACES, ROUNDING_MODE );
        };


        /*
         * Return a new BigNumber whose value is the integer part of dividing the value of this
         * BigNumber by the value of BigNumber(y, b).
         */
        P.dividedToIntegerBy = P.divToInt = function ( y, b ) {
            id = 4;
            return div( this, new BigNumber( y, b ), 0, 1 );
        };


        /*
         * Return true if the value of this BigNumber is equal to the value of BigNumber(y, b),
         * otherwise returns false.
         */
        P.equals = P.eq = function ( y, b ) {
            id = 5;
            return compare( this, new BigNumber( y, b ) ) === 0;
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber rounded to a whole
         * number in the direction of -Infinity.
         */
        P.floor = function () {
            return round( new BigNumber(this), this.e + 1, 3 );
        };


        /*
         * Return true if the value of this BigNumber is greater than the value of BigNumber(y, b),
         * otherwise returns false.
         */
        P.greaterThan = P.gt = function ( y, b ) {
            id = 6;
            return compare( this, new BigNumber( y, b ) ) > 0;
        };


        /*
         * Return true if the value of this BigNumber is greater than or equal to the value of
         * BigNumber(y, b), otherwise returns false.
         */
        P.greaterThanOrEqualTo = P.gte = function ( y, b ) {
            id = 7;
            return ( b = compare( this, new BigNumber( y, b ) ) ) === 1 || b === 0;

        };


        /*
         * Return true if the value of this BigNumber is a finite number, otherwise returns false.
         */
        P.isFinite = function () {
            return !!this.c;
        };


        /*
         * Return true if the value of this BigNumber is an integer, otherwise return false.
         */
        P.isInteger = P.isInt = function () {
            return !!this.c && bitFloor( this.e / LOG_BASE ) > this.c.length - 2;
        };


        /*
         * Return true if the value of this BigNumber is NaN, otherwise returns false.
         */
        P.isNaN = function () {
            return !this.s;
        };


        /*
         * Return true if the value of this BigNumber is negative, otherwise returns false.
         */
        P.isNegative = P.isNeg = function () {
            return this.s < 0;
        };


        /*
         * Return true if the value of this BigNumber is 0 or -0, otherwise returns false.
         */
        P.isZero = function () {
            return !!this.c && this.c[0] == 0;
        };


        /*
         * Return true if the value of this BigNumber is less than the value of BigNumber(y, b),
         * otherwise returns false.
         */
        P.lessThan = P.lt = function ( y, b ) {
            id = 8;
            return compare( this, new BigNumber( y, b ) ) < 0;
        };


        /*
         * Return true if the value of this BigNumber is less than or equal to the value of
         * BigNumber(y, b), otherwise returns false.
         */
        P.lessThanOrEqualTo = P.lte = function ( y, b ) {
            id = 9;
            return ( b = compare( this, new BigNumber( y, b ) ) ) === -1 || b === 0;
        };


        /*
         *  n - 0 = n
         *  n - N = N
         *  n - I = -I
         *  0 - n = -n
         *  0 - 0 = 0
         *  0 - N = N
         *  0 - I = -I
         *  N - n = N
         *  N - 0 = N
         *  N - N = N
         *  N - I = N
         *  I - n = I
         *  I - 0 = I
         *  I - N = N
         *  I - I = N
         *
         * Return a new BigNumber whose value is the value of this BigNumber minus the value of
         * BigNumber(y, b).
         */
        P.minus = P.sub = function ( y, b ) {
            var i, j, t, xLTy,
                x = this,
                a = x.s;

            id = 10;
            y = new BigNumber( y, b );
            b = y.s;

            // Either NaN?
            if ( !a || !b ) return new BigNumber(NaN);

            // Signs differ?
            if ( a != b ) {
                y.s = -b;
                return x.plus(y);
            }

            var xe = x.e / LOG_BASE,
                ye = y.e / LOG_BASE,
                xc = x.c,
                yc = y.c;

            if ( !xe || !ye ) {

                // Either Infinity?
                if ( !xc || !yc ) return xc ? ( y.s = -b, y ) : new BigNumber( yc ? x : NaN );

                // Either zero?
                if ( !xc[0] || !yc[0] ) {

                    // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
                    return yc[0] ? ( y.s = -b, y ) : new BigNumber( xc[0] ? x :

                      // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
                      ROUNDING_MODE == 3 ? -0 : 0 );
                }
            }

            xe = bitFloor(xe);
            ye = bitFloor(ye);
            xc = xc.slice();

            // Determine which is the bigger number.
            if ( a = xe - ye ) {

                if ( xLTy = a < 0 ) {
                    a = -a;
                    t = xc;
                } else {
                    ye = xe;
                    t = yc;
                }

                t.reverse();

                // Prepend zeros to equalise exponents.
                for ( b = a; b--; t.push(0) );
                t.reverse();
            } else {

                // Exponents equal. Check digit by digit.
                j = ( xLTy = ( a = xc.length ) < ( b = yc.length ) ) ? a : b;

                for ( a = b = 0; b < j; b++ ) {

                    if ( xc[b] != yc[b] ) {
                        xLTy = xc[b] < yc[b];
                        break;
                    }
                }
            }

            // x < y? Point xc to the array of the bigger number.
            if (xLTy) t = xc, xc = yc, yc = t, y.s = -y.s;

            b = ( j = yc.length ) - ( i = xc.length );

            // Append zeros to xc if shorter.
            // No need to add zeros to yc if shorter as subtract only needs to start at yc.length.
            if ( b > 0 ) for ( ; b--; xc[i++] = 0 );
            b = BASE - 1;

            // Subtract yc from xc.
            for ( ; j > a; ) {

                if ( xc[--j] < yc[j] ) {
                    for ( i = j; i && !xc[--i]; xc[i] = b );
                    --xc[i];
                    xc[j] += BASE;
                }

                xc[j] -= yc[j];
            }

            // Remove leading zeros and adjust exponent accordingly.
            for ( ; xc[0] == 0; xc.shift(), --ye );

            // Zero?
            if ( !xc[0] ) {

                // Following IEEE 754 (2008) 6.3,
                // n - n = +0  but  n - n = -0  when rounding towards -Infinity.
                y.s = ROUNDING_MODE == 3 ? -1 : 1;
                y.c = [ y.e = 0 ];
                return y;
            }

            // No need to check for Infinity as +x - +y != Infinity && -x - -y != Infinity
            // for finite x and y.
            return normalise( y, xc, ye );
        };


        /*
         *   n % 0 =  N
         *   n % N =  N
         *   n % I =  n
         *   0 % n =  0
         *  -0 % n = -0
         *   0 % 0 =  N
         *   0 % N =  N
         *   0 % I =  0
         *   N % n =  N
         *   N % 0 =  N
         *   N % N =  N
         *   N % I =  N
         *   I % n =  N
         *   I % 0 =  N
         *   I % N =  N
         *   I % I =  N
         *
         * Return a new BigNumber whose value is the value of this BigNumber modulo the value of
         * BigNumber(y, b). The result depends on the value of MODULO_MODE.
         */
        P.modulo = P.mod = function ( y, b ) {
            var q, s,
                x = this;

            id = 11;
            y = new BigNumber( y, b );

            // Return NaN if x is Infinity or NaN, or y is NaN or zero.
            if ( !x.c || !y.s || y.c && !y.c[0] ) {
                return new BigNumber(NaN);

            // Return x if y is Infinity or x is zero.
            } else if ( !y.c || x.c && !x.c[0] ) {
                return new BigNumber(x);
            }

            if ( MODULO_MODE == 9 ) {

                // Euclidian division: q = sign(y) * floor(x / abs(y))
                // r = x - qy    where  0 <= r < abs(y)
                s = y.s;
                y.s = 1;
                q = div( x, y, 0, 3 );
                y.s = s;
                q.s *= s;
            } else {
                q = div( x, y, 0, MODULO_MODE );
            }

            return x.minus( q.times(y) );
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber negated,
         * i.e. multiplied by -1.
         */
        P.negated = P.neg = function () {
            var x = new BigNumber(this);
            x.s = -x.s || null;
            return x;
        };


        /*
         *  n + 0 = n
         *  n + N = N
         *  n + I = I
         *  0 + n = n
         *  0 + 0 = 0
         *  0 + N = N
         *  0 + I = I
         *  N + n = N
         *  N + 0 = N
         *  N + N = N
         *  N + I = N
         *  I + n = I
         *  I + 0 = I
         *  I + N = N
         *  I + I = I
         *
         * Return a new BigNumber whose value is the value of this BigNumber plus the value of
         * BigNumber(y, b).
         */
        P.plus = P.add = function ( y, b ) {
            var t,
                x = this,
                a = x.s;

            id = 12;
            y = new BigNumber( y, b );
            b = y.s;

            // Either NaN?
            if ( !a || !b ) return new BigNumber(NaN);

            // Signs differ?
             if ( a != b ) {
                y.s = -b;
                return x.minus(y);
            }

            var xe = x.e / LOG_BASE,
                ye = y.e / LOG_BASE,
                xc = x.c,
                yc = y.c;

            if ( !xe || !ye ) {

                // Return ±Infinity if either ±Infinity.
                if ( !xc || !yc ) return new BigNumber( a / 0 );

                // Either zero?
                // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
                if ( !xc[0] || !yc[0] ) return yc[0] ? y : new BigNumber( xc[0] ? x : a * 0 );
            }

            xe = bitFloor(xe);
            ye = bitFloor(ye);
            xc = xc.slice();

            // Prepend zeros to equalise exponents. Faster to use reverse then do unshifts.
            if ( a = xe - ye ) {
                if ( a > 0 ) {
                    ye = xe;
                    t = yc;
                } else {
                    a = -a;
                    t = xc;
                }

                t.reverse();
                for ( ; a--; t.push(0) );
                t.reverse();
            }

            a = xc.length;
            b = yc.length;

            // Point xc to the longer array, and b to the shorter length.
            if ( a - b < 0 ) t = yc, yc = xc, xc = t, b = a;

            // Only start adding at yc.length - 1 as the further digits of xc can be ignored.
            for ( a = 0; b; ) {
                a = ( xc[--b] = xc[b] + yc[b] + a ) / BASE | 0;
                xc[b] %= BASE;
            }

            if (a) {
                xc.unshift(a);
                ++ye;
            }

            // No need to check for zero, as +x + +y != 0 && -x + -y != 0
            // ye = MAX_EXP + 1 possible
            return normalise( y, xc, ye );
        };


        /*
         * Return the number of significant digits of the value of this BigNumber.
         *
         * [z] {boolean|number} Whether to count integer-part trailing zeros: true, false, 1 or 0.
         */
        P.precision = P.sd = function (z) {
            var n, v,
                x = this,
                c = x.c;

            // 'precision() argument not a boolean or binary digit: {z}'
            if ( z != null && z !== !!z && z !== 1 && z !== 0 ) {
                if (ERRORS) raise( 13, 'argument' + notBool, z );
                if ( z != !!z ) z = null;
            }

            if ( !c ) return null;
            v = c.length - 1;
            n = v * LOG_BASE + 1;

            if ( v = c[v] ) {

                // Subtract the number of trailing zeros of the last element.
                for ( ; v % 10 == 0; v /= 10, n-- );

                // Add the number of digits of the first element.
                for ( v = c[0]; v >= 10; v /= 10, n++ );
            }

            if ( z && x.e + 1 > n ) n = x.e + 1;

            return n;
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber rounded to a maximum of
         * dp decimal places using rounding mode rm, or to 0 and ROUNDING_MODE respectively if
         * omitted.
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'round() decimal places out of range: {dp}'
         * 'round() decimal places not an integer: {dp}'
         * 'round() rounding mode not an integer: {rm}'
         * 'round() rounding mode out of range: {rm}'
         */
        P.round = function ( dp, rm ) {
            var n = new BigNumber(this);

            if ( dp == null || isValidInt( dp, 0, MAX, 15 ) ) {
                round( n, ~~dp + this.e + 1, rm == null ||
                  !isValidInt( rm, 0, 8, 15, roundingMode ) ? ROUNDING_MODE : rm | 0 );
            }

            return n;
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber shifted by k places
         * (powers of 10). Shift to the right if n > 0, and to the left if n < 0.
         *
         * k {number} Integer, -MAX_SAFE_INTEGER to MAX_SAFE_INTEGER inclusive.
         *
         * If k is out of range and ERRORS is false, the result will be ±0 if k < 0, or ±Infinity
         * otherwise.
         *
         * 'shift() argument not an integer: {k}'
         * 'shift() argument out of range: {k}'
         */
        P.shift = function (k) {
            var n = this;
            return isValidInt( k, -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER, 16, 'argument' )

              // k < 1e+21, or truncate(k) will produce exponential notation.
              ? n.times( '1e' + truncate(k) )
              : new BigNumber( n.c && n.c[0] && ( k < -MAX_SAFE_INTEGER || k > MAX_SAFE_INTEGER )
                ? n.s * ( k < 0 ? 0 : 1 / 0 )
                : n );
        };


        /*
         *  sqrt(-n) =  N
         *  sqrt( N) =  N
         *  sqrt(-I) =  N
         *  sqrt( I) =  I
         *  sqrt( 0) =  0
         *  sqrt(-0) = -0
         *
         * Return a new BigNumber whose value is the square root of the value of this BigNumber,
         * rounded according to DECIMAL_PLACES and ROUNDING_MODE.
         */
        P.squareRoot = P.sqrt = function () {
            var m, n, r, rep, t,
                x = this,
                c = x.c,
                s = x.s,
                e = x.e,
                dp = DECIMAL_PLACES + 4,
                half = new BigNumber('0.5');

            // Negative/NaN/Infinity/zero?
            if ( s !== 1 || !c || !c[0] ) {
                return new BigNumber( !s || s < 0 && ( !c || c[0] ) ? NaN : c ? x : 1 / 0 );
            }

            // Initial estimate.
            s = Math.sqrt( +x );

            // Math.sqrt underflow/overflow?
            // Pass x to Math.sqrt as integer, then adjust the exponent of the result.
            if ( s == 0 || s == 1 / 0 ) {
                n = coeffToString(c);
                if ( ( n.length + e ) % 2 == 0 ) n += '0';
                s = Math.sqrt(n);
                e = bitFloor( ( e + 1 ) / 2 ) - ( e < 0 || e % 2 );

                if ( s == 1 / 0 ) {
                    n = '1e' + e;
                } else {
                    n = s.toExponential();
                    n = n.slice( 0, n.indexOf('e') + 1 ) + e;
                }

                r = new BigNumber(n);
            } else {
                r = new BigNumber( s + '' );
            }

            // Check for zero.
            // r could be zero if MIN_EXP is changed after the this value was created.
            // This would cause a division by zero (x/t) and hence Infinity below, which would cause
            // coeffToString to throw.
            if ( r.c[0] ) {
                e = r.e;
                s = e + dp;
                if ( s < 3 ) s = 0;

                // Newton-Raphson iteration.
                for ( ; ; ) {
                    t = r;
                    r = half.times( t.plus( div( x, t, dp, 1 ) ) );

                    if ( coeffToString( t.c   ).slice( 0, s ) === ( n =
                         coeffToString( r.c ) ).slice( 0, s ) ) {

                        // The exponent of r may here be one less than the final result exponent,
                        // e.g 0.0009999 (e-4) --> 0.001 (e-3), so adjust s so the rounding digits
                        // are indexed correctly.
                        if ( r.e < e ) --s;
                        n = n.slice( s - 3, s + 1 );

                        // The 4th rounding digit may be in error by -1 so if the 4 rounding digits
                        // are 9999 or 4999 (i.e. approaching a rounding boundary) continue the
                        // iteration.
                        if ( n == '9999' || !rep && n == '4999' ) {

                            // On the first iteration only, check to see if rounding up gives the
                            // exact result as the nines may infinitely repeat.
                            if ( !rep ) {
                                round( t, t.e + DECIMAL_PLACES + 2, 0 );

                                if ( t.times(t).eq(x) ) {
                                    r = t;
                                    break;
                                }
                            }

                            dp += 4;
                            s += 4;
                            rep = 1;
                        } else {

                            // If rounding digits are null, 0{0,4} or 50{0,3}, check for exact
                            // result. If not, then there are further digits and m will be truthy.
                            if ( !+n || !+n.slice(1) && n.charAt(0) == '5' ) {

                                // Truncate to the first rounding digit.
                                round( r, r.e + DECIMAL_PLACES + 2, 1 );
                                m = !r.times(r).eq(x);
                            }

                            break;
                        }
                    }
                }
            }

            return round( r, r.e + DECIMAL_PLACES + 1, ROUNDING_MODE, m );
        };


        /*
         *  n * 0 = 0
         *  n * N = N
         *  n * I = I
         *  0 * n = 0
         *  0 * 0 = 0
         *  0 * N = N
         *  0 * I = N
         *  N * n = N
         *  N * 0 = N
         *  N * N = N
         *  N * I = N
         *  I * n = I
         *  I * 0 = N
         *  I * N = N
         *  I * I = I
         *
         * Return a new BigNumber whose value is the value of this BigNumber times the value of
         * BigNumber(y, b).
         */
        P.times = P.mul = function ( y, b ) {
            var c, e, i, j, k, m, xcL, xlo, xhi, ycL, ylo, yhi, zc,
                base, sqrtBase,
                x = this,
                xc = x.c,
                yc = ( id = 17, y = new BigNumber( y, b ) ).c;

            // Either NaN, ±Infinity or ±0?
            if ( !xc || !yc || !xc[0] || !yc[0] ) {

                // Return NaN if either is NaN, or one is 0 and the other is Infinity.
                if ( !x.s || !y.s || xc && !xc[0] && !yc || yc && !yc[0] && !xc ) {
                    y.c = y.e = y.s = null;
                } else {
                    y.s *= x.s;

                    // Return ±Infinity if either is ±Infinity.
                    if ( !xc || !yc ) {
                        y.c = y.e = null;

                    // Return ±0 if either is ±0.
                    } else {
                        y.c = [0];
                        y.e = 0;
                    }
                }

                return y;
            }

            e = bitFloor( x.e / LOG_BASE ) + bitFloor( y.e / LOG_BASE );
            y.s *= x.s;
            xcL = xc.length;
            ycL = yc.length;

            // Ensure xc points to longer array and xcL to its length.
            if ( xcL < ycL ) zc = xc, xc = yc, yc = zc, i = xcL, xcL = ycL, ycL = i;

            // Initialise the result array with zeros.
            for ( i = xcL + ycL, zc = []; i--; zc.push(0) );

            base = BASE;
            sqrtBase = SQRT_BASE;

            for ( i = ycL; --i >= 0; ) {
                c = 0;
                ylo = yc[i] % sqrtBase;
                yhi = yc[i] / sqrtBase | 0;

                for ( k = xcL, j = i + k; j > i; ) {
                    xlo = xc[--k] % sqrtBase;
                    xhi = xc[k] / sqrtBase | 0;
                    m = yhi * xlo + xhi * ylo;
                    xlo = ylo * xlo + ( ( m % sqrtBase ) * sqrtBase ) + zc[j] + c;
                    c = ( xlo / base | 0 ) + ( m / sqrtBase | 0 ) + yhi * xhi;
                    zc[j--] = xlo % base;
                }

                zc[j] = c;
            }

            if (c) {
                ++e;
            } else {
                zc.shift();
            }

            return normalise( y, zc, e );
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber rounded to a maximum of
         * sd significant digits using rounding mode rm, or ROUNDING_MODE if rm is omitted.
         *
         * [sd] {number} Significant digits. Integer, 1 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'toDigits() precision out of range: {sd}'
         * 'toDigits() precision not an integer: {sd}'
         * 'toDigits() rounding mode not an integer: {rm}'
         * 'toDigits() rounding mode out of range: {rm}'
         */
        P.toDigits = function ( sd, rm ) {
            var n = new BigNumber(this);
            sd = sd == null || !isValidInt( sd, 1, MAX, 18, 'precision' ) ? null : sd | 0;
            rm = rm == null || !isValidInt( rm, 0, 8, 18, roundingMode ) ? ROUNDING_MODE : rm | 0;
            return sd ? round( n, sd, rm ) : n;
        };


        /*
         * Return a string representing the value of this BigNumber in exponential notation and
         * rounded using ROUNDING_MODE to dp fixed decimal places.
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'toExponential() decimal places not an integer: {dp}'
         * 'toExponential() decimal places out of range: {dp}'
         * 'toExponential() rounding mode not an integer: {rm}'
         * 'toExponential() rounding mode out of range: {rm}'
         */
        P.toExponential = function ( dp, rm ) {
            return format( this,
              dp != null && isValidInt( dp, 0, MAX, 19 ) ? ~~dp + 1 : null, rm, 19 );
        };


        /*
         * Return a string representing the value of this BigNumber in fixed-point notation rounding
         * to dp fixed decimal places using rounding mode rm, or ROUNDING_MODE if rm is omitted.
         *
         * Note: as with JavaScript's number type, (-0).toFixed(0) is '0',
         * but e.g. (-0.00001).toFixed(0) is '-0'.
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'toFixed() decimal places not an integer: {dp}'
         * 'toFixed() decimal places out of range: {dp}'
         * 'toFixed() rounding mode not an integer: {rm}'
         * 'toFixed() rounding mode out of range: {rm}'
         */
        P.toFixed = function ( dp, rm ) {
            return format( this, dp != null && isValidInt( dp, 0, MAX, 20 )
              ? ~~dp + this.e + 1 : null, rm, 20 );
        };


        /*
         * Return a string representing the value of this BigNumber in fixed-point notation rounded
         * using rm or ROUNDING_MODE to dp decimal places, and formatted according to the properties
         * of the FORMAT object (see BigNumber.config).
         *
         * FORMAT = {
         *      decimalSeparator : '.',
         *      groupSeparator : ',',
         *      groupSize : 3,
         *      secondaryGroupSize : 0,
         *      fractionGroupSeparator : '\xA0',    // non-breaking space
         *      fractionGroupSize : 0
         * };
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'toFormat() decimal places not an integer: {dp}'
         * 'toFormat() decimal places out of range: {dp}'
         * 'toFormat() rounding mode not an integer: {rm}'
         * 'toFormat() rounding mode out of range: {rm}'
         */
        P.toFormat = function ( dp, rm ) {
            var str = format( this, dp != null && isValidInt( dp, 0, MAX, 21 )
              ? ~~dp + this.e + 1 : null, rm, 21 );

            if ( this.c ) {
                var i,
                    arr = str.split('.'),
                    g1 = +FORMAT.groupSize,
                    g2 = +FORMAT.secondaryGroupSize,
                    groupSeparator = FORMAT.groupSeparator,
                    intPart = arr[0],
                    fractionPart = arr[1],
                    isNeg = this.s < 0,
                    intDigits = isNeg ? intPart.slice(1) : intPart,
                    len = intDigits.length;

                if (g2) i = g1, g1 = g2, g2 = i, len -= i;

                if ( g1 > 0 && len > 0 ) {
                    i = len % g1 || g1;
                    intPart = intDigits.substr( 0, i );

                    for ( ; i < len; i += g1 ) {
                        intPart += groupSeparator + intDigits.substr( i, g1 );
                    }

                    if ( g2 > 0 ) intPart += groupSeparator + intDigits.slice(i);
                    if (isNeg) intPart = '-' + intPart;
                }

                str = fractionPart
                  ? intPart + FORMAT.decimalSeparator + ( ( g2 = +FORMAT.fractionGroupSize )
                    ? fractionPart.replace( new RegExp( '\\d{' + g2 + '}\\B', 'g' ),
                      '$&' + FORMAT.fractionGroupSeparator )
                    : fractionPart )
                  : intPart;
            }

            return str;
        };


        /*
         * Return a string array representing the value of this BigNumber as a simple fraction with
         * an integer numerator and an integer denominator. The denominator will be a positive
         * non-zero value less than or equal to the specified maximum denominator. If a maximum
         * denominator is not specified, the denominator will be the lowest value necessary to
         * represent the number exactly.
         *
         * [md] {number|string|BigNumber} Integer >= 1 and < Infinity. The maximum denominator.
         *
         * 'toFraction() max denominator not an integer: {md}'
         * 'toFraction() max denominator out of range: {md}'
         */
        P.toFraction = function (md) {
            var arr, d0, d2, e, exp, n, n0, q, s,
                k = ERRORS,
                x = this,
                xc = x.c,
                d = new BigNumber(ONE),
                n1 = d0 = new BigNumber(ONE),
                d1 = n0 = new BigNumber(ONE);

            if ( md != null ) {
                ERRORS = false;
                n = new BigNumber(md);
                ERRORS = k;

                if ( !( k = n.isInt() ) || n.lt(ONE) ) {

                    if (ERRORS) {
                        raise( 22,
                          'max denominator ' + ( k ? 'out of range' : 'not an integer' ), md );
                    }

                    // ERRORS is false:
                    // If md is a finite non-integer >= 1, round it to an integer and use it.
                    md = !k && n.c && round( n, n.e + 1, 1 ).gte(ONE) ? n : null;
                }
            }

            if ( !xc ) return x.toString();
            s = coeffToString(xc);

            // Determine initial denominator.
            // d is a power of 10 and the minimum max denominator that specifies the value exactly.
            e = d.e = s.length - x.e - 1;
            d.c[0] = POWS_TEN[ ( exp = e % LOG_BASE ) < 0 ? LOG_BASE + exp : exp ];
            md = !md || n.cmp(d) > 0 ? ( e > 0 ? d : n1 ) : n;

            exp = MAX_EXP;
            MAX_EXP = 1 / 0;
            n = new BigNumber(s);

            // n0 = d1 = 0
            n0.c[0] = 0;

            for ( ; ; )  {
                q = div( n, d, 0, 1 );
                d2 = d0.plus( q.times(d1) );
                if ( d2.cmp(md) == 1 ) break;
                d0 = d1;
                d1 = d2;
                n1 = n0.plus( q.times( d2 = n1 ) );
                n0 = d2;
                d = n.minus( q.times( d2 = d ) );
                n = d2;
            }

            d2 = div( md.minus(d0), d1, 0, 1 );
            n0 = n0.plus( d2.times(n1) );
            d0 = d0.plus( d2.times(d1) );
            n0.s = n1.s = x.s;
            e *= 2;

            // Determine which fraction is closer to x, n0/d0 or n1/d1
            arr = div( n1, d1, e, ROUNDING_MODE ).minus(x).abs().cmp(
                  div( n0, d0, e, ROUNDING_MODE ).minus(x).abs() ) < 1
                    ? [ n1.toString(), d1.toString() ]
                    : [ n0.toString(), d0.toString() ];

            MAX_EXP = exp;
            return arr;
        };


        /*
         * Return the value of this BigNumber converted to a number primitive.
         */
        P.toNumber = function () {
            return +this;
        };


        /*
         * Return a BigNumber whose value is the value of this BigNumber raised to the power n.
         * If m is present, return the result modulo m.
         * If n is negative round according to DECIMAL_PLACES and ROUNDING_MODE.
         * If POW_PRECISION is non-zero and m is not present, round to POW_PRECISION using
         * ROUNDING_MODE.
         *
         * The modular power operation works efficiently when x, n, and m are positive integers,
         * otherwise it is equivalent to calculating x.toPower(n).modulo(m) (with POW_PRECISION 0).
         *
         * n {number} Integer, -MAX_SAFE_INTEGER to MAX_SAFE_INTEGER inclusive.
         * [m] {number|string|BigNumber} The modulus.
         *
         * 'pow() exponent not an integer: {n}'
         * 'pow() exponent out of range: {n}'
         *
         * Performs 54 loop iterations for n of 9007199254740991.
         */
        P.toPower = P.pow = function ( n, m ) {
            var k, y, z,
                i = mathfloor( n < 0 ? -n : +n ),
                x = this;

            if ( m != null ) {
                id = 23;
                m = new BigNumber(m);
            }

            // Pass ±Infinity to Math.pow if exponent is out of range.
            if ( !isValidInt( n, -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER, 23, 'exponent' ) &&
              ( !isFinite(n) || i > MAX_SAFE_INTEGER && ( n /= 0 ) ||
                parseFloat(n) != n && !( n = NaN ) ) || n == 0 ) {
                k = Math.pow( +x, n );
                return new BigNumber( m ? k % m : k );
            }

            if (m) {
                if ( n > 1 && x.gt(ONE) && x.isInt() && m.gt(ONE) && m.isInt() ) {
                    x = x.mod(m);
                } else {
                    z = m;

                    // Nullify m so only a single mod operation is performed at the end.
                    m = null;
                }
            } else if (POW_PRECISION) {

                // Truncating each coefficient array to a length of k after each multiplication
                // equates to truncating significant digits to POW_PRECISION + [28, 41],
                // i.e. there will be a minimum of 28 guard digits retained.
                // (Using + 1.5 would give [9, 21] guard digits.)
                k = mathceil( POW_PRECISION / LOG_BASE + 2 );
            }

            y = new BigNumber(ONE);

            for ( ; ; ) {
                if ( i % 2 ) {
                    y = y.times(x);
                    if ( !y.c ) break;
                    if (k) {
                        if ( y.c.length > k ) y.c.length = k;
                    } else if (m) {
                        y = y.mod(m);
                    }
                }

                i = mathfloor( i / 2 );
                if ( !i ) break;
                x = x.times(x);
                if (k) {
                    if ( x.c && x.c.length > k ) x.c.length = k;
                } else if (m) {
                    x = x.mod(m);
                }
            }

            if (m) return y;
            if ( n < 0 ) y = ONE.div(y);

            return z ? y.mod(z) : k ? round( y, POW_PRECISION, ROUNDING_MODE ) : y;
        };


        /*
         * Return a string representing the value of this BigNumber rounded to sd significant digits
         * using rounding mode rm or ROUNDING_MODE. If sd is less than the number of digits
         * necessary to represent the integer part of the value in fixed-point notation, then use
         * exponential notation.
         *
         * [sd] {number} Significant digits. Integer, 1 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'toPrecision() precision not an integer: {sd}'
         * 'toPrecision() precision out of range: {sd}'
         * 'toPrecision() rounding mode not an integer: {rm}'
         * 'toPrecision() rounding mode out of range: {rm}'
         */
        P.toPrecision = function ( sd, rm ) {
            return format( this, sd != null && isValidInt( sd, 1, MAX, 24, 'precision' )
              ? sd | 0 : null, rm, 24 );
        };


        /*
         * Return a string representing the value of this BigNumber in base b, or base 10 if b is
         * omitted. If a base is specified, including base 10, round according to DECIMAL_PLACES and
         * ROUNDING_MODE. If a base is not specified, and this BigNumber has a positive exponent
         * that is equal to or greater than TO_EXP_POS, or a negative exponent equal to or less than
         * TO_EXP_NEG, return exponential notation.
         *
         * [b] {number} Integer, 2 to 64 inclusive.
         *
         * 'toString() base not an integer: {b}'
         * 'toString() base out of range: {b}'
         */
        P.toString = function (b) {
            var str,
                n = this,
                s = n.s,
                e = n.e;

            // Infinity or NaN?
            if ( e === null ) {

                if (s) {
                    str = 'Infinity';
                    if ( s < 0 ) str = '-' + str;
                } else {
                    str = 'NaN';
                }
            } else {
                str = coeffToString( n.c );

                if ( b == null || !isValidInt( b, 2, 64, 25, 'base' ) ) {
                    str = e <= TO_EXP_NEG || e >= TO_EXP_POS
                      ? toExponential( str, e )
                      : toFixedPoint( str, e );
                } else {
                    str = convertBase( toFixedPoint( str, e ), b | 0, 10, s );
                }

                if ( s < 0 && n.c[0] ) str = '-' + str;
            }

            return str;
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber truncated to a whole
         * number.
         */
        P.truncated = P.trunc = function () {
            return round( new BigNumber(this), this.e + 1, 1 );
        };



        /*
         * Return as toString, but do not accept a base argument, and include the minus sign for
         * negative zero.
         */
        P.valueOf = P.toJSON = function () {
            var str,
                n = this,
                e = n.e;

            if ( e === null ) return n.toString();

            str = coeffToString( n.c );

            str = e <= TO_EXP_NEG || e >= TO_EXP_POS
                ? toExponential( str, e )
                : toFixedPoint( str, e );

            return n.s < 0 ? '-' + str : str;
        };


        // Aliases for BigDecimal methods.
        //P.add = P.plus;         // P.add included above
        //P.subtract = P.minus;   // P.sub included above
        //P.multiply = P.times;   // P.mul included above
        //P.divide = P.div;
        //P.remainder = P.mod;
        //P.compareTo = P.cmp;
        //P.negate = P.neg;


        if ( configObj != null ) BigNumber.config(configObj);

        return BigNumber;
    }


    // PRIVATE HELPER FUNCTIONS


    function bitFloor(n) {
        var i = n | 0;
        return n > 0 || n === i ? i : i - 1;
    }


    // Return a coefficient array as a string of base 10 digits.
    function coeffToString(a) {
        var s, z,
            i = 1,
            j = a.length,
            r = a[0] + '';

        for ( ; i < j; ) {
            s = a[i++] + '';
            z = LOG_BASE - s.length;
            for ( ; z--; s = '0' + s );
            r += s;
        }

        // Determine trailing zeros.
        for ( j = r.length; r.charCodeAt(--j) === 48; );
        return r.slice( 0, j + 1 || 1 );
    }


    // Compare the value of BigNumbers x and y.
    function compare( x, y ) {
        var a, b,
            xc = x.c,
            yc = y.c,
            i = x.s,
            j = y.s,
            k = x.e,
            l = y.e;

        // Either NaN?
        if ( !i || !j ) return null;

        a = xc && !xc[0];
        b = yc && !yc[0];

        // Either zero?
        if ( a || b ) return a ? b ? 0 : -j : i;

        // Signs differ?
        if ( i != j ) return i;

        a = i < 0;
        b = k == l;

        // Either Infinity?
        if ( !xc || !yc ) return b ? 0 : !xc ^ a ? 1 : -1;

        // Compare exponents.
        if ( !b ) return k > l ^ a ? 1 : -1;

        j = ( k = xc.length ) < ( l = yc.length ) ? k : l;

        // Compare digit by digit.
        for ( i = 0; i < j; i++ ) if ( xc[i] != yc[i] ) return xc[i] > yc[i] ^ a ? 1 : -1;

        // Compare lengths.
        return k == l ? 0 : k > l ^ a ? 1 : -1;
    }


    /*
     * Return true if n is a valid number in range, otherwise false.
     * Use for argument validation when ERRORS is false.
     * Note: parseInt('1e+1') == 1 but parseFloat('1e+1') == 10.
     */
    function intValidatorNoErrors( n, min, max ) {
        return ( n = truncate(n) ) >= min && n <= max;
    }


    function isArray(obj) {
        return Object.prototype.toString.call(obj) == '[object Array]';
    }


    /*
     * Convert string of baseIn to an array of numbers of baseOut.
     * Eg. convertBase('255', 10, 16) returns [15, 15].
     * Eg. convertBase('ff', 16, 10) returns [2, 5, 5].
     */
    function toBaseOut( str, baseIn, baseOut ) {
        var j,
            arr = [0],
            arrL,
            i = 0,
            len = str.length;

        for ( ; i < len; ) {
            for ( arrL = arr.length; arrL--; arr[arrL] *= baseIn );
            arr[ j = 0 ] += ALPHABET.indexOf( str.charAt( i++ ) );

            for ( ; j < arr.length; j++ ) {

                if ( arr[j] > baseOut - 1 ) {
                    if ( arr[j + 1] == null ) arr[j + 1] = 0;
                    arr[j + 1] += arr[j] / baseOut | 0;
                    arr[j] %= baseOut;
                }
            }
        }

        return arr.reverse();
    }


    function toExponential( str, e ) {
        return ( str.length > 1 ? str.charAt(0) + '.' + str.slice(1) : str ) +
          ( e < 0 ? 'e' : 'e+' ) + e;
    }


    function toFixedPoint( str, e ) {
        var len, z;

        // Negative exponent?
        if ( e < 0 ) {

            // Prepend zeros.
            for ( z = '0.'; ++e; z += '0' );
            str = z + str;

        // Positive exponent
        } else {
            len = str.length;

            // Append zeros.
            if ( ++e > len ) {
                for ( z = '0', e -= len; --e; z += '0' );
                str += z;
            } else if ( e < len ) {
                str = str.slice( 0, e ) + '.' + str.slice(e);
            }
        }

        return str;
    }


    function truncate(n) {
        n = parseFloat(n);
        return n < 0 ? mathceil(n) : mathfloor(n);
    }


    // EXPORT


    BigNumber = constructorFactory();
    BigNumber.default = BigNumber.BigNumber = BigNumber;


    // AMD.
    if ( typeof define == 'function' && define.amd ) {
        define( function () { return BigNumber; } );

    // Node.js and other environments that support module.exports.
    } else if ( typeof module != 'undefined' && module.exports ) {
        module.exports = BigNumber;

        // Split string stops browserify adding crypto shim.
        if ( !cryptoObj ) try { cryptoObj = require('cry' + 'pto'); } catch (e) {}

    // Browser.
    } else {
        if ( !globalObj ) globalObj = typeof self != 'undefined' ? self : Function('return this')();
        globalObj.BigNumber = BigNumber;
    }
})(this);

},{}],2:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BigNumber = require('bignumber.js');

var Utils = function () {
  function Utils() {
    _classCallCheck(this, Utils);
  }

  Utils.isNum = function isNum(num) {
    return !_.isNull(num) && _.isNumber(num);
  };

  Utils.isArr = function isArr(arr) {
    return !_.isNull(arr) && _.isArray(arr);
  };

  Utils.isArrOfNums = function isArrOfNums(arr) {
    return this.isArr(arr) && _.every(arr, function (n) {
      return _.isFinite(n);
    });
  };

  Utils.getSuperscript = function getSuperscript(id) {
    var superscript = [8304, 185, 178, 179, 8308, 8309, 8310, 8311, 8312, 8313]; // '⁰¹²³⁴⁵⁶⁷⁸⁹'
    var ss = '';
    while (id > 0) {
      var digit = id % 10;
      ss = String.fromCharCode(superscript[id % 10]) + ss;
      id = (id - digit) / 10;
    }
    return ss;
  };

  Utils.getFormattedNum = function getFormattedNum(num, decimals) {
    var prefix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    var suffix = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

    return prefix + new BigNumber(num).toFormat(decimals) + suffix;
  };

  return Utils;
}();

module.exports = Utils;

},{"bignumber.js":1}]},{},[2])(2)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmlnbnVtYmVyLmpzL2JpZ251bWJlci5qcyIsInRoZVNyYy9zY3JpcHRzL3V0aWxzL1V0aWxzLmVzNi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ2pyRkEsSUFBTSxZQUFZLFFBQVEsY0FBUixDQUFsQjs7SUFFTSxLOzs7OztRQUVHLEssa0JBQU0sRyxFQUFLO0FBQ2hCLFdBQU8sQ0FBRSxFQUFFLE1BQUYsQ0FBUyxHQUFULENBQUYsSUFBb0IsRUFBRSxRQUFGLENBQVcsR0FBWCxDQUEzQjtBQUNELEc7O1FBRU0sSyxrQkFBTSxHLEVBQUs7QUFDaEIsV0FBTyxDQUFFLEVBQUUsTUFBRixDQUFTLEdBQVQsQ0FBRixJQUFvQixFQUFFLE9BQUYsQ0FBVSxHQUFWLENBQTNCO0FBQ0QsRzs7UUFFTSxXLHdCQUFZLEcsRUFBSztBQUN0QixXQUFPLEtBQUssS0FBTCxDQUFXLEdBQVgsS0FBbUIsRUFBRSxLQUFGLENBQVEsR0FBUixFQUFhO0FBQUEsYUFBSyxFQUFFLFFBQUYsQ0FBVyxDQUFYLENBQUw7QUFBQSxLQUFiLENBQTFCO0FBQ0QsRzs7UUFFTSxjLDJCQUFlLEUsRUFBSTtBQUN4QixRQUFNLGNBQWMsQ0FBQyxJQUFELEVBQU8sR0FBUCxFQUFZLEdBQVosRUFBaUIsR0FBakIsRUFBc0IsSUFBdEIsRUFBNEIsSUFBNUIsRUFBa0MsSUFBbEMsRUFBd0MsSUFBeEMsRUFBOEMsSUFBOUMsRUFBb0QsSUFBcEQsQ0FBcEIsQ0FEd0IsQ0FDdUQ7QUFDL0UsUUFBSSxLQUFLLEVBQVQ7QUFDQSxXQUFPLEtBQUssQ0FBWixFQUFlO0FBQ2IsVUFBTSxRQUFRLEtBQUssRUFBbkI7QUFDQSxXQUFLLE9BQU8sWUFBUCxDQUFvQixZQUFZLEtBQUssRUFBakIsQ0FBcEIsSUFBNEMsRUFBakQ7QUFDQSxXQUFLLENBQUMsS0FBSyxLQUFOLElBQWUsRUFBcEI7QUFDRDtBQUNELFdBQU8sRUFBUDtBQUNELEc7O1FBRU0sZSw0QkFBZ0IsRyxFQUFLLFEsRUFBb0M7QUFBQSxRQUExQixNQUEwQix1RUFBakIsRUFBaUI7QUFBQSxRQUFiLE1BQWEsdUVBQUosRUFBSTs7QUFDOUQsV0FBTyxTQUFVLElBQUksU0FBSixDQUFjLEdBQWQsQ0FBRCxDQUFxQixRQUFyQixDQUE4QixRQUE5QixDQUFULEdBQW1ELE1BQTFEO0FBQ0QsRzs7Ozs7QUFHSCxPQUFPLE9BQVAsR0FBaUIsS0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyohIGJpZ251bWJlci5qcyB2Mi40LjAgaHR0cHM6Ly9naXRodWIuY29tL01pa2VNY2wvYmlnbnVtYmVyLmpzL0xJQ0VOQ0UgKi9cclxuXHJcbjsoZnVuY3Rpb24gKGdsb2JhbE9iaikge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIC8qXHJcbiAgICAgIGJpZ251bWJlci5qcyB2Mi40LjBcclxuICAgICAgQSBKYXZhU2NyaXB0IGxpYnJhcnkgZm9yIGFyYml0cmFyeS1wcmVjaXNpb24gYXJpdGhtZXRpYy5cclxuICAgICAgaHR0cHM6Ly9naXRodWIuY29tL01pa2VNY2wvYmlnbnVtYmVyLmpzXHJcbiAgICAgIENvcHlyaWdodCAoYykgMjAxNiBNaWNoYWVsIE1jbGF1Z2hsaW4gPE04Y2g4OGxAZ21haWwuY29tPlxyXG4gICAgICBNSVQgRXhwYXQgTGljZW5jZVxyXG4gICAgKi9cclxuXHJcblxyXG4gICAgdmFyIEJpZ051bWJlciwgY3J5cHRvT2JqLCBwYXJzZU51bWVyaWMsXHJcbiAgICAgICAgaXNOdW1lcmljID0gL14tPyhcXGQrKFxcLlxcZCopP3xcXC5cXGQrKShlWystXT9cXGQrKT8kL2ksXHJcbiAgICAgICAgbWF0aGNlaWwgPSBNYXRoLmNlaWwsXHJcbiAgICAgICAgbWF0aGZsb29yID0gTWF0aC5mbG9vcixcclxuICAgICAgICBub3RCb29sID0gJyBub3QgYSBib29sZWFuIG9yIGJpbmFyeSBkaWdpdCcsXHJcbiAgICAgICAgcm91bmRpbmdNb2RlID0gJ3JvdW5kaW5nIG1vZGUnLFxyXG4gICAgICAgIHRvb01hbnlEaWdpdHMgPSAnbnVtYmVyIHR5cGUgaGFzIG1vcmUgdGhhbiAxNSBzaWduaWZpY2FudCBkaWdpdHMnLFxyXG4gICAgICAgIEFMUEhBQkVUID0gJzAxMjM0NTY3ODlhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ekFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaJF8nLFxyXG4gICAgICAgIEJBU0UgPSAxZTE0LFxyXG4gICAgICAgIExPR19CQVNFID0gMTQsXHJcbiAgICAgICAgTUFYX1NBRkVfSU5URUdFUiA9IDB4MWZmZmZmZmZmZmZmZmYsICAgICAgICAgLy8gMl41MyAtIDFcclxuICAgICAgICAvLyBNQVhfSU5UMzIgPSAweDdmZmZmZmZmLCAgICAgICAgICAgICAgICAgICAvLyAyXjMxIC0gMVxyXG4gICAgICAgIFBPV1NfVEVOID0gWzEsIDEwLCAxMDAsIDFlMywgMWU0LCAxZTUsIDFlNiwgMWU3LCAxZTgsIDFlOSwgMWUxMCwgMWUxMSwgMWUxMiwgMWUxM10sXHJcbiAgICAgICAgU1FSVF9CQVNFID0gMWU3LFxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSBsaW1pdCBvbiB0aGUgdmFsdWUgb2YgREVDSU1BTF9QTEFDRVMsIFRPX0VYUF9ORUcsIFRPX0VYUF9QT1MsIE1JTl9FWFAsIE1BWF9FWFAsIGFuZFxyXG4gICAgICAgICAqIHRoZSBhcmd1bWVudHMgdG8gdG9FeHBvbmVudGlhbCwgdG9GaXhlZCwgdG9Gb3JtYXQsIGFuZCB0b1ByZWNpc2lvbiwgYmV5b25kIHdoaWNoIGFuXHJcbiAgICAgICAgICogZXhjZXB0aW9uIGlzIHRocm93biAoaWYgRVJST1JTIGlzIHRydWUpLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIE1BWCA9IDFFOTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gTUFYX0lOVDMyXHJcblxyXG4gICAgaWYgKCB0eXBlb2YgY3J5cHRvICE9ICd1bmRlZmluZWQnICkgY3J5cHRvT2JqID0gY3J5cHRvO1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogQ3JlYXRlIGFuZCByZXR1cm4gYSBCaWdOdW1iZXIgY29uc3RydWN0b3IuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGNvbnN0cnVjdG9yRmFjdG9yeShjb25maWdPYmopIHtcclxuICAgICAgICB2YXIgZGl2LFxyXG5cclxuICAgICAgICAgICAgLy8gaWQgdHJhY2tzIHRoZSBjYWxsZXIgZnVuY3Rpb24sIHNvIGl0cyBuYW1lIGNhbiBiZSBpbmNsdWRlZCBpbiBlcnJvciBtZXNzYWdlcy5cclxuICAgICAgICAgICAgaWQgPSAwLFxyXG4gICAgICAgICAgICBQID0gQmlnTnVtYmVyLnByb3RvdHlwZSxcclxuICAgICAgICAgICAgT05FID0gbmV3IEJpZ051bWJlcigxKSxcclxuXHJcblxyXG4gICAgICAgICAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIEVESVRBQkxFIERFRkFVTFRTICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcblxyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogVGhlIGRlZmF1bHQgdmFsdWVzIGJlbG93IG11c3QgYmUgaW50ZWdlcnMgd2l0aGluIHRoZSBpbmNsdXNpdmUgcmFuZ2VzIHN0YXRlZC5cclxuICAgICAgICAgICAgICogVGhlIHZhbHVlcyBjYW4gYWxzbyBiZSBjaGFuZ2VkIGF0IHJ1bi10aW1lIHVzaW5nIEJpZ051bWJlci5jb25maWcuXHJcbiAgICAgICAgICAgICAqL1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlIG1heGltdW0gbnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzIGZvciBvcGVyYXRpb25zIGludm9sdmluZyBkaXZpc2lvbi5cclxuICAgICAgICAgICAgREVDSU1BTF9QTEFDRVMgPSAyMCwgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIE1BWFxyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogVGhlIHJvdW5kaW5nIG1vZGUgdXNlZCB3aGVuIHJvdW5kaW5nIHRvIHRoZSBhYm92ZSBkZWNpbWFsIHBsYWNlcywgYW5kIHdoZW4gdXNpbmdcclxuICAgICAgICAgICAgICogdG9FeHBvbmVudGlhbCwgdG9GaXhlZCwgdG9Gb3JtYXQgYW5kIHRvUHJlY2lzaW9uLCBhbmQgcm91bmQgKGRlZmF1bHQgdmFsdWUpLlxyXG4gICAgICAgICAgICAgKiBVUCAgICAgICAgIDAgQXdheSBmcm9tIHplcm8uXHJcbiAgICAgICAgICAgICAqIERPV04gICAgICAgMSBUb3dhcmRzIHplcm8uXHJcbiAgICAgICAgICAgICAqIENFSUwgICAgICAgMiBUb3dhcmRzICtJbmZpbml0eS5cclxuICAgICAgICAgICAgICogRkxPT1IgICAgICAzIFRvd2FyZHMgLUluZmluaXR5LlxyXG4gICAgICAgICAgICAgKiBIQUxGX1VQICAgIDQgVG93YXJkcyBuZWFyZXN0IG5laWdoYm91ci4gSWYgZXF1aWRpc3RhbnQsIHVwLlxyXG4gICAgICAgICAgICAgKiBIQUxGX0RPV04gIDUgVG93YXJkcyBuZWFyZXN0IG5laWdoYm91ci4gSWYgZXF1aWRpc3RhbnQsIGRvd24uXHJcbiAgICAgICAgICAgICAqIEhBTEZfRVZFTiAgNiBUb3dhcmRzIG5lYXJlc3QgbmVpZ2hib3VyLiBJZiBlcXVpZGlzdGFudCwgdG93YXJkcyBldmVuIG5laWdoYm91ci5cclxuICAgICAgICAgICAgICogSEFMRl9DRUlMICA3IFRvd2FyZHMgbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCB0b3dhcmRzICtJbmZpbml0eS5cclxuICAgICAgICAgICAgICogSEFMRl9GTE9PUiA4IFRvd2FyZHMgbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCB0b3dhcmRzIC1JbmZpbml0eS5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIFJPVU5ESU5HX01PREUgPSA0LCAgICAgICAgICAgICAgICAgICAgICAgLy8gMCB0byA4XHJcblxyXG4gICAgICAgICAgICAvLyBFWFBPTkVOVElBTF9BVCA6IFtUT19FWFBfTkVHICwgVE9fRVhQX1BPU11cclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBleHBvbmVudCB2YWx1ZSBhdCBhbmQgYmVuZWF0aCB3aGljaCB0b1N0cmluZyByZXR1cm5zIGV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAgICAgICAgICAvLyBOdW1iZXIgdHlwZTogLTdcclxuICAgICAgICAgICAgVE9fRVhQX05FRyA9IC03LCAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIC1NQVhcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBleHBvbmVudCB2YWx1ZSBhdCBhbmQgYWJvdmUgd2hpY2ggdG9TdHJpbmcgcmV0dXJucyBleHBvbmVudGlhbCBub3RhdGlvbi5cclxuICAgICAgICAgICAgLy8gTnVtYmVyIHR5cGU6IDIxXHJcbiAgICAgICAgICAgIFRPX0VYUF9QT1MgPSAyMSwgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMCB0byBNQVhcclxuXHJcbiAgICAgICAgICAgIC8vIFJBTkdFIDogW01JTl9FWFAsIE1BWF9FWFBdXHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgbWluaW11bSBleHBvbmVudCB2YWx1ZSwgYmVuZWF0aCB3aGljaCB1bmRlcmZsb3cgdG8gemVybyBvY2N1cnMuXHJcbiAgICAgICAgICAgIC8vIE51bWJlciB0eXBlOiAtMzI0ICAoNWUtMzI0KVxyXG4gICAgICAgICAgICBNSU5fRVhQID0gLTFlNywgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIC0xIHRvIC1NQVhcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBtYXhpbXVtIGV4cG9uZW50IHZhbHVlLCBhYm92ZSB3aGljaCBvdmVyZmxvdyB0byBJbmZpbml0eSBvY2N1cnMuXHJcbiAgICAgICAgICAgIC8vIE51bWJlciB0eXBlOiAgMzA4ICAoMS43OTc2OTMxMzQ4NjIzMTU3ZSszMDgpXHJcbiAgICAgICAgICAgIC8vIEZvciBNQVhfRVhQID4gMWU3LCBlLmcuIG5ldyBCaWdOdW1iZXIoJzFlMTAwMDAwMDAwJykucGx1cygxKSBtYXkgYmUgc2xvdy5cclxuICAgICAgICAgICAgTUFYX0VYUCA9IDFlNywgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAxIHRvIE1BWFxyXG5cclxuICAgICAgICAgICAgLy8gV2hldGhlciBCaWdOdW1iZXIgRXJyb3JzIGFyZSBldmVyIHRocm93bi5cclxuICAgICAgICAgICAgRVJST1JTID0gdHJ1ZSwgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0cnVlIG9yIGZhbHNlXHJcblxyXG4gICAgICAgICAgICAvLyBDaGFuZ2UgdG8gaW50VmFsaWRhdG9yTm9FcnJvcnMgaWYgRVJST1JTIGlzIGZhbHNlLlxyXG4gICAgICAgICAgICBpc1ZhbGlkSW50ID0gaW50VmFsaWRhdG9yV2l0aEVycm9ycywgICAgIC8vIGludFZhbGlkYXRvcldpdGhFcnJvcnMvaW50VmFsaWRhdG9yTm9FcnJvcnNcclxuXHJcbiAgICAgICAgICAgIC8vIFdoZXRoZXIgdG8gdXNlIGNyeXB0b2dyYXBoaWNhbGx5LXNlY3VyZSByYW5kb20gbnVtYmVyIGdlbmVyYXRpb24sIGlmIGF2YWlsYWJsZS5cclxuICAgICAgICAgICAgQ1JZUFRPID0gZmFsc2UsICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0cnVlIG9yIGZhbHNlXHJcblxyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBUaGUgbW9kdWxvIG1vZGUgdXNlZCB3aGVuIGNhbGN1bGF0aW5nIHRoZSBtb2R1bHVzOiBhIG1vZCBuLlxyXG4gICAgICAgICAgICAgKiBUaGUgcXVvdGllbnQgKHEgPSBhIC8gbikgaXMgY2FsY3VsYXRlZCBhY2NvcmRpbmcgdG8gdGhlIGNvcnJlc3BvbmRpbmcgcm91bmRpbmcgbW9kZS5cclxuICAgICAgICAgICAgICogVGhlIHJlbWFpbmRlciAocikgaXMgY2FsY3VsYXRlZCBhczogciA9IGEgLSBuICogcS5cclxuICAgICAgICAgICAgICpcclxuICAgICAgICAgICAgICogVVAgICAgICAgIDAgVGhlIHJlbWFpbmRlciBpcyBwb3NpdGl2ZSBpZiB0aGUgZGl2aWRlbmQgaXMgbmVnYXRpdmUsIGVsc2UgaXMgbmVnYXRpdmUuXHJcbiAgICAgICAgICAgICAqIERPV04gICAgICAxIFRoZSByZW1haW5kZXIgaGFzIHRoZSBzYW1lIHNpZ24gYXMgdGhlIGRpdmlkZW5kLlxyXG4gICAgICAgICAgICAgKiAgICAgICAgICAgICBUaGlzIG1vZHVsbyBtb2RlIGlzIGNvbW1vbmx5IGtub3duIGFzICd0cnVuY2F0ZWQgZGl2aXNpb24nIGFuZCBpc1xyXG4gICAgICAgICAgICAgKiAgICAgICAgICAgICBlcXVpdmFsZW50IHRvIChhICUgbikgaW4gSmF2YVNjcmlwdC5cclxuICAgICAgICAgICAgICogRkxPT1IgICAgIDMgVGhlIHJlbWFpbmRlciBoYXMgdGhlIHNhbWUgc2lnbiBhcyB0aGUgZGl2aXNvciAoUHl0aG9uICUpLlxyXG4gICAgICAgICAgICAgKiBIQUxGX0VWRU4gNiBUaGlzIG1vZHVsbyBtb2RlIGltcGxlbWVudHMgdGhlIElFRUUgNzU0IHJlbWFpbmRlciBmdW5jdGlvbi5cclxuICAgICAgICAgICAgICogRVVDTElEICAgIDkgRXVjbGlkaWFuIGRpdmlzaW9uLiBxID0gc2lnbihuKSAqIGZsb29yKGEgLyBhYnMobikpLlxyXG4gICAgICAgICAgICAgKiAgICAgICAgICAgICBUaGUgcmVtYWluZGVyIGlzIGFsd2F5cyBwb3NpdGl2ZS5cclxuICAgICAgICAgICAgICpcclxuICAgICAgICAgICAgICogVGhlIHRydW5jYXRlZCBkaXZpc2lvbiwgZmxvb3JlZCBkaXZpc2lvbiwgRXVjbGlkaWFuIGRpdmlzaW9uIGFuZCBJRUVFIDc1NCByZW1haW5kZXJcclxuICAgICAgICAgICAgICogbW9kZXMgYXJlIGNvbW1vbmx5IHVzZWQgZm9yIHRoZSBtb2R1bHVzIG9wZXJhdGlvbi5cclxuICAgICAgICAgICAgICogQWx0aG91Z2ggdGhlIG90aGVyIHJvdW5kaW5nIG1vZGVzIGNhbiBhbHNvIGJlIHVzZWQsIHRoZXkgbWF5IG5vdCBnaXZlIHVzZWZ1bCByZXN1bHRzLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgTU9EVUxPX01PREUgPSAxLCAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIDlcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBtYXhpbXVtIG51bWJlciBvZiBzaWduaWZpY2FudCBkaWdpdHMgb2YgdGhlIHJlc3VsdCBvZiB0aGUgdG9Qb3dlciBvcGVyYXRpb24uXHJcbiAgICAgICAgICAgIC8vIElmIFBPV19QUkVDSVNJT04gaXMgMCwgdGhlcmUgd2lsbCBiZSB1bmxpbWl0ZWQgc2lnbmlmaWNhbnQgZGlnaXRzLlxyXG4gICAgICAgICAgICBQT1dfUFJFQ0lTSU9OID0gMTAwLCAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gTUFYXHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgZm9ybWF0IHNwZWNpZmljYXRpb24gdXNlZCBieSB0aGUgQmlnTnVtYmVyLnByb3RvdHlwZS50b0Zvcm1hdCBtZXRob2QuXHJcbiAgICAgICAgICAgIEZPUk1BVCA9IHtcclxuICAgICAgICAgICAgICAgIGRlY2ltYWxTZXBhcmF0b3I6ICcuJyxcclxuICAgICAgICAgICAgICAgIGdyb3VwU2VwYXJhdG9yOiAnLCcsXHJcbiAgICAgICAgICAgICAgICBncm91cFNpemU6IDMsXHJcbiAgICAgICAgICAgICAgICBzZWNvbmRhcnlHcm91cFNpemU6IDAsXHJcbiAgICAgICAgICAgICAgICBmcmFjdGlvbkdyb3VwU2VwYXJhdG9yOiAnXFx4QTAnLCAgICAgIC8vIG5vbi1icmVha2luZyBzcGFjZVxyXG4gICAgICAgICAgICAgICAgZnJhY3Rpb25Hcm91cFNpemU6IDBcclxuICAgICAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcblxyXG5cclxuICAgICAgICAvLyBDT05TVFJVQ1RPUlxyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgQmlnTnVtYmVyIGNvbnN0cnVjdG9yIGFuZCBleHBvcnRlZCBmdW5jdGlvbi5cclxuICAgICAgICAgKiBDcmVhdGUgYW5kIHJldHVybiBhIG5ldyBpbnN0YW5jZSBvZiBhIEJpZ051bWJlciBvYmplY3QuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBuIHtudW1iZXJ8c3RyaW5nfEJpZ051bWJlcn0gQSBudW1lcmljIHZhbHVlLlxyXG4gICAgICAgICAqIFtiXSB7bnVtYmVyfSBUaGUgYmFzZSBvZiBuLiBJbnRlZ2VyLCAyIHRvIDY0IGluY2x1c2l2ZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBCaWdOdW1iZXIoIG4sIGIgKSB7XHJcbiAgICAgICAgICAgIHZhciBjLCBlLCBpLCBudW0sIGxlbiwgc3RyLFxyXG4gICAgICAgICAgICAgICAgeCA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICAvLyBFbmFibGUgY29uc3RydWN0b3IgdXNhZ2Ugd2l0aG91dCBuZXcuXHJcbiAgICAgICAgICAgIGlmICggISggeCBpbnN0YW5jZW9mIEJpZ051bWJlciApICkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vICdCaWdOdW1iZXIoKSBjb25zdHJ1Y3RvciBjYWxsIHdpdGhvdXQgbmV3OiB7bn0nXHJcbiAgICAgICAgICAgICAgICBpZiAoRVJST1JTKSByYWlzZSggMjYsICdjb25zdHJ1Y3RvciBjYWxsIHdpdGhvdXQgbmV3JywgbiApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWdOdW1iZXIoIG4sIGIgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gJ25ldyBCaWdOdW1iZXIoKSBiYXNlIG5vdCBhbiBpbnRlZ2VyOiB7Yn0nXHJcbiAgICAgICAgICAgIC8vICduZXcgQmlnTnVtYmVyKCkgYmFzZSBvdXQgb2YgcmFuZ2U6IHtifSdcclxuICAgICAgICAgICAgaWYgKCBiID09IG51bGwgfHwgIWlzVmFsaWRJbnQoIGIsIDIsIDY0LCBpZCwgJ2Jhc2UnICkgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRHVwbGljYXRlLlxyXG4gICAgICAgICAgICAgICAgaWYgKCBuIGluc3RhbmNlb2YgQmlnTnVtYmVyICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHgucyA9IG4ucztcclxuICAgICAgICAgICAgICAgICAgICB4LmUgPSBuLmU7XHJcbiAgICAgICAgICAgICAgICAgICAgeC5jID0gKCBuID0gbi5jICkgPyBuLnNsaWNlKCkgOiBuO1xyXG4gICAgICAgICAgICAgICAgICAgIGlkID0gMDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCAoIG51bSA9IHR5cGVvZiBuID09ICdudW1iZXInICkgJiYgbiAqIDAgPT0gMCApIHtcclxuICAgICAgICAgICAgICAgICAgICB4LnMgPSAxIC8gbiA8IDAgPyAoIG4gPSAtbiwgLTEgKSA6IDE7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEZhc3QgcGF0aCBmb3IgaW50ZWdlcnMuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBuID09PSB+fm4gKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIGUgPSAwLCBpID0gbjsgaSA+PSAxMDsgaSAvPSAxMCwgZSsrICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHguZSA9IGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHguYyA9IFtuXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBzdHIgPSBuICsgJyc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICggIWlzTnVtZXJpYy50ZXN0KCBzdHIgPSBuICsgJycgKSApIHJldHVybiBwYXJzZU51bWVyaWMoIHgsIHN0ciwgbnVtICk7XHJcbiAgICAgICAgICAgICAgICAgICAgeC5zID0gc3RyLmNoYXJDb2RlQXQoMCkgPT09IDQ1ID8gKCBzdHIgPSBzdHIuc2xpY2UoMSksIC0xICkgOiAxO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYiA9IGIgfCAwO1xyXG4gICAgICAgICAgICAgICAgc3RyID0gbiArICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEVuc3VyZSByZXR1cm4gdmFsdWUgaXMgcm91bmRlZCB0byBERUNJTUFMX1BMQUNFUyBhcyB3aXRoIG90aGVyIGJhc2VzLlxyXG4gICAgICAgICAgICAgICAgLy8gQWxsb3cgZXhwb25lbnRpYWwgbm90YXRpb24gdG8gYmUgdXNlZCB3aXRoIGJhc2UgMTAgYXJndW1lbnQuXHJcbiAgICAgICAgICAgICAgICBpZiAoIGIgPT0gMTAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IG5ldyBCaWdOdW1iZXIoIG4gaW5zdGFuY2VvZiBCaWdOdW1iZXIgPyBuIDogc3RyICk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvdW5kKCB4LCBERUNJTUFMX1BMQUNFUyArIHguZSArIDEsIFJPVU5ESU5HX01PREUgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBdm9pZCBwb3RlbnRpYWwgaW50ZXJwcmV0YXRpb24gb2YgSW5maW5pdHkgYW5kIE5hTiBhcyBiYXNlIDQ0KyB2YWx1ZXMuXHJcbiAgICAgICAgICAgICAgICAvLyBBbnkgbnVtYmVyIGluIGV4cG9uZW50aWFsIGZvcm0gd2lsbCBmYWlsIGR1ZSB0byB0aGUgW0VlXVsrLV0uXHJcbiAgICAgICAgICAgICAgICBpZiAoICggbnVtID0gdHlwZW9mIG4gPT0gJ251bWJlcicgKSAmJiBuICogMCAhPSAwIHx8XHJcbiAgICAgICAgICAgICAgICAgICEoIG5ldyBSZWdFeHAoICdeLT8nICsgKCBjID0gJ1snICsgQUxQSEFCRVQuc2xpY2UoIDAsIGIgKSArICddKycgKSArXHJcbiAgICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuJyArIGMgKyAnKT8kJyxiIDwgMzcgPyAnaScgOiAnJyApICkudGVzdChzdHIpICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZU51bWVyaWMoIHgsIHN0ciwgbnVtLCBiICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG51bSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHgucyA9IDEgLyBuIDwgMCA/ICggc3RyID0gc3RyLnNsaWNlKDEpLCAtMSApIDogMTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBFUlJPUlMgJiYgc3RyLnJlcGxhY2UoIC9eMFxcLjAqfFxcLi8sICcnICkubGVuZ3RoID4gMTUgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAnbmV3IEJpZ051bWJlcigpIG51bWJlciB0eXBlIGhhcyBtb3JlIHRoYW4gMTUgc2lnbmlmaWNhbnQgZGlnaXRzOiB7bn0nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhaXNlKCBpZCwgdG9vTWFueURpZ2l0cywgbiApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUHJldmVudCBsYXRlciBjaGVjayBmb3IgbGVuZ3RoIG9uIGNvbnZlcnRlZCBudW1iZXIuXHJcbiAgICAgICAgICAgICAgICAgICAgbnVtID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHgucyA9IHN0ci5jaGFyQ29kZUF0KDApID09PSA0NSA/ICggc3RyID0gc3RyLnNsaWNlKDEpLCAtMSApIDogMTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBzdHIgPSBjb252ZXJ0QmFzZSggc3RyLCAxMCwgYiwgeC5zICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIERlY2ltYWwgcG9pbnQ/XHJcbiAgICAgICAgICAgIGlmICggKCBlID0gc3RyLmluZGV4T2YoJy4nKSApID4gLTEgKSBzdHIgPSBzdHIucmVwbGFjZSggJy4nLCAnJyApO1xyXG5cclxuICAgICAgICAgICAgLy8gRXhwb25lbnRpYWwgZm9ybT9cclxuICAgICAgICAgICAgaWYgKCAoIGkgPSBzdHIuc2VhcmNoKCAvZS9pICkgKSA+IDAgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIGV4cG9uZW50LlxyXG4gICAgICAgICAgICAgICAgaWYgKCBlIDwgMCApIGUgPSBpO1xyXG4gICAgICAgICAgICAgICAgZSArPSArc3RyLnNsaWNlKCBpICsgMSApO1xyXG4gICAgICAgICAgICAgICAgc3RyID0gc3RyLnN1YnN0cmluZyggMCwgaSApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCBlIDwgMCApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBJbnRlZ2VyLlxyXG4gICAgICAgICAgICAgICAgZSA9IHN0ci5sZW5ndGg7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIERldGVybWluZSBsZWFkaW5nIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKCBpID0gMDsgc3RyLmNoYXJDb2RlQXQoaSkgPT09IDQ4OyBpKysgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIERldGVybWluZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yICggbGVuID0gc3RyLmxlbmd0aDsgc3RyLmNoYXJDb2RlQXQoLS1sZW4pID09PSA0ODsgKTtcclxuICAgICAgICAgICAgc3RyID0gc3RyLnNsaWNlKCBpLCBsZW4gKyAxICk7XHJcblxyXG4gICAgICAgICAgICBpZiAoc3RyKSB7XHJcbiAgICAgICAgICAgICAgICBsZW4gPSBzdHIubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIERpc2FsbG93IG51bWJlcnMgd2l0aCBvdmVyIDE1IHNpZ25pZmljYW50IGRpZ2l0cyBpZiBudW1iZXIgdHlwZS5cclxuICAgICAgICAgICAgICAgIC8vICduZXcgQmlnTnVtYmVyKCkgbnVtYmVyIHR5cGUgaGFzIG1vcmUgdGhhbiAxNSBzaWduaWZpY2FudCBkaWdpdHM6IHtufSdcclxuICAgICAgICAgICAgICAgIGlmICggbnVtICYmIEVSUk9SUyAmJiBsZW4gPiAxNSAmJiAoIG4gPiBNQVhfU0FGRV9JTlRFR0VSIHx8IG4gIT09IG1hdGhmbG9vcihuKSApICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJhaXNlKCBpZCwgdG9vTWFueURpZ2l0cywgeC5zICogbiApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGUgPSBlIC0gaSAtIDE7XHJcblxyXG4gICAgICAgICAgICAgICAgIC8vIE92ZXJmbG93P1xyXG4gICAgICAgICAgICAgICAgaWYgKCBlID4gTUFYX0VYUCApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSW5maW5pdHkuXHJcbiAgICAgICAgICAgICAgICAgICAgeC5jID0geC5lID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBVbmRlcmZsb3c/XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCBlIDwgTUlOX0VYUCApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gWmVyby5cclxuICAgICAgICAgICAgICAgICAgICB4LmMgPSBbIHguZSA9IDAgXTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeC5lID0gZTtcclxuICAgICAgICAgICAgICAgICAgICB4LmMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVHJhbnNmb3JtIGJhc2VcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZSBpcyB0aGUgYmFzZSAxMCBleHBvbmVudC5cclxuICAgICAgICAgICAgICAgICAgICAvLyBpIGlzIHdoZXJlIHRvIHNsaWNlIHN0ciB0byBnZXQgdGhlIGZpcnN0IGVsZW1lbnQgb2YgdGhlIGNvZWZmaWNpZW50IGFycmF5LlxyXG4gICAgICAgICAgICAgICAgICAgIGkgPSAoIGUgKyAxICkgJSBMT0dfQkFTRTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIGUgPCAwICkgaSArPSBMT0dfQkFTRTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBpIDwgbGVuICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaSkgeC5jLnB1c2goICtzdHIuc2xpY2UoIDAsIGkgKSApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICggbGVuIC09IExPR19CQVNFOyBpIDwgbGVuOyApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHguYy5wdXNoKCArc3RyLnNsaWNlKCBpLCBpICs9IExPR19CQVNFICkgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyID0gc3RyLnNsaWNlKGkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpID0gTE9HX0JBU0UgLSBzdHIubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgLT0gbGVuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICggOyBpLS07IHN0ciArPSAnMCcgKTtcclxuICAgICAgICAgICAgICAgICAgICB4LmMucHVzaCggK3N0ciApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFplcm8uXHJcbiAgICAgICAgICAgICAgICB4LmMgPSBbIHguZSA9IDAgXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWQgPSAwO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8vIENPTlNUUlVDVE9SIFBST1BFUlRJRVNcclxuXHJcblxyXG4gICAgICAgIEJpZ051bWJlci5hbm90aGVyID0gY29uc3RydWN0b3JGYWN0b3J5O1xyXG5cclxuICAgICAgICBCaWdOdW1iZXIuUk9VTkRfVVAgPSAwO1xyXG4gICAgICAgIEJpZ051bWJlci5ST1VORF9ET1dOID0gMTtcclxuICAgICAgICBCaWdOdW1iZXIuUk9VTkRfQ0VJTCA9IDI7XHJcbiAgICAgICAgQmlnTnVtYmVyLlJPVU5EX0ZMT09SID0gMztcclxuICAgICAgICBCaWdOdW1iZXIuUk9VTkRfSEFMRl9VUCA9IDQ7XHJcbiAgICAgICAgQmlnTnVtYmVyLlJPVU5EX0hBTEZfRE9XTiA9IDU7XHJcbiAgICAgICAgQmlnTnVtYmVyLlJPVU5EX0hBTEZfRVZFTiA9IDY7XHJcbiAgICAgICAgQmlnTnVtYmVyLlJPVU5EX0hBTEZfQ0VJTCA9IDc7XHJcbiAgICAgICAgQmlnTnVtYmVyLlJPVU5EX0hBTEZfRkxPT1IgPSA4O1xyXG4gICAgICAgIEJpZ051bWJlci5FVUNMSUQgPSA5O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBDb25maWd1cmUgaW5mcmVxdWVudGx5LWNoYW5naW5nIGxpYnJhcnktd2lkZSBzZXR0aW5ncy5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEFjY2VwdCBhbiBvYmplY3Qgb3IgYW4gYXJndW1lbnQgbGlzdCwgd2l0aCBvbmUgb3IgbWFueSBvZiB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXMgb3JcclxuICAgICAgICAgKiBwYXJhbWV0ZXJzIHJlc3BlY3RpdmVseTpcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqICAgREVDSU1BTF9QTEFDRVMgIHtudW1iZXJ9ICBJbnRlZ2VyLCAwIHRvIE1BWCBpbmNsdXNpdmVcclxuICAgICAgICAgKiAgIFJPVU5ESU5HX01PREUgICB7bnVtYmVyfSAgSW50ZWdlciwgMCB0byA4IGluY2x1c2l2ZVxyXG4gICAgICAgICAqICAgRVhQT05FTlRJQUxfQVQgIHtudW1iZXJ8bnVtYmVyW119ICBJbnRlZ2VyLCAtTUFYIHRvIE1BWCBpbmNsdXNpdmUgb3JcclxuICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2ludGVnZXIgLU1BWCB0byAwIGluY2wuLCAwIHRvIE1BWCBpbmNsLl1cclxuICAgICAgICAgKiAgIFJBTkdFICAgICAgICAgICB7bnVtYmVyfG51bWJlcltdfSAgTm9uLXplcm8gaW50ZWdlciwgLU1BWCB0byBNQVggaW5jbHVzaXZlIG9yXHJcbiAgICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtpbnRlZ2VyIC1NQVggdG8gLTEgaW5jbC4sIGludGVnZXIgMSB0byBNQVggaW5jbC5dXHJcbiAgICAgICAgICogICBFUlJPUlMgICAgICAgICAge2Jvb2xlYW58bnVtYmVyfSAgIHRydWUsIGZhbHNlLCAxIG9yIDBcclxuICAgICAgICAgKiAgIENSWVBUTyAgICAgICAgICB7Ym9vbGVhbnxudW1iZXJ9ICAgdHJ1ZSwgZmFsc2UsIDEgb3IgMFxyXG4gICAgICAgICAqICAgTU9EVUxPX01PREUgICAgIHtudW1iZXJ9ICAgICAgICAgICAwIHRvIDkgaW5jbHVzaXZlXHJcbiAgICAgICAgICogICBQT1dfUFJFQ0lTSU9OICAge251bWJlcn0gICAgICAgICAgIDAgdG8gTUFYIGluY2x1c2l2ZVxyXG4gICAgICAgICAqICAgRk9STUFUICAgICAgICAgIHtvYmplY3R9ICAgICAgICAgICBTZWUgQmlnTnVtYmVyLnByb3RvdHlwZS50b0Zvcm1hdFxyXG4gICAgICAgICAqICAgICAgZGVjaW1hbFNlcGFyYXRvciAgICAgICB7c3RyaW5nfVxyXG4gICAgICAgICAqICAgICAgZ3JvdXBTZXBhcmF0b3IgICAgICAgICB7c3RyaW5nfVxyXG4gICAgICAgICAqICAgICAgZ3JvdXBTaXplICAgICAgICAgICAgICB7bnVtYmVyfVxyXG4gICAgICAgICAqICAgICAgc2Vjb25kYXJ5R3JvdXBTaXplICAgICB7bnVtYmVyfVxyXG4gICAgICAgICAqICAgICAgZnJhY3Rpb25Hcm91cFNlcGFyYXRvciB7c3RyaW5nfVxyXG4gICAgICAgICAqICAgICAgZnJhY3Rpb25Hcm91cFNpemUgICAgICB7bnVtYmVyfVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogKFRoZSB2YWx1ZXMgYXNzaWduZWQgdG8gdGhlIGFib3ZlIEZPUk1BVCBvYmplY3QgcHJvcGVydGllcyBhcmUgbm90IGNoZWNrZWQgZm9yIHZhbGlkaXR5LilcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEUuZy5cclxuICAgICAgICAgKiBCaWdOdW1iZXIuY29uZmlnKDIwLCA0KSBpcyBlcXVpdmFsZW50IHRvXHJcbiAgICAgICAgICogQmlnTnVtYmVyLmNvbmZpZyh7IERFQ0lNQUxfUExBQ0VTIDogMjAsIFJPVU5ESU5HX01PREUgOiA0IH0pXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBJZ25vcmUgcHJvcGVydGllcy9wYXJhbWV0ZXJzIHNldCB0byBudWxsIG9yIHVuZGVmaW5lZC5cclxuICAgICAgICAgKiBSZXR1cm4gYW4gb2JqZWN0IHdpdGggdGhlIHByb3BlcnRpZXMgY3VycmVudCB2YWx1ZXMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgQmlnTnVtYmVyLmNvbmZpZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHYsIHAsXHJcbiAgICAgICAgICAgICAgICBpID0gMCxcclxuICAgICAgICAgICAgICAgIHIgPSB7fSxcclxuICAgICAgICAgICAgICAgIGEgPSBhcmd1bWVudHMsXHJcbiAgICAgICAgICAgICAgICBvID0gYVswXSxcclxuICAgICAgICAgICAgICAgIGhhcyA9IG8gJiYgdHlwZW9mIG8gPT0gJ29iamVjdCdcclxuICAgICAgICAgICAgICAgICAgPyBmdW5jdGlvbiAoKSB7IGlmICggby5oYXNPd25Qcm9wZXJ0eShwKSApIHJldHVybiAoIHYgPSBvW3BdICkgIT0gbnVsbDsgfVxyXG4gICAgICAgICAgICAgICAgICA6IGZ1bmN0aW9uICgpIHsgaWYgKCBhLmxlbmd0aCA+IGkgKSByZXR1cm4gKCB2ID0gYVtpKytdICkgIT0gbnVsbDsgfTtcclxuXHJcbiAgICAgICAgICAgIC8vIERFQ0lNQUxfUExBQ0VTIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYIGluY2x1c2l2ZS5cclxuICAgICAgICAgICAgLy8gJ2NvbmZpZygpIERFQ0lNQUxfUExBQ0VTIG5vdCBhbiBpbnRlZ2VyOiB7dn0nXHJcbiAgICAgICAgICAgIC8vICdjb25maWcoKSBERUNJTUFMX1BMQUNFUyBvdXQgb2YgcmFuZ2U6IHt2fSdcclxuICAgICAgICAgICAgaWYgKCBoYXMoIHAgPSAnREVDSU1BTF9QTEFDRVMnICkgJiYgaXNWYWxpZEludCggdiwgMCwgTUFYLCAyLCBwICkgKSB7XHJcbiAgICAgICAgICAgICAgICBERUNJTUFMX1BMQUNFUyA9IHYgfCAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJbcF0gPSBERUNJTUFMX1BMQUNFUztcclxuXHJcbiAgICAgICAgICAgIC8vIFJPVU5ESU5HX01PREUge251bWJlcn0gSW50ZWdlciwgMCB0byA4IGluY2x1c2l2ZS5cclxuICAgICAgICAgICAgLy8gJ2NvbmZpZygpIFJPVU5ESU5HX01PREUgbm90IGFuIGludGVnZXI6IHt2fSdcclxuICAgICAgICAgICAgLy8gJ2NvbmZpZygpIFJPVU5ESU5HX01PREUgb3V0IG9mIHJhbmdlOiB7dn0nXHJcbiAgICAgICAgICAgIGlmICggaGFzKCBwID0gJ1JPVU5ESU5HX01PREUnICkgJiYgaXNWYWxpZEludCggdiwgMCwgOCwgMiwgcCApICkge1xyXG4gICAgICAgICAgICAgICAgUk9VTkRJTkdfTU9ERSA9IHYgfCAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJbcF0gPSBST1VORElOR19NT0RFO1xyXG5cclxuICAgICAgICAgICAgLy8gRVhQT05FTlRJQUxfQVQge251bWJlcnxudW1iZXJbXX1cclxuICAgICAgICAgICAgLy8gSW50ZWdlciwgLU1BWCB0byBNQVggaW5jbHVzaXZlIG9yIFtpbnRlZ2VyIC1NQVggdG8gMCBpbmNsdXNpdmUsIDAgdG8gTUFYIGluY2x1c2l2ZV0uXHJcbiAgICAgICAgICAgIC8vICdjb25maWcoKSBFWFBPTkVOVElBTF9BVCBub3QgYW4gaW50ZWdlcjoge3Z9J1xyXG4gICAgICAgICAgICAvLyAnY29uZmlnKCkgRVhQT05FTlRJQUxfQVQgb3V0IG9mIHJhbmdlOiB7dn0nXHJcbiAgICAgICAgICAgIGlmICggaGFzKCBwID0gJ0VYUE9ORU5USUFMX0FUJyApICkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICggaXNBcnJheSh2KSApIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIGlzVmFsaWRJbnQoIHZbMF0sIC1NQVgsIDAsIDIsIHAgKSAmJiBpc1ZhbGlkSW50KCB2WzFdLCAwLCBNQVgsIDIsIHAgKSApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgVE9fRVhQX05FRyA9IHZbMF0gfCAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBUT19FWFBfUE9TID0gdlsxXSB8IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICggaXNWYWxpZEludCggdiwgLU1BWCwgTUFYLCAyLCBwICkgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgVE9fRVhQX05FRyA9IC0oIFRPX0VYUF9QT1MgPSAoIHYgPCAwID8gLXYgOiB2ICkgfCAwICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcltwXSA9IFsgVE9fRVhQX05FRywgVE9fRVhQX1BPUyBdO1xyXG5cclxuICAgICAgICAgICAgLy8gUkFOR0Uge251bWJlcnxudW1iZXJbXX0gTm9uLXplcm8gaW50ZWdlciwgLU1BWCB0byBNQVggaW5jbHVzaXZlIG9yXHJcbiAgICAgICAgICAgIC8vIFtpbnRlZ2VyIC1NQVggdG8gLTEgaW5jbHVzaXZlLCBpbnRlZ2VyIDEgdG8gTUFYIGluY2x1c2l2ZV0uXHJcbiAgICAgICAgICAgIC8vICdjb25maWcoKSBSQU5HRSBub3QgYW4gaW50ZWdlcjoge3Z9J1xyXG4gICAgICAgICAgICAvLyAnY29uZmlnKCkgUkFOR0UgY2Fubm90IGJlIHplcm86IHt2fSdcclxuICAgICAgICAgICAgLy8gJ2NvbmZpZygpIFJBTkdFIG91dCBvZiByYW5nZToge3Z9J1xyXG4gICAgICAgICAgICBpZiAoIGhhcyggcCA9ICdSQU5HRScgKSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIGlzQXJyYXkodikgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBpc1ZhbGlkSW50KCB2WzBdLCAtTUFYLCAtMSwgMiwgcCApICYmIGlzVmFsaWRJbnQoIHZbMV0sIDEsIE1BWCwgMiwgcCApICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBNSU5fRVhQID0gdlswXSB8IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE1BWF9FWFAgPSB2WzFdIHwgMDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCBpc1ZhbGlkSW50KCB2LCAtTUFYLCBNQVgsIDIsIHAgKSApIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIHYgfCAwICkgTUlOX0VYUCA9IC0oIE1BWF9FWFAgPSAoIHYgPCAwID8gLXYgOiB2ICkgfCAwICk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoRVJST1JTKSByYWlzZSggMiwgcCArICcgY2Fubm90IGJlIHplcm8nLCB2ICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcltwXSA9IFsgTUlOX0VYUCwgTUFYX0VYUCBdO1xyXG5cclxuICAgICAgICAgICAgLy8gRVJST1JTIHtib29sZWFufG51bWJlcn0gdHJ1ZSwgZmFsc2UsIDEgb3IgMC5cclxuICAgICAgICAgICAgLy8gJ2NvbmZpZygpIEVSUk9SUyBub3QgYSBib29sZWFuIG9yIGJpbmFyeSBkaWdpdDoge3Z9J1xyXG4gICAgICAgICAgICBpZiAoIGhhcyggcCA9ICdFUlJPUlMnICkgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCB2ID09PSAhIXYgfHwgdiA9PT0gMSB8fCB2ID09PSAwICkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBpc1ZhbGlkSW50ID0gKCBFUlJPUlMgPSAhIXYgKSA/IGludFZhbGlkYXRvcldpdGhFcnJvcnMgOiBpbnRWYWxpZGF0b3JOb0Vycm9ycztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoRVJST1JTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmFpc2UoIDIsIHAgKyBub3RCb29sLCB2ICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcltwXSA9IEVSUk9SUztcclxuXHJcbiAgICAgICAgICAgIC8vIENSWVBUTyB7Ym9vbGVhbnxudW1iZXJ9IHRydWUsIGZhbHNlLCAxIG9yIDAuXHJcbiAgICAgICAgICAgIC8vICdjb25maWcoKSBDUllQVE8gbm90IGEgYm9vbGVhbiBvciBiaW5hcnkgZGlnaXQ6IHt2fSdcclxuICAgICAgICAgICAgLy8gJ2NvbmZpZygpIGNyeXB0byB1bmF2YWlsYWJsZToge2NyeXB0b30nXHJcbiAgICAgICAgICAgIGlmICggaGFzKCBwID0gJ0NSWVBUTycgKSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIHYgPT09ICEhdiB8fCB2ID09PSAxIHx8IHYgPT09IDAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgQ1JZUFRPID0gISEoIHYgJiYgY3J5cHRvT2JqICk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCB2ICYmICFDUllQVE8gJiYgRVJST1JTICkgcmFpc2UoIDIsICdjcnlwdG8gdW5hdmFpbGFibGUnLCBjcnlwdG9PYmogKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoRVJST1JTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmFpc2UoIDIsIHAgKyBub3RCb29sLCB2ICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcltwXSA9IENSWVBUTztcclxuXHJcbiAgICAgICAgICAgIC8vIE1PRFVMT19NT0RFIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gOSBpbmNsdXNpdmUuXHJcbiAgICAgICAgICAgIC8vICdjb25maWcoKSBNT0RVTE9fTU9ERSBub3QgYW4gaW50ZWdlcjoge3Z9J1xyXG4gICAgICAgICAgICAvLyAnY29uZmlnKCkgTU9EVUxPX01PREUgb3V0IG9mIHJhbmdlOiB7dn0nXHJcbiAgICAgICAgICAgIGlmICggaGFzKCBwID0gJ01PRFVMT19NT0RFJyApICYmIGlzVmFsaWRJbnQoIHYsIDAsIDksIDIsIHAgKSApIHtcclxuICAgICAgICAgICAgICAgIE1PRFVMT19NT0RFID0gdiB8IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcltwXSA9IE1PRFVMT19NT0RFO1xyXG5cclxuICAgICAgICAgICAgLy8gUE9XX1BSRUNJU0lPTiB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWCBpbmNsdXNpdmUuXHJcbiAgICAgICAgICAgIC8vICdjb25maWcoKSBQT1dfUFJFQ0lTSU9OIG5vdCBhbiBpbnRlZ2VyOiB7dn0nXHJcbiAgICAgICAgICAgIC8vICdjb25maWcoKSBQT1dfUFJFQ0lTSU9OIG91dCBvZiByYW5nZToge3Z9J1xyXG4gICAgICAgICAgICBpZiAoIGhhcyggcCA9ICdQT1dfUFJFQ0lTSU9OJyApICYmIGlzVmFsaWRJbnQoIHYsIDAsIE1BWCwgMiwgcCApICkge1xyXG4gICAgICAgICAgICAgICAgUE9XX1BSRUNJU0lPTiA9IHYgfCAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJbcF0gPSBQT1dfUFJFQ0lTSU9OO1xyXG5cclxuICAgICAgICAgICAgLy8gRk9STUFUIHtvYmplY3R9XHJcbiAgICAgICAgICAgIC8vICdjb25maWcoKSBGT1JNQVQgbm90IGFuIG9iamVjdDoge3Z9J1xyXG4gICAgICAgICAgICBpZiAoIGhhcyggcCA9ICdGT1JNQVQnICkgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCB0eXBlb2YgdiA9PSAnb2JqZWN0JyApIHtcclxuICAgICAgICAgICAgICAgICAgICBGT1JNQVQgPSB2O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChFUlJPUlMpIHtcclxuICAgICAgICAgICAgICAgICAgICByYWlzZSggMiwgcCArICcgbm90IGFuIG9iamVjdCcsIHYgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByW3BdID0gRk9STUFUO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHI7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgbWF4aW11bSBvZiB0aGUgYXJndW1lbnRzLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogYXJndW1lbnRzIHtudW1iZXJ8c3RyaW5nfEJpZ051bWJlcn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBCaWdOdW1iZXIubWF4ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gbWF4T3JNaW4oIGFyZ3VtZW50cywgUC5sdCApOyB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSBtaW5pbXVtIG9mIHRoZSBhcmd1bWVudHMuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBhcmd1bWVudHMge251bWJlcnxzdHJpbmd8QmlnTnVtYmVyfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIEJpZ051bWJlci5taW4gPSBmdW5jdGlvbiAoKSB7IHJldHVybiBtYXhPck1pbiggYXJndW1lbnRzLCBQLmd0ICk7IH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2l0aCBhIHJhbmRvbSB2YWx1ZSBlcXVhbCB0byBvciBncmVhdGVyIHRoYW4gMCBhbmQgbGVzcyB0aGFuIDEsXHJcbiAgICAgICAgICogYW5kIHdpdGggZHAsIG9yIERFQ0lNQUxfUExBQ0VTIGlmIGRwIGlzIG9taXR0ZWQsIGRlY2ltYWwgcGxhY2VzIChvciBsZXNzIGlmIHRyYWlsaW5nXHJcbiAgICAgICAgICogemVyb3MgYXJlIHByb2R1Y2VkKS5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFtkcF0ge251bWJlcn0gRGVjaW1hbCBwbGFjZXMuIEludGVnZXIsIDAgdG8gTUFYIGluY2x1c2l2ZS5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqICdyYW5kb20oKSBkZWNpbWFsIHBsYWNlcyBub3QgYW4gaW50ZWdlcjoge2RwfSdcclxuICAgICAgICAgKiAncmFuZG9tKCkgZGVjaW1hbCBwbGFjZXMgb3V0IG9mIHJhbmdlOiB7ZHB9J1xyXG4gICAgICAgICAqICdyYW5kb20oKSBjcnlwdG8gdW5hdmFpbGFibGU6IHtjcnlwdG99J1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIEJpZ051bWJlci5yYW5kb20gPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgcG93Ml81MyA9IDB4MjAwMDAwMDAwMDAwMDA7XHJcblxyXG4gICAgICAgICAgICAvLyBSZXR1cm4gYSA1MyBiaXQgaW50ZWdlciBuLCB3aGVyZSAwIDw9IG4gPCA5MDA3MTk5MjU0NzQwOTkyLlxyXG4gICAgICAgICAgICAvLyBDaGVjayBpZiBNYXRoLnJhbmRvbSgpIHByb2R1Y2VzIG1vcmUgdGhhbiAzMiBiaXRzIG9mIHJhbmRvbW5lc3MuXHJcbiAgICAgICAgICAgIC8vIElmIGl0IGRvZXMsIGFzc3VtZSBhdCBsZWFzdCA1MyBiaXRzIGFyZSBwcm9kdWNlZCwgb3RoZXJ3aXNlIGFzc3VtZSBhdCBsZWFzdCAzMCBiaXRzLlxyXG4gICAgICAgICAgICAvLyAweDQwMDAwMDAwIGlzIDJeMzAsIDB4ODAwMDAwIGlzIDJeMjMsIDB4MWZmZmZmIGlzIDJeMjEgLSAxLlxyXG4gICAgICAgICAgICB2YXIgcmFuZG9tNTNiaXRJbnQgPSAoTWF0aC5yYW5kb20oKSAqIHBvdzJfNTMpICYgMHgxZmZmZmZcclxuICAgICAgICAgICAgICA/IGZ1bmN0aW9uICgpIHsgcmV0dXJuIG1hdGhmbG9vciggTWF0aC5yYW5kb20oKSAqIHBvdzJfNTMgKTsgfVxyXG4gICAgICAgICAgICAgIDogZnVuY3Rpb24gKCkgeyByZXR1cm4gKChNYXRoLnJhbmRvbSgpICogMHg0MDAwMDAwMCB8IDApICogMHg4MDAwMDApICtcclxuICAgICAgICAgICAgICAgICAgKE1hdGgucmFuZG9tKCkgKiAweDgwMDAwMCB8IDApOyB9O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChkcCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGEsIGIsIGUsIGssIHYsXHJcbiAgICAgICAgICAgICAgICAgICAgaSA9IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgYyA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIHJhbmQgPSBuZXcgQmlnTnVtYmVyKE9ORSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZHAgPSBkcCA9PSBudWxsIHx8ICFpc1ZhbGlkSW50KCBkcCwgMCwgTUFYLCAxNCApID8gREVDSU1BTF9QTEFDRVMgOiBkcCB8IDA7XHJcbiAgICAgICAgICAgICAgICBrID0gbWF0aGNlaWwoIGRwIC8gTE9HX0JBU0UgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoQ1JZUFRPKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEJyb3dzZXJzIHN1cHBvcnRpbmcgY3J5cHRvLmdldFJhbmRvbVZhbHVlcy5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIGNyeXB0b09iaiAmJiBjcnlwdG9PYmouZ2V0UmFuZG9tVmFsdWVzICkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgYSA9IGNyeXB0b09iai5nZXRSYW5kb21WYWx1ZXMoIG5ldyBVaW50MzJBcnJheSggayAqPSAyICkgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIDsgaSA8IGs7ICkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDUzIGJpdHM6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAoKE1hdGgucG93KDIsIDMyKSAtIDEpICogTWF0aC5wb3coMiwgMjEpKS50b1N0cmluZygyKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMTExMTEgMTExMTExMTEgMTExMTExMTEgMTExMTExMTEgMTExMDAwMDAgMDAwMDAwMDAgMDAwMDAwMDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICgoTWF0aC5wb3coMiwgMzIpIC0gMSkgPj4+IDExKS50b1N0cmluZygyKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMTExMTEgMTExMTExMTEgMTExMTExMTFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDB4MjAwMDAgaXMgMl4yMS5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHYgPSBhW2ldICogMHgyMDAwMCArIChhW2kgKyAxXSA+Pj4gMTEpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlamVjdGlvbiBzYW1wbGluZzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgPD0gdiA8IDkwMDcxOTkyNTQ3NDA5OTJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByb2JhYmlsaXR5IHRoYXQgdiA+PSA5ZTE1LCBpc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gNzE5OTI1NDc0MDk5MiAvIDkwMDcxOTkyNTQ3NDA5OTIgfj0gMC4wMDA4LCBpLmUuIDEgaW4gMTI1MVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCB2ID49IDllMTUgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYiA9IGNyeXB0b09iai5nZXRSYW5kb21WYWx1ZXMoIG5ldyBVaW50MzJBcnJheSgyKSApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFbaV0gPSBiWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFbaSArIDFdID0gYlsxXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgPD0gdiA8PSA4OTk5OTk5OTk5OTk5OTk5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMCA8PSAodiAlIDFlMTQpIDw9IDk5OTk5OTk5OTk5OTk5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYy5wdXNoKCB2ICUgMWUxNCApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gMjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpID0gayAvIDI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIE5vZGUuanMgc3VwcG9ydGluZyBjcnlwdG8ucmFuZG9tQnl0ZXMuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICggY3J5cHRvT2JqICYmIGNyeXB0b09iai5yYW5kb21CeXRlcyApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJ1ZmZlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhID0gY3J5cHRvT2JqLnJhbmRvbUJ5dGVzKCBrICo9IDcgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIDsgaSA8IGs7ICkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDB4MTAwMDAwMDAwMDAwMCBpcyAyXjQ4LCAweDEwMDAwMDAwMDAwIGlzIDJeNDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDB4MTAwMDAwMDAwIGlzIDJeMzIsIDB4MTAwMDAwMCBpcyAyXjI0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAxMTExMSAxMTExMTExMSAxMTExMTExMSAxMTExMTExMSAxMTExMTExMSAxMTExMTExMSAxMTExMTExMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMCA8PSB2IDwgOTAwNzE5OTI1NDc0MDk5MlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdiA9ICggKCBhW2ldICYgMzEgKSAqIDB4MTAwMDAwMDAwMDAwMCApICsgKCBhW2kgKyAxXSAqIDB4MTAwMDAwMDAwMDAgKSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIGFbaSArIDJdICogMHgxMDAwMDAwMDAgKSArICggYVtpICsgM10gKiAweDEwMDAwMDAgKSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIGFbaSArIDRdIDw8IDE2ICkgKyAoIGFbaSArIDVdIDw8IDggKSArIGFbaSArIDZdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggdiA+PSA5ZTE1ICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyeXB0b09iai5yYW5kb21CeXRlcyg3KS5jb3B5KCBhLCBpICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwIDw9ICh2ICUgMWUxNCkgPD0gOTk5OTk5OTk5OTk5OTlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjLnB1c2goIHYgJSAxZTE0ICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSArPSA3O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgPSBrIC8gNztcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKEVSUk9SUykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByYWlzZSggMTQsICdjcnlwdG8gdW5hdmFpbGFibGUnLCBjcnlwdG9PYmogKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVXNlIE1hdGgucmFuZG9tOiBDUllQVE8gaXMgZmFsc2Ugb3IgY3J5cHRvIGlzIHVuYXZhaWxhYmxlIGFuZCBFUlJPUlMgaXMgZmFsc2UuXHJcbiAgICAgICAgICAgICAgICBpZiAoIWkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICggOyBpIDwgazsgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHYgPSByYW5kb201M2JpdEludCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHYgPCA5ZTE1ICkgY1tpKytdID0gdiAlIDFlMTQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGsgPSBjWy0taV07XHJcbiAgICAgICAgICAgICAgICBkcCAlPSBMT0dfQkFTRTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IHRyYWlsaW5nIGRpZ2l0cyB0byB6ZXJvcyBhY2NvcmRpbmcgdG8gZHAuXHJcbiAgICAgICAgICAgICAgICBpZiAoIGsgJiYgZHAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdiA9IFBPV1NfVEVOW0xPR19CQVNFIC0gZHBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGNbaV0gPSBtYXRoZmxvb3IoIGsgLyB2ICkgKiB2O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyBlbGVtZW50cyB3aGljaCBhcmUgemVyby5cclxuICAgICAgICAgICAgICAgIGZvciAoIDsgY1tpXSA9PT0gMDsgYy5wb3AoKSwgaS0tICk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gWmVybz9cclxuICAgICAgICAgICAgICAgIGlmICggaSA8IDAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYyA9IFsgZSA9IDAgXTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBsZWFkaW5nIGVsZW1lbnRzIHdoaWNoIGFyZSB6ZXJvIGFuZCBhZGp1c3QgZXhwb25lbnQgYWNjb3JkaW5nbHkuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICggZSA9IC0xIDsgY1swXSA9PT0gMDsgYy5zaGlmdCgpLCBlIC09IExPR19CQVNFKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQ291bnQgdGhlIGRpZ2l0cyBvZiB0aGUgZmlyc3QgZWxlbWVudCBvZiBjIHRvIGRldGVybWluZSBsZWFkaW5nIHplcm9zLCBhbmQuLi5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKCBpID0gMSwgdiA9IGNbMF07IHYgPj0gMTA7IHYgLz0gMTAsIGkrKyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGFkanVzdCB0aGUgZXhwb25lbnQgYWNjb3JkaW5nbHkuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBpIDwgTE9HX0JBU0UgKSBlIC09IExPR19CQVNFIC0gaTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByYW5kLmUgPSBlO1xyXG4gICAgICAgICAgICAgICAgcmFuZC5jID0gYztcclxuICAgICAgICAgICAgICAgIHJldHVybiByYW5kO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0pKCk7XHJcblxyXG5cclxuICAgICAgICAvLyBQUklWQVRFIEZVTkNUSU9OU1xyXG5cclxuXHJcbiAgICAgICAgLy8gQ29udmVydCBhIG51bWVyaWMgc3RyaW5nIG9mIGJhc2VJbiB0byBhIG51bWVyaWMgc3RyaW5nIG9mIGJhc2VPdXQuXHJcbiAgICAgICAgZnVuY3Rpb24gY29udmVydEJhc2UoIHN0ciwgYmFzZU91dCwgYmFzZUluLCBzaWduICkge1xyXG4gICAgICAgICAgICB2YXIgZCwgZSwgaywgciwgeCwgeGMsIHksXHJcbiAgICAgICAgICAgICAgICBpID0gc3RyLmluZGV4T2YoICcuJyApLFxyXG4gICAgICAgICAgICAgICAgZHAgPSBERUNJTUFMX1BMQUNFUyxcclxuICAgICAgICAgICAgICAgIHJtID0gUk9VTkRJTkdfTU9ERTtcclxuXHJcbiAgICAgICAgICAgIGlmICggYmFzZUluIDwgMzcgKSBzdHIgPSBzdHIudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIE5vbi1pbnRlZ2VyLlxyXG4gICAgICAgICAgICBpZiAoIGkgPj0gMCApIHtcclxuICAgICAgICAgICAgICAgIGsgPSBQT1dfUFJFQ0lTSU9OO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFVubGltaXRlZCBwcmVjaXNpb24uXHJcbiAgICAgICAgICAgICAgICBQT1dfUFJFQ0lTSU9OID0gMDtcclxuICAgICAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKCAnLicsICcnICk7XHJcbiAgICAgICAgICAgICAgICB5ID0gbmV3IEJpZ051bWJlcihiYXNlSW4pO1xyXG4gICAgICAgICAgICAgICAgeCA9IHkucG93KCBzdHIubGVuZ3RoIC0gaSApO1xyXG4gICAgICAgICAgICAgICAgUE9XX1BSRUNJU0lPTiA9IGs7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ29udmVydCBzdHIgYXMgaWYgYW4gaW50ZWdlciwgdGhlbiByZXN0b3JlIHRoZSBmcmFjdGlvbiBwYXJ0IGJ5IGRpdmlkaW5nIHRoZVxyXG4gICAgICAgICAgICAgICAgLy8gcmVzdWx0IGJ5IGl0cyBiYXNlIHJhaXNlZCB0byBhIHBvd2VyLlxyXG4gICAgICAgICAgICAgICAgeS5jID0gdG9CYXNlT3V0KCB0b0ZpeGVkUG9pbnQoIGNvZWZmVG9TdHJpbmcoIHguYyApLCB4LmUgKSwgMTAsIGJhc2VPdXQgKTtcclxuICAgICAgICAgICAgICAgIHkuZSA9IHkuYy5sZW5ndGg7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIENvbnZlcnQgdGhlIG51bWJlciBhcyBpbnRlZ2VyLlxyXG4gICAgICAgICAgICB4YyA9IHRvQmFzZU91dCggc3RyLCBiYXNlSW4sIGJhc2VPdXQgKTtcclxuICAgICAgICAgICAgZSA9IGsgPSB4Yy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoIDsgeGNbLS1rXSA9PSAwOyB4Yy5wb3AoKSApO1xyXG4gICAgICAgICAgICBpZiAoICF4Y1swXSApIHJldHVybiAnMCc7XHJcblxyXG4gICAgICAgICAgICBpZiAoIGkgPCAwICkge1xyXG4gICAgICAgICAgICAgICAgLS1lO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgeC5jID0geGM7XHJcbiAgICAgICAgICAgICAgICB4LmUgPSBlO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHNpZ24gaXMgbmVlZGVkIGZvciBjb3JyZWN0IHJvdW5kaW5nLlxyXG4gICAgICAgICAgICAgICAgeC5zID0gc2lnbjtcclxuICAgICAgICAgICAgICAgIHggPSBkaXYoIHgsIHksIGRwLCBybSwgYmFzZU91dCApO1xyXG4gICAgICAgICAgICAgICAgeGMgPSB4LmM7XHJcbiAgICAgICAgICAgICAgICByID0geC5yO1xyXG4gICAgICAgICAgICAgICAgZSA9IHguZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZCA9IGUgKyBkcCArIDE7XHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgcm91bmRpbmcgZGlnaXQsIGkuZS4gdGhlIGRpZ2l0IHRvIHRoZSByaWdodCBvZiB0aGUgZGlnaXQgdGhhdCBtYXkgYmUgcm91bmRlZCB1cC5cclxuICAgICAgICAgICAgaSA9IHhjW2RdO1xyXG4gICAgICAgICAgICBrID0gYmFzZU91dCAvIDI7XHJcbiAgICAgICAgICAgIHIgPSByIHx8IGQgPCAwIHx8IHhjW2QgKyAxXSAhPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgciA9IHJtIDwgNCA/ICggaSAhPSBudWxsIHx8IHIgKSAmJiAoIHJtID09IDAgfHwgcm0gPT0gKCB4LnMgPCAwID8gMyA6IDIgKSApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgOiBpID4gayB8fCBpID09IGsgJiYoIHJtID09IDQgfHwgciB8fCBybSA9PSA2ICYmIHhjW2QgLSAxXSAmIDEgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHJtID09ICggeC5zIDwgMCA/IDggOiA3ICkgKTtcclxuXHJcbiAgICAgICAgICAgIGlmICggZCA8IDEgfHwgIXhjWzBdICkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIDFeLWRwIG9yIDAuXHJcbiAgICAgICAgICAgICAgICBzdHIgPSByID8gdG9GaXhlZFBvaW50KCAnMScsIC1kcCApIDogJzAnO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgeGMubGVuZ3RoID0gZDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBSb3VuZGluZyB1cCBtYXkgbWVhbiB0aGUgcHJldmlvdXMgZGlnaXQgaGFzIHRvIGJlIHJvdW5kZWQgdXAgYW5kIHNvIG9uLlxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoIC0tYmFzZU91dDsgKyt4Y1stLWRdID4gYmFzZU91dDsgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhjW2RdID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggIWQgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICArK2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4Yy51bnNoaWZ0KDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIERldGVybWluZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgICAgIGZvciAoIGsgPSB4Yy5sZW5ndGg7ICF4Y1stLWtdOyApO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEUuZy4gWzQsIDExLCAxNV0gYmVjb21lcyA0YmYuXHJcbiAgICAgICAgICAgICAgICBmb3IgKCBpID0gMCwgc3RyID0gJyc7IGkgPD0gazsgc3RyICs9IEFMUEhBQkVULmNoYXJBdCggeGNbaSsrXSApICk7XHJcbiAgICAgICAgICAgICAgICBzdHIgPSB0b0ZpeGVkUG9pbnQoIHN0ciwgZSApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgY2FsbGVyIHdpbGwgYWRkIHRoZSBzaWduLlxyXG4gICAgICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8vIFBlcmZvcm0gZGl2aXNpb24gaW4gdGhlIHNwZWNpZmllZCBiYXNlLiBDYWxsZWQgYnkgZGl2IGFuZCBjb252ZXJ0QmFzZS5cclxuICAgICAgICBkaXYgPSAoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAgICAgLy8gQXNzdW1lIG5vbi16ZXJvIHggYW5kIGsuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG11bHRpcGx5KCB4LCBrLCBiYXNlICkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG0sIHRlbXAsIHhsbywgeGhpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNhcnJ5ID0gMCxcclxuICAgICAgICAgICAgICAgICAgICBpID0geC5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICAgICAga2xvID0gayAlIFNRUlRfQkFTRSxcclxuICAgICAgICAgICAgICAgICAgICBraGkgPSBrIC8gU1FSVF9CQVNFIHwgMDtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKCB4ID0geC5zbGljZSgpOyBpLS07ICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHhsbyA9IHhbaV0gJSBTUVJUX0JBU0U7XHJcbiAgICAgICAgICAgICAgICAgICAgeGhpID0geFtpXSAvIFNRUlRfQkFTRSB8IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgbSA9IGtoaSAqIHhsbyArIHhoaSAqIGtsbztcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wID0ga2xvICogeGxvICsgKCAoIG0gJSBTUVJUX0JBU0UgKSAqIFNRUlRfQkFTRSApICsgY2Fycnk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FycnkgPSAoIHRlbXAgLyBiYXNlIHwgMCApICsgKCBtIC8gU1FSVF9CQVNFIHwgMCApICsga2hpICogeGhpO1xyXG4gICAgICAgICAgICAgICAgICAgIHhbaV0gPSB0ZW1wICUgYmFzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY2FycnkpIHgudW5zaGlmdChjYXJyeSk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHg7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNvbXBhcmUoIGEsIGIsIGFMLCBiTCApIHtcclxuICAgICAgICAgICAgICAgIHZhciBpLCBjbXA7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCBhTCAhPSBiTCApIHtcclxuICAgICAgICAgICAgICAgICAgICBjbXAgPSBhTCA+IGJMID8gMSA6IC0xO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICggaSA9IGNtcCA9IDA7IGkgPCBhTDsgaSsrICkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBhW2ldICE9IGJbaV0gKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbXAgPSBhW2ldID4gYltpXSA/IDEgOiAtMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNtcDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gc3VidHJhY3QoIGEsIGIsIGFMLCBiYXNlICkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGkgPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFN1YnRyYWN0IGIgZnJvbSBhLlxyXG4gICAgICAgICAgICAgICAgZm9yICggOyBhTC0tOyApIHtcclxuICAgICAgICAgICAgICAgICAgICBhW2FMXSAtPSBpO1xyXG4gICAgICAgICAgICAgICAgICAgIGkgPSBhW2FMXSA8IGJbYUxdID8gMSA6IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgYVthTF0gPSBpICogYmFzZSArIGFbYUxdIC0gYlthTF07XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIGxlYWRpbmcgemVyb3MuXHJcbiAgICAgICAgICAgICAgICBmb3IgKCA7ICFhWzBdICYmIGEubGVuZ3RoID4gMTsgYS5zaGlmdCgpICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIHg6IGRpdmlkZW5kLCB5OiBkaXZpc29yLlxyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCB4LCB5LCBkcCwgcm0sIGJhc2UgKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY21wLCBlLCBpLCBtb3JlLCBuLCBwcm9kLCBwcm9kTCwgcSwgcWMsIHJlbSwgcmVtTCwgcmVtMCwgeGksIHhMLCB5YzAsXHJcbiAgICAgICAgICAgICAgICAgICAgeUwsIHl6LFxyXG4gICAgICAgICAgICAgICAgICAgIHMgPSB4LnMgPT0geS5zID8gMSA6IC0xLFxyXG4gICAgICAgICAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICAgICAgICAgIHljID0geS5jO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEVpdGhlciBOYU4sIEluZmluaXR5IG9yIDA/XHJcbiAgICAgICAgICAgICAgICBpZiAoICF4YyB8fCAheGNbMF0gfHwgIXljIHx8ICF5Y1swXSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWdOdW1iZXIoXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgLy8gUmV0dXJuIE5hTiBpZiBlaXRoZXIgTmFOLCBvciBib3RoIEluZmluaXR5IG9yIDAuXHJcbiAgICAgICAgICAgICAgICAgICAgICAheC5zIHx8ICF5LnMgfHwgKCB4YyA/IHljICYmIHhjWzBdID09IHljWzBdIDogIXljICkgPyBOYU4gOlxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmV0dXJuIMKxMCBpZiB4IGlzIMKxMCBvciB5IGlzIMKxSW5maW5pdHksIG9yIHJldHVybiDCsUluZmluaXR5IGFzIHkgaXMgwrEwLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB4YyAmJiB4Y1swXSA9PSAwIHx8ICF5YyA/IHMgKiAwIDogcyAvIDBcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHEgPSBuZXcgQmlnTnVtYmVyKHMpO1xyXG4gICAgICAgICAgICAgICAgcWMgPSBxLmMgPSBbXTtcclxuICAgICAgICAgICAgICAgIGUgPSB4LmUgLSB5LmU7XHJcbiAgICAgICAgICAgICAgICBzID0gZHAgKyBlICsgMTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoICFiYXNlICkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJhc2UgPSBCQVNFO1xyXG4gICAgICAgICAgICAgICAgICAgIGUgPSBiaXRGbG9vciggeC5lIC8gTE9HX0JBU0UgKSAtIGJpdEZsb29yKCB5LmUgLyBMT0dfQkFTRSApO1xyXG4gICAgICAgICAgICAgICAgICAgIHMgPSBzIC8gTE9HX0JBU0UgfCAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFJlc3VsdCBleHBvbmVudCBtYXkgYmUgb25lIGxlc3MgdGhlbiB0aGUgY3VycmVudCB2YWx1ZSBvZiBlLlxyXG4gICAgICAgICAgICAgICAgLy8gVGhlIGNvZWZmaWNpZW50cyBvZiB0aGUgQmlnTnVtYmVycyBmcm9tIGNvbnZlcnRCYXNlIG1heSBoYXZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgICAgICAgZm9yICggaSA9IDA7IHljW2ldID09ICggeGNbaV0gfHwgMCApOyBpKysgKTtcclxuICAgICAgICAgICAgICAgIGlmICggeWNbaV0gPiAoIHhjW2ldIHx8IDAgKSApIGUtLTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIHMgPCAwICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHFjLnB1c2goMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9yZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHhMID0geGMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIHlMID0geWMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIGkgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gMjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTm9ybWFsaXNlIHhjIGFuZCB5YyBzbyBoaWdoZXN0IG9yZGVyIGRpZ2l0IG9mIHljIGlzID49IGJhc2UgLyAyLlxyXG5cclxuICAgICAgICAgICAgICAgICAgICBuID0gbWF0aGZsb29yKCBiYXNlIC8gKCB5Y1swXSArIDEgKSApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBOb3QgbmVjZXNzYXJ5LCBidXQgdG8gaGFuZGxlIG9kZCBiYXNlcyB3aGVyZSB5Y1swXSA9PSAoIGJhc2UgLyAyICkgLSAxLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmICggbiA+IDEgfHwgbisrID09IDEgJiYgeWNbMF0gPCBiYXNlIC8gMiApIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIG4gPiAxICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5YyA9IG11bHRpcGx5KCB5YywgbiwgYmFzZSApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4YyA9IG11bHRpcGx5KCB4YywgbiwgYmFzZSApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5TCA9IHljLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeEwgPSB4Yy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB4aSA9IHlMO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbSA9IHhjLnNsaWNlKCAwLCB5TCApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbUwgPSByZW0ubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgemVyb3MgdG8gbWFrZSByZW1haW5kZXIgYXMgbG9uZyBhcyBkaXZpc29yLlxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoIDsgcmVtTCA8IHlMOyByZW1bcmVtTCsrXSA9IDAgKTtcclxuICAgICAgICAgICAgICAgICAgICB5eiA9IHljLnNsaWNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgeXoudW5zaGlmdCgwKTtcclxuICAgICAgICAgICAgICAgICAgICB5YzAgPSB5Y1swXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIHljWzFdID49IGJhc2UgLyAyICkgeWMwKys7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90IG5lY2Vzc2FyeSwgYnV0IHRvIHByZXZlbnQgdHJpYWwgZGlnaXQgbiA+IGJhc2UsIHdoZW4gdXNpbmcgYmFzZSAzLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGVsc2UgaWYgKCBiYXNlID09IDMgJiYgeWMwID09IDEgKSB5YzAgPSAxICsgMWUtMTU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbiA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDb21wYXJlIGRpdmlzb3IgYW5kIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY21wID0gY29tcGFyZSggeWMsIHJlbSwgeUwsIHJlbUwgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIGRpdmlzb3IgPCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggY21wIDwgMCApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgdHJpYWwgZGlnaXQsIG4uXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtMCA9IHJlbVswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggeUwgIT0gcmVtTCApIHJlbTAgPSByZW0wICogYmFzZSArICggcmVtWzFdIHx8IDAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBuIGlzIGhvdyBtYW55IHRpbWVzIHRoZSBkaXZpc29yIGdvZXMgaW50byB0aGUgY3VycmVudCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuID0gbWF0aGZsb29yKCByZW0wIC8geWMwICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gIEFsZ29yaXRobTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAxLiBwcm9kdWN0ID0gZGl2aXNvciAqIHRyaWFsIGRpZ2l0IChuKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gIDIuIGlmIHByb2R1Y3QgPiByZW1haW5kZXI6IHByb2R1Y3QgLT0gZGl2aXNvciwgbi0tXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgMy4gcmVtYWluZGVyIC09IHByb2R1Y3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICA0LiBpZiBwcm9kdWN0IHdhcyA8IHJlbWFpbmRlciBhdCAyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgNS4gY29tcGFyZSBuZXcgcmVtYWluZGVyIGFuZCBkaXZpc29yXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICA2LiBJZiByZW1haW5kZXIgPiBkaXZpc29yOiByZW1haW5kZXIgLT0gZGl2aXNvciwgbisrXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBuID4gMSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbiBtYXkgYmUgPiBiYXNlIG9ubHkgd2hlbiBiYXNlIGlzIDMuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG4gPj0gYmFzZSkgbiA9IGJhc2UgLSAxO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwcm9kdWN0ID0gZGl2aXNvciAqIHRyaWFsIGRpZ2l0LlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2QgPSBtdWx0aXBseSggeWMsIG4sIGJhc2UgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9kTCA9IHByb2QubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbUwgPSByZW0ubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDb21wYXJlIHByb2R1Y3QgYW5kIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBwcm9kdWN0ID4gcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRyaWFsIGRpZ2l0IG4gdG9vIGhpZ2guXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbiBpcyAxIHRvbyBoaWdoIGFib3V0IDUlIG9mIHRoZSB0aW1lLCBhbmQgaXMgbm90IGtub3duIHRvIGhhdmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBldmVyIGJlZW4gbW9yZSB0aGFuIDEgdG9vIGhpZ2guXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKCBjb21wYXJlKCBwcm9kLCByZW0sIHByb2RMLCByZW1MICkgPT0gMSApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbi0tO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3VidHJhY3QgZGl2aXNvciBmcm9tIHByb2R1Y3QuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YnRyYWN0KCBwcm9kLCB5TCA8IHByb2RMID8geXogOiB5YywgcHJvZEwsIGJhc2UgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZEwgPSBwcm9kLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY21wID0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBuIGlzIDAgb3IgMSwgY21wIGlzIC0xLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIG4gaXMgMCwgdGhlcmUgaXMgbm8gbmVlZCB0byBjb21wYXJlIHljIGFuZCByZW0gYWdhaW4gYmVsb3csXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc28gY2hhbmdlIGNtcCB0byAxIHRvIGF2b2lkIGl0LlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIG4gaXMgMSwgbGVhdmUgY21wIGFzIC0xLCBzbyB5YyBhbmQgcmVtIGFyZSBjb21wYXJlZCBhZ2Fpbi5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIG4gPT0gMCApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRpdmlzb3IgPCByZW1haW5kZXIsIHNvIG4gbXVzdCBiZSBhdCBsZWFzdCAxLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbXAgPSBuID0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHByb2R1Y3QgPSBkaXZpc29yXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZCA9IHljLnNsaWNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZEwgPSBwcm9kLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHByb2RMIDwgcmVtTCApIHByb2QudW5zaGlmdCgwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTdWJ0cmFjdCBwcm9kdWN0IGZyb20gcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VidHJhY3QoIHJlbSwgcHJvZCwgcmVtTCwgYmFzZSApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtTCA9IHJlbS5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHByb2R1Y3Qgd2FzIDwgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBjbXAgPT0gLTEgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbXBhcmUgZGl2aXNvciBhbmQgbmV3IHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBkaXZpc29yIDwgbmV3IHJlbWFpbmRlciwgc3VidHJhY3QgZGl2aXNvciBmcm9tIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUcmlhbCBkaWdpdCBuIHRvbyBsb3cuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbiBpcyAxIHRvbyBsb3cgYWJvdXQgNSUgb2YgdGhlIHRpbWUsIGFuZCB2ZXJ5IHJhcmVseSAyIHRvbyBsb3cuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKCBjb21wYXJlKCB5YywgcmVtLCB5TCwgcmVtTCApIDwgMSApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbisrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3VidHJhY3QgZGl2aXNvciBmcm9tIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VidHJhY3QoIHJlbSwgeUwgPCByZW1MID8geXogOiB5YywgcmVtTCwgYmFzZSApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1MID0gcmVtLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIGNtcCA9PT0gMCApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG4rKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbSA9IFswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSAvLyBlbHNlIGNtcCA9PT0gMSBhbmQgbiB3aWxsIGJlIDBcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkZCB0aGUgbmV4dCBkaWdpdCwgbiwgdG8gdGhlIHJlc3VsdCBhcnJheS5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcWNbaSsrXSA9IG47XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBVcGRhdGUgdGhlIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCByZW1bMF0gKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1bcmVtTCsrXSA9IHhjW3hpXSB8fCAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtID0gWyB4Y1t4aV0gXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbUwgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSB3aGlsZSAoICggeGkrKyA8IHhMIHx8IHJlbVswXSAhPSBudWxsICkgJiYgcy0tICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG1vcmUgPSByZW1bMF0gIT0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTGVhZGluZyB6ZXJvP1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICggIXFjWzBdICkgcWMuc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIGJhc2UgPT0gQkFTRSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVG8gY2FsY3VsYXRlIHEuZSwgZmlyc3QgZ2V0IHRoZSBudW1iZXIgb2YgZGlnaXRzIG9mIHFjWzBdLlxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoIGkgPSAxLCBzID0gcWNbMF07IHMgPj0gMTA7IHMgLz0gMTAsIGkrKyApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJvdW5kKCBxLCBkcCArICggcS5lID0gaSArIGUgKiBMT0dfQkFTRSAtIDEgKSArIDEsIHJtLCBtb3JlICk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ2FsbGVyIGlzIGNvbnZlcnRCYXNlLlxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBxLmUgPSBlO1xyXG4gICAgICAgICAgICAgICAgICAgIHEuciA9ICttb3JlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBxO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0pKCk7XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIEJpZ051bWJlciBuIGluIGZpeGVkLXBvaW50IG9yIGV4cG9uZW50aWFsXHJcbiAgICAgICAgICogbm90YXRpb24gcm91bmRlZCB0byB0aGUgc3BlY2lmaWVkIGRlY2ltYWwgcGxhY2VzIG9yIHNpZ25pZmljYW50IGRpZ2l0cy5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIG4gaXMgYSBCaWdOdW1iZXIuXHJcbiAgICAgICAgICogaSBpcyB0aGUgaW5kZXggb2YgdGhlIGxhc3QgZGlnaXQgcmVxdWlyZWQgKGkuZS4gdGhlIGRpZ2l0IHRoYXQgbWF5IGJlIHJvdW5kZWQgdXApLlxyXG4gICAgICAgICAqIHJtIGlzIHRoZSByb3VuZGluZyBtb2RlLlxyXG4gICAgICAgICAqIGNhbGxlciBpcyBjYWxsZXIgaWQ6IHRvRXhwb25lbnRpYWwgMTksIHRvRml4ZWQgMjAsIHRvRm9ybWF0IDIxLCB0b1ByZWNpc2lvbiAyNC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBmb3JtYXQoIG4sIGksIHJtLCBjYWxsZXIgKSB7XHJcbiAgICAgICAgICAgIHZhciBjMCwgZSwgbmUsIGxlbiwgc3RyO1xyXG5cclxuICAgICAgICAgICAgcm0gPSBybSAhPSBudWxsICYmIGlzVmFsaWRJbnQoIHJtLCAwLCA4LCBjYWxsZXIsIHJvdW5kaW5nTW9kZSApXHJcbiAgICAgICAgICAgICAgPyBybSB8IDAgOiBST1VORElOR19NT0RFO1xyXG5cclxuICAgICAgICAgICAgaWYgKCAhbi5jICkgcmV0dXJuIG4udG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgYzAgPSBuLmNbMF07XHJcbiAgICAgICAgICAgIG5lID0gbi5lO1xyXG5cclxuICAgICAgICAgICAgaWYgKCBpID09IG51bGwgKSB7XHJcbiAgICAgICAgICAgICAgICBzdHIgPSBjb2VmZlRvU3RyaW5nKCBuLmMgKTtcclxuICAgICAgICAgICAgICAgIHN0ciA9IGNhbGxlciA9PSAxOSB8fCBjYWxsZXIgPT0gMjQgJiYgbmUgPD0gVE9fRVhQX05FR1xyXG4gICAgICAgICAgICAgICAgICA/IHRvRXhwb25lbnRpYWwoIHN0ciwgbmUgKVxyXG4gICAgICAgICAgICAgICAgICA6IHRvRml4ZWRQb2ludCggc3RyLCBuZSApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbiA9IHJvdW5kKCBuZXcgQmlnTnVtYmVyKG4pLCBpLCBybSApO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIG4uZSBtYXkgaGF2ZSBjaGFuZ2VkIGlmIHRoZSB2YWx1ZSB3YXMgcm91bmRlZCB1cC5cclxuICAgICAgICAgICAgICAgIGUgPSBuLmU7XHJcblxyXG4gICAgICAgICAgICAgICAgc3RyID0gY29lZmZUb1N0cmluZyggbi5jICk7XHJcbiAgICAgICAgICAgICAgICBsZW4gPSBzdHIubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHRvUHJlY2lzaW9uIHJldHVybnMgZXhwb25lbnRpYWwgbm90YXRpb24gaWYgdGhlIG51bWJlciBvZiBzaWduaWZpY2FudCBkaWdpdHNcclxuICAgICAgICAgICAgICAgIC8vIHNwZWNpZmllZCBpcyBsZXNzIHRoYW4gdGhlIG51bWJlciBvZiBkaWdpdHMgbmVjZXNzYXJ5IHRvIHJlcHJlc2VudCB0aGUgaW50ZWdlclxyXG4gICAgICAgICAgICAgICAgLy8gcGFydCBvZiB0aGUgdmFsdWUgaW4gZml4ZWQtcG9pbnQgbm90YXRpb24uXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgICAgICAgICAgICBpZiAoIGNhbGxlciA9PSAxOSB8fCBjYWxsZXIgPT0gMjQgJiYgKCBpIDw9IGUgfHwgZSA8PSBUT19FWFBfTkVHICkgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEFwcGVuZCB6ZXJvcz9cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKCA7IGxlbiA8IGk7IHN0ciArPSAnMCcsIGxlbisrICk7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RyID0gdG9FeHBvbmVudGlhbCggc3RyLCBlICk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRml4ZWQtcG9pbnQgbm90YXRpb24uXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGkgLT0gbmU7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RyID0gdG9GaXhlZFBvaW50KCBzdHIsIGUgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQXBwZW5kIHplcm9zP1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICggZSArIDEgPiBsZW4gKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggLS1pID4gMCApIGZvciAoIHN0ciArPSAnLic7IGktLTsgc3RyICs9ICcwJyApO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gZSAtIGxlbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBpID4gMCApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggZSArIDEgPT0gbGVuICkgc3RyICs9ICcuJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIDsgaS0tOyBzdHIgKz0gJzAnICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBuLnMgPCAwICYmIGMwID8gJy0nICsgc3RyIDogc3RyO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8vIEhhbmRsZSBCaWdOdW1iZXIubWF4IGFuZCBCaWdOdW1iZXIubWluLlxyXG4gICAgICAgIGZ1bmN0aW9uIG1heE9yTWluKCBhcmdzLCBtZXRob2QgKSB7XHJcbiAgICAgICAgICAgIHZhciBtLCBuLFxyXG4gICAgICAgICAgICAgICAgaSA9IDA7XHJcblxyXG4gICAgICAgICAgICBpZiAoIGlzQXJyYXkoIGFyZ3NbMF0gKSApIGFyZ3MgPSBhcmdzWzBdO1xyXG4gICAgICAgICAgICBtID0gbmV3IEJpZ051bWJlciggYXJnc1swXSApO1xyXG5cclxuICAgICAgICAgICAgZm9yICggOyArK2kgPCBhcmdzLmxlbmd0aDsgKSB7XHJcbiAgICAgICAgICAgICAgICBuID0gbmV3IEJpZ051bWJlciggYXJnc1tpXSApO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIElmIGFueSBudW1iZXIgaXMgTmFOLCByZXR1cm4gTmFOLlxyXG4gICAgICAgICAgICAgICAgaWYgKCAhbi5zICkge1xyXG4gICAgICAgICAgICAgICAgICAgIG0gPSBuO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICggbWV0aG9kLmNhbGwoIG0sIG4gKSApIHtcclxuICAgICAgICAgICAgICAgICAgICBtID0gbjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG07XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gdHJ1ZSBpZiBuIGlzIGFuIGludGVnZXIgaW4gcmFuZ2UsIG90aGVyd2lzZSB0aHJvdy5cclxuICAgICAgICAgKiBVc2UgZm9yIGFyZ3VtZW50IHZhbGlkYXRpb24gd2hlbiBFUlJPUlMgaXMgdHJ1ZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBpbnRWYWxpZGF0b3JXaXRoRXJyb3JzKCBuLCBtaW4sIG1heCwgY2FsbGVyLCBuYW1lICkge1xyXG4gICAgICAgICAgICBpZiAoIG4gPCBtaW4gfHwgbiA+IG1heCB8fCBuICE9IHRydW5jYXRlKG4pICkge1xyXG4gICAgICAgICAgICAgICAgcmFpc2UoIGNhbGxlciwgKCBuYW1lIHx8ICdkZWNpbWFsIHBsYWNlcycgKSArXHJcbiAgICAgICAgICAgICAgICAgICggbiA8IG1pbiB8fCBuID4gbWF4ID8gJyBvdXQgb2YgcmFuZ2UnIDogJyBub3QgYW4gaW50ZWdlcicgKSwgbiApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFN0cmlwIHRyYWlsaW5nIHplcm9zLCBjYWxjdWxhdGUgYmFzZSAxMCBleHBvbmVudCBhbmQgY2hlY2sgYWdhaW5zdCBNSU5fRVhQIGFuZCBNQVhfRVhQLlxyXG4gICAgICAgICAqIENhbGxlZCBieSBtaW51cywgcGx1cyBhbmQgdGltZXMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gbm9ybWFsaXNlKCBuLCBjLCBlICkge1xyXG4gICAgICAgICAgICB2YXIgaSA9IDEsXHJcbiAgICAgICAgICAgICAgICBqID0gYy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKCA7ICFjWy0tal07IGMucG9wKCkgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgYmFzZSAxMCBleHBvbmVudC4gRmlyc3QgZ2V0IHRoZSBudW1iZXIgb2YgZGlnaXRzIG9mIGNbMF0uXHJcbiAgICAgICAgICAgIGZvciAoIGogPSBjWzBdOyBqID49IDEwOyBqIC89IDEwLCBpKysgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIE92ZXJmbG93P1xyXG4gICAgICAgICAgICBpZiAoICggZSA9IGkgKyBlICogTE9HX0JBU0UgLSAxICkgPiBNQVhfRVhQICkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEluZmluaXR5LlxyXG4gICAgICAgICAgICAgICAgbi5jID0gbi5lID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIC8vIFVuZGVyZmxvdz9cclxuICAgICAgICAgICAgfSBlbHNlIGlmICggZSA8IE1JTl9FWFAgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gWmVyby5cclxuICAgICAgICAgICAgICAgIG4uYyA9IFsgbi5lID0gMCBdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbi5lID0gZTtcclxuICAgICAgICAgICAgICAgIG4uYyA9IGM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBuO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8vIEhhbmRsZSB2YWx1ZXMgdGhhdCBmYWlsIHRoZSB2YWxpZGl0eSB0ZXN0IGluIEJpZ051bWJlci5cclxuICAgICAgICBwYXJzZU51bWVyaWMgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgYmFzZVByZWZpeCA9IC9eKC0/KTAoW3hib10pKD89XFx3W1xcdy5dKiQpL2ksXHJcbiAgICAgICAgICAgICAgICBkb3RBZnRlciA9IC9eKFteLl0rKVxcLiQvLFxyXG4gICAgICAgICAgICAgICAgZG90QmVmb3JlID0gL15cXC4oW14uXSspJC8sXHJcbiAgICAgICAgICAgICAgICBpc0luZmluaXR5T3JOYU4gPSAvXi0/KEluZmluaXR5fE5hTikkLyxcclxuICAgICAgICAgICAgICAgIHdoaXRlc3BhY2VPclBsdXMgPSAvXlxccypcXCsoPz1bXFx3Ll0pfF5cXHMrfFxccyskL2c7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCB4LCBzdHIsIG51bSwgYiApIHtcclxuICAgICAgICAgICAgICAgIHZhciBiYXNlLFxyXG4gICAgICAgICAgICAgICAgICAgIHMgPSBudW0gPyBzdHIgOiBzdHIucmVwbGFjZSggd2hpdGVzcGFjZU9yUGx1cywgJycgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBObyBleGNlcHRpb24gb24gwrFJbmZpbml0eSBvciBOYU4uXHJcbiAgICAgICAgICAgICAgICBpZiAoIGlzSW5maW5pdHlPck5hTi50ZXN0KHMpICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHgucyA9IGlzTmFOKHMpID8gbnVsbCA6IHMgPCAwID8gLTEgOiAxO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoICFudW0gKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBiYXNlUHJlZml4ID0gL14oLT8pMChbeGJvXSkoPz1cXHdbXFx3Ll0qJCkvaVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzID0gcy5yZXBsYWNlKCBiYXNlUHJlZml4LCBmdW5jdGlvbiAoIG0sIHAxLCBwMiApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UgPSAoIHAyID0gcDIudG9Mb3dlckNhc2UoKSApID09ICd4JyA/IDE2IDogcDIgPT0gJ2InID8gMiA6IDg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIWIgfHwgYiA9PSBiYXNlID8gcDEgOiBtO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlID0gYjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBFLmcuICcxLicgdG8gJzEnLCAnLjEnIHRvICcwLjEnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzID0gcy5yZXBsYWNlKCBkb3RBZnRlciwgJyQxJyApLnJlcGxhY2UoIGRvdEJlZm9yZSwgJzAuJDEnICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggc3RyICE9IHMgKSByZXR1cm4gbmV3IEJpZ051bWJlciggcywgYmFzZSApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gJ25ldyBCaWdOdW1iZXIoKSBub3QgYSBudW1iZXI6IHtufSdcclxuICAgICAgICAgICAgICAgICAgICAvLyAnbmV3IEJpZ051bWJlcigpIG5vdCBhIGJhc2Uge2J9IG51bWJlcjoge259J1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChFUlJPUlMpIHJhaXNlKCBpZCwgJ25vdCBhJyArICggYiA/ICcgYmFzZSAnICsgYiA6ICcnICkgKyAnIG51bWJlcicsIHN0ciApO1xyXG4gICAgICAgICAgICAgICAgICAgIHgucyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgeC5jID0geC5lID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGlkID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pKCk7XHJcblxyXG5cclxuICAgICAgICAvLyBUaHJvdyBhIEJpZ051bWJlciBFcnJvci5cclxuICAgICAgICBmdW5jdGlvbiByYWlzZSggY2FsbGVyLCBtc2csIHZhbCApIHtcclxuICAgICAgICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKCBbXHJcbiAgICAgICAgICAgICAgICAnbmV3IEJpZ051bWJlcicsICAgICAvLyAwXHJcbiAgICAgICAgICAgICAgICAnY21wJywgICAgICAgICAgICAgICAvLyAxXHJcbiAgICAgICAgICAgICAgICAnY29uZmlnJywgICAgICAgICAgICAvLyAyXHJcbiAgICAgICAgICAgICAgICAnZGl2JywgICAgICAgICAgICAgICAvLyAzXHJcbiAgICAgICAgICAgICAgICAnZGl2VG9JbnQnLCAgICAgICAgICAvLyA0XHJcbiAgICAgICAgICAgICAgICAnZXEnLCAgICAgICAgICAgICAgICAvLyA1XHJcbiAgICAgICAgICAgICAgICAnZ3QnLCAgICAgICAgICAgICAgICAvLyA2XHJcbiAgICAgICAgICAgICAgICAnZ3RlJywgICAgICAgICAgICAgICAvLyA3XHJcbiAgICAgICAgICAgICAgICAnbHQnLCAgICAgICAgICAgICAgICAvLyA4XHJcbiAgICAgICAgICAgICAgICAnbHRlJywgICAgICAgICAgICAgICAvLyA5XHJcbiAgICAgICAgICAgICAgICAnbWludXMnLCAgICAgICAgICAgICAvLyAxMFxyXG4gICAgICAgICAgICAgICAgJ21vZCcsICAgICAgICAgICAgICAgLy8gMTFcclxuICAgICAgICAgICAgICAgICdwbHVzJywgICAgICAgICAgICAgIC8vIDEyXHJcbiAgICAgICAgICAgICAgICAncHJlY2lzaW9uJywgICAgICAgICAvLyAxM1xyXG4gICAgICAgICAgICAgICAgJ3JhbmRvbScsICAgICAgICAgICAgLy8gMTRcclxuICAgICAgICAgICAgICAgICdyb3VuZCcsICAgICAgICAgICAgIC8vIDE1XHJcbiAgICAgICAgICAgICAgICAnc2hpZnQnLCAgICAgICAgICAgICAvLyAxNlxyXG4gICAgICAgICAgICAgICAgJ3RpbWVzJywgICAgICAgICAgICAgLy8gMTdcclxuICAgICAgICAgICAgICAgICd0b0RpZ2l0cycsICAgICAgICAgIC8vIDE4XHJcbiAgICAgICAgICAgICAgICAndG9FeHBvbmVudGlhbCcsICAgICAvLyAxOVxyXG4gICAgICAgICAgICAgICAgJ3RvRml4ZWQnLCAgICAgICAgICAgLy8gMjBcclxuICAgICAgICAgICAgICAgICd0b0Zvcm1hdCcsICAgICAgICAgIC8vIDIxXHJcbiAgICAgICAgICAgICAgICAndG9GcmFjdGlvbicsICAgICAgICAvLyAyMlxyXG4gICAgICAgICAgICAgICAgJ3BvdycsICAgICAgICAgICAgICAgLy8gMjNcclxuICAgICAgICAgICAgICAgICd0b1ByZWNpc2lvbicsICAgICAgIC8vIDI0XHJcbiAgICAgICAgICAgICAgICAndG9TdHJpbmcnLCAgICAgICAgICAvLyAyNVxyXG4gICAgICAgICAgICAgICAgJ0JpZ051bWJlcicgICAgICAgICAgLy8gMjZcclxuICAgICAgICAgICAgXVtjYWxsZXJdICsgJygpICcgKyBtc2cgKyAnOiAnICsgdmFsICk7XHJcblxyXG4gICAgICAgICAgICBlcnJvci5uYW1lID0gJ0JpZ051bWJlciBFcnJvcic7XHJcbiAgICAgICAgICAgIGlkID0gMDtcclxuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSb3VuZCB4IHRvIHNkIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIHJtLiBDaGVjayBmb3Igb3Zlci91bmRlci1mbG93LlxyXG4gICAgICAgICAqIElmIHIgaXMgdHJ1dGh5LCBpdCBpcyBrbm93biB0aGF0IHRoZXJlIGFyZSBtb3JlIGRpZ2l0cyBhZnRlciB0aGUgcm91bmRpbmcgZGlnaXQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gcm91bmQoIHgsIHNkLCBybSwgciApIHtcclxuICAgICAgICAgICAgdmFyIGQsIGksIGosIGssIG4sIG5pLCByZCxcclxuICAgICAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICAgICAgcG93czEwID0gUE9XU19URU47XHJcblxyXG4gICAgICAgICAgICAvLyBpZiB4IGlzIG5vdCBJbmZpbml0eSBvciBOYU4uLi5cclxuICAgICAgICAgICAgaWYgKHhjKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gcmQgaXMgdGhlIHJvdW5kaW5nIGRpZ2l0LCBpLmUuIHRoZSBkaWdpdCBhZnRlciB0aGUgZGlnaXQgdGhhdCBtYXkgYmUgcm91bmRlZCB1cC5cclxuICAgICAgICAgICAgICAgIC8vIG4gaXMgYSBiYXNlIDFlMTQgbnVtYmVyLCB0aGUgdmFsdWUgb2YgdGhlIGVsZW1lbnQgb2YgYXJyYXkgeC5jIGNvbnRhaW5pbmcgcmQuXHJcbiAgICAgICAgICAgICAgICAvLyBuaSBpcyB0aGUgaW5kZXggb2YgbiB3aXRoaW4geC5jLlxyXG4gICAgICAgICAgICAgICAgLy8gZCBpcyB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBvZiBuLlxyXG4gICAgICAgICAgICAgICAgLy8gaSBpcyB0aGUgaW5kZXggb2YgcmQgd2l0aGluIG4gaW5jbHVkaW5nIGxlYWRpbmcgemVyb3MuXHJcbiAgICAgICAgICAgICAgICAvLyBqIGlzIHRoZSBhY3R1YWwgaW5kZXggb2YgcmQgd2l0aGluIG4gKGlmIDwgMCwgcmQgaXMgYSBsZWFkaW5nIHplcm8pLlxyXG4gICAgICAgICAgICAgICAgb3V0OiB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBvZiB0aGUgZmlyc3QgZWxlbWVudCBvZiB4Yy5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKCBkID0gMSwgayA9IHhjWzBdOyBrID49IDEwOyBrIC89IDEwLCBkKysgKTtcclxuICAgICAgICAgICAgICAgICAgICBpID0gc2QgLSBkO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgcm91bmRpbmcgZGlnaXQgaXMgaW4gdGhlIGZpcnN0IGVsZW1lbnQgb2YgeGMuLi5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIGkgPCAwICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IExPR19CQVNFO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBqID0gc2Q7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG4gPSB4Y1sgbmkgPSAwIF07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIHJvdW5kaW5nIGRpZ2l0IGF0IGluZGV4IGogb2Ygbi5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmQgPSBuIC8gcG93czEwWyBkIC0gaiAtIDEgXSAlIDEwIHwgMDtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuaSA9IG1hdGhjZWlsKCAoIGkgKyAxICkgLyBMT0dfQkFTRSApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBuaSA+PSB4Yy5sZW5ndGggKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTmVlZGVkIGJ5IHNxcnQuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICggOyB4Yy5sZW5ndGggPD0gbmk7IHhjLnB1c2goMCkgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuID0gcmQgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkgJT0gTE9HX0JBU0U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaiA9IGkgLSBMT0dfQkFTRSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrIG91dDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG4gPSBrID0geGNbbmldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBvZiBuLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICggZCA9IDE7IGsgPj0gMTA7IGsgLz0gMTAsIGQrKyApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgaW5kZXggb2YgcmQgd2l0aGluIG4uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpICU9IExPR19CQVNFO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgaW5kZXggb2YgcmQgd2l0aGluIG4sIGFkanVzdGVkIGZvciBsZWFkaW5nIHplcm9zLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIG51bWJlciBvZiBsZWFkaW5nIHplcm9zIG9mIG4gaXMgZ2l2ZW4gYnkgTE9HX0JBU0UgLSBkLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaiA9IGkgLSBMT0dfQkFTRSArIGQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2V0IHRoZSByb3VuZGluZyBkaWdpdCBhdCBpbmRleCBqIG9mIG4uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZCA9IGogPCAwID8gMCA6IG4gLyBwb3dzMTBbIGQgLSBqIC0gMSBdICUgMTAgfCAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICByID0gciB8fCBzZCA8IDAgfHxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQXJlIHRoZXJlIGFueSBub24temVybyBkaWdpdHMgYWZ0ZXIgdGhlIHJvdW5kaW5nIGRpZ2l0P1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSBleHByZXNzaW9uICBuICUgcG93czEwWyBkIC0gaiAtIDEgXSAgcmV0dXJucyBhbGwgZGlnaXRzIG9mIG4gdG8gdGhlIHJpZ2h0XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gb2YgdGhlIGRpZ2l0IGF0IGosIGUuZy4gaWYgbiBpcyA5MDg3MTQgYW5kIGogaXMgMiwgdGhlIGV4cHJlc3Npb24gZ2l2ZXMgNzE0LlxyXG4gICAgICAgICAgICAgICAgICAgICAgeGNbbmkgKyAxXSAhPSBudWxsIHx8ICggaiA8IDAgPyBuIDogbiAlIHBvd3MxMFsgZCAtIGogLSAxIF0gKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgciA9IHJtIDwgNFxyXG4gICAgICAgICAgICAgICAgICAgICAgPyAoIHJkIHx8IHIgKSAmJiAoIHJtID09IDAgfHwgcm0gPT0gKCB4LnMgPCAwID8gMyA6IDIgKSApXHJcbiAgICAgICAgICAgICAgICAgICAgICA6IHJkID4gNSB8fCByZCA9PSA1ICYmICggcm0gPT0gNCB8fCByIHx8IHJtID09IDYgJiZcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIGRpZ2l0IHRvIHRoZSBsZWZ0IG9mIHRoZSByb3VuZGluZyBkaWdpdCBpcyBvZGQuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICggKCBpID4gMCA/IGogPiAwID8gbiAvIHBvd3MxMFsgZCAtIGogXSA6IDAgOiB4Y1tuaSAtIDFdICkgJSAxMCApICYgMSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJtID09ICggeC5zIDwgMCA/IDggOiA3ICkgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBzZCA8IDEgfHwgIXhjWzBdICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4Yy5sZW5ndGggPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IHNkIHRvIGRlY2ltYWwgcGxhY2VzLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2QgLT0geC5lICsgMTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAxLCAwLjEsIDAuMDEsIDAuMDAxLCAwLjAwMDEgZXRjLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeGNbMF0gPSBwb3dzMTBbICggTE9HX0JBU0UgLSBzZCAlIExPR19CQVNFICkgJSBMT0dfQkFTRSBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeC5lID0gLXNkIHx8IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gWmVyby5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhjWzBdID0geC5lID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHg7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgZXhjZXNzIGRpZ2l0cy5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIGkgPT0gMCApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGMubGVuZ3RoID0gbmk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGsgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuaS0tO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhjLmxlbmd0aCA9IG5pICsgMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgayA9IHBvd3MxMFsgTE9HX0JBU0UgLSBpIF07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBFLmcuIDU2NzAwIGJlY29tZXMgNTYwMDAgaWYgNyBpcyB0aGUgcm91bmRpbmcgZGlnaXQuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGogPiAwIG1lYW5zIGkgPiBudW1iZXIgb2YgbGVhZGluZyB6ZXJvcyBvZiBuLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB4Y1tuaV0gPSBqID4gMCA/IG1hdGhmbG9vciggbiAvIHBvd3MxMFsgZCAtIGogXSAlIHBvd3MxMFtqXSApICogayA6IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBSb3VuZCB1cD9cclxuICAgICAgICAgICAgICAgICAgICBpZiAocikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICggOyA7ICkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBkaWdpdCB0byBiZSByb3VuZGVkIHVwIGlzIGluIHRoZSBmaXJzdCBlbGVtZW50IG9mIHhjLi4uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIG5pID09IDAgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGkgd2lsbCBiZSB0aGUgbGVuZ3RoIG9mIHhjWzBdIGJlZm9yZSBrIGlzIGFkZGVkLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIGkgPSAxLCBqID0geGNbMF07IGogPj0gMTA7IGogLz0gMTAsIGkrKyApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGogPSB4Y1swXSArPSBrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIGsgPSAxOyBqID49IDEwOyBqIC89IDEwLCBrKysgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgaSAhPSBrIHRoZSBsZW5ndGggaGFzIGluY3JlYXNlZC5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGkgIT0gayApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeC5lKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggeGNbMF0gPT0gQkFTRSApIHhjWzBdID0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4Y1tuaV0gKz0gaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHhjW25pXSAhPSBCQVNFICkgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeGNbbmktLV0gPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGsgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICggaSA9IHhjLmxlbmd0aDsgeGNbLS1pXSA9PT0gMDsgeGMucG9wKCkgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBPdmVyZmxvdz8gSW5maW5pdHkuXHJcbiAgICAgICAgICAgICAgICBpZiAoIHguZSA+IE1BWF9FWFAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeC5jID0geC5lID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBVbmRlcmZsb3c/IFplcm8uXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCB4LmUgPCBNSU5fRVhQICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHguYyA9IFsgeC5lID0gMCBdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4geDtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvLyBQUk9UT1RZUEUvSU5TVEFOQ0UgTUVUSE9EU1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlci5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLmFic29sdXRlVmFsdWUgPSBQLmFicyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHggPSBuZXcgQmlnTnVtYmVyKHRoaXMpO1xyXG4gICAgICAgICAgICBpZiAoIHgucyA8IDAgKSB4LnMgPSAxO1xyXG4gICAgICAgICAgICByZXR1cm4geDtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciByb3VuZGVkIHRvIGEgd2hvbGVcclxuICAgICAgICAgKiBudW1iZXIgaW4gdGhlIGRpcmVjdGlvbiBvZiBJbmZpbml0eS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLmNlaWwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByb3VuZCggbmV3IEJpZ051bWJlcih0aGlzKSwgdGhpcy5lICsgMSwgMiApO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVyblxyXG4gICAgICAgICAqIDEgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGlzIGdyZWF0ZXIgdGhhbiB0aGUgdmFsdWUgb2YgQmlnTnVtYmVyKHksIGIpLFxyXG4gICAgICAgICAqIC0xIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpcyBsZXNzIHRoYW4gdGhlIHZhbHVlIG9mIEJpZ051bWJlcih5LCBiKSxcclxuICAgICAgICAgKiAwIGlmIHRoZXkgaGF2ZSB0aGUgc2FtZSB2YWx1ZSxcclxuICAgICAgICAgKiBvciBudWxsIGlmIHRoZSB2YWx1ZSBvZiBlaXRoZXIgaXMgTmFOLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAuY29tcGFyZWRUbyA9IFAuY21wID0gZnVuY3Rpb24gKCB5LCBiICkge1xyXG4gICAgICAgICAgICBpZCA9IDE7XHJcbiAgICAgICAgICAgIHJldHVybiBjb21wYXJlKCB0aGlzLCBuZXcgQmlnTnVtYmVyKCB5LCBiICkgKTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gdGhlIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyBvZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIsIG9yIG51bGwgaWYgdGhlIHZhbHVlXHJcbiAgICAgICAgICogb2YgdGhpcyBCaWdOdW1iZXIgaXMgwrFJbmZpbml0eSBvciBOYU4uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5kZWNpbWFsUGxhY2VzID0gUC5kcCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIG4sIHYsXHJcbiAgICAgICAgICAgICAgICBjID0gdGhpcy5jO1xyXG5cclxuICAgICAgICAgICAgaWYgKCAhYyApIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICBuID0gKCAoIHYgPSBjLmxlbmd0aCAtIDEgKSAtIGJpdEZsb29yKCB0aGlzLmUgLyBMT0dfQkFTRSApICkgKiBMT0dfQkFTRTtcclxuXHJcbiAgICAgICAgICAgIC8vIFN1YnRyYWN0IHRoZSBudW1iZXIgb2YgdHJhaWxpbmcgemVyb3Mgb2YgdGhlIGxhc3QgbnVtYmVyLlxyXG4gICAgICAgICAgICBpZiAoIHYgPSBjW3ZdICkgZm9yICggOyB2ICUgMTAgPT0gMDsgdiAvPSAxMCwgbi0tICk7XHJcbiAgICAgICAgICAgIGlmICggbiA8IDAgKSBuID0gMDtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBuO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqICBuIC8gMCA9IElcclxuICAgICAgICAgKiAgbiAvIE4gPSBOXHJcbiAgICAgICAgICogIG4gLyBJID0gMFxyXG4gICAgICAgICAqICAwIC8gbiA9IDBcclxuICAgICAgICAgKiAgMCAvIDAgPSBOXHJcbiAgICAgICAgICogIDAgLyBOID0gTlxyXG4gICAgICAgICAqICAwIC8gSSA9IDBcclxuICAgICAgICAgKiAgTiAvIG4gPSBOXHJcbiAgICAgICAgICogIE4gLyAwID0gTlxyXG4gICAgICAgICAqICBOIC8gTiA9IE5cclxuICAgICAgICAgKiAgTiAvIEkgPSBOXHJcbiAgICAgICAgICogIEkgLyBuID0gSVxyXG4gICAgICAgICAqICBJIC8gMCA9IElcclxuICAgICAgICAgKiAgSSAvIE4gPSBOXHJcbiAgICAgICAgICogIEkgLyBJID0gTlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgZGl2aWRlZCBieSB0aGUgdmFsdWUgb2ZcclxuICAgICAgICAgKiBCaWdOdW1iZXIoeSwgYiksIHJvdW5kZWQgYWNjb3JkaW5nIHRvIERFQ0lNQUxfUExBQ0VTIGFuZCBST1VORElOR19NT0RFLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAuZGl2aWRlZEJ5ID0gUC5kaXYgPSBmdW5jdGlvbiAoIHksIGIgKSB7XHJcbiAgICAgICAgICAgIGlkID0gMztcclxuICAgICAgICAgICAgcmV0dXJuIGRpdiggdGhpcywgbmV3IEJpZ051bWJlciggeSwgYiApLCBERUNJTUFMX1BMQUNFUywgUk9VTkRJTkdfTU9ERSApO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2hvc2UgdmFsdWUgaXMgdGhlIGludGVnZXIgcGFydCBvZiBkaXZpZGluZyB0aGUgdmFsdWUgb2YgdGhpc1xyXG4gICAgICAgICAqIEJpZ051bWJlciBieSB0aGUgdmFsdWUgb2YgQmlnTnVtYmVyKHksIGIpLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAuZGl2aWRlZFRvSW50ZWdlckJ5ID0gUC5kaXZUb0ludCA9IGZ1bmN0aW9uICggeSwgYiApIHtcclxuICAgICAgICAgICAgaWQgPSA0O1xyXG4gICAgICAgICAgICByZXR1cm4gZGl2KCB0aGlzLCBuZXcgQmlnTnVtYmVyKCB5LCBiICksIDAsIDEgKTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaXMgZXF1YWwgdG8gdGhlIHZhbHVlIG9mIEJpZ051bWJlcih5LCBiKSxcclxuICAgICAgICAgKiBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLmVxdWFscyA9IFAuZXEgPSBmdW5jdGlvbiAoIHksIGIgKSB7XHJcbiAgICAgICAgICAgIGlkID0gNTtcclxuICAgICAgICAgICAgcmV0dXJuIGNvbXBhcmUoIHRoaXMsIG5ldyBCaWdOdW1iZXIoIHksIGIgKSApID09PSAwO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIHJvdW5kZWQgdG8gYSB3aG9sZVxyXG4gICAgICAgICAqIG51bWJlciBpbiB0aGUgZGlyZWN0aW9uIG9mIC1JbmZpbml0eS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLmZsb29yID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcm91bmQoIG5ldyBCaWdOdW1iZXIodGhpcyksIHRoaXMuZSArIDEsIDMgKTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaXMgZ3JlYXRlciB0aGFuIHRoZSB2YWx1ZSBvZiBCaWdOdW1iZXIoeSwgYiksXHJcbiAgICAgICAgICogb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5ncmVhdGVyVGhhbiA9IFAuZ3QgPSBmdW5jdGlvbiAoIHksIGIgKSB7XHJcbiAgICAgICAgICAgIGlkID0gNjtcclxuICAgICAgICAgICAgcmV0dXJuIGNvbXBhcmUoIHRoaXMsIG5ldyBCaWdOdW1iZXIoIHksIGIgKSApID4gMDtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIHRoZSB2YWx1ZSBvZlxyXG4gICAgICAgICAqIEJpZ051bWJlcih5LCBiKSwgb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5ncmVhdGVyVGhhbk9yRXF1YWxUbyA9IFAuZ3RlID0gZnVuY3Rpb24gKCB5LCBiICkge1xyXG4gICAgICAgICAgICBpZCA9IDc7XHJcbiAgICAgICAgICAgIHJldHVybiAoIGIgPSBjb21wYXJlKCB0aGlzLCBuZXcgQmlnTnVtYmVyKCB5LCBiICkgKSApID09PSAxIHx8IGIgPT09IDA7XHJcblxyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpcyBhIGZpbml0ZSBudW1iZXIsIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAuaXNGaW5pdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAhIXRoaXMuYztcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaXMgYW4gaW50ZWdlciwgb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLmlzSW50ZWdlciA9IFAuaXNJbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAhIXRoaXMuYyAmJiBiaXRGbG9vciggdGhpcy5lIC8gTE9HX0JBU0UgKSA+IHRoaXMuYy5sZW5ndGggLSAyO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpcyBOYU4sIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAuaXNOYU4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAhdGhpcy5zO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpcyBuZWdhdGl2ZSwgb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5pc05lZ2F0aXZlID0gUC5pc05lZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucyA8IDA7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGlzIDAgb3IgLTAsIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAuaXNaZXJvID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gISF0aGlzLmMgJiYgdGhpcy5jWzBdID09IDA7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGlzIGxlc3MgdGhhbiB0aGUgdmFsdWUgb2YgQmlnTnVtYmVyKHksIGIpLFxyXG4gICAgICAgICAqIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAubGVzc1RoYW4gPSBQLmx0ID0gZnVuY3Rpb24gKCB5LCBiICkge1xyXG4gICAgICAgICAgICBpZCA9IDg7XHJcbiAgICAgICAgICAgIHJldHVybiBjb21wYXJlKCB0aGlzLCBuZXcgQmlnTnVtYmVyKCB5LCBiICkgKSA8IDA7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0byB0aGUgdmFsdWUgb2ZcclxuICAgICAgICAgKiBCaWdOdW1iZXIoeSwgYiksIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAubGVzc1RoYW5PckVxdWFsVG8gPSBQLmx0ZSA9IGZ1bmN0aW9uICggeSwgYiApIHtcclxuICAgICAgICAgICAgaWQgPSA5O1xyXG4gICAgICAgICAgICByZXR1cm4gKCBiID0gY29tcGFyZSggdGhpcywgbmV3IEJpZ051bWJlciggeSwgYiApICkgKSA9PT0gLTEgfHwgYiA9PT0gMDtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiAgbiAtIDAgPSBuXHJcbiAgICAgICAgICogIG4gLSBOID0gTlxyXG4gICAgICAgICAqICBuIC0gSSA9IC1JXHJcbiAgICAgICAgICogIDAgLSBuID0gLW5cclxuICAgICAgICAgKiAgMCAtIDAgPSAwXHJcbiAgICAgICAgICogIDAgLSBOID0gTlxyXG4gICAgICAgICAqICAwIC0gSSA9IC1JXHJcbiAgICAgICAgICogIE4gLSBuID0gTlxyXG4gICAgICAgICAqICBOIC0gMCA9IE5cclxuICAgICAgICAgKiAgTiAtIE4gPSBOXHJcbiAgICAgICAgICogIE4gLSBJID0gTlxyXG4gICAgICAgICAqICBJIC0gbiA9IElcclxuICAgICAgICAgKiAgSSAtIDAgPSBJXHJcbiAgICAgICAgICogIEkgLSBOID0gTlxyXG4gICAgICAgICAqICBJIC0gSSA9IE5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIG1pbnVzIHRoZSB2YWx1ZSBvZlxyXG4gICAgICAgICAqIEJpZ051bWJlcih5LCBiKS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLm1pbnVzID0gUC5zdWIgPSBmdW5jdGlvbiAoIHksIGIgKSB7XHJcbiAgICAgICAgICAgIHZhciBpLCBqLCB0LCB4TFR5LFxyXG4gICAgICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBhID0geC5zO1xyXG5cclxuICAgICAgICAgICAgaWQgPSAxMDtcclxuICAgICAgICAgICAgeSA9IG5ldyBCaWdOdW1iZXIoIHksIGIgKTtcclxuICAgICAgICAgICAgYiA9IHkucztcclxuXHJcbiAgICAgICAgICAgIC8vIEVpdGhlciBOYU4/XHJcbiAgICAgICAgICAgIGlmICggIWEgfHwgIWIgKSByZXR1cm4gbmV3IEJpZ051bWJlcihOYU4pO1xyXG5cclxuICAgICAgICAgICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgICAgICAgICBpZiAoIGEgIT0gYiApIHtcclxuICAgICAgICAgICAgICAgIHkucyA9IC1iO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHgucGx1cyh5KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHhlID0geC5lIC8gTE9HX0JBU0UsXHJcbiAgICAgICAgICAgICAgICB5ZSA9IHkuZSAvIExPR19CQVNFLFxyXG4gICAgICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgICAgICB5YyA9IHkuYztcclxuXHJcbiAgICAgICAgICAgIGlmICggIXhlIHx8ICF5ZSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBFaXRoZXIgSW5maW5pdHk/XHJcbiAgICAgICAgICAgICAgICBpZiAoICF4YyB8fCAheWMgKSByZXR1cm4geGMgPyAoIHkucyA9IC1iLCB5ICkgOiBuZXcgQmlnTnVtYmVyKCB5YyA/IHggOiBOYU4gKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBFaXRoZXIgemVybz9cclxuICAgICAgICAgICAgICAgIGlmICggIXhjWzBdIHx8ICF5Y1swXSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUmV0dXJuIHkgaWYgeSBpcyBub24temVybywgeCBpZiB4IGlzIG5vbi16ZXJvLCBvciB6ZXJvIGlmIGJvdGggYXJlIHplcm8uXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHljWzBdID8gKCB5LnMgPSAtYiwgeSApIDogbmV3IEJpZ051bWJlciggeGNbMF0gPyB4IDpcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAvLyBJRUVFIDc1NCAoMjAwOCkgNi4zOiBuIC0gbiA9IC0wIHdoZW4gcm91bmRpbmcgdG8gLUluZmluaXR5XHJcbiAgICAgICAgICAgICAgICAgICAgICBST1VORElOR19NT0RFID09IDMgPyAtMCA6IDAgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgeGUgPSBiaXRGbG9vcih4ZSk7XHJcbiAgICAgICAgICAgIHllID0gYml0Rmxvb3IoeWUpO1xyXG4gICAgICAgICAgICB4YyA9IHhjLnNsaWNlKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgd2hpY2ggaXMgdGhlIGJpZ2dlciBudW1iZXIuXHJcbiAgICAgICAgICAgIGlmICggYSA9IHhlIC0geWUgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCB4TFR5ID0gYSA8IDAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYSA9IC1hO1xyXG4gICAgICAgICAgICAgICAgICAgIHQgPSB4YztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeWUgPSB4ZTtcclxuICAgICAgICAgICAgICAgICAgICB0ID0geWM7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gUHJlcGVuZCB6ZXJvcyB0byBlcXVhbGlzZSBleHBvbmVudHMuXHJcbiAgICAgICAgICAgICAgICBmb3IgKCBiID0gYTsgYi0tOyB0LnB1c2goMCkgKTtcclxuICAgICAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEV4cG9uZW50cyBlcXVhbC4gQ2hlY2sgZGlnaXQgYnkgZGlnaXQuXHJcbiAgICAgICAgICAgICAgICBqID0gKCB4TFR5ID0gKCBhID0geGMubGVuZ3RoICkgPCAoIGIgPSB5Yy5sZW5ndGggKSApID8gYSA6IGI7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yICggYSA9IGIgPSAwOyBiIDwgajsgYisrICkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIHhjW2JdICE9IHljW2JdICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4TFR5ID0geGNbYl0gPCB5Y1tiXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyB4IDwgeT8gUG9pbnQgeGMgdG8gdGhlIGFycmF5IG9mIHRoZSBiaWdnZXIgbnVtYmVyLlxyXG4gICAgICAgICAgICBpZiAoeExUeSkgdCA9IHhjLCB4YyA9IHljLCB5YyA9IHQsIHkucyA9IC15LnM7XHJcblxyXG4gICAgICAgICAgICBiID0gKCBqID0geWMubGVuZ3RoICkgLSAoIGkgPSB4Yy5sZW5ndGggKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFwcGVuZCB6ZXJvcyB0byB4YyBpZiBzaG9ydGVyLlxyXG4gICAgICAgICAgICAvLyBObyBuZWVkIHRvIGFkZCB6ZXJvcyB0byB5YyBpZiBzaG9ydGVyIGFzIHN1YnRyYWN0IG9ubHkgbmVlZHMgdG8gc3RhcnQgYXQgeWMubGVuZ3RoLlxyXG4gICAgICAgICAgICBpZiAoIGIgPiAwICkgZm9yICggOyBiLS07IHhjW2krK10gPSAwICk7XHJcbiAgICAgICAgICAgIGIgPSBCQVNFIC0gMTtcclxuXHJcbiAgICAgICAgICAgIC8vIFN1YnRyYWN0IHljIGZyb20geGMuXHJcbiAgICAgICAgICAgIGZvciAoIDsgaiA+IGE7ICkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICggeGNbLS1qXSA8IHljW2pdICkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoIGkgPSBqOyBpICYmICF4Y1stLWldOyB4Y1tpXSA9IGIgKTtcclxuICAgICAgICAgICAgICAgICAgICAtLXhjW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIHhjW2pdICs9IEJBU0U7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgeGNbal0gLT0geWNbal07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSBsZWFkaW5nIHplcm9zIGFuZCBhZGp1c3QgZXhwb25lbnQgYWNjb3JkaW5nbHkuXHJcbiAgICAgICAgICAgIGZvciAoIDsgeGNbMF0gPT0gMDsgeGMuc2hpZnQoKSwgLS15ZSApO1xyXG5cclxuICAgICAgICAgICAgLy8gWmVybz9cclxuICAgICAgICAgICAgaWYgKCAheGNbMF0gKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRm9sbG93aW5nIElFRUUgNzU0ICgyMDA4KSA2LjMsXHJcbiAgICAgICAgICAgICAgICAvLyBuIC0gbiA9ICswICBidXQgIG4gLSBuID0gLTAgIHdoZW4gcm91bmRpbmcgdG93YXJkcyAtSW5maW5pdHkuXHJcbiAgICAgICAgICAgICAgICB5LnMgPSBST1VORElOR19NT0RFID09IDMgPyAtMSA6IDE7XHJcbiAgICAgICAgICAgICAgICB5LmMgPSBbIHkuZSA9IDAgXTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB5O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBObyBuZWVkIHRvIGNoZWNrIGZvciBJbmZpbml0eSBhcyAreCAtICt5ICE9IEluZmluaXR5ICYmIC14IC0gLXkgIT0gSW5maW5pdHlcclxuICAgICAgICAgICAgLy8gZm9yIGZpbml0ZSB4IGFuZCB5LlxyXG4gICAgICAgICAgICByZXR1cm4gbm9ybWFsaXNlKCB5LCB4YywgeWUgKTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiAgIG4gJSAwID0gIE5cclxuICAgICAgICAgKiAgIG4gJSBOID0gIE5cclxuICAgICAgICAgKiAgIG4gJSBJID0gIG5cclxuICAgICAgICAgKiAgIDAgJSBuID0gIDBcclxuICAgICAgICAgKiAgLTAgJSBuID0gLTBcclxuICAgICAgICAgKiAgIDAgJSAwID0gIE5cclxuICAgICAgICAgKiAgIDAgJSBOID0gIE5cclxuICAgICAgICAgKiAgIDAgJSBJID0gIDBcclxuICAgICAgICAgKiAgIE4gJSBuID0gIE5cclxuICAgICAgICAgKiAgIE4gJSAwID0gIE5cclxuICAgICAgICAgKiAgIE4gJSBOID0gIE5cclxuICAgICAgICAgKiAgIE4gJSBJID0gIE5cclxuICAgICAgICAgKiAgIEkgJSBuID0gIE5cclxuICAgICAgICAgKiAgIEkgJSAwID0gIE5cclxuICAgICAgICAgKiAgIEkgJSBOID0gIE5cclxuICAgICAgICAgKiAgIEkgJSBJID0gIE5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIG1vZHVsbyB0aGUgdmFsdWUgb2ZcclxuICAgICAgICAgKiBCaWdOdW1iZXIoeSwgYikuIFRoZSByZXN1bHQgZGVwZW5kcyBvbiB0aGUgdmFsdWUgb2YgTU9EVUxPX01PREUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5tb2R1bG8gPSBQLm1vZCA9IGZ1bmN0aW9uICggeSwgYiApIHtcclxuICAgICAgICAgICAgdmFyIHEsIHMsXHJcbiAgICAgICAgICAgICAgICB4ID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIGlkID0gMTE7XHJcbiAgICAgICAgICAgIHkgPSBuZXcgQmlnTnVtYmVyKCB5LCBiICk7XHJcblxyXG4gICAgICAgICAgICAvLyBSZXR1cm4gTmFOIGlmIHggaXMgSW5maW5pdHkgb3IgTmFOLCBvciB5IGlzIE5hTiBvciB6ZXJvLlxyXG4gICAgICAgICAgICBpZiAoICF4LmMgfHwgIXkucyB8fCB5LmMgJiYgIXkuY1swXSApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQmlnTnVtYmVyKE5hTik7XHJcblxyXG4gICAgICAgICAgICAvLyBSZXR1cm4geCBpZiB5IGlzIEluZmluaXR5IG9yIHggaXMgemVyby5cclxuICAgICAgICAgICAgfSBlbHNlIGlmICggIXkuYyB8fCB4LmMgJiYgIXguY1swXSApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQmlnTnVtYmVyKHgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIE1PRFVMT19NT0RFID09IDkgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRXVjbGlkaWFuIGRpdmlzaW9uOiBxID0gc2lnbih5KSAqIGZsb29yKHggLyBhYnMoeSkpXHJcbiAgICAgICAgICAgICAgICAvLyByID0geCAtIHF5ICAgIHdoZXJlICAwIDw9IHIgPCBhYnMoeSlcclxuICAgICAgICAgICAgICAgIHMgPSB5LnM7XHJcbiAgICAgICAgICAgICAgICB5LnMgPSAxO1xyXG4gICAgICAgICAgICAgICAgcSA9IGRpdiggeCwgeSwgMCwgMyApO1xyXG4gICAgICAgICAgICAgICAgeS5zID0gcztcclxuICAgICAgICAgICAgICAgIHEucyAqPSBzO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcSA9IGRpdiggeCwgeSwgMCwgTU9EVUxPX01PREUgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHgubWludXMoIHEudGltZXMoeSkgKTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBuZWdhdGVkLFxyXG4gICAgICAgICAqIGkuZS4gbXVsdGlwbGllZCBieSAtMS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLm5lZ2F0ZWQgPSBQLm5lZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHggPSBuZXcgQmlnTnVtYmVyKHRoaXMpO1xyXG4gICAgICAgICAgICB4LnMgPSAteC5zIHx8IG51bGw7XHJcbiAgICAgICAgICAgIHJldHVybiB4O1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqICBuICsgMCA9IG5cclxuICAgICAgICAgKiAgbiArIE4gPSBOXHJcbiAgICAgICAgICogIG4gKyBJID0gSVxyXG4gICAgICAgICAqICAwICsgbiA9IG5cclxuICAgICAgICAgKiAgMCArIDAgPSAwXHJcbiAgICAgICAgICogIDAgKyBOID0gTlxyXG4gICAgICAgICAqICAwICsgSSA9IElcclxuICAgICAgICAgKiAgTiArIG4gPSBOXHJcbiAgICAgICAgICogIE4gKyAwID0gTlxyXG4gICAgICAgICAqICBOICsgTiA9IE5cclxuICAgICAgICAgKiAgTiArIEkgPSBOXHJcbiAgICAgICAgICogIEkgKyBuID0gSVxyXG4gICAgICAgICAqICBJICsgMCA9IElcclxuICAgICAgICAgKiAgSSArIE4gPSBOXHJcbiAgICAgICAgICogIEkgKyBJID0gSVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgcGx1cyB0aGUgdmFsdWUgb2ZcclxuICAgICAgICAgKiBCaWdOdW1iZXIoeSwgYikuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5wbHVzID0gUC5hZGQgPSBmdW5jdGlvbiAoIHksIGIgKSB7XHJcbiAgICAgICAgICAgIHZhciB0LFxyXG4gICAgICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBhID0geC5zO1xyXG5cclxuICAgICAgICAgICAgaWQgPSAxMjtcclxuICAgICAgICAgICAgeSA9IG5ldyBCaWdOdW1iZXIoIHksIGIgKTtcclxuICAgICAgICAgICAgYiA9IHkucztcclxuXHJcbiAgICAgICAgICAgIC8vIEVpdGhlciBOYU4/XHJcbiAgICAgICAgICAgIGlmICggIWEgfHwgIWIgKSByZXR1cm4gbmV3IEJpZ051bWJlcihOYU4pO1xyXG5cclxuICAgICAgICAgICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgICAgICAgICAgaWYgKCBhICE9IGIgKSB7XHJcbiAgICAgICAgICAgICAgICB5LnMgPSAtYjtcclxuICAgICAgICAgICAgICAgIHJldHVybiB4Lm1pbnVzKHkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgeGUgPSB4LmUgLyBMT0dfQkFTRSxcclxuICAgICAgICAgICAgICAgIHllID0geS5lIC8gTE9HX0JBU0UsXHJcbiAgICAgICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgICAgIHljID0geS5jO1xyXG5cclxuICAgICAgICAgICAgaWYgKCAheGUgfHwgIXllICkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFJldHVybiDCsUluZmluaXR5IGlmIGVpdGhlciDCsUluZmluaXR5LlxyXG4gICAgICAgICAgICAgICAgaWYgKCAheGMgfHwgIXljICkgcmV0dXJuIG5ldyBCaWdOdW1iZXIoIGEgLyAwICk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgICAgICAgICAvLyBSZXR1cm4geSBpZiB5IGlzIG5vbi16ZXJvLCB4IGlmIHggaXMgbm9uLXplcm8sIG9yIHplcm8gaWYgYm90aCBhcmUgemVyby5cclxuICAgICAgICAgICAgICAgIGlmICggIXhjWzBdIHx8ICF5Y1swXSApIHJldHVybiB5Y1swXSA/IHkgOiBuZXcgQmlnTnVtYmVyKCB4Y1swXSA/IHggOiBhICogMCApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB4ZSA9IGJpdEZsb29yKHhlKTtcclxuICAgICAgICAgICAgeWUgPSBiaXRGbG9vcih5ZSk7XHJcbiAgICAgICAgICAgIHhjID0geGMuc2xpY2UoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFByZXBlbmQgemVyb3MgdG8gZXF1YWxpc2UgZXhwb25lbnRzLiBGYXN0ZXIgdG8gdXNlIHJldmVyc2UgdGhlbiBkbyB1bnNoaWZ0cy5cclxuICAgICAgICAgICAgaWYgKCBhID0geGUgLSB5ZSApIHtcclxuICAgICAgICAgICAgICAgIGlmICggYSA+IDAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeWUgPSB4ZTtcclxuICAgICAgICAgICAgICAgICAgICB0ID0geWM7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGEgPSAtYTtcclxuICAgICAgICAgICAgICAgICAgICB0ID0geGM7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKCA7IGEtLTsgdC5wdXNoKDApICk7XHJcbiAgICAgICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYSA9IHhjLmxlbmd0aDtcclxuICAgICAgICAgICAgYiA9IHljLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIC8vIFBvaW50IHhjIHRvIHRoZSBsb25nZXIgYXJyYXksIGFuZCBiIHRvIHRoZSBzaG9ydGVyIGxlbmd0aC5cclxuICAgICAgICAgICAgaWYgKCBhIC0gYiA8IDAgKSB0ID0geWMsIHljID0geGMsIHhjID0gdCwgYiA9IGE7XHJcblxyXG4gICAgICAgICAgICAvLyBPbmx5IHN0YXJ0IGFkZGluZyBhdCB5Yy5sZW5ndGggLSAxIGFzIHRoZSBmdXJ0aGVyIGRpZ2l0cyBvZiB4YyBjYW4gYmUgaWdub3JlZC5cclxuICAgICAgICAgICAgZm9yICggYSA9IDA7IGI7ICkge1xyXG4gICAgICAgICAgICAgICAgYSA9ICggeGNbLS1iXSA9IHhjW2JdICsgeWNbYl0gKyBhICkgLyBCQVNFIHwgMDtcclxuICAgICAgICAgICAgICAgIHhjW2JdICU9IEJBU0U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChhKSB7XHJcbiAgICAgICAgICAgICAgICB4Yy51bnNoaWZ0KGEpO1xyXG4gICAgICAgICAgICAgICAgKyt5ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gTm8gbmVlZCB0byBjaGVjayBmb3IgemVybywgYXMgK3ggKyAreSAhPSAwICYmIC14ICsgLXkgIT0gMFxyXG4gICAgICAgICAgICAvLyB5ZSA9IE1BWF9FWFAgKyAxIHBvc3NpYmxlXHJcbiAgICAgICAgICAgIHJldHVybiBub3JtYWxpc2UoIHksIHhjLCB5ZSApO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiB0aGUgbnVtYmVyIG9mIHNpZ25pZmljYW50IGRpZ2l0cyBvZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBbel0ge2Jvb2xlYW58bnVtYmVyfSBXaGV0aGVyIHRvIGNvdW50IGludGVnZXItcGFydCB0cmFpbGluZyB6ZXJvczogdHJ1ZSwgZmFsc2UsIDEgb3IgMC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLnByZWNpc2lvbiA9IFAuc2QgPSBmdW5jdGlvbiAoeikge1xyXG4gICAgICAgICAgICB2YXIgbiwgdixcclxuICAgICAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgYyA9IHguYztcclxuXHJcbiAgICAgICAgICAgIC8vICdwcmVjaXNpb24oKSBhcmd1bWVudCBub3QgYSBib29sZWFuIG9yIGJpbmFyeSBkaWdpdDoge3p9J1xyXG4gICAgICAgICAgICBpZiAoIHogIT0gbnVsbCAmJiB6ICE9PSAhIXogJiYgeiAhPT0gMSAmJiB6ICE9PSAwICkge1xyXG4gICAgICAgICAgICAgICAgaWYgKEVSUk9SUykgcmFpc2UoIDEzLCAnYXJndW1lbnQnICsgbm90Qm9vbCwgeiApO1xyXG4gICAgICAgICAgICAgICAgaWYgKCB6ICE9ICEheiApIHogPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoICFjICkgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIHYgPSBjLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgIG4gPSB2ICogTE9HX0JBU0UgKyAxO1xyXG5cclxuICAgICAgICAgICAgaWYgKCB2ID0gY1t2XSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTdWJ0cmFjdCB0aGUgbnVtYmVyIG9mIHRyYWlsaW5nIHplcm9zIG9mIHRoZSBsYXN0IGVsZW1lbnQuXHJcbiAgICAgICAgICAgICAgICBmb3IgKCA7IHYgJSAxMCA9PSAwOyB2IC89IDEwLCBuLS0gKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIG51bWJlciBvZiBkaWdpdHMgb2YgdGhlIGZpcnN0IGVsZW1lbnQuXHJcbiAgICAgICAgICAgICAgICBmb3IgKCB2ID0gY1swXTsgdiA+PSAxMDsgdiAvPSAxMCwgbisrICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICggeiAmJiB4LmUgKyAxID4gbiApIG4gPSB4LmUgKyAxO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG47XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgcm91bmRlZCB0byBhIG1heGltdW0gb2ZcclxuICAgICAgICAgKiBkcCBkZWNpbWFsIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIHJtLCBvciB0byAwIGFuZCBST1VORElOR19NT0RFIHJlc3BlY3RpdmVseSBpZlxyXG4gICAgICAgICAqIG9taXR0ZWQuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBbZHBdIHtudW1iZXJ9IERlY2ltYWwgcGxhY2VzLiBJbnRlZ2VyLCAwIHRvIE1BWCBpbmNsdXNpdmUuXHJcbiAgICAgICAgICogW3JtXSB7bnVtYmVyfSBSb3VuZGluZyBtb2RlLiBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogJ3JvdW5kKCkgZGVjaW1hbCBwbGFjZXMgb3V0IG9mIHJhbmdlOiB7ZHB9J1xyXG4gICAgICAgICAqICdyb3VuZCgpIGRlY2ltYWwgcGxhY2VzIG5vdCBhbiBpbnRlZ2VyOiB7ZHB9J1xyXG4gICAgICAgICAqICdyb3VuZCgpIHJvdW5kaW5nIG1vZGUgbm90IGFuIGludGVnZXI6IHtybX0nXHJcbiAgICAgICAgICogJ3JvdW5kKCkgcm91bmRpbmcgbW9kZSBvdXQgb2YgcmFuZ2U6IHtybX0nXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5yb3VuZCA9IGZ1bmN0aW9uICggZHAsIHJtICkge1xyXG4gICAgICAgICAgICB2YXIgbiA9IG5ldyBCaWdOdW1iZXIodGhpcyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIGRwID09IG51bGwgfHwgaXNWYWxpZEludCggZHAsIDAsIE1BWCwgMTUgKSApIHtcclxuICAgICAgICAgICAgICAgIHJvdW5kKCBuLCB+fmRwICsgdGhpcy5lICsgMSwgcm0gPT0gbnVsbCB8fFxyXG4gICAgICAgICAgICAgICAgICAhaXNWYWxpZEludCggcm0sIDAsIDgsIDE1LCByb3VuZGluZ01vZGUgKSA/IFJPVU5ESU5HX01PREUgOiBybSB8IDAgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG47XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgc2hpZnRlZCBieSBrIHBsYWNlc1xyXG4gICAgICAgICAqIChwb3dlcnMgb2YgMTApLiBTaGlmdCB0byB0aGUgcmlnaHQgaWYgbiA+IDAsIGFuZCB0byB0aGUgbGVmdCBpZiBuIDwgMC5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIGsge251bWJlcn0gSW50ZWdlciwgLU1BWF9TQUZFX0lOVEVHRVIgdG8gTUFYX1NBRkVfSU5URUdFUiBpbmNsdXNpdmUuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBJZiBrIGlzIG91dCBvZiByYW5nZSBhbmQgRVJST1JTIGlzIGZhbHNlLCB0aGUgcmVzdWx0IHdpbGwgYmUgwrEwIGlmIGsgPCAwLCBvciDCsUluZmluaXR5XHJcbiAgICAgICAgICogb3RoZXJ3aXNlLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogJ3NoaWZ0KCkgYXJndW1lbnQgbm90IGFuIGludGVnZXI6IHtrfSdcclxuICAgICAgICAgKiAnc2hpZnQoKSBhcmd1bWVudCBvdXQgb2YgcmFuZ2U6IHtrfSdcclxuICAgICAgICAgKi9cclxuICAgICAgICBQLnNoaWZ0ID0gZnVuY3Rpb24gKGspIHtcclxuICAgICAgICAgICAgdmFyIG4gPSB0aGlzO1xyXG4gICAgICAgICAgICByZXR1cm4gaXNWYWxpZEludCggaywgLU1BWF9TQUZFX0lOVEVHRVIsIE1BWF9TQUZFX0lOVEVHRVIsIDE2LCAnYXJndW1lbnQnIClcclxuXHJcbiAgICAgICAgICAgICAgLy8gayA8IDFlKzIxLCBvciB0cnVuY2F0ZShrKSB3aWxsIHByb2R1Y2UgZXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgICAgICAgICAgPyBuLnRpbWVzKCAnMWUnICsgdHJ1bmNhdGUoaykgKVxyXG4gICAgICAgICAgICAgIDogbmV3IEJpZ051bWJlciggbi5jICYmIG4uY1swXSAmJiAoIGsgPCAtTUFYX1NBRkVfSU5URUdFUiB8fCBrID4gTUFYX1NBRkVfSU5URUdFUiApXHJcbiAgICAgICAgICAgICAgICA/IG4ucyAqICggayA8IDAgPyAwIDogMSAvIDAgKVxyXG4gICAgICAgICAgICAgICAgOiBuICk7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogIHNxcnQoLW4pID0gIE5cclxuICAgICAgICAgKiAgc3FydCggTikgPSAgTlxyXG4gICAgICAgICAqICBzcXJ0KC1JKSA9ICBOXHJcbiAgICAgICAgICogIHNxcnQoIEkpID0gIElcclxuICAgICAgICAgKiAgc3FydCggMCkgPSAgMFxyXG4gICAgICAgICAqICBzcXJ0KC0wKSA9IC0wXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBSZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSBzcXVhcmUgcm9vdCBvZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIsXHJcbiAgICAgICAgICogcm91bmRlZCBhY2NvcmRpbmcgdG8gREVDSU1BTF9QTEFDRVMgYW5kIFJPVU5ESU5HX01PREUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5zcXVhcmVSb290ID0gUC5zcXJ0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgbSwgbiwgciwgcmVwLCB0LFxyXG4gICAgICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBjID0geC5jLFxyXG4gICAgICAgICAgICAgICAgcyA9IHgucyxcclxuICAgICAgICAgICAgICAgIGUgPSB4LmUsXHJcbiAgICAgICAgICAgICAgICBkcCA9IERFQ0lNQUxfUExBQ0VTICsgNCxcclxuICAgICAgICAgICAgICAgIGhhbGYgPSBuZXcgQmlnTnVtYmVyKCcwLjUnKTtcclxuXHJcbiAgICAgICAgICAgIC8vIE5lZ2F0aXZlL05hTi9JbmZpbml0eS96ZXJvP1xyXG4gICAgICAgICAgICBpZiAoIHMgIT09IDEgfHwgIWMgfHwgIWNbMF0gKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEJpZ051bWJlciggIXMgfHwgcyA8IDAgJiYgKCAhYyB8fCBjWzBdICkgPyBOYU4gOiBjID8geCA6IDEgLyAwICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEluaXRpYWwgZXN0aW1hdGUuXHJcbiAgICAgICAgICAgIHMgPSBNYXRoLnNxcnQoICt4ICk7XHJcblxyXG4gICAgICAgICAgICAvLyBNYXRoLnNxcnQgdW5kZXJmbG93L292ZXJmbG93P1xyXG4gICAgICAgICAgICAvLyBQYXNzIHggdG8gTWF0aC5zcXJ0IGFzIGludGVnZXIsIHRoZW4gYWRqdXN0IHRoZSBleHBvbmVudCBvZiB0aGUgcmVzdWx0LlxyXG4gICAgICAgICAgICBpZiAoIHMgPT0gMCB8fCBzID09IDEgLyAwICkge1xyXG4gICAgICAgICAgICAgICAgbiA9IGNvZWZmVG9TdHJpbmcoYyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoICggbi5sZW5ndGggKyBlICkgJSAyID09IDAgKSBuICs9ICcwJztcclxuICAgICAgICAgICAgICAgIHMgPSBNYXRoLnNxcnQobik7XHJcbiAgICAgICAgICAgICAgICBlID0gYml0Rmxvb3IoICggZSArIDEgKSAvIDIgKSAtICggZSA8IDAgfHwgZSAlIDIgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIHMgPT0gMSAvIDAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbiA9ICcxZScgKyBlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBuID0gcy50b0V4cG9uZW50aWFsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbiA9IG4uc2xpY2UoIDAsIG4uaW5kZXhPZignZScpICsgMSApICsgZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByID0gbmV3IEJpZ051bWJlcihuKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHIgPSBuZXcgQmlnTnVtYmVyKCBzICsgJycgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIHplcm8uXHJcbiAgICAgICAgICAgIC8vIHIgY291bGQgYmUgemVybyBpZiBNSU5fRVhQIGlzIGNoYW5nZWQgYWZ0ZXIgdGhlIHRoaXMgdmFsdWUgd2FzIGNyZWF0ZWQuXHJcbiAgICAgICAgICAgIC8vIFRoaXMgd291bGQgY2F1c2UgYSBkaXZpc2lvbiBieSB6ZXJvICh4L3QpIGFuZCBoZW5jZSBJbmZpbml0eSBiZWxvdywgd2hpY2ggd291bGQgY2F1c2VcclxuICAgICAgICAgICAgLy8gY29lZmZUb1N0cmluZyB0byB0aHJvdy5cclxuICAgICAgICAgICAgaWYgKCByLmNbMF0gKSB7XHJcbiAgICAgICAgICAgICAgICBlID0gci5lO1xyXG4gICAgICAgICAgICAgICAgcyA9IGUgKyBkcDtcclxuICAgICAgICAgICAgICAgIGlmICggcyA8IDMgKSBzID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBOZXd0b24tUmFwaHNvbiBpdGVyYXRpb24uXHJcbiAgICAgICAgICAgICAgICBmb3IgKCA7IDsgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdCA9IHI7XHJcbiAgICAgICAgICAgICAgICAgICAgciA9IGhhbGYudGltZXMoIHQucGx1cyggZGl2KCB4LCB0LCBkcCwgMSApICkgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBjb2VmZlRvU3RyaW5nKCB0LmMgICApLnNsaWNlKCAwLCBzICkgPT09ICggbiA9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBjb2VmZlRvU3RyaW5nKCByLmMgKSApLnNsaWNlKCAwLCBzICkgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgZXhwb25lbnQgb2YgciBtYXkgaGVyZSBiZSBvbmUgbGVzcyB0aGFuIHRoZSBmaW5hbCByZXN1bHQgZXhwb25lbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGUuZyAwLjAwMDk5OTkgKGUtNCkgLS0+IDAuMDAxIChlLTMpLCBzbyBhZGp1c3QgcyBzbyB0aGUgcm91bmRpbmcgZGlnaXRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFyZSBpbmRleGVkIGNvcnJlY3RseS5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCByLmUgPCBlICkgLS1zO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuID0gbi5zbGljZSggcyAtIDMsIHMgKyAxICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgNHRoIHJvdW5kaW5nIGRpZ2l0IG1heSBiZSBpbiBlcnJvciBieSAtMSBzbyBpZiB0aGUgNCByb3VuZGluZyBkaWdpdHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXJlIDk5OTkgb3IgNDk5OSAoaS5lLiBhcHByb2FjaGluZyBhIHJvdW5kaW5nIGJvdW5kYXJ5KSBjb250aW51ZSB0aGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaXRlcmF0aW9uLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIG4gPT0gJzk5OTknIHx8ICFyZXAgJiYgbiA9PSAnNDk5OScgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT24gdGhlIGZpcnN0IGl0ZXJhdGlvbiBvbmx5LCBjaGVjayB0byBzZWUgaWYgcm91bmRpbmcgdXAgZ2l2ZXMgdGhlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBleGFjdCByZXN1bHQgYXMgdGhlIG5pbmVzIG1heSBpbmZpbml0ZWx5IHJlcGVhdC5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggIXJlcCApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3VuZCggdCwgdC5lICsgREVDSU1BTF9QTEFDRVMgKyAyLCAwICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggdC50aW1lcyh0KS5lcSh4KSApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgciA9IHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkcCArPSA0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcyArPSA0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwID0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiByb3VuZGluZyBkaWdpdHMgYXJlIG51bGwsIDB7MCw0fSBvciA1MHswLDN9LCBjaGVjayBmb3IgZXhhY3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlc3VsdC4gSWYgbm90LCB0aGVuIHRoZXJlIGFyZSBmdXJ0aGVyIGRpZ2l0cyBhbmQgbSB3aWxsIGJlIHRydXRoeS5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggIStuIHx8ICErbi5zbGljZSgxKSAmJiBuLmNoYXJBdCgwKSA9PSAnNScgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRydW5jYXRlIHRvIHRoZSBmaXJzdCByb3VuZGluZyBkaWdpdC5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3VuZCggciwgci5lICsgREVDSU1BTF9QTEFDRVMgKyAyLCAxICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSA9ICFyLnRpbWVzKHIpLmVxKHgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcm91bmQoIHIsIHIuZSArIERFQ0lNQUxfUExBQ0VTICsgMSwgUk9VTkRJTkdfTU9ERSwgbSApO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqICBuICogMCA9IDBcclxuICAgICAgICAgKiAgbiAqIE4gPSBOXHJcbiAgICAgICAgICogIG4gKiBJID0gSVxyXG4gICAgICAgICAqICAwICogbiA9IDBcclxuICAgICAgICAgKiAgMCAqIDAgPSAwXHJcbiAgICAgICAgICogIDAgKiBOID0gTlxyXG4gICAgICAgICAqICAwICogSSA9IE5cclxuICAgICAgICAgKiAgTiAqIG4gPSBOXHJcbiAgICAgICAgICogIE4gKiAwID0gTlxyXG4gICAgICAgICAqICBOICogTiA9IE5cclxuICAgICAgICAgKiAgTiAqIEkgPSBOXHJcbiAgICAgICAgICogIEkgKiBuID0gSVxyXG4gICAgICAgICAqICBJICogMCA9IE5cclxuICAgICAgICAgKiAgSSAqIE4gPSBOXHJcbiAgICAgICAgICogIEkgKiBJID0gSVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgdGltZXMgdGhlIHZhbHVlIG9mXHJcbiAgICAgICAgICogQmlnTnVtYmVyKHksIGIpLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAudGltZXMgPSBQLm11bCA9IGZ1bmN0aW9uICggeSwgYiApIHtcclxuICAgICAgICAgICAgdmFyIGMsIGUsIGksIGosIGssIG0sIHhjTCwgeGxvLCB4aGksIHljTCwgeWxvLCB5aGksIHpjLFxyXG4gICAgICAgICAgICAgICAgYmFzZSwgc3FydEJhc2UsXHJcbiAgICAgICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICAgICAgeWMgPSAoIGlkID0gMTcsIHkgPSBuZXcgQmlnTnVtYmVyKCB5LCBiICkgKS5jO1xyXG5cclxuICAgICAgICAgICAgLy8gRWl0aGVyIE5hTiwgwrFJbmZpbml0eSBvciDCsTA/XHJcbiAgICAgICAgICAgIGlmICggIXhjIHx8ICF5YyB8fCAheGNbMF0gfHwgIXljWzBdICkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFJldHVybiBOYU4gaWYgZWl0aGVyIGlzIE5hTiwgb3Igb25lIGlzIDAgYW5kIHRoZSBvdGhlciBpcyBJbmZpbml0eS5cclxuICAgICAgICAgICAgICAgIGlmICggIXgucyB8fCAheS5zIHx8IHhjICYmICF4Y1swXSAmJiAheWMgfHwgeWMgJiYgIXljWzBdICYmICF4YyApIHtcclxuICAgICAgICAgICAgICAgICAgICB5LmMgPSB5LmUgPSB5LnMgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB5LnMgKj0geC5zO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBSZXR1cm4gwrFJbmZpbml0eSBpZiBlaXRoZXIgaXMgwrFJbmZpbml0eS5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoICF4YyB8fCAheWMgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHkuYyA9IHkuZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJldHVybiDCsTAgaWYgZWl0aGVyIGlzIMKxMC5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5LmMgPSBbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHkuZSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB5O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBlID0gYml0Rmxvb3IoIHguZSAvIExPR19CQVNFICkgKyBiaXRGbG9vciggeS5lIC8gTE9HX0JBU0UgKTtcclxuICAgICAgICAgICAgeS5zICo9IHgucztcclxuICAgICAgICAgICAgeGNMID0geGMubGVuZ3RoO1xyXG4gICAgICAgICAgICB5Y0wgPSB5Yy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICAvLyBFbnN1cmUgeGMgcG9pbnRzIHRvIGxvbmdlciBhcnJheSBhbmQgeGNMIHRvIGl0cyBsZW5ndGguXHJcbiAgICAgICAgICAgIGlmICggeGNMIDwgeWNMICkgemMgPSB4YywgeGMgPSB5YywgeWMgPSB6YywgaSA9IHhjTCwgeGNMID0geWNMLCB5Y0wgPSBpO1xyXG5cclxuICAgICAgICAgICAgLy8gSW5pdGlhbGlzZSB0aGUgcmVzdWx0IGFycmF5IHdpdGggemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoIGkgPSB4Y0wgKyB5Y0wsIHpjID0gW107IGktLTsgemMucHVzaCgwKSApO1xyXG5cclxuICAgICAgICAgICAgYmFzZSA9IEJBU0U7XHJcbiAgICAgICAgICAgIHNxcnRCYXNlID0gU1FSVF9CQVNFO1xyXG5cclxuICAgICAgICAgICAgZm9yICggaSA9IHljTDsgLS1pID49IDA7ICkge1xyXG4gICAgICAgICAgICAgICAgYyA9IDA7XHJcbiAgICAgICAgICAgICAgICB5bG8gPSB5Y1tpXSAlIHNxcnRCYXNlO1xyXG4gICAgICAgICAgICAgICAgeWhpID0geWNbaV0gLyBzcXJ0QmFzZSB8IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yICggayA9IHhjTCwgaiA9IGkgKyBrOyBqID4gaTsgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeGxvID0geGNbLS1rXSAlIHNxcnRCYXNlO1xyXG4gICAgICAgICAgICAgICAgICAgIHhoaSA9IHhjW2tdIC8gc3FydEJhc2UgfCAwO1xyXG4gICAgICAgICAgICAgICAgICAgIG0gPSB5aGkgKiB4bG8gKyB4aGkgKiB5bG87XHJcbiAgICAgICAgICAgICAgICAgICAgeGxvID0geWxvICogeGxvICsgKCAoIG0gJSBzcXJ0QmFzZSApICogc3FydEJhc2UgKSArIHpjW2pdICsgYztcclxuICAgICAgICAgICAgICAgICAgICBjID0gKCB4bG8gLyBiYXNlIHwgMCApICsgKCBtIC8gc3FydEJhc2UgfCAwICkgKyB5aGkgKiB4aGk7XHJcbiAgICAgICAgICAgICAgICAgICAgemNbai0tXSA9IHhsbyAlIGJhc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgemNbal0gPSBjO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoYykge1xyXG4gICAgICAgICAgICAgICAgKytlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgemMuc2hpZnQoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG5vcm1hbGlzZSggeSwgemMsIGUgKTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciByb3VuZGVkIHRvIGEgbWF4aW11bSBvZlxyXG4gICAgICAgICAqIHNkIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIHJtLCBvciBST1VORElOR19NT0RFIGlmIHJtIGlzIG9taXR0ZWQuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBbc2RdIHtudW1iZXJ9IFNpZ25pZmljYW50IGRpZ2l0cy4gSW50ZWdlciwgMSB0byBNQVggaW5jbHVzaXZlLlxyXG4gICAgICAgICAqIFtybV0ge251bWJlcn0gUm91bmRpbmcgbW9kZS4gSW50ZWdlciwgMCB0byA4IGluY2x1c2l2ZS5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqICd0b0RpZ2l0cygpIHByZWNpc2lvbiBvdXQgb2YgcmFuZ2U6IHtzZH0nXHJcbiAgICAgICAgICogJ3RvRGlnaXRzKCkgcHJlY2lzaW9uIG5vdCBhbiBpbnRlZ2VyOiB7c2R9J1xyXG4gICAgICAgICAqICd0b0RpZ2l0cygpIHJvdW5kaW5nIG1vZGUgbm90IGFuIGludGVnZXI6IHtybX0nXHJcbiAgICAgICAgICogJ3RvRGlnaXRzKCkgcm91bmRpbmcgbW9kZSBvdXQgb2YgcmFuZ2U6IHtybX0nXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC50b0RpZ2l0cyA9IGZ1bmN0aW9uICggc2QsIHJtICkge1xyXG4gICAgICAgICAgICB2YXIgbiA9IG5ldyBCaWdOdW1iZXIodGhpcyk7XHJcbiAgICAgICAgICAgIHNkID0gc2QgPT0gbnVsbCB8fCAhaXNWYWxpZEludCggc2QsIDEsIE1BWCwgMTgsICdwcmVjaXNpb24nICkgPyBudWxsIDogc2QgfCAwO1xyXG4gICAgICAgICAgICBybSA9IHJtID09IG51bGwgfHwgIWlzVmFsaWRJbnQoIHJtLCAwLCA4LCAxOCwgcm91bmRpbmdNb2RlICkgPyBST1VORElOR19NT0RFIDogcm0gfCAwO1xyXG4gICAgICAgICAgICByZXR1cm4gc2QgPyByb3VuZCggbiwgc2QsIHJtICkgOiBuO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGluIGV4cG9uZW50aWFsIG5vdGF0aW9uIGFuZFxyXG4gICAgICAgICAqIHJvdW5kZWQgdXNpbmcgUk9VTkRJTkdfTU9ERSB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFtkcF0ge251bWJlcn0gRGVjaW1hbCBwbGFjZXMuIEludGVnZXIsIDAgdG8gTUFYIGluY2x1c2l2ZS5cclxuICAgICAgICAgKiBbcm1dIHtudW1iZXJ9IFJvdW5kaW5nIG1vZGUuIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmUuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiAndG9FeHBvbmVudGlhbCgpIGRlY2ltYWwgcGxhY2VzIG5vdCBhbiBpbnRlZ2VyOiB7ZHB9J1xyXG4gICAgICAgICAqICd0b0V4cG9uZW50aWFsKCkgZGVjaW1hbCBwbGFjZXMgb3V0IG9mIHJhbmdlOiB7ZHB9J1xyXG4gICAgICAgICAqICd0b0V4cG9uZW50aWFsKCkgcm91bmRpbmcgbW9kZSBub3QgYW4gaW50ZWdlcjoge3JtfSdcclxuICAgICAgICAgKiAndG9FeHBvbmVudGlhbCgpIHJvdW5kaW5nIG1vZGUgb3V0IG9mIHJhbmdlOiB7cm19J1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAudG9FeHBvbmVudGlhbCA9IGZ1bmN0aW9uICggZHAsIHJtICkge1xyXG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0KCB0aGlzLFxyXG4gICAgICAgICAgICAgIGRwICE9IG51bGwgJiYgaXNWYWxpZEludCggZHAsIDAsIE1BWCwgMTkgKSA/IH5+ZHAgKyAxIDogbnVsbCwgcm0sIDE5ICk7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaW4gZml4ZWQtcG9pbnQgbm90YXRpb24gcm91bmRpbmdcclxuICAgICAgICAgKiB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIHJtLCBvciBST1VORElOR19NT0RFIGlmIHJtIGlzIG9taXR0ZWQuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBOb3RlOiBhcyB3aXRoIEphdmFTY3JpcHQncyBudW1iZXIgdHlwZSwgKC0wKS50b0ZpeGVkKDApIGlzICcwJyxcclxuICAgICAgICAgKiBidXQgZS5nLiAoLTAuMDAwMDEpLnRvRml4ZWQoMCkgaXMgJy0wJy5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFtkcF0ge251bWJlcn0gRGVjaW1hbCBwbGFjZXMuIEludGVnZXIsIDAgdG8gTUFYIGluY2x1c2l2ZS5cclxuICAgICAgICAgKiBbcm1dIHtudW1iZXJ9IFJvdW5kaW5nIG1vZGUuIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmUuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiAndG9GaXhlZCgpIGRlY2ltYWwgcGxhY2VzIG5vdCBhbiBpbnRlZ2VyOiB7ZHB9J1xyXG4gICAgICAgICAqICd0b0ZpeGVkKCkgZGVjaW1hbCBwbGFjZXMgb3V0IG9mIHJhbmdlOiB7ZHB9J1xyXG4gICAgICAgICAqICd0b0ZpeGVkKCkgcm91bmRpbmcgbW9kZSBub3QgYW4gaW50ZWdlcjoge3JtfSdcclxuICAgICAgICAgKiAndG9GaXhlZCgpIHJvdW5kaW5nIG1vZGUgb3V0IG9mIHJhbmdlOiB7cm19J1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAudG9GaXhlZCA9IGZ1bmN0aW9uICggZHAsIHJtICkge1xyXG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0KCB0aGlzLCBkcCAhPSBudWxsICYmIGlzVmFsaWRJbnQoIGRwLCAwLCBNQVgsIDIwIClcclxuICAgICAgICAgICAgICA/IH5+ZHAgKyB0aGlzLmUgKyAxIDogbnVsbCwgcm0sIDIwICk7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaW4gZml4ZWQtcG9pbnQgbm90YXRpb24gcm91bmRlZFxyXG4gICAgICAgICAqIHVzaW5nIHJtIG9yIFJPVU5ESU5HX01PREUgdG8gZHAgZGVjaW1hbCBwbGFjZXMsIGFuZCBmb3JtYXR0ZWQgYWNjb3JkaW5nIHRvIHRoZSBwcm9wZXJ0aWVzXHJcbiAgICAgICAgICogb2YgdGhlIEZPUk1BVCBvYmplY3QgKHNlZSBCaWdOdW1iZXIuY29uZmlnKS5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEZPUk1BVCA9IHtcclxuICAgICAgICAgKiAgICAgIGRlY2ltYWxTZXBhcmF0b3IgOiAnLicsXHJcbiAgICAgICAgICogICAgICBncm91cFNlcGFyYXRvciA6ICcsJyxcclxuICAgICAgICAgKiAgICAgIGdyb3VwU2l6ZSA6IDMsXHJcbiAgICAgICAgICogICAgICBzZWNvbmRhcnlHcm91cFNpemUgOiAwLFxyXG4gICAgICAgICAqICAgICAgZnJhY3Rpb25Hcm91cFNlcGFyYXRvciA6ICdcXHhBMCcsICAgIC8vIG5vbi1icmVha2luZyBzcGFjZVxyXG4gICAgICAgICAqICAgICAgZnJhY3Rpb25Hcm91cFNpemUgOiAwXHJcbiAgICAgICAgICogfTtcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFtkcF0ge251bWJlcn0gRGVjaW1hbCBwbGFjZXMuIEludGVnZXIsIDAgdG8gTUFYIGluY2x1c2l2ZS5cclxuICAgICAgICAgKiBbcm1dIHtudW1iZXJ9IFJvdW5kaW5nIG1vZGUuIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmUuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiAndG9Gb3JtYXQoKSBkZWNpbWFsIHBsYWNlcyBub3QgYW4gaW50ZWdlcjoge2RwfSdcclxuICAgICAgICAgKiAndG9Gb3JtYXQoKSBkZWNpbWFsIHBsYWNlcyBvdXQgb2YgcmFuZ2U6IHtkcH0nXHJcbiAgICAgICAgICogJ3RvRm9ybWF0KCkgcm91bmRpbmcgbW9kZSBub3QgYW4gaW50ZWdlcjoge3JtfSdcclxuICAgICAgICAgKiAndG9Gb3JtYXQoKSByb3VuZGluZyBtb2RlIG91dCBvZiByYW5nZToge3JtfSdcclxuICAgICAgICAgKi9cclxuICAgICAgICBQLnRvRm9ybWF0ID0gZnVuY3Rpb24gKCBkcCwgcm0gKSB7XHJcbiAgICAgICAgICAgIHZhciBzdHIgPSBmb3JtYXQoIHRoaXMsIGRwICE9IG51bGwgJiYgaXNWYWxpZEludCggZHAsIDAsIE1BWCwgMjEgKVxyXG4gICAgICAgICAgICAgID8gfn5kcCArIHRoaXMuZSArIDEgOiBudWxsLCBybSwgMjEgKTtcclxuXHJcbiAgICAgICAgICAgIGlmICggdGhpcy5jICkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgYXJyID0gc3RyLnNwbGl0KCcuJyksXHJcbiAgICAgICAgICAgICAgICAgICAgZzEgPSArRk9STUFULmdyb3VwU2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICBnMiA9ICtGT1JNQVQuc2Vjb25kYXJ5R3JvdXBTaXplLFxyXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwU2VwYXJhdG9yID0gRk9STUFULmdyb3VwU2VwYXJhdG9yLFxyXG4gICAgICAgICAgICAgICAgICAgIGludFBhcnQgPSBhcnJbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnJhY3Rpb25QYXJ0ID0gYXJyWzFdLFxyXG4gICAgICAgICAgICAgICAgICAgIGlzTmVnID0gdGhpcy5zIDwgMCxcclxuICAgICAgICAgICAgICAgICAgICBpbnREaWdpdHMgPSBpc05lZyA/IGludFBhcnQuc2xpY2UoMSkgOiBpbnRQYXJ0LFxyXG4gICAgICAgICAgICAgICAgICAgIGxlbiA9IGludERpZ2l0cy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGcyKSBpID0gZzEsIGcxID0gZzIsIGcyID0gaSwgbGVuIC09IGk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCBnMSA+IDAgJiYgbGVuID4gMCApIHtcclxuICAgICAgICAgICAgICAgICAgICBpID0gbGVuICUgZzEgfHwgZzE7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50UGFydCA9IGludERpZ2l0cy5zdWJzdHIoIDAsIGkgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICggOyBpIDwgbGVuOyBpICs9IGcxICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRQYXJ0ICs9IGdyb3VwU2VwYXJhdG9yICsgaW50RGlnaXRzLnN1YnN0ciggaSwgZzEgKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICggZzIgPiAwICkgaW50UGFydCArPSBncm91cFNlcGFyYXRvciArIGludERpZ2l0cy5zbGljZShpKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNOZWcpIGludFBhcnQgPSAnLScgKyBpbnRQYXJ0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHN0ciA9IGZyYWN0aW9uUGFydFxyXG4gICAgICAgICAgICAgICAgICA/IGludFBhcnQgKyBGT1JNQVQuZGVjaW1hbFNlcGFyYXRvciArICggKCBnMiA9ICtGT1JNQVQuZnJhY3Rpb25Hcm91cFNpemUgKVxyXG4gICAgICAgICAgICAgICAgICAgID8gZnJhY3Rpb25QYXJ0LnJlcGxhY2UoIG5ldyBSZWdFeHAoICdcXFxcZHsnICsgZzIgKyAnfVxcXFxCJywgJ2cnICksXHJcbiAgICAgICAgICAgICAgICAgICAgICAnJCYnICsgRk9STUFULmZyYWN0aW9uR3JvdXBTZXBhcmF0b3IgKVxyXG4gICAgICAgICAgICAgICAgICAgIDogZnJhY3Rpb25QYXJ0IClcclxuICAgICAgICAgICAgICAgICAgOiBpbnRQYXJ0O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiBhIHN0cmluZyBhcnJheSByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGFzIGEgc2ltcGxlIGZyYWN0aW9uIHdpdGhcclxuICAgICAgICAgKiBhbiBpbnRlZ2VyIG51bWVyYXRvciBhbmQgYW4gaW50ZWdlciBkZW5vbWluYXRvci4gVGhlIGRlbm9taW5hdG9yIHdpbGwgYmUgYSBwb3NpdGl2ZVxyXG4gICAgICAgICAqIG5vbi16ZXJvIHZhbHVlIGxlc3MgdGhhbiBvciBlcXVhbCB0byB0aGUgc3BlY2lmaWVkIG1heGltdW0gZGVub21pbmF0b3IuIElmIGEgbWF4aW11bVxyXG4gICAgICAgICAqIGRlbm9taW5hdG9yIGlzIG5vdCBzcGVjaWZpZWQsIHRoZSBkZW5vbWluYXRvciB3aWxsIGJlIHRoZSBsb3dlc3QgdmFsdWUgbmVjZXNzYXJ5IHRvXHJcbiAgICAgICAgICogcmVwcmVzZW50IHRoZSBudW1iZXIgZXhhY3RseS5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFttZF0ge251bWJlcnxzdHJpbmd8QmlnTnVtYmVyfSBJbnRlZ2VyID49IDEgYW5kIDwgSW5maW5pdHkuIFRoZSBtYXhpbXVtIGRlbm9taW5hdG9yLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogJ3RvRnJhY3Rpb24oKSBtYXggZGVub21pbmF0b3Igbm90IGFuIGludGVnZXI6IHttZH0nXHJcbiAgICAgICAgICogJ3RvRnJhY3Rpb24oKSBtYXggZGVub21pbmF0b3Igb3V0IG9mIHJhbmdlOiB7bWR9J1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAudG9GcmFjdGlvbiA9IGZ1bmN0aW9uIChtZCkge1xyXG4gICAgICAgICAgICB2YXIgYXJyLCBkMCwgZDIsIGUsIGV4cCwgbiwgbjAsIHEsIHMsXHJcbiAgICAgICAgICAgICAgICBrID0gRVJST1JTLFxyXG4gICAgICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgICAgIGQgPSBuZXcgQmlnTnVtYmVyKE9ORSksXHJcbiAgICAgICAgICAgICAgICBuMSA9IGQwID0gbmV3IEJpZ051bWJlcihPTkUpLFxyXG4gICAgICAgICAgICAgICAgZDEgPSBuMCA9IG5ldyBCaWdOdW1iZXIoT05FKTtcclxuXHJcbiAgICAgICAgICAgIGlmICggbWQgIT0gbnVsbCApIHtcclxuICAgICAgICAgICAgICAgIEVSUk9SUyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgbiA9IG5ldyBCaWdOdW1iZXIobWQpO1xyXG4gICAgICAgICAgICAgICAgRVJST1JTID0gaztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoICEoIGsgPSBuLmlzSW50KCkgKSB8fCBuLmx0KE9ORSkgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChFUlJPUlMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmFpc2UoIDIyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICdtYXggZGVub21pbmF0b3IgJyArICggayA/ICdvdXQgb2YgcmFuZ2UnIDogJ25vdCBhbiBpbnRlZ2VyJyApLCBtZCApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRVJST1JTIGlzIGZhbHNlOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIG1kIGlzIGEgZmluaXRlIG5vbi1pbnRlZ2VyID49IDEsIHJvdW5kIGl0IHRvIGFuIGludGVnZXIgYW5kIHVzZSBpdC5cclxuICAgICAgICAgICAgICAgICAgICBtZCA9ICFrICYmIG4uYyAmJiByb3VuZCggbiwgbi5lICsgMSwgMSApLmd0ZShPTkUpID8gbiA6IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICggIXhjICkgcmV0dXJuIHgudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgcyA9IGNvZWZmVG9TdHJpbmcoeGMpO1xyXG5cclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIGluaXRpYWwgZGVub21pbmF0b3IuXHJcbiAgICAgICAgICAgIC8vIGQgaXMgYSBwb3dlciBvZiAxMCBhbmQgdGhlIG1pbmltdW0gbWF4IGRlbm9taW5hdG9yIHRoYXQgc3BlY2lmaWVzIHRoZSB2YWx1ZSBleGFjdGx5LlxyXG4gICAgICAgICAgICBlID0gZC5lID0gcy5sZW5ndGggLSB4LmUgLSAxO1xyXG4gICAgICAgICAgICBkLmNbMF0gPSBQT1dTX1RFTlsgKCBleHAgPSBlICUgTE9HX0JBU0UgKSA8IDAgPyBMT0dfQkFTRSArIGV4cCA6IGV4cCBdO1xyXG4gICAgICAgICAgICBtZCA9ICFtZCB8fCBuLmNtcChkKSA+IDAgPyAoIGUgPiAwID8gZCA6IG4xICkgOiBuO1xyXG5cclxuICAgICAgICAgICAgZXhwID0gTUFYX0VYUDtcclxuICAgICAgICAgICAgTUFYX0VYUCA9IDEgLyAwO1xyXG4gICAgICAgICAgICBuID0gbmV3IEJpZ051bWJlcihzKTtcclxuXHJcbiAgICAgICAgICAgIC8vIG4wID0gZDEgPSAwXHJcbiAgICAgICAgICAgIG4wLmNbMF0gPSAwO1xyXG5cclxuICAgICAgICAgICAgZm9yICggOyA7ICkgIHtcclxuICAgICAgICAgICAgICAgIHEgPSBkaXYoIG4sIGQsIDAsIDEgKTtcclxuICAgICAgICAgICAgICAgIGQyID0gZDAucGx1cyggcS50aW1lcyhkMSkgKTtcclxuICAgICAgICAgICAgICAgIGlmICggZDIuY21wKG1kKSA9PSAxICkgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkMCA9IGQxO1xyXG4gICAgICAgICAgICAgICAgZDEgPSBkMjtcclxuICAgICAgICAgICAgICAgIG4xID0gbjAucGx1cyggcS50aW1lcyggZDIgPSBuMSApICk7XHJcbiAgICAgICAgICAgICAgICBuMCA9IGQyO1xyXG4gICAgICAgICAgICAgICAgZCA9IG4ubWludXMoIHEudGltZXMoIGQyID0gZCApICk7XHJcbiAgICAgICAgICAgICAgICBuID0gZDI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGQyID0gZGl2KCBtZC5taW51cyhkMCksIGQxLCAwLCAxICk7XHJcbiAgICAgICAgICAgIG4wID0gbjAucGx1cyggZDIudGltZXMobjEpICk7XHJcbiAgICAgICAgICAgIGQwID0gZDAucGx1cyggZDIudGltZXMoZDEpICk7XHJcbiAgICAgICAgICAgIG4wLnMgPSBuMS5zID0geC5zO1xyXG4gICAgICAgICAgICBlICo9IDI7XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgd2hpY2ggZnJhY3Rpb24gaXMgY2xvc2VyIHRvIHgsIG4wL2QwIG9yIG4xL2QxXHJcbiAgICAgICAgICAgIGFyciA9IGRpdiggbjEsIGQxLCBlLCBST1VORElOR19NT0RFICkubWludXMoeCkuYWJzKCkuY21wKFxyXG4gICAgICAgICAgICAgICAgICBkaXYoIG4wLCBkMCwgZSwgUk9VTkRJTkdfTU9ERSApLm1pbnVzKHgpLmFicygpICkgPCAxXHJcbiAgICAgICAgICAgICAgICAgICAgPyBbIG4xLnRvU3RyaW5nKCksIGQxLnRvU3RyaW5nKCkgXVxyXG4gICAgICAgICAgICAgICAgICAgIDogWyBuMC50b1N0cmluZygpLCBkMC50b1N0cmluZygpIF07XHJcblxyXG4gICAgICAgICAgICBNQVhfRVhQID0gZXhwO1xyXG4gICAgICAgICAgICByZXR1cm4gYXJyO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgY29udmVydGVkIHRvIGEgbnVtYmVyIHByaW1pdGl2ZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLnRvTnVtYmVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gK3RoaXM7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIGEgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciByYWlzZWQgdG8gdGhlIHBvd2VyIG4uXHJcbiAgICAgICAgICogSWYgbSBpcyBwcmVzZW50LCByZXR1cm4gdGhlIHJlc3VsdCBtb2R1bG8gbS5cclxuICAgICAgICAgKiBJZiBuIGlzIG5lZ2F0aXZlIHJvdW5kIGFjY29yZGluZyB0byBERUNJTUFMX1BMQUNFUyBhbmQgUk9VTkRJTkdfTU9ERS5cclxuICAgICAgICAgKiBJZiBQT1dfUFJFQ0lTSU9OIGlzIG5vbi16ZXJvIGFuZCBtIGlzIG5vdCBwcmVzZW50LCByb3VuZCB0byBQT1dfUFJFQ0lTSU9OIHVzaW5nXHJcbiAgICAgICAgICogUk9VTkRJTkdfTU9ERS5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFRoZSBtb2R1bGFyIHBvd2VyIG9wZXJhdGlvbiB3b3JrcyBlZmZpY2llbnRseSB3aGVuIHgsIG4sIGFuZCBtIGFyZSBwb3NpdGl2ZSBpbnRlZ2VycyxcclxuICAgICAgICAgKiBvdGhlcndpc2UgaXQgaXMgZXF1aXZhbGVudCB0byBjYWxjdWxhdGluZyB4LnRvUG93ZXIobikubW9kdWxvKG0pICh3aXRoIFBPV19QUkVDSVNJT04gMCkuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBuIHtudW1iZXJ9IEludGVnZXIsIC1NQVhfU0FGRV9JTlRFR0VSIHRvIE1BWF9TQUZFX0lOVEVHRVIgaW5jbHVzaXZlLlxyXG4gICAgICAgICAqIFttXSB7bnVtYmVyfHN0cmluZ3xCaWdOdW1iZXJ9IFRoZSBtb2R1bHVzLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogJ3BvdygpIGV4cG9uZW50IG5vdCBhbiBpbnRlZ2VyOiB7bn0nXHJcbiAgICAgICAgICogJ3BvdygpIGV4cG9uZW50IG91dCBvZiByYW5nZToge259J1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogUGVyZm9ybXMgNTQgbG9vcCBpdGVyYXRpb25zIGZvciBuIG9mIDkwMDcxOTkyNTQ3NDA5OTEuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC50b1Bvd2VyID0gUC5wb3cgPSBmdW5jdGlvbiAoIG4sIG0gKSB7XHJcbiAgICAgICAgICAgIHZhciBrLCB5LCB6LFxyXG4gICAgICAgICAgICAgICAgaSA9IG1hdGhmbG9vciggbiA8IDAgPyAtbiA6ICtuICksXHJcbiAgICAgICAgICAgICAgICB4ID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIGlmICggbSAhPSBudWxsICkge1xyXG4gICAgICAgICAgICAgICAgaWQgPSAyMztcclxuICAgICAgICAgICAgICAgIG0gPSBuZXcgQmlnTnVtYmVyKG0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBQYXNzIMKxSW5maW5pdHkgdG8gTWF0aC5wb3cgaWYgZXhwb25lbnQgaXMgb3V0IG9mIHJhbmdlLlxyXG4gICAgICAgICAgICBpZiAoICFpc1ZhbGlkSW50KCBuLCAtTUFYX1NBRkVfSU5URUdFUiwgTUFYX1NBRkVfSU5URUdFUiwgMjMsICdleHBvbmVudCcgKSAmJlxyXG4gICAgICAgICAgICAgICggIWlzRmluaXRlKG4pIHx8IGkgPiBNQVhfU0FGRV9JTlRFR0VSICYmICggbiAvPSAwICkgfHxcclxuICAgICAgICAgICAgICAgIHBhcnNlRmxvYXQobikgIT0gbiAmJiAhKCBuID0gTmFOICkgKSB8fCBuID09IDAgKSB7XHJcbiAgICAgICAgICAgICAgICBrID0gTWF0aC5wb3coICt4LCBuICk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEJpZ051bWJlciggbSA/IGsgJSBtIDogayApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCBuID4gMSAmJiB4Lmd0KE9ORSkgJiYgeC5pc0ludCgpICYmIG0uZ3QoT05FKSAmJiBtLmlzSW50KCkgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IHgubW9kKG0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB6ID0gbTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTnVsbGlmeSBtIHNvIG9ubHkgYSBzaW5nbGUgbW9kIG9wZXJhdGlvbiBpcyBwZXJmb3JtZWQgYXQgdGhlIGVuZC5cclxuICAgICAgICAgICAgICAgICAgICBtID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChQT1dfUFJFQ0lTSU9OKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVHJ1bmNhdGluZyBlYWNoIGNvZWZmaWNpZW50IGFycmF5IHRvIGEgbGVuZ3RoIG9mIGsgYWZ0ZXIgZWFjaCBtdWx0aXBsaWNhdGlvblxyXG4gICAgICAgICAgICAgICAgLy8gZXF1YXRlcyB0byB0cnVuY2F0aW5nIHNpZ25pZmljYW50IGRpZ2l0cyB0byBQT1dfUFJFQ0lTSU9OICsgWzI4LCA0MV0sXHJcbiAgICAgICAgICAgICAgICAvLyBpLmUuIHRoZXJlIHdpbGwgYmUgYSBtaW5pbXVtIG9mIDI4IGd1YXJkIGRpZ2l0cyByZXRhaW5lZC5cclxuICAgICAgICAgICAgICAgIC8vIChVc2luZyArIDEuNSB3b3VsZCBnaXZlIFs5LCAyMV0gZ3VhcmQgZGlnaXRzLilcclxuICAgICAgICAgICAgICAgIGsgPSBtYXRoY2VpbCggUE9XX1BSRUNJU0lPTiAvIExPR19CQVNFICsgMiApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB5ID0gbmV3IEJpZ051bWJlcihPTkUpO1xyXG5cclxuICAgICAgICAgICAgZm9yICggOyA7ICkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCBpICUgMiApIHtcclxuICAgICAgICAgICAgICAgICAgICB5ID0geS50aW1lcyh4KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoICF5LmMgKSBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHkuYy5sZW5ndGggPiBrICkgeS5jLmxlbmd0aCA9IGs7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHkgPSB5Lm1vZChtKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaSA9IG1hdGhmbG9vciggaSAvIDIgKTtcclxuICAgICAgICAgICAgICAgIGlmICggIWkgKSBicmVhaztcclxuICAgICAgICAgICAgICAgIHggPSB4LnRpbWVzKHgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIHguYyAmJiB4LmMubGVuZ3RoID4gayApIHguYy5sZW5ndGggPSBrO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IHgubW9kKG0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobSkgcmV0dXJuIHk7XHJcbiAgICAgICAgICAgIGlmICggbiA8IDAgKSB5ID0gT05FLmRpdih5KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB6ID8geS5tb2QoeikgOiBrID8gcm91bmQoIHksIFBPV19QUkVDSVNJT04sIFJPVU5ESU5HX01PREUgKSA6IHk7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgcm91bmRlZCB0byBzZCBzaWduaWZpY2FudCBkaWdpdHNcclxuICAgICAgICAgKiB1c2luZyByb3VuZGluZyBtb2RlIHJtIG9yIFJPVU5ESU5HX01PREUuIElmIHNkIGlzIGxlc3MgdGhhbiB0aGUgbnVtYmVyIG9mIGRpZ2l0c1xyXG4gICAgICAgICAqIG5lY2Vzc2FyeSB0byByZXByZXNlbnQgdGhlIGludGVnZXIgcGFydCBvZiB0aGUgdmFsdWUgaW4gZml4ZWQtcG9pbnQgbm90YXRpb24sIHRoZW4gdXNlXHJcbiAgICAgICAgICogZXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBbc2RdIHtudW1iZXJ9IFNpZ25pZmljYW50IGRpZ2l0cy4gSW50ZWdlciwgMSB0byBNQVggaW5jbHVzaXZlLlxyXG4gICAgICAgICAqIFtybV0ge251bWJlcn0gUm91bmRpbmcgbW9kZS4gSW50ZWdlciwgMCB0byA4IGluY2x1c2l2ZS5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqICd0b1ByZWNpc2lvbigpIHByZWNpc2lvbiBub3QgYW4gaW50ZWdlcjoge3NkfSdcclxuICAgICAgICAgKiAndG9QcmVjaXNpb24oKSBwcmVjaXNpb24gb3V0IG9mIHJhbmdlOiB7c2R9J1xyXG4gICAgICAgICAqICd0b1ByZWNpc2lvbigpIHJvdW5kaW5nIG1vZGUgbm90IGFuIGludGVnZXI6IHtybX0nXHJcbiAgICAgICAgICogJ3RvUHJlY2lzaW9uKCkgcm91bmRpbmcgbW9kZSBvdXQgb2YgcmFuZ2U6IHtybX0nXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC50b1ByZWNpc2lvbiA9IGZ1bmN0aW9uICggc2QsIHJtICkge1xyXG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0KCB0aGlzLCBzZCAhPSBudWxsICYmIGlzVmFsaWRJbnQoIHNkLCAxLCBNQVgsIDI0LCAncHJlY2lzaW9uJyApXHJcbiAgICAgICAgICAgICAgPyBzZCB8IDAgOiBudWxsLCBybSwgMjQgKTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpbiBiYXNlIGIsIG9yIGJhc2UgMTAgaWYgYiBpc1xyXG4gICAgICAgICAqIG9taXR0ZWQuIElmIGEgYmFzZSBpcyBzcGVjaWZpZWQsIGluY2x1ZGluZyBiYXNlIDEwLCByb3VuZCBhY2NvcmRpbmcgdG8gREVDSU1BTF9QTEFDRVMgYW5kXHJcbiAgICAgICAgICogUk9VTkRJTkdfTU9ERS4gSWYgYSBiYXNlIGlzIG5vdCBzcGVjaWZpZWQsIGFuZCB0aGlzIEJpZ051bWJlciBoYXMgYSBwb3NpdGl2ZSBleHBvbmVudFxyXG4gICAgICAgICAqIHRoYXQgaXMgZXF1YWwgdG8gb3IgZ3JlYXRlciB0aGFuIFRPX0VYUF9QT1MsIG9yIGEgbmVnYXRpdmUgZXhwb25lbnQgZXF1YWwgdG8gb3IgbGVzcyB0aGFuXHJcbiAgICAgICAgICogVE9fRVhQX05FRywgcmV0dXJuIGV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogW2JdIHtudW1iZXJ9IEludGVnZXIsIDIgdG8gNjQgaW5jbHVzaXZlLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogJ3RvU3RyaW5nKCkgYmFzZSBub3QgYW4gaW50ZWdlcjoge2J9J1xyXG4gICAgICAgICAqICd0b1N0cmluZygpIGJhc2Ugb3V0IG9mIHJhbmdlOiB7Yn0nXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC50b1N0cmluZyA9IGZ1bmN0aW9uIChiKSB7XHJcbiAgICAgICAgICAgIHZhciBzdHIsXHJcbiAgICAgICAgICAgICAgICBuID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIHMgPSBuLnMsXHJcbiAgICAgICAgICAgICAgICBlID0gbi5lO1xyXG5cclxuICAgICAgICAgICAgLy8gSW5maW5pdHkgb3IgTmFOP1xyXG4gICAgICAgICAgICBpZiAoIGUgPT09IG51bGwgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHIgPSAnSW5maW5pdHknO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICggcyA8IDAgKSBzdHIgPSAnLScgKyBzdHI7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0ciA9ICdOYU4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc3RyID0gY29lZmZUb1N0cmluZyggbi5jICk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCBiID09IG51bGwgfHwgIWlzVmFsaWRJbnQoIGIsIDIsIDY0LCAyNSwgJ2Jhc2UnICkgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RyID0gZSA8PSBUT19FWFBfTkVHIHx8IGUgPj0gVE9fRVhQX1BPU1xyXG4gICAgICAgICAgICAgICAgICAgICAgPyB0b0V4cG9uZW50aWFsKCBzdHIsIGUgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgOiB0b0ZpeGVkUG9pbnQoIHN0ciwgZSApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHIgPSBjb252ZXJ0QmFzZSggdG9GaXhlZFBvaW50KCBzdHIsIGUgKSwgYiB8IDAsIDEwLCBzICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCBzIDwgMCAmJiBuLmNbMF0gKSBzdHIgPSAnLScgKyBzdHI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdHI7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgdHJ1bmNhdGVkIHRvIGEgd2hvbGVcclxuICAgICAgICAgKiBudW1iZXIuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC50cnVuY2F0ZWQgPSBQLnRydW5jID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcm91bmQoIG5ldyBCaWdOdW1iZXIodGhpcyksIHRoaXMuZSArIDEsIDEgKTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIGFzIHRvU3RyaW5nLCBidXQgZG8gbm90IGFjY2VwdCBhIGJhc2UgYXJndW1lbnQsIGFuZCBpbmNsdWRlIHRoZSBtaW51cyBzaWduIGZvclxyXG4gICAgICAgICAqIG5lZ2F0aXZlIHplcm8uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC52YWx1ZU9mID0gUC50b0pTT04gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBzdHIsXHJcbiAgICAgICAgICAgICAgICBuID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIGUgPSBuLmU7XHJcblxyXG4gICAgICAgICAgICBpZiAoIGUgPT09IG51bGwgKSByZXR1cm4gbi50b1N0cmluZygpO1xyXG5cclxuICAgICAgICAgICAgc3RyID0gY29lZmZUb1N0cmluZyggbi5jICk7XHJcblxyXG4gICAgICAgICAgICBzdHIgPSBlIDw9IFRPX0VYUF9ORUcgfHwgZSA+PSBUT19FWFBfUE9TXHJcbiAgICAgICAgICAgICAgICA/IHRvRXhwb25lbnRpYWwoIHN0ciwgZSApXHJcbiAgICAgICAgICAgICAgICA6IHRvRml4ZWRQb2ludCggc3RyLCBlICk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbi5zIDwgMCA/ICctJyArIHN0ciA6IHN0cjtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLy8gQWxpYXNlcyBmb3IgQmlnRGVjaW1hbCBtZXRob2RzLlxyXG4gICAgICAgIC8vUC5hZGQgPSBQLnBsdXM7ICAgICAgICAgLy8gUC5hZGQgaW5jbHVkZWQgYWJvdmVcclxuICAgICAgICAvL1Auc3VidHJhY3QgPSBQLm1pbnVzOyAgIC8vIFAuc3ViIGluY2x1ZGVkIGFib3ZlXHJcbiAgICAgICAgLy9QLm11bHRpcGx5ID0gUC50aW1lczsgICAvLyBQLm11bCBpbmNsdWRlZCBhYm92ZVxyXG4gICAgICAgIC8vUC5kaXZpZGUgPSBQLmRpdjtcclxuICAgICAgICAvL1AucmVtYWluZGVyID0gUC5tb2Q7XHJcbiAgICAgICAgLy9QLmNvbXBhcmVUbyA9IFAuY21wO1xyXG4gICAgICAgIC8vUC5uZWdhdGUgPSBQLm5lZztcclxuXHJcblxyXG4gICAgICAgIGlmICggY29uZmlnT2JqICE9IG51bGwgKSBCaWdOdW1iZXIuY29uZmlnKGNvbmZpZ09iaik7XHJcblxyXG4gICAgICAgIHJldHVybiBCaWdOdW1iZXI7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIFBSSVZBVEUgSEVMUEVSIEZVTkNUSU9OU1xyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBiaXRGbG9vcihuKSB7XHJcbiAgICAgICAgdmFyIGkgPSBuIHwgMDtcclxuICAgICAgICByZXR1cm4gbiA+IDAgfHwgbiA9PT0gaSA/IGkgOiBpIC0gMTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gUmV0dXJuIGEgY29lZmZpY2llbnQgYXJyYXkgYXMgYSBzdHJpbmcgb2YgYmFzZSAxMCBkaWdpdHMuXHJcbiAgICBmdW5jdGlvbiBjb2VmZlRvU3RyaW5nKGEpIHtcclxuICAgICAgICB2YXIgcywgeixcclxuICAgICAgICAgICAgaSA9IDEsXHJcbiAgICAgICAgICAgIGogPSBhLmxlbmd0aCxcclxuICAgICAgICAgICAgciA9IGFbMF0gKyAnJztcclxuXHJcbiAgICAgICAgZm9yICggOyBpIDwgajsgKSB7XHJcbiAgICAgICAgICAgIHMgPSBhW2krK10gKyAnJztcclxuICAgICAgICAgICAgeiA9IExPR19CQVNFIC0gcy5sZW5ndGg7XHJcbiAgICAgICAgICAgIGZvciAoIDsgei0tOyBzID0gJzAnICsgcyApO1xyXG4gICAgICAgICAgICByICs9IHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yICggaiA9IHIubGVuZ3RoOyByLmNoYXJDb2RlQXQoLS1qKSA9PT0gNDg7ICk7XHJcbiAgICAgICAgcmV0dXJuIHIuc2xpY2UoIDAsIGogKyAxIHx8IDEgKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gQ29tcGFyZSB0aGUgdmFsdWUgb2YgQmlnTnVtYmVycyB4IGFuZCB5LlxyXG4gICAgZnVuY3Rpb24gY29tcGFyZSggeCwgeSApIHtcclxuICAgICAgICB2YXIgYSwgYixcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIHljID0geS5jLFxyXG4gICAgICAgICAgICBpID0geC5zLFxyXG4gICAgICAgICAgICBqID0geS5zLFxyXG4gICAgICAgICAgICBrID0geC5lLFxyXG4gICAgICAgICAgICBsID0geS5lO1xyXG5cclxuICAgICAgICAvLyBFaXRoZXIgTmFOP1xyXG4gICAgICAgIGlmICggIWkgfHwgIWogKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICAgICAgYSA9IHhjICYmICF4Y1swXTtcclxuICAgICAgICBiID0geWMgJiYgIXljWzBdO1xyXG5cclxuICAgICAgICAvLyBFaXRoZXIgemVybz9cclxuICAgICAgICBpZiAoIGEgfHwgYiApIHJldHVybiBhID8gYiA/IDAgOiAtaiA6IGk7XHJcblxyXG4gICAgICAgIC8vIFNpZ25zIGRpZmZlcj9cclxuICAgICAgICBpZiAoIGkgIT0gaiApIHJldHVybiBpO1xyXG5cclxuICAgICAgICBhID0gaSA8IDA7XHJcbiAgICAgICAgYiA9IGsgPT0gbDtcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIEluZmluaXR5P1xyXG4gICAgICAgIGlmICggIXhjIHx8ICF5YyApIHJldHVybiBiID8gMCA6ICF4YyBeIGEgPyAxIDogLTE7XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgZXhwb25lbnRzLlxyXG4gICAgICAgIGlmICggIWIgKSByZXR1cm4gayA+IGwgXiBhID8gMSA6IC0xO1xyXG5cclxuICAgICAgICBqID0gKCBrID0geGMubGVuZ3RoICkgPCAoIGwgPSB5Yy5sZW5ndGggKSA/IGsgOiBsO1xyXG5cclxuICAgICAgICAvLyBDb21wYXJlIGRpZ2l0IGJ5IGRpZ2l0LlxyXG4gICAgICAgIGZvciAoIGkgPSAwOyBpIDwgajsgaSsrICkgaWYgKCB4Y1tpXSAhPSB5Y1tpXSApIHJldHVybiB4Y1tpXSA+IHljW2ldIF4gYSA/IDEgOiAtMTtcclxuXHJcbiAgICAgICAgLy8gQ29tcGFyZSBsZW5ndGhzLlxyXG4gICAgICAgIHJldHVybiBrID09IGwgPyAwIDogayA+IGwgXiBhID8gMSA6IC0xO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgbiBpcyBhIHZhbGlkIG51bWJlciBpbiByYW5nZSwgb3RoZXJ3aXNlIGZhbHNlLlxyXG4gICAgICogVXNlIGZvciBhcmd1bWVudCB2YWxpZGF0aW9uIHdoZW4gRVJST1JTIGlzIGZhbHNlLlxyXG4gICAgICogTm90ZTogcGFyc2VJbnQoJzFlKzEnKSA9PSAxIGJ1dCBwYXJzZUZsb2F0KCcxZSsxJykgPT0gMTAuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGludFZhbGlkYXRvck5vRXJyb3JzKCBuLCBtaW4sIG1heCApIHtcclxuICAgICAgICByZXR1cm4gKCBuID0gdHJ1bmNhdGUobikgKSA+PSBtaW4gJiYgbiA8PSBtYXg7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIGlzQXJyYXkob2JqKSB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0IEFycmF5XSc7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBDb252ZXJ0IHN0cmluZyBvZiBiYXNlSW4gdG8gYW4gYXJyYXkgb2YgbnVtYmVycyBvZiBiYXNlT3V0LlxyXG4gICAgICogRWcuIGNvbnZlcnRCYXNlKCcyNTUnLCAxMCwgMTYpIHJldHVybnMgWzE1LCAxNV0uXHJcbiAgICAgKiBFZy4gY29udmVydEJhc2UoJ2ZmJywgMTYsIDEwKSByZXR1cm5zIFsyLCA1LCA1XS5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gdG9CYXNlT3V0KCBzdHIsIGJhc2VJbiwgYmFzZU91dCApIHtcclxuICAgICAgICB2YXIgaixcclxuICAgICAgICAgICAgYXJyID0gWzBdLFxyXG4gICAgICAgICAgICBhcnJMLFxyXG4gICAgICAgICAgICBpID0gMCxcclxuICAgICAgICAgICAgbGVuID0gc3RyLmxlbmd0aDtcclxuXHJcbiAgICAgICAgZm9yICggOyBpIDwgbGVuOyApIHtcclxuICAgICAgICAgICAgZm9yICggYXJyTCA9IGFyci5sZW5ndGg7IGFyckwtLTsgYXJyW2FyckxdICo9IGJhc2VJbiApO1xyXG4gICAgICAgICAgICBhcnJbIGogPSAwIF0gKz0gQUxQSEFCRVQuaW5kZXhPZiggc3RyLmNoYXJBdCggaSsrICkgKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoIDsgaiA8IGFyci5sZW5ndGg7IGorKyApIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIGFycltqXSA+IGJhc2VPdXQgLSAxICkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICggYXJyW2ogKyAxXSA9PSBudWxsICkgYXJyW2ogKyAxXSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJyW2ogKyAxXSArPSBhcnJbal0gLyBiYXNlT3V0IHwgMDtcclxuICAgICAgICAgICAgICAgICAgICBhcnJbal0gJT0gYmFzZU91dDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGFyci5yZXZlcnNlKCk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIHRvRXhwb25lbnRpYWwoIHN0ciwgZSApIHtcclxuICAgICAgICByZXR1cm4gKCBzdHIubGVuZ3RoID4gMSA/IHN0ci5jaGFyQXQoMCkgKyAnLicgKyBzdHIuc2xpY2UoMSkgOiBzdHIgKSArXHJcbiAgICAgICAgICAoIGUgPCAwID8gJ2UnIDogJ2UrJyApICsgZTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgZnVuY3Rpb24gdG9GaXhlZFBvaW50KCBzdHIsIGUgKSB7XHJcbiAgICAgICAgdmFyIGxlbiwgejtcclxuXHJcbiAgICAgICAgLy8gTmVnYXRpdmUgZXhwb25lbnQ/XHJcbiAgICAgICAgaWYgKCBlIDwgMCApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFByZXBlbmQgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoIHogPSAnMC4nOyArK2U7IHogKz0gJzAnICk7XHJcbiAgICAgICAgICAgIHN0ciA9IHogKyBzdHI7XHJcblxyXG4gICAgICAgIC8vIFBvc2l0aXZlIGV4cG9uZW50XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGVuID0gc3RyLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIC8vIEFwcGVuZCB6ZXJvcy5cclxuICAgICAgICAgICAgaWYgKCArK2UgPiBsZW4gKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKCB6ID0gJzAnLCBlIC09IGxlbjsgLS1lOyB6ICs9ICcwJyApO1xyXG4gICAgICAgICAgICAgICAgc3RyICs9IHo7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIGUgPCBsZW4gKSB7XHJcbiAgICAgICAgICAgICAgICBzdHIgPSBzdHIuc2xpY2UoIDAsIGUgKSArICcuJyArIHN0ci5zbGljZShlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHN0cjtcclxuICAgIH1cclxuXHJcblxyXG4gICAgZnVuY3Rpb24gdHJ1bmNhdGUobikge1xyXG4gICAgICAgIG4gPSBwYXJzZUZsb2F0KG4pO1xyXG4gICAgICAgIHJldHVybiBuIDwgMCA/IG1hdGhjZWlsKG4pIDogbWF0aGZsb29yKG4pO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBFWFBPUlRcclxuXHJcblxyXG4gICAgQmlnTnVtYmVyID0gY29uc3RydWN0b3JGYWN0b3J5KCk7XHJcbiAgICBCaWdOdW1iZXIuZGVmYXVsdCA9IEJpZ051bWJlci5CaWdOdW1iZXIgPSBCaWdOdW1iZXI7XHJcblxyXG5cclxuICAgIC8vIEFNRC5cclxuICAgIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XHJcbiAgICAgICAgZGVmaW5lKCBmdW5jdGlvbiAoKSB7IHJldHVybiBCaWdOdW1iZXI7IH0gKTtcclxuXHJcbiAgICAvLyBOb2RlLmpzIGFuZCBvdGhlciBlbnZpcm9ubWVudHMgdGhhdCBzdXBwb3J0IG1vZHVsZS5leHBvcnRzLlxyXG4gICAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSAhPSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcclxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IEJpZ051bWJlcjtcclxuXHJcbiAgICAgICAgLy8gU3BsaXQgc3RyaW5nIHN0b3BzIGJyb3dzZXJpZnkgYWRkaW5nIGNyeXB0byBzaGltLlxyXG4gICAgICAgIGlmICggIWNyeXB0b09iaiApIHRyeSB7IGNyeXB0b09iaiA9IHJlcXVpcmUoJ2NyeScgKyAncHRvJyk7IH0gY2F0Y2ggKGUpIHt9XHJcblxyXG4gICAgLy8gQnJvd3Nlci5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKCAhZ2xvYmFsT2JqICkgZ2xvYmFsT2JqID0gdHlwZW9mIHNlbGYgIT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDogRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcclxuICAgICAgICBnbG9iYWxPYmouQmlnTnVtYmVyID0gQmlnTnVtYmVyO1xyXG4gICAgfVxyXG59KSh0aGlzKTtcclxuIiwiY29uc3QgQmlnTnVtYmVyID0gcmVxdWlyZSgnYmlnbnVtYmVyLmpzJyk7XG5cbmNsYXNzIFV0aWxzIHtcblxuICBzdGF0aWMgaXNOdW0obnVtKSB7XG4gICAgcmV0dXJuICEoXy5pc051bGwobnVtKSkgJiYgXy5pc051bWJlcihudW0pO1xuICB9XG5cbiAgc3RhdGljIGlzQXJyKGFycikge1xuICAgIHJldHVybiAhKF8uaXNOdWxsKGFycikpICYmIF8uaXNBcnJheShhcnIpO1xuICB9XG5cbiAgc3RhdGljIGlzQXJyT2ZOdW1zKGFycikge1xuICAgIHJldHVybiB0aGlzLmlzQXJyKGFycikgJiYgXy5ldmVyeShhcnIsIG4gPT4gXy5pc0Zpbml0ZShuKSk7XG4gIH1cblxuICBzdGF0aWMgZ2V0U3VwZXJzY3JpcHQoaWQpIHtcbiAgICBjb25zdCBzdXBlcnNjcmlwdCA9IFs4MzA0LCAxODUsIDE3OCwgMTc5LCA4MzA4LCA4MzA5LCA4MzEwLCA4MzExLCA4MzEyLCA4MzEzXTsgLy8gJ+KBsMK5wrLCs+KBtOKBteKBtuKBt+KBuOKBuSdcbiAgICBsZXQgc3MgPSAnJztcbiAgICB3aGlsZSAoaWQgPiAwKSB7XG4gICAgICBjb25zdCBkaWdpdCA9IGlkICUgMTA7XG4gICAgICBzcyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoc3VwZXJzY3JpcHRbaWQgJSAxMF0pICsgc3M7XG4gICAgICBpZCA9IChpZCAtIGRpZ2l0KSAvIDEwO1xuICAgIH1cbiAgICByZXR1cm4gc3M7XG4gIH1cblxuICBzdGF0aWMgZ2V0Rm9ybWF0dGVkTnVtKG51bSwgZGVjaW1hbHMsIHByZWZpeCA9ICcnLCBzdWZmaXggPSAnJykge1xuICAgIHJldHVybiBwcmVmaXggKyAobmV3IEJpZ051bWJlcihudW0pKS50b0Zvcm1hdChkZWNpbWFscykgKyBzdWZmaXg7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBVdGlscztcbiJdfQ==

//# sourceMappingURL=../utils/Utils.es6.js.map