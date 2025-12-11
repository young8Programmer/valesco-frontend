# Admin Panel - Frontend

Bitta admin panel ikkala sayt (GPG va Valesco) backendlarini boshqarish uchun.

## Xususiyatlar

- ✅ Parallel login - ikkala backendga bir vaqtda murojaat
- ✅ Dynamic site switching - GPG yoki Valesco saytini tanlash
- ✅ Cache management - har login qilganda avtomatik tozalash
- ✅ Products CRUD - mahsulotlarni qo'shish, tahrirlash, o'chirish
- ✅ Categories CRUD - kategoriyalarni qo'shish, tahrirlash, o'chirish
- ✅ Zamonaviy dizayn - Tailwind CSS bilan
- ✅ Responsive - mobil va desktop uchun

## O'rnatish

```bash
cd frontend
npm install
```

## Ishga tushirish

Avval backendlarni ishga tushiring:
- GPG Backend: `http://localhost:3000`
- Valesco Backend: `http://localhost:10000`

Keyin frontendni ishga tushiring:

```bash
npm run dev
```

Ilova `http://localhost:5173` da ochiladi.

## Backend URLlar

- GPG Backend: `http://localhost:3000`
- Valesco Backend: `http://localhost:10000`

Agar backendlar boshqa portlarda ishlasa, `vite.config.ts` faylida proxy sozlamalarini o'zgartiring.

## Login

Login qilganda:
1. Ikkala backendga parallel murojaat qilinadi
2. Qaysi saytda muvaffaqiyatli login bo'lsa, o'sha sayt tanlanadi
3. Cache avtomatik tozalanadi
4. Token localStorage'da saqlanadi

## Logout

Logout qilganda:
- Barcha cache tozalanadi
- Token o'chiriladi
- Login sahifasiga qaytadi

