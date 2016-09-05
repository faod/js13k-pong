/*    CONSTANTS    */
// Framerate (refresh frequency) 30 FPS
var framerate = 30;
// Size of the canvas (to h=18 x w=32)
var cv_h = 360, cv_w = 640;
// Size of a pixel
var px = cv_w / 32;

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
};

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
	this.speed = px/2. * 1./framerate;
}
// Draw this racquet on `canvas`
Racquet.prototype.draw = function() {
	rectfill(canvas,
		/* x */ (this.pos.x - this.size.x / 2.) * px,
		/* y */ (this.pos.y - this.size.y / 2.) * px,
		/* w */ this.size.x * px,
		/* h */ this.size.y * px,
		        this.colour)
};


/*    GLOBALS    */
var start_time;
var current_status = Statuses.INIT;
// Left and Right racquets
var  leftRq = new Racquet(RacquetSide.LEFT);
var rightRq = new Racquet(RacquetSide.RIFGHT);
// Max and min values for the vertical component of the position of racquets
var ymin =  3;
var ymax = 15;

/*    ENTRY CODE    */
// Draw the game
function draw() {
	clear_to_color(canvas, hsl_to_rgb(time()/10, .25, .25)); // Funky colours
	rectfill(canvas, cv_w/2.-px, 0, 2*px, 18*px, Colours.WHITE); // vertical separator
	leftRq.draw();
	rightRq.draw();
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
function game_logic() {
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

function update() {
	switch (current_status) {
	case Statuses.INIT:
		if (pressed[KEY_SPACE]) current_status = Statuses.READY;
		break;
	case Statuses.READY:
		if (pressed[KEY_SPACE]) current_status = Statuses.PLAYING;
		break;
	case Statuses.PLAYING:
		game_logic();
		break;
	case Statuses.GAMEOVER:
		if (pressed[KEY_SPACE]) current_status = Statuses.INIT;
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
	start_time = time();
	loop(function() { update(); draw(); }, BPS_TO_TIMER(framerate));
}
END_OF_MAIN();
