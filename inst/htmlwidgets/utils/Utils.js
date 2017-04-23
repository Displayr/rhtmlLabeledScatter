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
    return num != null && typeof num === 'number';
  };

  Utils.isArr = function isArr(arr) {
    return arr != null && arr instanceof Array;
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

  Utils.getFormattedNum = function getFormattedNum(num, decimals, prefix, suffix) {
    return prefix + new BigNumber(num).toFormat(decimals) + suffix;
  };

  return Utils;
}();

module.exports = Utils;

},{"bignumber.js":1}]},{},[2])(2)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmlnbnVtYmVyLmpzL2JpZ251bWJlci5qcyIsInRoZVNyYy9zY3JpcHRzL3V0aWxzL1V0aWxzLmVzNi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ2pyRkEsSUFBTSxZQUFZLFFBQVEsY0FBUixDQUFsQjs7SUFFTSxLOzs7OztRQUVHLEssa0JBQU0sRyxFQUFLO0FBQ2hCLFdBQVEsT0FBTyxJQUFSLElBQWtCLE9BQU8sR0FBUCxLQUFlLFFBQXhDO0FBQ0QsRzs7UUFFTSxLLGtCQUFNLEcsRUFBSztBQUNoQixXQUFRLE9BQU8sSUFBUixJQUFpQixlQUFlLEtBQXZDO0FBQ0QsRzs7UUFFTSxXLHdCQUFZLEcsRUFBSztBQUN0QixXQUFPLEtBQUssS0FBTCxDQUFXLEdBQVgsS0FBbUIsRUFBRSxLQUFGLENBQVEsR0FBUixFQUFhO0FBQUEsYUFBSyxFQUFFLFFBQUYsQ0FBVyxDQUFYLENBQUw7QUFBQSxLQUFiLENBQTFCO0FBQ0QsRzs7UUFFTSxjLDJCQUFlLEUsRUFBSTtBQUN4QixRQUFNLGNBQWMsQ0FBQyxJQUFELEVBQU8sR0FBUCxFQUFZLEdBQVosRUFBaUIsR0FBakIsRUFBc0IsSUFBdEIsRUFBNEIsSUFBNUIsRUFBa0MsSUFBbEMsRUFBd0MsSUFBeEMsRUFBOEMsSUFBOUMsRUFBb0QsSUFBcEQsQ0FBcEIsQ0FEd0IsQ0FDdUQ7QUFDL0UsUUFBSSxLQUFLLEVBQVQ7QUFDQSxXQUFPLEtBQUssQ0FBWixFQUFlO0FBQ2IsVUFBTSxRQUFRLEtBQUssRUFBbkI7QUFDQSxXQUFLLE9BQU8sWUFBUCxDQUFvQixZQUFZLEtBQUssRUFBakIsQ0FBcEIsSUFBNEMsRUFBakQ7QUFDQSxXQUFLLENBQUMsS0FBSyxLQUFOLElBQWUsRUFBcEI7QUFDRDtBQUNELFdBQU8sRUFBUDtBQUNELEc7O1FBRU0sZSw0QkFBZ0IsRyxFQUFLLFEsRUFBVSxNLEVBQVEsTSxFQUFRO0FBQ3BELFdBQU8sU0FBVSxJQUFJLFNBQUosQ0FBYyxHQUFkLENBQUQsQ0FBcUIsUUFBckIsQ0FBOEIsUUFBOUIsQ0FBVCxHQUFtRCxNQUExRDtBQUNELEc7Ozs7O0FBR0gsT0FBTyxPQUFQLEdBQWlCLEtBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qISBiaWdudW1iZXIuanMgdjIuNC4wIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWtlTWNsL2JpZ251bWJlci5qcy9MSUNFTkNFICovXHJcblxyXG47KGZ1bmN0aW9uIChnbG9iYWxPYmopIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAvKlxyXG4gICAgICBiaWdudW1iZXIuanMgdjIuNC4wXHJcbiAgICAgIEEgSmF2YVNjcmlwdCBsaWJyYXJ5IGZvciBhcmJpdHJhcnktcHJlY2lzaW9uIGFyaXRobWV0aWMuXHJcbiAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWtlTWNsL2JpZ251bWJlci5qc1xyXG4gICAgICBDb3B5cmlnaHQgKGMpIDIwMTYgTWljaGFlbCBNY2xhdWdobGluIDxNOGNoODhsQGdtYWlsLmNvbT5cclxuICAgICAgTUlUIEV4cGF0IExpY2VuY2VcclxuICAgICovXHJcblxyXG5cclxuICAgIHZhciBCaWdOdW1iZXIsIGNyeXB0b09iaiwgcGFyc2VOdW1lcmljLFxyXG4gICAgICAgIGlzTnVtZXJpYyA9IC9eLT8oXFxkKyhcXC5cXGQqKT98XFwuXFxkKykoZVsrLV0/XFxkKyk/JC9pLFxyXG4gICAgICAgIG1hdGhjZWlsID0gTWF0aC5jZWlsLFxyXG4gICAgICAgIG1hdGhmbG9vciA9IE1hdGguZmxvb3IsXHJcbiAgICAgICAgbm90Qm9vbCA9ICcgbm90IGEgYm9vbGVhbiBvciBiaW5hcnkgZGlnaXQnLFxyXG4gICAgICAgIHJvdW5kaW5nTW9kZSA9ICdyb3VuZGluZyBtb2RlJyxcclxuICAgICAgICB0b29NYW55RGlnaXRzID0gJ251bWJlciB0eXBlIGhhcyBtb3JlIHRoYW4gMTUgc2lnbmlmaWNhbnQgZGlnaXRzJyxcclxuICAgICAgICBBTFBIQUJFVCA9ICcwMTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWiRfJyxcclxuICAgICAgICBCQVNFID0gMWUxNCxcclxuICAgICAgICBMT0dfQkFTRSA9IDE0LFxyXG4gICAgICAgIE1BWF9TQUZFX0lOVEVHRVIgPSAweDFmZmZmZmZmZmZmZmZmLCAgICAgICAgIC8vIDJeNTMgLSAxXHJcbiAgICAgICAgLy8gTUFYX0lOVDMyID0gMHg3ZmZmZmZmZiwgICAgICAgICAgICAgICAgICAgLy8gMl4zMSAtIDFcclxuICAgICAgICBQT1dTX1RFTiA9IFsxLCAxMCwgMTAwLCAxZTMsIDFlNCwgMWU1LCAxZTYsIDFlNywgMWU4LCAxZTksIDFlMTAsIDFlMTEsIDFlMTIsIDFlMTNdLFxyXG4gICAgICAgIFNRUlRfQkFTRSA9IDFlNyxcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgbGltaXQgb24gdGhlIHZhbHVlIG9mIERFQ0lNQUxfUExBQ0VTLCBUT19FWFBfTkVHLCBUT19FWFBfUE9TLCBNSU5fRVhQLCBNQVhfRVhQLCBhbmRcclxuICAgICAgICAgKiB0aGUgYXJndW1lbnRzIHRvIHRvRXhwb25lbnRpYWwsIHRvRml4ZWQsIHRvRm9ybWF0LCBhbmQgdG9QcmVjaXNpb24sIGJleW9uZCB3aGljaCBhblxyXG4gICAgICAgICAqIGV4Y2VwdGlvbiBpcyB0aHJvd24gKGlmIEVSUk9SUyBpcyB0cnVlKS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBNQVggPSAxRTk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIE1BWF9JTlQzMlxyXG5cclxuICAgIGlmICggdHlwZW9mIGNyeXB0byAhPSAndW5kZWZpbmVkJyApIGNyeXB0b09iaiA9IGNyeXB0bztcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIENyZWF0ZSBhbmQgcmV0dXJuIGEgQmlnTnVtYmVyIGNvbnN0cnVjdG9yLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBjb25zdHJ1Y3RvckZhY3RvcnkoY29uZmlnT2JqKSB7XHJcbiAgICAgICAgdmFyIGRpdixcclxuXHJcbiAgICAgICAgICAgIC8vIGlkIHRyYWNrcyB0aGUgY2FsbGVyIGZ1bmN0aW9uLCBzbyBpdHMgbmFtZSBjYW4gYmUgaW5jbHVkZWQgaW4gZXJyb3IgbWVzc2FnZXMuXHJcbiAgICAgICAgICAgIGlkID0gMCxcclxuICAgICAgICAgICAgUCA9IEJpZ051bWJlci5wcm90b3R5cGUsXHJcbiAgICAgICAgICAgIE9ORSA9IG5ldyBCaWdOdW1iZXIoMSksXHJcblxyXG5cclxuICAgICAgICAgICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBFRElUQUJMRSBERUZBVUxUUyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIFRoZSBkZWZhdWx0IHZhbHVlcyBiZWxvdyBtdXN0IGJlIGludGVnZXJzIHdpdGhpbiB0aGUgaW5jbHVzaXZlIHJhbmdlcyBzdGF0ZWQuXHJcbiAgICAgICAgICAgICAqIFRoZSB2YWx1ZXMgY2FuIGFsc28gYmUgY2hhbmdlZCBhdCBydW4tdGltZSB1c2luZyBCaWdOdW1iZXIuY29uZmlnLlxyXG4gICAgICAgICAgICAgKi9cclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBtYXhpbXVtIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyBmb3Igb3BlcmF0aW9ucyBpbnZvbHZpbmcgZGl2aXNpb24uXHJcbiAgICAgICAgICAgIERFQ0lNQUxfUExBQ0VTID0gMjAsICAgICAgICAgICAgICAgICAgICAgLy8gMCB0byBNQVhcclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIFRoZSByb3VuZGluZyBtb2RlIHVzZWQgd2hlbiByb3VuZGluZyB0byB0aGUgYWJvdmUgZGVjaW1hbCBwbGFjZXMsIGFuZCB3aGVuIHVzaW5nXHJcbiAgICAgICAgICAgICAqIHRvRXhwb25lbnRpYWwsIHRvRml4ZWQsIHRvRm9ybWF0IGFuZCB0b1ByZWNpc2lvbiwgYW5kIHJvdW5kIChkZWZhdWx0IHZhbHVlKS5cclxuICAgICAgICAgICAgICogVVAgICAgICAgICAwIEF3YXkgZnJvbSB6ZXJvLlxyXG4gICAgICAgICAgICAgKiBET1dOICAgICAgIDEgVG93YXJkcyB6ZXJvLlxyXG4gICAgICAgICAgICAgKiBDRUlMICAgICAgIDIgVG93YXJkcyArSW5maW5pdHkuXHJcbiAgICAgICAgICAgICAqIEZMT09SICAgICAgMyBUb3dhcmRzIC1JbmZpbml0eS5cclxuICAgICAgICAgICAgICogSEFMRl9VUCAgICA0IFRvd2FyZHMgbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCB1cC5cclxuICAgICAgICAgICAgICogSEFMRl9ET1dOICA1IFRvd2FyZHMgbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCBkb3duLlxyXG4gICAgICAgICAgICAgKiBIQUxGX0VWRU4gIDYgVG93YXJkcyBuZWFyZXN0IG5laWdoYm91ci4gSWYgZXF1aWRpc3RhbnQsIHRvd2FyZHMgZXZlbiBuZWlnaGJvdXIuXHJcbiAgICAgICAgICAgICAqIEhBTEZfQ0VJTCAgNyBUb3dhcmRzIG5lYXJlc3QgbmVpZ2hib3VyLiBJZiBlcXVpZGlzdGFudCwgdG93YXJkcyArSW5maW5pdHkuXHJcbiAgICAgICAgICAgICAqIEhBTEZfRkxPT1IgOCBUb3dhcmRzIG5lYXJlc3QgbmVpZ2hib3VyLiBJZiBlcXVpZGlzdGFudCwgdG93YXJkcyAtSW5maW5pdHkuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBST1VORElOR19NT0RFID0gNCwgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gOFxyXG5cclxuICAgICAgICAgICAgLy8gRVhQT05FTlRJQUxfQVQgOiBbVE9fRVhQX05FRyAsIFRPX0VYUF9QT1NdXHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgZXhwb25lbnQgdmFsdWUgYXQgYW5kIGJlbmVhdGggd2hpY2ggdG9TdHJpbmcgcmV0dXJucyBleHBvbmVudGlhbCBub3RhdGlvbi5cclxuICAgICAgICAgICAgLy8gTnVtYmVyIHR5cGU6IC03XHJcbiAgICAgICAgICAgIFRPX0VYUF9ORUcgPSAtNywgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMCB0byAtTUFYXHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgZXhwb25lbnQgdmFsdWUgYXQgYW5kIGFib3ZlIHdoaWNoIHRvU3RyaW5nIHJldHVybnMgZXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgICAgICAgIC8vIE51bWJlciB0eXBlOiAyMVxyXG4gICAgICAgICAgICBUT19FWFBfUE9TID0gMjEsICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gTUFYXHJcblxyXG4gICAgICAgICAgICAvLyBSQU5HRSA6IFtNSU5fRVhQLCBNQVhfRVhQXVxyXG5cclxuICAgICAgICAgICAgLy8gVGhlIG1pbmltdW0gZXhwb25lbnQgdmFsdWUsIGJlbmVhdGggd2hpY2ggdW5kZXJmbG93IHRvIHplcm8gb2NjdXJzLlxyXG4gICAgICAgICAgICAvLyBOdW1iZXIgdHlwZTogLTMyNCAgKDVlLTMyNClcclxuICAgICAgICAgICAgTUlOX0VYUCA9IC0xZTcsICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAtMSB0byAtTUFYXHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgbWF4aW11bSBleHBvbmVudCB2YWx1ZSwgYWJvdmUgd2hpY2ggb3ZlcmZsb3cgdG8gSW5maW5pdHkgb2NjdXJzLlxyXG4gICAgICAgICAgICAvLyBOdW1iZXIgdHlwZTogIDMwOCAgKDEuNzk3NjkzMTM0ODYyMzE1N2UrMzA4KVxyXG4gICAgICAgICAgICAvLyBGb3IgTUFYX0VYUCA+IDFlNywgZS5nLiBuZXcgQmlnTnVtYmVyKCcxZTEwMDAwMDAwMCcpLnBsdXMoMSkgbWF5IGJlIHNsb3cuXHJcbiAgICAgICAgICAgIE1BWF9FWFAgPSAxZTcsICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMSB0byBNQVhcclxuXHJcbiAgICAgICAgICAgIC8vIFdoZXRoZXIgQmlnTnVtYmVyIEVycm9ycyBhcmUgZXZlciB0aHJvd24uXHJcbiAgICAgICAgICAgIEVSUk9SUyA9IHRydWUsICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdHJ1ZSBvciBmYWxzZVxyXG5cclxuICAgICAgICAgICAgLy8gQ2hhbmdlIHRvIGludFZhbGlkYXRvck5vRXJyb3JzIGlmIEVSUk9SUyBpcyBmYWxzZS5cclxuICAgICAgICAgICAgaXNWYWxpZEludCA9IGludFZhbGlkYXRvcldpdGhFcnJvcnMsICAgICAvLyBpbnRWYWxpZGF0b3JXaXRoRXJyb3JzL2ludFZhbGlkYXRvck5vRXJyb3JzXHJcblxyXG4gICAgICAgICAgICAvLyBXaGV0aGVyIHRvIHVzZSBjcnlwdG9ncmFwaGljYWxseS1zZWN1cmUgcmFuZG9tIG51bWJlciBnZW5lcmF0aW9uLCBpZiBhdmFpbGFibGUuXHJcbiAgICAgICAgICAgIENSWVBUTyA9IGZhbHNlLCAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdHJ1ZSBvciBmYWxzZVxyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogVGhlIG1vZHVsbyBtb2RlIHVzZWQgd2hlbiBjYWxjdWxhdGluZyB0aGUgbW9kdWx1czogYSBtb2Qgbi5cclxuICAgICAgICAgICAgICogVGhlIHF1b3RpZW50IChxID0gYSAvIG4pIGlzIGNhbGN1bGF0ZWQgYWNjb3JkaW5nIHRvIHRoZSBjb3JyZXNwb25kaW5nIHJvdW5kaW5nIG1vZGUuXHJcbiAgICAgICAgICAgICAqIFRoZSByZW1haW5kZXIgKHIpIGlzIGNhbGN1bGF0ZWQgYXM6IHIgPSBhIC0gbiAqIHEuXHJcbiAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAqIFVQICAgICAgICAwIFRoZSByZW1haW5kZXIgaXMgcG9zaXRpdmUgaWYgdGhlIGRpdmlkZW5kIGlzIG5lZ2F0aXZlLCBlbHNlIGlzIG5lZ2F0aXZlLlxyXG4gICAgICAgICAgICAgKiBET1dOICAgICAgMSBUaGUgcmVtYWluZGVyIGhhcyB0aGUgc2FtZSBzaWduIGFzIHRoZSBkaXZpZGVuZC5cclxuICAgICAgICAgICAgICogICAgICAgICAgICAgVGhpcyBtb2R1bG8gbW9kZSBpcyBjb21tb25seSBrbm93biBhcyAndHJ1bmNhdGVkIGRpdmlzaW9uJyBhbmQgaXNcclxuICAgICAgICAgICAgICogICAgICAgICAgICAgZXF1aXZhbGVudCB0byAoYSAlIG4pIGluIEphdmFTY3JpcHQuXHJcbiAgICAgICAgICAgICAqIEZMT09SICAgICAzIFRoZSByZW1haW5kZXIgaGFzIHRoZSBzYW1lIHNpZ24gYXMgdGhlIGRpdmlzb3IgKFB5dGhvbiAlKS5cclxuICAgICAgICAgICAgICogSEFMRl9FVkVOIDYgVGhpcyBtb2R1bG8gbW9kZSBpbXBsZW1lbnRzIHRoZSBJRUVFIDc1NCByZW1haW5kZXIgZnVuY3Rpb24uXHJcbiAgICAgICAgICAgICAqIEVVQ0xJRCAgICA5IEV1Y2xpZGlhbiBkaXZpc2lvbi4gcSA9IHNpZ24obikgKiBmbG9vcihhIC8gYWJzKG4pKS5cclxuICAgICAgICAgICAgICogICAgICAgICAgICAgVGhlIHJlbWFpbmRlciBpcyBhbHdheXMgcG9zaXRpdmUuXHJcbiAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAqIFRoZSB0cnVuY2F0ZWQgZGl2aXNpb24sIGZsb29yZWQgZGl2aXNpb24sIEV1Y2xpZGlhbiBkaXZpc2lvbiBhbmQgSUVFRSA3NTQgcmVtYWluZGVyXHJcbiAgICAgICAgICAgICAqIG1vZGVzIGFyZSBjb21tb25seSB1c2VkIGZvciB0aGUgbW9kdWx1cyBvcGVyYXRpb24uXHJcbiAgICAgICAgICAgICAqIEFsdGhvdWdoIHRoZSBvdGhlciByb3VuZGluZyBtb2RlcyBjYW4gYWxzbyBiZSB1c2VkLCB0aGV5IG1heSBub3QgZ2l2ZSB1c2VmdWwgcmVzdWx0cy5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIE1PRFVMT19NT0RFID0gMSwgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMCB0byA5XHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgbWF4aW11bSBudW1iZXIgb2Ygc2lnbmlmaWNhbnQgZGlnaXRzIG9mIHRoZSByZXN1bHQgb2YgdGhlIHRvUG93ZXIgb3BlcmF0aW9uLlxyXG4gICAgICAgICAgICAvLyBJZiBQT1dfUFJFQ0lTSU9OIGlzIDAsIHRoZXJlIHdpbGwgYmUgdW5saW1pdGVkIHNpZ25pZmljYW50IGRpZ2l0cy5cclxuICAgICAgICAgICAgUE9XX1BSRUNJU0lPTiA9IDEwMCwgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIE1BWFxyXG5cclxuICAgICAgICAgICAgLy8gVGhlIGZvcm1hdCBzcGVjaWZpY2F0aW9uIHVzZWQgYnkgdGhlIEJpZ051bWJlci5wcm90b3R5cGUudG9Gb3JtYXQgbWV0aG9kLlxyXG4gICAgICAgICAgICBGT1JNQVQgPSB7XHJcbiAgICAgICAgICAgICAgICBkZWNpbWFsU2VwYXJhdG9yOiAnLicsXHJcbiAgICAgICAgICAgICAgICBncm91cFNlcGFyYXRvcjogJywnLFxyXG4gICAgICAgICAgICAgICAgZ3JvdXBTaXplOiAzLFxyXG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5R3JvdXBTaXplOiAwLFxyXG4gICAgICAgICAgICAgICAgZnJhY3Rpb25Hcm91cFNlcGFyYXRvcjogJ1xceEEwJywgICAgICAvLyBub24tYnJlYWtpbmcgc3BhY2VcclxuICAgICAgICAgICAgICAgIGZyYWN0aW9uR3JvdXBTaXplOiAwXHJcbiAgICAgICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuXHJcbiAgICAgICAgLy8gQ09OU1RSVUNUT1JcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIEJpZ051bWJlciBjb25zdHJ1Y3RvciBhbmQgZXhwb3J0ZWQgZnVuY3Rpb24uXHJcbiAgICAgICAgICogQ3JlYXRlIGFuZCByZXR1cm4gYSBuZXcgaW5zdGFuY2Ugb2YgYSBCaWdOdW1iZXIgb2JqZWN0LlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogbiB7bnVtYmVyfHN0cmluZ3xCaWdOdW1iZXJ9IEEgbnVtZXJpYyB2YWx1ZS5cclxuICAgICAgICAgKiBbYl0ge251bWJlcn0gVGhlIGJhc2Ugb2Ygbi4gSW50ZWdlciwgMiB0byA2NCBpbmNsdXNpdmUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gQmlnTnVtYmVyKCBuLCBiICkge1xyXG4gICAgICAgICAgICB2YXIgYywgZSwgaSwgbnVtLCBsZW4sIHN0cixcclxuICAgICAgICAgICAgICAgIHggPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgLy8gRW5hYmxlIGNvbnN0cnVjdG9yIHVzYWdlIHdpdGhvdXQgbmV3LlxyXG4gICAgICAgICAgICBpZiAoICEoIHggaW5zdGFuY2VvZiBCaWdOdW1iZXIgKSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyAnQmlnTnVtYmVyKCkgY29uc3RydWN0b3IgY2FsbCB3aXRob3V0IG5ldzoge259J1xyXG4gICAgICAgICAgICAgICAgaWYgKEVSUk9SUykgcmFpc2UoIDI2LCAnY29uc3RydWN0b3IgY2FsbCB3aXRob3V0IG5ldycsIG4gKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQmlnTnVtYmVyKCBuLCBiICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vICduZXcgQmlnTnVtYmVyKCkgYmFzZSBub3QgYW4gaW50ZWdlcjoge2J9J1xyXG4gICAgICAgICAgICAvLyAnbmV3IEJpZ051bWJlcigpIGJhc2Ugb3V0IG9mIHJhbmdlOiB7Yn0nXHJcbiAgICAgICAgICAgIGlmICggYiA9PSBudWxsIHx8ICFpc1ZhbGlkSW50KCBiLCAyLCA2NCwgaWQsICdiYXNlJyApICkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIER1cGxpY2F0ZS5cclxuICAgICAgICAgICAgICAgIGlmICggbiBpbnN0YW5jZW9mIEJpZ051bWJlciApIHtcclxuICAgICAgICAgICAgICAgICAgICB4LnMgPSBuLnM7XHJcbiAgICAgICAgICAgICAgICAgICAgeC5lID0gbi5lO1xyXG4gICAgICAgICAgICAgICAgICAgIHguYyA9ICggbiA9IG4uYyApID8gbi5zbGljZSgpIDogbjtcclxuICAgICAgICAgICAgICAgICAgICBpZCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICggKCBudW0gPSB0eXBlb2YgbiA9PSAnbnVtYmVyJyApICYmIG4gKiAwID09IDAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeC5zID0gMSAvIG4gPCAwID8gKCBuID0gLW4sIC0xICkgOiAxO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBGYXN0IHBhdGggZm9yIGludGVnZXJzLlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICggbiA9PT0gfn5uICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCBlID0gMCwgaSA9IG47IGkgPj0gMTA7IGkgLz0gMTAsIGUrKyApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4LmUgPSBlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4LmMgPSBbbl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc3RyID0gbiArICcnO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoICFpc051bWVyaWMudGVzdCggc3RyID0gbiArICcnICkgKSByZXR1cm4gcGFyc2VOdW1lcmljKCB4LCBzdHIsIG51bSApO1xyXG4gICAgICAgICAgICAgICAgICAgIHgucyA9IHN0ci5jaGFyQ29kZUF0KDApID09PSA0NSA/ICggc3RyID0gc3RyLnNsaWNlKDEpLCAtMSApIDogMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGIgPSBiIHwgMDtcclxuICAgICAgICAgICAgICAgIHN0ciA9IG4gKyAnJztcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBFbnN1cmUgcmV0dXJuIHZhbHVlIGlzIHJvdW5kZWQgdG8gREVDSU1BTF9QTEFDRVMgYXMgd2l0aCBvdGhlciBiYXNlcy5cclxuICAgICAgICAgICAgICAgIC8vIEFsbG93IGV4cG9uZW50aWFsIG5vdGF0aW9uIHRvIGJlIHVzZWQgd2l0aCBiYXNlIDEwIGFyZ3VtZW50LlxyXG4gICAgICAgICAgICAgICAgaWYgKCBiID09IDEwICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSBuZXcgQmlnTnVtYmVyKCBuIGluc3RhbmNlb2YgQmlnTnVtYmVyID8gbiA6IHN0ciApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByb3VuZCggeCwgREVDSU1BTF9QTEFDRVMgKyB4LmUgKyAxLCBST1VORElOR19NT0RFICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQXZvaWQgcG90ZW50aWFsIGludGVycHJldGF0aW9uIG9mIEluZmluaXR5IGFuZCBOYU4gYXMgYmFzZSA0NCsgdmFsdWVzLlxyXG4gICAgICAgICAgICAgICAgLy8gQW55IG51bWJlciBpbiBleHBvbmVudGlhbCBmb3JtIHdpbGwgZmFpbCBkdWUgdG8gdGhlIFtFZV1bKy1dLlxyXG4gICAgICAgICAgICAgICAgaWYgKCAoIG51bSA9IHR5cGVvZiBuID09ICdudW1iZXInICkgJiYgbiAqIDAgIT0gMCB8fFxyXG4gICAgICAgICAgICAgICAgICAhKCBuZXcgUmVnRXhwKCAnXi0/JyArICggYyA9ICdbJyArIEFMUEhBQkVULnNsaWNlKCAwLCBiICkgKyAnXSsnICkgK1xyXG4gICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLicgKyBjICsgJyk/JCcsYiA8IDM3ID8gJ2knIDogJycgKSApLnRlc3Qoc3RyKSApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VOdW1lcmljKCB4LCBzdHIsIG51bSwgYiApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChudW0pIHtcclxuICAgICAgICAgICAgICAgICAgICB4LnMgPSAxIC8gbiA8IDAgPyAoIHN0ciA9IHN0ci5zbGljZSgxKSwgLTEgKSA6IDE7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICggRVJST1JTICYmIHN0ci5yZXBsYWNlKCAvXjBcXC4wKnxcXC4vLCAnJyApLmxlbmd0aCA+IDE1ICkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJ25ldyBCaWdOdW1iZXIoKSBudW1iZXIgdHlwZSBoYXMgbW9yZSB0aGFuIDE1IHNpZ25pZmljYW50IGRpZ2l0czoge259J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByYWlzZSggaWQsIHRvb01hbnlEaWdpdHMsIG4gKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFByZXZlbnQgbGF0ZXIgY2hlY2sgZm9yIGxlbmd0aCBvbiBjb252ZXJ0ZWQgbnVtYmVyLlxyXG4gICAgICAgICAgICAgICAgICAgIG51bSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB4LnMgPSBzdHIuY2hhckNvZGVBdCgwKSA9PT0gNDUgPyAoIHN0ciA9IHN0ci5zbGljZSgxKSwgLTEgKSA6IDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgc3RyID0gY29udmVydEJhc2UoIHN0ciwgMTAsIGIsIHgucyApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBEZWNpbWFsIHBvaW50P1xyXG4gICAgICAgICAgICBpZiAoICggZSA9IHN0ci5pbmRleE9mKCcuJykgKSA+IC0xICkgc3RyID0gc3RyLnJlcGxhY2UoICcuJywgJycgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEV4cG9uZW50aWFsIGZvcm0/XHJcbiAgICAgICAgICAgIGlmICggKCBpID0gc3RyLnNlYXJjaCggL2UvaSApICkgPiAwICkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIERldGVybWluZSBleHBvbmVudC5cclxuICAgICAgICAgICAgICAgIGlmICggZSA8IDAgKSBlID0gaTtcclxuICAgICAgICAgICAgICAgIGUgKz0gK3N0ci5zbGljZSggaSArIDEgKTtcclxuICAgICAgICAgICAgICAgIHN0ciA9IHN0ci5zdWJzdHJpbmcoIDAsIGkgKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICggZSA8IDAgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gSW50ZWdlci5cclxuICAgICAgICAgICAgICAgIGUgPSBzdHIubGVuZ3RoO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgbGVhZGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yICggaSA9IDA7IHN0ci5jaGFyQ29kZUF0KGkpID09PSA0ODsgaSsrICk7XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoIGxlbiA9IHN0ci5sZW5ndGg7IHN0ci5jaGFyQ29kZUF0KC0tbGVuKSA9PT0gNDg7ICk7XHJcbiAgICAgICAgICAgIHN0ciA9IHN0ci5zbGljZSggaSwgbGVuICsgMSApO1xyXG5cclxuICAgICAgICAgICAgaWYgKHN0cikge1xyXG4gICAgICAgICAgICAgICAgbGVuID0gc3RyLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBEaXNhbGxvdyBudW1iZXJzIHdpdGggb3ZlciAxNSBzaWduaWZpY2FudCBkaWdpdHMgaWYgbnVtYmVyIHR5cGUuXHJcbiAgICAgICAgICAgICAgICAvLyAnbmV3IEJpZ051bWJlcigpIG51bWJlciB0eXBlIGhhcyBtb3JlIHRoYW4gMTUgc2lnbmlmaWNhbnQgZGlnaXRzOiB7bn0nXHJcbiAgICAgICAgICAgICAgICBpZiAoIG51bSAmJiBFUlJPUlMgJiYgbGVuID4gMTUgJiYgKCBuID4gTUFYX1NBRkVfSU5URUdFUiB8fCBuICE9PSBtYXRoZmxvb3IobikgKSApIHtcclxuICAgICAgICAgICAgICAgICAgICByYWlzZSggaWQsIHRvb01hbnlEaWdpdHMsIHgucyAqIG4gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBlID0gZSAtIGkgLSAxO1xyXG5cclxuICAgICAgICAgICAgICAgICAvLyBPdmVyZmxvdz9cclxuICAgICAgICAgICAgICAgIGlmICggZSA+IE1BWF9FWFAgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEluZmluaXR5LlxyXG4gICAgICAgICAgICAgICAgICAgIHguYyA9IHguZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVW5kZXJmbG93P1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICggZSA8IE1JTl9FWFAgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFplcm8uXHJcbiAgICAgICAgICAgICAgICAgICAgeC5jID0gWyB4LmUgPSAwIF07XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHguZSA9IGU7XHJcbiAgICAgICAgICAgICAgICAgICAgeC5jID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRyYW5zZm9ybSBiYXNlXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGUgaXMgdGhlIGJhc2UgMTAgZXhwb25lbnQuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaSBpcyB3aGVyZSB0byBzbGljZSBzdHIgdG8gZ2V0IHRoZSBmaXJzdCBlbGVtZW50IG9mIHRoZSBjb2VmZmljaWVudCBhcnJheS5cclxuICAgICAgICAgICAgICAgICAgICBpID0gKCBlICsgMSApICUgTE9HX0JBU0U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBlIDwgMCApIGkgKz0gTE9HX0JBU0U7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICggaSA8IGxlbiApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGkpIHguYy5wdXNoKCArc3RyLnNsaWNlKCAwLCBpICkgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIGxlbiAtPSBMT0dfQkFTRTsgaSA8IGxlbjsgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4LmMucHVzaCggK3N0ci5zbGljZSggaSwgaSArPSBMT0dfQkFTRSApICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ciA9IHN0ci5zbGljZShpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSA9IExPR19CQVNFIC0gc3RyLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpIC09IGxlbjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoIDsgaS0tOyBzdHIgKz0gJzAnICk7XHJcbiAgICAgICAgICAgICAgICAgICAgeC5jLnB1c2goICtzdHIgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBaZXJvLlxyXG4gICAgICAgICAgICAgICAgeC5jID0gWyB4LmUgPSAwIF07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlkID0gMDtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvLyBDT05TVFJVQ1RPUiBQUk9QRVJUSUVTXHJcblxyXG5cclxuICAgICAgICBCaWdOdW1iZXIuYW5vdGhlciA9IGNvbnN0cnVjdG9yRmFjdG9yeTtcclxuXHJcbiAgICAgICAgQmlnTnVtYmVyLlJPVU5EX1VQID0gMDtcclxuICAgICAgICBCaWdOdW1iZXIuUk9VTkRfRE9XTiA9IDE7XHJcbiAgICAgICAgQmlnTnVtYmVyLlJPVU5EX0NFSUwgPSAyO1xyXG4gICAgICAgIEJpZ051bWJlci5ST1VORF9GTE9PUiA9IDM7XHJcbiAgICAgICAgQmlnTnVtYmVyLlJPVU5EX0hBTEZfVVAgPSA0O1xyXG4gICAgICAgIEJpZ051bWJlci5ST1VORF9IQUxGX0RPV04gPSA1O1xyXG4gICAgICAgIEJpZ051bWJlci5ST1VORF9IQUxGX0VWRU4gPSA2O1xyXG4gICAgICAgIEJpZ051bWJlci5ST1VORF9IQUxGX0NFSUwgPSA3O1xyXG4gICAgICAgIEJpZ051bWJlci5ST1VORF9IQUxGX0ZMT09SID0gODtcclxuICAgICAgICBCaWdOdW1iZXIuRVVDTElEID0gOTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogQ29uZmlndXJlIGluZnJlcXVlbnRseS1jaGFuZ2luZyBsaWJyYXJ5LXdpZGUgc2V0dGluZ3MuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBBY2NlcHQgYW4gb2JqZWN0IG9yIGFuIGFyZ3VtZW50IGxpc3QsIHdpdGggb25lIG9yIG1hbnkgb2YgdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzIG9yXHJcbiAgICAgICAgICogcGFyYW1ldGVycyByZXNwZWN0aXZlbHk6XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiAgIERFQ0lNQUxfUExBQ0VTICB7bnVtYmVyfSAgSW50ZWdlciwgMCB0byBNQVggaW5jbHVzaXZlXHJcbiAgICAgICAgICogICBST1VORElOR19NT0RFICAge251bWJlcn0gIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmVcclxuICAgICAgICAgKiAgIEVYUE9ORU5USUFMX0FUICB7bnVtYmVyfG51bWJlcltdfSAgSW50ZWdlciwgLU1BWCB0byBNQVggaW5jbHVzaXZlIG9yXHJcbiAgICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtpbnRlZ2VyIC1NQVggdG8gMCBpbmNsLiwgMCB0byBNQVggaW5jbC5dXHJcbiAgICAgICAgICogICBSQU5HRSAgICAgICAgICAge251bWJlcnxudW1iZXJbXX0gIE5vbi16ZXJvIGludGVnZXIsIC1NQVggdG8gTUFYIGluY2x1c2l2ZSBvclxyXG4gICAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbaW50ZWdlciAtTUFYIHRvIC0xIGluY2wuLCBpbnRlZ2VyIDEgdG8gTUFYIGluY2wuXVxyXG4gICAgICAgICAqICAgRVJST1JTICAgICAgICAgIHtib29sZWFufG51bWJlcn0gICB0cnVlLCBmYWxzZSwgMSBvciAwXHJcbiAgICAgICAgICogICBDUllQVE8gICAgICAgICAge2Jvb2xlYW58bnVtYmVyfSAgIHRydWUsIGZhbHNlLCAxIG9yIDBcclxuICAgICAgICAgKiAgIE1PRFVMT19NT0RFICAgICB7bnVtYmVyfSAgICAgICAgICAgMCB0byA5IGluY2x1c2l2ZVxyXG4gICAgICAgICAqICAgUE9XX1BSRUNJU0lPTiAgIHtudW1iZXJ9ICAgICAgICAgICAwIHRvIE1BWCBpbmNsdXNpdmVcclxuICAgICAgICAgKiAgIEZPUk1BVCAgICAgICAgICB7b2JqZWN0fSAgICAgICAgICAgU2VlIEJpZ051bWJlci5wcm90b3R5cGUudG9Gb3JtYXRcclxuICAgICAgICAgKiAgICAgIGRlY2ltYWxTZXBhcmF0b3IgICAgICAge3N0cmluZ31cclxuICAgICAgICAgKiAgICAgIGdyb3VwU2VwYXJhdG9yICAgICAgICAge3N0cmluZ31cclxuICAgICAgICAgKiAgICAgIGdyb3VwU2l6ZSAgICAgICAgICAgICAge251bWJlcn1cclxuICAgICAgICAgKiAgICAgIHNlY29uZGFyeUdyb3VwU2l6ZSAgICAge251bWJlcn1cclxuICAgICAgICAgKiAgICAgIGZyYWN0aW9uR3JvdXBTZXBhcmF0b3Ige3N0cmluZ31cclxuICAgICAgICAgKiAgICAgIGZyYWN0aW9uR3JvdXBTaXplICAgICAge251bWJlcn1cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIChUaGUgdmFsdWVzIGFzc2lnbmVkIHRvIHRoZSBhYm92ZSBGT1JNQVQgb2JqZWN0IHByb3BlcnRpZXMgYXJlIG5vdCBjaGVja2VkIGZvciB2YWxpZGl0eS4pXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBFLmcuXHJcbiAgICAgICAgICogQmlnTnVtYmVyLmNvbmZpZygyMCwgNCkgaXMgZXF1aXZhbGVudCB0b1xyXG4gICAgICAgICAqIEJpZ051bWJlci5jb25maWcoeyBERUNJTUFMX1BMQUNFUyA6IDIwLCBST1VORElOR19NT0RFIDogNCB9KVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogSWdub3JlIHByb3BlcnRpZXMvcGFyYW1ldGVycyBzZXQgdG8gbnVsbCBvciB1bmRlZmluZWQuXHJcbiAgICAgICAgICogUmV0dXJuIGFuIG9iamVjdCB3aXRoIHRoZSBwcm9wZXJ0aWVzIGN1cnJlbnQgdmFsdWVzLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIEJpZ051bWJlci5jb25maWcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB2LCBwLFxyXG4gICAgICAgICAgICAgICAgaSA9IDAsXHJcbiAgICAgICAgICAgICAgICByID0ge30sXHJcbiAgICAgICAgICAgICAgICBhID0gYXJndW1lbnRzLFxyXG4gICAgICAgICAgICAgICAgbyA9IGFbMF0sXHJcbiAgICAgICAgICAgICAgICBoYXMgPSBvICYmIHR5cGVvZiBvID09ICdvYmplY3QnXHJcbiAgICAgICAgICAgICAgICAgID8gZnVuY3Rpb24gKCkgeyBpZiAoIG8uaGFzT3duUHJvcGVydHkocCkgKSByZXR1cm4gKCB2ID0gb1twXSApICE9IG51bGw7IH1cclxuICAgICAgICAgICAgICAgICAgOiBmdW5jdGlvbiAoKSB7IGlmICggYS5sZW5ndGggPiBpICkgcmV0dXJuICggdiA9IGFbaSsrXSApICE9IG51bGw7IH07XHJcblxyXG4gICAgICAgICAgICAvLyBERUNJTUFMX1BMQUNFUyB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWCBpbmNsdXNpdmUuXHJcbiAgICAgICAgICAgIC8vICdjb25maWcoKSBERUNJTUFMX1BMQUNFUyBub3QgYW4gaW50ZWdlcjoge3Z9J1xyXG4gICAgICAgICAgICAvLyAnY29uZmlnKCkgREVDSU1BTF9QTEFDRVMgb3V0IG9mIHJhbmdlOiB7dn0nXHJcbiAgICAgICAgICAgIGlmICggaGFzKCBwID0gJ0RFQ0lNQUxfUExBQ0VTJyApICYmIGlzVmFsaWRJbnQoIHYsIDAsIE1BWCwgMiwgcCApICkge1xyXG4gICAgICAgICAgICAgICAgREVDSU1BTF9QTEFDRVMgPSB2IHwgMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByW3BdID0gREVDSU1BTF9QTEFDRVM7XHJcblxyXG4gICAgICAgICAgICAvLyBST1VORElOR19NT0RFIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmUuXHJcbiAgICAgICAgICAgIC8vICdjb25maWcoKSBST1VORElOR19NT0RFIG5vdCBhbiBpbnRlZ2VyOiB7dn0nXHJcbiAgICAgICAgICAgIC8vICdjb25maWcoKSBST1VORElOR19NT0RFIG91dCBvZiByYW5nZToge3Z9J1xyXG4gICAgICAgICAgICBpZiAoIGhhcyggcCA9ICdST1VORElOR19NT0RFJyApICYmIGlzVmFsaWRJbnQoIHYsIDAsIDgsIDIsIHAgKSApIHtcclxuICAgICAgICAgICAgICAgIFJPVU5ESU5HX01PREUgPSB2IHwgMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByW3BdID0gUk9VTkRJTkdfTU9ERTtcclxuXHJcbiAgICAgICAgICAgIC8vIEVYUE9ORU5USUFMX0FUIHtudW1iZXJ8bnVtYmVyW119XHJcbiAgICAgICAgICAgIC8vIEludGVnZXIsIC1NQVggdG8gTUFYIGluY2x1c2l2ZSBvciBbaW50ZWdlciAtTUFYIHRvIDAgaW5jbHVzaXZlLCAwIHRvIE1BWCBpbmNsdXNpdmVdLlxyXG4gICAgICAgICAgICAvLyAnY29uZmlnKCkgRVhQT05FTlRJQUxfQVQgbm90IGFuIGludGVnZXI6IHt2fSdcclxuICAgICAgICAgICAgLy8gJ2NvbmZpZygpIEVYUE9ORU5USUFMX0FUIG91dCBvZiByYW5nZToge3Z9J1xyXG4gICAgICAgICAgICBpZiAoIGhhcyggcCA9ICdFWFBPTkVOVElBTF9BVCcgKSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIGlzQXJyYXkodikgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBpc1ZhbGlkSW50KCB2WzBdLCAtTUFYLCAwLCAyLCBwICkgJiYgaXNWYWxpZEludCggdlsxXSwgMCwgTUFYLCAyLCBwICkgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFRPX0VYUF9ORUcgPSB2WzBdIHwgMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgVE9fRVhQX1BPUyA9IHZbMV0gfCAwO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIGlzVmFsaWRJbnQoIHYsIC1NQVgsIE1BWCwgMiwgcCApICkge1xyXG4gICAgICAgICAgICAgICAgICAgIFRPX0VYUF9ORUcgPSAtKCBUT19FWFBfUE9TID0gKCB2IDwgMCA/IC12IDogdiApIHwgMCApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJbcF0gPSBbIFRPX0VYUF9ORUcsIFRPX0VYUF9QT1MgXTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJBTkdFIHtudW1iZXJ8bnVtYmVyW119IE5vbi16ZXJvIGludGVnZXIsIC1NQVggdG8gTUFYIGluY2x1c2l2ZSBvclxyXG4gICAgICAgICAgICAvLyBbaW50ZWdlciAtTUFYIHRvIC0xIGluY2x1c2l2ZSwgaW50ZWdlciAxIHRvIE1BWCBpbmNsdXNpdmVdLlxyXG4gICAgICAgICAgICAvLyAnY29uZmlnKCkgUkFOR0Ugbm90IGFuIGludGVnZXI6IHt2fSdcclxuICAgICAgICAgICAgLy8gJ2NvbmZpZygpIFJBTkdFIGNhbm5vdCBiZSB6ZXJvOiB7dn0nXHJcbiAgICAgICAgICAgIC8vICdjb25maWcoKSBSQU5HRSBvdXQgb2YgcmFuZ2U6IHt2fSdcclxuICAgICAgICAgICAgaWYgKCBoYXMoIHAgPSAnUkFOR0UnICkgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCBpc0FycmF5KHYpICkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICggaXNWYWxpZEludCggdlswXSwgLU1BWCwgLTEsIDIsIHAgKSAmJiBpc1ZhbGlkSW50KCB2WzFdLCAxLCBNQVgsIDIsIHAgKSApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgTUlOX0VYUCA9IHZbMF0gfCAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBNQVhfRVhQID0gdlsxXSB8IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICggaXNWYWxpZEludCggdiwgLU1BWCwgTUFYLCAyLCBwICkgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCB2IHwgMCApIE1JTl9FWFAgPSAtKCBNQVhfRVhQID0gKCB2IDwgMCA/IC12IDogdiApIHwgMCApO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKEVSUk9SUykgcmFpc2UoIDIsIHAgKyAnIGNhbm5vdCBiZSB6ZXJvJywgdiApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJbcF0gPSBbIE1JTl9FWFAsIE1BWF9FWFAgXTtcclxuXHJcbiAgICAgICAgICAgIC8vIEVSUk9SUyB7Ym9vbGVhbnxudW1iZXJ9IHRydWUsIGZhbHNlLCAxIG9yIDAuXHJcbiAgICAgICAgICAgIC8vICdjb25maWcoKSBFUlJPUlMgbm90IGEgYm9vbGVhbiBvciBiaW5hcnkgZGlnaXQ6IHt2fSdcclxuICAgICAgICAgICAgaWYgKCBoYXMoIHAgPSAnRVJST1JTJyApICkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICggdiA9PT0gISF2IHx8IHYgPT09IDEgfHwgdiA9PT0gMCApIHtcclxuICAgICAgICAgICAgICAgICAgICBpZCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNWYWxpZEludCA9ICggRVJST1JTID0gISF2ICkgPyBpbnRWYWxpZGF0b3JXaXRoRXJyb3JzIDogaW50VmFsaWRhdG9yTm9FcnJvcnM7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKEVSUk9SUykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJhaXNlKCAyLCBwICsgbm90Qm9vbCwgdiApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJbcF0gPSBFUlJPUlM7XHJcblxyXG4gICAgICAgICAgICAvLyBDUllQVE8ge2Jvb2xlYW58bnVtYmVyfSB0cnVlLCBmYWxzZSwgMSBvciAwLlxyXG4gICAgICAgICAgICAvLyAnY29uZmlnKCkgQ1JZUFRPIG5vdCBhIGJvb2xlYW4gb3IgYmluYXJ5IGRpZ2l0OiB7dn0nXHJcbiAgICAgICAgICAgIC8vICdjb25maWcoKSBjcnlwdG8gdW5hdmFpbGFibGU6IHtjcnlwdG99J1xyXG4gICAgICAgICAgICBpZiAoIGhhcyggcCA9ICdDUllQVE8nICkgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCB2ID09PSAhIXYgfHwgdiA9PT0gMSB8fCB2ID09PSAwICkge1xyXG4gICAgICAgICAgICAgICAgICAgIENSWVBUTyA9ICEhKCB2ICYmIGNyeXB0b09iaiApO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICggdiAmJiAhQ1JZUFRPICYmIEVSUk9SUyApIHJhaXNlKCAyLCAnY3J5cHRvIHVuYXZhaWxhYmxlJywgY3J5cHRvT2JqICk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKEVSUk9SUykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJhaXNlKCAyLCBwICsgbm90Qm9vbCwgdiApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJbcF0gPSBDUllQVE87XHJcblxyXG4gICAgICAgICAgICAvLyBNT0RVTE9fTU9ERSB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIDkgaW5jbHVzaXZlLlxyXG4gICAgICAgICAgICAvLyAnY29uZmlnKCkgTU9EVUxPX01PREUgbm90IGFuIGludGVnZXI6IHt2fSdcclxuICAgICAgICAgICAgLy8gJ2NvbmZpZygpIE1PRFVMT19NT0RFIG91dCBvZiByYW5nZToge3Z9J1xyXG4gICAgICAgICAgICBpZiAoIGhhcyggcCA9ICdNT0RVTE9fTU9ERScgKSAmJiBpc1ZhbGlkSW50KCB2LCAwLCA5LCAyLCBwICkgKSB7XHJcbiAgICAgICAgICAgICAgICBNT0RVTE9fTU9ERSA9IHYgfCAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJbcF0gPSBNT0RVTE9fTU9ERTtcclxuXHJcbiAgICAgICAgICAgIC8vIFBPV19QUkVDSVNJT04ge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVggaW5jbHVzaXZlLlxyXG4gICAgICAgICAgICAvLyAnY29uZmlnKCkgUE9XX1BSRUNJU0lPTiBub3QgYW4gaW50ZWdlcjoge3Z9J1xyXG4gICAgICAgICAgICAvLyAnY29uZmlnKCkgUE9XX1BSRUNJU0lPTiBvdXQgb2YgcmFuZ2U6IHt2fSdcclxuICAgICAgICAgICAgaWYgKCBoYXMoIHAgPSAnUE9XX1BSRUNJU0lPTicgKSAmJiBpc1ZhbGlkSW50KCB2LCAwLCBNQVgsIDIsIHAgKSApIHtcclxuICAgICAgICAgICAgICAgIFBPV19QUkVDSVNJT04gPSB2IHwgMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByW3BdID0gUE9XX1BSRUNJU0lPTjtcclxuXHJcbiAgICAgICAgICAgIC8vIEZPUk1BVCB7b2JqZWN0fVxyXG4gICAgICAgICAgICAvLyAnY29uZmlnKCkgRk9STUFUIG5vdCBhbiBvYmplY3Q6IHt2fSdcclxuICAgICAgICAgICAgaWYgKCBoYXMoIHAgPSAnRk9STUFUJyApICkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICggdHlwZW9mIHYgPT0gJ29iamVjdCcgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgRk9STUFUID0gdjtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoRVJST1JTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmFpc2UoIDIsIHAgKyAnIG5vdCBhbiBvYmplY3QnLCB2ICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcltwXSA9IEZPUk1BVDtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiByO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2hvc2UgdmFsdWUgaXMgdGhlIG1heGltdW0gb2YgdGhlIGFyZ3VtZW50cy5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIGFyZ3VtZW50cyB7bnVtYmVyfHN0cmluZ3xCaWdOdW1iZXJ9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgQmlnTnVtYmVyLm1heCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIG1heE9yTWluKCBhcmd1bWVudHMsIFAubHQgKTsgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgbWluaW11bSBvZiB0aGUgYXJndW1lbnRzLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogYXJndW1lbnRzIHtudW1iZXJ8c3RyaW5nfEJpZ051bWJlcn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBCaWdOdW1iZXIubWluID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gbWF4T3JNaW4oIGFyZ3VtZW50cywgUC5ndCApOyB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdpdGggYSByYW5kb20gdmFsdWUgZXF1YWwgdG8gb3IgZ3JlYXRlciB0aGFuIDAgYW5kIGxlc3MgdGhhbiAxLFxyXG4gICAgICAgICAqIGFuZCB3aXRoIGRwLCBvciBERUNJTUFMX1BMQUNFUyBpZiBkcCBpcyBvbWl0dGVkLCBkZWNpbWFsIHBsYWNlcyAob3IgbGVzcyBpZiB0cmFpbGluZ1xyXG4gICAgICAgICAqIHplcm9zIGFyZSBwcm9kdWNlZCkuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBbZHBdIHtudW1iZXJ9IERlY2ltYWwgcGxhY2VzLiBJbnRlZ2VyLCAwIHRvIE1BWCBpbmNsdXNpdmUuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiAncmFuZG9tKCkgZGVjaW1hbCBwbGFjZXMgbm90IGFuIGludGVnZXI6IHtkcH0nXHJcbiAgICAgICAgICogJ3JhbmRvbSgpIGRlY2ltYWwgcGxhY2VzIG91dCBvZiByYW5nZToge2RwfSdcclxuICAgICAgICAgKiAncmFuZG9tKCkgY3J5cHRvIHVuYXZhaWxhYmxlOiB7Y3J5cHRvfSdcclxuICAgICAgICAgKi9cclxuICAgICAgICBCaWdOdW1iZXIucmFuZG9tID0gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHBvdzJfNTMgPSAweDIwMDAwMDAwMDAwMDAwO1xyXG5cclxuICAgICAgICAgICAgLy8gUmV0dXJuIGEgNTMgYml0IGludGVnZXIgbiwgd2hlcmUgMCA8PSBuIDwgOTAwNzE5OTI1NDc0MDk5Mi5cclxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgTWF0aC5yYW5kb20oKSBwcm9kdWNlcyBtb3JlIHRoYW4gMzIgYml0cyBvZiByYW5kb21uZXNzLlxyXG4gICAgICAgICAgICAvLyBJZiBpdCBkb2VzLCBhc3N1bWUgYXQgbGVhc3QgNTMgYml0cyBhcmUgcHJvZHVjZWQsIG90aGVyd2lzZSBhc3N1bWUgYXQgbGVhc3QgMzAgYml0cy5cclxuICAgICAgICAgICAgLy8gMHg0MDAwMDAwMCBpcyAyXjMwLCAweDgwMDAwMCBpcyAyXjIzLCAweDFmZmZmZiBpcyAyXjIxIC0gMS5cclxuICAgICAgICAgICAgdmFyIHJhbmRvbTUzYml0SW50ID0gKE1hdGgucmFuZG9tKCkgKiBwb3cyXzUzKSAmIDB4MWZmZmZmXHJcbiAgICAgICAgICAgICAgPyBmdW5jdGlvbiAoKSB7IHJldHVybiBtYXRoZmxvb3IoIE1hdGgucmFuZG9tKCkgKiBwb3cyXzUzICk7IH1cclxuICAgICAgICAgICAgICA6IGZ1bmN0aW9uICgpIHsgcmV0dXJuICgoTWF0aC5yYW5kb20oKSAqIDB4NDAwMDAwMDAgfCAwKSAqIDB4ODAwMDAwKSArXHJcbiAgICAgICAgICAgICAgICAgIChNYXRoLnJhbmRvbSgpICogMHg4MDAwMDAgfCAwKTsgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoZHApIHtcclxuICAgICAgICAgICAgICAgIHZhciBhLCBiLCBlLCBrLCB2LFxyXG4gICAgICAgICAgICAgICAgICAgIGkgPSAwLFxyXG4gICAgICAgICAgICAgICAgICAgIGMgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICByYW5kID0gbmV3IEJpZ051bWJlcihPTkUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGRwID0gZHAgPT0gbnVsbCB8fCAhaXNWYWxpZEludCggZHAsIDAsIE1BWCwgMTQgKSA/IERFQ0lNQUxfUExBQ0VTIDogZHAgfCAwO1xyXG4gICAgICAgICAgICAgICAgayA9IG1hdGhjZWlsKCBkcCAvIExPR19CQVNFICk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKENSWVBUTykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBCcm93c2VycyBzdXBwb3J0aW5nIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBjcnlwdG9PYmogJiYgY3J5cHRvT2JqLmdldFJhbmRvbVZhbHVlcyApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGEgPSBjcnlwdG9PYmouZ2V0UmFuZG9tVmFsdWVzKCBuZXcgVWludDMyQXJyYXkoIGsgKj0gMiApICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCA7IGkgPCBrOyApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA1MyBiaXRzOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gKChNYXRoLnBvdygyLCAzMikgLSAxKSAqIE1hdGgucG93KDIsIDIxKSkudG9TdHJpbmcoMilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDExMTExIDExMTExMTExIDExMTExMTExIDExMTExMTExIDExMTAwMDAwIDAwMDAwMDAwIDAwMDAwMDAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAoKE1hdGgucG93KDIsIDMyKSAtIDEpID4+PiAxMSkudG9TdHJpbmcoMilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDExMTExIDExMTExMTExIDExMTExMTExXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAweDIwMDAwIGlzIDJeMjEuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ID0gYVtpXSAqIDB4MjAwMDAgKyAoYVtpICsgMV0gPj4+IDExKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSZWplY3Rpb24gc2FtcGxpbmc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwIDw9IHYgPCA5MDA3MTk5MjU0NzQwOTkyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQcm9iYWJpbGl0eSB0aGF0IHYgPj0gOWUxNSwgaXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDcxOTkyNTQ3NDA5OTIgLyA5MDA3MTk5MjU0NzQwOTkyIH49IDAuMDAwOCwgaS5lLiAxIGluIDEyNTFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggdiA+PSA5ZTE1ICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGIgPSBjcnlwdG9PYmouZ2V0UmFuZG9tVmFsdWVzKCBuZXcgVWludDMyQXJyYXkoMikgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhW2ldID0gYlswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhW2kgKyAxXSA9IGJbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwIDw9IHYgPD0gODk5OTk5OTk5OTk5OTk5OVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgPD0gKHYgJSAxZTE0KSA8PSA5OTk5OTk5OTk5OTk5OVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGMucHVzaCggdiAlIDFlMTQgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpICs9IDI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaSA9IGsgLyAyO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBOb2RlLmpzIHN1cHBvcnRpbmcgY3J5cHRvLnJhbmRvbUJ5dGVzLlxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIGNyeXB0b09iaiAmJiBjcnlwdG9PYmoucmFuZG9tQnl0ZXMgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBidWZmZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgYSA9IGNyeXB0b09iai5yYW5kb21CeXRlcyggayAqPSA3ICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCA7IGkgPCBrOyApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAweDEwMDAwMDAwMDAwMDAgaXMgMl40OCwgMHgxMDAwMDAwMDAwMCBpcyAyXjQwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAweDEwMDAwMDAwMCBpcyAyXjMyLCAweDEwMDAwMDAgaXMgMl4yNFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMTExMTEgMTExMTExMTEgMTExMTExMTEgMTExMTExMTEgMTExMTExMTEgMTExMTExMTEgMTExMTExMTFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgPD0gdiA8IDkwMDcxOTkyNTQ3NDA5OTJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHYgPSAoICggYVtpXSAmIDMxICkgKiAweDEwMDAwMDAwMDAwMDAgKSArICggYVtpICsgMV0gKiAweDEwMDAwMDAwMDAwICkgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBhW2kgKyAyXSAqIDB4MTAwMDAwMDAwICkgKyAoIGFbaSArIDNdICogMHgxMDAwMDAwICkgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBhW2kgKyA0XSA8PCAxNiApICsgKCBhW2kgKyA1XSA8PCA4ICkgKyBhW2kgKyA2XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHYgPj0gOWUxNSApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcnlwdG9PYmoucmFuZG9tQnl0ZXMoNykuY29weSggYSwgaSApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMCA8PSAodiAlIDFlMTQpIDw9IDk5OTk5OTk5OTk5OTk5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYy5wdXNoKCB2ICUgMWUxNCApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gNztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpID0gayAvIDc7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChFUlJPUlMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmFpc2UoIDE0LCAnY3J5cHRvIHVuYXZhaWxhYmxlJywgY3J5cHRvT2JqICk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFVzZSBNYXRoLnJhbmRvbTogQ1JZUFRPIGlzIGZhbHNlIG9yIGNyeXB0byBpcyB1bmF2YWlsYWJsZSBhbmQgRVJST1JTIGlzIGZhbHNlLlxyXG4gICAgICAgICAgICAgICAgaWYgKCFpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoIDsgaSA8IGs7ICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ID0gcmFuZG9tNTNiaXRJbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCB2IDwgOWUxNSApIGNbaSsrXSA9IHYgJSAxZTE0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBrID0gY1stLWldO1xyXG4gICAgICAgICAgICAgICAgZHAgJT0gTE9HX0JBU0U7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ29udmVydCB0cmFpbGluZyBkaWdpdHMgdG8gemVyb3MgYWNjb3JkaW5nIHRvIGRwLlxyXG4gICAgICAgICAgICAgICAgaWYgKCBrICYmIGRwICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHYgPSBQT1dTX1RFTltMT0dfQkFTRSAtIGRwXTtcclxuICAgICAgICAgICAgICAgICAgICBjW2ldID0gbWF0aGZsb29yKCBrIC8gdiApICogdjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgZWxlbWVudHMgd2hpY2ggYXJlIHplcm8uXHJcbiAgICAgICAgICAgICAgICBmb3IgKCA7IGNbaV0gPT09IDA7IGMucG9wKCksIGktLSApO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFplcm8/XHJcbiAgICAgICAgICAgICAgICBpZiAoIGkgPCAwICkge1xyXG4gICAgICAgICAgICAgICAgICAgIGMgPSBbIGUgPSAwIF07XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgbGVhZGluZyBlbGVtZW50cyB3aGljaCBhcmUgemVybyBhbmQgYWRqdXN0IGV4cG9uZW50IGFjY29yZGluZ2x5LlxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoIGUgPSAtMSA7IGNbMF0gPT09IDA7IGMuc2hpZnQoKSwgZSAtPSBMT0dfQkFTRSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIENvdW50IHRoZSBkaWdpdHMgb2YgdGhlIGZpcnN0IGVsZW1lbnQgb2YgYyB0byBkZXRlcm1pbmUgbGVhZGluZyB6ZXJvcywgYW5kLi4uXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICggaSA9IDEsIHYgPSBjWzBdOyB2ID49IDEwOyB2IC89IDEwLCBpKyspO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBhZGp1c3QgdGhlIGV4cG9uZW50IGFjY29yZGluZ2x5LlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICggaSA8IExPR19CQVNFICkgZSAtPSBMT0dfQkFTRSAtIGk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmFuZC5lID0gZTtcclxuICAgICAgICAgICAgICAgIHJhbmQuYyA9IGM7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmFuZDtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KSgpO1xyXG5cclxuXHJcbiAgICAgICAgLy8gUFJJVkFURSBGVU5DVElPTlNcclxuXHJcblxyXG4gICAgICAgIC8vIENvbnZlcnQgYSBudW1lcmljIHN0cmluZyBvZiBiYXNlSW4gdG8gYSBudW1lcmljIHN0cmluZyBvZiBiYXNlT3V0LlxyXG4gICAgICAgIGZ1bmN0aW9uIGNvbnZlcnRCYXNlKCBzdHIsIGJhc2VPdXQsIGJhc2VJbiwgc2lnbiApIHtcclxuICAgICAgICAgICAgdmFyIGQsIGUsIGssIHIsIHgsIHhjLCB5LFxyXG4gICAgICAgICAgICAgICAgaSA9IHN0ci5pbmRleE9mKCAnLicgKSxcclxuICAgICAgICAgICAgICAgIGRwID0gREVDSU1BTF9QTEFDRVMsXHJcbiAgICAgICAgICAgICAgICBybSA9IFJPVU5ESU5HX01PREU7XHJcblxyXG4gICAgICAgICAgICBpZiAoIGJhc2VJbiA8IDM3ICkgc3RyID0gc3RyLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBOb24taW50ZWdlci5cclxuICAgICAgICAgICAgaWYgKCBpID49IDAgKSB7XHJcbiAgICAgICAgICAgICAgICBrID0gUE9XX1BSRUNJU0lPTjtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBVbmxpbWl0ZWQgcHJlY2lzaW9uLlxyXG4gICAgICAgICAgICAgICAgUE9XX1BSRUNJU0lPTiA9IDA7XHJcbiAgICAgICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZSggJy4nLCAnJyApO1xyXG4gICAgICAgICAgICAgICAgeSA9IG5ldyBCaWdOdW1iZXIoYmFzZUluKTtcclxuICAgICAgICAgICAgICAgIHggPSB5LnBvdyggc3RyLmxlbmd0aCAtIGkgKTtcclxuICAgICAgICAgICAgICAgIFBPV19QUkVDSVNJT04gPSBrO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENvbnZlcnQgc3RyIGFzIGlmIGFuIGludGVnZXIsIHRoZW4gcmVzdG9yZSB0aGUgZnJhY3Rpb24gcGFydCBieSBkaXZpZGluZyB0aGVcclxuICAgICAgICAgICAgICAgIC8vIHJlc3VsdCBieSBpdHMgYmFzZSByYWlzZWQgdG8gYSBwb3dlci5cclxuICAgICAgICAgICAgICAgIHkuYyA9IHRvQmFzZU91dCggdG9GaXhlZFBvaW50KCBjb2VmZlRvU3RyaW5nKCB4LmMgKSwgeC5lICksIDEwLCBiYXNlT3V0ICk7XHJcbiAgICAgICAgICAgICAgICB5LmUgPSB5LmMubGVuZ3RoO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBDb252ZXJ0IHRoZSBudW1iZXIgYXMgaW50ZWdlci5cclxuICAgICAgICAgICAgeGMgPSB0b0Jhc2VPdXQoIHN0ciwgYmFzZUluLCBiYXNlT3V0ICk7XHJcbiAgICAgICAgICAgIGUgPSBrID0geGMubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKCA7IHhjWy0ta10gPT0gMDsgeGMucG9wKCkgKTtcclxuICAgICAgICAgICAgaWYgKCAheGNbMF0gKSByZXR1cm4gJzAnO1xyXG5cclxuICAgICAgICAgICAgaWYgKCBpIDwgMCApIHtcclxuICAgICAgICAgICAgICAgIC0tZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHguYyA9IHhjO1xyXG4gICAgICAgICAgICAgICAgeC5lID0gZTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBzaWduIGlzIG5lZWRlZCBmb3IgY29ycmVjdCByb3VuZGluZy5cclxuICAgICAgICAgICAgICAgIHgucyA9IHNpZ247XHJcbiAgICAgICAgICAgICAgICB4ID0gZGl2KCB4LCB5LCBkcCwgcm0sIGJhc2VPdXQgKTtcclxuICAgICAgICAgICAgICAgIHhjID0geC5jO1xyXG4gICAgICAgICAgICAgICAgciA9IHgucjtcclxuICAgICAgICAgICAgICAgIGUgPSB4LmU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGQgPSBlICsgZHAgKyAxO1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlIHJvdW5kaW5nIGRpZ2l0LCBpLmUuIHRoZSBkaWdpdCB0byB0aGUgcmlnaHQgb2YgdGhlIGRpZ2l0IHRoYXQgbWF5IGJlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgIGkgPSB4Y1tkXTtcclxuICAgICAgICAgICAgayA9IGJhc2VPdXQgLyAyO1xyXG4gICAgICAgICAgICByID0gciB8fCBkIDwgMCB8fCB4Y1tkICsgMV0gIT0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIHIgPSBybSA8IDQgPyAoIGkgIT0gbnVsbCB8fCByICkgJiYgKCBybSA9PSAwIHx8IHJtID09ICggeC5zIDwgMCA/IDMgOiAyICkgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgIDogaSA+IGsgfHwgaSA9PSBrICYmKCBybSA9PSA0IHx8IHIgfHwgcm0gPT0gNiAmJiB4Y1tkIC0gMV0gJiAxIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBybSA9PSAoIHgucyA8IDAgPyA4IDogNyApICk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIGQgPCAxIHx8ICF4Y1swXSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyAxXi1kcCBvciAwLlxyXG4gICAgICAgICAgICAgICAgc3RyID0gciA/IHRvRml4ZWRQb2ludCggJzEnLCAtZHAgKSA6ICcwJztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHhjLmxlbmd0aCA9IGQ7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUm91bmRpbmcgdXAgbWF5IG1lYW4gdGhlIHByZXZpb3VzIGRpZ2l0IGhhcyB0byBiZSByb3VuZGVkIHVwIGFuZCBzbyBvbi5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKCAtLWJhc2VPdXQ7ICsreGNbLS1kXSA+IGJhc2VPdXQ7ICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4Y1tkXSA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoICFkICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKytlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeGMudW5zaGlmdCgxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBEZXRlcm1pbmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgICAgICAgICBmb3IgKCBrID0geGMubGVuZ3RoOyAheGNbLS1rXTsgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBFLmcuIFs0LCAxMSwgMTVdIGJlY29tZXMgNGJmLlxyXG4gICAgICAgICAgICAgICAgZm9yICggaSA9IDAsIHN0ciA9ICcnOyBpIDw9IGs7IHN0ciArPSBBTFBIQUJFVC5jaGFyQXQoIHhjW2krK10gKSApO1xyXG4gICAgICAgICAgICAgICAgc3RyID0gdG9GaXhlZFBvaW50KCBzdHIsIGUgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gVGhlIGNhbGxlciB3aWxsIGFkZCB0aGUgc2lnbi5cclxuICAgICAgICAgICAgcmV0dXJuIHN0cjtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvLyBQZXJmb3JtIGRpdmlzaW9uIGluIHRoZSBzcGVjaWZpZWQgYmFzZS4gQ2FsbGVkIGJ5IGRpdiBhbmQgY29udmVydEJhc2UuXHJcbiAgICAgICAgZGl2ID0gKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIEFzc3VtZSBub24temVybyB4IGFuZCBrLlxyXG4gICAgICAgICAgICBmdW5jdGlvbiBtdWx0aXBseSggeCwgaywgYmFzZSApIHtcclxuICAgICAgICAgICAgICAgIHZhciBtLCB0ZW1wLCB4bG8sIHhoaSxcclxuICAgICAgICAgICAgICAgICAgICBjYXJyeSA9IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgaSA9IHgubGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgICAgIGtsbyA9IGsgJSBTUVJUX0JBU0UsXHJcbiAgICAgICAgICAgICAgICAgICAga2hpID0gayAvIFNRUlRfQkFTRSB8IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yICggeCA9IHguc2xpY2UoKTsgaS0tOyApIHtcclxuICAgICAgICAgICAgICAgICAgICB4bG8gPSB4W2ldICUgU1FSVF9CQVNFO1xyXG4gICAgICAgICAgICAgICAgICAgIHhoaSA9IHhbaV0gLyBTUVJUX0JBU0UgfCAwO1xyXG4gICAgICAgICAgICAgICAgICAgIG0gPSBraGkgKiB4bG8gKyB4aGkgKiBrbG87XHJcbiAgICAgICAgICAgICAgICAgICAgdGVtcCA9IGtsbyAqIHhsbyArICggKCBtICUgU1FSVF9CQVNFICkgKiBTUVJUX0JBU0UgKSArIGNhcnJ5O1xyXG4gICAgICAgICAgICAgICAgICAgIGNhcnJ5ID0gKCB0ZW1wIC8gYmFzZSB8IDAgKSArICggbSAvIFNRUlRfQkFTRSB8IDAgKSArIGtoaSAqIHhoaTtcclxuICAgICAgICAgICAgICAgICAgICB4W2ldID0gdGVtcCAlIGJhc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGNhcnJ5KSB4LnVuc2hpZnQoY2FycnkpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB4O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjb21wYXJlKCBhLCBiLCBhTCwgYkwgKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaSwgY21wO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICggYUwgIT0gYkwgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY21wID0gYUwgPiBiTCA/IDEgOiAtMTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoIGkgPSBjbXAgPSAwOyBpIDwgYUw7IGkrKyApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggYVtpXSAhPSBiW2ldICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY21wID0gYVtpXSA+IGJbaV0gPyAxIDogLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBjbXA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHN1YnRyYWN0KCBhLCBiLCBhTCwgYmFzZSApIHtcclxuICAgICAgICAgICAgICAgIHZhciBpID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTdWJ0cmFjdCBiIGZyb20gYS5cclxuICAgICAgICAgICAgICAgIGZvciAoIDsgYUwtLTsgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYVthTF0gLT0gaTtcclxuICAgICAgICAgICAgICAgICAgICBpID0gYVthTF0gPCBiW2FMXSA/IDEgOiAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGFbYUxdID0gaSAqIGJhc2UgKyBhW2FMXSAtIGJbYUxdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBsZWFkaW5nIHplcm9zLlxyXG4gICAgICAgICAgICAgICAgZm9yICggOyAhYVswXSAmJiBhLmxlbmd0aCA+IDE7IGEuc2hpZnQoKSApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyB4OiBkaXZpZGVuZCwgeTogZGl2aXNvci5cclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICggeCwgeSwgZHAsIHJtLCBiYXNlICkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNtcCwgZSwgaSwgbW9yZSwgbiwgcHJvZCwgcHJvZEwsIHEsIHFjLCByZW0sIHJlbUwsIHJlbTAsIHhpLCB4TCwgeWMwLFxyXG4gICAgICAgICAgICAgICAgICAgIHlMLCB5eixcclxuICAgICAgICAgICAgICAgICAgICBzID0geC5zID09IHkucyA/IDEgOiAtMSxcclxuICAgICAgICAgICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgICAgICAgICB5YyA9IHkuYztcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBFaXRoZXIgTmFOLCBJbmZpbml0eSBvciAwP1xyXG4gICAgICAgICAgICAgICAgaWYgKCAheGMgfHwgIXhjWzBdIHx8ICF5YyB8fCAheWNbMF0gKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQmlnTnVtYmVyKFxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgIC8vIFJldHVybiBOYU4gaWYgZWl0aGVyIE5hTiwgb3IgYm90aCBJbmZpbml0eSBvciAwLlxyXG4gICAgICAgICAgICAgICAgICAgICAgIXgucyB8fCAheS5zIHx8ICggeGMgPyB5YyAmJiB4Y1swXSA9PSB5Y1swXSA6ICF5YyApID8gTmFOIDpcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJldHVybiDCsTAgaWYgeCBpcyDCsTAgb3IgeSBpcyDCsUluZmluaXR5LCBvciByZXR1cm4gwrFJbmZpbml0eSBhcyB5IGlzIMKxMC5cclxuICAgICAgICAgICAgICAgICAgICAgICAgeGMgJiYgeGNbMF0gPT0gMCB8fCAheWMgPyBzICogMCA6IHMgLyAwXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBxID0gbmV3IEJpZ051bWJlcihzKTtcclxuICAgICAgICAgICAgICAgIHFjID0gcS5jID0gW107XHJcbiAgICAgICAgICAgICAgICBlID0geC5lIC0geS5lO1xyXG4gICAgICAgICAgICAgICAgcyA9IGRwICsgZSArIDE7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCAhYmFzZSApIHtcclxuICAgICAgICAgICAgICAgICAgICBiYXNlID0gQkFTRTtcclxuICAgICAgICAgICAgICAgICAgICBlID0gYml0Rmxvb3IoIHguZSAvIExPR19CQVNFICkgLSBiaXRGbG9vciggeS5lIC8gTE9HX0JBU0UgKTtcclxuICAgICAgICAgICAgICAgICAgICBzID0gcyAvIExPR19CQVNFIHwgMDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBSZXN1bHQgZXhwb25lbnQgbWF5IGJlIG9uZSBsZXNzIHRoZW4gdGhlIGN1cnJlbnQgdmFsdWUgb2YgZS5cclxuICAgICAgICAgICAgICAgIC8vIFRoZSBjb2VmZmljaWVudHMgb2YgdGhlIEJpZ051bWJlcnMgZnJvbSBjb252ZXJ0QmFzZSBtYXkgaGF2ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgICAgIGZvciAoIGkgPSAwOyB5Y1tpXSA9PSAoIHhjW2ldIHx8IDAgKTsgaSsrICk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIHljW2ldID4gKCB4Y1tpXSB8fCAwICkgKSBlLS07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCBzIDwgMCApIHtcclxuICAgICAgICAgICAgICAgICAgICBxYy5wdXNoKDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vcmUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB4TCA9IHhjLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICB5TCA9IHljLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICBpID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBzICs9IDI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIE5vcm1hbGlzZSB4YyBhbmQgeWMgc28gaGlnaGVzdCBvcmRlciBkaWdpdCBvZiB5YyBpcyA+PSBiYXNlIC8gMi5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbiA9IG1hdGhmbG9vciggYmFzZSAvICggeWNbMF0gKyAxICkgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90IG5lY2Vzc2FyeSwgYnV0IHRvIGhhbmRsZSBvZGQgYmFzZXMgd2hlcmUgeWNbMF0gPT0gKCBiYXNlIC8gMiApIC0gMS5cclxuICAgICAgICAgICAgICAgICAgICAvLyBpZiAoIG4gPiAxIHx8IG4rKyA9PSAxICYmIHljWzBdIDwgYmFzZSAvIDIgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBuID4gMSApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeWMgPSBtdWx0aXBseSggeWMsIG4sIGJhc2UgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGMgPSBtdWx0aXBseSggeGMsIG4sIGJhc2UgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeUwgPSB5Yy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhMID0geGMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgeGkgPSB5TDtcclxuICAgICAgICAgICAgICAgICAgICByZW0gPSB4Yy5zbGljZSggMCwgeUwgKTtcclxuICAgICAgICAgICAgICAgICAgICByZW1MID0gcmVtLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQWRkIHplcm9zIHRvIG1ha2UgcmVtYWluZGVyIGFzIGxvbmcgYXMgZGl2aXNvci5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKCA7IHJlbUwgPCB5TDsgcmVtW3JlbUwrK10gPSAwICk7XHJcbiAgICAgICAgICAgICAgICAgICAgeXogPSB5Yy5zbGljZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHl6LnVuc2hpZnQoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgeWMwID0geWNbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCB5Y1sxXSA+PSBiYXNlIC8gMiApIHljMCsrO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE5vdCBuZWNlc3NhcnksIGJ1dCB0byBwcmV2ZW50IHRyaWFsIGRpZ2l0IG4gPiBiYXNlLCB3aGVuIHVzaW5nIGJhc2UgMy5cclxuICAgICAgICAgICAgICAgICAgICAvLyBlbHNlIGlmICggYmFzZSA9PSAzICYmIHljMCA9PSAxICkgeWMwID0gMSArIDFlLTE1O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG4gPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29tcGFyZSBkaXZpc29yIGFuZCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNtcCA9IGNvbXBhcmUoIHljLCByZW0sIHlMLCByZW1MICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBkaXZpc29yIDwgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGNtcCA8IDAgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHRyaWFsIGRpZ2l0LCBuLlxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbTAgPSByZW1bMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHlMICE9IHJlbUwgKSByZW0wID0gcmVtMCAqIGJhc2UgKyAoIHJlbVsxXSB8fCAwICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbiBpcyBob3cgbWFueSB0aW1lcyB0aGUgZGl2aXNvciBnb2VzIGludG8gdGhlIGN1cnJlbnQgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbiA9IG1hdGhmbG9vciggcmVtMCAvIHljMCApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICBBbGdvcml0aG06XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgMS4gcHJvZHVjdCA9IGRpdmlzb3IgKiB0cmlhbCBkaWdpdCAobilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAyLiBpZiBwcm9kdWN0ID4gcmVtYWluZGVyOiBwcm9kdWN0IC09IGRpdmlzb3IsIG4tLVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gIDMuIHJlbWFpbmRlciAtPSBwcm9kdWN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgNC4gaWYgcHJvZHVjdCB3YXMgPCByZW1haW5kZXIgYXQgMjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgIDUuIGNvbXBhcmUgbmV3IHJlbWFpbmRlciBhbmQgZGl2aXNvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgNi4gSWYgcmVtYWluZGVyID4gZGl2aXNvcjogcmVtYWluZGVyIC09IGRpdmlzb3IsIG4rK1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggbiA+IDEgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG4gbWF5IGJlID4gYmFzZSBvbmx5IHdoZW4gYmFzZSBpcyAzLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuID49IGJhc2UpIG4gPSBiYXNlIC0gMTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcHJvZHVjdCA9IGRpdmlzb3IgKiB0cmlhbCBkaWdpdC5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9kID0gbXVsdGlwbHkoIHljLCBuLCBiYXNlICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZEwgPSBwcm9kLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1MID0gcmVtLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29tcGFyZSBwcm9kdWN0IGFuZCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgcHJvZHVjdCA+IHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUcmlhbCBkaWdpdCBuIHRvbyBoaWdoLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG4gaXMgMSB0b28gaGlnaCBhYm91dCA1JSBvZiB0aGUgdGltZSwgYW5kIGlzIG5vdCBrbm93biB0byBoYXZlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXZlciBiZWVuIG1vcmUgdGhhbiAxIHRvbyBoaWdoLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlICggY29tcGFyZSggcHJvZCwgcmVtLCBwcm9kTCwgcmVtTCApID09IDEgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG4tLTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN1YnRyYWN0IGRpdmlzb3IgZnJvbSBwcm9kdWN0LlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJ0cmFjdCggcHJvZCwgeUwgPCBwcm9kTCA/IHl6IDogeWMsIHByb2RMLCBiYXNlICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2RMID0gcHJvZC5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNtcCA9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbiBpcyAwIG9yIDEsIGNtcCBpcyAtMS5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBuIGlzIDAsIHRoZXJlIGlzIG5vIG5lZWQgdG8gY29tcGFyZSB5YyBhbmQgcmVtIGFnYWluIGJlbG93LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNvIGNoYW5nZSBjbXAgdG8gMSB0byBhdm9pZCBpdC5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBuIGlzIDEsIGxlYXZlIGNtcCBhcyAtMSwgc28geWMgYW5kIHJlbSBhcmUgY29tcGFyZWQgYWdhaW4uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBuID09IDAgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBkaXZpc29yIDwgcmVtYWluZGVyLCBzbyBuIG11c3QgYmUgYXQgbGVhc3QgMS5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY21wID0gbiA9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwcm9kdWN0ID0gZGl2aXNvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2QgPSB5Yy5zbGljZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2RMID0gcHJvZC5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBwcm9kTCA8IHJlbUwgKSBwcm9kLnVuc2hpZnQoMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3VidHJhY3QgcHJvZHVjdCBmcm9tIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YnRyYWN0KCByZW0sIHByb2QsIHJlbUwsIGJhc2UgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbUwgPSByZW0ubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBwcm9kdWN0IHdhcyA8IHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggY21wID09IC0xICkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDb21wYXJlIGRpdmlzb3IgYW5kIG5ldyByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgZGl2aXNvciA8IG5ldyByZW1haW5kZXIsIHN1YnRyYWN0IGRpdmlzb3IgZnJvbSByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVHJpYWwgZGlnaXQgbiB0b28gbG93LlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG4gaXMgMSB0b28gbG93IGFib3V0IDUlIG9mIHRoZSB0aW1lLCBhbmQgdmVyeSByYXJlbHkgMiB0b28gbG93LlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlICggY29tcGFyZSggeWMsIHJlbSwgeUwsIHJlbUwgKSA8IDEgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG4rKztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN1YnRyYWN0IGRpdmlzb3IgZnJvbSByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YnRyYWN0KCByZW0sIHlMIDwgcmVtTCA/IHl6IDogeWMsIHJlbUwsIGJhc2UgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtTCA9IHJlbS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCBjbXAgPT09IDAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW0gPSBbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gLy8gZWxzZSBjbXAgPT09IDEgYW5kIG4gd2lsbCBiZSAwXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIG5leHQgZGlnaXQsIG4sIHRvIHRoZSByZXN1bHQgYXJyYXkuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHFjW2krK10gPSBuO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggcmVtWzBdICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtW3JlbUwrK10gPSB4Y1t4aV0gfHwgMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbSA9IFsgeGNbeGldIF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1MID0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gd2hpbGUgKCAoIHhpKysgPCB4TCB8fCByZW1bMF0gIT0gbnVsbCApICYmIHMtLSApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBtb3JlID0gcmVtWzBdICE9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIExlYWRpbmcgemVybz9cclxuICAgICAgICAgICAgICAgICAgICBpZiAoICFxY1swXSApIHFjLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCBiYXNlID09IEJBU0UgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRvIGNhbGN1bGF0ZSBxLmUsIGZpcnN0IGdldCB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBvZiBxY1swXS5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKCBpID0gMSwgcyA9IHFjWzBdOyBzID49IDEwOyBzIC89IDEwLCBpKysgKTtcclxuICAgICAgICAgICAgICAgICAgICByb3VuZCggcSwgZHAgKyAoIHEuZSA9IGkgKyBlICogTE9HX0JBU0UgLSAxICkgKyAxLCBybSwgbW9yZSApO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENhbGxlciBpcyBjb252ZXJ0QmFzZS5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcS5lID0gZTtcclxuICAgICAgICAgICAgICAgICAgICBxLnIgPSArbW9yZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KSgpO1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiBCaWdOdW1iZXIgbiBpbiBmaXhlZC1wb2ludCBvciBleHBvbmVudGlhbFxyXG4gICAgICAgICAqIG5vdGF0aW9uIHJvdW5kZWQgdG8gdGhlIHNwZWNpZmllZCBkZWNpbWFsIHBsYWNlcyBvciBzaWduaWZpY2FudCBkaWdpdHMuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBuIGlzIGEgQmlnTnVtYmVyLlxyXG4gICAgICAgICAqIGkgaXMgdGhlIGluZGV4IG9mIHRoZSBsYXN0IGRpZ2l0IHJlcXVpcmVkIChpLmUuIHRoZSBkaWdpdCB0aGF0IG1heSBiZSByb3VuZGVkIHVwKS5cclxuICAgICAgICAgKiBybSBpcyB0aGUgcm91bmRpbmcgbW9kZS5cclxuICAgICAgICAgKiBjYWxsZXIgaXMgY2FsbGVyIGlkOiB0b0V4cG9uZW50aWFsIDE5LCB0b0ZpeGVkIDIwLCB0b0Zvcm1hdCAyMSwgdG9QcmVjaXNpb24gMjQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZm9ybWF0KCBuLCBpLCBybSwgY2FsbGVyICkge1xyXG4gICAgICAgICAgICB2YXIgYzAsIGUsIG5lLCBsZW4sIHN0cjtcclxuXHJcbiAgICAgICAgICAgIHJtID0gcm0gIT0gbnVsbCAmJiBpc1ZhbGlkSW50KCBybSwgMCwgOCwgY2FsbGVyLCByb3VuZGluZ01vZGUgKVxyXG4gICAgICAgICAgICAgID8gcm0gfCAwIDogUk9VTkRJTkdfTU9ERTtcclxuXHJcbiAgICAgICAgICAgIGlmICggIW4uYyApIHJldHVybiBuLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGMwID0gbi5jWzBdO1xyXG4gICAgICAgICAgICBuZSA9IG4uZTtcclxuXHJcbiAgICAgICAgICAgIGlmICggaSA9PSBudWxsICkge1xyXG4gICAgICAgICAgICAgICAgc3RyID0gY29lZmZUb1N0cmluZyggbi5jICk7XHJcbiAgICAgICAgICAgICAgICBzdHIgPSBjYWxsZXIgPT0gMTkgfHwgY2FsbGVyID09IDI0ICYmIG5lIDw9IFRPX0VYUF9ORUdcclxuICAgICAgICAgICAgICAgICAgPyB0b0V4cG9uZW50aWFsKCBzdHIsIG5lIClcclxuICAgICAgICAgICAgICAgICAgOiB0b0ZpeGVkUG9pbnQoIHN0ciwgbmUgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG4gPSByb3VuZCggbmV3IEJpZ051bWJlcihuKSwgaSwgcm0gKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBuLmUgbWF5IGhhdmUgY2hhbmdlZCBpZiB0aGUgdmFsdWUgd2FzIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgICAgICBlID0gbi5lO1xyXG5cclxuICAgICAgICAgICAgICAgIHN0ciA9IGNvZWZmVG9TdHJpbmcoIG4uYyApO1xyXG4gICAgICAgICAgICAgICAgbGVuID0gc3RyLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyB0b1ByZWNpc2lvbiByZXR1cm5zIGV4cG9uZW50aWFsIG5vdGF0aW9uIGlmIHRoZSBudW1iZXIgb2Ygc2lnbmlmaWNhbnQgZGlnaXRzXHJcbiAgICAgICAgICAgICAgICAvLyBzcGVjaWZpZWQgaXMgbGVzcyB0aGFuIHRoZSBudW1iZXIgb2YgZGlnaXRzIG5lY2Vzc2FyeSB0byByZXByZXNlbnQgdGhlIGludGVnZXJcclxuICAgICAgICAgICAgICAgIC8vIHBhcnQgb2YgdGhlIHZhbHVlIGluIGZpeGVkLXBvaW50IG5vdGF0aW9uLlxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAgICAgICAgICAgICAgaWYgKCBjYWxsZXIgPT0gMTkgfHwgY2FsbGVyID09IDI0ICYmICggaSA8PSBlIHx8IGUgPD0gVE9fRVhQX05FRyApICkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBBcHBlbmQgemVyb3M/XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICggOyBsZW4gPCBpOyBzdHIgKz0gJzAnLCBsZW4rKyApO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0ciA9IHRvRXhwb25lbnRpYWwoIHN0ciwgZSApO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEZpeGVkLXBvaW50IG5vdGF0aW9uLlxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpIC09IG5lO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0ciA9IHRvRml4ZWRQb2ludCggc3RyLCBlICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEFwcGVuZCB6ZXJvcz9cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIGUgKyAxID4gbGVuICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIC0taSA+IDAgKSBmb3IgKCBzdHIgKz0gJy4nOyBpLS07IHN0ciArPSAnMCcgKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IGUgLSBsZW47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggaSA+IDAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGUgKyAxID09IGxlbiApIHN0ciArPSAnLic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCA7IGktLTsgc3RyICs9ICcwJyApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbi5zIDwgMCAmJiBjMCA/ICctJyArIHN0ciA6IHN0cjtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvLyBIYW5kbGUgQmlnTnVtYmVyLm1heCBhbmQgQmlnTnVtYmVyLm1pbi5cclxuICAgICAgICBmdW5jdGlvbiBtYXhPck1pbiggYXJncywgbWV0aG9kICkge1xyXG4gICAgICAgICAgICB2YXIgbSwgbixcclxuICAgICAgICAgICAgICAgIGkgPSAwO1xyXG5cclxuICAgICAgICAgICAgaWYgKCBpc0FycmF5KCBhcmdzWzBdICkgKSBhcmdzID0gYXJnc1swXTtcclxuICAgICAgICAgICAgbSA9IG5ldyBCaWdOdW1iZXIoIGFyZ3NbMF0gKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoIDsgKytpIDwgYXJncy5sZW5ndGg7ICkge1xyXG4gICAgICAgICAgICAgICAgbiA9IG5ldyBCaWdOdW1iZXIoIGFyZ3NbaV0gKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBJZiBhbnkgbnVtYmVyIGlzIE5hTiwgcmV0dXJuIE5hTi5cclxuICAgICAgICAgICAgICAgIGlmICggIW4ucyApIHtcclxuICAgICAgICAgICAgICAgICAgICBtID0gbjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIG1ldGhvZC5jYWxsKCBtLCBuICkgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbSA9IG47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBtO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIHRydWUgaWYgbiBpcyBhbiBpbnRlZ2VyIGluIHJhbmdlLCBvdGhlcndpc2UgdGhyb3cuXHJcbiAgICAgICAgICogVXNlIGZvciBhcmd1bWVudCB2YWxpZGF0aW9uIHdoZW4gRVJST1JTIGlzIHRydWUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaW50VmFsaWRhdG9yV2l0aEVycm9ycyggbiwgbWluLCBtYXgsIGNhbGxlciwgbmFtZSApIHtcclxuICAgICAgICAgICAgaWYgKCBuIDwgbWluIHx8IG4gPiBtYXggfHwgbiAhPSB0cnVuY2F0ZShuKSApIHtcclxuICAgICAgICAgICAgICAgIHJhaXNlKCBjYWxsZXIsICggbmFtZSB8fCAnZGVjaW1hbCBwbGFjZXMnICkgK1xyXG4gICAgICAgICAgICAgICAgICAoIG4gPCBtaW4gfHwgbiA+IG1heCA/ICcgb3V0IG9mIHJhbmdlJyA6ICcgbm90IGFuIGludGVnZXInICksIG4gKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBTdHJpcCB0cmFpbGluZyB6ZXJvcywgY2FsY3VsYXRlIGJhc2UgMTAgZXhwb25lbnQgYW5kIGNoZWNrIGFnYWluc3QgTUlOX0VYUCBhbmQgTUFYX0VYUC5cclxuICAgICAgICAgKiBDYWxsZWQgYnkgbWludXMsIHBsdXMgYW5kIHRpbWVzLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIG5vcm1hbGlzZSggbiwgYywgZSApIHtcclxuICAgICAgICAgICAgdmFyIGkgPSAxLFxyXG4gICAgICAgICAgICAgICAgaiA9IGMubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yICggOyAhY1stLWpdOyBjLnBvcCgpICk7XHJcblxyXG4gICAgICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGJhc2UgMTAgZXhwb25lbnQuIEZpcnN0IGdldCB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBvZiBjWzBdLlxyXG4gICAgICAgICAgICBmb3IgKCBqID0gY1swXTsgaiA+PSAxMDsgaiAvPSAxMCwgaSsrICk7XHJcblxyXG4gICAgICAgICAgICAvLyBPdmVyZmxvdz9cclxuICAgICAgICAgICAgaWYgKCAoIGUgPSBpICsgZSAqIExPR19CQVNFIC0gMSApID4gTUFYX0VYUCApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBJbmZpbml0eS5cclxuICAgICAgICAgICAgICAgIG4uYyA9IG4uZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAvLyBVbmRlcmZsb3c/XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIGUgPCBNSU5fRVhQICkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFplcm8uXHJcbiAgICAgICAgICAgICAgICBuLmMgPSBbIG4uZSA9IDAgXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG4uZSA9IGU7XHJcbiAgICAgICAgICAgICAgICBuLmMgPSBjO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbjtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvLyBIYW5kbGUgdmFsdWVzIHRoYXQgZmFpbCB0aGUgdmFsaWRpdHkgdGVzdCBpbiBCaWdOdW1iZXIuXHJcbiAgICAgICAgcGFyc2VOdW1lcmljID0gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGJhc2VQcmVmaXggPSAvXigtPykwKFt4Ym9dKSg/PVxcd1tcXHcuXSokKS9pLFxyXG4gICAgICAgICAgICAgICAgZG90QWZ0ZXIgPSAvXihbXi5dKylcXC4kLyxcclxuICAgICAgICAgICAgICAgIGRvdEJlZm9yZSA9IC9eXFwuKFteLl0rKSQvLFxyXG4gICAgICAgICAgICAgICAgaXNJbmZpbml0eU9yTmFOID0gL14tPyhJbmZpbml0eXxOYU4pJC8sXHJcbiAgICAgICAgICAgICAgICB3aGl0ZXNwYWNlT3JQbHVzID0gL15cXHMqXFwrKD89W1xcdy5dKXxeXFxzK3xcXHMrJC9nO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICggeCwgc3RyLCBudW0sIGIgKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgYmFzZSxcclxuICAgICAgICAgICAgICAgICAgICBzID0gbnVtID8gc3RyIDogc3RyLnJlcGxhY2UoIHdoaXRlc3BhY2VPclBsdXMsICcnICk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gTm8gZXhjZXB0aW9uIG9uIMKxSW5maW5pdHkgb3IgTmFOLlxyXG4gICAgICAgICAgICAgICAgaWYgKCBpc0luZmluaXR5T3JOYU4udGVzdChzKSApIHtcclxuICAgICAgICAgICAgICAgICAgICB4LnMgPSBpc05hTihzKSA/IG51bGwgOiBzIDwgMCA/IC0xIDogMTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCAhbnVtICkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYmFzZVByZWZpeCA9IC9eKC0/KTAoW3hib10pKD89XFx3W1xcdy5dKiQpL2lcclxuICAgICAgICAgICAgICAgICAgICAgICAgcyA9IHMucmVwbGFjZSggYmFzZVByZWZpeCwgZnVuY3Rpb24gKCBtLCBwMSwgcDIgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlID0gKCBwMiA9IHAyLnRvTG93ZXJDYXNlKCkgKSA9PSAneCcgPyAxNiA6IHAyID09ICdiJyA/IDIgOiA4O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICFiIHx8IGIgPT0gYmFzZSA/IHAxIDogbTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZSA9IGI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRS5nLiAnMS4nIHRvICcxJywgJy4xJyB0byAnMC4xJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcyA9IHMucmVwbGFjZSggZG90QWZ0ZXIsICckMScgKS5yZXBsYWNlKCBkb3RCZWZvcmUsICcwLiQxJyApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHN0ciAhPSBzICkgcmV0dXJuIG5ldyBCaWdOdW1iZXIoIHMsIGJhc2UgKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vICduZXcgQmlnTnVtYmVyKCkgbm90IGEgbnVtYmVyOiB7bn0nXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gJ25ldyBCaWdOdW1iZXIoKSBub3QgYSBiYXNlIHtifSBudW1iZXI6IHtufSdcclxuICAgICAgICAgICAgICAgICAgICBpZiAoRVJST1JTKSByYWlzZSggaWQsICdub3QgYScgKyAoIGIgPyAnIGJhc2UgJyArIGIgOiAnJyApICsgJyBudW1iZXInLCBzdHIgKTtcclxuICAgICAgICAgICAgICAgICAgICB4LnMgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHguYyA9IHguZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICBpZCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KSgpO1xyXG5cclxuXHJcbiAgICAgICAgLy8gVGhyb3cgYSBCaWdOdW1iZXIgRXJyb3IuXHJcbiAgICAgICAgZnVuY3Rpb24gcmFpc2UoIGNhbGxlciwgbXNnLCB2YWwgKSB7XHJcbiAgICAgICAgICAgIHZhciBlcnJvciA9IG5ldyBFcnJvciggW1xyXG4gICAgICAgICAgICAgICAgJ25ldyBCaWdOdW1iZXInLCAgICAgLy8gMFxyXG4gICAgICAgICAgICAgICAgJ2NtcCcsICAgICAgICAgICAgICAgLy8gMVxyXG4gICAgICAgICAgICAgICAgJ2NvbmZpZycsICAgICAgICAgICAgLy8gMlxyXG4gICAgICAgICAgICAgICAgJ2RpdicsICAgICAgICAgICAgICAgLy8gM1xyXG4gICAgICAgICAgICAgICAgJ2RpdlRvSW50JywgICAgICAgICAgLy8gNFxyXG4gICAgICAgICAgICAgICAgJ2VxJywgICAgICAgICAgICAgICAgLy8gNVxyXG4gICAgICAgICAgICAgICAgJ2d0JywgICAgICAgICAgICAgICAgLy8gNlxyXG4gICAgICAgICAgICAgICAgJ2d0ZScsICAgICAgICAgICAgICAgLy8gN1xyXG4gICAgICAgICAgICAgICAgJ2x0JywgICAgICAgICAgICAgICAgLy8gOFxyXG4gICAgICAgICAgICAgICAgJ2x0ZScsICAgICAgICAgICAgICAgLy8gOVxyXG4gICAgICAgICAgICAgICAgJ21pbnVzJywgICAgICAgICAgICAgLy8gMTBcclxuICAgICAgICAgICAgICAgICdtb2QnLCAgICAgICAgICAgICAgIC8vIDExXHJcbiAgICAgICAgICAgICAgICAncGx1cycsICAgICAgICAgICAgICAvLyAxMlxyXG4gICAgICAgICAgICAgICAgJ3ByZWNpc2lvbicsICAgICAgICAgLy8gMTNcclxuICAgICAgICAgICAgICAgICdyYW5kb20nLCAgICAgICAgICAgIC8vIDE0XHJcbiAgICAgICAgICAgICAgICAncm91bmQnLCAgICAgICAgICAgICAvLyAxNVxyXG4gICAgICAgICAgICAgICAgJ3NoaWZ0JywgICAgICAgICAgICAgLy8gMTZcclxuICAgICAgICAgICAgICAgICd0aW1lcycsICAgICAgICAgICAgIC8vIDE3XHJcbiAgICAgICAgICAgICAgICAndG9EaWdpdHMnLCAgICAgICAgICAvLyAxOFxyXG4gICAgICAgICAgICAgICAgJ3RvRXhwb25lbnRpYWwnLCAgICAgLy8gMTlcclxuICAgICAgICAgICAgICAgICd0b0ZpeGVkJywgICAgICAgICAgIC8vIDIwXHJcbiAgICAgICAgICAgICAgICAndG9Gb3JtYXQnLCAgICAgICAgICAvLyAyMVxyXG4gICAgICAgICAgICAgICAgJ3RvRnJhY3Rpb24nLCAgICAgICAgLy8gMjJcclxuICAgICAgICAgICAgICAgICdwb3cnLCAgICAgICAgICAgICAgIC8vIDIzXHJcbiAgICAgICAgICAgICAgICAndG9QcmVjaXNpb24nLCAgICAgICAvLyAyNFxyXG4gICAgICAgICAgICAgICAgJ3RvU3RyaW5nJywgICAgICAgICAgLy8gMjVcclxuICAgICAgICAgICAgICAgICdCaWdOdW1iZXInICAgICAgICAgIC8vIDI2XHJcbiAgICAgICAgICAgIF1bY2FsbGVyXSArICcoKSAnICsgbXNnICsgJzogJyArIHZhbCApO1xyXG5cclxuICAgICAgICAgICAgZXJyb3IubmFtZSA9ICdCaWdOdW1iZXIgRXJyb3InO1xyXG4gICAgICAgICAgICBpZCA9IDA7XHJcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUm91bmQgeCB0byBzZCBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBybS4gQ2hlY2sgZm9yIG92ZXIvdW5kZXItZmxvdy5cclxuICAgICAgICAgKiBJZiByIGlzIHRydXRoeSwgaXQgaXMga25vd24gdGhhdCB0aGVyZSBhcmUgbW9yZSBkaWdpdHMgYWZ0ZXIgdGhlIHJvdW5kaW5nIGRpZ2l0LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHJvdW5kKCB4LCBzZCwgcm0sIHIgKSB7XHJcbiAgICAgICAgICAgIHZhciBkLCBpLCBqLCBrLCBuLCBuaSwgcmQsXHJcbiAgICAgICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgICAgIHBvd3MxMCA9IFBPV1NfVEVOO1xyXG5cclxuICAgICAgICAgICAgLy8gaWYgeCBpcyBub3QgSW5maW5pdHkgb3IgTmFOLi4uXHJcbiAgICAgICAgICAgIGlmICh4Yykge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHJkIGlzIHRoZSByb3VuZGluZyBkaWdpdCwgaS5lLiB0aGUgZGlnaXQgYWZ0ZXIgdGhlIGRpZ2l0IHRoYXQgbWF5IGJlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgICAgICAvLyBuIGlzIGEgYmFzZSAxZTE0IG51bWJlciwgdGhlIHZhbHVlIG9mIHRoZSBlbGVtZW50IG9mIGFycmF5IHguYyBjb250YWluaW5nIHJkLlxyXG4gICAgICAgICAgICAgICAgLy8gbmkgaXMgdGhlIGluZGV4IG9mIG4gd2l0aGluIHguYy5cclxuICAgICAgICAgICAgICAgIC8vIGQgaXMgdGhlIG51bWJlciBvZiBkaWdpdHMgb2Ygbi5cclxuICAgICAgICAgICAgICAgIC8vIGkgaXMgdGhlIGluZGV4IG9mIHJkIHdpdGhpbiBuIGluY2x1ZGluZyBsZWFkaW5nIHplcm9zLlxyXG4gICAgICAgICAgICAgICAgLy8gaiBpcyB0aGUgYWN0dWFsIGluZGV4IG9mIHJkIHdpdGhpbiBuIChpZiA8IDAsIHJkIGlzIGEgbGVhZGluZyB6ZXJvKS5cclxuICAgICAgICAgICAgICAgIG91dDoge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIG51bWJlciBvZiBkaWdpdHMgb2YgdGhlIGZpcnN0IGVsZW1lbnQgb2YgeGMuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICggZCA9IDEsIGsgPSB4Y1swXTsgayA+PSAxMDsgayAvPSAxMCwgZCsrICk7XHJcbiAgICAgICAgICAgICAgICAgICAgaSA9IHNkIC0gZDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIHJvdW5kaW5nIGRpZ2l0IGlzIGluIHRoZSBmaXJzdCBlbGVtZW50IG9mIHhjLi4uXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBpIDwgMCApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSArPSBMT0dfQkFTRTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaiA9IHNkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuID0geGNbIG5pID0gMCBdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2V0IHRoZSByb3VuZGluZyBkaWdpdCBhdCBpbmRleCBqIG9mIG4uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJkID0gbiAvIHBvd3MxMFsgZCAtIGogLSAxIF0gJSAxMCB8IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmkgPSBtYXRoY2VpbCggKCBpICsgMSApIC8gTE9HX0JBU0UgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggbmkgPj0geGMubGVuZ3RoICkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5lZWRlZCBieSBzcXJ0LlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIDsgeGMubGVuZ3RoIDw9IG5pOyB4Yy5wdXNoKDApICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbiA9IHJkID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkID0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpICU9IExPR19CQVNFO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGogPSBpIC0gTE9HX0JBU0UgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhayBvdXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuID0gayA9IHhjW25pXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIG51bWJlciBvZiBkaWdpdHMgb2Ygbi5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIGQgPSAxOyBrID49IDEwOyBrIC89IDEwLCBkKysgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIGluZGV4IG9mIHJkIHdpdGhpbiBuLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSAlPSBMT0dfQkFTRTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIGluZGV4IG9mIHJkIHdpdGhpbiBuLCBhZGp1c3RlZCBmb3IgbGVhZGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBudW1iZXIgb2YgbGVhZGluZyB6ZXJvcyBvZiBuIGlzIGdpdmVuIGJ5IExPR19CQVNFIC0gZC5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGogPSBpIC0gTE9HX0JBU0UgKyBkO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgcm91bmRpbmcgZGlnaXQgYXQgaW5kZXggaiBvZiBuLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmQgPSBqIDwgMCA/IDAgOiBuIC8gcG93czEwWyBkIC0gaiAtIDEgXSAlIDEwIHwgMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgciA9IHIgfHwgc2QgPCAwIHx8XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEFyZSB0aGVyZSBhbnkgbm9uLXplcm8gZGlnaXRzIGFmdGVyIHRoZSByb3VuZGluZyBkaWdpdD9cclxuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgZXhwcmVzc2lvbiAgbiAlIHBvd3MxMFsgZCAtIGogLSAxIF0gIHJldHVybnMgYWxsIGRpZ2l0cyBvZiBuIHRvIHRoZSByaWdodFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIG9mIHRoZSBkaWdpdCBhdCBqLCBlLmcuIGlmIG4gaXMgOTA4NzE0IGFuZCBqIGlzIDIsIHRoZSBleHByZXNzaW9uIGdpdmVzIDcxNC5cclxuICAgICAgICAgICAgICAgICAgICAgIHhjW25pICsgMV0gIT0gbnVsbCB8fCAoIGogPCAwID8gbiA6IG4gJSBwb3dzMTBbIGQgLSBqIC0gMSBdICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHIgPSBybSA8IDRcclxuICAgICAgICAgICAgICAgICAgICAgID8gKCByZCB8fCByICkgJiYgKCBybSA9PSAwIHx8IHJtID09ICggeC5zIDwgMCA/IDMgOiAyICkgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgOiByZCA+IDUgfHwgcmQgPT0gNSAmJiAoIHJtID09IDQgfHwgciB8fCBybSA9PSA2ICYmXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSBkaWdpdCB0byB0aGUgbGVmdCBvZiB0aGUgcm91bmRpbmcgZGlnaXQgaXMgb2RkLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoICggaSA+IDAgPyBqID4gMCA/IG4gLyBwb3dzMTBbIGQgLSBqIF0gOiAwIDogeGNbbmkgLSAxXSApICUgMTAgKSAmIDEgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBybSA9PSAoIHgucyA8IDAgPyA4IDogNyApICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICggc2QgPCAxIHx8ICF4Y1swXSApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGMubGVuZ3RoID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29udmVydCBzZCB0byBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNkIC09IHguZSArIDE7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMSwgMC4xLCAwLjAxLCAwLjAwMSwgMC4wMDAxIGV0Yy5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhjWzBdID0gcG93czEwWyAoIExPR19CQVNFIC0gc2QgJSBMT0dfQkFTRSApICUgTE9HX0JBU0UgXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHguZSA9IC1zZCB8fCAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFplcm8uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4Y1swXSA9IHguZSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB4O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIGV4Y2VzcyBkaWdpdHMuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBpID09IDAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhjLmxlbmd0aCA9IG5pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBrID0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmktLTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4Yy5sZW5ndGggPSBuaSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGsgPSBwb3dzMTBbIExPR19CQVNFIC0gaSBdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRS5nLiA1NjcwMCBiZWNvbWVzIDU2MDAwIGlmIDcgaXMgdGhlIHJvdW5kaW5nIGRpZ2l0LlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBqID4gMCBtZWFucyBpID4gbnVtYmVyIG9mIGxlYWRpbmcgemVyb3Mgb2Ygbi5cclxuICAgICAgICAgICAgICAgICAgICAgICAgeGNbbmldID0gaiA+IDAgPyBtYXRoZmxvb3IoIG4gLyBwb3dzMTBbIGQgLSBqIF0gJSBwb3dzMTBbal0gKSAqIGsgOiAwO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUm91bmQgdXA/XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIDsgOyApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgZGlnaXQgdG8gYmUgcm91bmRlZCB1cCBpcyBpbiB0aGUgZmlyc3QgZWxlbWVudCBvZiB4Yy4uLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBuaSA9PSAwICkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpIHdpbGwgYmUgdGhlIGxlbmd0aCBvZiB4Y1swXSBiZWZvcmUgayBpcyBhZGRlZC5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCBpID0gMSwgaiA9IHhjWzBdOyBqID49IDEwOyBqIC89IDEwLCBpKysgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBqID0geGNbMF0gKz0gaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCBrID0gMTsgaiA+PSAxMDsgaiAvPSAxMCwgaysrICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGkgIT0gayB0aGUgbGVuZ3RoIGhhcyBpbmNyZWFzZWQuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBpICE9IGsgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHguZSsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHhjWzBdID09IEJBU0UgKSB4Y1swXSA9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeGNbbmldICs9IGs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCB4Y1tuaV0gIT0gQkFTRSApIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhjW25pLS1dID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrID0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoIGkgPSB4Yy5sZW5ndGg7IHhjWy0taV0gPT09IDA7IHhjLnBvcCgpICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gT3ZlcmZsb3c/IEluZmluaXR5LlxyXG4gICAgICAgICAgICAgICAgaWYgKCB4LmUgPiBNQVhfRVhQICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHguYyA9IHguZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVW5kZXJmbG93PyBaZXJvLlxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICggeC5lIDwgTUlOX0VYUCApIHtcclxuICAgICAgICAgICAgICAgICAgICB4LmMgPSBbIHguZSA9IDAgXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHg7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLy8gUFJPVE9UWVBFL0lOU1RBTkNFIE1FVEhPRFNcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5hYnNvbHV0ZVZhbHVlID0gUC5hYnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB4ID0gbmV3IEJpZ051bWJlcih0aGlzKTtcclxuICAgICAgICAgICAgaWYgKCB4LnMgPCAwICkgeC5zID0gMTtcclxuICAgICAgICAgICAgcmV0dXJuIHg7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgcm91bmRlZCB0byBhIHdob2xlXHJcbiAgICAgICAgICogbnVtYmVyIGluIHRoZSBkaXJlY3Rpb24gb2YgSW5maW5pdHkuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5jZWlsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcm91bmQoIG5ldyBCaWdOdW1iZXIodGhpcyksIHRoaXMuZSArIDEsIDIgKTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm5cclxuICAgICAgICAgKiAxIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpcyBncmVhdGVyIHRoYW4gdGhlIHZhbHVlIG9mIEJpZ051bWJlcih5LCBiKSxcclxuICAgICAgICAgKiAtMSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaXMgbGVzcyB0aGFuIHRoZSB2YWx1ZSBvZiBCaWdOdW1iZXIoeSwgYiksXHJcbiAgICAgICAgICogMCBpZiB0aGV5IGhhdmUgdGhlIHNhbWUgdmFsdWUsXHJcbiAgICAgICAgICogb3IgbnVsbCBpZiB0aGUgdmFsdWUgb2YgZWl0aGVyIGlzIE5hTi5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLmNvbXBhcmVkVG8gPSBQLmNtcCA9IGZ1bmN0aW9uICggeSwgYiApIHtcclxuICAgICAgICAgICAgaWQgPSAxO1xyXG4gICAgICAgICAgICByZXR1cm4gY29tcGFyZSggdGhpcywgbmV3IEJpZ051bWJlciggeSwgYiApICk7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIHRoZSBudW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMgb2YgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyLCBvciBudWxsIGlmIHRoZSB2YWx1ZVxyXG4gICAgICAgICAqIG9mIHRoaXMgQmlnTnVtYmVyIGlzIMKxSW5maW5pdHkgb3IgTmFOLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAuZGVjaW1hbFBsYWNlcyA9IFAuZHAgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBuLCB2LFxyXG4gICAgICAgICAgICAgICAgYyA9IHRoaXMuYztcclxuXHJcbiAgICAgICAgICAgIGlmICggIWMgKSByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgbiA9ICggKCB2ID0gYy5sZW5ndGggLSAxICkgLSBiaXRGbG9vciggdGhpcy5lIC8gTE9HX0JBU0UgKSApICogTE9HX0JBU0U7XHJcblxyXG4gICAgICAgICAgICAvLyBTdWJ0cmFjdCB0aGUgbnVtYmVyIG9mIHRyYWlsaW5nIHplcm9zIG9mIHRoZSBsYXN0IG51bWJlci5cclxuICAgICAgICAgICAgaWYgKCB2ID0gY1t2XSApIGZvciAoIDsgdiAlIDEwID09IDA7IHYgLz0gMTAsIG4tLSApO1xyXG4gICAgICAgICAgICBpZiAoIG4gPCAwICkgbiA9IDA7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbjtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiAgbiAvIDAgPSBJXHJcbiAgICAgICAgICogIG4gLyBOID0gTlxyXG4gICAgICAgICAqICBuIC8gSSA9IDBcclxuICAgICAgICAgKiAgMCAvIG4gPSAwXHJcbiAgICAgICAgICogIDAgLyAwID0gTlxyXG4gICAgICAgICAqICAwIC8gTiA9IE5cclxuICAgICAgICAgKiAgMCAvIEkgPSAwXHJcbiAgICAgICAgICogIE4gLyBuID0gTlxyXG4gICAgICAgICAqICBOIC8gMCA9IE5cclxuICAgICAgICAgKiAgTiAvIE4gPSBOXHJcbiAgICAgICAgICogIE4gLyBJID0gTlxyXG4gICAgICAgICAqICBJIC8gbiA9IElcclxuICAgICAgICAgKiAgSSAvIDAgPSBJXHJcbiAgICAgICAgICogIEkgLyBOID0gTlxyXG4gICAgICAgICAqICBJIC8gSSA9IE5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGRpdmlkZWQgYnkgdGhlIHZhbHVlIG9mXHJcbiAgICAgICAgICogQmlnTnVtYmVyKHksIGIpLCByb3VuZGVkIGFjY29yZGluZyB0byBERUNJTUFMX1BMQUNFUyBhbmQgUk9VTkRJTkdfTU9ERS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLmRpdmlkZWRCeSA9IFAuZGl2ID0gZnVuY3Rpb24gKCB5LCBiICkge1xyXG4gICAgICAgICAgICBpZCA9IDM7XHJcbiAgICAgICAgICAgIHJldHVybiBkaXYoIHRoaXMsIG5ldyBCaWdOdW1iZXIoIHksIGIgKSwgREVDSU1BTF9QTEFDRVMsIFJPVU5ESU5HX01PREUgKTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSBpbnRlZ2VyIHBhcnQgb2YgZGl2aWRpbmcgdGhlIHZhbHVlIG9mIHRoaXNcclxuICAgICAgICAgKiBCaWdOdW1iZXIgYnkgdGhlIHZhbHVlIG9mIEJpZ051bWJlcih5LCBiKS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLmRpdmlkZWRUb0ludGVnZXJCeSA9IFAuZGl2VG9JbnQgPSBmdW5jdGlvbiAoIHksIGIgKSB7XHJcbiAgICAgICAgICAgIGlkID0gNDtcclxuICAgICAgICAgICAgcmV0dXJuIGRpdiggdGhpcywgbmV3IEJpZ051bWJlciggeSwgYiApLCAwLCAxICk7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGlzIGVxdWFsIHRvIHRoZSB2YWx1ZSBvZiBCaWdOdW1iZXIoeSwgYiksXHJcbiAgICAgICAgICogb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5lcXVhbHMgPSBQLmVxID0gZnVuY3Rpb24gKCB5LCBiICkge1xyXG4gICAgICAgICAgICBpZCA9IDU7XHJcbiAgICAgICAgICAgIHJldHVybiBjb21wYXJlKCB0aGlzLCBuZXcgQmlnTnVtYmVyKCB5LCBiICkgKSA9PT0gMDtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciByb3VuZGVkIHRvIGEgd2hvbGVcclxuICAgICAgICAgKiBudW1iZXIgaW4gdGhlIGRpcmVjdGlvbiBvZiAtSW5maW5pdHkuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5mbG9vciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJvdW5kKCBuZXcgQmlnTnVtYmVyKHRoaXMpLCB0aGlzLmUgKyAxLCAzICk7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGlzIGdyZWF0ZXIgdGhhbiB0aGUgdmFsdWUgb2YgQmlnTnVtYmVyKHksIGIpLFxyXG4gICAgICAgICAqIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAuZ3JlYXRlclRoYW4gPSBQLmd0ID0gZnVuY3Rpb24gKCB5LCBiICkge1xyXG4gICAgICAgICAgICBpZCA9IDY7XHJcbiAgICAgICAgICAgIHJldHVybiBjb21wYXJlKCB0aGlzLCBuZXcgQmlnTnVtYmVyKCB5LCBiICkgKSA+IDA7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byB0aGUgdmFsdWUgb2ZcclxuICAgICAgICAgKiBCaWdOdW1iZXIoeSwgYiksIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAuZ3JlYXRlclRoYW5PckVxdWFsVG8gPSBQLmd0ZSA9IGZ1bmN0aW9uICggeSwgYiApIHtcclxuICAgICAgICAgICAgaWQgPSA3O1xyXG4gICAgICAgICAgICByZXR1cm4gKCBiID0gY29tcGFyZSggdGhpcywgbmV3IEJpZ051bWJlciggeSwgYiApICkgKSA9PT0gMSB8fCBiID09PSAwO1xyXG5cclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaXMgYSBmaW5pdGUgbnVtYmVyLCBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLmlzRmluaXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gISF0aGlzLmM7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGlzIGFuIGludGVnZXIsIG90aGVyd2lzZSByZXR1cm4gZmFsc2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5pc0ludGVnZXIgPSBQLmlzSW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gISF0aGlzLmMgJiYgYml0Rmxvb3IoIHRoaXMuZSAvIExPR19CQVNFICkgPiB0aGlzLmMubGVuZ3RoIC0gMjtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaXMgTmFOLCBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLmlzTmFOID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gIXRoaXMucztcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaXMgbmVnYXRpdmUsIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAuaXNOZWdhdGl2ZSA9IFAuaXNOZWcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnMgPCAwO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpcyAwIG9yIC0wLCBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLmlzWmVybyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuICEhdGhpcy5jICYmIHRoaXMuY1swXSA9PSAwO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpcyBsZXNzIHRoYW4gdGhlIHZhbHVlIG9mIEJpZ051bWJlcih5LCBiKSxcclxuICAgICAgICAgKiBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLmxlc3NUaGFuID0gUC5sdCA9IGZ1bmN0aW9uICggeSwgYiApIHtcclxuICAgICAgICAgICAgaWQgPSA4O1xyXG4gICAgICAgICAgICByZXR1cm4gY29tcGFyZSggdGhpcywgbmV3IEJpZ051bWJlciggeSwgYiApICkgPCAwO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHZhbHVlIG9mXHJcbiAgICAgICAgICogQmlnTnVtYmVyKHksIGIpLCBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLmxlc3NUaGFuT3JFcXVhbFRvID0gUC5sdGUgPSBmdW5jdGlvbiAoIHksIGIgKSB7XHJcbiAgICAgICAgICAgIGlkID0gOTtcclxuICAgICAgICAgICAgcmV0dXJuICggYiA9IGNvbXBhcmUoIHRoaXMsIG5ldyBCaWdOdW1iZXIoIHksIGIgKSApICkgPT09IC0xIHx8IGIgPT09IDA7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogIG4gLSAwID0gblxyXG4gICAgICAgICAqICBuIC0gTiA9IE5cclxuICAgICAgICAgKiAgbiAtIEkgPSAtSVxyXG4gICAgICAgICAqICAwIC0gbiA9IC1uXHJcbiAgICAgICAgICogIDAgLSAwID0gMFxyXG4gICAgICAgICAqICAwIC0gTiA9IE5cclxuICAgICAgICAgKiAgMCAtIEkgPSAtSVxyXG4gICAgICAgICAqICBOIC0gbiA9IE5cclxuICAgICAgICAgKiAgTiAtIDAgPSBOXHJcbiAgICAgICAgICogIE4gLSBOID0gTlxyXG4gICAgICAgICAqICBOIC0gSSA9IE5cclxuICAgICAgICAgKiAgSSAtIG4gPSBJXHJcbiAgICAgICAgICogIEkgLSAwID0gSVxyXG4gICAgICAgICAqICBJIC0gTiA9IE5cclxuICAgICAgICAgKiAgSSAtIEkgPSBOXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBSZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBtaW51cyB0aGUgdmFsdWUgb2ZcclxuICAgICAgICAgKiBCaWdOdW1iZXIoeSwgYikuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5taW51cyA9IFAuc3ViID0gZnVuY3Rpb24gKCB5LCBiICkge1xyXG4gICAgICAgICAgICB2YXIgaSwgaiwgdCwgeExUeSxcclxuICAgICAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgYSA9IHgucztcclxuXHJcbiAgICAgICAgICAgIGlkID0gMTA7XHJcbiAgICAgICAgICAgIHkgPSBuZXcgQmlnTnVtYmVyKCB5LCBiICk7XHJcbiAgICAgICAgICAgIGIgPSB5LnM7XHJcblxyXG4gICAgICAgICAgICAvLyBFaXRoZXIgTmFOP1xyXG4gICAgICAgICAgICBpZiAoICFhIHx8ICFiICkgcmV0dXJuIG5ldyBCaWdOdW1iZXIoTmFOKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNpZ25zIGRpZmZlcj9cclxuICAgICAgICAgICAgaWYgKCBhICE9IGIgKSB7XHJcbiAgICAgICAgICAgICAgICB5LnMgPSAtYjtcclxuICAgICAgICAgICAgICAgIHJldHVybiB4LnBsdXMoeSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciB4ZSA9IHguZSAvIExPR19CQVNFLFxyXG4gICAgICAgICAgICAgICAgeWUgPSB5LmUgLyBMT0dfQkFTRSxcclxuICAgICAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICAgICAgeWMgPSB5LmM7XHJcblxyXG4gICAgICAgICAgICBpZiAoICF4ZSB8fCAheWUgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRWl0aGVyIEluZmluaXR5P1xyXG4gICAgICAgICAgICAgICAgaWYgKCAheGMgfHwgIXljICkgcmV0dXJuIHhjID8gKCB5LnMgPSAtYiwgeSApIDogbmV3IEJpZ051bWJlciggeWMgPyB4IDogTmFOICk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgICAgICAgICBpZiAoICF4Y1swXSB8fCAheWNbMF0gKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJldHVybiB5IGlmIHkgaXMgbm9uLXplcm8sIHggaWYgeCBpcyBub24temVybywgb3IgemVybyBpZiBib3RoIGFyZSB6ZXJvLlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB5Y1swXSA/ICggeS5zID0gLWIsIHkgKSA6IG5ldyBCaWdOdW1iZXIoIHhjWzBdID8geCA6XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgLy8gSUVFRSA3NTQgKDIwMDgpIDYuMzogbiAtIG4gPSAtMCB3aGVuIHJvdW5kaW5nIHRvIC1JbmZpbml0eVxyXG4gICAgICAgICAgICAgICAgICAgICAgUk9VTkRJTkdfTU9ERSA9PSAzID8gLTAgOiAwICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHhlID0gYml0Rmxvb3IoeGUpO1xyXG4gICAgICAgICAgICB5ZSA9IGJpdEZsb29yKHllKTtcclxuICAgICAgICAgICAgeGMgPSB4Yy5zbGljZSgpO1xyXG5cclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIHdoaWNoIGlzIHRoZSBiaWdnZXIgbnVtYmVyLlxyXG4gICAgICAgICAgICBpZiAoIGEgPSB4ZSAtIHllICkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICggeExUeSA9IGEgPCAwICkge1xyXG4gICAgICAgICAgICAgICAgICAgIGEgPSAtYTtcclxuICAgICAgICAgICAgICAgICAgICB0ID0geGM7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHllID0geGU7XHJcbiAgICAgICAgICAgICAgICAgICAgdCA9IHljO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFByZXBlbmQgemVyb3MgdG8gZXF1YWxpc2UgZXhwb25lbnRzLlxyXG4gICAgICAgICAgICAgICAgZm9yICggYiA9IGE7IGItLTsgdC5wdXNoKDApICk7XHJcbiAgICAgICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBFeHBvbmVudHMgZXF1YWwuIENoZWNrIGRpZ2l0IGJ5IGRpZ2l0LlxyXG4gICAgICAgICAgICAgICAgaiA9ICggeExUeSA9ICggYSA9IHhjLmxlbmd0aCApIDwgKCBiID0geWMubGVuZ3RoICkgKSA/IGEgOiBiO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAoIGEgPSBiID0gMDsgYiA8IGo7IGIrKyApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCB4Y1tiXSAhPSB5Y1tiXSApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeExUeSA9IHhjW2JdIDwgeWNbYl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8geCA8IHk/IFBvaW50IHhjIHRvIHRoZSBhcnJheSBvZiB0aGUgYmlnZ2VyIG51bWJlci5cclxuICAgICAgICAgICAgaWYgKHhMVHkpIHQgPSB4YywgeGMgPSB5YywgeWMgPSB0LCB5LnMgPSAteS5zO1xyXG5cclxuICAgICAgICAgICAgYiA9ICggaiA9IHljLmxlbmd0aCApIC0gKCBpID0geGMubGVuZ3RoICk7XHJcblxyXG4gICAgICAgICAgICAvLyBBcHBlbmQgemVyb3MgdG8geGMgaWYgc2hvcnRlci5cclxuICAgICAgICAgICAgLy8gTm8gbmVlZCB0byBhZGQgemVyb3MgdG8geWMgaWYgc2hvcnRlciBhcyBzdWJ0cmFjdCBvbmx5IG5lZWRzIHRvIHN0YXJ0IGF0IHljLmxlbmd0aC5cclxuICAgICAgICAgICAgaWYgKCBiID4gMCApIGZvciAoIDsgYi0tOyB4Y1tpKytdID0gMCApO1xyXG4gICAgICAgICAgICBiID0gQkFTRSAtIDE7XHJcblxyXG4gICAgICAgICAgICAvLyBTdWJ0cmFjdCB5YyBmcm9tIHhjLlxyXG4gICAgICAgICAgICBmb3IgKCA7IGogPiBhOyApIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIHhjWy0tal0gPCB5Y1tqXSApIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKCBpID0gajsgaSAmJiAheGNbLS1pXTsgeGNbaV0gPSBiICk7XHJcbiAgICAgICAgICAgICAgICAgICAgLS14Y1tpXTtcclxuICAgICAgICAgICAgICAgICAgICB4Y1tqXSArPSBCQVNFO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHhjW2pdIC09IHljW2pdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgbGVhZGluZyB6ZXJvcyBhbmQgYWRqdXN0IGV4cG9uZW50IGFjY29yZGluZ2x5LlxyXG4gICAgICAgICAgICBmb3IgKCA7IHhjWzBdID09IDA7IHhjLnNoaWZ0KCksIC0teWUgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFplcm8/XHJcbiAgICAgICAgICAgIGlmICggIXhjWzBdICkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEZvbGxvd2luZyBJRUVFIDc1NCAoMjAwOCkgNi4zLFxyXG4gICAgICAgICAgICAgICAgLy8gbiAtIG4gPSArMCAgYnV0ICBuIC0gbiA9IC0wICB3aGVuIHJvdW5kaW5nIHRvd2FyZHMgLUluZmluaXR5LlxyXG4gICAgICAgICAgICAgICAgeS5zID0gUk9VTkRJTkdfTU9ERSA9PSAzID8gLTEgOiAxO1xyXG4gICAgICAgICAgICAgICAgeS5jID0gWyB5LmUgPSAwIF07XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gTm8gbmVlZCB0byBjaGVjayBmb3IgSW5maW5pdHkgYXMgK3ggLSAreSAhPSBJbmZpbml0eSAmJiAteCAtIC15ICE9IEluZmluaXR5XHJcbiAgICAgICAgICAgIC8vIGZvciBmaW5pdGUgeCBhbmQgeS5cclxuICAgICAgICAgICAgcmV0dXJuIG5vcm1hbGlzZSggeSwgeGMsIHllICk7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogICBuICUgMCA9ICBOXHJcbiAgICAgICAgICogICBuICUgTiA9ICBOXHJcbiAgICAgICAgICogICBuICUgSSA9ICBuXHJcbiAgICAgICAgICogICAwICUgbiA9ICAwXHJcbiAgICAgICAgICogIC0wICUgbiA9IC0wXHJcbiAgICAgICAgICogICAwICUgMCA9ICBOXHJcbiAgICAgICAgICogICAwICUgTiA9ICBOXHJcbiAgICAgICAgICogICAwICUgSSA9ICAwXHJcbiAgICAgICAgICogICBOICUgbiA9ICBOXHJcbiAgICAgICAgICogICBOICUgMCA9ICBOXHJcbiAgICAgICAgICogICBOICUgTiA9ICBOXHJcbiAgICAgICAgICogICBOICUgSSA9ICBOXHJcbiAgICAgICAgICogICBJICUgbiA9ICBOXHJcbiAgICAgICAgICogICBJICUgMCA9ICBOXHJcbiAgICAgICAgICogICBJICUgTiA9ICBOXHJcbiAgICAgICAgICogICBJICUgSSA9ICBOXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBSZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBtb2R1bG8gdGhlIHZhbHVlIG9mXHJcbiAgICAgICAgICogQmlnTnVtYmVyKHksIGIpLiBUaGUgcmVzdWx0IGRlcGVuZHMgb24gdGhlIHZhbHVlIG9mIE1PRFVMT19NT0RFLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAubW9kdWxvID0gUC5tb2QgPSBmdW5jdGlvbiAoIHksIGIgKSB7XHJcbiAgICAgICAgICAgIHZhciBxLCBzLFxyXG4gICAgICAgICAgICAgICAgeCA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICBpZCA9IDExO1xyXG4gICAgICAgICAgICB5ID0gbmV3IEJpZ051bWJlciggeSwgYiApO1xyXG5cclxuICAgICAgICAgICAgLy8gUmV0dXJuIE5hTiBpZiB4IGlzIEluZmluaXR5IG9yIE5hTiwgb3IgeSBpcyBOYU4gb3IgemVyby5cclxuICAgICAgICAgICAgaWYgKCAheC5jIHx8ICF5LnMgfHwgeS5jICYmICF5LmNbMF0gKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEJpZ051bWJlcihOYU4pO1xyXG5cclxuICAgICAgICAgICAgLy8gUmV0dXJuIHggaWYgeSBpcyBJbmZpbml0eSBvciB4IGlzIHplcm8uXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoICF5LmMgfHwgeC5jICYmICF4LmNbMF0gKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEJpZ051bWJlcih4KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCBNT0RVTE9fTU9ERSA9PSA5ICkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEV1Y2xpZGlhbiBkaXZpc2lvbjogcSA9IHNpZ24oeSkgKiBmbG9vcih4IC8gYWJzKHkpKVxyXG4gICAgICAgICAgICAgICAgLy8gciA9IHggLSBxeSAgICB3aGVyZSAgMCA8PSByIDwgYWJzKHkpXHJcbiAgICAgICAgICAgICAgICBzID0geS5zO1xyXG4gICAgICAgICAgICAgICAgeS5zID0gMTtcclxuICAgICAgICAgICAgICAgIHEgPSBkaXYoIHgsIHksIDAsIDMgKTtcclxuICAgICAgICAgICAgICAgIHkucyA9IHM7XHJcbiAgICAgICAgICAgICAgICBxLnMgKj0gcztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHEgPSBkaXYoIHgsIHksIDAsIE1PRFVMT19NT0RFICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB4Lm1pbnVzKCBxLnRpbWVzKHkpICk7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgbmVnYXRlZCxcclxuICAgICAgICAgKiBpLmUuIG11bHRpcGxpZWQgYnkgLTEuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5uZWdhdGVkID0gUC5uZWcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB4ID0gbmV3IEJpZ051bWJlcih0aGlzKTtcclxuICAgICAgICAgICAgeC5zID0gLXgucyB8fCBudWxsO1xyXG4gICAgICAgICAgICByZXR1cm4geDtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiAgbiArIDAgPSBuXHJcbiAgICAgICAgICogIG4gKyBOID0gTlxyXG4gICAgICAgICAqICBuICsgSSA9IElcclxuICAgICAgICAgKiAgMCArIG4gPSBuXHJcbiAgICAgICAgICogIDAgKyAwID0gMFxyXG4gICAgICAgICAqICAwICsgTiA9IE5cclxuICAgICAgICAgKiAgMCArIEkgPSBJXHJcbiAgICAgICAgICogIE4gKyBuID0gTlxyXG4gICAgICAgICAqICBOICsgMCA9IE5cclxuICAgICAgICAgKiAgTiArIE4gPSBOXHJcbiAgICAgICAgICogIE4gKyBJID0gTlxyXG4gICAgICAgICAqICBJICsgbiA9IElcclxuICAgICAgICAgKiAgSSArIDAgPSBJXHJcbiAgICAgICAgICogIEkgKyBOID0gTlxyXG4gICAgICAgICAqICBJICsgSSA9IElcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIHBsdXMgdGhlIHZhbHVlIG9mXHJcbiAgICAgICAgICogQmlnTnVtYmVyKHksIGIpLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAucGx1cyA9IFAuYWRkID0gZnVuY3Rpb24gKCB5LCBiICkge1xyXG4gICAgICAgICAgICB2YXIgdCxcclxuICAgICAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgYSA9IHgucztcclxuXHJcbiAgICAgICAgICAgIGlkID0gMTI7XHJcbiAgICAgICAgICAgIHkgPSBuZXcgQmlnTnVtYmVyKCB5LCBiICk7XHJcbiAgICAgICAgICAgIGIgPSB5LnM7XHJcblxyXG4gICAgICAgICAgICAvLyBFaXRoZXIgTmFOP1xyXG4gICAgICAgICAgICBpZiAoICFhIHx8ICFiICkgcmV0dXJuIG5ldyBCaWdOdW1iZXIoTmFOKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNpZ25zIGRpZmZlcj9cclxuICAgICAgICAgICAgIGlmICggYSAhPSBiICkge1xyXG4gICAgICAgICAgICAgICAgeS5zID0gLWI7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geC5taW51cyh5KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHhlID0geC5lIC8gTE9HX0JBU0UsXHJcbiAgICAgICAgICAgICAgICB5ZSA9IHkuZSAvIExPR19CQVNFLFxyXG4gICAgICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgICAgICB5YyA9IHkuYztcclxuXHJcbiAgICAgICAgICAgIGlmICggIXhlIHx8ICF5ZSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBSZXR1cm4gwrFJbmZpbml0eSBpZiBlaXRoZXIgwrFJbmZpbml0eS5cclxuICAgICAgICAgICAgICAgIGlmICggIXhjIHx8ICF5YyApIHJldHVybiBuZXcgQmlnTnVtYmVyKCBhIC8gMCApO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEVpdGhlciB6ZXJvP1xyXG4gICAgICAgICAgICAgICAgLy8gUmV0dXJuIHkgaWYgeSBpcyBub24temVybywgeCBpZiB4IGlzIG5vbi16ZXJvLCBvciB6ZXJvIGlmIGJvdGggYXJlIHplcm8uXHJcbiAgICAgICAgICAgICAgICBpZiAoICF4Y1swXSB8fCAheWNbMF0gKSByZXR1cm4geWNbMF0gPyB5IDogbmV3IEJpZ051bWJlciggeGNbMF0gPyB4IDogYSAqIDAgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgeGUgPSBiaXRGbG9vcih4ZSk7XHJcbiAgICAgICAgICAgIHllID0gYml0Rmxvb3IoeWUpO1xyXG4gICAgICAgICAgICB4YyA9IHhjLnNsaWNlKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBQcmVwZW5kIHplcm9zIHRvIGVxdWFsaXNlIGV4cG9uZW50cy4gRmFzdGVyIHRvIHVzZSByZXZlcnNlIHRoZW4gZG8gdW5zaGlmdHMuXHJcbiAgICAgICAgICAgIGlmICggYSA9IHhlIC0geWUgKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIGEgPiAwICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHllID0geGU7XHJcbiAgICAgICAgICAgICAgICAgICAgdCA9IHljO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBhID0gLWE7XHJcbiAgICAgICAgICAgICAgICAgICAgdCA9IHhjO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICAgICAgZm9yICggOyBhLS07IHQucHVzaCgwKSApO1xyXG4gICAgICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGEgPSB4Yy5sZW5ndGg7XHJcbiAgICAgICAgICAgIGIgPSB5Yy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICAvLyBQb2ludCB4YyB0byB0aGUgbG9uZ2VyIGFycmF5LCBhbmQgYiB0byB0aGUgc2hvcnRlciBsZW5ndGguXHJcbiAgICAgICAgICAgIGlmICggYSAtIGIgPCAwICkgdCA9IHljLCB5YyA9IHhjLCB4YyA9IHQsIGIgPSBhO1xyXG5cclxuICAgICAgICAgICAgLy8gT25seSBzdGFydCBhZGRpbmcgYXQgeWMubGVuZ3RoIC0gMSBhcyB0aGUgZnVydGhlciBkaWdpdHMgb2YgeGMgY2FuIGJlIGlnbm9yZWQuXHJcbiAgICAgICAgICAgIGZvciAoIGEgPSAwOyBiOyApIHtcclxuICAgICAgICAgICAgICAgIGEgPSAoIHhjWy0tYl0gPSB4Y1tiXSArIHljW2JdICsgYSApIC8gQkFTRSB8IDA7XHJcbiAgICAgICAgICAgICAgICB4Y1tiXSAlPSBCQVNFO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoYSkge1xyXG4gICAgICAgICAgICAgICAgeGMudW5zaGlmdChhKTtcclxuICAgICAgICAgICAgICAgICsreWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIE5vIG5lZWQgdG8gY2hlY2sgZm9yIHplcm8sIGFzICt4ICsgK3kgIT0gMCAmJiAteCArIC15ICE9IDBcclxuICAgICAgICAgICAgLy8geWUgPSBNQVhfRVhQICsgMSBwb3NzaWJsZVxyXG4gICAgICAgICAgICByZXR1cm4gbm9ybWFsaXNlKCB5LCB4YywgeWUgKTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gdGhlIG51bWJlciBvZiBzaWduaWZpY2FudCBkaWdpdHMgb2YgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogW3pdIHtib29sZWFufG51bWJlcn0gV2hldGhlciB0byBjb3VudCBpbnRlZ2VyLXBhcnQgdHJhaWxpbmcgemVyb3M6IHRydWUsIGZhbHNlLCAxIG9yIDAuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5wcmVjaXNpb24gPSBQLnNkID0gZnVuY3Rpb24gKHopIHtcclxuICAgICAgICAgICAgdmFyIG4sIHYsXHJcbiAgICAgICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIGMgPSB4LmM7XHJcblxyXG4gICAgICAgICAgICAvLyAncHJlY2lzaW9uKCkgYXJndW1lbnQgbm90IGEgYm9vbGVhbiBvciBiaW5hcnkgZGlnaXQ6IHt6fSdcclxuICAgICAgICAgICAgaWYgKCB6ICE9IG51bGwgJiYgeiAhPT0gISF6ICYmIHogIT09IDEgJiYgeiAhPT0gMCApIHtcclxuICAgICAgICAgICAgICAgIGlmIChFUlJPUlMpIHJhaXNlKCAxMywgJ2FyZ3VtZW50JyArIG5vdEJvb2wsIHogKTtcclxuICAgICAgICAgICAgICAgIGlmICggeiAhPSAhIXogKSB6ID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCAhYyApIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB2ID0gYy5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICBuID0gdiAqIExPR19CQVNFICsgMTtcclxuXHJcbiAgICAgICAgICAgIGlmICggdiA9IGNbdl0gKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gU3VidHJhY3QgdGhlIG51bWJlciBvZiB0cmFpbGluZyB6ZXJvcyBvZiB0aGUgbGFzdCBlbGVtZW50LlxyXG4gICAgICAgICAgICAgICAgZm9yICggOyB2ICUgMTAgPT0gMDsgdiAvPSAxMCwgbi0tICk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQWRkIHRoZSBudW1iZXIgb2YgZGlnaXRzIG9mIHRoZSBmaXJzdCBlbGVtZW50LlxyXG4gICAgICAgICAgICAgICAgZm9yICggdiA9IGNbMF07IHYgPj0gMTA7IHYgLz0gMTAsIG4rKyApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIHogJiYgeC5lICsgMSA+IG4gKSBuID0geC5lICsgMTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBuO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIHJvdW5kZWQgdG8gYSBtYXhpbXVtIG9mXHJcbiAgICAgICAgICogZHAgZGVjaW1hbCBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBybSwgb3IgdG8gMCBhbmQgUk9VTkRJTkdfTU9ERSByZXNwZWN0aXZlbHkgaWZcclxuICAgICAgICAgKiBvbWl0dGVkLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogW2RwXSB7bnVtYmVyfSBEZWNpbWFsIHBsYWNlcy4gSW50ZWdlciwgMCB0byBNQVggaW5jbHVzaXZlLlxyXG4gICAgICAgICAqIFtybV0ge251bWJlcn0gUm91bmRpbmcgbW9kZS4gSW50ZWdlciwgMCB0byA4IGluY2x1c2l2ZS5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqICdyb3VuZCgpIGRlY2ltYWwgcGxhY2VzIG91dCBvZiByYW5nZToge2RwfSdcclxuICAgICAgICAgKiAncm91bmQoKSBkZWNpbWFsIHBsYWNlcyBub3QgYW4gaW50ZWdlcjoge2RwfSdcclxuICAgICAgICAgKiAncm91bmQoKSByb3VuZGluZyBtb2RlIG5vdCBhbiBpbnRlZ2VyOiB7cm19J1xyXG4gICAgICAgICAqICdyb3VuZCgpIHJvdW5kaW5nIG1vZGUgb3V0IG9mIHJhbmdlOiB7cm19J1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAucm91bmQgPSBmdW5jdGlvbiAoIGRwLCBybSApIHtcclxuICAgICAgICAgICAgdmFyIG4gPSBuZXcgQmlnTnVtYmVyKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCBkcCA9PSBudWxsIHx8IGlzVmFsaWRJbnQoIGRwLCAwLCBNQVgsIDE1ICkgKSB7XHJcbiAgICAgICAgICAgICAgICByb3VuZCggbiwgfn5kcCArIHRoaXMuZSArIDEsIHJtID09IG51bGwgfHxcclxuICAgICAgICAgICAgICAgICAgIWlzVmFsaWRJbnQoIHJtLCAwLCA4LCAxNSwgcm91bmRpbmdNb2RlICkgPyBST1VORElOR19NT0RFIDogcm0gfCAwICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBuO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIHNoaWZ0ZWQgYnkgayBwbGFjZXNcclxuICAgICAgICAgKiAocG93ZXJzIG9mIDEwKS4gU2hpZnQgdG8gdGhlIHJpZ2h0IGlmIG4gPiAwLCBhbmQgdG8gdGhlIGxlZnQgaWYgbiA8IDAuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBrIHtudW1iZXJ9IEludGVnZXIsIC1NQVhfU0FGRV9JTlRFR0VSIHRvIE1BWF9TQUZFX0lOVEVHRVIgaW5jbHVzaXZlLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogSWYgayBpcyBvdXQgb2YgcmFuZ2UgYW5kIEVSUk9SUyBpcyBmYWxzZSwgdGhlIHJlc3VsdCB3aWxsIGJlIMKxMCBpZiBrIDwgMCwgb3IgwrFJbmZpbml0eVxyXG4gICAgICAgICAqIG90aGVyd2lzZS5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqICdzaGlmdCgpIGFyZ3VtZW50IG5vdCBhbiBpbnRlZ2VyOiB7a30nXHJcbiAgICAgICAgICogJ3NoaWZ0KCkgYXJndW1lbnQgb3V0IG9mIHJhbmdlOiB7a30nXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5zaGlmdCA9IGZ1bmN0aW9uIChrKSB7XHJcbiAgICAgICAgICAgIHZhciBuID0gdGhpcztcclxuICAgICAgICAgICAgcmV0dXJuIGlzVmFsaWRJbnQoIGssIC1NQVhfU0FGRV9JTlRFR0VSLCBNQVhfU0FGRV9JTlRFR0VSLCAxNiwgJ2FyZ3VtZW50JyApXHJcblxyXG4gICAgICAgICAgICAgIC8vIGsgPCAxZSsyMSwgb3IgdHJ1bmNhdGUoaykgd2lsbCBwcm9kdWNlIGV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAgICAgICAgICAgID8gbi50aW1lcyggJzFlJyArIHRydW5jYXRlKGspIClcclxuICAgICAgICAgICAgICA6IG5ldyBCaWdOdW1iZXIoIG4uYyAmJiBuLmNbMF0gJiYgKCBrIDwgLU1BWF9TQUZFX0lOVEVHRVIgfHwgayA+IE1BWF9TQUZFX0lOVEVHRVIgKVxyXG4gICAgICAgICAgICAgICAgPyBuLnMgKiAoIGsgPCAwID8gMCA6IDEgLyAwIClcclxuICAgICAgICAgICAgICAgIDogbiApO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqICBzcXJ0KC1uKSA9ICBOXHJcbiAgICAgICAgICogIHNxcnQoIE4pID0gIE5cclxuICAgICAgICAgKiAgc3FydCgtSSkgPSAgTlxyXG4gICAgICAgICAqICBzcXJ0KCBJKSA9ICBJXHJcbiAgICAgICAgICogIHNxcnQoIDApID0gIDBcclxuICAgICAgICAgKiAgc3FydCgtMCkgPSAtMFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgc3F1YXJlIHJvb3Qgb2YgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyLFxyXG4gICAgICAgICAqIHJvdW5kZWQgYWNjb3JkaW5nIHRvIERFQ0lNQUxfUExBQ0VTIGFuZCBST1VORElOR19NT0RFLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAuc3F1YXJlUm9vdCA9IFAuc3FydCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIG0sIG4sIHIsIHJlcCwgdCxcclxuICAgICAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgYyA9IHguYyxcclxuICAgICAgICAgICAgICAgIHMgPSB4LnMsXHJcbiAgICAgICAgICAgICAgICBlID0geC5lLFxyXG4gICAgICAgICAgICAgICAgZHAgPSBERUNJTUFMX1BMQUNFUyArIDQsXHJcbiAgICAgICAgICAgICAgICBoYWxmID0gbmV3IEJpZ051bWJlcignMC41Jyk7XHJcblxyXG4gICAgICAgICAgICAvLyBOZWdhdGl2ZS9OYU4vSW5maW5pdHkvemVybz9cclxuICAgICAgICAgICAgaWYgKCBzICE9PSAxIHx8ICFjIHx8ICFjWzBdICkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWdOdW1iZXIoICFzIHx8IHMgPCAwICYmICggIWMgfHwgY1swXSApID8gTmFOIDogYyA/IHggOiAxIC8gMCApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBJbml0aWFsIGVzdGltYXRlLlxyXG4gICAgICAgICAgICBzID0gTWF0aC5zcXJ0KCAreCApO1xyXG5cclxuICAgICAgICAgICAgLy8gTWF0aC5zcXJ0IHVuZGVyZmxvdy9vdmVyZmxvdz9cclxuICAgICAgICAgICAgLy8gUGFzcyB4IHRvIE1hdGguc3FydCBhcyBpbnRlZ2VyLCB0aGVuIGFkanVzdCB0aGUgZXhwb25lbnQgb2YgdGhlIHJlc3VsdC5cclxuICAgICAgICAgICAgaWYgKCBzID09IDAgfHwgcyA9PSAxIC8gMCApIHtcclxuICAgICAgICAgICAgICAgIG4gPSBjb2VmZlRvU3RyaW5nKGMpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCAoIG4ubGVuZ3RoICsgZSApICUgMiA9PSAwICkgbiArPSAnMCc7XHJcbiAgICAgICAgICAgICAgICBzID0gTWF0aC5zcXJ0KG4pO1xyXG4gICAgICAgICAgICAgICAgZSA9IGJpdEZsb29yKCAoIGUgKyAxICkgLyAyICkgLSAoIGUgPCAwIHx8IGUgJSAyICk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCBzID09IDEgLyAwICkge1xyXG4gICAgICAgICAgICAgICAgICAgIG4gPSAnMWUnICsgZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbiA9IHMudG9FeHBvbmVudGlhbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIG4gPSBuLnNsaWNlKCAwLCBuLmluZGV4T2YoJ2UnKSArIDEgKSArIGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgciA9IG5ldyBCaWdOdW1iZXIobik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByID0gbmV3IEJpZ051bWJlciggcyArICcnICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIENoZWNrIGZvciB6ZXJvLlxyXG4gICAgICAgICAgICAvLyByIGNvdWxkIGJlIHplcm8gaWYgTUlOX0VYUCBpcyBjaGFuZ2VkIGFmdGVyIHRoZSB0aGlzIHZhbHVlIHdhcyBjcmVhdGVkLlxyXG4gICAgICAgICAgICAvLyBUaGlzIHdvdWxkIGNhdXNlIGEgZGl2aXNpb24gYnkgemVybyAoeC90KSBhbmQgaGVuY2UgSW5maW5pdHkgYmVsb3csIHdoaWNoIHdvdWxkIGNhdXNlXHJcbiAgICAgICAgICAgIC8vIGNvZWZmVG9TdHJpbmcgdG8gdGhyb3cuXHJcbiAgICAgICAgICAgIGlmICggci5jWzBdICkge1xyXG4gICAgICAgICAgICAgICAgZSA9IHIuZTtcclxuICAgICAgICAgICAgICAgIHMgPSBlICsgZHA7XHJcbiAgICAgICAgICAgICAgICBpZiAoIHMgPCAzICkgcyA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gTmV3dG9uLVJhcGhzb24gaXRlcmF0aW9uLlxyXG4gICAgICAgICAgICAgICAgZm9yICggOyA7ICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHQgPSByO1xyXG4gICAgICAgICAgICAgICAgICAgIHIgPSBoYWxmLnRpbWVzKCB0LnBsdXMoIGRpdiggeCwgdCwgZHAsIDEgKSApICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICggY29lZmZUb1N0cmluZyggdC5jICAgKS5zbGljZSggMCwgcyApID09PSAoIG4gPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgY29lZmZUb1N0cmluZyggci5jICkgKS5zbGljZSggMCwgcyApICkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGV4cG9uZW50IG9mIHIgbWF5IGhlcmUgYmUgb25lIGxlc3MgdGhhbiB0aGUgZmluYWwgcmVzdWx0IGV4cG9uZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBlLmcgMC4wMDA5OTk5IChlLTQpIC0tPiAwLjAwMSAoZS0zKSwgc28gYWRqdXN0IHMgc28gdGhlIHJvdW5kaW5nIGRpZ2l0c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhcmUgaW5kZXhlZCBjb3JyZWN0bHkuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggci5lIDwgZSApIC0tcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgbiA9IG4uc2xpY2UoIHMgLSAzLCBzICsgMSApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIDR0aCByb3VuZGluZyBkaWdpdCBtYXkgYmUgaW4gZXJyb3IgYnkgLTEgc28gaWYgdGhlIDQgcm91bmRpbmcgZGlnaXRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFyZSA5OTk5IG9yIDQ5OTkgKGkuZS4gYXBwcm9hY2hpbmcgYSByb3VuZGluZyBib3VuZGFyeSkgY29udGludWUgdGhlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGl0ZXJhdGlvbi5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBuID09ICc5OTk5JyB8fCAhcmVwICYmIG4gPT0gJzQ5OTknICkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9uIHRoZSBmaXJzdCBpdGVyYXRpb24gb25seSwgY2hlY2sgdG8gc2VlIGlmIHJvdW5kaW5nIHVwIGdpdmVzIHRoZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXhhY3QgcmVzdWx0IGFzIHRoZSBuaW5lcyBtYXkgaW5maW5pdGVseSByZXBlYXQuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoICFyZXAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91bmQoIHQsIHQuZSArIERFQ0lNQUxfUExBQ0VTICsgMiwgMCApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHQudGltZXModCkuZXEoeCkgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHIgPSB0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZHAgKz0gNDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gNDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcCA9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgcm91bmRpbmcgZGlnaXRzIGFyZSBudWxsLCAwezAsNH0gb3IgNTB7MCwzfSwgY2hlY2sgZm9yIGV4YWN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZXN1bHQuIElmIG5vdCwgdGhlbiB0aGVyZSBhcmUgZnVydGhlciBkaWdpdHMgYW5kIG0gd2lsbCBiZSB0cnV0aHkuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoICErbiB8fCAhK24uc2xpY2UoMSkgJiYgbi5jaGFyQXQoMCkgPT0gJzUnICkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUcnVuY2F0ZSB0byB0aGUgZmlyc3Qgcm91bmRpbmcgZGlnaXQuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91bmQoIHIsIHIuZSArIERFQ0lNQUxfUExBQ0VTICsgMiwgMSApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0gPSAhci50aW1lcyhyKS5lcSh4KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJvdW5kKCByLCByLmUgKyBERUNJTUFMX1BMQUNFUyArIDEsIFJPVU5ESU5HX01PREUsIG0gKTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiAgbiAqIDAgPSAwXHJcbiAgICAgICAgICogIG4gKiBOID0gTlxyXG4gICAgICAgICAqICBuICogSSA9IElcclxuICAgICAgICAgKiAgMCAqIG4gPSAwXHJcbiAgICAgICAgICogIDAgKiAwID0gMFxyXG4gICAgICAgICAqICAwICogTiA9IE5cclxuICAgICAgICAgKiAgMCAqIEkgPSBOXHJcbiAgICAgICAgICogIE4gKiBuID0gTlxyXG4gICAgICAgICAqICBOICogMCA9IE5cclxuICAgICAgICAgKiAgTiAqIE4gPSBOXHJcbiAgICAgICAgICogIE4gKiBJID0gTlxyXG4gICAgICAgICAqICBJICogbiA9IElcclxuICAgICAgICAgKiAgSSAqIDAgPSBOXHJcbiAgICAgICAgICogIEkgKiBOID0gTlxyXG4gICAgICAgICAqICBJICogSSA9IElcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIHRpbWVzIHRoZSB2YWx1ZSBvZlxyXG4gICAgICAgICAqIEJpZ051bWJlcih5LCBiKS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLnRpbWVzID0gUC5tdWwgPSBmdW5jdGlvbiAoIHksIGIgKSB7XHJcbiAgICAgICAgICAgIHZhciBjLCBlLCBpLCBqLCBrLCBtLCB4Y0wsIHhsbywgeGhpLCB5Y0wsIHlsbywgeWhpLCB6YyxcclxuICAgICAgICAgICAgICAgIGJhc2UsIHNxcnRCYXNlLFxyXG4gICAgICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgICAgIHljID0gKCBpZCA9IDE3LCB5ID0gbmV3IEJpZ051bWJlciggeSwgYiApICkuYztcclxuXHJcbiAgICAgICAgICAgIC8vIEVpdGhlciBOYU4sIMKxSW5maW5pdHkgb3IgwrEwP1xyXG4gICAgICAgICAgICBpZiAoICF4YyB8fCAheWMgfHwgIXhjWzBdIHx8ICF5Y1swXSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBSZXR1cm4gTmFOIGlmIGVpdGhlciBpcyBOYU4sIG9yIG9uZSBpcyAwIGFuZCB0aGUgb3RoZXIgaXMgSW5maW5pdHkuXHJcbiAgICAgICAgICAgICAgICBpZiAoICF4LnMgfHwgIXkucyB8fCB4YyAmJiAheGNbMF0gJiYgIXljIHx8IHljICYmICF5Y1swXSAmJiAheGMgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeS5jID0geS5lID0geS5zID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeS5zICo9IHgucztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUmV0dXJuIMKxSW5maW5pdHkgaWYgZWl0aGVyIGlzIMKxSW5maW5pdHkuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCAheGMgfHwgIXljICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5LmMgPSB5LmUgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBSZXR1cm4gwrEwIGlmIGVpdGhlciBpcyDCsTAuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeS5jID0gWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5LmUgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4geTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZSA9IGJpdEZsb29yKCB4LmUgLyBMT0dfQkFTRSApICsgYml0Rmxvb3IoIHkuZSAvIExPR19CQVNFICk7XHJcbiAgICAgICAgICAgIHkucyAqPSB4LnM7XHJcbiAgICAgICAgICAgIHhjTCA9IHhjLmxlbmd0aDtcclxuICAgICAgICAgICAgeWNMID0geWMubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgLy8gRW5zdXJlIHhjIHBvaW50cyB0byBsb25nZXIgYXJyYXkgYW5kIHhjTCB0byBpdHMgbGVuZ3RoLlxyXG4gICAgICAgICAgICBpZiAoIHhjTCA8IHljTCApIHpjID0geGMsIHhjID0geWMsIHljID0gemMsIGkgPSB4Y0wsIHhjTCA9IHljTCwgeWNMID0gaTtcclxuXHJcbiAgICAgICAgICAgIC8vIEluaXRpYWxpc2UgdGhlIHJlc3VsdCBhcnJheSB3aXRoIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKCBpID0geGNMICsgeWNMLCB6YyA9IFtdOyBpLS07IHpjLnB1c2goMCkgKTtcclxuXHJcbiAgICAgICAgICAgIGJhc2UgPSBCQVNFO1xyXG4gICAgICAgICAgICBzcXJ0QmFzZSA9IFNRUlRfQkFTRTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoIGkgPSB5Y0w7IC0taSA+PSAwOyApIHtcclxuICAgICAgICAgICAgICAgIGMgPSAwO1xyXG4gICAgICAgICAgICAgICAgeWxvID0geWNbaV0gJSBzcXJ0QmFzZTtcclxuICAgICAgICAgICAgICAgIHloaSA9IHljW2ldIC8gc3FydEJhc2UgfCAwO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAoIGsgPSB4Y0wsIGogPSBpICsgazsgaiA+IGk7ICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHhsbyA9IHhjWy0ta10gJSBzcXJ0QmFzZTtcclxuICAgICAgICAgICAgICAgICAgICB4aGkgPSB4Y1trXSAvIHNxcnRCYXNlIHwgMDtcclxuICAgICAgICAgICAgICAgICAgICBtID0geWhpICogeGxvICsgeGhpICogeWxvO1xyXG4gICAgICAgICAgICAgICAgICAgIHhsbyA9IHlsbyAqIHhsbyArICggKCBtICUgc3FydEJhc2UgKSAqIHNxcnRCYXNlICkgKyB6Y1tqXSArIGM7XHJcbiAgICAgICAgICAgICAgICAgICAgYyA9ICggeGxvIC8gYmFzZSB8IDAgKSArICggbSAvIHNxcnRCYXNlIHwgMCApICsgeWhpICogeGhpO1xyXG4gICAgICAgICAgICAgICAgICAgIHpjW2otLV0gPSB4bG8gJSBiYXNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHpjW2pdID0gYztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGMpIHtcclxuICAgICAgICAgICAgICAgICsrZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHpjLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBub3JtYWxpc2UoIHksIHpjLCBlICk7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgcm91bmRlZCB0byBhIG1heGltdW0gb2ZcclxuICAgICAgICAgKiBzZCBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBybSwgb3IgUk9VTkRJTkdfTU9ERSBpZiBybSBpcyBvbWl0dGVkLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogW3NkXSB7bnVtYmVyfSBTaWduaWZpY2FudCBkaWdpdHMuIEludGVnZXIsIDEgdG8gTUFYIGluY2x1c2l2ZS5cclxuICAgICAgICAgKiBbcm1dIHtudW1iZXJ9IFJvdW5kaW5nIG1vZGUuIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmUuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiAndG9EaWdpdHMoKSBwcmVjaXNpb24gb3V0IG9mIHJhbmdlOiB7c2R9J1xyXG4gICAgICAgICAqICd0b0RpZ2l0cygpIHByZWNpc2lvbiBub3QgYW4gaW50ZWdlcjoge3NkfSdcclxuICAgICAgICAgKiAndG9EaWdpdHMoKSByb3VuZGluZyBtb2RlIG5vdCBhbiBpbnRlZ2VyOiB7cm19J1xyXG4gICAgICAgICAqICd0b0RpZ2l0cygpIHJvdW5kaW5nIG1vZGUgb3V0IG9mIHJhbmdlOiB7cm19J1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAudG9EaWdpdHMgPSBmdW5jdGlvbiAoIHNkLCBybSApIHtcclxuICAgICAgICAgICAgdmFyIG4gPSBuZXcgQmlnTnVtYmVyKHRoaXMpO1xyXG4gICAgICAgICAgICBzZCA9IHNkID09IG51bGwgfHwgIWlzVmFsaWRJbnQoIHNkLCAxLCBNQVgsIDE4LCAncHJlY2lzaW9uJyApID8gbnVsbCA6IHNkIHwgMDtcclxuICAgICAgICAgICAgcm0gPSBybSA9PSBudWxsIHx8ICFpc1ZhbGlkSW50KCBybSwgMCwgOCwgMTgsIHJvdW5kaW5nTW9kZSApID8gUk9VTkRJTkdfTU9ERSA6IHJtIHwgMDtcclxuICAgICAgICAgICAgcmV0dXJuIHNkID8gcm91bmQoIG4sIHNkLCBybSApIDogbjtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpbiBleHBvbmVudGlhbCBub3RhdGlvbiBhbmRcclxuICAgICAgICAgKiByb3VuZGVkIHVzaW5nIFJPVU5ESU5HX01PREUgdG8gZHAgZml4ZWQgZGVjaW1hbCBwbGFjZXMuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBbZHBdIHtudW1iZXJ9IERlY2ltYWwgcGxhY2VzLiBJbnRlZ2VyLCAwIHRvIE1BWCBpbmNsdXNpdmUuXHJcbiAgICAgICAgICogW3JtXSB7bnVtYmVyfSBSb3VuZGluZyBtb2RlLiBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogJ3RvRXhwb25lbnRpYWwoKSBkZWNpbWFsIHBsYWNlcyBub3QgYW4gaW50ZWdlcjoge2RwfSdcclxuICAgICAgICAgKiAndG9FeHBvbmVudGlhbCgpIGRlY2ltYWwgcGxhY2VzIG91dCBvZiByYW5nZToge2RwfSdcclxuICAgICAgICAgKiAndG9FeHBvbmVudGlhbCgpIHJvdW5kaW5nIG1vZGUgbm90IGFuIGludGVnZXI6IHtybX0nXHJcbiAgICAgICAgICogJ3RvRXhwb25lbnRpYWwoKSByb3VuZGluZyBtb2RlIG91dCBvZiByYW5nZToge3JtfSdcclxuICAgICAgICAgKi9cclxuICAgICAgICBQLnRvRXhwb25lbnRpYWwgPSBmdW5jdGlvbiAoIGRwLCBybSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdCggdGhpcyxcclxuICAgICAgICAgICAgICBkcCAhPSBudWxsICYmIGlzVmFsaWRJbnQoIGRwLCAwLCBNQVgsIDE5ICkgPyB+fmRwICsgMSA6IG51bGwsIHJtLCAxOSApO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGluIGZpeGVkLXBvaW50IG5vdGF0aW9uIHJvdW5kaW5nXHJcbiAgICAgICAgICogdG8gZHAgZml4ZWQgZGVjaW1hbCBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBybSwgb3IgUk9VTkRJTkdfTU9ERSBpZiBybSBpcyBvbWl0dGVkLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogTm90ZTogYXMgd2l0aCBKYXZhU2NyaXB0J3MgbnVtYmVyIHR5cGUsICgtMCkudG9GaXhlZCgwKSBpcyAnMCcsXHJcbiAgICAgICAgICogYnV0IGUuZy4gKC0wLjAwMDAxKS50b0ZpeGVkKDApIGlzICctMCcuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBbZHBdIHtudW1iZXJ9IERlY2ltYWwgcGxhY2VzLiBJbnRlZ2VyLCAwIHRvIE1BWCBpbmNsdXNpdmUuXHJcbiAgICAgICAgICogW3JtXSB7bnVtYmVyfSBSb3VuZGluZyBtb2RlLiBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogJ3RvRml4ZWQoKSBkZWNpbWFsIHBsYWNlcyBub3QgYW4gaW50ZWdlcjoge2RwfSdcclxuICAgICAgICAgKiAndG9GaXhlZCgpIGRlY2ltYWwgcGxhY2VzIG91dCBvZiByYW5nZToge2RwfSdcclxuICAgICAgICAgKiAndG9GaXhlZCgpIHJvdW5kaW5nIG1vZGUgbm90IGFuIGludGVnZXI6IHtybX0nXHJcbiAgICAgICAgICogJ3RvRml4ZWQoKSByb3VuZGluZyBtb2RlIG91dCBvZiByYW5nZToge3JtfSdcclxuICAgICAgICAgKi9cclxuICAgICAgICBQLnRvRml4ZWQgPSBmdW5jdGlvbiAoIGRwLCBybSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdCggdGhpcywgZHAgIT0gbnVsbCAmJiBpc1ZhbGlkSW50KCBkcCwgMCwgTUFYLCAyMCApXHJcbiAgICAgICAgICAgICAgPyB+fmRwICsgdGhpcy5lICsgMSA6IG51bGwsIHJtLCAyMCApO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGluIGZpeGVkLXBvaW50IG5vdGF0aW9uIHJvdW5kZWRcclxuICAgICAgICAgKiB1c2luZyBybSBvciBST1VORElOR19NT0RFIHRvIGRwIGRlY2ltYWwgcGxhY2VzLCBhbmQgZm9ybWF0dGVkIGFjY29yZGluZyB0byB0aGUgcHJvcGVydGllc1xyXG4gICAgICAgICAqIG9mIHRoZSBGT1JNQVQgb2JqZWN0IChzZWUgQmlnTnVtYmVyLmNvbmZpZykuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBGT1JNQVQgPSB7XHJcbiAgICAgICAgICogICAgICBkZWNpbWFsU2VwYXJhdG9yIDogJy4nLFxyXG4gICAgICAgICAqICAgICAgZ3JvdXBTZXBhcmF0b3IgOiAnLCcsXHJcbiAgICAgICAgICogICAgICBncm91cFNpemUgOiAzLFxyXG4gICAgICAgICAqICAgICAgc2Vjb25kYXJ5R3JvdXBTaXplIDogMCxcclxuICAgICAgICAgKiAgICAgIGZyYWN0aW9uR3JvdXBTZXBhcmF0b3IgOiAnXFx4QTAnLCAgICAvLyBub24tYnJlYWtpbmcgc3BhY2VcclxuICAgICAgICAgKiAgICAgIGZyYWN0aW9uR3JvdXBTaXplIDogMFxyXG4gICAgICAgICAqIH07XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBbZHBdIHtudW1iZXJ9IERlY2ltYWwgcGxhY2VzLiBJbnRlZ2VyLCAwIHRvIE1BWCBpbmNsdXNpdmUuXHJcbiAgICAgICAgICogW3JtXSB7bnVtYmVyfSBSb3VuZGluZyBtb2RlLiBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogJ3RvRm9ybWF0KCkgZGVjaW1hbCBwbGFjZXMgbm90IGFuIGludGVnZXI6IHtkcH0nXHJcbiAgICAgICAgICogJ3RvRm9ybWF0KCkgZGVjaW1hbCBwbGFjZXMgb3V0IG9mIHJhbmdlOiB7ZHB9J1xyXG4gICAgICAgICAqICd0b0Zvcm1hdCgpIHJvdW5kaW5nIG1vZGUgbm90IGFuIGludGVnZXI6IHtybX0nXHJcbiAgICAgICAgICogJ3RvRm9ybWF0KCkgcm91bmRpbmcgbW9kZSBvdXQgb2YgcmFuZ2U6IHtybX0nXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC50b0Zvcm1hdCA9IGZ1bmN0aW9uICggZHAsIHJtICkge1xyXG4gICAgICAgICAgICB2YXIgc3RyID0gZm9ybWF0KCB0aGlzLCBkcCAhPSBudWxsICYmIGlzVmFsaWRJbnQoIGRwLCAwLCBNQVgsIDIxIClcclxuICAgICAgICAgICAgICA/IH5+ZHAgKyB0aGlzLmUgKyAxIDogbnVsbCwgcm0sIDIxICk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIHRoaXMuYyApIHtcclxuICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgIGFyciA9IHN0ci5zcGxpdCgnLicpLFxyXG4gICAgICAgICAgICAgICAgICAgIGcxID0gK0ZPUk1BVC5ncm91cFNpemUsXHJcbiAgICAgICAgICAgICAgICAgICAgZzIgPSArRk9STUFULnNlY29uZGFyeUdyb3VwU2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICBncm91cFNlcGFyYXRvciA9IEZPUk1BVC5ncm91cFNlcGFyYXRvcixcclxuICAgICAgICAgICAgICAgICAgICBpbnRQYXJ0ID0gYXJyWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgIGZyYWN0aW9uUGFydCA9IGFyclsxXSxcclxuICAgICAgICAgICAgICAgICAgICBpc05lZyA9IHRoaXMucyA8IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgaW50RGlnaXRzID0gaXNOZWcgPyBpbnRQYXJ0LnNsaWNlKDEpIDogaW50UGFydCxcclxuICAgICAgICAgICAgICAgICAgICBsZW4gPSBpbnREaWdpdHMubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChnMikgaSA9IGcxLCBnMSA9IGcyLCBnMiA9IGksIGxlbiAtPSBpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICggZzEgPiAwICYmIGxlbiA+IDAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaSA9IGxlbiAlIGcxIHx8IGcxO1xyXG4gICAgICAgICAgICAgICAgICAgIGludFBhcnQgPSBpbnREaWdpdHMuc3Vic3RyKCAwLCBpICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoIDsgaSA8IGxlbjsgaSArPSBnMSApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW50UGFydCArPSBncm91cFNlcGFyYXRvciArIGludERpZ2l0cy5zdWJzdHIoIGksIGcxICk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIGcyID4gMCApIGludFBhcnQgKz0gZ3JvdXBTZXBhcmF0b3IgKyBpbnREaWdpdHMuc2xpY2UoaSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzTmVnKSBpbnRQYXJ0ID0gJy0nICsgaW50UGFydDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBzdHIgPSBmcmFjdGlvblBhcnRcclxuICAgICAgICAgICAgICAgICAgPyBpbnRQYXJ0ICsgRk9STUFULmRlY2ltYWxTZXBhcmF0b3IgKyAoICggZzIgPSArRk9STUFULmZyYWN0aW9uR3JvdXBTaXplIClcclxuICAgICAgICAgICAgICAgICAgICA/IGZyYWN0aW9uUGFydC5yZXBsYWNlKCBuZXcgUmVnRXhwKCAnXFxcXGR7JyArIGcyICsgJ31cXFxcQicsICdnJyApLFxyXG4gICAgICAgICAgICAgICAgICAgICAgJyQmJyArIEZPUk1BVC5mcmFjdGlvbkdyb3VwU2VwYXJhdG9yIClcclxuICAgICAgICAgICAgICAgICAgICA6IGZyYWN0aW9uUGFydCApXHJcbiAgICAgICAgICAgICAgICAgIDogaW50UGFydDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0cjtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gYSBzdHJpbmcgYXJyYXkgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBhcyBhIHNpbXBsZSBmcmFjdGlvbiB3aXRoXHJcbiAgICAgICAgICogYW4gaW50ZWdlciBudW1lcmF0b3IgYW5kIGFuIGludGVnZXIgZGVub21pbmF0b3IuIFRoZSBkZW5vbWluYXRvciB3aWxsIGJlIGEgcG9zaXRpdmVcclxuICAgICAgICAgKiBub24temVybyB2YWx1ZSBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHNwZWNpZmllZCBtYXhpbXVtIGRlbm9taW5hdG9yLiBJZiBhIG1heGltdW1cclxuICAgICAgICAgKiBkZW5vbWluYXRvciBpcyBub3Qgc3BlY2lmaWVkLCB0aGUgZGVub21pbmF0b3Igd2lsbCBiZSB0aGUgbG93ZXN0IHZhbHVlIG5lY2Vzc2FyeSB0b1xyXG4gICAgICAgICAqIHJlcHJlc2VudCB0aGUgbnVtYmVyIGV4YWN0bHkuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBbbWRdIHtudW1iZXJ8c3RyaW5nfEJpZ051bWJlcn0gSW50ZWdlciA+PSAxIGFuZCA8IEluZmluaXR5LiBUaGUgbWF4aW11bSBkZW5vbWluYXRvci5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqICd0b0ZyYWN0aW9uKCkgbWF4IGRlbm9taW5hdG9yIG5vdCBhbiBpbnRlZ2VyOiB7bWR9J1xyXG4gICAgICAgICAqICd0b0ZyYWN0aW9uKCkgbWF4IGRlbm9taW5hdG9yIG91dCBvZiByYW5nZToge21kfSdcclxuICAgICAgICAgKi9cclxuICAgICAgICBQLnRvRnJhY3Rpb24gPSBmdW5jdGlvbiAobWQpIHtcclxuICAgICAgICAgICAgdmFyIGFyciwgZDAsIGQyLCBlLCBleHAsIG4sIG4wLCBxLCBzLFxyXG4gICAgICAgICAgICAgICAgayA9IEVSUk9SUyxcclxuICAgICAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgICAgICBkID0gbmV3IEJpZ051bWJlcihPTkUpLFxyXG4gICAgICAgICAgICAgICAgbjEgPSBkMCA9IG5ldyBCaWdOdW1iZXIoT05FKSxcclxuICAgICAgICAgICAgICAgIGQxID0gbjAgPSBuZXcgQmlnTnVtYmVyKE9ORSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIG1kICE9IG51bGwgKSB7XHJcbiAgICAgICAgICAgICAgICBFUlJPUlMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIG4gPSBuZXcgQmlnTnVtYmVyKG1kKTtcclxuICAgICAgICAgICAgICAgIEVSUk9SUyA9IGs7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCAhKCBrID0gbi5pc0ludCgpICkgfHwgbi5sdChPTkUpICkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoRVJST1JTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhaXNlKCAyMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAnbWF4IGRlbm9taW5hdG9yICcgKyAoIGsgPyAnb3V0IG9mIHJhbmdlJyA6ICdub3QgYW4gaW50ZWdlcicgKSwgbWQgKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEVSUk9SUyBpcyBmYWxzZTpcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiBtZCBpcyBhIGZpbml0ZSBub24taW50ZWdlciA+PSAxLCByb3VuZCBpdCB0byBhbiBpbnRlZ2VyIGFuZCB1c2UgaXQuXHJcbiAgICAgICAgICAgICAgICAgICAgbWQgPSAhayAmJiBuLmMgJiYgcm91bmQoIG4sIG4uZSArIDEsIDEgKS5ndGUoT05FKSA/IG4gOiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoICF4YyApIHJldHVybiB4LnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHMgPSBjb2VmZlRvU3RyaW5nKHhjKTtcclxuXHJcbiAgICAgICAgICAgIC8vIERldGVybWluZSBpbml0aWFsIGRlbm9taW5hdG9yLlxyXG4gICAgICAgICAgICAvLyBkIGlzIGEgcG93ZXIgb2YgMTAgYW5kIHRoZSBtaW5pbXVtIG1heCBkZW5vbWluYXRvciB0aGF0IHNwZWNpZmllcyB0aGUgdmFsdWUgZXhhY3RseS5cclxuICAgICAgICAgICAgZSA9IGQuZSA9IHMubGVuZ3RoIC0geC5lIC0gMTtcclxuICAgICAgICAgICAgZC5jWzBdID0gUE9XU19URU5bICggZXhwID0gZSAlIExPR19CQVNFICkgPCAwID8gTE9HX0JBU0UgKyBleHAgOiBleHAgXTtcclxuICAgICAgICAgICAgbWQgPSAhbWQgfHwgbi5jbXAoZCkgPiAwID8gKCBlID4gMCA/IGQgOiBuMSApIDogbjtcclxuXHJcbiAgICAgICAgICAgIGV4cCA9IE1BWF9FWFA7XHJcbiAgICAgICAgICAgIE1BWF9FWFAgPSAxIC8gMDtcclxuICAgICAgICAgICAgbiA9IG5ldyBCaWdOdW1iZXIocyk7XHJcblxyXG4gICAgICAgICAgICAvLyBuMCA9IGQxID0gMFxyXG4gICAgICAgICAgICBuMC5jWzBdID0gMDtcclxuXHJcbiAgICAgICAgICAgIGZvciAoIDsgOyApICB7XHJcbiAgICAgICAgICAgICAgICBxID0gZGl2KCBuLCBkLCAwLCAxICk7XHJcbiAgICAgICAgICAgICAgICBkMiA9IGQwLnBsdXMoIHEudGltZXMoZDEpICk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIGQyLmNtcChtZCkgPT0gMSApIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZDAgPSBkMTtcclxuICAgICAgICAgICAgICAgIGQxID0gZDI7XHJcbiAgICAgICAgICAgICAgICBuMSA9IG4wLnBsdXMoIHEudGltZXMoIGQyID0gbjEgKSApO1xyXG4gICAgICAgICAgICAgICAgbjAgPSBkMjtcclxuICAgICAgICAgICAgICAgIGQgPSBuLm1pbnVzKCBxLnRpbWVzKCBkMiA9IGQgKSApO1xyXG4gICAgICAgICAgICAgICAgbiA9IGQyO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBkMiA9IGRpdiggbWQubWludXMoZDApLCBkMSwgMCwgMSApO1xyXG4gICAgICAgICAgICBuMCA9IG4wLnBsdXMoIGQyLnRpbWVzKG4xKSApO1xyXG4gICAgICAgICAgICBkMCA9IGQwLnBsdXMoIGQyLnRpbWVzKGQxKSApO1xyXG4gICAgICAgICAgICBuMC5zID0gbjEucyA9IHgucztcclxuICAgICAgICAgICAgZSAqPSAyO1xyXG5cclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIHdoaWNoIGZyYWN0aW9uIGlzIGNsb3NlciB0byB4LCBuMC9kMCBvciBuMS9kMVxyXG4gICAgICAgICAgICBhcnIgPSBkaXYoIG4xLCBkMSwgZSwgUk9VTkRJTkdfTU9ERSApLm1pbnVzKHgpLmFicygpLmNtcChcclxuICAgICAgICAgICAgICAgICAgZGl2KCBuMCwgZDAsIGUsIFJPVU5ESU5HX01PREUgKS5taW51cyh4KS5hYnMoKSApIDwgMVxyXG4gICAgICAgICAgICAgICAgICAgID8gWyBuMS50b1N0cmluZygpLCBkMS50b1N0cmluZygpIF1cclxuICAgICAgICAgICAgICAgICAgICA6IFsgbjAudG9TdHJpbmcoKSwgZDAudG9TdHJpbmcoKSBdO1xyXG5cclxuICAgICAgICAgICAgTUFYX0VYUCA9IGV4cDtcclxuICAgICAgICAgICAgcmV0dXJuIGFycjtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGNvbnZlcnRlZCB0byBhIG51bWJlciBwcmltaXRpdmUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC50b051bWJlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuICt0aGlzO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiBhIEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgcmFpc2VkIHRvIHRoZSBwb3dlciBuLlxyXG4gICAgICAgICAqIElmIG0gaXMgcHJlc2VudCwgcmV0dXJuIHRoZSByZXN1bHQgbW9kdWxvIG0uXHJcbiAgICAgICAgICogSWYgbiBpcyBuZWdhdGl2ZSByb3VuZCBhY2NvcmRpbmcgdG8gREVDSU1BTF9QTEFDRVMgYW5kIFJPVU5ESU5HX01PREUuXHJcbiAgICAgICAgICogSWYgUE9XX1BSRUNJU0lPTiBpcyBub24temVybyBhbmQgbSBpcyBub3QgcHJlc2VudCwgcm91bmQgdG8gUE9XX1BSRUNJU0lPTiB1c2luZ1xyXG4gICAgICAgICAqIFJPVU5ESU5HX01PREUuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBUaGUgbW9kdWxhciBwb3dlciBvcGVyYXRpb24gd29ya3MgZWZmaWNpZW50bHkgd2hlbiB4LCBuLCBhbmQgbSBhcmUgcG9zaXRpdmUgaW50ZWdlcnMsXHJcbiAgICAgICAgICogb3RoZXJ3aXNlIGl0IGlzIGVxdWl2YWxlbnQgdG8gY2FsY3VsYXRpbmcgeC50b1Bvd2VyKG4pLm1vZHVsbyhtKSAod2l0aCBQT1dfUFJFQ0lTSU9OIDApLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogbiB7bnVtYmVyfSBJbnRlZ2VyLCAtTUFYX1NBRkVfSU5URUdFUiB0byBNQVhfU0FGRV9JTlRFR0VSIGluY2x1c2l2ZS5cclxuICAgICAgICAgKiBbbV0ge251bWJlcnxzdHJpbmd8QmlnTnVtYmVyfSBUaGUgbW9kdWx1cy5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqICdwb3coKSBleHBvbmVudCBub3QgYW4gaW50ZWdlcjoge259J1xyXG4gICAgICAgICAqICdwb3coKSBleHBvbmVudCBvdXQgb2YgcmFuZ2U6IHtufSdcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFBlcmZvcm1zIDU0IGxvb3AgaXRlcmF0aW9ucyBmb3IgbiBvZiA5MDA3MTk5MjU0NzQwOTkxLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAudG9Qb3dlciA9IFAucG93ID0gZnVuY3Rpb24gKCBuLCBtICkge1xyXG4gICAgICAgICAgICB2YXIgaywgeSwgeixcclxuICAgICAgICAgICAgICAgIGkgPSBtYXRoZmxvb3IoIG4gPCAwID8gLW4gOiArbiApLFxyXG4gICAgICAgICAgICAgICAgeCA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICBpZiAoIG0gIT0gbnVsbCApIHtcclxuICAgICAgICAgICAgICAgIGlkID0gMjM7XHJcbiAgICAgICAgICAgICAgICBtID0gbmV3IEJpZ051bWJlcihtKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gUGFzcyDCsUluZmluaXR5IHRvIE1hdGgucG93IGlmIGV4cG9uZW50IGlzIG91dCBvZiByYW5nZS5cclxuICAgICAgICAgICAgaWYgKCAhaXNWYWxpZEludCggbiwgLU1BWF9TQUZFX0lOVEVHRVIsIE1BWF9TQUZFX0lOVEVHRVIsIDIzLCAnZXhwb25lbnQnICkgJiZcclxuICAgICAgICAgICAgICAoICFpc0Zpbml0ZShuKSB8fCBpID4gTUFYX1NBRkVfSU5URUdFUiAmJiAoIG4gLz0gMCApIHx8XHJcbiAgICAgICAgICAgICAgICBwYXJzZUZsb2F0KG4pICE9IG4gJiYgISggbiA9IE5hTiApICkgfHwgbiA9PSAwICkge1xyXG4gICAgICAgICAgICAgICAgayA9IE1hdGgucG93KCAreCwgbiApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWdOdW1iZXIoIG0gPyBrICUgbSA6IGsgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKG0pIHtcclxuICAgICAgICAgICAgICAgIGlmICggbiA+IDEgJiYgeC5ndChPTkUpICYmIHguaXNJbnQoKSAmJiBtLmd0KE9ORSkgJiYgbS5pc0ludCgpICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSB4Lm1vZChtKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeiA9IG07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIE51bGxpZnkgbSBzbyBvbmx5IGEgc2luZ2xlIG1vZCBvcGVyYXRpb24gaXMgcGVyZm9ybWVkIGF0IHRoZSBlbmQuXHJcbiAgICAgICAgICAgICAgICAgICAgbSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoUE9XX1BSRUNJU0lPTikge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFRydW5jYXRpbmcgZWFjaCBjb2VmZmljaWVudCBhcnJheSB0byBhIGxlbmd0aCBvZiBrIGFmdGVyIGVhY2ggbXVsdGlwbGljYXRpb25cclxuICAgICAgICAgICAgICAgIC8vIGVxdWF0ZXMgdG8gdHJ1bmNhdGluZyBzaWduaWZpY2FudCBkaWdpdHMgdG8gUE9XX1BSRUNJU0lPTiArIFsyOCwgNDFdLFxyXG4gICAgICAgICAgICAgICAgLy8gaS5lLiB0aGVyZSB3aWxsIGJlIGEgbWluaW11bSBvZiAyOCBndWFyZCBkaWdpdHMgcmV0YWluZWQuXHJcbiAgICAgICAgICAgICAgICAvLyAoVXNpbmcgKyAxLjUgd291bGQgZ2l2ZSBbOSwgMjFdIGd1YXJkIGRpZ2l0cy4pXHJcbiAgICAgICAgICAgICAgICBrID0gbWF0aGNlaWwoIFBPV19QUkVDSVNJT04gLyBMT0dfQkFTRSArIDIgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgeSA9IG5ldyBCaWdOdW1iZXIoT05FKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoIDsgOyApIHtcclxuICAgICAgICAgICAgICAgIGlmICggaSAlIDIgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeSA9IHkudGltZXMoeCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCAheS5jICkgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCB5LmMubGVuZ3RoID4gayApIHkuYy5sZW5ndGggPSBrO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5ID0geS5tb2QobSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGkgPSBtYXRoZmxvb3IoIGkgLyAyICk7XHJcbiAgICAgICAgICAgICAgICBpZiAoICFpICkgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB4ID0geC50aW1lcyh4KTtcclxuICAgICAgICAgICAgICAgIGlmIChrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCB4LmMgJiYgeC5jLmxlbmd0aCA+IGsgKSB4LmMubGVuZ3RoID0gaztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSB4Lm1vZChtKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKG0pIHJldHVybiB5O1xyXG4gICAgICAgICAgICBpZiAoIG4gPCAwICkgeSA9IE9ORS5kaXYoeSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4geiA/IHkubW9kKHopIDogayA/IHJvdW5kKCB5LCBQT1dfUFJFQ0lTSU9OLCBST1VORElOR19NT0RFICkgOiB5O1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIHJvdW5kZWQgdG8gc2Qgc2lnbmlmaWNhbnQgZGlnaXRzXHJcbiAgICAgICAgICogdXNpbmcgcm91bmRpbmcgbW9kZSBybSBvciBST1VORElOR19NT0RFLiBJZiBzZCBpcyBsZXNzIHRoYW4gdGhlIG51bWJlciBvZiBkaWdpdHNcclxuICAgICAgICAgKiBuZWNlc3NhcnkgdG8gcmVwcmVzZW50IHRoZSBpbnRlZ2VyIHBhcnQgb2YgdGhlIHZhbHVlIGluIGZpeGVkLXBvaW50IG5vdGF0aW9uLCB0aGVuIHVzZVxyXG4gICAgICAgICAqIGV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogW3NkXSB7bnVtYmVyfSBTaWduaWZpY2FudCBkaWdpdHMuIEludGVnZXIsIDEgdG8gTUFYIGluY2x1c2l2ZS5cclxuICAgICAgICAgKiBbcm1dIHtudW1iZXJ9IFJvdW5kaW5nIG1vZGUuIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmUuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiAndG9QcmVjaXNpb24oKSBwcmVjaXNpb24gbm90IGFuIGludGVnZXI6IHtzZH0nXHJcbiAgICAgICAgICogJ3RvUHJlY2lzaW9uKCkgcHJlY2lzaW9uIG91dCBvZiByYW5nZToge3NkfSdcclxuICAgICAgICAgKiAndG9QcmVjaXNpb24oKSByb3VuZGluZyBtb2RlIG5vdCBhbiBpbnRlZ2VyOiB7cm19J1xyXG4gICAgICAgICAqICd0b1ByZWNpc2lvbigpIHJvdW5kaW5nIG1vZGUgb3V0IG9mIHJhbmdlOiB7cm19J1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAudG9QcmVjaXNpb24gPSBmdW5jdGlvbiAoIHNkLCBybSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdCggdGhpcywgc2QgIT0gbnVsbCAmJiBpc1ZhbGlkSW50KCBzZCwgMSwgTUFYLCAyNCwgJ3ByZWNpc2lvbicgKVxyXG4gICAgICAgICAgICAgID8gc2QgfCAwIDogbnVsbCwgcm0sIDI0ICk7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaW4gYmFzZSBiLCBvciBiYXNlIDEwIGlmIGIgaXNcclxuICAgICAgICAgKiBvbWl0dGVkLiBJZiBhIGJhc2UgaXMgc3BlY2lmaWVkLCBpbmNsdWRpbmcgYmFzZSAxMCwgcm91bmQgYWNjb3JkaW5nIHRvIERFQ0lNQUxfUExBQ0VTIGFuZFxyXG4gICAgICAgICAqIFJPVU5ESU5HX01PREUuIElmIGEgYmFzZSBpcyBub3Qgc3BlY2lmaWVkLCBhbmQgdGhpcyBCaWdOdW1iZXIgaGFzIGEgcG9zaXRpdmUgZXhwb25lbnRcclxuICAgICAgICAgKiB0aGF0IGlzIGVxdWFsIHRvIG9yIGdyZWF0ZXIgdGhhbiBUT19FWFBfUE9TLCBvciBhIG5lZ2F0aXZlIGV4cG9uZW50IGVxdWFsIHRvIG9yIGxlc3MgdGhhblxyXG4gICAgICAgICAqIFRPX0VYUF9ORUcsIHJldHVybiBleHBvbmVudGlhbCBub3RhdGlvbi5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFtiXSB7bnVtYmVyfSBJbnRlZ2VyLCAyIHRvIDY0IGluY2x1c2l2ZS5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqICd0b1N0cmluZygpIGJhc2Ugbm90IGFuIGludGVnZXI6IHtifSdcclxuICAgICAgICAgKiAndG9TdHJpbmcoKSBiYXNlIG91dCBvZiByYW5nZToge2J9J1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAudG9TdHJpbmcgPSBmdW5jdGlvbiAoYikge1xyXG4gICAgICAgICAgICB2YXIgc3RyLFxyXG4gICAgICAgICAgICAgICAgbiA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBzID0gbi5zLFxyXG4gICAgICAgICAgICAgICAgZSA9IG4uZTtcclxuXHJcbiAgICAgICAgICAgIC8vIEluZmluaXR5IG9yIE5hTj9cclxuICAgICAgICAgICAgaWYgKCBlID09PSBudWxsICkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RyID0gJ0luZmluaXR5JztcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIHMgPCAwICkgc3RyID0gJy0nICsgc3RyO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHIgPSAnTmFOJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHN0ciA9IGNvZWZmVG9TdHJpbmcoIG4uYyApO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICggYiA9PSBudWxsIHx8ICFpc1ZhbGlkSW50KCBiLCAyLCA2NCwgMjUsICdiYXNlJyApICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0ciA9IGUgPD0gVE9fRVhQX05FRyB8fCBlID49IFRPX0VYUF9QT1NcclxuICAgICAgICAgICAgICAgICAgICAgID8gdG9FeHBvbmVudGlhbCggc3RyLCBlIClcclxuICAgICAgICAgICAgICAgICAgICAgIDogdG9GaXhlZFBvaW50KCBzdHIsIGUgKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RyID0gY29udmVydEJhc2UoIHRvRml4ZWRQb2ludCggc3RyLCBlICksIGIgfCAwLCAxMCwgcyApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICggcyA8IDAgJiYgbi5jWzBdICkgc3RyID0gJy0nICsgc3RyO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIHRydW5jYXRlZCB0byBhIHdob2xlXHJcbiAgICAgICAgICogbnVtYmVyLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAudHJ1bmNhdGVkID0gUC50cnVuYyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJvdW5kKCBuZXcgQmlnTnVtYmVyKHRoaXMpLCB0aGlzLmUgKyAxLCAxICk7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiBhcyB0b1N0cmluZywgYnV0IGRvIG5vdCBhY2NlcHQgYSBiYXNlIGFyZ3VtZW50LCBhbmQgaW5jbHVkZSB0aGUgbWludXMgc2lnbiBmb3JcclxuICAgICAgICAgKiBuZWdhdGl2ZSB6ZXJvLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAudmFsdWVPZiA9IFAudG9KU09OID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgc3RyLFxyXG4gICAgICAgICAgICAgICAgbiA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBlID0gbi5lO1xyXG5cclxuICAgICAgICAgICAgaWYgKCBlID09PSBudWxsICkgcmV0dXJuIG4udG9TdHJpbmcoKTtcclxuXHJcbiAgICAgICAgICAgIHN0ciA9IGNvZWZmVG9TdHJpbmcoIG4uYyApO1xyXG5cclxuICAgICAgICAgICAgc3RyID0gZSA8PSBUT19FWFBfTkVHIHx8IGUgPj0gVE9fRVhQX1BPU1xyXG4gICAgICAgICAgICAgICAgPyB0b0V4cG9uZW50aWFsKCBzdHIsIGUgKVxyXG4gICAgICAgICAgICAgICAgOiB0b0ZpeGVkUG9pbnQoIHN0ciwgZSApO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG4ucyA8IDAgPyAnLScgKyBzdHIgOiBzdHI7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8vIEFsaWFzZXMgZm9yIEJpZ0RlY2ltYWwgbWV0aG9kcy5cclxuICAgICAgICAvL1AuYWRkID0gUC5wbHVzOyAgICAgICAgIC8vIFAuYWRkIGluY2x1ZGVkIGFib3ZlXHJcbiAgICAgICAgLy9QLnN1YnRyYWN0ID0gUC5taW51czsgICAvLyBQLnN1YiBpbmNsdWRlZCBhYm92ZVxyXG4gICAgICAgIC8vUC5tdWx0aXBseSA9IFAudGltZXM7ICAgLy8gUC5tdWwgaW5jbHVkZWQgYWJvdmVcclxuICAgICAgICAvL1AuZGl2aWRlID0gUC5kaXY7XHJcbiAgICAgICAgLy9QLnJlbWFpbmRlciA9IFAubW9kO1xyXG4gICAgICAgIC8vUC5jb21wYXJlVG8gPSBQLmNtcDtcclxuICAgICAgICAvL1AubmVnYXRlID0gUC5uZWc7XHJcblxyXG5cclxuICAgICAgICBpZiAoIGNvbmZpZ09iaiAhPSBudWxsICkgQmlnTnVtYmVyLmNvbmZpZyhjb25maWdPYmopO1xyXG5cclxuICAgICAgICByZXR1cm4gQmlnTnVtYmVyO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBQUklWQVRFIEhFTFBFUiBGVU5DVElPTlNcclxuXHJcblxyXG4gICAgZnVuY3Rpb24gYml0Rmxvb3Iobikge1xyXG4gICAgICAgIHZhciBpID0gbiB8IDA7XHJcbiAgICAgICAgcmV0dXJuIG4gPiAwIHx8IG4gPT09IGkgPyBpIDogaSAtIDE7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIFJldHVybiBhIGNvZWZmaWNpZW50IGFycmF5IGFzIGEgc3RyaW5nIG9mIGJhc2UgMTAgZGlnaXRzLlxyXG4gICAgZnVuY3Rpb24gY29lZmZUb1N0cmluZyhhKSB7XHJcbiAgICAgICAgdmFyIHMsIHosXHJcbiAgICAgICAgICAgIGkgPSAxLFxyXG4gICAgICAgICAgICBqID0gYS5sZW5ndGgsXHJcbiAgICAgICAgICAgIHIgPSBhWzBdICsgJyc7XHJcblxyXG4gICAgICAgIGZvciAoIDsgaSA8IGo7ICkge1xyXG4gICAgICAgICAgICBzID0gYVtpKytdICsgJyc7XHJcbiAgICAgICAgICAgIHogPSBMT0dfQkFTRSAtIHMubGVuZ3RoO1xyXG4gICAgICAgICAgICBmb3IgKCA7IHotLTsgcyA9ICcwJyArIHMgKTtcclxuICAgICAgICAgICAgciArPSBzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAoIGogPSByLmxlbmd0aDsgci5jaGFyQ29kZUF0KC0taikgPT09IDQ4OyApO1xyXG4gICAgICAgIHJldHVybiByLnNsaWNlKCAwLCBqICsgMSB8fCAxICk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIENvbXBhcmUgdGhlIHZhbHVlIG9mIEJpZ051bWJlcnMgeCBhbmQgeS5cclxuICAgIGZ1bmN0aW9uIGNvbXBhcmUoIHgsIHkgKSB7XHJcbiAgICAgICAgdmFyIGEsIGIsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICB5YyA9IHkuYyxcclxuICAgICAgICAgICAgaSA9IHgucyxcclxuICAgICAgICAgICAgaiA9IHkucyxcclxuICAgICAgICAgICAgayA9IHguZSxcclxuICAgICAgICAgICAgbCA9IHkuZTtcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIE5hTj9cclxuICAgICAgICBpZiAoICFpIHx8ICFqICkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgIGEgPSB4YyAmJiAheGNbMF07XHJcbiAgICAgICAgYiA9IHljICYmICF5Y1swXTtcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgaWYgKCBhIHx8IGIgKSByZXR1cm4gYSA/IGIgPyAwIDogLWogOiBpO1xyXG5cclxuICAgICAgICAvLyBTaWducyBkaWZmZXI/XHJcbiAgICAgICAgaWYgKCBpICE9IGogKSByZXR1cm4gaTtcclxuXHJcbiAgICAgICAgYSA9IGkgPCAwO1xyXG4gICAgICAgIGIgPSBrID09IGw7XHJcblxyXG4gICAgICAgIC8vIEVpdGhlciBJbmZpbml0eT9cclxuICAgICAgICBpZiAoICF4YyB8fCAheWMgKSByZXR1cm4gYiA/IDAgOiAheGMgXiBhID8gMSA6IC0xO1xyXG5cclxuICAgICAgICAvLyBDb21wYXJlIGV4cG9uZW50cy5cclxuICAgICAgICBpZiAoICFiICkgcmV0dXJuIGsgPiBsIF4gYSA/IDEgOiAtMTtcclxuXHJcbiAgICAgICAgaiA9ICggayA9IHhjLmxlbmd0aCApIDwgKCBsID0geWMubGVuZ3RoICkgPyBrIDogbDtcclxuXHJcbiAgICAgICAgLy8gQ29tcGFyZSBkaWdpdCBieSBkaWdpdC5cclxuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGo7IGkrKyApIGlmICggeGNbaV0gIT0geWNbaV0gKSByZXR1cm4geGNbaV0gPiB5Y1tpXSBeIGEgPyAxIDogLTE7XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgbGVuZ3Rocy5cclxuICAgICAgICByZXR1cm4gayA9PSBsID8gMCA6IGsgPiBsIF4gYSA/IDEgOiAtMTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIG4gaXMgYSB2YWxpZCBudW1iZXIgaW4gcmFuZ2UsIG90aGVyd2lzZSBmYWxzZS5cclxuICAgICAqIFVzZSBmb3IgYXJndW1lbnQgdmFsaWRhdGlvbiB3aGVuIEVSUk9SUyBpcyBmYWxzZS5cclxuICAgICAqIE5vdGU6IHBhcnNlSW50KCcxZSsxJykgPT0gMSBidXQgcGFyc2VGbG9hdCgnMWUrMScpID09IDEwLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBpbnRWYWxpZGF0b3JOb0Vycm9ycyggbiwgbWluLCBtYXggKSB7XHJcbiAgICAgICAgcmV0dXJuICggbiA9IHRydW5jYXRlKG4pICkgPj0gbWluICYmIG4gPD0gbWF4O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBpc0FycmF5KG9iaikge1xyXG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCBBcnJheV0nO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogQ29udmVydCBzdHJpbmcgb2YgYmFzZUluIHRvIGFuIGFycmF5IG9mIG51bWJlcnMgb2YgYmFzZU91dC5cclxuICAgICAqIEVnLiBjb252ZXJ0QmFzZSgnMjU1JywgMTAsIDE2KSByZXR1cm5zIFsxNSwgMTVdLlxyXG4gICAgICogRWcuIGNvbnZlcnRCYXNlKCdmZicsIDE2LCAxMCkgcmV0dXJucyBbMiwgNSwgNV0uXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHRvQmFzZU91dCggc3RyLCBiYXNlSW4sIGJhc2VPdXQgKSB7XHJcbiAgICAgICAgdmFyIGosXHJcbiAgICAgICAgICAgIGFyciA9IFswXSxcclxuICAgICAgICAgICAgYXJyTCxcclxuICAgICAgICAgICAgaSA9IDAsXHJcbiAgICAgICAgICAgIGxlbiA9IHN0ci5sZW5ndGg7XHJcblxyXG4gICAgICAgIGZvciAoIDsgaSA8IGxlbjsgKSB7XHJcbiAgICAgICAgICAgIGZvciAoIGFyckwgPSBhcnIubGVuZ3RoOyBhcnJMLS07IGFyclthcnJMXSAqPSBiYXNlSW4gKTtcclxuICAgICAgICAgICAgYXJyWyBqID0gMCBdICs9IEFMUEhBQkVULmluZGV4T2YoIHN0ci5jaGFyQXQoIGkrKyApICk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKCA7IGogPCBhcnIubGVuZ3RoOyBqKysgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCBhcnJbal0gPiBiYXNlT3V0IC0gMSApIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIGFycltqICsgMV0gPT0gbnVsbCApIGFycltqICsgMV0gPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGFycltqICsgMV0gKz0gYXJyW2pdIC8gYmFzZU91dCB8IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJyW2pdICU9IGJhc2VPdXQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBhcnIucmV2ZXJzZSgpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBmdW5jdGlvbiB0b0V4cG9uZW50aWFsKCBzdHIsIGUgKSB7XHJcbiAgICAgICAgcmV0dXJuICggc3RyLmxlbmd0aCA+IDEgPyBzdHIuY2hhckF0KDApICsgJy4nICsgc3RyLnNsaWNlKDEpIDogc3RyICkgK1xyXG4gICAgICAgICAgKCBlIDwgMCA/ICdlJyA6ICdlKycgKSArIGU7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIHRvRml4ZWRQb2ludCggc3RyLCBlICkge1xyXG4gICAgICAgIHZhciBsZW4sIHo7XHJcblxyXG4gICAgICAgIC8vIE5lZ2F0aXZlIGV4cG9uZW50P1xyXG4gICAgICAgIGlmICggZSA8IDAgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBQcmVwZW5kIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKCB6ID0gJzAuJzsgKytlOyB6ICs9ICcwJyApO1xyXG4gICAgICAgICAgICBzdHIgPSB6ICsgc3RyO1xyXG5cclxuICAgICAgICAvLyBQb3NpdGl2ZSBleHBvbmVudFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxlbiA9IHN0ci5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICAvLyBBcHBlbmQgemVyb3MuXHJcbiAgICAgICAgICAgIGlmICggKytlID4gbGVuICkge1xyXG4gICAgICAgICAgICAgICAgZm9yICggeiA9ICcwJywgZSAtPSBsZW47IC0tZTsgeiArPSAnMCcgKTtcclxuICAgICAgICAgICAgICAgIHN0ciArPSB6O1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCBlIDwgbGVuICkge1xyXG4gICAgICAgICAgICAgICAgc3RyID0gc3RyLnNsaWNlKCAwLCBlICkgKyAnLicgKyBzdHIuc2xpY2UoZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzdHI7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIHRydW5jYXRlKG4pIHtcclxuICAgICAgICBuID0gcGFyc2VGbG9hdChuKTtcclxuICAgICAgICByZXR1cm4gbiA8IDAgPyBtYXRoY2VpbChuKSA6IG1hdGhmbG9vcihuKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gRVhQT1JUXHJcblxyXG5cclxuICAgIEJpZ051bWJlciA9IGNvbnN0cnVjdG9yRmFjdG9yeSgpO1xyXG4gICAgQmlnTnVtYmVyLmRlZmF1bHQgPSBCaWdOdW1iZXIuQmlnTnVtYmVyID0gQmlnTnVtYmVyO1xyXG5cclxuXHJcbiAgICAvLyBBTUQuXHJcbiAgICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xyXG4gICAgICAgIGRlZmluZSggZnVuY3Rpb24gKCkgeyByZXR1cm4gQmlnTnVtYmVyOyB9ICk7XHJcblxyXG4gICAgLy8gTm9kZS5qcyBhbmQgb3RoZXIgZW52aXJvbm1lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cy5cclxuICAgIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XHJcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBCaWdOdW1iZXI7XHJcblxyXG4gICAgICAgIC8vIFNwbGl0IHN0cmluZyBzdG9wcyBicm93c2VyaWZ5IGFkZGluZyBjcnlwdG8gc2hpbS5cclxuICAgICAgICBpZiAoICFjcnlwdG9PYmogKSB0cnkgeyBjcnlwdG9PYmogPSByZXF1aXJlKCdjcnknICsgJ3B0bycpOyB9IGNhdGNoIChlKSB7fVxyXG5cclxuICAgIC8vIEJyb3dzZXIuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmICggIWdsb2JhbE9iaiApIGdsb2JhbE9iaiA9IHR5cGVvZiBzZWxmICE9ICd1bmRlZmluZWQnID8gc2VsZiA6IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XHJcbiAgICAgICAgZ2xvYmFsT2JqLkJpZ051bWJlciA9IEJpZ051bWJlcjtcclxuICAgIH1cclxufSkodGhpcyk7XHJcbiIsImNvbnN0IEJpZ051bWJlciA9IHJlcXVpcmUoJ2JpZ251bWJlci5qcycpO1xuXG5jbGFzcyBVdGlscyB7XG5cbiAgc3RhdGljIGlzTnVtKG51bSkge1xuICAgIHJldHVybiAobnVtICE9IG51bGwpICYmICh0eXBlb2YgbnVtID09PSAnbnVtYmVyJyk7XG4gIH1cblxuICBzdGF0aWMgaXNBcnIoYXJyKSB7XG4gICAgcmV0dXJuIChhcnIgIT0gbnVsbCkgJiYgYXJyIGluc3RhbmNlb2YgQXJyYXk7XG4gIH1cblxuICBzdGF0aWMgaXNBcnJPZk51bXMoYXJyKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNBcnIoYXJyKSAmJiBfLmV2ZXJ5KGFyciwgbiA9PiBfLmlzRmluaXRlKG4pKTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRTdXBlcnNjcmlwdChpZCkge1xuICAgIGNvbnN0IHN1cGVyc2NyaXB0ID0gWzgzMDQsIDE4NSwgMTc4LCAxNzksIDgzMDgsIDgzMDksIDgzMTAsIDgzMTEsIDgzMTIsIDgzMTNdOyAvLyAn4oGwwrnCssKz4oG04oG14oG24oG34oG44oG5J1xuICAgIGxldCBzcyA9ICcnO1xuICAgIHdoaWxlIChpZCA+IDApIHtcbiAgICAgIGNvbnN0IGRpZ2l0ID0gaWQgJSAxMDtcbiAgICAgIHNzID0gU3RyaW5nLmZyb21DaGFyQ29kZShzdXBlcnNjcmlwdFtpZCAlIDEwXSkgKyBzcztcbiAgICAgIGlkID0gKGlkIC0gZGlnaXQpIC8gMTA7XG4gICAgfVxuICAgIHJldHVybiBzcztcbiAgfVxuXG4gIHN0YXRpYyBnZXRGb3JtYXR0ZWROdW0obnVtLCBkZWNpbWFscywgcHJlZml4LCBzdWZmaXgpIHtcbiAgICByZXR1cm4gcHJlZml4ICsgKG5ldyBCaWdOdW1iZXIobnVtKSkudG9Gb3JtYXQoZGVjaW1hbHMpICsgc3VmZml4O1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVXRpbHM7XG4iXX0=

//# sourceMappingURL=../utils/Utils.es6.js.map