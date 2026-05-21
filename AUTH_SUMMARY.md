# Authentication and Authorization Summary

สรุปงานฝั่ง `backend` สำหรับระบบ `register + login + logout + protected route + authorization`

## สิ่งที่มีในระบบตอนนี้

- `POST /api/v2/users/register` สำหรับสมัครสมาชิก
- `POST /api/v2/users/login` สำหรับเข้าสู่ระบบ
- `POST /api/v2/users/logout` สำหรับออกจากระบบ
- `GET /api/v2/users/me` สำหรับดูข้อมูลผู้ใช้ที่ login อยู่
- `GET /api/v2/users` ให้เฉพาะ `admin`
- `PUT /api/v2/users/:id` ให้เฉพาะเจ้าของบัญชีหรือ `admin`
- `DELETE /api/v2/users/:id` ให้เฉพาะเจ้าของบัญชีหรือ `admin`

## ไฟล์หลักที่เกี่ยวข้อง

- [auth.middleware.js](/C:/Users/Acer/OneDrive/เดสก์ท็อป/JSD_12/week_11/jsd12-full-stack-app/backend/src/middlewares/auth.middleware.js)
- [users.v2.controller.js](/C:/Users/Acer/OneDrive/เดสก์ท็อป/JSD_12/week_11/jsd12-full-stack-app/backend/src/modules/users/users.v2.controller.js)
- [users.routes.js](/C:/Users/Acer/OneDrive/เดสก์ท็อป/JSD_12/week_11/jsd12-full-stack-app/backend/src/routes/v2/users.routes.js)
- [server.js](/C:/Users/Acer/OneDrive/เดสก์ท็อป/JSD_12/week_11/jsd12-full-stack-app/backend/src/server.js)
- [test-auth.rest](/C:/Users/Acer/OneDrive/เดสก์ท็อป/JSD_12/week_11/jsd12-full-stack-app/backend/src/testHTTP/v2/test-auth.rest)

## Flow หลัก

1. `register`
สร้าง user ใหม่และเก็บ password แบบ hash

2. `login`
ตรวจ email/password, สร้าง JWT, set cookie `accessToken`

3. `protectAuth`
อ่าน token จาก `Authorization: Bearer ...` หรือ cookie แล้วตรวจ JWT

4. `authorizeRoles(...roles)`
ใช้กัน route ที่ต้องจำกัด role เช่น admin

5. `authorizeSelfOrAdmin("id")`
ให้แก้ไขหรือลบบัญชีได้เฉพาะเจ้าของบัญชีหรือ admin

## หมายเหตุเรื่องเรโปผู้สอน

ฉันตรวจเรโป `https://github.com/neetibut/jsd12-full-stack-backend.git` แล้ว ณ วันที่ `2026-05-21` public repo ที่เข้าถึงได้ยังไม่พบ commit ชื่อ `Complete authentication and authorization.`

ดังนั้นงานที่จัดให้รอบนี้อ้างอิงจากโครงสร้าง auth ที่มีอยู่ในโปรเจกต์ของคุณ แล้วเติมส่วน `authorization` ที่ยังขาดให้ครบและเป็นระเบียบ

## วิธีทดสอบที่แนะนำ

1. สมัคร user ปกติ
2. login แล้วคัดลอก token
3. เรียก `GET /me`
4. ทดลอง `PUT /:id` ด้วย id ของตัวเอง
5. ทดลอง `GET /users`
ควรโดน `403` ถ้าไม่ใช่ admin
6. ทดลอง `DELETE /:id`
ควรผ่านเฉพาะเจ้าของบัญชีหรือ admin
