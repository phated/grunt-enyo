{% /* This file is not formatted nicely, but it is takes the least logic to output a pretty file */ %}enyo.depends(
  {% grunt.utils._.each(enyo_dependencies, function(library) { %}"$lib/{%= library %}",
  {% }); %}"{%= name %}.css",
  "{%= name %}.js"
);
