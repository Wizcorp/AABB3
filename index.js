
function AABB3(bounds){ // Array under the form: [left, right, bottom, top, front, rear]
	this.set(bounds);
}

AABB3.prototype.set = function (bounds) {
	this.bounds = bounds;
	this.volume = (bounds[1] - bounds[0]) * (bounds[3] - bounds[2]) * (bounds[5] - bounds[4]);
	return this;
};

AABB3.prototype.expands = function (p) {
	var x = p.x;
	var y = p.y;
	var z = p.z;
	if (this.bounds[0] > x) { this.bounds[0] = x; }
	if (this.bounds[1] < x) { this.bounds[1] = x; }
	if (this.bounds[2] > y) { this.bounds[2] = y; }
	if (this.bounds[3] < y) { this.bounds[3] = y; }
	if (this.bounds[4] > z) { this.bounds[4] = z; }
	if (this.bounds[5] < z) { this.bounds[5] = z; }
};

AABB3.prototype.updateVolume = function () {
	this.volume = (this.bounds[1] - this.bounds[0]) * (this.bounds[3] - this.bounds[2]) * (this.bounds[5] - this.bounds[4]);
};

// Overridable method
AABB3.prototype.updateBounds = function () {};

AABB3.prototype.enclose = function (a, b) {
	var boundsA = a.bounds;
	var boundsB = b.bounds;
	var x0 = Math.min(boundsA[0], boundsB[0]);
	var x1 = Math.max(boundsA[1], boundsB[1]);
	var y0 = Math.min(boundsA[2], boundsB[2]);
	var y1 = Math.max(boundsA[3], boundsB[3]);
	var z0 = Math.min(boundsA[4], boundsB[4]);
	var z1 = Math.max(boundsA[5], boundsB[5]);
	this.bounds[0] = x0;
	this.bounds[1] = x1;
	this.bounds[2] = y0;
	this.bounds[3] = y1;
	this.bounds[4] = z0;
	this.bounds[5] = z1;
	this.volume = (x1 - x0) * (y1 - y0) * (z1 - z0);
	return this;
};

// Static methods
AABB3.enclosingVolume = function (a, b) {
	var boundsA = a.bounds;
	var boundsB = b.bounds;
	return (Math.max(boundsB[1], boundsA[1]) - Math.min(boundsB[0], boundsA[0])) *
		   (Math.max(boundsB[3], boundsA[3]) - Math.min(boundsB[2], boundsA[2])) *
		   (Math.max(boundsB[5], boundsA[5]) - Math.min(boundsB[4], boundsA[4]));
};

AABB3.enclosingAABB = function (a, b) {
	var boundsA = a.bounds;
	var boundsB = b.bounds;
	var x0 = Math.min(boundsA[0], boundsB[0]);
	var x1 = Math.max(boundsA[1], boundsB[1]);
	var y0 = Math.min(boundsA[2], boundsB[2]);
	var y1 = Math.max(boundsA[3], boundsB[3]);
	var z0 = Math.min(boundsA[4], boundsB[4]);
	var z1 = Math.max(boundsA[5], boundsB[5]);
	return new AABB3([x0, x1, y0, y1, z0, z1]);
};

AABB3.prototype.intersectsWithAABB = function (aabb) {
	var bounds = aabb.bounds;

	if ((this.bounds[0] - bounds[1]) * (this.bounds[1] - bounds[0]) > 0) {
		// Not overlapping on x
		return false;
	}

	if ((this.bounds[2] - bounds[3]) * (this.bounds[3] - bounds[2]) > 0) {
		// Not overlapping on y
		return false;
	}

	if ((this.bounds[4] - bounds[5]) * (this.bounds[5] - bounds[4]) > 0) {
		// Not overlapping on z
		return false;
	}

	return true;
};

