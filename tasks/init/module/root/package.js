{% /* This file is not formatted nicely, but it is takes the least logic to output a pretty file */ %}enyo.depends(
  {% if(enyo_dependencies.length) grunt.utils._.each(enyo_dependencies, function(library) { %}"$lib/{%= library %}",
  {% }); %}"source/{%= name %}.css",
  "source/{%= name %}.js"
);
