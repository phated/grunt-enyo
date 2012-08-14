# {%= name %}

{%= description %}

{% if(enyo_libraries.length){ %}
### Dependencies
{% grunt.utils._.each(enyo_libraries, function(library) { %}
* {%= library %}{% }); %}
{% } %}