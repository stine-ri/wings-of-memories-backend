// backend/utils/pdfTemplate.ts - FIXED WITH INLINE STYLES
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
    /* RESET AND BASE STYLES */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #374151;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    @page {
      size: A4;
      margin: 0;
    }
    
    .page-break {
      page-break-after: always;
    }
    
    .avoid-break {
      page-break-inside: avoid;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 32px;
    }
    
    .section {
      padding: 64px 0;
    }
    
    .card {
      background: #ffffff;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      border: 1px solid #f3f4f6;
    }
    
    .section-title {
      font-size: 30px;
      font-weight: 700;
      color: #d97706;
      margin-bottom: 32px;
      padding-bottom: 16px;
      border-bottom: 2px solid #fbbf24;
    }
    
    /* HEADER STYLES */
    .header {
      background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fdba74 100%);
      min-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 64px 32px;
      text-align: center;
    }
    
    .profile-image {
      width: 192px;
      height: 192px;
      border-radius: 50%;
      object-fit: cover;
      border: 8px solid #ffffff;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      margin-bottom: 32px;
    }
    
    .profile-placeholder {
      width: 192px;
      height: 192px;
      border-radius: 50%;
      background: #ffffff;
      border: 8px solid #ffffff;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 32px auto;
    }
    
    .name {
      font-size: 48px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 24px;
    }
    
    .dates {
      font-size: 24px;
      color: #374151;
      margin-bottom: 16px;
      font-weight: 600;
    }
    
    .location {
      font-size: 18px;
      color: #6b7280;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    /* TIMELINE STYLES */
    .timeline-container {
      position: relative;
    }
    
    .timeline-connector {
      position: absolute;
      left: 80px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #d97706;
      z-index: 1;
    }
    
    .timeline-item {
      display: flex;
      gap: 24px;
      margin-bottom: 32px;
      position: relative;
      z-index: 2;
    }
    
    .timeline-year {
      background: #d97706;
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 700;
      min-width: 80px;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .timeline-content {
      flex: 1;
      background: #fffbeb;
      border-radius: 12px;
      padding: 24px;
      border: 1px solid #fed7aa;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
    
    .timeline-title {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 8px;
    }
    
    .timeline-description {
      color: #6b7280;
      margin-bottom: 12px;
    }
    
    .timeline-location {
      color: #9ca3af;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    /* FAVORITES STYLES */
    .favorites-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    
    .favorite-card {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border-radius: 12px;
      padding: 24px;
      border: 1px solid #fcd34d;
    }
    
    .favorite-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .favorite-icon {
      width: 48px;
      height: 48px;
      background: #d97706;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 20px;
    }
    
    .favorite-category {
      font-size: 18px;
      font-weight: 700;
      color: #92400e;
      text-transform: capitalize;
    }
    
    .favorite-text {
      color: #374151;
      line-height: 1.6;
    }
    
    /* FAMILY TREE STYLES */
    .family-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }
    
    .family-member {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #ffffff;
      border-radius: 12px;
      border: 2px solid #fcd34d;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
    
    .member-image {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #f59e0b;
    }
    
    .member-placeholder {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #fef3c7;
      border: 2px solid #f59e0b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #92400e;
      font-size: 14px;
    }
    
    .member-info {
      flex: 1;
      min-width: 0;
    }
    
    .member-name {
      font-weight: 700;
      color: #111827;
      font-size: 16px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .member-relation {
      color: #d97706;
      font-size: 14px;
      font-weight: 600;
      text-transform: capitalize;
    }
    
    /* GALLERY STYLES */
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    
    .gallery-item {
      aspect-ratio: 1;
      border-radius: 12px;
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
      background: #fffbeb;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    /* MEMORY WALL STYLES */
    .memory-card {
      background: linear-gradient(90deg, #fffbeb 0%, #fef3c7 100%);
      border-radius: 12px;
      padding: 24px;
      border-left: 4px solid #d97706;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      margin-bottom: 24px;
    }
    
    .memory-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .memory-avatar {
      width: 40px;
      height: 40px;
      background: #d97706;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }
    
    .memory-content {
      flex: 1;
      min-width: 0;
    }
    
    .memory-text {
      color: #374151;
      font-style: italic;
      line-height: 1.6;
      margin-bottom: 12px;
    }
    
    .memory-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .memory-author {
      color: #92400e;
      font-size: 14px;
      font-weight: 600;
    }
    
    .memory-date {
      color: #9ca3af;
      font-size: 12px;
    }
    
    /* SERVICE STYLES */
    .service-card {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border-radius: 12px;
      padding: 32px;
    }
    
    .service-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .service-icon {
      width: 32px;
      height: 32px;
      background: #d97706;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      flex-shrink: 0;
    }
    
    .service-content {
      flex: 1;
    }
    
    .service-label {
      font-size: 18px;
      font-weight: 700;
      color: #92400e;
      margin-bottom: 4px;
    }
    
    .service-value {
      color: #374151;
    }
    
    /* FOOTER STYLES */
    .footer {
      text-align: center;
      padding: 48px 32px;
      border-top: 2px solid #fcd34d;
      margin-top: 32px;
    }
    
    .footer-quote {
      font-size: 20px;
      color: #6b7280;
      font-style: italic;
      margin-bottom: 8px;
    }
    
    .footer-copyright {
      font-size: 14px;
      color: #9ca3af;
    }
  </style>
</head>
<body>

  <!-- HEADER SECTION -->
  <div class="header page-break">
    <div class="container">
      ${profileImage ? `
        <img src="${profileImage}" alt="${name}" class="profile-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div class="profile-placeholder" style="display: none;">
          <svg width="80" height="80" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
          </svg>
        </div>
      ` : `
        <div class="profile-placeholder">
          <svg width="80" height="80" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
          </svg>
        </div>
      `}
      
      <h1 class="name">${name}</h1>
      
      ${birthDate || deathDate ? `
        <div class="dates">
          ${birthDate || ''} ${birthDate && deathDate ? '—' : ''} ${deathDate || ''}
        </div>
      ` : ''}
      
      ${location ? `
        <div class="location">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
          </svg>
          ${location}
        </div>
      ` : ''}
    </div>
  </div>

  <!-- OBITUARY SECTION -->
  ${obituary ? `
    <div class="section avoid-break">
      <div class="container">
        <div class="card">
          <h2 class="section-title">Life Story</h2>
          <div class="obituary-content">
            ${obituary.split('\n').map((paragraph: string)=> 
              paragraph.trim() ? `<p style="margin-bottom: 16px; line-height: 1.6; color: #374151;">${paragraph}</p>` : ''
            ).join('')}
          </div>
        </div>
      </div>
    </div>
  ` : ''}

  <!-- TIMELINE SECTION -->
  ${timeline.length > 0 ? `
    <div class="section page-break avoid-break">
      <div class="container">
        <div class="card">
          <h2 class="section-title">Life Journey</h2>
          <div class="timeline-container">
            <div class="timeline-connector"></div>
            ${timeline.map((event: any) => `
              <div class="timeline-item">
                <div class="timeline-year">${event.year}</div>
                <div class="timeline-content">
                  <h3 class="timeline-title">${event.title}</h3>
                  ${event.description ? `
                    <p class="timeline-description">${event.description}</p>
                  ` : ''}
                  ${event.location ? `
                    <div class="timeline-location">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                      </svg>
                      ${event.location}
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  ` : ''}

  <!-- FAVORITES SECTION -->
  ${favorites.length > 0 ? `
    <div class="section page-break avoid-break">
      <div class="container">
        <div class="card">
          <h2 class="section-title">Cherished Favorites</h2>
          <div class="favorites-grid">
            ${favorites.map((fav: any) => `
              <div class="favorite-card">
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
    </div>
  ` : ''}

  <!-- Continue with other sections using the same pattern... -->
  <!-- FAMILY TREE, GALLERY, MEMORY WALL, SERVICE SECTIONS -->

  <!-- FOOTER -->
  <div class="footer">
    <p class="footer-quote">"Those we love don't go away,</p>
    <p class="footer-quote">they walk beside us every day."</p>
    <p class="footer-copyright">Created with love and remembrance • ${new Date().getFullYear()}</p>
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