AABB3.prototype.intersectsWithFrustum = function (frustum) {
	// Checking for overlap with bounding box of the frustum
	var frustumBounds = frustum.bounds;

	var x0 = this.bounds[0];
	var x1 = this.bounds[1];
	if ((x0 - frustumBounds[1]) * (x1 - frustumBounds[0]) > 0) {
		// No overlap in x
		return false;
	}

	var y0 = this.bounds[2];
	var y1 = this.bounds[3];
	if ((y0 - frustumBounds[3]) * (y1 - frustumBounds[2]) > 0) {
		// No overlap in y
		return false;
	}

	var z0 = this.bounds[4];
	var z1 = this.bounds[5];
	if ((z0 - frustumBounds[5]) * (z1 - frustumBounds[4]) > 0) {
		// No overlap in y
		return false;
	}

	// Checking for overlap with the frustum
	var planes = frustum._planes;
	for (var f = 0; f < planes.length; f += 1) {
		var plane = planes[f];

		var nx = plane.x;
		var ny = plane.y;
		var nz = plane.z;

		var m = ((x1 + x0) * nx + (y1 + y0) * ny + (z1 + z0) * nz) * 0.5 + plane.w;
		var n = ((x1 - x0) * Math.abs(nx) + (y1 - y0) * Math.abs(ny) + (z1 - z0) * Math.abs(nz)) * 0.5;

		if (m + n < 0) {
			// AABB outside frustum
			return false;
		}

		// if (m - n < 0) {
		//	// AABB intersects with plane
		//	// N.B it does not necessary intersects with finite frustum
		// 	return true;
		// }
	}

	// AABB inside frustum
	return true;
};

AABB3.prototype.intersectsWithSegment = function (segment) {
	if (this.bounds[0] >= this.bounds[1]) {
		return false;
	}

	// Testing Whether bounds overlap with segment's bounds
	var sx0 = segment[0];
	var sx1 = segment[1];

	var bx0 = this.bounds[0];
	var bx1 = this.bounds[1];

	var xOverlap = (sx0 < sx1) ? (bx0 - sx1) * (bx1 - sx0) : (bx0 - sx0) * (bx1 - sx1);
	if (xOverlap > 0) {
		// No overlap in x
		return false;
	}

	var sy0 = segment[2];
	var sy1 = segment[3];

	var by0 = this.bounds[2];
	var by1 = this.bounds[3];

	var yOverlap = (sy0 < sy1) ? (by0 - sy1) * (by1 - sy0) : (by0 - sy0) * (by1 - sy1);
	if (yOverlap > 0) {
		// No overlap in y
		return false;
	}
	
	var sz0 = segment[4];
	var sz1 = segment[5];

	var bz0 = this.bounds[4];
	var bz1 = this.bounds[5];

	var zOverlap = (sz0 < sz1) ? (bz0 - sz1) * (bz1 - sz0) : (bz0 - sz0) * (bz1 - sz1);
	if (zOverlap > 0) {
		// No overlap in z
		return false;
	}

	// Testing whether the segment crosses the bounds
	var dx = sx1 - sx0;
	var dy = sy1 - sy0;
	var dz = sz1 - sz0;

	if ((dx === 0) || (dy === 0) || (dz === 0)) {
		return true;
	}

	// Line intersects with aabb if aabb overlaps with
	// its projections of left and right side on the line on y and z axis

	// Line on plane (x, y) is under the form y = y0 + x * cy
	var cy = dy / dx;

	// Origin of the line in y (when x = 0)
	var y0 = sy0 - sx0 * cy;

	// Projection of bx0 and bx1 onto the line in y
	var py0 = y0 + bx0 * cy;
	var py1 = y0 + bx1 * cy;

	// Testing overlap of projection on y of the bounds of the aabb in x with the bounds of the aabb in y
	var intersects = (py0 < py1) ? ((by0 - py1) * (by1 - py0) <= 0) : ((by0 - py0) * (by1 - py1) <= 0);
	if (intersects) {
		// Line on plane (x, z) is under the form z = z0 + x * cz
		var cz = dz / dx;

		// Origin of the line in y (when x = 0)
		var z0 = sz0 - sx0 * cz;

		// Projection of bx0 and bx1 onto the line in z
		var pz0 = z0 + bx0 * cz;
		var pz1 = z0 + bx1 * cz;

		// Testing overlap of projection on z of the bounds of the aabb in x with the bounds of the aabb in z
		intersects = (pz0 < pz1) ? ((bz0 - pz1) * (bz1 - pz0) <= 0) : ((bz0 - pz0) * (bz1 - pz1) <= 0);
	}
	return intersects;
};

