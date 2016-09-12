/*    CONSTANTS    */
// Framerate (refresh frequency) 30 FPS
var framerate = 30;
// Size of the canvas (to h=18 x w=32)
var cv_h = 360, cv_w = 640;
// Size of a pixel
var px = cv_w / 32;
// Debug, set to `true` to enable
var debug = true;
// For glitching
var base_factor = 1000./framerate;

/*    TYPE DEFINITIONS    */
// Current state of the game
var Statuses = {
	INIT:     0, // First possible status
	READY:    1, // Ball is on one of the racquets, press <space> to start
	PLAYING:  2, // Use arrows to play
	GAMEOVER: 3, // Boo!
};

// Colour constants
var Colours = {
	WHITE: 0xFFFFFFFF,
	BLACK: 0xFF000000,
	RED:   0xFFFF0000,
	GREEN: 0xFF00FF00,
	BLUE:  0xFF0000FF,
};

// AABB object constructor
function AABB(pos, size) {
	this.pos = pos;
	this.size = size;
}
AABB.prototype.overlap = function(other) {
	var dx = Math.abs(this.pos.x - other.pos.x);
	var dy = Math.abs(this.pos.y - other.pos.y);

	var sx = this.size.x/2. + other.size.x/2.;
	var sy = this.size.y/2. + other.size.y/2.;

	return { x: dx<sx, y: dy<sy }; // overlap on X, overlap on Y
};
AABB.prototype._linearWithin = function(inner_pos, inner_hsize, outer_pos, outer_hsize) {
	var max_i = 1000 + inner_pos + inner_hsize; // +1000 to avoid negative coordinates
	var max_o = 1000 + outer_pos + outer_hsize;
	var delta = max_o - max_i;
	if (delta < 0) {
		return delta
	}
	var cmp = 2*outer_hsize - 2*inner_hsize;
	if (delta > cmp) {
		return delta - cmp;
	}
	return 0;
};
AABB.prototype.isWithin = function(other) { // `this` is completely inside other
	// returns 0,0 if is within, otherwise returns vector v: {vx, vy} to translate back `this` within `other`.
	return {
		x: this._linearWithin(this.pos.x, this.size.x/2., other.pos.x, other.size.x/2.),
		y: this._linearWithin(this.pos.y, this.size.y/2., other.pos.y, other.size.y/2.)
	};
};
AABB.prototype.bounceNorm = function(other) {
	var dx = this.pos.x - other.pos.x;
	var dy = this.pos.y - other.pos.y;

	var sx = (this.size.x + other.size.x)/2. - Math.abs(dx);
	var sy = (this.size.y + other.size.y)/2. - Math.abs(dy);

	if (sx < sy) {
		return { x: Math.sign(dx), y: 0 };
	}
	else {
		return { x: 0, y: Math.sign(dy) };
	}
};

// To make racquets
var RacquetSide = { LEFT: 0, RIGHT: 1 };

// Racquet object constructor
function Racquet(side) {
	// LEFT or RIGHT
	this.side = side;
	// Bounds of this racquet
	this.aabb = new AABB(
		// position "pos" is the current position of the center of the racquet
		(side == RacquetSide.LEFT) ? { x:  1.5, y: 9 } : { x: 30.5, y: 9 },
		// Current size of the racquet
		{ x: 1, y: 6}
	);
	// Color of the racquet (defaults to white)
	this.colour = Colours.WHITE;
	// vertical speed of the racquet (per frame)
	this.speed = px/2. * 1./framerate;
}
// Draw this racquet on `canvas`
Racquet.prototype.draw = function() {
	rectfill(canvas,
		/* x */ (this.aabb.pos.x - this.aabb.size.x / 2.) * px,
		/* y */ (this.aabb.pos.y - this.aabb.size.y / 2.) * px,
		/* w */ this.aabb.size.x * px,
		/* h */ this.aabb.size.y * px,
		        this.colour);
};

