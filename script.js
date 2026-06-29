// ==========================================
// أكاديمية اقرأ - التطبيق الرئيسي (Vercel)
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycbyj6qPqQ90BtkUEpGsAyTO7wGQYw-2UOo1FTWi1sTIrlPdR4If1wUrOwhdQEI3wd6iu/exec";

let currentUser = null;

// ==========================================
// دوال الاتصال بـ Google API
// ==========================================
async function callGoogleAPI(action, params = []) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: action, params: params })
        });
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("الرد ليس JSON:", text);
            return { success: false, error: "خطأ في تنسيق البيانات" };
        }
    } catch (error) {
        console.error("❌ انقطع الاتصال:", error);
        return { success: false, error: "فشل الاتصال" };
    }
}

// ==========================================
// التنقل بين الصفحات
// ==========================================
function navigateTo(pageId) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`page-${pageId}`);
    if (target) target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (pageId === 'home') loadHomeData();
    if (pageId === 'courses') loadCoursesPage();
    if (pageId === 'news') loadNewsPage();
    if (pageId === 'verification') resetVerification();
    if (pageId === 'register') loadRegistrationForm();
    if (pageId === 'dashboard' && currentUser) loadDashboard();
    updateActiveNav(pageId);
}

function updateActiveNav(pageId) {
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    const navItem = document.getElementById(`nav-${pageId}`);
    if (navItem) navItem.classList.add('active');
}

// ==========================================
// الهيدر
// ==========================================
function buildHeader() {
    const header = document.getElementById('header');
    header.innerHTML = `
    <div class="bg-[#0B1F4D] text-white sticky top-0 z-50">
      <div class="container mx-auto flex justify-between items-center py-3 px-4">
        <div class="flex items-center gap-2 cursor-pointer" onclick="navigateTo('home')">
          <img src="https://drive.google.com/thumbnail?id=1vcLrgWhcDhA5vOlei4WasRYKzU5YJ6qh&sz=w500" class="w-10 h-10 rounded-xl border border-[#D4A017]" alt="logo">
          <div>
            <h1 class="font-black text-lg">أكاديمية إقرأ</h1>
            <p class="text-[10px] text-[#D4A017]">للاستشارات والتدريب</p>
          </div>
        </div>
        <nav class="flex items-center gap-4 text-sm font-semibold">
          <span onclick="navigateTo('home')" class="nav-link active cursor-pointer hover:text-[#D4A017]" id="nav-home">الرئيسية</span>
          <span onclick="navigateTo('courses')" class="nav-link cursor-pointer hover:text-[#D4A017]" id="nav-courses">الدورات</span>
          <span onclick="navigateTo('news')" class="nav-link cursor-pointer hover:text-[#D4A017]" id="nav-news">الأخبار</span>
          <span onclick="navigateTo('verification')" class="nav-link cursor-pointer hover:text-[#D4A017]" id="nav-verification">تحقق</span>
          <span id="auth-area">
            <span onclick="navigateTo('login')" class="text-emerald-400 font-bold cursor-pointer">🔑 دخول</span>
          </span>
        </nav>
      </div>
    </div>`;
}

function updateAuthUI() {
    const authArea = document.getElementById('auth-area');
    if (!authArea) return;
    if (currentUser) {
        let roleName = currentUser.role;
        if (roleName === 'admin') roleName = 'مدير';
        else if (roleName === 'marketer') roleName = 'مسوق';
        else if (roleName === 'trainer') roleName = 'مدرب';
        authArea.innerHTML = `
        <span class="text-white text-xs">${currentUser.name} (${roleName})</span>
        <span onclick="navigateTo('dashboard')" class="text-[#D4A017] cursor-pointer font-bold mx-2">لوحة التحكم</span>
        <span onclick="logout()" class="text-red-300 cursor-pointer text-xs">خروج</span>`;
    } else {
        authArea.innerHTML = `<span onclick="navigateTo('login')" class="text-emerald-400 font-bold cursor-pointer">🔑 دخول</span>`;
    }
}

