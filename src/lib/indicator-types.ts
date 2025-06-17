export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  createdAt: string;
}

export interface UnitOfMeasure {
  id: string;
  name: string;
  symbol: string;
}

export interface Indicator {
  id: string;
  categoryId: string;
  subcategoryId: string;
  parameter: string;
  unitOfMeasureId: string;
  requiresTime: boolean;
  requiresDate: boolean;
  visible?: boolean;
  visibleToMedics?: boolean;
  doctorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IndicatorFormData {
  categoryId: string;
  subcategoryId: string;
  parameter: string;
  unitOfMeasureId: string;
  requiresTime: boolean;
  requiresDate: boolean;
  visible?: boolean;
  visibleToMedics?: boolean;
}

export interface IndicatorWithDetails extends Indicator {
  categoryName: string;
  subcategoryName: string;
  unitOfMeasureName: string;
  unitOfMeasureSymbol: string;
}

export interface StandardIndicator {
  id: string;
  categoryName: string;
  subcategoryName: string;
  parameter: string;
  unitSymbol: string;
  requiresDate: boolean;
  requiresTime: boolean;
  visible: boolean;
}
