// from https://www.xarg.org/2016/07/calculate-the-intersection-area-of-two-circles/
const areaOfIntersection = (A, B) => {
  const d = Math.hypot(B.x - A.x, B.y - A.y)

  if (d < (A.r + B.r)) {
    const a = A.r * A.r
    const b = B.r * B.r

    const x = (a - b + d * d) / (2 * d)
    const z = x * x
    const y = Math.sqrt(a - z)

    if (d <= Math.abs(B.r - A.r)) {
      return Math.PI * Math.min(a, b)
    }
    return a * Math.asin(y / A.r) + b * Math.asin(y / B.r) - y * (x + Math.sqrt(z + b - a))
  }
  return 0
}

module.exports = areaOfIntersection
