// backend/utils/pdfTemplate.ts - UPDATED TO MATCH REACT PREVIEW EXACTLY
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
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    @page {
      size: A4;
      margin: 0;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      background-color: #ffffff;
    }

    .page-break {
      page-break-after: always;
      break-after: page;
    }

    .no-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .avoid-break-inside {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Ensure images render properly */
    img {
      max-width: 100%;
      height: auto;
      display: block;
    }

    /* Header gradient matching your React app */
    .header-gradient {
      background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fdba74 100%);
    }

    /* Timeline connector lines */
    .timeline-connector {
      position: relative;
    }

    .timeline-connector::before {
      content: '';
      position: absolute;
      left: 2rem;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #f59e0b;
      z-index: 0;
    }
  </style>
</head>
<body class="bg-white">

  <!-- HEADER SECTION - Matches React Header component -->
  <div class="header-gradient min-h-[60vh] flex items-center justify-center px-8 py-16 page-break">
    <div class="max-w-4xl mx-auto text-center">
      ${profileImage ? `
        <div class="mb-8 flex justify-center">
          <img 
            src="${profileImage}" 
            alt="${name}"
            class="w-48 h-48 rounded-full object-cover border-8 border-white shadow-2xl"
            onerror="this.style.display='none'"
          />
        </div>
      ` : `
        <div class="mb-8 flex justify-center">
          <div class="w-48 h-48 rounded-full bg-white border-8 border-white shadow-2xl flex items-center justify-center">
            <svg class="w-20 h-20 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
            </svg>
          </div>
        </div>
      `}
      
      <h1 class="text-5xl font-bold text-gray-900 mb-6">${name}</h1>
      
      ${birthDate || deathDate ? `
        <div class="text-2xl text-gray-700 mb-4">
          <span class="font-semibold">${birthDate || ''}</span>
          ${birthDate && deathDate ? ' — ' : ''}
          <span class="font-semibold">${deathDate || ''}</span>
        </div>
      ` : ''}
      
      ${location ? `
        <div class="flex items-center justify-center text-lg text-gray-600">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
          </svg>
          ${location}
        </div>
      ` : ''}
    </div>
  </div>

  <!-- OBITUARY SECTION - Matches ObituarySection component -->
  ${obituary ? `
    <div class="max-w-4xl mx-auto px-8 py-16 avoid-break-inside">
      <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h2 class="text-3xl font-bold text-amber-600 mb-8 pb-4 border-b-2 border-amber-200">
          Life Story
        </h2>
        <div class="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          ${obituary.split('\n').map((paragraph: string) => 
            paragraph.trim() ? `<p class="mb-4">${paragraph}</p>` : ''
          ).join('')}
        </div>
      </div>
    </div>
  ` : ''}

  <!-- TIMELINE SECTION - Matches TimelineSection component -->
  ${timeline.length > 0 ? `
    <div class="max-w-4xl mx-auto px-8 py-16 page-break avoid-break-inside">
      <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h2 class="text-3xl font-bold text-amber-600 mb-8 pb-4 border-b-2 border-amber-200">
          Life Journey
        </h2>
        <div class="timeline-connector space-y-8">
          ${timeline.map((event: any, index: number) => `
            <div class="flex gap-6 relative z-10 avoid-break-inside">
              <div class="flex-shrink-0 w-20">
                <div class="bg-amber-500 text-white px-4 py-2 rounded-full font-bold text-sm text-center shadow-lg">
                  ${event.year}
                </div>
              </div>
              <div class="flex-1 bg-amber-50 rounded-xl p-6 shadow-sm border border-amber-100">
                <h3 class="text-xl font-bold text-gray-900 mb-3">${event.title}</h3>
                ${event.description ? `
                  <p class="text-gray-600 leading-relaxed mb-3">${event.description}</p>
                ` : ''}
                ${event.location ? `
                  <div class="flex items-center text-gray-500 text-sm">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
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
  ` : ''}

  <!-- FAVORITES SECTION - Matches FavoritesSection component -->
  ${favorites.length > 0 ? `
    <div class="max-w-4xl mx-auto px-8 py-16 page-break avoid-break-inside">
      <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h2 class="text-3xl font-bold text-amber-600 mb-8 pb-4 border-b-2 border-amber-200">
          Cherished Favorites
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${favorites.map((fav: any) => `
            <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 shadow-sm avoid-break-inside">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white text-xl">
                  ${getFavoriteIcon(fav.category)}
                </div>
                <h3 class="text-lg font-bold text-amber-700 capitalize">${fav.category}</h3>
              </div>
              <p class="text-gray-800 text-base leading-relaxed">${fav.answer || fav.item || 'No details provided'}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  ` : ''}

  <!-- FAMILY TREE SECTION - Matches FamilyTreeSection component -->
  ${familyTree.length > 0 ? `
    <div class="max-w-4xl mx-auto px-8 py-16 page-break avoid-break-inside">
      <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h2 class="text-3xl font-bold text-amber-600 mb-8 pb-4 border-b-2 border-amber-200">
          Beloved Family
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${familyTree.map((member: any) => `
            <div class="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-amber-200 shadow-sm avoid-break-inside">
              ${member.image ? `
                <img 
                  src="${member.image}" 
                  alt="${member.name}"
                  class="w-16 h-16 rounded-full object-cover border-2 border-amber-300"
                  onerror="this.style.display='none'"
                />
              ` : `
                <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center border-2 border-amber-300">
                  <span class="text-amber-600 font-bold text-sm">
                    ${(member.name || 'Unknown').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </span>
                </div>
              `}
              <div class="flex-1 min-w-0">
                <p class="font-bold text-gray-900 text-base truncate">${member.name || 'Unknown'}</p>
                <p class="text-amber-600 text-sm font-medium capitalize">${member.relation || 'Family'}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  ` : ''}

  <!-- GALLERY SECTION - Matches GallerySection component -->
  ${gallery.length > 0 ? `
    <div class="max-w-4xl mx-auto px-8 py-16 page-break avoid-break-inside">
      <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h2 class="text-3xl font-bold text-amber-600 mb-8 pb-4 border-b-2 border-amber-200">
          Photo Gallery
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          ${gallery.slice(0, 9).map((img: any, index: number) => `
            <div class="aspect-square rounded-xl overflow-hidden shadow-md border border-gray-200 avoid-break-inside">
              <img 
                src="${img.url || img}" 
                alt="Memory photo ${index + 1}"
                class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\"w-full h-full bg-amber-100 flex items-center justify-center\"><svg class=\"w-8 h-8 text-amber-400\" fill=\"currentColor\" viewBox=\"0 0 20 20\"><path fill-rule=\"evenodd\" d=\"M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z\" clip-rule=\"evenodd\"></path></svg></div>'"
              />
            </div>
          `).join('')}
        </div>
        ${gallery.length > 9 ? `
          <div class="text-center mt-6">
            <p class="text-gray-500 text-sm">+ ${gallery.length - 9} more photos</p>
          </div>
        ` : ''}
      </div>
    </div>
  ` : ''}

  <!-- MEMORY WALL SECTION - Matches MemoryWallPublic component -->
  ${memoryWall.length > 0 ? `
    <div class="max-w-4xl mx-auto px-8 py-16 page-break avoid-break-inside">
      <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h2 class="text-3xl font-bold text-amber-600 mb-8 pb-4 border-b-2 border-amber-200">
          Shared Memories
        </h2>
        <div class="space-y-6">
          ${memoryWall.map((memory: any) => `
            <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border-l-4 border-amber-400 shadow-sm avoid-break-inside">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  ${(memory.author || memory.authorName || 'A').charAt(0).toUpperCase()}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-gray-800 text-base leading-relaxed italic mb-3">
                    "${memory.text || memory.message || 'No message'}"
                  </p>
                  <div class="flex justify-between items-center">
                    <p class="text-amber-700 text-sm font-semibold">
                      — ${memory.author || memory.authorName || 'Anonymous'}
                    </p>
                    ${memory.date || memory.createdAt ? `
                      <p class="text-gray-400 text-xs">
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

  <!-- SERVICE INFORMATION SECTION - Matches ServiceSectionPublic component -->
  ${service && (service.venue || service.date || service.virtualLink) ? `
    <div class="max-w-4xl mx-auto px-8 py-16 page-break avoid-break-inside">
      <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h2 class="text-3xl font-bold text-amber-600 mb-8 pb-4 border-b-2 border-amber-200">
          Service Information
        </h2>
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-8 space-y-6">
          ${service.venue ? `
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-amber-700 mb-1">Venue</h3>
                <p class="text-gray-800 text-base">${service.venue}</p>
              </div>
            </div>
          ` : ''}
          
          ${service.address ? `
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-amber-700 mb-1">Address</h3>
                <p class="text-gray-800 text-base">${service.address}</p>
              </div>
            </div>
          ` : ''}
          
          ${service.date ? `
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-amber-700 mb-1">Date</h3>
                <p class="text-gray-800 text-base">${service.date}</p>
              </div>
            </div>
          ` : ''}
          
          ${service.time ? `
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-amber-700 mb-1">Time</h3>
                <p class="text-gray-800 text-base">${service.time}</p>
              </div>
            </div>
          ` : ''}
          
          ${service.virtualLink ? `
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z"></path>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-amber-700 mb-1">Virtual Attendance</h3>
                <p class="text-gray-800 text-base break-words">${service.virtualLink}</p>
                ${service.virtualPlatform ? `
                  <p class="text-amber-600 text-sm mt-1 font-medium">Platform: ${service.virtualPlatform}</p>
                ` : ''}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  ` : ''}

  <!-- FOOTER -->
  <div class="max-w-4xl mx-auto px-8 py-12 text-center border-t-2 border-amber-200 mt-8">
    <p class="text-xl text-gray-600 italic mb-2">
      "Those we love don't go away,
    </p>
    <p class="text-xl text-gray-600 italic mb-8">
      they walk beside us every day."
    </p>
    <p class="text-sm text-gray-400">
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