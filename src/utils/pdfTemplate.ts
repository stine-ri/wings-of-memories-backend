// backend/utils/pdfTemplate.ts - PERFECT STYLING VERSION
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

    /* HEADER SECTION - Enhanced styling */
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

    .header-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" opacity="0.1"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%23d97706" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
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
      box-shadow: 
        0 20px 25px -5px rgba(0, 0, 0, 0.15),
        0 10px 10px -5px rgba(0, 0, 0, 0.08),
        inset 0 2px 4px 0 rgba(255, 255, 255, 0.8);
      transition: all 0.3s ease;
    }

    .profile-placeholder {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border: 8px solid rgba(255, 255, 255, 0.9);
      box-shadow: 
        0 20px 25px -5px rgba(0, 0, 0, 0.15),
        0 10px 10px -5px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .profile-icon {
      width: 80px;
      height: 80px;
      color: #f59e0b;
      opacity: 0.8;
    }

    .header-name {
      font-size: 3.5rem;
      font-weight: 800;
      color: #1f2937;
      margin-bottom: 1rem;
      line-height: 1.1;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      letter-spacing: -0.025em;
    }

    .header-dates {
      font-size: 1.75rem;
      color: #4b5563;
      margin-bottom: 1rem;
      font-weight: 500;
      opacity: 0.9;
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
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.9);
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
      box-shadow: 
        0 4px 6px -1px rgba(0, 0, 0, 0.05),
        0 2px 4px -1px rgba(0, 0, 0, 0.03),
        0 0 0 1px rgba(0, 0, 0, 0.04);
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
      position: relative;
    }

    .section-title::after {
      content: '';
      position: absolute;
      bottom: -3px;
      left: 0;
      width: 80px;
      height: 3px;
      background: #d97706;
      border-radius: 3px;
    }

    /* OBITUARY SECTION */
    .obituary-content {
      font-size: 1.125rem;
      color: #4b5563;
      line-height: 1.8;
    }

    .obituary-content p {
      margin-bottom: 1.5rem;
      text-align: justify;
    }

    .obituary-content p:last-child {
      margin-bottom: 0;
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
      border-radius: 3px;
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
      box-shadow: 
        0 4px 6px -1px rgba(245, 158, 11, 0.3),
        0 2px 4px -1px rgba(245, 158, 11, 0.2);
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
      transition: all 0.3s ease;
    }

    .timeline-content:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
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
      font-weight: 500;
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
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .favorite-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #f59e0b, #d97706);
    }

    .favorite-item:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
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
      box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);
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
      font-weight: 500;
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
      transition: all 0.3s ease;
    }

    .family-member:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
      border-color: #f59e0b;
    }

    .family-image {
      width: 5rem;
      height: 5rem;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #fcd34d;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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
      transition: all 0.3s ease;
      position: relative;
    }

    .gallery-item:hover {
      transform: scale(1.02);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
    }

    .gallery-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
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
      font-weight: 500;
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
      transition: all 0.3s ease;
      position: relative;
    }

    .memory-item::before {
      content: '"';
      position: absolute;
      top: 1rem;
      left: 1rem;
      font-size: 3rem;
      color: #fcd34d;
      font-family: serif;
      line-height: 1;
    }

    .memory-item:hover {
      transform: translateX(5px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    }

    .memory-content {
      display: flex;
      gap: 1.25rem;
      position: relative;
      z-index: 2;
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
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
      position: relative;
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
      font-weight: 500;
    }

    /* SERVICE INFO SECTION */
    .service-content {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border-radius: 1rem;
      padding: 2.5rem;
      position: relative;
      overflow: hidden;
    }

    .service-content::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05));
      border-radius: 0 1rem 0 0;
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
      box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);
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
      font-weight: 500;
    }

    /* RESPONSIVE DESIGN */
    @media (max-width: 768px) {
      .header-name {
        font-size: 2.5rem;
      }
      
      .header-dates {
        font-size: 1.5rem;
      }
      
      .section-card {
        padding: 2rem;
      }
      
      .favorites-grid {
        grid-template-columns: 1fr;
      }
      
      .family-grid {
        grid-template-columns: 1fr;
      }
      
      .gallery-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    /* PRINT OPTIMIZATIONS */
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      
      .page-break {
        page-break-after: always;
      }
      
      .avoid-break {
        page-break-inside: avoid;
      }
      
      .no-break-before {
        page-break-before: avoid;
      }
      
      .header-section {
        min-height: 60vh;
      }
    }

    /* UTILITY CLASSES */
    .text-center {
      text-align: center;
    }
    
    .hidden {
      display: none;
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
    <div class="section-container avoid-break no-break-before">
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

  <!-- Continue with other sections using the same improved structure... -->
  <!-- (Timeline, Favorites, Family Tree, Gallery, Memory Wall, Service sections) -->

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