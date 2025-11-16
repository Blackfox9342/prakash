const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const ORDERS_FILE = path.join(__dirname, 'orders.json');

async function readOrders(){
  try{
    const txt = await fs.readFile(ORDERS_FILE, 'utf8');
    return JSON.parse(txt || '[]');
  }catch(e){
    return [];
  }
}

async function writeOrders(arr){
  await fs.writeFile(ORDERS_FILE, JSON.stringify(arr, null, 2), 'utf8');
}

// Mock data (same as frontend bundle)
const restaurants = [
  { id:'r1', name:'Pind Tadka', price:'₹200/person', rating:4.1,
    img:'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop' },
  { id:'r2', name:'Garbar Burgers', price:'₹200/person', rating:4.6,
    img:'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop' },
  { id:'r3', name:'Burger Jack', price:'₹200/person', rating:3.7,
    img:'https://images.unsplash.com/photo-1550317138-10000687a72b?q=80&w=600&auto=format&fit=crop' },
  { id:'r4', name:'Beco Tali', price:'₹200/person', rating:4.0,
    img:'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=600&auto=format&fit=crop' },
  { id:'r5', name:'Heera Mahal', price:'₹200/person', rating:3.8,
    img:'https://images.unsplash.com/photo-1542444459-db63c9f2e6de?q=80&w=600&auto=format&fit=crop' },
];

const baseMenu = [
  { id:'m1', name:'Kabhi Burger Kabhi Gaiet', price:150 },
  { id:'m2', name:'Burger from Nothing', price:140 },
  { id:'m3', name:'No Patty Burger', price:130 },
  { id:'m4', name:'No Bun Burger', price:120 },
  { id:'m5', name:'Is sai Burger', price:110 },
  { id:'m6', name:'Sach Much Burger', price:150 },
  { id:'m7', name:'Jhootha Burger', price:150 },
  { id:'m8', name:'Salty Honey Burger', price:160 },
];

app.get('/api/restaurants', (req, res) => {
  res.json(restaurants);
});

app.get('/api/menu', (req, res) => {
  res.json(baseMenu);
});

app.get('/api/orders', async (req, res) => {
  try{
    const orders = await readOrders();
    const phone = req.query.phone;
    if(phone){
      // filter orders for matching customer phone
      const filtered = orders.filter(o => {
        const c = o.customer || {};
        // support older shape: o.phone or o.customerPhone
        return (c.phone && String(c.phone) === String(phone)) || (o.phone && String(o.phone) === String(phone)) || (o.customerPhone && String(o.customerPhone) === String(phone));
      });
      return res.json(filtered);
    }
    res.json(orders);
  }catch(err){
    res.status(500).json({ error: 'Unable to read orders' });
  }
});

// Simple admin auth (demo only)
const ADMIN_USER = { username: 'admin', password: 'admin123' };
const ADMIN_TOKEN = 'ADMINTOKEN123';

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if(username === ADMIN_USER.username && password === ADMIN_USER.password){
    return res.json({ ok:true, token: ADMIN_TOKEN });
  }
  res.status(401).json({ ok:false, error: 'Invalid credentials' });
});

app.get('/api/admin/orders', async (req, res) => {
  const token = req.get('x-admin-token') || req.query.token;
  if(token !== ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorized' });
  try{
    const orders = await readOrders();
    res.json(orders);
  }catch(err){
    res.status(500).json({ error: 'Unable to read orders' });
  }
});

app.post('/api/orders', async (req, res) => {
  const order = req.body;
  if(!order || !order.items || !Array.isArray(order.items)){
    return res.status(400).json({ error: 'Invalid order payload' });
  }
  const orders = await readOrders();
  const id = 'o_' + Date.now();
  const row = Object.assign({ id, receivedAt: new Date().toISOString() }, order);
  orders.push(row);
  await writeOrders(orders);
  res.json({ ok:true, id });
});

// Fallback for SPA: return index.html for any unknown path
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, ()=>{
  console.log(`Server started on http://localhost:${PORT}`);
});
