/**
 * Credora Finance — Dashboard Operations & Interactive Management
 * Handles Admin Operations Center & Customer Personal Workspace
 */

document.addEventListener('DOMContentLoaded', () => {
  initUserSession();
  initDashboardSidebar();
  initDashboardTabs();
  initApplicationFilters();
  initBorrowerSearch();
  initEmailCenter();
  initAdminCharts();
  initCustomerCalendar();
  initLogout();
  initDemoModals();
});

/**
 * Dynamic User Session & Logged-in Email Synchronization
 */
function initUserSession() {
  const authEmail = sessionStorage.getItem('credora_auth_email');
  const demoUser = sessionStorage.getItem('credora_demo_user');
  let email = authEmail;
  let name = '';

  if (demoUser) {
    try {
      const parsed = JSON.parse(demoUser);
      if (parsed.email) email = parsed.email;
      if (parsed.name) name = parsed.name;
    } catch (_) {}
  }

  if (!email && authEmail) email = authEmail;

  const isAdminPage = window.location.pathname.includes('admin');
  if (!email) {
    email = isAdminPage ? 'admin@stackly.com' : 'alex.morgan@credora-demo.com';
  }

  if (!name && email) {
    const userPart = email.split('@')[0];
    name = userPart.split(/[._-]/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  }

  // Update in Sidebar User Card
  document.querySelectorAll('.user-display-name').forEach(el => {
    el.textContent = name;
  });

  document.querySelectorAll('.user-display-email').forEach(el => {
    el.textContent = email;
  });

  // Update in Welcome headers
  document.querySelectorAll('.welcome-user-name').forEach(el => {
    el.textContent = name;
  });
  document.querySelectorAll('.welcome-user-email').forEach(el => {
    el.textContent = email;
  });
}

/**
 * Mobile Sidebar Toggle & Active Route with Background Scroll Lock
 */
function initDashboardSidebar() {
  const sidebar = document.querySelector('.dashboard-sidebar');
  const toggleBtn = document.querySelector('.sidebar-toggle-btn');
  if (!sidebar) return;

  // Dedicated backdrop overlay to lock background
  let backdrop = document.querySelector('.sidebar-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
  }

  function openSidebar() {
    sidebar.classList.add('mobile-open');
    backdrop.classList.add('active');
    document.body.classList.add('sidebar-open');
    document.documentElement.classList.add('sidebar-open');
  }

  function closeSidebar() {
    sidebar.classList.remove('mobile-open');
    backdrop.classList.remove('active');
    document.body.classList.remove('sidebar-open');
    document.documentElement.classList.remove('sidebar-open');
  }

  window.closeDashboardSidebar = closeSidebar;

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (sidebar.classList.contains('mobile-open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  backdrop.addEventListener('click', closeSidebar);
  backdrop.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target)) && sidebar.classList.contains('mobile-open')) {
      closeSidebar();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && sidebar.classList.contains('mobile-open')) {
      closeSidebar();
    }
  });
}

/**
 * Dynamic Tab & Section View Switcher (5 Main Full Sections)
 */
function initDashboardTabs() {
  const sidebarLinks = document.querySelectorAll('.dashboard-sidebar .sidebar-link[data-target-view]');
  const sections = document.querySelectorAll('.dashboard-section');

  function activateView(targetId) {
    if (!targetId) return;

    // Update link active states
    sidebarLinks.forEach(l => {
      if (l.getAttribute('data-target-view') === targetId) {
        l.classList.add('active');
      } else {
        l.classList.remove('active');
      }
    });

    // Show targeted section
    let found = false;
    sections.forEach(sec => {
      if (sec.id === targetId) {
        sec.classList.add('active');
        sec.style.display = 'block';
        found = true;
      } else {
        sec.classList.remove('active');
        sec.style.display = 'none';
      }
    });

    if (found) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Close mobile sidebar and unlock background if open
    if (typeof window.closeDashboardSidebar === 'function') {
      window.closeDashboardSidebar();
    } else {
      const sidebar = document.querySelector('.dashboard-sidebar');
      if (sidebar) sidebar.classList.remove('mobile-open');
      document.body.classList.remove('sidebar-open');
      document.documentElement.classList.remove('sidebar-open');
    }
  }

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('data-target-view');
      activateView(targetId);
      if (window.history && window.history.pushState) {
        window.history.pushState(null, null, '#' + targetId);
      }
    });
  });

  // Handle direct hash navigation on load
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && document.getElementById(initialHash)) {
    activateView(initialHash);
  } else {
    // Default active section display
    sections.forEach((sec, idx) => {
      if (sec.classList.contains('active') || idx === 0) {
        sec.style.display = 'block';
      } else {
        sec.style.display = 'none';
      }
    });
  }
}

