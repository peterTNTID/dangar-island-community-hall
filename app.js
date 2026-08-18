/**
 * Dangar Island Community Hall - Interactive App Script
 * Controls timetable filters, bin-week alternation, contact form submission,
 * Friends of the Hall signup, and responsive interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
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

    // Close mobile nav when clicking a nav link
    mainNav.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('nav-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 3. Bin-Week Alternating Schedule Logic
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

  function getISOWeek(d) {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  }

  // 4. Schedule Filtering (All, Yoga, Music, Social, Talks)
  const filterBtns = document.querySelectorAll('.schedule-filters .filter-btn');
  const dayCards = document.querySelectorAll('.day-card');
  const eventItems = document.querySelectorAll('.event-item:not(.event-bin-conditional)');

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

  // 5. Idea Cards Quick Select -> Scrolls to Contact Form with Category Pre-selected
  const ideaButtons = document.querySelectorAll('.btn-idea-select');
  const contactCategory = document.getElementById('contactCategory');
  const contactMessage = document.getElementById('contactMessage');

  ideaButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category') || 'Event';
      if (contactCategory) {
        // Set category
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

  // 6. Friends of the Hall Expression of Interest Form
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
        // Submit via AJAX to FormSubmit endpoint targeting dangarislandhall@gmail.com
        await fetch('https://formsubmit.co/ajax/dangarislandhall@gmail.com', {
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

  // 7. Contact Us Form Submission (with Secure Anti-Spam & Delivery)
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
        const response = await fetch('https://formsubmit.co/ajax/dangarislandhall@gmail.com', {
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
          // Fallback direct mailto trigger if endpoint throttled
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
      msgEl.innerHTML = `Your message has been sent directly to <strong>dangarislandhall@gmail.com</strong>.<br><br>The hall committee will review your idea / message and reply to your email soon.`;
    }
    if (successModal && typeof successModal.showModal === 'function') {
      successModal.showModal();
    } else {
      alert(`Thank you, ${name}! Your message has been sent to dangarislandhall@gmail.com.`);
    }
  }

  function fallbackMailto(payload) {
    const mailtoUrl = `mailto:dangarislandhall@gmail.com?subject=${encodeURIComponent(payload._subject)}&body=${encodeURIComponent(`Name: ${payload.name}\nEmail: ${payload.email}\nTopic: ${payload.category}\n\nMessage:\n${payload.message}`)}`;
    window.location.href = mailtoUrl;
    showSuccessDialog(payload.name);
  }

  // Close modals
  closeSuccessModal?.addEventListener('click', () => {
    successModal?.close();
  });

  successModal?.addEventListener('click', (e) => {
    const rect = successModal.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
      successModal.close();
    }
  });

  // 8. Whiteboard Modal Handler
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
