(function () {
  'use strict';

  var state = {
    config: null,
    links: [],
    loading: true,
    error: null,
    editingId: null,
    deletingId: null
  };

  var usernameEl = document.getElementById('username');
  var logoutBtn = document.getElementById('logout');
  var refreshBtn = document.getElementById('refresh');
  var linkCount = document.getElementById('link-count');
  var linkList = document.getElementById('link-list');
  var listLoading = document.getElementById('list-loading');
  var listError = document.getElementById('list-error');
  var listErrorText = document.getElementById('list-error-text');
  var listEmpty = document.getElementById('list-empty');
  var retryBtn = document.getElementById('retry-list');
  var emptyAction = document.getElementById('empty-action');

  var createForm = document.getElementById('create-form');
  var urlInput = document.getElementById('original-url');
  var titleInput = document.getElementById('title');
  var urlError = document.getElementById('url-error');
  var titleError = document.getElementById('title-error');
  var formError = document.getElementById('form-error');
  var createSubmit = document.getElementById('create-submit');
  var createLabel = createSubmit.querySelector('.button-label');

  var resultBox = document.getElementById('result');
  var resultTitle = document.getElementById('result-title');
  var resultFile = document.getElementById('result-file');
  var resultUrl = document.getElementById('result-url');
  var copyResult = document.getElementById('copy-result');
  var openResult = document.getElementById('open-result');
  var newLinkBtn = document.getElementById('new-link');

  var editDialog = document.getElementById('edit-dialog');
  var editForm = document.getElementById('edit-form');
  var editCode = document.getElementById('edit-code');
  var editUrl = document.getElementById('edit-url');
  var editTitle = document.getElementById('edit-title-field');
  var editUrlError = document.getElementById('edit-url-error');
  var editTitleError = document.getElementById('edit-title-error');
  var editError = document.getElementById('edit-error');
  var editSubmit = document.getElementById('edit-submit');

  var deleteDialog = document.getElementById('delete-dialog');
  var deleteName = document.getElementById('delete-name');
  var deleteError = document.getElementById('delete-error');
  var deleteSubmit = document.getElementById('delete-submit');

  var toast = document.getElementById('toast');
  var toastTimer = null;

  function api(path, options) {
    var config = options || {};
    var headers = config.body ? { 'Content-Type': 'application/json' } : {};

    return fetch(path, {
      method: config.method || 'GET',
      headers: headers,
      body: config.body
    }).then(function (response) {
      if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Sesi berakhir.');
      }
      return response.json().catch(function () { return {}; }).then(function (data) {
        if (!response.ok) {
          throw new Error(data.error || 'Permintaan gagal. Coba lagi.');
        }
        return data;
      });
    });
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    window.requestAnimationFrame(function () {
      toast.classList.add('is-visible');
    });
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
      window.setTimeout(function () { toast.hidden = true; }, 200);
    }, 2600);
  }

  function normalizeUrl(raw) {
    var value = String(raw || '').trim();
    if (!value) return '';

    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value) && !/^https?:\/\//i.test(value)) return null;
    if (!/^https?:\/\//i.test(value)) value = 'https://' + value;

    var parsed;
    try {
      parsed = new URL(value);
    } catch (error) {
      return null;
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    if (parsed.username || parsed.password) return null;

    return parsed.toString();
  }

  function setFieldError(input, node, message) {
    input.setAttribute('aria-invalid', 'true');
    node.textContent = message;
    node.hidden = false;
  }

  function clearFieldError(input, node) {
    input.removeAttribute('aria-invalid');
    node.textContent = '';
    node.hidden = true;
  }

  function resetCreateErrors() {
    clearFieldError(urlInput, urlError);
    clearFieldError(titleInput, titleError);
    formError.hidden = true;
    formError.textContent = '';
  }

  function formatDate(value) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function replaceLink(updated) {
    state.links = state.links.map(function (link) {
      return link.id === updated.id ? updated : link;
    });
  }

  function updateCount() {
    if (state.loading && state.links.length === 0) {
      linkCount.textContent = 'Memuat link...';
      return;
    }
    if (state.error && state.links.length === 0) {
      linkCount.textContent = 'Daftar tidak tersedia.';
      return;
    }
    var active = state.links.filter(function (link) {
      return link.status === 'active';
    }).length;
    linkCount.textContent = state.links.length + ' link · ' + active + ' aktif';
  }

  function makeAction(label, action, link, danger) {
    var button = el('button', 'item-action' + (danger ? ' is-danger' : ''), label);
    button.type = 'button';
    button.dataset.action = action;
    button.dataset.id = String(link.id);
    return button;
  }

  function buildLinkItem(link) {
    var item = el('li', 'link-item');
    item.dataset.id = String(link.id);

    var main = el('div', 'item-main');
    var titleRow = el('div', 'item-title-row');
    var heading = el('h3', 'item-title', link.title);
    var status = el(
      'span',
      'status status-' + link.status,
      link.status === 'active' ? 'Aktif' : 'Nonaktif'
    );
    titleRow.append(heading, status);

    var shortLink = el('a', 'item-link', link.short_url);
    shortLink.href = link.short_url;
    shortLink.target = '_blank';
    shortLink.rel = 'noopener noreferrer';

    var original = el('p', 'item-original', link.original_url);
    original.title = link.original_url;

    main.append(titleRow, shortLink, original);

    var side = el('div', 'item-side');
    var stats = el('dl', 'item-stats');

    var clicksWrap = el('div');
    clicksWrap.append(
      el('dt', null, 'Klik unduh'),
      el('dd', null, String(link.clicks))
    );

    var createdWrap = el('div');
    createdWrap.append(
      el('dt', null, 'Dibuat'),
      el('dd', null, formatDate(link.created_at))
    );

    stats.append(clicksWrap, createdWrap);

    var actions = el('div', 'item-actions');
    actions.append(
      makeAction('Salin', 'copy', link, false),
      makeAction('Edit', 'edit', link, false),
      makeAction(link.status === 'active' ? 'Nonaktifkan' : 'Aktifkan', 'toggle', link, false),
      makeAction('Hapus', 'delete', link, true)
    );

    side.append(stats, actions);
    item.append(main, side);
    return item;
  }

  function renderList() {
    updateCount();
    refreshBtn.disabled = state.loading;

    var hasLinks = state.links.length > 0;
    var showSkeleton = state.loading && !hasLinks;
    var showError = Boolean(state.error) && !hasLinks;
    var showEmpty = !state.loading && !state.error && !hasLinks;

    listLoading.hidden = !showSkeleton;
    listError.hidden = !showError;
    listEmpty.hidden = !showEmpty;
    linkList.hidden = !hasLinks;

    if (showError) {
      listErrorText.textContent = state.error;
    }

    linkList.textContent = '';
    if (hasLinks) {
      var fragment = document.createDocumentFragment();
      state.links.forEach(function (link) {
        fragment.append(buildLinkItem(link));
      });
      linkList.append(fragment);
    }
  }

  function loadLinks() {
    state.loading = true;
    state.error = null;
    renderList();

    return api('/api/shortlinks')
      .then(function (links) {
        state.links = Array.isArray(links) ? links : [];
      })
      .catch(function (error) {
        state.error = error.message || 'Gagal memuat daftar link.';
        if (state.links.length > 0) showToast(state.error);
      })
      .finally(function () {
        state.loading = false;
        renderList();
      });
  }

  function setCreateLoading(loading) {
    createSubmit.disabled = loading;
    createSubmit.classList.toggle('is-loading', loading);
    createLabel.textContent = loading ? 'Membuat shortlink...' : 'Buat shortlink';
  }

  function showResult(link) {
    resultFile.textContent = link.title;
    resultUrl.value = link.short_url;
    openResult.href = link.short_url;
    createForm.hidden = true;
    resultBox.hidden = false;
    resultTitle.focus({ preventScroll: true });
    resultBox.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'center'
    });
  }

  function hideResult(focusForm) {
    resultBox.hidden = true;
    createForm.hidden = false;
    if (focusForm) urlInput.focus();
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.append(area);
      area.select();

      try {
        var ok = document.execCommand('copy');
        area.remove();
        if (ok) resolve();
        else reject(new Error('copy failed'));
      } catch (error) {
        area.remove();
        reject(error);
      }
    });
  }

  function copyButtonFeedback(button, originalLabel, text) {
    copyText(text)
      .then(function () {
        button.textContent = 'Tersalin';
        showToast('Shortlink disalin ke clipboard.');
        window.setTimeout(function () {
          button.textContent = originalLabel;
        }, 1600);
      })
      .catch(function () {
        showToast('Gagal menyalin. Pilih teksnya secara manual.');
      });
  }

  createForm.addEventListener('submit', function (event) {
    event.preventDefault();
    resetCreateErrors();

    var normalizedUrl = normalizeUrl(urlInput.value);
    var title = titleInput.value.trim().replace(/\s+/g, ' ');
    var valid = true;

    if (!normalizedUrl) {
      setFieldError(
        urlInput,
        urlError,
        urlInput.value.trim()
          ? 'Masukkan URL yang valid, diawali http:// atau https://.'
          : 'Masukkan URL tautan asli.'
      );
      valid = false;
    }

    if (title.length < 2 || title.length > 160) {
      setFieldError(titleInput, titleError, 'Judul harus 2 sampai 160 karakter.');
      valid = false;
    }

    if (!valid) {
      var firstInvalid = createForm.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    setCreateLoading(true);

    api('/api/shortlinks', {
      method: 'POST',
      body: JSON.stringify({ original_url: normalizedUrl, title: title })
    })
      .then(function (created) {
        state.links.unshift(created);
        renderList();
        createForm.reset();
        showResult(created);
        showToast('Shortlink dibuat.');
      })
      .catch(function (error) {
        formError.textContent = error.message || 'Gagal membuat shortlink.';
        formError.hidden = false;
      })
      .finally(function () {
        setCreateLoading(false);
      });
  });

  [urlInput, titleInput].forEach(function (input) {
    input.addEventListener('input', function () {
      if (input === urlInput) clearFieldError(urlInput, urlError);
      if (input === titleInput) clearFieldError(titleInput, titleError);
      formError.hidden = true;
    });
  });

  copyResult.addEventListener('click', function () {
    copyButtonFeedback(copyResult, 'Copy Link', resultUrl.value);
  });

  newLinkBtn.addEventListener('click', function () {
    hideResult(true);
  });

  refreshBtn.addEventListener('click', function () {
    loadLinks();
  });

  retryBtn.addEventListener('click', function () {
    loadLinks();
  });

  emptyAction.addEventListener('click', function () {
    hideResult(false);
    urlInput.focus();
  });

  linkList.addEventListener('click', function (event) {
    var button = event.target.closest('button[data-action]');
    if (!button) return;

    var id = Number(button.dataset.id);
    var link = state.links.find(function (item) { return item.id === id; });
    if (!link) return;

    var action = button.dataset.action;

    if (action === 'copy') {
      copyButtonFeedback(button, 'Salin', link.short_url);
      return;
    }

    if (action === 'edit') {
      openEdit(link);
      return;
    }

    if (action === 'toggle') {
      toggleStatus(link, button);
      return;
    }

    if (action === 'delete') {
      openDelete(link);
    }
  });

  function toggleStatus(link, button) {
    var nextStatus = link.status === 'active' ? 'inactive' : 'active';
    button.disabled = true;

    api('/api/shortlinks/' + link.id, {
      method: 'PUT',
      body: JSON.stringify({ status: nextStatus })
    })
      .then(function (updated) {
        replaceLink(updated);
        renderList();
        showToast(nextStatus === 'active' ? 'Link diaktifkan.' : 'Link dinonaktifkan.');
        var restored = linkList.querySelector(
          'button[data-action="toggle"][data-id="' + link.id + '"]'
        );
        if (restored) restored.focus({ preventScroll: true });
      })
      .catch(function (error) {
        button.disabled = false;
        showToast(error.message || 'Gagal mengubah status.');
      });
  }

  function openEdit(link) {
    state.editingId = link.id;
    editCode.textContent = link.short_url;
    editUrl.value = link.original_url;
    editTitle.value = link.title;
    clearFieldError(editUrl, editUrlError);
    clearFieldError(editTitle, editTitleError);
    editError.hidden = true;
    editDialog.showModal();
    editTitle.focus();
    editTitle.select();
  }

  editForm.addEventListener('submit', function (event) {
    event.preventDefault();
    clearFieldError(editUrl, editUrlError);
    clearFieldError(editTitle, editTitleError);
    editError.hidden = true;

    var normalizedUrl = normalizeUrl(editUrl.value);
    var title = editTitle.value.trim().replace(/\s+/g, ' ');
    var valid = true;

    if (!normalizedUrl) {
      setFieldError(editUrl, editUrlError, 'Masukkan URL yang valid, diawali http:// atau https://.');
      valid = false;
    }

    if (title.length < 2 || title.length > 160) {
      setFieldError(editTitle, editTitleError, 'Judul harus 2 sampai 160 karakter.');
      valid = false;
    }

    if (!valid) {
      var firstInvalid = editForm.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    editSubmit.disabled = true;
    editSubmit.textContent = 'Menyimpan...';

    api('/api/shortlinks/' + state.editingId, {
      method: 'PUT',
      body: JSON.stringify({ original_url: normalizedUrl, title: title })
    })
      .then(function (updated) {
        replaceLink(updated);
        renderList();
        editDialog.close();
        showToast('Link diperbarui.');
        var row = linkList.querySelector('li[data-id="' + updated.id + '"]');
        var editAction = row && row.querySelector('button[data-action="edit"]');
        if (editAction) editAction.focus({ preventScroll: true });
      })
      .catch(function (error) {
        editError.textContent = error.message || 'Gagal menyimpan perubahan.';
        editError.hidden = false;
      })
      .finally(function () {
        editSubmit.disabled = false;
        editSubmit.textContent = 'Simpan perubahan';
      });
  });

  [editUrl, editTitle].forEach(function (input) {
    input.addEventListener('input', function () {
      if (input === editUrl) clearFieldError(editUrl, editUrlError);
      if (input === editTitle) clearFieldError(editTitle, editTitleError);
      editError.hidden = true;
    });
  });

  function openDelete(link) {
    state.deletingId = link.id;
    deleteName.textContent = link.title + ' · ' + link.short_url;
    deleteError.hidden = true;
    deleteSubmit.disabled = false;
    deleteSubmit.textContent = 'Hapus permanen';
    deleteDialog.showModal();
  }

  deleteSubmit.addEventListener('click', function () {
    if (!state.deletingId) return;

    deleteSubmit.disabled = true;
    deleteSubmit.textContent = 'Menghapus...';
    deleteError.hidden = true;

    api('/api/shortlinks/' + state.deletingId, { method: 'DELETE' })
      .then(function () {
        state.links = state.links.filter(function (link) {
          return link.id !== state.deletingId;
        });
        deleteDialog.close();
        renderList();
        showToast('Link dihapus.');
        state.deletingId = null;

        var nextFocus = linkList.querySelector('button[data-action="copy"]') || emptyAction;
        nextFocus.focus({ preventScroll: true });
      })
      .catch(function (error) {
        deleteError.textContent = error.message || 'Gagal menghapus link.';
        deleteError.hidden = false;
        deleteSubmit.disabled = false;
        deleteSubmit.textContent = 'Hapus permanen';
      });
  });

  document.querySelectorAll('[data-close]').forEach(function (button) {
    button.addEventListener('click', function () {
      var dialog = document.getElementById(button.dataset.close);
      if (dialog) dialog.close();
    });
  });

  [editDialog, deleteDialog].forEach(function (dialog) {
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });
  });

  editDialog.addEventListener('close', function () {
    state.editingId = null;
  });

  deleteDialog.addEventListener('close', function () {
    state.deletingId = null;
  });

  logoutBtn.addEventListener('click', function () {
    logoutBtn.disabled = true;
    logoutBtn.textContent = 'Keluar...';
    fetch('/logout', { method: 'POST' })
      .catch(function () { return null; })
      .finally(function () {
        window.location.href = '/login';
      });
  });

  api('/api/config')
    .then(function (config) {
      state.config = config;
      usernameEl.textContent = config.username || 'pengguna';
      document.getElementById('route-wait').textContent = String(config.waitSeconds || 20);
      document.getElementById('route-final').textContent = String(config.finalSeconds || 10);
    })
    .catch(function () {
      usernameEl.textContent = 'pengguna';
    });

  loadLinks();
})();
