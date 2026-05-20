# bcrypt คืออะไร

`bcrypt` คือไลบรารีที่ใช้ "เข้ารหัสรหัสผ่านแบบ hash" ก่อนเก็บลงฐานข้อมูล

เหตุผลที่ต้องใช้:
- เราไม่ควรเก็บรหัสผ่านจริงลงฐานข้อมูลตรง ๆ
- ถ้าฐานข้อมูลหลุด คนอื่นจะไม่เห็นรหัสผ่านจริงทันที
- เวลาผู้ใช้ login เราจะใช้ `bcrypt.compare()` เพื่อตรวจว่า password ที่กรอกมาตรงกับ hash ที่เก็บไว้ไหม

สรุปสั้น ๆ:
- สมัครสมาชิก: `hash` ก่อนค่อย `save`
- เข้าสู่ระบบ: `compare` password ที่กรอก กับ password hash ในฐานข้อมูล

---

# คำศัพท์ที่ควรรู้ก่อน

`plain password`
- รหัสผ่านปกติที่ผู้ใช้พิมพ์ เช่น `abc12345`

`hashed password`
- รหัสผ่านที่ผ่าน `bcrypt.hash()` แล้ว
- จะมีหน้าตาประมาณนี้ `$2b$12$...`

`salt rounds`
- คือระดับความซับซ้อนตอน hash
- ในโปรเจกต์นี้เราใช้ `12`
- ยิ่งมาก ยิ่งปลอดภัยขึ้น แต่ใช้เวลาประมวลผลมากขึ้น

---

# ติดตั้ง bcrypt

ถ้ายังไม่ได้ติดตั้ง ให้เปิด terminal ในโฟลเดอร์ `backend` แล้วรัน:

```bash
npm install bcrypt
```

ในโปรเจกต์นี้ติดตั้งไว้แล้ว ดูได้ใน `backend/package.json`

---

# โค้ดตัวอย่างในไฟล์ bcrypt.js

ไฟล์: [bcrypt.js](./bcrypt.js)

```js
import bcrypt from "bcrypt";

async function hashPassword(plainPassword) {
  const hashedPassword = await bcrypt.hash(plainPassword, 12);
  return hashedPassword;
}

async function verifyPassword(plainPassword, hashedPassword) {
  const isMatched = await bcrypt.compare(plainPassword, hashedPassword);
  return isMatched;
}

const plainPassword = "gayray987";
const hashedPassword = await hashPassword(plainPassword);
const isMatched = await verifyPassword(plainPassword, hashedPassword);

console.log("Plain password:", plainPassword);
console.log("Hashed password:", hashedPassword);
console.log("Password matched:", isMatched);
```

---

# อธิบายทีละส่วนแบบคนเริ่มจาก 0

## 1. import bcrypt

```js
import bcrypt from "bcrypt";
```

บรรทัดนี้คือการเรียกใช้ไลบรารี `bcrypt`

ถ้าไม่มีบรรทัดนี้ เราจะใช้ `bcrypt.hash()` และ `bcrypt.compare()` ไม่ได้

---

## 2. ฟังก์ชัน hashPassword

```js
async function hashPassword(plainPassword) {
  const hashedPassword = await bcrypt.hash(plainPassword, 12);
  return hashedPassword;
}
```

หน้าที่:
- รับรหัสผ่านจริงเข้ามา
- ส่งรหัสผ่านนั้นไป hash
- คืนค่าที่ hash แล้วกลับออกมา

อธิบายทีละบรรทัด:

```js
async function hashPassword(plainPassword)
```
- สร้างฟังก์ชันชื่อ `hashPassword`
- รับค่าเข้ามา 1 ตัว คือ `plainPassword`

```js
const hashedPassword = await bcrypt.hash(plainPassword, 12);
```
- ใช้ `bcrypt.hash()` เพื่อแปลงรหัสผ่านจริงให้เป็น hash
- `await` แปลว่า รอให้ทำงานเสร็จก่อน
- `12` คือ salt rounds

```js
return hashedPassword;
```
- ส่งค่ารหัสผ่านที่ hash แล้วกลับออกไป

---