/**
 * Application Review Queue Search & Status Filtering
 */
function initApplicationFilters() {
  const searchInput = document.getElementById('appSearchInput');
  const statusFilter = document.getElementById('appStatusFilter');
  const tableRows = document.querySelectorAll('#applicationsTableBody tr');

  function filterTable() {
    if (!tableRows.length) return;
    const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const statusVal = statusFilter ? statusFilter.value.toLowerCase().trim() : 'all';

    tableRows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const rowStatus = (row.getAttribute('data-status') || '').toLowerCase();

      const matchesSearch = !searchVal || text.includes(searchVal);
      const matchesStatus = statusVal === 'all' || rowStatus === statusVal;

      row.style.display = matchesSearch && matchesStatus ? '' : 'none';
    });
  }

  if (searchInput) searchInput.addEventListener('input', filterTable);
  if (statusFilter) statusFilter.addEventListener('change', filterTable);

  // Application Action Modal (Admin Underwriting Demo)
  const appModal = document.getElementById('applicationActionModal');
  const inspectBtns = document.querySelectorAll('.btn-inspect-app');
  let selectedRow = null;

  inspectBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedRow = btn.closest('tr');
      const appId = selectedRow.getAttribute('data-app-id');
      const applicant = selectedRow.getAttribute('data-applicant');
      const amount = selectedRow.getAttribute('data-amount');
      const category = selectedRow.getAttribute('data-category');
      const currentStatus = selectedRow.getAttribute('data-status');

      const modalTitle = document.getElementById('appModalId');
      const modalApplicant = document.getElementById('appModalApplicant');
      const modalAmount = document.getElementById('appModalAmount');
      const modalCategory = document.getElementById('appModalCategory');

      if (modalTitle) modalTitle.textContent = appId;
      if (modalApplicant) modalApplicant.textContent = applicant;
      if (modalAmount) modalAmount.textContent = amount;
      if (modalCategory) modalCategory.textContent = category;

      if (appModal) appModal.style.display = 'flex';
    });
  });

  const btnApprove = document.getElementById('btnApproveApplication');
  const btnReject = document.getElementById('btnRejectApplication');

  if (btnApprove && appModal) {
    btnApprove.addEventListener('click', () => {
      if (selectedRow) {
        selectedRow.setAttribute('data-status', 'approved');
        const badge = selectedRow.querySelector('.badge');
        if (badge) {
          badge.className = 'badge badge-success';
          badge.textContent = 'Approved';
        }
      }
      appModal.style.display = 'none';
      if (window.showToast) window.showToast('Application marked as APPROVED (Demo)', 'success');
    });
  }

  if (btnReject && appModal) {
    btnReject.addEventListener('click', () => {
      if (selectedRow) {
        selectedRow.setAttribute('data-status', 'rejected');
        const badge = selectedRow.querySelector('.badge');
        if (badge) {
          badge.className = 'badge badge-danger';
          badge.textContent = 'Rejected';
        }
      }
      appModal.style.display = 'none';
      if (window.showToast) window.showToast('Application marked as REJECTED (Demo)', 'error');
    });
  }
}

/**
 * Borrower Directory Search Filter
 */
