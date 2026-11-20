require('dotenv').config();

const SMARTLINK_URL =
  process.env.SMARTLINK_URL ||
  'https://ardance.org/4/ab922a0e2ab02af3c547ceb6c4e4c54f';

function positiveInt(value, fallback) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > 120) return fallback;
  return number;
}

const WAIT_SECONDS = positiveInt(process.env.SAFELINK_WAIT_SECONDS, 20);
const FINAL_SECONDS = positiveInt(process.env.SAFELINK_FINAL_SECONDS, 10);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      default: return '&#39;';
    }
  });
}

const ads = {
  popunder: `
    <script data-cfasync="false" src="https://accountut.com/1/bf18749c477460bf4422b8d34797de74"></script>`,

  socialBar: `
    <script data-cfasync="false" src="https://bellnewyork.org/14/f1c295834220933b78e26ac0b2bc7b28"></script>`,

  native: `
    <script async="async" data-cfasync="false" src="https://bellnewyork.org/21/b0c006a0f94ab96e5b23136c64075bec"></script>
    <div id="container-b0c006a0f94ab96e5b23136c64075bec"></div>`,

  banner300: `
    <script>atOptions = {'key' : '403084211c3cd59c38b768e931a8e0f6','format' : 'iframe','height' : 250,'width' : 300,'params' : {}};</script>
    <script src="https://bellnewyork.org/22/403084211c3cd59c38b768e931a8e0f6"></script>`,

  banner468: `
    <script>atOptions = {'key' : '64e57f1ad76e50ba412ab820759c69bb','format' : 'iframe','height' : 60,'width' : 468,'params' : {}};</script>
    <script src="https://bellnewyork.org/22/64e57f1ad76e50ba412ab820759c69bb"></script>`,

  banner160x300: `
    <script>atOptions = {'key' : '0c5816d4ec0d33ffeaf3a34b87237f7e','format' : 'iframe','height' : 300,'width' : 160,'params' : {}};</script>
    <script src="https://bellnewyork.org/22/0c5816d4ec0d33ffeaf3a34b87237f7e"></script>`,

  banner160x600: `
    <script>atOptions = {'key' : '2dff4a930ecc1fb63396b51dd8a6630e','format' : 'iframe','height' : 600,'width' : 160,'params' : {}};</script>
    <script src="https://bellnewyork.org/22/2dff4a930ecc1fb63396b51dd8a6630e"></script>`,

  banner320: `
    <script>atOptions = {'key' : 'ac5a099058946597e4e4b5730fa7eb4d','format' : 'iframe','height' : 50,'width' : 320,'params' : {}};</script>
    <script src="https://bellnewyork.org/22/ac5a099058946597e4e4b5730fa7eb4d"></script>`,

  banner728: `
    <script>atOptions = {'key' : '8232b5cbd68310f0149b4b9875c2d01e','format' : 'iframe','height' : 90,'width' : 728,'params' : {}};</script>
    <script src="https://bellnewyork.org/22/8232b5cbd68310f0149b4b9875c2d01e"></script>`
};

