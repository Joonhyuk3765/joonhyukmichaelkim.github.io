/* ==========================================================================
   Wedding Invitation – Interactions
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     1. PHOTO GALLERY (4x4 썸네일 그리드 + 전체화면 라이트박스)

     📷 사진 추가 방법:
        1) images/gallery/ 폴더에 본인 사진을 넣으세요 (예: photo1.JPG)
        2) 아래 GALLERY_PHOTOS 배열에 파일명을 추가하세요 (최대 16장 권장)
        3) 사진이 없으면 placeholder가 자동으로 표시됩니다
        ※ 파일 확장자 대소문자(.JPG / .jpg)를 실제 파일과 똑같이 맞추세요!

     동작:
        - 화면에는 4열 그리드로 썸네일을 보여줍니다.
        - 썸네일을 누르면 전체화면 라이트박스가 열리고,
          좌우 버튼 / 스와이프 / 키보드로 무한 반복하며 크게 볼 수 있습니다.
     ------------------------------------------------------------------ */
  const GALLERY_PHOTOS = [
    'gallery/photo1.JPG',
    'gallery/photo2.JPG',
    'gallery/photo3.JPG',
    // 'gallery/photo4.JPG',
    // 'gallery/photo5.JPG',
    // 'gallery/photo6.JPG',
    // 'gallery/photo7.JPG',
    // 'gallery/photo8.JPG',
    // 'gallery/photo9.JPG',
    // 'gallery/photo10.JPG',
    // 'gallery/photo11.JPG',
    // 'gallery/photo12.JPG',
    // 'gallery/photo13.JPG',
    // 'gallery/photo14.JPG',
    // 'gallery/photo15.JPG',
    // 'gallery/photo16.JPG',
  ];

  // 사진이 하나도 없을 때 보여줄 placeholder 개수
  const PLACEHOLDER_COUNT = 8;

  const photoGrid = document.getElementById('photoGrid');

  const photos = GALLERY_PHOTOS.length > 0
    ? GALLERY_PHOTOS
    : Array.from({ length: PLACEHOLDER_COUNT }, function () { return null; });

  const total = photos.length;

  /* ---- (A) 썸네일 그리드 생성 ---- */
  function buildGrid() {
    const html = [];
    for (let i = 0; i < total; i++) {
      const src = photos[i];
      if (src) {
        html.push(
          '<button type="button" class="grid__item" data-index="' + i + '" aria-label="' + (i + 1) + '번째 사진 크게 보기">' +
            '<img src="images/' + src + '" alt="갤러리 사진 ' + (i + 1) + '" loading="lazy" />' +
          '</button>'
        );
      } else {
        html.push(
          '<div class="grid__item grid__item--placeholder">' +
            '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">' +
              '<rect x="6" y="14" width="52" height="40" rx="3" stroke="currentColor" stroke-width="1.5"/>' +
              '<circle cx="44" cy="26" r="3" fill="currentColor"/>' +
              '<path d="M6 44 L22 30 L34 40 L44 32 L58 44" stroke="currentColor" stroke-width="1.5" fill="none"/>' +
            '</svg>' +
          '</div>'
        );
      }
    }
    photoGrid.innerHTML = html.join('');

    photoGrid.addEventListener('click', function (e) {
      const item = e.target.closest('.grid__item');
      if (!item || item.classList.contains('grid__item--placeholder')) return;
      const idx = parseInt(item.dataset.index, 10);
      openLightbox(idx);
    });
  }

  /* ---- (B) 라이트박스 (무한 반복 슬라이더) ---- */
  const lightbox = document.getElementById('lightbox');
  const lbTrack = document.getElementById('lbTrack');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');
  const lbCurrent = document.getElementById('lbCurrent');
  const lbTotal = document.getElementById('lbTotal');

  lbTotal.textContent = total;

  // currentIndex: 원본 인덱스 (0 ~ total-1)
  // trackIndex:   track 상의 실제 위치 (앞 클론 1개 포함, 1 ~ total)
  let currentIndex = 0;
  let trackIndex = 1;
  let isAnimating = false;
  let built = false;

  function lbSlideHTML(src, idx) {
    if (src) {
      return '<div class="lightbox__slide"><img src="images/' + src + '" alt="갤러리 사진 ' + (idx + 1) + '" /></div>';
    }
    return '<div class="lightbox__slide lightbox__slide--placeholder"><span>사진을 추가해주세요</span></div>';
  }

  function buildLightboxSlides() {
    const html = [];
    html.push(lbSlideHTML(photos[total - 1], total - 1)); // 앞 클론
    for (let i = 0; i < total; i++) html.push(lbSlideHTML(photos[i], i)); // 원본
    html.push(lbSlideHTML(photos[0], 0)); // 뒤 클론
    lbTrack.innerHTML = html.join('');
    built = true;
  }

  function setTrackPos(idx, animate) {
    if (animate === undefined) animate = true;
    lbTrack.classList.toggle('lightbox__track--no-transition', !animate);
    lbTrack.style.transform = 'translateX(-' + (idx * 100) + '%)';
  }

  function updateCounter() {
    lbCurrent.textContent = currentIndex + 1;
  }

  function lbNextSlide() {
    if (isAnimating) return;
    isAnimating = true;
    trackIndex++;
    setTrackPos(trackIndex, true);
    currentIndex = (currentIndex + 1) % total;
    updateCounter();
  }

  function lbPrevSlide() {
    if (isAnimating) return;
    isAnimating = true;
    trackIndex--;
    setTrackPos(trackIndex, true);
    currentIndex = (currentIndex - 1 + total) % total;
    updateCounter();
  }

  // 클론 → 원본 점프 (무한 반복)
  lbTrack.addEventListener('transitionend', function () {
    isAnimating = false;
    if (trackIndex === total + 1) {
      trackIndex = 1;
      setTrackPos(trackIndex, false);
    } else if (trackIndex === 0) {
      trackIndex = total;
      setTrackPos(trackIndex, false);
    }
  });

  function openLightbox(idx) {
    if (!built) buildLightboxSlides();
    currentIndex = idx;
    trackIndex = idx + 1;
    setTrackPos(trackIndex, false);
    updateCounter();
    lightbox.classList.add('lightbox--open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('lightbox--open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', lbPrevSlide);
  lbNext.addEventListener('click', lbNextSlide);

  // 배경(어두운 영역) 클릭 시 닫기
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target.id === 'lbStage') closeLightbox();
  });

  // 키보드 (라이트박스 열렸을 때만)
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('lightbox--open')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') lbPrevSlide();
    else if (e.key === 'ArrowRight') lbNextSlide();
  });

  // 스와이프 (터치)
  let touchStartX = null;
  let touchStartY = null;
  let touchMoved = false;

  lbTrack.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchMoved = false;
  }, { passive: true });

  lbTrack.addEventListener('touchmove', function (e) {
    if (touchStartX === null) return;
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy)) touchMoved = true;
  }, { passive: true });

  lbTrack.addEventListener('touchend', function (e) {
    if (touchStartX === null || !touchMoved) {
      touchStartX = null;
      return;
    }
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      dx > 0 ? lbPrevSlide() : lbNextSlide();
    }
    touchStartX = null;
    touchStartY = null;
  }, { passive: true });

  // ---- 초기화 ----
  buildGrid();

  /* ------------------------------------------------------------------
     2. ACCOUNT NUMBER COPY (계좌번호 복사)
     ------------------------------------------------------------------ */
  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('toast--show');
    setTimeout(function () {
      toast.classList.remove('toast--show');
    }, 1800);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(ta);
        resolve();
      } catch (err) {
        document.body.removeChild(ta);
        reject(err);
      }
    });
  }

  document.querySelectorAll('.account__copy').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const num = btn.dataset.copy;
      copyText(num)
        .then(function () { showToast('계좌번호가 복사되었습니다'); })
        .catch(function () { showToast('복사에 실패했습니다'); });
    });
  });

  /* ------------------------------------------------------------------
     3. SHARE (공유)
     ------------------------------------------------------------------ */
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async function () {
      const shareData = {
        title: '준혁 ♥ 미진 결혼합니다',
        text: '2026년 10월 25일 일요일 12시 30분 · 노블발렌티 대치',
        url: window.location.href,
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          // 사용자가 취소했거나 에러 - 무시
        }
      } else {
        copyText(window.location.href)
          .then(function () { showToast('청첩장 링크가 복사되었습니다'); })
          .catch(function () { showToast('공유에 실패했습니다'); });
      }
    });
  }

  /* ------------------------------------------------------------------
     4. D-DAY COUNTDOWN
     ------------------------------------------------------------------ */
  function updateCountdown() {
    const el = document.getElementById('countdown');
    if (!el) return;

    const weddingDate = new Date('2026-10-25T12:30:00+09:00');
    const now = new Date();
    const diff = weddingDate - now;

    if (diff < 0) {
      el.innerHTML = '<strong>결혼식이 시작되었습니다 ♥</strong>';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) {
      el.innerHTML = '준혁 &amp; 미진의 결혼식이 <strong>D-' + days + '</strong> 남았습니다';
    } else {
      el.innerHTML = '오늘은 <strong>준혁 &amp; 미진</strong>의 결혼식 날입니다 ♥';
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000 * 60 * 60);
})();
