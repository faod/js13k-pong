var start_time;

// Draw the game
function draw() {
	clear_to_color(canvas, hsl_to_rgb(time()/10, .5, .25)); // Funky colours
}

// Sets up everything
function main() {
	install_allegro();
	install_timer();
	install_keyboard();
	install_sound();
	set_gfx_mode("canvas_id", 32, 18);
	start_time = time();
	loop(draw, BPS_TO_TIMER(30)); // 30 FPS
}
END_OF_MAIN();