function initBorrowerSearch() {
  const searchInput = document.getElementById('borrowerSearchInput');
  const rows = document.querySelectorAll('#borrowersTableBody tr');

  if (searchInput && rows.length) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      rows.forEach(r => {
        r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }
}

/**
 * Email Center (Admin & Customer Inboxes)
 */
function initEmailCenter() {
  const emailItems = document.querySelectorAll('.email-item');
  const detailTitle = document.querySelector('.email-detail-title');
  const detailSender = document.querySelector('.email-detail-sender');
  const detailTime = document.querySelector('.email-detail-time');
  const detailBody = document.querySelector('.email-detail-body');
  const emailSearch = document.querySelector('.email-search-bar input');
  const folderBtns = document.querySelectorAll('.email-folder-btn');

  emailItems.forEach(item => {
    item.addEventListener('click', () => {
      emailItems.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');

      const sender = item.getAttribute('data-sender') || 'Operations Team';
      const subject = item.getAttribute('data-subject') || 'Notification';
      const time = item.getAttribute('data-time') || 'Today';
      const body = item.getAttribute('data-body') || item.querySelector('.email-preview')?.textContent;

      if (detailTitle) detailTitle.textContent = subject;
      if (detailSender) detailSender.textContent = `From: ${sender}`;
      if (detailTime) detailTime.textContent = time;
      if (detailBody) detailBody.innerHTML = `<p>${body}</p><p class="mt-3 text-muted" style="font-size:0.8rem;">[This is an automated demonstration message generated by the Credora Core Banking Simulator]</p>`;

      const unreadDot = item.querySelector('.unread-dot');
      if (unreadDot) unreadDot.remove();
    });
  });

  if (emailSearch) {
    emailSearch.addEventListener('input', () => {
      const q = emailSearch.value.toLowerCase().trim();
      emailItems.forEach(it => {
        it.style.display = it.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }

  folderBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      folderBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const folderName = btn.getAttribute('data-folder');
      if (window.showToast) window.showToast(`Switched to ${folderName} folder`, 'info');
    });
  });
}

/**
 * Admin Operational Charts via Chart.js
 */
function initAdminCharts() {
  const lineCanvas = document.getElementById('portfolioTrendsChart');
  const barCanvas = document.getElementById('disbursementProductChart');

  if (typeof Chart === 'undefined') return;

  if (lineCanvas) {
    new Chart(lineCanvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        datasets: [
          {
            label: 'Disbursements ($M)',
            data: [1.2, 1.4, 1.3, 1.8, 2.1, 2.4, 2.8, 3.2, 3.6, 4.1],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.35,
            borderWidth: 3
          },
          {
            label: 'Repayments ($M)',
            data: [0.9, 1.1, 1.2, 1.4, 1.7, 1.9, 2.2, 2.6, 3.0, 3.4],
            borderColor: '#3B82F6',
            backgroundColor: 'transparent',
            tension: 0.35,
            borderWidth: 2,
            borderDash: [5, 5]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#CBD5E1', font: { family: 'Plus Jakarta Sans' } } }
        },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94A3B8' } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94A3B8' } }
        }
      }
    });
  }

  if (barCanvas) {
    new Chart(barCanvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['SME Commercial', 'Personal Loan', 'Education Credit', 'Working Capital'],
        datasets: [{
          data: [42, 35, 15, 8],
          backgroundColor: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'],
          borderColor: '#0F1A36',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#CBD5E1', padding: 14 } }
        },
        cutout: '65%'
      }
    });
  }
}

/**
 * Customer Payment Calendar Widget
 */
function initCustomerCalendar() {
  const calGrid = document.getElementById('customerPaymentCalendar');
  if (!calGrid) return;

  const daysInMonth = 30; // Demonstration standard month
  const dueDay = 18; // Simulated upcoming EMI day

  let html = `
    <div class="cal-day-name">Sun</div>
    <div class="cal-day-name">Mon</div>
    <div class="cal-day-name">Tue</div>
    <div class="cal-day-name">Wed</div>
    <div class="cal-day-name">Thu</div>
    <div class="cal-day-name">Fri</div>
    <div class="cal-day-name">Sat</div>
  `;

  // Pad beginning days
  for (let p = 0; p < 3; p++) {
    html += `<div class="cal-day text-muted" style="opacity:0.3;">${28 + p}</div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const isDue = d === dueDay;
    html += `
      <div class="cal-day ${isDue ? 'due-day' : ''}" title="${isDue ? 'Monthly EMI Due: $684.50' : 'Regular Banking Day'}">
        <span>${d}</span>
      </div>
    `;
  }

  calGrid.innerHTML = html;
}

/**
 * Demo Modals (Statements & Receipts)
 */
function initDemoModals() {
  const modalCloses = document.querySelectorAll('.modal-close-btn');
  modalCloses.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-backdrop');
      if (modal) modal.style.display = 'none';
    });
  });

  const statementBtns = document.querySelectorAll('.btn-download-statement');
  const statementModal = document.getElementById('statementPreviewModal');

  statementBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const period = btn.getAttribute('data-period') || 'Q3 2026';
      const periodLabel = document.getElementById('statementModalPeriod');
      if (periodLabel) periodLabel.textContent = period;
      if (statementModal) statementModal.style.display = 'flex';
    });
  });

  const printBtn = document.getElementById('btnPrintStatementDemo');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      if (window.showToast) window.showToast('Generating demo PDF export...', 'info');
      setTimeout(() => {
        if (window.showToast) window.showToast('Demo statement download complete!', 'success');
      }, 1200);
    });
  }
}

/**
 * Logout Handler
 */
function initLogout() {
  const logoutBtns = document.querySelectorAll('.btn-logout');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.removeItem('credora_auth_role');
      sessionStorage.removeItem('credora_auth_email');
      if (window.showToast) {
        window.showToast('You have been logged out securely.', 'info');
      }
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 800);
    });
  });
}
