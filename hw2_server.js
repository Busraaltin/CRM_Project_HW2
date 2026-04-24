const http = require('http');
const sqlite3 = require('sqlite3').verbose();

// Yeni sunucumuz için 3001 portunu kullanıyoruz (eski ödevle çakışmasın diye)
const PORT = 3001; 

// Veritabanı bağlantısı ve tablo oluşturma (Hocanın istediği Local Database)
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error("❌ Veritabanı bağlantı hatası:", err.message);
  } else {
    console.log("🟢 SQLite Veritabanı başarıyla bağlandı (database.sqlite)");
    db.run(`CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) console.error("Tablo oluşturma hatası:", err.message);
      else console.log("🟢 'leads' tablosu hazır.");
    });
  }
});

// Google Sheets Web App URL'niz (1. ödevdekiyle aynı)
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbz5YsgWrl_ELPyqF6PyBwaH8qlnP2WS04xyJE0hwJq7vlCfJld-ySL2OQV1Ay-1vM0c/exec";

// Basit bir web sunucusu (HTTP endpoint) oluşturuyoruz
const server = http.createServer((req, res) => {
  
  // Endpoint Requirements (Gereksinim 1): Sadece POST kabul et, adresi /submit olsun.
  if (req.method === 'POST' && req.url === '/submit') {
    let body = '';

    // Gelen veriyi (Payload) okuma
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);

        // Payload Requirements (Gereksinim 2): Gelen veri tam olarak name, email ve message içermeli
        if (!payload.name || !payload.email || !payload.message) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ 
              success: false, 
              error: "Missing required fields. Please send exactly: name, email, and message." 
            }));
        }

        console.log("🟢 1. Adım: Veri Başarıyla Alındı!");
        console.log("Gelen Veri:", payload);

        // Veritabanına kaydetme (Gereksinim: Database'de oluşturmak)
        console.log("🟣 Yeni Adım: Local SQLite Veritabanına kaydediliyor...");
        db.run(`INSERT INTO leads (name, email, message) VALUES (?, ?, ?)`, 
          [payload.name, payload.email, payload.message], 
          function(err) {
            if (err) {
              console.error("❌ Veritabanı Kayıt Hatası:", err.message);
            } else {
              console.log(`-> ✅ SQLite Kaydı Başarılı! (Kayıt ID: ${this.lastID})`);
            }
          }
        );

        // Integration (Gereksinim 3): Antigravity tarafından sağlanan bağlayıcı kod ile veriyi Google Sheets'e gönderme
        console.log("🔵 2. Adım: Google Sheets'e yollanıyor (Antigravity Connector devrede)...");
        
        const sheetResponse = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            headers: {
              "Content-Type": "text/plain" // Google Apps Script (CORS Atlamak için)
            },
            // Storage (Gereksinim 4): Veriyi Google Sheet'in daha once bekledigi basliklara (HW1 basliklarina) uyarlayarak yolluyoruz
            body: JSON.stringify({
                contact_name: payload.name,
                contact_email: payload.email,
                inquiry_message: payload.message,
                captured_at: new Date().toISOString(),
                lead_status: "New"
            })
        });

        const sheetResult = await sheetResponse.text();
        console.log("-> ✅ Google Sheets Cevabı:", sheetResult);

        // İşlem tamamlandıktan sonra başarılı olduğunu dönüyoruz
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: "Data successfully synced to Google Sheets / CRM!",
          data: payload
        }));

      } catch (error) {
        console.error("❌ Hata:", error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
  } else {
    // Yanlış bir adrese istek gelirse
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found. Please make a POST request to /submit.');
  }
});

// Sunucuyu Başlat
server.listen(PORT, () => {
  console.log(`🚀 HW2 Sunucusu çalışıyor!`);
  console.log(`Aşağıdaki adrese POST isteği atabilirsiniz:`);
  console.log(`http://localhost:${PORT}/submit`);
});