AABB3.prototype.intersectsWithRay = function (ray) {
	if (this.bounds[0] >= this.bounds[1]) {
		return false;
	}

	var source    = ray.source;
	var direction = ray.direction;

	// Testing Whether bounds overlap with segment's bounds
	var sx = source.x;
	var dx = direction.x;

	var bx0 = this.bounds[0];
	var bx1 = this.bounds[1];

	var noOverlapX = ((dx >= 0) && (bx1 < sx)) || ((dx <= 0) && (sx < bx0));
	if (noOverlapX) {
		return false;
	}

	var sy = source.y;
	var dy = direction.y;

	var by0 = this.bounds[2];
	var by1 = this.bounds[3];

	var noOverlapY = ((dy >= 0) && (by1 < sy)) || ((dy <= 0) && (sy < by0));
	if (noOverlapY) {
		return false;
	}
	
	var sz = source.z;
	var dz = direction.z;

	var bz0 = this.bounds[4];
	var bz1 = this.bounds[5];

	var noOverlapZ = ((dz >= 0) && (bz1 < sz)) || ((dz <= 0) && (sz < bz0));
	if (noOverlapZ) {
		return false;
	}

	if ((dx === 0) || (dy === 0) || (dz === 0)) {
		return true;
	}

	// Line intersects with aabb if aabb overlaps with
	// its projections of left and right side on the line on y and z axis

	// Line on plane (x, y) is under the form y = y0 + x * cy
	var cy = dy / dx;

	// Origin of the line in y (when x = 0)
	var y0 = sy - sx * cy;

	// Projection of bx0 and bx1 onto the line in y
	var py0 = y0 + bx0 * cy;
	var py1 = y0 + bx1 * cy;

	// Testing overlap of projection on y of the bounds of the aabb in x with the bounds of the aabb in y
	var intersects = (cy > 0) ? ((by0 - py1) * (by1 - py0) <= 0) : ((by0 - py0) * (by1 - py1) <= 0);
	if (intersects) {
		// Line on plane (x, z) is under the form z = z0 + x * cz
		var cz = dz / dx;

		// Origin of the line in y (when x = 0)
		var z0 = sz - sx * cz;

		// Projection of bx0 and bx1 onto the line in z
		var pz0 = z0 + bx0 * cz;
		var pz1 = z0 + bx1 * cz;

		// Testing overlap of projection on z of the bounds of the aabb in x with the bounds of the aabb in z
		intersects = (cz > 0) ? ((bz0 - pz1) * (bz1 - pz0) <= 0) : ((bz0 - pz0) * (bz1 - pz1) <= 0);
		if (intersects) {
			// Line on plane (x, z) is under the form z = z0 + x * cz
			var cy2 = dy / dz;

			// Origin of the line in y (when z = 0)
			var y02 = sy - sz * cy2;

			// Projection of bx0 and bx1 onto the line in z
			var py02 = y02 + bz0 * cy2;
			var py12 = y02 + bz1 * cy2;

			// Testing overlap of projection on y of the bounds of the aabb in x with the bounds of the aabb in z
			intersects = (cy2 > 0) ? ((by0 - py12) * (by1 - py02) <= 0) : ((by0 - py02) * (by1 - py12) <= 0);
		}
	}

	return intersects;
};

module.exports = AABB3;
