// SEOForge - API Module
const ForgeAPI = {
    storage: {
        get(key, def = null) { try { return JSON.parse(localStorage.getItem(`forge_${key}`)) || def; } catch { return def; } },
        set(key, val) { localStorage.setItem(`forge_${key}`, JSON.stringify(val)); }
    },

    savedTags: {
        getAll() { return ForgeAPI.storage.get('tags', []); },
        save(tags) { ForgeAPI.storage.set('tags', tags); },
        add(tag) { const tags = this.getAll(); tag.id = Date.now().toString(36); tag.createdAt = new Date().toISOString(); tags.unshift(tag); this.save(tags); return tag; },
        delete(id) { let tags = this.getAll(); tags = tags.filter(t => t.id !== id); this.save(tags); }
    },

    generateSEOScore(data) {
        let score = 0; const checks = [];
        if (data.title?.length >= 50 && data.title?.length <= 60) { score += 20; checks.push({ pass: true, text: 'Title length is optimal (50-60 chars)' }); }
        else { checks.push({ pass: false, text: `Title should be 50-60 chars (currently ${data.title?.length || 0})` }); }
        if (data.description?.length >= 150 && data.description?.length <= 160) { score += 20; checks.push({ pass: true, text: 'Description length is optimal' }); }
        else { checks.push({ pass: false, text: `Description should be 150-160 chars (currently ${data.description?.length || 0})` }); }
        if (data.url?.startsWith('https')) { score += 15; checks.push({ pass: true, text: 'Uses HTTPS' }); }
        else { checks.push({ pass: false, text: 'Should use HTTPS' }); }
        if (data.keywords?.length > 0) { score += 15; checks.push({ pass: true, text: 'Focus keywords defined' }); }
        else { checks.push({ pass: false, text: 'Add focus keywords' }); }
        if (data.ogImage) { score += 15; checks.push({ pass: true, text: 'Open Graph image set' }); }
        else { checks.push({ pass: false, text: 'Add OG image for social sharing' }); }
        if (data.title?.toLowerCase().includes(data.keywords?.split(',')[0]?.toLowerCase())) { score += 15; checks.push({ pass: true, text: 'Primary keyword in title' }); }
        else { checks.push({ pass: false, text: 'Include primary keyword in title' }); }
        return { score, checks };
    },

    generateHTML(data) {
        return `<!-- Primary Meta Tags -->
<title>${data.title || ''}</title>
<meta name="title" content="${data.title || ''}">
<meta name="description" content="${data.description || ''}">
<meta name="keywords" content="${data.keywords || ''}">
<link rel="canonical" href="${data.url || ''}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${data.url || ''}">
<meta property="og:title" content="${data.ogTitle || data.title || ''}">
<meta property="og:description" content="${data.ogDescription || data.description || ''}">
${data.ogImage ? `<meta property="og:image" content="${data.ogImage}">` : ''}

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${data.url || ''}">
<meta property="twitter:title" content="${data.ogTitle || data.title || ''}">
<meta property="twitter:description" content="${data.ogDescription || data.description || ''}">
${data.ogImage ? `<meta property="twitter:image" content="${data.ogImage}">` : ''}`;
    },

    generateSchema(data) {
        const schema = {
            "@context": "https://schema.org",
            "@type": data.schemaType || "Product",
            "name": data.title,
            "description": data.description,
            "url": data.url
        };
        if (data.ogImage) schema.image = data.ogImage;
        if (data.price) { schema.offers = { "@type": "Offer", "price": data.price, "priceCurrency": "USD" }; }
        return JSON.stringify(schema, null, 2);
    },

    schemaTypes: ['Product', 'Article', 'LocalBusiness', 'Organization', 'WebPage', 'FAQPage', 'HowTo', 'Event'],

    toast: { show(msg, type = 'success') { const c = document.getElementById('toast-container') || this.create(); const t = document.createElement('div'); t.className = `toast toast-${type}`; t.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i> ${msg}`; c.appendChild(t); setTimeout(() => t.classList.add('show'), 10); setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000); }, create() { const c = document.createElement('div'); c.id = 'toast-container'; c.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;'; document.body.appendChild(c); const s = document.createElement('style'); s.textContent = '.toast{display:flex;align-items:center;gap:10px;padding:12px 20px;background:#1e1e3f;border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#fff;margin-bottom:10px;transform:translateX(120%);transition:0.3s;}.toast.show{transform:translateX(0);}.toast-success{border-left:3px solid #10b981;}'; document.head.appendChild(s); return c; } }
};
window.ForgeAPI = ForgeAPI;
