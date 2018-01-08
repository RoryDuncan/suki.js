export const easings = {
  
  linear: function(n){
    return n
  },
  
  inQuad: function(n){
    return n * n
  },
  
  outQuad: function(n){
    return n * (2 - n)
  },
  
  inOutQuad: function(n){
    n *= 2
    if (n < 1) return 0.5 * n * n
    return - 0.5 * (--n * (n - 2) - 1)
  },
  
  inCube: function(n){
    return n * n * n
  },
  
  outCube: function(n){
    return --n * n * n + 1
  },
  
  inOutCube: function(n){
    n *= 2
    if (n < 1) return 0.5 * n * n * n
    return 0.5 * ((n -= 2 ) * n * n + 2)
  },
  
  inQuart: function(n){
    return n * n * n * n
  },
  
  outQuart: function(n){
    return 1 - (--n * n * n * n)
  },
  
  inOutQuart: function(n){
    n *= 2
    if (n < 1) return 0.5 * n * n * n * n
    return -0.5 * ((n -= 2) * n * n * n - 2)
  },
  
  inQuint: function(n){
    return n * n * n * n * n
  },
  
  outQuint: function(n){
    return --n * n * n * n * n + 1
  },
  
  inOutQuint: function(n){
    n *= 2
    if (n < 1) return 0.5 * n * n * n * n * n
    return 0.5 * ((n -= 2) * n * n * n * n + 2)
  },
  
  inSine: function(n){
    return 1 - Math.cos(n * Math.PI / 2 )
  },
  
  outSine: function(n){
    return Math.sin(n * Math.PI / 2)
  },
  
  inOutSine: function(n){
    return .5 * (1 - Math.cos(Math.PI * n))
  },
  
  inExpo: function(n){
    return 0 == n ? 0 : Math.pow(1024, n - 1);
  },
  
  outExpo: function(n){
    return 1 == n ? n : 1 - Math.pow(2, -10 * n);
  },
  
  inOutExpo: function(n){
    if (0 == n) return 0
    if (1 == n) return 1
    if ((n *= 2) < 1) return .5 * Math.pow(1024, n - 1)
    return .5 * (-Math.pow(2, -10 * (n - 1)) + 2)
  },
  
  inCirc: function(n){
    return 1 - Math.sqrt(1 - n * n)
  },
  
  outCirc: function(n){
    return Math.sqrt(1 - (--n * n))
  },
  
  inOutCirc: function(n){
    n *= 2
    if (n < 1) return -0.5 * (Math.sqrt(1 - n * n) - 1)
    return 0.5 * (Math.sqrt(1 - (n -= 2) * n) + 1)
  },
  
  inBack: function(n){
    var s = 1.70158
    return n * n * (( s + 1 ) * n - s)
  },
  
  outBack: function(n){
    var s = 1.70158
    return --n * n * ((s + 1) * n + s) + 1
  },
  
  inOutBack: function(n){
    var s = 1.70158 * 1.525
    if ( ( n *= 2 ) < 1 ) return 0.5 * ( n * n * ( ( s + 1 ) * n - s ) )
    return 0.5 * ( ( n -= 2 ) * n * ( ( s + 1 ) * n + s ) + 2 )
  },
  
  inBounce: function(n){
    return 1 - easings.outBounce(1 - n)
  },
  
  outBounce: function(n){
    if ( n < ( 1 / 2.75 ) ) {
      return 7.5625 * n * n
    } else if ( n < ( 2 / 2.75 ) ) {
      return 7.5625 * ( n -= ( 1.5 / 2.75 ) ) * n + 0.75
    } else if ( n < ( 2.5 / 2.75 ) ) {
      return 7.5625 * ( n -= ( 2.25 / 2.75 ) ) * n + 0.9375
    } else {
      return 7.5625 * ( n -= ( 2.625 / 2.75 ) ) * n + 0.984375
    }
  },
  
  inOutBounce: function(n){
    if (n < .5) return easings.inBounce(n * 2) * .5
    return easings.outBounce(n * 2 - 1) * .5 + .5
  },
  
  inElastic: function(n){
    var s, a = 0.1, p = 0.4
    if ( n === 0 ) return 0
    if ( n === 1 ) return 1
    if ( !a || a < 1 ) { a = 1; s = p / 4 }
    else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI )
    return - ( a * Math.pow( 2, 10 * ( n -= 1 ) ) * Math.sin( ( n - s ) * ( 2 * Math.PI ) / p ) )
  },
  
  outElastic: function(n){
    var s, a = 0.1, p = 0.4
    if ( n === 0 ) return 0
    if ( n === 1 ) return 1
    if ( !a || a < 1 ) { a = 1; s = p / 4 }
    else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI )
    return ( a * Math.pow( 2, - 10 * n) * Math.sin( ( n - s ) * ( 2 * Math.PI ) / p ) + 1 )
  },
  
  inOutElastic: function(n){
    var s, a = 0.1, p = 0.4
    if ( n === 0 ) return 0
    if ( n === 1 ) return 1
    if ( !a || a < 1 ) { a = 1; s = p / 4 }
    else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI )
    if ( ( n *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( n -= 1 ) ) * Math.sin( ( n - s ) * ( 2 * Math.PI ) / p ) )
    return a * Math.pow( 2, -10 * ( n -= 1 ) ) * Math.sin( ( n - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1
  },
}

export default (name, n) => easings[name](n)