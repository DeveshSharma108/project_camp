# 🧪 CORS Sandbox

> This folder contains two small frontend–backend setups to demonstrate **CORS (Cross-Origin Resource Sharing)** behavior in browsers.

---

### 📂 Files

- **`test_fronted_simple` + `test_backend_simple.js`**  
  → Example where the browser **does not send a preflight request** (simple request).  

- **`test_frontend_preflight.js` + `test_backend_preflight.js`**  
  → Example where the browser **does send a preflight request** (non-simple request with custom headers).  

After starting the respective servers:  
> Open **DevTools → Network** to see the requests.

---

### 📝 Notes

#### 🔹 Simple request (no preflight)

Conditions for a **simple request** (browser sends only one request):

- Method is one of:
  - `GET`
  - `POST`
  - `HEAD`
- No **custom headers**
- `Content-Type` is one of:
  - `application/x-www-form-urlencoded`
  - `multipart/form-data`
  - `text/plain`

➡️ In this case, the frontend makes a direct request to the backend.  
➡️ Browser only checks the **response headers** for CORS.

---

#### 🔹 Preflight request

A **preflight** happens when:

- Method is something other than `GET`, `POST`, or `HEAD`
- You add **custom headers**
- `Content-Type` is not one of the three “simple” ones (e.g. `application/json`)

➡️ The browser first sends an `OPTIONS` request (preflight).  
➡️ If the backend responds with the correct **CORS headers**, then the browser sends the actual request (e.g. `POST`).  

---

### 🔑 Key headers

Backend must set the following headers to allow cross-origin requests:

- `Access-Control-Allow-Origin` → e.g. `http://localhost:3000` or `*`
- `Access-Control-Allow-Methods` → e.g. `GET, POST, OPTIONS`
- `Access-Control-Allow-Headers` → e.g. `Content-Type, X-Custom-Header`

---

### 📊 Summary

- **Host header** = where the request is going (**backend**).  
- **Origin header** = where the request is coming from (**frontend**).  

- **No preflight** → browser sends request directly.  
- **Preflight** → browser first sends `OPTIONS`, then the actual request.  

---

⚠️ This sandbox is for **learning purposes only**.  
In real-world apps, use the [`cors`](https://www.npmjs.com/package/cors) middleware instead of setting headers manually.
