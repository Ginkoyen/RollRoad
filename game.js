/*==================
   ROAD ROAR
--------------------
TODO :
    function obstacleAt :
     On nomme a le point du centre du cube (actor)
     On nomme m les cubes (mur)
     - Si a est aligne avec m dans le sens de la
     direction selectionne alors on ne change pas la direction
     - Si a n est pas aligne avec m on boucle pour
     valide un alignement parfait sur la grille, lorsque l'alignement
     est valide on change la position

====================*/

/*==================
  Globals
====================*/

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
var GAME_LEVELS = [map_1];
var scale = 32;
var maxStep = 0.05;
var playerSpeed = 7;
var arrowCodes = {37: "left", 38: "up", 39:"right", 40:"down"};

/*==================
  Animation Helper Function
====================*/
function runAnimation (frameFunc) {
  var lastTime = null;
  function frame(time) {
    var stop = false;
    if (lastTime != null) {
      var timeStep = Math.min(time - lastTime, 100) /1000;
      stop = frameFunc(timeStep) === false;
    }
    lastTime = time;
    if (! stop)
      requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

var arrows = trackKeys(arrowCodes);

function runLevel (level, Display, andThen) {
  var display = new Display(document.body, level);
  runAnimation(function(step) {
    level.animate(step, arrows);
    display.drawFrame(step);
    if (level.isFinished()) {
      display.clear();
      if (andThen)
        andThen(level.status);
      return false;
    }
  });
}

function runGame (plans, Display) {
  function startLevel(n) {
    runLevel(new Level(plans[n]), Display, function(status){
      if (status == "lost")
       startLevel(n);
      else if (n < plans.length -1)
        startLevel(n+1);
      else
        console.log("You win !");
    });
  }
  startLevel(0);
};


/*==================
  Event Handler
====================*/

function trackKeys (codes) {
  var pressed = Object.create(null);
  function handler(event) {
    if (codes.hasOwnProperty(event.keyCode)) {
      var down = event.type == "keydown";
      pressed[codes[event.keyCode]] = down;
      event.preventDefault();
    }
  }
  addEventListener ("keydown", handler);
  addEventListener ("keyup", handler);
  return pressed;
}


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
  this.speed = new Vector (5,5);
  this.direction = new Vector (0,0);
}

Player.prototype.type = "player";
Player.prototype.move = function (step, level, keys){
var new_direction = new Vector (this.direction.x,this.direction.y);
if(keys.left)
{
  new_direction.x = -1;
  new_direction.y = 0;
}
if (keys.right)
{
  new_direction.x = 1;
  new_direction.y = 0;
}
if (keys.up)
{
  new_direction.x = 0;
  new_direction.y = -1;
}
if (keys.down)
{
  new_direction.x = 0;
  new_direction.y = 1;
}

var motion = new Vector (this.speed.x * new_direction.x * step,
  this.speed.y * new_direction.y * step);
var newPos = this.pos.plus(motion);
var obstacle = level.obstacleAt(newPos, this.size);
if (obstacle)
{
  level.playerTouched(obstacle);
  motion.x = this.speed.x * this.direction.x * step;
  motion.y = this.speed.y * this.direction.y * step;
  newPos = this.pos.plus(motion);
  obstacle = level.obstacleAt(newPos, this.size);
  if (obstacle)
    level.playerTouched(obstacle);
  else
    this.pos = newPos;
 }
 else
 {
   this.direction.x = new_direction.x;
   this.direction.y = new_direction.y;
   this.pos = newPos;
 }

};

Player.prototype.act = function (step, level, keys) {
  this.move(step,level,keys);
  var otherActor = level.actorAt (this);
  if (otherActor)
    level.playerTouched(otherActor.type, otherActor);
  if (level.status == "lost") {
    this.pos.y += step;
    this.size.y -= step;
  }
};

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

// Detect if Player have a colision with a wall
Level.prototype.obstacleAt = function (pos,size) {
  var xStart = Math.floor(pos.x);
  var xEnd = Math.ceil(pos.x+ size.x);
  var yStart = Math.floor(pos.y);
  var yEnd = Math.ceil (pos.y+size.y);
  if (xStart < 0 || xEnd > this.width || yStart < 0 || yEnd > this.height)
    return "wall";

  for (var y=yStart; y < yEnd; y++){
    for (var x=xStart; x < xEnd; x++){
      var fieldType = this.grid[y][x];
      if (fieldType == "wall") return fieldType;
    }
  }
}

// Look if an Actor overlap with the one given in parameter
Level.prototype.actorAt = function(actor) {
  for (var i=0; i < this.actors.length; i++) {
    var other = this.actors[i];
    if (other != actor &&
      actor.pos.x + actor.size.x > other.pos.x &&
      actor.pos.x < other.pos.x + other.size.x &&
      actor.pos.y + actor.size.y > other.pos.y &&
      actor.pos.y < other.pos.y + other.size.y)
      return other;
  }
};

Level.prototype.animate = function(step, keys) {
  if (this.status != null)
    this.finishDelay -= step;
  while (step > 0) {
    var thisStep = Math.min(step, maxStep);
    this.actors.forEach(function(actor){
      actor.act(thisStep, this, keys);
    }, this);
    step -= thisStep;
  }
};

Level.prototype.playerTouched = function(type, actor) {
  if (type == "wall" && this.status == null)
  {
    //this.status = "lost";
    this.finishDelay = 1;
  }
}
