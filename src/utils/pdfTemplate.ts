// backend/utils/pdfTemplate.ts - WARM & COMFORTING MEMORIAL BOOKLET
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

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>In Loving Memory of ${name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Open+Sans:wght@300;400;500;600&display=swap');
    
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
      font-family: 'Open Sans', sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      background: linear-gradient(to bottom, #fdfbf7 0%, #f9f6f1 100%);
      line-height: 1.7;
      color: #4a5568;
      font-size: 14px;
    }

    /* Warm, comforting color scheme */
    :root {
      --primary: #9b8579;
      --secondary: #d4c5b9;
      --accent: #b8a394;
      --warm-light: #fdfbf7;
      --warm-cream: #f9f6f1;
      --soft-text: #6b7280;
      --gentle-border: #e8dfd6;
      --comfort-blue: #a8c5da;
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
      background: linear-gradient(90deg, transparent, var(--gentle-border), transparent);
      margin: 2.5rem 0;
      opacity: 0.5;
    }

    /* COVER PAGE - Soft and welcoming */
    .cover-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #fdfbf7 0%, #f5ede3 50%, #f9f6f1 100%);
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
      background: radial-gradient(circle at 30% 50%, rgba(168, 197, 218, 0.08) 0%, transparent 50%),
                  radial-gradient(circle at 70% 50%, rgba(212, 197, 185, 0.08) 0%, transparent 50%);
    }

    .memorial-title {
      font-family: 'Lora', serif;
      font-size: 1.1rem;
      color: var(--primary);
      letter-spacing: 0.25em;
      text-transform: uppercase;
      margin-bottom: 1.5rem;
      font-weight: 400;
      opacity: 0.9;
    }

    .cover-name {
      font-family: 'Lora', serif;
      font-size: 3.2rem;
      font-weight: 600;
      color: #5a5147;
      margin: 2rem 0;
      line-height: 1.2;
      position: relative;
    }

    .cover-name::after {
      content: '';
      position: absolute;
      bottom: -1.2rem;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--accent), transparent);
    }

    .cover-dates {
      font-size: 1.3rem;
      color: var(--soft-text);
      font-style: italic;
      margin-bottom: 1rem;
      font-family: 'Lora', serif;
    }

    .cover-location {
      font-size: 1rem;
      color: var(--soft-text);
      margin-bottom: 3rem;
    }

    .cover-quote {
      font-size: 1.05rem;
      color: #6b7280;
      font-style: italic;
      max-width: 450px;
      margin: 2.5rem auto 0;
      line-height: 1.9;
      font-family: 'Lora', serif;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }

    /* CONTENT PAGES */
    .content-page {
      padding: 3rem 0;
    }

    .section-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .section-title {
      font-family: 'Lora', serif;
      font-size: 2rem;
      font-weight: 600;
      color: #5a5147;
      margin-bottom: 1rem;
      position: relative;
      display: inline-block;
    }

    .section-title::after {
      content: '';
      position: absolute;
      bottom: -0.6rem;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--accent), transparent);
    }

    .section-subtitle {
      font-size: 1rem;
      color: var(--soft-text);
      font-style: italic;
      margin-top: 1rem;
    }

    /* PROFILE SECTION */
    .profile-section {
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    }

    .profile-image-container {
      margin-bottom: 2rem;
    }

    .profile-image {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      object-fit: cover;
      border: 6px solid white;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
    }

    .profile-placeholder {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f9f6f1, #e8dfd6);
      border: 6px solid white;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
    }

    .profile-icon {
      width: 70px;
      height: 70px;
      color: var(--primary);
      opacity: 0.6;
    }

    .profile-name {
      font-family: 'Lora', serif;
      font-size: 2.2rem;
      font-weight: 600;
      color: #5a5147;
      margin-bottom: 1rem;
    }

    .profile-dates {
      font-family: 'Lora', serif;
      font-size: 1.2rem;
      color: var(--soft-text);
      font-style: italic;
      margin-bottom: 1rem;
    }

    .profile-location {
      font-size: 1rem;
      color: var(--soft-text);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    /* OBITUARY SECTION */
    .obituary-section {
      max-width: 700px;
      margin: 0 auto;
    }

    .obituary-content {
      font-size: 1.05rem;
      line-height: 1.9;
      color: #5a5a5a;
      text-align: justify;
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }

    .obituary-content p {
      margin-bottom: 1.5rem;
      text-indent: 2rem;
    }

    /* TIMELINE SECTION */
    .timeline-section {
      max-width: 800px;
      margin: 0 auto;
    }

    .timeline {
      position: relative;
      padding-left: 3rem;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 1.5rem;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(to bottom, var(--comfort-blue), var(--secondary));
      opacity: 0.4;
    }

    .timeline-item {
      position: relative;
      margin-bottom: 2.5rem;
      padding-left: 2rem;
    }

    .timeline-marker {
      position: absolute;
      left: -2.5rem;
      top: 0;
      width: 3rem;
      height: 3rem;
      background: linear-gradient(135deg, var(--comfort-blue), var(--secondary));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 0.85rem;
      box-shadow: 0 4px 15px rgba(168, 197, 218, 0.3);
    }

    .timeline-content {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      border-left: 3px solid var(--comfort-blue);
    }

    .timeline-year {
      font-size: 1rem;
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }

    .timeline-title {
      font-family: 'Lora', serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: #5a5147;
      margin-bottom: 1rem;
    }

    .timeline-description {
      color: #5a5a5a;
      line-height: 1.8;
      margin-bottom: 1rem;
    }

    .timeline-location {
      color: var(--soft-text);
      font-size: 0.9rem;
      font-style: italic;
    }

    /* FAVORITES SECTION */
    .favorites-section {
      max-width: 800px;
      margin: 0 auto;
    }

    .favorites-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .favorite-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      border-top: 3px solid var(--comfort-blue);
      text-align: center;
      transition: transform 0.2s;
    }

    .favorite-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      filter: saturate(0.8);
    }

    .favorite-category {
      font-family: 'Lora', serif;
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 1rem;
      text-transform: capitalize;
    }

    .favorite-text {
      color: #5a5a5a;
      line-height: 1.7;
      font-style: italic;
    }

    /* FAMILY SECTION */
    .family-section {
      max-width: 800px;
      margin: 0 auto;
    }

    .family-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
    }

    .family-member {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .family-image {
      width: 65px;
      height: 65px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--gentle-border);
    }

    .family-placeholder {
      width: 65px;
      height: 65px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f9f6f1, #e8dfd6);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid var(--gentle-border);
    }

    .family-initials {
      color: var(--primary);
      font-weight: 600;
      font-size: 1rem;
    }

    .family-info {
      flex: 1;
    }

    .family-name {
      font-weight: 600;
      color: #5a5147;
      font-size: 1.05rem;
      margin-bottom: 0.25rem;
    }

    .family-relation {
      color: var(--soft-text);
      font-size: 0.9rem;
      text-transform: capitalize;
    }

    /* GALLERY SECTION */
    .gallery-section {
      max-width: 800px;
      margin: 0 auto;
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .gallery-item {
      aspect-ratio: 1;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .gallery-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .gallery-placeholder {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #f9f6f1, #e8dfd6);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* MEMORIES SECTION */
    .memories-section {
      max-width: 700px;
      margin: 0 auto;
    }

    .memory-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      margin-bottom: 1.5rem;
      border-left: 3px solid var(--comfort-blue);
    }

    .memory-text {
      font-family: 'Lora', serif;
      font-size: 1.05rem;
      line-height: 1.8;
      color: #5a5a5a;
      font-style: italic;
      margin-bottom: 1.5rem;
      position: relative;
      padding-left: 1.5rem;
    }

    .memory-text::before {
      content: '"';
      font-size: 2.5rem;
      color: var(--secondary);
      position: absolute;
      left: -0.5rem;
      top: -0.8rem;
      opacity: 0.4;
      font-family: Georgia, serif;
    }

    .memory-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--soft-text);
      font-size: 0.9rem;
    }

    .memory-author {
      font-weight: 600;
      color: var(--primary);
    }

    /* SERVICE SECTION */
    .service-section {
      max-width: 600px;
      margin: 0 auto;
    }

    .service-card {
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    }

    .service-item {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--gentle-border);
    }

    .service-item:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    .service-label {
      font-weight: 600;
      color: var(--primary);
      font-size: 1.05rem;
      margin-bottom: 0.5rem;
    }

    .service-value {
      color: #5a5a5a;
      font-size: 1rem;
      line-height: 1.7;
    }

    /* FOOTER */
    .memorial-footer {
      text-align: center;
      padding: 3rem 2rem;
      color: var(--soft-text);
      font-style: italic;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      max-width: 600px;
      margin: 0 auto;
    }

    .footer-quote {
      font-family: 'Lora', serif;
      font-size: 1.1rem;
      margin-bottom: 1.5rem;
      line-height: 1.8;
      color: #5a5147;
    }

    /* PRINT OPTIMIZATIONS */
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        font-size: 13px;
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
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover-page page-break">
    <div class="memorial-title">In Loving Memory</div>
    <h1 class="cover-name">${name}</h1>
    ${birthDate || deathDate ? `
      <div class="cover-dates">
        ${formatDate(birthDate) || ''} ${birthDate && deathDate ? '—' : ''} ${formatDate(deathDate) || ''}
      </div>
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
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
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
        <div class="gallery-grid">
          ${gallery.slice(0, 9).map((img: any, index: number) => `
            <div class="gallery-item avoid-break">
              <img 
                src="${img.url || img}" 
                alt="Memory ${index + 1}"
                class="gallery-image"
              />
            </div>
          `).join('')}
        </div>
        ${gallery.length > 9 ? `
          <div style="text-align: center; margin-top: 2rem; color: var(--soft-text); font-style: italic;">
            + ${gallery.length - 9} more cherished photos
          </div>
        ` : ''}
      </div>
    </div>
    ${memoryWall.length > 0 ? '<div class="section-divider"></div>' : ''}
  ` : ''}

  <!-- MEMORIES SECTION -->
  ${memoryWall.length > 0 ? `
    <div class="content-page ${gallery.length > 0 ? '' : 'page-break'}">
      <div class="section-header">
        <h2 class="section-title">Shared Memories</h2>
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
                <div style="color: var(--primary); font-size: 0.9rem; margin-top: 0.25rem;">
                  Platform: ${service.virtualPlatform}
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  ` : ''}

  <!-- FINAL PAGE -->
  <div class="content-page">
    <div class="memorial-footer">
      <div class="footer-quote">
        "What we have once enjoyed we can never lose. All that we love deeply becomes a part of us."<br>
        — Helen Keller
      </div>
      <div style="margin-top: 1rem; font-size: 0.95rem;">
        This memorial booklet was created with love and remembrance<br>
        ${new Date().getFullYear()}
      </div>
    </div>
  </div>

</body>
</html>
  `;
}

// Enhanced icon mapping
function getFavoriteIcon(category: string): string {
  const icons: { [key: string]: string } = {
    food: '🍽️',
    movie: '🎬',
    book: '📚',
    song: '🎵',
    music: '🎵',
    hobby: '🎨',
    place: '📍',
    color: '🎨',
    memory: '🌟',
    quote: '💬',
    sport: '⚽',
    drink: '☕',
    travel: '✈️',
    animal: '🐾',
    flower: '🌸',
    season: '🍂',
    holiday: '🎄',
    default: '💫'
  };
  
  return icons[category.toLowerCase()] || icons.default;
}