// Converts HSL to RGB (functions ported from Allegro5's colour addon)
// see: https://github.com/liballeg/allegro5/blob/a833ea6aab12ee068bf6e372a035736175d1fc73/addons/color/color.c#L357

function hsl_to_rgb_helper(x, a, b)
{
	if (x < 0)
		x += 1;
	if (x > 1)
		x -= 1;

	if (x * 6 < 1)
		return b + (a - b) * 6 * x;
	if (x * 6 < 3)
		return a;
	if (x * 6 < 4)
		return b + (a - b) * (4.0 - 6.0 * x);
	return b;
}

function hsl_to_rgb(hue, saturation, lightness)
{
	var a, b, h;

	hue = hue % 360;
	if (hue < 0)
		hue += 360;
	h = hue / 360;
	if (lightness < 0.5)
		a = lightness + lightness * saturation;
	else
		a = lightness + saturation - lightness * saturation;
	b = lightness * 2 - a;

	var res = 0xFF << 8;
	res |= Math.floor(0xFF * hsl_to_rgb_helper(h + 1.0 / 3.0, a, b));
	res <<= 8;
	res |= Math.floor(0xFF * hsl_to_rgb_helper(h, a, b));
	res <<= 8;
	res |= Math.floor(0xFF * hsl_to_rgb_helper(h - 1.0 / 3.0, a, b));
	return res;
}
