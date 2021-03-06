module.exports = {
  pointPointDistance: function (a, b) {
    return Math.sqrt(this.pointPointDistance2(a, b));
  },

  pointPointDistance2: function (a, b) {
    var x1 = a.get_x();
    var x2 = b.get_x();
    var y1 = a.get_y();
    var y2 = b.get_y();

    return this.square(x1 - x2) + this.square(y1 - y2);
  },

  square: function (x) {
    return x * x;
  },

  linePointDistance: function (lineA, lineB, point) {
    var length2 = this.pointPointDistance2(lineA, lineB);
    var xA = lineA.get_x();
    var xB = lineB.get_x();
    var xP = point.get_x();
    var yA = lineA.get_y();
    var yB = lineB.get_y();
    var yP = point.get_y();

    if (length2 === 0) return this.pointPointDistance2(point, lineA);

    var t = ((xP - xA) * (xB - xA) + (yP - yA) * (yB - yA)) / length2;
    t = Math.max(0, Math.min(1, t));

    return this.pointPointDistance(point, new b2Vec2(xA + t * (xB - xA), yA + t * (yB - yA)));
  },

  pointRotate: function (origin, point, angle) {
    angle = -angle; // Cartesian to screen coordinate system
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var ox = origin.get_x();
    var oy = origin.get_y();
    var x = point.get_x();
    var y = point.get_y();

    return new b2Vec2(
      (cos * (x - ox)) + (sin * (y - oy)) + ox,
      (cos * (y - oy)) - (sin * (x - ox)) + oy
    );
  },

  findAngle: function (pointA, pointB, center) {
    var xA = pointA.get_x();
    var xB = pointB.get_x();
    var xC = center.get_x();
    var yA = pointA.get_y();
    var yB = pointB.get_y();
    var yC = center.get_y();

    var AC = Math.sqrt(Math.pow(xC - xA, 2) + Math.pow(yC - yA, 2));
    var CB = Math.sqrt(Math.pow(xC - xB, 2) + Math.pow(yC - yB, 2));
    var AB = Math.sqrt(Math.pow(xB - xA, 2) + Math.pow(yB - yA, 2));

    return Math.acos((CB * CB + AC * AC - AB * AB) / (2 * CB * AC));
  },
  
  findAngleWithNegative: function (oldPoint, newPoint, center) {
    var xC = center.get_x();
    var yC = center.get_y();
    var xO = oldPoint.get_x();
    var yO = oldPoint.get_y();
    var xN = newPoint.get_x();
    var yN = newPoint.get_y();

    var v1x = xO - xC;
    var v1y = yO - yC;
    var v2x = xN - xC;
    var v2y = yN - yC;

    return Math.atan2(v1x, v1y) - Math.atan2(v2x, v2y);
  },

  toDegrees: function (radians) {
    return radians * (180 / Math.PI);
  },

  toRadians: function (degrees) {
    return degrees * (Math.PI / 180);
  },
  
  clampDegrees: function (angle) {
    return ((angle % 360) + 360) % 360;
  },
  
  clampRadians: function (angle) {
    return ((angle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
  }
};