/**
 * Dangar Island Community Hall - Interactive App Script
 * Controls real-time "What's Next at the Hall" countdown, geolocation distance detection,
 * timetable filters, bin-week alternation, and contact forms.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Dangar Island Community Hall Coordinates
  const HALL_LAT = -33.5417;
  const HALL_LON = 151.2464;

  // 1. Dynamic Footer Year
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. Mobile Navigation Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const mainNav = document.getElementById('mainNav');

  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('nav-open');
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
    });

    mainNav.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('nav-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // =========================================================================
  // 3. WHAT'S NEXT AT THE HALL - REAL-TIME ENGINE & COUNTDOWN TIMER
  // =========================================================================

  // Weekly Timetable Definitions (0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat)
  const WEEKLY_ACTIVITIES = [
    // Monday
    {
      day: 1,
      dayName: 'Monday',
      startHour: 8,
      startMin: 0,
      endHour: 9,
      endMin: 0,
      title: 'Yoga with Anna',
      leader: 'with Anna',
      tag: 'Wellness',
      desc: 'Gentle morning flow and mindful stretches to kick off the island week.'
    },
    {
      day: 1,
      dayName: 'Monday',
      startHour: 19,
      startMin: 30,
      endHour: 21,
      endMin: 0,
      title: 'Warblers Community Choir',
      leader: 'Choir & Voices',
      tag: 'Music',
      desc: 'Island community singing group. All voices and experience levels warmly welcomed!'
    },
    // Wednesday
    {
      day: 3,
      dayName: 'Wednesday',
      startHour: 19,
      startMin: 0,
      endHour: 21,
      endMin: 30,
      title: 'Bridge Night',
      leader: 'Social Card Play',
      tag: 'Cards & Strategy',
      desc: 'Friendly cards, sharp strategy, and a cuppa. Beginners & seasoned players welcome.'
    },
    // Thursday
    {
      day: 4,
      dayName: 'Thursday',
      startHour: 9,
      startMin: 0,
      endHour: 10,
      endMin: 0,
      title: 'Exercise with Brae',
      leader: 'with Brae',
      tag: 'Fitness',
      desc: 'Fun functional movement, mobility, and island energy workout.'
    },
    {
      day: 4,
      dayName: 'Thursday',
      startHour: 14,
      startMin: 0,
      endHour: 16,
      endMin: 0,
      title: 'Table Tennis',
      leader: 'Social Rallies',
      tag: 'Sports & Fun',
      desc: 'Fast rallies, friendly matches, laughs, and afternoon banter.'
    },
    {
      day: 4,
      dayName: 'Thursday',
      startHour: 19,
      startMin: 30,
      endHour: 21,
      endMin: 30,
      isAlternatingBin: true
    },
    // Friday
    {
      day: 5,
      dayName: 'Friday',
      startHour: 8,
      startMin: 0,
      endHour: 9,
      endMin: 0,
      title: 'Yoga with Anna',
      leader: 'with Anna',
      tag: 'Wellness',
      desc: 'Energising morning asanas to transition gracefully into the weekend.'
    },
    {
      day: 5,
      dayName: 'Friday',
      startHour: 15,
      startMin: 30,
      endHour: 16,
      endMin: 30,
      title: 'Kids Music with Pete',
      leader: 'with Pete',
      tag: 'Kids & Music',
      desc: 'Joyful songs, rhythm games, instruments, and musical fun for island youngsters.'
    }
  ];

  // Helper: Format Time string
  function formatTimeDisplay(hour, minute) {
    const period = hour >= 12 ? 'pm' : 'am';
    const h = hour % 12 === 0 ? 12 : hour % 12;
    const m = minute === 0 ? '00' : String(minute).padStart(2, '0');
    return `${h}:${m} ${period}`;
  }

  // Helper: Calculate ISO Week Number
  function getISOWeek(d) {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  }

  // DOM Elements for Countdown & Spotlight
  const nextEventStatusEl = document.getElementById('nextEventStatus');
  const nextEventTitleEl = document.getElementById('nextEventTitle');
  const nextEventDayEl = document.getElementById('nextEventDay');
  const nextEventTimeEl = document.getElementById('nextEventTime');
  const nextEventBinWeekEl = document.getElementById('nextEventBinWeek');
  const nextEventDescEl = document.getElementById('nextEventDesc');
  const nextEventTagEl = document.getElementById('nextEventTag');
  const countdownLabelEl = document.getElementById('countdownLabel');

  const timerDaysEl = document.getElementById('timerDays');
  const timerHoursEl = document.getElementById('timerHours');
  const timerMinutesEl = document.getElementById('timerMinutes');
  const timerSecondsEl = document.getElementById('timerSeconds');
  const sydneyTimeDisplay = document.getElementById('sydneyTimeDisplay');

  let currentTargetEvent = null;
  let targetTimestamp = null;
  let isCurrentlyHappening = false;

  function resolveNextActivity() {
    const now = new Date();

    // Check if any event is happening RIGHT NOW
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeVal = currentHour * 60 + currentMin;

    let inProgress = null;
    for (const act of WEEKLY_ACTIVITIES) {
      if (act.day === currentDay) {
        const startVal = act.startHour * 60 + act.startMin;
        const endVal = act.endHour * 60 + act.endMin;
        if (currentTimeVal >= startVal && currentTimeVal < endVal) {
          inProgress = act;
          break;
        }
      }
    }

    if (inProgress) {
      isCurrentlyHappening = true;
      let title = inProgress.title;
      let leader = inProgress.leader;
      let tag = inProgress.tag;
      let desc = inProgress.desc;
      let binInfo = null;

      if (inProgress.isAlternatingBin) {
        const isGreen = getISOWeek(now) % 2 === 0;
        binInfo = isGreen ? 'Green Bin Week' : 'Yellow Bin Week';
        if (isGreen) {
          title = 'Cinématèque Film Night';
          leader = 'Island Film Night';
          tag = 'Cinema & Arts';
          desc = 'Curated cinema, classic films, documentaries, and big screen river evenings with popcorn.';
        } else {
          title = 'Discussion Group';
          leader = 'Ideas & Dialogue';
          tag = 'Dialogue & Ideas';
          desc = 'Lively conversations on interesting topics, philosophy, local issues, and great books.';
        }
      }

      // End time target
      const endDate = new Date(now);
      endDate.setHours(inProgress.endHour, inProgress.endMin, 0, 0);
      targetTimestamp = endDate.getTime();

      currentTargetEvent = {
        title,
        leader,
        tag,
        desc,
        dayName: inProgress.dayName,
        timeStr: formatTimeDisplay(inProgress.startHour, inProgress.startMin),
        binInfo,
        isLive: true
      };
      updateSpotlightUI();
      return;
    }

    // Otherwise find next chronologically upcoming event
    isCurrentlyHappening = false;
    let nextCandidate = null;
    let nextCandidateDate = null;
    let smallestDiff = Infinity;

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() + dayOffset);
      const checkDayOfWeek = checkDate.getDay();

      const matchingActs = WEEKLY_ACTIVITIES.filter(a => a.day === checkDayOfWeek);
      for (const act of matchingActs) {
        const actDate = new Date(checkDate);
        actDate.setHours(act.startHour, act.startMin, 0, 0);

        const diff = actDate.getTime() - now.getTime();
        if (diff > 0 && diff < smallestDiff) {
          smallestDiff = diff;
          nextCandidate = act;
          nextCandidateDate = actDate;
        }
      }
    }

    if (nextCandidate && nextCandidateDate) {
      targetTimestamp = nextCandidateDate.getTime();
      let title = nextCandidate.title;
      let leader = nextCandidate.leader;
      let tag = nextCandidate.tag;
      let desc = nextCandidate.desc;
      let binInfo = null;

      if (nextCandidate.isAlternatingBin) {
        const isGreen = getISOWeek(nextCandidateDate) % 2 === 0;
        binInfo = isGreen ? 'Green Bin Week' : 'Yellow Bin Week';
        if (isGreen) {
          title = 'Cinématèque Film Night';
          leader = 'Island Film Night';
          tag = 'Cinema & Arts';
          desc = 'Curated cinema, classic films, documentaries, and big screen river evenings with popcorn.';
        } else {
          title = 'Discussion Group';
          leader = 'Ideas & Dialogue';
          tag = 'Dialogue & Ideas';
          desc = 'Lively conversations on interesting topics, philosophy, local issues, and great books.';
        }
      }

      currentTargetEvent = {
        title,
        leader,
        tag,
        desc,
        dayName: nextCandidate.dayName,
        timeStr: formatTimeDisplay(nextCandidate.startHour, nextCandidate.startMin),
        binInfo,
        isLive: false
      };
      updateSpotlightUI();
    }
  }

  function updateSpotlightUI() {
    if (!currentTargetEvent) return;

    if (nextEventTitleEl) nextEventTitleEl.textContent = currentTargetEvent.title;
    if (nextEventDayEl) nextEventDayEl.textContent = currentTargetEvent.dayName;
    if (nextEventTimeEl) nextEventTimeEl.textContent = currentTargetEvent.timeStr;
    if (nextEventDescEl) nextEventDescEl.textContent = currentTargetEvent.desc;
    if (nextEventTagEl) nextEventTagEl.textContent = currentTargetEvent.tag;

    if (currentTargetEvent.binInfo && nextEventBinWeekEl) {
      nextEventBinWeekEl.style.display = 'inline-block';
      if (currentTargetEvent.binInfo.includes('Green')) {
        nextEventBinWeekEl.textContent = '🟢 Green Bin Week';
        nextEventBinWeekEl.className = 'meta-item bin-week-highlight';
      } else {
        nextEventBinWeekEl.textContent = '🟡 Yellow Bin Week';
        nextEventBinWeekEl.className = 'meta-item bin-week-highlight yellow-highlight';
      }
    } else if (nextEventBinWeekEl) {
      nextEventBinWeekEl.style.display = 'none';
    }

    if (currentTargetEvent.isLive) {
      if (nextEventStatusEl) {
        nextEventStatusEl.textContent = '🎉 HAPPENING RIGHT NOW!';
        nextEventStatusEl.classList.add('is-live');
      }
      if (countdownLabelEl) countdownLabelEl.textContent = 'FINISHES IN';
    } else {
      if (nextEventStatusEl) {
        nextEventStatusEl.textContent = 'UPCOMING GATHERING';
        nextEventStatusEl.classList.remove('is-live');
      }
      if (countdownLabelEl) countdownLabelEl.textContent = 'STARTING IN';
    }
  }

  // Live Timer Tick (runs every second)
  function tickCountdown() {
    const now = new Date();

    // Update Sydney / Hawkesbury local clock
    if (sydneyTimeDisplay) {
      const timeStr = now.toLocaleTimeString('en-AU', {
        timeZone: 'Australia/Sydney',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      sydneyTimeDisplay.textContent = timeStr;
    }

    if (!targetTimestamp || targetTimestamp <= now.getTime()) {
      resolveNextActivity();
      return;
    }

    const diff = Math.max(0, targetTimestamp - now.getTime());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if (timerDaysEl) timerDaysEl.textContent = String(days).padStart(2, '0');
    if (timerHoursEl) timerHoursEl.textContent = String(hours).padStart(2, '0');
    if (timerMinutesEl) timerMinutesEl.textContent = String(minutes).padStart(2, '0');
    if (timerSecondsEl) timerSecondsEl.textContent = String(seconds).padStart(2, '0');
  }

  // Initial resolve and start ticker
  resolveNextActivity();
  tickCountdown();
  setInterval(tickCountdown, 1000);


  // =========================================================================
  // 4. GEOLOCATION DISTANCE & PROXIMITY DETECTION
  // =========================================================================
  const btnDetectLocation = document.getElementById('btnDetectLocation');
  const geoText = document.getElementById('geoText');

  function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function handleUserLocation(position) {
    const userLat = position.coords.latitude;
    const userLon = position.coords.longitude;
    const distKm = calculateDistanceKm(userLat, userLon, HALL_LAT, HALL_LON);

    if (geoText) {
      if (distKm <= 0.9) {
        geoText.innerHTML = `🌿 <strong>You are on Dangar Island!</strong> (~${Math.round(distKm * 1000)}m from the Hall)`;
      } else if (distKm <= 8) {
        geoText.innerHTML = `🚤 <strong>Hawkesbury River Local:</strong> ~${distKm.toFixed(1)}km to the Hall`;
      } else {
        geoText.innerHTML = `📍 <strong>Distance:</strong> ~${Math.round(distKm)}km from Dangar Island Hall`;
      }
    }
    if (btnDetectLocation) {
      btnDetectLocation.textContent = 'Updated ✓';
      btnDetectLocation.disabled = true;
    }
  }

  function handleLocationError(error) {
    console.log('Location info:', error.message);
    if (btnDetectLocation) {
      btnDetectLocation.textContent = 'Location Off';
      btnDetectLocation.disabled = true;
    }
  }

  btnDetectLocation?.addEventListener('click', () => {
    if ('geolocation' in navigator) {
      btnDetectLocation.textContent = 'Locating...';
      navigator.geolocation.getCurrentPosition(handleUserLocation, handleLocationError, {
        timeout: 10000,
        enableHighAccuracy: true
      });
    } else {
      btnDetectLocation.textContent = 'Not Supported';
    }
  });

  // Attempt silent geolocation if already permitted
  if ('permissions' in navigator) {
    navigator.permissions.query({ name: 'geolocation' }).then(result => {
      if (result.state === 'granted') {
        navigator.geolocation.getCurrentPosition(handleUserLocation, handleLocationError);
      }
    }).catch(() => {});
  }


  // =========================================================================
  // 5. THURSDAY BIN-WEEK TOGGLES (IN TIMETABLE GRID)
  // =========================================================================
  const btnGreenBin = document.getElementById('btnGreenBin');
  const btnYellowBin = document.getElementById('btnYellowBin');
  const cinemathequeEvent = document.getElementById('cinemathequeEvent');
  const discussionEvent = document.getElementById('discussionEvent');

  function setBinWeek(binType) {
    if (binType === 'green') {
      btnGreenBin?.classList.add('active');
      btnYellowBin?.classList.remove('active');
      cinemathequeEvent?.classList.add('active-bin-item');
      discussionEvent?.classList.remove('active-bin-item');
    } else {
      btnYellowBin?.classList.add('active');
      btnGreenBin?.classList.remove('active');
      discussionEvent?.classList.add('active-bin-item');
      cinemathequeEvent?.classList.remove('active-bin-item');
    }
  }

  // Auto-detect current bin week based on week number
  const currentWeekNumber = getISOWeek(new Date());
  const defaultBin = currentWeekNumber % 2 === 0 ? 'green' : 'yellow';
  setBinWeek(defaultBin);

  btnGreenBin?.addEventListener('click', () => setBinWeek('green'));
  btnYellowBin?.addEventListener('click', () => setBinWeek('yellow'));


  // =========================================================================
  // 6. SCHEDULE CATEGORY FILTER TABS
  // =========================================================================
  const filterBtns = document.querySelectorAll('.schedule-filters .filter-btn');
  const dayCards = document.querySelectorAll('.day-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter') || 'all';

      dayCards.forEach(card => {
        const cardCats = card.getAttribute('data-category') || '';
        if (filter === 'all' || cardCats.includes(filter)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });


  // =========================================================================
  // 7. IDEA CARDS QUICK SELECT -> SCROLLS TO CONTACT FORM
  // =========================================================================
  const ideaButtons = document.querySelectorAll('.btn-idea-select');
  const contactCategory = document.getElementById('contactCategory');
  const contactMessage = document.getElementById('contactMessage');

  ideaButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category') || 'Event';
      if (contactCategory) {
        for (let i = 0; i < contactCategory.options.length; i++) {
          if (contactCategory.options[i].text.toLowerCase().includes(category.toLowerCase())) {
            contactCategory.selectedIndex = i;
            break;
          }
        }
      }

      if (contactMessage) {
        contactMessage.placeholder = `Tell us your idea for a ${category.toLowerCase()} at the hall (e.g. proposed theme, rough dates, resources needed)...`;
      }

      const contactSec = document.getElementById('contact');
      if (contactSec) {
        contactSec.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          contactMessage?.focus();
        }, 600);
      }
    });
  });


  // =========================================================================
  // 8. FRIENDS OF THE HALL - EXPRESSION OF INTEREST FORM
  // =========================================================================
  const friendsForm = document.getElementById('friendsForm');
  const friendsFeedback = document.getElementById('friendsFeedback');
  const btnFriendSubmit = document.getElementById('btnFriendSubmit');

  if (friendsForm) {
    friendsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('friendEmail');
      const email = emailInput?.value.trim();

      if (!email || !isValidEmail(email)) {
        if (friendsFeedback) {
          friendsFeedback.textContent = 'Please enter a valid email address.';
          friendsFeedback.style.color = '#FFD2C9';
          friendsFeedback.style.marginTop = '0.5rem';
          friendsFeedback.style.fontWeight = '600';
        }
        emailInput?.focus();
        return;
      }

      if (btnFriendSubmit) {
        btnFriendSubmit.disabled = true;
        btnFriendSubmit.textContent = 'Submitting...';
      }

      try {
        await fetch('https://formsubmit.co/ajax/9ab7632c01f99e04ab2e3a6b3d06b3ae', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            form_type: 'Friends of the Hall - Early Expression of Interest',
            email: email,
            message: `New early subscriber for Friends of the Hall: ${email}`,
            _subject: `🌟 Friend of the Hall Interest: ${email}`
          })
        });
      } catch (err) {
        console.warn('Network submission fallback:', err);
      }

      if (friendsFeedback) {
        friendsFeedback.innerHTML = '🎉 <strong>Thank you!</strong> You’re on the list. We’ll notify you as soon as the Friends of the Hall membership launches!';
        friendsFeedback.style.color = '#D5EBD9';
        friendsFeedback.style.marginTop = '0.75rem';
        friendsFeedback.style.fontWeight = '600';
      }

      friendsForm.reset();
      if (btnFriendSubmit) {
        btnFriendSubmit.disabled = false;
        btnFriendSubmit.textContent = 'Keep Me Posted';
      }
    });
  }


  // =========================================================================
  // 9. CONTACT US FORM SUBMISSION (WITH ANTI-SPAM TOKEN)
  // =========================================================================
  const contactForm = document.getElementById('contactForm');
  const btnSubmitForm = document.getElementById('btnSubmitForm');
  const successModal = document.getElementById('successModal');
  const closeSuccessModal = document.getElementById('closeSuccessModal');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('contactName');
      const emailInput = document.getElementById('contactEmail');
      const categorySelect = document.getElementById('contactCategory');
      const messageInput = document.getElementById('contactMessage');
      const gotchaInput = document.getElementById('hall_secret_code');

      // Honeypot spam check
      if (gotchaInput && gotchaInput.value) {
        console.warn('Spam detected via honeypot.');
        return;
      }

      let hasError = false;

      // Validate name
      if (!nameInput?.value.trim()) {
        setError('contactName', 'nameError', true);
        hasError = true;
      } else {
        setError('contactName', 'nameError', false);
      }

      // Validate email
      if (!emailInput?.value.trim() || !isValidEmail(emailInput.value.trim())) {
        setError('contactEmail', 'emailError', true);
        hasError = true;
      } else {
        setError('contactEmail', 'emailError', false);
      }

      // Validate message
      if (!messageInput?.value.trim()) {
        setError('contactMessage', 'messageError', true);
        hasError = true;
      } else {
        setError('contactMessage', 'messageError', false);
      }

      if (hasError) return;

      // Submit state
      contactForm.classList.add('is-submitting');
      if (btnSubmitForm) btnSubmitForm.disabled = true;

      const payload = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        category: categorySelect ? categorySelect.value : 'General Enquiry',
        message: messageInput.value.trim(),
        _subject: `💌 Hall Website Contact: ${categorySelect ? categorySelect.value : 'Enquiry'} from ${nameInput.value.trim()}`
      };

      try {
        const response = await fetch('https://formsubmit.co/ajax/9ab7632c01f99e04ab2e3a6b3d06b3ae', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          showSuccessDialog(payload.name);
          contactForm.reset();
        } else {
          fallbackMailto(payload);
        }
      } catch (err) {
        console.warn('Submission network fallback:', err);
        fallbackMailto(payload);
      } finally {
        contactForm.classList.remove('is-submitting');
        if (btnSubmitForm) btnSubmitForm.disabled = false;
      }
    });
  }

  function setError(fieldId, errorId, isError) {
    const field = document.getElementById(fieldId);
    const parent = field?.closest('.form-group');
    if (parent) {
      if (isError) {
        parent.classList.add('has-error');
      } else {
        parent.classList.remove('has-error');
      }
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showSuccessDialog(name) {
    const titleEl = document.getElementById('successModalTitle');
    const msgEl = document.getElementById('successModalMessage');
    if (titleEl) titleEl.textContent = `Thank you, ${name}!`;
    if (msgEl) {
      msgEl.innerHTML = `Your message has been sent securely to the hall committee.<br><br>We'll review your note and reply to your email soon!`;
    }
    if (successModal && typeof successModal.showModal === 'function') {
      successModal.showModal();
    } else {
      alert(`Thank you, ${name}! Your message has been sent to the hall committee.`);
    }
  }

  function fallbackMailto(payload) {
    const mailtoUrl = `mailto:dangarislandhall@gmail.com?subject=${encodeURIComponent(payload._subject)}&body=${encodeURIComponent(`Name: ${payload.name}\nEmail: ${payload.email}\nTopic: ${payload.category}\n\nMessage:\n${payload.message}`)}`;
    window.location.href = mailtoUrl;
    showSuccessDialog(payload.name);
  }

  closeSuccessModal?.addEventListener('click', () => {
    successModal?.close();
  });

  successModal?.addEventListener('click', (e) => {
    const rect = successModal.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
      successModal.close();
    }
  });


  // =========================================================================
  // 10. WHITEBOARD MODAL HANDLER
  // =========================================================================
  const btnViewWhiteboard = document.getElementById('btnViewWhiteboard');
  const whiteboardModal = document.getElementById('whiteboardModal');
  const closeWhiteboardModal = document.getElementById('closeWhiteboardModal');

  btnViewWhiteboard?.addEventListener('click', () => {
    if (whiteboardModal && typeof whiteboardModal.showModal === 'function') {
      whiteboardModal.showModal();
    }
  });

  closeWhiteboardModal?.addEventListener('click', () => {
    whiteboardModal?.close();
  });

  whiteboardModal?.addEventListener('click', (e) => {
    const rect = whiteboardModal.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
      whiteboardModal.close();
    }
  });
});
