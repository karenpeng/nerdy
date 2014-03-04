/*
 * This is a JavaScript port of Aldo Cortesi's Python program
 * See: http: //www.hatfulofhollow.com/posts/code/visualisingsorting/index.html
 *
 * This code is in the public domain - do whatever you like with it.
 *
 */

function Sortable(i) {
	this.i = i;
	this.path = [];
}

function TrackList(itms) {
	for (var i=0;i<itms.length;i++) {
		this.push(new Sortable(itms[i]));
	}
}
TrackList.prototype = new Array();
TrackList.prototype.memoizePath = function() {
	for (i=0;i<this.length;i++) {
		var v = this[i];
		v.path.push(i);
	}
}
TrackList.prototype.pop = function(idx) {
	if (idx) {
		var item = this[idx];
		var newitems = this.splice(idx,1);
		return item;
	} else {
		return Array.prototype.pop.call(this);
	}
}
TrackList.prototype.insert = function(idx, item) {
	var newitems = this.splice(idx,0,item);
}
TrackList.prototype.maxIndex = function(j) {   //# No, this is not efficient ;)
	var items = [];
	var maxitems = [];
	for (var i=0,l=this.length;i<l;i++) {
		items[i] = this[i].i;
		if (i<=j)
			maxitems[i] = this[i].i;
	}
	return items.indexOf(Math.max.apply(null, maxitems));
}

function PathDrawer(width, height, fixedwidth, swapwidth, line, border, highlights, prefix) {
        this.width = width;
	this.height = height;
        this.line = line;
	this.border = border;
        this.highlights = highlights;
	this.prefix = prefix;
	this.fixedwidth = fixedwidth;
	this.swapwidth = swapwidth;

	this._lineCoords = function(elem, l) {
		var init = 0.02; //# Proportional initial length
		var lst = [];
		var xscale = (1.0-init)/elem.path.length;
		var yscale = 1.0/l;
		lst.push([0, yscale/2 + (yscale * elem.path[0])])
		lst.push([init, yscale/2 + (yscale * elem.path[0])])
		for (var i=0;i<elem.path.length;i++) {
			var v = elem.path[i];
			lst.push([(xscale * i) + init, yscale/2 + (yscale * v)]);
		}
		//lst.append((1, lst[-1][1]))
		return lst;
	}

	this.draw = function(algo) {
	        var cnv = new Canvas(this.width, this.height)

		var l = [];
		var len = algo.lst.length;
		for (var i=0;i<len;i++) {
			l[len-i-1] = algo.lst[i];
		}

        	ctx = cnv.ctx()

		var swaps = l[0].path.length;
		var width = this.width;
		var height = this.height;

		if (!this.fixedwidth)
			width = swaps * this.swapwidth;

		cnv.canvas().width = width;
		cnv.canvas().style.width = width + "px";

		for (var e=0;e<len;e++) {
			var elem = l[e];
			var lc = this._lineCoords(elem, len);

			ctx.beginPath();

			for (var f=0;f<lc.length;f++) {
				var i = lc[f];
				var x = width * i[0];
				var y = height * i[1];
				if (f==0)
					ctx.moveTo(x, y);
				else
					ctx.lineTo(x, y);
			}
			//ctx.lineTo(width * (i[0]+1), height * i[1]);
			ctx.lineTo(width, height * i[1]);

			ctx.lineCap = "butt";
			ctx.lineJoin = "round";
			ctx.lineWidth = 5;
			ctx.strokeStyle = "rgb(60,60,60)";
			ctx.stroke();
			ctx.lineWidth = 4;
			var c = (100 + (e/len) * 155)>>0;
			ctx.strokeStyle = "rgb(" + c + "," + c + "," + c + ")";
			ctx.stroke();
		}

		var ctr = document.createElement("div");
		ctr.innerHTML = algo.name;
		ctr.className = "sortvisctr";
		ctr.appendChild(cnv.canvas());
		document.getElementById("sortvis").appendChild(ctr);

	}
}

function Bubble(entries) {

	this.name = "Bubblesort";

	this.sort = function(lst) {
	        var bound = lst.length-1;
	        while (1) {
			var t = 0;
			for (var j=0;j<bound;j++) {
				if (lst[j].i > lst[j+1].i) {
					var tmp = lst[j];
					lst[j] = lst[j+1];
					lst[j+1] = tmp;
					lst.memoizePath();
					t = j;
				}
			}
			if (t == 0) {
				break
			}
			bound = t;
		}
	}
	this.lst = new TrackList(entries);
	this.lst.memoizePath();
	this.sort(this.lst);
}

function ListInsertion(entries) {

	this.name = "Insertion Sort";

	this.sort = function(lst) {
	        var bound = lst.length-1;
		for (var i=1;i<lst.length;i++) {
			for (var j=0;j<i;j++) {
				if (lst[i].i < lst[j].i) {
					x = lst.pop(i);
					lst.insert(j, x);
					lst.memoizePath();
				}
			}
		}
	}
	this.lst = new TrackList(entries);
	this.lst.memoizePath();
	this.sort(this.lst);
}