## 3. ฟังก์ชัน verifyPassword

```js
async function verifyPassword(plainPassword, hashedPassword) {
  const isMatched = await bcrypt.compare(plainPassword, hashedPassword);
  return isMatched;
}
```

หน้าที่:
- เอารหัสผ่านที่ผู้ใช้พิมพ์
- ไปเทียบกับรหัสผ่านแบบ hash
- ถ้าตรงกันจะได้ `true`
- ถ้าไม่ตรงจะได้ `false`

---

## 4. ทดลองใช้งานจริง

```js
const plainPassword = "gayray555";
const hashedPassword = await hashPassword(plainPassword);
const isMatched = await verifyPassword(plainPassword, hashedPassword);
```

ความหมาย:
- สร้างรหัสผ่านจริงไว้ 1 ตัว
- ส่งไป hash
- แล้วลอง compare กลับ

ผลลัพธ์ที่ควรได้:

```js
Password matched: true
```

แปลว่า password จริง กับ hashed password ตัวนั้น เป็นคู่กัน

---

# วิธีรันไฟล์นี้

เปิด terminal ในโฟลเดอร์โปรเจกต์ แล้วรัน:

```bash
node backend/bcrypt/bcrypt.js
```

ผลลัพธ์ตัวอย่าง:

```bash
Plain password: gayray555
Hashed password: $2b$12$...
Password matched: true
```

หมายเหตุ:
- ค่า hash จะไม่เหมือนเดิมทุกครั้ง
- ถึงแม้ password เดิม แต่ bcrypt จะสร้าง hash ใหม่ได้
- แต่ `bcrypt.compare()` ยังตรวจได้ว่าตรงกัน

---

# bcrypt ใช้กับ Register Route ยังไง

จากโจทย์อาจารย์ flow คือ:

1. รับ `email` และ `password` จาก `req.body`
2. เช็กก่อนว่า email ซ้ำไหม
3. ถ้าซ้ำ ให้ตอบกลับว่าใช้งานแล้ว
4. ถ้าไม่ซ้ำ ให้เอา password ไป hash
5. ค่อยบันทึก user ลงฐานข้อมูล
6. ตอบกลับว่า สมัครสำเร็จ

ตัวอย่างแนวคิด:

```js
const { email, password } = req.body;

const userExists = await User.findOne({ email });

if (userExists) {
  return res.status(409).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" });
}

const hashedPassword = await bcrypt.hash(password, 12);

await User.create({
  email,
  password: hashedPassword,
});
```

ตรงนี้คือหัวใจของ register:
- ห้าม save password ตรง ๆ
- ต้อง save เป็น `hashedPassword`

---

# สร้าง Register Route ยังไง

จากภาพที่อาจารย์ให้:

```txt
ROUTE: POST /
register email = Request.email
plainPassword = Request.password
userExists = Database.findUser(email)

IF (userExists) {
  RETURN "อีเมลนี้ถูกใช้งานแล้ว"
}

hashedPassword = await bcrypt.hash(plainPassword, 12)

Database.save({
  email: email,
  password: hashedPassword
})

RETURN "สมัครสมาชิกสำเร็จ!"
```

ความหมายของภาพนี้ในภาษา Node.js / Express คือ:

1. สร้าง route แบบ `POST`
2. รับข้อมูลจาก `req.body`
3. เอา `email` ไปเช็กในฐานข้อมูลก่อน
4. ถ้ามีคนใช้แล้ว ให้หยุดเลย
5. ถ้ายังไม่มี ให้เอา password ไป hash
6. บันทึกข้อมูลใหม่ลงฐานข้อมูล
7. ส่ง response กลับ

---

## ตัวอย่าง Register Route แบบพื้นฐาน

```js
router.post("/", async (req, res) => {
  const { email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(409).json({
      message: "อีเมลนี้ถูกใช้งานแล้ว",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await User.create({
    email,
    password: hashedPassword,
  });

  return res.status(201).json({
    message: "สมัครสมาชิกสำเร็จ!",
  });
});
```

---

## อธิบายทีละบรรทัด

```js
router.post("/", async (req, res) => {
```

