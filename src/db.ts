import Dexie, { Table } from 'dexie';

export interface Product {
  id?: number;
  name: string;
  category: string;
  color: string;
  price: number;
  stockQuantity: number;
  imageUri?: string;
  description: string;
  isBestSeller?: boolean;
}

export interface Sale {
  id?: number;
  productId: number;
  productName: string; // Denormalized for reports
  quantitySold: number;
  totalAmount: number;
  saleDate: number; // timestamp
}

export interface InventoryLog {
  id?: number;
  productId: number;
  type: 'restock' | 'sale' | 'adjustment';
  quantityDelta: number;
  previousStock: number;
  newStock: number;
  date: number;
}

export class HastaKalaDB extends Dexie {
  products!: Table<Product>;
  sales!: Table<Sale>;
  inventoryLogs!: Table<InventoryLog>;

  constructor() {
    super('HastaKalaDB');
    this.version(1).stores({
      products: '++id, name, category, color',
      sales: '++id, productId, saleDate',
      inventoryLogs: '++id, productId, date'
    });
  }
}

export const db = new HastaKalaDB();

// Initial dummy data helper
export async function seedDatabase() {
  const count = await db.products.count();
  if (count === 0) {
    const products: Product[] = [
      { name: 'Banana Fiber Handbag', category: 'Bags', color: 'Natural', price: 1200, stockQuantity: 15, description: 'Elegant handmade banana fiber bag.', imageUri: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=200' },
      { name: 'Clay Pottery Pot', category: 'Pottery', color: 'Terracotta', price: 450, stockQuantity: 8, description: 'Hand-painted decorative terracotta pot.', imageUri: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=200' },
      { name: 'Handmade Jewelry Set', category: 'Jewelry', color: 'Blue/Gold', price: 850, stockQuantity: 10, description: 'Artisanal necklace and earring set.', imageUri: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=200' },
      { name: 'Woven Bamboo Basket', category: 'Baskets', color: 'Brown', price: 600, stockQuantity: 3, description: 'Sturdy bamboo woven basket for storage.', imageUri: 'https://images.unsplash.com/photo-1591034351336-9634e0294fc2?auto=format&fit=crop&q=80&w=200' },
      { name: 'Wooden Keychain', category: 'Accessories', color: 'Natural Wood', price: 150, stockQuantity: 25, description: 'Carved wooden keychain with traditional motifs.', imageUri: 'https://images.unsplash.com/photo-1622540331024-d2e7dd387652?auto=format&fit=crop&q=80&w=200' },
    ];
    await db.products.bulkAdd(products);
  }
}
