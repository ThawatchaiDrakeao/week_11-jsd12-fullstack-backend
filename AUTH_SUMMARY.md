# Auth Summary

สรุปงานที่ทำในระบบ `register + login + logout + auth middleware` ของโปรเจกต์นี้

## ภาพรวม

เราเพิ่มระบบยืนยันตัวตนฝั่ง `backend` สำหรับ MongoDB โดยใช้:

- `bcrypt` สำหรับเข้ารหัสและตรวจรหัสผ่าน
- `jsonwebtoken` สำหรับสร้าง JWT
- `cookie` สำหรับเก็บ token ชื่อ `accessToken`
- `middleware` สำหรับกัน route ที่ต้อง login ก่อน

## ไฟล์หลักที่เกี่ยวข้อง

- [src/modules/users/users.v2.controller.js](/C:/Users/Acer/OneDrive/เดสก์ท็อป/JSD_12/week_11/jsd12-full-stack-app/backend/src/modules/users/users.v2.controller.js:1)
- [src/middlewares/auth.middleware.js](/C:/Users/Acer/OneDrive/เดสก์ท็อป/JSD_12/week_11/jsd12-full-stack-app/backend/src/middlewares/auth.middleware.js:1)
- [src/routes/v2/users.routes.js](/C:/Users/Acer/OneDrive/เดสก์ท็อป/JSD_12/week_11/jsd12-full-stack-app/backend/src/routes/v2/users.routes.js:1)
- [src/server.js](/C:/Users/Acer/OneDrive/เดสก์ท็อป/JSD_12/week_11/jsd12-full-stack-app/backend/src/server.js:1)
- [src/testHTTP/v2/test-auth.rest](/C:/Users/Acer/OneDrive/เดสก์ท็อป/JSD_12/week_11/jsd12-full-stack-app/backend/src/testHTTP/v2/test-auth.rest:1)

## สิ่งที่ทำไปแล้ว

### 1. จัดโครงสร้าง controller ให้สะอาด

เดิมมีไฟล์ controller ชื่อซ้ำและสับสนกัน:

- `users.controller.v1.js`
- `users.controller.v2.js`
- `users.v2.controller.js`

สรุป:

- ไฟล์ที่ใช้งานจริงคือ `users.v2.controller.js`
- ไฟล์ `users.controller.v2.js` ซ้ำซ้อนและไม่ได้ถูก import
- ไฟล์ `users.controller.v1.js` เป็นไฟล์ว่าง

ดังนั้นจึงลบไฟล์ที่ไม่ใช้เพื่อให้โปรเจกต์สะอาดขึ้น

## 2. ทำ `register`

อยู่ที่ `createUser()` และ `registerUser`

หลักการทำงาน:

1. รับ `username`, `email`, `password`, `role`
2. เช็กว่า MongoDB พร้อมใช้งานหรือไม่
3. เช็กว่ากรอกข้อมูลครบหรือไม่
4. แปลง `email` เป็นตัวเล็กด้วย `trim().toLowerCase()`
5. ตรวจว่า email นี้มีคนใช้แล้วหรือยัง
6. สร้าง user ใหม่
7. ส่ง response กลับโดยไม่ส่ง `password`

จุดสำคัญ:

- `registerUser = createUser`
- แปลว่า route `/register` กับ route `/` ใช้ logic เดียวกันได้

## 3. ทำ `login`

อยู่ที่ `loginUser()`

หลักการทำงาน:

1. รับ `email` กับ `password`
2. เช็กว่ากรอกครบไหม
3. หา user จาก MongoDB
4. ใช้ `select("+password")` เพื่อดึง password ที่ปกติถูกซ่อนใน model
5. ใช้ `bcrypt.compare()` เทียบรหัสผ่าน
6. ถ้าถูก สร้าง JWT
7. เก็บ JWT ลง cookie ชื่อ `accessToken`
8. ส่งข้อมูล user และ token กลับ

สิ่งที่แก้จากโค้ดเดิม:

- เดิมมีโค้ด `return res.json(...)` แล้วมี `jwt.sign(...)` ต่อข้างล่าง
- โค้ดหลัง `return` จะไม่ทำงาน
- จึงย้ายให้ flow อยู่ในบล็อกเดียวและตอบกลับเพียงครั้งเดียว

## 4. ทำ `logout`

อยู่ที่ `logoutUser()`

หลักการทำงาน:

1. ลบ cookie `accessToken`
2. ส่งข้อความ `Logout successful`

ใช้ helper `clearAuthCookie(res)` เพื่อไม่ต้องเขียน option cookie ซ้ำ

## 5. ทำ `auth middleware`

อยู่ที่ `protectAuth()` ใน [src/middlewares/auth.middleware.js](/C:/Users/Acer/OneDrive/เดสก์ท็อป/JSD_12/week_11/jsd12-full-stack-app/backend/src/middlewares/auth.middleware.js:29)

