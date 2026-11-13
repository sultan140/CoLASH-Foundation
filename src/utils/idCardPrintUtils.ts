import QRCode from 'qrcode';

export interface PrintableIdCardData {
  nameBn: string;
  nameEn: string;
  roleBn: string;
  roleEn: string;
  membershipId: string;
  bloodGroup?: string;
  district?: string;
  joiningYear?: number | string;
  joinedDate?: string;
  avatar?: string;
  wingTitle?: string;
  accentTheme?: 'default' | 'womens';
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getVerificationUrl = (membershipId: string): string =>
  `${window.location.origin}${window.location.pathname}#verify-member-${encodeURIComponent(membershipId)}`;

const loadImage = (src: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

/**
 * Generates a print-ready high-resolution PNG Official ID Card (1050x640)
 * Works reliably in all browsers and sandboxed iframes where window.print() may be restricted.
 */
export const downloadMemberIdCardPNG = async (card: PrintableIdCardData): Promise<void> => {
  const width = 1050;
  const height = 640;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const isWomens = card.accentTheme === 'womens';

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  if (isWomens) {
    grad.addColorStop(0, '#102B3F');
    grad.addColorStop(0.55, '#1a384f');
    grad.addColorStop(1, '#58122b');
  } else {
    grad.addColorStop(0, '#102B3F');
    grad.addColorStop(0.55, '#0c2232');
    grad.addColorStop(1, '#167D78');
  }

  // Rounded card base
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, 36);
  ctx.fill();

  // Subtle decorative glow circle
  const glow = ctx.createRadialGradient(width - 120, 80, 10, width - 120, 80, 320);
  glow.addColorStop(0, isWomens ? 'rgba(244, 114, 182, 0.18)' : 'rgba(214, 243, 106, 0.16)');
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Header strip
  ctx.fillStyle = '#D6F36A';
  ctx.beginPath();
  ctx.roundRect(44, 38, 72, 72, 18);
  ctx.fill();

  ctx.fillStyle = '#102B3F';
  ctx.font = '900 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CLF', 80, 75);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 32px sans-serif';
  ctx.fillText('CoLASH Foundation', 136, 68);

  ctx.fillStyle = '#D6F36A';
  ctx.font = '700 18px sans-serif';
  ctx.fillText(
    card.wingTitle || 'OFFICIAL DIGITAL IDENTITY CARD · REG: DH-9842/2021',
    136,
    98
  );

