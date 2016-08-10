/*    CONSTANTS    */
// Framerate (refresh frequency) 30 FPS
var framerate = 30;
// Size of the canvas
var cv_h = 18, cv_w = 32;


/*    TYPE DEFINITIONS    */
// Current state of the game
var StatusEnum = { STOPPED: 0, RUNNING: 1 };

// Colour constants
var Colours = { WHITE: 0xFFFFFFFF };

// To make racquets
var RacquetSide = { LEFT: 0, RIGHT: 1 };

// Racquet object constructor
function Racquet(side) {
	// LEFT or RIGHT
	this.side = side;
	// position "pos" is the current position of the center of the racquet
	if (side == RacquetSide.LEFT) {
		this.pos = { x:  1.5, y: 9 };
	}
	else {
		this.pos = { x: 30.5, y: 9 };
	}
	// Current size of the racquet
	this.size = { x: 1, y: 6};
	// Color of the racquet (defaults to white)
	this.colour = Colours.WHITE;
	// vertical speed of the racquet (per frame)
	this.speed = 6 * 1./framerate;
}
// Draw this racquet on `canvas`
Racquet.prototype.draw = function() {
	rectfill(canvas,
		/* x */ this.pos.x - this.size.x / 2.,
		/* y */ this.pos.y - this.size.y / 2.,
		/* w */ this.size.x,
		/* h */ this.size.y,
		        this.colour)
};


/*    GLOBALS    */
var start_time;
// Left and Right racquets
var  leftRq = new Racquet(RacquetSide.LEFT);
var rightRq = new Racquet(RacquetSide.RIFGHT);
// Max and min values for the vertical component of the position of racquets
var ymin =  3;
var ymax = 15;

/*    ENTRY CODE    */
// Draw the game
function draw() {
	clear_to_color(canvas, hsl_to_rgb(time()/10, .5, .25)); // Funky colours
	rectfill(canvas, 15, 0, 2, 18, Colours.WHITE); // vertical separator
	leftRq.draw();
	rightRq.draw();
}

// Updates the game
function update() {
	// Interpret status of arrows
	if (key[KEY_RIGHT]) {
		rightRq.pos.y -= rightRq.speed;
		if (rightRq.pos.y < ymin) rightRq.pos.y = ymin;
	}
	if (key[KEY_LEFT]) {
		rightRq.pos.y += rightRq.speed;
		if (rightRq.pos.y > ymax) rightRq.pos.y = ymax;
	}
	if (key[KEY_UP]) {
		leftRq.pos.y -= leftRq.speed;
		if (leftRq.pos.y < ymin) leftRq.pos.y = ymin;
	}
	if (key[KEY_DOWN]) {
		leftRq.pos.y += leftRq.speed;
		if (leftRq.pos.y > ymax) leftRq.pos.y = ymax;
	}
}

// Sets up everything
function main() {
	install_allegro();
	install_timer();
	install_keyboard();
	install_sound();
	set_gfx_mode("canvas_id", cv_w, cv_h);
	start_time = time();
	loop(function() { update(); draw(); }, BPS_TO_TIMER(framerate));
}
END_OF_MAIN();
