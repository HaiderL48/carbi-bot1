import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./carbiforce.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    createTableAndInsertData();
  }
});

function createTableAndInsertData() {
  db.serialize(() => {
    // Create products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      price REAL,
      item_code TEXT UNIQUE,
      shop_url TEXT
    )`, (err) => {
      if (err) {
        console.error('Error creating products table', err.message);
      } else {
        console.log('Products table created or already exists.');
        insertSampleData();
      }
    });
  });
}

function insertSampleData() {
  const products = [
    {
      name: 'Endmill 2-Flute Ballnose 3mm 55HRC',
      category: 'Endmill-55HRC-General-2Flute-ballnose',
      description: 'General purpose 2-flute ballnose endmill, 3mm diameter, 55HRC hardness.',
      price: 250.00,
      item_code: 'EM55G2FB3',
      shop_url: 'https://carbiforce.shop/products/example-endmill-1'
    },
    {
      name: 'Aluminium Endmill 3-Flute Flat 6mm',
      category: 'Endmill-Aluminium-Uncoated-3Flute-flat',
      description: 'Uncoated 3-flute flat endmill for aluminium, 6mm diameter.',
      price: 300.00,
      item_code: 'EMALU3FF6',
      shop_url: 'https://carbiforce.shop/products/example-endmill-alu-1'
    },
    {
      name: 'Solid Carbide Drill 4mm 55HRC Long',
      category: 'DRILL-General-Drill-55HRC-Long-Solid-Carbide-SC',
      description: 'Long series solid carbide drill, 4mm diameter, for 55HRC materials.',
      price: 180.00,
      item_code: 'DR55LSC4',
      shop_url: 'https://carbiforce.shop/products/example-drill-1'
    },
    {
      name: 'Turning Insert CNMG 120408',
      category: 'CARBIDE-INSERTS-Turning-Inserts',
      description: 'CNMG 120408 general purpose turning insert.',
      price: 120.00,
      item_code: 'TICNMG120408',
      shop_url: 'https://carbiforce.shop/products/example-insert-1'
    },
    {
      name: 'HSS Tap M10x1.5 SPPT',
      category: 'HSS-TOOL-HSS-Taps',
      description: 'HSS Spiral Point Tap M10x1.5 for through holes.',
      price: 90.00,
      item_code: 'HSSM10SPPT',
      shop_url: 'https://carbiforce.shop/products/example-tap-1'
    }
  ];

  const stmt = db.prepare(`INSERT INTO products (name, category, description, price, item_code, shop_url)
                           VALUES (?, ?, ?, ?, ?, ?)
                           ON CONFLICT(item_code) DO NOTHING`); // Prevent duplicate item_codes

  products.forEach(product => {
    stmt.run(product.name, product.category, product.description, product.price, product.item_code, product.shop_url, (err) => {
      if (err) {
        console.error('Error inserting product:', product.name, err.message);
      } else {
        // this.lastID is not available on stmt.run, but result.changes indicates success if > 0
        // For simplicity, we'll just log success if no error.
        // console.log(`Inserted product ${product.name} with ID ${this.lastID}`); // this.lastID not available here
         console.log(`Attempted to insert product: ${product.name}`);
      }
    });
  });

  stmt.finalize((err) => {
    if (err) {
      console.error('Error finalizing statement', err.message);
    } else {
      console.log('All sample data insertion attempts complete.');
    }
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database', err.message);
      } else {
        console.log('Closed the database connection.');
      }
    });
  });
}
