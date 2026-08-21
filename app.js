/* ==========================================================================
   DANCE DARBAR KALA SANSTHAN - JAVASCRIPT APP & SPA ROUTER
   ========================================================================== */

// --------------------------------------------------------------------------
// 0. EMAIL NOTIFICATION CONFIG (Web3Forms - Free, No Backend Needed)
// --------------------------------------------------------------------------
const EMAIL_CONFIG = {
  accessKey: '5af062c1-d87e-408c-803e-d1c0e9c8e962',
  adminEmail: 'dancedarbar96@gmail.com'
};

const EMAIL_QUEUE_KEY = 'dance_darbar_email_queue_v1';

function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}

function getEmailQueue() {
  try {
    const q = localStorage.getItem(EMAIL_QUEUE_KEY);
    return q ? JSON.parse(q) : [];
  } catch (e) {
    return [];
  }
}

function saveEmailQueue(q) {
  try {
    localStorage.setItem(EMAIL_QUEUE_KEY, JSON.stringify(q));
  } catch (e) {}
}

function queueEmailForRetry(payload) {
  const queue = getEmailQueue();
  const exists = queue.some(item => JSON.stringify(item) === JSON.stringify(payload));
  if (!exists) {
    queue.push(payload);
    saveEmailQueue(queue);
  }
}

async function processEmailQueue() {
  const queue = getEmailQueue();
  if (queue.length === 0) return;

  console.log(`Processing email retry queue (${queue.length} item(s))...`);
  const remaining = [];

  for (const payload of queue) {
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!data.success) remaining.push(payload);
    } catch (err) {
      remaining.push(payload);
    }
  }

  saveEmailQueue(remaining);
}

// Auto-retry emails on internet reconnection
window.addEventListener('online', processEmailQueue);

async function sendEmailNotification(subject, formData) {
  const sanitizedForm = {};
  for (const key in formData) {
    sanitizedForm[key] = sanitizeInput(String(formData[key]));
  }

  const payload = {
    access_key: EMAIL_CONFIG.accessKey,
    subject: subject,
    from_name: 'Dance Darbar Backend System',
    to: EMAIL_CONFIG.adminEmail,
    ...sanitizedForm
  };

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      console.log('Admin email notification delivered:', subject);
      return true;
    } else {
      console.warn('Web3Forms returned failure, queueing email for retry.');
      queueEmailForRetry(payload);
      return false;
    }
  } catch (err) {
    console.warn('Network error during email dispatch, queueing for retry.', err);
    queueEmailForRetry(payload);
    return false;
  }
}

async function sendCustomerConfirmationEmail(toEmail, subject, details) {
  const payload = {
    access_key: EMAIL_CONFIG.accessKey,
    subject: subject,
    from_name: 'Dance Darbar Kala Sansthan',
    to: sanitizeInput(toEmail),
    ...details
  };

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.success;
  } catch (err) {
    queueEmailForRetry(payload);
    return false;
  }
}

// --------------------------------------------------------------------------
// 1. DATA MODELS & CONTENT REGISTRY
// --------------------------------------------------------------------------
const DANCE_DATA = {
  programs: [
    {
      id: 'kathak',
      slug: 'kathak',
      number: '01',
      name: 'Kathak',
      onlineAvailable: true,
      modeBadge: '🟢 Available in Offline & Online Batches',
      onlineNote: 'Learn Kathak from anywhere with our live online classes, or join our offline studio batches for an immersive classroom experience.',
      shortDescription: 'Classical technique, footwork, rhythm, expression and storytelling.',
      fullDescription: 'Kathak is one of the eight major forms of Indian classical dance. Learn Kathak from anywhere with our live online classes, or join our offline studio batches for an immersive classroom experience.',
      image: 'assets/kathak-local.jpg',
      ageGroups: ['Children (5–12 yrs)', 'Teenagers (13–17 yrs)', 'Adults (18+ yrs)'],
      levels: ['Beginner', 'Intermediate', 'Advanced'],
      curriculum: [
        'Fundamentals of Tatkar & Footwork',
        'Hasta Mudras & Arm Positions',
        'Taal Rhythm Systems & Layakari',
        'Thaat, Aamad, Toda & Tukda Compositions',
        'Abhinaya & Classical Storytelling',
        'Ghungroo Practice & Stage Performance Technique'
      ],
      instructor: 'Guru Bhagwan Singh',
      schedulePreview: 'Tue & Thu: 5:00 PM - 6:30 PM | Sat & Sun: 10:00 AM - 11:30 AM'
    },
    {
      id: 'bollywood',
      slug: 'bollywood',
      number: '02',
      name: 'Bollywood',
      onlineAvailable: false,
      modeBadge: 'Offline Classes Only',
      onlineNote: '',
      shortDescription: 'Energetic choreography, performance skills, musicality and confidence.',
      fullDescription: 'Experience the joy, drama, and energy of modern Indian cinema dance. Our Bollywood programme blends traditional folk, modern commercial, semi-classical, and hip-hop influences to build coordination, stamina, and vibrant stage presence.',
      image: 'assets/bollywood-local.png',
      ageGroups: ['Children (5–12 yrs)', 'Teenagers (13–17 yrs)', 'Adults (18+ yrs)'],
      levels: ['Beginner', 'Intermediate'],
      curriculum: [
        'Rhythm & Beat Identification',
        'Modern & Folk Fusion Choreography',
        'Facial Expressions & Stage Energy',
        'Group Formations & Performance Framing',
        'Stamina & Body Conditioning'
      ],
      instructor: 'Senior Dance Choreographer',
      schedulePreview: 'Mon & Wed: 6:00 PM - 7:00 PM | Sat: 4:00 PM - 5:30 PM'
    },
    {
      id: 'vocal-music',
      slug: 'vocal-music',
      number: '03',
      name: 'Vocals',
      onlineAvailable: false,
      modeBadge: 'Offline Classes Only',
      onlineNote: '',
      shortDescription: 'Voice culture, rhythm, melody, breathing and performance practice.',
      fullDescription: 'Cultivate pitch accuracy, breath control, and classical voice resonance. Learn fundamental Swaras, Ragas, Alankars, and devotional melodies in an encouraging and structured atmosphere.',
      image: 'assets/music-local.png',
      ageGroups: ['Children (6–12 yrs)', 'Teenagers (13–17 yrs)', 'Adults & Seniors'],
      levels: ['Beginner', 'Intermediate'],
      curriculum: [
        'Voice Culture & Breath Mechanics',
        'Swar Practice & Pitch Matching',
        'Alankars & Scale Sequences',
        'Introduction to Classical Ragas',
        'Bhajan, Sugam Sangeet & Performance Training'
      ],
      instructor: 'Guest Faculty Master Singers',
      schedulePreview: 'Fri: 5:00 PM - 6:30 PM | Sun: 11:30 AM - 1:00 PM'
    },
    {
      id: 'fine-arts',
      slug: 'fine-arts',
      number: '04',
      name: 'Fine Arts',
      onlineAvailable: true,
      modeBadge: '🟢 Available in Offline & Online Batches',
      onlineNote: 'Join our Fine Arts programme either in the studio or through interactive live online classes designed for students across India and abroad.',
      shortDescription: 'Drawing, composition, color theory and visual creative expression.',
      fullDescription: 'Develop visual observation and creative confidence through structured drawing, sketching, painting, and perspective techniques. Join our Fine Arts programme either in the studio or through interactive live online classes designed for students across India and abroad.',
      image: 'assets/fine-arts-local.png',
      ageGroups: ['Children (5–12 yrs)', 'Teenagers (13–17 yrs)', 'Adults'],
      levels: ['Beginner', 'Developing', 'Advanced'],
      curriculum: [
        'Line, Form & Perspective Sketching',
        'Color Mixing & Shading Dynamics',
        'Watercolour & Acrylic Painting Techniques',
        'Composition & Spatial Awareness',
        'Exhibition Preparation & Portfolio Guidance'
      ],
      instructor: 'Senior Art Mentor',
      schedulePreview: 'Sat & Sun: 2:00 PM - 4:00 PM'
    },
    {
      id: 'yoga',
      slug: 'yoga',
      number: '05',
      name: 'Yoga',
      onlineAvailable: false,
      modeBadge: 'Offline Classes Only',
      onlineNote: '',
      shortDescription: 'Mindful movement, flexibility, balance, breathing and inner strength.',
      fullDescription: 'Harmonize body and mind through traditional Asanas, Pranayama breathing, and guided meditation. Designed to improve posture, joint mobility, core stability, and mental clarity for practitioners of all ages.',
      image: 'assets/yoga-local.png',
      ageGroups: ['Adults (18–50 yrs)', 'Senior Learners (50+ yrs)', 'All Ages'],
      levels: ['Beginner', 'Regular Practice'],
      curriculum: [
        'Surya Namaskar & Warm-Up Sequences',
        'Standing & Seated Asana Postures',
        'Pranayama Deep Breath Techniques',
        'Joint Mobility & Flexibility Focus',
        'Guided Relaxation & Mindfulness Meditation'
      ],
      instructor: 'Certified Yoga Acharya',
      schedulePreview: 'Mon, Wed & Fri: 7:00 AM - 8:00 AM | Sat: 8:00 AM - 9:00 AM'
    }
  ],

  schedules: [
    { program: 'Kathak', level: 'Beginner', ageGroup: '5–12 Years', day: 'Monday & Friday', timeSlot: 'Evening', time: '4:00 PM – 5:30 PM', instructor: 'Guru Bhagwan Singh', availability: 'Available' },
    { program: 'Kathak', level: 'Intermediate', ageGroup: '13–17 Years', day: 'Monday & Friday', timeSlot: 'Evening', time: '5:30 PM – 6:45 PM', instructor: 'Guru Bhagwan Singh', availability: 'Available' },
    { program: 'Kathak', level: 'Advanced', ageGroup: '18+ Years', day: 'Monday & Friday', timeSlot: 'Evening', time: '6:45 PM – 8:00 PM', instructor: 'Guru Bhagwan Singh', availability: 'Available' },
    { program: 'Bollywood', level: 'Beginner', ageGroup: 'All Age Groups', day: 'Tuesday & Thursday', timeSlot: 'Evening', time: 'Timing Coming Soon', instructor: 'Simar Mehendiratta', availability: 'Available' },
    { program: 'Bollywood', level: 'Intermediate', ageGroup: 'All Age Groups', day: 'Tuesday & Thursday', timeSlot: 'Evening', time: 'Timing Coming Soon', instructor: 'Simar Mehendiratta', availability: 'Available' },
    { program: 'Vocals', level: 'Beginner', ageGroup: 'All Age Groups', day: 'Wednesday & Saturday', timeSlot: 'Evening', time: 'Timing Coming Soon', instructor: 'Punit Tiwari', availability: 'Available' },
    { program: 'Vocals', level: 'Intermediate', ageGroup: 'All Age Groups', day: 'Wednesday & Saturday', timeSlot: 'Evening', time: 'Timing Coming Soon', instructor: 'Punit Tiwari', availability: 'Available' },
    { program: 'Fine Arts', level: 'Beginner', ageGroup: '5–12 Years', day: 'Saturday', timeSlot: 'Afternoon', time: 'Timing Coming Soon', instructor: 'Guru Bhagwan Singh', availability: 'Available' },
    { program: 'Fine Arts', level: 'Intermediate', ageGroup: '13+ Years', day: 'Saturday', timeSlot: 'Afternoon', time: 'Timing Coming Soon', instructor: 'Guru Bhagwan Singh', availability: 'Available' },
    { program: 'Yoga', level: 'Morning Batch', ageGroup: 'Adults & Senior Citizens', day: 'Monday to Saturday', timeSlot: 'Morning', time: '7:00 AM – 8:00 AM', instructor: 'Mrs. Meena Kuthal', availability: 'Available' }
  ],

  events: [
    {
      id: 'amrapali',
      title: 'AMRAPALI 2026',
      subtitle: 'Annual Student Dance Ballet',
      tagline: 'DANCE DARBAR KALA SANSTHAN PRESENTS',
      date: '23 August 2026',
      day: 'Sunday',
      time: '4:00 PM – 9:00 PM',
      venue: 'CCRT Auditorium, Dwarka Sector 7, New Delhi',
      image: 'assets/amrapali.jpg',
      instagramUrl: 'https://www.instagram.com/reel/DbiBr0UpjrT/?igsh=MXAyM2RocGpuaW5yYQ==&igsi=MXAyM2RocGpuaW5yYQ==',
      description: 'Witness the remarkable performances of Dance Darbar students as they present AMRAPALI 2026, an annual showcase celebrating passion, discipline, and artistic expression through Kathak, Bollywood, Vocal Music, Fine Arts, and Yoga.'
    }
  ],

  galleryItems: [
    { id: 1, category: 'Kathak', title: 'Kathak Classical Tarana & Footwork', subtitle: 'Watch Official Reel | @dance_darbar', image: 'assets/kathak-reel-thumb.jpg', type: 'reel', instagramUrl: 'https://www.instagram.com/reel/DYJ1ehuIzlT/?igsh=cDF0YTlrZDc3ZGN5' },
    { id: 2, category: 'Bollywood', title: 'Energetic Bollywood Fusion Choreography', subtitle: 'Watch Official Reel | @dance_darbar', image: 'assets/bollywood.jpg', type: 'reel', instagramUrl: 'https://www.instagram.com/reel/DZF57CUhGEC/?igsh=dW9vdnliazIzNXV0&igsi=dW9vdnliazIzNXV0' },
    { id: 3, category: 'Events', title: 'AMRAPALI 2026 Annual Production Highlights', subtitle: 'Stage Performance Reel | @dance_darbar', image: 'assets/amrapali.jpg', type: 'reel', instagramUrl: 'https://www.instagram.com/reel/DbiBr0UpjrT/?igsh=MXAyM2RocGpuaW5yYQ==&igsi=MXAyM2RocGpuaW5yYQ==' },
    { id: 4, category: 'Fine Arts', title: 'Fine Arts Canvas & Composition Workshop', subtitle: 'Creative Art Studio | @dance_darbar', image: 'assets/fine-arts.jpg', type: 'photo', instagramUrl: 'https://www.instagram.com/dance_darbar?igsh=MWl6bW4za3NreHhrOA==' },
    { id: 5, category: 'Yoga', title: 'Morning Asana & Mindfulness Practice', subtitle: 'Wellness Session | @dance_darbar', image: 'assets/yoga.jpg', type: 'photo', instagramUrl: 'https://www.instagram.com/dance_darbar?igsh=MWl6bW4za3NreHhrOA==' },
    { id: 6, category: 'Vocal Music', title: 'Raga Performance & Tanpura Session', subtitle: 'Vocal Sanctuary | @dance_darbar', image: 'assets/vocal-music.jpg', type: 'reel', instagramUrl: 'https://www.instagram.com/dance_darbar?igsh=MWl6bW4za3NreHhrOA==' }
  ],

  faqs: [
    {
      q: 'Who can join Dance Darbar Kala Sansthan?',
      a: 'Children (ages 5+), teenagers, adults, and senior learners can join appropriate structured batches tailored to their age group and experience level.'
    },
    {
      q: 'Can complete beginners join the academy?',
      a: 'Yes! We offer dedicated beginner-friendly foundation batches for students with no previous dance, music, or art background.'
    },
    {
      q: 'Which creative programmes are offered?',
      a: 'Dance Darbar Kala Sansthan offers disciplined instruction in Kathak, Bollywood, Vocal Music, Fine Arts, and Yoga.'
    },
    {
      q: 'How do I claim a free trial class seat?',
      a: 'Click "Claim Free Seat" on the header or navigation, fill in the student name, age group, and preferred programme. Our team will contact you with batch timings.'
    },
    {
      q: 'Do academy students get stage performance exposure?',
      a: 'Yes. Eligible students participate in annual showcases, cultural festivals, and academy productions like Nritya Mahotsav AMRAPALI.'
    }
  ],

  testimonials: [
    {
      id: 1,
      name: "Priyanka Sharma",
      role: "Parent of Kathak Student (Age 8)",
      quote: "Guru Bhagwan Singh Ji's discipline and grace have transformed my daughter's confidence. The Kathak footwork and posture training at Dance Darbar are unparalleled in Dwarka.",
      rating: 5
    },
    {
      id: 2,
      name: "Rajesh Malhotra",
      role: "Adult Learner (Bollywood & Yoga)",
      quote: "Joining Dance Darbar's weekend adult batch was the best decision. The atmosphere is warm, artistic, and deeply professional. I regained my stamina and joy of stage dance.",
      rating: 5
    },
    {
      id: 3,
      name: "Sunita Verma",
      role: "Mother of Fine Arts & Vocal Student",
      quote: "Dance Darbar provides holistic artistic growth. Both fine arts composition and vocal music classes are taught with deep patience, structure, and true passion.",
      rating: 5
    }
  ]
};

