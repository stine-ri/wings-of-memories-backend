// backend/utils/pdfTemplate.ts - ELEGANT & SOPHISTICATED MEMORIAL BOOKLET
export function generateMemorialHTML(memorialData: any): string {
  const {
    name = 'Memorial',
    profileImage,
    birthDate,
    deathDate,
    location,
    obituary,
    timeline = [],
    favorites = [],
    familyTree = [],
    gallery = [],
    memoryWall = [],
    tributes = memoryWall,
    service = {}
  } = memorialData;

  // Format dates nicely
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Calculate age if both dates available
  const calculateAge = () => {
    if (!birthDate || !deathDate) return '';
    try {
      const birth = new Date(birthDate);
      const death = new Date(deathDate);
      const age = death.getFullYear() - birth.getFullYear();
      return age > 0 ? `${age} years` : '';
    } catch {
      return '';
    }
  };
  
console.log('🖼️ PDF GALLERY DATA DEBUG:');
console.log('Gallery array length:', gallery.length);
if (gallery.length > 0) {
  console.log('First image object:', gallery[0]);
  console.log('First image has caption?', !!gallery[0].caption);
  console.log('First image has description?', !!gallery[0].description);
  console.log('First image caption value:', gallery[0].caption);
  console.log('First image description value:', gallery[0].description);
}
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>In Loving Memory of ${name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Montserrat:wght@300;400;500;600&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 1cm;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Cormorant Garamond', serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      background: linear-gradient(135deg, #fdfbf7 0%, #f5ede3 50%, #fdfbf7 100%);
      line-height: 1.8;
      color: #3a3a3a;
      font-size: 15px;
    }

    /* Elegant, sophisticated color scheme */
    :root {
      --gold: #d4af37;
      --deep-blue: #1a2332;
      --rose-gold: #e6c3a1;
      --cream: #fdfbf7;
      --warm-cream: #f5ede3;
      --soft-text: #5a5a5a;
      --border-gold: #c4a747;
      --accent-blue: #4a6fa5;
      --light-shadow: rgba(0, 0, 0, 0.1);
    }

    /* Page breaks and layout */
    .page-break {
      page-break-after: always;
      break-after: page;
    }

    .avoid-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .section-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--gold), transparent);
      margin: 3rem 0;
      opacity: 0.6;
      position: relative;
    }

    .section-divider::after {
      content: '◆';
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      background: var(--cream);
      padding: 0 1rem;
      color: var(--gold);
      font-size: 1rem;
    }

    /* COVER PAGE - Elegant and prestigious */
    .cover-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #1a2332 0%, #2c3e50 50%, #1a2332 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 4rem 2rem;
      position: relative;
      overflow: hidden;
    }

    .cover-page::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 30%, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(230, 195, 161, 0.08) 0%, transparent 50%);
      animation: pulse 8s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 0.8; }
    }

    /* Decorative corners */
    .cover-page::after {
      content: '';
      position: absolute;
      top: 2rem;
      left: 2rem;
      right: 2rem;
      bottom: 2rem;
      border: 2px solid var(--gold);
      border-radius: 8px;
      opacity: 0.3;
      pointer-events: none;
    }

    .memorial-title {
      font-family: 'Cinzel', serif;
      font-size: 1.3rem;
      color: var(--gold);
      letter-spacing: 0.3em;
      text-transform: uppercase;
      margin-bottom: 2rem;
      font-weight: 400;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      position: relative;
      z-index: 1;
    }

    .cover-name {
      font-family: 'Cinzel', serif;
      font-size: 3.8rem;
      font-weight: 600;
      color: var(--cream);
      margin: 2rem 0;
      line-height: 1.2;
      position: relative;
      z-index: 1;
      text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      letter-spacing: 0.02em;
    }

    .ornamental-divider {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin: 2rem 0;
      color: var(--gold);
      font-size: 1.5rem;
      opacity: 0.8;
    }

    .ornamental-line {
      width: 80px;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--gold), transparent);
    }

    .cover-dates {
      font-size: 1.5rem;
      color: var(--rose-gold);
      font-style: italic;
      margin-bottom: 0.5rem;
      font-family: 'Cormorant Garamond', serif;
      font-weight: 500;
      position: relative;
      z-index: 1;
    }

    .cover-age {
      font-size: 1.1rem;
      color: var(--rose-gold);
      font-style: italic;
      margin-bottom: 1.5rem;
      opacity: 0.9;
      position: relative;
      z-index: 1;
    }

    .cover-location {
      font-size: 1.1rem;
      color: var(--rose-gold);
      margin-bottom: 3rem;
      font-family: 'Montserrat', sans-serif;
      font-weight: 300;
      letter-spacing: 0.05em;
      position: relative;
      z-index: 1;
    }

    .cover-quote {
      font-size: 1.15rem;
      color: var(--cream);
      font-style: italic;
      max-width: 500px;
      margin: 3rem auto 0;
      line-height: 2;
      font-family: 'Cormorant Garamond', serif;
      padding: 2.5rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(212, 175, 55, 0.2);
      backdrop-filter: blur(10px);
      position: relative;
      z-index: 1;
    }

    /* CONTENT PAGES */
    .content-page {
      padding: 3rem 0;
    }

    .section-header {
      text-align: center;
      margin-bottom: 3.5rem;
    }

    .section-title {
      font-family: 'Cinzel', serif;
      font-size: 2.8rem;
      font-weight: 600;
      color: var(--deep-blue);
      margin-bottom: 1.5rem;
      position: relative;
      display: inline-block;
      letter-spacing: 0.05em;
    }

    .section-title::after {
      content: '';
      position: absolute;
      bottom: -1rem;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 3px;
      background: linear-gradient(90deg, transparent, var(--gold), transparent);
    }

    .section-title::before {
      content: '◆';
      position: absolute;
      bottom: -1.7rem;
      left: 50%;
      transform: translateX(-50%);
      color: var(--gold);
      font-size: 0.8rem;
    }

    .section-subtitle {
      font-size: 1.2rem;
      color: var(--soft-text);
      font-style: italic;
      margin-top: 2rem;
      font-weight: 400;
      letter-spacing: 0.02em;
      font-family: 'Cormorant Garamond', serif;
    }

    /* PROFILE SECTION */
    .profile-section {
      text-align: center;
      max-width: 650px;
      margin: 0 auto;
    }

    .profile-image-container {
      margin-bottom: 2.5rem;
      position: relative;
    }

    .profile-image {
      width: 220px;
      height: 220px;
      border-radius: 50%;
      object-fit: cover;
      border: 8px solid white;
      box-shadow: 
        0 12px 40px rgba(0, 0, 0, 0.15),
        0 0 0 2px var(--gold);
      position: relative;
    }

    .profile-image-container::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 250px;
      height: 250px;
      border-radius: 50%;
      border: 1px solid var(--gold);
      opacity: 0.3;
    }

    .profile-placeholder {
      width: 220px;
      height: 220px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--warm-cream), #e8dfd6);
      border: 8px solid white;
      box-shadow: 
        0 12px 40px rgba(0, 0, 0, 0.15),
        0 0 0 2px var(--gold);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
    }

    .profile-icon {
      width: 80px;
      height: 80px;
      color: var(--gold);
      opacity: 0.5;
    }

    .profile-name {
      font-family: 'Cinzel', serif;
      font-size: 2.6rem;
      font-weight: 600;
      color: var(--deep-blue);
      margin-bottom: 1.2rem;
      letter-spacing: 0.02em;
    }

    .profile-dates {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.4rem;
      color: var(--soft-text);
      font-style: italic;
      margin-bottom: 0.8rem;
      font-weight: 500;
    }

    .profile-location {
      font-size: 1.1rem;
      color: var(--soft-text);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      font-family: 'Montserrat', sans-serif;
      font-weight: 400;
    }

    /* OBITUARY SECTION */
    .obituary-section {
      max-width: 750px;
      margin: 0 auto;
      position: relative;
    }

    .obituary-section::before {
      content: '';
      position: absolute;
      top: -2rem;
      right: -2rem;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(212, 175, 55, 0.08), transparent);
      border-radius: 50%;
      z-index: 0;
    }

    .obituary-content {
      font-size: 1.15rem;
      line-height: 2;
      color: #3a3a3a;
      text-align: justify;
      background: white;
      padding: 3rem 3.5rem;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      border-top: 4px solid var(--gold);
      position: relative;
      z-index: 1;
    }

    .obituary-content p {
      margin-bottom: 1.8rem;
    }

    .obituary-content p:first-of-type::first-letter {
      font-size: 4.5rem;
      font-weight: 600;
      float: left;
      line-height: 0.8;
      margin: 0.1rem 0.8rem 0 0;
      color: var(--gold);
      font-family: 'Cinzel', serif;
    }

    /* TIMELINE SECTION */
    .timeline-section {
      max-width: 850px;
      margin: 0 auto;
    }

    .timeline {
      position: relative;
      padding-left: 4rem;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 2rem;
      top: 0;
      bottom: 0;
      width: 3px;
      background: linear-gradient(to bottom, var(--gold), var(--rose-gold), var(--gold));
      opacity: 0.5;
    }

    .timeline-item {
      position: relative;
      margin-bottom: 3rem;
      padding-left: 2.5rem;
    }

    .timeline-marker {
      position: absolute;
      left: -3.2rem;
      top: 0;
      width: 4rem;
      height: 4rem;
      background: linear-gradient(135deg, var(--gold), var(--rose-gold));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 0.95rem;
      box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
      border: 4px solid white;
      font-family: 'Montserrat', sans-serif;
    }

    .timeline-content {
      background: white;
      padding: 2.5rem;
      border-radius: 16px;
      box-shadow: 0 6px 28px rgba(0, 0, 0, 0.08);
      border-left: 4px solid var(--gold);
    }

    .timeline-year {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--gold);
      margin-bottom: 0.8rem;
      font-family: 'Montserrat', sans-serif;
      letter-spacing: 0.05em;
    }

    .timeline-title {
      font-family: 'Cinzel', serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--deep-blue);
      margin-bottom: 1.2rem;
      letter-spacing: 0.01em;
    }

    .timeline-description {
      color: #3a3a3a;
      line-height: 1.9;
      margin-bottom: 1.2rem;
      font-size: 1.05rem;
    }

    .timeline-location {
      color: var(--soft-text);
      font-size: 1rem;
      font-style: italic;
    }

    /* FAVORITES SECTION */
    .favorites-section {
      max-width: 850px;
      margin: 0 auto;
    }

    .favorites-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .favorite-card {
      background: linear-gradient(135deg, white, #fdfbf7);
      padding: 2.5rem;
      border-radius: 16px;
      box-shadow: 0 6px 28px rgba(0, 0, 0, 0.08);
      border-top: 4px solid var(--gold);
      text-align: center;
      transition: transform 0.2s;
    }

    .favorite-icon {
      font-size: 3.5rem;
      margin-bottom: 1.5rem;
      height: 4rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--gold); 
    }

    .favorite-icon svg {
     width: 56px;
     height: 56px;
     color: inherit;
     opacity: 0.85;
     filter: drop-shadow(0 4px 8px rgba(212, 175, 55, 0.2));
    }

    .favorite-category {
      font-family: 'Cinzel', serif;
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--deep-blue);
      margin-bottom: 1.2rem;
      text-transform: capitalize;
      letter-spacing: 0.02em;
    }

    .favorite-text {
      color: #3a3a3a;
      line-height: 1.8;
      font-style: italic;
      font-size: 1.05rem;
    }

    /* FAMILY SECTION */
    .family-section {
      max-width: 850px;
      margin: 0 auto;
    }

    .family-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 2rem;
    }

    .family-member {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 6px 28px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      gap: 1.5rem;
      border-left: 3px solid var(--gold);
    }

    .family-image {
      width: 75px;
      height: 75px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--gold);
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);
    }

    .family-placeholder {
      width: 75px;
      height: 75px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--warm-cream), #e8dfd6);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid var(--gold);
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);
    }

    .family-initials {
      color: var(--gold);
      font-weight: 600;
      font-size: 1.1rem;
      font-family: 'Montserrat', sans-serif;
    }

    .family-info {
      flex: 1;
    }

    .family-name {
      font-weight: 600;
      color: var(--deep-blue);
      font-size: 1.15rem;
      margin-bottom: 0.4rem;
      font-family: 'Montserrat', sans-serif;
    }

    .family-relation {
      color: var(--soft-text);
      font-size: 1rem;
      text-transform: capitalize;
      font-style: italic;
    }

    /* GALLERY SECTION */
    .gallery-section {
      max-width: 850px;
      margin: 0 auto;
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      margin-bottom: 2.5rem;
    }

    .gallery-item {
      aspect-ratio: 1;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 6px 28px rgba(0, 0, 0, 0.12);
      background: white;
      padding: 1rem;
      border: 2px solid var(--warm-cream);
    }

    .gallery-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 12px;
    }

    .gallery-placeholder {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, var(--warm-cream), #e8dfd6);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
    }

    .gallery-category {
      page-break-inside: avoid;
      break-inside: avoid;
      margin-bottom: 3.5rem;
    }

    .gallery-category-title {
      font-family: 'Cinzel', serif;
      font-size: 1.6rem;
      color: var(--deep-blue);
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid var(--gold);
      text-align: center;
      text-transform: capitalize;
      letter-spacing: 0.05em;
      position: relative;
    }

    .gallery-category-title::after {
      content: '◆';
      position: absolute;
      bottom: -0.7rem;
      left: 50%;
      transform: translateX(-50%);
      background: var(--cream);
      padding: 0 0.8rem;
      color: var(--gold);
      font-size: 0.8rem;
    }

    .gallery-caption {
      margin-top: 1rem;
      text-align: center;
      font-size: 0.9rem;
      color: var(--soft-text);
      line-height: 1.5;
      padding: 0 0.5rem;
      font-style: italic;
    }

    /* MEMORIES SECTION */
    .memories-section {
      max-width: 750px;
      margin: 0 auto;
    }

    .memory-card {
      background: white;
      padding: 2.5rem;
      border-radius: 16px;
      box-shadow: 0 6px 28px rgba(0, 0, 0, 0.08);
      margin-bottom: 2rem;
      border-left: 4px solid var(--gold);
      position: relative;
    }

    .memory-text {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.15rem;
      line-height: 2;
      color: #3a3a3a;
      font-style: italic;
      margin-bottom: 2rem;
      position: relative;
      padding-left: 2rem;
    }

    .memory-text::before {
      content: '"';
      font-size: 5rem;
      color: var(--gold);
      position: absolute;
      left: -1rem;
      top: -2rem;
      opacity: 0.2;
      font-family: Georgia, serif;
      line-height: 1;
    }

    .memory-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--soft-text);
      font-size: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--warm-cream);
    }

    .memory-author {
      font-weight: 600;
      color: var(--deep-blue);
      font-family: 'Montserrat', sans-serif;
    }

    /* SERVICE SECTION */
    .service-section {
      max-width: 650px;
      margin: 0 auto;
    }

    .service-card {
      background: white;
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      border-top: 4px solid var(--gold);
    }

    .service-item {
      margin-bottom: 2.5rem;
      padding-bottom: 2.5rem;
      border-bottom: 1px solid var(--warm-cream);
      position: relative;
      padding-left: 2rem;
    }

    .service-item::before {
      content: '◆';
      position: absolute;
      left: 0;
      top: 0.3rem;
      color: var(--gold);
      font-size: 0.9rem;
    }

    .service-item:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    .service-label {
      font-weight: 600;
      color: var(--deep-blue);
      font-size: 1.2rem;
      margin-bottom: 0.8rem;
      font-family: 'Montserrat', sans-serif;
      letter-spacing: 0.02em;
    }

    .service-value {
      color: #3a3a3a;
      font-size: 1.05rem;
      line-height: 1.8;
    }

    /* FOOTER */
    .memorial-footer {
      text-align: center;
      padding: 3.5rem 2.5rem;
      color: var(--soft-text);
      font-style: italic;
      background: linear-gradient(135deg, white, var(--warm-cream));
      border-radius: 16px;
      max-width: 650px;
      margin: 0 auto;
      border-top: 3px solid var(--gold);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    }

    .footer-quote {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.2rem;
      margin-bottom: 2rem;
      line-height: 2;
      color: var(--deep-blue);
      font-weight: 500;
    }

    /* PRINT OPTIMIZATIONS */
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        font-size: 14px;
      }
      
      .page-break {
        page-break-after: always;
      }
      
      .avoid-break {
        page-break-inside: avoid;
      }
      
      .cover-page {
        min-height: 27cm;
      }

      @keyframes pulse {
        0%, 100% { opacity: 0.5; }
      }
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover-page page-break">
    <div class="memorial-title">In Loving Memory</div>
    <h1 class="cover-name">${name}</h1>
    
    <div class="ornamental-divider">
      <span class="ornamental-line"></span>
      <span>◆</span>
      <span class="ornamental-line"></span>
    </div>
    
    ${birthDate || deathDate ? `
      <div class="cover-dates">
        ${formatDate(birthDate) || ''} ${birthDate && deathDate ? '—' : ''} ${formatDate(deathDate) || ''}
      </div>
    ` : ''}
    
    ${calculateAge() ? `
      <div class="cover-age">${calculateAge()}</div>
    ` : ''}
    
    ${location ? `
      <div class="cover-location">${location}</div>
    ` : ''}
    
    <div class="cover-quote">
      "Those we love don't go away, they walk beside us every day. 
      Unseen, unheard, but always near, still loved, still missed, and very dear."
    </div>
  </div>

  <!-- PROFILE PAGE -->
  <div class="content-page page-break">
    <div class="section-header">
      <h2 class="section-title">In Loving Memory</h2>
      <div class="section-subtitle">A Life Beautifully Lived</div>
    </div>
    
    <div class="profile-section">
      <div class="profile-image-container">
        ${profileImage ? `
          <img src="${profileImage}" alt="${name}" class="profile-image" />
        ` : `
          <div class="profile-placeholder">
            <svg class="profile-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
            </svg>
          </div>
        `}
      </div>
      
      <h2 class="profile-name">${name}</h2>
      
      ${birthDate || deathDate ? `
        <div class="profile-dates">
          ${formatDate(birthDate) || ''} ${birthDate && deathDate ? '—' : ''} ${formatDate(deathDate) || ''}
        </div>
      ` : ''}
      
      ${location ? `
        <div class="profile-location">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
          </svg>
          ${location}
        </div>
      ` : ''}
    </div>
  </div>

  <!-- OBITUARY SECTION -->
  ${obituary ? `
    <div class="content-page ${!obituary && timeline.length === 0 ? 'page-break' : ''}">
      <div class="section-header">
        <h2 class="section-title">Life Story</h2>
        <div class="section-subtitle">A Legacy of Love and Memories</div>
      </div>
      
      <div class="obituary-section">
        <div class="obituary-content">
          ${obituary.split('\n\n').map((paragraph: string) => 
            paragraph.trim() ? `<p>${paragraph}</p>` : ''
          ).join('')}
        </div>
      </div>
    </div>
    ${timeline.length > 0 ? '<div class="section-divider"></div>' : ''}
  ` : ''}

  <!-- TIMELINE SECTION -->
  ${timeline.length > 0 ? `
    <div class="content-page ${obituary ? '' : 'page-break'}">
      <div class="section-header">
        <h2 class="section-title">Life's Journey</h2>
        <div class="section-subtitle">Milestones and Memories</div>
      </div>
      
      <div class="timeline-section">
        <div class="timeline">
          ${timeline.map((event: any) => `
            <div class="timeline-item avoid-break">
              <div class="timeline-marker">${event.year}</div>
              <div class="timeline-content">
                <div class="timeline-year">${event.year}</div>
                <h3 class="timeline-title">${event.title}</h3>
                ${event.description ? `
                  <div class="timeline-description">${event.description}</div>
                ` : ''}
                ${event.location ? `
                  <div class="timeline-location">${event.location}</div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    ${favorites.length > 0 ? '<div class="section-divider"></div>' : ''}
  ` : ''}

  <!-- FAVORITES SECTION -->
  ${favorites.length > 0 ? `
    <div class="content-page ${timeline.length > 0 ? '' : 'page-break'}">
      <div class="section-header">
        <h2 class="section-title">Cherished Favorites</h2>
        <div class="section-subtitle">The Things They Loved Most</div>
      </div>
      
      <div class="favorites-section">
        <div class="favorites-grid">
          ${favorites.map((fav: any) => `
            <div class="favorite-card avoid-break">
              <div class="favorite-icon">${getFavoriteIcon(fav.category)}</div>
              <h3 class="favorite-category">${fav.category}</h3>
              <p class="favorite-text">${fav.answer || fav.item || 'Remembered with love'}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    ${familyTree.length > 0 ? '<div class="section-divider"></div>' : ''}
  ` : ''}

  <!-- FAMILY SECTION -->
  ${familyTree.length > 0 ? `
    <div class="content-page ${favorites.length > 0 ? '' : 'page-break'}">
      <div class="section-header">
        <h2 class="section-title">Beloved Family</h2>
        <div class="section-subtitle">A Circle of Love</div>
      </div>
      
      <div class="family-section">
        <div class="family-grid">
          ${familyTree.map((member: any) => `
            <div class="family-member avoid-break">
              ${member.image ? `
                <img src="${member.image}" alt="${member.name}" class="family-image" />
              ` : `
                <div class="family-placeholder">
                  <span class="family-initials">
                    ${(member.name || 'Unknown').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </span>
                </div>
              `}
              <div class="family-info">
                <div class="family-name">${member.name || 'Family Member'}</div>
                <div class="family-relation">${member.relation || 'Loved One'}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    ${gallery.length > 0 ? '<div class="section-divider"></div>' : ''}
  ` : ''}

  <!-- GALLERY SECTION -->
  ${gallery.length > 0 ? `
    <div class="content-page ${familyTree.length > 0 ? '' : 'page-break'}">
      <div class="section-header">
        <h2 class="section-title">Photo Memories</h2>
        <div class="section-subtitle">Precious Moments Captured Forever</div>
      </div>
      
      <div class="gallery-section">
        ${(() => {
          const groupedImages: {[category: string]: any[]} = {};
          gallery.forEach((img: any) => {
            const category = img.category || 'Other Memories';
            if (!groupedImages[category]) {
              groupedImages[category] = [];
            }
            groupedImages[category].push(img);
          });

          let html = '';
          Object.entries(groupedImages).forEach(([category, images], categoryIndex) => {
            html += `
              <div class="gallery-category avoid-break">
                <h3 class="gallery-category-title">${category}</h3>
                
                <div class="gallery-grid">
                  ${images.map((img: any, index: number) => `
                    <div class="gallery-item">
                      <img 
                        src="${img.url || img}" 
                        alt="${img.caption || img.description || img.alt || img.title || `Memory ${index + 1}`}"
                        class="gallery-image"
                      />
       ${(() => {
  // Get the description from any field
  const description = img.caption || img.description || img.alt || img.title;
  // Only show if we have something
  if (description && description.trim() !== '') {
    return `<div class="gallery-caption">${description}</div>`;
  }
  return '';
})()}
                      ${img.uploadedAt ? `
                        <div style="
                          text-align: center;
                          font-size: 0.8rem;
                          color: var(--soft-text);
                          margin-top: 0.4rem;
                          font-style: italic;
                        ">${formatDate(img.uploadedAt)}</div>
                      ` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
              
              ${categoryIndex < Object.keys(groupedImages).length - 1 ? 
                '<div class="section-divider"></div>' : ''}
            `;
          });
          return html;
        })()}
      </div>
    </div>
    ${memoryWall.length > 0 ? '<div class="section-divider"></div>' : ''}
  ` : ''}


  <!-- SERVICE SECTION -->
  ${service && (service.venue || service.date || service.virtualLink) ? `
    <div class="content-page ${memoryWall.length > 0 ? '' : 'page-break'}">
      <div class="section-header">
        <h2 class="section-title">Service Information</h2>
        <div class="section-subtitle">Celebrating a Beautiful Life</div>
      </div>
      
      <div class="service-section">
        <div class="service-card">
          ${service.venue ? `
            <div class="service-item">
              <div class="service-label">Venue</div>
              <div class="service-value">${service.venue}</div>
            </div>
          ` : ''}
          
          ${service.address ? `
            <div class="service-item">
              <div class="service-label">Address</div>
              <div class="service-value">${service.address}</div>
            </div>
          ` : ''}
          
          ${service.date ? `
            <div class="service-item">
              <div class="service-label">Date</div>
              <div class="service-value">${formatDate(service.date)}</div>
            </div>
          ` : ''}
          
          ${service.time ? `
            <div class="service-item">
              <div class="service-label">Time</div>
              <div class="service-value">${service.time}</div>
            </div>
          ` : ''}
          
          ${service.virtualLink ? `
            <div class="service-item">
              <div class="service-label">Virtual Attendance</div>
              <div class="service-value">${service.virtualLink}</div>
              ${service.virtualPlatform ? `
                <div style="color: var(--gold); font-size: 0.95rem; margin-top: 0.5rem;">
                  Platform: ${service.virtualPlatform}
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  ` : ''}

  <!-- MEMORIES SECTION -->
  ${tributes.length > 0 ? `
    <div class="content-page ${gallery.length > 0 ? '' : 'page-break'}">
      <div class="section-header">
             <h2 class="section-title">Tributes</h2> 
        <div class="section-subtitle">Words of Love and Remembrance</div>
      </div>
      
      <div class="memories-section">
        ${memoryWall.map((memory: any) => `
          <div class="memory-card avoid-break">
            <div class="memory-text">
              ${memory.text || memory.message || 'Remembered with love and affection'}
            </div>
            <div class="memory-footer">
              <span class="memory-author">— ${memory.author || memory.authorName || 'Loved One'}</span>
              <span class="memory-date">${formatDate(memory.date || memory.createdAt)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    ${service && (service.venue || service.date || service.virtualLink) ? '<div class="section-divider"></div>' : ''}
  ` : ''}

  <!-- FINAL PAGE -->
  <div class="content-page">
    <div class="memorial-footer">
      <div class="footer-quote">
        "What we have once enjoyed we can never lose. All that we love deeply becomes a part of us."<br>
        — Helen Keller
      </div>
      <div style="margin-top: 1.5rem; font-size: 1rem; font-family: 'Montserrat', sans-serif;">
        This memorial booklet was created with love and remembrance<br>
        ${new Date().getFullYear()}
      </div>
    </div>
  </div>

</body>
</html>
  `;
}

// Enhanced icon mapping with SVG icons for PDF compatibility
function getFavoriteIcon(category: string): string {
  const icons: { [key: string]: string } = {
    food: `<svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
      <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
    </svg>`,
    
    drink: `<svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
      <path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM2 21h18v-2H2v2z"/>
    </svg>`,
    
    movie: `<svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
      <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
    </svg>`,
    
    book: `<svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
      <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
    </svg>`,
    
    song: `<svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>`,
    
    music: `<svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>`,
    
    hobby: `<svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
      <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
    </svg>`,
    
    sport: `<svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15.5v-3.5H9V9h7c1.1 0 2 .9 2 2v3c0 1.1-.9 2-2 2h-3zm-1-5.5v-3.5h5V10H9V8.5c0-1.1.9-2 2-2h5v3h-4z"/>
    </svg>`,
    
    place: `<svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>`,
    
    travel: `<svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
    </svg>`,
    
    flower: `<svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
      <path d="M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9zM5.6 10.25c0 1.38 1.12 2.5 2.5 2.5.53 0 1.01-.16 1.42-.44l-.02.19c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5l-.02-.19c.4.28.89.44 1.42.44 1.38 0 2.5-1.12 2.5-2.5 0-1-.59-1.85-1.43-2.25.84-.4 1.43-1.25 1.43-2.25 0-1.38-1.12-2.5-2.5-2.5-.53 0-1.01.16-1.42.44l.02-.19C14.5 2.12 13.38 1 12 1S9.5 2.12 9.5 3.5l.02.19c-.4-.28-.89-.44-1.42-.44-1.38 0-2.5 1.12-2.5 2.5 0 1 .59 1.85 1.43 2.25-.84.4-1.43 1.25-1.43 2.25zM12 5.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8s1.12-2.5 2.5-2.5zM3 13c0 4.97 4.03 9 9 9 0-4.97-4.03-9-9-9z"/>
    </svg>`,
    
    animal: `<svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
      <circle cx="4.5" cy="9.5" r="2.5"/>
      <circle cx="9" cy="5.5" r="2.5"/>
      <circle cx="15" cy="5.5" r="2.5"/>
      <circle cx="19.5" cy="9.5" r="2.5"/>
      <path d="M17.34 14.86c-.87-1.02-1.6-1.89-2.48-2.91-.46-.54-1.05-1.08-1.75-1.32-.11-.04-.22-.07-.33-.09-.25-.04-.52-.04-.78-.04s-.53 0-.79.05c-.11.02-.22.05-.33.09-.7.24-1.28.78-1.75 1.32-.87 1.02-1.6 1.89-2.48 2.91-1.31 1.31-2.92 2.76-2.62 4.79.29 1.02 1.02 2.03 2.33 2.32.73.15 3.06-.44 5.54-.44h.18c2.48 0 4.81.58 5.54.44 1.31-.29 2.04-1.31 2.33-2.32.31-2.04-1.3-3.49-2.61-4.8z"/>
    </svg>`,
    
    season: `<svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
      <path d="M12.01 6c2.61 0 4.89 1.86 5.4 4.43l.3 1.5 1.52.11c1.56.11 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3h-13c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.95 6 12.01 6m0-2C9.12 4 6.6 5.64 5.35 8.04 2.35 8.36.01 10.91.01 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96C18.68 6.59 15.65 4 12.01 4z"/>
    </svg>`,
    
    holiday: `<svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
      <path d="M19.48 12.35c-.11-.36-.39-.64-.75-.71L12 10 8.23 2.38c-.15-.37-.5-.61-.89-.61s-.74.24-.89.61L2.78 11.64c-.11.36-.05.76.16 1.07.21.31.55.5.91.5h4.72l1.56 4.68c.15.37.5.61.89.61s.74-.24.89-.61l2.01-6.02 5.89 1.43c.36.09.76-.02 1.05-.3.29-.27.42-.68.32-1.05zM13.6 15.43l-.89-2.67 2.67.65-1.78 2.02z"/>
    </svg>`,
    
    color: `<svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
      <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
    </svg>`,
    
    memory: `<svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>`,
    
    quote: `<svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
      <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
    </svg>`,
    
    default: `<svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>`
  };
  
  return icons[category.toLowerCase()] || icons.default;
}