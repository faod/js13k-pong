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
	
}

// Sets up everything
function main() {
	install_allegro();
	install_timer();
	install_keyboard();
	install_sound();
	set_gfx_mode("canvas_id", 32, 18);
	start_time = time();
	loop(function() { update(); draw(); }, BPS_TO_TIMER(30)); // 30 FPS
}
END_OF_MAIN();
