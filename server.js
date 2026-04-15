const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
// Melayani file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Inisialisasi Database (Jika file db.json belum ada)
if (!fs.existsSync('db.json')) {
    fs.writeFileSync('db.json', JSON.stringify({ bookings: [] }, null, 2));
}

// Helper Fungsi Baca/Tulis DB
const getDb = () => JSON.parse(fs.readFileSync('db.json'));
const saveDb = (data) => fs.writeFileSync('db.json', JSON.stringify(data, null, 2));

// --- API ROUTES ---

app.post('/api/bookings', (req, res) => {
    const db = getDb();
    const newBooking = {
        id: Date.now(),
        customerName: req.body.name,
        phone: req.body.phone,        // Data baru
        checkIn: req.body.checkIn,    // Data baru
        roomType: req.body.room,
        createdAt: new Date().toLocaleDateString(),
        status: 'Pending'
    };
    db.bookings.push(newBooking);
    saveDb(db);
    res.json({ success: true });
});

// 2. Ambil Semua Booking (Admin)
app.get('/api/admin/bookings', (req, res) => {
    const db = getDb();
    res.json(db.bookings);
});

// 3. Update Status (Admin)
app.put('/api/admin/bookings/:id', (req, res) => {
    const db = getDb();
    const index = db.bookings.findIndex(b => b.id == req.params.id);
    if (index !== -1) {
        db.bookings[index].status = req.body.status;
        saveDb(db);
        res.json({ success: true });
    }
});

// 4. Hapus Booking (Admin)
app.delete('/api/admin/bookings/:id', (req, res) => {
    const db = getDb();
    db.bookings = db.bookings.filter(b => b.id != req.params.id);
    saveDb(db);
    res.json({ success: true });
});

// MENJALANKAN SERVER
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(` Server GoSleep Berhasil Dijalankan! `);
    console.log(` Buka di: http://localhost:${PORT}/index.html `);
    console.log(`=========================================`);
});