# دليل Deployment على Coolify - Share Flow Pro

## نظرة عامة

هذا المشروع هو تطبيق React + Vite يستخدم Base44 كـ Backend. تم تحضيره للـ deployment على منصة Coolify.

## المتطلبات

- حساب Coolify (self-hosted أو cloud)
- Docker و Docker Compose (للـ testing محلياً)
- وصول إلى Base44 App ID و Backend URL

## خطوات الـ Deployment على Coolify

### 1. تحضير المشروع

تأكد من أن لديك الملفات التالية:
- `Dockerfile` - لبناء صورة Docker
- `.dockerignore` - لتقليل حجم الصورة
- `.env.local.example` - قالب متغيرات البيئة
- `docker-compose.yml` - للـ local testing

### 2. ربط المستودع (Repository)

1. ادفع المشروع إلى GitHub أو أي Git repository
2. في Coolify، انقر على "Add Application"
3. اختر "Docker"
4. اربط مستودعك

### 3. إعدادات Coolify

#### أ. إعدادات البناء (Build Settings)

في Coolify، اضبط الإعدادات التالية:

**Build Pack:** Docker

**Dockerfile:** `./Dockerfile` (المسار الافتراضي)

**Ports:** `3000` (المنفذ الذي يستمع عليه التطبيق)

#### ب. متغيرات البيئة (Environment Variables)

في Coolify، أضف متغيرات البيئة التالية:

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url
```

**مثال:**
```
VITE_BASE44_APP_ID=cbef744a8545c389ef439ea6
VITE_BASE44_APP_BASE_URL=https://my-app-81bfaad7.base44.app
```

**الحصول على القيم:**
1. افتح Base44.com
2. ادخل إلى مشروعك
3. من الإعدادات، انسخ App ID و Backend URL

### 4. الـ Deployment

#### الطريقة الأولى: عبر Coolify UI

1. في صفحة التطبيق، انقر على "Deploy"
2. اختر الفرع الذي تريد نشره (عادة `main`)
3. اضغط "Deploy Now"

#### الطريقة الثانية: Automatic Deployments

1. في إعدادات الـ Webhook، انسخ رابط الـ Webhook
2. أضفه في GitHub:
   - Settings → Webhooks → Add webhook
   - Payload URL: ضع رابط الـ Webhook من Coolify
   - Content type: `application/json`
   - الأحداث: `Push events`

### 5. التحقق من الـ Deployment

بعد الـ Deployment:

1. انتظر حتى ينتهي البناء
2. ستجد رابط URL لتطبيقك (مثل: `https://your-app.coolify.io`)
3. افتح الرابط للتأكد من أن التطبيق يعمل

## المشاكل الشائعة والحلول

### المشكلة: الخطأ "Build failed"

**الحل:**
- تحقق من متغيرات البيئة
- تأكد من أن جميع الـ dependencies مثبتة في `package.json`
- تحقق من أن `npm run build` يعمل محلياً

### المشكلة: الصفحة البيضاء (Blank Page)

**الحل:**
- تحقق من Base44 App ID و Backend URL
- افتح Console (F12) للتحقق من الأخطاء
- تأكد من أن Base44 Backend يعمل

### المشكلة: Port مشغول

**الحل:**
- Coolify يدير المنافذ تلقائياً
- لا تقلق بشأن المنفذ 3000

## Testing محلياً قبل الـ Deployment

### باستخدام Docker Compose

```bash
# انسخ ملف البيئة
cp .env.local.example .env.local

# عدّل قيم البيئة بقيمك الفعلية
# vim .env.local

# شغل المشروع
docker-compose up --build

# الصفحة ستكون متاحة على http://localhost:3000
```

### بدون Docker

```bash
# انسخ ملف البيئة
cp .env.local.example .env.local

# عدّل قيم البيئة
# vim .env.local

# ثبت الـ dependencies
npm install

# شغل بيئة التطوير
npm run dev

# أو بناء وتشغيل الـ production
npm run build
npm run preview
```

## أمان التطبيق

### نصائح أمان مهمة:

1. **لا تضع Secrets في الكود:**
   - استخدم متغيرات البيئة فقط
   - أضفها في Coolify dashboard

2. **تجنب Base44 Secrets في Frontend:**
   - إذا كان لديك API keys سرية، ضعها في Backend فقط

3. **استخدم HTTPS:**
   - Coolify يدعم SSL/TLS تلقائياً

4. **التحديثات المنتظمة:**
   - حدّث `npm install` بانتظام
   - تحقق من الثغرات الأمنية

## الإعدادات المتقدمة

### Custom Domain

1. في Coolify، انقر على "Domains"
2. أضف دومين مخصص
3. حدّث DNS settings

### Reverse Proxy

Coolify يستخدم Traefik تلقائياً للـ reverse proxy.

### Database (إذا لزم الأمر)

إذا أضفت database، أضفه في `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    
  app:
    # ...
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/dbname

volumes:
  postgres_data:
```

## نصائح الـ Performance

1. **تقليل حجم الـ Bundle:**
   - استخدم `npm run build` وتحقق من حجم الـ dist
   - استخدم lazy loading للـ routes

2. **Caching:**
   - صور ثابتة تُخزن مؤقتاً في المتصفح

3. **CDN:**
   - يمكن استخدام Cloudflare مع Coolify

## الدعم والمساعدة

- **Coolify Docs:** https://coolify.io/docs
- **Base44 Docs:** https://docs.base44.com
- **GitHub Issues:** انشر issue إذا واجهت مشاكل

## الخطوات التالية

1. **Integration مع CI/CD:**
   - استخدم GitHub Actions للـ automated testing

2. **Monitoring:**
   - استخدم Sentry أو LogRocket لـ error tracking

3. **Analytics:**
   - أضف Google Analytics أو Mixpanel

---

**تم إنشاء هذا الدليل لـ Share Flow Pro**
آخر تحديث: 2026
