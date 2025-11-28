# Інструкція для налаштування Google Maps API

## 1. Відкрийте Google Cloud Console

https://console.cloud.google.com/apis/credentials

## 2. Знайдіть ваш API ключ

- Клікніть на API ключ з назвою схожою на "Browser key" або подібною

## 3. Налаштуйте обмеження домену

### Application restrictions:

- Виберіть "HTTP referrers (web sites)"

### Website restrictions:

Додайте наступні домени:

```
http://localhost:*
https://localhost:*
http://127.0.0.1:*
https://127.0.0.1:*
*.vercel.app/*
*.netlify.app/*
```

## 4. API restrictions

Переконайтеся що активовані:

- Maps JavaScript API
- Geocoding API
- (Опціонально) Places API

## 5. Збережіть зміни

Натисніть "Save" та зачекайте 2-3 хвилини для застосування змін.

## Альтернативне рішення

Якщо проблема залишається, створіть новий API ключ з налаштуваннями вище.
