# {%= name %}

{%= description %}

{% if(enyo_dependencies.length){ %}
### Dependencies
{% grunt.utils._.each(enyo_dependencies, function(library) { %}
* {%= library %}{% }); %}
{% } %}
