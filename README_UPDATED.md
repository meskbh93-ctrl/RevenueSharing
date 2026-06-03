# 🚀 Share Flow Pro - Income Sharing Platform

مشروع متقدم لمشاركة الدخل والإدارة المالية المشتركة، مبني على **React + Vite + Base44 Backend**

![React](https://img.shields.io/badge/React-18.2-blue)
![Vite](https://img.shields.io/badge/Vite-6.1-purple)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/License-MIT-orange)

---

## 📋 جدول المحتويات

- [نظرة عامة](#نظرة-عامة)
- [المتطلبات](#المتطلبات)
- [التثبيت والإعداد](#التثبيت-والإعداد)
- [بنية المشروع](#بنية-المشروع)
- [الـ Development](#الـ-development)
- [الـ Deployment](#الـ-deployment)
- [الميزات](#الميزات)
- [الدعم](#الدعم)

---

## 📖 نظرة عامة

**Share Flow Pro** هو منصة متكاملة لمشاركة الدخل والتكاليف بين أعضاء المشروع، مع:

- ✅ إدارة المشاريع المتقدمة
- ✅ حساب توزيع الدخل التلقائي
- ✅ إدارة التكاليف المشتركة
- ✅ نموذج مشاركة الدخل المرن
- ✅ واجهة مستخدم حديثة وسهلة
- ✅ دعم الترجمة (i18n)
- ✅ نمط داكن/فاتح

---

## 📦 المتطلبات

**البيئة المحلية:**
- Node.js 18.x أو أعلى
- npm 10.x أو أعلى
- Docker (اختياري)

**Coolify Deployment:**
- حساب Coolify (self-hosted أو cloud)
- Git Repository (GitHub/GitLab)
- Base44 Account

---

## 🔧 التثبيت والإعداد

### 1️⃣ استنساخ المستودع

```bash
git clone <your-repo-url>
cd share-flow-pro
```

### 2️⃣ تثبيت الـ Dependencies

```bash
npm install
```

### 3️⃣ إعداد متغيرات البيئة

```bash
# انسخ ملف البيئة
cp .env.local.example .env.local

# عدّل القيم بمعلوماتك
nano .env.local
# أو
code .env.local
```

**متغيرات البيئة المطلوبة:**

```env
# Base44 Configuration
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url

# Optional
BASE44_LEGACY_SDK_IMPORTS=false
```

### 4️⃣ تشغيل التطبيق

```bash
# بيئة التطوير
npm run dev

# سيفتح على http://localhost:5173
```

---

## 📁 بنية المشروع

```
share-flow-pro/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
│       └── ci.yml
├── src/
│   ├── api/               # Base44 API integration
│   ├── components/        # React components
│   │   ├── layout/
│   │   ├── ui/           # UI components (shadcn/ui)
│   │   ├── services/
│   │   └── costs/
│   ├── pages/            # صفحات التطبيق
│   ├── lib/              # Utilities و Hooks
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── base44/               # Base44 configuration
│   ├── config.jsonc
│   ├── .app.jsonc
│   └── entities/        # Data entities
├── public/              # Static assets
├── Dockerfile           # للـ production (Node.js + serve)
├── Dockerfile.nginx     # للـ production (Nginx - محسّن)
├── docker-compose.yml   # للـ local development
├── nginx.conf          # Nginx configuration
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── package.json
└── README.md
```

---

## 💻 الـ Development

### الأوامر الأساسية

```bash
# تشغيل بيئة التطوير
npm run dev

# بناء للـ production
npm run build

# عرض معاينة البناء
npm run preview

# فحص الأخطاء (Linting)
npm run lint

# إصلاح الأخطاء تلقائياً
npm run lint:fix

# فحص الأنواع (TypeScript)
npm run typecheck
```

### الـ Debug

```bash
# مع source maps
npm run dev -- --sourcemap

# مع vue devtools (إذا كنت تستخدم Vue)
# غير متاح في React، لكن استخدم React DevTools extension
```

### Testing محلي مع Docker

```bash
# بناء الصورة
docker build -t share-flow-pro:latest .

# تشغيل الـ container
docker run -p 3000:3000 \
  -e VITE_BASE44_APP_ID=your_id \
  -e VITE_BASE44_APP_BASE_URL=your_url \
  share-flow-pro:latest

# أو استخدم docker-compose
docker-compose up --build
```

---

## 🚀 الـ Deployment

### ⚡ Quick Deployment على Coolify

اقرأ [دليل Coolify السريع](./DEPLOYMENT_QUICK_START.md)

### 📚 تفصيل كامل

اقرأ [دليل Deployment التفصيلي](./COOLIFY_DEPLOYMENT.md)

### ☁️ الـ Deployment Options

| المنصة | الـ Ease | الـ Cost | الـ Control |
|--------|--------|---------|-----------|
| **Coolify** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Vercel | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Netlify | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Docker | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## ✨ الميزات

### 🎯 الميزات الأساسية

- **User Management**
  - تسجيل وتسجيل دخول
  - إدارة الملف الشخصي
  - استعادة كلمة المرور

- **Project Management**
  - إنشاء وإدارة المشاريع
  - اختيار المشروع الحالي
  - تتبع أعضاء المشروع

- **Income Sharing**
  - حساب توزيع الدخل التلقائي
  - نماذج مشاركة مختلفة
  - تقارير الدخل

- **Cost Management**
  - تسجيل التكاليف
  - تصنيف التكاليف
  - حساب التكاليف المشتركة

- **Services**
  - إدارة الخدمات المقدمة
  - ربط الخدمات بالدخل
  - تقارير الخدمات

### 🎨 التصميم والـ UX

- Dark/Light Mode
- Responsive Design
- Modern UI (shadcn/ui)
- Smooth Animations
- Accessibility

---

## 🔐 الأمان

- ✅ Environment variables للـ secrets
- ✅ SSL/TLS في الـ deployment
- ✅ CORS configuration
- ✅ Input validation
- ✅ Rate limiting (في القريب)

---

## 📊 Technologies Stack

### Frontend
- **React** 18.2 - UI library
- **Vite** 6.1 - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Component primitives
- **React Router** - Routing
- **React Query** - Data fetching
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Framer Motion** - Animations

### Backend
- **Base44** - Backend as a Service
- **Base44 SDK** - Integration

### DevOps
- **Docker** - Containerization
- **Nginx** - Web server
- **GitHub Actions** - CI/CD

---

## 🤝 المساهمة

نرحب بالمساهمات! اتبع هذه الخطوات:

1. Fork المستودع
2. أنشئ فرع جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add AmazingFeature'`)
4. Push إلى الفرع (`git push origin feature/AmazingFeature`)
5. افتح Pull Request

---

## 📝 الترخيص

هذا المشروع مرخص تحت MIT License - اقرأ [LICENSE](./LICENSE) للتفاصيل

---

## 📞 الدعم

### الموارد

- 📖 [Base44 Documentation](https://docs.base44.com)
- 🔧 [Coolify Documentation](https://coolify.io/docs)
- 🎨 [shadcn/ui Documentation](https://ui.shadcn.com)
- ⚡ [Vite Documentation](https://vite.dev)

### الروابط المهمة

- [دليل Coolify السريع](./DEPLOYMENT_QUICK_START.md)
- [دليل Deployment التفصيلي](./COOLIFY_DEPLOYMENT.md)
- [GitHub Issues](../../issues)

---

## 🐛 الإبلاغ عن الأخطاء

وجدت خطأ؟ [افتح issue](../../issues/new) مع:
- وصف المشكلة
- خطوات إعادة الإنتاج
- سلوك متوقع vs فعلي
- Screenshots (إذا كانت مفيدة)

---

## 🗺️ خارطة الطريق (Roadmap)

- [ ] Unit Tests
- [ ] E2E Tests
- [ ] Advanced Analytics
- [ ] Export to Excel/PDF
- [ ] API Documentation (Swagger)
- [ ] Multi-language Support Enhancement
- [ ] Mobile App (React Native)
- [ ] Offline Mode

---

## 📈 الإحصائيات

![Stars](https://img.shields.io/github/stars/yourusername/share-flow-pro?style=social)
![Forks](https://img.shields.io/github/forks/yourusername/share-flow-pro?style=social)
![Issues](https://img.shields.io/github/issues/yourusername/share-flow-pro)

---

## ❤️ شكر وتقدير

شكراً لكل من ساهم في هذا المشروع!

---

**آخر تحديث:** 2026-06-04

**الإصدار:** 0.1.0 (Beta)

---

<div align="center">

Made with ❤️ for Income Sharing Communities

[⬆ عودة للأعلى](#-share-flow-pro---income-sharing-platform)

</div>
