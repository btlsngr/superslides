/*! Superslides - v0.5.0 - 2012-12-14
* https://github.com/nicinabox/superslides
* Copyright (c) 2012 Nic Aitch; Licensed MIT */

var Superslides, plugin;

Superslides = function(el, options) {
  var $children, $container, $control, $pagination, $window, addPagination, addPaginationItem, adjustImagePosition, adjustSlidesSize, animator, findMultiplier, height, init, initialize, loadImage, multiplier, next, parseHash, positions, prev, setHorizontalPosition, setVerticalPosition, setupChildren, setupContainers, upcomingSlide, width,
    _this = this;
  if (options == null) {
    options = {};
  }
  this.options = $.extend({
    play: false,
    slide_speed: 'normal',
    slide_easing: 'linear',
    pagination: true,
    hashchange: false,
    scrollable: true,
    classes: {
      nav: 'slides-navigation',
      container: 'slides-container',
      pagination: 'slides-pagination'
    }
  }, options);
  $window = $(window);
  $container = $("." + this.options.classes.container);
  $children = $container.children();
  $pagination = $("<nav>", {
    "class": this.options.classes.pagination
  });
  $control = $('<div>', {
    "class": 'slides-control'
  });
  multiplier = 1;
  init = false;
  width = $window.width();
  height = $window.height();
  initialize = function() {
    if (init) {
      return;
    }
    multiplier = findMultiplier();
    positions();
    _this.mobile = /mobile/i.test(navigator.userAgent);
    $control = $container.wrap($control).parent('.slides-control');
    setupContainers();
    setupChildren();
    addPagination();
    _this.start();
    return _this;
  };
  setupContainers = function() {
    return $control.css({
      width: width * multiplier,
      height: height,
      left: -width
    });
  };
  setupChildren = function() {
    $children.css({
      display: 'none',
      position: 'absolute',
      overflow: 'hidden',
      top: 0,
      left: width,
      zIndex: 0
    });
    return adjustSlidesSize($children);
  };
  addPagination = function() {
    if (!_this.options.pagination) {
      return;
    }
    $(el).append($pagination);
    return $children.each(function(i) {
      return addPaginationItem(i);
    });
  };
  addPaginationItem = function(i) {
    if (!(i >= 0)) {
      i = _this.size() - 1;
    }
    return $pagination.append($("<a>", {
      href: "#" + i
    }));
  };
  loadImage = function($img, callback) {
    return $("<img>", {
      src: $img.attr('src')
    }).load(function() {
      if (callback instanceof Function) {
        return callback(this);
      }
    });
  };
  setVerticalPosition = function($img) {
    var scale_height;
    scale_height = width / $img.data('aspect-ratio');
    if (scale_height >= height) {
      return $img.css({
        top: -(scale_height - height) / 2
      });
    } else {
      return $img.css({
        top: 0
      });
    }
  };
  setHorizontalPosition = function($img) {
    var scale_width;
    scale_width = height * $img.data('aspect-ratio');
    if (scale_width >= width) {
      return $img.css({
        left: -(scale_width - width) / 2
      });
    } else {
      return $img.css({
        left: 0
      });
    }
  };
  adjustImagePosition = function($img) {
    if (!$img.data('aspect-ratio')) {
      loadImage($img, function(image) {
        $img.removeAttr('width').removeAttr('height');
        $img.data('aspect-ratio', image.width / image.height);
        return adjustImagePosition($img);
      });
      return;
    }
    setHorizontalPosition($img);
    return setVerticalPosition($img);
  };
  adjustSlidesSize = function($el) {
    return $el.each(function(i) {
      $(this).width(width).height(height);
      $(this).css({
        left: width
      });
      return adjustImagePosition($('img', this).not('.keep-original'));
    });
  };
  findMultiplier = function() {
    if (_this.size() === 1) {
      return 1;
    } else {
      return 3;
    }
  };
  next = function() {
    var index;
    index = _this.current + 1;
    if (index === _this.size()) {
      index = 0;
    }
    return index;
  };
  prev = function() {
    var index;
    index = _this.current - 1;
    if (index < 0) {
      index = _this.size() - 1;
    }
    return index;
  };
  upcomingSlide = function(direction) {
    switch (true) {
      case /next/.test(direction):
        return next();
      case /prev/.test(direction):
        return prev();
      case /\d/.test(direction):
        return direction;
      default:
        return false;
    }
  };
  parseHash = function(hash) {
    if (hash == null) {
      hash = window.location.hash;
    }
    hash = hash.replace(/^#/, '');
    if (hash) {
      return +hash;
    }
  };
  positions = function(current) {
    if (current == null) {
      current = -1;
    }
    if (init && _this.current >= 0) {
      if (current < 0) {
        current = _this.current;
      }
    }
    _this.current = current;
    _this.next = next();
    _this.prev = prev();
    return false;
  };
  animator = function(upcoming_slide, callback) {
    var offset, outgoing_slide, position, that, upcoming_position;
    that = _this;
    position = width * 2;
    offset = -position;
    outgoing_slide = _this.current;
    if (upcoming_slide === _this.prev) {
      position = 0;
      offset = 0;
    }
    upcoming_position = position;
    $children.removeClass('current').eq(upcoming_slide).addClass('current').css({
      left: upcoming_position,
      display: 'block'
    });
    $pagination.children().removeClass('current').eq(upcoming_slide).addClass('current');
    return $control.animate({
      useTranslate3d: _this.mobile,
      left: offset
    }, _this.options.slide_speed, _this.options.slide_easing, function() {
      positions(upcoming_slide);
      $control.css({
        left: -width
      });
      $children.eq(upcoming_slide).css({
        left: width,
        zIndex: 2
      });
      $children.eq(outgoing_slide).css({
        left: width,
        display: 'none',
        zIndex: 0
      });
      if (typeof callback === 'function') {
        callback();
      }
      _this.animating = false;
      if (init) {
        return $container.trigger('slides.animated');
      } else {
        init = true;
        positions(0);
        return $container.trigger('slides.init');
      }
    });
  };
  this.$el = $(el);
  this.animate = function(direction, callback) {
    var upcoming_slide;
    if (direction == null) {
      direction = 'next';
    }
    if (_this.animating) {
      return;
    }
    _this.animating = true;
    upcoming_slide = upcomingSlide(direction);
    if (upcoming_slide > _this.size()) {
      return;
    }
    if (upcoming_slide === direction) {
      positions(upcoming_slide - 1);
    }
    return animator(upcoming_slide, callback);
  };
  this.update = function() {
    positions(_this.current);
    return $container.trigger('slides.updated');
  };
  this.destroy = function() {
    return $(el).removeData();
  };
  this.size = function() {
    return $container.children().length;
  };
  this.stop = function() {
    clearInterval(_this.play_id);
    return delete _this.play_id;
  };
  this.start = function() {
    setupChildren();
    $window.trigger('hashchange');
    _this.animate('next', function() {
      return $container.fadeIn('fast');
    });
    if (_this.options.play) {
      if (_this.play_id) {
        _this.stop();
      }
      _this.play_id = setInterval(function() {
        _this.animate('next');
        return false;
      }, _this.options.play);
    }
    return $container.trigger('slides.started');
  };
  $window.on('hashchange', function(e) {
    var index;
    index = parseHash();
    if (index) {
      return _this.animate(index);
    }
  }).on('resize', function(e) {
    width = $window.width();
    height = $window.height();
    setupContainers();
    return adjustSlidesSize($children);
  });
  $(document).on('click', "." + this.options.classes.nav + " a", function(e) {
    e.preventDefault();
    _this.stop();
    if ($(this).hasClass('next')) {
      return _this.animate('next');
    } else {
      return _this.animate('prev');
    }
  });
  return initialize();
};

plugin = 'superslides';

$.fn[plugin] = function(option, args) {
  var result;
  result = [];
  this.each(function() {
    var $this, data, options;
    $this = $(this);
    data = $this.data(plugin);
    options = typeof option === 'object' && option;
    if (!data) {
      result = $this.data(plugin, (data = new Superslides(this, options)));
    }
    if (typeof option === "string") {
      result = data[option];
      if (typeof result === 'function') {
        return result = result.call(this, args);
      }
    }
  });
  return result;
};
