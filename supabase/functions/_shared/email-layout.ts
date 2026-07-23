// Branded email layout for App da Oração
// Wraps content HTML with header (logo), body, and footer using the app's visual identity.

const LOGO_URL = "https://appdaoracao.com/__l5e/assets-v1/6b47db03-e4cd-4d97-bc3d-1609d6a2824a/logo-app-da-oracao.png";
const SITE_URL = "https://appdaoracao.com";
const BRAND_NAME = "App da Oração";

// Colors mirror src/index.css
const COLORS = {
  primary: "#3b82f6",      // hsl(217 91% 60%)
  primaryDark: "#2563eb",
  foreground: "#0f172a",   // hsl(222 47% 11%)
  muted: "#64748b",        // hsl(215 16% 47%)
  border: "#e2e8f0",       // hsl(214 20% 91%)
  background: "#f8fafc",   // hsl(210 20% 98%)
  card: "#ffffff",
};

export interface BrandedEmailOptions {
  heading?: string;
  preheader?: string;
  content: string;        // HTML body content (already trusted / generated internally)
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}

export function renderBrandedEmail(opts: BrandedEmailOptions): string {
  const { heading, preheader, content, ctaLabel, ctaUrl, footerNote } = opts;

  const preheaderHtml = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:#ffffff;">${escapeHtml(preheader)}</div>`
    : "";

  const headingHtml = heading
    ? `<h1 style="margin:0 0 20px 0;font-size:24px;line-height:1.3;font-weight:700;color:${COLORS.foreground};font-family:'Inter',Arial,sans-serif;">${escapeHtml(heading)}</h1>`
    : "";

  const ctaHtml = ctaLabel && ctaUrl
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;">
        <tr><td align="center" bgcolor="${COLORS.primary}" style="border-radius:12px;">
          <a href="${escapeAttr(ctaUrl)}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:'Inter',Arial,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:12px;">${escapeHtml(ctaLabel)}</a>
        </td></tr>
       </table>`
    : "";

  const footerNoteHtml = footerNote
    ? `<p style="margin:0 0 12px 0;font-size:13px;line-height:1.5;color:${COLORS.muted};font-family:'Inter',Arial,sans-serif;">${escapeHtml(footerNote)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(heading || BRAND_NAME)}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.background};font-family:'Inter','Segoe UI',Arial,sans-serif;color:${COLORS.foreground};">
${preheaderHtml}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLORS.background};padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:${COLORS.card};border-radius:16px;box-shadow:0 4px 20px rgba(15,23,42,0.06);overflow:hidden;">
      <!-- Header -->
      <tr><td align="center" style="padding:36px 32px 12px 32px;">
        <a href="${SITE_URL}" target="_blank" style="text-decoration:none;">
          <img src="${LOGO_URL}" alt="${BRAND_NAME}" width="220" style="display:block;border:0;max-width:220px;height:auto;" />
        </a>
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:24px 32px 32px 32px;">
        ${headingHtml}
        <div style="font-size:15px;line-height:1.65;color:${COLORS.foreground};font-family:'Inter',Arial,sans-serif;">
          ${content}
        </div>
        ${ctaHtml}
      </td></tr>

      <!-- Divider -->
      <tr><td style="padding:0 32px;"><div style="height:1px;background-color:${COLORS.border};"></div></td></tr>

      <!-- Footer -->
      <tr><td align="center" style="padding:24px 32px 32px 32px;">
        ${footerNoteHtml}
        <p style="margin:0 0 8px 0;font-size:12px;line-height:1.5;color:${COLORS.muted};font-family:'Inter',Arial,sans-serif;">
          Você recebeu este email porque tem uma conta no <strong>${BRAND_NAME}</strong>.
        </p>
        <p style="margin:0;font-size:12px;color:${COLORS.muted};font-family:'Inter',Arial,sans-serif;">
          <a href="${SITE_URL}" target="_blank" style="color:${COLORS.primary};text-decoration:none;font-weight:600;">appdaoracao.com</a>
          &nbsp;·&nbsp; Feito com fé 🙏
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}