// Ball object constructor
function Ball() {
	// Bounds of this ball
	this.aabb = new AABB(
		// position "pos" is the current position of the center of the ball
		{ x: 16, y: 9 },
		// Size of this ball
		{ x: 1, y: 1 }
	);
	// speed of the ball (per frame)
	this.speed = px/2. * 1./framerate;
	// direction of the ball (unit vector)
	this.dir = { x: (rand32()>0? 1: -1) * .707, y: (rand32()>0? 1: -1) * .707 }; // .707 = sqrt(2) / 2
	// How many times the ball passed over the net
	this.net_counter = 0;
	this.colour  = Colours.WHITE;
	this.outline = Colours.BLACK;
}
// Draw this ball
Ball.prototype.draw = function() {
	rect(canvas,
		/* x */ (this.aabb.pos.x - this.aabb.size.x / 2.) * px,
		/* y */ (this.aabb.pos.y - this.aabb.size.y / 2.) * px,
		/* w */ this.aabb.size.x * px,
		/* h */ this.aabb.size.y * px,
		        this.outline, px/2.);

	rectfill(canvas,
		/* x */ (this.aabb.pos.x - this.aabb.size.x / 2.) * px,
		/* y */ (this.aabb.pos.y - this.aabb.size.y / 2.) * px,
		/* w */ this.aabb.size.x * px,
		/* h */ this.aabb.size.y * px,
		        this.colour);

	textout_centre(canvas, font, this.net_counter.toString(), cv_w/2., px*2., px*1.5, Colours.WHITE, Colours.BLACK, px/10.);

	if (debug) { // draw direction vector
		line(canvas,
		/* x1 */ this.aabb.pos.x * px,
		/* y1 */ this.aabb.pos.y * px,
		/* x2 */ this.aabb.pos.x * px + this.dir.x * px*2.,
		/* y2 */ this.aabb.pos.y * px + this.dir.y * px*2.,
		         Colours.RED, px/5.);
	}
};
// Vertical bounce
Ball.prototype.vBounce = function() {
	this.dir.y = -(this.dir.y); // Stupid reflection function
};
// Horizontal bounce
Ball.prototype.hBounce = function() {
	this.dir.x = -(this.dir.x); // Stupid reflection function
};
Ball.prototype.bounce = function(norm_v) {
	if (norm_v.x != 0) this.dir.x = -(this.dir.x);
	if (norm_v.y != 0) this.dir.y = -(this.dir.y);
};
// Logic of a ball
Ball.prototype.update = function(delta_t) {
	var fac = base_factor / delta_t;
	var kx1 = this.aabb.pos.x - 16;
	this.aabb.pos.x += this.dir.x * fac * this.speed;
	this.aabb.pos.y += this.dir.y * fac * this.speed;
	var kx2 = this.aabb.pos.x - 16;
	if (kx1<0 && kx2>=0 || kx1>0 && kx2<=0) {
		this.net_counter++;
		// Increase speed (the harder the better) every 2 points
		if (this.speed < 1.5*px * 1./framerate) { // happens at most 8 times
			if (!(this.net_counter % 2)) {
				this.speed += px/8. * 1./framerate;
			}
		}
	}
};
Ball.prototype.reset = function() {
	this.aabb.pos = { x: 16, y: 9 };
	this.dir = { x: (rand32()>0? 1: -1) * .707, y: (rand32()>0? 1: -1) * .707 }; // .707 = sqrt(2) / 2
	this.net_counter = 0;
	this.speed = px/2. * 1./framerate;
};

/*    GLOBALS    */
var current_status = Statuses.INIT;
// Left and Right racquets
var  leftRq = new Racquet(RacquetSide.LEFT);
var rightRq = new Racquet(RacquetSide.RIFGHT);
// Ball
var ball = new Ball();
// Max and min values for the vertical component of the position of racquets
var ymin =  3;
var ymax = 15;
// AABB of the canvas
var canvasAABB = new AABB({ x: 16., y: 9. }, { x: 32., y: 18. });