function logout() {
    currentUser = null;
    sessionStorage.removeItem('user');
    updateAuthUI();
    navigateTo('home');
}

// ==========================================
// بناء الصفحات
// ==========================================
function buildPages() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
    <section id="page-home" class="page-section active">
      <div class="text-center py-16 bg-gradient-to-b from-[#0B1F4D] to-slate-50 text-white">
        <h2 class="text-3xl font-black mb-6">مرحباً بكم في أكاديمية اقرأ</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-6 px-4">
          <div class="bg-white/10 backdrop-blur rounded-xl p-4"><span class="text-2xl font-black text-[#D4A017]" id="stat-courses">0</span><br><small class="text-slate-300">دورة</small></div>
          <div class="bg-white/10 backdrop-blur rounded-xl p-4"><span class="text-2xl font-black text-[#D4A017]" id="stat-students">0</span><br><small class="text-slate-300">متدرب</small></div>
          <div class="bg-white/10 backdrop-blur rounded-xl p-4"><span class="text-2xl font-black text-[#D4A017]" id="stat-certs">0</span><br><small class="text-slate-300">شهادة</small></div>
        </div>
      </div>
      <div class="container mx-auto px-4 py-8">
        <h3 class="text-xl font-bold text-[#0B1F4D] mb-4">الدورات المميزة</h3>
        <div id="home-courses-list" class="grid grid-cols-1 md:grid-cols-3 gap-6"></div>
      </div>
    </section>

    <section id="page-courses" class="page-section container mx-auto px-4 py-8">
      <h2 class="text-2xl font-black text-[#0B1F4D] mb-6">الدورات التدريبية</h2>
      <div id="courses-container" class="grid grid-cols-1 md:grid-cols-3 gap-6"></div>
    </section>

    <section id="page-news" class="page-section container mx-auto px-4 py-8">
      <h2 class="text-2xl font-black text-[#0B1F4D] mb-6">الأخبار</h2>
      <div id="news-container" class="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
    </section>

    <section id="page-verification" class="page-section container mx-auto px-4 py-8">
      <div class="max-w-lg mx-auto bg-white p-6 rounded-2xl shadow">
        <h2 class="text-xl font-bold text-[#0B1F4D] mb-4">التحقق من الشهادة</h2>
        <input type="text" id="certInput" placeholder="أدخل رقم الشهادة" class="w-full border p-2 rounded mb-2">
        <button onclick="verifyCert()" class="bg-[#0B1F4D] text-white px-4 py-2 rounded font-bold">فحص</button>
        <div id="certResult" class="mt-4 text-sm"></div>
      </div>
    </section>

    <section id="page-register" class="page-section container mx-auto px-4 py-8">
      <div class="max-w-lg mx-auto bg-white p-6 rounded-2xl shadow">
        <h2 class="text-xl font-bold text-[#0B1F4D] mb-4">نموذج التسجيل</h2>
        <form onsubmit="handleRegister(event)" id="reg-form">
          <input type="text" id="reg-name-ar" placeholder="الاسم العربي" required class="w-full border p-2 rounded mb-2">
          <input type="text" id="reg-whatsapp" placeholder="رقم الواتساب" required class="w-full border p-2 rounded mb-2">
          <select id="reg-course" required class="w-full border p-2 rounded mb-4"><option value="">اختر الدورة</option></select>
          <button type="submit" class="w-full bg-[#D4A017] text-[#0B1F4D] py-2 rounded font-bold">تسجيل</button>
        </form>
        <div id="reg-success" class="hidden mt-4 text-green-700 bg-green-50 p-3 rounded"></div>
      </div>
    </section>

    <section id="page-login" class="page-section container mx-auto px-4 py-8">
      <div class="max-w-sm mx-auto bg-white p-6 rounded-2xl shadow">
        <h2 class="text-xl font-bold text-[#0B1F4D] mb-4 text-center">تسجيل الدخول</h2>
        <form onsubmit="handleLogin(event)">
          <input type="text" id="login-username" placeholder="اسم المستخدم" required class="w-full border p-2 rounded mb-2 text-left dir-ltr">
          <input type="password" id="login-password" placeholder="كلمة المرور" required class="w-full border p-2 rounded mb-4 text-left dir-ltr">
          <button type="submit" class="w-full bg-[#0B1F4D] text-white py-2 rounded font-bold">دخول</button>
        </form>
        <div id="login-error" class="hidden mt-4 text-red-600 text-center"></div>
      </div>
    </section>

    <section id="page-dashboard" class="page-section container mx-auto px-4 py-8">
      <div id="dash-content" class="text-center py-10">جاري تحميل لوحة التحكم...</div>
    </section>

    <div id="welcome-popup" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] hidden flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl text-right relative">
        <button onclick="closePopup()" class="absolute top-3 left-3 text-gray-400 hover:text-red-500 text-xl cursor-pointer z-10">✕</button>
        <div class="bg-gradient-to-b from-[#0B1F4D] to-[#132F6B] p-6 text-center">
          <div class="text-5xl mb-3">🔥</div>
          <h3 class="text-xl font-black text-white">خصم خاص للمسجلين اليوم!</h3>
          <p class="text-[#D4A017] font-bold mt-2">في برامج يوليو - احجز مقعدك الآن</p>
        </div>
        <div class="p-5 text-center space-y-3 bg-white">
          <button onclick="closePopup(); navigateTo('register')" class="w-full bg-[#D4A017] hover:bg-[#b88614] text-[#0B1F4D] font-black py-3 rounded-xl text-sm shadow-lg transition">سجل الآن واحصل على الخصم</button>
          <button onclick="closePopup()" class="text-xs text-gray-400 hover:text-gray-600">ربما لاحقاً</button>
        </div>
      </div>
    </div>`;
}

// ==========================================
// دوال الصفحات العامة
// ==========================================
async function loadHomeData() {
    showPopupAfterDelay();
    const stats = await callGoogleAPI('getStats');
    if (stats && !stats.error) {
        document.getElementById('stat-courses').innerText = stats.courses || 0;
        document.getElementById('stat-students').innerText = stats.students || 0;
        document.getElementById('stat-certs').innerText = stats.certs || 0;
    }
    const courses = await callGoogleAPI('fetchCoursesFromSheet');
    const homeCourses = document.getElementById('home-courses-list');
    if (homeCourses && Array.isArray(courses)) {
        homeCourses.innerHTML = courses.slice(0, 3).map(c => `
        <div class="bg-white p-4 rounded-2xl shadow border cursor-pointer hover:shadow-lg transition" onclick="openCourseDetails('${encodeURIComponent(c.title)}')">
          <img src="${c.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600'}" class="h-40 w-full object-cover rounded-xl mb-3">
          <h3 class="font-bold text-[#0B1F4D]">${c.title}</h3>
          <p class="text-xs text-gray-500"><i class="fas fa-chalkboard-teacher text-[#D4A017] ml-1"></i> ${c.trainer}</p>
          <p class="text-xs text-gray-400 mt-1"><i class="fas fa-clock ml-1"></i> ${c.duration || '36 ساعة'}</p>
          <div class="flex justify-between items-center mt-3 pt-3 border-t">
            <span class="text-amber-600 font-bold">${c.fee}</span>
            <button onclick="event.stopPropagation(); navigateTo('register')" class="bg-[#D4A017] text-[#0B1F4D] px-3 py-1 rounded-lg text-xs font-bold">سجل الآن</button>
          </div>
        </div>`).join('');
    }
}

async function loadCoursesPage() {
    const courses = await callGoogleAPI('fetchCoursesFromSheet');
    const container = document.getElementById('courses-container');
    if (container && Array.isArray(courses)) {
        container.innerHTML = courses.map(c => `
        <div class="bg-white p-4 rounded-2xl shadow border cursor-pointer hover:shadow-lg transition" onclick="openCourseDetails('${encodeURIComponent(c.title)}')">
          <img src="${c.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600'}" class="h-40 w-full object-cover rounded-xl mb-3">
          <h3 class="font-bold text-[#0B1F4D]">${c.title}</h3>
          <p class="text-xs text-gray-500"><i class="fas fa-chalkboard-teacher text-[#D4A017] ml-1"></i> ${c.trainer}</p>
          <p class="text-xs text-gray-400 mt-1"><i class="fas fa-clock ml-1"></i> ${c.duration || '36 ساعة'}</p>
          <div class="flex justify-between items-center mt-3 pt-3 border-t">
            <span class="text-amber-600 font-bold">${c.fee}</span>
            <div class="flex gap-2">
              <a href="https://wa.me/967777644293?text=${encodeURIComponent('مرحباً، أريد الاستفسار عن دورة: ' + c.title)}" target="_blank" onclick="event.stopPropagation()" class="bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-bold"><i class="fab fa-whatsapp"></i> واتساب</a>
              <button onclick="event.stopPropagation(); navigateTo('register')" class="bg-[#D4A017] text-[#0B1F4D] px-3 py-1 rounded-lg text-xs font-bold">سجل الآن</button>
            </div>
          </div>
        </div>`).join('');
    }
}

async function loadNewsPage() {
    const news = await callGoogleAPI('fetchNewsFromSheet');
    const container = document.getElementById('news-container');
    if (container && Array.isArray(news)) {
        container.innerHTML = news.map(n => `
        <div class="bg-white p-4 rounded-2xl shadow border">
          <span class="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-full"><i class="fas fa-calendar-alt"></i> ${n.date}</span>
          <h3 class="font-bold text-[#0B1F4D] mt-2">${n.title}</h3>
          <p class="text-sm text-gray-600 mt-2">${n.details}</p>
        </div>`).join('');
    }
}

async function loadRegistrationForm() {
    const courses = await callGoogleAPI('fetchCoursesFromSheet');
    const select = document.getElementById('reg-course');
    if (select && Array.isArray(courses)) {
        select.innerHTML = '<option value="">اختر الدورة</option>';
        courses.forEach(c => { select.innerHTML += `<option value="${c.title}">${c.title}</option>`; });
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerText = 'جاري التسجيل...';

    const studentData = {
        nameAr: document.getElementById('reg-name-ar').value,
        whatsapp: document.getElementById('reg-whatsapp').value,
        course: document.getElementById('reg-course').value,
        marketerCode: localStorage.getItem('ref') || ''
    };

    const res = await callGoogleAPI('registerTraineeFinal', [studentData]);

    if (res && res.success) {
        document.getElementById('reg-form').style.display = 'none';
        const successDiv = document.getElementById('reg-success');
        successDiv.classList.remove('hidden');
        successDiv.innerHTML = `
        <div class="text-center">
          <div class="text-5xl mb-3">✅</div>
          <div class="font-black text-xl text-emerald-700 mb-2">تم التسجيل بنجاح!</div>
          <div class="text-lg mb-1">رقم الطلب: <span class="font-black text-[#0B1F4D] bg-white px-3 py-1 rounded-lg shadow-sm">${res.orderID}</span></div>
          <p class="text-xs text-gray-600 mt-3">يرجى الانضمام لقناة الواتساب الرسمية:</p>
          <div class="flex gap-3 justify-center mt-4 flex-wrap">
            <a href="https://whatsapp.com/channel/0029VbCDK6M4IBhBR3jvVY0Y" target="_blank" class="bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-xl font-bold shadow-md transition flex items-center gap-2"><i class="fab fa-whatsapp text-xl"></i> انضم للقناة</a>
            <a href="https://wa.me/967777644293" target="_blank" class="bg-[#25D366] hover:bg-[#1ebd5a] text-white px-5 py-3 rounded-xl font-bold shadow-md transition flex items-center gap-2"><i class="fab fa-whatsapp text-xl"></i> تواصل مباشر</a>
          </div>
        </div>`;
    } else {
        alert('❌ خطأ: ' + (res ? res.error : 'فشل التسجيل'));
        btn.disabled = false;
        btn.innerText = 'تسجيل';
    }
}

// ==========================================
// صفحة تفاصيل الدورة
// ==========================================
async function openCourseDetails(courseTitle) {
    const title = decodeURIComponent(courseTitle);
    const courses = await callGoogleAPI('fetchCoursesFromSheet');
    const course = Array.isArray(courses) ? courses.find(c => c.title === title) : null;
    if (!course) { alert('لم يتم العثور على تفاصيل هذه الدورة'); return; }

    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    let detailsHTML = document.getElementById('page-course-details');
    if (!detailsHTML) {
        const div = document.createElement('section');
        div.id = 'page-course-details';
        div.className = 'page-section';
        document.getElementById('main-content').appendChild(div);
        detailsHTML = div;
    }

    detailsHTML.innerHTML = `
    <div class="container mx-auto px-4 py-8">
      <button onclick="navigateTo('courses')" class="text-[#0B1F4D] font-bold mb-4 inline-block hover:text-[#D4A017] transition"><i class="fas fa-arrow-right ml-1"></i> العودة للدورات</button>
      <div class="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <img src="${course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200'}" class="w-full h-64 object-cover">
        <div class="p-8">
          <span class="bg-slate-100 text-[#0B1F4D] text-xs font-bold px-3 py-1 rounded-full">${course.category || 'تدريب'}</span>
          <h2 class="text-3xl font-black text-[#0B1F4D] mt-4">${course.title}</h2>
          <p class="text-gray-600 mt-4 leading-relaxed">هذه الدورة من أفضل الدورات التدريبية في مجالها، يقدمها نخبة من المدربين المعتمدين.</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div class="bg-slate-50 p-4 rounded-xl text-center"><i class="fas fa-clock text-[#D4A017] text-xl"></i><p class="font-bold mt-1">المدة</p><p class="text-sm text-gray-600">${course.duration || 'غير محدد'}</p></div>
            <div class="bg-slate-50 p-4 rounded-xl text-center"><i class="fas fa-chalkboard-teacher text-[#D4A017] text-xl"></i><p class="font-bold mt-1">المدرب</p><p class="text-sm text-gray-600">${course.trainer || 'نخبة من المدربين'}</p></div>
            <div class="bg-slate-50 p-4 rounded-xl text-center"><i class="fas fa-tag text-[#D4A017] text-xl"></i><p class="font-bold mt-1">الرسوم</p><p class="text-sm text-gray-600 font-bold">${course.fee || 'مجاناً'}</p></div>
          </div>
          <div class="flex gap-3 mt-8 flex-wrap">
            <a href="https://wa.me/967777644293?text=${encodeURIComponent('مرحباً، أريد الاستفسار عن دورة: ' + course.title)}" target="_blank" class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-md transition flex items-center gap-2 flex-1 justify-center"><i class="fab fa-whatsapp text-xl"></i> استفسر عبر الواتساب</a>
            <button onclick="navigateTo('register')" class="bg-[#D4A017] hover:bg-[#b88614] text-[#0B1F4D] px-6 py-3 rounded-xl font-bold shadow-md transition flex-1">سجل الآن</button>
          </div>
        </div>
      </div>
    </div>`;
    detailsHTML.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// تسجيل الدخول
// ==========================================
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errorDiv = document.getElementById('login-error');
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerText = 'جاري التحقق...';
    btn.disabled = true;
    errorDiv.classList.add('hidden');

    const res = await callGoogleAPI('authenticateUser', [username, password]);

    if (res && res.success) {
        currentUser = { role: res.role, code: res.marketerCode || '', name: res.name };
        sessionStorage.setItem('user', JSON.stringify(currentUser));
        updateAuthUI();
        navigateTo('dashboard');
    } else {
        errorDiv.classList.remove('hidden');
        errorDiv.innerText = (res && res.message) ? res.message : 'اسم المستخدم أو كلمة المرور غير صحيحة';
    }
    btn.innerText = 'دخول';
    btn.disabled = false;
}

// ==========================================
// لوحة التحكم
// ==========================================
async function loadDashboard() {
    if (!currentUser) { navigateTo('login'); return; }
    const dashContent = document.getElementById('dash-content');
    dashContent.innerHTML = '<div class="text-center py-10">جاري تحميل لوحة التحكم...</div>';

    const res = await callGoogleAPI('getDashboardForAPI', [currentUser.role, currentUser.code, currentUser.name]);
    if (!res || !res.success) {
        dashContent.innerHTML = `<div class="text-red-600 text-center py-10">❌ خطأ: ${res ? res.error : 'فشل تحميل البيانات'}</div>`;
        return;
    }

    const { studentsCount, certsCount, coursesCount, marketersCount, students } = res;
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'مدير';
    const isMarketer = currentUser.role === 'marketer' || currentUser.role === 'مسوق';

    let marketerStats = null;
    if (isMarketer && currentUser.code) {
        marketerStats = await callGoogleAPI('getMarketerDetailedStats', [currentUser.code]);
    }

    dashContent.innerHTML = `
    <h2 class="text-2xl font-black text-[#0B1F4D] mb-6">لوحة التحكم - ${currentUser.name}</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      ${isMarketer ? `
      <div class="bg-white p-4 rounded-2xl shadow border"><div class="text-xs text-slate-500 font-bold">طلابي الكلي</div><div class="text-2xl font-black text-[#0B1F4D]">${marketerStats ? marketerStats.totalStudents : '...'}</div></div>
      <div class="bg-white p-4 rounded-2xl shadow border"><div class="text-xs text-slate-500 font-bold">المسددين</div><div class="text-2xl font-black text-emerald-600">${marketerStats ? marketerStats.paidStudents : '...'}</div></div>
      <div class="bg-white p-4 rounded-2xl shadow border col-span-2">
        <div class="text-xs text-slate-500 font-bold mb-2">عمولتي: <span class="text-[#D4A017]">${marketerStats ? marketerStats.currentTier : '...'}</span></div>
        <div class="w-full bg-slate-200 rounded-full h-4 overflow-hidden"><div class="bg-gradient-to-l from-[#D4A017] to-emerald-500 h-4 rounded-full transition-all" style="width: ${marketerStats ? marketerStats.progressPercent : 0}%"></div></div>
        <div class="flex justify-between text-[10px] text-slate-500 mt-1"><span>${marketerStats ? marketerStats.totalStudents : 0} طالب</span><span>${marketerStats && marketerStats.remainingForNext > 0 ? 'متبقي ' + marketerStats.remainingForNext + ' للفئة التالية' : '🎉 أعلى فئة!'}</span></div>
      </div>` : `
      <div class="bg-white p-4 rounded-2xl shadow border"><div class="text-xs text-slate-500 font-bold">المتدربين</div><div class="text-2xl font-black text-[#0B1F4D]">${studentsCount}</div></div>
      <div class="bg-white p-4 rounded-2xl shadow border"><div class="text-xs text-slate-500 font-bold">الشهادات</div><div class="text-2xl font-black text-emerald-600">${certsCount}</div></div>
      <div class="bg-white p-4 rounded-2xl shadow border"><div class="text-xs text-slate-500 font-bold">الدورات</div><div class="text-2xl font-black text-[#0B1F4D]">${coursesCount}</div></div>
      ${isAdmin ? `<div class="bg-white p-4 rounded-2xl shadow border"><div class="text-xs text-slate-500 font-bold">مسوقين</div><div class="text-2xl font-black text-[#0B1F4D]">${marketersCount}</div></div>` : ''}`}
    </div>
    <div class="bg-white p-4 rounded-2xl shadow border">
      <h3 class="font-bold mb-4 text-[#0B1F4D]">📋 سجل المتدربين</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm border-collapse">
          <thead><tr class="bg-slate-100"><th class="p-3 border font-bold">رقم الطلب</th><th class="p-3 border font-bold">الاسم</th><th class="p-3 border font-bold">الدورة</th><th class="p-3 border font-bold">الحالة</th>${isAdmin ? '<th class="p-3 border font-bold">إجراء</th>' : ''}</tr></thead>
          <tbody>
            ${students.map(s => `
            <tr class="hover:bg-slate-50 transition">
              <td class="p-2 border">${s.orderID}</td>
              <td class="p-2 border">${s.name}</td>
              <td class="p-2 border text-blue-900 font-semibold">${s.course}</td>
              <td class="p-2 border"><span class="px-2 py-1 rounded text-xs font-bold ${s.status === 'تم تسديد الشهادة' ? 'bg-yellow-50 text-yellow-700' : s.status === 'مقبول' ? 'bg-green-50 text-green-700' : s.status === 'مرفوض' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}">${s.status || 'جديد'}</span></td>
              ${isAdmin ? `<td class="p-2 border"><select onchange="updateStatus('${s.orderID}', this.value)" class="border rounded px-2 py-1 text-xs"><option value="">تغيير</option><option value="مقبول">مقبول</option><option value="تم تسديد الشهادة">تم التسديد</option><option value="مرفوض">مرفوض</option></select></td>` : ''}
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

async function updateStatus(orderId, newStatus) {
    if (!newStatus) return;
    if (!confirm(`تأكيد تغيير الحالة إلى: ${newStatus}؟`)) return;
    const res = await callGoogleAPI('updateStudentStatus', [orderId, newStatus]);
    if (res && res.success) { alert('✅ تم التحديث بنجاح');
        loadDashboard(); } else { alert('❌ خطأ: ' + (res ? res.error : 'غير معروف')); }
}

// ==========================================
// التحقق من الشهادات
// ==========================================
function resetVerification() {
    const input = document.getElementById('certInput');
    const result = document.getElementById('certResult');
    if (input) input.value = '';
    if (result) result.innerHTML = '';
}

async function verifyCert() {
    const certId = document.getElementById('certInput').value.trim();
    if (!certId) return;
    const resultDiv = document.getElementById('certResult');
    resultDiv.innerHTML = 'جاري الفحص...';
    const res = await callGoogleAPI('verifyCertificate', [certId]);
    if (res && res.found) {
        resultDiv.innerHTML = `<div class="text-green-700 font-bold text-lg">✅ الشهادة صحيحة ومعتمدة</div><div class="mt-2"><strong>الاسم:</strong> ${res.studentAr}</div><div><strong>الدورة:</strong> ${res.course}</div><div><strong>التاريخ:</strong> ${res.date}</div>`;
    } else {
        resultDiv.innerHTML = '<div class="text-red-600 font-bold">❌ لم يتم العثور على هذه الشهادة</div>';
    }
}

// ==========================================
// الإعلان المنبثق
// ==========================================
let popupTimer;
function showPopupAfterDelay() {
    clearTimeout(popupTimer);
    popupTimer = setTimeout(() => {
        const popup = document.getElementById('welcome-popup');
        if (popup) popup.classList.remove('hidden');
    }, 5000);
}
function closePopup() {
    const popup = document.getElementById('welcome-popup');
    if (popup) popup.classList.add('hidden');
    clearTimeout(popupTimer);
}

// ==========================================
// بدء التطبيق
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    buildHeader();
    buildPages();
    try {
        const saved = sessionStorage.getItem('user');
        if (saved) { currentUser = JSON.parse(saved);
            updateAuthUI(); }
    } catch (e) {}
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) { try { localStorage.setItem('ref', ref); } catch (e) {} }
    navigateTo('home');
});