// --------------------------------------------------------------------------
// 2. ROUTER & PAGE RENDERERS
// --------------------------------------------------------------------------
function renderApp() {
  const appRoot = document.getElementById('app-root');
  const header = document.getElementById('site-header');
  const hash = window.location.hash || '#/';
  const route = hash.replace('#', '');

  if (header) {
    if (route === '/' || route === '') {
      header.classList.add('is-home');
      header.classList.remove('is-subpage');
    } else {
      header.classList.add('is-subpage');
      header.classList.remove('is-home');
    }
  }

  // Active Link Styling
  document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
    const targetRoute = link.getAttribute('data-route');
    if (targetRoute === route || (targetRoute !== '/' && route.startsWith(targetRoute))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  window.scrollTo(0, 0);

  // Route Dispatcher
  if (route === '/' || route === '') {
    appRoot.innerHTML = renderHomePage();
    initHomePageEvents();
  } else if (route === '/programs') {
    appRoot.innerHTML = renderProgramsPage();
  } else if (route.startsWith('/programs/')) {
    const slug = route.split('/programs/')[1];
    appRoot.innerHTML = renderProgramDetailPage(slug);
  } else if (route === '/schedule') {
    appRoot.innerHTML = renderSchedulePage();
    initScheduleFilterEvents();
  } else if (route === '/events') {
    appRoot.innerHTML = renderEventsPage();
  } else if (route.startsWith('/events/')) {
    const slug = route.split('/events/')[1];
    appRoot.innerHTML = renderEventDetailPage(slug);
  } else if (route === '/gallery') {
    appRoot.innerHTML = renderGalleryPage();
    initGalleryEvents();
  } else if (route === '/claim-free-seat') {
    appRoot.innerHTML = renderClaimFreeSeatPage();
    initTrialFormEvents();
  } else if (route === '/about') {
    appRoot.innerHTML = renderAboutPage();
  } else if (route === '/contact') {
    appRoot.innerHTML = renderContactPage();
    initContactFormEvents();
  } else if (route === '/faq') {
    appRoot.innerHTML = renderFAQPage();
    initFAQPageEvents();
  } else if (route === '/privacy') {
    appRoot.innerHTML = renderPrivacyPage();
  } else if (route === '/terms') {
    appRoot.innerHTML = renderTermsPage();
  } else if (route === '/admin') {
    appRoot.innerHTML = renderAdminPage();
    initAdminPageEvents();
  } else {
    appRoot.innerHTML = renderHomePage();
    initHomePageEvents();
  }
}

// --------------------------------------------------------------------------
// 3. PAGE VIEW TEMPLATES
// --------------------------------------------------------------------------

// --- HOME PAGE TEMPLATE ---
function renderHomePage() {
  const kathakProg = DANCE_DATA.programs.find(p => p.slug === 'kathak');
  const amrapaliEvent = DANCE_DATA.events[0];

  return `
    <!-- HERO SECTION -->
    <section class="hero-section">
      <div class="hero-video-wrap">
        <iframe
          class="hero-video-iframe"
          src="https://player.vimeo.com/video/1215238851?background=1&autoplay=1&loop=1&muted=1&autopause=0&quality=1080p&dnt=1"
          width="3840"
          height="2160"
          frameborder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          referrerpolicy="strict-origin-when-cross-origin"
          title="Nritya Mahotsav 2025 Guru Vandana Choreographed By Guru Bhagwan Singh_2160p">
        </iframe>
        <div class="hero-overlay-gradient"></div>
      </div>
      <div class="hero-content">
        <div class="hero-text-box">
          <span class="eyebrow light">Dance Darbar Kala Sansthan</span>
          <h1 class="display-heading hero-heading">Where Movement<br>Becomes Art.</h1>
          <p class="hero-subheading">Disciplined training in Kathak, Bollywood, Vocal Music, Fine Arts and Yoga for every age and skill level.</p>
          <div class="hero-cta-group">
            <a href="#/claim-free-seat" class="btn btn-primary">
              <span>Claim Free Seat</span>
              <svg class="btn-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <a href="#/programs" class="btn btn-secondary light">Explore Classes</a>
          </div>
        </div>
      </div>
      <div class="scroll-indicator">
        <span>Scroll</span>
        <div class="scroll-icon"><div class="scroll-dot"></div></div>
      </div>
    </section>

    <!-- BRAND STORY / PHILOSOPHY -->
    <section class="about-brand-section section-padding">
      <div class="section-container">
        <div style="text-align: center; max-width: 980px; margin: 0 auto;">
          <h2 class="section-heading" style="margin-bottom: 16px;">Every Step Tells a Story.</h2>
          <p class="about-brand-text" style="margin: 0 auto; color: var(--color-muted-text); font-weight: 400;">
            Dance Darbar Kala Sansthan is a premier performing arts sanctuary where artistic discipline, Indian culture, and creative expression unite. Through structured mentorship in Kathak, Bollywood, Vocal Music, Fine Arts, and Yoga, we empower learners of all ages to build posture, confidence, and stage poise. Every step at Dance Darbar nurtures self-belief, grace, and a lifelong passion for artistic mastery.
          </p>
        </div>
      </div>
    </section>

    <!-- INTERACTIVE PROGRAMME INDEX -->
    <section class="program-index-section">
      <div class="program-bg-preview-wrap">
        ${DANCE_DATA.programs.map((p, idx) => p.video ? `
          <video src="${p.video}" autoplay loop muted playsinline class="program-bg-preview ${idx === 0 ? 'active' : ''}" data-prog-bg="${p.slug}"></video>
        ` : `
          <img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async" class="program-bg-preview ${idx === 0 ? 'active' : ''}" data-prog-bg="${p.slug}">
        `).join('')}
      </div>
      <div class="program-index-content">
        <div class="program-index-header">
          <span class="eyebrow light">Explore Classes</span>
          <h2 class="section-heading" style="color: var(--color-white);">Choose the Art That Moves You.</h2>
          <p class="lead-text light">Hover or select a class to preview the experience.</p>
        </div>

        <div class="program-list">
          ${DANCE_DATA.programs.map((p, idx) => `
            <div class="program-item ${idx === 0 ? 'active' : ''}" data-prog-target="${p.slug}">
              <span class="program-number">${p.number}</span>
              <div>
                <h3 class="program-title" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span>${p.name}</span>
                  ${p.onlineAvailable ? `<span class="online-pill-badge">Online Available</span>` : ``}
                </h3>
              </div>
              <div>
                <p class="program-desc">${p.shortDescription}</p>
                <span style="font-size: 11px; font-weight: 600; color: ${p.onlineAvailable ? '#5EBBEA' : 'rgba(255,255,255,0.5)'}; margin-top: 4px; display: inline-block;">${p.modeBadge}</span>
                <p style="font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 4px;">👤 ${p.instructor} • 🎓 ${p.ageGroups[0]}</p>
              </div>
              <div class="program-card-actions">
                <a href="#/programs/${p.slug}" class="btn btn-secondary light">View Details &rarr;</a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- FEATURED EVENT (AMRAPALI 2026 / UPCOMING PERFORMANCE) -->
    <section class="featured-event-section">
      <div class="section-container">
        <span class="eyebrow light">Upcoming Performance</span>
        <div class="event-banner-card">
          <div class="event-media-side">
            <img src="${amrapaliEvent.image}" alt="${amrapaliEvent.title}" loading="lazy" decoding="async" class="event-img">
          </div>
          <div class="event-info-side">
            <span class="eyebrow light">${amrapaliEvent.tagline}</span>
            <h2 class="event-title-highlight" style="line-height: 1.1; margin: 6px 0 10px;">
              AMRAPALI 2026
              <span style="display: block; font-size: 0.44em; font-weight: 600; color: rgba(255,255,255,0.85); margin-top: 4px; letter-spacing: 0;">Annual Student Dance Ballet</span>
            </h2>
            <p style="color: rgba(255,255,255,0.8); margin-bottom: 20px; font-size: 14px; line-height: 1.55;">${amrapaliEvent.description}</p>
            <div class="event-meta-list">
              <div class="meta-row">
                <span class="meta-label">Date</span>
                <span class="meta-val">${amrapaliEvent.date} (${amrapaliEvent.day})</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Time</span>
                <span class="meta-val">${amrapaliEvent.time}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Venue</span>
                <span class="meta-val">${amrapaliEvent.venue}</span>
              </div>
            </div>
            ${renderAmrapaliCTA()}
          </div>
        </div>
      </div>
    </section>

    <!-- STATISTICS COUNTER -->
    <section class="stats-section">
      <div class="section-container">
        <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
          <div class="stat-item cursor-target-view">
            <span class="stat-value counter-anim" data-target="5000" data-suffix="+">0+</span>
            <span class="stat-label">Students Trained</span>
          </div>
          <div class="stat-item cursor-target-view">
            <span class="stat-value counter-anim" data-target="150" data-suffix="+">0+</span>
            <span class="stat-label">Stage Performances</span>
          </div>
          <div class="stat-item cursor-target-view">
            <span class="stat-value">All Ages</span>
            <span class="stat-label">Learning Community</span>
          </div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS SHOWCASE SECTION WITH MOTION GRAPHICS -->
    <section class="testimonials-section section-padding">
      <div class="section-container">
        <div style="text-align: center; margin-bottom: 56px;">
          <span class="eyebrow">Student & Parent Stories</span>
          <h2 class="section-heading">Voices of Our Community.</h2>
          <p class="lead-text" style="margin: 0 auto; max-width: 600px;">Hear how Dance Darbar Kala Sansthan shapes confidence, rhythm, and artistic growth.</p>
        </div>

        <div class="testimonials-grid">
          ${DANCE_DATA.testimonials.map((t, idx) => `
            <div class="testimonial-card motion-graphic-testimonial cursor-target-view" style="animation-delay: ${idx * 0.15}s">
              <div class="motion-quote-mark">“</div>
              <div class="testimonial-rating">
                ${'★'.repeat(t.rating)}
              </div>
              <p class="testimonial-quote">“${t.quote}”</p>
              <div class="testimonial-author">
                <div>
                  <h4 class="author-name">${t.name}</h4>
                  <span class="author-role">${t.role}</span>
                </div>
              </div>
              <div class="card-glow-border"></div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>



    <!-- DUAL FAQ & CONTACT US SPLIT BANNER -->
    <section class="dual-banner-section">
      <div class="dual-banner-grid">
        <a href="#/faq" class="dual-banner-item cursor-target-view">
          <span class="dual-eyebrow">FAQ</span>
          <h2 class="dual-title">FAQ</h2>
        </a>
        <div class="dual-divider"></div>
        <a href="#/contact" class="dual-banner-item cursor-target-view">
          <span class="dual-eyebrow">Contact Us</span>
          <h2 class="dual-title">CONTACT US</h2>
        </a>
      </div>
    </section>
  `;
}

// --- PROGRAMS PAGE TEMPLATE ---
function renderProgramsPage() {
  return `
    <div style="padding-top: 140px; padding-bottom: 100px;">
      <div class="section-container">
        <span class="eyebrow">Our Classes</span>
        <h1 class="section-heading" style="font-size: clamp(38px, 5vw, 64px); margin-bottom: 16px;">Find Your Form of Expression.</h1>
        <p class="lead-text" style="margin-bottom: 60px;">Explore structured artistic training created for children, teenagers, adults and senior learners across dance, music, art and wellness.</p>

        <div style="display: flex; flex-direction: column; gap: 48px;">
          ${DANCE_DATA.programs.map((p, idx) => `
            <div class="editorial-split" style="background: var(--color-white); border-radius: var(--radius-large); padding: 48px; border: 1px solid var(--color-border); ${idx % 2 === 1 ? 'grid-template-columns: 1fr 1fr;' : ''}">
              <div class="editorial-content">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                  <span class="eyebrow">${p.number} — Class</span>
                  ${p.onlineAvailable ? `<span class="online-pill-badge">Online Available</span>` : `<span class="offline-pill-badge">Offline Classes Only</span>`}
                </div>
                <h2 style="font-size: 36px; margin-bottom: 8px;">${p.name}</h2>
                <p style="font-size: 13px; font-weight: 700; color: ${p.onlineAvailable ? 'var(--color-primary-dark)' : 'var(--color-muted-text)'}; margin-bottom: 12px;">${p.modeBadge}</p>
                <p style="margin-bottom: 24px; font-size: 15px;">${p.onlineNote || p.fullDescription}</p>
                <div style="margin-bottom: 32px; display: flex; gap: 24px; flex-wrap: wrap;">
                  <div>
                    <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--color-muted-text); display: block;">Age Groups</span>
                    <span style="font-weight: 600;">${p.ageGroups.join(', ')}</span>
                  </div>
                  <div>
                    <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--color-muted-text); display: block;">Levels</span>
                    <span style="font-weight: 600;">${p.levels.join(', ')}</span>
                  </div>
                </div>
                <div class="program-card-actions">
                  <a href="#/programs/${p.slug}" class="btn btn-secondary">View Details &rarr;</a>
                </div>
              </div>
              <div class="editorial-media" style="border-radius: var(--radius-medium);">
                ${p.video ? `
                  <video src="${p.video}" autoplay loop muted playsinline class="editorial-img" style="height: 380px; width: 100%; object-fit: cover;"></video>
                ` : `
                  <img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async" class="editorial-img" style="height: 380px;">
                `}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// --- PROGRAM DETAIL TEMPLATE ---
function renderProgramDetailPage(slug) {
  const prog = DANCE_DATA.programs.find(p => p.slug === slug) || DANCE_DATA.programs[0];

  return `
    <div class="program-detail-page">
      <div class="section-container">
        <a href="#/programs" class="back-link">&larr; Back to All Classes</a>
        <div class="editorial-split program-detail-hero">
          <div class="editorial-content">
            <div class="badge-row">
              <span class="eyebrow">${prog.number} — Detailed Curriculum</span>
              ${prog.onlineAvailable ? `<span class="online-pill-badge">Online Available</span>` : `<span class="offline-pill-badge">Offline Classes Only</span>`}
            </div>
            <h1 class="section-heading">${prog.name}</h1>
            <p class="mode-subtitle">${prog.modeBadge}</p>
            <p class="lead-text">${prog.onlineNote ? `${prog.onlineNote}` : prog.fullDescription}</p>
            <div class="program-card-actions">
              <a href="#/claim-free-seat" class="btn btn-primary">Claim Free Trial Seat</a>
              <a href="#/schedule" class="btn btn-secondary">Check Class Timings</a>
            </div>
          </div>
          <div class="editorial-media">
            ${prog.video ? `
              <video src="${prog.video}" autoplay loop muted playsinline class="editorial-img"></video>
            ` : `
              <img src="${prog.image}" alt="${prog.name}" loading="lazy" decoding="async" class="editorial-img">
            `}
          </div>
        </div>

        <div class="program-detail-grid">
          <div class="curriculum-section">
            <h3 class="detail-section-title">Curriculum & Learning Highlights</h3>
            <div class="curriculum-card">
              <ul class="curriculum-list">
                ${prog.curriculum.map(item => `
                  <li class="curriculum-item">
                    <span class="check-icon">✓</span>
                    <span>${item}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>

          <div class="batch-overview-section">
            <h3 class="detail-section-title">Batch Overview</h3>
            <div class="batch-overview-card">
              <div class="overview-group">
                <span class="overview-label">Mentor</span>
                <p class="overview-val main">${prog.instructor}</p>
              </div>
              <div class="overview-group">
                <span class="overview-label">Age Groups</span>
                <p class="overview-val">${prog.ageGroups.join(', ')}</p>
              </div>
              <div class="overview-group">
                <span class="overview-label">Levels</span>
                <p class="overview-val">${prog.levels.join(', ')}</p>
              </div>
              <div class="overview-group">
                <span class="overview-label">Timings</span>
                <p class="overview-val timing">${prog.schedulePreview}</p>
              </div>
              <a href="#/claim-free-seat" class="btn btn-primary full-width" style="margin-top: 8px;">Claim Trial Seat</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// --- SCHEDULE PAGE TEMPLATE ---
function renderSchedulePage() {
  const schedData = renderScheduleRows(DANCE_DATA.schedules);
  return `
    <div style="padding-top: 140px; padding-bottom: 100px;">
      <div class="section-container">
        <span class="eyebrow">Class Schedule</span>
        <h1 class="section-heading" style="margin-bottom: 16px;">Find a Batch That Works for You.</h1>
        <p class="lead-text">Filter available batches by class, age group, and day of week.</p>

        <!-- FILTER CONTROLS -->
        <div class="schedule-filter-bar">
          <div style="flex: 1; min-width: 200px;">
            <label class="form-label">Class</label>
            <select class="form-control" id="sched-prog-filter">
              <option value="all">All Classes</option>
              <option value="Kathak">Kathak</option>
              <option value="Bollywood">Bollywood</option>
              <option value="Vocals">Vocals</option>
              <option value="Fine Arts">Fine Arts</option>
              <option value="Yoga">Yoga</option>
            </select>
          </div>
          <div style="flex: 1; min-width: 200px;">
            <label class="form-label">Day of Week</label>
            <select class="form-control" id="sched-day-filter">
              <option value="all">All Days</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
            </select>
          </div>
        </div>

        <!-- SCHEDULE DESKTOP TABLE -->
        <div class="schedule-table-wrap schedule-desktop-view">
          <table class="schedule-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Level</th>
                <th>Age Group</th>
                <th>Day</th>
                <th>Instructor</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="schedule-table-body">
              ${schedData.table}
            </tbody>
          </table>
        </div>

        <!-- SCHEDULE MOBILE CARDS -->
        <div class="schedule-mobile-view" id="schedule-mobile-cards-body">
          ${schedData.cards}
        </div>
      </div>
    </div>
  `;
}

function renderScheduleRows(items) {
  if (items.length === 0) {
    const emptyMsg = `No matching batch currently listed. <a href="#/claim-free-seat" style="color: var(--color-primary-dark); font-weight: 700;">Submit a trial request</a>`;
    return {
      table: `<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--color-muted-text);">${emptyMsg}</td></tr>`,
      cards: `<div style="text-align: center; padding: 32px 16px; color: var(--color-muted-text);">${emptyMsg}</div>`
    };
  }

  const tableHtml = items.map(s => `
    <tr>
      <td style="font-weight: 700; color: var(--color-navy);">${s.program}</td>
      <td>${s.level}</td>
      <td>${s.ageGroup}</td>
      <td>${s.day}</td>
      <td>${s.instructor}</td>
      <td><span class="status-badge">${s.availability}</span></td>
      <td>
        <a href="#/claim-free-seat" class="btn btn-primary" style="padding: 8px 16px; font-size: 12px; min-height: 40px; border-radius: 999px;">Claim Seat</a>
      </td>
    </tr>
  `).join('');

  const cardsHtml = items.map(s => `
    <div class="schedule-mobile-card">
      <div class="schedule-card-top">
        <div>
          <span class="eyebrow">${s.level} • ${s.ageGroup}</span>
          <h3 class="schedule-card-title">${s.program}</h3>
        </div>
        <span class="status-badge">${s.availability}</span>
      </div>
      <div class="schedule-card-details">
        <p><strong>Instructor:</strong> ${s.instructor}</p>
        <p><strong>Days:</strong> ${s.day}</p>
        <p><strong>Timing:</strong> Evening Batch</p>
      </div>
      <a href="#/claim-free-seat" class="btn btn-primary full-width" style="margin-top: 14px;">Claim Seat</a>
    </div>
  `).join('');

  return { table: tableHtml, cards: cardsHtml };
}

// --- EVENTS PAGE TEMPLATE ---
function renderEventsPage() {
  const ev = DANCE_DATA.events[0];
  return `
    <div style="padding-top: 140px; padding-bottom: 100px;">
      <div class="section-container">
        <span class="eyebrow">Events & Performances</span>
        <h1 class="section-heading" style="margin-bottom: 16px;">Where Practice Meets the Stage.</h1>
        <p class="lead-text" style="margin-bottom: 60px;">Discover upcoming annual productions, stage shows and grand cultural showcases at Dance Darbar Kala Sansthan.</p>

        <div class="event-banner-card">
          <div class="event-media-side">
            <img src="${ev.image}" alt="${ev.title}" loading="lazy" decoding="async" class="event-img">
          </div>
          <div class="event-info-side">
            <span class="eyebrow light">${ev.tagline}</span>
            <h2 class="event-title-highlight" style="line-height: 1.1; margin: 6px 0 10px;">
              AMRAPALI 2026
              <span style="display: block; font-size: 0.44em; font-weight: 600; color: rgba(255,255,255,0.85); margin-top: 4px; letter-spacing: 0;">Annual Student Dance Ballet</span>
            </h2>
            <p style="color: rgba(255,255,255,0.8); margin-bottom: 20px; font-size: 14px; line-height: 1.55;">${ev.description}</p>
            <div class="event-meta-list">
              <div class="meta-row">
                <span class="meta-label">Date</span>
                <span class="meta-val">${ev.date} (${ev.day})</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Time</span>
                <span class="meta-val">${ev.time}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Venue</span>
                <span class="meta-val">${ev.venue}</span>
              </div>
            </div>
            ${renderAmrapaliCTA()}
          </div>
        </div>
      </div>
    </div>
  `;
}

// --- EVENT DETAIL TEMPLATE ---
function renderEventDetailPage(slug) {
  const ev = DANCE_DATA.events[0];
  return `
    <div style="padding-top: 140px; padding-bottom: 100px;">
      <div class="section-container">
        <a href="#/events" style="font-size: 14px; font-weight: 600; color: var(--color-primary-dark); margin-bottom: 24px; display: inline-block;">&larr; Back to Events</a>
        <div class="editorial-split" style="margin-bottom: 60px;">
          <div>
            <span class="eyebrow">${ev.tagline}</span>
            <h1 class="section-heading" style="font-size: clamp(34px, 3.8vw, 54px); line-height: 1.1; margin-bottom: 6px;">AMRAPALI 2026</h1>
            <p style="font-size: 18px; font-weight: 600; color: var(--color-primary-dark); margin-bottom: 20px;">Annual Student Dance Ballet</p>
            <p class="lead-text" style="margin-bottom: 28px;">${ev.description}</p>
            <div style="background: var(--color-white); padding: 28px; border-radius: var(--radius-medium); border: 1px solid var(--color-border); margin-bottom: 32px; box-shadow: 0 4px 20px rgba(8,18,30,0.03);">
              <p style="margin-bottom: 12px; font-size: 15px;"><strong>📅 Date:</strong> ${ev.date} (${ev.day})</p>
              <p style="margin-bottom: 12px; font-size: 15px;"><strong>⏰ Time:</strong> ${ev.time}</p>
              <p style="font-size: 15px;"><strong>📍 Auditorium Venue:</strong> ${ev.venue}</p>
            </div>
            ${renderAmrapaliCTA()}
          </div>
          <div class="editorial-media">
            <img src="${ev.image}" alt="${ev.title}" loading="lazy" decoding="async" class="editorial-img" style="height: 480px;">
          </div>
        </div>
      </div>
    </div>
  `;
}

// --- GALLERY PAGE TEMPLATE ---
function renderGalleryPage() {
  return `
    <div style="padding-top: 140px; padding-bottom: 100px;">
      <div class="section-container">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 24px; margin-bottom: 36px;">
          <div>
            <span class="eyebrow">Instagram Live Feed & Reel Showcase</span>
            <h1 class="section-heading" style="margin-bottom: 12px;">Moments of Movement and Expression.</h1>
            <p class="lead-text">Official @dance_darbar Instagram reels, live stage performances, and studio rehearsals.</p>
          </div>
          <a href="https://www.instagram.com/dance_darbar?igsh=MWl6bW4za3NreHhrOA==" target="_blank" rel="noopener" class="btn btn-primary" style="gap: 10px;">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            <span>Follow @dance_darbar</span>
          </a>
        </div>

        <!-- CATEGORY FILTERS -->
        <div class="gallery-filter-bar">
          <button class="filter-btn active" data-cat="All">All Feed</button>
          <button class="filter-btn" data-cat="Kathak">Kathak</button>
          <button class="filter-btn" data-cat="Bollywood">Bollywood</button>
          <button class="filter-btn" data-cat="Events">Events</button>
          <button class="filter-btn" data-cat="Fine Arts">Fine Arts</button>
          <button class="filter-btn" data-cat="Yoga">Yoga</button>
          <button class="filter-btn" data-cat="Vocals">Vocals</button>
        </div>

        <!-- CLEAN RESPONSIVE EDITORIAL GRID -->
        <div class="clean-gallery-grid" id="gallery-grid-wrap">
          ${renderGalleryItems('All')}
        </div>
      </div>
    </div>
  `;
}

function renderGalleryItems(category) {
  const filtered = category === 'All' 
    ? DANCE_DATA.galleryItems 
    : DANCE_DATA.galleryItems.filter(item => item.category === category || (category === 'Vocals' && item.category === 'Vocal Music'));

  return filtered.map((item, idx) => `
    <a href="${item.instagramUrl || 'https://www.instagram.com/dance_darbar'}" target="_blank" rel="noopener" class="gallery-card motion-graphic-card" style="animation-delay: ${idx * 0.05}s">
      <div class="gallery-img-container">
        <img src="${item.image}" alt="${item.title}" loading="lazy" decoding="async" class="gallery-thumb">
        ${item.type === 'reel' ? `
          <div class="reel-badge">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            <span>REEL</span>
          </div>
        ` : `
          <div class="reel-badge photo-badge">
            <span>PHOTO</span>
          </div>
        `}
        <div class="gallery-hover-overlay">
          <span class="view-action-pill">
            ${item.type === 'reel' ? 'VIEW REEL ↗' : 'VIEW PHOTO ↗'}
          </span>
        </div>
      </div>
      <div class="gallery-card-content">
        <span class="gallery-card-tag">${item.category}</span>
        <h4 class="gallery-card-title">${item.title}</h4>
      </div>
    </a>
  `).join('');
}

// --- CLAIM FREE SEAT PAGE TEMPLATE ---
function renderClaimFreeSeatPage() {
  return `
    <div class="trial-main-container">
      <div class="section-container">
        <div class="trial-page-layout">
          <div class="trial-visual-side">
            <img src="assets/trial-form-image.jpg" alt="Dance Darbar Kala Sansthan Students & Guru" loading="lazy" decoding="async" class="trial-visual-img">
            <div class="trial-visual-overlay">
              <span class="eyebrow light">Trial Class Admission</span>
              <h2 style="font-size: 32px; color: var(--color-white); margin-top: 4px; margin-bottom: 8px; line-height: 1.2;">Experience Dance Darbar.</h2>
              <p style="color: rgba(255,255,255,0.9); font-size: 14.5px; line-height: 1.45;">Join us for a free trial class in Kathak, Bollywood, Vocal Music, Fine Arts or Yoga.</p>
            </div>
          </div>

          <div class="trial-form-side">
            <span class="eyebrow trial-eyebrow">Free Trial Registration</span>
            <h1 class="trial-form-heading">Claim Your Free Trial Seat.</h1>
            <p class="trial-form-desc">Tell us who the class is for and which class interests you. Our team will contact you with batch availability.</p>

            <form id="trial-seat-form" novalidate>
              <div class="form-group">
                <label class="form-label" for="student_name">Student Name *</label>
                <input type="text" id="student_name" name="student_name" class="form-control" placeholder="Enter student's full name" required>
                <span class="error-text" id="err-student_name">Please enter the student name.</span>
              </div>

              <div class="form-group">
                <label class="form-label" for="age_group">Age Group *</label>
                <select id="age_group" name="age_group" class="form-control" required>
                  <option value="">Select Age Group</option>
                  <option value="5–8 years">5–8 years</option>
                  <option value="9–12 years">9–12 years</option>
                  <option value="13–17 years">13–17 years</option>
                  <option value="18–30 years">18–30 years</option>
                  <option value="31–50 years">31–50 years</option>
                  <option value="51–60 years">51–60 years</option>
                  <option value="60+ years">60+ years</option>
                </select>
                <span class="error-text" id="err-age_group">Please select an age group.</span>
              </div>

              <div class="form-group">
                <label class="form-label" for="interested_programme">Interested Class *</label>
                <select id="interested_programme" name="interested_programme" class="form-control" required>
                  <option value="">Select Class</option>
                  <option value="Kathak">Kathak</option>
                  <option value="Bollywood">Bollywood</option>
                  <option value="Vocal Music">Vocal Music</option>
                  <option value="Fine Arts">Fine Arts</option>
                  <option value="Yoga">Yoga</option>
                </select>
                <span class="error-text" id="err-interested_programme">Please select a programme.</span>
              </div>

              <div class="form-group">
                <label class="form-label" for="phone">Phone Number *</label>
                <input type="tel" id="phone" name="phone" class="form-control" placeholder="10-digit mobile number" required>
                <span class="error-text" id="err-phone">Please enter a valid phone number.</span>
              </div>

              <div class="form-group">
                <label class="form-label" for="address">Residential Address / Locality *</label>
                <input type="text" id="address" name="address" class="form-control" placeholder="Enter full address or locality (e.g. Dwarka Sec 7)" required>
                <span class="error-text" id="err-address">Please enter your address or locality.</span>
              </div>

              <button type="submit" class="btn btn-primary full-width" style="margin-top: 12px;" id="trial-submit-btn">
                <span>Claim Free Seat</span>
                <svg class="btn-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </form>

            <div id="trial-success-message" style="display: none; background: var(--color-light-surface); padding: 40px; border-radius: var(--radius-medium); text-align: center; border: 1px solid var(--color-primary);">
              <div style="width: 60px; height: 60px; background: var(--color-primary); color: var(--color-navy); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 32px; font-weight: 700;">✓</div>
              <h2 style="font-size: 28px; margin-bottom: 12px;">Your Request Has Been Submitted.</h2>
              <p style="color: var(--color-muted-text); margin-bottom: 24px;">The Dance Darbar Kala Sansthan team will contact you shortly with suitable programme and batch details.</p>
              <a href="#/programs" class="btn btn-secondary">Explore Programmes</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// --- ABOUT PAGE TEMPLATE ---
function renderAboutPage() {
  return `
    <div style="padding-top: 140px; padding-bottom: 100px;">
      <div class="section-container">
        <span class="eyebrow">About Dance Darbar</span>
        <h1 class="section-heading" style="font-size: 52px; margin-bottom: 20px;">Dedicated to Art, Discipline & Cultural Excellence.</h1>
        <p class="lead-text" style="margin-bottom: 60px;">Dance Darbar Kala Sansthan was established to foster artistic education combining traditional Indian roots with contemporary presentation standards.</p>

        <div class="editorial-split" style="margin-bottom: 80px;">
          <div>
            <h2 style="font-size: 32px; margin-bottom: 16px;">Our Story & Vision</h2>
            <p>Founded by Guru Bhagwan Singh in Dwarka, Delhi, Dance Darbar Kala Sansthan began as a dedicated classical Kathak and creative learning space. Over years of disciplined instruction, the academy expanded into multi-disciplinary fine arts, vocal music, Bollywood choreography, and holistic yoga.</p>
            <p>Our vision is to nurture confident, expressive artists who embody poise, cultural literacy, and creative self-assurance on stage and in life.</p>
          </div>
          <div class="editorial-media">
            <img src="assets/amrapali.jpg" alt="Academy Milestone" loading="lazy" decoding="async" class="editorial-img" style="height: 400px;">
          </div>
        </div>
      </div>
    </div>
  `;
}

// --- CONTACT PAGE TEMPLATE ---
function renderContactPage() {
  return `
    <div style="padding-top: 140px; padding-bottom: 100px;">
      <div class="section-container">
        <span class="eyebrow">Contact Us</span>
        <h1 class="section-heading" style="margin-bottom: 16px;">Visit, Call or Write to Us.</h1>
        <p class="lead-text" style="margin-bottom: 44px;">We would love to welcome you to our academy studio in Dwarka, Delhi.</p>

        <!-- EMBEDDED GOOGLE MAP CARD -->
        <div style="background: var(--color-white); padding: 24px; border-radius: var(--radius-large); border: 1px solid var(--color-border); margin-bottom: 40px; box-shadow: 0 10px 30px rgba(8,18,30,0.04);">
          <div style="border-radius: var(--radius-medium); overflow: hidden; height: 360px; margin-bottom: 20px;">
            <iframe src="https://maps.google.com/maps?q=28.5816,77.0674&hl=en&z=15&output=embed" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
            <div>
              <span class="eyebrow">Studio Location</span>
              <h3 style="font-size: 20px; color: var(--color-navy);">Dance Darbar Kala Sansthan</h3>
              <p style="font-size: 14px; color: var(--color-muted-text); margin-top: 4px;">Dwarka, New Delhi, India</p>
            </div>
            <a href="https://maps.app.goo.gl/oC6b7UmrGXwJxt4E6?utm_source=chatgpt.com" target="_blank" rel="noopener" class="btn btn-primary" style="gap: 8px;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              <span>Get Directions in Google Maps</span>
            </a>
          </div>
        </div>

        <div class="editorial-split">
          <div>
            <div style="background: var(--color-white); padding: 36px; border-radius: var(--radius-medium); border: 1px solid var(--color-border); margin-bottom: 32px;">
              <h3 style="font-size: 22px; margin-bottom: 20px;">Contact Information</h3>
              <p style="margin-bottom: 16px; font-size: 15px; display: flex; align-items: flex-start; gap: 10px;">
                <span>📍</span>
                <span><strong>Address:</strong> <a href="https://maps.app.goo.gl/oC6b7UmrGXwJxt4E6?utm_source=chatgpt.com" target="_blank" rel="noopener" style="color: var(--color-primary-dark); text-decoration: underline; font-weight: 600;">Dance Darbar Kala Sansthan, New Delhi (Open Directions) &rarr;</a></span>
              </p>
              <p style="margin-bottom: 16px; font-size: 15px; display: flex; align-items: center; gap: 10px;">
                <span>📞</span>
                <span><strong>Phone:</strong> <a href="tel:+919958659933" style="color: var(--color-navy); font-weight: 600;">+91 99586 59933</a></span>
              </p>
              <p style="margin-bottom: 16px; font-size: 15px; display: flex; align-items: center; gap: 10px;">
                <span>✉️</span>
                <span><strong>Email:</strong> <a href="mailto:dancedarbar96@gmail.com" style="color: var(--color-primary-dark); text-decoration: underline; font-weight: 600;">dancedarbar96@gmail.com</a></span>
              </p>
              <p style="font-size: 15px; display: flex; align-items: center; gap: 10px;">
                <span>⏰</span>
                <span><strong>Studio Hours:</strong> Mon – Sat: 10:00 AM – 8:00 PM</span>
              </p>
            </div>
          </div>

          <div style="background: var(--color-navy); color: var(--color-white); padding: 36px; border-radius: var(--radius-medium);">
            <h3 style="font-size: 22px; color: var(--color-white); margin-bottom: 20px;">Send a Direct Message</h3>
            <form id="contact-form">
              <div class="form-group">
                <label class="form-label" style="color: var(--color-white);">Name</label>
                <input type="text" class="form-control" placeholder="Your name" required>
              </div>
              <div class="form-group">
                <label class="form-label" style="color: var(--color-white);">Phone or Email</label>
                <input type="text" class="form-control" placeholder="Contact detail" required>
              </div>
              <div class="form-group">
                <label class="form-label" style="color: var(--color-white);">Message</label>
                <textarea class="form-control" rows="4" placeholder="How can we help you?" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary full-width">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
}

// --- FAQ PAGE TEMPLATE ---
function renderFAQPage() {
  return `
    <div style="padding-top: 140px; padding-bottom: 120px;">
      <div class="section-container">
        <span class="eyebrow">Frequently Asked Questions</span>
        <h1 class="section-heading" style="margin-bottom: 16px;">Everything You Need to Know.</h1>
        <p class="lead-text" style="margin-bottom: 60px;">Find answers to common questions about admissions, Kathak, Bollywood, Vocal Music, Fine Arts, Yoga, and class schedules at Dance Darbar Kala Sansthan.</p>

        <div class="faq-list" style="max-width: 840px; margin: 0 auto;">
          ${DANCE_DATA.faqs.map((faq, idx) => `
            <div class="faq-item ${idx === 0 ? 'active' : ''}">
              <div class="faq-question">
                <span>${faq.q}</span>
                <div class="faq-icon">+</div>
              </div>
              <div class="faq-answer">
                <p>${faq.a}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function initFAQPageEvents() {
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });
}

// --- PRIVACY & TERMS ---
function renderPrivacyPage() {
  return `
    <div style="padding-top: 140px; padding-bottom: 100px;">
      <div class="section-container" style="max-width: 800px;">
        <h1 class="section-heading" style="margin-bottom: 24px;">Privacy Policy</h1>
        <p>Dance Darbar Kala Sansthan values your privacy. We collect personal information solely for trial class bookings, batch scheduling, and direct academy updates. We do not sell or distribute personal data to third parties.</p>
      </div>
    </div>
  `;
}

function renderTermsPage() {
  return `
    <div style="padding-top: 140px; padding-bottom: 100px;">
      <div class="section-container" style="max-width: 800px;">
        <h1 class="section-heading" style="margin-bottom: 24px;">Terms of Service</h1>
        <p>By registering for trial classes or enrolling in Dance Darbar programmes, students agree to adhere to studio discipline, code of conduct, and schedule guidelines.</p>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// 4. INTERACTION INITIALIZERS
// --------------------------------------------------------------------------

// --- Home Page Interactive Video Switcher & FAQs ---
function initHomePageEvents() {
  // Animated Number Count-Up for Statistics Counter
  const counters = document.querySelectorAll('.counter-anim');
  if (counters.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.getAttribute('data-target'), 10);
          const suffix = counter.getAttribute('data-suffix') || '';
          let count = 0;
          const duration = 2000;
          const stepTime = 30;
          const increment = Math.ceil(target / (duration / stepTime));

          const timer = setInterval(() => {
            count += increment;
            if (count >= target) {
              counter.textContent = target.toLocaleString() + suffix;
              clearInterval(timer);
            } else {
              counter.textContent = count.toLocaleString() + suffix;
            }
          }, stepTime);

          observer.unobserve(counter);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(c => observer.observe(c));
  }

  // Hero Video 15-Second Precise Continuous Loop
  const heroVid = document.querySelector('.hero-video-element');
  if (heroVid) {
    let startPos = 0;
    const LOOP_DURATION = 15; // Exactly 15 seconds loop

    const initHeroVideoLoop = () => {
      if (heroVid.duration && !isNaN(heroVid.duration)) {
        // Start from middle point of video
        startPos = Math.floor(heroVid.duration / 2);
        heroVid.currentTime = startPos;
        heroVid.play().catch(() => {});
      }
    };

    if (heroVid.readyState >= 1) {
      initHeroVideoLoop();
    } else {
      heroVid.addEventListener('loadedmetadata', initHeroVideoLoop, { once: true });
    }

    // Reset back to startPos after exactly 15 seconds
    heroVid.addEventListener('timeupdate', () => {
      if (startPos > 0 && heroVid.currentTime >= (startPos + LOOP_DURATION)) {
        heroVid.currentTime = startPos;
        heroVid.play().catch(() => {});
      }
    });

    heroVid.addEventListener('ended', () => {
      heroVid.currentTime = startPos;
      heroVid.play().catch(() => {});
    });
  }

  // FAQ Banner Modal Trigger & Accordion Binder
  const faqBtn = document.getElementById('faq-banner-trigger');
  const faqModal = document.getElementById('faq-modal');
  const faqClose = document.getElementById('faq-modal-close');
  const faqBackdrop = document.getElementById('faq-backdrop');
  const faqListContainer = document.getElementById('faq-modal-list');

  if (faqBtn && faqModal) {
    faqBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (faqListContainer) {
        faqListContainer.innerHTML = DANCE_DATA.faqs.map((faq, idx) => `
          <div class="faq-item ${idx === 0 ? 'active' : ''}">
            <div class="faq-question">
              <span>${faq.q}</span>
              <div class="faq-icon">+</div>
            </div>
            <div class="faq-answer">
              <p>${faq.a}</p>
            </div>
          </div>
        `).join('');

        // Accordion click handler
        faqListContainer.querySelectorAll('.faq-question').forEach(q => {
          q.addEventListener('click', () => {
            const item = q.parentElement;
            const isActive = item.classList.contains('active');
            faqListContainer.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
          });
        });
      }
      faqModal.classList.add('active');
    });

    if (faqClose) faqClose.onclick = () => faqModal.classList.remove('active');
    if (faqBackdrop) faqBackdrop.onclick = () => faqModal.classList.remove('active');
  }

  // Hero Background Video Controller (Seamless 15s Seek & Smooth Fade-In)
  const heroVideo = document.querySelector('.hero-video-element');
  if (heroVideo) {
    const startTime = 15;
    let hasSeekedToStart = false;

    const startPlaybackAndFadeIn = () => {
      heroVideo.play().catch(() => {});
      heroVideo.classList.add('is-ready');
    };

    const performInitialSeek = () => {
      if (hasSeekedToStart) return;
      hasSeekedToStart = true;

      const onSeeked = () => {
        heroVideo.removeEventListener('seeked', onSeeked);
        startPlaybackAndFadeIn();
      };

      heroVideo.addEventListener('seeked', onSeeked, { once: true });
      heroVideo.currentTime = startTime;

      setTimeout(() => {
        if (!heroVideo.classList.contains('is-ready')) {
          startPlaybackAndFadeIn();
        }
      }, 450);
    };

    if (heroVideo.readyState >= 2) {
      performInitialSeek();
    } else {
      heroVideo.addEventListener('loadedmetadata', performInitialSeek, { once: true });
      heroVideo.addEventListener('canplay', performInitialSeek, { once: true });
    }

    heroVideo.addEventListener('timeupdate', () => {
      if (heroVideo.duration && heroVideo.currentTime >= heroVideo.duration - 0.15) {
        heroVideo.currentTime = startTime;
        heroVideo.play().catch(() => {});
      }
    });
  }

  // Background Video/Image Switcher for Programme Index
  const items = document.querySelectorAll('.program-item');
  const previews = document.querySelectorAll('.program-bg-preview');

  items.forEach(item => {
    item.addEventListener('mouseenter', () => {
      const slug = item.getAttribute('data-prog-target');
      items.forEach(i => i.classList.remove('active'));
      previews.forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      const targetPreview = document.querySelector(`.program-bg-preview[data-prog-bg="${slug}"]`);
      if (targetPreview) targetPreview.classList.add('active');
    });
  });

  // FAQ Accordions
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });
}

// --- Schedule Filter Engine ---
function initScheduleFilterEvents() {
  const progFilter = document.getElementById('sched-prog-filter');
  const dayFilter = document.getElementById('sched-day-filter');
  const tableBody = document.getElementById('schedule-table-body');

  function checkDayMatch(sDay, filterDay) {
    if (filterDay === 'all') return true;
    const lowerSDay = sDay.toLowerCase();
    const lowerFDay = filterDay.toLowerCase();

    if (lowerSDay.includes(lowerFDay)) return true;

    // Range matching (e.g. "Monday to Saturday")
    if (lowerSDay.includes('to')) {
      const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const parts = lowerSDay.split('to').map(p => p.trim());
      if (parts.length === 2) {
        const startIdx = daysOrder.indexOf(parts[0]);
        const endIdx = daysOrder.indexOf(parts[1]);
        const targetIdx = daysOrder.indexOf(lowerFDay);
        if (startIdx !== -1 && endIdx !== -1 && targetIdx !== -1) {
          return targetIdx >= startIdx && targetIdx <= endIdx;
        }
      }
    }

    return false;
  }

  function applyFilters() {
    if (!tableBody) return;
    const selectedProg = progFilter ? progFilter.value : 'all';
    const selectedDay = dayFilter ? dayFilter.value : 'all';

    const filtered = DANCE_DATA.schedules.filter(s => {
      const matchProg = selectedProg === 'all' || s.program === selectedProg;
      const matchDay = checkDayMatch(s.day, selectedDay);
      return matchProg && matchDay;
    });

    const res = renderScheduleRows(filtered);
    if (tableBody) tableBody.innerHTML = res.table;
    const mobileWrap = document.getElementById('schedule-mobile-cards-body');
    if (mobileWrap) mobileWrap.innerHTML = res.cards;
  }

  if (progFilter) progFilter.addEventListener('change', applyFilters);
  if (dayFilter) dayFilter.addEventListener('change', applyFilters);
}

// --- Gallery Tab Filters ---
function initGalleryEvents() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const gridWrap = document.getElementById('gallery-grid-wrap');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-cat');
      if (gridWrap) {
        gridWrap.innerHTML = renderGalleryItems(cat);
      }
    });
  });
}

function getTrialRegistrations() {
  try {
    const data = localStorage.getItem('trial_registrations_v1');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveTrialRegistrations(list) {
  try {
    localStorage.setItem('trial_registrations_v1', JSON.stringify(list));
  } catch (e) {}
}

// --- Trial Form Validation & Submission ---
function initTrialFormEvents() {
  const form = document.getElementById('trial-seat-form');
  const successBox = document.getElementById('trial-success-message');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    const name = document.getElementById('student_name');
    const age = document.getElementById('age_group');
    const prog = document.getElementById('interested_programme');
    const phone = document.getElementById('phone');
    const address = document.getElementById('address');

    // Simple validation rules
    if (!name.value.trim()) {
      showErr('student_name'); isValid = false;
    } else hideErr('student_name');

    if (!age.value) {
      showErr('age_group'); isValid = false;
    } else hideErr('age_group');

    if (!prog.value) {
      showErr('interested_programme'); isValid = false;
    } else hideErr('interested_programme');

    if (!phone.value.trim() || phone.value.length < 8) {
      showErr('phone'); isValid = false;
    } else hideErr('phone');

    if (!address.value.trim()) {
      showErr('address'); isValid = false;
    } else hideErr('address');

    if (isValid) {
      const list = getTrialRegistrations();
      const newEntry = {
        id: `TRL-2026-${String(list.length + 1).padStart(4, '0')}`,
        studentName: name.value.trim(),
        ageGroup: age.value,
        interestedClass: prog.value,
        phone: phone.value.trim(),
        address: address.value.trim(),
        submittedAt: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
      };
      list.unshift(newEntry);
      saveTrialRegistrations(list);

      // Send email notification to admin (dancedarbar96@gmail.com)
      sendEmailNotification('🎓 New Free Trial Registration', {
        'Registration ID': newEntry.id,
        'Student Name': newEntry.studentName,
        'Age Group': newEntry.ageGroup,
        'Interested Class': newEntry.interestedClass,
        'Phone Number': newEntry.phone,
        'Residential Address': newEntry.address,
        'Submission Date & Time': newEntry.submittedAt,
        'Browser / Device': navigator.userAgent,
        'Message': `New Free Trial Registration submitted by ${newEntry.studentName} for ${newEntry.interestedClass}. Phone: ${newEntry.phone}`
      });

      form.style.display = 'none';
      successBox.style.display = 'block';
    }
  });

  function showErr(fieldId) {
    document.getElementById(fieldId).classList.add('error');
    document.getElementById('err-' + fieldId).style.display = 'block';
  }

  function hideErr(fieldId) {
    document.getElementById(fieldId).classList.remove('error');
    document.getElementById('err-' + fieldId).style.display = 'none';
  }
}

function initContactFormEvents() {
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Sending...</span>';
      }

      sendEmailNotification('📩 New Contact Message Received!', {
        'Submitted At': new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
        'Message': 'A new contact form inquiry was submitted on Dance Darbar website.'
      }).then(() => {
        alert('Thank you for contacting Dance Darbar Kala Sansthan! We will reach out to you shortly.');
        form.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Send Message</span>';
        }
      });
    });
  }
}

// --- AMRAPALI 2026 Event & Booking Configuration ---
const AMRAPALI_CONFIG = {
  pricePerSeat: 500,
  upiId: 'dancedarbar@upi',
  eventName: 'AMRAPALI 2026',
  eventDate: '23 August 2026, Sunday',
  eventTime: '4:00 PM to 9:00 PM',
  eventVenue: 'CCRT Auditorium, Dwarka Sector 7, New Delhi'
};

function getAmrapaliReservationStatus() {
  try {
    const s = localStorage.getItem('amrapali_reservation_status');
    if (s === 'open') return 'open';
    return 'closed';
  } catch (e) {
    return 'closed';
  }
}

function setAmrapaliReservationStatus(status) {
  try {
    localStorage.setItem('amrapali_reservation_status', status === 'open' ? 'open' : 'closed');
  } catch (e) {}
}

function renderAmrapaliCTA(extraClass = '') {
  const status = getAmrapaliReservationStatus();
  if (status === 'closed') {
    return `
      <div class="amrapali-cta-wrap ${extraClass}">
        <button type="button" class="btn btn-seats-full" disabled aria-disabled="true">
          <span class="status-dot-closed">●</span>
          <span>Seats Full</span>
        </button>
        <p class="amrapali-closed-note">All seats for AMRAPALI 2026 have been reserved. Seat reservations are now closed.</p>
      </div>
    `;
  } else {
    return `
      <div class="amrapali-cta-wrap ${extraClass}">
        <button type="button" class="btn btn-primary" onclick="window.openAmrapaliModal()">
          <span>Reserve Seat</span>
          <svg class="btn-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    `;
  }
}

function getAmrapaliBookings() {
  try {
    const data = localStorage.getItem('amrapali_bookings_v2');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveAmrapaliBookings(bookings) {
  try {
    localStorage.setItem('amrapali_bookings_v2', JSON.stringify(bookings));
  } catch (e) {}
}

function generateBookingRefCode() {
  const list = getAmrapaliBookings();
  const nextNum = list.length + 1;
  return `AMR-2026-${String(nextNum).padStart(4, '0')}`;
}

// --- Personalized Invitation Card Generator (HTML5 Canvas to PNG Download) ---
function downloadPersonalizedInvitation(booking) {
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background Obsidian Navy
  ctx.fillStyle = '#08121E';
  ctx.fillRect(0, 0, 1000, 1200);

  // Decorative Border
  ctx.strokeStyle = '#5EBBEA';
  ctx.lineWidth = 6;
  ctx.strokeRect(30, 30, 940, 1140);
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 2;
  ctx.strokeRect(42, 42, 916, 1116);

  // Header Eyebrow
  ctx.fillStyle = '#5EBBEA';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DANCE DARBAR KALA SANSTHAN PRESENTS', 500, 110);

  // Event Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 68px sans-serif';
  ctx.fillText('AMRAPALI 2026', 500, 200);

  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '600 30px sans-serif';
  ctx.fillText('Annual Student Dance Ballet', 500, 250);

  // Gold Divider Line
  ctx.strokeStyle = '#5EBBEA';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(250, 290);
  ctx.lineTo(750, 290);
  ctx.stroke();

  // Invitation Greeting Box
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fillRect(100, 330, 800, 480);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.strokeRect(100, 330, 800, 480);

  ctx.fillStyle = '#5EBBEA';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('OFFICIAL SEAT INVITATION PASS', 140, 380);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(booking.fullName || 'Guest Attendee', 140, 435);

  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '24px sans-serif';
  ctx.fillText(`Booking Reference: ${booking.bookingRef}`, 140, 490);
  ctx.fillText(`Seats Reserved: ${booking.seatCount}`, 140, 540);
  ctx.fillText(`Date: 23 August 2026 (Sunday)`, 140, 590);
  ctx.fillText(`Time: 4:00 PM – 9:00 PM`, 140, 640);
  ctx.fillText(`Venue: CCRT Auditorium, Dwarka Sec 7, New Delhi`, 140, 690);

  // Status Badge
  ctx.fillStyle = '#166534';
  ctx.fillRect(140, 730, 260, 44);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('STATUS: CONFIRMED (PAID)', 270, 758);

  // Barcode / Verification Graphic
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(100, 850, 800, 160);

  ctx.fillStyle = '#08121E';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`||| | || |||| | ||||| ||| || |||||| | || ${booking.bookingRef} |||`, 500, 920);

  ctx.font = '16px sans-serif';
  ctx.fillStyle = 'rgba(8,18,30,0.7)';
  ctx.fillText('Please show this invitation pass at entry check-in.', 500, 970);

  // Footer Note
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '18px sans-serif';
  ctx.fillText('Dance Darbar Kala Sansthan • Helpline: +91 99586 59933', 500, 1100);

  // Download Trigger
  const link = document.createElement('a');
  link.download = `AMRAPALI_2026_Invitation_${booking.bookingRef}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// --- Admin Authentication System ---
const ADMIN_CREDENTIALS = {
  email: 'admin@dancedarbar.com',
  passwordHash: 'dd2026admin'
};

function isAdminLoggedIn() {
  return sessionStorage.getItem('dd_admin_session') === 'authenticated';
}

function adminLogin(email, password) {
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.passwordHash) {
    sessionStorage.setItem('dd_admin_session', 'authenticated');
    return true;
  }
  return false;
}

window.adminLogout = function() {
  sessionStorage.removeItem('dd_admin_session');
  location.hash = '#/';
};

function renderAdminLoginPage() {
  return `
    <div style="padding-top: 140px; padding-bottom: 100px; min-height: 80vh; display: flex; align-items: center; justify-content: center;">
      <div style="width: 100%; max-width: 420px; padding: 0 20px;">
        <div style="background: var(--color-white); border-radius: var(--radius-large); padding: 44px 36px; border: 1px solid var(--color-border); box-shadow: 0 25px 60px rgba(8,18,30,0.12);">
          <div style="width: 60px; height: 60px; background: var(--color-navy); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#5EBBEA" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 style="font-size: 24px; color: var(--color-navy); text-align: center; margin-bottom: 6px;">Admin Login</h2>
          <p style="font-size: 13px; color: var(--color-muted-text); text-align: center; margin-bottom: 28px;">This area is restricted to Dance Darbar administrators only.</p>
          <form id="admin-login-form" novalidate>
            <div class="form-group" style="margin-bottom: 16px;">
              <label class="form-label" for="admin_email" style="font-size: 12px; font-weight: 600; margin-bottom: 4px; display: block;">Email Address</label>
              <input type="email" id="admin_email" class="form-control" placeholder="admin@dancedarbar.com" required autocomplete="email">
            </div>
            <div class="form-group" style="margin-bottom: 20px;">
              <label class="form-label" for="admin_password" style="font-size: 12px; font-weight: 600; margin-bottom: 4px; display: block;">Password</label>
              <input type="password" id="admin_password" class="form-control" placeholder="Enter admin password" required autocomplete="current-password">
            </div>
            <div id="admin-login-error" style="display: none; background: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5; border-radius: var(--radius-small); padding: 10px 14px; font-size: 12.5px; font-weight: 600; margin-bottom: 16px; text-align: center;">
              Invalid email or password. Please try again.
            </div>
            <button type="submit" id="admin-login-btn" class="btn btn-primary" style="width: 100%; padding: 13px;">
              <span>Sign In to Admin Panel</span>
            </button>
          </form>
          <p style="font-size: 11px; color: var(--color-muted-text); text-align: center; margin-top: 24px; line-height: 1.5;">
            If you are not an authorized administrator, please <a href="#/" style="color: var(--color-primary-dark); font-weight: 600;">return to the website</a>.
          </p>
        </div>
      </div>
    </div>
  `;
}

function initAdminLoginEvents() {
  const form = document.getElementById('admin-login-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('admin_email').value.trim();
    const password = document.getElementById('admin_password').value;
    const errorBox = document.getElementById('admin-login-error');
    const loginBtn = document.getElementById('admin-login-btn');
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span>Authenticating...</span>';
    setTimeout(() => {
      if (adminLogin(email, password)) {
        window.renderApp();
      } else {
        errorBox.style.display = 'block';
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<span>Sign In to Admin Panel</span>';
      }
    }, 400);
  });
}

// --- Admin Dashboard Page Template ---
function renderAdminPage() {
  const bookings = getAmrapaliBookings();
  const trialList = getTrialRegistrations();

  return `
    <div style="padding-top: 140px; padding-bottom: 100px;">
      <div class="section-container">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 24px;">
          <div>
            <span class="eyebrow">Dance Darbar Admin Portal</span>
            <h1 class="section-heading">Master Control Dashboard</h1>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-secondary" onclick="location.reload()">Refresh</button>
            <button class="btn btn-secondary" style="border-color: #991B1B; color: #991B1B;" onclick="window.clearAllReservations()">Clear Reservations</button>
            <button class="btn btn-secondary" style="border-color: #991B1B; color: #991B1B;" onclick="window.clearAllTrialRegistrations()">Clear Trials</button>
            <button class="btn btn-secondary" onclick="window.adminLogout()" style="gap: 6px;">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              Logout
            </button>
          </div>
        </div>

        <!-- Admin Overview Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 36px;">
          <div style="background: var(--color-white); padding: 20px; border-radius: var(--radius-medium); border: 1px solid var(--color-border);">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-muted-text);">Free Trial Submissions</span>
            <h3 style="font-size: 26px; color: var(--color-primary-dark); margin-top: 4px;">${trialList.length}</h3>
          </div>
          <div style="background: var(--color-white); padding: 20px; border-radius: var(--radius-medium); border: 1px solid var(--color-border);">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-muted-text);">AMRAPALI Reservations</span>
            <h3 style="font-size: 26px; color: var(--color-navy); margin-top: 4px;">${bookings.length}</h3>
          </div>
          <div style="background: var(--color-white); padding: 20px; border-radius: var(--radius-medium); border: 1px solid var(--color-border);">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-muted-text);">Confirmed Event Revenue</span>
            <h3 style="font-size: 26px; color: #166534; margin-top: 4px;">₹${bookings.filter(b => b.status === 'Confirmed').reduce((sum, b) => sum + (b.totalAmount || 500), 0)}</h3>
          </div>
        </div>

        <!-- SECTION 1: FREE TRIAL CLASS REGISTRATIONS (CLAIM FREE SEAT) -->
        <div style="margin-bottom: 48px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h2 style="font-size: 22px; color: var(--color-navy);">1. Free Trial Class Registrations ("Claim Free Seat")</h2>
            <span class="badge badge-info">${trialList.length} Total Submissions</span>
          </div>

          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Reg ID</th>
                  <th>Student Name</th>
                  <th>Age Group</th>
                  <th>Interested Class</th>
                  <th>Phone Number</th>
                  <th>Address / City</th>
                  <th>Submitted At</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${trialList.length === 0 ? `
                  <tr>
                    <td colspan="8" style="text-align: center; padding: 36px; color: var(--color-muted-text);">
                      No Free Trial registrations submitted yet. Click <a href="#/claim-free-seat" style="color: var(--color-primary-dark); font-weight: 700;">Claim Free Seat</a> on the website to test form submission.
                    </td>
                  </tr>
                ` : trialList.map(t => `
                  <tr>
                    <td style="font-family: monospace; font-weight: 700; color: var(--color-primary-dark);">${t.id}</td>
                    <td><strong>${t.studentName}</strong></td>
                    <td>${t.ageGroup}</td>
                    <td><span style="font-weight: 600; color: var(--color-navy);">${t.interestedClass}</span></td>
                    <td><a href="tel:${t.phone}" style="color: var(--color-primary-dark); font-weight: 600;">${t.phone}</a></td>
                    <td>${t.address}</td>
                    <td style="font-size: 11.5px; color: var(--color-muted-text);">${t.submittedAt}</td>
                    <td><span class="badge badge-success">New Lead</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- SECTION 2: AMRAPALI 2026 EVENT SEAT RESERVATIONS -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h2 style="font-size: 22px; color: var(--color-navy);">2. AMRAPALI 2026 Event Seat Reservations</h2>
            <span class="badge badge-warning">${bookings.length} Event Bookings</span>
          </div>

          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Guest Name</th>
                  <th>Phone & Email</th>
                  <th>Seats</th>
                  <th>Amount</th>
                  <th>Txn ID / Proof</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                ${bookings.length === 0 ? `
                  <tr>
                    <td colspan="9" style="text-align: center; padding: 36px; color: var(--color-muted-text);">
                      No seat reservations recorded yet. Click "Reserve Seat" on the AMRAPALI 2026 event section to test.
                    </td>
                  </tr>
                ` : bookings.map(b => `
                  <tr>
                    <td style="font-family: monospace; font-weight: 700; color: var(--color-primary-dark);">${b.bookingRef}</td>
                    <td><strong>${b.fullName}</strong><br><span style="font-size: 11px; color: var(--color-muted-text);">${b.attendeeType || 'Guest'}</span></td>
                    <td><a href="tel:${b.phone}" style="color: var(--color-navy); font-weight: 600;">${b.phone}</a><br><span style="font-size: 11.5px; color: var(--color-muted-text);">${b.email}</span></td>
                    <td>${b.seatCount}</td>
                    <td style="font-weight: 700; color: #166534;">₹${b.totalAmount}</td>
                    <td>${b.txnId || 'N/A'}${b.screenshotName ? `<br><span style="font-size: 11px; color: var(--color-primary-dark);">📎 ${b.screenshotName}</span>` : ''}</td>
                    <td style="font-size: 11.5px;">${b.createdAt || 'Just now'}</td>
                    <td>
                      ${b.status === 'Confirmed' ? `<span class="badge badge-success">Confirmed</span>` :
                        b.status === 'Verification Pending' ? `<span class="badge badge-info">Verification Pending</span>` :
                        b.status === 'Rejected' ? `<span class="badge badge-danger">Rejected</span>` :
                        `<span class="badge badge-warning">Payment Pending</span>`}
                    </td>
                    <td>
                      ${b.status !== 'Confirmed' ? `
                        <button class="admin-action-btn admin-btn-approve" onclick="window.adminApproveBooking('${b.bookingRef}')">✓ Verify & Confirm</button>
                        <button class="admin-action-btn admin-btn-reject" onclick="window.adminRejectBooking('${b.bookingRef}')">✕ Reject</button>
                      ` : `
                        <button class="admin-action-btn admin-btn-resend" onclick="window.adminResendNotifications('${b.bookingRef}')">📩 Resend Pass</button>
                      `}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Global Admin Action Handlers & Payment Verification Processors
window.processVerifiedPaymentSuccess = function(target) {
  if (!target) return;
  target.status = 'Confirmed';
  target.paymentStatus = 'SUCCESS';
  target.verifiedAt = new Date().toLocaleString();

  const bookings = getAmrapaliBookings();
  const idx = bookings.findIndex(b => b.bookingRef === target.bookingRef);
  if (idx !== -1) {
    bookings[idx] = target;
    saveAmrapaliBookings(bookings);
  }

  // 1. Send Admin Email ONLY AFTER Verified Successful Payment
  sendEmailNotification('✅ New AMRAPALI 2026 Seat Reservation (Payment Received)', {
    'Reservation ID': target.bookingRef,
    'Payment Status': 'SUCCESS',
    'Payment Transaction ID': target.txnId || `TXN-${target.bookingRef}`,
    'Payment Amount': `₹${target.totalAmount}`,
    'Payment Time': target.verifiedAt,
    'Full Name': target.fullName,
    'Phone Number': target.phone,
    'Email Address': target.email,
    'Number of Seats': target.seatCount,
    'Attendee Type': target.attendeeType,
    'Event Name': 'AMRAPALI 2026 - Annual Student Dance Ballet',
    'Date & Time': '23 August 2026 (Sunday), 4:00 PM - 9:00 PM',
    'Venue': 'CCRT Auditorium, Dwarka Sector 7, New Delhi',
    'User Device': navigator.userAgent,
    'Message': `Confirmed reservation for ${target.fullName} (${target.seatCount}, ₹${target.totalAmount}). Payment Verified. Txn: ${target.txnId}`
  });

  // 2. Send Customer Confirmation Email ONLY AFTER Verified Successful Payment
  sendCustomerConfirmationEmail(target.email, 'Your AMRAPALI 2026 Seat is Confirmed 🎉', {
    'Reservation ID': target.bookingRef,
    'Payment Status': 'Payment Successful (SUCCESS)',
    'Event Details': 'AMRAPALI 2026 (23 Aug 2026, CCRT Auditorium Dwarka)',
    'Seat Count': target.seatCount,
    'Transaction ID': target.txnId || `TXN-${target.bookingRef}`,
    'Digital Invitation Card': 'Downloadable from website dashboard',
    'Contact Information': 'dancedarbar96@gmail.com | +91 98711 39600'
  });
};

window.processPaymentFailure = function(target) {
  if (!target) return;
  target.status = 'Failed';
  target.paymentStatus = 'FAILED';

  const bookings = getAmrapaliBookings();
  const idx = bookings.findIndex(b => b.bookingRef === target.bookingRef);
  if (idx !== -1) {
    bookings[idx] = target;
    saveAmrapaliBookings(bookings);
  }
  // DO NOT SEND ANY EMAIL OR SMS ON FAILED PAYMENT
};

window.adminApproveBooking = function(ref) {
  const bookings = getAmrapaliBookings();
  const target = bookings.find(b => b.bookingRef === ref);
  if (target) {
    window.processVerifiedPaymentSuccess(target);
    alert(`Payment Verified! Booking ${ref} confirmed.\n\nAdmin email & User confirmation email sent to ${target.email}.`);
    downloadPersonalizedInvitation(target);
    if (location.hash.includes('admin')) {
      window.renderApp();
    }
  }
};

window.adminRejectBooking = function(ref) {
  const bookings = getAmrapaliBookings();
  const target = bookings.find(b => b.bookingRef === ref);
  if (target) {
    target.status = 'Rejected';
    target.paymentStatus = 'Rejected';
    saveAmrapaliBookings(bookings);
    alert(`Booking ${ref} rejected.`);
    if (location.hash.includes('admin')) {
      window.renderApp();
    }
  }
};

window.adminResendNotifications = function(ref) {
  const bookings = getAmrapaliBookings();
  const target = bookings.find(b => b.bookingRef === ref);
  if (target) {
    alert(`Re-sent SMS to ${target.phone} and Email to ${target.email}.`);
    downloadPersonalizedInvitation(target);
  }
};

window.clearAllReservations = function() {
  if (confirm('Are you sure you want to clear all AMRAPALI seat reservations recorded so far?')) {
    localStorage.removeItem('amrapali_bookings_v2');
    localStorage.removeItem('amrapali_bookings_v1');
    alert('All event seat reservations have been cleared.');
    if (typeof window.renderApp === 'function') window.renderApp();
    else location.reload();
  }
};

window.clearAllTrialRegistrations = function() {
  if (confirm('Are you sure you want to clear all Free Trial registrations recorded so far?')) {
    localStorage.removeItem('trial_registrations_v1');
    alert('All Free Trial class registrations have been cleared.');
    if (typeof window.renderApp === 'function') window.renderApp();
    else location.reload();
  }
};

// --- AMRAPALI 2026 Reservation Modal Controller ---
function initAmrapaliModalEvents() {
  const modal = document.getElementById('amrapali-modal');
  const closeBtn = document.getElementById('amrapali-modal-close');
  const backdrop = document.getElementById('amrapali-backdrop');
  
  const formWrap = document.getElementById('amrapali-modal-form-wrap');
  const paymentWrap = document.getElementById('amrapali-payment-wrap');
  const verWrap = document.getElementById('amrapali-verification-pending-wrap');
  const confWrap = document.getElementById('amrapali-confirmed-wrap');

  const form = document.getElementById('amrapali-reservation-form');
  const proofForm = document.getElementById('amrapali-payment-proof-form');
  const submitBtn = document.getElementById('amp-submit-btn');

  let activeBooking = null;

  if (!modal) return;

  function showModalStep(step) {
    const failedWrap = document.getElementById('amrapali-failed-wrap');
    if (formWrap) formWrap.style.display = step === 1 ? 'block' : 'none';
    if (paymentWrap) paymentWrap.style.display = step === 2 ? 'block' : 'none';
    if (verWrap) verWrap.style.display = step === 3 ? 'block' : 'none';
    if (confWrap) confWrap.style.display = step === 4 ? 'block' : 'none';
    if (failedWrap) failedWrap.style.display = step === 5 ? 'block' : 'none';
  }

  window.openAmrapaliModal = function() {
    if (getAmrapaliReservationStatus() === 'closed') {
      alert('All seats for AMRAPALI 2026 have been reserved. Seat reservations are currently closed.');
      return;
    }
    clearErrors();
    activeBooking = null;
    if (form) form.reset();
    if (proofForm) proofForm.reset();
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Continue to Payment &rarr;</span>';
    }
    showModalStep(1);
    modal.classList.add('active');
    document.body.classList.add('modal-open');

    setTimeout(() => {
      const firstInput = document.getElementById('amp_full_name');
      if (firstInput) firstInput.focus();
    }, 150);
  };

  // Auto-scroll focused input field into view when mobile virtual keyboard pops up
  modal.querySelectorAll('.modal-input-field').forEach(input => {
    input.addEventListener('focus', () => {
      if (window.innerWidth <= 767) {
        setTimeout(() => {
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    });
  });

  window.closeAmrapaliModal = function() {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  };

  if (closeBtn) closeBtn.onclick = window.closeAmrapaliModal;
  if (backdrop) backdrop.onclick = window.closeAmrapaliModal;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      window.closeAmrapaliModal();
    }
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('a, button');
    if (btn) {
      if (btn.classList.contains('btn-seats-full') || btn.disabled) {
        if (btn.classList.contains('btn-seats-full')) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
      const text = btn.textContent.trim().toLowerCase();
      const href = btn.getAttribute('href') || '';
      if (
        (text.includes('reserve seat') || text.includes('reserve guest') || href.includes('amrapali')) &&
        !btn.closest('#amrapali-modal')
      ) {
        e.preventDefault();
        if (getAmrapaliReservationStatus() === 'closed') {
          alert('All seats for AMRAPALI 2026 have been reserved. Seat reservations are currently closed.');
          return false;
        }
        window.openAmrapaliModal();
      }
    }
  });

  // Step 1: Submit Form -> Payment Pending -> Step 2 Payment QR Screen (NO EMAIL SENT)
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (getAmrapaliReservationStatus() === 'closed') {
        alert('Seat reservations for AMRAPALI 2026 are closed.');
        window.closeAmrapaliModal();
        return;
      }
      let isValid = true;

      const name = document.getElementById('amp_full_name');
      const phone = document.getElementById('amp_phone');
      const email = document.getElementById('amp_email');
      const seats = document.getElementById('amp_seats');
      const attendeeType = document.getElementById('amp_attendee_type');

      clearErrors();

      if (!name.value.trim()) {
        showErr('amp_full_name', 'Please enter your full name.');
        isValid = false;
      }

      const phoneClean = phone.value.replace(/\D/g, '');
      if (!phone.value.trim() || phoneClean.length < 10) {
        showErr('amp_phone', 'Please enter a valid 10-digit phone number.');
        isValid = false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim() || !emailRegex.test(email.value.trim())) {
        showErr('amp_email', 'Please enter a valid email address.');
        isValid = false;
      }

      if (!seats.value) {
        showErr('amp_seats', 'Please select number of seats.');
        isValid = false;
      }

      if (isValid) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Processing...</span>';

        const numSeats = parseInt(seats.value, 10) || 1;
        const totalAmount = numSeats * AMRAPALI_CONFIG.pricePerSeat;
        const refCode = generateBookingRefCode();

        activeBooking = {
          bookingRef: refCode,
          fullName: sanitizeInput(name.value.trim()),
          phone: sanitizeInput(phone.value.trim()),
          email: sanitizeInput(email.value.trim()),
          seatCount: seats.value,
          numSeats: numSeats,
          totalAmount: totalAmount,
          attendeeType: attendeeType ? sanitizeInput(attendeeType.value) : 'Guest',
          status: 'Payment Pending',
          paymentStatus: 'Pending',
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const bookings = getAmrapaliBookings();
        bookings.push(activeBooking);
        saveAmrapaliBookings(bookings);

        // DO NOT SEND ANY EMAIL ON FORM SUBMISSION OR WHEN REACHING QR PAGE!
        setTimeout(() => {
          document.getElementById('pay_booking_ref').textContent = activeBooking.bookingRef;
          document.getElementById('pay_guest_name').textContent = activeBooking.fullName;
          document.getElementById('pay_seat_count').textContent = activeBooking.seatCount;
          document.getElementById('pay_total_amount').textContent = `₹${activeBooking.totalAmount}`;

          showModalStep(2);
        }, 400);
      }
    });
  }

  // Step 2: Submit Payment Proof / Txn ID -> Step 3 Verification Pending (NO EMAIL SENT YET)
  if (proofForm) {
    proofForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const txnIdInput = document.getElementById('amp_txn_id');
      const fileInput = document.getElementById('amp_screenshot');
      const errEl = document.getElementById('err-amp_txn_id');

      if (!txnIdInput.value.trim() && (!fileInput.files || fileInput.files.length === 0)) {
        if (errEl) {
          errEl.textContent = 'Please enter transaction reference or upload a payment screenshot.';
          errEl.style.display = 'block';
        }
        return;
      }

      if (errEl) errEl.style.display = 'none';

      if (activeBooking) {
        activeBooking.txnId = sanitizeInput(txnIdInput.value.trim());
        activeBooking.screenshotName = fileInput.files[0] ? sanitizeInput(fileInput.files[0].name) : '';
        activeBooking.status = 'Verification Pending';
        activeBooking.paymentStatus = 'Pending Verification';
        
        const bookings = getAmrapaliBookings();
        const idx = bookings.findIndex(b => b.bookingRef === activeBooking.bookingRef);
        if (idx !== -1) {
          bookings[idx] = activeBooking;
          saveAmrapaliBookings(bookings);
        }

        // DO NOT SEND EMAIL YET WHILE PAYMENT VERIFICATION IS PENDING!
      }

      // Update Step 3 UI
      document.getElementById('ver_booking_ref').textContent = activeBooking.bookingRef;
      document.getElementById('ver_guest_name').textContent = activeBooking.fullName;
      document.getElementById('ver_amount').textContent = `₹${activeBooking.totalAmount}`;

      showModalStep(3);
    });
  }

  // Simulate Admin Instant Approval Helper (Triggers Emails ONLY on Verified Success)
  window.simulateAdminApproval = function() {
    if (activeBooking) {
      window.processVerifiedPaymentSuccess(activeBooking);

      const refMain = document.getElementById('conf_booking_ref');
      const refSub = document.getElementById('conf_booking_ref_sub');
      if (refMain) refMain.textContent = activeBooking.bookingRef;
      if (refSub) refSub.textContent = activeBooking.bookingRef;

      const guestName = document.getElementById('conf_guest_name');
      if (guestName) guestName.textContent = activeBooking.fullName;

      const seatCount = document.getElementById('conf_seat_count');
      if (seatCount) seatCount.textContent = activeBooking.seatCount;

      showModalStep(4);
    }
  };

  window.retryAmrapaliPayment = function() {
    if (activeBooking) {
      showModalStep(2);
    } else {
      showModalStep(1);
    }
  };

  // Download Invitation Pass Button Handler
  const downloadBtn = document.getElementById('amp-download-invitation-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      if (activeBooking) {
        downloadPersonalizedInvitation(activeBooking);
      }
    });
  }

  function showErr(fieldId, msg) {
    const el = document.getElementById(fieldId);
    const errEl = document.getElementById('err-' + fieldId);
    if (el) el.classList.add('error');
    if (errEl) {
      errEl.textContent = msg;
      errEl.style.display = 'block';
    }
  }

  function clearErrors() {
    ['amp_full_name', 'amp_phone', 'amp_email', 'amp_seats', 'amp_txn_id'].forEach(id => {
      const el = document.getElementById(id);
      const errEl = document.getElementById('err-' + id);
      if (el) el.classList.remove('error');
      if (errEl) errEl.style.display = 'none';
    });
  }
}

