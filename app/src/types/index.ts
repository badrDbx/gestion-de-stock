// أنواع المستخدمين
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  phone?: string;
  createdAt: string;
}

// أنواع المواد
export type MaterialType = 'consumable' | 'returnable';
export type MaterialCategory =
  | 'Informatique'
  | 'Impression'
  | 'Bureautique'
  | 'Réseau & Câblage'
  | 'Audiovisuel'
  | 'Téléphonie'
  | 'Stockage & Sauvegarde'
  | 'Protection & Sécurité'
  | 'Énergie & Alimentation'
  | 'Mobilier'
  | 'Hygiène & Santé'
  | 'Consommables Divers';

export interface Material {
  id: string;
  name: string;
  description: string;
  type: MaterialType;
  category: MaterialCategory;
  quantity: number;
  minQuantity: number; // الحد الأدنى للتنبيه
  unit: string; // وحدة القياس (قطعة، علبة، إلخ)
  location?: string; // مكان التخزين
  image?: string; // رابط صورة المنتج
  createdAt: string;
  updatedAt: string;
}

// حالة الطلب
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'delivered' | 'returned' | 'borrowed';

export interface MaterialRequest {
  id: string;
  userId: string;
  userName: string;
  materialId: string;
  materialName: string;
  quantity: number;
  status: RequestStatus;
  type: MaterialType;
  requestDate: string;
  deliveryDate?: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  returnDate?: string;
  notes?: string;
}

// المادة المُعارة (للمواد القابلة للإرجاع)
export interface BorrowedItem {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  materialId: string;
  materialName: string;
  quantity: number;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
}

// إحصائيات
export interface DashboardStats {
  totalMaterials: number;
  lowStockMaterials: number;
  pendingRequests: number;
  activeBorrows: number;
  totalUsers: number;
}