หน้าที่ของ middleware:

1. เช็กว่า MongoDB พร้อมหรือยัง
2. ดึง token จาก `Authorization: Bearer ...`
3. ถ้าไม่มีใน header จะลองดึงจาก cookie `accessToken`
4. ใช้ `jwt.verify()` ตรวจ token
5. หา user จาก `decoded.id`
6. ถ้าพบ user จะเก็บไว้ใน `req.user`
7. จากนั้นเรียก `next()`

ผลลัพธ์:

- route ที่ครอบด้วย `protectAuth` จะเข้าได้เฉพาะคนที่มี token ถูกต้อง

## 6. เพิ่ม route ที่จำเป็น

อยู่ที่ [src/routes/v2/users.routes.js](/C:/Users/Acer/OneDrive/เดสก์ท็อป/JSD_12/week_11/jsd12-full-stack-app/backend/src/routes/v2/users.routes.js:1)

route ที่เพิ่ม/ใช้งาน:

- `POST /api/v2/users/register`
- `POST /api/v2/users/login`
- `POST /api/v2/users/logout`
- `GET /api/v2/users/me`

โดย `GET /me` ใช้ `protectAuth` ก่อนเข้า controller

## 7. เพิ่มไฟล์ทดสอบ REST

เพิ่มไฟล์ [src/testHTTP/v2/test-auth.rest](/C:/Users/Acer/OneDrive/เดสก์ท็อป/JSD_12/week_11/jsd12-full-stack-app/backend/src/testHTTP/v2/test-auth.rest:1)

ใช้ทดสอบ:

- register
- login
- get me
- logout

ถ้า REST Client ไม่เก็บ cookie อัตโนมัติ ให้เอา token จาก login มาใส่ในตัวแปร `@token`

## 8. ปรับ CORS ให้รองรับ cookie

ที่ [src/server.js](/C:/Users/Acer/OneDrive/เดสก์ท็อป/JSD_12/week_11/jsd12-full-stack-app/backend/src/server.js:11)

เราเพิ่ม:

```js
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
```

เหตุผล:

- ถ้าฝั่ง frontend กับ backend คนละ origin
- browser จะไม่ส่งหรือรับ cookie ได้ถูกต้อง ถ้าไม่เปิด `credentials`

## Endpoint ที่มีตอนนี้

### Register

```http
POST /api/v2/users/register
```

### Login

```http
POST /api/v2/users/login
```

### Logout

```http
POST /api/v2/users/logout
```

### Get Current User

```http
GET /api/v2/users/me
```

## ลำดับการทำงานของ auth

```text
register -> บันทึก user ลง MongoDB
login -> ตรวจรหัสผ่าน -> สร้าง JWT -> set cookie
me -> middleware ตรวจ token -> ส่งข้อมูล user ปัจจุบัน
logout -> clear cookie
```

## สิ่งที่ตรวจสอบแล้ว

- syntax ของ `server.js` ผ่าน
- syntax ของ `users.v2.controller.js` ผ่าน
- syntax ของ `auth.middleware.js` ผ่าน
- syntax ของ `users.routes.js` ผ่าน
- server สามารถรันขึ้นได้

## ปัญหาที่ยังเหลือ

ตอนนี้ระบบยังทดสอบ `register/login` แบบสมบูรณ์ไม่ได้ เพราะ MongoDB Atlas ยังเชื่อมต่อไม่สำเร็จ

อาการที่เจอ:

- server รันได้
- แต่ route ที่ใช้ MongoDB จะตอบ `503`

สาเหตุที่เป็นไปได้:

- IP ของเครื่องยังไม่ได้ whitelist ใน MongoDB Atlas
- หรือ `MONGODB_URI` ใน `.env` ยังไม่ถูกต้อง

## สิ่งที่ต้องทำต่อ

1. เช็ก `MONGODB_URI` ใน [backend/.env](/C:/Users/Acer/OneDrive/เดสก์ท็อป/JSD_12/week_11/jsd12-full-stack-app/backend/.env:1)
2. ไป whitelist IP ใน MongoDB Atlas
3. รัน server ใหม่
4. ทดสอบตามลำดับนี้:

```text
register -> login -> me -> logout
```

## สิ่งที่ควรจำ

- โค้ดหลัง `return` จะไม่ทำงาน
- 1 request ควรตอบกลับ `res.json()` แค่ครั้งเดียว
- password ไม่ควรส่งกลับไปฝั่ง client
- middleware ช่วยแยก logic ตรวจ auth ออกจาก controller
- ถ้าใช้ cookie auth ต้องระวัง CORS และ credentials

## สรุปสั้นที่สุด

ตอนนี้ระบบ auth ฝั่งโค้ดทำครบแล้ว:

- register
- login
- logout
- auth middleware
- protected route `/me`

สิ่งที่ยังขวางไม่ให้ใช้งานจริงครบ flow คือการเชื่อมต่อ MongoDB เท่านั้น
