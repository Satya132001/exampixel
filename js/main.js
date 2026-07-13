// ===== EXAM SELECTION =====
let currentExam = null;
let uploadedFile = null;
let currentTab = 'photo';

function selectExam(card, name, size, dpi, minSize, maxSize) {
  document.querySelectorAll('.exam-card').forEach(c => c.classList.remove('active'));
  card.classList.add('active');

  currentExam = { name, size, dpi, minSize, maxSize };

  document.getElementById('selected-exam-name').textContent = name;
  document.getElementById('spec-size').textContent = size + ' px';
  document.getElementById('spec-dpi').textContent = dpi;
  document.getElementById('spec-min').textContent = minSize;
  document.getElementById('spec-max').textContent = maxSize;

  const uploadSection = document.getElementById('upload-section');
  uploadSection.style.display = 'block';
  setTimeout(() => {
    uploadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function changeExam() {
  document.getElementById('upload-section').style.display = 'none';
  document.querySelectorAll('.exam-card').forEach(c => c.classList.remove('active'));
  document.getElementById('preview-area').style.display = 'none';
  document.getElementById('download-btn').style.display = 'none';
  document.getElementById('drop-zone').style.display = 'block';
  document.getElementById('file-input').value = '';
  uploadedFile = null;
  document.getElementById('exams').scrollIntoView({ behavior: 'smooth' });
}

// ===== TABS =====
function switchTab(btn, tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  currentTab = tab;
  document.getElementById('preview-area').style.display = 'none';
  document.getElementById('download-btn').style.display = 'none';
  document.getElementById('drop-zone').style.display = 'block';
  document.getElementById('file-input').value = '';
  uploadedFile = null;
}

// ===== DRAG & DROP =====
const dropZone = document.getElementById('drop-zone');

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    processFile(file);
  } else {
    alert('Please upload a valid image file (JPG, PNG)');
  }
});

dropZone.addEventListener('click', () => {
  document.getElementById('file-input').click();
});

function handleFile(event) {
  const file = event.target.files[0];
  if (file) processFile(file);
}

// ===== FILE PROCESSING =====
function processFile(file) {
  uploadedFile = file;
  const reader = new FileReader();

  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      document.getElementById('original-img').src = e.target.result;
      const sizeKB = Math.round(file.size / 1024);
      document.getElementById('original-info').textContent =
        img.width + 'x' + img.height + 'px • ' + sizeKB + 'KB';

      convertImage(img, e.target.result);
    };
    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
}

function convertImage(originalImg, originalSrc) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  let targetW = 200;
  let targetH = 230;

  if (currentExam) {
    const sizeStr = currentExam.size;
    if (sizeStr.includes('x') && sizeStr.includes('px')) {
      const parts = sizeStr.replace('px','').split('x');
      targetW = parseInt(parts[0]);
      targetH = parseInt(parts[1]);
    } else if (sizeStr === '3.5x4.5cm') {
      targetW = 413;
      targetH = 531;
    } else if (sizeStr.includes('x') && sizeStr.includes('cm')) {
      const parts = sizeStr.replace('cm','').split('x');
      targetW = Math.round(parseFloat(parts[0]) * 118);
      targetH = Math.round(parseFloat(parts[1]) * 118);
    }
  }

  canvas.width = targetW;
  canvas.height = targetH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, targetW, targetH);

  const scale = Math.min(targetW / originalImg.width, targetH / originalImg.height);
  const scaledW = originalImg.width * scale;
  const scaledH = originalImg.height * scale;
  const offsetX = (targetW - scaledW) / 2;
  const offsetY = (targetH - scaledH) / 2;

  ctx.drawImage(originalImg, offsetX, offsetY, scaledW, scaledH);

  let quality = 0.85;
  let dataURL = canvas.toDataURL('image/jpeg', quality);

  const maxKB = currentExam ? parseInt(currentExam.maxSize) : 50;
  while (dataURL.length / 1024 * 0.75 > maxKB && quality > 0.3) {
    quality -= 0.05;
    dataURL = canvas.toDataURL('image/jpeg', quality);
  }

  document.getElementById('converted-img').src = dataURL;

  document.getElementById('drop-zone').style.display = 'none';
  document.getElementById('preview-area').style.display = 'flex';
  document.getElementById('download-btn').style.display = 'block';

  window._convertedDataURL = dataURL;
  window._convertedCanvas = canvas;
}

// ===== DOWNLOAD =====
function downloadImage() {
  if (!window._convertedDataURL) return;
  const examName = currentExam ? currentExam.name.replace(/\s+/g, '_') : 'exam';
  const tabName = currentTab;
  const link = document.createElement('a');
  link.download = 'ExamPixel_' + examName + '_' + tabName + '.jpg';
  link.href = window._convertedDataURL;
  link.click();
}

// ===== FAQ =====
function toggleFaq(el) {
  const answer = el.nextElementSibling;
  const isOpen = el.classList.contains('open');

  document.querySelectorAll('.faq-q').forEach(q => {
    q.classList.remove('open');
    q.nextElementSibling.style.display = 'none';
  });

  if (!isOpen) {
    el.classList.add('open');
    answer.style.display = 'block';
  }
}

// ===== SMOOTH SCROLL for nav links =====
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});