- สร้าง route แบบ `POST /`
- ใช้สำหรับ "สมัครสมาชิก"
- `async` จำเป็น เพราะข้างในมี `await`

```js
const { email, password } = req.body;
```

- ดึงข้อมูลจาก body ที่ frontend ส่งมา
- สมมติ frontend ส่งแบบนี้:

```json
{
  "email": "test@mail.com",
  "password": "12345678"
}
```

---

```js
const userExists = await User.findOne({ email });
```

- ค้นหาในฐานข้อมูลว่า email นี้มีอยู่แล้วไหม
- ถ้าเจอ user จะได้ข้อมูลกลับมา
- ถ้าไม่เจอ จะได้ `null`

---

```js
if (userExists) {
  return res.status(409).json({
    message: "อีเมลนี้ถูกใช้งานแล้ว",
  });
}
```

- ถ้ามี email นี้อยู่แล้ว
- ให้หยุดการทำงานทันที
- ส่งกลับไปบอกว่า email ซ้ำ

`409` หมายถึงข้อมูลชนกัน เช่น email นี้ถูกใช้ไปแล้ว

---

```js
const hashedPassword = await bcrypt.hash(password, 12);
```

- เอา password จริงไป hash
- ตรงนี้คือหัวใจของงานนี้
- สิ่งที่เก็บลงฐานข้อมูลต้องเป็น `hashedPassword` ไม่ใช่ `password`

---

```js
await User.create({
  email,
  password: hashedPassword,
});
```

- สร้าง user ใหม่ในฐานข้อมูล
- เก็บ email ตามเดิม
- เก็บ password แบบ hash แล้ว

---

```js
return res.status(201).json({
  message: "สมัครสมาชิกสำเร็จ!",
});
```

- ถ้าทุกอย่างผ่านหมด
- ส่งกลับว่าบันทึกสำเร็จ

`201` หมายถึงสร้างข้อมูลใหม่สำเร็จ

---

## เวอร์ชันที่โปรเจกต์นี้ใช้อยู่จริง

ในโปรเจกต์นี้เราไม่ได้เก็บแค่ `email` กับ `password`
เรามี `username` และ `role` ด้วย

แนวคิดจริงที่เราเขียนไว้คือ:

```js
const { username, email, password, role } = req.body || {};

if (!username || !email || !password) {
  return res.status(400).json({
    success: false,
    error: "username, email, and password are required",
  });
}

const normalizedEmail = email.trim().toLowerCase();
const userExists = await User.findOne({ email: normalizedEmail });

if (userExists) {
  return res.status(409).json({
    success: false,
    error: "This email is already in use",
  });
}

const hashedPassword = await bcrypt.hash(password, 12);

const doc = await User.create({
  username,
  email: normalizedEmail,
  password: hashedPassword,
  role,
});
```

สิ่งที่เพิ่มจากเวอร์ชันพื้นฐาน:
- เช็กว่ากรอกข้อมูลมาครบไหม
- แปลง email ให้เป็นตัวพิมพ์เล็กก่อนเก็บ
- รองรับ `username`
- รองรับ `role`

---

## คำว่า "สร้าง route" ต้องทำอะไรบ้าง

เวลาอาจารย์สั่งให้ "สร้าง register route" จริง ๆ แล้วมี 3 ส่วน:

### 1. import สิ่งที่ต้องใช้

```js
import bcrypt from "bcrypt";
```

ถ้าใช้ Mongoose ก็ต้องมี model ด้วย เช่น:

```js
import { User } from "./user.model.js";
```

---

### 2. เขียน route หรือ controller

ตรงนี้คือ logic หลัก:
- รับข้อมูล
- เช็ก email ซ้ำ
- hash password
- save ลง DB

---

### 3. ผูก route เข้ากับ path

เช่น:

```js
router.post("/", createUser);
```

หรือถ้าเขียนตรงใน route เลย ก็จะเป็น:

```js
router.post("/", async (req, res) => {
  // logic register
});
```

---

## วิธีจำง่ายมาก

ถ้าเจอโจทย์สร้าง Register Route ให้คิดตามนี้:

