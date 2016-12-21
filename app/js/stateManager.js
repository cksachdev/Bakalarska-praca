var Constants = require("./constants.js");
var Shapes = require("./shapes.js");
var Behavior = require("./behavior.js");
var UpdateEvent = require("./updateEvent.js");
var Joints = require("./joints.js");

var StateManager = function (engine) {
  this.engine = engine;
  this.stateStack = [];
  this.currentState = -1;
};

StateManager.prototype.getCurrentState = function () {
  return this.stateStack[this.currentState];
};

StateManager.prototype.addState = function (state) {
  state = state ? state : this.createState();

  this.currentState += 1;
  this.stateStack.splice(this.currentState, this.stateStack.length - this.currentState, state);

  if (this.stateStack.length > Constants.STATE_STACK_SIZE) {
    this.stateStack.shift();
    this.currentState -= 1;
  }

  UpdateEvent.fire(UpdateEvent.STATE_CHANGE, {
    noState: true,
    first: this.currentState === 0,
    last: this.currentState === this.stateStack.length - 1
  });
};

StateManager.prototype.createState = function () {
  var state = {};

  state.world = {
    gravity: [this.engine.world.GetGravity().get_x(), this.engine.world.GetGravity().get_y()],
    collisionGroups: JSON.parse(JSON.stringify(this.engine.collisionGroups)), // Deep copy trick
    camera: [this.engine.viewport.x, this.engine.viewport.y],
    lifetimeEntities: this.engine.lifetimeEntities,
    cameraStyle: this.engine.viewport.getCameraStyle(),
    cameraEntityId: this.engine.viewport.getCameraEntityId(),
  };

  state.layers = [];

  for (var i = 0; i < Constants.LAYERS_NUMBER; i++) {
    state.layers.push([]);

    for (var j = 0; j < this.engine.layers[i].length; j++) {
      state.layers[i].push(this.engine.layers[i][j].export());
    }
  }

  state.joints = _.map(this.engine.joints, function (joint) {
    return joint.export();
  });

  return state;
};

StateManager.prototype.buildState = function (state) {
  this.clearWorld(true);

  this.engine.setGravity(state.world.gravity[0], state.world.gravity[1], true);
  this.engine.collisionGroups = state.world.collisionGroups;
  this.engine.viewport.x = state.world.camera[0];
  this.engine.viewport.y = state.world.camera[1];
  this.engine.viewport.setCameraStyle(state.world.cameraStyle, true);
  this.engine.viewport.setCameraEntityId(state.world.cameraEntityId, true);

  for (var i = 0; i < state.layers.length; i++) {
    for (var j = 0; j < state.layers[i].length; j++) {
      var entity = state.layers[i][j];
      var newEntity;

      switch (entity.type) {
        case "CIRCLE":
          newEntity = Shapes.Circle.import(entity);
          break;

        case "RECTANGLE":
          newEntity = Shapes.Rectangle.import(entity);
          break;
      }

      this.engine.setEntityLayer(newEntity, i, true);
    }
  }

  for (var jointIndex = 0; jointIndex < state.joints.length; jointIndex++) {
    var joint = state.joints[jointIndex];

    switch (joint.type) {
      case Joints.REVOLUTE:
        Joints.Revolute.import(joint);
        break;

      case Joints.ROPE:
        Joints.Rope.import(joint);
        break;
    }
  }

  this.engine.lifetimeEntities = state.world.lifetimeEntities;

  UpdateEvent.fire(UpdateEvent.STATE_CHANGE, {
    noState: true,
    first: this.currentState === 0,
    last: this.currentState === this.stateStack.length - 1
  });
};

StateManager.prototype.undo = function () {
  if (this.currentState === 0)
    return;

  this.currentState -= 1;
  this.buildState(this.stateStack[this.currentState]);
};

StateManager.prototype.redo = function () {
  if (this.currentState === this.stateStack.length - 1)
    return;

  this.currentState += 1;
  this.buildState(this.stateStack[this.currentState]);
};

StateManager.prototype.clearWorld = function (silent) {
  var entities = this.engine.entities();

  for (var i = 0; i < entities.length; i++) {
    this.engine.removeEntity(entities[i], true);
  }

  // Joints are destroyed automatically when a connected body is destroyed, just clear the list
  _engine.joints = [];

  this.engine.lifetimeEntities = 0;
  this.engine.lifetimeJoints = 0;

  if (!silent)
    UpdateEvent.fire(UpdateEvent.WORLD_CLEARED);
};

module.exports = StateManager;