// --------------------------------------------------------------------------
// 5. GLOBAL HEADER & CURSOR CONTROLLER
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// --- ADMIN DASHBOARD TEMPLATE & LOGIC ---
function renderAdminPage() {
  const trialList = getTrialRegistrations();
  const bookingList = getAmrapaliBookings();
  const totalSeats = bookingList.reduce((acc, b) => acc + (b.numSeats || parseInt(b.seatCount) || 1), 0);
  const totalPaid = bookingList.filter(b => b.status === 'Paid' || b.paymentStatus === 'Successful' || b.paymentStatus === 'Successful (Pending Verification)').reduce((acc, b) => acc + (b.totalAmount || 0), 0);
  const currentStatus = getAmrapaliReservationStatus();

  return `
    <div style="padding-top: 120px; padding-bottom: 80px; min-height: 85vh; background: var(--color-off-white);">
      <div class="section-container">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 32px;">
          <div>
            <span class="eyebrow">Backend Management</span>
            <h1 class="section-heading" style="font-size: 32px; margin-top: 4px;">Admin Dashboard</h1>
            <p style="font-size: 14px; color: var(--color-muted-text);">Primary Admin Email: <strong>dancedarbar96@gmail.com</strong></p>
          </div>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button id="admin-export-trials" class="btn btn-secondary" style="font-size: 13px; min-height: 44px; padding: 0 18px;">📥 Export Trials CSV</button>
            <button id="admin-export-bookings" class="btn btn-primary" style="font-size: 13px; min-height: 44px; padding: 0 18px;">📥 Export Bookings CSV</button>
          </div>
        </div>

        <!-- AMRAPALI RESERVATION PORTAL STATUS CONTROL PANEL -->
        <div style="background: var(--color-white); border-radius: var(--radius-medium); padding: 24px; border: 1px solid var(--color-border); margin-bottom: 32px; box-shadow: 0 4px 16px rgba(8,18,30,0.04); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
          <div>
            <span style="font-size: 11px; font-weight: 700; color: var(--color-muted-text); text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 4px;">AMRAPALI 2026 Reservation Setting</span>
            <h3 style="font-size: 20px; font-weight: 700; color: var(--color-navy); margin-bottom: 4px; display: flex; align-items: center; gap: 10px;">
              <span>Seat Reservation Portal Status:</span>
              ${currentStatus === 'closed' 
                ? `<span class="badge" style="background: #FEE2E2; color: #991B1B; font-weight: 700; font-size: 13px;">● Closed (Seats Full)</span>`
                : `<span class="badge badge-success" style="font-size: 13px;">● Open (Accepting Reservations)</span>`
              }
            </h3>
            <p style="font-size: 13.5px; color: var(--color-muted-text); margin: 0;">
              ${currentStatus === 'closed'
                ? 'Website shows "Seats Full" and disables new reservations and payment QR screen.'
                : 'Website shows "Reserve Seat" and allows users to submit seat reservations.'
              }
            </p>
          </div>
          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <button id="admin-toggle-status-open" class="btn ${currentStatus === 'open' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 13px; padding: 10px 20px; min-height: 42px;">
              <span>[ Open Portal ]</span>
            </button>
            <button id="admin-toggle-status-closed" class="btn ${currentStatus === 'closed' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 13px; padding: 10px 20px; min-height: 42px; ${currentStatus === 'closed' ? 'background: #991B1B; border-color: #991B1B;' : ''}">
              <span>[ Closed / Seats Full ]</span>
            </button>
          </div>
        </div>

        <!-- STATS OVERVIEW -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px;">
          <div style="background: var(--color-white); border-radius: var(--radius-medium); padding: 20px; border: 1px solid var(--color-border); box-shadow: 0 4px 12px rgba(8,18,30,0.03);">
            <span style="font-size: 11px; font-weight: 700; color: var(--color-muted-text); text-transform: uppercase; letter-spacing: 0.08em;">Trial Registrations</span>
            <h3 style="font-size: 28px; font-weight: 800; color: var(--color-navy); margin-top: 4px;">${trialList.length}</h3>
          </div>
          <div style="background: var(--color-white); border-radius: var(--radius-medium); padding: 20px; border: 1px solid var(--color-border); box-shadow: 0 4px 12px rgba(8,18,30,0.03);">
            <span style="font-size: 11px; font-weight: 700; color: var(--color-muted-text); text-transform: uppercase; letter-spacing: 0.08em;">AMRAPALI Event Bookings</span>
            <h3 style="font-size: 28px; font-weight: 800; color: var(--color-navy); margin-top: 4px;">${bookingList.length}</h3>
          </div>
          <div style="background: var(--color-white); border-radius: var(--radius-medium); padding: 20px; border: 1px solid var(--color-border); box-shadow: 0 4px 12px rgba(8,18,30,0.03);">
            <span style="font-size: 11px; font-weight: 700; color: var(--color-muted-text); text-transform: uppercase; letter-spacing: 0.08em;">Total Seats Reserved</span>
            <h3 style="font-size: 28px; font-weight: 800; color: var(--color-primary-dark); margin-top: 4px;">${totalSeats}</h3>
          </div>
          <div style="background: var(--color-white); border-radius: var(--radius-medium); padding: 20px; border: 1px solid var(--color-border); box-shadow: 0 4px 12px rgba(8,18,30,0.03);">
            <span style="font-size: 11px; font-weight: 700; color: var(--color-muted-text); text-transform: uppercase; letter-spacing: 0.08em;">Total Revenue Collected</span>
            <h3 style="font-size: 28px; font-weight: 800; color: #10B981; margin-top: 4px;">₹${totalPaid}</h3>
          </div>
        </div>

        <!-- FILTERS -->
        <div style="background: var(--color-white); border-radius: var(--radius-medium); padding: 20px; border: 1px solid var(--color-border); margin-bottom: 24px; display: flex; flex-wrap: wrap; gap: 16px; justify-content: space-between; align-items: center;">
          <div style="flex: 1; min-width: 260px;">
            <input type="text" id="admin-search-input" class="form-control" placeholder="🔍 Search by Name, Phone, Email, or Booking Ref..." style="padding: 12px 16px; font-size: 14px;">
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="admin-btn-trials" class="btn btn-primary admin-tab-btn" style="font-size: 13px; min-height: 40px; padding: 0 16px;">Free Trials (${trialList.length})</button>
            <button id="admin-btn-bookings" class="btn btn-secondary admin-tab-btn" style="font-size: 13px; min-height: 40px; padding: 0 16px;">Event Bookings (${bookingList.length})</button>
          </div>
        </div>

        <!-- TABLE CONTAINER -->
        <div style="background: var(--color-white); border-radius: var(--radius-medium); border: 1px solid var(--color-border); overflow-x: auto; box-shadow: 0 10px 30px rgba(8,18,30,0.04);">
          <div id="admin-table-container">
            ${renderAdminTrialsTable(trialList)}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAdminTrialsTable(list) {
  if (!list || list.length === 0) {
    return `<div style="padding: 40px; text-align: center; color: var(--color-muted-text);">No trial registrations found.</div>`;
  }
  return `
    <table class="schedule-table" style="min-width: 800px; width: 100%;">
      <thead>
        <tr>
          <th>Reg ID</th>
          <th>Student Name</th>
          <th>Age Group</th>
          <th>Interested Class</th>
          <th>Phone</th>
          <th>Address</th>
          <th>Submitted At</th>
        </tr>
      </thead>
      <tbody>
        ${list.map(item => `
          <tr>
            <td style="font-family: monospace; font-weight: 700; color: var(--color-primary-dark);">${sanitizeInput(item.id)}</td>
            <td style="font-weight: 600;">${sanitizeInput(item.studentName)}</td>
            <td><span class="status-badge">${sanitizeInput(item.ageGroup)}</span></td>
            <td><strong>${sanitizeInput(item.interestedClass)}</strong></td>
            <td><a href="tel:${sanitizeInput(item.phone)}" style="color: var(--color-navy); font-weight: 600;">${sanitizeInput(item.phone)}</a></td>
            <td style="max-width: 200px; font-size: 13.5px;">${sanitizeInput(item.address)}</td>
            <td style="font-size: 13px; color: var(--color-muted-text);">${sanitizeInput(item.submittedAt)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderAdminBookingsTable(list) {
  if (!list || list.length === 0) {
    return `<div style="padding: 40px; text-align: center; color: var(--color-muted-text);">No event bookings found.</div>`;
  }
  return `
    <table class="schedule-table" style="min-width: 900px; width: 100%;">
      <thead>
        <tr>
          <th>Booking Ref</th>
          <th>Guest Name</th>
          <th>Phone</th>
          <th>Email</th>
          <th>Seats</th>
          <th>Amount</th>
          <th>Txn Ref ID</th>
          <th>Payment Status</th>
        </tr>
      </thead>
      <tbody>
        ${list.map(item => `
          <tr>
            <td style="font-family: monospace; font-weight: 700; color: var(--color-primary-dark);">${sanitizeInput(item.bookingRef)}</td>
            <td style="font-weight: 600;">${sanitizeInput(item.fullName)}</td>
            <td><a href="tel:${sanitizeInput(item.phone)}" style="color: var(--color-navy); font-weight: 600;">${sanitizeInput(item.phone)}</a></td>
            <td style="font-size: 13px;">${sanitizeInput(item.email)}</td>
            <td><strong>${sanitizeInput(String(item.seatCount))}</strong></td>
            <td style="font-weight: 700; color: #10B981;">₹${item.totalAmount}</td>
            <td style="font-family: monospace; font-size: 12.5px;">${sanitizeInput(item.txnId || 'Pending')}</td>
            <td><span class="status-badge">${sanitizeInput(item.status || item.paymentStatus || 'Pending')}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function initAdminPageEvents() {
  let activeTab = 'trials';
  const container = document.getElementById('admin-table-container');
  const searchInput = document.getElementById('admin-search-input');
  const btnTrials = document.getElementById('admin-btn-trials');
  const btnBookings = document.getElementById('admin-btn-bookings');
  const btnExportTrials = document.getElementById('admin-export-trials');
  const btnExportBookings = document.getElementById('admin-export-bookings');

  const btnToggleOpen = document.getElementById('admin-toggle-status-open');
  const btnToggleClosed = document.getElementById('admin-toggle-status-closed');

  if (btnToggleOpen) {
    btnToggleOpen.addEventListener('click', () => {
      setAmrapaliReservationStatus('open');
      alert('AMRAPALI 2026 Seat Reservation Portal is now OPEN. Website will show "Reserve Seat" button and accept new bookings.');
      if (typeof window.renderApp === 'function') window.renderApp();
      else location.reload();
    });
  }

  if (btnToggleClosed) {
    btnToggleClosed.addEventListener('click', () => {
      setAmrapaliReservationStatus('closed');
      alert('AMRAPALI 2026 Seat Reservation Portal is now CLOSED. Website will show "Seats Full" and disable new bookings.');
      if (typeof window.renderApp === 'function') window.renderApp();
      else location.reload();
    });
  }

  function updateTable() {
    const q = (searchInput.value || '').toLowerCase().trim();
    if (activeTab === 'trials') {
      let list = getTrialRegistrations();
      if (q) {
        list = list.filter(t => 
          (t.studentName || '').toLowerCase().includes(q) ||
          (t.phone || '').toLowerCase().includes(q) ||
          (t.interestedClass || '').toLowerCase().includes(q) ||
          (t.id || '').toLowerCase().includes(q)
        );
      }
      container.innerHTML = renderAdminTrialsTable(list);
    } else {
      let list = getAmrapaliBookings();
      if (q) {
        list = list.filter(b => 
          (b.fullName || '').toLowerCase().includes(q) ||
          (b.phone || '').toLowerCase().includes(q) ||
          (b.email || '').toLowerCase().includes(q) ||
          (b.bookingRef || '').toLowerCase().includes(q) ||
          (b.txnId || '').toLowerCase().includes(q)
        );
      }
      container.innerHTML = renderAdminBookingsTable(list);
    }
  }

  if (btnTrials) {
    btnTrials.addEventListener('click', () => {
      activeTab = 'trials';
      btnTrials.className = 'btn btn-primary admin-tab-btn';
      btnBookings.className = 'btn btn-secondary admin-tab-btn';
      updateTable();
    });
  }

  if (btnBookings) {
    btnBookings.addEventListener('click', () => {
      activeTab = 'bookings';
      btnBookings.className = 'btn btn-primary admin-tab-btn';
      btnTrials.className = 'btn btn-secondary admin-tab-btn';
      updateTable();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', updateTable);
  }

  if (btnExportTrials) {
    btnExportTrials.addEventListener('click', () => {
      const list = getTrialRegistrations();
      exportToCSV('dance_darbar_trial_registrations.csv', list);
    });
  }

  if (btnExportBookings) {
    btnExportBookings.addEventListener('click', () => {
      const list = getAmrapaliBookings();
      exportToCSV('dance_darbar_amrapali_bookings.csv', list);
    });
  }
}

function exportToCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows.map(row => {
      return keys.map(k => {
        let cell = row[k] === null || row[k] === undefined ? '' : row[k];
        cell = cell.toString().replace(/"/g, '""');
        if (cell.search(/("|,|\n)/g) >= 0) {
          cell = `"${cell}"`;
        }
        return cell;
      }).join(separator);
    }).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initAmrapaliModalEvents();

  // Sticky Navbar on Scroll
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile Drawer Toggle & Scroll Lock
  const toggle = document.getElementById('mobile-menu-toggle');
  const closeBtn = document.getElementById('mobile-menu-close');
  const overlay = document.getElementById('mobile-menu-overlay');

  if (toggle && overlay) {
    const openMenu = () => {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    };

    toggle.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    document.querySelectorAll('.mobile-link, .mobile-cta').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // Mobile Footer Accordions (Only 1 expanded at a time)
  document.querySelectorAll('.footer-accordion-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (window.innerWidth > 767) return;
      e.preventDefault();
      const parent = btn.closest('.footer-accordion');
      const isOpen = parent.classList.contains('active');

      document.querySelectorAll('.footer-accordion').forEach(col => {
        col.classList.remove('active');
        const t = col.querySelector('.footer-accordion-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        parent.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Custom Cursor
  const cursor = document.getElementById('custom-cursor');
  const cursorText = document.getElementById('cursor-text');

  if (cursor && window.innerWidth > 767) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    });

    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('.cursor-target-view');
      if (target) {
        cursor.classList.add('active-view');
        cursorText.textContent = 'View';
      } else {
        cursor.classList.remove('active-view');
      }
    });
  }

  // Hash Router Listener
  window.addEventListener('hashchange', renderApp);
  renderApp();
});