1. รับ `email` กับ `password`
2. หา user จาก `email`
3. ถ้าเจอแล้ว -> ตอบว่า email ซ้ำ
4. ถ้ายังไม่เจอ -> `hash(password, 12)`
5. เอา `hashedPassword` ไป save
6. ตอบกลับว่า success

---

# แล้วตอน Login ทำยังไง

ตอน login เราไม่ hash ใหม่แล้วเอาไปเทียบตรง ๆ เอง

เราต้องใช้:

```js
const isMatched = await bcrypt.compare(passwordFromUser, passwordInDatabase);
```

ถ้า `isMatched === true`
- แปลว่า password ถูก

ถ้า `isMatched === false`
- แปลว่า password ผิด

---

# สร้าง Login Route ยังไง

จากภาพที่อาจารย์ให้ flow คือ:

1. รับ `email` กับ `password` จาก `req.body`
2. หา user ในฐานข้อมูลจาก `email`
3. ถ้าไม่เจอ user ให้ตอบว่า email หรือ password ไม่ถูกต้อง
4. ถ้าเจอ user ให้เอา password ที่กรอกมาไป `compare` กับ password hash ในฐานข้อมูล
5. ถ้า `compare` ได้ `false` ให้ตอบว่า email หรือ password ไม่ถูกต้อง
6. ถ้า `compare` ได้ `true` ให้ตอบว่าเข้าสู่ระบบสำเร็จ

---

## ตัวอย่าง Login Route แบบพื้นฐาน

```js
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const userInDB = await User.findOne({ email }).select("+password");

  if (!userInDB) {
    return res.status(401).json({
      message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    });
  }

  const isMatch = await bcrypt.compare(password, userInDB.password);

  if (!isMatch) {
    return res.status(401).json({
      message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    });
  }

  return res.status(200).json({
    message: "เข้าสู่ระบบสำเร็จ!",
  });
});
```

---

## อธิบายทีละบรรทัด

```js
const { email, password } = req.body;
```

- รับ email และ password ที่ผู้ใช้กรอกเข้ามา

```js
const userInDB = await User.findOne({ email }).select("+password");
```

- หา user จาก email
- เราต้องใช้ `.select("+password")` เพราะใน model ของเรา `password` ถูกตั้งเป็น `select: false`
- ถ้าไม่ใส่ `.select("+password")` เราจะเอา password hash มา compare ไม่ได้

```js
if (!userInDB) {
  return res.status(401).json({
    message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  });
}
```

- ถ้าไม่เจอ email นี้ในฐานข้อมูล ให้ตอบกลับว่าข้อมูลไม่ถูกต้อง

```js
const isMatch = await bcrypt.compare(password, userInDB.password);
```

- เอา password ที่ผู้ใช้กรอกมา
- ไปเทียบกับ password hash ที่เก็บไว้ในฐานข้อมูล

```js
if (!isMatch) {
  return res.status(401).json({
    message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  });
}
```

- ถ้า compare ไม่ผ่าน แปลว่ารหัสผ่านผิด

```js
return res.status(200).json({
  message: "เข้าสู่ระบบสำเร็จ!",
});
```

- ถ้าผ่านทุกเงื่อนไข แปลว่า login สำเร็จ

---

## เวอร์ชันจริงในโปรเจกต์นี้

ในโปรเจกต์นี้เราเขียน route login ฝั่ง MongoDB ไว้ที่:

- `POST /api/v2/users/login`

แนวคิดหลัก:

```js
const normalizedEmail = email.trim().toLowerCase();
const userInDB = await User.findOne({ email: normalizedEmail }).select(
  "+password",
);

if (!userInDB) {
  return res.status(401).json({
    success: false,
    error: "Invalid email or password",
  });
}

const isMatch = await bcrypt.compare(password, userInDB.password);

if (!isMatch) {
  return res.status(401).json({
    success: false,
    error: "Invalid email or password",
  });
}
```

สิ่งที่เพิ่มจากเวอร์ชันพื้นฐาน:
- แปลง email เป็นตัวเล็กก่อนค้นหา
- ซ่อนรายละเอียดว่า "ผิดที่ email หรือ password" เพื่อความปลอดภัย
- ถ้า login สำเร็จ จะส่งข้อมูล user กลับโดยไม่ส่ง password

