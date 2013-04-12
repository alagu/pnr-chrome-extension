(function () {
    YAHOO.util.Event.onDOMReady(function (ev) {
        var carousel = new YAHOO.widget.Carousel("container", {
          autoPlayInterval: 5000
        });
        carousel.set("animation", { speed: 0.5 });
        carousel.set("numVisible", 1);
        carousel.render();
        carousel.show(); 
        carousel.startAutoPlay();

    });
})();

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-24995053-1']);
_gaq.push(['_trackEvent', 'installed', 'event']);

(function() {
var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
ga.src = 'https://ssl.google-analytics.com/ga.js';
var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();