function renderSafelink({ title, code, baseUrl }) {
  const safeTitle = escapeHtml(title);
  const safeCode = escapeHtml(code);
  let host = 'vriz.my.id';
  try {
    host = new URL(baseUrl).host;
  } catch (error) {
    host = baseUrl;
  }

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="Safelink ${safeTitle}. Selesaikan dua langkah untuk membuka tautan asli.">
<title>${safeTitle} | Vrizlink</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
${ads.popunder}
<style>
  :root {
    --pine: #1E352C;
    --pine-deep: #16261F;
    --cream: #F6F0E4;
    --warm-white: #FFFDF8;
    --ink: #1F2A24;
    --muted: #5C665F;
    --sage: #5E7A62;
    --sage-deep: #4F6B54;
    --coral: #D9674F;
    --coral-deep: #A8452F;
    --line: #DCD3C2;
    --border: #8C8475;
    --cream-deep: #EFE7D6;
    --sage-soft: #EDF3EC;
    --sage-line: #C8D8C8;
    --serif: "Instrument Serif", Georgia, "Times New Roman", serif;
    --sans: "Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  *, *::before, *::after { box-sizing: border-box; }

  html { color-scheme: light; }

  body {
    margin: 0;
    min-height: 100dvh;
    background: var(--cream);
    color: var(--ink);
    font-family: var(--sans);
    font-size: 15px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  a { color: inherit; }

  button { font: inherit; cursor: pointer; }

  :focus-visible {
    outline: 3px solid var(--coral-deep);
    outline-offset: 3px;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px clamp(16px, 4vw, 40px);
    background: var(--pine);
    color: var(--cream);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
    letter-spacing: -.01em;
  }

  .mark {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: var(--cream);
    color: var(--pine);
    font-family: var(--serif);
    font-size: 22px;
    line-height: 1;
    box-shadow: inset 0 -2px 0 rgba(30, 53, 44, .18);
  }

  .brand-tag {
    font-size: 11px;
    font-weight: 500;
    color: #C9D6C9;
    border: 1px solid rgba(246, 240, 228, .35);
    border-radius: 4px;
    padding: 2px 6px;
  }

  .host {
    font-size: 12px;
    color: #C9D6C9;
    font-variant-numeric: tabular-nums;
  }

  .page {
    width: min(100% - 32px, 1040px);
    margin: 0 auto;
    padding: 20px 0 40px;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 18px;
  }

  .main { min-width: 0; }

  .ad-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    margin: 18px auto;
    max-width: 100%;
  }

  .ad-label {
    font-size: 10px;
    font-weight: 600;
    color: var(--muted);
    text-transform: none;
  }

  .ad-body {
    display: flex;
    justify-content: center;
    max-width: 100%;
    overflow: hidden;
  }

  .ad-320 { display: none; }
  .ad-728 { display: none; }
  .ad-468 { display: none; }
  .ad-rail-stack { display: none; }

  .ad-728 .ad-body { width: 728px; min-height: 90px; }
  .ad-468 .ad-body { width: 468px; min-height: 60px; }
  .ad-320 .ad-body { width: 320px; min-height: 50px; }
  .ad-300 .ad-body { width: 300px; min-height: 250px; }
  .ad-native .ad-body { width: 100%; min-height: 110px; }
  .ad-160x300 .ad-body { width: 160px; min-height: 300px; }
  .ad-160x600 .ad-body { width: 160px; min-height: 600px; }

  .file-card {
    background: var(--warm-white);
    border: 1px solid var(--line);
    border-radius: 18px;
    padding: 24px clamp(18px, 4vw, 30px);
    box-shadow: 0 18px 34px -30px rgba(31, 42, 36, .55);
  }

  .file-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .file-kind {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    font-weight: 700;
    color: var(--sage-deep);
    letter-spacing: .04em;
    text-transform: uppercase;
  }

  .file-kind svg { width: 16px; height: 16px; }

  .file-status {
    font-size: 11px;
    font-weight: 600;
    color: var(--sage-deep);
    background: #EDF3EC;
    border: 1px solid #C8D8C8;
    border-radius: 999px;
    padding: 3px 10px;
  }

  .file-card h1 {
    margin: 0 0 10px;
    font-family: var(--serif);
    font-size: clamp(28px, 5vw, 40px);
    font-weight: 400;
    line-height: 1.08;
    letter-spacing: -.015em;
    overflow-wrap: anywhere;
  }

  .file-lede {
    margin: 0;
    color: var(--muted);
    font-size: 13.5px;
    max-width: 52ch;
  }

  .flow-card {
    background: var(--warm-white);
    border: 1px solid var(--line);
    border-radius: 18px;
    padding: clamp(20px, 4vw, 30px);
    margin-top: 16px;
  }

  .flow-step {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--line);
  }

  .step-count {
    font-size: 11px;
    font-weight: 700;
    color: var(--muted);
    letter-spacing: .04em;
    text-transform: uppercase;
  }

  .step-dots {
    display: flex;
    gap: 6px;
  }

  .step-dot {
    width: 22px;
    height: 4px;
    border-radius: 2px;
    background: #E5DDCE;
  }

  .step-dot.is-active { background: var(--coral); }
  .step-dot.is-done { background: var(--pine); }

  .panel[hidden] { display: none; }

  .wait-head {
    margin: 0;
    font-family: var(--serif);
    font-size: clamp(30px, 6vw, 42px);
    font-weight: 400;
    line-height: 1.1;
  }

  .wait-head em { color: var(--coral-deep); }

  .wait-note {
    margin: 4px 0 0;
    color: var(--muted);
    font-size: 13px;
  }

  .count-row {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    margin: 18px 0 10px;
  }

  .count-value {
    font-family: var(--serif);
    font-size: clamp(58px, 13vw, 78px);
    line-height: .9;
    font-variant-numeric: tabular-nums;
    color: var(--pine);
  }

  .count-unit {
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
    padding-bottom: 8px;
  }

  .progress {
    height: 6px;
    border-radius: 3px;
    background: #E9E1D2;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    width: 0;
    background: var(--coral);
    transition: width .25s linear;
  }

  .action-row {
    margin-top: 20px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 48px;
    padding: 12px 24px;
    border-radius: 10px;
    border: 1px solid var(--pine);
    background: var(--pine);
    color: var(--warm-white);
    font-weight: 700;
    font-size: 14.5px;
    text-decoration: none;
    box-shadow: inset 0 -2px 0 rgba(0, 0, 0, .22);
    transition: background .16s ease, transform .16s ease, box-shadow .16s ease;
  }

  .btn svg { width: 18px; height: 18px; flex: 0 0 18px; }

  .btn:hover { background: var(--pine-deep); }
  .btn:active { transform: translateY(1px); box-shadow: none; }

  .btn.is-loading { opacity: .75; pointer-events: none; }

  .btn-note {
    font-size: 12px;
    color: var(--muted);
    max-width: 34ch;
  }

  .btn.is-locked {
    background: var(--muted);
    border-color: var(--muted);
    box-shadow: none;
    cursor: not-allowed;
  }

  .btn.is-locked:hover { background: var(--muted); }

  .sub-list {
    margin: 14px 0 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 8px;
  }

  .sub-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: var(--cream);
  }

  .sub-text {
    display: grid;
    gap: 1px;
    min-width: 0;
  }

  .sub-label {
    font-size: 10.5px;
    font-weight: 600;
    color: var(--muted);
  }

  .sub-name {
    font-size: 13.5px;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }

  .sub-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    min-height: 40px;
    padding: 8px 14px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--warm-white);
    color: var(--pine);
    font-size: 12.5px;
    font-weight: 700;
    text-decoration: none;
    transition: background .16s ease, border-color .16s ease, color .16s ease;
  }

  .sub-link:hover {
    background: var(--cream-deep);
    border-color: var(--pine);
  }

  .sub-link.is-done {
    background: var(--sage-soft);
    border-color: var(--sage-line);
    color: var(--sage-deep);
  }

  .sub-link.is-done:hover {
    background: var(--sage-soft);
    border-color: var(--sage-deep);
  }

  .sub-status {
    margin: 8px 0 0;
    font-size: 12px;
    color: var(--muted);
  }

  .panel-enter {
    animation: rise .38s ease both;
  }

  @keyframes rise {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .flow-error {
    margin: 12px 0 0;
    padding: 10px 12px;
    border: 1px solid #E7C2B5;
    border-radius: 8px;
    background: #F9E9E3;
    color: #8F3A26;
    font-size: 13px;
  }

  .native-wrap {
    background: var(--warm-white);
    border: 1px solid var(--line);
    border-radius: 18px;
    padding: 14px;
    margin-top: 16px;
  }

  .page-footer {
    border-top: 1px solid var(--line);
    margin-top: 28px;
    padding-top: 16px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    color: var(--muted);
  }

  .page-footer strong { color: var(--pine); }

  @media (min-width: 600px) {
    .ad-320 { display: none; }
    .ad-468 { display: flex; }
    .ad-300 { margin-top: 22px; }
  }

  @media (min-width: 900px) {
    .ad-728 { display: flex; }
    .ad-320 { display: none; }
    .page { padding-top: 26px; }
    .flow-card { padding: 32px 36px; }
    .file-card { padding: 30px 36px; }
  }

  @media (max-width: 599px) {
    .ad-320 { display: flex; }
    .ad-468 { display: none; }
    .ad-728 { display: none; }
    .topbar { padding: 12px 16px; }
    .host { display: none; }
    .page { width: calc(100% - 24px); }
    .file-card { border-radius: 14px; }
    .flow-card { border-radius: 14px; }
    .btn { width: 100%; }
    .btn-note { max-width: none; }
    .sub-item { align-items: flex-start; flex-wrap: wrap; }
    .sub-link { width: 100%; min-height: 44px; }
  }

  @media (min-width: 1280px) {
    .page {
      width: min(100% - 48px, 1180px);
      grid-template-columns: minmax(0, 820px) 160px;
      justify-content: center;
      align-items: start;
      gap: 28px;
    }

    .ad-rail-stack {
      display: flex;
      flex-direction: column;
      gap: 18px;
      grid-column: 2;
      grid-row: 1 / span 2;
      align-self: start;
    }

    .ad-rail-stack .ad-slot { margin: 0; }

    .main {
      grid-column: 1;
      grid-row: 1 / span 2;
    }
  }

  @media (max-width: 359px) {
    .page { width: 100%; }

    .file-card,
    .flow-card,
    .native-wrap,
    .page-footer {
      margin-left: 10px;
      margin-right: 10px;
    }

    .ad-320 .ad-body { width: 320px; min-height: 50px; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .01ms !important;
    }
  }
</style>
</head>
<body>

<header class="topbar">
  <div class="brand">
    <span class="mark" aria-hidden="true">V</span>
    <span>Vrizlink</span>
    <span class="brand-tag">Safelink</span>
  </div>
  <span class="host">${escapeHtml(host)}</span>
</header>

<div class="page">
  <main class="main">
    <div class="ad-slot ad-728" aria-label="Iklan">
      <span class="ad-label">Iklan</span>
      <div class="ad-body">${ads.banner728}</div>
    </div>
    <div class="ad-slot ad-320" aria-label="Iklan">
      <span class="ad-label">Iklan</span>
      <div class="ad-body">${ads.banner320}</div>
    </div>

    <section class="file-card" aria-labelledby="file-title">
      <div class="file-top">
        <span class="file-kind">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1L10.9 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            <path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          Tautan asli
        </span>
        <span class="file-status">Tautan aktif</span>
      </div>
      <h1 id="file-title">${safeTitle}</h1>
      <p class="file-lede">Selesaikan dua langkah singkat. Setelah itu tombol buka tautan mengarah ke sumber asli.</p>
    </section>

    <section class="flow-card" aria-labelledby="flow-title">
      <div class="flow-step">
        <span class="step-count" id="flow-title">Langkah 1 dari 2</span>
        <span class="step-dots" aria-hidden="true">
          <span class="step-dot is-active" data-dot="1"></span>
          <span class="step-dot" data-dot="2"></span>
        </span>
      </div>

      <div class="panel panel-enter" id="stage-wait">
        <h2 class="wait-head" tabindex="-1">Tunggu<em>.</em><em>.</em><em>.</em></h2>
        <p class="wait-note">Setelah hitungan, subscribe ke dua kanal YouTube untuk membuka Get Link.</p>
        <div class="count-row">
          <span class="count-value" id="count-wait" aria-hidden="true">${WAIT_SECONDS}</span>
          <span class="count-unit">detik</span>
        </div>
        <div class="progress" role="progressbar" aria-label="Menunggu" aria-valuemin="0" aria-valuemax="${WAIT_SECONDS}" aria-valuenow="0" id="bar-wait">
          <div class="progress-bar" id="bar-wait-fill"></div>
        </div>
      </div>

      <div class="panel" id="stage-gate" hidden>
        <h2 class="wait-head" id="gate-title" tabindex="-1">Siap. <em>Subscribe dua kanal.</em></h2>
        <p class="wait-note" id="gate-note">Subscribe ke kedua kanal YouTube di bawah untuk membuka tombol Get Link.</p>
        <ul class="sub-list" aria-label="Kanal YouTube yang perlu dibuka">
          <li class="sub-item">
            <div class="sub-text">
              <span class="sub-label">Kanal 1</span>
              <strong class="sub-name">@vrizchanel</strong>
            </div>
            <a class="sub-link" href="https://www.youtube.com/@vrizchanel?sub_confirmation=1" target="_blank" rel="noopener noreferrer" data-sub="1" aria-label="Subscribe ke @vrizchanel di YouTube, buka tab baru">
              <span class="sub-link-label">Subscribe</span>
            </a>
          </li>
          <li class="sub-item">
            <div class="sub-text">
              <span class="sub-label">Kanal 2</span>
              <strong class="sub-name">@rizzofcc</strong>
            </div>
            <a class="sub-link" href="https://www.youtube.com/@rizzofcc?sub_confirmation=1" target="_blank" rel="noopener noreferrer" data-sub="2" aria-label="Subscribe ke @rizzofcc di YouTube, buka tab baru">
              <span class="sub-link-label">Subscribe</span>
            </a>
          </li>
        </ul>
        <p class="sub-status" id="sub-status" role="status">0 dari 2 kanal dibuka.</p>
        <div class="action-row">
          <a class="btn is-locked" id="get-link" href="${escapeHtml(SMARTLINK_URL)}" target="_blank" rel="noopener noreferrer" aria-disabled="true" aria-describedby="get-link-note">
            Get Link
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M14 5h5v5M19 5l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </a>
          <span class="btn-note" id="get-link-note">Get Link aktif setelah kedua kanal dibuka.</span>
        </div>
      </div>

      <div class="panel" id="stage-final" hidden>
        <h2 class="wait-head" tabindex="-1">Final<em>.</em><em>.</em><em>.</em></h2>
        <p class="wait-note">Hitungan terakhir. Tombol buka tautan muncul setelah selesai.</p>
        <div class="count-row">
          <span class="count-value" id="count-final" aria-hidden="true">${FINAL_SECONDS}</span>
          <span class="count-unit">detik</span>
        </div>
        <div class="progress" role="progressbar" aria-label="Hitungan final" aria-valuemin="0" aria-valuemax="${FINAL_SECONDS}" aria-valuenow="0" id="bar-final">
          <div class="progress-bar" id="bar-final-fill"></div>
        </div>
      </div>

      <div class="panel" id="stage-download" hidden>
        <h2 class="wait-head" tabindex="-1">Tautan siap<em>.</em></h2>
        <p class="wait-note">Tombol ini membuka tautan asli di tab ini.</p>
        <div class="action-row">
          <button class="btn" type="button" id="download-btn">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M14 5h5v5M19 5l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="btn-label">Buka Tautan</span>
          </button>
          <span class="btn-note">Anda akan diarahkan ke tautan asli.</span>
        </div>
        <p class="flow-error" id="download-error" hidden role="alert">Gagal membuka tautan. Periksa koneksi, lalu coba lagi.</p>
      </div>

      <p class="sr-only" id="announcer" role="status" aria-live="polite"></p>
    </section>

    <div class="ad-slot ad-300" aria-label="Iklan">
      <span class="ad-label">Iklan</span>
      <div class="ad-body">${ads.banner300}</div>
    </div>

    <div class="native-wrap">
      <span class="ad-label">Iklan</span>
      <div class="ad-slot ad-native" aria-label="Iklan">
        <div class="ad-body">${ads.native}</div>
      </div>
    </div>

    <div class="ad-slot ad-468" aria-label="Iklan">
      <span class="ad-label">Iklan</span>
      <div class="ad-body">${ads.banner468}</div>
    </div>

    <footer class="page-footer">
      <span><strong>Vrizlink</strong> · safelink dua tahap</span>
      <span>Tautan dibuka dari sumber asli</span>
    </footer>
  </main>

  <aside class="ad-rail-stack" aria-label="Iklan">
    <div class="ad-slot ad-160x300">
      <span class="ad-label">Iklan</span>
      <div class="ad-body">${ads.banner160x300}</div>
    </div>
    <div class="ad-slot ad-160x600">
      <span class="ad-label">Iklan</span>
      <div class="ad-body">${ads.banner160x600}</div>
    </div>
  </aside>
</div>

<script>
(function () {
  'use strict';

  var WAIT_SECONDS = ${WAIT_SECONDS};
  var FINAL_SECONDS = ${FINAL_SECONDS};
  var COMPLETE_URL = '/api/shortlinks/${encodeURIComponent(code)}/complete';
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var stageWait = document.getElementById('stage-wait');
  var stageGate = document.getElementById('stage-gate');
  var stageFinal = document.getElementById('stage-final');
  var stageDownload = document.getElementById('stage-download');
  var countWait = document.getElementById('count-wait');
  var countFinal = document.getElementById('count-final');
  var barWait = document.getElementById('bar-wait');
  var barWaitFill = document.getElementById('bar-wait-fill');
  var barFinal = document.getElementById('bar-final');
  var barFinalFill = document.getElementById('bar-final-fill');
  var getLink = document.getElementById('get-link');
  var downloadBtn = document.getElementById('download-btn');
  var downloadLabel = downloadBtn.querySelector('.btn-label');
  var downloadError = document.getElementById('download-error');
  var announcer = document.getElementById('announcer');
  var stepTitle = document.getElementById('flow-title');
  var dots = Array.prototype.slice.call(document.querySelectorAll('.step-dot'));
  var gateTitle = document.getElementById('gate-title');
  var gateNote = document.getElementById('gate-note');
  var getLinkNote = document.getElementById('get-link-note');
  var subLinks = Array.prototype.slice.call(document.querySelectorAll('.sub-link'));
  var subStatus = document.getElementById('sub-status');
  var openedSubs = {};
  var finalStarted = false;

  function announce(text) {
    announcer.textContent = '';
    window.setTimeout(function () { announcer.textContent = text; }, 40);
  }

  function showPanel(panel) {
    [stageWait, stageGate, stageFinal, stageDownload].forEach(function (node) {
      node.hidden = node !== panel;
    });
    if (!reducedMotion) {
      panel.classList.remove('panel-enter');
      void panel.offsetWidth;
      panel.classList.add('panel-enter');
    }
    var heading = panel.querySelector('h2');
    if (heading) heading.focus({ preventScroll: true });
  }

  function setDots(stage) {
    dots.forEach(function (dot, index) {
      var number = index + 1;
      dot.classList.toggle('is-active', number === stage);
      dot.classList.toggle('is-done', number < stage);
    });
    stepTitle.textContent = 'Langkah ' + stage + ' dari 2';
  }

  function openedSubCount() {
    return Object.keys(openedSubs).length;
  }

  function allSubsOpened() {
    return openedSubCount() >= subLinks.length;
  }

  function updateGate() {
    var opened = openedSubCount();
    var total = subLinks.length;

    if (allSubsOpened()) {
      subStatus.textContent = total + ' dari ' + total + ' kanal dibuka. Get Link aktif.';
      getLink.removeAttribute('aria-disabled');
      getLink.classList.remove('is-locked');
      gateTitle.innerHTML = 'Siap. <em>Ambil link.</em>';
      gateNote.textContent = 'Kedua kanal sudah dibuka. Get Link membuka halaman sponsor di tab baru.';
      getLinkNote.textContent = 'Kembali ke tab ini setelah halaman sponsor ditutup.';
      return;
    }

    subStatus.textContent = opened + ' dari ' + total + ' kanal dibuka.';
    getLink.setAttribute('aria-disabled', 'true');
    getLink.classList.add('is-locked');
    gateTitle.innerHTML = 'Siap. <em>Subscribe dua kanal.</em>';
    gateNote.textContent = 'Subscribe ke kedua kanal YouTube di bawah untuk membuka tombol Get Link.';
    getLinkNote.textContent = 'Get Link aktif setelah kedua kanal dibuka.';
  }

  subLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      var handle = link.closest('.sub-item').querySelector('.sub-name').textContent;
      openedSubs[link.getAttribute('data-sub')] = true;
      link.classList.add('is-done');
      link.querySelector('.sub-link-label').textContent = 'Buka lagi';
      link.setAttribute('aria-label', 'Buka lagi kanal ' + handle + ' di YouTube');
      updateGate();
    });
  });

  updateGate();

  function runCountdown(options) {
    var seconds = options.seconds;
    var output = options.output;
    var bar = options.bar;
    var fill = options.fill;
    var startedAt = Date.now();
    var lastShown = -1;

    output.textContent = String(seconds);
    bar.setAttribute('aria-valuenow', '0');
    fill.style.width = '0%';

    var timer = window.setInterval(function () {
      var elapsed = (Date.now() - startedAt) / 1000;
      var remaining = Math.max(0, Math.ceil(seconds - elapsed));
      var done = seconds - remaining;

      if (remaining !== lastShown) {
        lastShown = remaining;
        output.textContent = String(remaining);
        bar.setAttribute('aria-valuenow', String(done));
        fill.style.width = Math.min(100, (done / seconds) * 100) + '%';
      }

      if (remaining <= 0) {
        window.clearInterval(timer);
        options.onDone();
      }
    }, 200);
  }

  function startFinalCountdown() {
    if (finalStarted) return;
    finalStarted = true;
    setDots(2);
    showPanel(stageFinal);
    announce('Hitungan terakhir dimulai. ' + FINAL_SECONDS + ' detik.');
    runCountdown({
      seconds: FINAL_SECONDS,
      output: countFinal,
      bar: barFinal,
      fill: barFinalFill,
      onDone: function () {
        showPanel(stageDownload);
        announce('Tombol Buka Tautan tersedia.');
        downloadBtn.focus({ preventScroll: true });
      }
    });
  }

  announce('Tunggu ' + WAIT_SECONDS + ' detik untuk membuka tombol Get Link.');
  runCountdown({
    seconds: WAIT_SECONDS,
    output: countWait,
    bar: barWait,
    fill: barWaitFill,
    onDone: function () {
      showPanel(stageGate);
      announce('Waktu tunggu selesai. Subscribe ke kedua kanal YouTube untuk membuka tombol Get Link.');
      if (allSubsOpened()) {
        getLink.focus({ preventScroll: true });
      } else {
        subLinks[0].focus({ preventScroll: true });
      }
    }
  });

  getLink.addEventListener('click', function (event) {
    if (getLink.getAttribute('aria-disabled') === 'true') {
      event.preventDefault();
      announce('Subscribe ke kedua kanal YouTube dulu.');
      return;
    }
    startFinalCountdown();
  });

  downloadBtn.addEventListener('click', function () {
    if (downloadBtn.classList.contains('is-loading')) return;
    downloadBtn.classList.add('is-loading');
    downloadBtn.disabled = true;
    downloadLabel.textContent = 'Membuka...';
    downloadError.hidden = true;

    fetch(COMPLETE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    })
      .then(function (response) {
        return response.json().then(function (data) {
          return { ok: response.ok, data: data };
        });
      })
      .then(function (result) {
        if (!result.ok || !result.data.url) {
          throw new Error('invalid');
        }
        window.location.href = result.data.url;
      })
      .catch(function () {
        downloadBtn.classList.remove('is-loading');
        downloadBtn.disabled = false;
        downloadLabel.textContent = 'Coba lagi';
        downloadError.hidden = false;
      });
  });
})();
</script>
${ads.socialBar}
</body>
</html>`;
}

function renderErrorPage({ title, message, baseUrl }) {
  let host = 'vriz.my.id';
  try {
    host = new URL(baseUrl).host;
  } catch (error) {
    host = baseUrl;
  }

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="robots" content="noindex, nofollow">
<title>${escapeHtml(title)} | Vrizlink</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --pine: #1E352C;
    --cream: #F6F0E4;
    --warm-white: #FFFDF8;
    --ink: #1F2A24;
    --muted: #5C665F;
    --line: #DCD3C2;
    --coral-deep: #A8452F;
    --serif: "Instrument Serif", Georgia, serif;
    --sans: "Plus Jakarta Sans", system-ui, sans-serif;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100dvh;
    display: grid;
    place-items: center;
    padding: 24px;
    background: var(--cream);
    color: var(--ink);
    font-family: var(--sans);
  }
  .card {
    width: min(100%, 520px);
    background: var(--warm-white);
    border: 1px solid var(--line);
    border-radius: 18px;
    padding: 32px;
    box-shadow: 0 24px 40px -34px rgba(31, 42, 36, .6);
  }
  .mark {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 9px;
    background: var(--pine);
    color: var(--cream);
    font-family: var(--serif);
    font-size: 25px;
    margin-bottom: 20px;
  }
  h1 {
    margin: 0 0 8px;
    font-family: var(--serif);
    font-weight: 400;
    font-size: clamp(32px, 7vw, 44px);
    line-height: 1.08;
  }
  p { margin: 0; color: var(--muted); line-height: 1.65; }
  .host { margin-top: 24px; padding-top: 14px; border-top: 1px solid var(--line); font-size: 12px; color: var(--muted); }
  a { color: var(--coral-deep); font-weight: 600; }
</style>
</head>
<body>
  <main class="card">
    <div class="mark" aria-hidden="true">V</div>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
    <p class="host">${escapeHtml(host)} · Vrizlink</p>
  </main>
</body>
</html>`;
}

module.exports = { renderSafelink, renderErrorPage, SMARTLINK_URL, WAIT_SECONDS, FINAL_SECONDS };