/*    ENTRY CODE    */
// Draw the game
function draw() {
	clear_to_color(canvas, hsl_to_rgb(time()/10, .25, .25)); // Funky colours
	rectfill(canvas, cv_w/2.-px, 0, 2*px, 18*px, Colours.WHITE); // vertical separator
	leftRq.draw();
	rightRq.draw();
	ball.draw();
	if (current_status == Statuses.READY) {
		textout_centre(canvas, font, "Press space to throw", cv_w/2., cv_h/2., px*1.5, Colours.WHITE, Colours.BLACK, px/10.);
	}
	else if (current_status != Statuses.PLAYING) {
		rectfill(canvas, 0, 0, cv_w, cv_h,  0xD0000000);

		if (current_status == Statuses.GAMEOVER) {
			textout_centre(canvas, font, "Game Over...", cv_w/2., cv_h/2., px*1.5, Colours.WHITE, Colours.BLACK, px/10.);
		}

		if (current_status == Statuses.INIT) {
			textout_centre(canvas, font,               "PONG!!", cv_w/2., 3*cv_h/8., px*4,   Colours.WHITE, Colours.BLACK, px/10.);
			textout_centre(canvas, font, "Press space to start", cv_w/2., 2*cv_h/3., px*1.5, Colours.WHITE, Colours.BLACK, px/10.);
		}
	}
}

// Updates the game
function game_logic(delta_t) {
	// Interpret status of arrows
	if (key[KEY_RIGHT]) {
		rightRq.aabb.pos.y -= rightRq.speed;
		if (rightRq.aabb.pos.y < ymin) rightRq.aabb.pos.y = ymin;
	}
	if (key[KEY_LEFT]) {
		rightRq.aabb.pos.y += rightRq.speed;
		if (rightRq.aabb.pos.y > ymax) rightRq.aabb.pos.y = ymax;
	}
	if (key[KEY_UP]) {
		leftRq.aabb.pos.y -= leftRq.speed;
		if (leftRq.aabb.pos.y < ymin) leftRq.aabb.pos.y = ymin;
	}
	if (key[KEY_DOWN]) {
		leftRq.aabb.pos.y += leftRq.speed;
		if (leftRq.aabb.pos.y > ymax) leftRq.aabb.pos.y = ymax;
	}

	ball.update(delta_t + (rand() > 60000 ? 0: Math.floor(50 * frand())));

	// Racquet <-> Ball collision
	var ballLeftHit  = ball.aabb.overlap(leftRq.aabb);
	if (ballLeftHit.x && ballLeftHit.y) {
		ball.bounce(ball.aabb.bounceNorm(leftRq.aabb));
	}
	var ballRightHit = ball.aabb.overlap(rightRq.aabb);
	if (ballRightHit.x && ballRightHit.y) {
		ball.bounce(ball.aabb.bounceNorm(rightRq.aabb));
	}

	// Ball <-> canvas collision
	var ballin = ball.aabb.isWithin(canvasAABB);
	if (ballin.x) {
		console.log("current_status <-- GAMEOVER");
		current_status = Statuses.GAMEOVER;
	}
	if (ballin.y) {
		ball.vBounce();
		ball.aabb.pos.y += ballin.y;
	}
}

function update(delta_t) {
	switch (current_status) {
	case Statuses.INIT:
		if (pressed[KEY_SPACE]) {
			console.log("current_status <-- READY");
			current_status = Statuses.READY;
		}
		break;
	case Statuses.READY:
		if (pressed[KEY_SPACE]) {
			console.log("current_status <-- PLAYING");
			current_status = Statuses.PLAYING;
		}
		break;
	case Statuses.PLAYING:
		game_logic(delta_t);
		break;
	case Statuses.GAMEOVER:
		if (pressed[KEY_SPACE]) {
			console.log("current_status <-- INIT");
			current_status = Statuses.INIT;
			ball.reset();
		}
		break;
	default:
		console.log("current_status set to wrong value " + current_status);
	}
}

// Sets up everything
function main() {
	install_allegro();
	install_timer();
	install_keyboard();
	install_sound();
	set_gfx_mode("canvas_id", cv_w, cv_h);
	var cur_time = time();
	loop(function() {
		var delta_t = time() - cur_time;
		update(delta_t); draw();
		cur_time += delta_t;
	}, BPS_TO_TIMER(framerate));
}
END_OF_MAIN();