  // Verified badge on top right
  ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(width - 250, 44, 206, 46, 23);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#6EE7B7';
  ctx.font = '800 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✓ VERIFIED 2026–28', width - 147, 74);

  // Divider line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(44, 134);
  ctx.lineTo(width - 44, 134);
  ctx.stroke();

  // Avatar frame
  const avatarX = 48;
  const avatarY = 172;
  const avatarSize = 210;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(avatarX, avatarY, avatarSize, avatarSize, 26);
  ctx.clip();

  const avatarImg = card.avatar ? await loadImage(card.avatar) : null;
  if (avatarImg) {
    ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
  } else {
    ctx.fillStyle = '#1E3A4C';
    ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
    ctx.fillStyle = '#D6F36A';
    ctx.font = '800 72px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const initials = (card.nameEn || card.nameBn || 'CL')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() || '')
      .join('');
    ctx.fillText(initials || 'CL', avatarX + avatarSize / 2, avatarY + avatarSize / 2);
  }
  ctx.restore();

  // Avatar border
  ctx.strokeStyle = isWomens ? '#FB7185' : '#D6F36A';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(avatarX, avatarY, avatarSize, avatarSize, 26);
  ctx.stroke();

  // Member Details
  const infoX = 294;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 34px sans-serif';
  ctx.fillText(card.nameBn || card.nameEn, infoX, 206, 480);

  if (card.nameEn && card.nameEn !== card.nameBn) {
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '600 21px sans-serif';
    ctx.fillText(card.nameEn, infoX, 240, 480);
  }

  ctx.fillStyle = '#D6F36A';
  ctx.font = '700 22px sans-serif';
  ctx.fillText(card.roleBn || card.roleEn, infoX, 278, 480);

  // Detail grid
  const drawField = (label: string, value: string, x: number, y: number, color = '#FFFFFF') => {
    ctx.fillStyle = '#94A3B8';
    ctx.font = '700 15px sans-serif';
    ctx.fillText(label, x, y);
    ctx.fillStyle = color;
    ctx.font = '800 22px monospace, sans-serif';
    ctx.fillText(value, x, y + 28, 225);
  };

  drawField('MEMBER ID', card.membershipId, infoX, 336, '#D6F36A');
  drawField('BLOOD GROUP', card.bloodGroup || 'O+', infoX + 245, 336, '#FDA4AF');
  drawField('DISTRICT / REGION', card.district || 'মৌলভীবাজার', infoX, 412, '#FFFFFF');
  drawField(
    'JOINED',
    String(card.joiningYear || card.joinedDate || '2024'),
    infoX + 245,
    412,
    '#FFFFFF'
  );

  // Scannable QR Code on right
  const qrSize = 186;
  const qrX = width - qrSize - 48;
  const qrY = 184;

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(qrX - 14, qrY - 14, qrSize + 28, qrSize + 54, 22);
  ctx.fill();

  try {
    const verifyUrl = getVerificationUrl(card.membershipId);
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: qrSize,
      margin: 1,
      color: { dark: '#102B3F', light: '#FFFFFF' },
    });
    const qrImg = await loadImage(qrDataUrl);
    if (qrImg) {
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    }
  } catch (err) {
    console.error('QR generation failed for ID card export:', err);
  }

  ctx.fillStyle = '#102B3F';
  ctx.font = '800 14px monospace, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SCAN TO VERIFY', qrX + qrSize / 2, qrY + qrSize + 24);

  // Footer divider & bar
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(44, height - 92);
  ctx.lineTo(width - 44, height - 92);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '600 18px sans-serif';
  ctx.fillText('Circle of Light & Service for Humanity (CoLASH Foundation)', 48, height - 46);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#94A3B8';
  ctx.font = '600 17px monospace, sans-serif';
  ctx.fillText('Hotline: 01646-475348 | Sylhet & Kamalganj', width - 48, height - 46);

  // Trigger download
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `CoLASH-ID-Card-${card.membershipId}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Prints an isolated, crisp Official Member ID Card using a dedicated hidden iframe.
 * Falls back gracefully without navigating away or failing silently.
 */
export const printMemberIdCard = async (card: PrintableIdCardData): Promise<boolean> => {
  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(getVerificationUrl(card.membershipId), {
      width: 160,
      margin: 1,
      color: { dark: '#102B3F', light: '#FFFFFF' },
    });
  } catch (err) {
    console.error(err);
  }

  const isWomens = card.accentTheme === 'womens';
  const gradientCss = isWomens
    ? 'linear-gradient(135deg, #102B3F 0%, #1a384f 55%, #58122b 100%)'
    : 'linear-gradient(135deg, #102B3F 0%, #0c2232 55%, #167D78 100%)';

  const avatarHtml = card.avatar
    ? `<img src="${escapeHtml(card.avatar)}" alt="${escapeHtml(card.nameEn)}" class="avatar-img" />`
    : `<div class="avatar-fallback">${escapeHtml(
        (card.nameEn || card.nameBn || 'CL')
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((s) => s[0]?.toUpperCase() || '')
          .join('') || 'CL'
      )}</div>`;

  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <title>CoLASH ID Card - ${escapeHtml(card.membershipId)}</title>
  <style>
    @page { size: auto; margin: 14mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body {
      margin: 0;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Bengali", sans-serif;
      background: #ffffff;
      color: #102B3F;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 90vh;
    }
    .card {
      width: 660px;
      max-width: 100%;
      border-radius: 22px;
      background: ${gradientCss};
      color: #ffffff;
      padding: 28px;
      border: 2px solid ${isWomens ? 'rgba(251,113,133,0.5)' : 'rgba(214,243,106,0.45)'};
      box-shadow: 0 18px 45px rgba(16, 43, 63, 0.25);
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255,255,255,0.16);
      padding-bottom: 14px;
      margin-bottom: 20px;
    }
    .brand { display: flex; align-items: center; gap: 12px; }
    .logo-box {
      width: 44px; height: 44px; border-radius: 11px;
      background: #D6F36A; color: #102B3F;
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-size: 16px;
    }
    .brand-title { font-size: 18px; font-weight: 800; margin: 0; }
    .brand-sub { font-size: 11px; color: #D6F36A; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
    .verified-pill {
      padding: 5px 12px; border-radius: 999px;
      background: rgba(16,185,129,0.2);
      border: 1px solid rgba(52,211,153,0.5);
      color: #6EE7B7; font-size: 11px; font-weight: 800;
    }
    .main { display: flex; align-items: center; gap: 20px; }
    .avatar-img, .avatar-fallback {
      width: 112px; height: 112px; border-radius: 16px;
      object-fit: cover; border: 3px solid ${isWomens ? '#FB7185' : '#D6F36A'};
      flex-shrink: 0; background: #1E3A4C;
    }
    .avatar-fallback {
      display: flex; align-items: center; justify-content: center;
      font-size: 36px; font-weight: 900; color: #D6F36A;
    }
    .info { flex: 1; min-width: 0; }
    .name-bn { font-size: 21px; font-weight: 900; margin: 0 0 2px; line-height: 1.25; }
    .name-en { font-size: 13px; color: #CBD5E1; margin: 0 0 4px; }
    .role { font-size: 13px; font-weight: 700; color: #D6F36A; margin-bottom: 12px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; font-size: 12px; }
    .meta-label { display: block; font-size: 9px; color: #94A3B8; text-transform: uppercase; font-weight: 700; }
    .meta-val { font-weight: 800; color: #FFFFFF; font-family: monospace, sans-serif; }
    .meta-id { color: #D6F36A; }
    .meta-blood { color: #FDA4AF; }
    .qr-box {
      background: #ffffff; padding: 8px; border-radius: 14px;
      text-align: center; flex-shrink: 0;
    }
    .qr-box img { width: 92px; height: 92px; display: block; }
    .qr-caption { font-size: 8px; font-weight: 800; font-family: monospace; color: #102B3F; margin-top: 4px; }
    .footer {
      margin-top: 20px; padding-top: 12px;
      border-top: 1px solid rgba(255,255,255,0.16);
      display: flex; justify-content: space-between;
      font-size: 10px; color: #CBD5E1;
    }
    .cut-hint {
      margin-top: 18px; font-size: 11px; color: #64748B; font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">
        <div class="logo-box">CLF</div>
        <div>
          <p class="brand-title">CoLASH Foundation</p>
          <span class="brand-sub">${escapeHtml(card.wingTitle || 'Official Member Identity Card · Reg: DH-9842/2021')}</span>
        </div>
      </div>
      <div class="verified-pill">✓ VERIFIED 2026–28</div>
    </div>
    <div class="main">
      ${avatarHtml}
      <div class="info">
        <div class="name-bn">${escapeHtml(card.nameBn || card.nameEn)}</div>
        ${card.nameEn && card.nameEn !== card.nameBn ? `<div class="name-en">${escapeHtml(card.nameEn)}</div>` : ''}
        <div class="role">${escapeHtml(card.roleBn || card.roleEn)}</div>
        <div class="meta-grid">
          <div>
            <span class="meta-label">Member ID</span>
            <span class="meta-val meta-id">${escapeHtml(card.membershipId)}</span>
          </div>
          <div>
            <span class="meta-label">Blood Group</span>
            <span class="meta-val meta-blood">${escapeHtml(card.bloodGroup || 'O+')}</span>
          </div>
          <div>
            <span class="meta-label">District</span>
            <span class="meta-val">${escapeHtml(card.district || 'মৌলভীবাজার')}</span>
          </div>
          <div>
            <span class="meta-label">Joined</span>
            <span class="meta-val">${escapeHtml(String(card.joiningYear || card.joinedDate || '2024'))}</span>
          </div>
        </div>
      </div>
      ${
        qrDataUrl
          ? `<div class="qr-box"><img src="${qrDataUrl}" alt="Verification QR" /><div class="qr-caption">SCAN TO VERIFY</div></div>`
          : ''
      }
    </div>
    <div class="footer">
      <span>Circle of Light &amp; Service for Humanity (CoLASH)</span>
      <span>Hotline: 01646-475348 | Kamalganj, Sylhet</span>
    </div>
  </div>
  <div class="cut-hint">CoLASH Official Digital Registry · Print-Ready Identity Pass</div>
</body>
</html>`;

  return new Promise((resolve) => {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.setAttribute('aria-hidden', 'true');
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        document.body.removeChild(iframe);
        resolve(false);
        return;
      }

      doc.open();
      doc.write(html);
      doc.close();

      let finished = false;
      const runPrint = () => {
        if (finished) return;
        finished = true;
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
          }, 1500);
          resolve(true);
        } catch (err) {
          console.warn('Iframe print blocked, falling back:', err);
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
          resolve(false);
        }
      };

      iframe.onload = () => setTimeout(runPrint, 250);
      setTimeout(runPrint, 700);
    } catch (err) {
      console.warn('Print iframe error:', err);
      resolve(false);
    }
  });
};
