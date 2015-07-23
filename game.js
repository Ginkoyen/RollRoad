var map_1=[
"###############",
"#             #",
"# # ####### # #",
"#   #     #   #",
"# # # # # # # #",
"# # # # # # # #",
"# #         # #",
"# ### ### ### #",
"# #         # #",
"# # # # # # # #",
"# # # # # # # #",
"#   #     #   #",
"# # ####### # #",
"#@            #",
"###############"
];

var actorChars = {
  "@": Player
};

var scale = 32;

/*==================
  DOM Helpers
====================*/

function elem(name, className) {
  var elem = document.createElement(name);
  if (className) elem.className = className;
  return elem;
}

function DOMDisplay(parent, level) {
  this.wrap = parent.appendChild(elem("div","game"));
  this.level = level;

  this.wrap.appendChild(this.drawBackground());
  this.actorLayer = null;
  this.drawFrame();
}

DOMDisplay.prototype.drawBackground = function () {
  var table = elem ("table", "background");
  table.style.width = this.level.width*scale + "px";
  this.level.grid.forEach(function(row){
    var rowElem = table.appendChild(elem("tr"));
    rowElem.style.height = scale + "px";
    row.forEach(function(type) {
      rowElem.appendChild(elem("td", type));
    });
  });
  return table;
};

DOMDisplay.prototype.drawActors = function () {
  var wrap = elem("div");
  this.level.actors.forEach(function(actor){
    var rect = wrap.appendChild(
      elem("div", "actor " + actor.type));
    rect.style.width  = actor.size.x * scale + "px";
    rect.style.height = actor.size.y * scale + "px";
    rect.style.left   = actor.pos.x * scale + "px";
    rect.style.top    = actor.pos.y * scale + "px";
  });
  return wrap;
};

DOMDisplay.prototype.drawFrame = function () {
  if (this.actorLayer)
   this.wrap.removeChild(this.actorLayer);
  this.actorLayer = this.wrap.appendChild(this.drawActors());
  this.wrap.className = "game" + (this.level.status || "");
  this.scrollPlayerIntoView();
};


DOMDisplay.prototype.scrollPlayerIntoView = function () {
var width = this.wrap.clientWidth;
var height = this.wrap.clientHeight;
var margin = width / 3;
// The viewport
var left = this.wrap.scrollLeft, right = left + width;
var top = this.wrap.scrollTop, bottom = top + height;
var player = this.level.player;
var center = player.pos.plus(player.size.times(0.5)).times(scale);
if (center.x < left + margin)
this.wrap.scrollLeft = center.x - margin;
else if (center.x > right - margin)
this.wrap.scrollLeft = center.x + margin - width;
if (center.y < top + margin)
this.wrap.scrollTop = center.y - margin;
else if (center.y > bottom - margin)
this.wrap.scrollTop = center.y + margin - height;
};

DOMDisplay.prototype.clear = function () {
this.wrap.parentNode.removeChild (this.wrap );
};

/*==================
  Vector "class" a constructor + added prototypes
====================*/
function Vector (x,y) {
  this.x = x;
  this.y = y;
}

Vector.prototype.plus = function (other) {
  return new Vector (this.x + other.x, this.y + other.y);
};

Vector.prototype.times = function (factor) {
  return new Vector (this.x *factor, this.y * factor);
};

/*==================
  Player "class" : a constructor + added prototypes
====================*/
function Player (pos) {
  this.pos = pos.plus(new Vector(0,0));
  this.size = new Vector (1,1);
  this.speed = new Vector (0,0);
}

Player.prototype.type = "player";


/*==================
  Level "class" a constructor + added prototypes
====================*/
function Level (plan) {
  this.width = plan[0].length;
  this.height = plan.length;
  this.grid = [];
  this.actors = [];
  for (var y =0; y < this.height;y++){
    var line = plan[y], gridLine = [];
    for (var x = 0; x < this.width; x++){
      var ch = line[x];
      var fieldType = null;
      var Actor = actorChars[ch];
      if (Actor)
        this.actors.push(new Actor(new Vector(x,y), ch));
      else if (ch == '#')
        fieldType = "wall";
      else if (ch == ' ')
        fieldType = "road";
      gridLine.push(fieldType);
    }
    this.grid.push(gridLine);
  }
  this.player = this.actors.filter(function(actor) {
     return actor.type == "player";
  })[0];
  this.status = this.finishDelay = null;
}

Level.prototype.isFinished = function() {
  return this.status != null && this.finishDelay < 0;
};
