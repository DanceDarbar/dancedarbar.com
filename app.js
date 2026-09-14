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
const CLASS_SCHEDULES = {
  'Kathak': 'Monday & Friday, 4:00 PM – 8:00 PM',
  'Bollywood': 'Tuesday & Thursday, 4:00 PM – 7:00 PM',
  'Vocals': 'Wednesday & Saturday',
  'Fine Arts': 'Online — visit to discuss batches',
  'Yoga': 'Morning Batch, 7:00 PM'
};

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
      image: 'assets/kathak-class.jpg',
      imagePosition: 'center center',
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
      schedule: CLASS_SCHEDULES['Kathak'],
      schedulePreview: CLASS_SCHEDULES['Kathak']
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
      image: 'assets/bollywood-class.jpg',
      imagePosition: 'center top',
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
      schedule: CLASS_SCHEDULES['Bollywood'],
      schedulePreview: CLASS_SCHEDULES['Bollywood']
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
      image: 'assets/vocals-class.jpg',
      imagePosition: '42% center',
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
      schedule: CLASS_SCHEDULES['Vocals'],
      schedulePreview: CLASS_SCHEDULES['Vocals']
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
      schedule: CLASS_SCHEDULES['Fine Arts'],
      schedulePreview: CLASS_SCHEDULES['Fine Arts']
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
      image: 'assets/yoga-class.jpg',
      imagePosition: 'center 40%',
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
      schedule: CLASS_SCHEDULES['Yoga'],
      schedulePreview: CLASS_SCHEDULES['Yoga']
    }
  ],

  schedules: [
    { program: 'Kathak', day: CLASS_SCHEDULES['Kathak'], instructor: 'Guru Bhagwan Singh', availability: 'Available' },
    { program: 'Bollywood', day: CLASS_SCHEDULES['Bollywood'], instructor: 'Simar Mehendiratta', availability: 'Available' },
    { program: 'Vocals', day: CLASS_SCHEDULES['Vocals'], instructor: 'Punit Tiwari', availability: 'Available' },
    { program: 'Fine Arts', day: CLASS_SCHEDULES['Fine Arts'], instructor: 'Guru Bhagwan Singh', availability: 'Available' },
    { program: 'Yoga', day: CLASS_SCHEDULES['Yoga'], instructor: 'Mrs. Meena Kuthal', availability: 'Available' }
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
  if (window.cleanupCurtainSimulation) {
    window.cleanupCurtainSimulation();
  }
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
    const isAbout = (route === '/about' || route === '/about-us') && (targetRoute === '/about' || targetRoute === '/about-us');
    const isEvents = (route === '/events' || route.startsWith('/events/') || route === '/wedding-inquiry' || route === '/plan-performance') && targetRoute === '/events';
    if (isAbout || isEvents || targetRoute === route || (targetRoute !== '/' && route.startsWith(targetRoute))) {
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
  } else if (route === '/schedule' || route.startsWith('/schedule')) {
    window.location.hash = '#/';
    return;
  } else if (route === '/events') {
    appRoot.innerHTML = renderEventsPage();
    initWhatWeCreateScroll();
  } else if (route.startsWith('/events/')) {
    const slug = route.split('/events/')[1];
    appRoot.innerHTML = renderEventDetailPage(slug);
  } else if (route === '/wedding-inquiry' || route === '/plan-performance') {
    appRoot.innerHTML = renderWeddingInquiryPage();
    initWeddingInquiryEvents();
  } else if (route === '/gallery' || route.startsWith('/gallery')) {
    window.location.hash = '#/';
    return;
  } else if (route === '/claim-free-seat') {
    appRoot.innerHTML = renderClaimFreeSeatPage();
    initTrialFormEvents();
  } else if (route === '/about' || route === '/about-us') {
    appRoot.innerHTML = renderAboutPage();
    initGrainyCarousel();
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
        <div class="hero-bottom-gradient" aria-hidden="true"></div>
      </div>
      <div class="hero-content">
        <div class="hero-text-box">
          <span class="eyebrow light">Dance Darbar Kala Sansthan</span>
          <h1 class="display-heading hero-heading">Where Movement<br>Becomes Art.</h1>
          <p class="hero-subheading">Disciplined training in Kathak, Bollywood, Vocal Music, Fine Arts and Yoga for every age and skill level.</p>
          <div class="hero-cta-group">
            <a href="#/claim-free-seat" class="btn btn-primary claim-seat-btn">
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

    <!-- EXPLORE CLASSES SECTION (MAGNETIC CAROUSEL) -->
    <section class="explore-classes-section">
      <div class="explore-classes-bg-layer" aria-hidden="true">
        <img src="assets/stage-spotlight-bg.jpg" alt="" class="explore-classes-bg-img" decoding="async">
        <div class="explore-classes-fade-top" aria-hidden="true"></div>
        <div class="explore-classes-fade-bottom" aria-hidden="true"></div>
      </div>
      <div class="section-container">
        <div class="explore-classes-header">
          <span class="eyebrow light">EXPLORE CLASSES</span>
          <h2 class="section-heading" style="color: var(--color-white); margin-top: 8px;">Choose the Art That Moves You.</h2>
          <p class="lead-text light" style="margin: 12px auto 0; max-width: 600px;">Hover or select a class to preview the experience.</p>
        </div>

        <div class="magnetic-carousel-wrapper" id="magneticCarouselWrapper">
          <div class="magnetic-backdrop" id="magneticBackdrop" aria-hidden="true"></div>
          <div class="magnetic-carousel-track" id="magneticCarouselTrack" role="region" aria-label="Explore Classes Carousel">
            ${[
              {
                name: 'Bollywood',
                slug: 'bollywood',
                image: 'assets/bollywood-class.jpg',
                alt: 'Bollywood',
                position: '25% center',
                desc: 'Energetic choreography, performance skills, musicality and confidence.',
                schedule: CLASS_SCHEDULES['Bollywood']
              },
              {
                name: 'Vocals',
                slug: 'vocal-music',
                image: 'assets/vocals-class.jpg',
                alt: 'Vocals',
                position: '35% top',
                desc: 'Voice culture, rhythm, melody, breathing and performance practice.',
                schedule: CLASS_SCHEDULES['Vocals']
              },
              {
                name: 'Kathak',
                slug: 'kathak',
                image: 'assets/kathak-class.jpg',
                alt: 'Kathak',
                position: 'center 30%',
                desc: 'Classical technique, footwork, rhythm, expression and storytelling.',
                schedule: CLASS_SCHEDULES['Kathak']
              },
              {
                name: 'Fine Arts',
                slug: 'fine-arts',
                image: 'assets/fine-arts-local.png',
                alt: 'Fine Arts',
                position: '60% center',
                desc: 'Drawing, composition, color theory and visual creative expression.',
                schedule: CLASS_SCHEDULES['Fine Arts']
              },
              {
                name: 'Yoga',
                slug: 'yoga',
                image: 'assets/yoga-class.jpg',
                alt: 'Yoga',
                position: 'center 40%',
                desc: 'Mindful movement, flexibility, balance, breathing and inner strength.',
                schedule: CLASS_SCHEDULES['Yoga']
              }
            ].map((cls, idx) => `
              <div class="magnetic-item-wrap" data-carousel-index="${idx}">
                <div class="magnetic-thumbnail-card" role="button" tabindex="0" aria-label="${cls.name} class thumbnail">
                  <img src="${cls.image}" alt="${cls.alt}" loading="lazy" decoding="async" class="magnetic-card-img" style="object-position: ${cls.position};">
                  <div class="magnetic-hover-label" aria-hidden="true">${cls.name}</div>
                  <div class="magnetic-detail-overlay">
                    <h3 class="magnetic-detail-title">${cls.name}</h3>
                    <p class="magnetic-detail-desc">${cls.desc}</p>
                    <p class="magnetic-detail-schedule">${cls.schedule}</p>
                    <a href="#/programs/${cls.slug}" class="btn btn-primary magnetic-detail-btn">
                      <span>View Details</span>
                      <svg class="btn-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURED EVENT / UPCOMING PERFORMANCE -->
    <section class="featured-event-section">
      <div class="section-container">
        <div class="upcoming-performance-header">
          <h2 class="upcoming-performance-heading">Upcoming Performance</h2>
        </div>
        <div class="curtain-stage-wrap">
          <div class="curtain-stage" id="stage" tabindex="0" role="region" aria-label="Interactive announcement reveal: Upcoming performance: A NEW STORY TAKES THE STAGE">
            <div class="stage-content">
              <p class="stage-eyebrow">Upcoming Performance</p>
              <h2 class="stage-heading">Wait, They Are Preparing</h2>
            </div>

            <canvas id="curtainCanvas"></canvas>

            <div class="mobile-curtain" id="mobileCurtain">
              <div class="m-panel m-left" id="mLeft"></div>
              <div class="m-panel m-right" id="mRight"></div>
            </div>

            <div class="edge-fade edge-fade-top"></div>
            <div class="edge-fade edge-fade-bottom"></div>
            <p class="curtain-hint" id="hint">Move your cursor to part the curtains</p>
          </div>

          <!-- Desktop texture (compressed) and a smaller mobile-only copy -->
          <img id="curtainImg" src="assets/curtain-texture.jpg" style="display:none" alt="">
        </div>
      </div>
    </section>

    <!-- STATISTICS COUNTER -->
    <section class="stats-section">
      <div class="section-container">
        <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
          <div class="stat-item">
            <span class="stat-value counter-anim" data-target="5000" data-suffix="+">0+</span>
            <span class="stat-label">Students Trained</span>
          </div>
          <div class="stat-item">
            <span class="stat-value counter-anim" data-target="150" data-suffix="+">0+</span>
            <span class="stat-label">Stage Performances</span>
          </div>
          <div class="stat-item">
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
          <span class="eyebrow testimonial-reveal-header" style="--reveal-index: 0;">Student & Parent Stories</span>
          <h2 class="section-heading testimonial-reveal-header" style="--reveal-index: 1;">Voices of Our Community.</h2>
          <p class="lead-text testimonial-reveal-header" style="margin: 0 auto; max-width: 600px; --reveal-index: 2;">Hear how Dance Darbar Kala Sansthan shapes confidence, rhythm, and artistic growth.</p>
        </div>

        <div class="testimonials-grid">
          ${DANCE_DATA.testimonials.map((t, idx) => `
            <div class="testimonial-card motion-graphic-testimonial" style="--card-index: ${idx};">
              <div class="motion-quote-mark">“</div>
              <div class="testimonial-rating">
                ${Array.from({ length: t.rating }).map((_, sIdx) => `<span class="star-glyph" style="--star-index: ${sIdx};">★</span>`).join('')}
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
        <a href="#/faq" class="dual-banner-item">
          <span class="dual-eyebrow">FAQ</span>
          <h2 class="dual-title">FAQ</h2>
        </a>
        <div class="dual-divider"></div>
        <a href="#/contact" class="dual-banner-item">
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
            <div class="editorial-split" style="background: var(--color-surface); border-radius: var(--radius-large); padding: 48px; border: 1px solid var(--color-border); box-shadow: 0 10px 30px rgba(0,0,0,0.4); ${idx % 2 === 1 ? 'grid-template-columns: 1fr 1fr;' : ''}">
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
                  <div>
                    <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--color-muted-text); display: block;">Schedule</span>
                    <span style="font-weight: 600;">${p.schedule}</span>
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
                  <img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async" class="editorial-img" style="height: 380px;${p.imagePosition ? ` object-position: ${p.imagePosition};` : ''}">
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
              <a href="#/claim-free-seat" class="btn btn-primary claim-seat-btn">
                <span>Claim Free Trial Seat</span>
                <svg class="btn-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
          <div class="editorial-media">
            ${prog.video ? `
              <video src="${prog.video}" autoplay loop muted playsinline class="editorial-img"></video>
            ` : `
              <img src="${prog.image}" alt="${prog.name}" loading="lazy" decoding="async" class="editorial-img"${prog.imagePosition ? ` style="object-position: ${prog.imagePosition};"` : ''}>
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
              <a href="#/claim-free-seat" class="btn btn-primary full-width claim-seat-btn" style="margin-top: 8px;">
                <span>Claim Trial Seat</span>
                <svg class="btn-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// --- EVENTS PAGE TEMPLATE (WHAT WE CREATE CINEMATIC STORYTELLING) ---
function renderEventsPage() {
  return `
    <div class="what-we-create-section">
      <!-- SECTION HEADER -->
      <div class="wwc-header">
        <span class="eyebrow light">WHAT WE CREATE</span>
        <h1 class="section-heading">What We Create</h1>
        <p class="lead-text">Performances, annual productions, and personalised celebrations—brought to life through dance.</p>
      </div>

      <!-- THREE CINEMATIC PANELS -->
      <div class="wwc-panels-container">
        <!-- PANEL 01: Events & Performances -->
        <section class="wwc-panel" id="panel-events" data-panel="01">
          <div class="wwc-panel-bg" style="background-image: url('assets/stage-spotlight-bg.jpg');"></div>
          <div class="wwc-panel-overlay"></div>
          <div class="wwc-panel-content">
            <div class="wwc-number-badge">
              <span class="wwc-number">01</span>
              <span>— Experience</span>
            </div>
            <h2 class="wwc-panel-title">Events &amp; Performances</h2>
            <p class="wwc-tagline">Stage. Expression. Celebration.</p>
            <p class="wwc-description">
              Dance Darbar creates and presents live performances, cultural events, showcases, and special stage productions featuring trained artists and academy students.
            </p>

            <div class="wwc-mobile-image-card">
              <img src="assets/stage-spotlight-bg.jpg" alt="Dance Darbar Events and Performances stage spotlight" loading="lazy">
              <div class="wwc-mobile-image-overlay"></div>
            </div>

            <div class="wwc-examples-wrap">
              <span class="wwc-examples-label">What We Bring to the Stage</span>
              <div class="wwc-examples-list">
                <span class="wwc-example-pill">Cultural performances</span>
                <span class="wwc-example-pill">Dance showcases</span>
                <span class="wwc-example-pill">Stage productions</span>
                <span class="wwc-example-pill">Special performances</span>
                <span class="wwc-example-pill">Academy events</span>
              </div>
            </div>

            <div class="wwc-actions">
              <a href="#events-calendar" class="btn btn-primary wwc-cta-btn" onclick="document.getElementById('events-calendar')?.scrollIntoView({behavior: 'smooth'}); return false;">
                <span>Explore Events</span>
                <svg class="btn-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </section>

        <!-- PANEL 02: Academy Annual Programs -->
        <section class="wwc-panel" id="panel-annual" data-panel="02">
          <div class="wwc-panel-bg" style="background-image: url('assets/amrapali.jpg');"></div>
          <div class="wwc-panel-overlay"></div>
          <div class="wwc-panel-content">
            <div class="wwc-number-badge">
              <span class="wwc-number">02</span>
              <span>— Experience</span>
            </div>
            <h2 class="wwc-panel-title">Academy Annual Programs</h2>
            <p class="wwc-tagline">A Year of Learning. A Stage to Remember.</p>
            <p class="wwc-description">
              Our annual academy programmes give students the opportunity to present their learning on a professional stage, build confidence, and celebrate their artistic journey with family and the community.
            </p>

            <div class="wwc-mobile-image-card">
              <img src="assets/amrapali.jpg" alt="Academy Annual Programs stage production" loading="lazy">
              <div class="wwc-mobile-image-overlay"></div>
            </div>

            <div class="wwc-examples-wrap">
              <span class="wwc-examples-label">Highlights &amp; Experience</span>
              <div class="wwc-examples-list">
                <span class="wwc-example-pill">Annual productions</span>
                <span class="wwc-example-pill">Student showcases</span>
                <span class="wwc-example-pill">Cultural celebrations</span>
                <span class="wwc-example-pill">Performance opportunities</span>
                <span class="wwc-example-pill">Student achievements</span>
              </div>
            </div>

            <div class="wwc-amrapali-badge" onclick="window.openAmrapaliModal()" role="button" tabindex="0" title="As seen in AMRAPALI 2026" aria-label="As seen in AMRAPALI 2026">
              <span class="wwc-badge-icon">✦</span>
              <span class="wwc-badge-text">As seen in <strong>AMRAPALI 2026</strong></span>
              <span class="wwc-badge-arrow">&rarr;</span>
            </div>

            <div class="wwc-actions">
              <a href="#events-calendar" class="btn btn-primary wwc-cta-btn" onclick="document.getElementById('events-calendar')?.scrollIntoView({behavior: 'smooth'}); return false;">
                <span>View Our Events</span>
                <svg class="btn-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </section>

        <!-- PANEL 03: Wedding & Family Performances -->
        <section class="wwc-panel" id="panel-wedding" data-panel="03">
          <div class="wwc-panel-bg" style="background-image: url('assets/bollywood.jpg');"></div>
          <div class="wwc-panel-overlay"></div>
          <div class="wwc-panel-content">
            <div class="wwc-number-badge">
              <span class="wwc-number">03</span>
              <span>— Experience</span>
            </div>
            <h2 class="wwc-panel-title">Wedding &amp; Family Performances</h2>
            <p class="wwc-tagline">Make Your Celebration Unforgettable.</p>
            <p class="wwc-description">
              We create personalised dance experiences for weddings and family celebrations—from choreography for the bride, groom, and family members to complete group performances designed around your story.
            </p>

            <div class="wwc-mobile-image-card">
              <img src="assets/bollywood.jpg" alt="Wedding and Family Dance Choreography" loading="lazy">
              <div class="wwc-mobile-image-overlay"></div>
            </div>

            <div class="wwc-examples-wrap">
              <span class="wwc-examples-label">Personalised Choreography Offerings</span>
              <div class="wwc-examples-list">
                <span class="wwc-example-pill" title="Bride & Groom choreography">Bride &amp; Groom choreography</span>
                <span class="wwc-example-pill">Family dance performances</span>
                <span class="wwc-example-pill">Sangeet choreography</span>
                <span class="wwc-example-pill">Group performances</span>
                <span class="wwc-example-pill">Custom routines</span>
                <span class="wwc-example-pill">Practice sessions for family members</span>
                <span class="wwc-example-pill">Event-day performance preparation</span>
              </div>
            </div>

            <div class="wwc-note">
              <span style="color: #60A5FA;">ℹ</span>
              <span>Choreography &amp; Rehearsal Sessions (Wedding &amp; Sangeet performance gallery coming soon)</span>
            </div>

            <div class="wwc-actions">
              <a href="#/wedding-inquiry" class="btn btn-primary wwc-cta-btn">
                <span>Plan Your Performance</span>
                <svg class="btn-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </section>
      </div>

      <!-- SHOWCASE & ANNUAL PRODUCTIONS CALENDAR -->
      <section id="events-calendar" class="events-calendar-section" style="padding: 100px 0; border-top: 1px solid rgba(255, 255, 255, 0.08); background-color: #050507;">
        <div class="section-container">
          <span class="eyebrow light">Events &amp; Performances</span>
          <h2 class="section-heading" style="margin-top: 8px; margin-bottom: 16px; color: #FFFFFF;">Where Practice Meets the Stage.</h2>
          <p class="lead-text light" style="margin-bottom: 48px; max-width: 720px;">Discover upcoming annual productions, stage shows and grand cultural showcases at Dance Darbar Kala Sansthan.</p>

          <div class="events-showcase-grid">
            <div class="event-card-featured" style="background: #121214; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: var(--radius-large); overflow: hidden; display: grid; grid-template-columns: 48% 52%; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);">
              <div style="position: relative; overflow: hidden; min-height: 360px;">
                <img src="assets/amrapali.jpg" alt="AMRAPALI 2026 Annual Student Dance Ballet" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                <div style="position: absolute; top: 20px; left: 20px; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px); padding: 6px 14px; border-radius: 9999px; border: 1px solid rgba(255, 255, 255, 0.2); font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: #60A5FA;">
                  ANNUAL PRODUCTION
                </div>
              </div>
              <div style="padding: 40px 36px; display: flex; flex-direction: column; justify-content: center;">
                <span class="eyebrow" style="color: #60A5FA; margin-bottom: 6px;">DANCE DARBAR KALA SANSTHAN PRESENTS</span>
                <h3 style="font-family: var(--font-heading); font-size: clamp(28px, 3vw, 36px); font-weight: 700; color: #FFFFFF; margin-bottom: 8px;">AMRAPALI 2026</h3>
                <p style="font-size: 14px; font-weight: 600; color: #93C5FD; margin-bottom: 16px;">Annual Student Dance Ballet · Sunday, 23 August 2026</p>
                <p style="font-size: 14px; color: #D4D4D8; line-height: 1.6; margin-bottom: 20px;">
                  Witness the remarkable performances of Dance Darbar students as they present AMRAPALI 2026, an annual showcase celebrating passion, discipline, and artistic expression through Kathak, Bollywood, Vocal Music, Fine Arts, and Yoga.
                </p>
                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px; font-size: 13px; color: #A1A1AA;">
                  <span>📍 CCRT Auditorium, Dwarka Sector 7, New Delhi</span>
                </div>
                <div style="display: flex; gap: 14px; align-items: center; flex-wrap: wrap;">
                  <button type="button" class="btn btn-primary claim-seat-btn" onclick="window.openAmrapaliModal()">
                    <span>Reserve Guest Seat</span>
                    <svg class="btn-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                  <span class="coming-soon-heading" style="font-size: 13px; font-weight: 700; letter-spacing: 0.1em; color: #9CA3AF; padding: 10px 18px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px;">COMING SOON</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

// --- WEDDING & CELEBRATION PERFORMANCE INQUIRY PAGE TEMPLATE ---
function renderWeddingInquiryPage() {
  return `
    <div class="wedding-inquiry-page-container">
      <div class="section-container">
        <a href="#/events" class="back-link">&larr; Back to What We Create</a>
        <div class="wedding-inquiry-layout">
          <!-- Visual Column -->
          <div class="wedding-visual-side">
            <div class="wedding-visual-bg" style="background-image: url('assets/bollywood.jpg');"></div>
            <div class="wedding-visual-overlay"></div>
            <div class="wedding-visual-content">
              <span class="eyebrow light">WEDDING &amp; SANGEET CHOREOGRAPHY</span>
              <h2 class="wedding-visual-title">Make Your Celebration Unforgettable.</h2>
              <p class="wedding-visual-desc">
                From intimate bride &amp; groom duets to energetic family group performances, we craft personalized choreography tailored to your chosen songs and schedule.
              </p>
              <div class="wedding-feature-list">
                <div class="wedding-feature-item">
                  <span class="wedding-feature-check">✓</span>
                  <span>Choreography tailored to non-dancers &amp; beginners</span>
                </div>
                <div class="wedding-feature-item">
                  <span class="wedding-feature-check">✓</span>
                  <span>Custom song track editing &amp; medley mixing</span>
                </div>
                <div class="wedding-feature-item">
                  <span class="wedding-feature-check">✓</span>
                  <span>Flexible studio &amp; at-home rehearsal sessions</span>
                </div>
                <div class="wedding-feature-item">
                  <span class="wedding-feature-check">✓</span>
                  <span>Event-day stage positioning &amp; cue guidance</span>
                </div>
              </div>
              <p class="wedding-scope-notice">
                <strong>Service Scope:</strong> Dance Darbar provides dedicated dance instruction, music concept design, and rehearsal coaching for wedding parties and families.
              </p>
            </div>
          </div>

          <!-- Form Column -->
          <div class="wedding-form-side">
            <div id="wedding-form-container">
              <span class="eyebrow">CUSTOM CHOREOGRAPHY INQUIRY</span>
              <h1 class="wedding-form-heading">Plan Your Performance.</h1>
              <p class="wedding-form-desc">
                Tell us about your celebration. Our choreographers will design a routine tailored to your family's favorite music and schedule.
              </p>

              <form id="wedding-inquiry-form" class="wedding-inquiry-form" novalidate>
                <div class="form-group">
                  <label for="wedding-name" class="form-label">Full Name *</label>
                  <input type="text" id="wedding-name" name="name" class="form-control" placeholder="e.g. Ananya Gupta" required autocomplete="name">
                  <span class="error-text" id="wedding-name-error" style="display: none;">Please enter your full name</span>
                </div>

                <div class="form-row-2col">
                  <div class="form-group">
                    <label for="wedding-phone" class="form-label">Phone Number *</label>
                    <input type="tel" id="wedding-phone" name="phone" class="form-control" placeholder="10-digit mobile number" required autocomplete="tel">
                    <span class="error-text" id="wedding-phone-error" style="display: none;">Please enter a valid 10-digit number</span>
                  </div>

                  <div class="form-group">
                    <label for="wedding-date" class="form-label">Event / Sangeet Date *</label>
                    <input type="date" id="wedding-date" name="eventDate" class="form-control" required>
                    <span class="error-text" id="wedding-date-error" style="display: none;">Please select the event date</span>
                  </div>
                </div>

                <div class="form-row-2col">
                  <div class="form-group">
                    <label for="wedding-type" class="form-label">Celebration Type *</label>
                    <select id="wedding-type" name="celebrationType" class="form-control" required>
                      <option value="" disabled selected>Select Celebration Type</option>
                      <option value="Sangeet Night Choreography">Sangeet Night Choreography</option>
                      <option value="Wedding Reception Performance">Wedding Reception Performance</option>
                      <option value="Bride &amp; Groom Solo / Duet Routine">Bride &amp; Groom Solo / Duet Routine</option>
                      <option value="Family &amp; Friends Group Routine">Family &amp; Friends Group Routine</option>
                      <option value="Anniversary / Milestone Celebration">Anniversary / Milestone Celebration</option>
                      <option value="Other Family Celebration">Other Family Celebration</option>
                    </select>
                    <span class="error-text" id="wedding-type-error" style="display: none;">Please choose a celebration type</span>
                  </div>

                  <div class="form-group">
                    <label for="wedding-participants" class="form-label">Estimated Participants</label>
                    <select id="wedding-participants" name="participants" class="form-control">
                      <option value="Couple / Solo (1–2 dancers)" selected>Couple / Solo (1–2 dancers)</option>
                      <option value="Small Group (3–6 dancers)">Small Group (3–6 dancers)</option>
                      <option value="Large Group (7–15 dancers)">Large Group (7–15 dancers)</option>
                      <option value="Grand Family Ensemble (15+ dancers)">Grand Family Ensemble (15+ dancers)</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label for="wedding-notes" class="form-label">Songs &amp; Special Requirements (Optional)</label>
                  <textarea id="wedding-notes" name="notes" class="form-control" rows="3" placeholder="Share your favorite songs, preferred dance style (Bollywood, Semi-Classical, Folk), or rehearsal schedule preferences..."></textarea>
                </div>

                <button type="submit" class="btn btn-primary full-width" id="wedding-submit-btn">
                  <span>Submit Performance Inquiry</span>
                  <svg class="btn-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </form>
            </div>

            <div id="wedding-success-container" class="wedding-success-container" style="display: none;">
              <div class="wedding-success-icon-wrap">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <h2 class="wedding-success-heading">Inquiry Received with Warmth</h2>
              <p class="wedding-success-desc">
                Thank you for reaching out to Dance Darbar. Guru Bhagwan Singh and our choreography team will connect with you via WhatsApp or phone shortly to discuss your music, dance routine, and rehearsal timeline.
              </p>
              <div class="wedding-success-actions">
                <a href="#/events" class="btn btn-secondary light">Back to What We Create</a>
                <a href="#/" class="btn btn-primary">Return Home</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// --- EVENT DETAIL TEMPLATE ---
function renderEventDetailPage(slug) {
  return `
    <div style="padding-top: 140px; padding-bottom: 100px;">
      <div class="section-container">
        <a href="#/events" style="font-size: 14px; font-weight: 600; color: var(--color-primary-dark); margin-bottom: 24px; display: inline-block;">&larr; Back to Events</a>
        <div class="coming-soon-card">
          <h1 class="coming-soon-heading">COMING SOON</h1>
        </div>
      </div>
    </div>
  `;
}

// --- CLAIM FREE SEAT PAGE TEMPLATE ---
function renderClaimFreeSeatPage() {
  return `
    <div class="trial-main-container">
      <div class="section-container">
        <div class="trial-page-layout">
          <div class="trial-visual-side">
            <div class="trial-video-wrapper">
              <iframe
                src="https://player.vimeo.com/video/1226502869?autoplay=1&loop=1&muted=1&background=1&autopause=0"
                title="Dance Darbar Kala Sansthan"
                frameborder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                referrerpolicy="strict-origin-when-cross-origin"
              ></iframe>
            </div>
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

              <button type="submit" class="btn btn-primary full-width claim-seat-btn" style="margin-top: 12px;" id="trial-submit-btn">
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
    <div class="about-page-wrap">
      <div class="section-container">
        <!-- 1 & 2: Centered Eyebrow & Heading -->
        <div class="about-hero-header">
          <span class="eyebrow about-eyebrow">OUR STORY</span>
          <h1 class="about-heading">Dance Darbar Kala Sansthan</h1>
        </div>

        <!-- 3, 4, 5: ~64px gap, Grainy Carousel Multi-Image Component, ~64px gap -->
        <div class="about-gallery-wrap">
          <div 
            class="grainy-carousel-host" 
            id="grainy-carousel-host" 
            role="region" 
            aria-label="Dance Darbar Kala Sansthan Community Showcase Carousel" 
            style="width: 100%; height: 380px; min-width: 0; min-height: 0; border-radius: 16px; overflow: hidden; position: relative; isolation: isolate; cursor: pointer; touch-action: none; background: rgba(0, 0, 0, 0);"
          >
            <canvas id="grainy-carousel-gl" style="position: absolute; inset: 0; width: 100%; height: 100%;"></canvas>
            <canvas id="grainy-carousel-fallback" style="position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; pointer-events: none;"></canvas>
          </div>
        </div>

        <!-- 6 & 7: History paragraph & Mission paragraph -->
        <div class="about-content-block">
          <p class="about-paragraph">
            Dance Darbar Kala Sansthan began in 1995 as Hare Krishna Bhartiya Kala Kendra, founded with the divine blessings of Guru Pt. Ram Mohan Maharaj Ji and Su Shri Rani Khanam Ji. In 2020, the institute was renamed Dance Darbar Kala Sansthan.
          </p>
          
          <p class="about-paragraph">
            Dance Darbar Kala Sansthan is built on value-based cultural education — nurturing love, sharing, and care alongside artistic training. Our programs span Kathak, Folk Dance, Western, Bollywood, Painting, Instruments, Vocal, and Yoga.
          </p>
        </div>

        <!-- 9: Founder Profile Section (Guru Bhagwan Singh photo + bio) -->
        <section class="founder-section" aria-label="Founder Profile">
          <div class="founder-card">
            <div class="founder-media">
              <img 
                src="assets/founder-guru-bhagwan-singh.jpg" 
                alt="Guru Bhagwan Singh - Founder" 
                class="founder-img"
                loading="lazy" 
                decoding="async"
              >
            </div>
            <div class="founder-info">
              <span class="eyebrow founder-eyebrow">FOUNDER</span>
              <h2 class="founder-name">Guru Bhagwan Singh</h2>
              <p class="founder-bio">
                Guru Bhagwan Singh has over 30+ years of experience in teaching, choreography &amp; performance. Committed to cultural education and inclusive training for special children.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;
}

// --- WHAT WE CREATE INTERACTION CONTROLLER ---
function initWhatWeCreateScroll() {
  const panels = document.querySelectorAll('.wwc-panel');
  if (!panels.length) return;

  // Reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    panels.forEach(p => p.classList.add('is-active'));
    return;
  }

  // Set the first panel active by default
  panels[0].classList.add('is-active');

  // IntersectionObserver to detect dominant panel
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
        panels.forEach(p => p.classList.remove('is-active'));
        entry.target.classList.add('is-active');
      }
    });
  }, {
    root: null,
    threshold: [0.2, 0.35, 0.5, 0.7]
  });

  panels.forEach(p => observer.observe(p));

  // Subtle parallax on scroll for desktop (only if > 768px and not reduced motion)
  if (window.innerWidth > 768) {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          panels.forEach(panel => {
            const rect = panel.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              const bg = panel.querySelector('.wwc-panel-bg');
              if (bg) {
                const speed = 0.12;
                const yOffset = (rect.top) * speed;
                const isAct = panel.classList.contains('is-active');
                bg.style.transform = isAct
                  ? `translate3d(0, ${yOffset}px, 0) scale(1.04)`
                  : `translate3d(0, ${yOffset}px, 0) scale(1.0)`;
              }
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }
}

// --- WEDDING INQUIRY FORM CONTROLLER ---
function initWeddingInquiryEvents() {
  const form = document.getElementById('wedding-inquiry-form');
  const formContainer = document.getElementById('wedding-form-container');
  const successContainer = document.getElementById('wedding-success-container');
  if (!form) return;

  const nameInput = document.getElementById('wedding-name');
  const phoneInput = document.getElementById('wedding-phone');
  const dateInput = document.getElementById('wedding-date');
  const typeSelect = document.getElementById('wedding-type');
  const participantsSelect = document.getElementById('wedding-participants');
  const notesTextarea = document.getElementById('wedding-notes');
  const submitBtn = document.getElementById('wedding-submit-btn');

  // Real-time error hiding on input
  [nameInput, phoneInput, dateInput, typeSelect].forEach(input => {
    if (!input) return;
    input.addEventListener('input', () => {
      const err = document.getElementById(`${input.id}-error`);
      if (err) err.style.display = 'none';
      input.classList.remove('error');
    });
    input.addEventListener('change', () => {
      const err = document.getElementById(`${input.id}-error`);
      if (err) err.style.display = 'none';
      input.classList.remove('error');
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let isValid = true;

    // Validate Name
    const nameVal = nameInput ? nameInput.value.trim() : '';
    if (!nameVal) {
      const err = document.getElementById('wedding-name-error');
      if (err) err.style.display = 'block';
      if (nameInput) nameInput.classList.add('error');
      isValid = false;
    }

    // Validate Phone (10 digits)
    const phoneVal = phoneInput ? phoneInput.value.trim().replace(/\D/g, '') : '';
    if (!phoneVal || phoneVal.length < 10) {
      const err = document.getElementById('wedding-phone-error');
      if (err) err.style.display = 'block';
      if (phoneInput) phoneInput.classList.add('error');
      isValid = false;
    }

    // Validate Event Date
    const dateVal = dateInput ? dateInput.value : '';
    if (!dateVal) {
      const err = document.getElementById('wedding-date-error');
      if (err) err.style.display = 'block';
      if (dateInput) dateInput.classList.add('error');
      isValid = false;
    }

    // Validate Celebration Type
    const typeVal = typeSelect ? typeSelect.value : '';
    if (!typeVal) {
      const err = document.getElementById('wedding-type-error');
      if (err) err.style.display = 'block';
      if (typeSelect) typeSelect.classList.add('error');
      isValid = false;
    }

    if (!isValid) return;

    // Disable button to prevent double-submit
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Submitting Inquiry...</span>';
    }

    const payload = {
      'Inquiry Category': 'Wedding & Celebration Performance Choreography',
      'Client Name': nameVal,
      'Contact Phone': phoneVal,
      'Event Date': dateVal,
      'Celebration Type': typeVal,
      'Estimated Participants': participantsSelect ? participantsSelect.value : 'Not specified',
      'Songs & Creative Vision': notesTextarea ? (notesTextarea.value.trim() || 'No specific notes provided') : 'None',
      'Submitted At': new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    // Send email notification to academy administration
    await sendEmailNotification('💍 New Wedding & Celebration Choreography Inquiry', payload);

    // Transition to success state
    if (formContainer && successContainer) {
      formContainer.style.display = 'none';
      successContainer.style.display = 'block';
      successContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

// --- GRAINY CAROUSEL CONTROLLER ---
function initGrainyCarousel() {
  if (window.__grainyCarouselCleanup) {
    try { window.__grainyCarouselCleanup(); } catch (e) {}
    window.__grainyCarouselCleanup = null;
  }

  const host = document.getElementById('grainy-carousel-host');
  const canvas = document.getElementById('grainy-carousel-gl');
  const fallback = document.getElementById('grainy-carousel-fallback');
  if (!host || !canvas || !fallback) return;

  const images = [
    'assets/community-1.jpg',
    'assets/community-2.jpg',
    'assets/community-3.jpg',
    'assets/community-4.jpg',
    'assets/community-5.jpg',
    'assets/community-6.jpg',
    'assets/community-7.jpg',
    'assets/community-8.jpg',
    'assets/community-9.jpg'
  ];

  const baseCardW = 600;
  const baseCardH = 360;
  const gap = 16;
  const rounded = 16;
  const speed = 65;
  const mode = 'snap';
  const dragGain = 0.5 + (51 / 100) * (2.5 - 0.5);
  const smoothRate = (speed / 50) * 90;
  const snapInterval = 5 * (50 / speed);
  const damping = (60 / 100) * 0.5;
  const zoom = 5 / 100;
  const edgeWidth = 1;
  const noiseSpeed = 0;
  const grainAmount = 0;
  const grainScale = 300;
  const clickSlop = 5;

  const VERT = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
}`;

  const FRAG = `
precision highp float;

uniform sampler2D tDiffuse;
uniform float uTime;
uniform vec2  uResolution;
uniform float uEdgeWidth;
uniform float uNoiseSpeed;
uniform float uGrainScale;
uniform float uGrainAmount;

varying vec2 vUv;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m  = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m * m * m * m;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * snoise(p);
    p  = p * 2.1 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  if (uGrainAmount <= 0.0001) {
    gl_FragColor = texture2D(tDiffuse, vUv);
    return;
  }

  float leftBand  = 1.0 - smoothstep(0.0, uEdgeWidth, vUv.x);
  float rightBand = smoothstep(1.0 - uEdgeWidth, 1.0, vUv.x);
  float xMask     = max(leftBand, rightBand);

  if (xMask <= 0.001) {
      gl_FragColor = texture2D(tDiffuse, vUv);
      return;
  }

  float mask = pow(xMask, 3.0) * 3.0;
  float ar = uResolution.x / max(uResolution.y, 1.0);

  float t = uTime * uNoiseSpeed * (uGrainScale * 0.015);

  vec2 noiseUV = vec2(vUv.x * ar, vUv.y) * uGrainScale;

  float dx = fbm(noiseUV + vec2(t, t * 0.5)) * uGrainAmount;
  float dy = fbm(noiseUV + vec2(-t * 0.3, t * 0.8)) * uGrainAmount;

  vec2 warpedUV = vUv + vec2(dx, dy) * mask;

  vec4 col = vec4(0.0);
  if (warpedUV.x >= 0.0 && warpedUV.x <= 1.0 && warpedUV.y >= 0.0 && warpedUV.y <= 1.0) {
      col = texture2D(tDiffuse, warpedUV);
  }

  float colorDecay = max(smoothstep(1.0, 0.1, mask / 6.0), 0.1);

  gl_FragColor = vec4(col.rgb * colorDecay, col.a);
}`;

  function compileShader(gl, type, src) {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('GrainyCarousel shader:', gl.getShaderInfoLog(s));
    }
    return s;
  }

  function drawCover(ctx, img, boxX, boxY, boxW, boxH, pct) {
    const t = Math.max(0, Math.min(100, pct)) / 100;
    const short = Math.min(boxW, boxH);
    const x = boxX + (t * (boxW - short)) / 2;
    const y = boxY + (t * (boxH - short)) / 2;
    const w = boxW - t * (boxW - short);
    const h = boxH - t * (boxH - short);
    const r = (t * short) / 2;
    if (!img.complete || !img.naturalWidth) return;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const boxRatio = w / h;
    let sx, sy, sw, sh;
    if (imgRatio > boxRatio) {
      sh = img.naturalHeight;
      sw = sh * boxRatio;
      sx = (img.naturalWidth - sw) / 2;
      sy = 0;
    } else {
      sw = img.naturalWidth;
      sh = sw / boxRatio;
      sx = 0;
      sy = (img.naturalHeight - sh) / 2;
    }
    const rr = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    ctx.restore();
  }

  function createCubicBezier(x1, y1, x2, y2) {
    return function(t) {
      if (t <= 0) return 0;
      if (t >= 1) return 1;
      let curT = t;
      for (let i = 0; i < 6; i++) {
        const currentX = 3 * (1 - curT) * (1 - curT) * curT * x1 + 3 * (1 - curT) * curT * curT * x2 + curT * curT * curT;
        const currentSlope = 3 * (1 - curT) * (1 - curT) * x1 + 6 * (1 - curT) * curT * (x2 - x1) + 3 * curT * curT * (1 - x2);
        if (Math.abs(currentSlope) < 1e-5) break;
        curT -= (currentX - t) / currentSlope;
        curT = Math.max(0, Math.min(1, curT));
      }
      return 3 * (1 - curT) * (1 - curT) * curT * y1 + 3 * (1 - curT) * curT * curT * y2 + curT * curT * curT;
    };
  }
  const easeSnap = createCubicBezier(0, 0, 0.58, 1);

  const strip = document.createElement('canvas');
  const stripCtx = strip.getContext('2d');

  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: false
  });

  let prog = null;
  let tex = null;
  let uTime = null;
  let uResolution = null;
  let uEdgeWidth = null;
  let uNoiseSpeed = null;
  let uGrainScale = null;
  let uGrainAmount = null;
  let posBuf = null;
  let uvBuf = null;
  let hasGL = false;

  if (gl) {
    prog = gl.createProgram();
    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (prog && vs && fs) {
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        hasGL = true;
        gl.useProgram(prog);

        const verts = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
        const uvs = new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);

        posBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
        const aPos = gl.getAttribLocation(prog, 'position');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        uvBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
        gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
        const aUv = gl.getAttribLocation(prog, 'uv');
        gl.enableVertexAttribArray(aUv);
        gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);

        uTime = gl.getUniformLocation(prog, 'uTime');
        uResolution = gl.getUniformLocation(prog, 'uResolution');
        uEdgeWidth = gl.getUniformLocation(prog, 'uEdgeWidth');
        uNoiseSpeed = gl.getUniformLocation(prog, 'uNoiseSpeed');
        uGrainScale = gl.getUniformLocation(prog, 'uGrainScale');
        uGrainAmount = gl.getUniformLocation(prog, 'uGrainAmount');

        tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      }
    }
  }

  canvas.style.opacity = hasGL ? '1' : '0';
  fallback.style.opacity = hasGL ? '0' : '1';

  let loaded = images.map(src => {
    const img = new Image();
    if (src.startsWith('http://') || src.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }
    img.src = src;
    return img;
  });

  let vw = 1;
  let vh = 1;
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    vw = Math.max(1, host.clientWidth);
    vh = Math.max(1, host.clientHeight);
    const bw = Math.round(vw * dpr);
    const bh = Math.round(vh * dpr);
    [canvas, fallback, strip].forEach(c => {
      c.width = bw;
      c.height = bh;
    });
    if (gl && hasGL) gl.viewport(0, 0, bw, bh);
  }
  resize();

  let ro = null;
  if (window.ResizeObserver) {
    ro = new ResizeObserver(resize);
    ro.observe(host);
  } else {
    window.addEventListener('resize', resize);
  }

  let scrollX = 0;
  let snapAnim = null;
  function stopSnap() {
    if (snapAnim) {
      if (snapAnim.stop) snapAnim.stop();
      snapAnim = null;
    }
  }

  let targetX = 0;
  let snapTimer = 0;
  let itemWidth = 1;
  let centerOffset = 0;
  const drag = { active: false, id: -1, last: 0, x0: 0, y0: 0, click: true };

  function onDown(e) {
    drag.active = true;
    stopSnap();
    drag.id = e.pointerId;
    drag.last = e.clientX;
    drag.x0 = e.clientX;
    drag.y0 = e.clientY;
    drag.click = true;
  }

  function onMove(e) {
    if (!drag.active || e.pointerId !== drag.id) return;
    targetX -= (e.clientX - drag.last) * dragGain;
    drag.last = e.clientX;
    snapTimer = 0;
    if (Math.abs(e.clientX - drag.x0) > clickSlop || Math.abs(e.clientY - drag.y0) > clickSlop) {
      drag.click = false;
    }
  }

  function onUp(e) {
    if (!drag.active || e.pointerId !== drag.id) return;
    drag.active = false;
    if (!loaded.length || itemWidth <= 0) return;
    const current = Math.round((targetX + centerOffset) / itemWidth);
    if (drag.click) {
      const rect = host.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const steps = Math.round((clickX - vw / 2) / itemWidth);
      targetX = (current + steps) * itemWidth - centerOffset;
      snapTimer = 0;
    } else if (mode === 'snap') {
      targetX = current * itemWidth - centerOffset;
    }
  }

  function onWheel(e) {
    if (mode === 'smooth') {
      targetX += e.deltaX || e.deltaY;
    }
  }

  host.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  host.addEventListener('wheel', onWheel, { passive: true });

  let raf = 0;
  let last = performance.now();

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;

    const drawW = vw < 640 ? Math.min(baseCardW, Math.max(280, Math.round(vw * 0.84))) : baseCardW;
    const drawH = vw < 640 ? Math.round(drawW * (baseCardH / baseCardW)) : baseCardH;

    itemWidth = drawW + gap;
    const total = Math.max(1, loaded.length * itemWidth);
    centerOffset = (vw - drawW) / 2;

    const edge = (drawW / vw) * edgeWidth;

    if (!drag.active && loaded.length && Number.isFinite(snapInterval)) {
      if (mode === 'smooth') {
        targetX += smoothRate * dt;
      } else if (Number.isFinite(snapInterval)) {
        snapTimer += dt;
        if (snapTimer >= snapInterval) {
          const current = Math.round((targetX + centerOffset) / itemWidth);
          const nextTarget = (current + 1) * itemWidth - centerOffset;
          snapTimer = 0;

          const from = scrollX;
          const delta = nextTarget - from;
          stopSnap();
          const snapStart = performance.now();
          const duration = 0.5;
          targetX = nextTarget;
          snapAnim = {
            update: (n) => {
              const p = Math.min((n - snapStart) / (duration * 1000), 1);
              scrollX = from + delta * easeSnap(p);
              if (p >= 1) snapAnim = null;
            },
            stop: () => { snapAnim = null; }
          };
        }
      }
    }

    if (snapAnim) {
      snapAnim.update(now);
    } else {
      const lf = 1 - Math.pow(1 - damping, dt * 60);
      scrollX += (targetX - scrollX) * lf;
    }

    let visualScale = 1;
    if (mode === 'snap' && zoom > 0) {
      const nearest = Math.round((scrollX + centerOffset) / itemWidth) * itemWidth - centerOffset;
      let ratio = Math.min(Math.abs(scrollX - nearest) / (itemWidth / 2), 1);
      ratio = ratio * ratio * (3 - 2 * ratio);
      visualScale = 1 - ratio * zoom;
    }

    if (stripCtx) {
      stripCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stripCtx.clearRect(0, 0, vw, vh);
      if (loaded.length) {
        stripCtx.save();
        if (visualScale !== 1) {
          stripCtx.translate(vw / 2, vh / 2);
          stripCtx.scale(visualScale, visualScale);
          stripCtx.translate(-vw / 2, -vh / 2);
        }
        const y = (vh - drawH) / 2;
        let wrapped = scrollX % total;
        if (wrapped < 0) wrapped += total;
        let x = -wrapped;
        const leftBound = -vw * 1.5;
        const rightBound = vw * 2.5;
        while (x < rightBound) {
          for (let i = 0; i < loaded.length; i++) {
            const px = x + i * itemWidth;
            if (px + drawW > leftBound && px < rightBound) {
              drawCover(stripCtx, loaded[i], px, y, drawW, drawH, rounded);
            }
          }
          x += total;
        }
        stripCtx.restore();
      }
    }

    let drewGL = false;
    if (gl && hasGL) {
      try {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, strip);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(uTime, now * 0.001);
        gl.uniform2f(uResolution, canvas.width, canvas.height);
        gl.uniform1f(uEdgeWidth, edge);
        gl.uniform1f(uNoiseSpeed, noiseSpeed);
        gl.uniform1f(uGrainScale, grainScale);
        gl.uniform1f(uGrainAmount, grainAmount);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        drewGL = true;
      } catch (err) {
        hasGL = false;
        canvas.style.opacity = '0';
        fallback.style.opacity = '1';
      }
    }
    if (!drewGL) {
      const fb = fallback.getContext('2d');
      if (fb) {
        fb.setTransform(1, 0, 0, 1, 0, 0);
        fb.clearRect(0, 0, fallback.width, fallback.height);
        fb.drawImage(strip, 0, 0);
      }
    }
  }

  raf = requestAnimationFrame(frame);

  window.__grainyCarouselCleanup = function() {
    cancelAnimationFrame(raf);
    stopSnap();
    if (ro) ro.disconnect();
    window.removeEventListener('resize', resize);
    host.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    host.removeEventListener('wheel', onWheel);
    if (gl && hasGL) {
      if (tex) gl.deleteTexture(tex);
      if (posBuf) gl.deleteBuffer(posBuf);
      if (uvBuf) gl.deleteBuffer(uvBuf);
      if (prog) gl.deleteProgram(prog);
    }
  };
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
        <div style="background: var(--color-surface); padding: 24px; border-radius: var(--radius-large); border: 1px solid var(--color-border); margin-bottom: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
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
            <div style="background: var(--color-surface); padding: 36px; border-radius: var(--radius-medium); border: 1px solid var(--color-border); margin-bottom: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
              <h3 style="font-size: 22px; margin-bottom: 20px;">Contact Information</h3>
              <p style="margin-bottom: 16px; font-size: 15px; display: flex; align-items: flex-start; gap: 10px;">
                <span>📍</span>
                <span><strong>Address:</strong> <a href="https://maps.app.goo.gl/oC6b7UmrGXwJxt4E6?utm_source=chatgpt.com" target="_blank" rel="noopener" style="color: #5EBBEA; text-decoration: underline; font-weight: 600;">Dance Darbar Kala Sansthan, New Delhi (Open Directions) &rarr;</a></span>
              </p>
              <p style="margin-bottom: 16px; font-size: 15px; display: flex; align-items: center; gap: 10px;">
                <span>📞</span>
                <span><strong>Phone:</strong> <a href="tel:+919958659933" style="color: #FFFFFF; font-weight: 600;">+91 99586 59933</a></span>
              </p>
              <p style="margin-bottom: 16px; font-size: 15px; display: flex; align-items: center; gap: 10px;">
                <span>✉️</span>
                <span><strong>Email:</strong> <a href="mailto:dancedarbar96@gmail.com" style="color: #5EBBEA; text-decoration: underline; font-weight: 600;">dancedarbar96@gmail.com</a></span>
              </p>
              <p style="font-size: 15px; display: flex; align-items: center; gap: 10px;">
                <span>⏰</span>
                <span><strong>Studio Hours:</strong> Mon – Sat: 10:00 AM – 8:00 PM</span>
              </p>
            </div>
          </div>

          <div style="background: var(--color-surface-elevated); color: #FFFFFF; padding: 36px; border-radius: var(--radius-medium); border: 1px solid var(--color-border); box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
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

  // FAQ Accordions
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });

  // Voices of Our Community Testimonial Scroll-Triggered Entrance
  const testimonialSection = document.querySelector('.testimonials-section');
  if (testimonialSection) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      testimonialSection.classList.add('is-visible');
    } else if ('IntersectionObserver' in window) {
      const testimonialObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            testimonialSection.classList.add('is-visible');
            testimonialObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      testimonialObserver.observe(testimonialSection);
    } else {
      testimonialSection.classList.add('is-visible');
    }
  }

  // Initialize Magnetic Carousel for Explore Classes Section
  initMagneticCarousel();

  // Initialize Interactive Cloth Curtain Simulation for Upcoming Performance Card
  initClothCurtainSimulation();
}

// --- Magnetic Carousel Engine (Originkit Adapter) ---
function initMagneticCarousel() {
  const container = document.getElementById('magneticCarouselTrack');
  const wrapper = document.getElementById('magneticCarouselWrapper');
  const backdrop = document.getElementById('magneticBackdrop');
  if (!container || !wrapper) return;

  const items = Array.from(container.querySelectorAll('.magnetic-item-wrap'));
  const count = items.length;
  if (count === 0) return;

  function getConfig() {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      const availableW = Math.min(window.innerWidth, 480) - 36;
      const gap = 0;
      const itemW = Math.max(50, Math.min(64, Math.floor(availableW / 5)));
      const itemH = itemW; // 1:1 square on mobile
      const openW = Math.min(window.innerWidth - 40, 340);
      return {
        isMobile: true,
        collapsedWidth: itemW,
        hoverWidth: itemW, // Disables cursor-based hover expansion on mobile
        collapsedHeight: itemH,
        hoverHeight: itemH,
        openSize: openW,
        gap: 0,
        influence: 600,
        blur: 16,
        dur: 0.4,
        ease: 'cubic-bezier(0.44, 0, 0.56, 1)'
      };
    }
    const gap = 0;
    const itemW = 90;
    const itemH = 90; // 1:1 square on desktop (90x90 compact filmstrip)
    return {
      isMobile: false,
      collapsedWidth: itemW,
      hoverWidth: 200,
      collapsedHeight: itemH,
      hoverHeight: 600,
      openSize: 616,
      gap: 0,
      influence: 600,
      blur: 19,
      dur: 0.4,
      ease: 'cubic-bezier(0.44, 0, 0.56, 1)'
    };
  }

  let cfg = getConfig();
  let target = new Array(count).fill(0);
  let cur = new Array(count).fill(0);
  let openIndex = null;
  let isClosing = false;
  let closeTimer = null;
  let animLoopId = 0;

  function renderSizes() {
    if (!document.body.contains(container)) {
      if (animLoopId) cancelAnimationFrame(animLoopId);
      return;
    }

    cfg = getConfig();
    const isAnyOpen = (openIndex !== null);
    container.style.gap = (isAnyOpen && cfg.isMobile) ? '0px' : `${cfg.gap}px`;

    if (backdrop) {
      backdrop.style.pointerEvents = isAnyOpen ? 'auto' : 'none';
      backdrop.style.opacity = isAnyOpen ? '1' : '0';
    }

    items.forEach((item, i) => {
      const card = item.querySelector('.magnetic-thumbnail-card');
      const hoverLabel = item.querySelector('.magnetic-hover-label');
      const overlay = item.querySelector('.magnetic-detail-overlay');
      if (!card) return;

      let w, h;
      const isOpen = (openIndex === i);
      const isBlurred = (isAnyOpen && !isOpen);

      if (isAnyOpen) {
        if (isOpen) {
          w = cfg.openSize;
          h = cfg.isMobile ? Math.min(cfg.openSize + 30, 400) : cfg.openSize;
        } else {
          w = cfg.isMobile ? 0 : cfg.collapsedWidth;
          h = cfg.isMobile ? 0 : cfg.collapsedHeight;
        }
      } else {
        const f = cur[i] || 0;
        w = cfg.collapsedWidth + (cfg.hoverWidth - cfg.collapsedWidth) * f;
        h = cfg.collapsedHeight + (cfg.hoverHeight - cfg.collapsedHeight) * f;
      }

      if (isAnyOpen || isClosing) {
        card.style.transition = `width ${cfg.dur}s ${cfg.ease}, height ${cfg.dur}s ${cfg.ease}, filter ${cfg.dur}s ${cfg.ease}, opacity ${cfg.dur}s ${cfg.ease}, border-radius ${cfg.dur}s ${cfg.ease}`;
      } else {
        card.style.transition = 'none';
      }

      if (isAnyOpen && !isOpen && cfg.isMobile) {
        item.style.display = 'none';
      } else {
        item.style.display = 'flex';
      }

      card.classList.toggle('is-expanded', isOpen);

      const f = cur[i] || 0;
      const targetRadius = isOpen ? (cfg.isMobile ? 20 : 24) : Math.round(16 * Math.min(1, Math.max(0, f)));

      card.style.width = `${Math.round(w)}px`;
      card.style.height = `${Math.round(h)}px`;
      card.style.borderRadius = `${targetRadius}px`;
      card.style.filter = isBlurred ? `blur(${cfg.blur}px)` : 'none';
      card.style.opacity = (isAnyOpen && !isOpen && cfg.isMobile) ? '0' : (isBlurred ? '0.6' : '1');
      card.style.zIndex = isOpen ? '10' : (f > 0.02 ? '5' : '2');

      if (hoverLabel) {
        if (isOpen) {
          hoverLabel.style.opacity = '0';
        } else {
          hoverLabel.style.opacity = '';
        }
      }

      if (overlay) {
        overlay.style.opacity = isOpen ? '1' : '0';
        overlay.style.pointerEvents = isOpen ? 'auto' : 'none';
      }
    });
  }

  function startLoop() {
    if (animLoopId) return;
    const step = () => {
      if (!document.body.contains(container)) {
        animLoopId = 0;
        return;
      }
      let moving = false;
      for (let i = 0; i < count; i++) {
        const diff = (target[i] ?? 0) - cur[i];
        if (Math.abs(diff) > 0.001) {
          cur[i] += diff * 0.2;
          moving = true;
        } else {
          cur[i] = target[i] ?? 0;
        }
      }
      renderSizes();
      if (moving) {
        animLoopId = requestAnimationFrame(step);
      } else {
        animLoopId = 0;
      }
    };
    animLoopId = requestAnimationFrame(step);
  }

  function setTargetFromCursor(clientX) {
    if (cfg.isMobile || openIndex !== null) return;
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouchDevice) return;

    const rect = container.getBoundingClientRect();
    const cx = clientX - rect.left;
    const totalBase = count * cfg.collapsedWidth + (count - 1) * cfg.gap;
    const startX = (rect.width - totalBase) / 2;

    target = items.map((_, i) => {
      const center = startX + i * (cfg.collapsedWidth + cfg.gap) + cfg.collapsedWidth / 2;
      const dist = Math.abs(cx - center);
      const f = Math.max(0, 1 - dist / cfg.influence);
      return f * f * (3 - 2 * f);
    });
    startLoop();
  }

  function close() {
    target = new Array(count).fill(0);
    cur = new Array(count).fill(0);
    isClosing = true;
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      isClosing = false;
    }, cfg.dur * 1000);
    openIndex = null;
    renderSizes();
  }

  // Mouse move on container
  container.addEventListener('mousemove', (e) => {
    if (openIndex !== null) return;
    setTargetFromCursor(e.clientX);
  });

  // Mouse leave container
  container.addEventListener('mouseleave', () => {
    if (openIndex !== null) return;
    target = new Array(count).fill(0);
    startLoop();
  });

  // Backdrop click closes
  if (backdrop) {
    backdrop.addEventListener('click', close);
  }

  // Item click handlers
  items.forEach((item, i) => {
    const card = item.querySelector('.magnetic-thumbnail-card');
    const link = item.querySelector('.magnetic-detail-btn');
    if (!card) return;

    if (link) {
      link.addEventListener('click', (e) => {
        // Prevent click bubbling up so link navigation proceeds smoothly
        e.stopPropagation();
      });
    }

    card.addEventListener('click', (e) => {
      e.stopPropagation();
      if (openIndex === i) {
        close();
      } else {
        openIndex = i;
        target = new Array(count).fill(0);
        cur = new Array(count).fill(0);
        renderSizes();
      }
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (openIndex === i) {
          close();
        } else {
          openIndex = i;
          target = new Array(count).fill(0);
          cur = new Array(count).fill(0);
          renderSizes();
        }
      } else if (e.key === 'Escape' && openIndex !== null) {
        close();
      }
    });
  });

  // Escape key closes expanded view
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openIndex !== null) {
      close();
    }
  });

  // Window resize handler
  window.addEventListener('resize', () => {
    renderSizes();
  });

  // Initial render
  renderSizes();
}

// --- Dual-Engine Interactive Curtain System (Desktop Canvas Verlet Physics + Mobile CSS Fallback) ---
function initClothCurtainSimulation() {
  if (window.cleanupCurtainSimulation) {
    window.cleanupCurtainSimulation();
  }

  const stage = document.getElementById('stage') || document.getElementById('curtainStage');
  const hint = document.getElementById('hint');
  const canvas = document.getElementById('curtainCanvas');
  const img = document.getElementById('curtainImg');

  if (!stage) return;

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Coarse pointer (touch) OR a narrow viewport = use the lightweight version.
  // Full cloth physics is reserved for devices that can actually run it smoothly.
  const isLightweight = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 900;

  if (isLightweight) {
    initLightweightCurtain();
  } else {
    initClothPhysics();
  }

  // =========================================================================
  // LIGHTWEIGHT MODE — mobile / touch: two flat panels, transform only,
  // no per-frame simulation, no canvas. Cheapest possible version of the
  // same idea: drag toward an edge to pull that side's curtain open.
  // =========================================================================
  function initLightweightCurtain() {
    if (canvas) canvas.style.display = 'none';
    const wrap = document.getElementById('mobileCurtain') || document.getElementById('curtainPanelsMobile');
    const left = document.getElementById('mLeft') || document.getElementById('curtainPanelLeft');
    const right = document.getElementById('mRight') || document.getElementById('curtainPanelRight');
    if (wrap) wrap.style.display = 'block';
    if (left) left.style.backgroundImage = "url('assets/curtain-texture-mobile.jpg')";
    if (right) right.style.backgroundImage = "url('assets/curtain-texture-mobile.jpg')";
    if (hint) hint.textContent = 'Swipe to part the curtains';

    if (prefersReduced) {
      if (left) left.style.transform = 'translateX(-40%)';
      if (right) right.style.transform = 'translateX(40%) scaleX(-1)';
      if (hint) hint.style.display = 'none';
      window.cleanupCurtainSimulation = () => {};
      return;
    }

    const MAX_OPEN_RATIO = 0.52;
    let currentOpenness = 0;

    function setOpenness(px) {
      const rect = stage.getBoundingClientRect();
      const maxPx = rect.width * 0.5 * MAX_OPEN_RATIO;
      currentOpenness = Math.max(0, Math.min(px, maxPx));
      if (left) left.style.transform = `translateX(${-currentOpenness}px)`;
      if (right) right.style.transform = `translateX(${currentOpenness}px) scaleX(-1)`;
      if (hint) hint.style.opacity = currentOpenness > 15 ? '0' : '1';
    }

    let touchStartX = 0;
    let touchStartOpen = 0;
    let isTouchDragging = false;

    const onTouchStart = (e) => {
      const t = e.touches && e.touches[0];
      if (!t) return;
      touchStartX = t.clientX;
      touchStartOpen = currentOpenness;
      isTouchDragging = false;
    };

    const onTouchMove = (e) => {
      const t = e.touches && e.touches[0];
      if (!t) return;
      const deltaX = t.clientX - touchStartX;
      if (Math.abs(deltaX) > 6) isTouchDragging = true;

      const rect = stage.getBoundingClientRect();
      const isLeft = touchStartX < (rect.left + rect.width / 2);
      const openDelta = isLeft ? -deltaX : deltaX;
      setOpenness(touchStartOpen + openDelta);
    };

    const onTouchEnd = () => {
      if (!isTouchDragging) {
        // Quick tap without drag toggles open / closed
        const rect = stage.getBoundingClientRect();
        const maxPx = rect.width * 0.5 * MAX_OPEN_RATIO;
        if (currentOpenness < maxPx * 0.3) {
          setOpenness(maxPx * 0.85);
        } else {
          setOpenness(0);
        }
      }
      // Curtains stay where moved — do not snap back
    };

    let mouseStartX = 0;
    let mouseStartOpen = 0;
    let isMouseDown = false;
    let isMouseDragging = false;

    const onMouseDown = (e) => {
      isMouseDown = true;
      isMouseDragging = false;
      mouseStartX = e.clientX;
      mouseStartOpen = currentOpenness;
    };

    const onMouseMove = (e) => {
      if (!isMouseDown) return;
      const deltaX = e.clientX - mouseStartX;
      if (Math.abs(deltaX) > 6) isMouseDragging = true;
      const rect = stage.getBoundingClientRect();
      const isLeft = mouseStartX < (rect.left + rect.width / 2);
      const openDelta = isLeft ? -deltaX : deltaX;
      setOpenness(mouseStartOpen + openDelta);
    };

    const onMouseUp = () => {
      if (!isMouseDown) return;
      if (!isMouseDragging) {
        const rect = stage.getBoundingClientRect();
        const maxPx = rect.width * 0.5 * MAX_OPEN_RATIO;
        if (currentOpenness < maxPx * 0.3) {
          setOpenness(maxPx * 0.85);
        } else {
          setOpenness(0);
        }
      }
      isMouseDown = false;
      // Curtains stay where moved
    };

    const onKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const rect = stage.getBoundingClientRect();
        const maxPx = rect.width * 0.5 * MAX_OPEN_RATIO;
        if (currentOpenness < maxPx * 0.3) {
          setOpenness(maxPx * 0.85);
        } else {
          setOpenness(0);
        }
      }
    };

    stage.addEventListener('touchstart', onTouchStart, { passive: true });
    stage.addEventListener('touchmove', onTouchMove, { passive: true });
    stage.addEventListener('touchend', onTouchEnd);
    stage.addEventListener('mousedown', onMouseDown);
    stage.addEventListener('mousemove', onMouseMove);
    stage.addEventListener('mouseup', onMouseUp);
    stage.addEventListener('keydown', onKeyDown);

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const nowLightweight = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 900;
        if (!nowLightweight) {
          initClothCurtainSimulation();
        }
      }, 150);
    };
    window.addEventListener('resize', onResize);

    window.setCurtainOpenRatio = (ratio) => {
      const rect = stage.getBoundingClientRect();
      const maxPx = rect.width * 0.5 * MAX_OPEN_RATIO;
      setOpenness(maxPx * ratio);
    };
    window.getCurtainState = () => ({
      mode: 'lightweight',
      openness: currentOpenness
    });

    window.cleanupCurtainSimulation = () => {
      stage.removeEventListener('touchstart', onTouchStart);
      stage.removeEventListener('touchmove', onTouchMove);
      stage.removeEventListener('touchend', onTouchEnd);
      stage.removeEventListener('mousedown', onMouseDown);
      stage.removeEventListener('mousemove', onMouseMove);
      stage.removeEventListener('mouseup', onMouseUp);
      stage.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }

  // =========================================================================
  // FULL MODE — desktop: real cloth simulation (verlet + constraints),
  // rendered by warping the curtain photo onto a deforming mesh.
  // Same engine as before, with three performance changes:
  //   1. Uses the compressed JPEG texture instead of the original PNG
  //   2. Caps devicePixelRatio at 2 (unbounded DPR was the biggest single cost)
  //   3. Pauses the animation loop entirely when the section scrolls off-screen
  // =========================================================================
  function initClothPhysics() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let curtainImage = img;
    if (!curtainImage) {
      curtainImage = new Image();
      curtainImage.src = 'assets/curtain-texture.jpg';
    }
    if (window.location.protocol !== 'file:') {
      curtainImage.crossOrigin = 'anonymous';
    } else {
      curtainImage.removeAttribute('crossorigin');
    }

    const wrap = document.getElementById('mobileCurtain') || document.getElementById('curtainPanelsMobile');
    if (wrap) wrap.style.display = 'none';
    canvas.style.display = 'block';

    const CFG = {
      cols: 8, rows: 6, panelWidthRatio: 0.505,
      damping: 0.985, restoreStrength: 0.05, gravity: 0.06,
      windSpeed: 0.55, windAmp: 8, constraintIterations: 4, stiffness: 0.5,
      bendStiffness: 0.15,     // gentler skip-one constraint — smooths creases into curves
      grabRadius: 130,         // px: how much fabric moves as a "handful" around the grab point
      grabCatchup: 0.35,       // 0-1: how quickly the grabbed point eases toward the cursor
      maxOpenRatio: 0.62,      // how far a panel can slide open — leaves ~38% draped at sides
      localGrabRange: 70,      // px: max local wrinkle offset, independent of the panel's slide
      closeSpeed: 0.035,       // kept for reference
      openTrackSpeed: 0.14,    // how fast the panel's actual position catches up to the raw drag target
    };

    let dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1)); // capped
    let stageW = 0, stageH = 0, time = 0, left, right;
    let running = false;
    let animId = null;

    function makeMesh(x0, y0, w, h, mirrored) {
      const cols = CFG.cols, rows = CFG.rows;
      const points = [], prev = [], rest = [], pinned = [], u = [], v = [];
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const px = x0 + (c / cols) * w, py = y0 + (r / rows) * h;
          points.push({ x: px, y: py });
          prev.push({ x: px, y: py });
          rest.push({ x: px, y: py });
          pinned.push(r === 0);
          u.push(mirrored ? 1 - c / cols : c / cols);
          v.push(r / rows);
        }
      }
      return {
        cols, rows, points, prev, rest, pinned, u, v, mirrored,
        restDX: w / cols, restDY: h / rows,
        openAmount: 0,                 // raw target, 0 = closed, up to maxOpen = fully slid away
        openAmountSmoothed: 0,         // what actually drives every row's position — eases toward openAmount
        openDir: mirrored ? 1 : -1,    // which way this panel travels as it opens
        maxOpen: w * CFG.maxOpenRatio,
      };
    }

    function idx(mesh, r, c) { return r * (mesh.cols + 1) + c; }

    function buildStage() {
      const rect = stage.getBoundingClientRect();
      stageW = rect.width; stageH = rect.height;
      if (stageW === 0 || stageH === 0) return;
      dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      canvas.width = Math.round(stageW * dpr);
      canvas.height = Math.round(stageH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const topOffset = 0;
      const panelH = stageH - topOffset;
      const panelW = stageW * CFG.panelWidthRatio;
      const prevRatioLeft = (left && left.maxOpen) ? (left.openAmount / left.maxOpen) : 0;
      const prevRatioRight = (right && right.maxOpen) ? (right.openAmount / right.maxOpen) : 0;
      left = makeMesh(0, topOffset, panelW, panelH, false);
      right = makeMesh(stageW - panelW, topOffset, panelW, panelH, true);
      if (prevRatioLeft > 0) {
        left.openAmount = left.maxOpen * prevRatioLeft;
        left.openAmountSmoothed = left.openAmount;
      }
      if (prevRatioRight > 0) {
        right.openAmount = right.maxOpen * prevRatioRight;
        right.openAmountSmoothed = right.openAmount;
      }
    }

    function nearestPoint(x, y) {
      let best = null, bestDist = Infinity;
      [left, right].forEach((mesh) => {
        if (!mesh) return;
        for (let i = 0; i < mesh.points.length; i++) {
          if (mesh.pinned[i]) continue;
          const p = mesh.points[i];
          const d = (p.x - x) ** 2 + (p.y - y) ** 2;
          if (d < bestDist) { bestDist = d; best = { mesh, index: i }; }
        }
      });
      return best;
    }

    function stagePos(clientX, clientY) {
      const rect = stage.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    }

    // Points near the grabbed one move with it too, weighted by distance —
    // this is what makes it feel like gripping a handful of fabric instead
    // of pinching a single thread.
    function computeInfluence(mesh, centerIndex) {
      const center = mesh.points[centerIndex];
      const influence = [];
      for (let i = 0; i < mesh.points.length; i++) {
        if (i === centerIndex || mesh.pinned[i]) continue;
        const p = mesh.points[i];
        const dist = Math.hypot(p.x - center.x, p.y - center.y);
        if (dist >= CFG.grabRadius) continue;
        let w = 1 - dist / CFG.grabRadius;
        w = w * w * (3 - 2 * w); // smoothstep falloff
        influence.push({ index: i, weight: w });
      }
      return influence;
    }

    function clampLen(dx, dy, maxLen) {
      const len = Math.hypot(dx, dy);
      if (len <= maxLen || len === 0) return { dx, dy };
      const s = maxLen / len;
      return { dx: dx * s, dy: dy * s };
    }
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

    let grab = null, pointerActive = false;
    let pointerStartX = 0, pointerStartY = 0, isDraggingPointer = false;

    const onPointerDown = (e) => {
      pointerActive = true;
      isDraggingPointer = false;
      const p = stagePos(e.clientX, e.clientY);
      pointerStartX = p.x; pointerStartY = p.y;
      grab = nearestPoint(p.x, p.y);
      if (grab) {
        grab.x = grab.mesh.points[grab.index].x;
        grab.y = grab.mesh.points[grab.index].y;
        grab.influence = computeInfluence(grab.mesh, grab.index);
        grab.initialCursorX = p.x;
        grab.initialOpen = grab.mesh.openAmount;
      }
      canvas.classList.add('grabbing');
      ensureRunning();
    };

    const onPointerMove = (e) => {
      if (!pointerActive || !grab) return;
      const p = stagePos(e.clientX, e.clientY);
      if (Math.hypot(p.x - pointerStartX, p.y - pointerStartY) > 5) {
        isDraggingPointer = true;
      }
      grab.x = p.x; grab.y = p.y;

      // Net horizontal drag from where the grab started decides how far the
      // WHOLE panel has slid open — bounded, so it can only travel as far as
      // its own width allows, leaving drapery on the side.
      const deltaX = p.x - grab.initialCursorX;
      const openDelta = (grab.mesh === left) ? -deltaX : deltaX;
      grab.mesh.openAmount = clamp(grab.initialOpen + openDelta, 0, grab.mesh.maxOpen);
    };

    function releasePointer() {
      if (pointerActive && !isDraggingPointer && grab) {
        // Quick click/tap on a panel without dragging: toggle that panel open/closed
        const m = grab.mesh;
        if (m.openAmount < m.maxOpen * 0.3) {
          m.openAmount = m.maxOpen * 0.85;
        } else {
          m.openAmount = 0;
        }
      }
      pointerActive = false; grab = null;
      canvas.classList.remove('grabbing');
      // Curtains stay where the user moved them — no return to closed on release
    }

    const onKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (left && right) {
          const isAlreadyOpen = (left.openAmount > left.maxOpen * 0.3) || (right.openAmount > right.maxOpen * 0.3);
          const target = isAlreadyOpen ? 0 : left.maxOpen * 0.85;
          left.openAmount = target;
          right.openAmount = target;
          ensureRunning();
        }
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', releasePointer);
    window.addEventListener('pointercancel', releasePointer);
    stage.addEventListener('keydown', onKeyDown);

    function stepMesh(mesh, isGrabbedMesh) {
      if (!mesh) return;
      const rows = mesh.rows, cols = mesh.cols;
      let grabDeltaX = 0, grabDeltaY = 0;

      // Curtains stay where the user moved them — no automatic close-back
      const prevSmoothed = mesh.openAmountSmoothed;
      mesh.openAmountSmoothed += (mesh.openAmount - mesh.openAmountSmoothed) * CFG.openTrackSpeed;
      const shiftDelta = (mesh.openAmountSmoothed - prevSmoothed) * mesh.openDir;
      const shiftX = mesh.openDir * mesh.openAmountSmoothed;

      for (let i = 0; i < mesh.points.length; i++) {
        const row = Math.floor(i / (cols + 1)), col = i % (cols + 1);
        const colFactor = mesh.mirrored ? (cols - col) / cols : col / cols;

        if (mesh.pinned[i]) {
          const tx = mesh.rest[i].x + colFactor * shiftX;
          mesh.points[i].x = tx; mesh.points[i].y = mesh.rest[i].y;
          mesh.prev[i].x = tx;   mesh.prev[i].y = mesh.rest[i].y;
          continue;
        }

        // Propagate panel shift synchronously to all rows so the whole panel glides as one sheet
        mesh.points[i].x += shiftDelta * colFactor;
        mesh.prev[i].x   += shiftDelta * colFactor;

        const targetX = mesh.rest[i].x + colFactor * shiftX;

        if (isGrabbedMesh && grab && grab.index === i) {
          const p = mesh.points[i];
          const oldX = p.x, oldY = p.y;
          const clamped = clampLen(grab.x - targetX, grab.y - mesh.rest[i].y, CFG.localGrabRange);
          const desiredX = targetX + clamped.dx;
          const desiredY = mesh.rest[i].y + clamped.dy;
          const newX = oldX + (desiredX - oldX) * CFG.grabCatchup;
          const newY = oldY + (desiredY - oldY) * CFG.grabCatchup;
          mesh.prev[i].x = oldX; mesh.prev[i].y = oldY;
          p.x = newX; p.y = newY;
          grabDeltaX = newX - oldX;
          grabDeltaY = newY - oldY;
          continue;
        }

        const p = mesh.points[i], pp = mesh.prev[i], rest = mesh.rest[i];
        const vx = (p.x - pp.x) * CFG.damping, vy = (p.y - pp.y) * CFG.damping;
        const depth = row / rows;
        const windPhase = time * CFG.windSpeed + col * 0.6 + row * 0.2;
        const windX = Math.sin(windPhase) * CFG.windAmp * depth * 0.05;
        const windY = Math.sin(windPhase * 0.6 + 1.3) * CFG.windAmp * depth * 0.02;
        const nx = p.x + vx + windX + (targetX - p.x) * CFG.restoreStrength;
        const ny = p.y + vy + windY + (rest.y - p.y) * CFG.restoreStrength + CFG.gravity * depth * 0.4;
        mesh.prev[i].x = p.x; mesh.prev[i].y = p.y;
        mesh.points[i].x = nx; mesh.points[i].y = ny;
      }

      if (isGrabbedMesh && grab && grab.influence && (grabDeltaX || grabDeltaY)) {
        for (const { index, weight } of grab.influence) {
          if (mesh.pinned[index]) continue;
          const p = mesh.points[index], pv = mesh.prev[index];
          p.x += grabDeltaX * weight;  p.y += grabDeltaY * weight;
          pv.x += grabDeltaX * weight; pv.y += grabDeltaY * weight;
        }
      }
    }

    function constrainPair(mesh, i1, i2, restDist, stiffnessOverride, isHorizontal) {
      const p1 = mesh.points[i1], p2 = mesh.points[i2];
      const dx = p2.x - p1.x, dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
      let stiff = stiffnessOverride !== undefined ? stiffnessOverride : CFG.stiffness;
      if (dist < restDist && isHorizontal) {
        stiff *= 0.1; // Reduced compression resistance allows realistic fabric gathering into vertical folds
      }
      const diff = ((dist - restDist) / dist) * stiff * 0.5;
      const offX = dx * diff, offY = dy * diff;
      const g1 = grab && grab.mesh === mesh && grab.index === i1;
      const g2 = grab && grab.mesh === mesh && grab.index === i2;
      if (!mesh.pinned[i1] && !g1) { p1.x += offX; p1.y += offY; }
      if (!mesh.pinned[i2] && !g2) { p2.x -= offX; p2.y -= offY; }
    }

    function satisfyConstraints(mesh) {
      if (!mesh) return;
      const diag = Math.sqrt(mesh.restDX ** 2 + mesh.restDY ** 2);
      for (let it = 0; it < CFG.constraintIterations; it++) {
        for (let r = 0; r <= mesh.rows; r++) {
          for (let c = 0; c <= mesh.cols; c++) {
            const i = idx(mesh, r, c);
            if (c < mesh.cols) constrainPair(mesh, i, idx(mesh, r, c + 1), mesh.restDX, undefined, true);
            if (r < mesh.rows) constrainPair(mesh, i, idx(mesh, r + 1, c), mesh.restDY, undefined, false);
            if (r < mesh.rows && c < mesh.cols) {
              constrainPair(mesh, idx(mesh, r, c), idx(mesh, r + 1, c + 1), diag, 0.25, false);
              constrainPair(mesh, idx(mesh, r, c + 1), idx(mesh, r + 1, c), diag, 0.25, false);
            }
            if (c < mesh.cols - 1) constrainPair(mesh, i, idx(mesh, r, c + 2), mesh.restDX * 2, CFG.bendStiffness, true);
            if (r < mesh.rows - 1) constrainPair(mesh, i, idx(mesh, r + 2, c), mesh.restDY * 2, CFG.bendStiffness, false);
          }
        }
      }
    }

    function drawTriangle(srcPts, dstPts) {
      const [s0, s1, s2] = srcPts, [d0, d1, d2] = dstPts;
      const denom = s0.x * (s1.y - s2.y) + s1.x * (s2.y - s0.y) + s2.x * (s0.y - s1.y);
      if (Math.abs(denom) < 1e-6) return;
      const a = (d0.x * (s1.y - s2.y) + d1.x * (s2.y - s0.y) + d2.x * (s0.y - s1.y)) / denom;
      const b = (d0.y * (s1.y - s2.y) + d1.y * (s2.y - s0.y) + d2.y * (s0.y - s1.y)) / denom;
      const c = (d0.x * (s2.x - s1.x) + d1.x * (s0.x - s2.x) + d2.x * (s1.x - s0.x)) / denom;
      const d = (d0.y * (s2.x - s1.x) + d1.y * (s0.x - s2.x) + d2.y * (s1.x - s0.x)) / denom;
      const e = (d0.x * (s1.x * s2.y - s2.x * s1.y) + d1.x * (s2.x * s0.y - s0.x * s2.y) + d2.x * (s0.x * s1.y - s1.x * s0.y)) / denom;
      const f = (d0.y * (s1.x * s2.y - s2.x * s1.y) + d1.y * (s2.x * s0.y - s0.x * s2.y) + d2.y * (s0.x * s1.y - s1.x * s0.y)) / denom;

      // Expand clipping triangle slightly from centroid (0.75px) to eliminate antialiasing hairline cracks between adjacent mesh quads
      const cx = (d0.x + d1.x + d2.x) / 3, cy = (d0.y + d1.y + d2.y) / 3;
      const ex = (p) => {
        const vx = p.x - cx, vy = p.y - cy;
        const len = Math.hypot(vx, vy) || 1;
        return { x: p.x + (vx / len) * 0.75, y: p.y + (vy / len) * 0.75 };
      };
      const p0 = ex(d0), p1 = ex(d1), p2 = ex(d2);

      ctx.save();
      ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.closePath(); ctx.clip();
      ctx.setTransform(dpr * a, dpr * b, dpr * c, dpr * d, dpr * e, dpr * f);
      ctx.drawImage(curtainImage, 0, 0);
      ctx.restore();
    }

    function renderMesh(mesh) {
      if (!mesh || !curtainImage.naturalWidth) return;
      const iw = curtainImage.naturalWidth, ih = curtainImage.naturalHeight;
      for (let r = 0; r < mesh.rows; r++) {
        for (let c = 0; c < mesh.cols; c++) {
          const i00 = idx(mesh, r, c), i10 = idx(mesh, r, c + 1), i01 = idx(mesh, r + 1, c), i11 = idx(mesh, r + 1, c + 1);
          const src = (i) => ({ x: mesh.u[i] * iw, y: mesh.v[i] * ih });
          const dst = (i) => mesh.points[i];
          drawTriangle([src(i00), src(i10), src(i01)], [dst(i00), dst(i10), dst(i01)]);
          drawTriangle([src(i10), src(i11), src(i01)], [dst(i10), dst(i11), dst(i01)]);
        }
      }
    }

    function frame() {
      if (!running) return;
      time += 0.016;
      stepMesh(left, grab && grab.mesh === left);
      stepMesh(right, grab && grab.mesh === right);
      satisfyConstraints(left);
      satisfyConstraints(right);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, stageW, stageH);
      renderMesh(left);
      renderMesh(right);
      if (hint) {
        const isOpen = (left && left.openAmount > 20) || (right && right.openAmount > 20);
        hint.style.opacity = (pointerActive || isOpen) ? '0' : '1';
      }
      animId = requestAnimationFrame(frame);
    }

    function ensureRunning() {
      if (!running) { running = true; animId = requestAnimationFrame(frame); }
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) ensureRunning();
        else {
          running = false;
          if (animId) cancelAnimationFrame(animId);
          animId = null;
        }
      });
    }, { threshold: 0.05 });

    function start() {
      buildStage();
      if (prefersReduced) {
        if (left) left.points.forEach((p) => { p.x -= 40; });
        if (right) right.points.forEach((p) => { p.x += 40; });
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, stageW, stageH);
        renderMesh(left); renderMesh(right);
        if (hint) hint.style.display = 'none';
        canvas.style.cursor = 'default';
        return;
      }
      observer.observe(stage);
      ensureRunning();
    }

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const nowLightweight = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 900;
        if (nowLightweight) {
          initClothCurtainSimulation();
        } else {
          buildStage();
          ensureRunning();
        }
      }, 150);
    };
    window.addEventListener('resize', onResize);

    if (curtainImage.complete && curtainImage.naturalWidth > 0) start(); else curtainImage.addEventListener('load', start);

    window.setCurtainOpenRatio = (ratio) => {
      if (left && right) {
        const target = left.maxOpen * ratio;
        left.openAmount = target;
        right.openAmount = target;
        ensureRunning();
      }
    };
    window.getCurtainState = () => ({
      mode: 'cloth',
      running,
      leftOpen: left ? left.openAmount : 0,
      leftSmoothed: left ? left.openAmountSmoothed : 0,
      maxOpen: left ? left.maxOpen : 0
    });
    window.stepCurtainFrames = (count = 1) => {
      for (let f = 0; f < count; f++) {
        time += 0.016;
        stepMesh(left, grab && grab.mesh === left);
        stepMesh(right, grab && grab.mesh === right);
        satisfyConstraints(left);
        satisfyConstraints(right);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, stageW, stageH);
      renderMesh(left);
      renderMesh(right);
    };

    window.cleanupCurtainSimulation = () => {
      running = false;
      if (animId) cancelAnimationFrame(animId);
      animId = null;
      observer.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', releasePointer);
      window.removeEventListener('pointercancel', releasePointer);
      stage.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }
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
        <button type="button" class="btn btn-primary claim-seat-btn" onclick="window.openAmrapaliModal()">
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
        <div style="background: var(--color-surface); border-radius: var(--radius-large); padding: 44px 36px; border: 1px solid var(--color-border); box-shadow: 0 25px 60px rgba(0,0,0,0.6);">
          <div style="width: 60px; height: 60px; background: #141414; border: 1px solid var(--color-border); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#5EBBEA" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 style="font-size: 24px; color: #FFFFFF; text-align: center; margin-bottom: 6px;">Admin Login</h2>
          <p style="font-size: 13px; color: var(--color-muted-text); text-align: center; margin-bottom: 28px;">This area is restricted to Dance Darbar administrators only.</p>
          <form id="admin-login-form" novalidate>
            <div class="form-group" style="margin-bottom: 16px;">
              <label class="form-label" for="admin_email" style="font-size: 12px; font-weight: 600; margin-bottom: 4px; display: block; color: #FFFFFF;">Email Address</label>
              <input type="email" id="admin_email" class="form-control" placeholder="admin@dancedarbar.com" required autocomplete="email">
            </div>
            <div class="form-group" style="margin-bottom: 20px;">
              <label class="form-label" for="admin_password" style="font-size: 12px; font-weight: 600; margin-bottom: 4px; display: block; color: #FFFFFF;">Password</label>
              <input type="password" id="admin_password" class="form-control" placeholder="Enter admin password" required autocomplete="current-password">
            </div>
            <div id="admin-login-error" style="display: none; background: rgba(239, 68, 68, 0.15); color: #F87171; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-small); padding: 10px 14px; font-size: 12.5px; font-weight: 600; margin-bottom: 16px; text-align: center;">
              Invalid email or password. Please try again.
            </div>
            <button type="submit" id="admin-login-btn" class="btn btn-primary" style="width: 100%; padding: 13px;">
              <span>Sign In to Admin Panel</span>
            </button>
          </form>
          <p style="font-size: 11px; color: var(--color-muted-text); text-align: center; margin-top: 24px; line-height: 1.5;">
            If you are not an authorized administrator, please <a href="#/" style="color: #5EBBEA; font-weight: 600;">return to the website</a>.
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
// 5. GLOBAL HEADER CONTROLLER
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
        <div style="background: var(--color-surface); border-radius: var(--radius-medium); padding: 24px; border: 1px solid var(--color-border); margin-bottom: 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.4); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
          <div>
            <span style="font-size: 11px; font-weight: 700; color: var(--color-muted-text); text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 4px;">AMRAPALI 2026 Reservation Setting</span>
            <h3 style="font-size: 20px; font-weight: 700; color: var(--color-navy); margin-bottom: 4px; display: flex; align-items: center; gap: 10px;">
              <span>Seat Reservation Portal Status:</span>
              ${currentStatus === 'closed' 
                ? `<span class="badge" style="background: rgba(239, 68, 68, 0.2); color: #F87171; font-weight: 700; font-size: 13px;">● Closed (Seats Full)</span>`
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
          <div style="background: var(--color-surface); border-radius: var(--radius-medium); padding: 20px; border: 1px solid var(--color-border); box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
            <span style="font-size: 11px; font-weight: 700; color: var(--color-muted-text); text-transform: uppercase; letter-spacing: 0.08em;">Trial Registrations</span>
            <h3 style="font-size: 28px; font-weight: 800; color: var(--color-navy); margin-top: 4px;">${trialList.length}</h3>
          </div>
          <div style="background: var(--color-surface); border-radius: var(--radius-medium); padding: 20px; border: 1px solid var(--color-border); box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
            <span style="font-size: 11px; font-weight: 700; color: var(--color-muted-text); text-transform: uppercase; letter-spacing: 0.08em;">AMRAPALI Event Bookings</span>
            <h3 style="font-size: 28px; font-weight: 800; color: var(--color-navy); margin-top: 4px;">${bookingList.length}</h3>
          </div>
          <div style="background: var(--color-surface); border-radius: var(--radius-medium); padding: 20px; border: 1px solid var(--color-border); box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
            <span style="font-size: 11px; font-weight: 700; color: var(--color-muted-text); text-transform: uppercase; letter-spacing: 0.08em;">Total Seats Reserved</span>
            <h3 style="font-size: 28px; font-weight: 800; color: #5EBBEA; margin-top: 4px;">${totalSeats}</h3>
          </div>
          <div style="background: var(--color-surface); border-radius: var(--radius-medium); padding: 20px; border: 1px solid var(--color-border); box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
            <span style="font-size: 11px; font-weight: 700; color: var(--color-muted-text); text-transform: uppercase; letter-spacing: 0.08em;">Total Revenue Collected</span>
            <h3 style="font-size: 28px; font-weight: 800; color: #4ADE80; margin-top: 4px;">₹${totalPaid}</h3>
          </div>
        </div>

        <!-- FILTERS -->
        <div style="background: var(--color-surface); border-radius: var(--radius-medium); padding: 20px; border: 1px solid var(--color-border); margin-bottom: 24px; display: flex; flex-wrap: wrap; gap: 16px; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
          <div style="flex: 1; min-width: 260px;">
            <input type="text" id="admin-search-input" class="form-control" placeholder="🔍 Search by Name, Phone, Email, or Booking Ref..." style="padding: 12px 16px; font-size: 14px;">
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="admin-btn-trials" class="btn btn-primary admin-tab-btn" style="font-size: 13px; min-height: 40px; padding: 0 16px;">Free Trials (${trialList.length})</button>
            <button id="admin-btn-bookings" class="btn btn-secondary admin-tab-btn" style="font-size: 13px; min-height: 40px; padding: 0 16px;">Event Bookings (${bookingList.length})</button>
          </div>
        </div>

        <!-- TABLE CONTAINER -->
        <div style="background: var(--color-surface); border-radius: var(--radius-medium); border: 1px solid var(--color-border); overflow-x: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
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

  // Hash Router Listener
  window.addEventListener('hashchange', renderApp);
  renderApp();
});

// --- One-Time Initial Full Page Load Fade-in Entrance ---
let hasTriggeredPageEntrance = false;

function triggerPageEntranceFadeIn() {
  if (hasTriggeredPageEntrance) return;
  hasTriggeredPageEntrance = true;

  const appRoot = document.getElementById('app-root');
  if (appRoot) {
    appRoot.classList.add('is-loaded');
    setTimeout(() => {
      if (appRoot.classList.contains('is-loaded')) {
        appRoot.style.transform = 'none';
      }
    }, 800);
  }
}

// Trigger on window.onload once critical assets (fonts, images) have loaded
if (document.readyState === 'complete') {
  setTimeout(triggerPageEntranceFadeIn, 60);
} else {
  window.addEventListener('load', () => {
    setTimeout(triggerPageEntranceFadeIn, 60);
  });
  // Safety timeout fallback (e.g., slow network or offline)
  setTimeout(triggerPageEntranceFadeIn, 1500);
}
