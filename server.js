const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
const dbPath = path.join(__dirname, 'db.json');

// Fungsi baca tulis DB yang aman
const getDb = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const saveDb = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

// --- API AUTH ---
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const db = getDb();
    if (db.users.find(u => u.username === username)) return res.status(400).json({ success: false, message: "User sudah ada" });
    db.users.push({ username, password, role: 'user' });
    saveDb(db);
    res.json({ success: true });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const db = getDb();
    const user = db.users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ success: true, role: user.role, username: user.username });
    } else {
        res.status(401).json({ success: false });
    }
});

// --- API ROOMS ---
app.get('/api/rooms', (req, res) => res.json(getDb().rooms));

app.post('/api/rooms', (req, res) => {
    const db = getDb();
    db.rooms.push({ id: Date.now().toString(), ...req.body, price: parseInt(req.body.price), stock: parseInt(req.body.stock) });
    saveDb(db);
    res.json({ success: true });
});

// --- API BOOKINGS ---
app.get('/api/admin/bookings', (req, res) => res.json(getDb().bookings));

app.post('/api/bookings', (req, res) => {
    const db = getDb();
    db.bookings.push({ id: Date.now(), ...req.body, status: 'Pending' });
    saveDb(db);
    res.json({ success: true });
});

app.patch('/api/admin/bookings/:id/accept', (req, res) => {
    const db = getDb();
    const booking = db.bookings.find(b => b.id == req.params.id);
    if (booking && booking.status === 'Pending') {
        const room = db.rooms.find(r => r.name === booking.roomType);
        if (room && room.stock > 0) {
            room.stock -= 1; // Stok berkurang
            booking.status = 'Accepted';
            saveDb(db);
            res.json({ success: true });
        } else { res.status(400).json({ message: "Stok habis" }); }
    }
});

app.delete('/api/admin/bookings/:id', (req, res) => {
    const db = getDb();
    db.bookings = db.bookings.filter(b => b.id != req.params.id);
    saveDb(db);
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));