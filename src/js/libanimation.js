function moveElement(el, start, end, speed) {
/*
<a style="position: absolute; top: 280px;" href="javascript://" onclick="moveElement(this, findPos(this), [330, 700], 2)">Move Slowly</a>
<a style="position: absolute; top: 330px;" href="javascript://" onclick="moveElement(this, findPos(this), [780, 650], 50)">Move FAST</a>
*/
	// TODO: perhaps a more vector-like movement
	var l = start[0];
	var t = start[1];

	if (l != end[0]) l += (((l+speed) < end[0]) ? speed : (end[0]-l));
	if (t != end[1]) t += (((t+speed) < end[1]) ? speed : (end[1]-t));
	el.setAttribute("style", "position: absolute; top: "+t+"px; left: "+l+"px;");

	if ([l, t] != end)
		window.setTimeout(moveElement, 10, el, [l, t], end, speed);
}
