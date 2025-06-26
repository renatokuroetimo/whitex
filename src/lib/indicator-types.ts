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
  name: string;
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
  // Metadata fields
  definition?: string;
  context?: string;
  dataType?: string;
  isRequired?: boolean;
  isConditional?: boolean;
  isRepeatable?: boolean;
  standardId?: string;
  source?: string;
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
  // Metadata fields
  definition?: string;
  context?: string;
  dataType?: string;
  isRequired?: boolean;
  isConditional?: boolean;
  isRepeatable?: boolean;
  parentMetadataId?: string;
  extendsMetadataId?: string;
  standardId?: string;
  source?: string;
}

export interface IndicatorWithDetails extends Indicator {
  categoryName: string;
  subcategoryName: string;
  unitOfMeasureName?: string;
  unitOfMeasureSymbol?: string;
  unitSymbol?: string;
  isMandatory?: boolean;
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
