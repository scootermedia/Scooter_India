/* ---------------------------------------------------------
   MEDIA & BTS LIGHTBOX
--------------------------------------------------------- */

const mediaLightbox = document.getElementById("media-lightbox");
const mediaLightboxImage = mediaLightbox.querySelector(".media-lightbox-image");
const mediaLightboxCaption = mediaLightbox.querySelector(".media-lightbox-caption");
const mediaLightboxClose = mediaLightbox.querySelector(".media-lightbox-close");
let mediaLightboxTrigger;

document.querySelectorAll(".bts-card[data-lightbox-src]").forEach(card => {
  card.addEventListener("click", () => {
    const thumbnail = card.querySelector("img");
    mediaLightboxTrigger = card;
    mediaLightboxImage.src = card.dataset.lightboxSrc;
    mediaLightboxImage.alt = thumbnail.alt;
    mediaLightboxCaption.textContent = card.dataset.lightboxCaption;
    mediaLightbox.showModal();
    mediaLightboxClose.focus();
  });
});

mediaLightboxClose.addEventListener("click", () => mediaLightbox.close());
mediaLightbox.addEventListener("click", event => {
  if (event.target === mediaLightbox) mediaLightbox.close();
});
mediaLightbox.addEventListener("close", () => {
  mediaLightboxImage.removeAttribute("src");
  mediaLightboxTrigger?.focus();
});

/* ---------------------------------------------------------
   MOBILE MENU
--------------------------------------------------------- */

const menu = document.getElementById("menu");
const navLinks = document.getElementById("navLinks");

menu.addEventListener("click", () => {

  navLinks.classList.toggle("mobile-active");

  const isOpen = navLinks.classList.contains("mobile-active");
  menu.setAttribute("aria-expanded", String(isOpen));
  menu.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");

});


document
  .querySelectorAll(".nav-links a")
  .forEach(link => {

    link.addEventListener("click", () => {

      navLinks.classList.remove("mobile-active");
      menu.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-label", "Open navigation menu");

    });

  });

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && navLinks.classList.contains("mobile-active")) {
    navLinks.classList.remove("mobile-active");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open navigation menu");
    menu.focus();
  }
});


/* ---------------------------------------------------------
   SCROLL REVEAL
--------------------------------------------------------- */

const revealElements =
  document.querySelectorAll(".reveal");


const revealObserver =
  new IntersectionObserver(

    entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add("visible");

          revealObserver.unobserve(
            entry.target
          );

        }

      });

    },

    {
      threshold: 0.12
    }

  );


revealElements.forEach(element => {

  revealObserver.observe(element);

});


/* ---------------------------------------------------------
   NAVBAR BACKGROUND ON SCROLL
--------------------------------------------------------- */

const navbar =
  document.querySelector(".navbar");


window.addEventListener("scroll", () => {

  if (window.scrollY > 80) {

    navbar.style.background =
      "rgba(7,22,25,0.94)";

  } else {

    navbar.style.background =
      "rgba(15,92,109,0.88)";

  }

}, { passive: true });



// Keep the poster clickable until YouTube confirms that its player is ready.
let youtubeReady;
let activePlayer;
function loadYouTubePlayer() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeReady) return youtubeReady;
  youtubeReady = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const fail = () => {
      clearTimeout(timeout);
      script.remove();
      youtubeReady = null;
      reject(new Error('The video player could not connect. Please retry.'));
    };
    const timeout = setTimeout(fail, 15000);
    window.onYouTubeIframeAPIReady = () => {
      clearTimeout(timeout);
      resolve(window.YT);
    };
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = fail;
    document.head.append(script);
  });
  return youtubeReady;
}

document.querySelectorAll('.video-play').forEach(button => {
  const container = button.closest('.video-player');
  const card = container.closest('.project');
  const status = document.createElement('span');
  status.className = 'video-status';
  status.setAttribute('role', 'status');
  container.append(status);
  let player;
  let ready = false;
  let loading = false;
  let watchdog;
  let attempt = 0;

  const revealPlayer = () => {
    button.hidden = true;
    button.removeAttribute('aria-busy');
    container.classList.remove('is-loading');
    card?.classList.add('is-active');
    status.textContent = '';
  };
  const showFailure = message => {
    attempt++;
    clearTimeout(watchdog);
    loading = false;
    ready = false;
    if (activePlayer === player) activePlayer = null;
    player?.destroy();
    player = null;
    container.querySelectorAll('iframe, .video-mount').forEach(el => el.remove());
    container.classList.remove('is-loading');
    card?.classList.remove('is-active');
    button.hidden = false;
    button.removeAttribute('aria-busy');
    button.setAttribute('aria-label', `Retry ${button.dataset.videoTitle}`);
    status.textContent = message;
  };
  const play = () => {
    if (activePlayer && activePlayer !== player) activePlayer.pauseVideo();
    activePlayer = player;
    if (player.getPlayerState() === window.YT.PlayerState.ENDED) player.seekTo(0, true);
    revealPlayer();
    player.playVideo();
  };
  button.addEventListener('pointerenter', () => loadYouTubePlayer().catch(() => {}), { once: true });
  button.addEventListener('focus', () => loadYouTubePlayer().catch(() => {}), { once: true });
  button.addEventListener('click', async () => {
    if (ready) { play(); return; }
    if (loading) return;
    loading = true;
    const current = ++attempt;
    container.classList.add('is-loading');
    button.setAttribute('aria-busy', 'true');
    status.textContent = '';
    try {
      const YT = await loadYouTubePlayer();
      if (current !== attempt) return;
      const mount = document.createElement('div');
      mount.className = 'video-mount';
      container.prepend(mount);
      watchdog = setTimeout(() => showFailure('Video could not load. Click the play button to retry.'), 20000);
      player = new YT.Player(mount, {
        width: '100%', height: '100%',
        host: 'https://www.youtube.com',
        videoId: button.dataset.videoId,
        playerVars: { playsinline: 1, controls: 1, rel: 0, origin: location.origin },
        events: {
          onReady: event => {
            if (current !== attempt) return;
            clearTimeout(watchdog);
            loading = false;
            ready = true;
            player = event.target;
            const frame = player.getIframe();
            frame.title = button.dataset.videoTitle;
            frame.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
            frame.referrerPolicy = 'strict-origin-when-cross-origin';
            play();
          },
          onStateChange: event => {
            if (current !== attempt) return;
            if (event.data === YT.PlayerState.PLAYING) {
              if (activePlayer && activePlayer !== event.target) activePlayer.pauseVideo();
              activePlayer = event.target;
              container.dataset.playback = 'playing';
              revealPlayer();
            } else if (event.data === YT.PlayerState.PAUSED) {
              container.dataset.playback = 'paused';
            } else if (event.data === YT.PlayerState.ENDED) {
              container.dataset.playback = 'ended';
            }
          },
          onAutoplayBlocked: () => {
            if (current !== attempt) return;
            button.hidden = false;
            card?.classList.remove('is-active');
            button.setAttribute('aria-label', `Play ${button.dataset.videoTitle}`);
          },
          onError: event => {
            if (current !== attempt) return;
            const message = [101, 150].includes(event.data)
              ? 'The video owner has disabled embedded playback.'
              : event.data === 100 ? 'This video is unavailable.'
              : 'Video could not load. Click the play button to retry.';
            showFailure(message);
          }
        }
      });
    } catch (error) {
      if (current === attempt) showFailure(error.message);
    }
  });
});
