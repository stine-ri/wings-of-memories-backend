// backend/utils/pdfTemplate.ts - UPDATED TO MATCH REACT PREVIEW
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
    @page {
      size: A4;
      margin: 0;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page-break {
      page-break-after: always;
      break-after: page;
    }

    .no-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Ensure images render properly */
    img {
      max-width: 100%;
      height: auto;
      display: block;
    }
  </style>
</head>
<body class="bg-white">

  <!-- HEADER SECTION -->
  <div class="relative bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-16 px-8 page-break">
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
      ` : ''}
      
      <h1 class="text-5xl font-bold text-gray-900 mb-4">${name}</h1>
      
      ${birthDate || deathDate ? `
        <p class="text-2xl text-gray-700 mb-3">
          ${birthDate} — ${deathDate}
        </p>
      ` : ''}
      
      ${location ? `
        <p class="text-lg text-gray-600">${location}</p>
      ` : ''}
    </div>
  </div>

  <!-- OBITUARY SECTION -->
  ${obituary ? `
    <div class="max-w-4xl mx-auto px-8 py-12 no-break">
      <h2 class="text-3xl font-bold text-amber-600 mb-6 border-b-4 border-amber-400 pb-2">
        Life Story
      </h2>
      <div class="text-gray-700 text-lg leading-relaxed space-y-4">
        ${obituary.split('\n\n').map((para: string) => `<p>${para}</p>`).join('')}
      </div>
    </div>
  ` : ''}

  <!-- TIMELINE SECTION -->
  ${timeline.length > 0 ? `
    <div class="max-w-4xl mx-auto px-8 py-12 page-break">
      <h2 class="text-3xl font-bold text-amber-600 mb-8 border-b-4 border-amber-400 pb-2">
        Life Journey
      </h2>
      <div class="space-y-6">
        ${timeline.map((event: any) => `
          <div class="flex gap-6 no-break">
            <div class="flex-shrink-0 w-24 pt-1">
              <span class="inline-block bg-amber-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                ${event.year}
              </span>
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-900 mb-2">${event.title}</h3>
              ${event.description ? `
                <p class="text-gray-600 leading-relaxed">${event.description}</p>
              ` : ''}
              ${event.location ? `
                <p class="text-gray-500 text-sm mt-1">📍 ${event.location}</p>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : ''}

  <!-- FAVORITES SECTION -->
  ${favorites.length > 0 ? `
    <div class="max-w-4xl mx-auto px-8 py-12 page-break">
      <h2 class="text-3xl font-bold text-amber-600 mb-8 border-b-4 border-amber-400 pb-2">
        Cherished Favorites
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${favorites.map((fav: any) => `
          <div class="bg-amber-50 p-6 rounded-lg no-break">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-2xl">${fav.icon || '💫'}</span>
              <h3 class="text-lg font-bold text-amber-700">${fav.category}</h3>
            </div>
            <p class="text-gray-800 text-base">${fav.answer || fav.item}</p>
          </div>
        `).join('')}
      </div>
    </div>
  ` : ''}

  <!-- FAMILY TREE SECTION -->
  ${familyTree.length > 0 ? `
    <div class="max-w-4xl mx-auto px-8 py-12 page-break">
      <h2 class="text-3xl font-bold text-amber-600 mb-8 border-b-4 border-amber-400 pb-2">
        Beloved Family
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        ${familyTree.map((member: any) => `
          <div class="flex items-center gap-4 p-4 bg-white border-l-4 border-amber-400 rounded-r-lg shadow-sm no-break">
            ${member.image ? `
              <img 
                src="${member.image}" 
                alt="${member.name}"
                class="w-16 h-16 rounded-full object-cover"
                onerror="this.style.display='none'"
              />
            ` : `
              <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <span class="text-amber-600 font-bold text-lg">${member.name.split(' ').map((n: string) => n[0]).join('')}</span>
              </div>
            `}
            <div>
              <p class="font-bold text-gray-900 text-lg">${member.name}</p>
              <p class="text-gray-600 text-sm">${member.relation}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : ''}

  <!-- GALLERY SECTION -->
  ${gallery.length > 0 ? `
    <div class="max-w-4xl mx-auto px-8 py-12 page-break">
      <h2 class="text-3xl font-bold text-amber-600 mb-8 border-b-4 border-amber-400 pb-2">
        Photo Gallery
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        ${gallery.slice(0, 9).map((img: any) => `
          <img 
            src="${img.url || img}" 
            alt="Memory"
            class="w-full h-48 object-cover rounded-lg shadow-md"
            onerror="this.style.display='none'"
          />
        `).join('')}
      </div>
    </div>
  ` : ''}

  <!-- MEMORY WALL SECTION -->
  ${memoryWall.length > 0 ? `
    <div class="max-w-4xl mx-auto px-8 py-12 page-break">
      <h2 class="text-3xl font-bold text-amber-600 mb-8 border-b-4 border-amber-400 pb-2">
        Shared Memories
      </h2>
      <div class="space-y-6">
        ${memoryWall.map((memory: any) => `
          <div class="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-lg no-break">
            <p class="text-gray-800 text-base leading-relaxed mb-4 italic">
              "${memory.text || memory.message}"
            </p>
            <div class="flex justify-between items-center">
              <p class="text-gray-600 text-sm font-semibold">
                — ${memory.author || memory.authorName || 'Anonymous'}
              </p>
              ${memory.date || memory.createdAt ? `
                <p class="text-gray-400 text-xs">
                  ${new Date(memory.date || memory.createdAt).toLocaleDateString()}
                </p>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : ''}

  <!-- SERVICE INFORMATION SECTION -->
  ${service.venue || service.date ? `
    <div class="max-w-4xl mx-auto px-8 py-12 page-break">
      <h2 class="text-3xl font-bold text-amber-600 mb-8 border-b-4 border-amber-400 pb-2">
        Service Information
      </h2>
      <div class="bg-amber-50 p-8 rounded-lg space-y-6">
        ${service.venue ? `
          <div>
            <h3 class="text-lg font-bold text-amber-700 mb-2">Venue</h3>
            <p class="text-gray-800 text-base">${service.venue}</p>
          </div>
        ` : ''}
        
        ${service.address ? `
          <div>
            <h3 class="text-lg font-bold text-amber-700 mb-2">Address</h3>
            <p class="text-gray-800 text-base">${service.address}</p>
          </div>
        ` : ''}
        
        ${service.date ? `
          <div>
            <h3 class="text-lg font-bold text-amber-700 mb-2">Date</h3>
            <p class="text-gray-800 text-base">${service.date}</p>
          </div>
        ` : ''}
        
        ${service.time ? `
          <div>
            <h3 class="text-lg font-bold text-amber-700 mb-2">Time</h3>
            <p class="text-gray-800 text-base">${service.time}</p>
          </div>
        ` : ''}
        
        ${service.virtualLink ? `
          <div>
            <h3 class="text-lg font-bold text-amber-700 mb-2">Virtual Attendance</h3>
            <p class="text-gray-800 text-base break-all">${service.virtualLink}</p>
            ${service.virtualPlatform ? `
              <p class="text-gray-600 text-sm mt-1">Platform: ${service.virtualPlatform}</p>
            ` : ''}
          </div>
        ` : ''}
      </div>
    </div>
  ` : ''}

  <!-- FOOTER -->
  <div class="max-w-4xl mx-auto px-8 py-12 text-center">
    <div class="border-t-2 border-amber-200 pt-8">
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
  </div>

</body>
</html>
  `;
}