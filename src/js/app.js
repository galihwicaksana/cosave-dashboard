/**
 * CoSave - Core Application Logic
 * Integrasi Hybrid Supabase & LocalStorage Fallback
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const totalBalanceEl = document.getElementById('totalBalance');
  const galihAmountEl = document.getElementById('galihAmount');
  const galihPercentEl = document.getElementById('galihPercent');
  const galihBarEl = document.getElementById('galihBar');
  
  const faraAmountEl = document.getElementById('faraAmount');
  const faraPercentEl = document.getElementById('faraPercent');
  const faraBarEl = document.getElementById('faraBar');
  
  const goalsContainer = document.getElementById('goalsContainer');
  const historyContainer = document.getElementById('historyContainer');
  const goalSelectEl = document.getElementById('goalSelect');
  
  // Modal Elements
  const modalOverlay = document.getElementById('modalOverlay');
  const goalModalOverlay = document.getElementById('goalModalOverlay');
  const openModalBtn = document.getElementById('openModalBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const openGoalModalBtn = document.getElementById('openGoalModalBtn');
  const closeGoalModalBtn = document.getElementById('closeGoalModalBtn');
  const transactionForm = document.getElementById('transactionForm');
  const goalForm = document.getElementById('goalForm');
  const amountInput = document.getElementById('amountInput');
  const proofInput = document.getElementById('proofInput');
  const proofPreviewContainer = document.getElementById('proofPreviewContainer');
  const proofPreviewImg = document.getElementById('proofPreviewImg');
  let selectedProofFile = null;

  // App State Initialization
  localStorage.removeItem('cosave_data');
  let store = initialData;

  // Format Currency Utility (IDR)
  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Theme Management
  const initTheme = () => {
    const currentTheme = localStorage.getItem('cosave_theme') || 'light';
    const logoImg = document.getElementById('seabankLogoImg');
    if (currentTheme === 'dark') {
      document.body.classList.add('dark-theme');
      themeToggleBtn.innerHTML = '<i class="ri-sun-line"></i>';
      if (logoImg) logoImg.src = 'public/seabank_icon.png';
    } else {
      document.body.classList.remove('dark-theme');
      themeToggleBtn.innerHTML = '<i class="ri-moon-line"></i>';
      if (logoImg) logoImg.src = 'public/seabank_icon_white.png';
    }
  };

  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('cosave_theme', isDark ? 'dark' : 'light');
    themeToggleBtn.innerHTML = isDark ? '<i class="ri-sun-line"></i>' : '<i class="ri-moon-line"></i>';
    const logoImg = document.getElementById('seabankLogoImg');
    if (logoImg) {
      logoImg.src = isDark ? 'public/seabank_icon.png' : 'public/seabank_icon_white.png';
    }
  });

  // Load Data from Supabase if available
  const syncWithSupabase = async () => {
    try {
      const dbTxList = await SupabaseService.getTransactions();
      const dbGoals = await SupabaseService.getGoals();

      if (dbTxList && dbTxList.length >= 0) {
        store.transactions = dbTxList;
      }
      if (dbGoals && dbGoals.length > 0) {
        store.goals = dbGoals;
      }
    } catch (err) {
      console.warn("Using local cache / initial data:", err);
    }
    renderDashboard();
  };

  // Render Dashboard
  const renderDashboard = () => {
    let totalBalance = 0;
    let galihTotal = 0;
    let faraTotal = 0;

    store.transactions.forEach(tx => {
      const amt = Number(tx.amount);
      if (tx.type === 'income') {
        totalBalance += amt;
        if (tx.userId === 'galih') galihTotal += amt;
        if (tx.userId === 'fara') faraTotal += amt;
      } else {
        totalBalance -= amt;
        if (tx.userId === 'galih') galihTotal -= amt;
        if (tx.userId === 'fara') faraTotal -= amt;
      }
    });

    totalBalanceEl.textContent = formatRupiah(totalBalance);
    
    // Calculate Contributions
    const sumContributions = galihTotal + faraTotal;
    const galihPct = sumContributions > 0 ? Math.round((galihTotal / sumContributions) * 100) : 50;
    const faraPct = sumContributions > 0 ? Math.round((faraTotal / sumContributions) * 100) : 50;

    galihAmountEl.textContent = formatRupiah(galihTotal);
    galihPercentEl.textContent = `${galihPct}% Kontribusi`;
    galihBarEl.style.width = `${Math.max(galihPct, 5)}%`;

    faraAmountEl.textContent = formatRupiah(faraTotal);
    faraPercentEl.textContent = `${faraPct}% Kontribusi`;
    faraBarEl.style.width = `${Math.max(faraPct, 5)}%`;

    renderGoals();
    renderHistory();
    populateGoalOptions();

    localStorage.setItem('cosave_data', JSON.stringify(store));
  };

  // Populate Goal Dropdown in Form
  const populateGoalOptions = () => {
    goalSelectEl.innerHTML = '<option value="">Umum (Tanpa Goal Spesifik)</option>';
    store.goals.forEach(goal => {
      const opt = document.createElement('option');
      opt.value = goal.id;
      opt.textContent = `${goal.icon} ${goal.title}`;
      goalSelectEl.appendChild(opt);
    });
  };

  // Render Goal Cards with Edit & Delete Actions
  const renderGoals = () => {
    goalsContainer.innerHTML = '';
    store.goals.forEach(goal => {
      let currentProgress = 0;
      store.transactions.forEach(tx => {
        if (tx.goalId === goal.id) {
          if (tx.type === 'income') currentProgress += Number(tx.amount);
          else currentProgress -= Number(tx.amount);
        }
      });
      if (currentProgress < 0) currentProgress = 0;

      const pct = Math.min(Math.round((currentProgress / goal.targetAmount) * 100), 100);

      const goalCard = document.createElement('div');
      goalCard.className = 'goal-card';
      goalCard.innerHTML = `
        <div class="goal-header">
          <div class="goal-icon-title">
            <div class="goal-icon">${goal.icon}</div>
            <div>
              <div class="goal-title">${goal.title}</div>
              <span class="badge badge-seabank">${pct}% Tercapai</span>
            </div>
          </div>
          <div style="display: flex; gap: 4px;">
            <button class="btn-action-icon btn-edit-goal" data-id="${goal.id}" title="Edit Target"><i class="ri-pencil-line"></i></button>
            <button class="btn-action-icon btn-delete-goal" data-id="${goal.id}" title="Hapus Target"><i class="ri-delete-bin-line"></i></button>
          </div>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${pct}%; background: ${goal.color || 'var(--primary)'};"></div>
        </div>
        <div class="goal-numbers">
          <span>Terkumpul: <strong class="goal-current">${formatRupiah(currentProgress)}</strong></span>
          <span>Target: ${formatRupiah(goal.targetAmount)}</span>
        </div>
      `;
      goalsContainer.appendChild(goalCard);
    });

    // Edit Goal Handler
    document.querySelectorAll('.btn-edit-goal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const goalId = btn.getAttribute('data-id');
        const targetGoal = store.goals.find(g => g.id === goalId);
        if (targetGoal) {
          editingGoalId = goalId;
          document.getElementById('goalTitleInput').value = targetGoal.title;
          document.getElementById('goalTargetInput').value = targetGoal.targetAmount;
          document.getElementById('goalIconInput').value = targetGoal.icon || '🎯';
          document.querySelector('#goalModalOverlay h3').innerHTML = '<i class="ri-pencil-line" style="color: var(--primary);"></i> Edit Target Tabungan';
          goalModalOverlay.classList.add('active');
        }
      });
    });

    // Delete Goal Handler
    document.querySelectorAll('.btn-delete-goal').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const goalId = btn.getAttribute('data-id');
        if (confirm("Apakah Anda yakin ingin menghapus target tabungan ini?")) {
          await SupabaseService.deleteGoal(goalId);
          store.goals = store.goals.filter(g => g.id !== goalId);
          renderDashboard();
        }
      });
    });
  };

  // Render History Items with Edit & Delete Actions
  const renderHistory = () => {
    historyContainer.innerHTML = '';
    const sortedTx = [...store.transactions].reverse();

    if (sortedTx.length === 0) {
      historyContainer.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--text-muted);">
          Belum ada riwayat transaksi. Klik (+) untuk menambah tabungan!
        </div>
      `;
      return;
    }

    sortedTx.forEach(tx => {
      const isIncome = tx.type === 'income';
      const iconClass = isIncome ? 'type-income' : 'type-expense';
      const iconName = isIncome ? 'ri-add-line' : 'ri-subtract-line';
      const amountClass = isIncome ? 'amount-plus' : 'amount-minus';
      const prefix = isIncome ? '+' : '-';

      const item = document.createElement('div');
      item.className = 'history-item';
      item.innerHTML = `
        <div class="history-left">
          <div class="history-type-icon ${iconClass}">
            <i class="${iconName}"></i>
          </div>
          <div class="history-details">
            <div class="history-category">${tx.category}</div>
            <div class="history-meta">
              <span><strong>${tx.userName}</strong></span> • 
              <span>${tx.date}</span>
            </div>
            ${tx.note ? `<div class="history-note">"${tx.note}"</div>` : ''}
            ${tx.proof ? `<button class="btn-view-proof" data-img="${tx.proof}" style="margin-top: 4px; background: var(--primary-light); color: var(--primary); border: none; padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-weight: 600;"><i class="ri-image-line"></i> Lihat Bukti Transfer</button>` : ''}
          </div>
        </div>
        <div class="history-right" style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
          <div class="history-amount ${amountClass}">${prefix}${formatRupiah(tx.amount)}</div>
          <div style="display: flex; gap: 4px;">
            <button class="btn-action-icon btn-edit-tx" data-id="${tx.id}" title="Edit Transaksi"><i class="ri-pencil-line"></i></button>
            <button class="btn-action-icon btn-delete-tx" data-id="${tx.id}" title="Hapus Transaksi"><i class="ri-delete-bin-line"></i></button>
          </div>
        </div>
      `;
      historyContainer.appendChild(item);
    });

    // Edit Transaction Handler
    document.querySelectorAll('.btn-edit-tx').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const txId = btn.getAttribute('data-id');
        const targetTx = store.transactions.find(t => t.id === txId);
        if (targetTx) {
          editingTxId = txId;
          document.querySelector(`input[name="txType"][value="${targetTx.type}"]`).checked = true;
          document.querySelector(`input[name="userRole"][value="${targetTx.userId}"]`).checked = true;
          amountInput.value = targetTx.amount;
          document.getElementById('categoryInput').value = targetTx.category;
          goalSelectEl.value = targetTx.goalId || '';
          document.getElementById('txDate').value = targetTx.date;
          document.getElementById('noteInput').value = targetTx.note || '';
          if (targetTx.proof) {
            proofPreviewImg.src = targetTx.proof;
            proofPreviewContainer.style.display = 'block';
          } else {
            proofPreviewContainer.style.display = 'none';
          }
          document.querySelector('#modalOverlay h3').innerHTML = '<i class="ri-pencil-line" style="color: var(--primary);"></i> Edit Transaksi Tabungan';
          modalOverlay.classList.add('active');
        }
      });
    });

    // Delete Transaction Handler
    document.querySelectorAll('.btn-delete-tx').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const txId = btn.getAttribute('data-id');
        const targetTx = store.transactions.find(t => t.id === txId);
        if (confirm("Apakah Anda yakin ingin menghapus catatan transaksi ini?")) {
          await SupabaseService.deleteTransaction(txId, targetTx ? targetTx.proof : null);
          store.transactions = store.transactions.filter(t => t.id !== txId);
          renderDashboard();
        }
      });
    });

    // Proof Viewer Click
    document.querySelectorAll('.btn-view-proof').forEach(btn => {
      btn.addEventListener('click', () => {
        const imgUrl = btn.getAttribute('data-img');
        if (imgUrl) {
          document.getElementById('fullSizeProofImg').src = imgUrl;
          document.getElementById('imageModalOverlay').classList.add('active');
        }
      });
    });
  };

  // Proof File Selection Listener
  proofInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      selectedProofFile = file;
      const reader = new FileReader();
      reader.onload = (evt) => {
        proofPreviewImg.src = evt.target.result;
        proofPreviewContainer.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      selectedProofFile = null;
      proofPreviewContainer.style.display = 'none';
    }
  });

  // Modal Handlers
  openModalBtn.addEventListener('click', () => {
    document.getElementById('txDate').value = new Date().toISOString().split('T')[0];
    modalOverlay.classList.add('active');
  });
  closeModalBtn.addEventListener('click', () => modalOverlay.classList.remove('active'));
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove('active');
  });

  // Goal Modal Handlers
  openGoalModalBtn.addEventListener('click', () => goalModalOverlay.classList.add('active'));
  closeGoalModalBtn.addEventListener('click', () => goalModalOverlay.classList.remove('active'));
  goalModalOverlay.addEventListener('click', (e) => {
    if (e.target === goalModalOverlay) goalModalOverlay.classList.remove('active');
  });

  // Image Modal Handler
  const imageModalOverlay = document.getElementById('imageModalOverlay');
  const closeImageModalBtn = document.getElementById('closeImageModalBtn');
  closeImageModalBtn.addEventListener('click', () => imageModalOverlay.classList.remove('active'));
  imageModalOverlay.addEventListener('click', (e) => {
    if (e.target === imageModalOverlay) imageModalOverlay.classList.remove('active');
  });

  // Bank Info Modal & Copy Handler
  const bankModalOverlay = document.getElementById('bankModalOverlay');
  const openBankInfoBtn = document.getElementById('openBankInfoBtn');
  const closeBankModalBtn = document.getElementById('closeBankModalBtn');
  const copyAccBtn = document.getElementById('copyAccBtn');
  const copyBtnText = document.getElementById('copyBtnText');

  openBankInfoBtn.addEventListener('click', () => bankModalOverlay.classList.add('active'));
  closeBankModalBtn.addEventListener('click', () => bankModalOverlay.classList.remove('active'));
  bankModalOverlay.addEventListener('click', (e) => {
    if (e.target === bankModalOverlay) bankModalOverlay.classList.remove('active');
  });

  copyAccBtn.addEventListener('click', () => {
    navigator.clipboard.writeText("901523028510").then(() => {
      copyBtnText.textContent = "Tersalin!";
      copyAccBtn.style.background = "var(--accent-green)";
      setTimeout(() => {
        copyBtnText.textContent = "Salin";
        copyAccBtn.style.background = "var(--primary)";
      }, 2000);
    });
  });

  // Quick Amount Buttons
  document.querySelectorAll('.btn-quick').forEach(btn => {
    btn.addEventListener('click', () => {
      const addVal = Number(btn.getAttribute('data-val'));
      const currentVal = Number(amountInput.value) || 0;
      amountInput.value = currentVal + addVal;
    });
  });

  // Variables for tracking Edit Mode
  let editingTxId = null;
  let editingGoalId = null;

  // Transaction Form Submit (Sync to Supabase - Insert or Update)
  transactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = document.querySelector('input[name="txType"]:checked').value;
    const userId = document.querySelector('input[name="userRole"]:checked').value;
    const userName = userId === 'galih' ? 'Galih' : 'Fara';
    const amount = Number(amountInput.value);
    const category = document.getElementById('categoryInput').value;
    const goalId = goalSelectEl.value;
    const date = document.getElementById('txDate').value;
    const note = document.getElementById('noteInput').value;

    if (!amount || amount <= 0) {
      alert('Silakan masukkan nominal yang valid!');
      return;
    }

    const submitBtn = transactionForm.querySelector('.btn-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Menyimpan...';
    submitBtn.disabled = true;

    if (editingTxId) {
      // MODE UPDATE / EDIT
      const existingTx = store.transactions.find(t => t.id === editingTxId);
      if (existingTx) {
        existingTx.type = type;
        existingTx.userId = userId;
        existingTx.userName = userName;
        existingTx.amount = amount;
        existingTx.category = category;
        existingTx.goalId = goalId;
        existingTx.date = date;
        existingTx.note = note;

        try {
          const updatedDb = await SupabaseService.updateTransaction(editingTxId, existingTx, selectedProofFile);
          if (updatedDb && updatedDb.proof_url) existingTx.proof = updatedDb.proof_url;
        } catch (err) {
          console.warn("Update Supabase failed:", err);
        }
      }
    } else {
      // MODE CREATE / INSERT
      const tempTx = {
        id: `tx-${Date.now()}`,
        type,
        userId,
        userName,
        amount,
        goalId,
        category,
        date,
        note,
        proof: proofPreviewImg.src && selectedProofFile ? proofPreviewImg.src : null
      };

      try {
        const dbResult = await SupabaseService.addTransaction(tempTx, selectedProofFile);
        if (dbResult) {
          tempTx.id = dbResult.id;
          if (dbResult.proof_url) tempTx.proof = dbResult.proof_url;
        }
      } catch (err) {
        console.error("Supabase Submission Error Exception:", err);
        alert("Error saat menghubungi Supabase: " + err.message);
      }
      store.transactions.push(tempTx);
    }

    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;

    renderDashboard();

    // Reset Form & Editing State
    transactionForm.reset();
    editingTxId = null;
    selectedProofFile = null;
    if (proofPreviewContainer) proofPreviewContainer.style.display = 'none';
    document.querySelector('#modalOverlay h3').innerHTML = '<i class="ri-exchange-dollar-line" style="color: var(--primary);"></i> Tambah Transaksi Tabungan';
    modalOverlay.classList.remove('active');
  });

  // Goal Form Submit (Sync to Supabase - Insert or Update)
  goalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('goalTitleInput').value;
    const targetAmount = Number(document.getElementById('goalTargetInput').value);
    const icon = document.getElementById('goalIconInput').value || '🎯';

    if (!title || !targetAmount) {
      alert('Silakan lengkapi judul dan target nominal gol!');
      return;
    }

    if (editingGoalId) {
      // UPDATE GOAL
      const targetGoal = store.goals.find(g => g.id === editingGoalId);
      if (targetGoal) {
        targetGoal.title = title;
        targetGoal.targetAmount = targetAmount;
        targetGoal.icon = icon;
        await SupabaseService.updateGoal(editingGoalId, targetGoal);
      }
    } else {
      // CREATE GOAL
      const newGoal = {
        id: `goal-${Date.now()}`,
        title,
        targetAmount,
        currentAmount: 0,
        icon,
        color: '#6C5CE7'
      };

      try {
        await SupabaseService.addGoal(newGoal);
      } catch (err) {
        console.warn("Saved goal locally:", err);
      }

      store.goals.push(newGoal);
    }

    renderDashboard();

    goalForm.reset();
    editingGoalId = null;
    document.querySelector('#goalModalOverlay h3').innerHTML = '<i class="ri-trophy-line" style="color: var(--primary);"></i> Buat Target Tabungan Baru';
    goalModalOverlay.classList.remove('active');
  });

  // Start App
  initTheme();
  await syncWithSupabase();
});
