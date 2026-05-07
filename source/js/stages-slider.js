var STAGES_SLIDE_COUNT = 5;
var STAGES_SWIPE_THRESHOLD_PX = 50;
var STAGES_MOBILE_BREAKPOINT = 768;

function initStagesSlider() {
  var slider = document.querySelector('.stages__slider');
  if (!slider) {
    return;
  }

  var viewport = slider.querySelector('.stages__slider-viewport');
  var list = slider.querySelector('.stages__list');
  var prevBtn = slider.querySelector('.stages__slider-button--prev');
  var nextBtn = slider.querySelector('.stages__slider-button--next');
  var dots = slider.querySelectorAll('.stages__slider-dot');

  var currentIndex = 0;
  var touchStartX = 0;
  var isDragging = false;

  function isMobile() {
    return window.innerWidth <= STAGES_MOBILE_BREAKPOINT;
  }

  function getSlideWidth() {
    return viewport.offsetWidth;
  }

  function getColumnGap() {
    return parseFloat(getComputedStyle(list).columnGap) || 12;
  }

  function updateButtons() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === STAGES_SLIDE_COUNT - 1;
  }

  function updateDots() {
    dots.forEach(function (dot, i) {
      dot.classList.toggle('stages__slider-dot--active', i === currentIndex);
    });
  }

  function moveTo(index) {
    if (!isMobile()) {
      list.style.transform = '';
      return;
    }

    currentIndex = index;
    var offset = currentIndex * (getSlideWidth() + getColumnGap());
    list.style.transform = 'translateX(-' + offset + 'px)';
    updateButtons();
    updateDots();
  }

  function goNext() {
    if (currentIndex < STAGES_SLIDE_COUNT - 1) {
      moveTo(currentIndex + 1);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      moveTo(currentIndex - 1);
    }
  }

  prevBtn.addEventListener('click', goPrev);
  nextBtn.addEventListener('click', goNext);

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      moveTo(i);
    });
  });

  viewport.addEventListener('touchstart', function (event) {
    touchStartX = event.touches[0].clientX;
    isDragging = true;
  }, { passive: true });

  viewport.addEventListener('touchend', function (event) {
    if (!isDragging) {
      return;
    }
    isDragging = false;

    var swipeDistance = touchStartX - event.changedTouches[0].clientX;
    if (Math.abs(swipeDistance) >= STAGES_SWIPE_THRESHOLD_PX) {
      if (swipeDistance > 0) {
        goNext();
      } else {
        goPrev();
      }
    }
  }, { passive: true });

  viewport.addEventListener('touchcancel', function () {
    isDragging = false;
  }, { passive: true });

  window.addEventListener('resize', function () {
    moveTo(currentIndex);
  });

  moveTo(0);
}

document.addEventListener('DOMContentLoaded', initStagesSlider);
