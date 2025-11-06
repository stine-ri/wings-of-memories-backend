// backend/utils/pdfTemplate.ts - COMPLETE VERSION WITH ALL SECTIONS
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

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} - Memorial</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 0.5cm;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      background-color: #ffffff;
      line-height: 1.6;
      color: #374151;
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

    .no-break-before {
      page-break-before: avoid;
    }

    /* HEADER SECTION */
    .header-section {
      background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fdba74 100%);
      min-height: 70vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .header-content {
      max-width: 800px;
      margin: 0 auto;
      position: relative;
      z-index: 2;
    }

    .profile-container {
      margin-bottom: 2.5rem;
      display: flex;
      justify-content: center;
    }

    .profile-image {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      object-fit: cover;
      border: 8px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
    }

    .profile-placeholder {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border: 8px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .profile-icon {
      width: 80px;
      height: 80px;
      color: #f59e0b;
    }

    .header-name {
      font-size: 3.5rem;
      font-weight: 800;
      color: #1f2937;
      margin-bottom: 1rem;
      line-height: 1.1;
    }

    .header-dates {
      font-size: 1.75rem;
      color: #4b5563;
      margin-bottom: 1rem;
      font-weight: 500;
    }

    .header-location {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.25rem;
      color: #6b7280;
      background: rgba(255, 255, 255, 0.8);
      padding: 0.75rem 1.5rem;
      border-radius: 50px;
    }

    .location-icon {
      width: 1.25rem;
      height: 1.25rem;
      color: #f59e0b;
    }

    /* SECTION STYLES */
    .section-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 4rem 2rem;
    }

    .section-card {
      background: #ffffff;
      border-radius: 1.5rem;
      padding: 3rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      border: 1px solid #f3f4f6;
      position: relative;
    }

    .section-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #f59e0b, #d97706);
      border-radius: 1.5rem 1.5rem 0 0;
    }

    .section-title {
      font-size: 2.25rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 2.5rem;
      padding-bottom: 1rem;
      border-bottom: 3px solid #fde68a;
    }

    /* OBITUARY SECTION */
    .obituary-content {
      font-size: 1.125rem;
      color: #4b5563;
      line-height: 1.8;
    }

    .obituary-content p {
      margin-bottom: 1.5rem;
    }

    /* TIMELINE SECTION */
    .timeline-container {
      position: relative;
      padding-left: 4rem;
    }

    .timeline-line {
      position: absolute;
      left: 2.5rem;
      top: 0;
      bottom: 0;
      width: 3px;
      background: linear-gradient(to bottom, #f59e0b, #d97706);
    }

    .timeline-item {
      display: flex;
      gap: 2rem;
      margin-bottom: 2.5rem;
      position: relative;
    }

    .timeline-year {
      flex-shrink: 0;
      width: 6rem;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
      padding: 0.75rem 1rem;
      border-radius: 50px;
      font-weight: 700;
      font-size: 0.875rem;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.3);
      position: relative;
      z-index: 10;
    }

    .timeline-content {
      flex: 1;
      background: #fffbeb;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      border: 1px solid #fde68a;
    }

    .timeline-title {
      font-size: 1.375rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 0.75rem;
    }

    .timeline-description {
      color: #6b7280;
      line-height: 1.7;
      margin-bottom: 1rem;
    }

    .timeline-location {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #9ca3af;
      font-size: 0.875rem;
    }

    /* FAVORITES SECTION */
    .favorites-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .favorite-item {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border-radius: 1rem;
      padding: 2rem;
      border: 1px solid #fde68a;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .favorite-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .favorite-icon {
      width: 3.5rem;
      height: 3.5rem;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .favorite-category {
      font-size: 1.25rem;
      font-weight: 700;
      color: #92400e;
      text-transform: capitalize;
    }

    .favorite-text {
      color: #1f2937;
      font-size: 1.0625rem;
      line-height: 1.6;
    }

    /* FAMILY TREE SECTION */
    .family-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .family-member {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.5rem;
      background: #ffffff;
      border-radius: 1rem;
      border: 2px solid #fde68a;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .family-image {
      width: 5rem;
      height: 5rem;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #fcd34d;
    }

    .family-placeholder {
      width: 5rem;
      height: 5rem;
      background: linear-gradient(135deg, #fffbeb, #fef3c7);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid #fcd34d;
    }

    .family-initials {
      color: #d97706;
      font-weight: 700;
      font-size: 1.125rem;
    }

    .family-info {
      flex: 1;
      min-width: 0;
    }

    .family-name {
      font-weight: 700;
      color: #1f2937;
      font-size: 1.125rem;
      margin-bottom: 0.25rem;
    }

    .family-relation {
      color: #d97706;
      font-size: 0.9375rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    /* GALLERY SECTION */
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .gallery-item {
      aspect-ratio: 1;
      border-radius: 0.75rem;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
    }

    .gallery-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .gallery-placeholder {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #fffbeb, #fef3c7);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .gallery-more {
      text-align: center;
      margin-top: 1.5rem;
      color: #6b7280;
      font-size: 0.9375rem;
    }

    /* MEMORY WALL SECTION */
    .memory-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .memory-item {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border-radius: 1rem;
      padding: 2rem;
      border-left: 4px solid #f59e0b;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .memory-content {
      display: flex;
      gap: 1.25rem;
    }

    .memory-avatar {
      flex-shrink: 0;
      width: 3rem;
      height: 3rem;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1.125rem;
    }

    .memory-body {
      flex: 1;
      min-width: 0;
    }

    .memory-text {
      color: #1f2937;
      font-size: 1.0625rem;
      line-height: 1.7;
      font-style: italic;
      margin-bottom: 1rem;
    }

    .memory-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .memory-author {
      color: #92400e;
      font-size: 0.9375rem;
      font-weight: 600;
    }

    .memory-date {
      color: #9ca3af;
      font-size: 0.8125rem;
    }

    /* SERVICE INFO SECTION */
    .service-content {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border-radius: 1rem;
      padding: 2.5rem;
    }

    .service-item {
      display: flex;
      gap: 1.25rem;
      margin-bottom: 2rem;
      align-items: flex-start;
    }

    .service-item:last-child {
      margin-bottom: 0;
    }

    .service-icon {
      flex-shrink: 0;
      width: 3rem;
      height: 3rem;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .service-icon svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    .service-info {
      flex: 1;
    }

    .service-label {
      font-size: 1.125rem;
      font-weight: 700;
      color: #92400e;
      margin-bottom: 0.5rem;
    }

    .service-value {
      color: #1f2937;
      font-size: 1.0625rem;
      line-height: 1.6;
      word-break: break-word;
    }

    .service-platform {
      color: #d97706;
      font-size: 0.9375rem;
      margin-top: 0.375rem;
      font-weight: 600;
    }

    /* FOOTER SECTION */
    .footer-section {
      max-width: 800px;
      margin: 0 auto;
      padding: 3rem 2rem;
      text-align: center;
      border-top: 2px solid #fde68a;
      margin-top: 2rem;
    }

    .footer-quote {
      font-size: 1.375rem;
      color: #6b7280;
      font-style: italic;
      margin-bottom: 0.5rem;
      line-height: 1.6;
    }

    .footer-credit {
      font-size: 0.9375rem;
      color: #9ca3af;
      margin-top: 2rem;
    }

    /* PRINT OPTIMIZATIONS */
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .page-break {
        page-break-after: always;
      }
      
      .avoid-break {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>

  <!-- HEADER SECTION -->
  <div class="header-section page-break">
    <div class="header-content">
      <div class="profile-container">
        ${profileImage ? `
          <img 
            src="${profileImage}" 
            alt="${name}"
            class="profile-image"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          />
          <div class="profile-placeholder" style="display: none;">
            <svg class="profile-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
            </svg>
          </div>
        ` : `
          <div class="profile-placeholder">
            <svg class="profile-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
            </svg>
          </div>
        `}
      </div>
      
      <h1 class="header-name">${name}</h1>
      
      ${birthDate || deathDate ? `
        <div class="header-dates">
          ${birthDate || ''} ${birthDate && deathDate ? '—' : ''} ${deathDate || ''}
        </div>
      ` : ''}
      
      ${location ? `
        <div class="header-location">
          <svg class="location-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
          </svg>
          <span>${location}</span>
        </div>
      ` : ''}
    </div>
  </div>

  <!-- OBITUARY SECTION -->
  ${obituary ? `
    <div class="section-container avoid-break">
      <div class="section-card">
        <h2 class="section-title">Life Story</h2>
        <div class="obituary-content">
          ${obituary.split('\n').map((paragraph: string) => 
            paragraph.trim() ? `<p>${paragraph}</p>` : ''
          ).join('')}
        </div>
      </div>
    </div>
  ` : ''}

  <!-- TIMELINE SECTION -->
  ${timeline.length > 0 ? `
    <div class="section-container ${obituary ? 'page-break' : ''}">
      <div class="section-card">
        <h2 class="section-title">Life Journey</h2>
        <div class="timeline-container">
          <div class="timeline-line"></div>
          ${timeline.map((event: any) => `
            <div class="timeline-item avoid-break">
              <div class="timeline-year">${event.year}</div>
              <div class="timeline-content">
                <h3 class="timeline-title">${event.title}</h3>
                ${event.description ? `
                  <p class="timeline-description">${event.description}</p>
                ` : ''}
                ${event.location ? `
                  <div class="timeline-location">
                    <svg style="width: 1rem; height: 1rem;" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                    </svg>
                    <span>${event.location}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  ` : ''}

  <!-- FAVORITES SECTION -->
  ${favorites.length > 0 ? `
    <div class="section-container ${timeline.length > 0 ? 'page-break' : ''}">
      <div class="section-card">
        <h2 class="section-title">Cherished Favorites</h2>
        <div class="favorites-grid">
          ${favorites.map((fav: any) => `
            <div class="favorite-item avoid-break">
              <div class="favorite-header">
                <div class="favorite-icon">${getFavoriteIcon(fav.category)}</div>
                <h3 class="favorite-category">${fav.category}</h3>
              </div>
              <p class="favorite-text">${fav.answer || fav.item || 'No details provided'}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  ` : ''}

  <!-- FAMILY TREE SECTION -->
  ${familyTree.length > 0 ? `
    <div class="section-container ${favorites.length > 0 ? 'page-break' : ''}">
      <div class="section-card">
        <h2 class="section-title">Beloved Family</h2>
        <div class="family-grid">
          ${familyTree.map((member: any) => `
            <div class="family-member avoid-break">
              ${member.image ? `
                <img 
                  src="${member.image}" 
                  alt="${member.name}"
                  class="family-image"
                  onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                />
                <div class="family-placeholder" style="display: none;">
                  <span class="family-initials">
                    ${(member.name || 'Unknown').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </span>
                </div>
              ` : `
                <div class="family-placeholder">
                  <span class="family-initials">
                    ${(member.name || 'Unknown').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </span>
                </div>
              `}
              <div class="family-info">
                <p class="family-name">${member.name || 'Unknown'}</p>
                <p class="family-relation">${member.relation || 'Family'}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  ` : ''}

  <!-- GALLERY SECTION -->
  ${gallery.length > 0 ? `
    <div class="section-container ${familyTree.length > 0 ? 'page-break' : ''}">
      <div class="section-card">
        <h2 class="section-title">Photo Gallery</h2>
        <div class="gallery-grid">
          ${gallery.slice(0, 9).map((img: any, index: number) => `
            <div class="gallery-item avoid-break">
              <img 
                src="${img.url || img}" 
                alt="Memory photo ${index + 1}"
                class="gallery-image"
                onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'gallery-placeholder\\'><svg style=\\'width:2rem;height:2rem;color:#fbbf24\\' fill=\\'currentColor\\' viewBox=\\'0 0 20 20\\'><path fill-rule=\\'evenodd\\' d=\\'M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z\\' clip-rule=\\'evenodd\\'></path></svg></div>';"
              />
            </div>
          `).join('')}
        </div>
        ${gallery.length > 9 ? `
          <div class="gallery-more">+ ${gallery.length - 9} more photos</div>
        ` : ''}
      </div>
    </div>
  ` : ''}

  <!-- MEMORY WALL SECTION -->
  ${memoryWall.length > 0 ? `
    <div class="section-container ${gallery.length > 0 ? 'page-break' : ''}">
      <div class="section-card">
        <h2 class="section-title">Shared Memories</h2>
        <div class="memory-list">
          ${memoryWall.map((memory: any) => `
            <div class="memory-item avoid-break">
              <div class="memory-content">
                <div class="memory-avatar">
                  ${(memory.author || memory.authorName || 'A').charAt(0).toUpperCase()}
                </div>
                <div class="memory-body">
                  <p class="memory-text">
                    "${memory.text || memory.message || 'No message'}"
                  </p>
                  <div class="memory-footer">
                    <p class="memory-author">
                      — ${memory.author || memory.authorName || 'Anonymous'}
                    </p>
                    ${memory.date || memory.createdAt ? `
                      <p class="memory-date">
                        ${new Date(memory.date || memory.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    ` : ''}
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  ` : ''}

  <!-- SERVICE INFORMATION SECTION -->
  ${service && (service.venue || service.date || service.virtualLink) ? `
    <div class="section-container ${memoryWall.length > 0 ? 'page-break' : ''}">
      <div class="section-card">
        <h2 class="section-title">Service Information</h2>
        <div class="service-content">
          ${service.venue ? `
            <div class="service-item">
              <div class="service-icon">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div class="service-info">
                <h3 class="service-label">Venue</h3>
                <p class="service-value">${service.venue}</p>
              </div>
            </div>
          ` : ''}
          
          ${service.address ? `
            <div class="service-item">
              <div class="service-icon">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
              </div>
              <div class="service-info">
                <h3 class="service-label">Address</h3>
                <p class="service-value">${service.address}</p>
              </div>
            </div>
          ` : ''}
          
          ${service.date ? `
            <div class="service-item">
              <div class="service-icon">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div class="service-info">
                <h3 class="service-label">Date</h3>
                <p class="service-value">${service.date}</p>
              </div>
            </div>
          ` : ''}
          
          ${service.time ? `
            <div class="service-item">
              <div class="service-icon">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div class="service-info">
                <h3 class="service-label">Time</h3>
                <p class="service-value">${service.time}</p>
              </div>
            </div>
          ` : ''}
          
          ${service.virtualLink ? `
            <div class="service-item">
              <div class="service-icon">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z"></path>
                </svg>
              </div>
              <div class="service-info">
                <h3 class="service-label">Virtual Attendance</h3>
                <p class="service-value">${service.virtualLink}</p>
                ${service.virtualPlatform ? `
                  <p class="service-platform">Platform: ${service.virtualPlatform}</p>
                ` : ''}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  ` : ''}

  <!-- FOOTER -->
  <div class="footer-section">
    <p class="footer-quote">
      "Those we love don't go away,
    </p>
    <p class="footer-quote">
      they walk beside us every day."
    </p>
    <p class="footer-credit">
      Created with love and remembrance • ${new Date().getFullYear()}
    </p>
  </div>

</body>
</html>
  `;
}

// Helper function to get icons for favorites
function getFavoriteIcon(category: string): string {
  const icons: { [key: string]: string } = {
    food: '🍽️',
    movie: '🎬',
    book: '📚',
    song: '🎵',
    hobby: '🎨',
    place: '📍',
    color: '🎨',
    memory: '🌟',
    quote: '💬',
    sport: '⚽',
    default: '💫'
  };
  
  return icons[category.toLowerCase()] || icons.default;
}