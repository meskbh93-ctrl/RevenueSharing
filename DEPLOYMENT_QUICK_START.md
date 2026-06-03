# 🚀 Share Flow Pro - Coolify Deployment

تم تحضير هذا المشروع للـ deployment على Coolify بسهولة!

## 📋 المتطلبات

- حساب Coolify
- Git repository (GitHub/GitLab/etc)
- Base44 App ID و Backend URL

## ⚡ التثبيت السريع

### 1️⃣ على Coolify Dashboard

```
1. اضغط "Add Application"
2. اختر "Docker"
3. اربط repository الخاص بك
4. في "Build Settings":
   - Dockerfile: ./Dockerfile
   - Ports: 3000
5. أضف متغيرات البيئة:
   VITE_BASE44_APP_ID=your_id
   VITE_BASE44_APP_BASE_URL=your_url
6. اضغط "Deploy"
```

### 2️⃣ متغيرات البيئة المطلوبة

اطلب من فريقك Base44:
- `VITE_BASE44_APP_ID`
- `VITE_BASE44_APP_BASE_URL`

### 3️⃣ Testing محلياً

```bash
# انسخ متغيرات البيئة
cp .env.local.example .env.local

# عدّل القيم
nano .env.local

# شغل مع Docker Compose
docker-compose up --build
```

التطبيق سيكون على: http://localhost:3000

## 📁 الملفات المضافة

| الملف | الوصف |
|------|-------|
| `Dockerfile` | الصورة الأساسية (Node.js + serve) |
| `Dockerfile.nginx` | نسخة محسّنة (nginx) |
| `nginx.conf` | إعدادات nginx |
| `.dockerignore` | ملفات يتم تجاهلها في Docker |
| `.env.local.example` | قالب متغيرات البيئة |
| `docker-compose.yml` | للـ local development |
| `COOLIFY_DEPLOYMENT.md` | دليل تفصيلي كامل |

## 🔄 الـ Automatic Deployments

أضف webhook في GitHub:

```
Settings → Webhooks → Add webhook
URL: [paste Coolify webhook URL]
Content type: application/json
Events: Push events
```

## 🛠️ اختيار الـ Dockerfile

### للـ Quick Setup: استخدم `Dockerfile`
- أبسط وأسرع
- Node.js + serve
- حجم صغير نسبياً

### للـ Performance: استخدم `Dockerfile.nginx`
- أسرع من serve
- أمان أفضل
- حجم أصغر
- أفضل للـ production

## ✅ Checklist قبل الـ Deployment

- [ ] متغيرات البيئة مضبوطة في Coolify
- [ ] الـ repository مربوط
- [ ] Base44 Backend متاح
- [ ] تم الـ test محلياً

## 🔗 الروابط المهمة

- [Coolify Docs](https://coolify.io/docs)
- [Base44 Docs](https://docs.base44.com)
- [دليل Deployment التفصيلي](./COOLIFY_DEPLOYMENT.md)

## ❓ مشاكل شائعة

**الصفحة البيضاء؟**
- افتح Console (F12) وشوف الأخطاء
- تأكد من Base44 URL صحيحة

**Build fails؟**
- تحقق من npm install يعمل محلياً
- شوف logs في Coolify dashboard

**Deployment slow؟**
- استخدم `Dockerfile.nginx` للأداء الأفضل

---

**احتاج مساعدة؟** اقرأ `COOLIFY_DEPLOYMENT.md` للتفاصيل الكاملة
