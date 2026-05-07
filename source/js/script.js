// TODO(review): TOTAL_SLIDES = 6 жёстко захардкожено — при добавлении/удалении карточек нужно менять константу вручную; лучше: document.querySelectorAll('.participant__card').length
// TODO(review): нет debounce на handleWindowResize — событие resize стреляет сотни раз в секунду, каждый раз пересчитывая layout; добавить debounce ~100ms
// TODO(review): отсутствует обработчик touchcancel — если звонок прерывает свайп, isDragging остаётся true; нужно сбрасывать isDragging в touchcancel
// TODO(review): autoplay не останавливается при hover и при focus внутри слайдера — нарушение WCAG 2.1 (критерий 2.2.2 Pause, Stop, Hide)
// TODO(review): кнопки навигации не имеют type="button" — внутри формы они стали бы submit; хорошая практика всегда указывать type
// TODO(review): счётчик показывает номер последней видимой карточки (getLastVisibleSlideNumber), а не номер группы — логика нестандартная; при 3 картах показывает "3/6", "6/6" — может вводить в заблуждение
const AUTOPLAY_INTERVAL_MS = 4000;
const TOTAL_SLIDES = 6;
const SWIPE_THRESHOLD_PX = 50;

const sliderTrack = document.querySelector('.slider__track');
const previousButton = document.querySelector('.slider__navigation-button--previous');
const nextButton = document.querySelector('.slider__navigation-button--next');
const counterCurrent = document.querySelector('.slider__counter-current');
const counterTotal = document.querySelector('.slider__counter-total');
const sliderWrapper = document.querySelector('.slider__wrapper');

let currentGroupIndex = 0;
let autoplayTimer = null;
let touchStartX = 0;
let touchEndX = 0;
let isDragging = false;

function getVisibleSlidesCount() {
  const viewportWidth = window.innerWidth;
  if (viewportWidth <= 560) {
    return 1;
  } else if (viewportWidth <= 900) {
    return 2;
  } else {
    return 3;
  }
}

function getTotalGroupsCount() {
  return Math.ceil(TOTAL_SLIDES / getVisibleSlidesCount());
}

function getFirstSlideIndexInGroup(groupIndex) {
  return groupIndex * getVisibleSlidesCount();
}

function getLastVisibleSlideNumber(groupIndex) {
  const visibleCount = getVisibleSlidesCount();
  const lastVisible = (groupIndex + 1) * visibleCount;
  return Math.min(lastVisible, TOTAL_SLIDES);
}

function calculateTrackOffset(firstSlideIndex) {
  const allCards = sliderTrack.querySelectorAll('.participant__card');
  if (allCards.length === 0) return 0;

  const cardWidth = allCards[0].getBoundingClientRect().width;
  const gapValue = parseFloat(getComputedStyle(sliderTrack).gap) || 32;

  return firstSlideIndex * (cardWidth + gapValue);
}

function moveTrackToGroup(groupIndex) {
  const firstSlideIndex = getFirstSlideIndexInGroup(groupIndex);
  const offset = calculateTrackOffset(firstSlideIndex);
  sliderTrack.style.transform = 'translateX(-' + offset + 'px)';
}

function updateCounter(groupIndex) {
  counterCurrent.textContent = getLastVisibleSlideNumber(groupIndex);
  counterTotal.textContent = TOTAL_SLIDES;
}

function goToGroup(groupIndex) {
  const totalGroups = getTotalGroupsCount();

  if (groupIndex < 0) {
    groupIndex = totalGroups - 1;
  } else if (groupIndex >= totalGroups) {
    groupIndex = 0;
  }

  currentGroupIndex = groupIndex;
  moveTrackToGroup(currentGroupIndex);
  updateCounter(currentGroupIndex);
}

function goToNextGroup() {
  goToGroup(currentGroupIndex + 1);
}

function goToPreviousGroup() {
  goToGroup(currentGroupIndex - 1);
}

function startAutoplay() {
  stopAutoplay();
  autoplayTimer = setInterval(goToNextGroup, AUTOPLAY_INTERVAL_MS);
}

function stopAutoplay() {
  if (autoplayTimer !== null) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
}

function restartAutoplay() {
  stopAutoplay();
  startAutoplay();
}

function handleTouchStart(event) {
  touchStartX = event.touches[0].clientX;
  isDragging = true;
}

function handleTouchEnd(event) {
  if (!isDragging) return;

  touchEndX = event.changedTouches[0].clientX;
  isDragging = false;

  const swipeDistance = touchStartX - touchEndX;

  if (Math.abs(swipeDistance) >= SWIPE_THRESHOLD_PX) {
    if (swipeDistance > 0) {
      goToNextGroup();
    } else {
      goToPreviousGroup();
    }
    restartAutoplay();
  }
}

function handleWindowResize() {
  const totalGroups = getTotalGroupsCount();
  if (currentGroupIndex >= totalGroups) {
    currentGroupIndex = 0;
  }
  moveTrackToGroup(currentGroupIndex);
  updateCounter(currentGroupIndex);
}

function attachEventListeners() {
  nextButton.addEventListener('click', function () {
    goToNextGroup();
    restartAutoplay();
  });

  previousButton.addEventListener('click', function () {
    goToPreviousGroup();
    restartAutoplay();
  });

  sliderWrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
  sliderWrapper.addEventListener('touchend', handleTouchEnd, { passive: true });

  window.addEventListener('resize', handleWindowResize);
}

function initializeSlider() {
  currentGroupIndex = 0;
  sliderTrack.style.transform = 'translateX(0)';
  updateCounter(0);

  attachEventListeners();
  startAutoplay();
}

document.addEventListener('DOMContentLoaded', initializeSlider);