function Shell(entries) {

	this.name = "Shell Sort";

	this.sort = function(lst) {
		var t = [5, 3, 1];
		for (var hi=0;hi<t.length;hi++) {
			var h = t[hi];
			for (j=h,l=lst.length;j<l;j++) {
				var i = j - h;
				var r = lst[j];
				while (i > -1 && i < l) {
					if (r.i < lst[i].i) {
						var tmp = lst[i+h];
						lst[i+h] = lst[i];
						lst[i] = tmp;
						i -= h;
						lst.memoizePath();
					} else {
						break;
					}
				}
				lst[i+h] = r;
			}
		}
	}
	this.lst = new TrackList(entries);
	this.lst.memoizePath();
	this.sort(this.lst);
}

function Selection(entries) {

	this.name = "Selection Sort"

	this.sort = function(lst) {
		for (var j=lst.length-1;j>0;j--) {
			var m = lst.maxIndex(j);
			var tmp = lst[m];
			lst[m] = lst[j];
			lst[j] = tmp;
			lst.memoizePath();
		}
	}
	this.lst = new TrackList(entries);
	this.lst.memoizePath();
	this.sort(this.lst);
}

function Heap(entries) {

	this.name = "Heapsort"

	this.sift = function(lst, start, count) {
		var root = start;
		while ((root * 2) + 1 < count) {
			var child = (root * 2) + 1;
			if (child < (count-1) && lst[child].i < lst[child+1].i) {
				child += 1;
			}
			if (lst[root].i < lst[child].i) {
				var tmp = lst[root];
				lst[root] = lst[child];
				lst[child] = tmp;
				lst.memoizePath();
				root = child;
			} else {
				return;
			}
		}
	}

	this.sort = function(lst) {
		var start = ((lst.length/2)-1)>>0;
		var end = lst.length-1
		while (start >= 0) {
			this.sift(lst, start, lst.length);
			start -= 1;
		}
		while (end > 0) {
			var tmp = lst[end];
			lst[end] = lst[0];
			lst[0] = tmp;
			lst.memoizePath();
			this.sift(lst, 0, end);
			end -= 1;
		}
	}

	this.lst = new TrackList(entries);
	this.lst.memoizePath();
	this.sort(this.lst);
}


function Quick(entries) {

	this.name = "Quicksort";

	this.sort = function(lst, left, right) {
		if (typeof left == "undefined") left = 0;
		if (typeof right == "undefined") right = null;

        	if (right == null) {
            		right = lst.length - 1;
		}
		l = left;
		r = right;
		if (l <= r) {
			var mid = lst[((left+right)/2)>>0];
			while (l <= r) {
				while (l <= right && lst[l].i < mid.i) {
					l += 1;
				}
				while (r > left && lst[r].i > mid.i) {
					r -= 1;
				}
				if (l <= r) {
					var tmp = lst[l];
					lst[l] = lst[r];
					lst[r] = tmp;
					lst.memoizePath();
					l+=1;
					r-=1;
				}
			}
			if (left < r)
				this.sort(lst, left, r);
			if (l < right)
				this.sort(lst, l, right);
		}
	}
	this.lst = new TrackList(entries);
	this.lst.memoizePath();
	this.sort(this.lst);
}


function Canvas(w, h) {
	var cnv = document.createElement("canvas");
	cnv.className = "sortvis";
	cnv.width = w;
	cnv.height = h;
	cnv.style.width = w + "px";
	cnv.style.height = h + "px";

	this.canvas = function() { return cnv; };

	this.ctx = function() {
		return cnv.getContext("2d");
	}
}


var algos = [Quick, Heap, Selection, ListInsertion, Bubble, Shell];

var lst = [];

function render() {
	var numEls = parseInt(document.getElementById("input-numelements").value,10);
	if (numEls < 1) numEls = 1;

	var width = parseInt(document.getElementById("input-width").value,10);
	if (width < 1) width = 1;
	var height = parseInt(document.getElementById("input-height").value,10);
	if (height < 1) height = 1;

	var fixedwidth = document.getElementById("input-fixedwidth").checked;
	var swapwidth = parseInt(document.getElementById("input-swapwidth").value,10);
	if (swapwidth < 1) swapwidth = 1;

	var algoidx = document.getElementById("input-algorithm").selectedIndex;

	var usesame = document.getElementById("input-usesame").checked;

	if (usesame) {
		if (lst.length != numEls) {
			lst = [];
			for (var i=0;i<numEls;i++)
				lst.push(Math.random());
		}
	} else {
		lst = [];
		for (var i=0;i<numEls;i++) {
			lst.push(Math.random());
		}
	}
	var ldrawer = new PathDrawer(width, height, fixedwidth, swapwidth, 2, 2);

        var a = new algos[algoidx](lst.slice(0));
	var alst = [];
	for (var j=0;j<a.lst.length;j++)
		alst[j] = a.lst[j].i;
       	ldrawer.draw(a)
}


window.onload = function() {
	var testCnv = document.createElement("canvas");
	if (!testCnv.getContext) {
		alert("No <canvas>! Please use Firefox, Opera, Safari or Chrome.");
		return;
	}

	document.getElementById("button-render").onclick = render;
	document.getElementById("button-clear").onclick = function() {
		document.getElementById("sortvis").innerHTML = "";
	}
	render();
}
