/* Adam Mertel | MUNI */'use strict';

L.CarouselMarkerGroup = L.FeatureGroup.extend({
  options: {
    maxDist: 60000,
    noSteps: 10,
    circleSegmentAngle: 20,
    colors: {},
    propertyName: ''
  },

  initialize: function initialize(options) {
    L.Util.setOptions(this, options);

    this.options.distStep = this.options.maxDist / this.options.noSteps;
    this.options.opacityStep = 1 / (this.options.maxDist / this.options.distStep);

    this._carousels = [];

    L.FeatureGroup.prototype.initialize.call(this, []);
  },

  _addCarousel: function _addCarousel(carousel) {
    var coordinates = carousel.getLatLng();
    var properties = carousel.feature.properties;

    var newCarouselOptions = L.extend(this.options, {
      coordinates: coordinates,
      sequences: properties[this.options.propertyName],
      group: this
    });

    var newCarousel = L.carouselMarker(newCarouselOptions);
    this._carousels.push(newCarousel);

    this.fire('layeradd', { layer: newCarousel });
  },

  addLayer: function addLayer(layer) {
    this.addLayers([layer]);
  },

  addLayers: function addLayers(layersArray) {
    for (var li in layersArray) {
      this._addCarousel(layersArray[li]);
    }
    this.redraw();
  },

  redraw: function redraw() {
    this._clean();
    this._draw();
  },

  _clean: function _clean() {
    console.log('_clean');
    this._carousels.map(function (carousel) {
      return carousel.clean();
    });
  },

  _draw: function _draw() {
    console.log('_draw');

    var distStep = this.options.distStep;
    var maxDist = this.options.maxDist;
    var ci;

    for (var d = maxDist / distStep; d > 0; d--) {
      var circleDist = d * distStep;
      this._carousels.map(function (carousel) {
        return carousel.drawCircle(circleDist);
      });
    }

    for (ci in this._carousels) {
      L.FeatureGroup.prototype.addLayer.call(this, this._carousels[ci]);
    }
  }

});

L.carouselMarkerGroup = function (options) {
  return new L.CarouselMarkerGroup(options);
};
/* Adam Mertel | MUNI */'use strict';

L.CarouselMarker = L.FeatureGroup.extend({
  options: {},

  _getOpacity: function _getOpacity(distance) {
    return (1 / this.options.noSteps * (1 - Math.pow(distance / this.options.maxDist, 2))).toPrecision(6);
  },

  _makeCircle: function _makeCircle(distance, startAngle, endAngle, color) {
    var opacity = this._getOpacity(distance);
    //console.log(distance + ' - ' + opacity);
    //opacity = 1/this.options.noSteps;
    return L.circle(this.options.coordinates, {
      startAngle: startAngle,
      stopAngle: endAngle,
      radius: distance,
      className: 'carousel-sequence',
      fillColor: color,
      fillOpacity: opacity,
      interactive: false
    });
  },

  initialize: function initialize(options) {
    L.Util.setOptions(this, options);

    L.FeatureGroup.prototype.initialize.call(this, []);
  },

  clean: function clean() {
    this.clearLayers();
  },

  drawCircle: function drawCircle(distance) {

    // only one sequence
    if (this.options.sequences.length == 1) {
      var color = this.options.colors[this.options.sequences[0]];
      L.FeatureGroup.prototype.addLayer.call(this, this._makeCircle(distance, 0, 360, color).bringToFront());
    }
    // more sequences
    else {
        for (var i = 0; i < 360 / this.options.circleSegmentAngle; i++) {
          var sAngle = i * this.options.circleSegmentAngle;
          var eAngle = this.options.circleSegmentAngle + sAngle;
          var sequenceType = this.options.sequences[i % this.options.sequences.length];
          var _color = this.options.colors[sequenceType];

          L.FeatureGroup.prototype.addLayer.call(this, this._makeCircle(distance, sAngle, eAngle, _color).bringToFront());
        }
      }
  }
});

L.carouselMarker = function (options) {
  return new L.CarouselMarker(options);
};