---

## ทำไม login ไม่ใช้ `bcrypt.hash()` อีกครั้ง

หลายคนเริ่มต้นจะงงตรงนี้มาก

คำตอบคือ:
- ตอน register เราใช้ `hash` เพื่อสร้างค่าเก็บลง DB
- ตอน login เราใช้ `compare` เพื่อตรวจว่า password ที่ผู้ใช้กรอก ตรงกับ hash ใน DB ไหม

เราไม่ควรทำแบบนี้:

```js
const newHash = await bcrypt.hash(password, 12);

if (newHash === userInDB.password) {
}
```

เหตุผล:
- ถึง password เหมือนเดิม แต่ bcrypt สร้าง hash ใหม่ได้ทุกครั้ง
- ดังนั้น hash ใหม่จะไม่จำเป็นต้องเหมือน hash เก่า
- วิธีที่ถูกคือ `bcrypt.compare()`

---

## วิธีทดสอบ Login Route

หลังจาก register user แล้ว ให้ยิง request นี้:

```http
POST /api/v2/users/login
Content-Type: application/json

{
  "email": "qinshihuang@example.com",
  "password": "password123"
}
```

ถ้า login สำเร็จ:

```json
{
  "success": true,
  "data": {
    "username": "Qin Shi Huang",
    "email": "qinshihuang@example.com",
    "role": "admin"
  },
  "message": "Login successful"
}
```

ถ้า email หรือ password ผิด:

```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

---

## สรุป Register กับ Login ต่างกันยังไง

`Register`
- รับข้อมูลใหม่
- เช็ก email ซ้ำ
- `hash password`
- save ลงฐานข้อมูล

`Login`
- รับ email กับ password
- หา user จาก email
- `compare password`
- ถ้าตรงให้เข้าใช้งานได้

---

# ข้อผิดพลาดที่มือใหม่เจอบ่อย

## 1. ลืม `await`

ผิด:

```js
const hashedPassword = bcrypt.hash(password, 12);
```

ปัญหา:
- จะได้ Promise กลับมา ไม่ใช่ค่าที่ hash แล้ว

ถูก:

```js
const hashedPassword = await bcrypt.hash(password, 12);
```

---

## 2. เก็บ password จริงลง DB

ผิด:

```js
await User.create({
  email,
  password,
});
```

ถูก:

```js
const hashedPassword = await bcrypt.hash(password, 12);

await User.create({
  email,
  password: hashedPassword,
});
```

---

## 3. ใช้ `===` เทียบ password กับ hash

ผิด:

```js
if (password === user.password) {
}
```

เหตุผล:
- `user.password` ที่เก็บใน DB เป็น hash แล้ว
- มันจะไม่เท่ากับ password ปกติ

ถูก:

```js
const isMatched = await bcrypt.compare(password, user.password);
```

---

# สรุปแบบสั้นมาก

จำให้ได้ 2 คำ:

`hash`
- ใช้ตอนสมัครสมาชิก หรือเปลี่ยนรหัสผ่าน

`compare`
- ใช้ตอน login

สูตรจำ:

1. Register = รับ password -> `hash` -> save ลง DB
2. Login = รับ password -> `compare` กับ hash ใน DB

---

# สรุปสำหรับคุณแบบคนเริ่มใหม่

ถ้าคุณยังงง ให้จำแค่นี้ก่อน:

- รหัสผ่านจริง ห้ามเก็บตรง ๆ
- ตอนสมัครสมาชิก ใช้ `bcrypt.hash()`
- ตอนเข้าสู่ระบบ ใช้ `bcrypt.compare()`
- `await` สำคัญมาก เพราะ bcrypt ทำงานแบบ async
- `12` คือค่าความเข้มของการ hash

ถ้าพร้อมก้าวต่อไป เรื่องถัดไปที่ควรเรียนคือ:
- วิธีเขียน `login route`
- วิธีสร้าง JWT หลัง login สำเร็จ
- วิธีซ่อน password ไม่ให้ส่งกลับไปหน้า frontend
