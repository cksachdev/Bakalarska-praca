const TYPE_BOOLEAN = "boolean";
const TYPE_NUMBER = "number";
const TYPE_STRING = "string";
const TYPE_ARRAY = "array";
const TYPE_ACTION = "action";
const TYPE_ENTITYFILTER = "entityFilter";

var Behavior = function(logic, results)
{
  this.logic = logic;

  if(this.logic.type !== TYPE_BOOLEAN)
    throw new TypeError(TYPE_BOOLEAN, this.logic.type, this)

  this.results = Array.isArray(results) ? results : [results];
}

Behavior.prototype.check = function(entity)
{
  return this.logic.evaluate(entity);
}

Behavior.prototype.toString = function()
{
  return "Behavior("+this.logic.string()+", "+this.result.string()+")";
}

Behavior.prototype.result = function()
{
  for(var i = 0; i < this.results.length; i++)
  {
    this.results[i].execute()
  }
}

var TypeError = function(expected, received, token)
{
  this.expected = expected;
  this.received = received;
  this.token = token;
}

// TODO: linear action, porovnavanie, uhly, plus, minus , deleno, krat, x na n
// TORQUE NEJDE?

var Logic = function(type, args, argument_types)
{
  this.type = type;

  if(args == undefined)
    return this;

  for (var i = 0; i < args.length; i++)
  {
    if(args[i].type !== argument_types[i])
      throw new TypeError(argument_types[i], args[i].type, this);
  }
}

Logic.prototype.evaluate = function() // Use a derived class
{
  return false;
}

Logic.prototype.toString = function() // Use a derived class
{
  return "ERROR: Use derived logic";
}


var Action = function(entityFilter, args, argument_types)
{
  this.entityFilter = entityFilter;

  this.type = TYPE_ACTION;

  if(args == undefined)
    return this;

  for (var i = 0; i < args.length; i++)
  {
    if(args[i].type !== argument_types[i])
      throw new TypeError(argument_types[i], args[i].type, this);
  }
}

Action.prototype.each = function(entity) // Use a derived class
{
  return false;
}

Action.prototype.toString = function() // Use a derived class
{
  return "ERROR: Use derived action";
}

Action.prototype.execute = function ()
{
  var entities = this.entityFilter.filter();
  for (var i = 0; i < entities.length; i++)
  {
    this.each(entities[i]);
  }
};


var EntityFilter = function(args, argument_types)
{
  this.type = TYPE_ENTITYFILTER;

  if(args == undefined)
    return this;

  for (var i = 0; i < args.length; i++)
  {
    if(args[i].type !== argument_types[i])
      throw new TypeError(argument_types[i], args[i].type, this);
  }

}

EntityFilter.prototype.decide = function (entity) // Use derived class
{
  return false;
};

EntityFilter.prototype.toString = function() // Use derived class
{
  return "ERROR: Use derived entity filter";
};

EntityFilter.prototype.filter = function()
{
  var ret = [];
  for(var i = 0; i < _engine.entities.length; i++)
  {
    if(this.decide(_engine.entities[i]))
      ret.push(_engine.entities[i]);
  }
  return ret;
};
