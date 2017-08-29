// Example: https://jsfiddle.net/c0yu615k/4/

/**
 * Splits b into a subdivision based on a
 * - Prerequisite a must be inside or partially inside b
 */
function split(a, b) {
	var rects = [];
	// Left
	rects.push({ x1: b.x1, x2: Math.max(a.x1, b.x1), y1: b.y1, y2: b.y2 });
	
	// Right
	rects.push({ x1: Math.min(a.x2, b.x2), x2: b.x2, y1: b.y1, y2: b.y2 });

	// Top
	rects.push({ x1: Math.max(a.x1, b.x1), x2: Math.min(a.x2, b.x2), y1: b.y1, y2: Math.max(a.y1, b.y1) });

	// Bottom
	rects.push({ x1: Math.max(a.x1, b.x1), x2: Math.min(a.x2, b.x2), y1: Math.min(a.y2, b.y2), y2: b.y2 });

	// Remove any that have 0 width / height
	return rects.filter(function(r) { return r.x2 - r.x1 > 0 && r.y2 - r.y1 > 0; });
}

/**
 * Two rectangle intersect proof by contradiction
 */
function intersects(a, b) {
	return (a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1 );
}

/**
 * Perform the collision in a compounding fashion against the base rect
 */
export function collide(inputRects, base) {
	var collideRects = [ base ];
  
  	if(inputRects) {
  		for(var i = 0; i < inputRects.length; i++) {
			var newCollideRects = [];
			
			if(collideRects) {
				for(var j = 0; j < collideRects.length; j++) {
					if(intersects(inputRects[i], collideRects[j])) {
						var splitRects = split(inputRects[i], collideRects[j]);
						newCollideRects = newCollideRects.concat(splitRects);  	
					} else {
						newCollideRects.push(collideRects[j]);
					}   	
				}
			}
			
			collideRects = newCollideRects;
		}
  	}
	
	return collideRects;
}